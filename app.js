const STORAGE_KEYS = {
  packages: 'tumatour_packages_v3',
  sales: 'tumatour_sales_v3'
};

const defaultPackages = [
  {
    id: 'ruta-fe',
    name: 'Ruta de la Fe Colomboecuatoriana',
    category: 'Turismo religioso',
    price: 1850000,
    duration: '5 días / 4 noches',
    image: 'assets/ruta-fe-2.jpg',
    shortDescription: 'Recorrido espiritual y cultural por Tumaco, Pasto, Ibarra, Tulcán e Ipiales, con paisajes inolvidables y acompañamiento organizado.',
    includes: [
      'Transporte terrestre Tumaco a Pasto',
      'Alimentación completa',
      'Seguro de viaje',
      'Guía de turismo',
      'Ticket al tren',
      'Hotel con aguas termales'
    ]
  },
  {
    id: 'milagro-ola',
    name: 'Ruta del Milagro Eucarístico de la Ola',
    category: 'Experiencia de fe',
    price: 240000,
    duration: 'Experiencia de medio día',
    image: 'assets/milagro.jpg',
    shortDescription: 'Recorrido por los puntos emblemáticos de la Ruta del Milagro Eucarístico en Tumaco, integrando historia, espiritualidad y comunidad.',
    includes: [
      'Recogida en hotel',
      'Traslado en Tuk Tuk',
      'Desayuno o almuerzo típico',
      'Camiseta conmemorativa',
      'Refrigerio',
      'Seguro de viaje',
      'Guía turístico'
    ]
  },
  {
    id: 'rutas-internacionales',
    name: 'Rutas regionales e internacionales',
    category: 'Conexión Pacífico - Ecuador',
    price: 390000,
    duration: 'Según itinerario',
    image: 'assets/internacionales.jpg',
    shortDescription: 'Viajes personalizados entre Tumaco, Pasto, Esmeraldas, Ibarra y San Lorenzo, con acompañamiento y logística ajustada a tu necesidad.',
    includes: [
      'Coordinación de transporte',
      'Diseño de ruta personalizada',
      'Acompañamiento logístico',
      'Asistencia previa al viaje'
    ]
  }
];

function getPackages() {
  const stored = localStorage.getItem(STORAGE_KEYS.packages);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.packages, JSON.stringify(defaultPackages));
    return [...defaultPackages];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultPackages];
  } catch (error) {
    localStorage.setItem(STORAGE_KEYS.packages, JSON.stringify(defaultPackages));
    return [...defaultPackages];
  }
}

function savePackages(packages) {
  localStorage.setItem(STORAGE_KEYS.packages, JSON.stringify(packages));
}

function getSales() {
  const stored = localStorage.getItem(STORAGE_KEYS.sales);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveSales(sales) {
  localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric'
  }).format(date);
}

function createPackageCard(pkg, index) {
  const includes = Array.isArray(pkg.includes) ? pkg.includes : [];
  return `
    <article class="card package-card reveal rise" style="transition-delay:${index * 0.08}s;">
      <div class="package-image"><img src="${pkg.image}" alt="${pkg.name}"></div>
      <div class="card-body">
        <span class="pill">${pkg.category}</span>
        <h3>${pkg.name}</h3>
        <p>${pkg.shortDescription}</p>
        <div class="package-meta">
          <div>
            <div class="price">${formatCurrency(pkg.price)}</div>
            <div class="small">${pkg.duration}</div>
          </div>
          <a href="#reservar" class="btn btn-primary btn-sm" data-package-jump="${pkg.id}">Reservar</a>
        </div>
        <ul class="list compact">
          ${includes.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </article>`;
}

function populateStorefront() {
  const grid = document.getElementById('packages-grid');
  const select = document.getElementById('package-select');
  if (!grid || !select) return;

  const packages = getPackages();
  grid.innerHTML = packages.map((pkg, index) => createPackageCard(pkg, index)).join('');
  select.innerHTML = '<option value="">Selecciona una experiencia</option>' +
    packages.map(pkg => `<option value="${pkg.id}">${pkg.name} — ${formatCurrency(pkg.price)}</option>`).join('');

  document.querySelectorAll('[data-package-jump]').forEach(button => {
    button.addEventListener('click', () => {
      select.value = button.dataset.packageJump;
    });
  });

  initRevealAnimations();
}

function initCalendarHelpers() {
  const dateInput = document.getElementById('travelDate');
  const calendarButton = document.getElementById('calendarButton');
  if (!dateInput) return;

  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  if (!calendarButton) return;

  const openPicker = () => {
    if (typeof dateInput.showPicker === 'function') {
      dateInput.showPicker();
    } else {
      dateInput.focus();
      dateInput.click();
    }
  };

  calendarButton.addEventListener('click', openPicker);
  calendarButton.addEventListener('touchstart', openPicker, { passive: true });
}

function bindReservationForm() {
  const form = document.getElementById('reservation-form');
  const notice = document.getElementById('reservation-notice');
  if (!form || !notice) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const packageId = formData.get('packageId');
    const selectedPackage = getPackages().find(pkg => pkg.id === packageId);

    if (!selectedPackage) {
      notice.textContent = 'Selecciona una experiencia válida para continuar.';
      notice.className = 'notice notice-error show';
      return;
    }

    const travelers = Number(formData.get('travelers') || 1);
    const sales = getSales();
    const reservation = {
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customerName: String(formData.get('customerName') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      travelDate: String(formData.get('travelDate') || ''),
      travelers,
      notes: String(formData.get('notes') || '').trim(),
      unitPrice: Number(selectedPackage.price || 0),
      total: Number(selectedPackage.price || 0) * travelers,
      status: 'Nueva reserva'
    };

    sales.unshift(reservation);
    saveSales(sales);

    notice.textContent = 'Tu solicitud fue enviada correctamente. Quedó registrada para seguimiento interno.';
    notice.className = 'notice notice-success show';

    form.reset();
    const travelersField = form.querySelector('[name="travelers"]');
    if (travelersField) travelersField.value = 1;
    setTimeout(() => notice.classList.remove('show'), 5000);
  });
}

function renderCrm() {
  const salesBody = document.getElementById('sales-body');
  const packagesBody = document.getElementById('package-admin-list');
  if (!salesBody || !packagesBody) return;

  const sales = getSales();
  const packages = getPackages();

  const renderRows = (items) => {
    salesBody.innerHTML = items.length
      ? items.map(item => `
        <tr>
          <td>${formatDate(item.createdAt.slice(0, 10))}</td>
          <td><strong>${item.customerName}</strong><div class="small">${item.email || 'Sin correo'}</div></td>
          <td>${item.phone}</td>
          <td>${item.packageName}</td>
          <td>${formatDate(item.travelDate)}</td>
          <td>${item.travelers}</td>
          <td>${formatCurrency(item.total)}</td>
          <td><button class="btn btn-secondary btn-sm" onclick="deleteSale('${item.id}')">Eliminar</button></td>
        </tr>`).join('')
      : '<tr><td colspan="8" class="empty-cell">Aún no hay reservas registradas.</td></tr>';
  };

  renderRows(sales);

  packagesBody.innerHTML = packages.map(pkg => `
    <tr>
      <td><strong>${pkg.name}</strong><div class="small">${pkg.category}</div></td>
      <td>${formatCurrency(pkg.price)}</td>
      <td>${pkg.duration}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editPackage('${pkg.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deletePackage('${pkg.id}')">Eliminar</button>
      </td>
    </tr>`).join('');

  updateKpis(sales);
  bindSearch(renderRows, sales);
  bindPackageForm();
  bindExport(sales);
  initRevealAnimations();
}

function updateKpis(sales) {
  const totalSales = document.getElementById('kpi-sales');
  const totalIncome = document.getElementById('kpi-income');
  const totalTravelers = document.getElementById('kpi-travelers');
  const lastSale = document.getElementById('kpi-last');
  if (!totalSales || !totalIncome || !totalTravelers || !lastSale) return;

  totalSales.textContent = sales.length;
  totalIncome.textContent = formatCurrency(sales.reduce((sum, item) => sum + Number(item.total || 0), 0));
  totalTravelers.textContent = sales.reduce((sum, item) => sum + Number(item.travelers || 0), 0);
  lastSale.textContent = sales[0] ? sales[0].customerName : 'Sin datos';
}

function bindSearch(renderRows, sales) {
  const search = document.getElementById('sales-search');
  if (!search) return;

  search.addEventListener('input', () => {
    const term = search.value.trim().toLowerCase();
    const filtered = sales.filter(item =>
      String(item.customerName || '').toLowerCase().includes(term) ||
      String(item.packageName || '').toLowerCase().includes(term) ||
      String(item.phone || '').toLowerCase().includes(term)
    );
    renderRows(filtered);
  });
}

function bindPackageForm() {
  const form = document.getElementById('package-form');
  const clearBtn = document.getElementById('clear-package-form');
  if (!form) return;

  form.onsubmit = (event) => {
    event.preventDefault();

    const packages = getPackages();
    const idField = document.getElementById('package-id');
    const payload = {
      id: idField.value || `pkg-${Date.now()}`,
      name: document.getElementById('package-name').value.trim(),
      category: document.getElementById('package-category').value.trim(),
      price: Number(document.getElementById('package-price').value || 0),
      duration: document.getElementById('package-duration').value.trim(),
      shortDescription: document.getElementById('package-description').value.trim(),
      includes: document.getElementById('package-includes').value
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean),
      image: document.getElementById('package-image').value
    };

    const index = packages.findIndex(pkg => pkg.id === payload.id);
    if (index >= 0) {
      packages[index] = payload;
    } else {
      packages.push(payload);
    }

    savePackages(packages);
    form.reset();
    idField.value = '';
    renderCrm();
  };

  if (clearBtn) {
    clearBtn.onclick = () => {
      form.reset();
      document.getElementById('package-id').value = '';
    };
  }
}

function bindExport(sales) {
  const button = document.getElementById('export-sales');
  if (!button) return;

  button.onclick = () => {
    const headers = ['registro', 'cliente', 'telefono', 'correo', 'experiencia', 'fecha_viaje', 'viajeros', 'total', 'notas'];
    const rows = sales.map(item => [
      item.createdAt,
      item.customerName,
      item.phone,
      item.email,
      item.packageName,
      item.travelDate,
      item.travelers,
      item.total,
      String(item.notes || '').replaceAll(',', ' ')
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reservas_tumatour.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
}

window.deleteSale = function deleteSale(id) {
  const sales = getSales().filter(item => item.id !== id);
  saveSales(sales);
  renderCrm();
};

window.deletePackage = function deletePackage(id) {
  const packages = getPackages().filter(item => item.id !== id);
  savePackages(packages);
  renderCrm();
};

window.editPackage = function editPackage(id) {
  const pkg = getPackages().find(item => item.id === id);
  if (!pkg) return;

  document.getElementById('package-id').value = pkg.id;
  document.getElementById('package-name').value = pkg.name;
  document.getElementById('package-category').value = pkg.category;
  document.getElementById('package-price').value = pkg.price;
  document.getElementById('package-duration').value = pkg.duration;
  document.getElementById('package-description').value = pkg.shortDescription;
  document.getElementById('package-includes').value = (pkg.includes || []).join('\n');
  document.getElementById('package-image').value = pkg.image;

  const anchor = document.getElementById('planes');
  if (anchor) {
    window.scrollTo({ top: anchor.offsetTop - 80, behavior: 'smooth' });
  }
};

function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  elements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimations();

  if (document.body.dataset.page === 'storefront') {
    populateStorefront();
    initCalendarHelpers();
    bindReservationForm();
  }

  if (document.body.dataset.page === 'crm') {
    renderCrm();
  }
});
