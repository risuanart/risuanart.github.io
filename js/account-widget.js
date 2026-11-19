

















(function () {
  function personIconSvg() {
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg>`;
  }

  function buildWrap() {
    const wrap = document.createElement("div");
    wrap.className = "account-badge-wrap";
    wrap.innerHTML = `
      <a class="account-badge" href="${window.RisuanAccount.BASE_PREFIX}account/" aria-label="前往會員中心">
        ${personIconSvg()}
      </a>
    `;
    return wrap;
  }


  document.addEventListener("DOMContentLoaded", () => {
    const cartBadgeWrap = document.querySelector(".cart-badge-wrap");
    if (!cartBadgeWrap) return;

    const wrap = buildWrap();
    cartBadgeWrap.insertBefore(wrap, cartBadgeWrap.firstChild);

    window.RisuanAccount.syncProfile();
  });
})();
