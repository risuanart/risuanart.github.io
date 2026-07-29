/* checkout.js —— 購物車頁「結帳」到「送出付款」的完整前端流程。官網本身是
   純靜態站，金流物流邏輯全部在另一個獨立部署的後端（risuan-checkout，
   Vercel Serverless Functions），這支檔案只負責串接：把購物車內容送過去給
   後端重新計價、建立訂單草稿，然後在同一個 cart.html 頁面往下展開「選送貨
   方式＋填收件資訊」，不再跳轉到另一個 checkout-confirm.html——購物車跟
   結帳確認以前是兩個頁面，跳轉感太重，合併成一頁比較順。

   超商取貨會整頁導去綠界電子地圖（這一步一定要離開網站，綠界規定不能用
   iframe 嵌入），選完店綠界會把瀏覽器導回這裡（網址帶著 ?orderId=xxx）；
   這支檔案在頁面載入時如果發現網址已經有 orderId，就直接顯示確認區塊，
   這樣不管是剛按下「結帳」還是從綠界地圖選店回來，走的都是同一段渲染邏輯。

   按下「結帳」之後，購物車內容不會被藏起來——確認區塊是「加」在購物車
   下面，並且平滑捲動過去，讓客人清楚知道往上滑還在原本的購物車、可以
   繼續調整數量／刪除品項。如果客人真的在這個狀態下改了購物車，會重新
   呼叫一次 start-checkout 把訂單資料同步成最新的購物車內容（見
   scheduleResync()），不會讓客人改了數量、卻付到改之前的舊金額。

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

  const shippingSection = document.getElementById("shipping-section");
  const shippingCvsLink = document.getElementById("shipping-cvs-link");
  const shippingHomeBtn = document.getElementById("shipping-home-btn");
  const confirmStoreEl = document.querySelector(".confirm-store");
  const receiverSection = document.getElementById("receiver-section");
  const homeAddressFields = document.getElementById("home-address-fields");
  const receiverZipcodeInput = document.getElementById("receiver-zipcode");
  const receiverAddressInput = document.getElementById("receiver-address");

  // 姓名分成名字／姓氏兩格是純前端呈現，後端 create-order 只認得單一
  // customerName 欄位——這裡即時把兩格合併寫進送出用的隱藏欄位，
  // 不用改後端契約。中文姓名習慣姓在前、名在後（例如「王小明」），
  // 所以合併順序是姓氏＋名字。
  const customerFirstNameInput = document.getElementById("customer-first-name");
  const customerLastNameInput = document.getElementById("customer-last-name");
  const customerNameHidden = document.getElementById("confirm-customer-name");
  const customerPhoneInput = document.querySelector('[name="customerPhone"]');
  const customerEmailInput = document.querySelector('[name="customerEmail"]');
  function syncCustomerName() {
    customerNameHidden.value = `${customerLastNameInput.value.trim()}${customerFirstNameInput.value.trim()}`;
  }
  customerFirstNameInput.addEventListener("input", syncCustomerName);
  customerLastNameInput.addEventListener("input", syncCustomerName);
  // 送出當下再保險同步一次——瀏覽器自動填表在少數情況不會觸發 input
  // 事件，不能只靠打字時的即時同步。
  form.addEventListener("submit", syncCustomerName);

  // 收件資料勾選「與聯絡資訊一樣」（預設勾選——多數訂單本人自己收）：
  // 姓名／電話／Email 改唯讀，即時鏡射聯絡資訊剛剛填的資料。這裡故意用
  // readOnly 不是 disabled——disabled 的欄位送出表單時整個不會出現在
  // POST 內容裡，readOnly 的欄位還是會照常送出，後端才收得到值。
  const receiverSameCheckbox = document.getElementById("receiver-same-as-customer");
  const receiverNameInput = document.querySelector('[name="receiverName"]');
  const receiverPhoneInput = document.querySelector('[name="receiverPhone"]');
  const receiverEmailInput = document.querySelector('[name="receiverEmail"]');
  function syncReceiverSameAsCustomer() {
    const same = receiverSameCheckbox.checked;
    receiverNameInput.readOnly = same;
    receiverPhoneInput.readOnly = same;
    receiverEmailInput.readOnly = same;
    receiverNameInput.required = !same;
    receiverPhoneInput.required = !same;
    if (same) {
      receiverNameInput.value = customerNameHidden.value;
      receiverPhoneInput.value = customerPhoneInput.value;
      receiverEmailInput.value = customerEmailInput.value;
    }
  }
  receiverSameCheckbox.addEventListener("change", syncReceiverSameAsCustomer);
  customerFirstNameInput.addEventListener("input", syncReceiverSameAsCustomer);
  customerLastNameInput.addEventListener("input", syncReceiverSameAsCustomer);
  customerPhoneInput.addEventListener("input", syncReceiverSameAsCustomer);
  customerEmailInput.addEventListener("input", syncReceiverSameAsCustomer);
  form.addEventListener("submit", syncReceiverSameAsCustomer);
  syncReceiverSameAsCustomer();

  function formatMoney(n) {
    return `$${n.toLocaleString()}`;
  }

  function showCartEditView() {
    confirmView.hidden = true;
    if (new URLSearchParams(window.location.search).has("orderId")) {
      history.pushState(null, "", "cart.html");
    }
  }

  // 購物車內容維持顯示，確認區塊平滑捲動進來，讓客人知道自己還在同一頁、
  // 往上滑就是原本的購物車，不是被帶去了別的地方。只有「從隱藏變成顯示」
  // 的那一刻才捲動——之後客人在購物車那邊調整數量觸發 scheduleResync()
  // 重新整理確認區塊時，如果每次都硬把畫面捲回去，反而會打斷客人正在
  // 操作購物車的捲動位置。回傳 wasHidden 給呼叫端決定捲動時機，不在這裡
  // 立刻捲——這時候確認區塊裡還只有「正在載入訂單內容…」那一行 placeholder，
  // 真正的內容（送貨方式、收件資訊）都還沒渲染出來，現在捲只會捲到
  // placeholder 的位置，等內容載入完、整塊長高之後，畫面反而停在半山腰。
  function showConfirmView() {
    const wasHidden = confirmView.hidden;
    confirmView.hidden = false;
    return wasHidden;
  }

  function showConfirmError(message) {
    loadingEl.hidden = true;
    contentEl.hidden = true;
    errorEl.hidden = false;
    errorEl.querySelector("[data-placeholder]").textContent = message;
  }

  // 兩種送貨方式的按鈕常駐畫面（不像以前選完就整組隱藏、換成一行文字
  // 連結），這裡只切換 aria-pressed 標記哪一顆是目前選中的狀態。
  // cvs（已選超商門市，來自綠界回傳）／home（客人在這頁自己選了宅配，
  // 填地址）。isHomeConfirmed 是本地狀態，不是從後端讀來的，因為宅配到府
  // 不用經過任何跳轉，選了就是選了。
  function renderShippingState(order, isHomeConfirmed) {
    const hasCvsStore = Boolean(order.cvsStore && order.cvsStore.CVSStoreID);
    let method = null;
    if (hasCvsStore && !isHomeConfirmed) {
      method = "cvs";
    } else if (isHomeConfirmed) {
      method = "home";
    }

    shippingCvsLink.setAttribute("aria-pressed", method === "cvs" ? "true" : "false");
    shippingHomeBtn.setAttribute("aria-pressed", method === "home" ? "true" : "false");

    confirmStoreEl.hidden = method !== "cvs";
    if (method === "cvs") {
      confirmStoreEl.textContent = `${order.cvsStore.CVSStoreName}（${order.cvsStore.CVSAddress}）`;
    }

    homeAddressFields.hidden = method !== "home";
    receiverZipcodeInput.required = method === "home";
    receiverAddressInput.required = method === "home";

    customerSection.hidden = !method;
    receiverSection.hidden = !method;
    if (method) {
      document.getElementById("confirm-shipping-method").value = method;
      const fee = SHIPPING_FEES[method];
      document.querySelector(".confirm-total").textContent = `小計 ${formatMoney(order.itemsTotal)}＋運費 ${formatMoney(
        fee
      )} ＝ 應付 ${formatMoney(order.itemsTotal + fee)}`;
    }
  }

  // 目前顯示中的訂單／宅配是否已確認，給下面那組「只掛一次」的送貨方式
  // 按鈕監聽器讀取——loadAndShowConfirm 可能因為 scheduleResync() 被同一頁
  // 呼叫好幾次（客人結帳後又回頭調整購物車數量），如果每次都重新
  // addEventListener，同一顆按鈕會累積掛上一堆重複的監聽器，越用越怪。
  // 用這兩個模組層級的變數＋只掛一次的監聽器取代，各自呼叫時直接讀/寫
  // 最新狀態即可。
  let currentOrder = null;
  let isHomeConfirmed = false;

  async function loadAndShowConfirm(orderId) {
    const wasHidden = showConfirmView();
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
      if (wasHidden) confirmView.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const list = document.querySelector(".confirm-items");
    list.innerHTML = "";
    order.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "confirm-item";
      const addonText = item.addOns && item.addOns.length ? `　＋加購 ${item.addOns.length} 項` : "";
      li.innerHTML = `
        <span class="confirm-item__name">${item.name}${item.schemeName ? `・${item.schemeName}` : ""} <span class="confirm-item__qty">× ${item.qty}</span>${addonText}</span>
        <span class="confirm-item__price">${formatMoney(item.lineTotal)}</span>
      `;
      list.appendChild(li);
    });
    document.querySelector(".confirm-subtotal").textContent = `商品小計 ${formatMoney(order.itemsTotal)}`;
    // 收合區塊摺起來時，標題旁邊還是要看得到件數／小計，不用展開才知道
    // 訂單大概多少錢。
    const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("confirm-summary-meta").textContent = `${totalQty} 件・${formatMoney(order.itemsTotal)}`;

    document.getElementById("confirm-order-id").value = order.orderId;
    shippingCvsLink.href = `${CHECKOUT_API_BASE}/api/logistics-map?orderId=${encodeURIComponent(order.orderId)}`;
    form.action = `${CHECKOUT_API_BASE}/api/create-order`;

    currentOrder = order;
    // 訂單本身如果已經帶著選好的門市（例如剛從綠界地圖選店回來），沿用；
    // 否則維持客人原本選的是不是宅配，同步之後不用重新選一次送貨方式。
    if (order.cvsStore && order.cvsStore.CVSStoreID) isHomeConfirmed = false;
    renderShippingState(currentOrder, isHomeConfirmed);

    loadingEl.hidden = true;
    contentEl.hidden = false;
    // 內容整個渲染完成、高度定型之後才捲動，直接把「送貨方式」帶到畫面
    // 最上面（而不是整個 order-confirm-view 的頂端，那前面還有一段收合
    // 起來的「你選購的商品」）。
    if (wasHidden) shippingSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // 點「宅配到府」按鈕：不管目前是哪種狀態（還沒選／已選超商門市），
  // 都直接切換成宅配並展開地址欄位——按鈕本身就是唯一的切換入口，
  // 不需要另外一顆「改成宅配到府」的文字連結。
  shippingHomeBtn.addEventListener("click", () => {
    isHomeConfirmed = true;
    renderShippingState(currentOrder, isHomeConfirmed);
    receiverZipcodeInput.focus();
  });
  // 點「超商取貨」按鈕：本身是 <a href> 會直接導去綠界電子地圖重新選店，
  // 回來後 loadAndShowConfirm 會依訂單最新的 cvsStore 重新渲染，這裡只要
  // 把本機的「宅配已選」狀態清掉，讓渲染結果改回超商那一側。
  shippingCvsLink.addEventListener("click", () => {
    isHomeConfirmed = false;
  });

  function showCheckoutError(message) {
    if (!checkoutErrorEl) return;
    checkoutErrorEl.textContent = message;
    checkoutErrorEl.hidden = false;
  }

  function hideCheckoutError() {
    if (checkoutErrorEl) checkoutErrorEl.hidden = true;
  }

  // 建立／更新訂單草稿並顯示確認區塊。按「結帳」跟「購物車內容變動時自動
  // 同步」共用這支函式——不管哪個情境觸發，客人最後看到／要付的金額都一定
  // 是當下購物車真正的內容，不會有「畫面顯示的跟後端記錄的對不上」的情況。
  async function runCheckout() {
    if (!window.RisuanCart) return;
    const cartItems = window.RisuanCart.getCheckoutPayload();
    if (!cartItems.length) {
      // 客人在確認畫面還開著的時候把購物車清空了，這筆訂單已經沒有意義，
      // 收起確認區塊、回到（顯示「購物車是空的」的）購物車編輯畫面。
      showCartEditView();
      return;
    }

    hideCheckoutError();

    try {
      const res = await fetch(`${CHECKOUT_API_BASE}/api/start-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "建立訂單失敗，請稍後再試一次");

      history.pushState(null, "", `cart.html?orderId=${encodeURIComponent(data.orderId)}`);
      await loadAndShowConfirm(data.orderId);
    } catch (err) {
      showCheckoutError(`結帳發生問題：${err.message}`);
    }
  }

  // 購物車變動時（調整數量／刪除／換規格），如果確認區塊正開著，代表客人
  // 是在已經按過一次「結帳」之後才回頭改購物車——這裡要重新同步，不能讓
  // 客人改了數量卻付到舊金額。用小小的 debounce 避免連續按 +/- 按鈕時
  // 每一下都打一次後端。
  let resyncTimer = null;
  function scheduleResync() {
    if (confirmView.hidden) return;
    if (resyncTimer) clearTimeout(resyncTimer);
    resyncTimer = setTimeout(runCheckout, 400);
  }

  function initCartEditView() {
    if (!checkoutBtn || !window.RisuanCart) return;

    function updateButtonState() {
      const hasItems = window.RisuanCart.readCart().length > 0;
      checkoutBtn.disabled = !hasItems;
    }

    checkoutBtn.addEventListener("click", async () => {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "處理中…";
      await runCheckout();
      checkoutBtn.textContent = "結帳";
      updateButtonState();
    });

    updateButtonState();
    document.addEventListener("cart:updated", () => {
      updateButtonState();
      scheduleResync();
    });
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
