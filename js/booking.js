function normalizeInstagram(value) {
  let text = String(value || '').trim();
  if (!text) return '';
  if (/^(https?:\/\/|(?:www\.)?instagram\.com\/)/i.test(text)) {
    let url; try { url = new URL(/^https?:/i.test(text) ? text : 'https://' + text); } catch { throw new Error('請貼上 Instagram 個人檔案連結'); }
    const parts = url.pathname.split('/').filter(Boolean);
    if (!['instagram.com','www.instagram.com'].includes(url.hostname.toLowerCase()) || parts.length !== 1 || ['p','reel','reels','stories','explore','accounts','direct','share'].includes(parts[0].toLowerCase())) throw new Error('請貼上個人檔案連結，不是貼文或 Reels 連結');
    text = parts[0];
  }
  text = text.replace(/^@+/, '').toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(text)) throw new Error('請輸入有效的 IG 帳號或個人檔案連結');
  return text;
}




















(function () {
  const API_BASE = "https://risuan-checkout.vercel.app";

  const formView = document.getElementById("booking-form-view");
  if (!formView) return;

  const resultView = document.getElementById("booking-result");
  const form = document.getElementById("booking-form");
  const payForm = document.getElementById("pay-form");
  const payFormBookingId = document.getElementById("pay-form-booking-id");
  const checkoutErrorEl = form.querySelector(".checkout-error");
  const submitBtn = document.getElementById("booking-submit");
  const totalPriceEl = document.getElementById("booking-total-price");
  const totalDepositEl = document.getElementById("booking-total-deposit");
  const totalBalanceEl = document.getElementById("booking-total-balance");
  const agreeNoticeCheckbox = document.getElementById("booking-agree-notice");







  const platformBtns = Array.from(document.querySelectorAll(".contact-platform__btn"));
  const igInput = document.getElementById("booking-ig");
  let currentPlatform = "IG";
  igInput.addEventListener('input',()=>igInput.setCustomValidity(''));
  igInput.addEventListener('change',()=>{if(currentPlatform!=='IG')return;try{igInput.value=normalizeInstagram(igInput.value);igInput.setCustomValidity('');}catch(error){igInput.setCustomValidity(error.message);igInput.reportValidity();}});
  const PLATFORM_PLACEHOLDER = { IG: "輸入 IG 帳號，或貼上個人檔案連結", FB: "您的 Facebook 名稱" };
  platformBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPlatform = btn.dataset.platform;
      igInput.setCustomValidity('');
      platformBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      igInput.placeholder = PLATFORM_PLACEHOLDER[currentPlatform] || "";
    });
  });




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




  const COURSE_CATALOG = [
    { label: "自選主題油畫", price: 1600 },
    { label: "石英砂肌理畫", price: 1600 },
    { label: "刮刀油畫", price: 1600 },
    { label: "寵物油畫－大寵", price: 1600 },
    { label: "寵物油畫－小寵", price: 1400 },
    { label: "流動畫－33*24cm", price: 1200 },
    { label: "流動畫－20*20cm×2", price: 1400 },
    { label: "串珠課程－項鍊", price: 1280 },
    { label: "串珠課程－手鍊", price: 850 },
    { label: "抽象畫", price: 1800 },
  ];
  const COURSE_PRICE = Object.fromEntries(COURSE_CATALOG.map((c) => [c.label, c.price]));


  const DEPOSIT_AMOUNT = 500;

  function formatMoney(n) {
    return `$${n.toLocaleString()}`;
  }


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
        if(attendeeSelections[activeAttendeeIndex]!==c.label){attendeeExtras[activeAttendeeIndex]=0;}
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


  const qtyInput = document.getElementById("booking-qty");


  const MAX_QTY = 4;

  function currentQty() {
    const n = Number(qtyInput.value);
    if (!Number.isInteger(n) || n < 1) return 1;
    if (n > MAX_QTY) return MAX_QTY;
    return n;
  }


  const attendeeCoursesEl = document.getElementById("attendee-courses");


  let attendeeSelections = [];
  let attendeeExtras = [];
  let activePetAddonIndex = null;


  let presetCourse = null;






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
    if(existing==='寵物油畫－大寵'||existing==='寵物油畫－小寵') {
      const label=document.createElement('label');label.className='confirm-field booking-pet-addon';
      const price=existing==='寵物油畫－大寵'?700:500;
      label.append(document.createTextNode(`第${i+1}位追加隻數（每隻 $${price}，最多追加2隻）`));
      const control=document.createElement('span');control.className='confirm-field__control';const input=document.createElement('input');input.type='number';input.min='0';input.max='2';input.step='1';input.value=String(Number(attendeeExtras[i]||0));input.setAttribute('aria-label',`第${i+1}位追加隻數`);input.addEventListener('input',()=>{activePetAddonIndex=i;attendeeExtras[i]=Number(input.value||0);updateAddonPrice();updateTotal();});const addonPrice=document.createElement('span');addonPrice.className='price-text booking-addon-price';addonPrice.setAttribute('aria-live','polite');
      function updateAddonPrice(){const n=Number(input.value||0);addonPrice.textContent=n>0?`加購 +${formatMoney(n*price)}`:'加購 $0';}
      updateAddonPrice();control.append(input,addonPrice);label.append(control);row.append(label);
    }
    return row;
  }

  function renderCompanionEmails(){
    const host=document.getElementById('booking-companion-emails');if(!host)return;
    const values=Array.from(host.querySelectorAll('input')).map(e=>e.value);host.replaceChildren();
    for(let i=1;i<currentQty();i++){const label=document.createElement('label');label.className='confirm-field';const text=document.createElement('span');text.textContent=`第${i+1}位同行者 Email（選填）`;const control=document.createElement('div');control.className='confirm-field__control';const input=document.createElement('input');input.type='email';input.name='companionEmail';input.maxLength=254;input.placeholder='接收預約確認、課前說明與改期通知';input.value=values[i-1]||'';control.append(input);label.append(text,control);host.append(label);}
  }
  function renderAttendeeCourses() {
    renderCompanionEmails();
    const qty = currentQty();
    const sharedNotice=document.getElementById('pet-addon-notice');
    if(sharedNotice)attendeeCoursesEl.after(sharedNotice);
    attendeeCoursesEl.innerHTML = "";
    const next = [];
    for (let i = 0; i < qty; i++) {
      const existing = attendeeSelections[i] || (i === 0 && presetCourse ? presetCourse : "");
      next.push(existing);
      attendeeCoursesEl.appendChild(renderAttendeeCourseRow(i, existing));
    }
    attendeeSelections = next;attendeeExtras.length=qty;
    updateTotal();
    updateSubmitState();
  }

  document.getElementById('booking-notice-link').addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    const target=document.querySelector('#pre-class-notice h2');
    target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
    target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });
  const petConsent=document.getElementById('pet-addon-consent');petConsent.addEventListener('change',()=>{const message=document.getElementById('pet-consent-error');if(message)message.hidden=true;updateTotal();});
  function remindPetConsent(){
    const label=document.getElementById('pet-addon-consent-label');
    let message=document.getElementById('pet-consent-error');
    if(!message){message=document.createElement('p');message.id='pet-consent-error';message.className='pet-consent-error';message.setAttribute('role','alert');label.after(message);petConsent.setAttribute('aria-describedby',message.id);}
    message.textContent='請先確認追加寵物注意事項，再前往付款。';message.hidden=false;
    petConsent.focus({preventScroll:true});label.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  submitBtn.addEventListener('click',event=>{if(petConsent.required&&!petConsent.checked){event.preventDefault();remindPetConsent();}});
  petConsent.addEventListener('invalid',event=>{event.preventDefault();remindPetConsent();});
  function petExtraTotals(){return attendeeSelections.reduce((result,c,i)=>{if(c==='寵物油畫－大寵')result.big+=Number(attendeeExtras[i]||0);if(c==='寵物油畫－小寵')result.small+=Number(attendeeExtras[i]||0);return result;},{big:0,small:0});}
  function updateTotal() {
    const hasPet=attendeeExtras.some((n,i)=>Number(n)>0&&String(attendeeSelections[i]||'').startsWith('寵物油畫'));
    const notice=document.getElementById('pet-addon-notice');notice.hidden=!hasPet;notice.style.display=hasPet?'block':'none';
    const eligible=i=>Number(attendeeExtras[i])>1 && String(attendeeSelections[i]||'').startsWith('寵物油畫');
    const thirdIndex=attendeeExtras.findIndex((n,i)=>eligible(i));
    const noticeIndex=activePetAddonIndex!==null&&eligible(activePetAddonIndex)?activePetAddonIndex:thirdIndex>=0?thirdIndex:activePetAddonIndex!==null&&Number(attendeeExtras[activePetAddonIndex])>0?activePetAddonIndex:attendeeExtras.findIndex(n=>Number(n)>0);
    const row=noticeIndex>=0?attendeeCoursesEl.children[noticeIndex]:null;
    if(row)row.append(notice);else attendeeCoursesEl.after(notice);
    const needs=attendeeExtras.some((n,i)=>Number(n)>1 && String(attendeeSelections[i]||'').startsWith('寵物油畫'));
    notice.querySelectorAll('.pet-third-note').forEach(el=>{el.hidden=!needs;el.style.display=needs?'list-item':'none';});
    const consentLabel=document.getElementById('pet-addon-consent-label');consentLabel.hidden=!needs;consentLabel.style.display=needs?'flex':'none';petConsent.required=needs;consentLabel.classList.toggle('is-required',needs&&!petConsent.checked);petConsent.setAttribute('aria-invalid',String(needs&&!petConsent.checked));

    petConsent.setCustomValidity(needs&&!petConsent.checked?'追加至第3隻前，請閱讀注意事項並勾選確認。':'');
    const totals=petExtraTotals();
    const sum=totals.big*700+totals.small*500+attendeeSelections.reduce((total,course)=>total+(COURSE_PRICE[course]||0),0);
    const deposit = Math.min(DEPOSIT_AMOUNT * attendeeSelections.length, sum);
    totalPriceEl.textContent = formatMoney(sum);
    totalDepositEl.textContent = formatMoney(deposit);
    totalBalanceEl.textContent = formatMoney(sum - deposit);
  }

  qtyInput.addEventListener("input", () => {
    renderAttendeeCourses();
    onQtyChanged();
  });





  const calendarMonthEl = document.getElementById("calendar-month");
  const calendarGridEl = document.getElementById("calendar-grid");
  const calendarPrevBtn = document.getElementById("calendar-prev");
  const calendarNextBtn = document.getElementById("calendar-next");
  const selectedSlotEl = document.getElementById("selected-slot");
  const selectedSlotTextEl = document.getElementById("selected-slot-text");
  const slotIdInput = document.getElementById("booking-slot-id");
  const timeslotsInlineEl = document.getElementById("timeslots-inline");
  const timeslotsEmptyHintEl = document.getElementById("timeslots-empty-hint");

  let slotsByDate = new Map();
  let todayStr = "";
  let selectedDate = null;
  let selectedTime = null;




  function periodOf(time) {
    const hour = Number((time || "").split(":")[0]);
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }





  const SLOT_DURATION_HOURS = 3;

  function formatSlotEndTime(time) {
    const [hour, minute] = (time || "").split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return "";
    const endHour = (hour + SLOT_DURATION_HOURS) % 24;
    return `${String(endHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  function updateSelectedSlotSummary() {
    if (selectedDate && selectedTime) {
      selectedSlotTextEl.textContent = `${selectedDate}　${selectedTime} - ${formatSlotEndTime(selectedTime)}`;
      selectedSlotEl.hidden = false;
    } else {
      selectedSlotEl.hidden = true;
    }
  }



  let monthCursor = 0;
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


      const hasAvailability = daySlots.some((s) => s.remaining >= qty);
      const isPast = ds < todayStr;





      const isFull = !isPast && daySlots.length > 0 && daySlots.every((s) => s.remaining === 0);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "booking-calendar__day" + (isFull ? " booking-calendar__day--full" : hasAvailability && !isPast ? " booking-calendar__day--available" : "");
      btn.disabled = isPast || !hasAvailability;
      btn.setAttribute("aria-pressed", ds === selectedDate ? "true" : "false");
      btn.innerHTML = isFull
        ? `<span>${d}</span><span class="booking-calendar__day-label">額滿</span>`
        : `<span>${d}</span><span class="booking-calendar__day-dot" aria-hidden="true"></span>`;
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
      companionEmails:Array.from(document.querySelectorAll('[name="companionEmail"]')).map(e=>e.value.trim()).filter(Boolean),
      slotId: slotIdInput.value,
      courses: attendeeSelections.slice(),
      extraPets:petExtraTotals().big,
      extraSmallPets:petExtraTotals().small,
      attendeeExtras:attendeeSelections.map((c,i)=>String(c).startsWith('寵物油畫')?Number(attendeeExtras[i]||0):0),
      petAddonConsent:!petConsent.required||petConsent.checked,
      qty,
      name: document.getElementById("booking-name").value.trim(),
      contact: document.getElementById("booking-contact").value.trim(),
      email: document.getElementById("booking-email").value.trim(),
      ig: document.getElementById("booking-ig").value.trim(),
      platform: currentPlatform,
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





  function describeAttendeeCourses(courses) {
    const counts = new Map();
    (courses || []).forEach((c) => counts.set(c, (counts.get(c) || 0) + 1));
    return Array.from(counts.entries())
      .map(([course, count]) => `${course} x${count}`)
      .join("、");
  }





  let dmText = "";
  function renderDmCard(data) {
    const dmCard = document.getElementById("booking-dm-card");
    if (!dmCard) return;
    const m = /^(IG|FB):(.*)$/.exec(data.ig || "");
    const platformLabel = m ? (m[1] === "FB" ? "Facebook" : "Instagram") : "Instagram";
    const handle = m ? m[2] : data.ig || "";
    dmText = [
      `您好，我是 ${data.name || ""}`,
      `已完成預約：${data.date} ${data.time} - ${formatSlotEndTime(data.time)}`,
      describeAttendeeCourses(data.courses) ? `課程：${describeAttendeeCourses(data.courses)}` : "",
      handle ? `聯絡帳號（${platformLabel}）：${handle}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    document.getElementById("booking-dm-text").textContent = dmText;
    dmCard.hidden = false;
  }

  const dmCopyBtn = document.getElementById("booking-dm-copy");
  if (dmCopyBtn) {
    dmCopyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(dmText);
        const label = dmCopyBtn.querySelector("span");
        const original = label.textContent;
        label.textContent = "已複製！";
        setTimeout(() => {
          label.textContent = original;
        }, 1800);
      } catch (err) {


        const range = document.createRange();
        range.selectNodeContents(document.getElementById("booking-dm-text"));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  }


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




        const balanceText = data.balanceDue > 0 ? `，尾款 ${formatMoney(data.balanceDue)} 請於上課當天以現金或轉帳支付` : "";
        document.getElementById("result-confirmed-text").textContent = `${data.date} ${data.time} - ${formatSlotEndTime(data.time)}，${describeAttendeeCourses(
          data.courses
        )}，已付預約金 ${formatMoney(data.depositAmount)}${balanceText}。期待與您見面！`;
        renderDmCard(data);
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

      resultChecking.hidden = true;
      resultFailed.hidden = false;
    } catch (err) {
      resultChecking.hidden = true;
      resultPending.hidden = false;
    }
  }





  const COURSE_SLUG_DEFAULT = {
    "custom-photo-oil": "自選主題油畫",
    "sand-texture": "石英砂肌理畫",
    "palette-knife-oil": "刮刀油畫",
    "pet-portrait": "寵物油畫－大寵",
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
