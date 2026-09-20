// 企業課程頁的報價表單（enterprise/index.html #quote-form）。負責：
// ①活動形式／活動日期兩組單選切換對應欄位的顯示；②送出時組出後端
// action=quote 要的 JSON 格式；③錯誤／成功狀態顯示。欄位代碼（materials／
// budget／staffing／dateStatus／eventFormat 的 value）要跟 risuan-checkout
// 專案 api/course-booking.js 的 QUOTE_MATERIAL_LABELS 等對照表一致，
// 兩邊改動要一起改。
(function () {
  const QUOTE_API_BASE = "https://risuan-checkout.vercel.app";

  const form = document.getElementById("quote-form");
  if (!form) return; // 不是企業課程頁，不用初始化

  // 彈跳視窗開合，跟 cart.html 的 .order-sheet／checkout.js openOrderSheet()
  // 同一套邏輯（開啟時把焦點移到關閉鈕、Escape 可關、遮罩/關閉鈕都能關）。
  const sheet = document.getElementById("quote-sheet");
  const openTriggers = document.querySelectorAll("[data-quote-open]");
  const closeTriggers = sheet ? sheet.querySelectorAll("[data-quote-sheet-close]") : [];

  function openSheet() {
    if (!sheet) return;
    sheet.hidden = false;
    const closeBtn = sheet.querySelector(".quote-sheet__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeSheet() {
    if (!sheet) return;
    sheet.hidden = true;
  }

  openTriggers.forEach((btn) => btn.addEventListener("click", openSheet));
  closeTriggers.forEach((el) => el.addEventListener("click", closeSheet));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheet && !sheet.hidden) closeSheet();
  });

  const singleFields = document.getElementById("quote-single-fields");
  const multiFields = document.getElementById("quote-multi-fields");
  const dateConfirmedField = document.getElementById("quote-date-confirmed-field");
  const dateUnconfirmedField = document.getElementById("quote-date-unconfirmed-field");
  const errorEl = document.getElementById("quote-error");
  const submitBtn = document.getElementById("quote-submit");
  const successEl = document.getElementById("quote-success");

  const attendeeCountInput = document.getElementById("quote-attendee-count");
  const locationCountInput = document.getElementById("quote-location-count");
  const totalAttendeesInput = document.getElementById("quote-total-attendees");
  const eventDateInput = document.getElementById("quote-event-date");
  const eventMonthInput = document.getElementById("quote-event-month");

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.hidden = true;
  }

  // 活動形式：單一地點／多地點切換對應欄位。實測瀏覽器的表單驗證
  // （willValidate／checkValidity）不會因為祖先元素是 hidden／
  // display:none 就自動把裡面的 required 欄位排除在驗證之外——只有
  // 欄位「自己」被隱藏或 disabled 才算數，包一層 hidden 的外層 <div>
  // 沒有用。所以這裡切換 hidden 的同時，也要手動同步 required，不然
  // 使用者選了「多地點」，畫面上根本看不到的「單一地點・預計人數」
  // 欄位還是會擋住送出，卻沒有任何看得見的錯誤提示可以對照。
  function setEventFormat(isMulti) {
    singleFields.hidden = isMulti;
    multiFields.hidden = !isMulti;
    attendeeCountInput.required = !isMulti;
    locationCountInput.required = isMulti;
    totalAttendeesInput.required = isMulti;
  }

  form.querySelectorAll('input[name="eventFormat"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) setEventFormat(input.value === "multi");
    });
  });

  // 活動日期：已確定／尚未確定切換對應欄位，同上、一起同步 required。
  function setDateStatus(isConfirmed) {
    dateConfirmedField.hidden = !isConfirmed;
    dateUnconfirmedField.hidden = isConfirmed;
    eventDateInput.required = isConfirmed;
    eventMonthInput.required = !isConfirmed;
  }

  form.querySelectorAll('input[name="dateStatus"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) setDateStatus(input.value === "confirmed");
    });
  });

  function checkedValue(name) {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : "";
  }

  function checkedValues(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
  }

  function numberFieldValue(id) {
    const el = document.getElementById(id);
    const n = Number(el.value);
    return Number.isFinite(n) ? n : undefined;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    const eventFormat = checkedValue("eventFormat");
    const payload = {
      companyName: document.getElementById("quote-company").value.trim(),
      contactName: document.getElementById("quote-contact-name").value.trim(),
      email: document.getElementById("quote-email").value.trim(),
      eventFormat,
      materials: checkedValues("materials"),
      activityNote: document.getElementById("quote-activity-note").value.trim(),
      dateStatus: checkedValue("dateStatus"),
      eventDate: document.getElementById("quote-event-date").value,
      eventMonth: document.getElementById("quote-event-month").value.trim(),
      staffing: checkedValue("staffing"),
      budget: checkedValue("budget"),
      otherNotes: document.getElementById("quote-other-notes").value.trim(),
    };

    if (eventFormat === "single") {
      payload.attendeeCount = numberFieldValue("quote-attendee-count");
    } else {
      payload.locationCount = numberFieldValue("quote-location-count");
      payload.totalAttendees = numberFieldValue("quote-total-attendees");
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "送出中…";

    try {
      const res = await fetch(`${QUOTE_API_BASE}/api/course-booking?action=quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "送出失敗，請稍後再試一次");

      form.hidden = true;
      successEl.hidden = false;
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "送出報價需求";
    }
  });
})();
