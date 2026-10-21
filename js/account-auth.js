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

  // 帶 Authorization header 呼叫 api/account.js 的共用介面，給會員中心
  // （js/account-page.js）的 orders／bookings／order-detail／
  // update-profile 這幾個一定要帶 token 的 action 用，不用每個呼叫點各自
  // 重複組 header、各自重複判斷「沒 token 就不用送」。沒有 token 時直接
  // 丟出例外，呼叫端統一用 try/catch 處理「未登入」。
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
    if (!res.ok) throw new Error(data.error || "請求失敗");
    return data;
  }

  // Google Identity Services 登入按鈕的共用渲染邏輯——header 的帳號面板
  // （js/account-widget.js）跟會員中心未登入時的提示（js/account-page.js）
  // 都要渲染同一顆按鈕，抽成這裡一份，不要兩邊各自複製一份 GSI 載入／
  // 初始化邏輯。container 是要插入按鈕的 DOM 元素，沒設定 Google 登入
  // 的話會把 container 的文字改成提示訊息。
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
                .then((customer) => {
                  if (options.onLogin) options.onLogin(customer);
                })
                .catch((err) => {
                  container.textContent = `登入失敗：${err.message}`;
                });
            },
          });
          window.google.accounts.id.renderButton(container, { type: "standard", theme: "outline", size: "medium", width: options.width || 220 });
        })
        .catch(() => {
          container.textContent = "Google 登入元件載入失敗，請稍後再試";
        });
    });
  }

  // 把合併地址字串（"縣市鄉鎮市區詳細地址"，後端只存這個合併後的單一
  // 字串，見 risuan-checkout lib/order.js／lib/customer.js）拆回縣市／
  // 鄉鎮市區／詳細地址三格，靠 window.TW_POSTAL_CODES 當字典反查——縣市／
  // 鄉鎮市區的名稱是固定封閉詞彙表，從頭比對字串開頭一定能唯一拆出來，
  // 不是用猜的。結帳頁自動帶入（js/checkout.js）跟會員中心編輯收件地址
  // （js/account-page.js）共用這一份，不要兩處各自維護一份拆解邏輯。
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

  window.RisuanAccount = {
    BASE_PREFIX,
    API_BASE,
    CHANGE_EVENT,
    getCustomer,
    getToken,
    loginWithGoogleCredential,
    logout,
    syncProfile,
    getGoogleClientId,
    apiFetch,
    mountGoogleButton,
    splitHomeAddress,
  };
})();
