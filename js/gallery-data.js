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
//   src: "assets/images/gallery/2026-09-01-sand-texture-flower.jpg",
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
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/sand-texture/01.jpg", alt: "石英砂肌理畫的滑雪場雪山空拍景色，畫面上有滑雪的人群與紅色旗幟", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/sand-texture/02.jpg", alt: "石英砂肌理畫的海邊夕陽山景，畫面前景有海浪與飛鳥", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/sand-texture/03.jpg", alt: "石英砂肌理畫的藍紫漸層天空下的雪山倒影", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/sand-texture/04.jpg", alt: "石英砂肌理畫的富士山，前景點綴楓紅樹葉", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/sand-texture/05.jpg", alt: "石英砂肌理畫的富士山，畫面飄落粉紅櫻花", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/sand-texture/06.jpg", alt: "石英砂肌理畫的湖邊山景，森林稜線倒映在藍色湖面上", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/sand-texture/07.jpg", alt: "石英砂肌理畫的馬特洪峰造型雪山，背景是藍天", sessions: 1 },
  { course: "石英砂肌理畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/sand-texture/08.jpg", alt: "石英砂肌理畫的山谷雪景，兩側山壁夾著中間的雪坡", sessions: 1 },

  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/01.jpg", alt: "油畫＋筆刷畫的富士山，前景有電線桿與枯草地", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/02.jpg", alt: "油畫＋筆刷畫的富士山，前景有紅色鳥居", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/03.jpg", alt: "油畫＋筆刷畫的山谷景色，畫面中有一列小火車行駛過草原", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/04.jpg", alt: "油畫＋筆刷畫的層疊山巒，籠罩著藍綠色薄霧", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/05.jpg", alt: "油畫＋筆刷畫的夕陽山巒，暖橘色天空與藍紫色山影層疊", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/06.jpg", alt: "油畫＋筆刷畫的雪山，一旁夾著參考的實景照片", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/07.jpg", alt: "油畫＋筆刷畫的富士山與櫻花，湖面倒映著粉色天空", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/08.jpg", alt: "油畫＋筆刷畫的岩石山壁與海面，海上有一艘小船", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/09.jpg", alt: "油畫＋筆刷畫的海邊步道，沿岸山巒與一排路燈", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/10.jpg", alt: "油畫＋筆刷畫的深藍色夜間山景，遠方透出微光", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/11.jpg", alt: "油畫＋筆刷畫的櫻花大道，盡頭是富士山", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/12.jpg", alt: "油畫＋筆刷畫的綠色丘陵與湖泊，前景點綴粉色花朵", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/13.jpg", alt: "油畫＋筆刷畫的雪山與深藍色海面，海上有一艘小船", sessions: 1 },
  { course: "自己帶圖創作", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-brush/14.jpg", alt: "油畫＋筆刷畫的富士山，透過窗框構圖望向湖面小船", sessions: 1 },

  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-knife/01.jpg", alt: "油畫＋刮刀畫的山，綠黃粉藍等顏色交錯堆疊出抽象質感", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-knife/02.jpg", alt: "刮刀油畫的翠綠山脈，刮刀堆疊出粗獷的筆觸質感", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-knife/04.jpg", alt: "刮刀油畫的灰白雪山群峰，山腳下有一間小屋", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-knife/05.jpg", alt: "刮刀油畫的粉白雪山，夜空中有一彎新月與星星", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-knife/06.jpg", alt: "刮刀油畫的沙丘山景，橘藍色調的夕陽", sessions: 1 },
  { course: "刮刀油畫", themes: ["山"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-knife/07.jpg", alt: "刮刀油畫的黑灰色馬特洪峰，前景是秋天的紅黃樹叢", sessions: 1 },
  { course: "刮刀油畫", themes: ["海邊"], date: "2026-09-13", src: "assets/images/guides/material-compare-mountain/oil-knife/08.jpg", alt: "刮刀油畫的海岸崖壁，浪花拍打岸邊，前景有紅色小花", sessions: 1 },

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
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-07-01", src: "assets/images/gallery/pet-portrait/01.jpg", alt: "白色蓬鬆毛狗狗肖像油畫，吐舌微笑，綠色草叢背景，畫面簽名Kobe", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-07-12", src: "assets/images/gallery/pet-portrait/02.jpg", alt: "哈士奇犬肖像油畫，灰白毛色、尖耳朵，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-07-18", src: "assets/images/gallery/pet-portrait/03.jpg", alt: "白色蓬鬆小狗肖像油畫，雙腳搭在藍色椅墊上，背景點綴白色小花", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-07-28", src: "assets/images/gallery/pet-portrait/04.jpg", alt: "白色與淺棕色毛小狗肖像油畫特寫，綠色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-08-25", src: "assets/images/gallery/pet-portrait/05.jpg", alt: "白色吉娃娃肖像油畫，大耳朵豎起，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-08-28", src: "assets/images/gallery/pet-portrait/06.jpg", alt: "白色法國鬥牛犬肖像油畫，頭戴花朵頭飾，暖橘色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-09-08", src: "assets/images/gallery/pet-portrait/07.jpg", alt: "黑白毛色狗狗肖像油畫，向前跳躍張嘴的瞬間，藍天與土黃色地面背景", sessions: 1 },
  // 08.jpg 一張照片裡拍到兩幅畫，但兩幅各自都是「單隻狗」的獨立作品
  // 並排拍在一起，不是一幅畫裡畫兩隻寵物——2026-09-18 使用者特別確認
  // 這張不屬於「兩隻以上」分類，themes 標「狗狗」是對的，alt 文字也
  // 特別寫清楚「各自獨立完成」避免以後被誤會成兩隻以上的合照作品。
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-09-22", src: "assets/images/gallery/pet-portrait/08.jpg", alt: "兩幅各自獨立完成的單隻狗狗肖像油畫並排展示，淺棕色毛色，分別戴著紫色與粉色項圈，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-10-10", src: "assets/images/gallery/pet-portrait/09.jpg", alt: "黑白毛色小狗肖像油畫，吐舌微笑，藍天與黃色地面背景", sessions: 1 },
  { course: "寵物油畫", themes: ["狗狗"], date: "2024-10-12", src: "assets/images/gallery/pet-portrait/10.jpg", alt: "米白色捲毛狗狗肖像油畫，張嘴微笑，淺藍色背景", sessions: 1 },

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
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗", "貓咪"], date: "2025-08-09", src: "assets/images/gallery/pet-portrait/11.jpg", alt: "橘色虎斑貓與白色吉娃娃合照肖像油畫，貓咪表情驚訝，狗狗吐舌微笑，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗", "貓咪"], date: "2025-10-24", src: "assets/images/gallery/pet-portrait/12.jpg", alt: "金黃色狗狗與虎斑貓合照肖像油畫，畫面寫著狗狗名字「甜甜」與貓咪名字「Ari」，白色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2025-04-07", src: "assets/images/gallery/pet-portrait/13.jpg", alt: "兩隻金棕色長毛狗狗依偎在綠色沙發上的肖像油畫，互相靠著頭休息", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2026-09-05", src: "assets/images/gallery/pet-portrait/14.jpg", alt: "小型白色蓬鬆狗狗疊坐在金黃色狗狗頭頂上的肖像油畫，金黃色狗狗戴著金屬項圈與吊牌，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2024-08-07", src: "assets/images/gallery/pet-portrait/15.jpg", alt: "兩隻黑白花色狗狗肖像油畫，其中一隻戴藍色胸背帶並吐舌，綠色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2024-08-28", src: "assets/images/gallery/pet-portrait/16.jpg", alt: "兩隻法國鬥牛犬幼犬肖像油畫，一隻深棕色一隻淺褐色，米黃色背景搭配布簾", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2024-10-10", src: "assets/images/gallery/pet-portrait/17.jpg", alt: "兩隻小型犬合照肖像油畫，白色蓬鬆狗狗吐舌，另一隻穿紅色毛衣，淺藍與黃色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "狗狗"], date: "2025-12-12", src: "assets/images/gallery/pet-portrait/18.jpg", alt: "兩隻白色捲毛蓬鬆狗狗肖像油畫，一隻吐舌微笑，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2026-02-09", src: "assets/images/gallery/pet-portrait/19.jpg", alt: "灰色虎斑貓與棕色虎斑幼貓依偎的肖像油畫，綠色豹紋圖案背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2026-05-17", src: "assets/images/gallery/pet-portrait/20.jpg", alt: "黑貓與白色長毛貓合照肖像油畫，兩隻都是綠色眼睛，橘色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2026-05-21", src: "assets/images/gallery/pet-portrait/21.jpg", alt: "三隻虎斑與白底貓咪的臉部並排肖像油畫，米白色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-07-06", src: "assets/images/gallery/pet-portrait/22.jpg", alt: "黑貓與白色長毛貓合照肖像油畫，簽名「波仕」，綠色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-07-06", src: "assets/images/gallery/pet-portrait/23.jpg", alt: "米白色貓咪與棕色虎斑貓合照肖像油畫，虎斑貓戴著粉色花朵項圈，粉色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-07-13", src: "assets/images/gallery/pet-portrait/24.jpg", alt: "橘白色貓咪與棕色虎斑貓依偎肖像油畫，簽名「Latte」，米棕色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-08-07", src: "assets/images/gallery/pet-portrait/25.jpg", alt: "灰白色貓咪與深灰色貓咪合照肖像油畫，簽名「Alma 2025.8」，米白色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-08-09", src: "assets/images/gallery/pet-portrait/26.jpg", alt: "白色貓咪與黑白賓士貓合照肖像油畫，簽名「Tatiana 2025」，米黃色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-08-21", src: "assets/images/gallery/pet-portrait/27.jpg", alt: "兩隻灰白色虎斑幼貓臉頰依偎熟睡的肖像油畫，米色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-09-20", src: "assets/images/gallery/pet-portrait/28.jpg", alt: "兩隻貓咪與福字貓抓箱的肖像油畫，灰色虎斑貓趴在箱頂，橘色虎斑貓從箱子洞口探頭，簽名「囉瑪＆腰果」", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-10-04", src: "assets/images/gallery/pet-portrait/29.jpg", alt: "兩隻蓬鬆長毛貓合照肖像油畫，都穿著草莓圖案洋裝、戴紅色蝴蝶結，粉色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-10-11", src: "assets/images/gallery/pet-portrait/30.jpg", alt: "白色蓬鬆貓咪倒臥吐舌與棕色虎斑貓合照的肖像油畫，簽名「Bruna Chen」，藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["兩隻以上", "貓咪"], date: "2025-10-22", src: "assets/images/gallery/pet-portrait/31.jpg", alt: "兩隻長毛貓互相伸手依偎的肖像油畫，一隻灰白色一隻棕色虎斑，藍色背景", sessions: 1 },

  // 2026-09-18 新增：「貓咪」（單隻貓）13 件，使用者從「單隻貓咪油畫
  // 照片」資料夾提供，逐張看過畫面內容才寫 alt——同一套方法論（見上方
  // 「兩隻以上」的說明）。date 用照片本身的拍攝日期。
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-02-08", src: "assets/images/gallery/pet-portrait/32.jpg", alt: "咖啡色虎斑貓肖像油畫，前爪搭在木箱邊緣，黃綠色眼睛，米白色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-02-10", src: "assets/images/gallery/pet-portrait/33.jpg", alt: "橘白色貓咪肖像油畫，仰頭向上看，米色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-02-10", src: "assets/images/gallery/pet-portrait/34.jpg", alt: "咖啡色虎斑幼貓肖像油畫，張嘴喵叫的瞬間，米色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-02-14", src: "assets/images/gallery/pet-portrait/35.jpg", alt: "灰藍色虎斑貓肖像油畫，抬頭仰望，藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-01", src: "assets/images/gallery/pet-portrait/36.jpg", alt: "黑白毛色貓咪肖像油畫特寫，米黃色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-01", src: "assets/images/gallery/pet-portrait/37.jpg", alt: "灰黑色貓咪肖像油畫，白色胸口毛色，低頭往下看，藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-01", src: "assets/images/gallery/pet-portrait/38.jpg", alt: "黑白賓士貓肖像油畫，紅棕與草綠色交錯的背景，點綴黃色與紅色圓點", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-01", src: "assets/images/gallery/pet-portrait/39.jpg", alt: "橘白色貓咪肖像油畫，前爪交疊，淺粉色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2026-05-17", src: "assets/images/gallery/pet-portrait/40.jpg", alt: "灰色貓咪肖像油畫，畫面寫著貓咪名字「KUMU」，藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2025-02-22", src: "assets/images/gallery/pet-portrait/41.jpg", alt: "咖啡色虎斑貓肖像油畫，粉色背景，簽名「Meng Chin 2025」", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2025-02-22", src: "assets/images/gallery/pet-portrait/42.jpg", alt: "咖啡色虎斑貓肖像油畫特寫，大眼睛直視前方，淺藍色背景", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2025-02-28", src: "assets/images/gallery/pet-portrait/43.jpg", alt: "橘白色貓咪肖像油畫特寫，米白色背景，簽名「lin.」", sessions: 1 },
  { course: "寵物油畫", themes: ["貓咪"], date: "2025-02-28", src: "assets/images/gallery/pet-portrait/44.jpg", alt: "黑白賓士貓肖像油畫，藍色背景", sessions: 1 },
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
window.GALLERY_COURSE_LINKS = {
  "石英砂肌理畫": "courses/sand-texture.html",
  "刮刀油畫": "courses/palette-knife-oil.html",
  "流動畫": "courses/fluid-art.html",
  "自己帶圖創作": "courses/custom-photo-oil.html",
  "寵物油畫": "courses/pet-portrait.html",
  "串珠": "courses/beading.html",
  "大幅畫布訂製": "courses/large-canvas.html",
  "特殊材質客製": "courses/custom-material.html",
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
  "動漫／角色",
  "星空／月亮",
  "狗狗",
  "貓咪",
  "兩隻以上",
];
