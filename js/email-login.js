
(function () {
  const root = document.querySelector('[data-email-login]');
  const account = window.RisuanAccount;
  if (!root || !account) return;
  const emailForm = root.querySelector('[data-email-form]');
  const codeForm = root.querySelector('[data-code-form]');
  const emailInput = emailForm.querySelector('input');
  const codeInput = codeForm.querySelector('input');
  const status = root.querySelector('[data-email-status]');
  const destination = root.querySelector('[data-email-destination]');
  const resend = root.querySelector('[data-email-resend]');
  const change = root.querySelector('[data-email-change]');
  const send = emailForm.querySelector('button');
  const verify = codeForm.querySelector('button[type=submit]');
  const SESSION_KEY = 'risuan-email-login-state';
  let busy = false, cooldownUntil = 0;
  function randomKey() {
    return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function saveState() {
    try {
      if (browserKey && challenge) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ browserKey, challenge, cooldownUntil }));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  }
  let browserKey = null, challenge = null;
  (function restoreState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!saved?.browserKey || !saved?.challenge) return;
      browserKey = saved.browserKey; challenge = saved.challenge; cooldownUntil = saved.cooldownUntil || 0;
      destination.textContent = `驗證碼已寄至 ${challenge.email}`;
      emailInput.value = challenge.email;
      emailForm.hidden = true; codeForm.hidden = false;
      status.textContent = '請在 5 分鐘內輸入信中的 6 位數驗證碼；若未收到，可先查看垃圾郵件。';
    } catch {}
  })();
  function renderControls() {
    const seconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
    resend.disabled = busy || seconds > 0;
    resend.textContent = seconds > 0 ? `重寄驗證碼（${seconds < 60 ? seconds + ' 秒' : Math.ceil(seconds / 60) + ' 分鐘'}）` : '重寄驗證碼';
    send.disabled = busy;
    verify.disabled = busy;
    change.disabled = busy;
    emailInput.readOnly = busy;
    codeInput.readOnly = busy;
  }
  function showError(error) {
    if (error.retryAfter > 0) { cooldownUntil = Date.now() + error.retryAfter * 1000; saveState(); }
    status.textContent = error.message || '暫時無法完成登入，請稍後再試。';
  }
  async function requestCode() {
    if (busy || !emailForm.reportValidity()) return;
    busy = true; renderControls(); status.textContent = '正在寄送驗證碼…';
    try {
      if (!browserKey) browserKey = randomKey();
      const data = await account.requestEmailLoginCode({ email: emailInput.value.trim(), browserKey });
      challenge = { id: data.challengeId, email: data.email };
      emailInput.value = data.email;
      cooldownUntil = Date.now() + data.retryAfter * 1000;
      saveState();
      destination.textContent = `驗證碼已寄至 ${data.email}`;
      emailForm.hidden = true; codeForm.hidden = false;
      codeInput.value = '';
      status.textContent = '請在 5 分鐘內輸入信中的 6 位數驗證碼；若未收到，可先查看垃圾郵件。';
      codeInput.focus();
    } catch (error) { showError(error); }
    finally { busy = false; renderControls(); }
  }
  emailForm.addEventListener('submit', event => { event.preventDefault(); requestCode(); });
  resend.addEventListener('click', () => { if (!resend.disabled) requestCode(); });
  change.addEventListener('click', () => {
    if (busy) return;
    challenge = null; browserKey = null; codeInput.value = '';
    saveState();
    codeForm.hidden = true; emailForm.hidden = false;
    status.textContent = ''; emailInput.focus();
  });
  codeForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !challenge || !codeForm.reportValidity()) return;
    busy = true; renderControls(); status.textContent = '正在確認驗證碼…';
    const code = codeInput.value.trim();
    codeInput.value = '';
    try {
      const customer = await account.loginWithEmailCode({ challengeId: challenge.id, code, browserKey });
      challenge = null; browserKey = null;
      saveState();
      emailForm.reset(); codeForm.reset();
      emailForm.hidden = false; codeForm.hidden = true;
      status.textContent = '登入成功。';
      window.dispatchEvent(new CustomEvent('risuan:login-success', { detail: customer }));
    } catch (error) { showError(error); codeInput.focus(); }
    finally { busy = false; renderControls(); }
  });

  const interval = setInterval(() => { if (!root.hidden && !codeForm.hidden) renderControls(); }, 1000);
  window.addEventListener('pagehide', () => clearInterval(interval), { once: true });
  const query = new URLSearchParams(location.search).get('emailTest') === '1' ? '&emailTest=1' : '';
  fetch(account.API_BASE + '/api/account?action=config' + query, { cache:'no-store' })
    .then(response => { if (!response.ok) throw new Error(); return response.json(); })
    .then(data => { if (data.emailLoginEnabled) root.hidden = false; })
    .catch(() => {});
})();
