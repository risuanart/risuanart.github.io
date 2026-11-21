
(function () {
  document.querySelectorAll('[data-login-details]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const details = document.getElementById('line-data');
    details.open = true;
    details.querySelector('summary').focus();
    details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
  const google = document.getElementById('account-page-google-btn');
  if (google && window.ResizeObserver) {
    let width = Math.floor(google.getBoundingClientRect().width), timer;
    new ResizeObserver(() => {
      const next = Math.floor(google.getBoundingClientRect().width);
      if (next < 200 || next === width || window.RisuanAccount?.getCustomer()) return;
      width = next;
      clearTimeout(timer);
      timer = setTimeout(() => window.RisuanAccount.mountGoogleButton(google, {
        width: Math.min(400, width), size: 'large', text: 'continue_with',
      }), 150);
    }).observe(google);
  }

  // 內建瀏覽器偵測與對應提示（任務 8b）
  // isLine 這個旗標跟 account-auth.js 的 mountGoogleButton 共用同一個
  // isLineInAppBrowser（同一個 UA 判斷式只在一個地方寫），Google 按鈕
  // 本身要不要停用交給 mountGoogleButton 自己擋，這裡不直接動
  // google 容器的內容，避免跟 account-page.js 呼叫 mountGoogleButton
  // 的時機前後搶著改同一個 DOM 節點，曾經因為這樣讓已停用的按鈕又被
  // 蓋回正常可點的 Google 按鈕（連帶造成版面被撐寬）。
  const ua = navigator.userAgent || '';
  const isLine = window.RisuanAccount?.isLineInAppBrowser ?? /\bLine\//i.test(ua);
  const isInstagram = /Instagram/i.test(ua);
  const isOtherInApp = !isLine && !isInstagram && (/FBAN|FBAV/i.test(ua));
  const warning = document.getElementById('account-login-browser-warning');
  if (warning) {
    if (isLine) {
      warning.hidden = false;
      warning.textContent = '在 LINE 內開啟時，Google 登入無法使用，建議改用 Email 登入。';
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'text-link';
      copyBtn.textContent = '複製網址';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(location.href.split('?')[0]).then(() => {
          copyBtn.textContent = '已複製';
          setTimeout(() => { copyBtn.textContent = '複製網址'; }, 2000);
        }).catch(() => {});
      });
      const openBtn = document.createElement('a');
      openBtn.className = 'text-link';
      const openUrl = new URL(location.href);
      openUrl.searchParams.set('openExternalBrowser', '1');
      openBtn.href = openUrl.toString();
      openBtn.textContent = '用瀏覽器開啟';
      warning.append(' ', copyBtn, ' ', openBtn);
    } else if (isOtherInApp) {
      warning.hidden = false;
      warning.textContent = '若無法登入，請改用 Email 登入。';
    }
    // Instagram 內建瀏覽器已實測可直接使用 Google／LINE 登入，不顯示警示、不停用按鈕。
  }

  // 登入選項載入狀態（任務 8b／C1）
  const loadingEl = document.getElementById('account-login-social-loading');
  if (loadingEl) {
    let settled = false;
    const slowTimer = setTimeout(() => {
      if (!settled) {
        const textEl = loadingEl.querySelector('[data-loading-text]');
        if (textEl) textEl.textContent = '載入較慢，可重新整理，或改用 Email 登入。';
      }
    }, 8000);
    function settle() {
      settled = true;
      clearTimeout(slowTimer);
      loadingEl.hidden = true;
    }
    window.addEventListener('risuan:line-config-ready', settle, { once: true });
    setTimeout(() => { if (!settled) settle(); }, 15000);
  }

  // 登入成功回饋（任務 8d）
  const toast = document.getElementById('account-login-toast');
  const welcomeCard = document.getElementById('account-welcome-card');
  const welcomeCardClose = document.getElementById('account-welcome-card-close');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
  }
  if (welcomeCardClose) welcomeCardClose.addEventListener('click', () => { welcomeCard.hidden = true; });

  function announceLogin(customer, isNewUser) {
    if (isNewUser && welcomeCard) {
      welcomeCard.hidden = false;
    } else {
      const label = customer?.name || (customer?.email ? customer.email.split('@')[0] : '');
      showToast(label ? `登入成功，歡迎回來，${label}` : '登入成功');
    }
    const returnTo = sessionStorage.getItem('risuan-login-return-to');
    if (returnTo) {
      sessionStorage.removeItem('risuan-login-return-to');
      try { location.assign(returnTo); } catch {}
    }
  }
  window.addEventListener('risuan:login-success', event => announceLogin(event.detail?.customer, event.detail?.isNewUser));

  const params = new URLSearchParams(location.search);
  if (params.get('lineConnected') === '1') {
    const isNewUser = params.get('isNewUser') === '1';
    history.replaceState(null, '', location.pathname);
    const customer = window.RisuanAccount?.getCustomer();
    if (customer) announceLogin(customer, isNewUser);
    else window.addEventListener(window.RisuanAccount.CHANGE_EVENT, function once(event) {
      if (event.detail?.customer) { window.removeEventListener(window.RisuanAccount.CHANGE_EVENT, once); announceLogin(event.detail.customer, isNewUser); }
    });
  } else if (params.get('lineLinked') === '1') {
    history.replaceState(null, '', location.pathname);
    showToast('LINE 已連結');
  }
})();
