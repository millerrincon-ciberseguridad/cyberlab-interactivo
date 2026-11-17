(() => {
  "use strict";

  const CFG = Object.assign({
    gameId: "ciberbloques-guardia-digital",
    gameVersion: "2.0.0",
    title: "CiberBloques: Guardia Digital",
    logo: "assets/logo-ciberaula.svg",
    homeUrl: "../../index.html",
    scoreEvent: "ciberaula:score:v1",
    linesPerLevel: 8,
    initialDropMs: 820,
    minimumDropMs: 95,
    speedStepMs: 62,
    lineAnimationMs: 420,
    leaderboardSize: 8
  }, window.CIBERBLOQUES_CONFIG || {});

  const COLS = 10;
  const ROWS = 18;
  const CELL = 36;
  const Engine = window.CiberBlocksEngine;
  if (!Engine) throw new Error("No se pudo cargar el motor lógico del tablero.");
  const BOARD_RULES = Object.freeze({
    height: ROWS,
    width: COLS,
    validValues: new Set([0, 1, 2, 3, 4, 5, 6, 7])
  });
  const LINE_REWARDS = [0, 120, 360, 720, 1400];
  const LEADERBOARD_KEY = `${CFG.gameId}:leaderboard:v1`;
  const PLAYER_KEY = `${CFG.gameId}:player:v1`;

  const PIECES = {
    prism: { id: 1, name: "Prisma", color: "#2ae5ff", glow: "#0aa8d3", shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
    anchor: { id: 2, name: "Ancla", color: "#6578ff", glow: "#3047c9", shape: [[1,0,0],[1,1,1],[0,0,0]] },
    relay: { id: 3, name: "Relé", color: "#ff9b55", glow: "#cb5b20", shape: [[0,0,1],[1,1,1],[0,0,0]] },
    vault: { id: 4, name: "Bóveda", color: "#ffd45c", glow: "#cf9b24", shape: [[1,1],[1,1]] },
    cipher: { id: 5, name: "Cifrado", color: "#59f0b1", glow: "#1da870", shape: [[0,1,1],[1,1,0],[0,0,0]] },
    shield: { id: 6, name: "Escudo", color: "#ad72ff", glow: "#6f39bd", shape: [[0,1,0],[1,1,1],[0,0,0]] },
    bridge: { id: 7, name: "Puente", color: "#ff6382", glow: "#bd284b", shape: [[1,1,0],[0,1,1],[0,0,0]] }
  };
  const PIECE_TYPES = Object.keys(PIECES);
  const BY_ID = Object.fromEntries(Object.entries(PIECES).map(([key, value]) => [value.id, { key, ...value }]));

  const TIPS = [
    { icon: "PWD", title: "Usa frases de contraseña", text: "Combina cuatro o más palabras poco relacionadas. Son más fáciles de recordar y más resistentes que una palabra corta con cambios predecibles." },
    { icon: "MFA", title: "Activa la verificación en dos pasos", text: "Habilita MFA en correo, redes y servicios críticos. Prefiere una app autenticadora o llave física cuando estén disponibles." },
    { icon: "URL", title: "Pausa antes de abrir un enlace", text: "Si un mensaje crea urgencia, verifica al remitente por otro canal. Abre el sitio desde tus marcadores en lugar de usar el enlace recibido." },
    { icon: "UPD", title: "Actualiza sin aplazar", text: "Instala las actualizaciones del sistema, navegador y aplicaciones. Muchas corrigen fallas que ya están siendo aprovechadas." },
    { icon: "3·2·1", title: "Mantén copias 3-2-1", text: "Conserva tres copias, en dos medios diferentes y una fuera del equipo. Prueba periódicamente que puedas restaurarlas." },
    { icon: "WIFI", title: "Cuida las redes públicas", text: "Evita operaciones sensibles en Wi‑Fi abierto. Confirma el nombre exacto de la red y desactiva la conexión automática." },
    { icon: "APP", title: "Instala solo lo necesario", text: "Descarga aplicaciones y extensiones desde fuentes oficiales. Revisa permisos y elimina lo que ya no utilizas." },
    { icon: "ACL", title: "Comparte con mínimo privilegio", text: "Antes de enviar un archivo, limita quién puede verlo o editarlo y define fecha de vencimiento si la plataforma lo permite." },
    { icon: "PAGO", title: "Verifica solicitudes de dinero", text: "Una cuenta conocida también puede estar comprometida. Confirma cambios de cuenta bancaria o pagos mediante un canal independiente." },
    { icon: "LOCK", title: "Bloquea tu sesión", text: "Usa Windows + L, Control + Command + Q o el bloqueo del dispositivo cuando te alejes, incluso por pocos minutos." },
    { icon: "DNS", title: "Revisa la dirección completa", text: "En dominios web y correos, lee de derecha a izquierda la parte principal. Una letra cambiada puede llevarte a un sitio falso." },
    { icon: "SOS", title: "Reporta rápido", text: "Si hiciste clic, entregaste datos o detectaste algo inusual, desconecta si es necesario y avisa de inmediato al equipo responsable." },
    { icon: "PASS", title: "No reutilices contraseñas", text: "Un gestor de contraseñas permite crear una clave única para cada servicio sin tener que memorizarlas todas." },
    { icon: "MOV", title: "Protege también tu celular", text: "Usa bloqueo biométrico o PIN largo, cifra el dispositivo y activa localización y borrado remoto antes de necesitarlo." }
  ];

  const CLEAR_STATES = {
    1: { cls: "state-single", badge: "LÍNEA SEGURA", label: "DEFENSA SIMPLE", color: "#59f0b1" },
    2: { cls: "state-double", badge: "DOBLE DEFENSA", label: "DOBLE ESCUDO", color: "#2ae5ff" },
    3: { cls: "state-triple", badge: "TRIPLE ESCUDO", label: "BARRERA TRIPLE", color: "#ad72ff" },
    4: { cls: "state-quad", badge: "MURALLA DIGITAL", label: "PROTOCOLO MÁXIMO", color: "#ffd45c" }
  };

  const $ = (selector) => document.querySelector(selector);
  const els = {
    canvas: $("#gameCanvas"), next: $("#nextCanvas"), hold: $("#holdCanvas"), boardFrame: $("#boardFrame"),
    score: $("#scoreValue"), level: $("#levelValue"), lines: $("#linesValue"), best: $("#bestValue"), player: $("#playerDisplay"),
    pauseBtn: $("#pauseBtn"), restartBtn: $("#restartBtn"), printBtn: $("#printBtn"), soundBtn: $("#soundBtn"), homeBtn: $("#homeBtn"),
    pauseOverlay: $("#pauseOverlay"), gameOverOverlay: $("#gameOverOverlay"), gameOverSummary: $("#gameOverSummary"),
    overlayRestartBtn: $("#overlayRestartBtn"), levelToast: $("#levelToast"), clearBurst: $("#clearBurst"),
    tipPanel: $("#tipPanel"), clearBadge: $("#clearBadge"), bonusBadge: $("#bonusBadge"), tipIcon: $("#tipIcon"), tipTitle: $("#tipTitle"), tipText: $("#tipText"), tipProgress: $("#tipProgressBar"),
    leaderboard: $("#leaderboard"), startDialog: $("#startDialog"), startForm: $("#startForm"), playerName: $("#playerName"),
    reportPlayer: $("#reportPlayer"), reportScore: $("#reportScore"), reportLevel: $("#reportLevel"), reportLines: $("#reportLines"), reportCombo: $("#reportCombo"), reportDate: $("#reportDate"),
    sr: $("#srAnnouncements")
  };

  const ctx = els.canvas.getContext("2d");
  const nextCtx = els.next.getContext("2d");
  const holdCtx = els.hold.getContext("2d");

  let board = createBoard();
  let current = null;
  let queue = [];
  let heldType = null;
  let canHold = true;
  let score = 0;
  let lines = 0;
  let level = 1;
  let playerName = "";
  let running = false;
  let paused = false;
  let gameOver = false;
  let resolving = false;
  let soundOn = true;
  let scoreCommitted = false;
  let sessionId = "";
  let lastTime = 0;
  let dropAccumulator = 0;
  let tipIndex = -1;
  let clearStreak = 0;
  let maxClear = 0;
  let animationLayer = null;
  let audioCtx = null;
  let loopToken = 0;

  function createBoard() { return Engine.createBoard(ROWS, COLS); }

  function shuffledBag() {
    const bag = [...PIECE_TYPES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }

  function fillQueue() {
    while (queue.length < 7) queue.push(...shuffledBag());
  }

  function makePiece(type) {
    const data = PIECES[type];
    return {
      type,
      id: data.id,
      matrix: data.shape.map(row => [...row]),
      x: Math.floor((COLS - data.shape[0].length) / 2),
      y: -1
    };
  }

  function spawn(type = null) {
    fillQueue();
    current = makePiece(type || queue.shift());
    fillQueue();
    canHold = true;
    drawPreview(nextCtx, queue[0]);
    drawPreview(holdCtx, heldType);
    if (collides(current, 0, 0, current.matrix)) endGame();
  }

  function collides(piece, dx = 0, dy = 0, matrix = piece.matrix) {
    return Engine.collides(board, {
      id: piece.id,
      x: piece.x + dx,
      y: piece.y + dy,
      matrix
    }, BOARD_RULES);
  }

  function rotateMatrix(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
  }

  function tryRotate() {
    if (!canAct()) return;
    const rotated = rotateMatrix(current.matrix);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!collides(current, kick, 0, rotated)) {
        current.matrix = rotated;
        current.x += kick;
        tone(420, .045, "triangle", .045);
        draw();
        return;
      }
    }
  }

  function move(dx) {
    if (!canAct() || collides(current, dx, 0)) return false;
    current.x += dx;
    tone(205, .025, "sine", .018);
    draw();
    return true;
  }

  function stepDown(manual = false) {
    if (!canAct()) return false;
    if (!collides(current, 0, 1)) {
      current.y++;
      if (manual) addScore(1, false);
      dropAccumulator = 0;
      draw();
      return true;
    }
    lockPiece();
    return false;
  }

  function hardDrop() {
    if (!canAct()) return;
    let distance = 0;
    while (!collides(current, 0, 1)) {
      current.y++;
      distance++;
    }
    if (distance) addScore(distance * 2, false);
    tone(105, .085, "square", .055);
    lockPiece();
  }

  function holdPiece() {
    if (!canAct() || !canHold) return;
    const outgoing = current.type;
    if (heldType) {
      const incoming = heldType;
      heldType = outgoing;
      current = makePiece(incoming);
      if (collides(current)) endGame();
    } else {
      heldType = outgoing;
      fillQueue();
      current = makePiece(queue.shift());
      fillQueue();
      drawPreview(nextCtx, queue[0]);
    }
    canHold = false;
    drawPreview(holdCtx, heldType);
    tone(310, .07, "triangle", .04);
    draw();
  }

  function lockPiece() {
    if (!current || resolving || gameOver) return;
    const pieceToLock = {
      id: current.id,
      x: current.x,
      y: current.y,
      matrix: current.matrix.map(row => row.slice())
    };
    const transaction = Engine.beginLockTransaction(board, pieceToLock, BOARD_RULES);
    if (transaction.overflow) {
      current = null;
      endGame();
      return;
    }

    // La matriz lógica se actualiza una vez; pieza activa y fantasma dejan de existir.
    board = Engine.cloneBoard(transaction.lockedBoard);
    Engine.assertBoard(board, BOARD_RULES);
    current = null;

    if (transaction.completeRows.length) {
      resolving = true;
      animationLayer = {
        rows: Object.freeze([...transaction.completeRows]),
        snapshot: Engine.cloneBoard(transaction.lockedBoard),
        elapsed: 0,
        duration: Math.max(120, Number(CFG.lineAnimationMs) || 420),
        sessionId
      };
      toneClear(transaction.completeRows.length);
    } else {
      clearStreak = 0;
      animationLayer = null;
      spawn();
    }
    draw();
  }

  function completeLineAnimation() {
    if (!resolving || !animationLayer || animationLayer.sessionId !== sessionId) return;
    const stableLayer = animationLayer;
    const collapsed = Engine.collapseRows(stableLayer.snapshot, [...stableLayer.rows], BOARD_RULES);
    board = collapsed.board;
    Engine.assertBoard(board, BOARD_RULES);
    const completedCount = stableLayer.rows.length;
    const count = Math.min(4, completedCount);
    const oldLevel = level;
    clearStreak++;
    maxClear = Math.max(maxClear, count);
    lines += completedCount;
    level = Math.floor(lines / CFG.linesPerLevel) + 1;
    const base = LINE_REWARDS[count] * oldLevel;
    const streakBonus = clearStreak > 1 ? 40 * (clearStreak - 1) * count * oldLevel : 0;
    addScore(base + streakBonus, true);
    showClear(count, base + streakBonus, streakBonus);
    if (level > oldLevel) showLevelUp();
    animationLayer = null;
    resolving = false;
    spawn();
    updateHud();
    draw();
  }

  function addScore(points, publishProgress) {
    score += points;
    updateHud();
    if (publishProgress) emitScore("progress", false);
  }

  function dropInterval() {
    return Math.max(CFG.minimumDropMs, CFG.initialDropMs - (level - 1) * CFG.speedStepMs);
  }

  function ghostY() {
    if (!current) return 0;
    let offset = 0;
    while (!collides(current, 0, offset + 1)) offset++;
    return current.y + offset;
  }

  function draw() {
    // El render siempre parte de un lienzo limpio y nunca escribe en `board`.
    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
    const bg = ctx.createLinearGradient(0, 0, 0, els.canvas.height);
    bg.addColorStop(0, "#061825");
    bg.addColorStop(1, "#020a11");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);

    ctx.strokeStyle = "rgba(77, 195, 225, .085)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL + .5, 0); ctx.lineTo(x * CELL + .5, ROWS * CELL); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL + .5); ctx.lineTo(COLS * CELL, y * CELL + .5); ctx.stroke(); }

    const animatedRows = animationLayer ? new Set(animationLayer.rows) : null;
    board.forEach((row, y) => {
      if (animatedRows && animatedRows.has(y)) return;
      row.forEach((id, x) => { if (id) drawCell(ctx, x, y, BY_ID[id], 1); });
    });

    if (current && !gameOver) {
      const gy = ghostY();
      current.matrix.forEach((row, y) => row.forEach((value, x) => {
        if (value && gy + y >= 0) drawCell(ctx, current.x + x, gy + y, BY_ID[current.id], .18, true);
      }));
      current.matrix.forEach((row, y) => row.forEach((value, x) => {
        if (value && current.y + y >= 0) drawCell(ctx, current.x + x, current.y + y, BY_ID[current.id], 1);
      }));
    }

    drawAnimationLayer();
  }

  function drawAnimationLayer() {
    if (!animationLayer) return;
    const progress = Math.min(1, animationLayer.elapsed / animationLayer.duration);
    const pulse = .35 + Math.abs(Math.sin(progress * Math.PI * 5)) * .65;
    animationLayer.rows.forEach(y => {
      const row = animationLayer.snapshot[y];
      row.forEach((id, x) => {
        if (id) drawCell(ctx, x, y, BY_ID[id], Math.max(.12, 1 - progress * .72));
      });
      ctx.save();
      ctx.globalAlpha = pulse * (1 - progress * .45);
      ctx.fillStyle = "rgba(239, 255, 255, .84)";
      ctx.shadowColor = "#72ecff";
      ctx.shadowBlur = 18;
      const wipeWidth = COLS * CELL * Math.min(1, progress * 1.35);
      ctx.fillRect((COLS * CELL - wipeWidth) / 2, y * CELL + 2, wipeWidth, CELL - 4);
      ctx.restore();
    });
  }

  function roundedRect(context, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + w, y, x + w, y + h, radius);
    context.arcTo(x + w, y + h, x, y + h, radius);
    context.arcTo(x, y + h, x, y, radius);
    context.arcTo(x, y, x + w, y, radius);
    context.closePath();
  }

  function drawCell(context, x, y, data, alpha = 1, ghost = false, size = CELL) {
    const px = x * size + 3;
    const py = y * size + 3;
    const s = size - 6;
    context.save();
    context.globalAlpha = alpha;
    if (ghost) {
      roundedRect(context, px, py, s, s, 7);
      context.strokeStyle = data.color;
      context.lineWidth = 2;
      context.stroke();
      context.restore();
      return;
    }
    context.shadowColor = data.glow;
    context.shadowBlur = 9;
    const grad = context.createLinearGradient(px, py, px + s, py + s);
    grad.addColorStop(0, data.color);
    grad.addColorStop(.58, data.glow);
    grad.addColorStop(1, "#071822");
    roundedRect(context, px, py, s, s, 7);
    context.fillStyle = grad;
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = "rgba(232, 254, 255, .5)";
    context.lineWidth = 1;
    context.stroke();
    roundedRect(context, px + 6, py + 6, s - 12, s - 12, 4);
    context.strokeStyle = "rgba(255,255,255,.17)";
    context.stroke();
    context.beginPath();
    context.arc(px + s * .72, py + s * .28, Math.max(1.6, size * .055), 0, Math.PI * 2);
    context.fillStyle = "rgba(235,255,255,.68)";
    context.fill();
    context.restore();
  }

  function drawPreview(context, type) {
    const canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const bg = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, "rgba(3,16,25,.85)"); bg.addColorStop(1, "rgba(7,31,43,.65)");
    context.fillStyle = bg; context.fillRect(0, 0, canvas.width, canvas.height);
    if (!type) {
      context.fillStyle = "rgba(180,220,231,.4)";
      context.font = "700 11px system-ui";
      context.textAlign = "center";
      context.fillText("VACÍA", canvas.width / 2, canvas.height / 2 + 4);
      return;
    }
    const data = PIECES[type];
    const matrix = data.shape;
    const size = 24;
    const used = [];
    matrix.forEach((row, y) => row.forEach((v, x) => { if (v) used.push({x,y}); }));
    const minX = Math.min(...used.map(p => p.x)); const maxX = Math.max(...used.map(p => p.x));
    const minY = Math.min(...used.map(p => p.y)); const maxY = Math.max(...used.map(p => p.y));
    const offsetX = (canvas.width - (maxX - minX + 1) * size) / 2 - minX * size;
    const offsetY = (canvas.height - (maxY - minY + 1) * size) / 2 - minY * size;
    context.save(); context.translate(offsetX, offsetY);
    matrix.forEach((row, y) => row.forEach((v, x) => { if (v) drawCell(context, x, y, data, 1, false, size); }));
    context.restore();
  }

  function updateHud() {
    els.score.textContent = score.toLocaleString("es-CO");
    els.level.textContent = level;
    els.lines.textContent = lines;
    const records = loadLeaderboard();
    const best = Math.max(score, ...records.map(item => Number(item.score) || 0), 0);
    els.best.textContent = best.toLocaleString("es-CO");
  }

  function showClear(count, points, streakBonus) {
    const state = CLEAR_STATES[count] || CLEAR_STATES[4];
    tipIndex = (tipIndex + 1) % TIPS.length;
    const tip = TIPS[tipIndex];
    els.tipPanel.className = `glass tip-panel ${state.cls}`;
    void els.tipPanel.offsetWidth;
    els.tipPanel.classList.add("tip-active");
    els.clearBadge.textContent = state.badge;
    els.bonusBadge.textContent = `+${points.toLocaleString("es-CO")} PTS`;
    els.tipIcon.textContent = tip.icon;
    els.tipTitle.textContent = tip.title;
    els.tipText.textContent = tip.text;
    els.clearBurst.style.color = state.color;
    els.clearBurst.textContent = `${state.label} · +${points.toLocaleString("es-CO")}${streakBonus ? " · RACHA" : ""}`;
    restartAnimation(els.clearBurst, "show");
    announce(`${count} ${count === 1 ? "línea completada" : "líneas completadas"}. ${tip.title}. ${tip.text}`);
  }

  function showLevelUp() {
    els.levelToast.textContent = `NIVEL ${level} · VELOCIDAD AUMENTADA`;
    restartAnimation(els.levelToast, "show");
    tone(640, .12, "triangle", .06, .02);
    window.setTimeout(() => tone(850, .15, "triangle", .055), 110);
    announce(`Nivel ${level}. La velocidad ha aumentado.`);
  }

  function restartAnimation(element, cls) {
    element.classList.remove(cls);
    void element.offsetWidth;
    element.classList.add(cls);
    window.setTimeout(() => element.classList.remove(cls), 1600);
  }

  function announce(text) {
    els.sr.textContent = "";
    window.setTimeout(() => { els.sr.textContent = text; }, 20);
  }

  function canAct() { return running && !paused && !gameOver && !resolving && current; }

  function togglePause(force) {
    if (!running || gameOver) return;
    paused = typeof force === "boolean" ? force : !paused;
    els.pauseOverlay.classList.toggle("hidden", !paused);
    els.pauseBtn.textContent = paused ? "> Continuar" : "II Pausa";
    if (!paused) { lastTime = performance.now(); dropAccumulator = 0; }
    announce(paused ? "Juego en pausa" : "Juego reanudado");
  }

  function startGame() {
    board = createBoard();
    queue = [];
    heldType = null;
    score = 0;
    lines = 0;
    level = 1;
    clearStreak = 0;
    maxClear = 0;
    tipIndex = -1;
    animationLayer = null;
    running = true;
    paused = false;
    gameOver = false;
    resolving = false;
    scoreCommitted = false;
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    loopToken++;
    const thisLoop = loopToken;
    lastTime = performance.now();
    dropAccumulator = 0;
    els.pauseOverlay.classList.add("hidden");
    els.gameOverOverlay.classList.add("hidden");
    els.pauseBtn.textContent = "II Pausa";
    els.tipPanel.className = "glass tip-panel state-idle";
    els.clearBadge.textContent = "CENTRO DE DEFENSA";
    els.bonusBadge.textContent = "LISTO";
    els.tipIcon.textContent = "SEG";
    els.tipTitle.textContent = "Consejos que protegen";
    els.tipText.textContent = "Completa una o varias líneas para desbloquear recomendaciones prácticas de ciberseguridad.";
    spawn();
    updateHud();
    renderLeaderboard();
    draw();
    requestAnimationFrame(now => loop(now, thisLoop));
    els.boardFrame.focus({ preventScroll: true });
  }

  function restartGame() {
    if (running && !scoreCommitted && score > 0) commitResult("restart");
    startGame();
  }

  function endGame() {
    if (gameOver) return;
    gameOver = true;
    running = false;
    paused = false;
    commitResult("gameover");
    updateHud();
    renderLeaderboard();
    updatePrintReport();
    els.gameOverSummary.textContent = `${playerName}: ${score.toLocaleString("es-CO")} puntos · Nivel ${level}`;
    els.gameOverOverlay.classList.remove("hidden");
    tone(165, .23, "sawtooth", .05);
    window.setTimeout(() => tone(115, .3, "sawtooth", .045), 180);
    announce(`Fin de la sesión. Puntuación final ${score}. Nivel ${level}.`);
  }

  function loop(now, token) {
    if (token !== loopToken || !running || gameOver) return;
    const delta = Math.min(100, now - lastTime);
    lastTime = now;
    if (!paused) {
      if (resolving && animationLayer) {
        animationLayer.elapsed += delta;
        if (animationLayer.elapsed >= animationLayer.duration) completeLineAnimation();
      } else if (!resolving) {
        dropAccumulator += delta;
        if (dropAccumulator >= dropInterval()) stepDown(false);
      }
    }
    draw();
    requestAnimationFrame(nextNow => loop(nextNow, token));
  }

  function loadLeaderboard() {
    try {
      const value = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  }

  function saveLeaderboard(reason) {
    const records = loadLeaderboard();
    records.push({ player: playerName, score, lines, level, maxClear, reason, date: new Date().toISOString(), sessionId });
    records.sort((a, b) => b.score - a.score || b.lines - a.lines);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(records.slice(0, CFG.leaderboardSize)));
  }

  function renderLeaderboard() {
    const records = loadLeaderboard();
    els.leaderboard.innerHTML = "";
    if (!records.length) {
      const li = document.createElement("li"); li.className = "empty-score"; li.textContent = "Aún no hay resultados guardados."; els.leaderboard.appendChild(li); return;
    }
    records.forEach(item => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      const name = document.createElement("span"); name.textContent = String(item.player || "Agente").slice(0, 24);
      const points = document.createElement("strong"); points.textContent = Number(item.score || 0).toLocaleString("es-CO");
      span.append(name, points); li.appendChild(span); els.leaderboard.appendChild(li);
    });
  }

  function commitResult(reason) {
    if (scoreCommitted) return;
    scoreCommitted = true;
    saveLeaderboard(reason);
    emitScore(reason, true);
  }

  function emitScore(reason, cumulative) {
    const detail = {
      version: 1,
      gameVersion: CFG.gameVersion,
      event: CFG.scoreEvent,
      gameId: CFG.gameId,
      title: CFG.title,
      sessionId,
      player: playerName,
      score,
      lines,
      level,
      maxClear,
      reason,
      cumulative,
      timestamp: new Date().toISOString()
    };

    try { window.dispatchEvent(new CustomEvent(CFG.scoreEvent, { detail })); } catch { /* navegador antiguo */ }
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: CFG.scoreEvent, payload: detail }, "*"); } catch { /* iframe restringido */ }
    if (!cumulative) return;

    try {
      let previous = null;
      const raw = localStorage.getItem(CFG.scoreEvent);
      if (raw) { try { previous = JSON.parse(raw); } catch { previous = raw; } }
      const compatible = previous && typeof previous === "object" && previous.version === 1 && previous.games && previous.players;
      const ledger = compatible ? previous : { version: 1, totalScore: 0, games: {}, players: {}, entries: [], legacy: previous };
      ledger.totalScore = Number(ledger.totalScore || 0) + score;
      ledger.games[CFG.gameId] = ledger.games[CFG.gameId] || { totalScore: 0, plays: 0, best: 0 };
      ledger.games[CFG.gameId].totalScore += score;
      ledger.games[CFG.gameId].plays += 1;
      ledger.games[CFG.gameId].best = Math.max(ledger.games[CFG.gameId].best || 0, score);
      const playerKey = playerName.trim().toLocaleLowerCase("es-CO") || "agente";
      ledger.players[playerKey] = ledger.players[playerKey] || { name: playerName, totalScore: 0, plays: 0, best: 0 };
      ledger.players[playerKey].name = playerName;
      ledger.players[playerKey].totalScore += score;
      ledger.players[playerKey].plays += 1;
      ledger.players[playerKey].best = Math.max(ledger.players[playerKey].best || 0, score);
      ledger.entries = Array.isArray(ledger.entries) ? ledger.entries : [];
      ledger.entries.unshift(detail);
      ledger.entries = ledger.entries.slice(0, 100);
      ledger.latest = detail;
      localStorage.setItem(CFG.scoreEvent, JSON.stringify(ledger));
    } catch (error) {
      console.warn("No fue posible guardar el acumulado de Ciberaula.", error);
    }
  }

  function updatePrintReport() {
    els.reportPlayer.textContent = playerName || "—";
    els.reportScore.textContent = score.toLocaleString("es-CO");
    els.reportLevel.textContent = level;
    els.reportLines.textContent = lines;
    els.reportCombo.textContent = maxClear ? `${maxClear} ${maxClear === 1 ? "línea" : "líneas"} simultáneas` : "Sin líneas completadas";
    els.reportDate.textContent = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short" }).format(new Date());
  }

  function printResult() {
    const wasPaused = paused;
    if (running && !paused) togglePause(true);
    updatePrintReport();
    window.print();
    if (running && !wasPaused) window.setTimeout(() => togglePause(false), 250);
  }

  function ensureAudio() {
    if (!soundOn) return null;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(frequency, duration = .06, type = "sine", volume = .04, delay = 0) {
    if (!soundOn) return;
    const ac = ensureAudio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const start = ac.currentTime + delay;
    osc.type = type; osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain); gain.connect(ac.destination); osc.start(start); osc.stop(start + duration + .02);
  }

  function toneClear(count) {
    const patterns = {
      1: [390], 2: [390, 520], 3: [390, 520, 670], 4: [390, 540, 720, 960]
    };
    (patterns[count] || patterns[4]).forEach((freq, i) => tone(freq, .12, "triangle", .055, i * .07));
  }

  function handleKey(event) {
    const activeTag = document.activeElement && document.activeElement.tagName;
    if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
    const key = event.key.toLowerCase();
    const handled = ["arrowleft","arrowright","arrowup","arrowdown"," ","a","d","w","s","c","p","r","escape"].includes(key);
    if (handled) event.preventDefault();
    if (key === "p" || key === "escape") { togglePause(); return; }
    if (key === "r") { restartGame(); return; }
    if (key === "arrowleft" || key === "a") move(-1);
    else if (key === "arrowright" || key === "d") move(1);
    else if (key === "arrowup" || key === "w") tryRotate();
    else if (key === "arrowdown" || key === "s") stepDown(true);
    else if (key === " ") hardDrop();
    else if (key === "c") holdPiece();
  }

  function handleBoardMouse(event) {
    if (!canAct()) return;
    const rect = els.canvas.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    if (event.button === 2) { event.preventDefault(); hardDrop(); return; }
    if (relativeX < rect.width * .34) move(-1);
    else if (relativeX > rect.width * .66) move(1);
    else tryRotate();
  }

  function bindTouchControls() {
    document.querySelectorAll("[data-action]").forEach(button => {
      const action = button.dataset.action;
      let timer = null;
      let repeater = null;
      const execute = () => {
        if (action === "left") move(-1);
        else if (action === "right") move(1);
        else if (action === "rotate") tryRotate();
        else if (action === "down") stepDown(true);
        else if (action === "drop") hardDrop();
        else if (action === "hold") holdPiece();
      };
      button.addEventListener("pointerdown", event => {
        event.preventDefault();
        execute();
        if (["left","right","down"].includes(action)) {
          timer = window.setTimeout(() => { repeater = window.setInterval(execute, action === "down" ? 65 : 105); }, 260);
        }
      });
      const stop = () => { window.clearTimeout(timer); window.clearInterval(repeater); timer = repeater = null; };
      button.addEventListener("pointerup", stop);
      button.addEventListener("pointercancel", stop);
      button.addEventListener("pointerleave", stop);
    });
  }

  function applyConfig() {
    document.title = CFG.title;
    [$("#brandLogo"), $("#dialogLogo"), $("#reportLogo")].forEach(img => { if (img) img.src = CFG.logo; });
    els.homeBtn.href = CFG.homeUrl;
  }

  function init() {
    applyConfig();
    renderLeaderboard();
    updateHud();
    drawPreview(nextCtx, null);
    drawPreview(holdCtx, null);
    draw();
    const savedName = localStorage.getItem(PLAYER_KEY) || "";
    els.playerName.value = savedName;

    els.startForm.addEventListener("submit", event => {
      event.preventDefault();
      const name = els.playerName.value.trim().replace(/\s+/g, " ").slice(0, 32);
      if (name.length < 2) { els.playerName.setCustomValidity("Escribe al menos dos caracteres."); els.playerName.reportValidity(); return; }
      els.playerName.setCustomValidity("");
      playerName = name;
      localStorage.setItem(PLAYER_KEY, playerName);
      els.player.textContent = playerName;
      els.startDialog.close();
      ensureAudio();
      startGame();
    });
    els.playerName.addEventListener("input", () => els.playerName.setCustomValidity(""));

    document.addEventListener("keydown", handleKey, { passive: false });
    els.pauseBtn.addEventListener("click", () => togglePause());
    els.restartBtn.addEventListener("click", restartGame);
    els.overlayRestartBtn.addEventListener("click", restartGame);
    els.printBtn.addEventListener("click", printResult);
    els.soundBtn.addEventListener("click", () => {
      soundOn = !soundOn;
      els.soundBtn.setAttribute("aria-pressed", String(soundOn));
      els.soundBtn.querySelector("span").textContent = soundOn ? "SONIDO: SÍ" : "SONIDO: NO";
      if (soundOn) tone(480, .08, "sine", .04);
    });
    els.canvas.addEventListener("mousedown", handleBoardMouse);
    els.canvas.addEventListener("contextmenu", event => event.preventDefault());
    els.canvas.addEventListener("wheel", event => { event.preventDefault(); if (event.deltaY > 0) stepDown(true); else tryRotate(); }, { passive: false });
    bindTouchControls();

    document.addEventListener("visibilitychange", () => { if (document.hidden && running && !paused) togglePause(true); });
    window.addEventListener("beforeprint", updatePrintReport);

    if (typeof els.startDialog.showModal === "function") els.startDialog.showModal();
    else els.startDialog.setAttribute("open", "");
    window.setTimeout(() => els.playerName.focus(), 80);
  }

  init();
})();
