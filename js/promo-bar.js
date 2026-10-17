/* promo-bar.js —— 頂部跑馬燈列文案輪播：固定時間切換下一句（見
   css/promo-bar.css .promo-bar__msg 的滑動效果），全站每一頁共用同一支
   腳本、同一組文案（文案本身寫在各頁 HTML 的 .promo-bar__track 裡，
   這裡只負責切換，不寫死文案內容）。只有一句訊息時什麼都不用做，
   原本的 .is-active 維持不變，不會憑空多跑一次切換動畫。 */
(function () {
  const track = document.querySelector(".promo-bar__track");
  if (!track) return;
  const messages = Array.from(track.querySelectorAll(".promo-bar__msg"));
  if (messages.length < 2) return;

  const INTERVAL_MS = 4500;
  let current = messages.findIndex((el) => el.classList.contains("is-active"));
  if (current < 0) current = 0;

  // 使用者設定「減少動態效果」時直接切換，不跑滑動位移，呼應全站其他
  // 動效統一遵守 prefers-reduced-motion 的規則。
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function next() {
    const prev = current;
    current = (current + 1) % messages.length;
    const prevEl = messages[prev];
    const nextEl = messages[current];
    prevEl.classList.remove("is-active");
    nextEl.classList.add("is-active");
    if (!reduceMotion) {
      prevEl.classList.add("is-leaving");
      setTimeout(() => prevEl.classList.remove("is-leaving"), 500);
    }
  }

  setInterval(next, INTERVAL_MS);
})();
