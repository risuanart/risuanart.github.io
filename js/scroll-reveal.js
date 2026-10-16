// 捲動淡入：跟母頁（products/index.html）同一套 .fade-in／.is-visible
// 動效語言，套用在 .fade-in 元素上，捲進畫面時才淡入＋位移歸位。
//
// 2026-10 修正：原本 threshold:0.15 要求「元素自己高度的 15% 進入畫面」
// 才觸發。遇到很高的區塊（例如「怎麼玩」整組步驟圖片／影片包在同一個
// .fade-in 容器裡）15% 動輒是幾百 px，使用者往下滑很深一段距離，畫面
// 都還是空的，容易被誤會成網站壞了、內容沒載入，不是動畫節奏的問題。
// 改成 threshold:0，元素只要有任何一點點進入畫面就觸發，不用等到一定
// 比例。
//
// 原本想再加 rootMargin 讓元素「實際捲進畫面之前」就提早觸發，試過之後
// 發現這個站的頁面捲動容器是 .product-page（position:fixed +
// overflow-y:auto，不是瀏覽器原生的 document 捲動），它自己的 overflow
// 裁切範圍正好等於可視區域——rootMargin 只能擴張 IntersectionObserver
// 概念上的比對範圍，沒辦法讓瀏覽器「看到」已經被這層 overflow 實際裁掉
// 的像素，兩者疊加起來等於沒有效果，所以沒有保留 rootMargin，單靠
// threshold:0 已經足夠解決「要捲很深才出現」的問題。
(function () {
  const els = document.querySelectorAll(".fade-in");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0 }
  );

  els.forEach((el) => observer.observe(el));
})();
