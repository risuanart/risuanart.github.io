/* account-page.js —— account/index.html 專屬的頁面控制器，只在這一頁
   載入。登入狀態讀寫、Google 登入按鈕渲染、地址拆解邏輯都是
   window.RisuanAccount（js/account-auth.js）提供的全站共用介面，這支
   檔案只負責「把這頁需要的四個區塊（基本資料／收件地址／訂單／課程
   預約）串起來」，不重複寫那幾支共用邏輯。 */

(function () {
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const ORDER_STATUS_LABEL = {
    draft: "尚未付款",
    paid: "已付款",
    payment_failed: "付款失敗",
    shipment_created: "已出貨",
  };

  function formatDate(iso) {
    if (!iso) return "";
    return iso.slice(0, 10);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const guestSection = document.getElementById("account-guest");
    const memberSection = document.getElementById("account-member");
    const googleBtnContainer = document.getElementById("account-page-google-btn");

    const profileForm = document.getElementById("account-profile-form");
    const lastNameInput = document.getElementById("account-last-name");
    const firstNameInput = document.getElementById("account-first-name");
    const emailInput = document.getElementById("account-email");
    const phoneInput = document.getElementById("account-phone");
    const countySelect = document.getElementById("account-county");
    const districtSelect = document.getElementById("account-district");
    const zipcodeInput = document.getElementById("account-zipcode");
    const addressDetailInput = document.getElementById("account-address-detail");
    const profileHint = document.getElementById("account-profile-hint");

    const orderListEl = document.getElementById("account-order-list");
    const bookingListEl = document.getElementById("account-booking-list");
    const pointsBalanceEl = document.getElementById("account-points-balance");
    const pointsListEl = document.getElementById("account-points-list");

    // ---------- 縣市／鄉鎮市區下拉選單（跟 js/checkout.js 結帳頁同一套
    // window.TW_POSTAL_CODES 資料來源，選單填充邏輯各自獨立一份——這塊
    // UI 互動本身很短，比起抽成共用函式、還要處理兩邊各自不同的 DOM id，
    // 維持各自一份更單純）。 ----------
    if (window.TW_POSTAL_CODES) {
      Object.keys(window.TW_POSTAL_CODES).forEach((county) => {
        const opt = document.createElement("option");
        opt.value = county;
        opt.textContent = county;
        countySelect.appendChild(opt);
      });
    }
    function resetDistrictSelect(placeholder) {
      districtSelect.innerHTML = "";
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = placeholder;
      districtSelect.appendChild(opt);
    }
    resetDistrictSelect("請先選縣市");
    countySelect.addEventListener("change", () => {
      const county = countySelect.value;
      zipcodeInput.value = "";
      if (!county || !window.TW_POSTAL_CODES) {
        districtSelect.disabled = true;
        resetDistrictSelect("請先選縣市");
        return;
      }
      districtSelect.disabled = false;
      resetDistrictSelect("請選擇");
      Object.keys(window.TW_POSTAL_CODES[county]).forEach((district) => {
        const opt = document.createElement("option");
        opt.value = district;
        opt.textContent = district;
        districtSelect.appendChild(opt);
      });
    });
    districtSelect.addEventListener("change", () => {
      const county = countySelect.value;
      const district = districtSelect.value;
      zipcodeInput.value = county && district && window.TW_POSTAL_CODES ? window.TW_POSTAL_CODES[county][district] || "" : "";
    });

    function fillAddress(homeAddress) {
      if (!homeAddress || !homeAddress.receiverAddress) return;
      const parsed = window.RisuanAccount.splitHomeAddress(homeAddress.receiverAddress);
      if (!parsed) return;
      countySelect.value = parsed.county;
      countySelect.dispatchEvent(new Event("change"));
      districtSelect.value = parsed.district;
      districtSelect.dispatchEvent(new Event("change"));
      addressDetailInput.value = parsed.detail;
    }

    // ---------- 基本資料表單 ----------
    function fillProfileForm(customer) {
      emailInput.value = customer.email;
      const contact = customer.lastContact;
      if (contact) {
        lastNameInput.value = contact.lastName || "";
        firstNameInput.value = contact.firstName || "";
        phoneInput.value = contact.phone || "";
      }
      fillAddress(customer.lastHomeAddress);
    }

    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      profileHint.hidden = true;
      const receiverAddress = countySelect.value && districtSelect.value
        ? `${countySelect.value}${districtSelect.value}${addressDetailInput.value.trim()}`
        : "";
      try {
        const data = await window.RisuanAccount.apiFetch("/api/account", {
          method: "POST",
          body: JSON.stringify({
            action: "update-profile",
            lastName: lastNameInput.value.trim(),
            firstName: firstNameInput.value.trim(),
            phone: phoneInput.value.trim(),
            receiverZipCode: zipcodeInput.value,
            receiverAddress,
          }),
        });
        fillProfileForm(data.customer);
        profileHint.textContent = "已儲存";
        profileHint.className = "account-page__save-hint is-ok";
        profileHint.hidden = false;
      } catch (err) {
        profileHint.textContent = err.message;
        profileHint.className = "account-page__save-hint is-error";
        profileHint.hidden = false;
      }
    });

    // ---------- 我的訂單 ----------
    async function loadOrders() {
      try {
        const data = await window.RisuanAccount.apiFetch("/api/account?action=orders");
        if (data.orders.length === 0) {
          orderListEl.innerHTML = `<li class="account-page__empty">目前沒有訂單紀錄</li>`;
          return;
        }
        orderListEl.innerHTML = data.orders
          .map(
            (o) => `
          <li class="account-order-item" data-order-id="${escapeHtml(o.orderId)}">
            <button type="button" class="account-order-item__summary">
              <span class="account-order-item__date">${escapeHtml(formatDate(o.createdAt))}</span>
              <span class="account-order-item__id">${escapeHtml(o.orderId)}</span>
              <span class="account-order-item__total">$${Number(o.total || 0).toLocaleString()}</span>
              <span class="account-order-item__status">${escapeHtml(ORDER_STATUS_LABEL[o.status] || o.status)}</span>
            </button>
            <div class="account-order-item__detail" hidden></div>
          </li>`
          )
          .join("");
      } catch (err) {
        orderListEl.innerHTML = `<li class="account-page__empty">訂單載入失敗：${escapeHtml(err.message)}</li>`;
      }
    }

    function renderOrderDetail(container, order) {
      const itemsHtml = (order.items || [])
        .map((i) => `<li>${escapeHtml(i.name)}${i.schemeName ? `（${escapeHtml(i.schemeName)}）` : ""} × ${i.qty}</li>`)
        .join("");
      const shipping = order.shippingMethod === "cvs" ? "超商取貨" : order.shippingMethod === "home" ? "宅配到府" : "尚未選擇";
      container.innerHTML = `
        <ul class="account-order-item__items">${itemsHtml}</ul>
        <p>送貨方式：${escapeHtml(shipping)}</p>
        ${order.shippingStatus ? `<p>物流狀態：${escapeHtml(order.shippingStatus)}</p>` : ""}
      `;
    }

    orderListEl.addEventListener("click", async (e) => {
      const btn = e.target.closest(".account-order-item__summary");
      if (!btn) return;
      const li = btn.closest(".account-order-item");
      const detail = li.querySelector(".account-order-item__detail");
      if (!detail.hidden) {
        detail.hidden = true;
        return;
      }
      if (!detail.dataset.loaded) {
        detail.innerHTML = "載入中…";
        detail.hidden = false;
        try {
          const data = await window.RisuanAccount.apiFetch(`/api/account?action=order-detail&orderId=${encodeURIComponent(li.dataset.orderId)}`);
          renderOrderDetail(detail, data.order);
          detail.dataset.loaded = "1";
        } catch (err) {
          detail.innerHTML = `明細載入失敗：${escapeHtml(err.message)}`;
        }
        return;
      }
      detail.hidden = false;
    });

    // ---------- 課程預約紀錄 ----------
    const BOOKING_STATUS_LABEL = { confirmed: "已確認", cancelled: "已取消" };
    async function loadBookings() {
      try {
        const data = await window.RisuanAccount.apiFetch("/api/account?action=bookings");
        if (data.bookings.length === 0) {
          bookingListEl.innerHTML = `<li class="account-page__empty">目前沒有課程預約紀錄</li>`;
          return;
        }
        bookingListEl.innerHTML = data.bookings
          .map(
            (b) => `
          <li class="account-booking-item">
            <span class="account-booking-item__date">${escapeHtml(b.date)} ${escapeHtml(b.time)}</span>
            <span class="account-booking-item__courses">${escapeHtml((b.courses || []).join("、"))}</span>
            <span class="account-booking-item__status">${escapeHtml(BOOKING_STATUS_LABEL[b.status] || b.status)}</span>
          </li>`
          )
          .join("");
      } catch (err) {
        bookingListEl.innerHTML = `<li class="account-page__empty">課程紀錄載入失敗：${escapeHtml(err.message)}</li>`;
      }
    }

    // ---------- 我的點數 ----------
    const POINTS_TYPE_LABEL = { signup: "新會員禮", earn: "購物回饋", redeem: "結帳折抵" };
    async function loadPoints() {
      try {
        const data = await window.RisuanAccount.apiFetch("/api/account?action=points");
        pointsBalanceEl.textContent = data.balance;
        if (data.ledger.length === 0) {
          pointsListEl.innerHTML = `<li class="account-page__empty">目前沒有點數異動紀錄</li>`;
          return;
        }
        pointsListEl.innerHTML = data.ledger
          .map((entry) => {
            const sign = entry.amount > 0 ? "+" : "";
            return `
          <li class="account-points-item">
            <span class="account-points-item__date">${escapeHtml(formatDate(entry.createdAt))}</span>
            <span class="account-points-item__type">${escapeHtml(POINTS_TYPE_LABEL[entry.type] || entry.type)}</span>
            <span class="account-points-item__amount">${sign}${entry.amount}</span>
          </li>`;
          })
          .join("");
      } catch (err) {
        pointsListEl.innerHTML = `<li class="account-page__empty">點數載入失敗：${escapeHtml(err.message)}</li>`;
      }
    }

    // ---------- 登入狀態切換 ----------
    function showGuest() {
      guestSection.hidden = false;
      memberSection.hidden = true;
      window.RisuanAccount.mountGoogleButton(googleBtnContainer);
    }

    function showMember(customer) {
      guestSection.hidden = true;
      memberSection.hidden = false;
      fillProfileForm(customer);
      loadOrders();
      loadBookings();
      loadPoints();
    }

    window.addEventListener(window.RisuanAccount.CHANGE_EVENT, () => {
      const customer = window.RisuanAccount.getCustomer();
      if (customer) showMember(customer);
      else showGuest();
    });

    const cached = window.RisuanAccount.getCustomer();
    if (cached) showMember(cached);
    else showGuest();
    window.RisuanAccount.syncProfile();
  });
})();
