
(function () {
  const videos = Array.from(document.querySelectorAll('video[data-autoplay], video[autoplay]')).filter(video => !video.matches('[data-gallery-frame], [data-carousel-frame]') && !video.closest('.preview-hero, .gallery__frame'));
  const visible = new Set();
  function sync(video) {
    if (visible.has(video) && !document.hidden) { video.muted = true; video.play().catch(() => {}); }
    else video.pause();
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
    sync(entry.target);
  }), { threshold: 0.1 });
  const preloader = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (entry.target.preload === 'none') { entry.target.preload = 'auto'; entry.target.load(); }
    preloader.unobserve(entry.target);
  }), { root: document.querySelector('.product-page'), rootMargin: '300px 0px', threshold: 0 });
  videos.forEach(video => { video.addEventListener('loadeddata', () => sync(video)); observer.observe(video); preloader.observe(video); });
  function resume() { videos.forEach(sync); }
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('pageshow', resume);
})();
