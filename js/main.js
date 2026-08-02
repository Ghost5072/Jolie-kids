// Jolly Kids Maison — main.js
// Hero slideshow (slow cross-fade, not a carousel) + scroll reveal + mobile nav

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Hero slideshow ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length) {
    let current = 0;
    slides[0].classList.add('is-active');
    setInterval(() => {
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    }, 6500);
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));

  /* ---------- Gallery video lightbox ---------- */
  const lightbox = document.getElementById('video-lightbox');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxClose = document.getElementById('lightbox-close');

  document.querySelectorAll('.gallery-video-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      lightboxVideo.src = btn.dataset.video;
      lightbox.classList.remove('hidden');
      lightbox.classList.add('flex');
      lightboxVideo.play();
    });
  });

  function closeLightbox() {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
    });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('shadow-md', window.scrollY > 12);
    });
  }
});
