// Muestra y oculta la pantalla de reseñas
function showReviewPage() {
  document.getElementById('review-page').classList.remove('hidden');
}
function showMainPage() {
  document.getElementById('review-page').classList.add('hidden');
}

// Guarda reseña en Firebase
function saveReview(boat, name, rating, reviewText) {
  db.ref(`reviews/${boat}`).push({
    name,
    rating,
    review: reviewText,
    timestamp: Date.now()
  });
}

// Renderiza reseñas por bote específico
function renderReviewsForBoat(boat) {
  const containers = document.querySelectorAll(`.reviews-list[data-boat="${boat}"]`);
  const boatRef = db.ref(`reviews/${boat}`);

  boatRef.once("value", (snapshot) => {
    containers.forEach(reviewsBox => {
      reviewsBox.innerHTML = "";

      if (!snapshot.exists()) {
        reviewsBox.innerHTML = `<p class="text-sm text-gray-500">No hay reseñas aún.</p>`;
        return;
      }

      snapshot.forEach((child) => {
        const { name, rating, review } = child.val();
        let stars = "";
        for (let i = 1; i <= 5; i++) {
          stars += `<i class="${i <= rating ? 'fas' : 'far'} fa-star text-yellow-400"></i>`;
        }

        reviewsBox.innerHTML += `
          <div class="bg-blue-100 text-gray-800 p-3 rounded mb-2">
            <strong>${name}</strong> <span>${stars}</span>
            <p class="text-sm mt-1">${review}</p>
          </div>
        `;
      });
    });
  });
}

// Cargar reseñas al hacer clic en "Ver Reseñas"
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('toggle-reviews')) {
    const reviewsBox = e.target.nextElementSibling;
    const boat = reviewsBox.dataset.boat;

    reviewsBox.classList.toggle('hidden');
    e.target.textContent = reviewsBox.classList.contains('hidden') ? 'Ver Reseñas' : 'Ocultar Reseñas';

    if (!reviewsBox.classList.contains('hidden')) {
      renderReviewsForBoat(boat);
    }
  }
});

// Manejo de estrellas para calificación
document.querySelectorAll('#star-rating i').forEach(star => {
  star.addEventListener('click', () => {
    const rating = parseInt(star.getAttribute('data-rating'));
    document.getElementById('rating-value').value = rating;

    document.querySelectorAll('#star-rating i').forEach((s, i) => {
      s.classList.toggle('fas', i < rating);
      s.classList.toggle('far', i >= rating);
      s.classList.toggle('text-gold-custom', i < rating);
      s.classList.toggle('text-gray-400', i >= rating);
    });
  });
});

// Envío del formulario
document.getElementById('review-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const boat = document.getElementById('boat-select').value;
  const rating = parseInt(document.getElementById('rating-value').value);
  const reviewText = document.getElementById('review-text').value;
  const name = document.getElementById('reviewer-name').value;

  if (!boat || isNaN(rating) || !reviewText.trim() || !name.trim()) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  console.log("✅ Enviando reseña:", { boat, name, rating, reviewText });
  saveReview(boat, name, rating, reviewText);
  renderReviewsForBoat(boat);
  showMainPage();
  this.reset();

  document.querySelectorAll('#star-rating i').forEach(star => {
    star.classList.remove('fas', 'text-gold-custom');
    star.classList.add('far', 'text-gray-400');
  });

  // Toast opcional
  alert("Reseña enviada con éxito.");
});

