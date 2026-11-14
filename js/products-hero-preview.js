/* 材料包預覽直接共用首頁CSS、HTML結構與輪播程式。 */
(() => {
  if (new URLSearchParams(location.search).get('preview') !== 'kit-hero') return;
  const items = [{"name": "春結", "video": "../assets/videos/products/sand-art-chun/full-demo.mp4", "poster": "../assets/images/products/sand-art-chun/sand-art-chun-demo-poster.jpg", "photo": "../assets/images/products/sand-art-chun/sand-art-chun-combo-1.png", "href": "sand-art-chun/", "tagline": "撕開、倒沙、鋪色，將春天的顏色與祝福，結成一幅手作春聯。"}, {"name": "福星", "video": "../assets/videos/products/sand-art-fu/full-demo.mp4", "poster": "../assets/images/products/sand-art-fu/sand-art-fu-demo-poster.jpg", "photo": "../assets/images/products/sand-art-fu/sand-art-fu-combo-1.png", "href": "sand-art-fu/", "tagline": "撕開、倒沙、鋪色，把喜歡的顏色填進福字，迎接新一年的好運。"}, {"name": "花財", "video": "../assets/videos/products/sand-art-cai/full-demo.mp4", "poster": "../assets/images/products/sand-art-cai/sand-art-cai-demo-poster.jpg", "photo": "../assets/images/products/sand-art-cai/sand-art-cai-combo-1.png", "href": "sand-art-cai/", "tagline": "撕開、倒沙、鋪色，讓花朵與色彩，陪你迎接新一年的好日子。"}, {"name": "格裡迎春", "video": "../assets/videos/products/sand-art-ying-chun/full-demo.mp4", "poster": "../assets/images/products/sand-art-ying-chun/sand-art-ying-chun-demo-poster.jpg", "photo": "../assets/images/products/sand-art-ying-chun/sand-art-ying-chun-combo-1.png", "href": "sand-art-ying-chun/", "tagline": "撕開、倒沙、鋪色，在格紋之間填上新年的顏色。"}, {"name": "格裡納福", "video": "../assets/videos/products/sand-art-na-fu/full-demo.mp4", "poster": "../assets/images/products/sand-art-na-fu/sand-art-na-fu-demo-poster.jpg", "photo": "../assets/images/products/sand-art-na-fu/sand-art-na-fu-combo-1.png", "href": "sand-art-na-fu/", "tagline": "撕開、倒沙、鋪色，把新年的祝福，一格一格拼起來。"}, {"name": "燈上迎春", "video": "../assets/videos/products/sand-art-ying-chun-lantern/full-demo.mp4", "poster": "../assets/images/products/sand-art-ying-chun-lantern/sand-art-ying-chun-lantern-demo-poster.jpg", "photo": "../assets/images/products/sand-art-ying-chun-lantern/sand-art-ying-chun-lantern-combo-1.png", "href": "sand-art-ying-chun-lantern/", "tagline": "撕開、倒沙、鋪色，為迎春燈籠添上自己喜歡的顏色。"}, {"name": "燈上納福", "video": "../assets/videos/products/sand-art-na-fu-lantern/full-demo.mp4", "poster": "../assets/images/products/sand-art-na-fu-lantern/sand-art-na-fu-lantern-demo-poster.jpg", "photo": "../assets/images/products/sand-art-na-fu-lantern/sand-art-na-fu-lantern-combo-1.png", "href": "sand-art-na-fu-lantern/", "tagline": "撕開、倒沙、鋪色，把新年的福氣，填進一盞彩色燈籠裡。"}, {"name": "羊Diss舞蹈／紅", "video": "../assets/videos/products/sand-art-artist-sheep-red/full-demo.mp4", "poster": "../assets/images/products/sand-art-artist/sand-art-artist-red-demo-poster.jpg", "photo": "../assets/images/products/sand-art-artist/sand-art-artist-red-main.jpg", "href": "sand-art-artist-sheep-red/", "tagline": "撕開、倒沙、細細鋪色，讓跳舞的羊群在指尖慢慢成形。"}, {"name": "羊Diss舞蹈／藍", "video": "../assets/videos/products/sand-art-artist-sheep-blue/full-demo.mp4", "poster": "../assets/images/products/sand-art-artist/sand-art-artist-blue-demo-poster.jpg", "photo": "../assets/images/products/sand-art-artist/sand-art-artist-blue-main.jpg", "href": "sand-art-artist-sheep-blue/", "tagline": "撕開、倒沙、細細鋪色，讓跳舞的羊群在指尖慢慢成形。"}, {"name": "春聯流動畫", "video": "../assets/videos/home/春聯流動畫.MP4", "poster": "../assets/images/products/fluid-art/fluid-art-light-main-red.jpg", "photo": "../assets/images/products/fluid-art/fluid-art-light-main-red.jpg", "href": "fluid-art-light-red/", "tagline": "單幅 15cm，最快抵達的新年儀式。<br>跟著簡易圖解，第一次嘗試也能安心完成。"}];
  const original = document.querySelector('.ent-hero');
  if (!original) return;
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '../css/home-shop.css?v=20261111-alternating-hero';
  document.head.append(css);
  document.documentElement.classList.add('kit-hero-frosted-nav');
  const navStyle = document.createElement('style');
  navStyle.textContent = `
    /* 在首頁同版輪播上增加直向空間，容納直式製作畫面。 */
    .kit-hero-frosted-nav .preview-hero { aspect-ratio: 9 / 16; }
    @media (min-width: 1025px) {
      .kit-hero-frosted-nav .preview-hero { aspect-ratio: 4 / 3; }
      .kit-hero-frosted-nav .preview-hero__companion {
        object-fit: contain;
        padding: 5%;
        box-sizing: border-box;
        background: var(--color-surface-light);
      }
    }
    /* 與home.css下滑後的導覽霧面效果相同，僅材料包輪播預覽提前啟用。 */
    .kit-hero-frosted-nav .site-header {
      background: color-mix(in srgb, var(--color-text-secondary) 20%, transparent);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
    }
    .kit-hero-frosted-nav .site-header:not(.is-scrolled)::before { display: none; }
    .kit-hero-frosted-nav .site-header:not(.is-scrolled) :is(.site-header__back, .site-header__title, .site-header__nav, .site-header__menu-toggle, .cart-badge-wrap, .account-badge-wrap, .cart-badge, .account-badge) { color: var(--color-text-primary); }
    .kit-hero-frosted-nav .site-header:not(.is-scrolled) .site-header__logo img { filter: none; }
  `;
  document.head.append(navStyle);

  const root = document.createElement('section'); root.className = 'preview-hero fade-in is-visible'; root.dataset.autoplay = '9000'; root.setAttribute('aria-label', '材料包精選輪播');
  root.innerHTML = `<div class="preview-hero__slides">${items.map((item, i) => `
    <div class="preview-hero__slide ${i ? '' : 'is-active'}" data-index="${i}">
      <video class="preview-hero__photo" src="${item.video}" poster="${item.poster}" muted loop playsinline preload="none" aria-label="${item.name}製作示範"></video>
      <img class="preview-hero__companion" src="${item.photo}" alt="${item.name}作品照片" loading="lazy">
      <a class="preview-hero__photo-link" href="${item.href}" aria-label="查看${item.name}材料包"></a>
      <div class="preview-hero__overlay">
        <a class="work__cta work__cta--primary" href="${item.href}">查看這款材料包</a>
      </div>
    </div>`).join('')}</div>
<button class="preview-hero__arrow preview-hero__arrow--prev" type="button" data-hero-direction="-1" aria-label="上一組輪播"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
<button class="preview-hero__arrow preview-hero__arrow--next" type="button" data-hero-direction="1" aria-label="下一組輪播"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
    <div class="preview-hero__dots" role="tablist" aria-label="輪播切換"></div>`;
  original.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('autoplay'); v.removeAttribute('src'); v.load(); });
  original.style.display = 'none'; original.before(root);
  // 首頁在fixed主容器，材料包在page-tint；依同一跑馬燈頂緣校正容器差。
  const alignTop = () => {
    const pad = parseFloat(getComputedStyle(root.parentElement).paddingTop) || 0;
    root.style.marginTop = `calc(var(--promo-bar-height) - ${pad}px)`;
  };
  css.addEventListener('load', alignTop); alignTop(); window.addEventListener('resize', alignTop);
  const init = document.createElement('script'); init.src = '../js/hero-slideshow.js'; document.body.append(init);
})();
