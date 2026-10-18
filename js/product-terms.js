/* js/product-terms.js —— 材料包購買資訊，全站（流動畫＋砂畫）共用同一份
   資料來源，不是各材質分開各自維護。

   2026-10-18：參考 fisherm.co 商品頁做法，使用者反饋出貨時間、顏色落差、
   材料保存、操作提醒這幾項太重要，不該摺在「購買前請閱讀」手風琴裡才
   看得到。拆成兩塊輸出：
   - renderHighlightsHTML()：常駐展開的重點區塊（出貨時間／顏色提醒／
     材料保存／操作提醒），放在買列下方，不需要點開。
   - renderTermsHTML()：手風琴裡的完整條款，份量較重、較少影響購買
     決策的部分（下單與付款、退換貨政策、版權聲明等）留在這裡，不重複
     放已經常駐顯示的出貨／材料保存／操作提醒。

   比對過流動畫（輕巧版／禮盒版）跟砂畫（春／羊Diss舞蹈 Sheep La Danse）原本各自貼死的
   條款內容，發現約一半是逐字相同的通用政策文字，跟材質完全無關；另一半
   才是真的因材質不同而需要分開寫。這裡把兩層拆開：UNIVERSAL 放通用
   文字，MATERIALS 依材質分別放專屬文字——通用政策要改，只要改 UNIVERSAL
   一次，流動畫／砂畫所有頁面一起更新；材質專屬文字則各自維護在
   MATERIALS 底下對應的鍵值。

   套用方式：
   - 常駐重點區塊：<div class="info-highlights" data-product-info-
     highlights="sand-art"></div>（或 "fluid-art"），放在
     .work-heading__buy-row 下方、</header> 之前。
   - 手風琴條款：<div class="accordion__body" data-product-terms=
     "sand-art"></div>（或 "fluid-art"），外層 <details class="accordion">
     ＋<summary>，摺疊互動跟樣式沿用既有 .accordion 元件。
   這支 script 只負責把內容填進容器，不碰版面。

   目前引用頁面：
   - sand-art：sand-art-chun、sand-art-cai、sand-art-fu、sand-art-na-fu、
     sand-art-na-fu-lantern、sand-art-ying-chun、sand-art-ying-chun-lantern、
     sand-art-artist-sheep-red、sand-art-artist-sheep-blue
   - fluid-art：fluid-art-light-red、fluid-art-light-pink、fluid-art-gift
   sand-art-light.html／sand-art-collection.html 暫時維持各自貼上的舊版
   純 HTML，還沒接上這份共用資料（已下架，不補）。 */
(function () {
  const UNIVERSAL = {
    intro: "感謝你選擇 Ri Suan Studio 的材料包與手作商品。為了確保每位創作者都有順暢的購買體驗，請花些時間閱讀以下內容。當你在本網站完成訂購，即代表你已閱讀並同意此內容。",
    productInfoFirst: "本店會盡力呈現材料包的實際顏色、內容物與規格，但因螢幕顯示、手作材料批次等因素，可能存在些微差異，請以實際收到的商品為準。",
    ordering: "下單後請依照網站提供的付款方式完成付款。本店保留接受或取消訂單之權利，例如商品缺貨、訂單資料不完整或付款未成功等狀況。",
    shipping: "商品將依訂購順序安排出貨，出貨時程將於下單頁面另行公告。",
    returnPolicyFirst: "材料包一經拆封使用，恕不接受退換貨。",
    copyrightSecond: "材料包本身歡迎大量採購作為企業禮贈、團體活動或任何個人用途，如需大量訂購，歡迎與我們洽詢優惠方案。",
  };

  const MATERIALS = {
    "sand-art": {
      productInfoSecond: "設計稿為參考範例，色塊位置與顏色皆可依個人喜好調整安排，成品會依個人操作手法略有差異，圖片僅供參考，實際成品以手作結果為準。",
      prep: null,
      handling: "倒沙時建議在平坦桌面進行，鋪上包裝內附的一次性桌布，避免細沙灑落不易清理。",
      storage: "沙粒與貼紙開封後請保持乾燥，避免受潮結塊，建議於陰涼乾燥處保存。",
      returnDefect: "若收到商品時發現材料瑕疵（如沙料外漏、貼紙損毀、配件缺件等），請於收到商品 7 日內與我們聯繫，我們會協助補寄。",
      returnCraft: "操作過程中因個人手法產生的成品差異，屬手作材料包特性，不在此範圍內。",
      copyrightFirst: "本材料包所使用之圖案設計，為委託設計創作，版權歸本店所有，未經授權不得重製、轉售或使用於其他商品。",
    },
    "fluid-art": {
      productInfoSecond: "流動畫為自動性技法，顏料倒入後的流動紋路為隨機生成，每件成品皆獨一無二，圖片僅供參考，實際成品會依操作手法略有差異。",
      prep: "顏料使用前請輕輕搖晃均勻，讓沉澱部分融合，避免大力搖晃產生氣泡，影響流動畫的呈現效果。",
      handling: "顏料如沾染衣物，可能無法完全清洗去除，建議操作時穿著不介意弄髒的服飾，並配戴手套。",
      storage: "顏料開封後請盡快使用完畢，避免長時間曝曬或高溫存放。",
      returnDefect: "若收到商品時發現材料瑕疵（如顏料外漏、字貼損毀、配件缺件等），請於收到商品 7 日內與我們聯繫，我們會協助補寄。",
      returnCraft: "操作過程中因個人手法產生的成品差異，屬流動畫技法特性，不在此範圍內。",
      copyrightFirst: "本材料包所使用之書法字體，為委託設計創作，版權歸本店所有，未經授權不得重製、轉售或使用於其他商品。",
    },
  };

  /* 常駐重點區塊的短列點版本——跟上面 MATERIALS／UNIVERSAL 的完整句子
     分開維護，因為這裡要的是精簡、一眼看完的列點，不是手風琴裡的完整
     句子。改這裡不會影響手風琴內容，反之亦然。 */
  const HIGHLIGHTS_UNIVERSAL = {
    shipping: [
      "商品依訂購順序安排出貨，出貨時程將於下單頁面另行公告",
      "預購商品將於公告的出貨區間內陸續寄出，不逐一另行通知",
      "如遇國定假日或出貨量較大時期，時程可能略有延後",
    ],
    color: [
      "因螢幕顯示設定不同，頁面照片與實際收到的材料包顏色可能有些微落差",
      "設計稿為參考範例，色塊位置與顏色皆可依個人喜好調整安排",
    ],
  };

  const HIGHLIGHTS_MATERIALS = {
    "sand-art": {
      storage: [
        "沙粒與貼紙開封後請保持乾燥，避免受潮結塊",
        "建議於陰涼乾燥處保存，避免長時間日曬",
      ],
      handling: [
        "倒沙時建議在平坦桌面進行，鋪上包裝內附的一次性桌布",
        "避免細沙灑落不易清理",
      ],
    },
    "fluid-art": {
      storage: [
        "顏料開封後請盡快使用完畢",
        "避免長時間曝曬或高溫存放",
      ],
      handling: [
        "顏料使用前請輕輕搖晃均勻，避免大力搖晃產生氣泡",
        "顏料如沾染衣物不易清洗，建議穿著不介意弄髒的服飾並配戴手套",
      ],
    },
  };

  const escapeHtml = (str) =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderHighlightsHTML(materialKey) {
    const m = HIGHLIGHTS_MATERIALS[materialKey];
    if (!m) return "";

    const sections = [
      { title: "出貨時間", items: HIGHLIGHTS_UNIVERSAL.shipping },
      { title: "顏色提醒", items: HIGHLIGHTS_UNIVERSAL.color },
      { title: "材料保存", items: m.storage },
      { title: "操作提醒", items: m.handling },
    ];

    return sections.map((section) => {
      const items = section.items.map((item) =>
        `<li><span class="info-highlights__bullet" aria-hidden="true">✦</span><span>${escapeHtml(item)}</span></li>`
      ).join("");
      return `<div class="info-highlights__section"><p class="info-highlights__title">【 ${escapeHtml(section.title)} 】</p><ul class="info-highlights__list">${items}</ul></div>`;
    }).join("");
  }

  function renderTermsHTML(materialKey) {
    const m = MATERIALS[materialKey];
    if (!m) return "";

    const sections = [
      { intro: UNIVERSAL.intro },
      { title: "商品資訊", paragraphs: [UNIVERSAL.productInfoFirst, m.productInfoSecond] },
      m.prep ? { title: "使用前準備", paragraphs: [m.prep] } : null,
      { title: "下單與付款", paragraphs: [UNIVERSAL.ordering] },
      { title: "退換貨政策", paragraphs: [UNIVERSAL.returnPolicyFirst, m.returnDefect, m.returnCraft] },
      { title: "版權聲明", paragraphs: [m.copyrightFirst, UNIVERSAL.copyrightSecond] },
    ].filter(Boolean);

    return sections.map((section) => {
      if (section.intro) return `<p>${escapeHtml(section.intro)}</p>`;
      const paras = section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      return `<h3>${escapeHtml(section.title)}</h3>${paras}`;
    }).join("");
  }

  function init() {
    document.querySelectorAll("[data-product-info-highlights]").forEach((el) => {
      el.innerHTML = renderHighlightsHTML(el.dataset.productInfoHighlights);
    });
    document.querySelectorAll("[data-product-terms]").forEach((el) => {
      el.innerHTML = renderTermsHTML(el.dataset.productTerms);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
