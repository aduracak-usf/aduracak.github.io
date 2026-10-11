const STORAGE_KEY = 'roomwise-design-plans-v1';
const starterPlans = window.ROOMWISE_DATA.demoPlans;
const furnitureItems = window.ROOMWISE_DATA.furnitureItems;
const form = document.querySelector('#plan-form');
const body = document.querySelector('#plans-body');
const search = document.querySelector('#plan-search');
const count = document.querySelector('#plan-count');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#status-message');
const title = document.querySelector('#form-title');
const cancelEdit = document.querySelector('#cancel-edit');
const roomSelect = document.querySelector('#room-type');
const itemSelect = document.querySelector('#furniture-item');
const suggestion = document.querySelector('#item-suggestion');
const suggestionButtons = document.querySelector('#suggested-items');
const sampleSize = document.querySelector('#estimate-sample');
const estimateLines = document.querySelector('#estimate-lines');
const estimateTotal = document.querySelector('#estimate-total');
const budgetInput = document.querySelector('#plan-budget');
let estimateItems = [];

function readPlans() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? [...starterPlans] : JSON.parse(saved);
  } catch {
    return [...starterPlans];
  }
}

let plans = readPlans();

function persistPlans() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    message.textContent = 'Browser storage is unavailable; changes will not persist after refresh.';
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function createCell(text, className = '') {
  const cell = document.createElement('td');
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function renderPlans() {
  const query = search.value.trim().toLowerCase();
  const visible = plans.filter((plan) => `${plan.name} ${plan.room} ${plan.style} ${plan.status} ${(plan.items || []).map((item) => item.item).join(' ')}`.toLowerCase().includes(query));
  body.replaceChildren();
  count.textContent = String(plans.length);
  emptyState.hidden = visible.length > 0;

  visible.forEach((plan) => {
    const row = document.createElement('tr');
    const nameCell = createCell('');
    const name = document.createElement('strong');
    name.textContent = plan.name;
    const room = document.createElement('span');
    room.className = 'table-subline';
    const itemCount = (plan.items || []).length;
    room.textContent = itemCount ? `${plan.room} · ${itemCount} estimated ${itemCount === 1 ? 'item' : 'items'}` : plan.room;
    nameCell.append(name, room);
    row.append(nameCell, createCell(plan.style), createCell(`${Number(plan.area).toLocaleString('en-US')} sq ft`));
    row.append(createCell(formatMoney(plan.budget), 'money-cell'));

    const statusCell = createCell('');
    const status = document.createElement('span');
    status.className = `status-pill status-${plan.status.toLowerCase().replaceAll(' ', '-')}`;
    status.textContent = plan.status;
    statusCell.append(status);
    row.append(statusCell);

    const actions = createCell('', 'row-actions');
    [['edit', 'Edit'], ['delete', 'Delete']].forEach(([action, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `icon-action${action === 'delete' ? ' delete-action' : ''}`;
      button.dataset.action = action;
      button.dataset.id = plan.id;
      button.setAttribute('aria-label', `${label} ${plan.name}`);
      button.textContent = label;
      actions.append(button);
    });
    row.append(actions);
    body.append(row);
  });
}

function getRoomItems() {
  const selectedRoom = roomSelect.value.toLowerCase();
  return furnitureItems.filter((item) => item.room.toLowerCase() === selectedRoom);
}

function getSelectedItem() {
  return furnitureItems.find((item) => item.item === itemSelect.value && item.room.toLowerCase() === roomSelect.value.toLowerCase());
}

function renderItemSuggestion() {
  const item = getSelectedItem();
  document.querySelector('#add-estimate-item').disabled = !item;
  if (!item) {
    suggestion.textContent = 'Choose a furniture type to see comparable order costs.';
    return;
  }
  suggestion.textContent = `${item.orders} similar orders · average item ${formatMoney(item.averagePrice)} · shipping ${formatMoney(item.averageShipping)} · assembly was requested in ${item.assemblyRate}% of these orders.`;
}

function renderFurnitureOptions(selectedItem = '') {
  const items = getRoomItems();
  itemSelect.replaceChildren();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = items.length ? 'Choose a furniture type' : 'Choose a room first';
  itemSelect.append(placeholder);
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.item;
    option.textContent = item.item;
    itemSelect.append(option);
  });
  itemSelect.disabled = items.length === 0;
  sampleSize.textContent = items.length ? `${items.reduce((total, item) => total + item.orders, 0)} room orders` : 'Choose a room';
  if (items.some((item) => item.item === selectedItem)) itemSelect.value = selectedItem;
  renderItemSuggestion();

  suggestionButtons.replaceChildren();
  [...items].sort((first, second) => second.orders - first.orders).slice(0, 3).forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'suggestion-chip';
    button.textContent = `${item.item} · ${formatMoney(item.averagePrice)}`;
    button.setAttribute('aria-label', `Choose ${item.item}, average item price ${formatMoney(item.averagePrice)}`);
    button.addEventListener('click', () => {
      itemSelect.value = item.item;
      renderItemSuggestion();
    });
    suggestionButtons.append(button);
  });
}

function calculateLine(item) {
  const quantity = Number(item.quantity) || 1;
  return (item.averagePrice + item.averageShipping + (item.includeAssembly ? item.averageAssemblyWhenRequested : 0)) * quantity;
}

function renderEstimateLines() {
  estimateLines.replaceChildren();
  if (estimateItems.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'estimate-empty';
    empty.textContent = 'Your item estimate is empty.';
    estimateLines.append(empty);
  }

  estimateItems.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'estimate-line';
    const details = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = `${item.item} × ${item.quantity}`;
    const costs = document.createElement('span');
    costs.textContent = `Item ${formatMoney(item.averagePrice)} + ship ${formatMoney(item.averageShipping)}${item.includeAssembly ? ` + assembly ${formatMoney(item.averageAssemblyWhenRequested)}` : ''} / unit`;
    details.append(name, costs);
    const actions = document.createElement('div');
    actions.className = 'estimate-line-actions';
    const total = document.createElement('strong');
    total.textContent = formatMoney(calculateLine(item));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'estimate-remove';
    remove.dataset.removeEstimate = item.id;
    remove.setAttribute('aria-label', `Remove ${item.item} from estimate`);
    remove.textContent = 'Remove';
    actions.append(total, remove);
    row.append(details, actions);
    estimateLines.append(row);
  });

  const total = estimateItems.reduce((sum, item) => sum + calculateLine(item), 0);
  estimateTotal.textContent = formatMoney(total);
}

function resetForm() {
  form.reset();
  form.elements.id.value = '';
  title.textContent = 'Add a room plan';
  document.querySelector('#save-plan').innerHTML = 'Save room plan <span aria-hidden="true">↗</span>';
  cancelEdit.hidden = true;
  estimateItems = [];
  renderFurnitureOptions();
  renderEstimateLines();
}

roomSelect.addEventListener('change', () => renderFurnitureOptions());
itemSelect.addEventListener('change', renderItemSuggestion);
document.querySelector('#add-estimate-item').addEventListener('click', () => {
  const item = getSelectedItem();
  if (!item) return;
  const quantity = Number(document.querySelector('#item-quantity').value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return;

  estimateItems.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `estimate-${Date.now()}`,
    room: item.room,
    item: item.item,
    quantity,
    averagePrice: item.averagePrice,
    averageShipping: item.averageShipping,
    includeAssembly: document.querySelector('#include-assembly').checked,
    averageAssemblyWhenRequested: item.averageAssemblyWhenRequested,
    assemblyRate: item.assemblyRate,
    sampleOrders: item.orders,
  });
  renderEstimateLines();
  budgetInput.value = String(Math.round(estimateItems.reduce((sum, item) => sum + calculateLine(item), 0)));
  document.querySelector('#item-quantity').value = '1';
});

estimateLines.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove-estimate]');
  if (!removeButton) return;
  estimateItems = estimateItems.filter((item) => item.id !== removeButton.dataset.removeEstimate);
  renderEstimateLines();
  budgetInput.value = String(Math.round(estimateItems.reduce((sum, item) => sum + calculateLine(item), 0)));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const id = values.get('id');
  const plan = {
    id: id || (crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}`),
    name: String(values.get('name')).trim(),
    room: String(values.get('room')),
    style: String(values.get('style')),
    area: Number(values.get('area')),
    budget: Number(values.get('budget')),
    status: String(values.get('status')),
    items: estimateItems.map((item) => ({ ...item })),
  };

  if (id) {
    plans = plans.map((item) => item.id === id ? plan : item);
    message.textContent = `Updated “${plan.name}”.`;
  } else {
    plans = [plan, ...plans];
    message.textContent = `Added “${plan.name}”.`;
  }
  persistPlans();
  renderPlans();
  resetForm();
});

body.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const plan = plans.find((item) => item.id === button.dataset.id);
  if (!plan) return;

  if (button.dataset.action === 'edit') {
    form.elements.id.value = plan.id;
    form.elements.name.value = plan.name;
    form.elements.room.value = plan.room;
    form.elements.style.value = plan.style;
    form.elements.area.value = plan.area;
    form.elements.budget.value = plan.budget;
    form.elements.status.value = plan.status;
    estimateItems = (plan.items || []).map((item) => ({ ...item }));
    renderFurnitureOptions(estimateItems[0]?.item || '');
    renderEstimateLines();
    title.textContent = 'Edit room plan';
    document.querySelector('#save-plan').innerHTML = 'Update room plan <span aria-hidden="true">↗</span>';
    cancelEdit.hidden = false;
    document.querySelector('#editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.elements.name.focus({ preventScroll: true });
  } else {
    plans = plans.filter((item) => item.id !== plan.id);
    persistPlans();
    renderPlans();
    message.textContent = `Deleted “${plan.name}”.`;
  }
});

cancelEdit.addEventListener('click', resetForm);
search.addEventListener('input', renderPlans);
renderFurnitureOptions();
renderEstimateLines();
renderPlans();
