const carousels = document.querySelectorAll(".carousel");

carousels.forEach((carousel) => {
  const slides = carousel.querySelectorAll("img, video");
  const prevBtn = carousel.querySelector(".prev");
  const nextBtn = carousel.querySelector(".next");
  let index = 0;

  function showSlide(i) {
    slides.forEach((el) => el.classList.remove("active"));
    slides[i].classList.add("active");

    // Pausar cualquier video fuera del slide activo
    slides.forEach((el, idx) => {
      if (el.tagName === "VIDEO") {
        if (idx !== i) {
          el.pause();
          el.currentTime = 0;
        }
      }
    });
  }

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  });

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    showSlide(index);
  });
});

// =======================
// VIDEO MODAL AMPLIADO
// =======================
const modal = document.createElement("div");
modal.classList.add("video-modal");
modal.innerHTML = `
  <span class="close-modal">&times;</span>
  <video controls autoplay></video>
`;
document.body.appendChild(modal);

const modalVideo = modal.querySelector("video");
const closeBtn = modal.querySelector(".close-modal");

// Al hacer clic en un video dentro del carrusel
document.querySelectorAll(".carousel video").forEach((video) => {
  video.addEventListener("click", (e) => {
    e.preventDefault();
    modalVideo.src = video.currentSrc || video.src;
    modal.style.display = "flex";
  });
});

// Cerrar modal al hacer clic en la X
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  modalVideo.pause();
  modalVideo.currentTime = 0;
});
