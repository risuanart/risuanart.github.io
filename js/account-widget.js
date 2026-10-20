/* account-widget.js —— 全站 header 的帳號圖示＋登入/個人資料下拉面板。
   跟 .cart-badge-wrap（購物車圖示）是同一種 UX 語彙：點圖示彈出一個貼齊
   圖示下方的小面板，不是跳頁、不是蓋滿全頁的彈窗。這支檔案只負責畫面與
   互動，登入狀態的讀寫交給 js/account-auth.js（window.RisuanAccount），
   這支本身不碰 localStorage、不直接呼叫後端 API（config／login 除外，
   因為那是 RisuanAccount 本身提供的介面）。

   用 JS 動態插入圖示＋面板的 DOM，不是直接寫進全站 42 個頁面的 HTML——
   這樣往後要調整結構／文案，只要改這一支檔案，不用一個個頁面改過去，
   也不會有「漏改某一頁」的風險。

   插入位置：塞進 .cart-badge-wrap 內部（當它的第一個子元素），不是在它
   旁邊另開一個新的固定定位容器——.cart-badge-wrap 本身在全站至少 4 份
   CSS（cart.css／home.css／home-shop.css／site-menu.css）依頁面模板／
   斷點各自有不同的 position／grid 版位覆寫（固定懸浮角落、header flex
   排版、header grid 排版都有各自的規則），如果帳號圖示另開一個容器，
   等於要把這整組覆寫規則原封不動在抄一份給新容器，任何一處漏改就會
   在某個頁面模板上位置跑掉。塞進既有容器內部，直接繼承它已經在每個
   模板都驗證過的版位，只需要讓 .cart-badge-wrap 本身多一個
   display:flex（見 css/cart.css 底部），不用動任何一條既有的版位規則。 */

(function () {
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function personIconSvg() {
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg>`;
  }

  function buildWrap() {
    const wrap = document.createElement("div");
    wrap.className = "account-badge-wrap";
    wrap.innerHTML = `
      <button type="button" class="account-badge" aria-haspopup="true" aria-expanded="false" aria-label="會員登入">
        ${personIconSvg()}
      </button>
      <div class="account-preview" hidden></div>
    `;
    return wrap;
  }

  function renderLoggedOut(panel) {
    panel.innerHTML = `
      <p class="account-preview__hint">用 Google 帳號登入，下次結帳自動帶入資料</p>
      <div class="account-preview__google-btn" id="account-google-btn"></div>
    `;
    window.RisuanAccount.getGoogleClientId().then((clientId) => {
      if (!clientId) {
        panel.querySelector(".account-preview__hint").textContent = "會員登入功能尚未設定完成";
        return;
      }
      mountGoogleButton(clientId, panel.querySelector("#account-google-btn"));
    });
  }

  function renderLoggedIn(panel, customer) {
    const avatar = customer.picture
      ? `<img class="account-preview__avatar" src="${escapeHtml(customer.picture)}" alt="">`
      : `<span class="account-preview__avatar account-preview__avatar--placeholder">${escapeHtml((customer.name || customer.email || "?").slice(0, 1))}</span>`;
    panel.innerHTML = `
      <div class="account-preview__profile">
        ${avatar}
        <div class="account-preview__who">
          <strong>${escapeHtml(customer.name || "會員")}</strong>
          <span>${escapeHtml(customer.email)}</span>
        </div>
      </div>
      <button type="button" class="account-preview__logout">登出</button>
    `;
    panel.querySelector(".account-preview__logout").addEventListener("click", () => {
      window.RisuanAccount.logout();
    });
  }

  function renderPanel(panel) {
    const customer = window.RisuanAccount.getCustomer();
    if (customer) {
      renderLoggedIn(panel, customer);
    } else {
      renderLoggedOut(panel);
    }
  }

  let gsiLoadPromise = null;
  function loadGsiScript() {
    if (!gsiLoadPromise) {
      gsiLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return gsiLoadPromise;
  }

  function mountGoogleButton(clientId, container) {
    loadGsiScript()
      .then(() => {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => handleCredentialResponse(response, container),
        });
        window.google.accounts.id.renderButton(container, { type: "standard", theme: "outline", size: "medium", width: 220 });
      })
      .catch(() => {
        container.textContent = "Google 登入元件載入失敗，請稍後再試";
      });
  }

  function handleCredentialResponse(response, container) {
    container.textContent = "登入中…";
    window.RisuanAccount.loginWithGoogleCredential(response.credential).catch((err) => {
      container.textContent = `登入失敗：${err.message}`;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const cartBadgeWrap = document.querySelector(".cart-badge-wrap");
    if (!cartBadgeWrap) return;

    const wrap = buildWrap();
    cartBadgeWrap.insertBefore(wrap, cartBadgeWrap.firstChild);

    const button = wrap.querySelector(".account-badge");
    const panel = wrap.querySelector(".account-preview");

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = panel.hasAttribute("hidden");
      if (isHidden) {
        renderPanel(panel);
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener(window.RisuanAccount.CHANGE_EVENT, () => {
      if (!panel.hasAttribute("hidden")) renderPanel(panel);
    });

    window.RisuanAccount.syncProfile();
  });
})();
