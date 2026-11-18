/* hero-thumb-gallery.js —— 首圖實拍相片牆（主圖＋可橫向滑動縮圖列），
   首款套用在羊Diss舞蹈 / 紅首圖。跟 hero-colorway-carousel.js 是兩種
   情境：那支是「固定配色、自動播一輪展示」，不可點擊；這支是「十幾張
   客人實拍照」，預設自動輪播（一直循環，不像配色展示播一輪就停——這裡
   沒有「播完代表看完全部配色」的概念，純粹是讓訪客進頁面就能看到更多
   實拍照，不用自己動手滑），但保留點縮圖／滑動手動切換的互動。

   手動切換後重新計時繼續輪播；桌面滑鼠停留暫停，手機觸控不永久停止。

   套在 [data-gallery] 容器上，裡面要有：
   - [data-gallery-main] 底下一串 [data-gallery-frame]（img，疊在一起用
     opacity 切換，跟 .work__intro-photo--carousel 同一種疊圖手法）
   - [data-gallery-thumbs] 底下一串 [data-gallery-thumb]（button，點擊
     切換對應索引的主圖，自動播放時縮圖列也會跟著捲動讓目前這張保持在
     可視範圍內）
   - 容器內的 [data-gallery-nav] 按鈕（value="-1"/"1"）捲動縮圖列，邏輯
     跟 related-products.js 的左右箭頭一樣，固定捲動一段距離。

   2026-10-25 新增「多格主圖對應一個縮圖」的分組功能：原本是嚴格 1
   對 1（frames.length === thumbs.length），改成某個 [data-gallery-thumb]
   可以用 data-gallery-thumb-count="3" 宣告自己代表主圖裡連續 3 格
   （目前用在 combo-1／2／3 配色輪播縮成一個縮圖格——使用者反饋不想要
   縮圖牆開頭塞 3 個分開的小菱形縮圖，只想要一個縮圖、裡面自己也跟著
   主圖同步輪播）。縮圖按鈕沒有這個屬性時預設代表 1 格，行為跟改之前
   完全一樣。分組縮圖內部要放對應張數的
   [data-gallery-thumb-frame]（img，一樣用 opacity 疊圖），
   setActive() 切主圖時會同步切縮圖內部對應那一張。

   2026-10-25 另外修掉一個嚴重的效能 bug：[data-gallery-frame] 裡的
   <video>（例如鋪色過程展示影片）疊在跟主圖同一個 box 裡用 opacity
   切換，原本 js/video-inview.js 的 IntersectionObserver 只看「容器有沒有
   進入畫面」，疊在同一個 box 的好幾支 video 全部會被判定成「進入畫面」
   而同時 play()，不管哪一支當下其實是 is-active——實測一個商品頁因此
   同時在背景播放＋下載 3 支影片（共十幾 MB），是「頁面載入變慢」的
   主因之一。這裡改成由這支腳本自己管理：setActive() 切主圖的同時，只
   play() 真正 is-active 的那一支 video，其餘全部 pause()；
   video-inview.js 已經排除了 [data-gallery-frame]，不會再搶著 play()。
   另外用一個獨立的 IntersectionObserver 盯著整個 [data-gallery] 容器，
   捲出畫面時暫停目前這支 video、捲回來才恢復播放，補回原本
   video-inview.js 提供的「離開視野省資源」效果。 */

(function () {
  var INTERVAL_MS = 4500;
  // 2026-10-25：首圖現在固定是配色示範一（combo-1，出貨配色，見下面
  // setActive(0, false) 的說明），比照 hero-colorway-carousel.js 同一天
  // 的改動，讓圖一停留久一點再往下輪播到配色示範二／三、接著才是真實
  // 相片牆的其餘照片。
  var FIRST_FRAME_MS = 1800;

  function initGallery(root) {
    var frames = Array.prototype.slice.call(
      root.querySelectorAll("[data-gallery-frame]")
    );
    var thumbs = Array.prototype.slice.call(
      root.querySelectorAll("[data-gallery-thumb]")
    );
    var thumbsWrap = root.querySelector("[data-gallery-thumbs]");
    if (frames.length < 2 || thumbs.length < 1) return;

    // frameToThumb[frame 索引] = 對應的縮圖索引；thumbStartFrame[縮圖索引]
    // = 這個縮圖代表的第一格主圖索引；thumbSubFrames[縮圖索引] = 縮圖內部
    // 疊圖用的 img 陣列（沒有分組、只代表 1 格的縮圖是 null，用原本單一
    // <img> 的樣式，不套疊圖邏輯）。
    var frameToThumb = [];
    var thumbStartFrame = [];
    var thumbSubFrames = [];
    var cursor = 0;
    thumbs.forEach(function (thumb, tIdx) {
      var count = parseInt(thumb.getAttribute("data-gallery-thumb-count") || "1", 10);
      thumbStartFrame[tIdx] = cursor;
      var subFrames = Array.prototype.slice.call(
        thumb.querySelectorAll("[data-gallery-thumb-frame]")
      );
      thumbSubFrames[tIdx] = subFrames.length ? subFrames : null;
      for (var k = 0; k < count; k++) {
        frameToThumb[cursor] = tIdx;
        cursor++;
      }
    });
    // 分組設定跟實際主圖張數對不上（例如 data-gallery-thumb-count 寫錯），
    // 直接放棄初始化這個元件，維持全部靜態顯示第一張，不要用錯誤的
    // index 對應關係硬跑，造成主圖/縮圖對不起來的視覺 bug。
    if (cursor !== frames.length) return;

    var index = 0;
    var timer = null;

    var galleryInView = true;
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 只 play() 目前 is-active 的 video、其餘全部 pause()——不管容器本身
    // 有沒有進入畫面都要先套用這個規則，galleryInView 再疊加一層「整個
    // 相片牆根本不在畫面上」的額外暫停（見下面 IntersectionObserver）。
    function syncVideoPlayback() {
      frames.forEach(function (f, i) {
        if (f.tagName !== "VIDEO") return;
        if (i === index && galleryInView && !document.hidden) {
          f.play().catch(function () {});
        } else {
          f.pause();
        }
      });
    }

    // 2026-10-22 新增：桌面版縮圖牆移到主圖左側時（見
    // css/products.css .work__gallery--thumbs-left，目前只有
    // products/sand-art-fu/index.html 用），縮圖列從水平排列改垂直排列，
    // 捲動方向也要跟著從水平改垂直——只在「真的掛了這個 class、而且
    // 當下螢幕寬度有套用那組 ≥1024px CSS」才切換，其他 8 個沒有這個
    // class 的頁面、或這一頁在窄螢幕下，isVertical() 都回傳 false，
    // 行為跟原本完全一樣。
    function isVertical() {
      return (
        root.classList.contains("work__gallery--thumbs-left") &&
        window.matchMedia("(min-width: 1024px)").matches
      );
    }

    function scrollThumbIntoView(thumbIdx) {
      // 只捲動縮圖列自己的 scrollLeft／scrollTop，不用
      // Element.scrollIntoView()——那個方法會一路往上找到所有可捲動的
      // 祖先容器（包含整個頁面），使用者滑到頁面下方時，自動輪播還是會
      // 把整個頁面捲回相片牆的位置，造成「輪播時頁面往上跳」的 bug。
      // 改成直接算縮圖相對縮圖列的位置，只動 thumbsWrap 自己的捲動，
      // 另一個方向完全不碰。參數是縮圖索引（不是主圖索引）——分組縮圖
      // 底下對應好幾格主圖，捲動目標是那一個縮圖本身，不會每格主圖
      // 切換都重新捲動一次。
      var thumb = thumbs[thumbIdx];
      var wrapRect = thumbsWrap.getBoundingClientRect();
      var thumbRect = thumb.getBoundingClientRect();
      if (isVertical()) {
        var deltaY = (thumbRect.top + thumbRect.height / 2) - (wrapRect.top + wrapRect.height / 2);
        thumbsWrap.scrollBy({ top: deltaY, behavior: "smooth" });
      } else {
        var deltaX = (thumbRect.left + thumbRect.width / 2) - (wrapRect.left + wrapRect.width / 2);
        thumbsWrap.scrollBy({ left: deltaX, behavior: "smooth" });
      }
    }

    function setActive(idx, scrollThumb) {
      index = idx;
      frames.forEach(function (f, i) {
        f.classList.toggle("is-active", i === idx);
      });
      var activeThumbIdx = frameToThumb[idx];
      thumbs.forEach(function (t, i) {
        t.classList.toggle("is-active", i === activeThumbIdx);
      });
      // 分組縮圖內部疊圖同步：目前主圖落在這個縮圖代表的第幾格，就讓
      // 縮圖內部對應那張 is-active，縮圖本身也跟著主圖一起「輪播」。
      var subFrames = thumbSubFrames[activeThumbIdx];
      if (subFrames) {
        var localIdx = idx - thumbStartFrame[activeThumbIdx];
        subFrames.forEach(function (img, i) {
          img.classList.toggle("is-active", i === localIdx);
        });
      }
      if (scrollThumb) {
        scrollThumbIntoView(activeThumbIdx);
      }
      // 下一張影片先讀取，切換前保留其 poster，避免空白。
      var upcoming = frames[(idx + 1) % frames.length];
      if (upcoming.tagName === "VIDEO" && upcoming.preload === "none") { upcoming.preload = "auto"; upcoming.load(); }
      syncVideoPlayback();
    }

    function pauseAutoplay() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function resumeAutoplay() {
      if (prefersReducedMotion || document.hidden) return;
      pauseAutoplay();
      var grouped = thumbSubFrames[frameToThumb[index]];
      var duration = grouped ? FIRST_FRAME_MS : (frames[index].tagName === "VIDEO" ? 8000 : INTERVAL_MS);
      timer = setTimeout(function () {
        setActive((index + 1) % frames.length, true);
        resumeAutoplay();
      }, duration);
    }

    function restartAutoplayAfterInteraction() {
      pauseAutoplay();
      resumeAutoplay();
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () {
        setActive(thumbStartFrame[i], true);
        restartAutoplayAfterInteraction();
      });
    });

    root.querySelectorAll("[data-gallery-nav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        restartAutoplayAfterInteraction();
        var dir = parseInt(btn.getAttribute("data-gallery-nav"), 10);
        if (isVertical()) {
          thumbsWrap.scrollBy({ top: dir * 110, behavior: "smooth" });
        } else {
          thumbsWrap.scrollBy({ left: dir * 140, behavior: "smooth" });
        }
      });
    });

    thumbsWrap.addEventListener("pointerdown", restartAutoplayAfterInteraction);
    root.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) pauseAutoplay(); });
    root.addEventListener("mouseleave", resumeAutoplay);

    // 整個相片牆捲出畫面時暫停目前這支 video（不影響自動輪播的 timer，
    // 回到畫面時 syncVideoPlayback() 會依照當下 index 重新 play 正確的
    // 那一支，不是從頭重播）。
    if (frames.some(function (f) { return f.tagName === "VIDEO"; })) {
      var visibilityObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            galleryInView = entry.isIntersecting;
            syncVideoPlayback();
          });
        },
        { threshold: 0.1 }
      );
      visibilityObserver.observe(root);
    }


    let swipeStart = null;
    root.querySelector("[data-gallery-main]").addEventListener("touchstart", (e) => {
      swipeStart = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true });
    root.querySelector("[data-gallery-main]").addEventListener("touchcancel", () => { swipeStart = null; }, { passive: true });
    root.querySelector("[data-gallery-main]").addEventListener("touchend", (e) => {
      if (!swipeStart || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - swipeStart.x;
      const dy = e.changedTouches[0].clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
      setActive((index + (dx < 0 ? 1 : -1) + frames.length) % frames.length, true); resumeAutoplay();
    }, { passive: true });
    document.addEventListener("visibilitychange", function () { syncVideoPlayback(); if (document.hidden) pauseAutoplay(); else resumeAutoplay(); });
    window.addEventListener("pageshow", function () { syncVideoPlayback(); resumeAutoplay(); });
    setActive(0, false);
    resumeAutoplay();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-gallery]").forEach(initGallery);
  });
})();
