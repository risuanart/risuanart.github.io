/* checkout.js —— 購物車頁「結帳」按鈕的行為。官網本身是純靜態站，金流物流
   邏輯全部在另一個獨立部署的後端（risuan-checkout，Vercel Serverless
   Functions），這支檔案只負責：把購物車內容送過去給後端重新計價、建立
   訂單草稿，成功後把整頁導向官網自己的 checkout-confirm.html，選送貨方式
   （超商取貨／宅配到府）跟填收件資訊都在那頁處理，不歸這支檔案管。 */

(function () {
  const CHECKOUT_API_BASE = "https://risuan-checkout.vercel.app";

  function initCheckout() {
    const btn = document.querySelector("[data-checkout-cta]");
    if (!btn || !window.RisuanCart) return;

    const errorEl = document.querySelector(".checkout-error");
    const originalLabel = btn.textContent;

    function updateButtonState() {
      const hasItems = window.RisuanCart.readCart().length > 0;
      btn.disabled = !hasItems;
    }

    function showError(message) {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.hidden = false;
    }

    function hideError() {
      if (errorEl) errorEl.hidden = true;
    }

    btn.addEventListener("click", async () => {
      const cartItems = window.RisuanCart.getCheckoutPayload();
      if (!cartItems.length) return;

      hideError();
      btn.disabled = true;
      btn.textContent = "處理中…";

      try {
        const res = await fetch(`${CHECKOUT_API_BASE}/api/start-checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "建立訂單失敗，請稍後再試一次");

        window.location.href = `checkout-confirm.html?orderId=${encodeURIComponent(data.orderId)}`;
      } catch (err) {
        showError(`結帳發生問題：${err.message}`);
        btn.textContent = originalLabel;
        updateButtonState();
      }
    });

    updateButtonState();
    document.addEventListener("cart:updated", updateButtonState);
    window.addEventListener("storage", updateButtonState);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCheckout);
  } else {
    initCheckout();
  }
})();
