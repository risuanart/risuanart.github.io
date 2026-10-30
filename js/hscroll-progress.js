// hscroll-progress.js —— 橫向滑動區塊的捲動進度列（1px 髮絲線 + 隨捲動
// 位置移動的加粗線段）。上架前待修清單任務 2 為首頁「課程精選」新增，
// 寫成通用元件（不寫死選到課程精選），之後任務 7（媒材子頁作品展示橫滑）
// 要共用同一組元件時直接套用同樣的 data 屬性即可，不用另外寫一份。
//
// 用法：橫向捲動的容器加 data-hscroll，緊接在它後面放一個帶
// data-hscroll-progress 屬性、裡面有一個 .hscroll-progress__bar 的元素，
// 這支腳本會自動配對、算出可視比例與捲動比例，更新加粗線段的寬度與位置。
(function () {
  const tracks = document.querySelectorAll("[data-hscroll]");

  tracks.forEach((track) => {
    const progress = track.nextElementSibling;
    if (!progress || !progress.hasAttribute("data-hscroll-progress")) return;
    const bar = progress.querySelector(".hscroll-progress__bar");
    if (!bar) return;

    function update() {
      const trackWidth = track.clientWidth;
      const scrollWidth = track.scrollWidth;
      const maxScroll = scrollWidth - trackWidth;
      const progressWidth = progress.clientWidth;

      // 捲動軌道比視窗窄（例如桌機版不會橫向捲動）時，加粗線段撐滿整條
      // 髮絲線，不顯示成一小段，避免看起來像「還能滑」但其實滑不動。
      if (maxScroll <= 0) {
        bar.style.width = progressWidth + "px";
        bar.style.transform = "translateX(0)";
        return;
      }

      const visibleRatio = Math.min(1, trackWidth / scrollWidth);
      const barWidth = progressWidth * visibleRatio;
      const scrollRatio = track.scrollLeft / maxScroll;
      const travel = progressWidth - barWidth;

      bar.style.width = barWidth + "px";
      bar.style.transform = `translateX(${travel * scrollRatio}px)`;
    }

    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
})();
