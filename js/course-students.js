(() => {
  const track = document.getElementById('course-students-track');
  if (!track) return;
  // 重新進頁與往返快取都從第一張開始；使用者操作後不再因圖片載入拉回。
  let interacted = false;
  const stopReset = () => { interacted = true; };
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(event => {
    track.addEventListener(event, stopReset, { passive: true });
  });
  function resetStart() {
    if (!interacted) track.scrollTo({ left: 0, behavior: 'instant' });
  }
  resetStart();
  window.addEventListener('pageshow', () => {
    interacted = false;
    resetStart();
    requestAnimationFrame(() => requestAnimationFrame(resetStart));
  });
  track.querySelectorAll('img').forEach(img => img.addEventListener('load', resetStart));
  window.addEventListener('resize', resetStart);
  document.querySelectorAll('[data-student-direction]').forEach(button => {
    button.addEventListener('click', () => track.scrollBy({left: Number(button.dataset.studentDirection) * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
  });
})();
