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

  // 結帳後把整個購物車編輯區換成一條「確認訂單詳情＋金額」的橫條；
  // 還沒結帳前橫條是隱藏的（購物車本身就是主畫面）。
  const cartCollapseBar = document.querySelector(".cart-collapse");
  const cartCollapseTotal = cartCollapseBar.querySelector(".cart-collapse__total");
  function collapseCartEditView(total) {
    cartEditView.hidden = true;
    cartCollapseBar.hidden = false;
    cartCollapseTotal.textContent = formatMoney(total);
    headerOrderTotal.textContent = formatMoney(total);
    updateOrderDock();
  }
  function expandCartEditView() {
    cartEditView.hidden = false;
    cartCollapseBar.hidden = true;
    closeOrderSheet();
    updateOrderDock();
  }

  // 往下滑、上面那條「確認訂單詳情」橫條捲出畫面之後，把它併進頂部導覽：
  // 標題位置換成可點開訂單明細的按鈕，購物車圖示位置換成金額。判斷方式是
  // 直接比較橫條與頂部導覽的實際位置（兩者都用 getBoundingClientRect()
  // 量，不寫死高度）——橫條的下緣一旦被固定的頂部導覽蓋過去，就換頂部
  // 導覽接手顯示。
  const siteHeader = document.querySelector(".site-header");
  const headerOrderBtn = document.querySelector(".site-header__order");
  const headerOrderTotal = document.querySelector(".site-header__order-total");
  // .product-page 自己是捲動容器（overflow:auto），捲動事件不會冒泡到
  // window，要掛在它身上；沒有的話才退回監聽整個視窗。
  const scroller = document.querySelector(".product-page");

  function updateOrderDock() {
    if (!siteHeader || !headerOrderBtn) return;
    // 還沒結帳（橫條本身是隱藏的）就不該有這個狀態。
    if (cartCollapseBar.hidden) {
      siteHeader.classList.remove("is-order-docked");
      headerOrderBtn.hidden = true;
      headerOrderTotal.hidden = true;
      return;
    }
    const docked = cartCollapseBar.getBoundingClientRect().bottom < siteHeader.getBoundingClientRect().bottom;
    siteHeader.classList.toggle("is-order-docked", docked);
    headerOrderBtn.hidden = !docked;
    headerOrderTotal.hidden = !docked;
  }

  (scroller || window).addEventListener("scroll", updateOrderDock, { passive: true });
  window.addEventListener("resize", updateOrderDock);

  // ---------- 訂單明細面板（從畫面下方滑出）----------
  // 刻意不做成就地展開：就地展開會把下面正在填的表單整個推走，關掉之後
  // 還要再滑回原本的位置。面板是 position:fixed 蓋在上面，開關全程都不
  // 動底下的捲動位置，關掉就回到原本填到一半的地方。
  const orderSheet = document.querySelector(".order-sheet");
  const orderSheetItems = orderSheet.querySelector(".order-sheet__items");
  const orderSheetSubtotal = orderSheet.querySelector("[data-sheet-subtotal]");
  const orderSheetShipping = orderSheet.querySelector("[data-sheet-shipping]");
  const orderSheetGrand = orderSheet.querySelector("[data-sheet-grand]");

  // 縮圖只有前端的商品資料（cart.js 的 SCHEME_IMAGES）才有，後端回傳的
  // 品項沒有；用「品名＋規格名」把後端品項對回本機購物車那一筆，拿得到
  // 就畫縮圖，拿不到就退回沒有縮圖的排版，不會整個壞掉。
  function localCartLookup() {
    const map = new Map();
    if (!window.RisuanCart) return map;
    const { readCart, PRODUCTS, SCHEME_NAMES } = window.RisuanCart;
    readCart().forEach((item) => {
      const product = PRODUCTS[item.productKey];
      const key = `${product ? product.name : item.productKey}|${SCHEME_NAMES[item.scheme] || ""}`;
      map.set(key, item);
    });
    return map;
  }

  function renderOrderSheet(order, method) {
    const lookup = localCartLookup();
    orderSheetItems.innerHTML = "";
    order.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "order-sheet__item";
      const local = lookup.get(`${item.name}|${item.schemeName || ""}`);
      // 對不回本機那一筆時（理論上不會發生，品名／規格名都是從同一份資料
      // 送出去的），至少畫一個同尺寸的空方塊，數量圓標才有東西可以貼，
      // 不會變成孤零零一顆數字浮在旁邊。
      const thumb =
        local && window.RisuanCart
          ? window.RisuanCart.thumbHTML(local, "order-sheet__thumb")
          : `<div class="order-sheet__thumb order-sheet__thumb--empty" aria-hidden="true"></div>`;
      li.innerHTML = `
        <div class="order-sheet__thumb-wrap">
          ${thumb}
          <span class="order-sheet__qty">${item.qty}</span>
        </div>
        <div class="order-sheet__item-body">
          <p class="order-sheet__item-name">${item.name}</p>
          ${item.schemeName ? `<p class="order-sheet__item-variant">${item.schemeName}</p>` : ""}
        </div>
        <p class="order-sheet__item-price">${formatMoney(item.lineTotal)}</p>
      `;
      orderSheetItems.appendChild(li);
    });

    // 還沒選送貨方式就還不知道運費，那一行顯示「選擇後計算」而不是硬掛
    // 一個 $0，避免看起來像「這筆免運」。
    const fee = method ? SHIPPING_FEES[method] : null;
    orderSheetSubtotal.textContent = formatMoney(order.itemsTotal);
    orderSheetShipping.textContent = fee === null ? "選擇送貨方式後計算" : formatMoney(fee);
    orderSheetGrand.textContent = formatMoney(order.itemsTotal + (fee || 0));
  }

  function openOrderSheet() {
    if (!currentOrder) return;
    renderOrderSheet(currentOrder, currentShippingMethod);
    orderSheet.hidden = false;
    cartCollapseBar.setAttribute("aria-expanded", "true");
    if (headerOrderBtn) headerOrderBtn.setAttribute("aria-expanded", "true");
    orderSheet.querySelector(".order-sheet__close").focus();
  }

  function closeOrderSheet() {
    orderSheet.hidden = true;
    cartCollapseBar.setAttribute("aria-expanded", "false");
    if (headerOrderBtn) headerOrderBtn.setAttribute("aria-expanded", "false");
  }

  cartCollapseBar.addEventListener("click", openOrderSheet);
  if (headerOrderBtn) headerOrderBtn.addEventListener("click", openOrderSheet);
  orderSheet.querySelectorAll("[data-order-sheet-close]").forEach((el) => {
    el.addEventListener("click", closeOrderSheet);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !orderSheet.hidden) closeOrderSheet();
  });

  const loadingEl = document.getElementById("confirm-loading");
  const errorEl = document.getElementById("confirm-error");
  const contentEl = document.getElementById("confirm-content");
  const form = document.getElementById("confirm-form");
  const confirmPayEl = document.querySelector(".confirm-pay");
  const backToCartBtn = document.getElementById("confirm-back-to-cart");

  const shippingSection = document.getElementById("shipping-section");
  const shippingCvsLink = document.getElementById("shipping-cvs-link");
  const shippingHomeBtn = document.getElementById("shipping-home-btn");
  const confirmStoreEl = document.querySelector(".confirm-store");
  const receiverSection = document.getElementById("receiver-section");
  const homeAddressFields = document.getElementById("home-address-fields");
  const receiverZipcodeInput = document.getElementById("receiver-zipcode");

  // 縣市／鄉鎮市區改下拉選單，選了鄉鎮市區直接查表帶出郵遞區號（資料見
  // js/tw-postal-codes.js）；詳細地址維持自由輸入。送出時用
  // #confirm-receiver-address 這個隱藏欄位把「縣市＋鄉鎮市區＋詳細地址」
  // 合併成後端原本認得的單一 receiverAddress，不改後端契約——跟
  // syncCustomerName() 同一套模式。
  const receiverCountySelect = document.getElementById("receiver-county");
  const receiverDistrictSelect = document.getElementById("receiver-district");
  const receiverAddressDetailInput = document.getElementById("receiver-address-detail");
  const receiverAddressHidden = document.getElementById("confirm-receiver-address");

  if (window.TW_POSTAL_CODES) {
    Object.keys(window.TW_POSTAL_CODES).forEach((county) => {
      const opt = document.createElement("option");
      opt.value = county;
      opt.textContent = county;
      receiverCountySelect.appendChild(opt);
    });
  }

  function resetDistrictSelect(placeholder) {
    receiverDistrictSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholder;
    receiverDistrictSelect.appendChild(opt);
  }
  resetDistrictSelect("請先選縣市");

  function syncReceiverAddress() {
    receiverAddressHidden.value = `${receiverCountySelect.value}${receiverDistrictSelect.value}${receiverAddressDetailInput.value.trim()}`;
  }

  receiverCountySelect.addEventListener("change", () => {
    const county = receiverCountySelect.value;
    receiverZipcodeInput.value = "";
    if (!county || !window.TW_POSTAL_CODES) {
      receiverDistrictSelect.disabled = true;
      resetDistrictSelect("請先選縣市");
      syncReceiverAddress();
      return;
    }
    receiverDistrictSelect.disabled = false;
    resetDistrictSelect("請選擇");
    Object.keys(window.TW_POSTAL_CODES[county]).forEach((district) => {
      const opt = document.createElement("option");
      opt.value = district;
      opt.textContent = district;
      receiverDistrictSelect.appendChild(opt);
    });
    syncReceiverAddress();
  });

  receiverDistrictSelect.addEventListener("change", () => {
    const county = receiverCountySelect.value;
    const district = receiverDistrictSelect.value;
    receiverZipcodeInput.value =
      county && district && window.TW_POSTAL_CODES ? window.TW_POSTAL_CODES[county][district] || "" : "";
    syncReceiverAddress();
  });

  receiverAddressDetailInput.addEventListener("input", syncReceiverAddress);
  // 送出當下再保險同步一次——理由同 syncCustomerName()。
  form.addEventListener("submit", syncReceiverAddress);

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

  // 超商取貨限定：「自行取貨／委託他人代為取貨」比「與聯絡資訊一樣」更
  // 貼近取貨情境的說法，取代同一顆 checkbox 的呈現；宅配到府維持原本的
  // checkbox 說法。兩組控制項底層都只是在讀寫同一個 receiverSameCheckbox
  // 的勾選狀態，換算法完全共用 syncReceiverSameAsCustomer()，不用重寫
  // 一份唯讀／必填切換邏輯。
  const pickupModePicker = document.getElementById("pickup-mode-picker");
  const receiverSameRow = document.getElementById("receiver-same-row");
  const pickupModeSelf = document.getElementById("pickup-mode-self");
  const pickupModeOther = document.getElementById("pickup-mode-other");
  function syncPickupModeControls(method) {
    const isCvs = method === "cvs";
    pickupModePicker.hidden = !isCvs;
    receiverSameRow.hidden = isCvs;
  }
  // 超商取貨選「我會自行取貨」時，收件資料整區跳過（customerName／Phone／
  // Email 已經鏡射進 receiverName 等欄位一起送出，見
  // syncReceiverSameAsCustomer()，不用再讓客人填一次）；選「委託他人代為
  // 取貨」才出現「③收件資料」讓客人填別人的資料。宅配到府不受這個影響，
  // 一律都要收件資料（地址一定要問）。
  function updateReceiverSectionVisibility() {
    const skipForSelfPickup = currentShippingMethod === "cvs" && pickupModeSelf.checked;
    receiverSection.hidden = !currentShippingMethod || skipForSelfPickup;
  }
  pickupModeSelf.addEventListener("change", () => {
    receiverSameCheckbox.checked = true;
    syncReceiverSameAsCustomer();
    updateReceiverSectionVisibility();
  });
  pickupModeOther.addEventListener("change", () => {
    receiverSameCheckbox.checked = false;
    syncReceiverSameAsCustomer();
    updateReceiverSectionVisibility();
  });

  function formatMoney(n) {
    return `$${n.toLocaleString()}`;
  }

  function showCartEditView() {
    confirmView.hidden = true;
    expandCartEditView();
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
      confirmStoreEl.querySelector(".confirm-store__name").textContent = order.cvsStore.CVSStoreName;
      confirmStoreEl.querySelector(".confirm-store__address").textContent = order.cvsStore.CVSAddress;
    }

    homeAddressFields.hidden = method !== "home";
    // 郵遞區號是唯讀、自動帶出來的，不需要另外掛 required——選了縣市／
    // 鄉鎮市區自然就有值；反過來對一個唯讀欄位掛 required，瀏覽器跳出的
    // 「請填寫這個欄位」會指向一個使用者點不動的欄位，體驗很怪。真正要
    // 擋的是縣市／鄉鎮市區／詳細地址這三格。
    receiverCountySelect.required = method === "home";
    receiverDistrictSelect.required = method === "home";
    receiverAddressDetailInput.required = method === "home";

    syncPickupModeControls(method);
    currentShippingMethod = method;
    // 聯絡資訊不依賴送貨方式，一開始就能填，不用等選完送貨方式才出現
    // （customerSection 一直是可見的，不隨 method 切換）。收件資料要看
    // 送貨方式跟取貨方式才知道該不該出現（見
    // updateReceiverSectionVisibility()）；小計／送出按鈕沒有 method 就
    // 沒有運費可以算，不該讓人送出。
    updateReceiverSectionVisibility();
    confirmPayEl.hidden = !method;
    // 面板正開著的時候換送貨方式（例如點「宅配到府」），運費／總金額
    // 要立刻跟著更新，不能等下次重新打開才對。
    if (!orderSheet.hidden) renderOrderSheet(order, method);
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
  // 目前選中的送貨方式，給訂單明細面板算運費／總金額用（面板可能在客人
  // 還沒選送貨方式時就被點開，那時候是 null）。
  let currentShippingMethod = null;

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
    // 訂單已經建立起來了，購物車編輯區收合成一條橫條，把畫面讓給下面的
    // 送貨方式／收件資料；要回頭確認或修改內容，點那條橫條就會再展開。
    collapseCartEditView(order.itemsTotal);
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
    // 地址欄位現在從「選縣市」開始，不是打字，聚焦第一個要操作的欄位
    // 改成這顆下拉選單。
    receiverCountySelect.focus();
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
