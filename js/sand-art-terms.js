/* js/sand-art-terms.js —— 砂畫材料包「購買前請閱讀」條款，全站砂畫商品頁
   共用同一份內容（操作技法、材質敘述都是沙料通用內容，不因圖案／顏色
   不同而有差異）。集中在這裡維護，之後條款內容要修改，只要改這一份，
   所有引用的頁面會一起更新，不用每個 HTML 檔案各自改一次——跟
   colors.css 的變數是同一種「單一來源」精神，只是這裡管的是文字內容
   不是色碼。

   套用方式：頁面裡放一個空的容器 <div class="accordion__body"
   data-sand-art-terms></div>（外層還是各自的 <details class="accordion">
   ＋<summary>，摺疊互動跟樣式沿用既有 .accordion 元件，這支 script
   只負責把內容填進容器，不碰版面），載入這支 script 後會自動渲染。

   目前引用頁面：sand-art-chun.html、sand-art-artist-sheep.html（原本沒有
   這個區塊，2026 補上）。sand-art-light.html／sand-art-collection.html
   暫時維持各自貼上的舊版純 HTML，還沒接上這份共用資料——輕巧版／自由
   創作組之後可能會整個改成個別商品頁，使用者確認過先不動這兩頁，等
   結構定案後再一起接上。 */
(function () {
  const SECTIONS = [
    { intro: "感謝你選擇 Ri Suan Studio 的材料包與手作商品。為了確保每位創作者都有順暢的購買體驗，請花些時間閱讀以下內容。當你在本網站完成訂購，即代表你已閱讀並同意此內容。" },
    { title: "商品資訊", paragraphs: [
      "本店會盡力呈現材料包的實際顏色、內容物與規格，但因螢幕顯示、手作材料批次等因素，可能存在些微差異，請以實際收到的商品為準。",
      "設計稿為參考範例，色塊位置與顏色皆可依個人喜好調整安排，成品會依個人操作手法略有差異，圖片僅供參考，實際成品以手作結果為準。",
    ] },
    { title: "操作提醒", paragraphs: [
      "倒沙時建議在平坦桌面進行，鋪上包裝內附的一次性桌布，避免細沙灑落不易清理。",
    ] },
    { title: "下單與付款", paragraphs: [
      "下單後請依照網站提供的付款方式完成付款。本店保留接受或取消訂單之權利，例如商品缺貨、訂單資料不完整或付款未成功等狀況。",
    ] },
    { title: "出貨安排", paragraphs: [
      "商品將依訂購順序安排出貨，出貨時程將於下單頁面另行公告。",
    ] },
    { title: "材料保存", paragraphs: [
      "沙粒與貼紙開封後請保持乾燥，避免受潮結塊，建議於陰涼乾燥處保存。",
    ] },
    { title: "退換貨政策", paragraphs: [
      "材料包一經拆封使用，恕不接受退換貨。",
      "若收到商品時發現材料瑕疵（如沙料外漏、貼紙損毀、配件缺件等），請於收到商品 7 日內與我們聯繫，我們會協助補寄。",
      "操作過程中因個人手法產生的成品差異，屬手作材料包特性，不在此範圍內。",
    ] },
    { title: "版權聲明", paragraphs: [
      "本材料包所使用之圖案設計，為委託設計創作，版權歸本店所有，未經授權不得重製、轉售或使用於其他商品。",
      "材料包本身歡迎大量採購作為企業禮贈、團體活動或任何個人用途，如需大量訂購，歡迎與我們洽詢優惠方案。",
    ] },
  ];

  const escapeHtml = (str) =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderTermsHTML() {
    return SECTIONS.map((section) => {
      if (section.intro) return `<p>${escapeHtml(section.intro)}</p>`;
      const paras = section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      return `<h3>${escapeHtml(section.title)}</h3>${paras}`;
    }).join("");
  }

  function init() {
    document.querySelectorAll("[data-sand-art-terms]").forEach((el) => {
      el.innerHTML = renderTermsHTML();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
