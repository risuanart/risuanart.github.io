
















(function () {
  const els = document.querySelectorAll(".fade-in");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0 }
  );

  els.forEach((el) => observer.observe(el));
})();
