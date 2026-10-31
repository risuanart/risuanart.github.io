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
    awaiting_payment: "待付款",
    paid: "已付款",
    payment_failed: "付款失敗",
    payment_expired: "繳費期限已過",
    cancelled: "已取消",
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
    const logoutButton = document.getElementById("account-page-logout");

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
    const pointsReservationEl = document.getElementById("account-points-reservation");
    const pointsListEl = document.getElementById("account-points-list");
    const cvsStoreEl = document.getElementById("account-cvs-store");
    const cvsLinkEl = document.getElementById("account-cvs-link");

    // ---------- 側邊欄分頁切換（參考 koyama.com.tw 會員後台，拿掉
    // 「變更密碼」——這個網站只有 Google 登入）。四個區塊同時只顯示
    // 一個，純粹是畫面顯示切換，各區塊的資料仍然在登入當下就一次全部
    // 載入（見 showMember()），不是切到哪個分頁才現載，資料量不大，
    // 不值得為此多一層「哪個分頁載入過了」的狀態管理。 ----------
    const navItems = document.querySelectorAll(".account-page__nav-item");
    navItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        navItems.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          if (b === btn) b.setAttribute("aria-current", "page");
          else b.removeAttribute("aria-current");
        });
        document.querySelectorAll(".account-page__pane").forEach((pane) => {
          pane.hidden = pane.id !== `account-pane-${btn.dataset.panel}`;
        });
      });
    });

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
      renderCvsStore(customer.lastCvsStore);
    }

    // 門市一定要透過綠界官方電子地圖選，這裡只是顯示目前設定的門市＋
    // 一個整頁導去選店的連結（跟結帳頁選店是同一套流程，見
    // risuan-checkout api/logistics-map.js 的 mode=profile 模式），不是
    // 表單欄位、不能用文字輸入。
    function renderCvsStore(cvsStore) {
      if (cvsStore && cvsStore.CVSStoreName) {
        cvsStoreEl.textContent = `${cvsStore.CVSStoreName}（${cvsStore.CVSAddress || ""}）`;
        cvsLinkEl.textContent = "更改門市";
      } else {
        cvsStoreEl.textContent = "尚未設定";
        cvsLinkEl.textContent = "選擇門市";
      }
      const token = window.RisuanAccount.getToken();
      cvsLinkEl.href = `${window.RisuanAccount.API_BASE}/api/logistics-map?mode=profile&token=${encodeURIComponent(token)}`;
    }

    // 「填完資料→按儲存→結果」這三個狀態要讓客人明顯感覺到有差異，不然
    // 使用者反映「儲存前後畫面長得幾乎一樣，會怕自己是不是誤按／沒存到」
    // ——不是只加一行小字，按鈕本身的文字也要跟著變，兩個地方一起給
    // 回饋（按鈕是手指剛剛按下去、視線還停留的地方；下面的提示文字是
    // 給已經移開視線、回頭確認結果用的，兩者互補，不是重複）。
    const saveBtn = profileForm.querySelector(".account-page__save-btn");
    const saveBtnDefaultText = saveBtn.textContent;
    let resetBtnTimer = null;

    // 使用者在「已儲存」還顯示著的時候又手動改了欄位，代表那個提示
    // 已經是舊的了（現在畫面上的內容跟剛剛存進去的不是同一份），要
    // 馬上藏起來，不然會誤以為「這次新改的也已經存了」。
    function clearStaleSaveHint() {
      if (!profileHint.hidden && profileHint.classList.contains("is-ok")) {
        profileHint.hidden = true;
      }
    }
    [lastNameInput, firstNameInput, phoneInput, countySelect, districtSelect, addressDetailInput].forEach((el) => {
      el.addEventListener("input", clearStaleSaveHint);
      el.addEventListener("change", clearStaleSaveHint);
    });

    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      profileHint.hidden = true;
      clearTimeout(resetBtnTimer);
      saveBtn.disabled = true;
      saveBtn.textContent = "儲存中…";
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
        saveBtn.textContent = "已儲存";
        // 按鈕文字停留一下讓人看到「已儲存」這個瞬間狀態，再變回原本的
        // 「儲存變更」——跟上面 .account-page__save-hint 的提示文字不同：
        // 按鈕這裡是要抓住「剛剛按下去」那個當下的注意力，提示文字是
        // 給之後回頭看的，兩個各司其職，故意都做、不是留一個就好。
        resetBtnTimer = setTimeout(() => {
          saveBtn.textContent = saveBtnDefaultText;
        }, 1600);
      } catch (err) {
        profileHint.textContent = err.message;
        profileHint.className = "account-page__save-hint is-error";
        profileHint.hidden = false;
        saveBtn.textContent = saveBtnDefaultText;
      } finally {
        saveBtn.disabled = false;
      }
    });

    // ---------- 我的訂單 ----------
    async function loadOrders() {
      try {
        const data = await window.RisuanAccount.apiFetch("/api/account?action=orders");
        // 後端只回傳已取得付款憑據或有付款結果的正式訂單；這個前端過濾
        // 是為了兼容部署期間可能仍存在的舊版草稿索引。
        const visibleOrders = data.orders.filter((order) => !["draft", "payment_attempt"].includes(order.status));
        if (visibleOrders.length === 0) {
          orderListEl.innerHTML = `<li class="account-page__empty">目前沒有訂單紀錄</li>`;
          return;
        }
        orderListEl.innerHTML = visibleOrders
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
      const paymentType = String(order.paymentType || "");
      const paymentLabel = paymentType.startsWith("ATM") ? "ATM 虛擬帳號" : paymentType.startsWith("CVS") ? "超商代碼" : paymentType.startsWith("BARCODE") ? "超商條碼" : "";
      const paymentValue = order.paymentNo
        ? `<p>${paymentLabel || "繳費資料"}：<strong>${escapeHtml(order.paymentNo)}</strong>${order.bankCode ? `（銀行代碼 ${escapeHtml(order.bankCode)}）` : ""}</p>`
        : Array.isArray(order.barcode) && order.barcode.length
          ? `<p>超商條碼：<strong>${order.barcode.map(escapeHtml).join(" ")}</strong></p>`
          : "";
      container.innerHTML = `
        <ul class="account-order-item__items">${itemsHtml}</ul>
        <p>送貨方式：${escapeHtml(shipping)}</p>
        ${order.status === "awaiting_payment" ? `<p>付款狀態：待付款${order.paymentExpireAt ? `，請於 ${escapeHtml(order.paymentExpireAt)} 前完成繳費` : ""}</p>${paymentValue}` : ""}
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

    // ---------- 課程預約紀錄（含自助改期／申請取消，2026-10-29 新增）----------
    // 第一階段做了這個已登入會員中心入口；第二階段（信件免登入連結，
    // booking-manage/ 頁面）畫面長得一模一樣，渲染邏輯已經抽成共用的
    // js/booking-detail-ui.js（window.BookingDetailUI），這支檔案跟
    // js/booking-manage.js 都載入同一份，不要再各自維護一份重複的
    // HTML 模板。
    const { bookingStatusText, renderBookingDetailStatic, renderBookingDetail } = window.BookingDetailUI;

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
          <li class="account-booking-item" data-booking-id="${escapeHtml(b.bookingId)}">
            <button type="button" class="account-booking-item__summary">
              <span class="account-booking-item__date">${escapeHtml(b.date)} ${escapeHtml(b.time)}</span>
              <span class="account-booking-item__courses">${escapeHtml((b.courses || []).join("、"))}</span>
              <span class="account-booking-item__status">${escapeHtml(bookingStatusText(b))}</span>
            </button>
            <div class="account-booking-item__detail" hidden></div>
          </li>`
          )
          .join("");
        // 摘要資料（status／cancelRequestedAt／rescheduleCount）直接存
        // 在對應的 <li> 元素上，點開展開明細時不用為了這幾個欄位再打
        // 一次 API，見下面點擊事件處理裡的 renderBookingDetailStatic()。
        bookingListEl.querySelectorAll(".account-booking-item").forEach((li, i) => {
          li.__bookingSummary = data.bookings[i];
        });
      } catch (err) {
        bookingListEl.innerHTML = `<li class="account-page__empty">課程紀錄載入失敗：${escapeHtml(err.message)}</li>`;
      }
    }


    bookingListEl.addEventListener("click", async (e) => {
      const summaryBtn = e.target.closest(".account-booking-item__summary");
      const rescheduleConfirmBtn = e.target.closest(".account-booking-item__reschedule-confirm");
      const cancelToggleBtn = e.target.closest(".account-booking-item__cancel-toggle");
      const cancelSubmitBtn = e.target.closest(".account-booking-item__cancel-submit");

      if (summaryBtn) {
        const li = summaryBtn.closest(".account-booking-item");
        const detail = li.querySelector(".account-booking-item__detail");
        if (!detail.hidden) {
          detail.hidden = true;
          return;
        }
        detail.hidden = false;
        if (detail.dataset.loaded) return;
        // 列表摘要資料（status／cancelRequestedAt）已經在 loadBookings()
        // 當下拿到了，先存在 li 的 dataset 上，不用為了這點資訊再多打
        // 一次 API——見 loadBookings() 裡 render 之後緊接著的賦值。
        const bookingId = li.dataset.bookingId;
        const summary = li.__bookingSummary;
        if (renderBookingDetailStatic(detail, summary)) {
          detail.dataset.loaded = "1";
          return;
        }
        detail.innerHTML = "載入中…";
        try {
          const data = await window.RisuanAccount.apiFetch(`/api/account?action=booking-reschedule-options&bookingId=${encodeURIComponent(bookingId)}`);
          renderBookingDetail(detail, summary, data);
          detail.dataset.loaded = "1";
        } catch (err) {
          detail.innerHTML = `<p class="account-booking-item__msg is-error">載入失敗：${escapeHtml(err.message)}</p>`;
        }
        return;
      }

      if (rescheduleConfirmBtn) {
        const li = rescheduleConfirmBtn.closest(".account-booking-item");
        const detail = li.querySelector(".account-booking-item__detail");
        const msgEl = detail.querySelector(".account-booking-item__msg");
        const picked = detail.querySelector("input[type=radio]:checked");
        if (!picked) return;
        rescheduleConfirmBtn.disabled = true;
        rescheduleConfirmBtn.textContent = "處理中…";
        try {
          const data = await window.RisuanAccount.apiFetch("/api/account", {
            method: "POST",
            body: JSON.stringify({ action: "booking-reschedule", bookingId: li.dataset.bookingId, newSlotId: picked.value }),
          });
          // 改期成功，這張卡片的狀態整個變了（日期／時段／是否還能再
          // 改），與其自己手動拼湊新畫面，重新整個列表最單純、最不會
          // 漏掉哪個欄位沒同步更新。
          await loadBookings();
        } catch (err) {
          msgEl.textContent = err.message;
          msgEl.className = "account-booking-item__msg is-error";
          msgEl.hidden = false;
          rescheduleConfirmBtn.disabled = false;
          rescheduleConfirmBtn.textContent = "確認改期";
        }
        return;
      }

      if (cancelToggleBtn) {
        const form = cancelToggleBtn.closest(".account-booking-item__detail").querySelector(".account-booking-item__cancel-form");
        form.hidden = !form.hidden;
        return;
      }

      if (cancelSubmitBtn) {
        const li = cancelSubmitBtn.closest(".account-booking-item");
        const detail = li.querySelector(".account-booking-item__detail");
        const note = detail.querySelector(".account-booking-item__cancel-note").value.trim();
        const msgEl = detail.querySelector(".account-booking-item__msg");
        cancelSubmitBtn.disabled = true;
        cancelSubmitBtn.textContent = "送出中…";
        try {
          await window.RisuanAccount.apiFetch("/api/account", {
            method: "POST",
            body: JSON.stringify({ action: "booking-cancel-request", bookingId: li.dataset.bookingId, note }),
          });
          await loadBookings();
        } catch (err) {
          msgEl.textContent = err.message;
          msgEl.className = "account-booking-item__msg is-error";
          msgEl.hidden = false;
          cancelSubmitBtn.disabled = false;
          cancelSubmitBtn.textContent = "送出取消申請";
        }
      }
    });

    // ---------- 我的點數 ----------
    const POINTS_TYPE_LABEL = { signup: "新會員禮", earn: "購物回饋", redeem: "結帳折抵" };
    async function loadPoints() {
      try {
        const data = await window.RisuanAccount.apiFetch("/api/account?action=points");
        pointsBalanceEl.textContent = data.balance;
        if (data.reservedPoints > 0) {
          pointsReservationEl.hidden = false;
          pointsReservationEl.textContent = `有 ${data.reservedPoints} 點正在付款流程中暫留，尚未扣除；付款完成後才會列入已使用。您目前可用 ${data.availableBalance} 點。`;
        } else {
          pointsReservationEl.hidden = true;
          pointsReservationEl.textContent = "";
        }
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

    logoutButton.addEventListener("click", () => window.RisuanAccount.logout());

    window.addEventListener(window.RisuanAccount.CHANGE_EVENT, () => {
      const customer = window.RisuanAccount.getCustomer();
      if (customer) showMember(customer);
      else showGuest();
    });

    const cached = window.RisuanAccount.getCustomer();
    if (cached) showMember(cached);
    else showGuest();
    window.RisuanAccount.syncProfile();

    // 選完預設門市後，risuan-checkout api/logistics-map-callback.js 會
    // 導回這頁、帶 ?storePicked=1，顯示一下成功提示，然後把這段查詢
    // 字串從網址列拿掉（history.replaceState），重新整理這頁不會一直
    // 顯示同一個提示。
    if (new URLSearchParams(location.search).get("storePicked") === "1") {
      document.getElementById("account-store-picked-banner").hidden = false;
      history.replaceState(null, "", location.pathname);
    }
  });
})();
