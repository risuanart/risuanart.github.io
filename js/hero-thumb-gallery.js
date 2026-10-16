/* hero-thumb-gallery.js —— 首圖實拍相片牆（主圖＋可橫向滑動縮圖列），
   首款套用在羊Diss舞蹈（紅）首圖。跟 hero-colorway-carousel.js 是兩種
   情境：那支是「固定配色、自動播一輪展示」，不可點擊；這支是「十幾張
   客人實拍照、點縮圖切換主圖」，純點擊互動，不自動播放。

   套在 [data-gallery] 容器上，裡面要有：
   - [data-gallery-main] 底下一串 [data-gallery-frame]（img，疊在一起用
     opacity 切換，跟 .work__intro-photo--carousel 同一種疊圖手法）
   - [data-gallery-caption] 顯示目前這張的說明文字（文字來自每張圖自己
     的 alt，不用另外維護一份字串陣列——陣列容易跟 DOM 順序兜不起來）
   - [data-gallery-thumbs] 底下一串 [data-gallery-thumb]（button，點擊
     切換對應索引的主圖）
   - 容器內的 [data-gallery-nav] 按鈕（value="-1"/"1"）捲動縮圖列，邏輯
     跟 related-products.js 的左右箭頭一樣，固定捲動一段距離。 */

(function () {
  function initGallery(root) {
    var frames = Array.prototype.slice.call(
      root.querySelectorAll("[data-gallery-frame]")
    );
    var thumbs = Array.prototype.slice.call(
      root.querySelectorAll("[data-gallery-thumb]")
    );
    var captionEl = root.querySelector("[data-gallery-caption]");
    var thumbsWrap = root.querySelector("[data-gallery-thumbs]");
    if (frames.length < 2 || thumbs.length !== frames.length) return;

    function setActive(idx) {
      frames.forEach(function (f, i) {
        f.classList.toggle("is-active", i === idx);
      });
      thumbs.forEach(function (t, i) {
        t.classList.toggle("is-active", i === idx);
      });
      if (captionEl) captionEl.textContent = frames[idx].getAttribute("alt") || "";
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () {
        setActive(i);
        thumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
    });

    root.querySelectorAll("[data-gallery-nav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = parseInt(btn.getAttribute("data-gallery-nav"), 10);
        thumbsWrap.scrollBy({ left: dir * 140, behavior: "smooth" });
      });
    });

    setActive(0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-gallery]").forEach(initGallery);
  });
})();
