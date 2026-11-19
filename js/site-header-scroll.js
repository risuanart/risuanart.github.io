



(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;



  const promoBar = document.querySelector(".promo-bar");

  const scrollEl = document.querySelector(".product-page") || window;
  const getScrollTop = () =>
    scrollEl === window ? window.scrollY : scrollEl.scrollTop;

  const THRESHOLD = 4;

  function update() {
    const isScrolled = getScrollTop() > THRESHOLD;
    header.classList.toggle("is-scrolled", isScrolled);
    if (promoBar) promoBar.classList.toggle("is-scrolled", isScrolled);
  }

  scrollEl.addEventListener("scroll", update, { passive: true });
  update();





})();


(function () {
  const scroller = document.querySelector('.product-page') || window;
  const header = document.querySelector('.site-header');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'site-back-top';
  button.hidden = true;
  button.setAttribute('aria-label', '回到頁面頂端');
  button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4M5 11l7-7 7 7"/></svg>';
  const style = document.createElement('style');
  style.textContent = '.site-back-top{position:fixed;right:var(--space-6);bottom:calc(var(--space-6) + env(safe-area-inset-bottom,0px));z-index:24;width:36px;height:36px;display:grid;place-items:center;padding:0;border:0;border-radius:0;background:color-mix(in srgb,var(--color-surface-light) 16%,transparent);color:var(--color-surface-light);mix-blend-mode:difference;cursor:pointer}.site-back-top[hidden]{display:none}.site-back-top:focus-visible{outline:2px solid var(--color-brand);outline-offset:3px}body:has(dialog[open],.site-menu.is-open,.cart-sheet.is-open) .site-back-top{display:none}';
  document.head.appendChild(style);
  document.body.appendChild(button);
  const top = () => scroller === window ? window.scrollY : scroller.scrollTop;
  const update = () => { button.hidden = top() < 400; };
  function backTop() {
    scroller.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  button.addEventListener('click', backTop);
  scroller.addEventListener('scroll', update, {passive:true});
  if (header) header.addEventListener('click', event => {
    if (event.target.closest('a,button,input,select,textarea,[role="button"],nav')) return;
    backTop();
  });
  update();
})();
