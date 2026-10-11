const STORAGE_KEY = 'roomwise-design-plans-v1';
const starterPlans = window.ROOMWISE_DATA.demoPlans;
const form = document.querySelector('#plan-form');
const body = document.querySelector('#plans-body');
const search = document.querySelector('#plan-search');
const count = document.querySelector('#plan-count');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#status-message');
const title = document.querySelector('#form-title');
const cancelEdit = document.querySelector('#cancel-edit');

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

function createCell(text, className = '') {
  const cell = document.createElement('td');
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function renderPlans() {
  const query = search.value.trim().toLowerCase();
  const visible = plans.filter((plan) => `${plan.name} ${plan.room} ${plan.style} ${plan.status}`.toLowerCase().includes(query));
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
    room.textContent = plan.room;
    nameCell.append(name, room);
    row.append(nameCell, createCell(plan.style), createCell(`${Number(plan.area).toLocaleString('en-US')} sq ft`));
    row.append(createCell(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(plan.budget), 'money-cell'));

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

function resetForm() {
  form.reset();
  form.elements.id.value = '';
  title.textContent = 'Add a room plan';
  document.querySelector('#save-plan').innerHTML = 'Save room plan <span aria-hidden="true">↗</span>';
  cancelEdit.hidden = true;
}

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
renderPlans();
