/* checkout-confirm.js —— 結帳確認頁：讀網址上的 orderId，跟後端要回這筆
   訂單的品項／小計／（如果已經選過）門市，顯示出來給客人核對，讓客人選送貨
   方式（超商取貨／宅配到府），填完收件資訊後，表單直接 POST 給後端的
   /api/create-order（真的 HTML form 送出，不是 fetch——送出後後端回傳的
   是「導向綠界付款頁」的自動送出表單，需要整頁跟著導航過去，用 fetch 拿
   到 HTML 字串反而沒辦法讓裡面的 <script> 自動執行）。

   送貨方式的運費金額（65／130）只用來「即時顯示」小計＋運費的總金額，
   真正算錢、擋不合法金額的地方是後端 lib/products.js 的 shippingFeeFor()，
   這裡算錯也不影響最終收費是否正確，純粹是給客人看的預覽數字。 */

(function () {
  const CHECKOUT_API_BASE = "https://risuan-checkout.vercel.app";
  const SHIPPING_FEES = { cvs: 65, home: 130 };

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");

  const loadingEl = document.getElementById("confirm-loading");
  const errorEl = document.getElementById("confirm-error");
  const contentEl = document.getElementById("confirm-content");
  const form = document.getElementById("confirm-form");
  const customerSection = document.getElementById("customer-section");

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

  function showError(message) {
    loadingEl.hidden = true;
    contentEl.hidden = true;
    errorEl.hidden = false;
    errorEl.querySelector("[data-placeholder]").textContent = message;
  }

  function formatMoney(n) {
    return `$${n.toLocaleString()}`;
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

  async function init() {
    if (!orderId) {
      showError("網址缺少訂單編號，請重新從購物車頁結帳。");
      return;
    }

    let order;
    try {
      const res = await fetch(`${CHECKOUT_API_BASE}/api/order-status?orderId=${encodeURIComponent(orderId)}`);
      order = await res.json();
      if (!res.ok) throw new Error(order.error || "找不到這筆訂單");
    } catch (err) {
      showError(`讀取訂單失敗：${err.message}`);
      return;
    }

    const list = document.querySelector(".confirm-items");
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

  init();
})();
