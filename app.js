const state = {
  currentUser: null,
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedDate: null,
  activeView: 'calendarView',
  projects: [{ id: 'p1', name: 'Proyecto Byte Valerita' }],
  users: [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'Valerita' },
    { username: 'sofia', password: '1234', role: 'usuario', name: 'Sofía' },
    { username: 'juan', password: '1234', role: 'usuario', name: 'Juan' },
    { username: 'maria', password: '1234', role: 'usuario', name: 'María' }
  ],
  events: [
    {
      id: 'e1',
      projectId: 'p1',
      date: isoDateOffset(1),
      type: 'persona',
      owner: 'Sofía',
      title: 'Revisión de diseño',
      description: 'Revisar prototipo y checklist visual.',
      status: 'En proceso'
    },
    {
      id: 'e2',
      projectId: 'p1',
      date: isoDateOffset(2),
      type: 'equipo',
      owner: 'Equipo Byte',
      title: 'Sprint planning',
      description: 'Planificación semanal con todo el equipo.',
      status: 'En proceso'
    }
  ],
  notifications: ['Bienvenida a Proyectos By Valerita.'],
  messages: [
    { user: 'Sistema', text: 'Chat del proyecto activado.', at: new Date().toLocaleString('es-AR') }
  ]
};

ensureProjects();

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const monthTitle = document.getElementById('monthTitle');
const calendarEl = document.getElementById('calendar');
const eventDetailsEl = document.getElementById('eventDetails');
const notificationsEl = document.getElementById('notifications');
const chatMessagesEl = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const tasksListEl = document.getElementById('tasksList');
const welcomeTextEl = document.getElementById('welcomeText');
const projectForm = document.getElementById('projectForm');
const taskForm = document.getElementById('taskForm');
const taskProjectEl = document.getElementById('taskProject');
const tabButtons = [...document.querySelectorAll('.tab')];
const viewSections = [...document.querySelectorAll('.view')];

document.getElementById('prevMonth').addEventListener('click', () => {
  state.currentMonth -= 1;
  if (state.currentMonth < 0) {
    state.currentMonth = 11;
    state.currentYear -= 1;
  }
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  state.currentMonth += 1;
  if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear += 1;
  }
  renderCalendar();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  state.currentUser = null;
  loginSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
  loginForm.reset();
});

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.activeView = button.dataset.view;
    renderViews();
  });
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const user = state.users.find((u) => u.username === username && u.password === password);
  if (!user) {
    window.alert('Usuario o clave incorrectos.');
    return;
  }

  state.currentUser = user;
  addNotification(`${user.name} inició sesión.`);
  welcomeTextEl.textContent = `Bienvenida, ${user.name}. Rol: ${user.role}`;
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  renderAll();
});

projectForm.addEventListener('submit', (event) => {
  event.preventDefault();
  ensureProjects();
  const input = document.getElementById('projectName');
  const name = input.value.trim();
  if (!name) return;

  const newProject = { id: `p${Date.now()}`, name };
  state.projects.push(newProject);
  input.value = '';
  addNotification(`Nuevo proyecto creado: ${name}.`);
  renderProjectOptions();
  taskProjectEl.value = newProject.id;
  renderNotifications();
});

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  ensureProjects();
  const selectedProject = document.getElementById('taskProject').value || state.projects[0]?.id || '';
  const task = {
    id: `e${Date.now()}`,
    projectId: selectedProject,
    title: document.getElementById('taskTitle').value.trim(),
    date: document.getElementById('taskDate').value,
    type: document.getElementById('taskType').value,
    owner: document.getElementById('taskOwner').value.trim(),
    description: document.getElementById('taskDescription').value.trim(),
    status: 'Pendiente'
  };

  if (!task.title || !task.date || !task.owner || !task.description || !task.projectId) {
    window.alert('Completa todos los campos de la tarea.');
    return;
  }

  state.events.push(task);
  taskForm.reset();
  taskProjectEl.value = state.projects[0]?.id || '';
  addNotification(`Nueva tarea agregada: ${task.title}.`);
  renderCalendar();
  renderTasks();
  renderNotifications();
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!state.currentUser) return;

  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  state.messages.push({
    user: state.currentUser.name,
    text,
    at: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  });
  input.value = '';
  renderChat();
});

function renderAll() {
  ensureProjects();
  renderViews();
  renderProjectOptions();
  renderCalendar();
  renderEventDetails();
  renderTasks();
  renderNotifications();
  renderChat();
}

function renderViews() {
  tabButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === state.activeView));
  viewSections.forEach((section) => section.classList.toggle('hidden', section.id !== state.activeView));
}

function renderProjectOptions() {
  ensureProjects();
  taskProjectEl.innerHTML = '';
  state.projects.forEach((project) => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    taskProjectEl.appendChild(option);
  });
}

function renderCalendar() {
  const monthName = new Date(state.currentYear, state.currentMonth, 1).toLocaleString('es-AR', { month: 'long', year: 'numeric' });
  monthTitle.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  calendarEl.innerHTML = '';
  ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach((day) => {
    const el = document.createElement('div');
    el.className = 'weekday';
    el.textContent = day;
    calendarEl.appendChild(el);
  });

  const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  for (let i = 0; i < firstDay; i += 1) {
    const empty = document.createElement('div');
    empty.className = 'day';
    calendarEl.appendChild(empty);
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toIso(state.currentYear, state.currentMonth, day);
    const dayEvents = eventsByDate(iso);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'day';
    el.innerHTML = `<div class="day-number">${day}</div>`;

    if (iso === todayIso) el.classList.add('today');
    if (dayEvents.some((e) => e.type === 'persona')) el.classList.add('has-persona');
    if (dayEvents.some((e) => e.type === 'equipo')) el.classList.add('has-equipo');

    dayEvents.slice(0, 2).forEach((e) => {
      const chip = document.createElement('span');
      chip.className = `event-chip ${e.type}`;
      chip.textContent = e.type;
      el.appendChild(chip);
    });

    el.addEventListener('click', () => {
      state.selectedDate = iso;
      renderEventDetails();
      state.activeView = 'calendarView';
      renderViews();
    });

    calendarEl.appendChild(el);
  }
}

function renderEventDetails() {
  if (!state.selectedDate) {
    eventDetailsEl.textContent = 'Selecciona un día para ver tareas y procesos.';
    return;
  }

  const dayEvents = eventsByDate(state.selectedDate);
  if (dayEvents.length === 0) {
    eventDetailsEl.textContent = `No hay tareas para ${formatDate(state.selectedDate)}.`;
    return;
  }

  eventDetailsEl.innerHTML = '';
  dayEvents.forEach((eventItem) => eventDetailsEl.appendChild(buildEventCard(eventItem)));
}

function renderTasks() {
  tasksListEl.innerHTML = '';
  state.events.forEach((eventItem) => tasksListEl.appendChild(buildEventCard(eventItem)));
}

function buildEventCard(eventItem) {
  const item = document.createElement('article');
  item.className = 'detail-item';
  item.innerHTML = `
    <strong>${eventItem.title}</strong>
    <div>${formatDate(eventItem.date)} · ${eventItem.owner}</div>
    <small>Proyecto: ${projectNameById(eventItem.projectId)}</small>
    <p>${eventItem.description}</p>
    <small>Tipo: ${eventItem.type === 'persona' ? 'Persona' : 'Equipo'}</small>
  `;

  const select = document.createElement('select');
  ['Pendiente', 'En proceso', 'Completada'].forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    option.selected = status === eventItem.status;
    select.appendChild(option);
  });

  select.addEventListener('change', (changeEvent) => {
    eventItem.status = changeEvent.target.value;
    addNotification(eventItem.status === 'Completada' && state.currentUser
      ? `${state.currentUser.name} completó: ${eventItem.title}.`
      : `Estado actualizado: ${eventItem.title} → ${eventItem.status}.`);
    renderNotifications();
    renderTasks();
    renderEventDetails();
  });

  const actionRow = document.createElement('div');
  actionRow.className = 'item-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'btn-secondary';
  editButton.textContent = 'Editar';
  editButton.addEventListener('click', () => editTask(eventItem));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'btn-danger';
  deleteButton.textContent = 'Eliminar';
  deleteButton.addEventListener('click', () => deleteTask(eventItem.id));

  actionRow.appendChild(editButton);
  actionRow.appendChild(deleteButton);
  item.appendChild(select);
  item.appendChild(actionRow);
  return item;
}

function renderNotifications() {
  notificationsEl.innerHTML = '';
  [...state.notifications].reverse().forEach((message) => {
    const li = document.createElement('li');
    li.textContent = message;
    notificationsEl.appendChild(li);
  });
}

function renderChat() {
  chatMessagesEl.innerHTML = '';
  state.messages.forEach((message) => {
    const div = document.createElement('div');
    div.className = 'msg';
    div.innerHTML = `<strong>${message.user}</strong> <small>${message.at}</small><br/>${message.text}`;
    chatMessagesEl.appendChild(div);
  });
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function projectNameById(projectId) {
  return state.projects.find((project) => project.id === projectId)?.name || 'Sin proyecto';
}

function ensureProjects() {
  if (!Array.isArray(state.projects)) {
    state.projects = [];
  }
  if (state.projects.length === 0) {
    state.projects.push({ id: 'p1', name: 'Proyecto Byte Valerita' });
  }
}

function eventsByDate(isoDate) {
  return state.events.filter((eventItem) => eventItem.date === isoDate);
}

function addNotification(message) {
  state.notifications.push(`${new Date().toLocaleString('es-AR')} · ${message}`);
}

function editTask(eventId) {
  const task = state.events.find((item) => item.id === eventId.id || item.id === eventId);
  if (!task) return;

  const newTitle = window.prompt('Editar título', task.title);
  if (!newTitle) return;
  const newOwner = window.prompt('Editar responsable', task.owner);
  if (!newOwner) return;
  const newDate = window.prompt('Editar fecha (YYYY-MM-DD)', task.date);
  if (!newDate) return;
  const newDescription = window.prompt('Editar descripción', task.description);
  if (!newDescription) return;

  task.title = newTitle.trim();
  task.owner = newOwner.trim();
  task.date = newDate.trim();
  task.description = newDescription.trim();

  addNotification(`Tarea editada: ${task.title}.`);
  renderCalendar();
  renderTasks();
  renderEventDetails();
  renderNotifications();
}

function deleteTask(eventId) {
  const task = state.events.find((item) => item.id === eventId);
  if (!task) return;

  const confirmed = window.confirm(`¿Eliminar tarea "${task.title}"?`);
  if (!confirmed) return;

  state.events = state.events.filter((item) => item.id !== eventId);
  addNotification(`Tarea eliminada: ${task.title}.`);
  renderCalendar();
  renderTasks();
  renderEventDetails();
  renderNotifications();
}

function toIso(year, monthIndex, day) {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'long' });
}

function isoDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
