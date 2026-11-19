

















(function () {
  const sticky = document.querySelector(".mobile-sticky-buy");
  const trigger = document.querySelector(".product-buy-bar") || document.querySelector(".work-heading__buy-row");
  if (!sticky || !trigger || !("IntersectionObserver" in window)) return;

  function update() {
    sticky.classList.toggle("is-visible", trigger.getBoundingClientRect().bottom < 0);
  }
  let scheduled = false;
  const scrollRoot = trigger.closest('.product-page') || window;
  scrollRoot.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  new IntersectionObserver(update, { threshold: 0 }).observe(trigger);
  update();
})();
