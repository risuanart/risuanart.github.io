/* sand-art-cutout-shuffle.js —— 材料包總覽頁「砂畫：細節需要大人協助」
   那段的輪播（.img-box--cutout--combo[data-hero-carousel]），裡面放了
   全部 7 款有配色示範圖的砂畫產品各一張出貨配色圖，使用者要求播放
   順序「隨機、不重複」。

   js/hero-colorway-carousel.js 本身只照 DOM 順序從第一張開始播，不會
   自己打亂順序，所以這支腳本要在它之前載入（<script> 標籤順序），
   先把這組 <img data-carousel-frame> 在 DOM 裡做一次 Fisher–Yates
   洗牌，洗牌後第一張才是真正隨機決定；7 張各自代表不同商品，洗牌是
   排列順序不是抽樣放回，天生就不會連續兩次播到同一款。只在這支特定
   輪播容器上動手，不影響頁面上其他固定順序的配色輪播（例如下面「全
   系列材料包」格狀卡，那些是出貨配色／示範配色二／三照固定順序播，
   不能被打亂）。 */
(function () {
  const container = document.querySelector(".img-box--cutout--combo[data-hero-carousel]");
  if (!container) return;

  const frames = Array.prototype.slice.call(container.querySelectorAll("[data-carousel-frame]"));
  if (frames.length < 2) return;

  for (let i = frames.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = frames[i];
    frames[i] = frames[j];
    frames[j] = tmp;
  }

  // appendChild 搬動既有節點（不是複製），依洗牌後的順序重新插入，
  // 洗牌完的陣列順序就是最終 DOM 順序。
  frames.forEach((frame) => container.appendChild(frame));
  frames.forEach((frame, i) => frame.classList.toggle("is-active", i === 0));
})();
