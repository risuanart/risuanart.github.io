(function () {
  const seenKey = "risuan-material-offer-2026";
  const dialog = document.createElement("dialog");
  if (typeof dialog.showModal !== "function") return;

  let storage;
  try {
    storage = window.localStorage;
    if (storage.getItem(seenKey)) return;
  } catch {
    try {
      storage = window.sessionStorage;
      if (storage.getItem(seenKey)) return;
    } catch {
      return;
    }
  }

  const earlyBird = Date.now() < Date.parse("2026-12-16T00:00:00+08:00");
  dialog.className = "material-offer";
  dialog.setAttribute("aria-labelledby", "material-offer-title");
  dialog.innerHTML = `
    <form method="dialog">
      <button class="material-offer__close" type="submit" aria-label="關閉優惠資訊" autofocus>×</button>
    </form>
    <h2 id="material-offer-title">${earlyBird ? "春聯材料包早鳥至 12/15" : "材料包購物優惠"}</h2>
    <p>新會員送 <strong>50 點</strong>，可折 NT$50。</p>
    <p>商品折抵後滿 <strong>NT$1,300</strong> 免運。</p>
    <a class="material-offer__link" href="/account/">加入會員領 50 點</a>
  `;
  document.body.append(dialog);
  dialog.showModal();
  try {
    storage.setItem(seenKey, "1");
  } catch {
    // The card is still dismissible when browser storage is full.
  }
})();
