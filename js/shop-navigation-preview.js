/* 商品分類與頁內跳轉試作，僅?preview=shop-navigation啟用。 */
(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('preview') !== 'shop-navigation') return;
  const groups = [
    { key: '', title: '全部商品', en: 'ALL PRODUCTS' },
    { key: 'sand-art', title: '砂畫材料包', en: 'SAND ART KITS' },
    { key: 'fluid-art', title: '流動畫材料包', en: 'FLUID ART KITS' },
    { key: 'colors', title: '色沙與裝飾', en: 'SAND & DECORATION' },
    { key: 'surfaces', title: '底板與字貼', en: 'BOARDS & STICKERS' },
    { key: 'tools', title: '工具與展示', en: 'TOOLS & DISPLAY' }
  ];
  const sets = {
    colors: ['sand-art-extra-color', 'sand-art-24color', 'sand-art-24color-bundle', 'sand-art-metallic', 'sand-art-metallic-trio'],
    surfaces: ['sand-art-baseboard', 'sand-art-baseboard-artist', 'fluid-art-blank-canvas', 'fluid-art-word-sticker', 'fluid-art-mini-canvas'],
    tools: ['sand-art-frame-15', 'sand-art-frame-20', 'sand-art-craft-knife', 'fluid-art-wall-clay']
  };
  const categoryFor = key => Object.keys(sets).find(group => sets[group].includes(key)) || (key.startsWith('fluid-art-') ? 'fluid-art' : 'sand-art');
  const selected = groups.find(g => g.key === params.get('category')) || groups[0];
  const shopHref = category => '../shop/?preview=shop-navigation' + (category ? '&category=' + category : '');
  window.ShopNavigationPreview = { groups, categoryFor, selected };
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '../../css/shop-navigation-preview.css'; document.head.append(css);
  function init() {
    const grid = document.getElementById('shop-grid');
    const nav = document.createElement('nav'); nav.className = 'shop-category-nav'; nav.setAttribute('aria-label', '商品分類');
    nav.innerHTML = groups.map(g => `<a href="${shopHref(g.key)}" ${g.key === (grid ? selected.key : 'sand-art') ? 'aria-current="true"' : ''}>${g.title}</a>`).join('');
    if (grid) {
      grid.before(nav);
      document.querySelector('[data-shop-title]').textContent = selected.title;
      document.querySelector('[data-shop-title-en]').textContent = selected.en;
      document.title = selected.title + '｜日宣繪畫室';
      document.querySelector('.chapter__intro').textContent = '從材料包到補充材料與工具，依照需要慢慢挑選。';
      nav.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } else {
      const header = document.querySelector('.work__intro'); if (!header) return;
      const wrap = document.createElement('div'); wrap.className = 'product-navigation-preview content-container';
      wrap.innerHTML = `<nav class="product-breadcrumb" aria-label="商品路徑"><a href="${shopHref('')}">全部商品</a><span aria-hidden="true">›</span><a href="${shopHref('sand-art')}">砂畫材料包</a><span aria-hidden="true">›</span><span aria-current="page">羊Diss・藍</span></nav>`;
      wrap.append(nav); header.before(wrap);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
