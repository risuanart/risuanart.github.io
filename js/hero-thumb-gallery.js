/* hero-thumb-gallery.js —— 首圖實拍相片牆（主圖＋可橫向滑動縮圖列），
   首款套用在羊Diss舞蹈（紅）首圖。跟 hero-colorway-carousel.js 是兩種
   情境：那支是「固定配色、自動播一輪展示」，不可點擊；這支是「十幾張
   客人實拍照」，預設自動輪播（一直循環，不像配色展示播一輪就停——這裡
   沒有「播完代表看完全部配色」的概念，純粹是讓訪客進頁面就能看到更多
   實拍照，不用自己動手滑），但保留點縮圖／滑動手動切換的互動。

   滑鼠移進整個元件只是「暫停」（手離開會接著播，讓想定格看某張的人不會
   被跳走）；真的點了縮圖／箭頭／手動滑動縮圖列，才會「永久停止」自動
   播放——使用者既然自己選了想看哪張，就不該再被自動跳走，這跟
   hero-colorway-carousel.js 的暫停／播放鍵是兩種節奏（那邊永遠可以按鍵
   恢復播放，這裡手動介入後不會自動恢復）。

   套在 [data-gallery] 容器上，裡面要有：
   - [data-gallery-main] 底下一串 [data-gallery-frame]（img，疊在一起用
     opacity 切換，跟 .work__intro-photo--carousel 同一種疊圖手法）
   - [data-gallery-thumbs] 底下一串 [data-gallery-thumb]（button，點擊
     切換對應索引的主圖，自動播放時縮圖列也會跟著捲動讓目前這張保持在
     可視範圍內）
   - 容器內的 [data-gallery-nav] 按鈕（value="-1"/"1"）捲動縮圖列，邏輯
     跟 related-products.js 的左右箭頭一樣，固定捲動一段距離。 */

(function () {
  var INTERVAL_MS = 2600;

  function initGallery(root) {
    var frames = Array.prototype.slice.call(
      root.querySelectorAll("[data-gallery-frame]")
    );
    var thumbs = Array.prototype.slice.call(
      root.querySelectorAll("[data-gallery-thumb]")
    );
    var thumbsWrap = root.querySelector("[data-gallery-thumbs]");
    if (frames.length < 2 || thumbs.length !== frames.length) return;

    var index = 0;
    var timer = null;
    var stoppedByUser = false;
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function setActive(idx, scrollThumb) {
      index = idx;
      frames.forEach(function (f, i) {
        f.classList.toggle("is-active", i === idx);
      });
      thumbs.forEach(function (t, i) {
        t.classList.toggle("is-active", i === idx);
      });
      if (scrollThumb) {
        thumbs[idx].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }

    function pauseAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function resumeAutoplay() {
      if (stoppedByUser || prefersReducedMotion) return;
      pauseAutoplay();
      timer = setInterval(function () {
        setActive((index + 1) % frames.length, true);
      }, INTERVAL_MS);
    }

    function stopAutoplayForGood() {
      stoppedByUser = true;
      pauseAutoplay();
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () {
        stopAutoplayForGood();
        setActive(i, true);
      });
    });

    root.querySelectorAll("[data-gallery-nav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        stopAutoplayForGood();
        var dir = parseInt(btn.getAttribute("data-gallery-nav"), 10);
        thumbsWrap.scrollBy({ left: dir * 140, behavior: "smooth" });
      });
    });

    thumbsWrap.addEventListener("pointerdown", stopAutoplayForGood);
    root.addEventListener("mouseenter", pauseAutoplay);
    root.addEventListener("mouseleave", resumeAutoplay);

    setActive(0, false);
    resumeAutoplay();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-gallery]").forEach(initGallery);
  });
})();
