/* 會員登入分區的資料說明；不改身分驗證流程。 */
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
})();
