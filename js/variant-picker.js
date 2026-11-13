/* variant-picker.js —— 「單一軸向款式選擇器」共用引擎，給材料包加購頁
   用（沙畫底板單買／羊Diss舞蹈底板單買／漸層沙．自選色／沙畫加購色沙
   ・金屬色／流動畫加購字貼）。

   2026-11-14 新增：這 5 頁原本各自有一支幾乎一樣的 picker script
   （baseboard-picker.js／gradient-sand-picker.js／metallic-sand-
   picker.js／word-sticker-picker.js，底板兩頁共用同一支），核心邏輯
   （點縮圖換主圖、記錄目前選的是哪一顆、手機滑動左右切換）完全一樣，
   差異只在「除了換主圖之外，還要不要順便更新價錢／提示文字／顯示
   哪一顆加入購物車按鈕」這幾個可有可無的附加效果。拆成這支共用引擎
   負責核心邏輯，各頁留一支極簡的設定檔呼叫它，之後新增同類型的加購
   選色頁，照抄其中一份設定檔改屬性名稱就好，不用再複製整份邏輯、也
   不會又不小心漏掉手機滑動或多做出桌機箭頭（這支引擎本身就沒有箭頭，
   原因見 products/sand-art-extra-color/index.html 裡 2026-11-14 那段
   說明）。

   不適用於「兩個選擇器互相影響」的頁面（砂畫24色任選組的購買方式／
   色組、沙畫加購像框的尺寸／款式——後者的可選款式會依前者篩選），
   那兩頁的兩軸互動邏輯彼此都不一樣，勉強套進同一個抽象只會變得更難
   懂，維持各自獨立的 sand-24color-picker.js／frame-mockup-picker.js，
   不是漏做，是刻意不做。 */
(function () {
  function initVariantPicker(config) {
    const root = document.querySelector(config.root);
    if (!root) return;

    const chips = Array.from(root.querySelectorAll(config.chipSelector || ".color-picker__chip"));
    const mainImg = root.querySelector(`[${config.mainImgAttr}]`);
    const mainWrap = config.mainWrapAttr ? root.querySelector(`[${config.mainWrapAttr}]`) : null;
    const hintName = config.hintNameAttr ? root.querySelector(`[${config.hintNameAttr}]`) : null;
    const hintColors = config.hintColorsAttr ? root.querySelector(`[${config.hintColorsAttr}]`) : null;
    const priceEl = config.priceAttr ? root.querySelector(`[${config.priceAttr}]`) : null;
    // 加入購物車／直接購買按鈕改成 document 範圍找，不是只在 root（買列
    // 本身）底下找——手機固定購買列（.mobile-sticky-buy）是 <main> 結尾
    // 另外一份獨立 HTML，不在 root 裡面，但一樣要跟著選擇切換顯示哪一顆
    // （跟 metallic-sand-picker.js／frame-mockup-picker.js 原本的做法一致）。
    const addBtns = config.addBtnAttr ? Array.from(document.querySelectorAll(`[${config.addBtnAttr}]`)) : [];
    const buyBtns = config.buyBtnAttr ? Array.from(document.querySelectorAll(`[${config.buyBtnAttr}]`)) : [];
    if (!mainImg || !chips.length) return;

    let index = chips.findIndex((c) => c.getAttribute("aria-pressed") === "true");
    if (index < 0) index = 0;

    function select(idx) {
      index = (idx + chips.length) % chips.length;
      const chip = chips[index];
      chips.forEach((c, i) => c.setAttribute("aria-pressed", i === index ? "true" : "false"));

      const thumbImg = chip.querySelector("img");
      if (thumbImg) {
        mainImg.src = thumbImg.src;
        mainImg.alt = thumbImg.alt;
      }

      const name = chip.querySelector(".color-picker__chip-name");
      if (hintName && name) hintName.textContent = name.textContent;
      if (hintColors && chip.dataset.colors) hintColors.textContent = chip.dataset.colors;
      if (priceEl && chip.dataset.price) priceEl.textContent = `$${Number(chip.dataset.price).toLocaleString()}`;

      if (addBtns.length) {
        addBtns.forEach((btn) => {
          btn.hidden = btn.getAttribute(config.addBtnAttr) !== chip.dataset.product;
        });
      }
      if (buyBtns.length) {
        buyBtns.forEach((btn) => {
          btn.hidden = btn.getAttribute(config.buyBtnAttr) !== chip.dataset.product;
        });
      }

      if (config.onSelect) config.onSelect(chip);
    }

    chips.forEach((chip, i) => {
      chip.addEventListener("click", () => select(i));
    });

    // 觸控滑動（手機）：只在主圖容器內判斷，且水平位移要明顯大於垂直
    // 位移才當作換圖手勢，避免跟頁面正常垂直捲動互相干擾；listener 用
    // passive，不呼叫 preventDefault()，捲動本身不會被卡住。這幾頁故意
    // 不做桌機版的左右箭頭——縮圖本來就能直接點選切換，箭頭是多餘的
    //重複功能，螢幕變寬時 hover 跳出的箭頭還會蓋住圖片邊緣內容。
    if (mainWrap) {
      let startX = 0;
      let startY = 0;
      let tracking = false;

      mainWrap.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length !== 1) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          tracking = true;
        },
        { passive: true }
      );

      mainWrap.addEventListener(
        "touchend",
        (e) => {
          if (!tracking) return;
          tracking = false;
          const touch = e.changedTouches[0];
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
          select(index + (dx < 0 ? 1 : -1));
        },
        { passive: true }
      );
    }

    select(index);
  }

  window.RisuanVariantPicker = { init: initVariantPicker };
})();
