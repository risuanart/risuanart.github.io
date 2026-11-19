












(function () {
  const hero = document.querySelector(".preview-hero");
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll(".preview-hero__slide"));
  let heroVisible = true;
  function syncActiveVideos() {
    slides.forEach(slide => {
      const active = slide.classList.contains('is-active') && heroVisible && !document.hidden;
      slide.querySelectorAll('video').forEach(video => {
        const selected = !video.classList.contains('preview-hero__sheep-photo') || video.classList.contains('is-active');
        if (active && selected) { video.muted = true; video.play().catch(() => {}); }
        else video.pause();
      });
    });
  }
  new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; syncActiveVideos(); }, { threshold: 0.15 }).observe(hero);
  document.addEventListener('visibilitychange', syncActiveVideos);
  window.addEventListener('pageshow', syncActiveVideos);

  const dotsWrap = hero.querySelector(".preview-hero__dots");
  if (dotsWrap) {
    dotsWrap.replaceChildren(...slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.dataset.index = String(index);
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "第 " + (index + 1) + " 張");
      dot.setAttribute("aria-selected", String(index === 0));
      dot.classList.toggle("is-active", index === 0);
      return dot;
    }));
  }
  const dots = Array.from(hero.querySelectorAll(".preview-hero__dots button"));
  const AUTOPLAY_MS = parseInt(hero.dataset.autoplay, 10) || 5000;
  let current = 0;
  let timer = null;


  const sheepSlide = slides.find((s) => s.hasAttribute("data-sheep-rotator"));
  const sheepSlideIndex = sheepSlide ? slides.indexOf(sheepSlide) : -1;
  const sheepVideos = sheepSlide ? Array.from(sheepSlide.querySelectorAll(".preview-hero__sheep-photo")) : [];
  const sheepLink = sheepSlide ? sheepSlide.querySelector("[data-sheep-link]") : null;
  const sheepTagline = sheepSlide ? sheepSlide.querySelector("[data-sheep-tagline]") : null;
  const sheepCtaText = sheepSlide ? sheepSlide.querySelector("[data-sheep-cta-text]") : null;
  const SHEEP_SEGMENT_MS = sheepSlide ? parseInt(sheepSlide.dataset.sheepInterval, 10) || AUTOPLAY_MS : 0;
  let sheepStep = 0;
  let sheepTimer = null;

  function applySheepScheme(scheme) {
    const capitalized = scheme[0].toUpperCase() + scheme.slice(1);
    const hrefKey = `href${capitalized}`;
    const taglineKey = `tagline${capitalized}`;
    const ctaTextKey = `ctaText${capitalized}`;
    if (sheepLink && sheepLink.dataset[hrefKey]) sheepLink.href = sheepLink.dataset[hrefKey];
    const photoLink = sheepSlide.querySelector(".preview-hero__photo-link");
    if (photoLink && sheepLink && sheepLink.dataset[hrefKey]) photoLink.href = sheepLink.dataset[hrefKey];
    if (sheepTagline && sheepTagline.dataset[taglineKey]) sheepTagline.textContent = sheepTagline.dataset[taglineKey];
    if (sheepCtaText && sheepCtaText.dataset[ctaTextKey]) sheepCtaText.textContent = sheepCtaText.dataset[ctaTextKey];
  }

  function playSheepStep(step) {
    sheepStep = step;
    sheepVideos.forEach((v, i) => v.classList.toggle("is-active", i === step));
    sheepSlide.querySelectorAll(".preview-hero__companion--sheep").forEach((photo) => {
      photo.classList.toggle("is-active", photo.dataset.scheme === sheepVideos[step].dataset.scheme);
    });
    sheepVideos.forEach((v, i) => {
      if (i !== step) v.pause();
    });
    sheepVideos[step].currentTime = 0;
    sheepVideos[step].play().catch(() => {});
    applySheepScheme(sheepVideos[step].dataset.scheme);
  }

  function startSheepCycle() {
    if (!sheepSlide) return;
    playSheepStep(0);
    sheepTimer = setTimeout(() => playSheepStep(1), SHEEP_SEGMENT_MS);
  }

  function stopSheepCycle() {
    if (sheepTimer) clearTimeout(sheepTimer);
    sheepTimer = null;
    sheepVideos.forEach((v) => v.pause());
  }

  function goTo(index) {
    const prev = current;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    dots.forEach((dot, i) => {
      const isActive = i === current;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });

    syncActiveVideos();
    if (prev === sheepSlideIndex && current !== sheepSlideIndex) stopSheepCycle();
    if (current === sheepSlideIndex) startSheepCycle();
  }

  function next() {
    goTo(current + 1);
  }

  function scheduleNext() {
    stop();



    const delay = current === sheepSlideIndex ? SHEEP_SEGMENT_MS * 2 : AUTOPLAY_MS;
    timer = setTimeout(() => {
      next();
      scheduleNext();
    }, delay);
  }

  function stop() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.index));
      scheduleNext();
    });
  });

  hero.querySelectorAll("[data-hero-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      goTo(current + Number(button.dataset.heroDirection));
      scheduleNext();
    });
  });




  hero.addEventListener("mouseenter", () => {
    stop();
    if (current === sheepSlideIndex && sheepTimer) clearTimeout(sheepTimer);
  });
  hero.addEventListener("mouseleave", () => {
    scheduleNext();
    if (current === sheepSlideIndex) startSheepCycle();
  });






  let touchStartX = null;
  let touchStartY = null;
  const SWIPE_THRESHOLD = 40;

  hero.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  hero.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;
      if (deltaX < 0) {
        next();
      } else {
        goTo(current - 1);
      }
      scheduleNext();
    },
    { passive: true }
  );

  if (current === sheepSlideIndex) startSheepCycle();
  syncActiveVideos();
  if (slides.length > 1) scheduleNext();
})();
