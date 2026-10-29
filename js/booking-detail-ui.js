/* booking-detail-ui.js —— 課程預約「改期/申請取消」明細區塊的共用畫面
   渲染邏輯（純函式，吃資料吐 HTML 字串，不碰登入狀態、不碰 DOM 事件、
   不自己打 API）。2026-10-29 第二階段新增：這套畫面原本只寫在
   js/account-page.js 裡給會員中心用，這次又要給 booking-manage/
   （信件免登入連結，見該頁 js/booking-manage.js）用一次，兩邊長得
   一模一樣，抽出來共用一份，以後改文案/樣式只要改這一個檔案。

   兩邊的差異（登入狀態、API 怎麼帶憑證、改完要重新整個列表還是只
   重新這一筆）故意不放進這支檔案，各自在 account-page.js／
   booking-manage.js 自己處理，這裡只管「畫面長什麼樣」。 */

(function () {
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const BOOKING_STATUS_LABEL = { confirmed: "已確認", cancelled: "已取消" };

  function bookingStatusText(b) {
    if (b.status === "cancelled") return "已取消";
    if (b.cancelRequestedAt) return "取消申請處理中";
    return BOOKING_STATUS_LABEL[b.status] || b.status;
  }

  // 已取消、或已經送出取消申請的預約，不用再打改期選項那支 API——
  // 結果一定是「不符合資格」，省一次網路往返，直接顯示固定文字。
  // 回傳 true 代表「已經處理完，不用再打 API 查資格」。
  function renderBookingDetailStatic(container, b) {
    if (b.status === "cancelled") {
      container.innerHTML = `<p class="account-booking-item__msg">這筆預約已經取消。</p>`;
      return true;
    }
    if (b.cancelRequestedAt) {
      container.innerHTML = `<p class="account-booking-item__msg">您已送出取消申請，我們會依網站公告的退費政策盡快為您處理，處理完成後會寄信通知您，請留意信箱。</p>`;
      return true;
    }
    return false;
  }

  function renderBookingDetail(container, b, rescheduleData) {
    const policyHtml = `<p class="account-booking-item__policy ${rescheduleData.eligible ? "" : "is-blocked"}">${escapeHtml(rescheduleData.reason)}</p>`;
    const slotsHtml = rescheduleData.eligible
      ? rescheduleData.options.length
        ? `
        <ul class="account-booking-item__slots">
          ${rescheduleData.options
            .map(
              (o, i) => `
            <li class="account-booking-item__slot-option">
              <label style="display:flex;align-items:center;gap:var(--space-2);width:100%;cursor:pointer;">
                <input type="radio" name="reschedule-slot-${escapeHtml(b.bookingId)}" value="${escapeHtml(o.slotId)}" ${i === 0 ? "checked" : ""}>
                <span>${escapeHtml(o.date)} ${escapeHtml(o.time)}（剩 ${escapeHtml(o.remaining)} 位）</span>
              </label>
            </li>`
            )
            .join("")}
        </ul>
        <button type="button" class="work__cta account-booking-item__reschedule-confirm">確認改期</button>
        `
        : `<p class="account-booking-item__msg">目前沒有可以改期的未來時段，請私訊我們協助安排。</p>`
      : "";
    const cancelHtml = `
      <div class="account-booking-item__actions">
        <button type="button" class="work__cta account-booking-item__cancel-toggle">申請取消這筆預約</button>
      </div>
      <div class="account-booking-item__cancel-form" hidden>
        <textarea class="account-booking-item__cancel-note" placeholder="取消原因（選填）"></textarea>
        <div class="account-booking-item__actions">
          <button type="button" class="work__cta work__cta--primary account-booking-item__cancel-submit">送出取消申請</button>
        </div>
      </div>
    `;
    container.innerHTML = `${policyHtml}${slotsHtml}${cancelHtml}<p class="account-booking-item__msg" hidden></p>`;
  }

  window.BookingDetailUI = { escapeHtml, bookingStatusText, renderBookingDetailStatic, renderBookingDetail };
})();
