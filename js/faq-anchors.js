/* 預約主題跳轉：為固定導覽預留實際高度，停在主題標題。 */
(function () {
  const nav = document.querySelector(".faq-tier2__jump");
  if (!nav) return;
  function jump(hash, behavior) {
    const target = document.getElementById(hash.slice(1));
    if (!target || !target.matches(".faq-group")) return;
    const header = document.querySelector(".site-header");
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--space-4")) || 1;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const spacing = gap * rem;
    const bottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    target.style.scrollMarginTop = (bottom + spacing) + "px";
    target.scrollIntoView({ block: "start", behavior });
  }
  nav.addEventListener("click", function (event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    event.preventDefault();
    const hash = link.getAttribute("href");
    history.pushState(null, "", hash);
    jump(hash, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  });
  window.addEventListener("load", () => { if (location.hash) jump(location.hash, "auto"); });
  window.addEventListener("popstate", () => { if (location.hash) jump(location.hash, "auto"); });
})();
