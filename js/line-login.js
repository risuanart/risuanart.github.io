
(function () {
  const SESSION_KEY = 'risuan-line-oauth';
  const TTL = 10 * 60 * 1000;
  const account = window.RisuanAccount;
  if (!account) return;
  function randomString() {
    return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  }
  function toBase64Url(bytes) {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  async function start(config, link) {
    const customer = account.getCustomer();
    if (link && !customer) throw new Error('請先登入原會員，再連結 LINE。');
    const verifier = randomString();
    const request = { state: randomString(), nonce: randomString(), verifier, createdAt: Date.now(), link, email: link ? customer.email : '' };
    const challenge = toBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(request));
    const params = new URLSearchParams({
      response_type: 'code', client_id: config.lineClientId, redirect_uri: config.lineRedirectUri,
      scope: 'profile openid email', state: request.state, nonce: request.nonce,
      code_challenge: challenge, code_challenge_method: 'S256', ui_locales: 'zh-TW',
    });
    location.assign('https://access.line.me/oauth2/v2.1/authorize?' + params);
  }
  async function finish() {
    const status = document.getElementById('line-callback-status');
    const params = new URLSearchParams(location.search);

    history.replaceState(null, '', location.pathname);
    try {
      const request = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      sessionStorage.removeItem(SESSION_KEY);
      if (!request || !request.state || request.state !== params.get('state') ||
          !Number.isFinite(request.createdAt) || Date.now() - request.createdAt > TTL || Date.now() < request.createdAt) {
        throw new Error('登入請求已過期或不是從這個分頁開始，請回會員中心重新登入。');
      }
      if (params.has('error')) throw new Error('您尚未完成 LINE 授權，可以回會員中心重新登入，或使用訪客入口。');
      if (!params.get('code')) throw new Error('沒有收到 LINE 登入資料，請重新登入。');
      if (request.link && account.getCustomer()?.email !== request.email) throw new Error('原會員登入狀態已變更，請回會員中心重新連結 LINE。');
      await account.loginWithLineCode({ code: params.get('code'), codeVerifier: request.verifier, nonce: request.nonce, link: request.link === true });
      status.textContent = request.link ? 'LINE 已連結，正在回到會員中心…' : '登入成功，正在回到會員中心…';
      location.replace(new URL('../?lineConnected=1', location.href));
    } catch (error) {
      status.textContent = error.message || '登入未完成，請重新登入。';
      document.getElementById('line-callback-back').hidden = false;
    }
  }
  if (document.getElementById('line-callback-status')) { finish(); return; }
  const blocks = [...document.querySelectorAll('[data-line-login]')];
  if (!blocks.length) return;
  let config;
  function render() {
    if (!config?.lineClientId) return;
    const customer = account.getCustomer();
    blocks.forEach(block => {
      const link = block.dataset.lineLogin === 'link';
      const linked = link && customer?.lineLinked;
      block.hidden = false;
      block.querySelector('[data-line-controls]').hidden = Boolean(linked);
      const status = block.querySelector('[data-line-status]');
      status.textContent = linked ? '已連結 LINE，下次可直接使用 LINE 登入同一個會員。' : '';
    });
  }
  blocks.forEach(block => {
    const button = block.querySelector('[data-line-start]');
    const checkbox = block.querySelector('input[type=checkbox]');
    const status = block.querySelector('[data-line-status]');
    checkbox.addEventListener('change', () => { button.disabled = !checkbox.checked; });
    button.addEventListener('click', async () => {
      if (!checkbox.checked || !config?.lineClientId) return;
      button.disabled = true;
      status.textContent = '正在前往 LINE…';
      try { await start(config, block.dataset.lineLogin === 'link'); }
      catch { status.textContent = '無法開始 LINE 登入，請確認瀏覽器允許儲存登入狀態後再試。'; button.disabled = !checkbox.checked; }
    });
  });
  window.addEventListener(account.CHANGE_EVENT, render);
  fetch(account.API_BASE + '/api/account?action=config' + (new URLSearchParams(location.search).get('lineTest') === '1' ? '&lineTest=1' : ''), { cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error(); return response.json(); })
    .then(data => { config = data; render(); })
    .catch(() => {});
})();
