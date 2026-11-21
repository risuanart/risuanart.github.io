











(function () {
  const BASE_PREFIX = (function () {
    const script =
      document.currentScript ||
      Array.from(document.getElementsByTagName("script")).find((s) =>
        /(^|\/)account-auth\.js(\?|$)/.test(s.getAttribute("src") || "")
      );
    const src = script ? script.getAttribute("src") || "" : "";
    const match = src.match(/^(.*\/)?js\/account-auth\.js/);
    return match && match[1] ? match[1] : "";
  })();

  const API_BASE = "https://risuan-checkout.vercel.app";
  const STORAGE_KEY = "risuan-account";
  const CHANGE_EVENT = "risuan:account-changed";

  function readStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }


  let currentCustomer = null;
  function minimalCustomer(customer) {
    if(!customer)return null;
    const {email,name,picture,pointsBalance,pointsReserved,lineLinked}=customer;
    return {email,name,picture,pointsBalance,pointsReserved,lineLinked};
  }
  function writeStored(data) {
    currentCustomer = data ? data.customer : null;
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token:data.token, customer:minimalCustomer(data.customer) }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: data }));
  }

  function getToken() {
    const stored = readStored();
    return stored ? stored.token : null;
  }

  function getCustomer() {
    const stored = readStored();
    return currentCustomer || (stored ? minimalCustomer(stored.customer) : null);
  }

  const previous = readStored();
  if (previous?.customer) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({token:previous.token,customer:minimalCustomer(previous.customer)})); } catch {}
  }



  async function loginWithGoogleCredential(credential) {
    const res = await fetch(`${API_BASE}/api/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "登入失敗");
    writeStored({ token: data.token, customer: data.customer, isNewUser: data.isNewUser });
    return { customer: data.customer, isNewUser: Boolean(data.isNewUser) };
  }

  async function loginWithLineCode(payload) {
    const token = payload.link ? getToken() : null;
    const res = await fetch(`${API_BASE}/api/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ ...payload, action: "line-login" }),
    });
    const data = await res.json();
    if (!res.ok || !data.token || !data.customer) throw new Error(data.error || "LINE 登入失敗，請重新登入。");
    writeStored({ token: data.token, customer: data.customer, isNewUser: data.isNewUser });
    return { customer: data.customer, isNewUser: Boolean(data.isNewUser) };
  }

  async function emailLoginRequest(action, payload) {
    const response = await fetch(`${API_BASE}/api/account`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, action }),
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || "Email 登入暫時無法使用，請稍後再試。");
      error.retryAfter = Math.max(0, Number(data.retryAfter) || 0);
      throw error;
    }
    return data;
  }
  function requestEmailLoginCode(payload) { return emailLoginRequest("email-code-request", payload); }
  async function loginWithEmailCode(payload) {
    const data = await emailLoginRequest("email-code-verify", payload);
    if (!data.token || !data.customer) throw new Error("登入未完成，請重新取得驗證碼。");
    writeStored({ token: data.token, customer: data.customer, isNewUser: data.isNewUser });
    return { customer: data.customer, isNewUser: Boolean(data.isNewUser) };
  }

  async function logout(options = {}) {
    const token = getToken();
    if (!token) { writeStored(null); return; }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${API_BASE}/api/account`, {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: options.all ? "logout-all" : "logout" }),
      });
      if (!response.ok) throw new Error('未能確認登出成功，請稍後再試。');
      if (getToken() === token) writeStored(null);
    } finally { clearTimeout(timeout); }
  }




  async function syncProfile() {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/api/account?action=me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('暫時無法確認登入狀態');
      const data = await res.json();
      if (getToken() !== token) return getCustomer();
      if (!data.customer) {
        writeStored(null);
        return null;
      }
      writeStored({ token, customer: data.customer });
      return data.customer;
    } catch {

      return getCustomer();
    }
  }





  let configPromise = null;
  function getAuthConfig() {
    if (!configPromise) {
      configPromise = fetch(`${API_BASE}/api/account?action=config`)
        .then((res) => { if (!res.ok) throw new Error('Config unavailable'); return res.json(); })
        .catch(() => ({}));
    }
    return configPromise;
  }
  function getGoogleClientId() { return getAuthConfig().then(data => data.googleClientId || ''); }






  async function apiFetch(pathWithQuery, options = {}) {
    const token = getToken();
    if (!token) throw new Error("尚未登入");
    const res = await fetch(`${API_BASE}${pathWithQuery}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401 && getToken() === token) writeStored(null);
      throw new Error(data.error || "請求失敗");
    }
    return data;
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

  function mountGoogleButton(container, options = {}) {
    getGoogleClientId().then((clientId) => {
      if (!clientId) {
        container.textContent = "會員登入功能尚未設定完成";
        return;
      }
      loadGsiScript()
        .then(() => {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              container.textContent = "登入中…";
              loginWithGoogleCredential(response.credential)
                .then(({ customer, isNewUser }) => {
                  if (options.onLogin) options.onLogin(customer, isNewUser);
                })
                .catch((err) => {
                  container.textContent = `登入失敗：${err.message}`;
                });
            },
          });
          window.google.accounts.id.renderButton(container, {
            type: "standard",
            theme: "outline",
            size: options.size || "medium",
            text: options.text || "signin_with",
            locale: "zh-TW",
            width: options.width || 220,
          });
        })
        .catch(() => {
          container.textContent = "Google 登入元件載入失敗，請稍後再試";
        });
    });
  }







  function splitHomeAddress(receiverAddress) {
    if (!receiverAddress || !window.TW_POSTAL_CODES) return null;
    for (const county of Object.keys(window.TW_POSTAL_CODES)) {
      if (!receiverAddress.startsWith(county)) continue;
      const rest = receiverAddress.slice(county.length);
      for (const district of Object.keys(window.TW_POSTAL_CODES[county])) {
        if (rest.startsWith(district)) {
          return { county, district, detail: rest.slice(district.length) };
        }
      }
    }
    return null;
  }

  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    currentCustomer = null;
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: readStored() }));
  });

  window.RisuanAccount = {
    BASE_PREFIX,
    API_BASE,
    CHANGE_EVENT,
    getCustomer,
    getToken,
    loginWithGoogleCredential,
    loginWithLineCode,
    requestEmailLoginCode,
    loginWithEmailCode,
    logout,
    syncProfile,
    getGoogleClientId,
    getAuthConfig,
    apiFetch,
    mountGoogleButton,
    splitHomeAddress,
  };
})();
