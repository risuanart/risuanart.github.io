// 瀏覽器不會真的自動播放頁面載入當下不在可視範圍內的 <video autoplay>
// （即使加了 muted/autoplay），會停在第一幀不動，捲到那個位置也不會自己
// 開始播——這裡用 IntersectionObserver 補上：捲進畫面呼叫 play()、捲出
// 畫面呼叫 pause()，離開視野時順便省一點資源。
(function () {
  const videos = document.querySelectorAll("video[autoplay]");
  if (!videos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.25 }
  );

  videos.forEach((video) => observer.observe(video));
})();
