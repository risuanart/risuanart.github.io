




(function () {
  const track = document.querySelector(".promo-bar__track");
  if (!track) return;
  const messages = Array.from(track.querySelectorAll(".promo-bar__msg"));
  if (messages.length < 2) return;

  const INTERVAL_MS = 4500;
  let current = messages.findIndex((el) => el.classList.contains("is-active"));
  if (current < 0) current = 0;



  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function next() {
    const prev = current;
    current = (current + 1) % messages.length;
    const prevEl = messages[prev];
    const nextEl = messages[current];
    prevEl.classList.remove("is-active");
    nextEl.classList.add("is-active");
    if (!reduceMotion) {
      prevEl.classList.add("is-leaving");
      setTimeout(() => prevEl.classList.remove("is-leaving"), 500);
    }
  }

  setInterval(next, INTERVAL_MS);
})();
