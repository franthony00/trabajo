// ============================================================
// OceanLux · Sistema de Reseñas con localStorage
// ============================================================

// --------------------------------------------------
// 1. localStorage helpers
// --------------------------------------------------
const STORAGE_KEY = 'oceanlux_reviews';

function getReviews() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function addReview(review) {
  const all = getReviews();
  all.push(review);
  saveReviews(all);
}

function getReviewsByBoat(boatId) {
  return getReviews().filter(r => r.boatId === boatId);
}

function updateReviewCounters() {
  document.querySelectorAll('.toggle-reviews[data-boat-id]').forEach(btn => {
    const n = getReviewsByBoat(btn.dataset.boatId).length;
    const badge = btn.querySelector('.review-count');
    if (badge) badge.textContent = `(${n})`;
  });
}

// --------------------------------------------------
// 2. Helpers
// --------------------------------------------------
function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function formatDate(isoStr) {
  try {
    return new Date(isoStr).toLocaleDateString('es-DO', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch { return ''; }
}

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<i class="${i < rating ? 'fas' : 'far'} fa-star"></i>`
  ).join('');
}

// --------------------------------------------------
// 3. Modal Formulario — abrir / cerrar
// --------------------------------------------------
function openReviewForm() {
  // Poblar select dinámicamente con los botes del HTML
  const sel = document.getElementById('rf-boat');
  sel.innerHTML = '<option value="" disabled selected>Elige una embarcación</option>';
  document.querySelectorAll('.catalog-card[data-boat-id]').forEach(card => {
    const opt = document.createElement('option');
    opt.value = card.dataset.boatId;
    opt.textContent = card.dataset.boatName;
    sel.appendChild(opt);
  });

  // Resetear estado del formulario
  currentRating = 0;
  document.getElementById('rf-rating-value').value = '';
  updateStarDisplay(0);
  document.getElementById('rf-error').classList.add('hidden');
  document.getElementById('rf-error').textContent = '';
  document.getElementById('review-form').reset();

  // Mostrar vista formulario, ocultar vista éxito
  document.getElementById('rf-form-view').classList.remove('hidden');
  document.getElementById('rf-success-view').classList.add('hidden');

  document.getElementById('review-form-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeReviewForm() {
  document.getElementById('review-form-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// --------------------------------------------------
// 4. Modal Ver Reseñas — abrir / cerrar
// --------------------------------------------------
function openReviewsView(boatId, boatName) {
  document.getElementById('rvm-title').textContent = `Reseñas de ${boatName}`;
  renderBoatReviews(boatId, boatName);
  document.getElementById('reviews-view-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeReviewsView() {
  document.getElementById('reviews-view-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderBoatReviews(boatId, boatName) {
  const body = document.getElementById('rvm-body');
  const reviews = [...getReviewsByBoat(boatId)].sort((a, b) => b.id - a.id);

  if (!reviews.length) {
    body.innerHTML = `
      <div class="rvm-empty">
        <span class="rvm-empty-icon">⚓</span>
        <p>Aún no hay reseñas para <strong>${escapeHtml(boatName)}</strong>.</p>
        <p class="rvm-empty-sub">Sé el primero en dejar una reseña.</p>
        <button class="btn-write-first"
          onclick="closeReviewsView(); setTimeout(openReviewForm, 250)">
          <i class="fas fa-star"></i> Escribir reseña
        </button>
      </div>`;
    return;
  }

  body.innerHTML = reviews.map(r => `
    <div class="rv-card">
      <div class="rv-header">
        <span class="rv-stars">${renderStars(r.rating)}</span>
        <span class="rv-date">${formatDate(r.createdAt)}</span>
      </div>
      <div class="rv-author">${escapeHtml(r.customerName)}</div>
      <p class="rv-text">${escapeHtml(r.comment)}</p>
    </div>`).join('');
}

// --------------------------------------------------
// 5. Star Rating (formulario)
// --------------------------------------------------
let currentRating = 0;

function updateStarDisplay(n) {
  document.querySelectorAll('#rf-stars i').forEach((star, i) => {
    star.classList.toggle('fas', i < n);
    star.classList.toggle('far', i >= n);
  });
}

// --------------------------------------------------
// 6. Submit del formulario
// --------------------------------------------------
function handleFormSubmit(e) {
  e.preventDefault();

  const boatId   = document.getElementById('rf-boat').value;
  const name     = document.getElementById('rf-name').value.trim();
  const rating   = parseInt(document.getElementById('rf-rating-value').value);
  const comment  = document.getElementById('rf-comment').value.trim();
  const boatCard = document.querySelector(`.catalog-card[data-boat-id="${boatId}"]`);
  const boatName = boatCard ? boatCard.dataset.boatName : boatId;

  // Limpiar error previo
  const errorEl = document.getElementById('rf-error');
  errorEl.classList.add('hidden');

  // Validaciones
  if (!boatId)                        return showFormError('Selecciona una embarcación.');
  if (!name)                          return showFormError('Ingresa tu nombre.');
  if (!rating || rating < 1 || rating > 5) return showFormError('Selecciona tu calificación (1 a 5 estrellas).');
  if (!comment)                       return showFormError('Escribe un comentario.');

  // Guardar
  addReview({
    id:           Date.now(),
    boatId,
    boatName,
    customerName: name,
    rating,
    comment,
    createdAt:    new Date().toISOString()
  });

  updateReviewCounters();

  // Mostrar éxito y cerrar
  document.getElementById('rf-form-view').classList.add('hidden');
  document.getElementById('rf-success-view').classList.remove('hidden');
  setTimeout(closeReviewForm, 2200);
}

function showFormError(msg) {
  const el = document.getElementById('rf-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

// --------------------------------------------------
// 7. Init — listeners al cargar el DOM
// --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

  // Contadores iniciales
  updateReviewCounters();

  // Stars: click + hover
  document.querySelectorAll('#rf-stars i').forEach(star => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.dataset.rating);
      document.getElementById('rf-rating-value').value = currentRating;
      updateStarDisplay(currentRating);
    });
    star.addEventListener('mouseenter', () =>
      updateStarDisplay(parseInt(star.dataset.rating))
    );
    star.addEventListener('mouseleave', () =>
      updateStarDisplay(currentRating)
    );
  });

  // Submit del formulario
  document.getElementById('review-form').addEventListener('submit', handleFormSubmit);

  // Botones "Reseñas" de cada bote → abrir modal de vista
  document.querySelectorAll('.toggle-reviews').forEach(btn => {
    btn.addEventListener('click', () =>
      openReviewsView(btn.dataset.boatId, btn.dataset.boatName)
    );
  });

  // Cerrar modales al hacer clic en el backdrop
  document.getElementById('review-form-backdrop')
    .addEventListener('click', closeReviewForm);
  document.getElementById('reviews-view-backdrop')
    .addEventListener('click', closeReviewsView);

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeReviewForm();
      closeReviewsView();
    }
  });

});
