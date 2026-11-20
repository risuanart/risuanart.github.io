(function () {
  const QUOTE_API_BASE = "https://risuan-checkout.vercel.app";

  const form = document.getElementById("material-quote-form");
  if (!form) return;

  const sheet = document.getElementById("material-quote-sheet");
  const openTriggers = document.querySelectorAll("[data-material-quote-open]");
  const closeTriggers = sheet ? sheet.querySelectorAll("[data-material-quote-close]") : [];

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

  const errorEl = document.getElementById("material-quote-error");
  const submitBtn = document.getElementById("material-quote-submit");
  const successEl = document.getElementById("material-quote-success");

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.hidden = true;
  }

  function checkedValue(name) {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    const payload = {
      companyName: document.getElementById("material-quote-company").value.trim(),
      contactName: document.getElementById("material-quote-contact-name").value.trim(),
      email: document.getElementById("material-quote-email").value.trim(),
      useCase: checkedValue("materialQuoteUseCase"),
      quantity: Number(document.getElementById("material-quote-quantity").value),
      style: checkedValue("materialQuoteStyle"),
      productNote: document.getElementById("material-quote-product-note").value.trim(),
      otherNotes: document.getElementById("material-quote-other-notes").value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "送出中…";

    try {
      const res = await fetch(`${QUOTE_API_BASE}/api/course-booking?action=material-quote`, {
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
