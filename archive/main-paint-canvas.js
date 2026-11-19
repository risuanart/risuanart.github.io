



const CATEGORIES = {
  courses: {
    title: "課程",
    items: [
      "石英砂肌理畫",
      "刮刀油畫",
      "流動畫",
      "抽象畫",
      "自選主題油畫",
      "鏡子拼貼",
      "串珠",


      { text: "預約須知", href: "faq.html" },
    ],
  },
  group: {
    title: "團體課",
    items: ["團體包班課程"],
  },
  materials: {
    title: "材料包",


    items: [
      { text: "流動畫", href: "products/fluid-art-intro.html" },
      { text: "砂畫", href: "products/sand-art-intro.html" },
    ],
  },
};

const STAGGER_MS = 100;





function setupPaintCanvas(panel) {
  const canvas = document.getElementById("paint-canvas");
  if (!canvas) return { enable() {}, disable() {}, unlockAudio() {} };

  const ctx = canvas.getContext("2d");




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




  const CANVAS_DATA_KEY = "risuan_canvasData";
  let hasDrawnContent = false;

  function saveCanvasData() {
    try {
      localStorage.setItem(CANVAS_DATA_KEY, canvas.toDataURL());
    } catch (e) {


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







  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = panel.clientWidth * dpr;
    canvas.height = panel.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    restoreCanvasData();
  }
  resize();
  window.addEventListener("resize", resize);





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





  function getNoiseBuffer(ctxAudio) {
    if (noiseBuffer) return noiseBuffer;
    const bufferSize = ctxAudio.sampleRate * 2;
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
      data[i] = pink * 0.11;
    }
    noiseBuffer = buffer;
    return noiseBuffer;
  }










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


        filter.Q.value = 0.7071;
      } else if (kind === "charcoal") {


        filter.type = "bandpass";
        filter.frequency.value = 750;
        filter.Q.value = 1.1;
      } else {
        filter.type = "lowpass";
        filter.frequency.value = 700;
        filter.Q.value = 0.7071;
      }

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctxAudio.destination);
      source.start();




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




  let strokeSilenceTimer = null;

  function updateStrokeSound(speed) {
    if (!activeSound || !audioCtx || activeSound.kind === "spray") return;
    const targetGain = Math.min(0.15, 0.03 + speed * 0.05);
    activeSound.gain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.05);

    if (activeSound.kind === "brush") {
      const freq = 400 + Math.min(speed, 4) * 300;
      activeSound.filter.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.05);
      if (activeSound.lfoGain) {

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



  function stopStrokeSound(immediate) {
    if (strokeSilenceTimer) {
      clearTimeout(strokeSilenceTimer);
      strokeSilenceTimer = null;
    }



    soundRequestId += 1;
    if (!activeSound || !audioCtx) return;
    const { source, gain, lfo } = activeSound;
    if (immediate) {
      try { source.stop(); } catch (e) {               }
      if (lfo) { try { lfo.stop(); } catch (e) {               } }
      activeSound = null;
      return;
    }
    gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    setTimeout(() => {
      try { source.stop(); } catch (e) {               }
      if (lfo) { try { lfo.stop(); } catch (e) {               } }
    }, 150);
    activeSound = null;
  }

  let drawing = false;
  let lastPoint = null;
  let currentColor = getColor(PAINT_PALETTE[0].varName);
  const blueColor = getColor("--color-button-primary");
  const orangeColor = getColor("--color-warning");
  let lastMoveTime = performance.now();

  function getPos(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }



  const PAINT_LOAD_FLOOR = 0.15;
  const PAINT_DEPLETION_PER_DAB = 0.012;
  let paintLoad = 1;










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

    if (!currentStrokeInkCells || currentStrokeInkCells.has(key)) return;
    currentStrokeInkCells.add(key);
    inkStrokeCountGrid.set(key, (inkStrokeCountGrid.get(key) || 0) + 1);
  }





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

    const h = Math.max(1, (panel.clientWidth / 3) * load * sizeMul * (0.9 + Math.random() * 0.2));

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





  const CHARCOAL_STROKES_PER_DAB = 2;

  function stampCharcoalMark(x, y, baseAngle, sizeMul = 1, opacityMul = 1) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.lineCap = "round";

    for (let i = 0; i < CHARCOAL_STROKES_PER_DAB; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * 0.15;
      const len = (6 + Math.random() * 4) * sizeMul;
      const dx = Math.cos(angle) * len;
      const dy = Math.sin(angle) * len;
      const x1 = x - dx / 2;
      const y1 = y - dy / 2;
      const x2 = x + dx / 2;
      const y2 = y + dy / 2;

      const rawAlpha = Math.max(0, (0.28 + Math.random() * 0.16) * opacityMul);
      const ink = getCharcoalInkLevel(x, y);
      const cappedAlpha = rawAlpha * Math.max(0, 1 - ink / CHARCOAL_INK_CAP);

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = Math.max(1, (2 + Math.random() * 1.4) * sizeMul);
      ctx.globalAlpha = cappedAlpha;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      addCharcoalInk(x, y, cappedAlpha);
    }

    ctx.restore();
  }


  function stampCharcoalLine(from, to, speed = 0) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.floor(dist / 2));
    const speedFactor = Math.min(speed / 1.2, 1);
    const sizeMul = 1 - speedFactor * 0.35;
    const opacityMul = 1 - speedFactor * 0.5;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      stampCharcoalMark(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, angle, sizeMul, opacityMul);
    }
  }



  const SPRAY_RADIUS = 50;
  const SPRAY_DABS_PER_TICK = 5;
  let isSpraying = false;
  let sprayRAF = null;

  function spraySplat(x, y) {
    ctx.fillStyle = currentColor;
    for (let i = 0; i < SPRAY_DABS_PER_TICK; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = SPRAY_RADIUS * Math.random() * Math.random();
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      const size = 1 + Math.random() * 2;
      ctx.globalAlpha = 0.12 + Math.random() * 0.18;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }





  const DRIP_HOLD_THRESHOLD = 24;
  const DRIP_HOLD_COOLDOWN = 12;
  let holdTicks = 0;
  let lastTickPos = null;
  const drips = [];

  function spawnDrip(x, y) {


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


  function tickDrips() {
    for (let i = drips.length - 1; i >= 0; i--) {
      const drip = drips[i];
      drip.y += drip.vy;
      drip.vy += 0.02;
      drip.x += (Math.random() - 0.5) * 0.5;
      drip.remaining -= 1;



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






  const CONTRAST_THRESHOLD = 140;
  const SURFACE_LIGHT_LUMINANCE = 230;

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
      return 255;
    }
    let total = 0;
    let count = 0;
    const step = 4 * 23;
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



  let logoHintShown = false;
  function triggerLogoHint() {
    if (logoHintShown) return;
    logoHintShown = true;
    const logo = document.querySelector(".logo");
    if (!logo) return;
    logo.classList.add("logo--hint");
  }

  function onPointerDown(event) {


    const emptyHint = document.getElementById("content-empty");
    if (emptyHint && !emptyHint.hidden) emptyHint.hidden = true;

    triggerLogoHint();




    hasDrawnContent = true;

    drawing = true;
    currentColor = pickWeightedColor();
    currentStrokeInkCells = new Set();
    lastPoint = getPos(event);
    lastMoveTime = performance.now();
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
      paintLoad = 1;
      stampDab(lastPoint.x, lastPoint.y, 1, 1, Math.random() * Math.PI * 2);
      startStrokeSound("brush");
    }
  }
  function onPointerMove(event) {
    if (!drawing) return;
    const point = getPos(event);


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
    lastPoint = point;
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
    updateTextContrast();


    if (wasDrawing) saveCanvasData();
  }





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

    logoHintShown = false;
    const logo = document.querySelector(".logo");
    if (logo) logo.classList.remove("logo--hint");
  }


  function hasContent() {
    return hasDrawnContent;
  }



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







  ["touchstart", "mousedown", "click"].forEach((eventName) => {
    document.addEventListener(eventName, () => paintCanvas.unlockAudio(), {
      once: true,
      capture: true,
    });
  });





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












  function matchTabRowWidths() {
    const nav = document.getElementById("side-tabs");
    if (!nav) return;
    const prevTransform = nav.style.transform;
    nav.style.transform = "none";

    document.querySelectorAll(".side-tabs button").forEach((btn) => {
      const cnRow = btn.querySelector(".tab-row--cn");
      const enRow = btn.querySelector(".tab-row--en");
      if (!cnRow || !enRow) return;
      cnRow.style.gap = "0px";
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










  function getTabsOriginY() {
    const nav = document.getElementById("side-tabs");
    if (!nav) return null;
    const prevTransform = nav.style.transform;
    nav.style.transform = "none";
    const rect = nav.getBoundingClientRect();
    nav.style.transform = prevTransform;
    return rect.top;
  }



  function elementVisualBottom(el) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const fontSize = parseFloat(style.fontSize) || 0;
    let lineHeight = parseFloat(style.lineHeight);
    if (Number.isNaN(lineHeight)) lineHeight = fontSize * 1.2;
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
      panel.classList.remove("is-overflowing");
      return;
    }







    const paddingTop = parseFloat(getComputedStyle(panel).paddingTop) || 0;
    const availableHeight = panel.clientHeight - paddingTop;
    const overflowing = list.scrollHeight > availableHeight;
    panel.classList.toggle("is-overflowing", overflowing);
    if (overflowing) {
      panel.style.paddingBottom = "0px";
      return;
    }



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
      const hasLink = typeof item === "object" && item.href;
      const inner = document.createElement(hasLink ? "a" : "span");
      inner.className = "inner";
      inner.textContent = hasLink ? item.text : item;
      if (hasLink) inner.href = item.href;
      li.appendChild(inner);
      list.appendChild(li);
      return li;
    });

    empty.hidden = true;
    list.hidden = false;
    if (glass) glass.hidden = false;
    panel.scrollTop = 0;
    revealItems(items);
    alignListToTabs();
  }


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














  const HAS_EVER_RESET_KEY = "risuan_hasEverReset";
  const HAS_VISITED_CATEGORY_KEY = "risuan_hasVisitedCategory";
  const emptyText = document.getElementById("content-empty-text");
  const canvasConfirm = document.getElementById("canvas-confirm");
  const confirmYes = document.getElementById("canvas-confirm-yes");
  const confirmNo = document.getElementById("canvas-confirm-no");







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



  function updateEmptyPromptMode() {
    const hasEverReset = localStorage.getItem(HAS_EVER_RESET_KEY) === "1";
    const fallback = hasEverReset ? "Paint again" : "Just paint.";
    if (emptyText) emptyText.textContent = greeting || fallback;
    if (canvasConfirm) canvasConfirm.hidden = true;
  }





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

      empty.hidden = true;
    });
  }










  const DIRECT_LINK_CATEGORIES = { materials: "products/index.html", shop: "products/shop.html" };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const directHref = DIRECT_LINK_CATEGORIES[tab.dataset.cat];
      if (directHref) {
        window.location.href = directHref;
        return;
      }
      localStorage.setItem(HAS_VISITED_CATEGORY_KEY, "1");
      showCategory(tab.dataset.cat);
    });
  });



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

        empty.hidden = false;
        if (emptyText) emptyText.textContent = "";
        if (canvasConfirm) canvasConfirm.hidden = false;
      } else if (paintCanvas.hasContent()) {


        empty.hidden = false;
        updateEmptyPromptMode();
      } else {
        empty.hidden = false;
        updateEmptyPromptMode();
      }
    });
  }
});
