/* main.js —— 左邊緣直式分頁的切換邏輯。
   點分頁 → 右側內容區直接換成該分類的項目清單（不是浮動彈出面板）。
   子項目目前只是標題文字，還沒有對應的子頁面（子頁面是後續階段的範圍）。 */

const CATEGORIES = {
  courses: {
    title: "課程",
    items: [
      "石英砂肌理畫",
      "刮刀油畫",
      "流動畫",
      "抽象畫",
      "自己帶圖創作",
      "鏡子拼貼",
      "串珠",
    ],
  },
  group: {
    title: "團體課",
    items: ["團體包班課程"],
  },
  materials: {
    title: "材料包",
    items: ["流動畫", "砂畫"],
  },
};

const STAGGER_MS = 100; // 項目間固定時間差

// 首頁空白狀態的畫布互動：訪客可以隨手畫幾筆軟邊顏料痕跡，退居背景，
// 不是這頁的主要動作。選了任一分類時用 disable() 拿掉畫筆事件（不能再畫）；
// 點 Logo 回首頁時用 enable() 恢復可以畫。畫布本身永遠不隱藏、不清空——
// 訪客先前畫的痕跡在切換分類、瀏覽清單時都還在，只是清單文字會依底下顏色深淺自動換色（見 updateTextContrast）。
function setupPaintCanvas(panel) {
  const canvas = document.getElementById("paint-canvas");
  if (!canvas) return { enable() {}, disable() {}, unlockAudio() {} };

  const ctx = canvas.getContext("2d");

  // 三色不等機率，做出抽象畫的感覺：橄欖綠大面積呼應品牌色（濕顏料筆刷效果）、
  // 牛仔灰藍次之（噴漆效果）、南瓜橘（--color-warning，見 colors.css 的例外註記）
  // 最稀有只當點綴（炭筆／鉛筆效果）——三色各自對應不同的繪製手法，見下方各自的函式。
  const PAINT_PALETTE = [
    { varName: "--color-brand", weight: 0.5 },
    { varName: "--color-button-primary", weight: 0.35 },
    { varName: "--color-warning", weight: 0.15 },
  ];

  function getColor(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  function pickWeightedColor() {
    const total = PAINT_PALETTE.reduce((sum, entry) => sum + entry.weight, 0);
    let r = Math.random() * total;
    for (const entry of PAINT_PALETTE) {
      if (r < entry.weight) return getColor(entry.varName);
      r -= entry.weight;
    }
    return getColor(PAINT_PALETTE[0].varName);
  }

  // 畫布內容持久化：重新整理網頁、旋轉手機（會觸發 resize）都不應該把畫布洗掉，
  // 「畫過的東西永久保留、只有買新畫布才會清空」是這個互動的核心敘事，重整不該是
  // 規避這個限制的後門。用 canvas.toDataURL() 存進 localStorage，resize/載入時讀回來畫上去。
  const CANVAS_DATA_KEY = "risuan_canvasData";
  let hasDrawnContent = false;

  function saveCanvasData() {
    try {
      localStorage.setItem(CANVAS_DATA_KEY, canvas.toDataURL());
    } catch (e) {
      // 畫面太複雜、資料超過 localStorage 容量，或瀏覽器隱私模式擋寫入時安靜失敗，
      // 不影響畫布本身當下還能繼續畫，只是這次的內容可能沒辦法在下次重整時還原。
    }
  }

  function restoreCanvasData() {
    const dataUrl = localStorage.getItem(CANVAS_DATA_KEY);
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, panel.clientWidth, panel.clientHeight);
    };
    img.src = dataUrl;
    hasDrawnContent = true;
  }

  // canvas.width／height 只在初始化跟真正的視窗縮放時設定：
  // 每次指定這兩個屬性都會清空畫布內容，所以不能放進 enable()，
  // 否則「點 Logo 回首頁但不清空畫布」這個需求就會被 resize 意外破壞。
  // resize 本身一定會清空像素（改變 canvas.width/height 的副作用，沒辦法避免），
  // 所以緊接著呼叫 restoreCanvasData() 把上次存的內容畫回去，旋轉手機/縮放視窗
  // 才不會把畫布重置成空白。
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = panel.clientWidth * dpr;
    canvas.height = panel.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    restoreCanvasData();
  }
  resize();
  window.addEventListener("resize", resize);

  // 畫畫音效：用 Web Audio API 即時合成，不用外部音檔、不用函式庫。
  // 原理是一段白噪音 buffer 循環播放，通過濾波器整形出不同筆刷的音色，
  // 音量/音高會依畫的速度即時調整。AudioContext 一定要在使用者手勢（pointerdown）
  // 裡才建立/恢復，否則會被瀏覽器的自動播放政策擋下來。
  let audioCtx = null;
  let noiseBuffer = null;
  let activeSound = null;

  function ensureAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  // 純白噪音每個頻率能量一樣多，聽起來本來就偏尖、偏向氣流／風切的嘶聲。
  // 這裡改用粉紅噪音（能量隨頻率升高而衰減，高頻被壓低），三種筆刷套上各自的濾波器後
  // 質感會偏悶、偏顆粒感，不會有原本那種「風切聲」的味道。
  // 用標準的 Paul Kellet 經濟版粉紅噪音濾波演算法，成本跟白噪音一樣是一次性生成。
  function getNoiseBuffer(ctxAudio) {
    if (noiseBuffer) return noiseBuffer;
    const bufferSize = ctxAudio.sampleRate * 2; // 2 秒粉紅噪音，循環播放
    const buffer = ctxAudio.createBuffer(1, bufferSize, ctxAudio.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11; // 粉紅噪音疊加後振幅會超過 [-1,1]，縮放回安全範圍
    }
    noiseBuffer = buffer;
    return noiseBuffer;
  }

  // kind: "brush"（濕顏料）／"spray"（噴漆）／"charcoal"（炭筆），三種各自用不同濾波設定
  // 做出不同音色：筆刷是低通的悶聲刷過、噴漆是高通的嘶聲、炭筆是帶通的沙沙刮擦聲。
  // resume() 是非同步的：呼叫下去之後 AudioContext 不會馬上變成 running，
  // 如果緊接著就 createBufferSource().start()，第一次很容易在真正解鎖完成前就
  // 把播放指令發出去，安靜地錯過（這極可能就是「一進頁面第一筆沒聲音」的成因）。
  // 這裡改成：state 還不是 running 的話，先等 resume() 這個 promise 真的完成，
  // 才建立音訊節點、真正開始播放；已經是 running 的話（絕大多數情況）就跟原本一樣同步執行。
  // soundRequestId 是保險：如果 resume() 還沒 resolve、使用者就已經放開手指/換了下一筆，
  // 避免等到 resume 完成才把「舊的那一筆」的聲音憑空生出來。
  let soundRequestId = 0;

  function startStrokeSound(kind) {
    const ctxAudio = ensureAudioContext();
    if (!ctxAudio) return;

    stopStrokeSound(true);
    soundRequestId += 1;
    const requestId = soundRequestId;

    function buildAndStart() {
      if (requestId !== soundRequestId) return;

      const source = ctxAudio.createBufferSource();
      source.buffer = getNoiseBuffer(ctxAudio);
      source.loop = true;

      const filter = ctxAudio.createBiquadFilter();
      const gain = ctxAudio.createGain();
      gain.gain.value = 0;

      if (kind === "spray") {
        filter.type = "highpass";
        filter.frequency.value = 3000;
        // BiquadFilter 的 Q 預設值是 1，會在截止頻率附近堆出一個小共振峰，
        // 聽起來就像吹口哨／風切那種尖銳感。壓到 Butterworth 的 0.7071（最平坦、無共振峰）。
        filter.Q.value = 0.7071;
      } else if (kind === "charcoal") {
        // 降頻＋窄一點的 Q，往「筆在紙上書寫」的中低頻沙沙感靠，
        // 原本 2000Hz 偏高聽起來比較像嘶聲而不是寫字的觸感。
        filter.type = "bandpass";
        filter.frequency.value = 750;
        filter.Q.value = 1.1;
      } else {
        filter.type = "lowpass";
        filter.frequency.value = 700; // 比原本 800 略低，聲音偏厚偏悶，更接近「濕」的觸感
        filter.Q.value = 0.7071; // 避免低通截止點附近共振出風切感
      }

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctxAudio.destination);
      source.start();

      // 沾了顏料的筆刷拖曳時，顏料會有「黏住一下、扯開一下」的觸感，不是均勻平滑的摩擦聲。
      // 疊一個低頻（人耳聽不出音高、只感覺到音量在抖動）的震盪器對主音量做輕微調變（tremolo），
      // 模擬那種濕黏顏料斷斷續續分離的顆粒感。只套用在筆刷，噴漆/炭筆維持原本乾淨的音色。
      let lfo = null;
      let lfoGain = null;
      if (kind === "brush") {
        lfo = ctxAudio.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 24;
        lfoGain = ctxAudio.createGain();
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();
      }

      activeSound = { source, filter, gain, kind, lfo, lfoGain };
    }

    if (ctxAudio.state !== "running") {
      ctxAudio.resume().then(buildAndStart).catch(() => {});
    } else {
      buildAndStart();
    }
  }

  // 筆刷／炭筆的聲音只在「真的有在移動」時響，停下來（就算沒放開手）100ms 內沒有
  // 新的 pointermove 進來，就靜音。噴漆不吃這一套——噴漆的聲音改由 sprayTick 自己
  // 每個影格持續給音量，跟畫面上「長按不動也持續噴」的視覺行為一致。
  let strokeSilenceTimer = null;

  function updateStrokeSound(speed) {
    if (!activeSound || !audioCtx || activeSound.kind === "spray") return;
    const targetGain = Math.min(0.15, 0.03 + speed * 0.05); // 速度越快聲音越大，設上限避免太吵
    activeSound.gain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.05);

    if (activeSound.kind === "brush") {
      const freq = 400 + Math.min(speed, 4) * 300;
      activeSound.filter.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.05);
      if (activeSound.lfoGain) {
        // 畫得越快、越用力拖顏料，黏住又扯開的抖動感也應該越明顯
        const depth = 0.015 + Math.min(speed, 4) * 0.01;
        activeSound.lfoGain.gain.setTargetAtTime(depth, audioCtx.currentTime, 0.08);
      }
    }

    if (strokeSilenceTimer) clearTimeout(strokeSilenceTimer);
    strokeSilenceTimer = setTimeout(() => {
      if (activeSound && activeSound.kind !== "spray" && audioCtx) {
        activeSound.gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      }
    }, 100);
  }

  // immediate=true 用於「換一種筆刷時先停掉舊的」，不用淡出直接停；
  // 一般放開手時（false）淡出一小段，避免突然截斷的喀噠聲。
  function stopStrokeSound(immediate) {
    if (strokeSilenceTimer) {
      clearTimeout(strokeSilenceTimer);
      strokeSilenceTimer = null;
    }
    // 保險：如果上一筆的 startStrokeSound 還卡在等 resume() 完成、還沒真的建立音訊節點
    // （activeSound 還是 null），這裡也要讓那個還沒完成的 buildAndStart 失效，
    // 不然使用者已經放開手指了，音效卻在幾十毫秒後才憑空冒出來、而且永遠停不掉。
    soundRequestId += 1;
    if (!activeSound || !audioCtx) return;
    const { source, gain, lfo } = activeSound;
    if (immediate) {
      try { source.stop(); } catch (e) { /* 已經停過就忽略 */ }
      if (lfo) { try { lfo.stop(); } catch (e) { /* 已經停過就忽略 */ } }
      activeSound = null;
      return;
    }
    gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    setTimeout(() => {
      try { source.stop(); } catch (e) { /* 已經停過就忽略 */ }
      if (lfo) { try { lfo.stop(); } catch (e) { /* 已經停過就忽略 */ } }
    }, 150);
    activeSound = null;
  }

  let drawing = false;
  let lastPoint = null;
  let currentColor = getColor(PAINT_PALETTE[0].varName);
  const blueColor = getColor("--color-button-primary"); // 牛仔灰藍走噴漆效果
  const orangeColor = getColor("--color-warning"); // 南瓜橘走炭筆／鉛筆效果
  let lastMoveTime = performance.now(); // 真實感優化：算移動速度用的時間戳記

  function getPos(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  // 顏料存量：每一筆重新按下是滿的（1），隨拖曳距離逐漸耗盡，模擬筆刷越刷越乾。
  // 存量不會歸零，留一點「乾筆殘跡」的最低值，比較接近真實水彩/壓克力顏料刷到底的樣子。
  const PAINT_LOAD_FLOOR = 0.15;
  const PAINT_DEPLETION_PER_DAB = 0.012;
  let paintLoad = 1;

  // 疊色上限（橄欖綠筆刷專用）：兩層限制疊加——
  // 1. 深度上限：multiply 疊色模式本身沒有「疊到某個程度就不再變深」的機制，同一個地方
  //    反覆塗抹理論上會一直逼近全黑，用 inkGrid 記錄「這裡已經疊多深了」，越接近 INK_CAP
  //    新加的疊色效果就越弱，最深只會疊到 INK_CAP。
  // 2. 次數上限：另外用 inkStrokeCountGrid 記錄「這格被幾次不同筆畫畫過」，達到 INK_STROKE_CAP
  //    次以後，不管深度還沒到 INK_CAP，這個格子也完全不再變深。同一筆畫裡多次經過同一格
  //    只算 1 次（用 currentStrokeInkCells 記錄「這一筆畫已經算過的格子」，避免在原地磨蹭
  //    就被誤判成畫了很多次）。
  // 兩個都只用簡單的 Map 查表（不讀取畫布像素），效能成本可忽略。
  const INK_CELL_SIZE = 12;
  const INK_CAP = 0.4;
  const INK_STROKE_CAP = 1;
  const inkGrid = new Map();
  const inkStrokeCountGrid = new Map();
  let currentStrokeInkCells = null;

  function inkKey(x, y) {
    return `${Math.floor(x / INK_CELL_SIZE)}_${Math.floor(y / INK_CELL_SIZE)}`;
  }

  function getInkLevel(x, y) {
    return inkGrid.get(inkKey(x, y)) || 0;
  }

  function inkAllowed(x, y) {
    return (inkStrokeCountGrid.get(inkKey(x, y)) || 0) < INK_STROKE_CAP;
  }

  function addInk(x, y, amount) {
    const key = inkKey(x, y);
    const current = inkGrid.get(key) || 0;
    inkGrid.set(key, Math.min(INK_CAP, current + amount));

    if (!currentStrokeInkCells || currentStrokeInkCells.has(key)) return; // 這一筆畫已經算過這格，不重複計次
    currentStrokeInkCells.add(key);
    inkStrokeCountGrid.set(key, (inkStrokeCountGrid.get(key) || 0) + 1);
  }

  // 炭筆專用的疊色上限：跟橄欖綠共用同一個 12px 網格會出問題——炭筆取樣間距密（每 2px），
  // 12px 一格會連續蓋到 5~6 次，很快衝上限被壓到幾乎透明，等移到下一格才恢復，
  // 造成規律的「濃→消失」循環（虛線感）。改用跟取樣密度匹配的 4px 小網格，
  // 同一格內最多疊 2 次左右就會移到下一格，加深曲線比較平滑，不會有明顯的斷點。
  const CHARCOAL_INK_CELL_SIZE = 4;
  const CHARCOAL_INK_CAP = 0.75;
  const charcoalInkGrid = new Map();

  function charcoalInkKey(x, y) {
    return `${Math.floor(x / CHARCOAL_INK_CELL_SIZE)}_${Math.floor(y / CHARCOAL_INK_CELL_SIZE)}`;
  }

  function getCharcoalInkLevel(x, y) {
    return charcoalInkGrid.get(charcoalInkKey(x, y)) || 0;
  }

  function addCharcoalInk(x, y, amount) {
    const key = charcoalInkKey(x, y);
    const current = charcoalInkGrid.get(key) || 0;
    charcoalInkGrid.set(key, Math.min(CHARCOAL_INK_CAP, current + amount));
  }

  // 厚塗油畫刀觸感：橄欖綠專用。不是平滑漸層淡出的色塊，是邊緣不規則（像刮刀刮過的
  // 粗糙斷面）＋沿方向的稜線刮痕紋理，質感粗獷、方向感強，取代原本的軟邊漸層筆刷。
  // 在目前旋轉後的區域座標系（-halfLen~halfLen, -halfH~halfH）畫一個長邊鋸齒不規則的矩形路徑。
  function raggedQuadPath(halfLen, halfH) {
    const segments = 6;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const px = -halfLen + (halfLen * 2 * i) / segments;
      const py = -halfH + (Math.random() - 0.5) * halfH * 0.35;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (let i = segments; i >= 0; i--) {
      const px = -halfLen + (halfLen * 2 * i) / segments;
      const py = halfH + (Math.random() - 0.5) * halfH * 0.35;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  // 沿長邊方向畫幾條細稜線（深淺不一的短線），模擬刮刀留下的方向性刮痕。
  function drawKnifeStreaks(halfLen, halfH, baseAlpha) {
    const streakCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < streakCount; i++) {
      const sy = (Math.random() - 0.5) * halfH * 1.4;
      const sx1 = -halfLen + Math.random() * halfLen * 0.3;
      const sx2 = halfLen - Math.random() * halfLen * 0.3;
      ctx.globalAlpha = baseAlpha * (0.25 + Math.random() * 0.35);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 0.8 + Math.random() * 1.4;
      ctx.beginPath();
      ctx.moveTo(sx1, sy);
      ctx.lineTo(sx2, sy + (Math.random() - 0.5) * halfH * 0.3);
      ctx.stroke();
    }
  }

  // 單點點按（沒有拖曳方向）用的簡單印記，跟刮刀沾了顏料、還沒刮開的第一觸感一致。
  function stampDab(x, y, sizeMul = 1, opacityMul = 1, angle = 0) {
    const load = paintLoad;
    const baseAlpha = 0.04 + 0.16 * load;
    const h = Math.max(1, (panel.clientWidth / 3) * load * sizeMul * (0.85 + Math.random() * 0.3));
    const alpha = Math.max(0, baseAlpha * opacityMul * (0.85 + Math.random() * 0.15));

    const ink = getInkLevel(x, y);
    const depthAlpha = alpha * Math.max(0, 1 - ink / INK_CAP);
    const cappedAlpha = inkAllowed(x, y) ? depthAlpha : 0;

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.globalAlpha = cappedAlpha;
    ctx.fillStyle = currentColor;
    raggedQuadPath(h / 2, h / 2);
    ctx.fill();
    drawKnifeStreaks(h / 2, h / 2, cappedAlpha);

    ctx.restore();
    addInk(x, y, cappedAlpha);
  }

  // 真實感優化＋厚塗刮刀連貫感：不再沿路徑切成一段一段的矩形疊貼（那樣不管怎麼調角度，
  // 拼接處都會有接縫／交叉感）。改成每次滑鼠移動事件，直接把「這一段路徑」畫成
  // 單一個連續的不規則色塊（旋轉貼合方向），邊緣粗糙、疊加方向性刮痕，取代平滑漸層。
  // 速度感知：移動快→筆觸變細變淡，移動慢→筆觸變粗變濃。speed 由 onPointerMove 算好傳入，
  // 1.2 是經驗值（跟畫布尺寸/取樣間隔搭配抓出來的手感，可依實際測試微調）。
  function stampLine(from, to, speed = 0) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const speedFactor = Math.min(speed / 1.2, 1);
    const sizeMul = 1 - speedFactor * 0.35;
    const opacityMul = 1 - speedFactor * 0.5;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    const load = paintLoad;
    const baseAlpha = 0.04 + 0.16 * load;
    // 短邊（筆刷厚度／視覺寬度）＝畫布寬度的 1/3，等比例縮放，不是寫死的 px。
    const h = Math.max(1, (panel.clientWidth / 3) * load * sizeMul * (0.9 + Math.random() * 0.2));
    // 長邊稍微比實際移動距離長一點（多 40% 的 h），確保跟上一段有重疊，首尾不會露出接縫。
    const len = dist + h * 0.4;
    const alpha = Math.max(0, baseAlpha * opacityMul * (0.85 + Math.random() * 0.15));

    const ink = getInkLevel(midX, midY);
    const depthAlpha = alpha * Math.max(0, 1 - ink / INK_CAP);
    const cappedAlpha = inkAllowed(midX, midY) ? depthAlpha : 0;

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.translate(midX, midY);
    ctx.rotate(angle);

    ctx.globalAlpha = cappedAlpha;
    ctx.fillStyle = currentColor;
    raggedQuadPath(len / 2, h / 2);
    ctx.fill();
    drawKnifeStreaks(len / 2, h / 2, cappedAlpha);

    ctx.restore();

    addInk(midX, midY, cappedAlpha);
    paintLoad = Math.max(PAINT_LOAD_FLOOR, paintLoad - PAINT_DEPLETION_PER_DAB * Math.max(1, dist / 4));
  }

  // 炭筆／鉛筆效果：南瓜橘專用，目標是 3B 鉛筆那種粗獷、連貫、偏深的筆觸感——
  // 角度只做很小的偏移（沿路徑方向為主，不是大角度亂噴），線段之間頭尾稍微延伸重疊，
  // 也不做頭尾淡出（拿掉線性漸層，改回實色），這樣才不會斷斷續續；
  // 顆粒感改用線寬/位置的小抖動來表現，而不是靠線段本身的破碎與稀疏。
  const CHARCOAL_STROKES_PER_DAB = 2;

  function stampCharcoalMark(x, y, baseAngle, sizeMul = 1, opacityMul = 1) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.lineCap = "round";

    for (let i = 0; i < CHARCOAL_STROKES_PER_DAB; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * 0.15; // 只做小幅偏移，維持沿路徑方向的連貫感
      const len = (6 + Math.random() * 4) * sizeMul; // 加長，讓相鄰段落頭尾重疊，覆蓋間隙
      const dx = Math.cos(angle) * len;
      const dy = Math.sin(angle) * len;
      const x1 = x - dx / 2;
      const y1 = y - dy / 2;
      const x2 = x + dx / 2;
      const y2 = y + dy / 2;

      const rawAlpha = Math.max(0, (0.28 + Math.random() * 0.16) * opacityMul); // 3B 鉛筆較深較實
      const ink = getCharcoalInkLevel(x, y);
      const cappedAlpha = rawAlpha * Math.max(0, 1 - ink / CHARCOAL_INK_CAP);

      ctx.strokeStyle = currentColor; // 不用漸層淡出，維持實線，避免斷續感
      ctx.lineWidth = Math.max(1, (2 + Math.random() * 1.4) * sizeMul); // 加粗，接近 3B 鉛筆的粗獷線條
      ctx.globalAlpha = cappedAlpha;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      addCharcoalInk(x, y, cappedAlpha);
    }

    ctx.restore();
  }

  // 速度感知，跟一般筆刷同一套邏輯：移動快→線段變細變淡，移動慢→變粗變濃。
  function stampCharcoalLine(from, to, speed = 0) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.floor(dist / 2)); // 加密取樣間距，減少段落之間的空隙
    const speedFactor = Math.min(speed / 1.2, 1);
    const sizeMul = 1 - speedFactor * 0.35;
    const opacityMul = 1 - speedFactor * 0.5;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      stampCharcoalMark(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, angle, sizeMul, opacityMul);
    }
  }

  // 噴漆效果：只有挑到牛仔灰藍時觸發。用 requestAnimationFrame 每個影格噴一次，
  // 所以「長按不動」也會持續噴、越噴越濃；「拖曳滑過」則會跟著游標位置形成大範圍噴漆痕跡。
  const SPRAY_RADIUS = 50;
  const SPRAY_DABS_PER_TICK = 5;
  let isSpraying = false;
  let sprayRAF = null;

  function spraySplat(x, y) {
    ctx.fillStyle = currentColor;
    for (let i = 0; i < SPRAY_DABS_PER_TICK; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = SPRAY_RADIUS * Math.random() * Math.random(); // 平方偏向小值，中心較濃、邊緣較疏
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      const size = 1 + Math.random() * 2;
      ctx.globalAlpha = 0.12 + Math.random() * 0.18;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 顏料流下效果：長按噴漆時，如果游標幾乎沒動（原地噴太久、顏料堆積），
  // 就會開始從那個位置滴一條往下流的痕跡，模擬噴漆噴太多、顏料受重力往下流。
  // 滴落的痕跡是每個影格在新位置補一個小點，前面補過的點本來就會留在畫布上，
  // 不需要另外清除重畫，跟畫布本身「筆觸永久保留」的邏輯是一致的。
  const DRIP_HOLD_THRESHOLD = 24; // 大約靜止不動 24 個影格（約 0.4 秒）就開始滴
  const DRIP_HOLD_COOLDOWN = 12; // 滴一次之後，要再累積這麼多影格才會滴下一次
  let holdTicks = 0;
  let lastTickPos = null;
  const drips = [];

  function spawnDrip(x, y) {
    // 約 35% 機率是「長距離滴流」，壽命夠長可以真的流到畫面最下面、超出畫面消失；
    // 其餘是短滴，滴一小段就用完顏料停在半路。
    const isLong = Math.random() < 0.35;
    const initialRemaining = isLong ? 220 + Math.random() * 100 : 30 + Math.random() * 30;
    drips.push({
      x: x + (Math.random() - 0.5) * 10,
      y,
      vy: 0.5 + Math.random() * 0.4,
      remaining: initialRemaining,
      initialRemaining,
      size: 1.5 + Math.random() * 1.5,
      color: currentColor,
      baseAlpha: 0.35 + Math.random() * 0.25,
    });
  }

  // 持續運作的滴落動畫迴圈：跟噴漆的 rAF 迴圈分開，這樣放開手之後滴落的痕跡還能繼續往下流完。
  function tickDrips() {
    for (let i = drips.length - 1; i >= 0; i--) {
      const drip = drips[i];
      drip.y += drip.vy;
      drip.vy += 0.02; // 一點點重力加速度
      drip.x += (Math.random() - 0.5) * 0.5;
      drip.remaining -= 1;

      // 整條滴流大部分時間維持穩定濃度（真的看起來像一條流下來的痕跡），
      // 只有壽命剩最後 20% 時才逐漸變淡，模擬滴到尾端顏料變稀、變透明。
      const lifeFrac = drip.remaining / drip.initialRemaining;
      const alpha = lifeFrac < 0.2 ? drip.baseAlpha * (lifeFrac / 0.2) : drip.baseAlpha;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = drip.color;
      ctx.beginPath();
      ctx.arc(drip.x, drip.y, drip.size, 0, Math.PI * 2);
      ctx.fill();

      if (drip.remaining <= 0 || drip.y > panel.clientHeight) {
        drips.splice(i, 1);
      }
    }

    maybeUpdateTextContrast();
    requestAnimationFrame(tickDrips);
  }
  requestAnimationFrame(tickDrips);

  // 文字自動變色：讀取目錄字／提示字底下那塊畫布區域目前的平均亮度，
  // 深到一定程度就把文字切成淺色（背後的光暈也要跟著切成深色，不然淺字配淺光暈等於隱形）。
  // 畫布沒畫過的地方是透明的，用 alpha 加權混合「假設底下是米色背景」的亮度去估計，
  // 不然透明區塊會被誤判成純黑。只在筆畫結束後、以及滴落動畫迴圈每隔一段時間才取樣一次，
  // 不是每個影格都算，避免拖慢畫布。
  const CONTRAST_THRESHOLD = 140; // 0(全黑)~255(全白)，低於這個值視為「背景太深」
  const SURFACE_LIGHT_LUMINANCE = 230; // 對應 --color-surface-light 米色底的大致亮度

  function regionBrightness(cssX, cssY, cssW, cssH) {
    const dpr = window.devicePixelRatio || 1;
    const sx = Math.max(0, Math.round(cssX * dpr));
    const sy = Math.max(0, Math.round(cssY * dpr));
    const sw = Math.max(1, Math.round(cssW * dpr));
    const sh = Math.max(1, Math.round(cssH * dpr));
    let data;
    try {
      data = ctx.getImageData(sx, sy, sw, sh).data;
    } catch (e) {
      return 255; // 讀取失敗（例如尺寸為 0）就當作是亮的，不要誤判成暗背景
    }
    let total = 0;
    let count = 0;
    const step = 4 * 23; // 跳著取樣降低運算量，不用每個像素都算
    for (let i = 0; i < data.length; i += step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3] / 255;
      const paintLuminance = 0.299 * r + 0.587 * g + 0.114 * b;
      total += a * paintLuminance + (1 - a) * SURFACE_LIGHT_LUMINANCE;
      count++;
    }
    return count ? total / count : 255;
  }

  function updateTextContrast() {
    const canvasRect = canvas.getBoundingClientRect();

    document.querySelectorAll(".side-tabs button[data-cat]").forEach((tab) => {
      const r = tab.getBoundingClientRect();
      const brightness = regionBrightness(r.left - canvasRect.left, r.top - canvasRect.top, r.width, r.height);
      tab.classList.toggle("on-dark", brightness < CONTRAST_THRESHOLD);
    });

    const emptyEl = document.getElementById("content-empty");
    if (emptyEl && !emptyEl.hidden) {
      const r = emptyEl.getBoundingClientRect();
      const brightness = regionBrightness(r.left - canvasRect.left, r.top - canvasRect.top, r.width, r.height);
      emptyEl.classList.toggle("on-dark", brightness < CONTRAST_THRESHOLD);
    }
  }

  // 借用一直在跑的 tickDrips 迴圈當節拍器，每隔約 20 個影格（不管有沒有滴流物件都會跑）
  // 檢查一次對比度，這樣長按噴漆、滴流慢慢往下流的過程中也會持續更新，不是只有筆畫結束才檢查一次。
  let contrastCheckCounter = 0;
  function maybeUpdateTextContrast() {
    contrastCheckCounter += 1;
    if (contrastCheckCounter >= 20) {
      contrastCheckCounter = 0;
      updateTextContrast();
    }
  }

  function sprayTick() {
    if (!drawing || !isSpraying) return;
    spraySplat(lastPoint.x, lastPoint.y);

    // 噴漆的聲音維持穩定音量，跟移動與否無關——這個迴圈本身只要 isSpraying 就會
    // 持續每個影格觸發，長按不動也一樣在跑，跟畫面上「長按不動也持續噴」是同一套邏輯。
    if (activeSound && activeSound.kind === "spray" && audioCtx) {
      activeSound.gain.gain.setTargetAtTime(0.09, audioCtx.currentTime, 0.08);
    }

    if (lastTickPos) {
      const moved = Math.hypot(lastPoint.x - lastTickPos.x, lastPoint.y - lastTickPos.y);
      holdTicks = moved < 2 ? holdTicks + 1 : Math.max(0, holdTicks - 3);
    }
    lastTickPos = { x: lastPoint.x, y: lastPoint.y };

    if (holdTicks > DRIP_HOLD_THRESHOLD) {
      spawnDrip(lastPoint.x, lastPoint.y);
      holdTicks = DRIP_HOLD_THRESHOLD - DRIP_HOLD_COOLDOWN;
    }

    sprayRAF = requestAnimationFrame(sprayTick);
  }

  let isCharcoal = false;

  // logo 呼吸提示：訪客畫下第一筆之後觸發一次，同一個瀏覽階段內不重複（買新畫布、
  // clear() 之後才會重置成可以再觸發一次，見下方 clear()）。
  let logoHintShown = false;
  function triggerLogoHint() {
    if (logoHintShown) return;
    logoHintShown = true;
    const logo = document.querySelector(".logo");
    if (!logo) return;
    logo.classList.add("logo--hint");
  }

  function onPointerDown(event) {
    // 訪客一開始畫第一筆，代表已經「發現可以畫畫」這件事了，
    // 中間的引導提示（線條圖案＋文字）就可以收起來，不擋畫作。
    const emptyHint = document.getElementById("content-empty");
    if (emptyHint && !emptyHint.hidden) emptyHint.hidden = true;

    triggerLogoHint();

    // 「New chance?」的觸發條件是「畫布現在有沒有內容」，不是有沒有逛過分類，
    // 這裡一畫下去就標記為有內容；實際存進 localStorage（供重整後還原、也是
    // hasContent() 判斷的依據）在 onPointerUp 這一筆畫結束時做。
    hasDrawnContent = true;

    drawing = true;
    currentColor = pickWeightedColor();
    currentStrokeInkCells = new Set(); // 新的一筆畫開始，重置「這一筆畫已經算過的格子」記錄
    lastPoint = getPos(event);
    lastMoveTime = performance.now(); // 重新按下＝重置速度計算的時間基準，避免跨筆畫算出異常速度值
    isSpraying = currentColor === blueColor;
    isCharcoal = currentColor === orangeColor;

    if (isSpraying) {
      holdTicks = 0;
      lastTickPos = null;
      sprayTick();
      startStrokeSound("spray");
    } else if (isCharcoal) {
      stampCharcoalMark(lastPoint.x, lastPoint.y, Math.random() * Math.PI * 2);
      startStrokeSound("charcoal");
    } else {
      paintLoad = 1; // 重新按下＝重新沾一次顏料，存量回滿
      stampDab(lastPoint.x, lastPoint.y, 1, 1, Math.random() * Math.PI * 2); // 單點點按沒有方向可算，隨機角度
      startStrokeSound("brush");
    }
  }
  function onPointerMove(event) {
    if (!drawing) return;
    const point = getPos(event);

    // 真實感優化：算移動速度（距離/時間），傳給筆刷跟炭筆做粗細濃淡的速度感知調整。
    const now = performance.now();
    const dt = Math.max(now - lastMoveTime, 1);
    const dist = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
    const speed = dist / dt;

    if (isCharcoal) {
      stampCharcoalLine(lastPoint, point, speed);
    } else if (!isSpraying) {
      stampLine(lastPoint, point, speed);
    }
    updateStrokeSound(speed);
    lastPoint = point; // 噴漆模式下由 sprayTick 的 rAF 迴圈自己讀取最新位置
    lastMoveTime = now;
  }
  function onPointerUp() {
    const wasDrawing = drawing;
    drawing = false;
    isSpraying = false;
    isCharcoal = false;
    if (sprayRAF) cancelAnimationFrame(sprayRAF);
    sprayRAF = null;
    stopStrokeSound(false);
    updateTextContrast(); // 筆畫剛畫完就立刻檢查一次，不用等 tickDrips 的節拍
    // disable() 也會呼叫這個函式做保險清理（防止切分類時剛好還在畫到一半），
    // 只有「真的剛結束一筆畫」才需要存檔，避免每次切分類都重複存一次沒變化的畫布。
    if (wasDrawing) saveCanvasData();
  }

  // iOS Safari 對「哪些事件類型算合法的使用者手勢」判定比較嚴格，AudioContext.resume()
  // 一定要在這類事件的處理函式裡「同步」呼叫才會真的解鎖；pointerdown 不一定每個
  // WebKit 版本都認可，額外明確掛在 touchstart 上作為保險，兩邊都呼叫同一個
  // ensureAudioContext()（內部已經有 audioCtx 存在就不重建的判斷，重複呼叫不會有副作用）。
  function unlockAudio() {
    ensureAudioContext();
  }

  function enable() {
    canvas.hidden = false;
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
  }

  function disable() {
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("touchstart", unlockAudio);
    window.removeEventListener("pointerup", onPointerUp);
    onPointerUp();
  }

  // 「買新畫布」確認後清空畫布：畫面像素、疊色網格、滴流、顏料存量都要一起重置，
  // 不然舊的疊色紀錄還在，新畫布上同一個位置馬上就會疊得比預期深。
  // clearRect 前先暫時把 DPR 縮放的 transform 重設成 1:1，用 canvas.width/height
  // 這兩個已經是實際像素尺寸的值去清，才能確保整個畫布（不只是可見的 CSS 尺寸那塊）都清乾淨。
  function clear() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    inkGrid.clear();
    charcoalInkGrid.clear();
    drips.length = 0;
    paintLoad = 1;
    localStorage.removeItem(CANVAS_DATA_KEY);
    hasDrawnContent = false;
    // 買了新畫布＝新的一輪開始，讓 logo 呼吸提示下次畫第一筆時可以再觸發一次。
    logoHintShown = false;
    const logo = document.querySelector(".logo");
    if (logo) logo.classList.remove("logo--hint");
  }

  // 「New chance?」該不該跳出來，就是問這個：畫布現在有沒有內容。
  function hasContent() {
    return hasDrawnContent;
  }

  // 收銀機音效：兩聲快速上揚的鈴聲疊一段短促的「叮」高頻噪音尾巴，模擬收銀機打開的
  // 「噹！」感覺。純 Web Audio 合成，不用外部音檔，跟畫布本身的音效系統做法一致。
  function playNewCanvasSound() {
    const ctxAudio = ensureAudioContext();
    if (!ctxAudio) return;
    const now = ctxAudio.currentTime;

    [0, 0.09].forEach((delay, i) => {
      const osc = ctxAudio.createOscillator();
      const gain = ctxAudio.createGain();
      osc.type = "square";
      osc.frequency.value = i === 0 ? 1400 : 1800;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.12, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.25);
      osc.connect(gain);
      gain.connect(ctxAudio.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.26);
    });
  }

  enable();
  return { enable, disable, clear, playNewCanvasSound, hasContent, unlockAudio };
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll(".side-tabs button[data-cat]"));
  const empty = document.getElementById("content-empty");
  const list = document.getElementById("content-list");
  const panel = document.getElementById("content-panel");
  const glass = document.getElementById("content-glass");
  if (!tabs.length || !empty || !list || !panel) return;

  const paintCanvas = setupPaintCanvas(panel);
  let switching = false;

  // 音效解鎖保險（待修清單任務1）：畫布本身已經在 pointerdown／touchstart 掛了解鎖，
  // 但 iOS Safari 對「哪個事件類型才算合法的使用者手勢」有時候比預期嚴格、因裝置/版本
  // 而異，這裡再加一層不限定畫布、整個網頁最外層的保險——不管使用者第一次點/觸控的
  // 是頁面上任何地方，只要是這三種事件類型（touchstart／mousedown／click）任何一種
  // 最先發生，就立刻嘗試解鎖，三個各自最多只會真的觸發一次（{ once: true }），
  // capture:true 讓它在事件往下傳遞給實際目標元素之前就先執行，盡量搶第一時間。
  ["touchstart", "mousedown", "click"].forEach((eventName) => {
    document.addEventListener(eventName, () => paintCanvas.unlockAudio(), {
      once: true,
      capture: true,
    });
  });

  // 側邊目錄跟左上角 logo 對齊中線：logo 是固定尺寸的圖片，目錄是旋轉後的文字，
  // 兩者的寬度、定位方式完全不同，沒辦法單靠猜一個 CSS 數字讓它們在各種螢幕寬度下
  // 都精準對齊。這裡量出 logo 實際渲染後的水平中心點，跟目錄自己的寬度，
  // 算出目錄的 left 該設多少才會讓兩者中心點對齊，寫回 CSS 變數。
  function alignTabsToLogo() {
    const nav = document.getElementById("side-tabs");
    const logo = document.querySelector(".logo");
    if (!nav || !logo) return;
    const logoRect = logo.getBoundingClientRect();
    const logoCenter = (logoRect.left + logoRect.right) / 2;
    const navWidth = nav.getBoundingClientRect().width;
    const targetLeft = logoCenter - navWidth / 2;
    nav.style.left = `${targetLeft}px`;
  }
  alignTabsToLogo();
  window.addEventListener("resize", alignTabsToLogo);
  window.addEventListener("load", alignTabsToLogo);

  // 中文（.tab-row--cn）跟英文（.tab-row--en）字數差很多（例如課程2字 vs COURSES 7字母，
  // 英文縮小字級後還是常常比中文長很多），量出兩排實際版面寬度的差距，把差距平均分配成
  // 比較短那排字元之間的間距（gap），把它「撐長」到跟另一排差不多長，兩排並排時視覺上
  // 等寬。用量測出來的真實寬度而不是猜一個固定值，同一個規則能套用在材料包/團體課/課程
  // 三組長度關係都不一樣的情況（有時中文比較長、有時英文比較長）。
  // 量寬度不能直接用 offsetWidth——它會四捨五入成整數 px，兩排差距每次都被捨入誤差
  // 吃掉一點，加回去的間距永遠會差那零點幾 px，對不齊。改成量測時暫時拿掉 <nav> 的
  // rotate(-90deg)，這時候 getBoundingClientRect() 給的就是精確到小數點的未旋轉版面寬度
  // （沒有 transform 時，getBoundingClientRect 是準的），量完馬上把 transform 還原，
  // 使用者不會看到這個過程（跟 getTabsOriginY 用的是同一招）。
  // 字級用 vw 響應式，resize 要重新算一次。
  function matchTabRowWidths() {
    const nav = document.getElementById("side-tabs");
    if (!nav) return;
    const prevTransform = nav.style.transform;
    nav.style.transform = "none";

    document.querySelectorAll(".side-tabs button").forEach((btn) => {
      const cnRow = btn.querySelector(".tab-row--cn");
      const enRow = btn.querySelector(".tab-row--en");
      if (!cnRow || !enRow) return;
      cnRow.style.gap = "0px"; // 重置，避免量到上一次已經調整過的寬度
      enRow.style.gap = "0px";
      const cnChars = cnRow.querySelectorAll(".tab-char").length;
      const enChars = enRow.querySelectorAll(".tab-char").length;
      const cnWidth = cnRow.getBoundingClientRect().width;
      const enWidth = enRow.getBoundingClientRect().width;
      const delta = Math.abs(cnWidth - enWidth);
      if (cnWidth < enWidth && cnChars > 1) {
        cnRow.style.gap = `${delta / (cnChars - 1)}px`;
      } else if (enWidth < cnWidth && enChars > 1) {
        enRow.style.gap = `${delta / (enChars - 1)}px`;
      }
    });

    nav.style.transform = prevTransform;
  }
  matchTabRowWidths();
  window.addEventListener("resize", matchTabRowWidths);
  window.addEventListener("load", matchTabRowWidths);

  // 清單貼齊底部（.content-panel 的 justify-content: flex-end）之後，還要決定「貼齊到哪個高度」。
  //
  // 目錄字（.side-tabs）整個 <nav> 是被 rotate(-90deg) 轉過的：轉之前是一排橫向文字，
  // 「材」是最前面（最左邊）那個字。transform-origin: left top 這個旋轉軸心本身不會被
  // 旋轉移動──旋轉軸心在旋轉前後的螢幕座標完全一樣。而「材」這個字（原始方向的最左側）
  // 剛好就落在旋轉軸心上，所以只要量出「假設拿掉 rotate、nav 原本會在哪裡」的左上角座標，
  // 就是「材的左側」在螢幕上的精確位置，完全不用猜字體的 ascent/descent 這種容易有誤差的
  // 度量（每個字體、每個平台的字型 metrics 都不一樣，猜measurement 難免有零星幾 px 誤差）。
  // 做法：暫時把 transform 拿掉量出旋轉前的位置，量完馬上還原，使用者不會看到這個過程。
  function getTabsOriginY() {
    const nav = document.getElementById("side-tabs");
    if (!nav) return null;
    const prevTransform = nav.style.transform;
    nav.style.transform = "none";
    const rect = nav.getBoundingClientRect();
    nav.style.transform = prevTransform;
    return rect.top;
  }

  // 清單這邊沒有旋轉，是正常方向的文字，「底部」用 line-height 留白的一半去換算視覺底部
  // （墨色最下緣）就足夠準確，跟目錄字那種要處理旋轉軸心的情況不一樣。
  function elementVisualBottom(el) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const fontSize = parseFloat(style.fontSize) || 0;
    let lineHeight = parseFloat(style.lineHeight);
    if (Number.isNaN(lineHeight)) lineHeight = fontSize * 1.2; // line-height: normal 沒有明確數字時的粗略估計
    const leading = Math.max(0, lineHeight - fontSize);
    return rect.bottom - leading / 2;
  }

  function alignListToTabs() {
    const targetY = getTabsOriginY();
    if (targetY == null) return;

    const items = list.querySelectorAll("li");
    const lastItem = items[items.length - 1];
    if (!lastItem) {
      panel.style.paddingBottom = `${Math.max(0, window.innerHeight - targetY)}px`;
      return;
    }

    // 清單最後一項現在的視覺底部離「行框底邊」有多少距離，等一下要把這段距離加回去，
    // 才能反推出「行框底邊要落在哪裡，清單的視覺底部才會剛好對齊到 targetY」。
    const currentVisualBottom = elementVisualBottom(lastItem);
    const currentBoxBottom = lastItem.getBoundingClientRect().bottom;
    const visualToBoxOffset = currentBoxBottom - currentVisualBottom;

    const targetBoxBottom = targetY + visualToBoxOffset;
    const gap = window.innerHeight - targetBoxBottom;
    panel.style.paddingBottom = `${Math.max(0, gap)}px`;
  }
  window.addEventListener("resize", alignListToTabs);
  window.addEventListener("load", alignListToTabs);
  alignListToTabs();

  // 進場：門檻 0.3、只觸發一次，相對於 #content-panel 判斷（不是 window，
  // 因為真正會捲動的是這個內容區，body 本身是 overflow:hidden 不會捲動）。
  function revealItems(items) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: panel, threshold: 0.3 }
    );

    items.forEach((li, index) => {
      li.querySelector(".inner").style.transitionDelay = `${index * STAGGER_MS}ms`;
    });

    // 用兩次 requestAnimationFrame，逼瀏覽器先把「進場前」的隱藏狀態畫出來一次，
    // 下一輪才開始觀察／觸發顯示，這樣才會有真的轉場過程，不會兩個狀態疊在同一畫面直接跳過去。
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        items.forEach((li) => observer.observe(li));
      });
    });
  }

  function buildItems(cat) {
    const data = CATEGORIES[cat];
    if (!data) return;

    list.innerHTML = "";
    const items = data.items.map((item) => {
      const li = document.createElement("li");
      const inner = document.createElement("span");
      inner.className = "inner";
      inner.textContent = item;
      li.appendChild(inner);
      list.appendChild(li);
      return li;
    });

    empty.hidden = true;
    list.hidden = false;
    if (glass) glass.hidden = false;
    panel.scrollTop = 0;
    revealItems(items);
    alignListToTabs(); // 清單剛建好，用實際的最後一項重新量測一次，確保對齊基準是當下真的存在的元素
  }

  // 離場：切換分頁時，舊清單先依序向左淡出，等最後一項的動畫時間跑完，才清掉並建立新分類。
  function showCategory(cat) {
    if (switching) return;

    const existing = Array.from(list.querySelectorAll("li"));

    if (existing.length === 0) {
      paintCanvas.disable();
      tabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.cat === cat)));
      buildItems(cat);
      return;
    }

    switching = true;
    tabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.cat === cat)));

    existing.forEach((li, index) => {
      const inner = li.querySelector(".inner");
      inner.style.transitionDelay = `${index * STAGGER_MS}ms`;
      li.classList.add("leaving");
    });

    const durationExit = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--duration-exit")) || 800;
    const totalExitTime = (existing.length - 1) * STAGGER_MS + durationExit;

    setTimeout(() => {
      switching = false;
      buildItems(cat);
    }, totalExitTime);
  }

  // 「畫畫其實只有一次機會」的敘事機制（依待修清單任務3規格）：
  // 觸發條件是「畫布現在有沒有內容」＋「有沒有逛過至少一個分類」，兩個都要成立：
  // 設計上要讓訪客先發現「這次畫的東西清不掉」，逼他去逛目錄，逛過之後才解鎖
  // 「原來還可以買新畫布重來」這個發現——在還沒逛過目錄之前，就算畫布有內容，
  // 點 logo 也只會安靜地回首頁，不會跳出確認框。
  //   - 畫布無內容：點 logo 直接回首頁，不跳確認框（Just paint. 或 Paint again，
  //     依有沒有 reset 過決定）
  //   - 畫布有內容 + 還沒逛過任何分類：點 logo 直接回首頁，不跳確認框，
  //     畫布內容本身照常顯示（不覆蓋文字）
  //   - 畫布有內容 + 已經逛過至少一個分類：點 logo 直接跳出「New chance?」確認框，
  //     這時候底下不顯示任何裝飾文字（畫布本身的內容就是重點）
  // 選 No：確認框收起，留在原本畫好的畫布，不顯示任何文字。
  // 選 Yes：清空畫布、記錄「曾經 reset 過」，顯示「Paint again」。
  const HAS_EVER_RESET_KEY = "risuan_hasEverReset";
  const HAS_VISITED_CATEGORY_KEY = "risuan_hasVisitedCategory";
  const emptyText = document.getElementById("content-empty-text");
  const canvasConfirm = document.getElementById("canvas-confirm");
  const confirmYes = document.getElementById("canvas-confirm-yes");
  const confirmNo = document.getElementById("canvas-confirm-no");

  // 回訪問候語（依待修清單任務5規格）：距上次造訪的時間長短，取代原本的
  // Just paint. / Paint again，只在首頁、畫布為空需要顯示狀態文字時套用。
  // 只在整個瀏覽階段「第一次」需要顯示文字時算一次（見下方 computeGreeting 呼叫處），
  // 同一階段內文字不會因為使用者按了幾次 logo 就一直变来变去。
  // 算完之後立刻把這次的造訪時間寫回去，下一次真正的造訪（重新整理或之後回來）
  // 才會拿「這次」當作「上次造訪」來比較。
  const LAST_VISIT_KEY = "risuan_lastVisit";
  const DAY_MS = 24 * 60 * 60 * 1000;

  function computeGreeting() {
    const lastVisitRaw = localStorage.getItem(LAST_VISIT_KEY);
    let greeting = null;
    if (lastVisitRaw) {
      const diff = Date.now() - parseInt(lastVisitRaw, 10);
      if (diff < DAY_MS) greeting = "Missed us?";
      else if (diff >= 21 * DAY_MS) greeting = "Long time no see.";
      else greeting = "Nice to see you again.";
    }
    localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
    return greeting;
  }
  const greeting = computeGreeting();

  // 畫布無內容時該顯示的文字（回訪問候語，或 Just paint. / Paint again 這兩個預設值），
  // 不處理有內容的情況（有內容時是否顯示確認框，由呼叫端——初始載入／logo 點擊——各自決定）。
  function updateEmptyPromptMode() {
    const hasEverReset = localStorage.getItem(HAS_EVER_RESET_KEY) === "1";
    const fallback = hasEverReset ? "Paint again" : "Just paint.";
    if (emptyText) emptyText.textContent = greeting || fallback;
    if (canvasConfirm) canvasConfirm.hidden = true;
  }

  // 初始載入：畫布內容已經在 setupPaintCanvas 裡從 localStorage 還原好了。
  // 只有「有內容 + 已經逛過分類」才代表訪客已經進入「可以買新畫布」的階段，
  // 這時候不顯示裝飾文字（畫布本身就是重點）；其餘情況（不管有沒有內容）
  // 都照常顯示 Just paint. / Paint again，維持第一次體驗的感覺。
  if (paintCanvas.hasContent() && localStorage.getItem(HAS_VISITED_CATEGORY_KEY) === "1") {
    empty.hidden = true;
  } else {
    empty.hidden = false;
    updateEmptyPromptMode();
  }

  if (confirmYes) {
    confirmYes.addEventListener("click", () => {
      paintCanvas.playNewCanvasSound();
      paintCanvas.clear();
      localStorage.setItem(HAS_EVER_RESET_KEY, "1");
      updateEmptyPromptMode();
    });
  }
  if (confirmNo) {
    confirmNo.addEventListener("click", () => {
      // 選 No：留在原本畫好的畫布，不顯示任何文字，直接把整個提示區收起來。
      empty.hidden = true;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      localStorage.setItem(HAS_VISITED_CATEGORY_KEY, "1");
      showCategory(tab.dataset.cat);
    });
  });

  // 點 Logo：回到首頁的畫布繪製區。清空清單、重新掛上畫布的畫筆事件，
  // 但不清空畫布本身——訪客之前畫的痕跡回來時還在。
  const logoReset = document.getElementById("logo-reset");
  if (logoReset) {
    logoReset.addEventListener("click", () => {
      switching = false;

      list.hidden = true;
      list.innerHTML = "";
      if (glass) glass.hidden = true;
      tabs.forEach((tab) => tab.setAttribute("aria-pressed", "false"));
      paintCanvas.enable();

      const hasVisitedCategory = localStorage.getItem(HAS_VISITED_CATEGORY_KEY) === "1";
      if (paintCanvas.hasContent() && hasVisitedCategory) {
        // 畫布有內容、也逛過至少一個分類：直接跳出「要不要買新畫布」的確認框，不顯示裝飾文字。
        empty.hidden = false;
        if (emptyText) emptyText.textContent = "";
        if (canvasConfirm) canvasConfirm.hidden = false;
      } else if (paintCanvas.hasContent()) {
        // 畫布有內容，但還沒逛過分類：安靜回首頁，不跳確認框，但還是照常顯示
        // Just paint. / Paint again（維持「看起來像還沒發現特殊機制」的第一次體驗）。
        empty.hidden = false;
        updateEmptyPromptMode();
      } else {
        empty.hidden = false;
        updateEmptyPromptMode();
      }
    });
  }
});
