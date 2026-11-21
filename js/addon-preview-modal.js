






















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
      '<p class="addon-modal__description" data-modal-description></p>' +
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
    let swipeStart = null;
    const media = el.querySelector('.addon-modal__media');
    media.addEventListener('touchstart', e => { swipeStart = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
    media.addEventListener('touchcancel', () => { swipeStart = null; }, { passive: true });
    media.addEventListener('touchend', e => {
      if (!swipeStart || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - swipeStart.x, dy = e.changedTouches[0].clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
      const chips = Array.from(el.querySelectorAll('.addon-modal__variant-chip'));
      if (chips.length > 1) {
        const index = chips.findIndex(chip => chip.classList.contains('is-active'));
        chips[(index + (dx < 0 ? 1 : -1) + chips.length) % chips.length].click();
      } else {
        const toggle = el.querySelector('[data-modal-preview-toggle]');
        if (toggle && !toggle.hidden) toggle.click();
      }
    }, { passive: true });
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




  function renderVariants(m, row, select, img, priceEl) {
    const wrap = m.querySelector("[data-modal-variants]");
    wrap.innerHTML = "";
    const showThumbnails = row.querySelector('[data-addon-select]')?.dataset.product === 'fluid-art-word-sticker';
    wrap.classList.toggle('addon-modal__variants--thumbnails', showThumbnails);
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
      if (showThumbnails && opt.dataset.thumb) {
        const thumb = document.createElement('img');
        thumb.src = opt.dataset.thumb; thumb.alt = ''; thumb.loading = 'lazy';
        const label = document.createElement('span'); label.textContent = opt.textContent;
        chip.append(thumb, label);
      } else {
        chip.textContent = opt.textContent;
      }
      chip.setAttribute("aria-pressed", opt.value === select.value ? "true" : "false");
      chip.classList.toggle("is-active", opt.value === select.value);
      chip.addEventListener("click", () => {
        select.value = opt.value;
        if (isProductSelect) {
          const description = m.querySelector('[data-modal-description]');
          description.textContent = (window.AddonProductInfo || {})[opt.value] || '';
          description.hidden = !description.textContent;
        }
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
    const description = m.querySelector('[data-modal-description]');
    description.textContent = (window.AddonProductInfo || {})[checkbox.dataset.product] || '';
    description.hidden = !description.textContent;







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
        freshToggle.textContent = showingMockup ? "顯示空框照 →" : "預覽放進相框的效果 →";
      });
    } else {
      modalPreviewToggle.hidden = true;
    }

    const select = row.querySelector("[data-addon-scheme], [data-addon-variant]");
    renderVariants(m, row, select, modalImg, modalPrice);
    modalImg.style.objectFit = '';
    if (checkbox.dataset.product === 'fluid-art-mini-canvas') {
      const wrap = m.querySelector('[data-modal-variants]');
      wrap.hidden = false;
      wrap.classList.add('addon-modal__variants--thumbnails');
      const base = new URL('../../assets/images/products/fluid-art-mini-canvas/', document.currentScript?.src || location.href);
      ['fluid-art-mini-canvas-main.jpg', 'lettering-detail-01.webp', 'lettering-detail-02.webp', 'lettering-detail-03.webp'].forEach((file, i) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'addon-modal__variant-chip';
        button.setAttribute('aria-label', i === 0 ? '套組內容照片' : '字貼質感照片' + i);
        const image = document.createElement('img'); image.src = new URL(file, base).href; image.alt = '';
        button.append(image);
        button.addEventListener('click', () => {
          modalImg.src = image.src; modalImg.alt = button.getAttribute('aria-label');
          wrap.querySelectorAll('button').forEach(item => { item.classList.toggle('is-active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
        });
        wrap.append(button);
        if (i === 1) button.click();
      });
    }


    m._resetQty();

    const addBtn = m.querySelector("[data-modal-add]");
    const addLabel = addBtn.querySelector(".work__cta-label");
    const addSvg = addBtn.querySelector("svg");
    const originalLabel = addLabel.textContent;



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

    if (row.querySelector('[data-addon-select]')?.dataset.product === 'fluid-art-mini-canvas') {
      thumb.querySelector('img').src = '../../assets/images/products/fluid-art-mini-canvas/lettering-detail-01.webp';
      thumb.querySelector('img').alt = '迷你畫布組金色字貼陽光下的閃光質感';
    }
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
