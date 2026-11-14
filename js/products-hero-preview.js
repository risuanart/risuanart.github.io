/* 本機預覽：?preview=kit-hero；確認前不取代既有頁首。 */
(() => {
  if (new URLSearchParams(location.search).get('preview') !== 'kit-hero') return;
  const items = [{"name": "春結", "video": "../assets/videos/products/sand-art-chun/full-demo.mp4", "poster": "../assets/images/products/sand-art-chun/sand-art-chun-demo-poster.jpg", "photo": "../assets/images/products/sand-art-chun/sand-art-chun-combo-1.png", "href": "sand-art-chun/"}, {"name": "福星", "video": "../assets/videos/products/sand-art-fu/full-demo.mp4", "poster": "../assets/images/products/sand-art-fu/sand-art-fu-demo-poster.jpg", "photo": "../assets/images/products/sand-art-fu/sand-art-fu-combo-1.png", "href": "sand-art-fu/"}, {"name": "花財", "video": "../assets/videos/products/sand-art-cai/full-demo.mp4", "poster": "../assets/images/products/sand-art-cai/sand-art-cai-demo-poster.jpg", "photo": "../assets/images/products/sand-art-cai/sand-art-cai-combo-1.png", "href": "sand-art-cai/"}, {"name": "格裡迎春", "video": "../assets/videos/products/sand-art-ying-chun/full-demo.mp4", "poster": "../assets/images/products/sand-art-ying-chun/sand-art-ying-chun-demo-poster.jpg", "photo": "../assets/images/products/sand-art-ying-chun/sand-art-ying-chun-combo-1.png", "href": "sand-art-ying-chun/"}, {"name": "格裡納福", "video": "../assets/videos/products/sand-art-na-fu/full-demo.mp4", "poster": "../assets/images/products/sand-art-na-fu/sand-art-na-fu-demo-poster.jpg", "photo": "../assets/images/products/sand-art-na-fu/sand-art-na-fu-combo-1.png", "href": "sand-art-na-fu/"}, {"name": "燈上迎春", "video": "../assets/videos/products/sand-art-ying-chun-lantern/full-demo.mp4", "poster": "../assets/images/products/sand-art-ying-chun-lantern/sand-art-ying-chun-lantern-demo-poster.jpg", "photo": "../assets/images/products/sand-art-ying-chun-lantern/sand-art-ying-chun-lantern-combo-1.png", "href": "sand-art-ying-chun-lantern/"}, {"name": "燈上納福", "video": "../assets/videos/products/sand-art-na-fu-lantern/full-demo.mp4", "poster": "../assets/images/products/sand-art-na-fu-lantern/sand-art-na-fu-lantern-demo-poster.jpg", "photo": "../assets/images/products/sand-art-na-fu-lantern/sand-art-na-fu-lantern-combo-1.png", "href": "sand-art-na-fu-lantern/"}, {"name": "羊Diss舞蹈／紅", "video": "../assets/videos/products/sand-art-artist-sheep-red/full-demo.mp4", "poster": "../assets/images/products/sand-art-artist/sand-art-artist-red-demo-poster.jpg", "photo": "../assets/images/products/sand-art-artist/sand-art-artist-red-main.jpg", "href": "sand-art-artist-sheep-red/"}, {"name": "羊Diss舞蹈／藍", "video": "../assets/videos/products/sand-art-artist-sheep-blue/full-demo.mp4", "poster": "../assets/images/products/sand-art-artist/sand-art-artist-blue-demo-poster.jpg", "photo": "../assets/images/products/sand-art-artist/sand-art-artist-blue-main.jpg", "href": "sand-art-artist-sheep-blue/"}, {"name": "春聯流動畫", "video": "../assets/videos/home/春聯流動畫.MP4", "poster": "../assets/images/products/fluid-art/fluid-art-light-main-red.jpg", "photo": "../assets/images/products/fluid-art/fluid-art-light-main-red.jpg", "href": "fluid-art-light-red/"}];
  const original = document.querySelector('.ent-hero');
  if (!original) return;
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet'; sheet.href = '../css/products-hero-preview.css'; document.head.append(sheet);
  const root = document.createElement('section'); root.className = 'kit-hero-preview';
  root.setAttribute('aria-label', '材料包製作影片與作品輪播');
  root.innerHTML = `<div class="kit-hero-preview__frames">${items.map((item, i) => `
    <div class="kit-hero-preview__slide" ${i ? 'hidden' : ''}>
      <video muted loop playsinline preload="none" poster="${item.poster}" data-src="${item.video}" aria-label="${item.name}製作示範"></video>
      <img src="${item.photo}" alt="${item.name}作品照片" loading="lazy">
    </div>`).join('')}</div>
    <div class="kit-hero-preview__caption"><div><span class="kit-hero-preview__eyebrow">手作材料包</span><h2></h2></div><a>看看這款材料包</a></div>
    <div class="kit-hero-preview__nav"><button type="button" data-prev aria-label="上一款">←</button><span aria-live="polite"></span><button type="button" data-next aria-label="下一款">→</button><button type="button" data-pause aria-label="暫停自動輪播">暫停輪播</button></div>`;
  original.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('autoplay'); });
  original.hidden = true; original.style.display = 'none'; original.before(root);
  const slides = [...root.querySelectorAll('.kit-hero-preview__slide')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0, timer, visible = false, paused = reduce;
  const currentVideo = () => slides[index].querySelector('video');
  function schedule() { clearTimeout(timer); if (visible && !paused && !document.hidden) timer = setTimeout(() => show(index + 1), 9000); }
  function playback(manual = false) {
    const v = currentVideo();
    if (visible && !document.hidden && (!reduce || manual)) { if (!v.src) v.src = v.dataset.src; v.muted = true; v.play().catch(() => {}); }
    else v.pause();
    schedule();
  }
  function show(next, manual = false) {
    slides.forEach(s => { s.hidden = true; s.querySelector('video').pause(); });
    index = (next + items.length) % items.length; slides[index].hidden = false;
    root.querySelector('h2').textContent = items[index].name;
    const link = root.querySelector('.kit-hero-preview__caption a'); link.href = items[index].href;
    root.querySelector('.kit-hero-preview__nav span').textContent = `${String(index + 1).padStart(2, '0')} / ${items.length}`;
    playback(manual);
  }
  root.querySelector('[data-prev]').onclick = () => show(index - 1, true);
  root.querySelector('[data-next]').onclick = () => show(index + 1, true);
  const pause = root.querySelector('[data-pause]');
  pause.onclick = () => { paused = !paused; pause.textContent = paused ? '繼續輪播' : '暫停輪播'; pause.setAttribute('aria-label', paused ? '繼續自動輪播' : '暫停自動輪播'); schedule(); };
  if (paused) { pause.textContent = '繼續輪播'; pause.setAttribute('aria-label', '繼續自動輪播'); }
  let startX;
  root.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 60) show(index + (dx < 0 ? 1 : -1), true); }, { passive: true });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; playback(); }, { threshold: 0.2 }).observe(root);
  document.addEventListener('visibilitychange', () => playback());
  show(0);
})();
