
const BOOKINGS_KEY = 'tumatour_bookings_v1';
const TESTIMONIALS_KEY = 'tumatour_public_testimonials_v1';
const PENDING_TOUR_KEY = 'tumatour_pending_tour_v1';

function getItems(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch (e) { return []; }
}

function setItems(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function esc(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Carrusel principal
const heroTrack = document.getElementById('heroTrack');
const heroPrev = document.getElementById('heroPrev');
const heroNext = document.getElementById('heroNext');
const heroDots = document.getElementById('heroDots');
const heroSlides = heroTrack ? Array.from(heroTrack.children) : [];
let heroIndex = 0;
let autoTimer = null;
let startX = 0;
let moveX = 0;

function renderDots() {
  if (!heroDots || !heroSlides.length) return;
  heroDots.innerHTML = '';
  heroSlides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'dot' + (i === heroIndex ? ' active' : '');
    b.type = 'button';
    b.setAttribute('aria-label', `Ir a la imagen ${i + 1}`);
    b.addEventListener('click', () => goSlide(i, true));
    heroDots.appendChild(b);
  });
}

function updateCarousel() {
  if (!heroTrack) return;
  heroTrack.style.transform = `translateX(-${heroIndex * 100}%)`;
  Array.from(heroDots?.children || []).forEach((d, i) => {
    d.classList.toggle('active', i === heroIndex);
  });
}

function goSlide(i, restart = false) {
  heroIndex = (i + heroSlides.length) % heroSlides.length;
  updateCarousel();
  if (restart) restartAuto();
}

function nextSlide(restart = false) {
  goSlide(heroIndex + 1, restart);
}

function prevSlide(restart = false) {
  goSlide(heroIndex - 1, restart);
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function startAuto() {
  if (!heroSlides.length) return;
  stopAuto();
  autoTimer = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroSlides.length;
    updateCarousel();
  }, 2000);
}

function restartAuto() {
  startAuto();
}

if (heroTrack && heroSlides.length) {
  renderDots();
  updateCarousel();
  startAuto();

  heroPrev?.addEventListener('click', () => prevSlide(true));
  heroNext?.addEventListener('click', () => nextSlide(true));

  heroTrack.addEventListener('mouseenter', stopAuto);
  heroTrack.addEventListener('mouseleave', startAuto);

  heroTrack.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    moveX = startX;
    stopAuto();
  }, { passive: true });

  heroTrack.addEventListener('touchmove', (e) => {
    moveX = e.touches[0].clientX;
  }, { passive: true });

  heroTrack.addEventListener('touchend', () => {
    const diff = moveX - startX;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide(true);
      else prevSlide(true);
    } else {
      startAuto();
    }
  }, { passive: true });
}

// Reservas desde botones y planes
document.querySelectorAll('[data-tour]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const tour = btn.getAttribute('data-tour');
    if (tour) localStorage.setItem(PENDING_TOUR_KEY, tour);

    const href = btn.getAttribute('href') || '';
    const isReservePage = window.location.pathname.endsWith('reservar.html');

    if (!isReservePage && (href.includes('reservar.html') || btn.classList.contains('tumaco-plan-link'))) {
      return; // deja navegar normal
    }

    if (!isReservePage && (btn.tagName === 'BUTTON' || !href)) {
      e.preventDefault();
      window.location.href = 'reservar.html';
      return;
    }

    const select = document.getElementById('tour');
    if (select && tour) {
      const existing = Array.from(select.options).some(
        (opt) => opt.value === tour || opt.textContent === tour
      );
      if (!existing) {
        const opt = document.createElement('option');
        opt.value = tour;
        opt.textContent = tour;
        select.appendChild(opt);
      }
      select.value = tour;
    }
  });
});

(function applyPendingTour() {
  const select = document.getElementById('tour');
  const pending = localStorage.getItem(PENDING_TOUR_KEY);
  if (!select || !pending) return;

  const existing = Array.from(select.options).some(
    (opt) => opt.value === pending || opt.textContent === pending
  );
  if (!existing) {
    const opt = document.createElement('option');
    opt.value = pending;
    opt.textContent = pending;
    select.appendChild(opt);
  }
  select.value = pending;
  localStorage.removeItem(PENDING_TOUR_KEY);
})();

// Formulario de reserva
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const booking = {
      id: 'b_' + Date.now(),
      name: document.getElementById('name')?.value?.trim(),
      phone: document.getElementById('phone')?.value?.trim(),
      tour: document.getElementById('tour')?.value?.trim(),
      date: document.getElementById('date')?.value?.trim(),
      createdAt: Date.now()
    };

    if (!booking.name || !booking.phone || !booking.tour || !booking.date) return;

    const items = getItems(BOOKINGS_KEY);
    items.push(booking);
    setItems(BOOKINGS_KEY, items);
    bookingForm.reset();
    alert('Reserva enviada correctamente');
  });
}

// Comentarios públicos
function renderPublicTestimonials() {
  const list = document.getElementById('publicTestimonialsList');
  if (!list) return;

  const items = getItems(TESTIMONIALS_KEY).sort(
    (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)
  );

  if (!items.length) {
    list.innerHTML = '<div class="empty-box">Todavía no hay comentarios publicados. Déjanos tu comentario.</div>';
    return;
  }

  list.innerHTML = items.map((item) => `
    <article class="testimonial-item">
      <div class="testimonial-top">
        <div class="avatar">${esc((item.name || 'T').slice(0, 1).toUpperCase())}</div>
        <div>
          <strong>${esc(item.name || 'Visitante')}</strong><br>
          <span class="muted">${esc(item.city || 'Visitante')}</span>
        </div>
      </div>
      <p>${esc(item.message || '')}</p>
    </article>
  `).join('');
}

const publicTestimonialForm = document.getElementById('publicTestimonialForm');
if (publicTestimonialForm) {
  publicTestimonialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('testimonialName')?.value?.trim();
    const city = document.getElementById('testimonialCity')?.value?.trim();
    const message = document.getElementById('testimonialMessage')?.value?.trim();

    if (!name || !message) return;

    const items = getItems(TESTIMONIALS_KEY);
    items.push({
      id: 't_' + Date.now(),
      name,
      city,
      message,
      createdAt: Date.now()
    });

    setItems(TESTIMONIALS_KEY, items);
    publicTestimonialForm.reset();
    renderPublicTestimonials();
    alert('Tu comentario fue publicado');
  });
}

renderPublicTestimonials();
