(() => {
  const track = document.getElementById('course-students-track');
  if (!track) return;
  document.querySelectorAll('[data-student-direction]').forEach(button => {
    button.addEventListener('click', () => track.scrollBy({left: Number(button.dataset.studentDirection) * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
  });
})();
