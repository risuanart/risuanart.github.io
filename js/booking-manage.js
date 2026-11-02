/* booking-manage.js —— booking-manage/index.html 專屬的頁面控制器
   （2026-10-29 第二階段新增）。這頁是課程預約確認信/改期成功信裡附的
   「免登入管理連結」目的地：網址帶 bookingId／token 兩個參數，不需要
   Google 登入，身分驗證靠這個 token（見 risuan-checkout
   lib/customer-auth.js issueBookingAccessToken() 的說明）。

   跟 account/ 會員中心的課程預約區塊共用同一套畫面渲染邏輯
   （window.BookingDetailUI，見 js/booking-detail-ui.js），這支檔案
   只負責：① 解析網址參數 ② 用 token 呼叫 API（不是 Authorization
   header，跟 js/account-auth.js 的登入流程是兩回事，不依賴它） ③ 把
   畫面渲染出來、掛上跟會員中心同一套按鈕點擊處理。 */

(function () {
  // 跟 js/checkout.js／js/cart.js 一樣各自維護一份（這個專案的既有
  // 慣例，不是漏了共用），不依賴 js/account-auth.js 的
  // window.RisuanAccount.API_BASE——這支腳本刻意不需要登入狀態管理
  // 那一整套，獨立運作，不想讓 <script> 載入順序變成這頁能不能動的
  // 前提條件。
  const CHECKOUT_API_BASE = "https://risuan-checkout.vercel.app";

  async function tokenApiFetch(pathWithQuery, options = {}) {
    const res = await fetch(`${CHECKOUT_API_BASE}${pathWithQuery}`, {
      ...options,
      headers: {
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
    const token = params.get("token");

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

    // 這頁只管網址指定的這一筆，重新整理畫面就是重新呼叫同一支
    // API——跟 account-page.js 的 loadBookings() 重新整個列表是同一個
    // 「改完直接整個重抓，不要自己手動拼湊新狀態」的原則，差別是這裡
    // 範圍只有一筆，不是整份清單。
    async function loadAndRender() {
      root.innerHTML = `<p class="account-page__empty">載入中…</p>`;
      try {
        const [data, contactInfo] = await Promise.all([
          tokenApiFetch(
            `/api/account?action=booking-reschedule-options&bookingId=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(token)}`
          ),
          tokenApiFetch(
            `/api/account?action=booking-contact-info&bookingId=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(token)}`
          ),
        ]);
        // 這支 API 不會回傳 status／cancelRequestedAt（第一階段設計成
        // 只給「查改期資格」用，那兩個欄位是會員中心列表摘要才有的），
        // 這裡沒有列表可以撈摘要，改成直接用 reschedule-options 本身
        // 回傳的 eligible/reason 判斷要不要顯示操作介面：已取消／已經
        // 申請過取消的情況，reason 文字本身已經講得夠清楚（「這筆預約
        // 已取消」「每筆預約最多提供一次免費改期，這筆已經使用過」等），
        // 不需要額外用 renderBookingDetailStatic() 那套「假摘要物件」
        // 的寫法，直接走一般的 renderBookingDetail() 即可。
        const summary = { bookingId, date: data.currentDate, time: data.currentTime };
        renderBookingDetail(root, summary, data);
        const contactText = [
          "您好，我想詢問我的課程預約：",
          `預約編號：${contactInfo.bookingId}`,
          `姓名：${contactInfo.name || ""}`,
          `上課日期：${contactInfo.date} ${contactInfo.time}`,
          `課程：${contactInfo.course}`,
          `人數：${contactInfo.qty}`,
          "想詢問的問題：",
        ].join("\n");
        const contactCard = document.createElement("aside");
        contactCard.className = "booking-contact-card";
        contactCard.id = "contact";
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
        root.prepend(contactCard);
        root.dataset.bookingId = bookingId;
      } catch (err) {
        renderInvalidLink(err.message);
      }
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
