// 學員作品集資料——之後新增作品，直接在 GALLERY_ITEMS 加一筆物件就好，
// gallery.html 會自動重新產生格狀相簿、篩選按鈕跟著算數量，不用改 HTML。
// 用一般 JS 檔案（不是 .json + fetch()），是因為這個網站常常會直接用
// 瀏覽器打開本機檔案看（file:// 開啟），file:// 底下 fetch() 讀本機 JSON
// 會被瀏覽器擋掉（CORS），跟 js/cart.js 的 PRODUCTS 走同一種「資料寫在
// JS 全域變數裡」的作法，才能兩種開法都正常。
//
// 欄位說明：
// - course：單選，這件作品是上哪堂課做出來的（照實填，不用另外討論）。
// - themes：複選（陣列），可以跨課程共用同一個主題標籤——例如「海洋生物」
//   底下可能同時有石英砂版跟油畫版，讓同學能比較同主題、不同材料的差異，
//   這是這個欄位設計成陣列（不是單一字串）的原因。
// - date："YYYY-MM-DD"，拍照／完成的日期（不確定的話用上傳日期也可以，
//   不用太精確）。這個欄位是各課程頁「學員作品」預覽區（見
//   js/gallery-course-preview.js）拿來排序、抓「這堂課最新幾筆」用的，
//   沒有這個欄位那筆作品會被排到最後面。
// - src／alt：真的照片路徑到位前，這個陣列先留空，gallery.html 跟各課程頁
//   的預覽區都會顯示誠實的「目前還沒有作品」訊息，不會顯示假資料或破圖示。
// - sessions（選填）：這件作品實際花了幾堂課完成，不確定或沒問過就不填
//   （gallery.js 只有這個欄位存在時才會在圖片說明多顯示一段「一堂完成」
//   ／「N堂完成」，沒填不會顯示任何堂數資訊，不會亂猜）。跟課程頁常見的
//   「一堂課／多堂才畫得完」說法（見 courses/custom-photo-oil.html）是
//   同一件事，只是放在作品集這邊讓人瀏覽時也能感受到難易度。
//
// 範例（之後有真的照片，比照這個格式加進陣列）：
// {
//   course: "石英砂肌理畫",
//   themes: ["植物花卉"],
//   date: "2026-09-01",
//   src: "../assets/images/gallery/2026-09-01-sand-texture-flower.jpg",
//   alt: "石英砂肌理畫，花卉主題",
//   sessions: 1,
// }
// 2026-09-13 新增：「山」系列 29 件（材料指南〈同一座山，三種材料的
// 呈現〉頁面同一批真實照片，使用者確認這些是真正的學員作品，不是畫室
// 示範，照實歸進對應課程）。原始相簿共 31 張，這裡排除 2 張刮刀油畫
// 的「繪製過程」特寫照（IMG_0428／IMG_0435，是同一件作品畫到一半的
// 過程紀錄，不是獨立完成的作品，放進作品集會重複計算），其餘 29 張
// 都是各自獨立完成的作品。date 沒有精確的完成日期紀錄，先統一用新增
// 這筆資料的日期，之後有更準確的日期可以再改。
// themes 大多標「山」（見下方 GALLERY_THEMES 的說明），例外是
// oil-knife/08.jpg：畫面實際內容是海岸崖壁＋浪花＋沙灘小花，不是山，
// 照實標「海邊」而不是套用整批的「山」標籤。
window.GALLERY_ITEMS = [
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/sand-texture/01.jpg", alt: "石英砂肌理畫的滑雪場雪山空拍景色，畫面上有滑雪的人群與紅色旗幟", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/sand-texture/02.jpg", alt: "石英砂肌理畫的海邊夕陽山景，畫面前景有海浪與飛鳥", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/sand-texture/03.jpg", alt: "石英砂肌理畫的藍紫漸層天空下的雪山倒影", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/sand-texture/04.jpg", alt: "石英砂肌理畫的富士山，前景點綴楓紅樹葉", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/sand-texture/05.jpg", alt: "石英砂肌理畫的富士山，畫面飄落粉紅櫻花", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/sand-texture/06.jpg", alt: "石英砂肌理畫的湖邊山景，森林稜線倒映在藍色湖面上", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/sand-texture/07.jpg", alt: "石英砂肌理畫的馬特洪峰造型雪山，背景是藍天", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/sand-texture/08.jpg", alt: "石英砂肌理畫的山谷雪景，兩側山壁夾著中間的雪坡", sessions: 1 },

  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/01.jpg", alt: "油畫＋筆刷畫的富士山，前景有電線桿與枯草地", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/02.jpg", alt: "油畫＋筆刷畫的富士山，前景有紅色鳥居", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/03.jpg", alt: "油畫＋筆刷畫的山谷景色，畫面中有一列小火車行駛過草原", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/04.jpg", alt: "油畫＋筆刷畫的層疊山巒，籠罩著藍綠色薄霧", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/05.jpg", alt: "油畫＋筆刷畫的夕陽山巒，暖橘色天空與藍紫色山影層疊", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/06.jpg", alt: "油畫＋筆刷畫的雪山，一旁夾著參考的實景照片", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/07.jpg", alt: "油畫＋筆刷畫的富士山與櫻花，湖面倒映著粉色天空", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/08.jpg", alt: "油畫＋筆刷畫的岩石山壁與海面，海上有一艘小船", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/09.jpg", alt: "油畫＋筆刷畫的海邊步道，沿岸山巒與一排路燈", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/10.jpg", alt: "油畫＋筆刷畫的深藍色夜間山景，遠方透出微光", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/11.jpg", alt: "油畫＋筆刷畫的櫻花大道，盡頭是富士山", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/12.jpg", alt: "油畫＋筆刷畫的綠色丘陵與湖泊，前景點綴粉色花朵", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/13.jpg", alt: "油畫＋筆刷畫的雪山與深藍色海面，海上有一艘小船", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-brush/14.jpg", alt: "油畫＋筆刷畫的富士山，透過窗框構圖望向湖面小船", sessions: 1 },

  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-knife/01.jpg", alt: "油畫＋刮刀畫的山，綠黃粉藍等顏色交錯堆疊出抽象質感", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-knife/02.jpg", alt: "刮刀油畫的翠綠山脈，刮刀堆疊出粗獷的筆觸質感", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-knife/04.jpg", alt: "刮刀油畫的灰白雪山群峰，山腳下有一間小屋", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-knife/05.jpg", alt: "刮刀油畫的粉白雪山，夜空中有一彎新月與星星", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-knife/06.jpg", alt: "刮刀油畫的沙丘山景，橘藍色調的夕陽", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-knife/07.jpg", alt: "刮刀油畫的黑灰色馬特洪峰，前景是秋天的紅黃樹叢", sessions: 1 },
  { course: "刮刀油畫", themes: ["海邊"], date: "2026-09-13", src: "../assets/images/guides/material-compare-mountain/oil-knife/08.jpg", alt: "刮刀油畫的海岸崖壁，浪花拍打岸邊，前景有紅色小花", sessions: 1 },

  // 2026-09-24 新增：「刮刀油畫」花卉主題 26 件，使用者上傳一批真實學員
  // 完成作品照片，逐張看過內容後排除明顯是製作過程（畫面裡有手跟刮刀
  // 在動作）或跟其他張是同一幅作品重複構圖的照片，只保留每幅作品各一張
  // 最完整的成品照。沒有精確的完成日期紀錄，先統一用新增這筆資料的
  // 日期，之後有更準確的日期可以再改。
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/01.jpg", alt: "刮刀油畫的蒲公英與野花草地，粉藍黃色系的柔和背景", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/02.jpg", alt: "刮刀油畫的粉色虞美人花特寫，白底搭配綠色枝葉", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/03.jpg", alt: "刮刀油畫的野花草地，橘、白、藍紫色小花錯落其中", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉", "海邊"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/04.jpg", alt: "刮刀油畫的海岸崖壁景色，前景點綴白色與粉色野花", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/05.jpg", alt: "刮刀油畫的粉彩花束，黃綠色背景搭配橘色大理菊", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/06.jpg", alt: "刮刀油畫的白色與藍色花朵，深藍色背景襯托立體花瓣", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/07.jpg", alt: "刮刀油畫的粉色牡丹花特寫，淺藍綠色背景", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/08.jpg", alt: "刮刀油畫的橘色與白色花朵特寫，深藍色背景", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/09.jpg", alt: "刮刀油畫的藍色花朵，深灰黑色背景襯托立體花瓣", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/10.jpg", alt: "刮刀油畫的粉彩花朵特寫，點綴小珍珠裝飾", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/11.jpg", alt: "刮刀油畫的玫瑰與雛菊花束，點綴小珍珠裝飾", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/12.jpg", alt: "刮刀油畫的向日葵與薰衣草，藍紫色點綴其中", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/13.jpg", alt: "刮刀油畫的藍色花瓶插花，粉紫色野花束", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/14.jpg", alt: "刮刀油畫的粉白色系植物花卉，淺灰色背景", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/15.jpg", alt: "刮刀油畫的粉彩野花草地，藍天背景", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/16.jpg", alt: "刮刀油畫的玫瑰與雛菊花束，灰色背景", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/17.jpg", alt: "刮刀油畫的白色與米色花朵特寫", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/18.jpg", alt: "刮刀油畫的粉彩野花草地全幅畫面", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/19.jpg", alt: "刮刀油畫的粉彩花卉，點綴金色葉片裝飾", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/20.jpg", alt: "刮刀油畫的粉藍紫色系花束特寫", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/21.jpg", alt: "刮刀油畫的藍紫白色系野花束特寫", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/22.jpg", alt: "刮刀油畫的紫色薰衣草花穗特寫", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/23.jpg", alt: "刮刀油畫的粉彩花卉，淺灰綠色背景", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉", "風景"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/24.jpg", alt: "刮刀油畫的湖景風光，前景點綴繽紛野花", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/25.jpg", alt: "刮刀油畫的密集野花草地，點綴水鑽裝飾", sessions: 1 },
  { course: "刮刀油畫", themes: ["植物花卉"], date: "2026-09-24", src: "../assets/images/gallery/palette-knife-oil/26.jpg", alt: "刮刀油畫的灰綠色系玫瑰花特寫", sessions: 1 },

  // 2026-09-30 新增：「刮刀油畫」8 件，使用者上傳一批真實學員完成作品，
  // 題材比較多元（動漫角色、水果、蛋糕、披薩），逐張看過內容後排除一張
  // 明顯是製作過程（手＋刮刀入鏡，蛋糕那幅的過程照）跟這批分開放，那張
  // 改放進課程頁「刮刀油畫是什麼」段落當技法示範用。沒有精確的完成日期
  // 紀錄，先統一用新增這筆資料的日期，之後有更準確的日期可以再改。
  { course: "刮刀油畫", themes: ["動漫／角色"], date: "2026-09-30", src: "../assets/images/gallery/palette-knife-oil/27.jpg", alt: "刮刀油畫的龍貓（吉卜力動畫角色），站在大樹下的草地上，周圍點綴白色小花", sessions: 1 },
  { course: "刮刀油畫", themes: ["動漫／角色"], date: "2026-09-30", src: "../assets/images/gallery/palette-knife-oil/28.jpg", alt: "刮刀油畫的拉拉熊，趴在粉色床鋪上的慵懶姿勢", sessions: 1 },
  { course: "刮刀油畫", themes: ["食物", "風景"], date: "2026-09-30", src: "../assets/images/gallery/palette-knife-oil/29.jpg", alt: "刮刀油畫的水蜜桃靜物，木籃裝著水蜜桃放在沙灘桌巾上，背景是海景", sessions: 1 },
  { course: "刮刀油畫", themes: ["食物"], date: "2026-09-30", src: "../assets/images/gallery/palette-knife-oil/30.jpg", alt: "刮刀油畫的杯子蛋糕靜物，白色奶油上放著一顆紅色櫻桃，花紋瓷盤盛裝", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景", "山"], date: "2026-09-30", src: "../assets/images/gallery/palette-knife-oil/31.jpg", alt: "刮刀油畫的海景與遠山，藍色海面搭配前景的黃白色野花", sessions: 1 },
  { course: "刮刀油畫", themes: ["食物"], date: "2026-09-30", src: "../assets/images/gallery/palette-knife-oil/32.jpg", alt: "刮刀油畫的披薩靜物，一片披薩放在沙地上，背景有建築物與藍天白雲", sessions: 1 },
  { course: "刮刀油畫", themes: ["食物"], date: "2026-09-30", src: "../assets/images/gallery/palette-knife-oil/33.jpg", alt: "刮刀油畫的水蜜桃與李子特寫，藍色水面背景", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景", "海邊"], date: "2026-09-30", src: "../assets/images/gallery/palette-knife-oil/34.jpg", alt: "刮刀油畫的海邊放風箏景色，紅色與黃色風箏飛在海浪上方", sessions: 1 },

  // 2026-10-01 新增：「刮刀油畫」10 件風景主題學員作品，使用者上傳時
  // 確認都是「一堂完成」的真實成品。沒有精確的完成日期紀錄，先統一用
  // 新增這筆資料的日期，之後有更準確的日期可以再改。
  { course: "刮刀油畫", themes: ["風景", "山"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/35.jpg", alt: "刮刀油畫的湖畔小屋秋景，楓紅樹林與遠山倒映在湖面", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景", "海邊"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/36.jpg", alt: "刮刀油畫的夕陽海景，一艘帆船航行在波光粼粼的海面上", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/37.jpg", alt: "刮刀油畫的雪地狗拉雪橇景色，針葉林環繞", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/38.jpg", alt: "刮刀油畫的金黃色樹冠特寫，藍天為背景", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景", "植物花卉"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/39.jpg", alt: "刮刀油畫的花卉草地景色，遠方有一棟白色房屋", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景", "山", "植物花卉"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/40.jpg", alt: "刮刀油畫的阿爾卑斯山小屋，野花草地點綴小珍珠裝飾", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景", "海邊"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/41.jpg", alt: "刮刀油畫的海岸岩壁景色，草地上有幾隻海鳥剪影", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景", "山"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/42.jpg", alt: "刮刀油畫的河濱自行車道景色，金黃草地與遠山，有人騎單車經過", sessions: 1 },
  { course: "刮刀油畫", themes: ["節慶／季節", "風景"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/43.jpg", alt: "刮刀油畫的聖誕雪景，窗邊擺著聖誕樹，窗外是飄雪的街道", sessions: 1 },
  { course: "刮刀油畫", themes: ["風景", "植物花卉"], date: "2026-10-01", src: "../assets/images/gallery/palette-knife-oil/44.jpg", alt: "刮刀油畫的森林野花草地，陽光點點灑落在石頭與花叢間", sessions: 1 },
  // 2026-10-30 新增：吉卜力主題作品之一，龍貓坐在大樹下，原始檔名
  // 「使用了刮刀油畫.jpg」，材質實際是刮刀油畫不是油畫＋筆刷，照實
  // 歸在「刮刀油畫」這堂課，不跟其他吉卜力油畫作品混在一起（同樣的
  // 處理方式見迪士尼主題裡的小熊維尼／茶壺夫人兩件石英砂作品）。
  { course: "刮刀油畫", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/palette-knife-oil/45.jpg", alt: "龍貓坐在大樹下，刮刀堆疊出樹葉與草地的立體質感", sessions: 1 },

  // 2026-09-17 新增：「寵物油畫」10 件，使用者從 Mac 照片 App 的
  // 「狗狗油畫」相簿匯出，確認都是完全沒有畫畫經驗的同學一堂課完成的
  // 真實作品（同一批照片使用者也發了 IG 貼文，見 courses/pet-portrait.html
  // 「學員作品」段落引言的文案同步更新）。date 用照片本身的拍攝日期
  // （檔名 EXIF 對應到的檔案時間），不是上傳日期。themes 標「狗狗」
  // （不是泛用的「陸地動物」）——使用者 2026-09-18 明確要求寵物油畫的
  // 學員作品要分「狗狗」「貓咪」「兩隻以上」三類（貓咪、兩隻以上目前
  // 還沒有真的照片，先把標籤加進 GALLERY_THEMES，等照片到位直接套用，
  // 見下方 GALLERY_THEMES 的說明；courses/pet-portrait.html 的「學員
  // 作品」段落也同步改成三個分類各自一條輪播，不再用這裡的
  // GALLERY_ITEMS 資料餵那個區塊——這份資料現在只給 gallery.html 總覽頁
  // 篩選用。
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-07-01", src: "../assets/images/gallery/pet-portrait/01.jpg", alt: "白色蓬鬆毛狗狗肖像油畫，吐舌微笑，綠色草叢背景，畫面簽名Kobe", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-07-12", src: "../assets/images/gallery/pet-portrait/02.jpg", alt: "哈士奇犬肖像油畫，灰白毛色、尖耳朵，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-07-18", src: "../assets/images/gallery/pet-portrait/03.jpg", alt: "白色蓬鬆小狗肖像油畫，雙腳搭在藍色椅墊上，背景點綴白色小花", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-07-28", src: "../assets/images/gallery/pet-portrait/04.jpg", alt: "白色與淺棕色毛小狗肖像油畫特寫，綠色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-08-25", src: "../assets/images/gallery/pet-portrait/05.jpg", alt: "白色吉娃娃肖像油畫，大耳朵豎起，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-08-28", src: "../assets/images/gallery/pet-portrait/06.jpg", alt: "白色法國鬥牛犬肖像油畫，頭戴花朵頭飾，暖橘色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-09-08", src: "../assets/images/gallery/pet-portrait/07.jpg", alt: "黑白毛色狗狗肖像油畫，向前跳躍張嘴的瞬間，藍天與土黃色地面背景", sessions: 1 },
  // 08.jpg 一張照片裡拍到兩幅畫，但兩幅各自都是「單隻狗」的獨立作品
  // 並排拍在一起，不是一幅畫裡畫兩隻寵物——2026-09-18 使用者特別確認
  // 這張不屬於「兩隻以上」分類，themes 標「狗狗」是對的，alt 文字也
  // 特別寫清楚「各自獨立完成」避免以後被誤會成兩隻以上的合照作品。
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-09-22", src: "../assets/images/gallery/pet-portrait/08.jpg", alt: "兩幅各自獨立完成的單隻狗狗肖像油畫並排展示，淺棕色毛色，分別戴著紫色與粉色項圈，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-10-10", src: "../assets/images/gallery/pet-portrait/09.jpg", alt: "黑白毛色小狗肖像油畫，吐舌微笑，藍天與黃色地面背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-10-12", src: "../assets/images/gallery/pet-portrait/10.jpg", alt: "米白色捲毛狗狗肖像油畫，張嘴微笑，淺藍色背景", sessions: 1 },

  // 2026-09-18 新增：「兩隻以上」21 件，使用者從「兩隻以上油畫照片」
  // 資料夾提供（根目錄放狗貓合照、兩狗／兩貓各自分裝子資料夾）。同樣逐張
  // 打開實際看過畫面內容才標的分類跟寫 alt。原始資料夾兩貓子資料夾裡有
  // 一張 DSCF1788 2.JPG，畫面拍到的是還握著畫筆、手伸進畫面裡補眼睛細節
  // 的繪製過程照，不是完成品，比照「山」系列排除過程照的先例，這張不放
  // 進作品集。date 用照片本身的拍攝日期（跟寵物油畫狗狗那批一樣）。
  // themes 除了「兩隻以上」，同時照畫面實際內容疊加「狗狗」／「貓咪」
  // （兩者都有的合照兩個都疊上）——使用者 2026-09-18 明確要求：瀏覽
  // 「貓咪」主題時，有貓的兩隻合照也要一起出現；瀏覽「狗狗」也一樣；
  // 有貓有狗的合照兩邊都要出現。這三個標籤因此不再是互斥關係，改成
  // 跟山／海邊那種可以同時成立的一般主題標籤一樣（見 js/gallery.js
  // 移除 EXCLUSIVE_THEME_GROUP 的說明）。
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗", "貓咪"], date: "2025-08-09", src: "../assets/images/gallery/pet-portrait/11.jpg", alt: "橘色虎斑貓與白色吉娃娃合照肖像油畫，貓咪表情驚訝，狗狗吐舌微笑，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗", "貓咪"], date: "2025-10-24", src: "../assets/images/gallery/pet-portrait/12.jpg", alt: "金黃色狗狗與虎斑貓合照肖像油畫，畫面寫著狗狗名字「甜甜」與貓咪名字「Ari」，白色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2025-04-07", src: "../assets/images/gallery/pet-portrait/13.jpg", alt: "兩隻金棕色長毛狗狗依偎在綠色沙發上的肖像油畫，互相靠著頭休息", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2026-09-05", src: "../assets/images/gallery/pet-portrait/14.jpg", alt: "小型白色蓬鬆狗狗疊坐在金黃色狗狗頭頂上的肖像油畫，金黃色狗狗戴著金屬項圈與吊牌，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2024-08-07", src: "../assets/images/gallery/pet-portrait/15.jpg", alt: "兩隻黑白花色狗狗肖像油畫，其中一隻戴藍色胸背帶並吐舌，綠色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2024-08-28", src: "../assets/images/gallery/pet-portrait/16.jpg", alt: "兩隻法國鬥牛犬幼犬肖像油畫，一隻深棕色一隻淺褐色，米黃色背景搭配布簾", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2024-10-10", src: "../assets/images/gallery/pet-portrait/17.jpg", alt: "兩隻小型犬合照肖像油畫，白色蓬鬆狗狗吐舌，另一隻穿紅色毛衣，淺藍與黃色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2025-12-12", src: "../assets/images/gallery/pet-portrait/18.jpg", alt: "兩隻白色捲毛蓬鬆狗狗肖像油畫，一隻吐舌微笑，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2026-02-09", src: "../assets/images/gallery/pet-portrait/19.jpg", alt: "灰色虎斑貓與棕色虎斑幼貓依偎的肖像油畫，綠色豹紋圖案背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2026-05-17", src: "../assets/images/gallery/pet-portrait/20.jpg", alt: "黑貓與白色長毛貓合照肖像油畫，兩隻都是綠色眼睛，橘色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2026-05-21", src: "../assets/images/gallery/pet-portrait/21.jpg", alt: "三隻虎斑與白底貓咪的臉部並排肖像油畫，米白色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-07-06", src: "../assets/images/gallery/pet-portrait/22.jpg", alt: "黑貓與白色長毛貓合照肖像油畫，簽名「波仕」，綠色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-07-06", src: "../assets/images/gallery/pet-portrait/23.jpg", alt: "米白色貓咪與棕色虎斑貓合照肖像油畫，虎斑貓戴著粉色花朵項圈，粉色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-07-13", src: "../assets/images/gallery/pet-portrait/24.jpg", alt: "橘白色貓咪與棕色虎斑貓依偎肖像油畫，簽名「Latte」，米棕色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-08-07", src: "../assets/images/gallery/pet-portrait/25.jpg", alt: "灰白色貓咪與深灰色貓咪合照肖像油畫，簽名「Alma 2025.8」，米白色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-08-09", src: "../assets/images/gallery/pet-portrait/26.jpg", alt: "白色貓咪與黑白賓士貓合照肖像油畫，簽名「Tatiana 2025」，米黃色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-08-21", src: "../assets/images/gallery/pet-portrait/27.jpg", alt: "兩隻灰白色虎斑幼貓臉頰依偎熟睡的肖像油畫，米色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-09-20", src: "../assets/images/gallery/pet-portrait/28.jpg", alt: "兩隻貓咪與福字貓抓箱的肖像油畫，灰色虎斑貓趴在箱頂，橘色虎斑貓從箱子洞口探頭，簽名「囉瑪＆腰果」", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-10-04", src: "../assets/images/gallery/pet-portrait/29.jpg", alt: "兩隻蓬鬆長毛貓合照肖像油畫，都穿著草莓圖案洋裝、戴紅色蝴蝶結，粉色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-10-11", src: "../assets/images/gallery/pet-portrait/30.jpg", alt: "白色蓬鬆貓咪倒臥吐舌與棕色虎斑貓合照的肖像油畫，簽名「Bruna Chen」，藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-10-22", src: "../assets/images/gallery/pet-portrait/31.jpg", alt: "兩隻長毛貓互相伸手依偎的肖像油畫，一隻灰白色一隻棕色虎斑，藍色背景", sessions: 1 },

  // 2026-09-18 新增：「貓咪」（單隻貓）13 件，使用者從「單隻貓咪油畫
  // 照片」資料夾提供，逐張看過畫面內容才寫 alt——同一套方法論（見上方
  // 「兩隻以上」的說明）。date 用照片本身的拍攝日期。
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-02-08", src: "../assets/images/gallery/pet-portrait/32.jpg", alt: "咖啡色虎斑貓肖像油畫，前爪搭在木箱邊緣，黃綠色眼睛，米白色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-02-10", src: "../assets/images/gallery/pet-portrait/33.jpg", alt: "橘白色貓咪肖像油畫，仰頭向上看，米色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-02-10", src: "../assets/images/gallery/pet-portrait/34.jpg", alt: "咖啡色虎斑幼貓肖像油畫，張嘴喵叫的瞬間，米色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-02-14", src: "../assets/images/gallery/pet-portrait/35.jpg", alt: "灰藍色虎斑貓肖像油畫，抬頭仰望，藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-01", src: "../assets/images/gallery/pet-portrait/36.jpg", alt: "黑白毛色貓咪肖像油畫特寫，米黃色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-01", src: "../assets/images/gallery/pet-portrait/37.jpg", alt: "灰黑色貓咪肖像油畫，白色胸口毛色，低頭往下看，藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-01", src: "../assets/images/gallery/pet-portrait/38.jpg", alt: "黑白賓士貓肖像油畫，紅棕與草綠色交錯的背景，點綴黃色與紅色圓點", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-01", src: "../assets/images/gallery/pet-portrait/39.jpg", alt: "橘白色貓咪肖像油畫，前爪交疊，淺粉色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-17", src: "../assets/images/gallery/pet-portrait/40.jpg", alt: "灰色貓咪肖像油畫，畫面寫著貓咪名字「KUMU」，藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2025-02-22", src: "../assets/images/gallery/pet-portrait/41.jpg", alt: "咖啡色虎斑貓肖像油畫，粉色背景，簽名「Meng Chin 2025」", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2025-02-22", src: "../assets/images/gallery/pet-portrait/42.jpg", alt: "咖啡色虎斑貓肖像油畫特寫，大眼睛直視前方，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2025-02-28", src: "../assets/images/gallery/pet-portrait/43.jpg", alt: "橘白色貓咪肖像油畫特寫，米白色背景，簽名「lin.」", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2025-02-28", src: "../assets/images/gallery/pet-portrait/44.jpg", alt: "黑白賓士貓肖像油畫，藍色背景", sessions: 1 },
  // 2026-10-30 新增「其他動物／兔子／鳥」12 件：使用者確認這幾個分類
  // 「就算在寵物畫延伸」，不另開新課程，照實歸在「寵物油畫」。畫面
  // 主體不是狗/貓，既有「狗狗」「貓咪」「兩隻以上」三個主題標籤都不
  // 適用，改標「陸地動物」（兔子/松鼠猴/老虎/獅子/麋鹿）；飛馬/獨角獸
  // 是虛構生物，不算真實陸地動物，改標「動漫／角色」；鳥類沒有專屬
  // 主題標籤，比照既有慣例併入「陸地動物」一起用（只有 4 張，量不夠
  // 獨立開新標籤）。18229613941258075.jpg（加大畫布框起來掛牆上那張
  // 黑獅子）雖然畫面主體跟 18027592147877575.jpg 近似，但資料夾名稱
  // 「2～3堂、加大畫布」明確標示這是放大尺寸的另一幅作品，不是同一張
  // 的重複拍攝角度，兩張都收錄。
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/45.jpg", alt: "白兔戴著花環項圈，漂浮在藍天白雲中，花瓣飄落", sessions: 1 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/46.jpg", alt: "棕色兔子頭部特寫，深藍色星空背景，圓形畫布", sessions: 1 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/47.jpg", alt: "非洲灰鸚鵡特寫，藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/48.jpg", alt: "兩隻粉紅火鶴站在海邊淺灘，藍色海天背景", sessions: 1 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/49.jpg", alt: "黑色烏鴉站在紫紅色花朵旁，棕色肌理背景", sessions: 1 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/50.jpg", alt: "棕色小鳥特寫，綠色樹葉背景", sessions: 1 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/51.jpg", alt: "松鼠猴特寫，綠色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/52.jpg", alt: "老虎幼獸臉部與爪子特寫，白色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/53.jpg", alt: "黑白色調獅子側臉特寫，深色星空背景", sessions: 1 },
  { course: "寵物油畫", themes: ["動漫／角色"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/54.jpg", alt: "長著翅膀與獨角的飛馬躍起，深藍星空背景，雲朵環繞", sessions: 1 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/55.jpg", alt: "公鹿頭部特寫，灰白色調，鹿角分岔", sessions: 2 },
  { course: "寵物油畫", themes: ["陸地動物"], date: "2026-10-30", src: "../assets/images/gallery/pet-portrait/56.jpg", alt: "黑白色調獅子側臉特寫，加大畫布掛在木質牆面上", sessions: 2 },

  // 2026-11-01 新增：使用者提供「寵物畫」資料夾中的 47 張照片。
  // 與既有寵物畫照片比對後未發現完全相同檔案；保留原始照片不刪除。
  // 來源未附作品日期或完成堂數，因此使用整理日期且不填 sessions。
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/57.jpg", alt: "狗狗肖像油畫，黃綠色背景" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/58.jpg", alt: "小型犬肖像油畫，畫布放在畫架上" },
  { course: "寵物油畫", themes: [], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/59.jpg", alt: "畫架上展示多幅寵物肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/60.jpg", alt: "狗狗肖像油畫，藍色背景" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/61.jpg", alt: "學員手持狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/62.jpg", alt: "貓咪油畫創作過程，學員以畫筆描繪作品" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/63.jpg", alt: "狗狗肖像油畫創作過程，學員以畫筆描繪作品" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/64.jpg", alt: "貓咪肖像油畫創作過程，學員以畫筆描繪作品" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/65.jpg", alt: "學員手持完成的狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/66.jpg", alt: "貓咪肖像油畫創作過程，畫筆正在描繪作品" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/67.jpg", alt: "貓咪肖像油畫創作過程，學員以畫筆描繪作品" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/68.jpg", alt: "狗狗肖像油畫創作過程，學員以畫筆描繪作品" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/69.jpg", alt: "戴眼鏡的狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/70.jpg", alt: "狗狗肖像油畫，藍色背景" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/71.jpg", alt: "學員手持白色狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/72.jpg", alt: "斑點狗狗肖像油畫，藍色背景" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/73.jpg", alt: "狗狗肖像油畫創作過程，學員以畫筆描繪作品" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/74.jpg", alt: "學員手持完成的狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/75.jpg", alt: "學員手持狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/76.jpg", alt: "棕色長毛狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/77.jpg", alt: "白貓肖像油畫，畫布放在畫架上" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/78.jpg", alt: "虎斑貓肖像油畫創作過程，學員以畫筆描繪作品" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/79.jpg", alt: "白色狗狗肖像油畫，圓形畫布放在畫架上" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/80.jpg", alt: "黑色狗狗肖像油畫，黃色背景" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/81.jpg", alt: "貓咪肖像油畫，畫面有藍灰色背景" },
  { course: "寵物油畫", themes: ["貓咪", "兩隻以上"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/82.jpg", alt: "兩隻貓咪的肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/83.jpg", alt: "白色狗狗肖像油畫，藍色背景" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/84.jpg", alt: "貓咪肖像油畫，畫布放在畫架上" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/85.jpg", alt: "虎斑貓肖像油畫創作過程，學員以畫筆描繪作品" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/86.jpg", alt: "黑色狗狗肖像油畫，藍綠色背景" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/87.jpg", alt: "黑色狗狗肖像油畫，藍灰色背景" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/88.jpg", alt: "戴生日帽的白色狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/89.jpg", alt: "白色捲毛狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/90.jpg", alt: "白色狗狗肖像油畫，畫在藍色背景上" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/91.jpg", alt: "狗狗肖像油畫，綠色背景" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/92.jpg", alt: "貓咪肖像油畫，綠色背景" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/93.jpg", alt: "白色狗狗肖像油畫，圓形畫布放在畫架上" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/94.jpg", alt: "黑色狗狗肖像油畫，畫布放在畫架上" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/95.jpg", alt: "學員手持多幅狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/96.jpg", alt: "柴犬肖像油畫，藍色背景" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/97.jpg", alt: "橘白貓咪肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/98.jpg", alt: "學員手持狗狗肖像油畫" },
  { course: "寵物油畫", themes: ["貓咪", "兩隻以上"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/99.jpg", alt: "多隻貓咪肖像油畫，畫布上並列呈現" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/100.jpg", alt: "白色捲毛狗狗肖像油畫，戴著紅色領結" },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/101.jpg", alt: "貓咪肖像油畫創作過程，學員以畫筆描繪作品" },
  { course: "寵物油畫", themes: [], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/102.jpg", alt: "畫架上展示多幅狗狗與貓咪肖像油畫" },
  { course: "寵物油畫", themes: ["狗狗"], date: "2026-11-01", src: "../assets/images/gallery/pet-portrait/103.jpg", alt: "黑色狗狗肖像油畫，粉橘色背景" },

  // 2026-09-21 新增：「石英砂肌理畫」海邊主題 32 件，使用者從相簿匯出
  // 一批石英砂海景/海浪真實學員作品照片。沒有精確的完成日期紀錄，先統一
  // 用新增這筆資料的日期，之後有更準確的日期可以再改。
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/01.jpg", alt: "黑白海浪肌理畫特寫，深色浪頭夾雜白色浪花", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/02.jpg", alt: "海浪與沙灘交界特寫，沙灘上刻著英文字「BARCELONA」", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/03.jpg", alt: "藍色海浪肌理畫特寫，浪花翻湧的立體堆疊", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/04.jpg", alt: "夕陽海景肌理畫，金黃沙灘搭配藍色海面，天空點綴飛鳥剪影", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/05.jpg", alt: "學員身穿日宣圍裙，手持沙灘與海浪主題的肌理畫作品", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/06.jpg", alt: "暖色調海浪肌理畫特寫，藍橘交織的浪花質感", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/07.jpg", alt: "黑白海浪肌理畫，深色海面搭配立體白色浪花", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/08.jpg", alt: "學員手持畫筆繪製黑白海浪肌理畫的過程", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/09.jpg", alt: "灰藍色海浪肌理畫，粗獷立體的浪花堆疊", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/10.jpg", alt: "深色海浪與白色浪花交界特寫", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/11.jpg", alt: "繪製藍灰色海浪肌理畫的過程，畫筆沾著顏料", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/12.jpg", alt: "粉色沙灘肌理畫，畫面點綴多個色彩繽紛的迷你人形剪影", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/13.jpg", alt: "黑藍色海浪與白色浪花交界特寫", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/14.jpg", alt: "完成的海景肌理畫，夕陽海面搭配立體浪花與礁岸", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/15.jpg", alt: "夕陽海景肌理畫特寫，畫面點綴飛鳥剪影與閃亮沙粒", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/16.jpg", alt: "繪製藍色海浪肌理畫的過程，沙灘與海浪交界處", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/17.jpg", alt: "完成的海景肌理畫，藍紫天空、粉色霞光搭配沙灘浪花", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/18.jpg", alt: "完成的黑藍色對角海浪肌理畫，強烈明暗對比", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/19.jpg", alt: "完成的夕陽海景肌理畫，粉橘天空搭配深藍海浪", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/20.jpg", alt: "學員手持畫筆繪製灰藍色海浪肌理畫的過程", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/21.jpg", alt: "藍色海浪與沙灘交界特寫", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/22.jpg", alt: "藍白沙灘與浪花肌理畫特寫，抽象立體質感", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/23.jpg", alt: "完成的海景肌理畫，深藍夜色海面搭配金黃沙灘與白色浪花", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/24.jpg", alt: "完成的海景肌理畫，粉紫夕陽霞光搭配沙灘與浪花", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/25.jpg", alt: "藍綠色海浪與沙灘交界特寫", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/26.jpg", alt: "完成的夕陽海景肌理畫，剪影山丘與兩艘帆船點綴海面", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/27.jpg", alt: "學員手持黑白粉色調的海浪肌理畫作品", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/28.jpg", alt: "完成的海景肌理畫，藍天與山丘剪影，搭配藍綠海面與沙灘", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/29.jpg", alt: "學員身穿日宣圍裙，手持藍綠色海浪主題的肌理畫作品", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/30.jpg", alt: "學員手持米黃與赭紅色系的沙丘肌理畫作品", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/31.jpg", alt: "粉紫漸層肌理畫，白色浪花狀鏤空愛心圖案", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-09-21", src: "../assets/images/gallery/sand-texture/32.jpg", alt: "藍粉夕陽海景肌理畫，前景點綴繽紛花束", sessions: 1 },
  // 2026-10-30 新增：迪士尼主題作品之一，小熊維尼與驢子屹耳，材質實際
  // 是石英砂肌理畫（不是油畫），照實歸在這堂課，不跟其他 12 件迪士尼
  // 油畫作品混在一起（見本檔案下方「迪士尼」主題批次新增的說明）。
  { course: "石英砂肌理畫", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/sand-texture/33.jpg", alt: "小熊維尼伸手摸驢子屹耳的頭，灰白肌理圓形畫布", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/sand-texture/34.jpg", alt: "美女與野獸茶壺夫人與奇普茶杯特寫，白色肌理畫背景", sessions: 1 },

  // 2026-11-01 新增：使用者提供的「石英砂」相簿 47 張學員作品照片。
  // 收錄完成作品與創作過程照片；完成堂數未確認，因此不填 sessions。
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/35.jpg", alt: "黑色畫布上的白色花朵肌理畫，旁邊放著顏料與畫筆" },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/36.jpg", alt: "藍色海面與白色浪花肌理畫，畫中有帆船" },
  { course: "石英砂肌理畫", themes: ["海洋生物"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/37.jpg", alt: "學員手持藍綠色畫布，畫上有橘色魚與深色海洋生物" },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/38.jpg", alt: "夕陽海景肌理畫，畫面有橘紅色天空與深色海岸" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/39.jpg", alt: "綠色葉片與白色立體肌理花紋作品" },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/40.jpg", alt: "深藍色海浪翻起白色浪花的肌理畫" },
  { course: "石英砂肌理畫", themes: ["貓咪", "陸地動物"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/41.jpg", alt: "黑色畫布上的多隻黑白貓咪圖案" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/42.jpg", alt: "白色立體花朵肌理畫局部" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/43.jpg", alt: "畫架上的花卉肌理畫，背景可見畫室植物" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/44.jpg", alt: "學員手持藍色畫布，上有黃色立體花朵" },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/45.jpg", alt: "粉橘色夕陽照映海面的肌理畫，旁邊有另一張藍色海景" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/46.jpg", alt: "深藍畫布上的白色花朵與淺色花心" },
  { course: "石英砂肌理畫", themes: ["抽象圖案"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/47.jpg", alt: "學員在畫室中創作深色肌理畫" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/48.jpg", alt: "白色立體花朵排列在淺色底布上" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/49.jpg", alt: "藍色畫布上綻放粉白花朵的肌理作品" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/50.jpg", alt: "黃色立體花朵與枝葉的淺色畫布作品" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/51.jpg", alt: "深色畫布上的粉色與白色立體花朵" },
  { course: "石英砂肌理畫", themes: ["抽象圖案"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/52.jpg", alt: "畫室中的圓形粉色肌理作品，正在創作中" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/53.jpg", alt: "白色花朵與蝶形葉片的立體肌理畫" },
  { course: "石英砂肌理畫", themes: ["貓咪", "陸地動物"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/54.jpg", alt: "學員以黑白肌理描繪多隻貓咪圖案" },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/55.jpg", alt: "藍白色浪花翻湧的海景肌理畫近照" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/56.jpg", alt: "深色畫布上的白色花形肌理圖案" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/57.jpg", alt: "學員正在黑色畫布上製作粉色立體花朵" },
  { course: "石英砂肌理畫", themes: ["海洋生物"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/58.jpg", alt: "藍色海洋主題肌理畫上的魚形圖案，學員正以畫筆描繪" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/59.jpg", alt: "學員手持粉色花朵立體肌理畫" },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/60.jpg", alt: "雪山與暖色天空倒映在湖面的肌理風景畫" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/61.jpg", alt: "灰色畫布上的白色花朵與深綠色葉片" },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/62.jpg", alt: "畫架上的粉紫色夕陽海景肌理畫，學員正在旁創作" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/63.jpg", alt: "淺色畫布上的白色枝狀立體肌理紋路" },
  { course: "石英砂肌理畫", themes: ["抽象圖案"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/64.jpg", alt: "學員正在彩色肌理畫布上描繪圖案" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/65.jpg", alt: "桌面上排列著多色花瓣造型的肌理作品" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/66.jpg", alt: "白色底布上以立體肌理呈現花卉" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/67.jpg", alt: "黑色畫布上的紅色立體玫瑰肌理畫" },
  { course: "石英砂肌理畫", themes: ["風景"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/68.jpg", alt: "綠色草地與星點花朵上的人物剪影風景畫" },
  { course: "石英砂肌理畫", themes: ["貓咪", "陸地動物"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/69.jpg", alt: "黑色畫布上的白色貓咪肌理圖案" },
  { course: "石英砂肌理畫", themes: ["食物"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/70.jpg", alt: "桌面上排列多色食物造型的肌理畫作品" },
  { course: "石英砂肌理畫", themes: ["抽象圖案"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/71.jpg", alt: "以多色圓形與點狀肌理呈現的抽象畫布" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/72.jpg", alt: "畫架上的淺色畫布，描繪一枝粉色花朵" },
  { course: "石英砂肌理畫", themes: ["風景"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/73.jpg", alt: "畫室中的藍灰色風景肌理畫" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/74.jpg", alt: "黑色畫布上排列白色雛菊的肌理畫" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/75.jpg", alt: "黑色立體花形排列在淺色畫布上" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/76.jpg", alt: "淺色畫布上排列黃色花朵與葉片" },
  { course: "石英砂肌理畫", themes: ["抽象圖案"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/77.jpg", alt: "畫架上的灰色肌理畫，旁邊放著參考圖片" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/78.jpg", alt: "綠色葉片與白色立體肌理細節" },
  { course: "石英砂肌理畫", themes: ["海邊"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/79.jpg", alt: "黑白灰色調的海浪與沙岸肌理作品" },
  { course: "石英砂肌理畫", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/80.jpg", alt: "深色畫布上的白色與紅色玫瑰肌理畫" },
  { course: "石英砂肌理畫", themes: ["抽象圖案"], date: "2026-11-01", src: "../assets/images/gallery/sand-texture/81.jpg", alt: "粉色與黃色肌理畫的繪製過程，畫筆正在塑造立體紋路" },

  // 2026-10-01 新增：「自己帶圖創作」星空油畫學員作品 37 件，技法是壓克力
  // 打底後用油畫顏料畫星辰、星雲、極光，部分作品完成後會撒星星／亮粉裝飾。
  // 使用者確認皆為「一堂完成」的真實學員作品。沒有精確完成日期紀錄，先
  // 統一用新增這筆資料的日期，之後有更準確的日期可以再改。
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/01.jpg", alt: "星空油畫的藍色星雲特寫，畫面點綴細小星點", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/02.jpg", alt: "星空油畫的復活節島摩艾石像剪影，頭頂是銀河與極光", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/03.jpg", alt: "星空油畫的綠色極光，針葉林剪影環繞畫面下方", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/04.jpg", alt: "星空油畫的山林湖泊倒影，滿天星點灑落水面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/05.jpg", alt: "學員正在繪製星空山景湖泊畫作的過程", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/06.jpg", alt: "星空油畫的針葉林剪影，天空有一彎新月與點點繁星", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/07.jpg", alt: "星空油畫的銀河特寫，前景是階梯與建築剪影", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/08.jpg", alt: "圓形畫布的星空山景湖泊倒影作品", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/09.jpg", alt: "星空油畫，一人站在荒原上仰望滿天繁星的剪影", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/10.jpg", alt: "星空油畫的綠色極光灑落山脊，點綴流星雨", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/11.jpg", alt: "星空油畫的紫色銀河，山景與湖泊剪影倒映其中", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/12.jpg", alt: "圓形畫布的彩色星雲特寫，藍綠紅三色交織", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/13.jpg", alt: "星空油畫的鑰匙孔造型構圖，孔內是星雲與行星，一人剪影站在孔前", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/14.jpg", alt: "星空油畫的直幅銀河，兩人剪影站在山丘上仰望", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/15.jpg", alt: "星空油畫，流星劃過粉紫色銀河，山巒剪影在粉色霞光下", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "貓咪"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/16.jpg", alt: "星空油畫，貓咪剪影仰望星空，一旁有星座連線圖", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/17.jpg", alt: "星空油畫的直幅銀河，針葉林剪影在畫面下方", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/18.jpg", alt: "星空油畫，山巒剪影搭配粉紫色霞光與滿天繁星", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/19.jpg", alt: "星空油畫，山巒剪影搭配藍紫色銀河與粉色霞光", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/20.jpg", alt: "星空油畫的銀河特寫，針葉林剪影環繞畫面下方", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/21.jpg", alt: "星空油畫，綠色極光籠罩帳篷營地，針葉林環繞", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/22.jpg", alt: "星空油畫，流星劃過湖面，月光倒映水中", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/23.jpg", alt: "學員正在繪製極光山脊畫作的過程", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/24.jpg", alt: "星空油畫，流星劃過森林與湖面倒影上方", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/25.jpg", alt: "學員正在繪製藍白色星雲特寫畫作的過程", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/26.jpg", alt: "星空油畫，流星雨劃過湖面，一艘小船剪影停靠岸邊", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/27.jpg", alt: "星空油畫，鄉間道路搭配電線桿剪影，天空是直幅銀河", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/28.jpg", alt: "星空油畫，富士山形山景搭配極光與湖泊倒影", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/29.jpg", alt: "星空油畫，小王子剪影站在金色沙丘與玫瑰花叢前仰望星空", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/30.jpg", alt: "星空油畫，發光星團點綴粉橘色霞光天空，樹木剪影在地平線上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "山"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/31.jpg", alt: "學員手持極光雪山主題的星空油畫作品", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/32.jpg", alt: "星空油畫，北斗七星星座與流星劃過山脊上方", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "海洋生物"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/33.jpg", alt: "星空背景下的座頭鯨與水母插畫風油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮", "植物花卉"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/34.jpg", alt: "星空油畫，櫻花樹倒映水面，上方是星球與夜空", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/35.jpg", alt: "星空油畫的直幅星雲特寫，樹木剪影在畫面左下角", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/36.jpg", alt: "星空油畫，小屋剪影佇立在星空下的小徑旁", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-10-01", src: "../assets/images/gallery/star-sky/37.jpg", alt: "星空油畫，枯樹林剪影佇立在湖畔，天空是流動的極光雲彩", sessions: 1 },

  // 2026-10-05 新增：鯨魚主題學員作品 12 件，使用者確認皆為「一堂完成」
  // 的真實學員作品。多數是鯨魚悠游於星空／夜空的構圖，同時疊加「星空／
  // 月亮」標籤；寫實海面特寫（02、04、10）沒有明顯星空元素，只標
  // 「海洋生物」。09（圓形畫布虎鯨悠游滿月前）材質其實是石英砂，不是
  // 油畫＋筆刷，使用者看到學員作品頁才發現這張課程歸錯，已改標
  // 「石英砂肌理畫」，其餘 11 件維持「自己帶圖創作」。沒有精確完成
  // 日期紀錄，先統一用新增這筆資料的日期，之後有更準確的日期可以再改。
  { course: "自己帶圖創作", themes: ["海洋生物", "星空／月亮"], date: "2026-10-05", src: "../assets/images/gallery/whale/01.jpg", alt: "油畫的鯨魚悠游於星雲星空中，一旁點綴行星與星座連線", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-10-05", src: "../assets/images/gallery/whale/02.jpg", alt: "油畫的座頭鯨母子在海面下悠游，光線從水面灑落", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物", "星空／月亮"], date: "2026-10-05", src: "../assets/images/gallery/whale/03.jpg", alt: "油畫的鯨魚悠游於紫藍色星雲星空中", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-10-05", src: "../assets/images/gallery/whale/04.jpg", alt: "油畫繪製座頭鯨特寫的過程，藍色漸層背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物", "星空／月亮"], date: "2026-10-05", src: "../assets/images/gallery/whale/05.jpg", alt: "油畫的鯨魚悠游於星空中，光束從畫面上方灑落", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物", "星空／月亮"], date: "2026-10-05", src: "../assets/images/gallery/whale/06.jpg", alt: "油畫的滿月與帆船倒影，一隻鯨魚悠游於月光海面下", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物", "星空／月亮"], date: "2026-10-05", src: "../assets/images/gallery/whale/07.jpg", alt: "油畫的鯨魚躍出星空般的深色背景，光束灑落，一旁有魚群剪影", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物", "星空／月亮"], date: "2026-10-05", src: "../assets/images/gallery/whale/08.jpg", alt: "油畫的鯨魚悠游於星空中，下方是金黃色秋天樹林", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["海洋生物", "星空／月亮"], date: "2026-10-05", src: "../assets/images/gallery/whale/09.jpg", alt: "圓形畫布的虎鯨悠游於滿月前，黑白對比構圖", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-10-05", src: "../assets/images/gallery/whale/10.jpg", alt: "寫實風格的座頭鯨悠游於深藍海水中，近水面特寫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物", "星空／月亮"], date: "2026-10-05", src: "../assets/images/gallery/whale/11.jpg", alt: "油畫的兩隻鯨魚悠游於星空中，下方是山景與針葉林剪影，一人站立仰望", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物", "星空／月亮"], date: "2026-10-05", src: "../assets/images/gallery/whale/12.jpg", alt: "油畫的大小鯨魚悠游於星空中，近景特寫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊"], date: "2026-10-07", src: "../assets/images/gallery/sea-oil/01.jpg", alt: "圓形畫布的海鷗展翅飛掠海面，陽光灑落波光粼粼", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊"], date: "2026-10-07", src: "../assets/images/gallery/sea-oil/02.jpg", alt: "油畫的衝浪者剪影站在夕陽海灘上，前景點綴白色野花", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊"], date: "2026-10-07", src: "../assets/images/gallery/sea-oil/03.jpg", alt: "油畫的白衣女子漫步夕陽海灘，一群飛鳥掠過天空", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊"], date: "2026-10-07", src: "../assets/images/gallery/sea-oil/04.jpg", alt: "油畫的晴朗海景，海鷗飛掠湛藍海面與白雲", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "狗狗"], date: "2026-10-07", src: "../assets/images/gallery/sea-oil/05.jpg", alt: "黑白色調油畫，一隻狗在海灘浪花中奔跑，逆光剪影", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊"], date: "2026-10-07", src: "../assets/images/gallery/sea-oil/06.jpg", alt: "圓形畫布的海浪特寫，深藍色浪頭捲起白色浪花", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-10-07", src: "../assets/images/gallery/sea-oil/07.jpg", alt: "油畫的夕陽海景，金黃天空下山巒剪影倒映在海面上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-10-07", src: "../assets/images/gallery/sea-oil/08.jpg", alt: "黑白色調油畫的港邊帆船，山巒剪影倒映在平靜水面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-10-07", src: "../assets/images/gallery/sea-oil/09.jpg", alt: "油畫的海濱泳池景色，碧藍海浪拍打石砌堤岸", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景", "植物花卉"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/01.jpg", alt: "油畫的開啟窗景，窗外是飄落櫻花瓣的枯枝樹林", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/02.jpg", alt: "油畫的林蔭道路景色，一輛露營車行駛其中", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景", "植物花卉"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/03.jpg", alt: "油畫的夢幻雲彩天空，前景點綴陽台盆栽植物", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/04.jpg", alt: "黑白色調油畫，雪地裡的枯樹林與一輪明月", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景", "植物花卉"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/05.jpg", alt: "油畫的孤樹花海景色，藍天下一人漫步經過，一彎新月高掛", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景", "植物花卉"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/06.jpg", alt: "油畫的棕櫚樹庭院景色，粉色大門搭配仙人掌造景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/07.jpg", alt: "油畫的雪地月夜景色，樹林剪影間一棟小屋透出燈光", sessions: 1 },
  { course: "自己帶圖創作", themes: ["植物花卉"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/08.jpg", alt: "油畫的窗邊靜物，陶瓶插著枯枝與落葉，雪景窗框", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/09.jpg", alt: "學員正在繪製黃昏孤樹剪影畫作的過程，橘粉漸層天空搭配單一色系樹枝", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景"], date: "2026-10-08", src: "../assets/images/gallery/landscape-oil/10.jpg", alt: "學員繪製棕櫚樹海景底稿的過程，灰階階段旁放著參考照片", sessions: 1 },

  // 2026-10-19 新增：「串珠」課程第一批真實學員作品 50 件，使用者從
  // raw-uploads/beading/ 底下幾個子資料夾（大珠珠項鍊、小珠珠項鍊、戒指、
  // 手鏈、大小珠珠合照、大小珠珠混串）整理提供。逐張打開實際看過畫面內容
  // 才挑選，排除「製作過程中」（畫面裡有手在穿線、拿鑷子、鏡面托盤旁邊
  // 放著珠珠分格收納盒等工作台場景）或跟其他張是「同一件作品重複構圖」的
  // 照片，只保留每件作品最完整、最能代表成品的一張。也排除了帶有文字浮水印
  // 的行銷風格圖（例如標示材質名稱、IG 帳號、吐槽文案的截圖），這些是原始
  // 社群貼文素材，不是乾淨的作品照。沒有精確的完成日期紀錄，先統一用新增
  // 這筆資料的日期，之後有更準確的日期可以再改。themes 標記飾品類型
  // （項鍊／手鏈／戒指），少數同張照片拍到不只一種飾品的疊加標記。
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/01.jpg", alt: "大珠項鍊手持展示，珍珠與銀色圓珠點綴，尾端有蝴蝶結造型墜飾", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/02.jpg", alt: "兩條大珠項鍊手持展示，琥珀色、湖水藍與透明大顆珠石交錯", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/03.jpg", alt: "兩條大珠項鍊手持展示，墨綠、琥珀與珍珠大珠交錯排列", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/04.jpg", alt: "兩條大珠項鍊特寫，琥珀色與灰藍色大珠串搭配鏤空花朵墜飾", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/05.jpg", alt: "多條大珠項鍊並排懸掛，白色貝殼、淺藍花朵與透明大珠造型各異", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/06.jpg", alt: "大珠項鍊戴在手腕展示，珊瑚橘、白珍珠與琥珀大珠交錯", sessions: 1 },
  { course: "串珠", themes: ["項鍊", "戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/07.jpg", alt: "大珠項鍊與戒指放在圓鏡面托盤上，透明與湖水藍大珠搭配珍珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/08.jpg", alt: "大珠項鍊戴在頸間展示，墨綠大珠與白色貝殼造型墜飾", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/09.jpg", alt: "大珠項鍊特寫，透明水晶大珠搭配白色鏤空花朵墜飾", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/10.jpg", alt: "大珠項鍊特寫，珍珠與湖水綠大珠間點綴銀色花朵墜飾", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/11.jpg", alt: "多條大珠項鍊並排懸掛，粉色、黃色、湖水藍大珠色彩繽紛", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/12.jpg", alt: "大珠項鍊戴在手腕展示，透明水晶花朵墜飾搭配淺藍與淺棕大珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/13.jpg", alt: "大珠項鍊特寫，白色貝殼與淺藍鏤空花朵大珠造型", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/14.jpg", alt: "大珠項鍊戴在頸間展示，橘色、墨綠、淺藍大珠與蛋白石大珠交錯", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/15.jpg", alt: "兩條大珠項鍊手持展示，紫水晶、湖水藍與珍珠大珠交錯排列", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/16.jpg", alt: "小珠項鍊全貌，米白與灰色小珠串成，點綴幾顆透明珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/17.jpg", alt: "兩條小珠項鍊放在圓鏡面托盤上，白色小珠點綴珍珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/18.jpg", alt: "小珠項鍊全貌，白色與淺藍小珠交錯，點綴珍珠與湖水藍大珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/19.jpg", alt: "小珠項鍊特寫，珍珠白小珠串成蝴蝶結造型墜飾", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/20.jpg", alt: "小珠項鍊手持展示，白色與粉紫色小珠交錯，點綴桃紅色珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊", "戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/21.jpg", alt: "多條小珠項鍊與戒指手持展示，黑色小珠與白色、粉彩小珠交錯", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/22.jpg", alt: "小珠項鍊全貌，藍色與白色小珠交錯，點綴湖水藍大珠與珍珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/23.jpg", alt: "小珠項鍊全貌，白色小珠串起多顆珍珠與淺灰珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/24.jpg", alt: "多條小珠項鍊手持展示，米白、海軍藍與琥珀色小珠交錯", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/25.jpg", alt: "小珠項鍊放在圓鏡面托盤上，白色小珠點綴粉藍與湖水綠花朵珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/26.jpg", alt: "多條小珠項鍊特寫，淺藍、粉色與湖水綠花朵造型珠交錯點綴", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/27.jpg", alt: "多條小珠項鍊手持展示，琥珀、寶藍與珍珠白小珠色彩繽紛", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/28.jpg", alt: "項鍊特寫，白色與黑色小珠串搭配湖水藍鏤空花朵大珠墜飾", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/29.jpg", alt: "多條項鍊手持展示，白色、粉紫與淺橘大小珠交錯", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/30.jpg", alt: "項鍊特寫，灰色與黑色大小珠交錯，尾端有白色蝴蝶結墜飾", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/31.jpg", alt: "多條項鍊特寫，白色、淺灰與琥珀色大小珠交錯排列", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/32.jpg", alt: "項鍊特寫，銀灰色珍珠大珠與藍綠色小珠交錯", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/33.jpg", alt: "項鍊全貌，墨綠與透明大小珠交錯，點綴蛋白石大珠", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/34.jpg", alt: "項鍊全貌，粉橘、淺紫與珍珠色大小珠交錯排列", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/35.jpg", alt: "多條項鍊放在圓鏡面托盤上，透明水晶、珍珠與黑曜石大珠交錯", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/36.jpg", alt: "多條項鍊並排懸掛，灰藍、粉紫與珍珠大小珠色彩交錯", sessions: 1 },
  { course: "串珠", themes: ["項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/37.jpg", alt: "多條項鍊並排懸掛，琥珀、粉色與湖水藍大小珠交錯，點綴貝殼墜飾", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/38.jpg", alt: "珍珠戒指與蝴蝶結造型珍珠戒指戴在手指上展示", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/39.jpg", alt: "三只戒指放在圓鏡面托盤上，紅色、淺藍愛心與粉色花朵款式各異", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/40.jpg", alt: "戒指戴在手指上展示，深色愛心珠搭配灰藍與珍珠小珠", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/41.jpg", alt: "戒指戴在手指上展示，白色鏤空花朵珠搭配紅白條紋小珠", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/42.jpg", alt: "六只戒指放在黑色圓鏡面托盤上，湖水藍、靛藍與珍珠白款式各異", sessions: 1 },
  { course: "串珠", themes: ["戒指", "項鍊"], date: "2026-10-19", src: "../assets/images/gallery/beading/43.jpg", alt: "戒指與項鍊放在圓鏡面托盤上，透明與珍珠色小珠交錯", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/44.jpg", alt: "戒指戴在手指上展示，珍珠白小珠編織成蝴蝶結造型", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/45.jpg", alt: "三只戒指懸掛展示，藍色、灰白與透明小珠款式各異，後方襯著綠葉", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/46.jpg", alt: "六只戒指放在圓鏡面托盤上，米色、灰綠與靛藍寶石款式各異", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/47.jpg", alt: "兩只戒指戴在手指上展示，淺藍小珠搭配湖水藍大珠", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/48.jpg", alt: "戒指戴在手指上展示，淺藍水滴大珠搭配金色與白色小珠", sessions: 1 },
  { course: "串珠", themes: ["戒指"], date: "2026-10-19", src: "../assets/images/gallery/beading/49.jpg", alt: "戒指戴在手指上展示，銀色圓珠串成，一旁疊戴白色珍珠戒指", sessions: 1 },
  { course: "串珠", themes: ["手鏈"], date: "2026-10-19", src: "../assets/images/gallery/beading/50.jpg", alt: "兩條手鍊戴在手腕上展示，淺藍鏤空花朵珠與透明大珠交錯", sessions: 1 },

  // 2026-10-29 新增「大幅畫布訂製」首批真實學員作品 4 件：這堂課原本
  // 作品牆是空的（courses/large-canvas/index.html 之前完全沒有對應
  // 照片）。使用者整理的素材夾裡這個分類實際只有 3 件不同的大畫布作品，
  // 每件各選 1～2 張（全幅構圖照 + 肌理特寫照各一張），不是 11 張素材
  // 全部收錄——其餘是同一件作品的其他角度／特寫重複照，放進作品集會
  // 重複計算同一件作品。
  // 2026-10-30 修正：原本每筆都寫 sessions:1，使用者更正大幅畫布不是
  // 都一堂完成，拿掉這個欄位（不確定/沒問過就不填，跟本檔案開頭的
  // 欄位說明一致）；03/04 兩張原本 alt 誤寫成「石英砂肌理畫」，但這兩張
  // 實際來源是「石英砂打底＋油畫」資料夾（石英砂堆疊主體＋筆刷描繪
  // 細節的複合做法），不是純石英砂肌理，已經改成正確的材料描述。
  // 2026-10-30 再新增第 4 件真實作品（05.jpg）：珠寶項鍊肖像特寫，是
  // 油畫＋筆刷做法（跟「自己帶圖創作」課程同一種技法）＋加大畫布，
  // 原本只當課程頁開場的情境照用（assets/images/courses/large-canvas/
  // context-necklace.jpg），使用者確認這張也該算進正式作品集，所以
  // 另外存一份進 assets/images/gallery/large-canvas/ 加進這裡。themes
  // 跟其他植物題材的三件不同，標「人像」（畫面主體是人臉下半部＋
  // 項鍊，不是植物）。
  { course: "大幅畫布訂製", themes: ["植物花卉"], date: "2026-10-29", src: "../assets/images/gallery/large-canvas/01.jpg", alt: "大幅畫布石英砂肌理畫，白底搭配深淺綠色熱帶葉片，畫架斜角擺放" },
  { course: "大幅畫布訂製", themes: ["植物花卉"], date: "2026-10-29", src: "../assets/images/gallery/large-canvas/02.jpg", alt: "大幅油畫天堂鳥花與深綠闊葉，粉白背景，兩人雙手扶著畫布展示全貌" },
  { course: "大幅畫布訂製", themes: ["植物花卉"], date: "2026-10-29", src: "../assets/images/gallery/large-canvas/03.jpg", alt: "大幅畫布石英砂打底＋油畫，藍綠龜背芋與羽葉搭配金色線條勾勒的葉形輪廓，學員雙手扶著展示" },
  { course: "大幅畫布訂製", themes: ["植物花卉"], date: "2026-10-29", src: "../assets/images/gallery/large-canvas/04.jpg", alt: "大幅畫布石英砂打底＋油畫局部特寫，藍色羽狀葉片與金色線條勾勒的葉形輪廓" },
  { course: "大幅畫布訂製", themes: ["人像"], date: "2026-10-30", src: "../assets/images/gallery/large-canvas/05.jpg", alt: "大幅油畫珠寶項鍊肖像特寫，掛在木質牆面上，學員伸手調整畫作位置" },

  // 2026-10-29 新增「流動畫」首批真實學員作品 13 件：courses/fluid-art/
  // 之前作品牆也是空的。使用者整理的素材夾裡這個分類有兩個來源資料夾，
  // 「流動畫」本資料夾（30 張，工作室日常上課）挑出 13 張構圖完整的
  // 成品照；另一個「流動畫家庭日」資料夾（27 張）內容是戶外市集擺攤
  // 活動照，跟畫室內正式付費課程情境不同，先不放進作品集。themes 留空
  // 陣列：使用者確認「流動畫」這個 course 欄位本身就是獨立分類，不用
  // 再疊加主題標籤（曾經試過標「抽象圖案」／「抽象畫」，最後都拿掉，
  // 見下方 GALLERY_THEMES 旁 2026-10-30 的說明）。
  // 2026-10-30 使用者更正：作品集不一定要放成品照，倒膠/調色/吹畫這類
  // 過程照只要有畫作出現也可以放，不用篩得這麼緊。回頭把「流動畫」
  // 資料夾剩下的照片再看一次，補上 14 張構圖不同的過程/展示照
  // （14～27.jpg）；另外 2 張跳過沒收錄，是同一張已經用過的灰沙金
  // 方形畫布（09.jpg）的另一個角度，收錄了只是重複計算同一件作品。
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/01.jpg", alt: "藍白黑流動畫圓形畫布特寫，搭配同色系小方塊畫布", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/02.jpg", alt: "粉灰白流動畫圓形托盤，大理石紋路由雙手捧著展示", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/03.jpg", alt: "紫金藍流動畫方形畫布兩幅並排，色彩交融出大理石紋理", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/04.jpg", alt: "藍綠橘流動畫方形畫布，戴手套的手捧著展示色彩交融紋理", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/05.jpg", alt: "紅黑白流動畫方形畫布，戲劇化的血紅色紋理交疊黑白紋路", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/06.jpg", alt: "粉藍金流動畫方形畫布，由雙手捧著展示柔和色彩紋理", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/07.jpg", alt: "青銅色流動畫圓形托盤，學員微笑展示放在金屬瀝架上的完成作品", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/08.jpg", alt: "藍白金流動畫方形畫布，學員微笑捧著展示完成作品", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/09.jpg", alt: "灰沙金流動畫方形畫布，老師捧著展示柔和漸層紋理", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/10.jpg", alt: "橘棕色流動畫方形畫布，帶白色氣泡紋路的暖色調大理石紋理", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/11.jpg", alt: "黑灰紫流動畫方形畫布，深色背景襯托出雲霧般的紋理", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/12.jpg", alt: "兩件流動畫圓形托盤並排，前景深藍沙金色、後景粉藕色大理石紋理", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-29", src: "../assets/images/gallery/fluid-art/13.jpg", alt: "粉白棕流動畫圓形托盤，搭配同色系小方塊畫布置於杯座上", sessions: 1 },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/14.jpg", alt: "學員彎腰用吸管對著白色圓形畫布吹氣，吹出墨綠色放射狀紋路" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/15.jpg", alt: "手拿紙杯將藍色顏料倒入黑色方形畫布，畫面已有橘藍色波浪紋路" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/16.jpg", alt: "手拿紙杯將灰藍色顏料倒入另一個紙杯中調色" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/17.jpg", alt: "手拿紙杯將紅色顏料倒入黑色方形畫布，畫面已有橘藍綠色交錯紋路" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/19.jpg", alt: "手拿紙杯將白色顏料倒在白色圓形畫布中央，已暈開墨綠色花朵狀紋路" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/20.jpg", alt: "白色紙杯壓在紅橘黑綠交錯紋路的方形畫布中央，手指沾滿黑色顏料" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/21.jpg", alt: "雙手捧著白色圓形畫布，正把紙杯裡的深色顏料倒在中央" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/22.jpg", alt: "手拿紙杯將深色顏料倒入圓形畫布，已有褐灰白交錯的大理石紋路" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/23.jpg", alt: "雙手沾滿藍綠色顏料，手指輕觸淺藍金色大理石紋路畫布邊緣特寫" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/24.jpg", alt: "老師捧著粉白色大理石紋路方形畫布，向鏡頭展示完成的作品" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/25.jpg", alt: "手指輕觸青綠黃白交錯紋路的圓形畫布邊緣特寫" },
  { course: "流動畫", themes: [], date: "2026-10-30", src: "../assets/images/gallery/fluid-art/26.jpg", alt: "老師捧著粉藍薄荷綠相間的方形畫布，向鏡頭展示完成的紋路" },

  // 2026-10-30 新增「迪士尼」主題作品，共 32 件：使用者整理素材夾時把
  // 這批獨立歸成一類，確認「迪士尼可以自己獨立」（不併入「動漫／
  // 角色」）。第一輪只挑了 13 張「不重複構圖」的作品，使用者更正：
  // 資料夾裡放的每一張都要收錄，不用自己篩選「重不重複」——同一個
  // 角色的不同拍攝角度／不同構圖版本，使用者都當成獨立的素材放進去，
  // 不是失誤。後來使用者又陸續補了 9 張新照片進資料夾，一併收錄，
  // 最終從 32 張素材全部收錄，不篩選。
  // 30 件是油畫＋筆刷（course 歸在「自己帶圖創作」，比照 landscape-oil／
  // sea-oil／star-sky／whale 這幾個既有主題資料夾的做法，另開
  // assets/images/gallery/disney/ 資料夾），2 件（小熊維尼＋驢子、
  // 茶壺夫人＋奇普）實際材質是石英砂肌理畫，不是油畫，course 照實歸在
  // 「石英砂肌理畫」、照片存進既有的 sand-texture/ 資料夾接續編號
  // （33.jpg／34.jpg），不是硬塞進 disney/ 資料夾湊數。sessions 依照
  // 素材夾的資料夾名稱（單堂／2堂／3堂／4堂）照實填寫。少數幾張角色
  // 不確定具體是哪一部動畫/哪個角色名稱（例如疑似非迪士尼角色的素材、
  // 風格化到難以指認是哪位公主的畫面），alt 文字刻意不寫具體片名/
  // 角色名，避免寫錯造成誤導，只寫畫面實際內容。
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/01.jpg", alt: "小美人魚愛麗兒與比目魚，珊瑚粉背景，畫面寫著 Jessie 2022 愛心字樣", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/02.jpg", alt: "小美人魚愛麗兒臉部特寫，紅髮搭配金色頭飾，笑容燦爛", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/03.jpg", alt: "魔髮奇緣樂佩公主乘船，夜空中飄滿金黃色天燈", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/04.jpg", alt: "冰雪奇緣艾莎與雪白冰馬，淺藍色調的夢幻場景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/05.jpg", alt: "阿拉丁茉莉公主紅色禮服造型，深紅背景，手邊有一隻黑色小猴子", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/06.jpg", alt: "怪獸電力公司大眼仔戴著 MU 棒球帽，木質門板背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/07.jpg", alt: "小鹿斑比與兔子桑普、臭鼬花兒在森林空地相遇，蝴蝶停在斑比尾巴上", sessions: 2 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/08.jpg", alt: "粉紫色夕陽海邊，人物背影剪影坐在岩石上", sessions: 2 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/09.jpg", alt: "獅子王木法沙與辛巴依偎，深藍星空背景", sessions: 2 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/10.jpg", alt: "小美人魚愛麗兒手拿粉紅海星，藍色背景，紅髮隨波飄動", sessions: 3 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/11.jpg", alt: "擬人化牡蠣角色們圍著樹根聊天，深綠色水底場景，氣泡環繞", sessions: 3 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/12.jpg", alt: "小美人魚愛麗兒與比目魚、賽巴斯汀在海底礁岩，陽光透過水面灑落", sessions: 3 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/13.jpg", alt: "小美人魚愛麗兒與比目魚，深藍背景，紅髮大面積鋪滿畫面", sessions: 2 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/14.jpg", alt: "魔髮奇緣變色龍帕斯卡站在樂佩公主頭頂，黑色背景特寫", sessions: 2 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/15.jpg", alt: "小美人魚愛麗兒與比目魚特寫，深藍背景，紅髮隨波飄動", sessions: 2 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/16.jpg", alt: "魔髮奇緣變色龍帕斯卡穿著粉紫小洋裝，站在樂佩公主頭頂特寫", sessions: 2 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/17.jpg", alt: "小鹿斑比與兔子桑普、臭鼬花兒在森林相遇，蝴蝶停在斑比尾巴上", sessions: 2 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/18.jpg", alt: "小鹿斑比與兔子桑普、臭鼬花兒森林場景，另一張拍攝角度，畫面右下角有簽名", sessions: 2 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/19.jpg", alt: "畫筆正在描繪粉藍色翅膀細節，繪製過程特寫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/20.jpg", alt: "小美人魚愛麗兒與比目魚，珊瑚粉背景，畫面點綴愛心與文字裝飾", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/21.jpg", alt: "阿拉丁茉莉公主墨綠色背景，頭戴藍色寶石頭飾", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/22.jpg", alt: "小美人魚愛麗兒與比目魚、賽巴斯汀在海底礁岩，另一張拍攝角度", sessions: 3 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/23.jpg", alt: "動畫角色遭大型毛怪抓住，一旁有小動物丟雪球的逗趣場景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/24.jpg", alt: "小美人魚反派烏蘇拉特寫，灰紫色皮膚與白髮，背景觸手環繞", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/25.jpg", alt: "唐老鴨與黛絲鴨捧著花束，粉色背景寫著 Donald Duck 字樣", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/26.jpg", alt: "藍髮女子側臉剪影，背景珊瑚與魚群點綴", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/27.jpg", alt: "小美人魚愛麗兒與艾力克王子深情對視，黑白紅紫配色的普普風插畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/28.jpg", alt: "小美人魚愛麗兒臉部特寫，紅髮搭配藍天白雲背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/29.jpg", alt: "小美人魚愛麗兒坐在礁岩上眺望遠方，深藍海底場景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/30.jpg", alt: "戴眼鏡老先生肖像，一旁有貓咪與櫻桃，畫面簽名 Lydia", sessions: 1 },
  { course: "自己帶圖創作", themes: ["迪士尼／皮克斯"], date: "2026-10-30", src: "../assets/images/gallery/disney/31.jpg", alt: "美女與野獸被施魔法的玫瑰，玻璃罩特寫，深藍森林背景", sessions: 1 },

  // 2026-10-30 新增「吉卜力」主題作品，共 16 件（6 件第一批＋9 件使用者
  // 後續補的＋1 件再補的霍爾的移動城堡），見上方 GALLERY_THEMES 旁的
  // 說明。15 件是油畫＋筆刷，
  // course 歸在「自己帶圖創作」，另開 assets/images/gallery/ghibli/
  // 資料夾（比照 disney/ 的做法）；1 件（龍貓坐在樹下）材質是刮刀
  // 油畫，歸在「刮刀油畫」那堂課，見 palette-knife-oil/45.jpg 那筆。
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/01.jpg", alt: "霍爾的移動城堡霍爾與蘇菲肖像畫兩幅並排", sessions: 2 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/02.jpg", alt: "霍爾的移動城堡火惡魔卡西法特寫，抱著一截木柴", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/03.jpg", alt: "龍貓撐傘站在粉紅花海上，深藍夜空背景，一旁跟著小龍貓", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/04.jpg", alt: "風之谷王蟲特寫，灰綠色外殼佈滿藍色眼睛，藍天白雲背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/05.jpg", alt: "龍貓小梅趴在草地上，身後跟著一隻小龍貓", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/06.jpg", alt: "龍貓小月站在大龍貓肚子上，深藍夜晚森林場景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/07.jpg", alt: "神隱少女煤炭精靈群中，坊寶寶變成的老鼠與湯婆婆的小鳥", sessions: 2 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/08.jpg", alt: "吉卜力風格石造小屋場景，粉色花海與溪流環繞", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/09.jpg", alt: "借物少女艾莉緹側臉特寫，髮夾別著曬衣夾，綠色樹葉背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/10.jpg", alt: "紅豬波魯克駕駛紅色飛機特寫，戴著飛行帽與護目鏡", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/11.jpg", alt: "神隱少女白龍與千尋依偎，深綠色背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/12.jpg", alt: "崖上的波妞與宗介在森林小路上牽手前行，兩幅畫布並排", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/13.jpg", alt: "神隱少女煤炭精靈群中，一隻粉色絨毛生物舉起雙手", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/14.jpg", alt: "紅豬波魯克駕駛紅色飛機特寫，另一個拍攝角度", sessions: 1 },
  { course: "自己帶圖創作", themes: ["吉卜力"], date: "2026-10-30", src: "../assets/images/gallery/ghibli/15.jpg", alt: "霍爾的移動城堡霍爾與蘇菲站在開滿野花的山坡上，藍天白雲背景", sessions: 1 },

  // 2026-11-01 新增：使用者提供「人油畫筆刷」中的人像單堂、2堂、3堂作品。
  // 依來源資料夾登錄完成堂數；照片日期未知，採整理日期。資料夾 4 堂先不處理。
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/01.jpg", alt: "背對觀者的長髮人物肖像，手持藍色畫筆", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/02.jpg", alt: "新人婚禮肖像油畫，兩人相擁", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/03.jpg", alt: "蒙眼人物肖像油畫，手捧紅色花束", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/04.jpg", alt: "嬰兒肖像油畫，躺在棕色毯子上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/05.jpg", alt: "兩幅人物肖像油畫並排展示", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/06.jpg", alt: "長髮人物側臉肖像油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/07.jpg", alt: "新人婚紗肖像油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/08.jpg", alt: "人物肖像油畫創作過程，正在描繪紅色花朵", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/09.jpg", alt: "海邊人物風景油畫，遠處有馬匹", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/10.jpg", alt: "長髮人物肖像油畫，畫布置於畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/11.jpg", alt: "戴眼鏡的女性肖像油畫，綠色背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/12.jpg", alt: "兩人合照參考與肖像畫並列展示", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/13.jpg", alt: "婚禮人物肖像油畫，兩人穿著禮服", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/14.jpg", alt: "人物肖像油畫，畫布置於畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/15.jpg", alt: "人物與海邊風景油畫作品", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/16.jpg", alt: "新人婚紗肖像油畫，綠色草地背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/17.jpg", alt: "學員手持人物肖像油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/18.jpg", alt: "黑白婚禮人物肖像油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/19.jpg", alt: "兩位人物肖像油畫，畫在同一幅畫布上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/20.jpg", alt: "人物與校園場景油畫作品", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/21.jpg", alt: "海邊人物合照油畫，畫布放在畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/22.jpg", alt: "新人站在草地上的婚紗肖像油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/23.jpg", alt: "人物肖像油畫創作過程，畫筆正在描繪人物", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/25.jpg", alt: "海邊人物風景油畫，藍色天空與沙灘", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/26.jpg", alt: "兩位人物坐在海邊的油畫作品", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/27.jpg", alt: "紅髮女性肖像油畫，紅色背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/28.jpg", alt: "女性與花束肖像油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/29.jpg", alt: "海邊人物風景油畫，兩人在海岸邊", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/30.jpg", alt: "長者女性肖像油畫，淺粉色背景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/31.jpg", alt: "兩幅人物肖像畫並排展示", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/32.jpg", alt: "人物在樹下野餐的風景油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/33.jpg", alt: "幼童肖像油畫，手持玩具", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/34.jpg", alt: "人物與羊群風景油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/35.jpg", alt: "人物肖像油畫，學員手持作品", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/36.jpg", alt: "校園人物場景油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/37.jpg", alt: "紅髮少年肖像油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/38.jpg", alt: "人物肖像油畫創作過程，畫筆正在描繪男性臉部", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/01.jpg", alt: "戴眼鏡女性肖像油畫，人物手持帽子", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/02.jpg", alt: "家庭人物合照油畫，畫中有成人與孩子", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/03.jpg", alt: "多人肖像油畫，三位女性並排呈現", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/04.jpg", alt: "人物肖像油畫創作過程，學員正在描繪臉部", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/05.jpg", alt: "海邊多人風景油畫，畫面有夕陽", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/06.jpg", alt: "嬰兒肖像油畫，戴著淺色帽子", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/07.jpg", alt: "畢業生與家人合照肖像油畫", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/08.jpg", alt: "海灘上的多人合照油畫", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/09.jpg", alt: "兩位人物站在校園建築前的油畫作品", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/two-sessions/10.jpg", alt: "人物肖像油畫創作過程，畫筆正在描繪黑白人物", sessions: 2 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/three-sessions/01.jpg", alt: "家庭四人合照肖像油畫，背景為城市夜景", sessions: 3 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/three-sessions/03.jpg", alt: "畢業生肖像油畫，手捧花束", sessions: 3 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/three-sessions/04.jpg", alt: "一對新人坐在公園長椅上的肖像油畫", sessions: 3 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/three-sessions/05.jpg", alt: "人物背對畫面整理長髮的肖像油畫", sessions: 3 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/three-sessions/06.jpg", alt: "兩位穿著和服的人站在街景前的肖像油畫", sessions: 3 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/three-sessions/07.jpg", alt: "人物坐姿肖像油畫，旁邊放著手機參考照片", sessions: 3 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/three-sessions/08.jpg", alt: "背對觀者相擁的兩人與夕陽山景油畫", sessions: 3 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/three-sessions/09.jpg", alt: "兩位穿著和服的人站在街景前的肖像油畫近照", sessions: 3 },

  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/40.jpg", alt: "人物肖像油畫創作過程，畫布上先以灰階描出人物輪廓", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/35.jpg", alt: "海邊石堆油畫創作過程，學員正在描繪海浪與疊石", sessions: 1 },
  // 2026-11-01 新增：油畫筆刷學員作品，依作品主題分入海景、星空、
  // 風景、人像與鯨魚資料夾；來源有標示堂數的鯨魚作品沿用堂數，其餘不推測。
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/10.jpg", alt: "海邊油畫，藍色海面與岸邊小屋，畫布放在畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景", "星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/landscape-oil/11.jpg", alt: "黃昏城市油畫，遠方高塔與城市剪影映在水面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/11.jpg", alt: "海灘油畫創作過程，畫布上是沙灘、海面與遠方人物", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/12.jpg", alt: "海邊人物風景油畫，兩人在夕陽下沿岸散步", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景"], date: "2026-11-01", src: "../assets/images/gallery/landscape-oil/12.jpg", alt: "東京街景油畫創作過程，畫筆正在描繪街道與人物", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景", "人像"], date: "2026-11-01", src: "../assets/images/gallery/landscape-oil/13.jpg", alt: "人物站在草地上的油畫創作過程，背景是柔和的粉色天空", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/13.jpg", alt: "海浪與山景油畫創作過程，學員正在畫布上描繪海面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-11-01", src: "../assets/images/gallery/landscape-oil/14.jpg", alt: "富士山雪景油畫，藍紫色山峰映在粉紫天空下", sessions: 1 },
  { course: "自己帶圖創作", themes: ["人像"], date: "2026-11-01", src: "../assets/images/gallery/portrait-oil/one-session/39.jpg", alt: "粉色頭髮人物肖像油畫創作過程，畫布放在畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景", "人像"], date: "2026-11-01", src: "../assets/images/gallery/landscape-oil/15.jpg", alt: "兩人在海邊撐傘的風景油畫，天空與海面呈現暖色調", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "人像"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/14.jpg", alt: "夕陽海邊油畫，兩人坐在岸邊欣賞海面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/landscape-oil/16.jpg", alt: "白色花朵油畫創作過程，畫筆正在描繪花瓣細節", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景"], date: "2026-11-01", src: "../assets/images/gallery/landscape-oil/17.jpg", alt: "綠色山丘風景油畫創作過程，學員正在描繪草地", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-11-01", src: "../assets/images/gallery/landscape-oil/18.jpg", alt: "橘色夕照下的富士山油畫", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/15.jpg", alt: "海景油畫創作過程，畫布上是藍色海浪與遠山", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/16.jpg", alt: "深色海岸與遠山的油畫風景", sessions: 1 },
  { course: "自己帶圖創作", themes: ["風景", "植物花卉"], date: "2026-11-01", src: "../assets/images/gallery/landscape-oil/19.jpg", alt: "秋日樹林與遠山的油畫風景，畫布置於畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/38.jpg", alt: "圓形畫布的月球表面油畫創作過程，學員正在描繪月面細節", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/39.jpg", alt: "藍紫色星空油畫，遠方山巒與湖面倒影交映", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/40.jpg", alt: "月球表面油畫作品，畫布置於畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/41.jpg", alt: "紫色星雲與銀河油畫作品，陳列於畫架間", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/42.jpg", alt: "圓形畫布的月球油畫作品，放在畫架上展示", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/43.jpg", alt: "圓形畫布的銀河星空油畫，色彩呈現藍綠與紫紅漸層", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/44.jpg", alt: "學員手持藍紫色星空油畫作品留影", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/45.jpg", alt: "藍色天空與白雲海景油畫，畫布放在畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/46.jpg", alt: "紫色銀河星空油畫，繁星點綴夜空", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/47.jpg", alt: "深藍色星空油畫，山巒剪影映在湖面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["星空／月亮"], date: "2026-11-01", src: "../assets/images/gallery/star-sky/48.jpg", alt: "粉紫色星雲油畫作品，陳列於畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/17.jpg", alt: "海邊油畫，夕陽映照平靜海面，遠方有帆船", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/18.jpg", alt: "海浪與沙灘油畫，畫布置於畫架上展示", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/19.jpg", alt: "圓形畫布的海景油畫創作過程，學員正在描繪海面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/20.jpg", alt: "夕陽與雲彩油畫創作過程，學員正在描繪天空", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/21.jpg", alt: "藍色海浪與白色浪花油畫，學員正在描繪畫面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/22.jpg", alt: "圓形畫布的粉紫色海景油畫，遠方海島映在海面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/23.jpg", alt: "藍色海底油畫，鯨魚與海龜在水中悠游", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/24.jpg", alt: "夕陽海面與岸邊人物油畫創作過程", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/25.jpg", alt: "藍色海浪與白色沙灘油畫，畫布放在畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/26.jpg", alt: "深藍色海浪油畫特寫，白色浪尖層層推進", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/27.jpg", alt: "藍色海景油畫創作過程，學員正在描繪浪花", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/28.jpg", alt: "海邊橋梁油畫，畫布上呈現海面與粉色天空", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/29.jpg", alt: "港邊帆船油畫，船隻停泊在灰藍色海面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/30.jpg", alt: "夕陽下的海灣與遠山油畫，畫布放在畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/31.jpg", alt: "橘色夕陽與海面油畫，畫布置於畫架上", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/32.jpg", alt: "粉紫色海岸油畫，浪花沿著岸邊延伸", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/33.jpg", alt: "藍色海浪油畫創作過程，畫筆正在描繪浪花", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海邊", "風景"], date: "2026-11-01", src: "../assets/images/gallery/sea-oil/34.jpg", alt: "粉色天空與藍綠色海面的直幅油畫作品", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-11-01", src: "../assets/images/gallery/whale/13.jpg", alt: "藍色海面下的鯨魚油畫，學員正在描繪鯨魚身體", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-11-01", src: "../assets/images/gallery/whale/14.jpg", alt: "深色背景的鯨魚油畫，月亮映照海面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-11-01", src: "../assets/images/gallery/whale/15.jpg", alt: "灰藍色背景的鯨魚油畫創作過程，畫筆描繪鯨魚身體", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-11-01", src: "../assets/images/gallery/whale/16.jpg", alt: "鯨魚躍出藍色海面的油畫作品，畫布平放展示", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-11-01", src: "../assets/images/gallery/whale/17.jpg", alt: "深色畫布上的鯨魚油畫，星空與光束映照海面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-11-01", src: "../assets/images/gallery/whale/18.jpg", alt: "學員正在描繪鯨魚油畫，畫布上是鯨魚與海面", sessions: 1 },
  { course: "自己帶圖創作", themes: ["海洋生物"], date: "2026-11-01", src: "../assets/images/gallery/whale/19.jpg", alt: "圓形畫布的兩隻鯨魚油畫，藍灰色鯨魚悠游於淺色背景", sessions: 3 },
];

// 課程篩選鈕的選項清單，跟首頁「課程」選單、faq.html 裡提到的課程名稱
// 一致，不是另外編一套名稱。
window.GALLERY_COURSES = [
  "石英砂肌理畫",
  "刮刀油畫",
  "流動畫",
  "抽象畫",
  "自己帶圖創作",
  "寵物油畫",
  "鏡子拼貼",
  "串珠",
  "大幅畫布訂製",
  "特殊材質客製",
];

// 2026-09-13 新增：課程名稱對應到該課程頁面的路徑（相對於網站根目錄），
// 給 js/gallery.js 產生「查看課程」連結用（見 js/gallery-lightbox.js 的
// 燈箱下方連結）。只列出已經有獨立頁面的課程——抽象畫、鏡子拼貼
// 目前沒有自己的頁面，不列在這裡，燈箱看到這幾堂課的作品時就不會顯示
// 連結，不會連到不存在的頁面。這個連結只在 gallery.html（綜合瀏覽頁）
// 顯示，各課程頁自己的「學員作品」預覽區（js/gallery-course-preview.js）
// 不會顯示——使用者已經在那堂課的頁面上了，再跳一次「前往這堂課」是
// 繞一圈回原地，沒有意義。
// 2026-09-16 新增「流動畫」：courses/fluid-art.html 上線。
// 2026-09-16 新增「特殊材質客製」：courses/custom-material.html 上線，
// 跟「大幅畫布訂製」同樣是客製服務性質，不是固定期別的技法課。
// 2026-09-20：全站改乾淨網址，gallery.html 本身也搬進 gallery/index.html
// （多了一層），這裡的路徑要補上 "../" 才能正確回頭指到 courses/ 底下。
window.GALLERY_COURSE_LINKS = {
  "石英砂肌理畫": "../courses/sand-texture/",
  "刮刀油畫": "../courses/palette-knife-oil/",
  "流動畫": "../courses/fluid-art/",
  "自己帶圖創作": "../courses/custom-photo-oil/",
  "寵物油畫": "../courses/pet-portrait/",
  "串珠": "../courses/beading/",
  "大幅畫布訂製": "../courses/large-canvas/",
  "特殊材質客製": "../courses/custom-material/",
};

// 主題標籤的起始清單——先列出來，之後看實際作品內容隨時可以增加，
// 不用一次想到齊全。
// 2026-09-13 討論後新增「動漫／角色」「星空／月亮」「海邊」三個標籤
// （「自己帶圖創作」課程的 IG 作品分類討論），原本歸在「跟鯨魚有關」
// 的作品併入既有的「海洋生物」標籤，不另開新標籤。
// 2026-09-13 再新增「山」標籤：使用者認為「風景」底下分類太雜，山本身
// 就是熱門主題，值得獨立出來，不用再併在「風景」裡。
// 2026-09-18 新增「狗狗」「貓咪」「兩隻以上」三個標籤：寵物油畫的學員
// 作品要分這三類呈現（見 courses/pet-portrait.html「學員作品」段落），
// 比泛用的「陸地動物」更精確。「兩隻以上」21 件、單隻「貓咪」13 件都已
// 有真實照片（見上方 GALLERY_ITEMS），且「兩隻以上」同時疊加「狗狗」／
// 「貓咪」標籤——瀏覽「貓咪」時有貓的兩隻合照也要一起出現，瀏覽「狗狗」
// 也一樣，這三個標籤是可以同時成立的一般主題標籤，不是互斥分類。
// 2026-09-30 新增「食物」標籤：使用者上傳一批刮刀油畫學員作品裡有水蜜桃、
// 蛋糕、披薩這類食物靜物題材，之前的分類都不合適（不是植物花卉、也不是
// 節慶／季節），獨立開一個「食物」標籤。
// 2026-10-19 新增「項鍊」「手鏈」「戒指」三個標籤：「串珠」課程第一批真實
// 學員作品上架，之前的標籤都是給繪畫主題用的，沒有適合珠寶飾品的分類。
// 這三個照實標記作品的飾品類型（不是材質或珠子大小），同一件作品只會有
// 其中一種（項鍊、手鏈、戒指互斥，不像山／海邊那種可以疊加的主題標籤）。
// 2026-10-30：「流動畫」的作品原本標成「抽象圖案」主題，後來又短暫
// 改成新開的「抽象畫」標籤，最後使用者確認：流動畫本身（courses 欄位
// 已經是「流動畫」）就是獨立的分類依據，不需要再疊加任何主題標籤——
// 瀏覽作品集時用「流動畫」課程篩選鈕就夠了，不用再多一層主題篩選。
// 所以「流動畫」底下所有作品的 themes 改回空陣列 []，「抽象圖案」
// 這個主題標籤維持只留給其他課程裡真的有抽象構圖的作品用。
// 2026-10-30 新增「迪士尼」標籤：使用者整理素材夾時把迪士尼主題的
// 學員作品獨立歸成一類，確認這類題材「自己獨立」，不要併進泛用的
// 「動漫／角色」標籤裡——瀏覽「動漫／角色」時找的是比較廣義的動漫
// 題材，迪士尼公主/電影角色是更明確、量也夠多的子分類，值得獨立。
// 2026-10-30 再新增「吉卜力」標籤：使用者當初把「迪士尼、宮崎駿」
// 一起列為要各自獨立的主題（原話：「迪士尼、宮崎駿可以自己獨立」），
// 道理跟迪士尼一樣——不併入「動漫／角色」，另開專屬標籤。一開始沿用
// 素材夾資料夾名稱叫「宮崎駿」，後來使用者自己要求改名「吉卜力」，
// 這批作品也橫跨霍爾的移動城堡、龍貓、風之谷、神隱少女、借物少女
// 艾莉緹、崖上的波妞、紅豬這幾部不同片，用工作室名稱「吉卜力」當
// 標籤比「宮崎駿」更準確涵蓋（風之谷是宮崎駿執導但工作室成立前的
// 作品，借物少女艾莉緹是米林宏昌執導、宮崎駿只掛企劃，「吉卜力」
// 這個名稱才真的涵蓋得到這些不是宮崎駿本人執導的作品）。
window.GALLERY_THEMES = [
  "海洋生物",
  "陸地動物",
  "植物花卉",
  "人像",
  "抽象圖案",
  "節慶／季節",
  "風景",
  "海邊",
  "山",
  "食物",
  "動漫／角色",
  "迪士尼／皮克斯",
  "吉卜力",
  "星空／月亮",
  "狗狗",
  "貓咪",
  "兩隻以上",
  "項鍊",
  "手鏈",
  "戒指",
];
