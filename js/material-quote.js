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

  // 點擊選取款式與份數（2026-11-24新增）：每款最少10份、總數最少20份
  // 這條規則「每款≥10且總和=總數」本身就會自動限制最多能選幾款
  // （例如總數20份，最多只能選2款），不用另外寫一個「最多選幾款」的
  // 上限檢查——這是數學上的必然結果，不是巧合。
  const quantityInput = document.getElementById("material-quote-quantity");
  const styleRadios = form.querySelectorAll('input[name="materialQuoteStyle"]');
  const pickerField = document.getElementById("material-quote-style-picker-field");
  const limitHint = document.getElementById("material-quote-style-limit-hint");
  const styleGrid = document.getElementById("material-quote-style-grid");
  const styleOptions = styleGrid ? Array.prototype.slice.call(styleGrid.querySelectorAll(".material-quote-style-option")) : [];
  const summaryEl = document.getElementById("material-quote-style-summary");
  // 2026-11-24使用者確認拿掉「想採購的商品／款式」這個自由輸入框，
  // 現在只剩一個隱藏欄位給「指定款式」模式送出時組字串用；「需要客製
  // 構圖設計」改用下面的「其他需求」欄位描述，不再需要這個可見輸入框。
  const productNoteInput = document.getElementById("material-quote-product-note");

  function isPickMode() {
    return checkedValue("materialQuoteStyle") === "pick";
  }

  // 回傳目前勾選的款式明細，每筆 { key, name, price, qty }；qty 是
  // Number(輸入值) 或 NaN（還沒填/填了非數字）。
  function selectedStyles() {
    return styleOptions
      .filter((opt) => opt.querySelector(".material-quote-style-check").checked)
      .map((opt) => ({
        key: opt.dataset.key,
        name: opt.dataset.name,
        price: Number(opt.dataset.price),
        qty: Number(opt.querySelector(".material-quote-style-qty").value),
      }));
  }

  // 回傳null代表「目前不需要擋（不是pick模式，或根本還沒選任何款式）」；
  // 否則回傳一句錯誤訊息字串。
  function validatePickerAndGetError() {
    const total = Number(quantityInput.value);
    const picked = selectedStyles();
    if (picked.length === 0) return "請至少點選一款，並填上份數。";
    const invalidQty = picked.find((p) => !Number.isInteger(p.qty) || p.qty < 10);
    if (invalidQty) return `「${invalidQty.name}」份數要填數字，且至少 10 份。`;
    const sum = picked.reduce((s, p) => s + p.qty, 0);
    if (sum !== total) return `已分配 ${sum} 份，跟上方填的採購數量 ${total} 份對不起來，請調整到剛好一致。`;
    return null;
  }

  function renderSummary() {
    if (!summaryEl) return;
    const total = Number(quantityInput.value);
    const maxStyles = Number.isInteger(total) && total >= 10 ? Math.floor(total / 10) : 0;
    limitHint.textContent = Number.isInteger(total) && total > 0
      ? `總共 ${total} 份，最多可以選 ${maxStyles} 款（每款至少 10 份）。`
      : "請先填寫上方「預計採購數量」。";

    const picked = selectedStyles();
    if (picked.length === 0) {
      summaryEl.textContent = "";
      summaryEl.classList.remove("is-error");
      return;
    }
    const sum = picked.reduce((s, p) => s + (Number.isInteger(p.qty) ? p.qty : 0), 0);
    const detail = picked.map((p) => `${p.name.split("・").pop() || p.name} x${Number.isInteger(p.qty) ? p.qty : "?"}`).join("、");
    const err = validatePickerAndGetError();
    summaryEl.textContent = err ? `${detail}（已分配 ${sum} 份）— ${err}` : `${detail}（共 ${sum} 份，符合條件）`;
    summaryEl.classList.toggle("is-error", Boolean(err));
  }

  function applyStyleModeVisibility() {
    if (pickerField) pickerField.hidden = !isPickMode();
    renderSummary();
  }

  quantityInput.addEventListener("input", renderSummary);
  styleRadios.forEach((radio) => radio.addEventListener("change", applyStyleModeVisibility));
  styleOptions.forEach((opt) => {
    const checkbox = opt.querySelector(".material-quote-style-check");
    const qtyInput = opt.querySelector(".material-quote-style-qty");
    checkbox.addEventListener("change", () => {
      qtyInput.hidden = !checkbox.checked;
      if (!checkbox.checked) qtyInput.value = "";
      renderSummary();
    });
    qtyInput.addEventListener("input", renderSummary);
  });
  applyStyleModeVisibility();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    const quantity = Number(quantityInput.value);
    let style = checkedValue("materialQuoteStyle");
    let productNote = productNoteInput.value.trim();

    // 2026-11-23使用者確認：企業訂單最低20份起訂，不接受未滿20份的
    // 詢問；後端（api/course-booking.js handleMaterialQuote）也有同樣
    // 檢查，這裡只是讓客人在送出前就看到清楚的錯誤訊息，不用等後端
    // 回應才知道數量不夠。
    if (!Number.isInteger(quantity) || quantity < 20) {
      showError("企業訂單最低 20 份起訂，請調整採購數量。");
      return;
    }

    // 「指定款式（點擊選取）」模式：送出前驗證每款≥10、總和等於採購
    // 數量，並把選取結果組成文字塞進（隱藏的）productNote欄位，同時
    // 把style換算成後端看得懂的single/mixed（後端enum沒有"pick"這個
    // 值，是前端這裡才有的互動模式，不用為了這個改後端）。
    if (style === "pick") {
      const err = validatePickerAndGetError();
      if (err) {
        showError(err);
        return;
      }
      const picked = selectedStyles();
      style = picked.length > 1 ? "mixed" : "single";
      productNote = picked.map((p) => `${p.name} x${p.qty}`).join("、");
    }

    const payload = {
      companyName: document.getElementById("material-quote-company").value.trim(),
      contactName: document.getElementById("material-quote-contact-name").value.trim(),
      email: document.getElementById("material-quote-email").value.trim(),
      useCase: checkedValue("materialQuoteUseCase"),
      quantity,
      style,
      productNote,
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
