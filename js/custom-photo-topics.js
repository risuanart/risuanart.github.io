(function () {
  const root = document.querySelector('.custom-topics');
  if (!root) return;
  const topics = [
  {
    "key": "portrait",
    "label": "人像／合照／婚紗",
    "desc": "很適合當作送禮或自己留念的主題，尤其是婚紗、情侶合照。",
    "detail": "單堂大約三小時，會先用轉印紙輔助描繪構圖（約30分鐘），把大部分時間留給臉部、手、頭髮等主體重點的繪製（約1小時），再用剩下的時間依序完成天空、衣服、背景等其餘畫面（約40分鐘），最後留一段時間畫上黑線收尾，這個步驟最花心力，卻也是讓整幅畫完整起來最關鍵的一步。如果背景比較複雜、人數比較多，或想要畫面更完整細緻，通常會建議規劃兩堂以上。",
    "images": []
  },
  {
    "key": "landscape",
    "label": "風景",
    "desc": "是很多沒有畫畫經驗的人會選的入門主題，天空加上海或山景是新手很容易上手的組合，顏色可以自己調整成喜歡的樣子。有時候只是一棵樹的剪影，也能撐起一整幅畫面。",
    "detail": "單堂大約三小時可以完成，想畫更多細節的話時間也會拉長一些。",
    "images": []
  },
  {
    "key": "disney",
    "label": "迪士尼／皮克斯",
    "desc": "從熟悉的角色開始，挑一張自己喜歡的畫面，和老師一起評估構圖與難度，再用油畫筆觸完成屬於自己的版本。",
    "detail": "<a class=\"text-link\" href=\"../../guides/disney-pixar-reference-guide/\">迪士尼／皮克斯怎麼選圖？</a>",
    "images": []
  },
  {
    "key": "ghibli",
    "label": "吉卜力",
    "desc": "龍貓、神隱少女等角色都有同學畫過，場景可以保留代表性的色彩與輪廓，完成自己的畫面。",
    "detail": "<a class=\"text-link\" href=\"../../guides/ghibli-reference-guide/\">吉卜力怎麼選圖？</a>",
    "images": []
  },
  {
    "key": "characters",
    "label": "動漫／角色",
    "desc": "迪士尼、吉卜力這類角色也有不少同學畫過。",
    "detail": "想一堂課完成，建議挑比較平面、手繪風格的角色（像白雪公主、仙履奇緣、小美人魚這類2D公主）；畫面需要疊很多層次膚色來營造立體感的（像皮克斯、夢工廠風格），通常不只一堂才畫得完，適合想多花點心思細細畫完的同學。怎麼自己先判斷難易度，可以參考材料指南的<a class=\"text-link\" href=\"../../guides/disney-pixar-reference-guide/\">「迪士尼／皮克斯怎麼選圖？」</a>。龍貓、神隱少女這類吉卜力角色也有不少同學畫過，可以參考<a class=\"text-link\" href=\"../../guides/ghibli-reference-guide/\">「吉卜力怎麼選圖？」</a>。",
    "images": []
  },
  {
    "key": "seaside",
    "label": "海邊",
    "desc": "海跟天空的組合很好掌握，通常一堂課就能完成一幅有質感的作品。",
    "detail": "",
    "images": []
  },
  {
    "key": "marine",
    "label": "海洋生物",
    "desc": "鯨魚意外地也是新手很容易駕馭的題材，通常一堂課就能完成一幅有質感的作品。",
    "detail": "",
    "images": []
  },
  {
    "key": "botanical",
    "label": "植物花卉",
    "desc": "盆栽、花束、庭院造景都有同學畫過，顏色與筆觸的層次感是這個主題的重點，花有盛開的季節，枯枝、落葉一樣能入畫。",
    "detail": "挑選花瓣數量少、造型單純的花會比較好上手，一次抓一到三朵會比一大束容易，臨摹別人畫好的作品也會比直接照片來得簡單一些。",
    "images": []
  },
  {
    "key": "night-sky",
    "label": "星空",
    "desc": "效果簡單又好看，很適合完全沒有畫畫經驗、想先嘗試看看的同學。",
    "detail": "星星的數量、亮度都可以自己調整。",
    "images": []
  },
  {
    "key": "animals",
    "label": "其他動物",
    "desc": "除了家裡養的毛孩，其他喜歡的動物、甚至想像中的動物也都可以畫。",
    "detail": "可以是寫實的一根一根筆觸，也可以搭配刮刀做出比較抽象的質感，背景搭配星空也是常見的做法。",
    "images": []
  },
  {
    "key": "vehicles",
    "label": "車子",
    "desc": "跑車、機車這類有金屬反光與線條感的題材，光影層次掌握好，會特別有質感。",
    "detail": "",
    "images": []
  }
];
  // 2026-11-07 使用者要求每個主題改成直接從學員作品資料庫（gallery-data.js）
  // 抓對應主題的照片，不要再手動列清單（之前手動列的清單數量不一、
  // 也沒跟著新增的學員作品同步更新）。每個主題上限 12 張，照拍攝日期
  // 新到舊排序，展示最新完成的作品；只抓真的歸在這堂課底下的作品，
  // 不會混到寵物油畫等其他課程的同主題標籤。
  const MAX_IMAGES_PER_TOPIC = 12;
  const TOPIC_THEME_MAP = {
    portrait: '人像',
    landscape: '風景',
    disney: '迪士尼／皮克斯',
    ghibli: '吉卜力',
    characters: '動漫／角色',
    seaside: '海邊',
    marine: '海洋生物',
    botanical: '植物花卉',
    'night-sky': '星空',
    animals: '其他動物',
    vehicles: '車子',
  };
  for (const [key, theme] of Object.entries(TOPIC_THEME_MAP)) {
    topics.find(t => t.key === key).images = (window.GALLERY_ITEMS || [])
      .filter(item => item.course === '自選主題油畫' && item.themes.includes(theme))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, MAX_IMAGES_PER_TOPIC)
      .map(item => ({src: '../' + item.src, alt: item.alt, course: item.course, themes: item.themes, sessions: item.sessions}));
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
    // A separate element per request prevents a late image from a previous
    // selection from showing under the newly selected topic's title.
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
    strip.scrollTo({left: thumb.offsetLeft - strip.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  function render(key) {
    active = topics.find(t => t.key === key) || topics[0];
    current = 0;
    suppressClick = false;
    // Invalidate pending load callbacks even when the next topic has no images.
    const placeholder = new Image();
    placeholder.alt = '';
    hero.replaceWith(placeholder);
    hero = placeholder;
    stage.setAttribute('aria-busy', 'false');
    loadStatus.hidden = true;
    nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.topic === active.key)));
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
      // 2026-11-08 使用者反映從課程頁的「可畫的主題」放大作品時沒有
      // 主題／完成堂數資訊，gallery.html 點放大卻有——補上跟
      // js/gallery.js 同一套 figcaption 格式，lightbox（js/gallery-lightbox.js）
      // 就會自動讀到並顯示，不用改 lightbox 本身。
      const caption = document.createElement('figcaption'); caption.className = 'gallery-grid__caption';
      caption.textContent = (item.course || '') +
        (item.themes && item.themes.length ? '・' + item.themes.join('、') : '') +
        (item.sessions ? '・' + (item.sessions === 1 ? '一堂完成' : item.sessions + '堂完成') : '');
      figure.append(source, caption); sources.append(figure);
    });
    select(0);
  }
  nav.addEventListener('click', e => { const button = e.target.closest('[data-topic]'); if (button) render(button.dataset.topic); });
  root.querySelector('.custom-topics__prev').addEventListener('click', () => select(current - 1));
  root.querySelector('.custom-topics__next').addEventListener('click', () => select(current + 1));
  zoom.addEventListener('click', () => {
    if (suppressClick || zoom.disabled) return;
    // Hidden lightbox entries need URLs only when opening the lightbox.
    sources.querySelectorAll('img').forEach(image => { image.src = image.dataset.src; });
    sources.children[current]?.click();
  });
  visual.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); select(current + (e.key === 'ArrowRight' ? 1 : -1)); } });
  zoom.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; touchY = e.changedTouches[0].clientY; }, {passive: true});
  zoom.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { suppressClick = true; select(current + (dx < 0 ? 1 : -1)); setTimeout(() => { suppressClick = false; }, 350); }
  }, {passive: true});
  render(location.hash.startsWith('#theme-') ? location.hash.slice(7) : 'disney');
})();
