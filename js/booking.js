/* booking.js —— 官網「線上預約課程」頁面（booking.html）的前端邏輯。
   跟 js/checkout.js 是同一種分工：這支只負責串接 risuan-checkout 後端
   的 api/course-booking.js，UI 互動（人數、月曆、時段面板、每人選課）
   都是純本機的 state，不用任何框架。

   2026-09-17 使用者確認的流程順序跟算價邏輯：
   1. 先選人數——才知道要找「剩餘名額夠這麼多人」的時段，所以人數放
      最前面，月曆／時段清單會依人數篩選（remaining >= qty 才能點）。
   2. 選時段。
   3. 每一位參加者各自選一項課程（不是這組人共同做同一批課程）——
      同一堂課可以被多人重複選（例如 3 人裡 2 人選流動畫、1 人選
      石英砂），選項數量＝人數，人數改變要重新產生這一段。總價＝每個人
      各自選的課程單價加總，不是人數×選中課程種類加總。

   兩段式送出，跟 js/checkout.js 的 #confirm-form 同一個理由：
   1. 送出表單先用 fetch POST action=create（JSON）——這一步只是搶
      名額、後端重新算金額，還沒有要離開這個網站。
   2. 成功後才用 #pay-form 這個「真的」<form> 整頁導去綠界付款頁——
      綠界規定不能用 fetch／iframe 嵌入付款頁，一定要整頁導航，這裡用
      JS 呼叫 form.submit() 觸發，效果跟使用者自己按下 submit 按鈕一樣。 */
(function () {
  const API_BASE = "https://risuan-checkout.vercel.app";

  const formView = document.getElementById("booking-form-view");
  if (!formView) return; // 不是預約頁，不用初始化

  const resultView = document.getElementById("booking-result");
  const form = document.getElementById("booking-form");
  const payForm = document.getElementById("pay-form");
  const payFormBookingId = document.getElementById("pay-form-booking-id");
  const checkoutErrorEl = form.querySelector(".checkout-error");
  const submitBtn = document.getElementById("booking-submit");
  const totalEl = document.getElementById("booking-total");
  const agreeNoticeCheckbox = document.getElementById("booking-agree-notice");

  // ---------- 課前預約須知：分頁籤 ----------
  // 2026-09-17 使用者參考 tinybot 預約頁截圖，要求改成分頁點選（一次
  // 只顯示一類內容），不要 5 段全部展開堆疊、捲很長不好讀。
  const noticeTabs = Array.from(document.querySelectorAll(".booking-notice__tab"));
  const noticePanels = Array.from(document.querySelectorAll(".booking-notice__panel"));
  noticeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      noticeTabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      noticePanels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab.dataset.tab;
      });
    });
  });
  agreeNoticeCheckbox.addEventListener("change", updateSubmitState);

  // 課程清單需要跟後端 risuan-checkout/lib/course-catalog.js 保持一致——
  // 這裡只負責顯示跟預覽金額，真正收費金額一律由後端重新計算，不信任
  // 這裡的價格。
  const COURSE_CATALOG = [
    { label: "自己帶圖創作", price: 1600 },
    { label: "石英砂肌理畫", price: 1600 },
    { label: "刮刀油畫", price: 1600 },
    { label: "寵物肖像畫－大寵", price: 1600 },
    { label: "寵物肖像畫－小寵", price: 1400 },
    { label: "流動畫－33*24cm", price: 1200 },
    { label: "流動畫－20*20cm×2", price: 1400 },
    { label: "串珠課程－項鍊", price: 1280 },
    { label: "串珠課程－手鍊", price: 850 },
    { label: "抽象畫", price: 1800 },
  ];
  const COURSE_PRICE = Object.fromEntries(COURSE_CATALOG.map((c) => [c.label, c.price]));

  function formatMoney(n) {
    return `$${n.toLocaleString()}`;
  }

  // ---------- 課程選擇面板（取代原生 <select>，見 renderAttendeeCourseRow） ----------
  const coursePickerSheet = document.getElementById("course-picker-sheet");
  const coursePickerList = document.getElementById("course-picker-list");
  let activeAttendeeIndex = null;

  function closeCoursePickerSheet() {
    coursePickerSheet.hidden = true;
    activeAttendeeIndex = null;
  }
  coursePickerSheet.querySelectorAll("[data-order-sheet-close]").forEach((el) => {
    el.addEventListener("click", closeCoursePickerSheet);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !coursePickerSheet.hidden) closeCoursePickerSheet();
  });

  function openCoursePickerSheet(attendeeIndex) {
    activeAttendeeIndex = attendeeIndex;
    const currentValue = attendeeSelections[attendeeIndex];
    coursePickerList.innerHTML = "";
    COURSE_CATALOG.forEach((c) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "booking-course-picker-option";
      btn.setAttribute("aria-pressed", c.label === currentValue ? "true" : "false");
      btn.innerHTML = `<span>${c.label}</span><span class="price-text">${formatMoney(c.price)}</span>`;
      btn.addEventListener("click", () => {
        attendeeSelections[activeAttendeeIndex] = c.label;
        closeCoursePickerSheet();
        renderAttendeeCourses();
      });
      li.appendChild(btn);
      coursePickerList.appendChild(li);
    });
    coursePickerSheet.hidden = false;
  }

  function showError(message) {
    checkoutErrorEl.textContent = message;
    checkoutErrorEl.hidden = false;
  }
  function hideError() {
    checkoutErrorEl.hidden = true;
  }

  // ---------- 人數 ----------
  const qtyInput = document.getElementById("booking-qty");

  // 單一場次的容量上限就是 4 人（畫室實際規則），不是這個表單隨便訂的。
  const MAX_QTY = 4;

  function currentQty() {
    const n = Number(qtyInput.value);
    if (!Number.isInteger(n) || n < 1) return 1;
    if (n > MAX_QTY) return MAX_QTY;
    return n;
  }

  // ---------- 每人一列的課程選擇 ----------
  const attendeeCoursesEl = document.getElementById("attendee-courses");
  // 記住已經選好的值，人數變動重新產生列表時盡量保留（例如 3 人改成
  // 4 人，前 3 人已選的課程不用重選；4 人改成 2 人，多出來的直接捨棄）。
  let attendeeSelections = [];
  // ?course=slug 帶入的預選值（見 COURSE_SLUG_DEFAULT），只套用在人數
  // 還沒被使用者自己改過的第一次渲染。
  let presetCourse = null;

  // 2026-09-17 改用自訂的「按鈕＋彈出清單」取代原生 <select>：原生
  // <option> 裡的文字沒辦法用 CSS 排版，課程名稱＋價格只能寫死接在一起
  // （「流動畫－33*24cm・$1,200」），價格看起來就是黏在名字後面，兩邊
  // 對不齊，使用者反映不整齊。改成一般 <button> 開一個清單面板，清單
  // 裡每一列用真的 flexbox 排版（名稱靠左、價格靠右），才能真的排整齊。
  function renderAttendeeCourseRow(i, existing) {
    const row = document.createElement("div");
    row.className = "attendee-course-row";
    const picked = COURSE_CATALOG.find((c) => c.label === existing);
    row.innerHTML = `
      <span class="attendee-course-row__label">第${i + 1}位：課程</span>
      <button type="button" class="attendee-course-picker" data-attendee-index="${i}">
        <span class="attendee-course-picker__name">${existing || "請選擇課程"}</span>
        ${picked ? `<span class="attendee-course-picker__price price-text">${formatMoney(picked.price)}</span>` : ""}
        <svg class="confirm-field__chevron" viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>
      </button>
    `;
    row.querySelector(".attendee-course-picker").addEventListener("click", () => openCoursePickerSheet(i));
    return row;
  }

  function renderAttendeeCourses() {
    const qty = currentQty();
    attendeeCoursesEl.innerHTML = "";
    const next = [];
    for (let i = 0; i < qty; i++) {
      const existing = attendeeSelections[i] || (i === 0 && presetCourse ? presetCourse : "");
      next.push(existing);
      attendeeCoursesEl.appendChild(renderAttendeeCourseRow(i, existing));
    }
    attendeeSelections = next;
    updateTotal();
    updateSubmitState();
  }

  function updateTotal() {
    const sum = attendeeSelections.reduce((total, course) => total + (COURSE_PRICE[course] || 0), 0);
    totalEl.textContent = `應付 ${formatMoney(sum)}`;
  }

  qtyInput.addEventListener("input", () => {
    renderAttendeeCourses();
    onQtyChanged();
  });

  // ---------- 月曆 + 時段面板 ----------
  // 2026-09-17 改版：時段跟剩餘名額直接列在月曆下面（早上／下午／晚上
  // 三欄），參考使用者提供的截圖（997studio tinybot 預約頁），不再用
  // 彈出面板——選日期跟看時段這兩個動作合在同一塊畫面裡，一次看到。
  const calendarMonthEl = document.getElementById("calendar-month");
  const calendarGridEl = document.getElementById("calendar-grid");
  const calendarPrevBtn = document.getElementById("calendar-prev");
  const calendarNextBtn = document.getElementById("calendar-next");
  const selectedSlotEl = document.getElementById("selected-slot");
  const selectedSlotTextEl = document.getElementById("selected-slot-text");
  const slotIdInput = document.getElementById("booking-slot-id");
  const timeslotsInlineEl = document.getElementById("timeslots-inline");
  const timeslotsEmptyHintEl = document.getElementById("timeslots-empty-hint");

  let slotsByDate = new Map(); // date -> [{time, capacity, booked, remaining}]
  let todayStr = "";
  let selectedDate = null;
  let selectedTime = null;

  // 早上／下午／晚上分桶純粹以小時區分，不是硬寫死畫室現在的
  // 10:00／14:00／16:00 三個時段——後台之後開新的時間，這裡一樣會自動
  // 分到對的欄位，不用回來改這支檔案。
  function periodOf(time) {
    const hour = Number((time || "").split(":")[0]);
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }

  function updateSelectedSlotSummary() {
    if (selectedDate && selectedTime) {
      selectedSlotTextEl.textContent = `${selectedDate}　${selectedTime}`;
      selectedSlotEl.hidden = false;
    } else {
      selectedSlotEl.hidden = true;
    }
  }

  // 顯示範圍：今天所在月＋接下來 2 個月，剛好覆蓋後端 action=availability
  // 回傳的 90 天視窗，不用做到無限往後翻頁那麼通用。
  let monthCursor = 0; // 0=本月，1=下個月，2=下下個月
  const MAX_MONTH_CURSOR = 2;

  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function dateStr(y, m, d) {
    return `${y}-${pad2(m + 1)}-${pad2(d)}`;
  }

  function renderCalendar() {
    const qty = currentQty();
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + monthCursor);
    const year = base.getFullYear();
    const month = base.getMonth();

    calendarMonthEl.textContent = `${year}年${month + 1}月`;
    calendarPrevBtn.disabled = monthCursor <= 0;
    calendarNextBtn.disabled = monthCursor >= MAX_MONTH_CURSOR;

    // 週一開頭（照參考截圖），JS 原生 getDay() 是週日=0，換算成週一=0。
    const firstWeekdaySundayBased = new Date(year, month, 1).getDay();
    const firstWeekday = (firstWeekdaySundayBased + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarGridEl.innerHTML = "";
    for (let i = 0; i < firstWeekday; i++) {
      const empty = document.createElement("span");
      empty.className = "booking-calendar__day booking-calendar__day--empty";
      calendarGridEl.appendChild(empty);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = dateStr(year, month, d);
      const daySlots = slotsByDate.get(ds) || [];
      // 名額要夠這次報名的人數才算「這天可以點」，不是只要有 1 個名額
      // 就顯示——不然選了人數之後點進去卻發現這天沒有一個時段夠坐。
      const hasAvailability = daySlots.some((s) => s.remaining >= qty);
      const isPast = ds < todayStr;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "booking-calendar__day";
      btn.disabled = isPast || !hasAvailability;
      btn.setAttribute("aria-pressed", ds === selectedDate ? "true" : "false");
      btn.innerHTML = `<span>${d}</span><span class="booking-calendar__day-dot" aria-hidden="true"></span>`;
      btn.addEventListener("click", () => selectDate(ds));
      calendarGridEl.appendChild(btn);
    }
  }

  function selectDate(ds) {
    selectedDate = ds;
    selectedTime = null;
    slotIdInput.value = "";
    renderCalendar();
    renderTimeslotsForDate(ds);
    updateSelectedSlotSummary();
    updateSubmitState();
  }

  function renderTimeslotsForDate(ds) {
    if (!ds) {
      timeslotsInlineEl.hidden = true;
      timeslotsEmptyHintEl.hidden = false;
      return;
    }
    timeslotsInlineEl.hidden = false;
    timeslotsEmptyHintEl.hidden = true;

    const qty = currentQty();
    const daySlots = (slotsByDate.get(ds) || []).slice().sort((a, b) => a.time.localeCompare(b.time));
    const buckets = { morning: [], afternoon: [], evening: [] };
    daySlots.forEach((s) => buckets[periodOf(s.time)].push(s));

    ["morning", "afternoon", "evening"].forEach((period) => {
      const listEl = timeslotsInlineEl.querySelector(`[data-period="${period}"]`);
      listEl.innerHTML = "";
      if (buckets[period].length === 0) {
        const span = document.createElement("span");
        span.className = "booking-timeslots-inline__empty";
        span.textContent = "－";
        listEl.appendChild(span);
        return;
      }
      buckets[period].forEach((s) => {
        const enough = s.remaining >= qty;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "booking-timeslot-inline";
        btn.disabled = !enough;
        btn.setAttribute("aria-pressed", ds === selectedDate && s.time === selectedTime ? "true" : "false");
        // 剩 0 位不管這次要訂幾人都是真的額滿，直接講「額滿」；剩下的
        // 名額大於 0 但還是不夠這次人數，才需要講「不足 N 人」——這種
        // 情況還有名額、只是不夠這組人一起坐，跟真的額滿是兩回事。
        const remainingLabel = s.remaining === 0 ? "額滿" : enough ? `剩 ${s.remaining} 位` : `不足${qty}人`;
        btn.innerHTML = `<span class="booking-timeslot-inline__time">${s.time}</span><span class="booking-timeslot-inline__remaining">${remainingLabel}</span>`;
        btn.addEventListener("click", () => {
          selectedDate = ds;
          selectedTime = s.time;
          slotIdInput.value = `${ds}|${s.time}`;
          renderCalendar();
          renderTimeslotsForDate(ds);
          updateSelectedSlotSummary();
          updateSubmitState();
        });
        listEl.appendChild(btn);
      });
    });
  }

  // 人數改變時：名額夠不夠會跟著變，盡量保留已選的日期／時段，只有真的
  // 不夠了才清掉要求重選，不是每次改人數都整個清空重來。
  function onQtyChanged() {
    renderCalendar();
    if (selectedDate) {
      const qty = currentQty();
      const daySlots = slotsByDate.get(selectedDate) || [];
      const dateStillOk = daySlots.some((s) => s.remaining >= qty);
      if (!dateStillOk) {
        selectedDate = null;
        selectedTime = null;
        slotIdInput.value = "";
      } else {
        const current = daySlots.find((s) => s.time === selectedTime);
        if (!current || current.remaining < qty) {
          selectedTime = null;
          slotIdInput.value = "";
        }
      }
      renderTimeslotsForDate(selectedDate);
    }
    updateSelectedSlotSummary();
    updateSubmitState();
  }

  // 找可以自動預選的第一個日期（今天以後、有任何時段名額夠），讓頁面
  // 一打開就有東西可以看，不用先自己點一次月曆才看到時段長什麼樣子
  // ——同樣是照參考截圖的體驗（截圖裡進頁面就已經選好一天）。
  function autoSelectFirstAvailableDate() {
    const qty = currentQty();
    const candidates = Array.from(slotsByDate.keys())
      .filter((ds) => ds >= todayStr && (slotsByDate.get(ds) || []).some((s) => s.remaining >= qty))
      .sort();
    if (candidates.length > 0) selectDate(candidates[0]);
    else renderTimeslotsForDate(null);
  }

  calendarPrevBtn.addEventListener("click", () => {
    if (monthCursor > 0) {
      monthCursor -= 1;
      renderCalendar();
    }
  });
  calendarNextBtn.addEventListener("click", () => {
    if (monthCursor < MAX_MONTH_CURSOR) {
      monthCursor += 1;
      renderCalendar();
    }
  });

  async function loadAvailability() {
    try {
      const res = await fetch(`${API_BASE}/api/course-booking?action=availability`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "載入可預約時段失敗");
      slotsByDate = new Map();
      (data.slots || []).forEach((s) => {
        if (!slotsByDate.has(s.date)) slotsByDate.set(s.date, []);
        slotsByDate.get(s.date).push(s);
      });
      renderCalendar();
      autoSelectFirstAvailableDate();
    } catch (err) {
      showError(`載入可預約時段失敗：${err.message}`);
    }
  }

  // ---------- 送出表單 ----------
  function updateSubmitState() {
    const qty = currentQty();
    const allCoursesPicked = attendeeSelections.length === qty && attendeeSelections.every(Boolean);
    submitBtn.disabled = !(allCoursesPicked && Boolean(slotIdInput.value) && agreeNoticeCheckbox.checked);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    const qty = currentQty();
    if (!slotIdInput.value) {
      showError("請選擇上課日期與時段");
      return;
    }
    if (attendeeSelections.length !== qty || attendeeSelections.some((c) => !c)) {
      showError("請幫每一位參加者選擇課程");
      return;
    }
    if (!agreeNoticeCheckbox.checked) {
      showError("請先閱讀並勾選同意課前預約須知");
      return;
    }

    const payload = {
      slotId: slotIdInput.value,
      courses: attendeeSelections.slice(),
      qty,
      name: document.getElementById("booking-name").value.trim(),
      contact: document.getElementById("booking-contact").value.trim(),
      email: document.getElementById("booking-email").value.trim(),
      ig: document.getElementById("booking-ig").value.trim(),
      note: document.getElementById("booking-note").value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.querySelector("span").textContent = "處理中…";

    try {
      const res = await fetch(`${API_BASE}/api/course-booking?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "建立預約失敗，請稍後再試一次");

      payFormBookingId.value = data.bookingId;
      payForm.action = `${API_BASE}/api/course-booking?action=pay`;
      payForm.submit();
    } catch (err) {
      showError(`預約發生問題：${err.message}`);
      submitBtn.disabled = false;
      submitBtn.querySelector("span").textContent = "確認並前往付款";
    }
  });

  // 把每人一筆的課程陣列（可能有重複）整理成「課程名稱 x人數」的顯示
  // 字串，跟後端 lib/course-catalog.js 的 describeAttendeeCourses() 是
  // 同一個邏輯的前端版本（純顯示用，各自獨立維護，不影響金額計算——
  // 金額一律由後端算）。
  function describeAttendeeCourses(courses) {
    const counts = new Map();
    (courses || []).forEach((c) => counts.set(c, (counts.get(c) || 0) + 1));
    return Array.from(counts.entries())
      .map(([course, count]) => `${course} x${count}`)
      .join("、");
  }

  // ---------- 付款完成後回來這頁：輪詢付款結果 ----------
  async function pollBookingStatus(bookingId, attempt) {
    const resultChecking = document.getElementById("result-checking");
    const resultConfirmed = document.getElementById("result-confirmed");
    const resultPending = document.getElementById("result-pending");
    const resultFailed = document.getElementById("result-failed");

    try {
      const res = await fetch(`${API_BASE}/api/course-booking?action=status&bookingId=${encodeURIComponent(bookingId)}`);
      const data = await res.json();

      if (data.status === "confirmed") {
        resultChecking.hidden = true;
        resultConfirmed.hidden = false;
        document.getElementById("result-confirmed-text").textContent = `${data.date} ${data.time}，${describeAttendeeCourses(
          data.courses
        )}，已收款 ${formatMoney(data.amountReceived)}。期待與您見面！`;
        return;
      }
      if (data.status === "pending" && attempt < 6) {
        setTimeout(() => pollBookingStatus(bookingId, attempt + 1), 2000);
        return;
      }
      if (data.status === "pending") {
        resultChecking.hidden = true;
        resultPending.hidden = false;
        return;
      }
      // not_found：付款失敗或逾時，名額已經還給別人。
      resultChecking.hidden = true;
      resultFailed.hidden = false;
    } catch (err) {
      resultChecking.hidden = true;
      resultPending.hidden = false;
    }
  }

  // ?course=slug 讓課程頁的「線上預約」按鈕可以帶入預選課程，slug 對照
  // 表只列有固定報價、開放線上預約的 6 個課程頁；性質相近但有多款式的
  // 課程（寵物、流動畫、串珠）先預選一個常見款式，客人到這頁還是可以
  // 自己改選其他款式。只套用在第 1 位參加者，其餘人數要自己選。
  const COURSE_SLUG_DEFAULT = {
    "custom-photo-oil": "自己帶圖創作",
    "sand-texture": "石英砂肌理畫",
    "palette-knife-oil": "刮刀油畫",
    "pet-portrait": "寵物肖像畫－大寵",
    "fluid-art": "流動畫－33*24cm",
    beading: "串珠課程－項鍊",
  };

  function init() {
    const bookingId = new URLSearchParams(window.location.search).get("bookingId");
    if (bookingId) {
      formView.hidden = true;
      resultView.hidden = false;
      pollBookingStatus(bookingId, 0);
      return;
    }

    const courseSlug = new URLSearchParams(window.location.search).get("course");
    presetCourse = (courseSlug && COURSE_SLUG_DEFAULT[courseSlug]) || null;

    todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
    renderAttendeeCourses();
    loadAvailability();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
