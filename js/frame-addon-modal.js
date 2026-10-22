/* frame-addon-modal.js —— 「加購像框」彈窗，9 個砂畫商品頁共用同一套
   邏輯（只有這 9 頁的 addon-section 會有 [data-addon-modal-trigger]
   跟對應的 [data-addon-modal]，其他頁面沒有這些 data 屬性，這支腳本
   開頭的 querySelectorAll 自然找不到東西，等於沒作用）。

   參考使用者截圖的 davincified.com：加購項目點下去不是直接加入購物車，
   是跳出一個彈窗，裡面有大圖＋尺寸選擇＋加入購物車，決定好再送出。
   彈窗裡的「合成預覽圖」是哪一款砂畫，由觸發按鈕身上的 data-design
   決定（跟 js/frame-mockup-picker.js 用同一批檔名規則：
   mockup-{design}-{size}.jpg），每一頁只要在觸發按鈕寫對 data-design，
   不用整份重複複製彈窗內容。

   尺寸切換用兩顆各自固定 data-product 的按鈕切換 hidden（不是動態改
   同一顆按鈕的 data-product）——cart.js 的 initAddToCart() 在頁面載入
   當下就把 data-product 讀進閉包變數，事後再改不會生效，這個限制跟
   products/sand-art-frame/index.html 那頁遇到的一樣，見該頁面
   js/frame-mockup-picker.js 的說明。 */
(function () {
  const modal = document.querySelector("[data-addon-modal]");
  const triggers = Array.from(document.querySelectorAll("[data-addon-modal-trigger]"));
  if (!modal || !triggers.length) return;

  const design = modal.dataset.design || "fu";
  const img = modal.querySelector("[data-frame-modal-img]");
  const priceEl = modal.querySelector("[data-frame-modal-price]");
  const sizeChips = Array.from(modal.querySelectorAll(".frame-size-picker__chip"));
  const addBtns = Array.from(modal.querySelectorAll("[data-frame-modal-add-btn]"));
  const closeEls = Array.from(modal.querySelectorAll("[data-addon-modal-close]"));

  function updateImage(size) {
    if (!img) return;
    img.src = `../../assets/images/products/sand-art-frame/mockup-${design}-${size}.jpg`;
  }

  sizeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      sizeChips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
      const size = chip.dataset.size;
      if (priceEl) priceEl.textContent = `$${chip.dataset.price}`;
      addBtns.forEach((btn) => {
        btn.hidden = btn.dataset.frameModalAddBtn !== size;
      });
      updateImage(size);
    });
  });

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  triggers.forEach((trigger) => trigger.addEventListener("click", openModal));
  closeEls.forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  // 加入購物車成功後順手關掉彈窗，不用使用者自己再按一次關閉——
  // cart.js 的 initAddToCart() 本身沒有「加入後要不要關彈窗」的概念，
  // 用全站共用的 cart:updated 事件（writeCart() 內會 dispatch，見
  // cart.js）判斷「使用者剛剛做了加入購物車這個動作」，不用另外攔截
  // 兩顆按鈕各自的 click。
  document.addEventListener("cart:updated", () => {
    if (!modal.hidden) closeModal();
  });
})();
