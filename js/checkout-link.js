/*
 * Meta（Instagram／Facebook 商店）結帳網址中繼頁
 * 網址格式：/checkout-link/?products=商品編號:數量,商品編號:數量&coupon=代碼
 * 商品編號就是 feeds/instagram-shop.csv 的 id 欄（等於 js/cart.js 的 PRODUCTS 鍵）。
 * - 一般商品：直接加入購物車，跳到購物車頁。
 * - 可選款式的商品：Meta 無法帶款式，改跳到該商品頁讓顧客自己選。
 * coupon 目前不處理（站內沒有對應的優惠碼機制）。
 */
(function () {
  const MAX_QTY = 20;
  const cart = window.RisuanCart;
  const msg = document.getElementById("checkout-link-msg");

  function go(url) {
    window.location.replace(url);
  }

  function parseProducts(search) {
    const raw = new URLSearchParams(search).get("products") || "";
    return raw
      .split(/[,;|]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, qtyText] = part.split(":");
        const qty = Math.min(MAX_QTY, Math.max(1, parseInt(qtyText, 10) || 1));
        return { key: key.trim(), qty };
      });
  }

  if (!cart || !cart.PRODUCTS) {
    go("../cart/");
    return;
  }

  const requested = parseProducts(window.location.search);
  const importable = [];
  let firstVariantUrl = null;

  requested.forEach(({ key, qty }) => {
    const product = cart.PRODUCTS[key];
    if (!product) return;
    const needsVariant = product.hasVariant || (cart.VARIANT_OPTIONS && cart.VARIANT_OPTIONS[key]);
    if (needsVariant) {
      if (!firstVariantUrl) firstVariantUrl = cart.PRODUCT_URLS && cart.PRODUCT_URLS[key];
      return;
    }
    importable.push({ key, qty });
  });

  if (importable.length > 0) {
    const importAndContinue = () => {
      cart.importMetaItems(importable);
      go("../cart/");
    };
    if (navigator.locks) {
      navigator.locks.request("risuan-meta-cart-import", importAndContinue);
    } else {
      importAndContinue();
    }
  } else if (firstVariantUrl) {
    if (msg) msg.textContent = "這個商品需要選擇款式，正在帶你前往商品頁⋯⋯";
    go(firstVariantUrl);
  } else {
    go("../");
  }
})();
