document.addEventListener("DOMContentLoaded", () => {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const slides = carousel.querySelectorAll("img, .video-wrapper");
    const prevBtn = carousel.querySelector(".prev");
    const nextBtn = carousel.querySelector(".next");
    let index = 0;

    function showSlide(i) {
      slides.forEach((slide) => {
        slide.classList.remove("active", "playing");
        const video = slide.querySelector("video");
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      });

      const currentSlide = slides[i];
      currentSlide.classList.add("active");
    }

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    });

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % slides.length;
      showSlide(index);
    });

    showSlide(index);
  });

  // MODAL VIDEO AMPLIADO
  const modal = document.createElement("div");
  modal.classList.add("video-modal");
  Object.assign(modal.style, {
    display: "none",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  });

  modal.innerHTML = `
    <span class="close-modal" style="position:absolute;top:10px;right:20px;font-size:2rem;color:white;cursor:pointer;z-index:10000;">&times;</span>
    <video controls style="width:90%;max-height:90%;border-radius:12px;box-shadow:0 0 20px rgba(0,0,0,0.5);"></video>
  `;
  document.body.appendChild(modal);

  const modalVideo = modal.querySelector("video");
  const closeBtn = modal.querySelector(".close-modal");

  // Clic sobre el video en carrusel abre el modal (solo si no se usó el overlay)
  document.querySelectorAll(".video-wrapper video").forEach((video) => {
    video.addEventListener("click", (e) => {
      if (e.target.closest(".play-overlay")) return;
      e.preventDefault();
      e.stopPropagation();

      const wrapper = video.closest(".video-wrapper");
      if (!wrapper.classList.contains("active")) return;

      video.pause();
      video.currentTime = 0;

      modalVideo.pause();
      modalVideo.currentTime = 0;
      modalVideo.src = video.currentSrc || video.src;

      modal.style.display = "flex";

      setTimeout(() => modalVideo.play(), 100);
    });
  });

  closeBtn.addEventListener("click", () => {
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = "";
    modal.style.display = "none";
  });

  // Reproducir video directamente desde ícono de play
  document.querySelectorAll(".video-wrapper").forEach(wrapper => {
    const video = wrapper.querySelector("video");
    const overlay = wrapper.querySelector(".play-overlay");

    if (!video || !overlay) return;

    overlay.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Evita que el modal se abra
      wrapper.classList.add("playing");
      video.play();
    });

    video.addEventListener("pause", () => {
      wrapper.classList.remove("playing");
    });
  });
});
