





(function () {
  const QUOTE_API_BASE = "https://risuan-checkout.vercel.app";

  const form = document.getElementById("quote-form");
  if (!form) return;



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
