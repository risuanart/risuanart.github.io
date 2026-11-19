


















(function () {
  if (!window.RisuanCart) return;
  const { PRODUCTS, priceDiscountHTMLPlain, earlyBirdActive, EARLY_BIRD_TAGLINE } = window.RisuanCart;

  document.querySelectorAll(".work-heading__buy-row").forEach((row) => {
    const priceEl = row.querySelector(".work-heading__price");







    const addBtn =
      row.querySelector("[data-add-to-cart]") ||
      (row.dataset.product && document.querySelector(`[data-add-to-cart][data-product="${row.dataset.product}"]`));
    if (!priceEl || !addBtn) return;
    const product = PRODUCTS[addBtn.dataset.product];
    if (!product || !product.price) return;
    priceEl.innerHTML = priceDiscountHTMLPlain(product, 1);

    if (earlyBirdActive() && !product.noEarlyBird && !priceEl.dataset.discountTaglineInjected) {
      const tagline = document.createElement("p");
      tagline.className = "work-heading__discount-tagline";
      tagline.textContent = product.earlyBirdTagline || EARLY_BIRD_TAGLINE;
      priceEl.insertAdjacentElement("beforebegin", tagline);
      priceEl.dataset.discountTaglineInjected = "1";

      const header = row.closest(".work__intro");
      const photoWrap = header && header.querySelector(".work__gallery-main, .work__intro-photo");
      if (photoWrap && !photoWrap.querySelector(".discount-badge-corner")) {
        const badge = document.createElement("span");
        badge.className = "discount-badge-corner discount-badge-corner--standalone";
        badge.textContent = "SALE";
        photoWrap.appendChild(badge);
      }
    }







    if (product.preorder && window.RisuanCart.PREORDER_NOTE && !priceEl.dataset.preorderInjected) {
      const note = document.createElement("p");
      note.className = "work-heading__preorder";
      note.textContent = window.RisuanCart.PREORDER_NOTE;
      priceEl.insertAdjacentElement("afterend", note);
      priceEl.dataset.preorderInjected = "1";
    }
  });
})();
