const chartCanvas = document.querySelector('#cost-chart');
const fallback = document.querySelector('#chart-fallback');
const volumeList = document.querySelector('#volume-list');
const dataset = window.ROOMWISE_DATA;

if (dataset && volumeList) {
  const maxOrders = Math.max(...dataset.categories.map((category) => category.orders));
  dataset.categories.forEach((category) => {
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    const label = document.createElement('div');
    const name = document.createElement('span');
    name.textContent = category.name;
    const count = document.createElement('strong');
    count.textContent = `${category.orders} orders`;
    label.append(name, count);
    const track = document.createElement('div');
    track.className = 'breakdown-track';
    const fill = document.createElement('span');
    fill.style.width = `${(category.orders / maxOrders) * 100}%`;
    track.append(fill);
    row.append(label, track);
    volumeList.append(row);
  });
}

if (chartCanvas && window.Chart && dataset) {
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: dataset.categories.map((category) => category.name),
      datasets: [
        { label: 'Product', data: dataset.categories.map((category) => category.averageProduct), backgroundColor: '#6f7865', borderRadius: 2, maxBarThickness: 24 },
        { label: 'Shipping', data: dataset.categories.map((category) => category.averageShipping), backgroundColor: '#d3a765', borderRadius: 2, maxBarThickness: 24 },
        { label: 'Assembly', data: dataset.categories.map((category) => category.averageAssembly), backgroundColor: '#b8654b', borderRadius: 2, maxBarThickness: 24 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'rect', boxWidth: 9, boxHeight: 9, padding: 20, color: '#565b52', font: { family: 'DM Sans', size: 10 } } },
        tooltip: { callbacks: { label: (context) => ` ${context.dataset.label}: ${currency.format(context.raw)}` } },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#716c63', font: { family: 'DM Sans', size: 10 } } },
        y: { beginAtZero: true, grid: { color: 'rgba(39, 43, 38, 0.08)' }, border: { display: false }, ticks: { color: '#716c63', callback: (value) => currency.format(value), font: { family: 'DM Sans', size: 9 } } },
      },
    },
  });
} else if (fallback) {
  fallback.hidden = false;
}
