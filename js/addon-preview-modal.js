/* addon-preview-modal.js —— 「一起加購」清單（.addon-section--orlo，
   見 css/products.css 同一處說明）裡任何一項，點縮圖就跳出大圖＋可
   直接加入購物車的預覽視窗，不限定哪個加購品、不需要每頁另外接線，
   通用機制：頁面上只要有 [data-addon-row] 結構（checkbox 型加購列），
   這支腳本就會自動幫它的縮圖掛上預覽視窗。

   2026-11-14 新增。視窗本身的「加入購物車」是完全獨立的動作，不經過
   js/cart.js 的 getSelectedAddons()／checkbox 勾選那條路——直接呼叫
   window.RisuanCart.addItem()，等同於客人自己去那個加購品的產品頁按
   下加入購物車，行為（飛入動畫／提示音／提示泡泡）完全一致，不用另外
   寫一套。這代表視窗加購跟勾選 checkbox 走主商品「加入購物車」按鈕是
   兩條互不影響的路徑，各自代表一次「加 1 份」的意圖，都勾選/都按過
   一次會各自算一次，不是衝突或重複扣款的 bug。

   款式支援（目前 3 個加購品：筆刀／像框／無痕黏土都沒有款式，這段對
   它們是 no-op）：如果加購列裡有 [data-addon-scheme]（固定商品鍵，只
   換縮圖，例如以前的漸層沙選色）或 [data-addon-variant]（換商品鍵，
   例如像框選尺寸）下拉選單，視窗會把選單的 <option> 轉成可點的款式
   按鈕，點了同步換視窗裡的大圖／價格／（如果是 data-addon-variant）
   要加購的商品鍵，同時把原本頁面上那顆下拉選單也設成同一個值並觸發
   change 事件——這樣視窗關掉之後，頁面上這一列的縮圖／勾選狀態跟視窗
   裡选的是同一顆，不會讓客人在視窗裡选了 A 色、關掉後頁面上卻還是
   顯示 B 色這種不同步的狀況。 */
(function () {
  const rows = Array.from(document.querySelectorAll("[data-addon-row]"));
  if (!rows.length) return;

  let modal = null;
  let lastFocusedTrigger = null;
  const MAX_QTY = 20;

  function buildModal() {
    const el = document.createElement("div");
    el.className = "addon-modal";
    el.hidden = true;
    el.innerHTML =
      '<div class="addon-modal__backdrop" data-addon-modal-close></div>' +
      '<div class="addon-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="addon-modal-title">' +
      '<button type="button" class="addon-modal__close" data-addon-modal-close aria-label="關閉">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "</button>" +
      '<div class="addon-modal__media"><img data-modal-img alt=""></div>' +
      '<div class="addon-modal__body">' +
      '<p class="addon-modal__title" id="addon-modal-title" data-modal-name></p>' +
      '<p class="addon-modal__price" data-modal-price></p>' +
      '<button type="button" class="addon-modal__link" data-modal-preview-toggle hidden></button>' +
      '<div class="addon-modal__variants" data-modal-variants hidden></div>' +
      '<div class="addon-modal__qty-row">' +
      '<div class="qty-stepper" data-modal-qty>' +
      '<button type="button" data-qty-minus aria-label="減少數量">−</button>' +
      '<span data-qty-value>1</span>' +
      '<button type="button" data-qty-plus aria-label="增加數量">＋</button>' +
      "</div>" +
      '<button type="button" class="work__cta work__cta--primary addon-modal__add" data-modal-add>' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>' +
      '<span class="work__cta-label">加入購物車</span>' +
      "</button>" +
      "</div>" +
      "</div>" +
      "</div>";
    document.body.appendChild(el);
    return el;
  }

  function getModal() {
    if (modal) return modal;
    modal = buildModal();

    const qtyValueEl = modal.querySelector("[data-modal-qty] [data-qty-value]");
    const qtyMinus = modal.querySelector("[data-modal-qty] [data-qty-minus]");
    const qtyPlus = modal.querySelector("[data-modal-qty] [data-qty-plus]");

    function setQty(qty) {
      qty = Math.max(1, Math.min(MAX_QTY, qty));
      qtyValueEl.textContent = qty;
      qtyMinus.disabled = qty <= 1;
      qtyPlus.disabled = qty >= MAX_QTY;
    }
    qtyMinus.addEventListener("click", () => setQty(parseInt(qtyValueEl.textContent, 10) - 1));
    qtyPlus.addEventListener("click", () => setQty(parseInt(qtyValueEl.textContent, 10) + 1));
    modal._resetQty = () => setQty(1);
    modal._getQty = () => parseInt(qtyValueEl.textContent, 10) || 1;

    modal.querySelectorAll("[data-addon-modal-close]").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    return modal;
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.documentElement.style.overflow = "";
    if (lastFocusedTrigger) lastFocusedTrigger.focus();
  }

  // 把 <select> 的 <option> 轉成視窗裡可點的款式按鈕；row 上原本的
  // 下拉選單同步更新＋觸發 change，讓 js/addon-variant-select.js
  // 既有的縮圖/價格同步邏輯也一起跑，不用在這裡重複寫一次。
  function renderVariants(m, row, select, img, priceEl) {
    const wrap = m.querySelector("[data-modal-variants]");
    wrap.innerHTML = "";
    if (!select) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    const isProductSelect = select.hasAttribute("data-addon-variant");
    Array.from(select.options).forEach((opt) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "addon-modal__variant-chip";
      chip.textContent = opt.textContent;
      chip.setAttribute("aria-pressed", opt.value === select.value ? "true" : "false");
      chip.classList.toggle("is-active", opt.value === select.value);
      chip.addEventListener("click", () => {
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        if (opt.dataset.thumb) img.src = opt.dataset.thumb;
        if (opt.dataset.price) priceEl.textContent = `$${Number(opt.dataset.price).toLocaleString()}`;
        wrap.querySelectorAll(".addon-modal__variant-chip").forEach((c) => {
          const active = c === chip;
          c.classList.toggle("is-active", active);
          c.setAttribute("aria-pressed", String(active));
        });
      });
      wrap.appendChild(chip);
    });
  }

  function openModal(row, trigger) {
    const m = getModal();
    const checkbox = row.querySelector("[data-addon-select]");
    const nameEl = row.querySelector(".addon-row__name");
    const priceEl = row.querySelector(".addon-row__price");
    const thumbImg = row.querySelector(".addon-row__thumb img");
    if (!checkbox || !nameEl || !priceEl || !thumbImg) return;

    const modalImg = m.querySelector("[data-modal-img]");
    const modalName = m.querySelector("[data-modal-name]");
    const modalPrice = m.querySelector("[data-modal-price]");

    modalImg.src = thumbImg.src;
    modalImg.alt = thumbImg.alt || nameEl.textContent;
    modalName.innerHTML = nameEl.innerHTML;
    modalPrice.textContent = priceEl.textContent;

    // 2026-11-14 新增：像框加購列本來就有「預覽放進像框的效果」這顆
    // 按鈕（js/addon-frame-preview-toggle.js），縮圖預設放空框照（避免
    // 客人誤會加購含作品），視窗則相反——使用者反映視窗應該直接秀出
    // 模擬放進去的效果，更直覺。這裡重用同一組 data-mockup-src／
    // data-plain-src，不重複存一份圖檔路徑。沒有這顆按鈕的加購列（筆刀／
    // 無痕黏土）不受影響，toggle 連結維持 hidden。
    const previewToggleBtn = row.querySelector("[data-addon-preview-toggle]");
    const modalPreviewToggle = m.querySelector("[data-modal-preview-toggle]");
    if (previewToggleBtn && previewToggleBtn.dataset.mockupSrc) {
      const mockupSrc = previewToggleBtn.dataset.mockupSrc;
      const mockupAlt = previewToggleBtn.dataset.mockupAlt || modalImg.alt;
      const plainSrc = previewToggleBtn.dataset.plainSrc || thumbImg.src;
      const plainAlt = previewToggleBtn.dataset.plainAlt || thumbImg.alt;
      modalImg.src = mockupSrc;
      modalImg.alt = mockupAlt;
      let showingMockup = true;
      modalPreviewToggle.hidden = false;
      modalPreviewToggle.textContent = "顯示空框照 →";
      const freshToggle = modalPreviewToggle.cloneNode(true);
      modalPreviewToggle.replaceWith(freshToggle);
      freshToggle.addEventListener("click", () => {
        showingMockup = !showingMockup;
        modalImg.src = showingMockup ? mockupSrc : plainSrc;
        modalImg.alt = showingMockup ? mockupAlt : plainAlt;
        freshToggle.textContent = showingMockup ? "顯示空框照 →" : "預覽放進像框的效果 →";
      });
    } else {
      modalPreviewToggle.hidden = true;
    }

    const select = row.querySelector("[data-addon-scheme], [data-addon-variant]");
    renderVariants(m, row, select, modalImg, modalPrice);

    m._resetQty();

    const addBtn = m.querySelector("[data-modal-add]");
    const addLabel = addBtn.querySelector(".work__cta-label");
    const addSvg = addBtn.querySelector("svg");
    const originalLabel = addLabel.textContent;
    // 用 cloneNode 重新綁定，避免同一顆按鈕累積上一次開視窗留下的
    // click listener（每次開視窗都呼叫 openModal，如果直接在既有
    // 按鈕上 addEventListener，不清掉舊的就會疊加，點一次加購 N 次）。
    const freshAddBtn = addBtn.cloneNode(true);
    addBtn.replaceWith(freshAddBtn);
    freshAddBtn.addEventListener("click", () => {
      const productKey = checkbox.dataset.product;
      const scheme = select ? select.value : "default";
      const qty = m._getQty();
      window.RisuanCart.addItem(productKey, scheme, qty);
      window.RisuanCart.playCartChime();
      window.RisuanCart.flyToCart(freshAddBtn.querySelector("svg"));
      const qtyDetail = qty > 1 ? `　×${qty}` : "";
      window.RisuanCart.showCartToast(`已加入：${nameEl.textContent}${qtyDetail}`);

      const label = freshAddBtn.querySelector(".work__cta-label");
      freshAddBtn.disabled = true;
      if (label) label.textContent = "已加入 ✓";
      setTimeout(() => {
        if (label) label.textContent = originalLabel;
        freshAddBtn.disabled = false;
      }, 1200);
    });

    lastFocusedTrigger = trigger;
    m.hidden = false;
    document.documentElement.style.overflow = "hidden";
    m.querySelector(".addon-modal__close").focus();
  }

  rows.forEach((row) => {
    const thumb = row.querySelector(".addon-row__thumb");
    const nameEl = row.querySelector(".addon-row__name");
    if (!thumb || !thumb.querySelector("img") || !nameEl) return;

    thumb.setAttribute("data-addon-preview-trigger", "");
    thumb.setAttribute("role", "button");
    thumb.setAttribute("tabindex", "0");
    thumb.setAttribute("aria-label", `放大檢視：${nameEl.textContent}`);

    thumb.addEventListener("click", () => openModal(row, thumb));
    thumb.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(row, thumb);
      }
    });
  });
})();
