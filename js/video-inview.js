// 瀏覽器不會真的自動播放頁面載入當下不在可視範圍內的 <video autoplay>
// （即使加了 muted/autoplay），會停在第一幀不動，捲到那個位置也不會自己
// 開始播——這裡用 IntersectionObserver 補上：捲進畫面呼叫 play()、捲出
// 畫面呼叫 pause()，離開視野時順便省一點資源。
//
// 2026-10-25 排除 [data-gallery-frame]／[data-carousel-frame] 這兩種
// 疊圖輪播用的 video（hero-thumb-gallery.js／hero-colorway-carousel.js
// 管理）：這支腳本只看「容器有沒有進入畫面」，疊在同一個 box 裡、用
// opacity 切換的好幾支 video 全部會被判定成「進入畫面」而同時 play()，
// 不管哪一支當下其實是 is-active（看得到）——實測發現一個商品頁因此
// 同時在背景播放＋下載 3 支影片（共十幾 MB），是「載入變慢」的主因之一。
// 這類疊圖輪播的 video 現在改由各自的 gallery／carousel 腳本自己控制
// play()／pause()（只播目前 is-active 那一支），這支腳本只處理「單純
// 不疊圖、位置固定」的一般 autoplay video。
//
// 2026-10-25 同一批修正：選取器改抓 [data-autoplay]，不是原生
// autoplay 屬性。實測發現就算加了 preload="none"，Chrome 對
// muted+autoplay 的 <video> 還是會在 HTML parse 當下立刻搶著把整支
// 影片載完，完全不理會 preload 提示、也不管這支影片當下在不在畫面
// 範圍內（一個商品頁因此載入了 7 支影片共 17MB+，不管看不看得到）。
// 唯一真正有效的做法是整個不用原生 autoplay 屬性，改成自訂的
// data-autoplay 標記＋這支腳本用 IntersectionObserver 手動呼叫
// play()／pause()，瀏覽器才不會在 parse 階段就搶跑。本來就刻意要
// 首屏立刻播放的影片（例如首頁最上面那支氛圍影片）維持原生 autoplay
// ＋preload="auto" 不動，那些本來就該馬上載入，不受這次調整影響。
(function () {
  const videos = document.querySelectorAll(
    "video[data-autoplay]:not([data-gallery-frame]):not([data-carousel-frame])"
  );
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
