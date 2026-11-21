











(function () {





  const CHECKOUT_API_BASE = "https://risuan-checkout.vercel.app";

  let bookingAccessToken = "", headerSupport;
  function supportsScopedHeader() {
    if(!headerSupport)headerSupport=fetch(CHECKOUT_API_BASE+'/api/account?action=config',{cache:'no-store'}).then(r=>r.json()).then(c=>c.bookingAccessHeader===true).catch(()=>false);
    return headerSupport;
  }
  async function tokenApiFetch(pathWithQuery, options = {}) {
    const useHeader=await supportsScopedHeader();
    const url=new URL(CHECKOUT_API_BASE+pathWithQuery);
    if(useHeader)url.searchParams.delete('token');
    const res = await fetch(url.href, {
      ...options,
      headers: {
        ...(useHeader && bookingAccessToken ? {"X-Booking-Access":bookingAccessToken} : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "請求失敗");
    return data;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("booking-manage-root");
    const { escapeHtml, renderBookingDetailStatic, renderBookingDetail } = window.BookingDetailUI;

    const params = new URLSearchParams(location.search);
    const bookingId = params.get("bookingId");
    let token = params.get("token");
    const key='risuan-booking-access:'+bookingId;
    try { if(token)sessionStorage.setItem(key,token);else token=sessionStorage.getItem(key); } catch {}
    bookingAccessToken=token||'';
    if(params.has('token'))history.replaceState(null,'',location.pathname+'?bookingId='+encodeURIComponent(bookingId||''));

    function renderInvalidLink(message) {
      root.innerHTML = `
        <p class="account-page__empty">${escapeHtml(message)}</p>
        <p class="sub">這個連結可能已經過期或不正確，請透過
          <a href="https://instagram.com/ri.suan_art" target="_blank" rel="noopener">Instagram</a>
          私訊我們協助處理，或登入
          <a href="../account/">會員中心</a>
          查看您的課程預約紀錄。
        </p>
      `;
    }

    if (!bookingId || !token) {
      renderInvalidLink("連結不完整，缺少必要的參數。");
      return;
    }





    async function loadAndRender() {
      root.innerHTML = `<p class="account-page__empty">載入中…</p>`;
      let data;
      try {
        data = await tokenApiFetch(
          `/api/account?action=booking-reschedule-options&bookingId=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(token)}`
        );
      } catch (err) {
        renderInvalidLink(err.message);
        return;
      }

      const summary = { bookingId, date: data.currentDate, time: data.currentTime };
      renderBookingDetail(root, summary, data);
      root.dataset.bookingId = bookingId;

      // 聯絡卡片是獨立請求：booking-contact-info 失敗不應該影響改期／取消，退回純 Instagram 連結。
      let contactInfo = null;
      try {
        contactInfo = await tokenApiFetch(
          `/api/account?action=booking-contact-info&bookingId=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(token)}`
        );
      } catch {}

      const contactCard = document.createElement("aside");
      contactCard.className = "booking-contact-card";
      contactCard.id = "contact";
      if (contactInfo) {
        const contactText = [
          "您好，我想詢問我的課程預約：",
          `預約編號：${contactInfo.bookingId}`,
          `姓名：${contactInfo.name || ""}`,
          `上課日期：${contactInfo.date} ${contactInfo.time}`,
          `課程：${contactInfo.course}`,
          `人數：${contactInfo.qty}`,
          "想詢問的問題：",
        ].join("\n");
        contactCard.innerHTML = `
          <p class="booking-contact-card__eyebrow">CONTACT US</p>
          <h2 class="booking-contact-card__title">要詢問預約嗎？</h2>
          <p class="booking-contact-card__text">先複製下面整理好的預約資料，再點 Instagram 私訊我們，貼上後補充你的問題即可。</p>
          <textarea class="booking-contact-card__copy" readonly aria-label="預約聯絡文字">${escapeHtml(contactText)}</textarea>
          <div class="booking-contact-card__actions">
            <button type="button" class="work__cta work__cta--primary booking-contact-card__copy-button">複製預約資料</button>
            <a class="work__cta booking-contact-card__instagram" href="https://www.instagram.com/ri.suan_art/" target="_blank" rel="noopener">開啟 Instagram</a>
          </div>
          <p class="booking-contact-card__status" aria-live="polite" hidden></p>
        `;
      } else {
        contactCard.innerHTML = `
          <p class="booking-contact-card__eyebrow">CONTACT US</p>
          <h2 class="booking-contact-card__title">要詢問預約嗎？</h2>
          <p class="booking-contact-card__text">請透過 Instagram 私訊我們，並告知您的預約編號：${escapeHtml(bookingId)}。</p>
          <div class="booking-contact-card__actions">
            <a class="work__cta booking-contact-card__instagram" href="https://www.instagram.com/ri.suan_art/" target="_blank" rel="noopener">開啟 Instagram</a>
          </div>
        `;
      }
      root.prepend(contactCard);
    }

    root.addEventListener("click", async (e) => {
      const rescheduleConfirmBtn = e.target.closest(".account-booking-item__reschedule-confirm");
      const cancelToggleBtn = e.target.closest(".account-booking-item__cancel-toggle");
      const cancelSubmitBtn = e.target.closest(".account-booking-item__cancel-submit");
      const copyButton = e.target.closest(".booking-contact-card__copy-button");

      if (copyButton) {
        const copyText = root.querySelector(".booking-contact-card__copy").value;
        const status = root.querySelector(".booking-contact-card__status");
        try {
          await navigator.clipboard.writeText(copyText);
        } catch {
          const textarea = root.querySelector(".booking-contact-card__copy");
          textarea.focus();
          textarea.select();
          document.execCommand("copy");
        }
        status.textContent = "已複製，現在可以開啟 Instagram 貼上並補充問題。";
        status.hidden = false;
        return;
      }

      if (rescheduleConfirmBtn) {
        const msgEl = root.querySelector(".account-booking-item__msg");
        const picked = root.querySelector("input[type=radio]:checked");
        if (!picked) return;
        rescheduleConfirmBtn.disabled = true;
        rescheduleConfirmBtn.textContent = "處理中…";
        try {
          await tokenApiFetch("/api/account", {
            method: "POST",
            body: JSON.stringify({ action: "booking-reschedule", bookingId, newSlotId: picked.value, token }),
          });
          await loadAndRender();
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
        const form = root.querySelector(".account-booking-item__cancel-form");
        form.hidden = !form.hidden;
        return;
      }

      if (cancelSubmitBtn) {
        const note = root.querySelector(".account-booking-item__cancel-note").value.trim();
        const msgEl = root.querySelector(".account-booking-item__msg");
        cancelSubmitBtn.disabled = true;
        cancelSubmitBtn.textContent = "送出中…";
        try {
          await tokenApiFetch("/api/account", {
            method: "POST",
            body: JSON.stringify({ action: "booking-cancel-request", bookingId, note, token }),
          });
          await loadAndRender();
        } catch (err) {
          msgEl.textContent = err.message;
          msgEl.className = "account-booking-item__msg is-error";
          msgEl.hidden = false;
          cancelSubmitBtn.disabled = false;
          cancelSubmitBtn.textContent = "送出取消申請";
        }
      }
    });

    loadAndRender();
  });
})();
