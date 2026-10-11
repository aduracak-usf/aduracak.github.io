const dataset = window.ROOMWISE_DATA;
const d3Available = Boolean(window.d3);
const costSvg = d3Available ? d3.select('#cost-chart') : null;
const volumeSvg = d3Available ? d3.select('#volume-chart') : null;
const statusSvg = d3Available ? d3.select('#status-chart') : null;
const metricButtons = d3Available ? d3.selectAll('[data-metric]') : null;
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const metricLabels = {
  averageProduct: 'Average product price',
  averageShipping: 'Average shipping cost',
  averageAssembly: 'Average assembly cost',
};
const statusColors = {
  Delivered: '#6f7865',
  'Failed Delivery': '#b8654b',
  Cancelled: '#a9a397',
  Pending: '#d3a765',
  'In Transit': '#667e7a',
  Rescheduled: '#c88c73',
};
let activeMetric = 'averageProduct';

function drawHorizontalBars(svg, values, options) {
  const node = svg.node();
  if (!node || !values.length) return;

  const width = Math.max(300, node.parentElement.clientWidth);
  const margin = { top: 8, right: 28, bottom: 28, left: 112 };
  const rowHeight = options.rowHeight || 42;
  const height = margin.top + margin.bottom + values.length * rowHeight;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = values.length * rowHeight;
  const maximum = options.max || d3.max(values, (item) => item.value) || 1;
  const x = d3.scaleLinear().domain([0, maximum * 1.08]).nice(4).range([0, plotWidth]);
  const y = d3.scaleBand().domain(values.map((item) => item.name)).range([0, plotHeight]).padding(0.34);
  const ticks = x.ticks(4);

  svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMinYMin meet');
  svg.selectAll('*').remove();
  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  chart.selectAll('.grid-line')
    .data(ticks)
    .join('line')
    .attr('class', 'd3-grid-line')
    .attr('x1', (value) => x(value))
    .attr('x2', (value) => x(value))
    .attr('y1', 0)
    .attr('y2', plotHeight);

  chart.selectAll('.category-label')
    .data(values)
    .join('text')
    .attr('class', 'd3-category-label')
    .attr('x', -12)
    .attr('y', (item) => y(item.name) + y.bandwidth() / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .text((item) => item.name);

  const bars = chart.selectAll('.d3-bar-row')
    .data(values)
    .join('g')
    .attr('class', 'd3-bar-row')
    .attr('transform', (item) => `translate(0,${y(item.name)})`);

  bars.append('rect')
    .attr('class', 'd3-bar')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', (item) => x(item.value))
    .attr('height', y.bandwidth())
    .attr('fill', options.color)
    .append('title')
    .text((item) => `${item.name}: ${options.format(item.value)}`);

  bars.append('text')
    .attr('class', 'd3-bar-value')
    .attr('x', (item) => x(item.value) + 7)
    .attr('y', y.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .text((item) => options.format(item.value));

  chart.append('g')
    .attr('transform', `translate(0,${plotHeight})`)
    .call(d3.axisBottom(x).ticks(4).tickFormat(options.axisFormat).tickSize(0))
    .call((axis) => axis.select('.domain').remove())
    .call((axis) => axis.selectAll('text').attr('class', 'd3-axis-label').attr('dy', '1.6em'));
}

function renderCostChart() {
  const values = dataset.categories
    .map((category) => ({ name: category.name, value: category[activeMetric] }))
    .sort((a, b) => d3.descending(a.value, b.value));

  d3.select('#cost-chart-title').text(metricLabels[activeMetric]);
  costSvg.attr('aria-label', `${metricLabels[activeMetric]} by room category, in US dollars`);
  drawHorizontalBars(costSvg, values, {
    color: activeMetric === 'averageProduct' ? '#6f7865' : activeMetric === 'averageShipping' ? '#d3a765' : '#b8654b',
    format: (value) => currency.format(value),
    axisFormat: (value) => currency.format(value),
  });
}

function renderVolumeChart() {
  const values = [...dataset.categories]
    .sort((a, b) => d3.descending(a.orders, b.orders))
    .map((category) => ({ name: category.name, value: category.orders }));

  drawHorizontalBars(volumeSvg, values, {
    color: '#667e7a',
    format: (value) => d3.format(',')(value),
    axisFormat: d3.format('d'),
    rowHeight: 32,
  });
}

function renderStatusChart() {
  const width = 220;
  const height = 220;
  const radius = 100;
  const pie = d3.pie().sort(null).value((status) => status.orders);
  const arc = d3.arc().innerRadius(62).outerRadius(radius);
  const chart = statusSvg.attr('viewBox', `0 0 ${width} ${height}`).append('g').attr('transform', `translate(${width / 2},${height / 2})`);

  chart.selectAll('path')
    .data(pie(dataset.deliveryStatuses))
    .join('path')
    .attr('d', arc)
    .attr('fill', (slice) => statusColors[slice.data.name])
    .attr('stroke', '#fbf9f4')
    .attr('stroke-width', 3)
    .append('title')
    .text((slice) => `${slice.data.name}: ${d3.format(',')(slice.data.orders)} orders`);

  const legend = d3.select('#status-legend');
  legend.selectAll('li')
    .data(dataset.deliveryStatuses)
    .join('li')
    .html('')
    .each(function(status) {
      const item = d3.select(this);
      item.append('span').attr('class', 'status-swatch').style('background-color', statusColors[status.name]);
      item.append('span').attr('class', 'status-name').text(status.name);
      item.append('strong').text(d3.format(',')(status.orders));
    });
}

if (dataset && d3Available) {
  metricButtons.on('click', function() {
    activeMetric = this.dataset.metric;
    metricButtons.attr('aria-pressed', function() {
      return String(this.dataset.metric === activeMetric);
    });
    renderCostChart();
  });

  renderCostChart();
  renderVolumeChart();
  renderStatusChart();

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      renderCostChart();
      renderVolumeChart();
    });
  });
} else {
  document.querySelector('#chart-fallback').hidden = false;
}
