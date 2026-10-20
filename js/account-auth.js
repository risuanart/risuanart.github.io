/* account-auth.js —— 客人 Google 登入的核心邏輯（不含畫面），全站共用，
   跟後端 api/account.js 配對。登入狀態存在 localStorage（不是 Cookie）——
   官網（risuanart.github.io）跟後端（Vercel）是不同網域，跨網域 Cookie
   在瀏覽器隱私保護下行為不穩定，改成後端簽發一組字串 token，前端自己
   存、每次呼叫 API 自己用 Authorization: Bearer 帶過去，詳見後端
   lib/customer-auth.js 開頭的說明。

   這支檔案只管「登入狀態」本身，不管畫面長什麼樣——header 要顯示的
   帳號圖示／登入彈窗是另一支 js/account-widget.js，結帳頁的自動帶入
   邏輯在 js/checkout.js，兩者都透過這支檔案的 window.RisuanAccount
   介面讀寫登入狀態，不用重複寫一份 localStorage／fetch 邏輯。 */

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

  function writeStored(data) {
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    return stored ? stored.customer : null;
  }

  // 用 Google Identity Services 回傳的 ID Token（credential）跟後端換成
  // 我們自己的登入 token，成功的話存進 localStorage、通知全站更新畫面。
  async function loginWithGoogleCredential(credential) {
    const res = await fetch(`${API_BASE}/api/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "登入失敗");
    writeStored({ token: data.token, customer: data.customer });
    return data.customer;
  }

  function logout() {
    const token = getToken();
    writeStored(null);
    if (!token) return;
    // 純粹讓後端知道一下，token 是 stateless 的，不等回應、失敗也不影響
    // 前端已經登出的狀態。
    fetch(`${API_BASE}/api/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "logout" }),
    }).catch(() => {});
  }

  // 用目前存的 token 跟後端同步一次最新的個人資料（例如上次結帳存的
  // 送貨資訊）。token 過期或已經失效的話後端會回傳 customer: null，這裡
  // 順便清掉本機的登入狀態，不用等客人自己發現「怎麼都沒反應」。
  async function syncProfile() {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/api/account?action=me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.customer) {
        writeStored(null);
        return null;
      }
      writeStored({ token, customer: data.customer });
      return data.customer;
    } catch {
      // 網路暫時不通：維持原本存的狀態，不要因為這次請求失敗就把人登出。
      return getCustomer();
    }
  }

  // Google 登入按鈕要用的用戶端 ID 是公開值，但不想在官網程式碼裡跟
  // Vercel 環境變數各存一份、改了一邊忘記改另一邊，所以每次動態跟後端
  // 要最新值（見 api/account.js handleConfig）。拿不到或沒設定的話回傳
  // 空字串，呼叫端據此直接不渲染登入按鈕。
  let configPromise = null;
  function getGoogleClientId() {
    if (!configPromise) {
      configPromise = fetch(`${API_BASE}/api/account?action=config`)
        .then((res) => res.json())
        .then((data) => data.googleClientId || "")
        .catch(() => "");
    }
    return configPromise;
  }

  window.RisuanAccount = {
    BASE_PREFIX,
    CHANGE_EVENT,
    getCustomer,
    getToken,
    loginWithGoogleCredential,
    logout,
    syncProfile,
    getGoogleClientId,
  };
})();
