
const STORAGE_KEYS = {
  bookings: 'tumatour_bookings',
  prices: 'tumatour_prices'
};

const defaultPrices = {
  'Ruta del Milagro Eucarístico': 180000,
  'Ruta de la Fe Colomboecuatoriana': 1850000,
  'Rutas Internacionales': 350000,
  'Artículos religiosos': 35000
};

function getPrices() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) || 'null');
  return saved ? { ...defaultPrices, ...saved } : defaultPrices;
}

function saveBooking(booking) {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || '[]');
  current.unshift(booking);
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(current));
}

function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function animateOnScroll() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: .16 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function setupMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (!menuBtn || !mobileNav) return;
  menuBtn.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mobileNav.classList.remove('open')));
}

function setupCalendarMinDate() {
  const fechaInput = document.getElementById('fechaInput');
  if (!fechaInput) return;
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  fechaInput.min = `${today.getFullYear()}-${month}-${day}`;
}

function setupPricePreview() {
  const tourSelect = document.getElementById('tourSelect');
  const personasInput = document.querySelector('input[name="personas"]');
  const pricePreview = document.getElementById('pricePreview');
  const selectButtons = document.querySelectorAll('.select-tour');
  const prices = getPrices();

  function updatePreview() {
    if (!tourSelect || !pricePreview) return;
    const tour = tourSelect.value;
    const people = Number(personasInput?.value || 1);
    if (!tour) {
      pricePreview.innerHTML = 'Valor estimado: <strong>Selecciona un plan</strong>';
      return;
    }
    const unit = prices[tour] || 0;
    pricePreview.innerHTML = `Valor estimado: <strong>${formatCOP(unit)}</strong> · Total aprox.: <strong>${formatCOP(unit * people)}</strong>`;
  }

  tourSelect?.addEventListener('change', updatePreview);
  personasInput?.addEventListener('input', updatePreview);
  selectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-tour]');
      const tour = card?.dataset.tour;
      if (tour && tourSelect) {
        tourSelect.value = tour;
        updatePreview();
        document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  updatePreview();
}

function setupBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const prices = getPrices();
    const tour = data.get('tour');
    const personas = Number(data.get('personas') || 1);
    const valorUnitario = prices[tour] || 0;

    const booking = {
      id: Date.now(),
      cliente: data.get('cliente'),
      documento: data.get('documento'),
      telefono: data.get('telefono'),
      email: data.get('email'),
      tour,
      fecha: data.get('fecha'),
      personas,
      ciudad: data.get('ciudad'),
      pago: data.get('pago'),
      mensaje: data.get('mensaje'),
      valorUnitario,
      total: valorUnitario * personas,
      creado: new Date().toLocaleString('es-CO')
    };

    saveBooking(booking);
    form.reset();
    setupPricePreview();
    showToast('Reserva enviada correctamente. Ya quedó registrada en el CRM interno.');
  });
}

animateOnScroll();
setupMenu();
setupCalendarMinDate();
setupPricePreview();
setupBookingForm();
