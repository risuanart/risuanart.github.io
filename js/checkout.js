





















(function () {
  const CHECKOUT_API_BASE = "https://risuan-checkout.vercel.app";
  const SHIPPING_FEES = { cvs: 65, home: 130 };
  const pointsInput = document.getElementById("points-to-redeem");
  const redeemAllPointsInput = document.getElementById("redeem-all-points");
  let availablePoints = 0;

  const cartEditView = document.getElementById("cart-edit-view");
  const confirmView = document.getElementById("order-confirm-view");
  if (!cartEditView || !confirmView) return;

  const checkoutBtn = document.querySelector("[data-checkout-cta]");
  const checkoutErrorEl = document.querySelector(".checkout-error");



  const cartCollapseBar = document.querySelector(".cart-collapse");
  const cartCollapseTotal = cartCollapseBar.querySelector(".cart-collapse__total");
  function maxRedeemablePoints(order, method) {
    if (!order) return availablePoints;
    return Math.max(0, Math.min(availablePoints, Math.floor(order.itemsTotal - 1)));
  }
  function appliedPoints(order, method) {
    if (!order || !pointsInput) return 0;
    const requested = Math.max(0, Math.floor(Number(pointsInput.value) || 0));
    return Math.min(requested, maxRedeemablePoints(order, method));
  }




  const FREE_SHIPPING_THRESHOLD = 1300;
  function renderFreeShipping(hint, netItemsTotal) {
    const remaining = FREE_SHIPPING_THRESHOLD - netItemsTotal;
    hint.textContent = remaining > 0
      ? `折抵後滿 ${formatMoney(FREE_SHIPPING_THRESHOLD)} 免運，目前還差 ${formatMoney(remaining)}。`
      : `已達 ${formatMoney(FREE_SHIPPING_THRESHOLD)} 免運門檻。`;
  }

  function shippingFee(order, method) {
    if (!method) return 0;
    return order.itemsTotal - appliedPoints(order, method) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEES[method];
  }
  function syncPointsLimit(order, method) {
    if (!pointsInput) return;
    const max = maxRedeemablePoints(order, method);
    pointsInput.max = String(max);
    if (redeemAllPointsInput?.checked) {
      pointsInput.value = String(max);
    } else if (pointsInput.value) {
      const requested = Math.max(0, Math.floor(Number(pointsInput.value) || 0));
      pointsInput.value = String(Math.min(requested, max));
    }
  }
  function updatePointsDiscountRow(order, method, row, amount) {
    const redeemed = appliedPoints(order, method);
    if (!row || redeemed <= 0) {
      if (row) row.hidden = true;
      return;
    }
    row.hidden = false;
    amount.textContent = `-${formatMoney(redeemed)}`;
  }
  function collapseCartEditView() {
    cartEditView.hidden = true;
    cartCollapseBar.hidden = false;
    updateOrderDock();
  }




  function updateCollapseBarTotal(order, method) {
    const fee = shippingFee(order, method);
    const total = formatMoney(order.itemsTotal + fee - appliedPoints(order, method));
    cartCollapseTotal.textContent = total;
    headerOrderTotal.textContent = total;
  }
  function renderDiscountRows(order, earlyBirdRow, couponRow) {
    const totalDiscount = order.discountAmount || 0;
    const coupon = Math.max(0, Math.min(order.thresholdDiscount || 0, totalDiscount));
    const earlyBird = totalDiscount - coupon;
    earlyBirdRow.hidden = earlyBird === 0;
    earlyBirdRow.querySelector("dt").textContent = coupon ? "早鳥預購優惠" : order.discountLabel;
    earlyBirdRow.querySelector("dd").textContent = earlyBird ? `-${formatMoney(earlyBird)}` : "";
    couponRow.hidden = coupon === 0;
    couponRow.querySelector("dd").textContent = coupon ? `-${formatMoney(coupon)}` : "";
  }

  function renderConfirmTotals(order, method) {
    const fee = shippingFee(order, method);
    const redeemed = appliedPoints(order, method);
    renderFreeShipping(document.getElementById("confirm-free-shipping"), order.itemsTotal - redeemed);
    document.getElementById("confirm-total-subtotal").textContent = formatMoney(order.originalItemsTotal ?? order.itemsTotal);
    renderDiscountRows(
      order,
      document.getElementById("confirm-total-discount-row"),
      document.getElementById("confirm-total-coupon-row")
    );
    document.getElementById("confirm-total-shipping").textContent = method ? formatMoney(fee) : "選擇送貨方式後計算";
    updatePointsDiscountRow(
      order,
      method,
      document.getElementById("confirm-total-points-row"),
      document.getElementById("confirm-total-points")
    );
    document.getElementById("confirm-total-grand").textContent = formatMoney(order.itemsTotal + fee - redeemed);
    updateCollapseBarTotal(order, method);
  }
  function expandCartEditView() {
    cartEditView.hidden = false;
    cartCollapseBar.hidden = true;
    closeOrderSheet();
    updateOrderDock();
  }






  const siteHeader = document.querySelector(".site-header");
  const headerOrderBtn = document.querySelector(".site-header__order");
  const headerOrderTotal = document.querySelector(".site-header__order-total");


  const scroller = document.querySelector(".product-page");

  function updateOrderDock() {
    if (!siteHeader || !headerOrderBtn) return;

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





  const orderSheet = document.querySelector(".order-sheet");
  const orderSheetItems = orderSheet.querySelector(".order-sheet__items");
  const orderSheetSubtotal = orderSheet.querySelector("[data-sheet-subtotal]");
  const orderSheetShipping = orderSheet.querySelector("[data-sheet-shipping]");
  const orderSheetGrand = orderSheet.querySelector("[data-sheet-grand]");
  const orderSheetDiscountRow = orderSheet.querySelector("[data-sheet-discount-row]");
  const orderSheetCouponRow = orderSheet.querySelector("[data-sheet-coupon-row]");
  const orderSheetPointsRow = orderSheet.querySelector("[data-sheet-points-row]");
  const orderSheetPoints = orderSheet.querySelector("[data-sheet-points]");


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
      const catalog = window.RisuanCart;
      const productKey = item.productKey || (catalog && Object.keys(catalog.PRODUCTS).find(key => catalog.PRODUCTS[key].name === item.name));
      const scheme = catalog && Object.keys(catalog.SCHEME_NAMES).find(key => catalog.SCHEME_NAMES[key] === item.schemeName);
      const thumbnailItem = productKey ? { productKey, scheme: (local && local.scheme) || scheme } : local;

      const thumb =
        thumbnailItem && window.RisuanCart
          ? window.RisuanCart.thumbHTML(thumbnailItem, "order-sheet__thumb")
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
        <p class="order-sheet__item-price price-text">${formatMoney(item.lineTotal)}</p>
      `;
      orderSheetItems.appendChild(li);
    });



    const fee = method ? shippingFee(order, method) : null;




    orderSheetSubtotal.textContent = formatMoney(order.originalItemsTotal ?? order.itemsTotal);
    renderDiscountRows(order, orderSheetDiscountRow, orderSheetCouponRow);
    orderSheetShipping.textContent = fee === null ? "選擇送貨方式後計算" : formatMoney(fee);
    const redeemed = appliedPoints(order, method);
    renderFreeShipping(orderSheet.querySelector("[data-sheet-free-shipping]"), order.itemsTotal - redeemed);
    updatePointsDiscountRow(order, method, orderSheetPointsRow, orderSheetPoints);
    orderSheetGrand.textContent = formatMoney(order.itemsTotal + (fee || 0) - redeemed);
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

  const customerSection = document.getElementById("customer-section");
  const shippingSection = document.getElementById("shipping-section");
  const shippingCvsLink = document.getElementById("shipping-cvs-link");
  const shippingHomeBtn = document.getElementById("shipping-home-btn");
  const confirmStoreEl = document.querySelector(".confirm-store");
  const receiverSection = document.getElementById("receiver-section");
  const homeAddressFields = document.getElementById("home-address-fields");
  const receiverZipcodeInput = document.getElementById("receiver-zipcode");






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

  form.addEventListener("submit", syncReceiverAddress);





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


  form.addEventListener("submit", syncCustomerName);


  const receiptWantedInput = document.getElementById("receipt-wanted");
  const receiptFields = document.getElementById("receipt-fields");
  const receiptTitleInput = document.getElementById("receipt-title");
  const receiptTaxIdInput = document.getElementById("receipt-tax-id");
  function syncReceiptFieldsVisibility() {
    receiptFields.hidden = !receiptWantedInput.checked;
  }
  receiptWantedInput.addEventListener("change", syncReceiptFieldsVisibility);
  syncReceiptFieldsVisibility();















  const marketingOptInInput = document.querySelector('[name="marketingOptIn"]');
  const DRAFT_STORAGE_KEY = "risuan-checkout-draft";



  const DRAFT_MAX_AGE_MS = 30 * 60 * 1000;
  const draftInputs = [
    customerFirstNameInput,
    customerLastNameInput,
    customerPhoneInput,
    customerEmailInput,
    marketingOptInInput,
    receiptWantedInput,
    receiptTitleInput,
    receiptTaxIdInput,
  ];

  function saveDraft() {
    const draft = { savedAt: Date.now() };
    draftInputs.forEach((el) => {
      draft[el.id || el.name] = el.type === "checkbox" ? el.checked : el.value;
    });
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (err) {


    }
  }

  function restoreDraft() {
    let draft;
    try {
      draft = JSON.parse(sessionStorage.getItem(DRAFT_STORAGE_KEY) || "null");
    } catch (err) {
      draft = null;
    }
    if (!draft) return;
    if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) {
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (err) {

      }
      return;
    }
    draftInputs.forEach((el) => {
      const key = el.id || el.name;
      if (!(key in draft)) return;
      if (el.type === "checkbox") {
        el.checked = draft[key];
      } else if (!el.value) {
        el.value = draft[key];
      }
    });
    syncCustomerName();


    syncReceiptFieldsVisibility();
  }

  draftInputs.forEach((el) => {
    el.addEventListener(el.type === "checkbox" ? "change" : "input", saveDraft);
  });
  restoreDraft();









  const customerTokenInput = document.getElementById("confirm-customer-token");
  function syncCustomerToken() {
    customerTokenInput.value = window.RisuanAccount ? window.RisuanAccount.getToken() || "" : "";
  }
  form.addEventListener("submit", syncCustomerToken);
  syncCustomerToken();

  function fillIfEmpty(el, value) {
    if (!el || !value || el.value) return;
    el.value = value;
    el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
  }

  if (window.RisuanAccount) {
    window.RisuanAccount.syncProfile().then((customer) => {
      if (!customer) return;
      document.getElementById("guest-points-hint").hidden = true;
      const contact = customer.lastContact;
      if (contact) {
        fillIfEmpty(customerLastNameInput, contact.lastName);
        fillIfEmpty(customerFirstNameInput, contact.firstName);
        fillIfEmpty(customerPhoneInput, contact.phone);
        fillIfEmpty(customerEmailInput, contact.email);
        syncCustomerName();
      }
      if (customer.lastShippingMethod === "home" && customer.lastHomeAddress) {
        const parsed = window.RisuanAccount.splitHomeAddress(customer.lastHomeAddress.receiverAddress);
        if (parsed) {
          fillIfEmpty(receiverCountySelect, parsed.county);
          fillIfEmpty(receiverDistrictSelect, parsed.district);
          fillIfEmpty(receiverAddressDetailInput, parsed.detail);
        }
      }




      availablePoints = Math.max(0, Math.floor(Number(customer.pointsBalance) || 0));
      const pointsSection = document.getElementById("points-redeem-section");
      if (customer.pointsReserved > 0) {
        document.getElementById("points-redeem-hint").textContent = `您目前有 ${availablePoints} 點可用；另有 ${customer.pointsReserved} 點正在付款流程中暫留，尚未扣除。`;
      } else {
        document.getElementById("points-redeem-hint").textContent = `您目前有 ${availablePoints} 點可以折抵`;
      }
      if (availablePoints > 0 || customer.pointsReserved > 0) {
        pointsSection.hidden = false;
        if (currentOrder && Number.isFinite(Number(currentOrder.pointsRedeemed))) {
          pointsInput.value = String(Math.max(0, Math.floor(Number(currentOrder.pointsRedeemed) || 0)));
          if (redeemAllPointsInput) redeemAllPointsInput.checked = false;
        }
        syncPointsLimit(currentOrder, currentShippingMethod);
        if (currentOrder) {
          renderConfirmTotals(currentOrder, currentShippingMethod);
          if (!orderSheet.hidden) renderOrderSheet(currentOrder, currentShippingMethod);
        }
      }
    });
  }

  if (pointsInput && redeemAllPointsInput) {
    pointsInput.addEventListener("input", () => {
      redeemAllPointsInput.checked = false;
      syncPointsLimit(currentOrder, currentShippingMethod);
      if (currentOrder) {
        renderConfirmTotals(currentOrder, currentShippingMethod);
        if (!orderSheet.hidden) renderOrderSheet(currentOrder, currentShippingMethod);
      }
    });
    redeemAllPointsInput.addEventListener("change", () => {
      if (redeemAllPointsInput.checked) {
        syncPointsLimit(currentOrder, currentShippingMethod);
      } else {
        pointsInput.value = "0";
      }
      if (currentOrder) {
        renderConfirmTotals(currentOrder, currentShippingMethod);
        if (!orderSheet.hidden) renderOrderSheet(currentOrder, currentShippingMethod);
      }
    });
  }





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








  function clearReceiverFields() {
    receiverNameInput.value = "";
    receiverPhoneInput.value = "";
    receiverEmailInput.value = "";
  }
  receiverSameCheckbox.addEventListener("change", () => {
    if (!receiverSameCheckbox.checked) clearReceiverFields();
    syncReceiverSameAsCustomer();
  });
  customerFirstNameInput.addEventListener("input", syncReceiverSameAsCustomer);
  customerLastNameInput.addEventListener("input", syncReceiverSameAsCustomer);
  customerPhoneInput.addEventListener("input", syncReceiverSameAsCustomer);
  customerEmailInput.addEventListener("input", syncReceiverSameAsCustomer);
  form.addEventListener("submit", syncReceiverSameAsCustomer);
  syncReceiverSameAsCustomer();






  const pickupModePicker = document.getElementById("pickup-mode-picker");
  const receiverSameRow = document.getElementById("receiver-same-row");
  const pickupModeSelf = document.getElementById("pickup-mode-self");
  const pickupModeOther = document.getElementById("pickup-mode-other");
  function syncPickupModeControls(method) {
    const isCvs = method === "cvs";
    pickupModePicker.hidden = !isCvs;
    receiverSameRow.hidden = isCvs;
  }





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
    clearReceiverFields();
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



      history.pushState(null, "", window.location.pathname);
    }
  }









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




    receiverCountySelect.required = method === "home";
    receiverDistrictSelect.required = method === "home";
    receiverAddressDetailInput.required = method === "home";

    syncPickupModeControls(method);
    currentShippingMethod = method;
    syncPointsLimit(order, method);





    updateReceiverSectionVisibility();
    confirmPayEl.hidden = !method;


    if (!orderSheet.hidden) renderOrderSheet(order, method);


    if (method) document.getElementById("confirm-shipping-method").value = method;
    renderConfirmTotals(order, method);
  }







  function readOrderAccess(id) {
    try { return sessionStorage.getItem('risuan-order-access:' + id) || ''; } catch { return ''; }
  }
  let currentOrder = null;
  let isHomeConfirmed = false;


  let currentShippingMethod = null;

  async function loadAndShowConfirm(orderId) {
    const wasHidden = showConfirmView();
    loadingEl.hidden = false;
    errorEl.hidden = true;
    contentEl.hidden = true;

    let order;
    try {



      const accessToken = readOrderAccess(orderId);
      const memberToken = window.RisuanAccount?.getToken();
      const res = await fetch(`${CHECKOUT_API_BASE}/api/account?orderId=${encodeURIComponent(orderId)}`, {
        cache: 'no-store', headers: { ...(accessToken ? { 'X-Order-Access': accessToken } : {}), ...(memberToken ? { Authorization: 'Bearer '+memberToken } : {}) },
      });
      order = await res.json();
      if (!res.ok) throw new Error(order.error || "找不到這筆訂單");
    } catch (err) {
      showConfirmError(`讀取訂單失敗：${err.message}`);
      if (wasHidden) confirmView.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const paymentComplete = document.getElementById("payment-complete");
    const isPaid = ["paid", "shipment_created"].includes(order.status);
    paymentComplete.hidden = !isPaid;
    form.hidden = isPaid;
    if (isPaid) {
      currentOrder = order;
      loadingEl.hidden = true;
      contentEl.hidden = false;
      collapseCartEditView();
      cartCollapseTotal.textContent = Number.isFinite(order.total) ? formatMoney(order.total) : '已完成付款';
      headerOrderTotal.textContent = cartCollapseTotal.textContent;
      paymentComplete.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (!Array.isArray(order.items)) {
      showConfirmError('這筆結帳連線已過期，請返回購物車重新結帳；已付款訂單可使用相同 Email 登入會員查看。');
      return;
    }
    document.getElementById('confirm-order-access').value = readOrderAccess(order.orderId);
    document.getElementById("confirm-order-id").value = order.orderId;
    shippingCvsLink.href = `${CHECKOUT_API_BASE}/api/logistics-map?orderId=${encodeURIComponent(order.orderId)}`;
    form.action = `${CHECKOUT_API_BASE}/api/create-order`;

    currentOrder = order;

    if (pointsInput && Number.isFinite(Number(order.pointsRedeemed))) {
      pointsInput.value = String(Math.max(0, Math.floor(Number(order.pointsRedeemed) || 0)));
      if (redeemAllPointsInput) redeemAllPointsInput.checked = false;
    }


    if (order.cvsStore && order.cvsStore.CVSStoreID) isHomeConfirmed = false;
    renderShippingState(currentOrder, isHomeConfirmed);

    loadingEl.hidden = true;
    contentEl.hidden = false;


    collapseCartEditView();






    if (wasHidden) customerSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }




  shippingHomeBtn.addEventListener("click", () => {
    isHomeConfirmed = true;
    renderShippingState(currentOrder, isHomeConfirmed);


    receiverCountySelect.focus();
  });



  shippingCvsLink.addEventListener("click", (event) => {
    event.preventDefault();
    if (!currentOrder) return;
    isHomeConfirmed = false;
    const mapForm = document.createElement('form'); mapForm.method = 'POST'; mapForm.action = CHECKOUT_API_BASE+'/api/logistics-map';
    const data = { orderId: currentOrder.orderId, orderAccessToken: readOrderAccess(currentOrder.orderId), customerToken: window.RisuanAccount?.getToken() || '' };
    Object.entries(data).forEach(([name,value]) => { const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;mapForm.appendChild(input); });
    document.body.appendChild(mapForm); mapForm.submit();
  });

  function showCheckoutError(message) {
    if (!checkoutErrorEl) return;
    checkoutErrorEl.textContent = message;
    checkoutErrorEl.hidden = false;
  }

  function hideCheckoutError() {
    if (checkoutErrorEl) checkoutErrorEl.hidden = true;
  }




  async function runCheckout() {
    if (!window.RisuanCart) return;
    const cartItems = window.RisuanCart.getCheckoutPayload();
    if (!cartItems.length) {


      showCartEditView();
      return;
    }

    hideCheckoutError();

    try {
      const res = await fetch(`${CHECKOUT_API_BASE}/api/start-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems, couponCode: document.querySelector(".cart-discount__input")?.value.trim() || "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "建立訂單失敗，請稍後再試一次");









      if (data.orderAccessToken) {
        try { sessionStorage.setItem('risuan-order-access:'+data.orderId,data.orderAccessToken); }
        catch { throw new Error('瀏覽器無法保存結帳連線，請允許此網站的儲存空間後重試。'); }
      }
      history.pushState(null, "", `${window.location.pathname}?orderId=${encodeURIComponent(data.orderId)}`);
      await loadAndShowConfirm(data.orderId);
    } catch (err) {
      showCheckoutError(`結帳發生問題：${err.message}`);
    }
  }


  const couponButton = document.querySelector(".cart-discount__apply");
  const couponInput = document.querySelector(".cart-discount__input");
  if (couponButton && couponInput) {
    couponButton.addEventListener("click", async () => {
      if (!couponInput.value.trim()) { showCheckoutError("請先輸入優惠碼"); return; }
      couponButton.disabled = true;
      try { await runCheckout(); } finally { couponButton.disabled = false; }
    });
    couponInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") { event.preventDefault(); couponButton.click(); }
    });
  }





  let resyncTimer = null;
  function scheduleResync() {
    if (confirmView.hidden) return;
    if (resyncTimer) clearTimeout(resyncTimer);
    resyncTimer = setTimeout(runCheckout, 400);
  }

  function initCartEditView() {
    if (!checkoutBtn || !window.RisuanCart) return;

    const freeShippingHint = document.getElementById("cart-free-shipping");
    function updateButtonState() {
      const hasItems = window.RisuanCart.readCart().length > 0;
      checkoutBtn.disabled = !hasItems;
      if (hasItems) renderFreeShipping(freeShippingHint, window.RisuanCart.cartTotal());
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


      window.location.href = window.location.pathname;
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
