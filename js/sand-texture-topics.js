// sand-texture-topics.js —— 石英砂肌理畫課程頁「適合的圖案」主題切換，
// 跟 js/custom-photo-topics.js 同一套 .custom-topics 元件（CSS 共用
// css/custom-photo-topics.css，不是另外做一份），只是這頁的主題換成
// 植物花卉／海邊／山景，照片一樣直接從學員作品資料庫（gallery-data.js）
// 抓對應主題、對應課程（石英砂肌理畫）的照片，不手動列清單。
(function () {
  const root = document.querySelector('.custom-topics');
  if (!root) return;
  const topics = [
    {
      key: 'botanical',
      label: '植物花卉',
      desc: '花卉類特別適合純肌理技法，花瓣的形狀剛好合刮刀或擠花袋操作的路徑。',
      detail: '',
      images: [],
    },
    {
      key: 'seaside',
      label: '海邊',
      desc: '海景也特別適合肌理技法，透過沙子跟顏料比例的調配，可以做出海沙特有的粗糙顆粒感，也能一層層堆疊出浪花拍打瞬間的立體起伏，不管是眼前看到的海，還是想像中的海，都能直接畫出來。',
      detail: '',
      images: [],
    },
    {
      key: 'mountain',
      label: '山景',
      desc: '雪山、富士山這類稜線明顯、色彩層次分明的山景，刮刀堆疊出來的立體感剛好對應山稜起伏的樣子。',
      detail: '',
      images: [],
    },
  ];
  const MAX_IMAGES_PER_TOPIC = 12;
  const TOPIC_THEME_MAP = {
    botanical: '植物花卉',
    seaside: '海邊',
    mountain: '山',
  };
  for (const [key, theme] of Object.entries(TOPIC_THEME_MAP)) {
    topics.find((t) => t.key === key).images = (window.GALLERY_ITEMS || [])
      .filter((item) => (item.course === '石英砂肌理畫' || (item.extraCourses || []).includes('石英砂肌理畫')) && item.themes.includes(theme))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, MAX_IMAGES_PER_TOPIC)
      .map((item) => ({ src: '../' + item.src, alt: item.alt, course: item.course, themes: item.themes, sessions: item.sessions }));
  }
  const nav = root.querySelector('.custom-topics__nav');
  const visual = root.querySelector('.custom-topics__visual');
  const strip = root.querySelector('.custom-topics__thumbs');
  const zoom = root.querySelector('.custom-topics__zoom');
  const stage = root.querySelector('.custom-topics__stage');
  let hero = zoom.querySelector('img');
  const loadStatus = document.createElement('p');
  loadStatus.className = 'custom-topics__load-status';
  loadStatus.setAttribute('role', 'status');
  stage.append(loadStatus);
  const sources = root.querySelector('.custom-topics__lightbox-source');
  let active, current = 0, touchX = 0, touchY = 0, suppressClick = false;
  function select(index) {
    if (!active.images.length) return;
    current = (index + active.images.length) % active.images.length;
    const item = active.images[current];
    const nextImage = new Image();
    nextImage.alt = item.alt;
    nextImage.style.visibility = 'hidden';
    nextImage.decoding = 'async';
    stage.setAttribute('aria-busy', 'true');
    zoom.disabled = true;
    loadStatus.hidden = false;
    loadStatus.textContent = '正在載入' + active.label + '作品…';
    nextImage.onload = async () => {
      try { await nextImage.decode(); } catch (_) { /* Loaded images can still be displayed. */ }
      if (hero !== nextImage) return;
      nextImage.style.visibility = 'visible';
      stage.setAttribute('aria-busy', 'false');
      zoom.disabled = false;
      loadStatus.hidden = true;
    };
    nextImage.onerror = () => {
      if (hero !== nextImage) return;
      stage.setAttribute('aria-busy', 'false');
      loadStatus.textContent = '圖片載入失敗，請切換其他作品或稍後再試。';
    };
    hero.replaceWith(nextImage);
    hero = nextImage;
    nextImage.src = item.src;
    [...strip.children].forEach((button, i) => button.setAttribute('aria-current', String(i === current)));
    const thumb = strip.children[current];
    strip.scrollTo({ left: thumb.offsetLeft - strip.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  function render(key) {
    active = topics.find((t) => t.key === key) || topics[0];
    current = 0;
    suppressClick = false;
    const placeholder = new Image();
    placeholder.alt = '';
    hero.replaceWith(placeholder);
    hero = placeholder;
    stage.setAttribute('aria-busy', 'false');
    loadStatus.hidden = true;
    nav.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.topic === active.key)));
    root.querySelector('h2').textContent = active.label;
    root.querySelector('.custom-topics__description').innerHTML = active.desc;
    root.querySelector('.custom-topics__detail').innerHTML = active.detail;
    visual.hidden = !active.images.length;
    root.querySelector('.custom-topics__empty').hidden = !!active.images.length;
    strip.replaceChildren(); sources.replaceChildren(); strip.scrollLeft = 0;
    active.images.forEach((item, i) => {
      const button = document.createElement('button');
      button.type = 'button'; button.setAttribute('aria-label', item.alt);
      const image = document.createElement('img'); image.src = item.src; image.alt = ''; image.loading = 'lazy';
      button.append(image); button.addEventListener('click', () => select(i)); strip.append(button);
      const figure = document.createElement('figure'); figure.className = 'gallery-grid__item';
      const source = document.createElement('img'); source.dataset.src = item.src; source.alt = item.alt; source.loading = 'lazy';
      // 2026-11-08 比照 js/custom-photo-topics.js 同樣的修正：補上
      // figcaption，放大看作品時才會顯示主題／完成堂數資訊。
      const caption = document.createElement('figcaption'); caption.className = 'gallery-grid__caption';
      caption.textContent = (item.course || '') +
        (item.themes && item.themes.length ? '・' + item.themes.join('、') : '') +
        (item.sessions ? '・' + (item.sessions === 1 ? '一堂完成' : item.sessions + '堂完成') : '');
      figure.append(source, caption); sources.append(figure);
    });
    select(0);
  }
  nav.addEventListener('click', (e) => { const button = e.target.closest('[data-topic]'); if (button) render(button.dataset.topic); });
  root.querySelector('.custom-topics__prev').addEventListener('click', () => select(current - 1));
  root.querySelector('.custom-topics__next').addEventListener('click', () => select(current + 1));
  zoom.addEventListener('click', () => {
    if (suppressClick || zoom.disabled) return;
    sources.querySelectorAll('img').forEach((image) => { image.src = image.dataset.src; });
    sources.children[current]?.click();
  });
  visual.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); select(current + (e.key === 'ArrowRight' ? 1 : -1)); } });
  zoom.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; touchY = e.changedTouches[0].clientY; }, { passive: true });
  zoom.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { suppressClick = true; select(current + (dx < 0 ? 1 : -1)); setTimeout(() => { suppressClick = false; }, 350); }
  }, { passive: true });
  render(location.hash.startsWith('#theme-') ? location.hash.slice(7) : 'botanical');
})();
