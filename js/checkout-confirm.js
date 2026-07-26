/* checkout-confirm.js —— 結帳確認頁：讀網址上的 orderId，跟後端要回這筆
   訂單的品項／金額／已選門市（見 risuan-checkout/api/order-status.js），
   顯示出來給客人核對，填完姓名電話後，表單直接 POST 給後端的
   /api/create-order（真的 HTML form 送出，不是 fetch——送出後後端回傳的
   是「導向綠界付款頁」的自動送出表單，需要整頁跟著導航過去，用 fetch 拿
   到 HTML 字串反而沒辦法讓裡面的 <script> 自動執行）。 */

(function () {
  // TODO：跟 js/checkout.js 用同一個網址，換成 risuan-checkout 實際部署網址。
  const CHECKOUT_API_BASE = "https://risuan-checkout.vercel.app";

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");

  const loadingEl = document.getElementById("confirm-loading");
  const errorEl = document.getElementById("confirm-error");
  const contentEl = document.getElementById("confirm-content");
  const form = document.getElementById("confirm-form");

  function showError(message) {
    loadingEl.hidden = true;
    contentEl.hidden = true;
    errorEl.hidden = false;
    errorEl.querySelector("[data-placeholder]").textContent = message;
  }

  async function init() {
    if (!orderId) {
      showError("網址缺少訂單編號，請重新從購物車頁結帳。");
      return;
    }

    let data;
    try {
      const res = await fetch(`${CHECKOUT_API_BASE}/api/order-status?orderId=${encodeURIComponent(orderId)}`);
      data = await res.json();
      if (!res.ok) throw new Error(data.error || "找不到這筆訂單");
    } catch (err) {
      showError(`讀取訂單失敗：${err.message}`);
      return;
    }

    if (!data.cvsStore || !data.cvsStore.CVSStoreID) {
      showError("這筆訂單還沒選取貨門市，請重新從購物車頁結帳。");
      return;
    }

    const list = document.querySelector(".confirm-items");
    data.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "confirm-item";
      const addonText = item.addOns && item.addOns.length ? `　＋加購 ${item.addOns.length} 項` : "";
      li.innerHTML = `
        <span class="confirm-item__name">${item.name}${item.schemeName ? `・${item.schemeName}` : ""} × ${item.qty}${addonText}</span>
        <span class="confirm-item__price">$${item.lineTotal.toLocaleString()}</span>
      `;
      list.appendChild(li);
    });
    document.querySelector(".confirm-total").textContent = `小計 $${data.total.toLocaleString()}`;
    document.querySelector(".confirm-store").textContent =
      `${data.cvsStore.CVSStoreName}（${data.cvsStore.CVSAddress}）`;

    document.getElementById("confirm-order-id").value = data.orderId;
    form.action = `${CHECKOUT_API_BASE}/api/create-order`;

    loadingEl.hidden = true;
    contentEl.hidden = false;
  }

  init();
})();
