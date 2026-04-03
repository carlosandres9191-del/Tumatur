
const STORAGE_KEYS = {
  bookings: 'tumatour_bookings',
  prices: 'tumatour_prices',
  users: 'tumatour_users',
  session: 'tumatour_session'
};

const defaultPrices = {
  'Ruta del Milagro Eucarístico': 180000,
  'Ruta de la Fe Colomboecuatoriana': 1850000,
  'Rutas Internacionales': 350000,
  'Artículos religiosos': 35000
};

const defaultUsers = [
  { username: 'admin', password: 'admin123', role: 'Administrador', active: true },
  { username: 'operador', password: 'operador123', role: 'Operador', active: true }
];

function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
}

function getBookings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || '[]');
}

function getPrices() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) || 'null');
  return saved ? { ...defaultPrices, ...saved } : defaultPrices;
}

function savePrices(prices) {
  localStorage.setItem(STORAGE_KEYS.prices, JSON.stringify(prices));
}

function ensureUsers() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || 'null');
  if (!saved || !saved.length) localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(defaultUsers));
}

function getUsers() {
  ensureUsers();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || 'null');
}

function saveSession(user) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function renderAuth() {
  const session = getSession();
  const loginView = document.getElementById('loginView');
  const panelView = document.getElementById('panelView');
  const currentUser = document.getElementById('currentUser');
  if (!loginView || !panelView) return;

  if (session?.username) {
    loginView.classList.add('hide');
    panelView.classList.remove('hide');
    if (currentUser) currentUser.textContent = `${session.username} · ${session.role}`;
    renderPrices();
    renderUsers();
    renderTable();
  } else {
    loginView.classList.remove('hide');
    panelView.classList.add('hide');
  }
}

function renderPrices() {
  const prices = getPrices();
  document.getElementById('priceMilagro').value = prices['Ruta del Milagro Eucarístico'];
  document.getElementById('priceFe').value = prices['Ruta de la Fe Colomboecuatoriana'];
  document.getElementById('priceIntl').value = prices['Rutas Internacionales'];
  document.getElementById('priceArticulos').value = prices['Artículos religiosos'];
}

function renderSummary(bookings) {
  const totalReservas = bookings.length;
  const totalIngresos = bookings.reduce((sum, item) => sum + (item.total || 0), 0);
  const ultima = bookings[0]?.cliente ? `${bookings[0].cliente} · ${bookings[0].tour}` : 'Sin datos';

  document.getElementById('totalReservas').textContent = totalReservas;
  document.getElementById('totalIngresos').textContent = formatCOP(totalIngresos);
  document.getElementById('ultimaReserva').textContent = ultima;
}

function renderTable() {
  const tbody = document.getElementById('bookingTableBody');
  const emptyState = document.getElementById('emptyState');
  const bookings = getBookings();
  tbody.innerHTML = '';

  if (!bookings.length) {
    emptyState.style.display = 'block';
    renderSummary(bookings);
    return;
  }

  emptyState.style.display = 'none';
  bookings.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.cliente || ''}<br><small>${item.documento || ''}</small></td>
      <td>${item.tour || ''}</td>
      <td>${item.fecha || ''}</td>
      <td>${item.personas || 1}</td>
      <td>${item.telefono || ''}<br><small>${item.email || ''}</small></td>
      <td>${item.ciudad || ''}<br><small>${item.pago || ''}</small></td>
      <td>${formatCOP(item.total || 0)}</td>
    `;
    tbody.appendChild(tr);
  });

  renderSummary(bookings);
}

function renderUsers() {
  const tbody = document.getElementById('usersTableBody');
  const users = getUsers();
  tbody.innerHTML = '';
  users.forEach((user, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td><span class="status-pill">${user.active ? 'Activo' : 'Inactivo'}</span></td>
      <td>
        <button class="btn btn-secondary" data-edit-user="${index}">Editar</button>
        <button class="btn btn-danger" data-delete-user="${index}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('[data-edit-user]').forEach(btn => {
    btn.addEventListener('click', () => loadUserIntoForm(Number(btn.dataset.editUser)));
  });
  document.querySelectorAll('[data-delete-user]').forEach(btn => {
    btn.addEventListener('click', () => deleteUser(Number(btn.dataset.deleteUser)));
  });
}

function loadUserIntoForm(index) {
  const user = getUsers()[index];
  if (!user) return;
  document.getElementById('editUserIndex').value = index;
  document.getElementById('username').value = user.username;
  document.getElementById('password').value = user.password;
  document.getElementById('role').value = user.role;
  document.getElementById('active').value = user.active ? 'true' : 'false';
}

function deleteUser(index) {
  const session = getSession();
  const users = getUsers();
  const target = users[index];
  if (!target) return;
  if (target.username === session?.username) {
    alert('No puedes eliminar el usuario que está en sesión.');
    return;
  }
  if (!confirm(`¿Eliminar el usuario ${target.username}?`)) return;
  users.splice(index, 1);
  saveUsers(users);
  renderUsers();
  showToast('Usuario eliminado.');
}

function exportCSV() {
  const bookings = getBookings();
  if (!bookings.length) {
    alert('No hay reservas para exportar.');
    return;
  }

  const headers = ['Cliente', 'Documento', 'Telefono', 'Email', 'Tour', 'Fecha', 'Personas', 'Ciudad', 'Pago', 'Mensaje', 'Valor unitario', 'Total', 'Creado'];
  const rows = bookings.map(item => [
    item.cliente, item.documento, item.telefono, item.email, item.tour, item.fecha,
    item.personas, item.ciudad, item.pago, item.mensaje, item.valorUnitario, item.total, item.creado
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reservas_tuma_tour.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function bindEvents() {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    const user = getUsers().find(u => u.username === username && u.password === password && u.active);
    if (!user) {
      alert('Usuario o contraseña no válidos.');
      return;
    }
    saveSession({ username: user.username, role: user.role });
    renderAuth();
    showToast('Acceso correcto al CRM.');
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession();
    renderAuth();
  });

  document.getElementById('priceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const prices = {
      'Ruta del Milagro Eucarístico': Number(document.getElementById('priceMilagro').value || 0),
      'Ruta de la Fe Colomboecuatoriana': Number(document.getElementById('priceFe').value || 0),
      'Rutas Internacionales': Number(document.getElementById('priceIntl').value || 0),
      'Artículos religiosos': Number(document.getElementById('priceArticulos').value || 0)
    };
    savePrices(prices);
    showToast('Precios guardados correctamente.');
  });

  document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const users = getUsers();
    const idx = document.getElementById('editUserIndex').value;
    const newUser = {
      username: document.getElementById('username').value.trim(),
      password: document.getElementById('password').value.trim(),
      role: document.getElementById('role').value,
      active: document.getElementById('active').value === 'true'
    };

    if (!newUser.username || !newUser.password) {
      alert('Completa usuario y contraseña.');
      return;
    }

    const duplicate = users.find((u, i) => u.username === newUser.username && String(i) !== String(idx));
    if (duplicate) {
      alert('Ese usuario ya existe.');
      return;
    }

    if (idx === '') users.push(newUser);
    else users[Number(idx)] = newUser;

    saveUsers(users);
    e.target.reset();
    document.getElementById('editUserIndex').value = '';
    renderUsers();
    showToast('Usuario guardado correctamente.');
  });

  document.getElementById('resetUserForm').addEventListener('click', () => {
    document.getElementById('userForm').reset();
    document.getElementById('editUserIndex').value = '';
  });

  document.getElementById('exportBtn').addEventListener('click', exportCSV);
  document.getElementById('clearBtn').addEventListener('click', () => {
    const ok = confirm('¿Seguro que deseas borrar todas las reservas guardadas?');
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEYS.bookings);
    renderTable();
    showToast('Reservas eliminadas.');
  });
}

ensureUsers();
bindEvents();
renderAuth();
