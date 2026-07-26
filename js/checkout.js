/* checkout.js —— 購物車頁「結帳」到「送出付款」的完整前端流程。官網本身是
   純靜態站，金流物流邏輯全部在另一個獨立部署的後端（risuan-checkout，
   Vercel Serverless Functions），這支檔案只負責串接：把購物車內容送過去給
   後端重新計價、建立訂單草稿，然後在同一個 cart.html 頁面往下展開「選送貨
   方式＋填收件資訊」，不再跳轉到另一個 checkout-confirm.html——購物車跟
   結帳確認以前是兩個頁面，跳轉感太重，合併成一頁比較順。

   超商取貨會整頁導去綠界電子地圖（這一步一定要離開網站，綠界規定不能用
   iframe 嵌入），選完店綠界會把瀏覽器導回這裡（網址帶著 ?orderId=xxx）；
   這支檔案在頁面載入時如果發現網址已經有 orderId，就直接跳過購物車編輯
   畫面、進到確認區塊，這樣不管是剛按下「結帳」還是從綠界地圖選店回來，
   走的都是同一段渲染邏輯。

   送貨方式的運費金額（65／130）只用來「即時顯示」小計＋運費的總金額，
   真正算錢、擋不合法金額的地方是後端 lib/products.js 的 shippingFeeFor()，
   這裡算錯也不影響最終收費是否正確，純粹是給客人看的預覽數字。 */

(function () {
  const CHECKOUT_API_BASE = "https://risuan-checkout.vercel.app";
  const SHIPPING_FEES = { cvs: 65, home: 130 };

  const cartEditView = document.getElementById("cart-edit-view");
  const confirmView = document.getElementById("order-confirm-view");
  if (!cartEditView || !confirmView) return; // 不是購物車頁，不用初始化

  const checkoutBtn = document.querySelector("[data-checkout-cta]");
  const checkoutErrorEl = document.querySelector(".checkout-error");

  const loadingEl = document.getElementById("confirm-loading");
  const errorEl = document.getElementById("confirm-error");
  const contentEl = document.getElementById("confirm-content");
  const form = document.getElementById("confirm-form");
  const customerSection = document.getElementById("customer-section");
  const backToCartBtn = document.getElementById("confirm-back-to-cart");

  const shippingPicker = document.getElementById("shipping-picker");
  const shippingCvsLink = document.getElementById("shipping-cvs-link");
  const shippingHomeBtn = document.getElementById("shipping-home-btn");
  const shippingCvsConfirmed = document.getElementById("shipping-cvs-confirmed");
  const shippingHomeConfirmed = document.getElementById("shipping-home-confirmed");
  const switchToHomeBtn = document.getElementById("switch-to-home");
  const switchToPickerBtn = document.getElementById("switch-to-picker");
  const homeAddressFields = document.getElementById("home-address-fields");
  const receiverZipcodeInput = document.getElementById("receiver-zipcode");
  const receiverAddressInput = document.getElementById("receiver-address");

  function formatMoney(n) {
    return `$${n.toLocaleString()}`;
  }

  function showCartEditView() {
    confirmView.hidden = true;
    cartEditView.hidden = false;
  }

  function showConfirmView() {
    cartEditView.hidden = true;
    confirmView.hidden = false;
  }

  function showConfirmError(message) {
    loadingEl.hidden = true;
    contentEl.hidden = true;
    errorEl.hidden = false;
    errorEl.querySelector("[data-placeholder]").textContent = message;
  }

  // 三種送貨方式 UI 狀態：picker（還沒選）／cvs（已選超商門市，來自綠界回傳）
  // ／home（客人在這頁自己選了宅配，填地址）。isHomeConfirmed 是本地狀態，
  // 不是從後端讀來的，因為宅配到府不用經過任何跳轉，選了就是選了。
  function renderShippingState(order, isHomeConfirmed) {
    const hasCvsStore = Boolean(order.cvsStore && order.cvsStore.CVSStoreID);
    let method = null;

    shippingPicker.hidden = true;
    shippingCvsConfirmed.hidden = true;
    shippingHomeConfirmed.hidden = true;
    homeAddressFields.hidden = true;
    receiverZipcodeInput.required = false;
    receiverAddressInput.required = false;

    if (hasCvsStore && !isHomeConfirmed) {
      method = "cvs";
      shippingCvsConfirmed.hidden = false;
      document.querySelector(".confirm-store").textContent =
        `${order.cvsStore.CVSStoreName}（${order.cvsStore.CVSAddress}）`;
    } else if (isHomeConfirmed) {
      method = "home";
      shippingHomeConfirmed.hidden = false;
      homeAddressFields.hidden = false;
      receiverZipcodeInput.required = true;
      receiverAddressInput.required = true;
    } else {
      shippingPicker.hidden = false;
    }

    customerSection.hidden = !method;
    if (method) {
      document.getElementById("confirm-shipping-method").value = method;
      const fee = SHIPPING_FEES[method];
      document.querySelector(".confirm-total").textContent = `小計 ${formatMoney(order.itemsTotal)}＋運費 ${formatMoney(
        fee
      )} ＝ 應付 ${formatMoney(order.itemsTotal + fee)}`;
    }
  }

  async function loadAndShowConfirm(orderId) {
    showConfirmView();
    loadingEl.hidden = false;
    errorEl.hidden = true;
    contentEl.hidden = true;

    let order;
    try {
      const res = await fetch(`${CHECKOUT_API_BASE}/api/order-status?orderId=${encodeURIComponent(orderId)}`);
      order = await res.json();
      if (!res.ok) throw new Error(order.error || "找不到這筆訂單");
    } catch (err) {
      showConfirmError(`讀取訂單失敗：${err.message}`);
      return;
    }

    const list = document.querySelector(".confirm-items");
    list.innerHTML = "";
    order.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "confirm-item";
      const addonText = item.addOns && item.addOns.length ? `　＋加購 ${item.addOns.length} 項` : "";
      li.innerHTML = `
        <span class="confirm-item__name">${item.name}${item.schemeName ? `・${item.schemeName}` : ""} × ${item.qty}${addonText}</span>
        <span class="confirm-item__price">${formatMoney(item.lineTotal)}</span>
      `;
      list.appendChild(li);
    });
    document.querySelector(".confirm-subtotal").textContent = `商品小計 ${formatMoney(order.itemsTotal)}`;

    document.getElementById("confirm-order-id").value = order.orderId;
    shippingCvsLink.href = `${CHECKOUT_API_BASE}/api/logistics-map?orderId=${encodeURIComponent(order.orderId)}`;
    form.action = `${CHECKOUT_API_BASE}/api/create-order`;

    let isHomeConfirmed = false;
    renderShippingState(order, isHomeConfirmed);

    shippingHomeBtn.addEventListener("click", () => {
      isHomeConfirmed = true;
      renderShippingState(order, isHomeConfirmed);
      receiverZipcodeInput.focus();
    });
    switchToHomeBtn.addEventListener("click", () => {
      isHomeConfirmed = true;
      renderShippingState(order, isHomeConfirmed);
      receiverZipcodeInput.focus();
    });
    switchToPickerBtn.addEventListener("click", () => {
      isHomeConfirmed = false;
      renderShippingState(order, isHomeConfirmed);
    });

    loadingEl.hidden = true;
    contentEl.hidden = false;
  }

  function initCartEditView() {
    if (!checkoutBtn || !window.RisuanCart) return;

    const originalLabel = checkoutBtn.textContent;

    function updateButtonState() {
      const hasItems = window.RisuanCart.readCart().length > 0;
      checkoutBtn.disabled = !hasItems;
    }

    function showCheckoutError(message) {
      if (!checkoutErrorEl) return;
      checkoutErrorEl.textContent = message;
      checkoutErrorEl.hidden = false;
    }

    function hideCheckoutError() {
      if (checkoutErrorEl) checkoutErrorEl.hidden = true;
    }

    checkoutBtn.addEventListener("click", async () => {
      const cartItems = window.RisuanCart.getCheckoutPayload();
      if (!cartItems.length) return;

      hideCheckoutError();
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "處理中…";

      try {
        const res = await fetch(`${CHECKOUT_API_BASE}/api/start-checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "建立訂單失敗，請稍後再試一次");

        history.pushState(null, "", `cart.html?orderId=${encodeURIComponent(data.orderId)}`);
        loadAndShowConfirm(data.orderId);
      } catch (err) {
        showCheckoutError(`結帳發生問題：${err.message}`);
        checkoutBtn.textContent = originalLabel;
        updateButtonState();
      }
    });

    updateButtonState();
    document.addEventListener("cart:updated", updateButtonState);
    window.addEventListener("storage", updateButtonState);
  }

  if (backToCartBtn) {
    backToCartBtn.addEventListener("click", () => {
      window.location.href = "cart.html";
    });
  }

  function init() {
    initCartEditView();
    const orderId = new URLSearchParams(window.location.search).get("orderId");
    if (orderId) {
      loadAndShowConfirm(orderId);
    } else {
      showCartEditView();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
