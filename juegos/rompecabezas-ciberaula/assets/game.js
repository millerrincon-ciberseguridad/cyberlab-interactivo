(() => {
  'use strict';

  const SCORE_KEY = 'ciberaula:score:v1';
  const LAST_PLAYER_KEY = 'ciberaula:last-player';
  const PROGRESS_KEY = 'ciberaula:rompecabezas:progress:v1';
  const BOARD_W = 1200;
  const BOARD_H = 750;
  const PAGE_SIZE = 24;
  const LAYOUTS = {
    20: { cols: 5, rows: 4 },
    50: { cols: 10, rows: 5 },
    100: { cols: 10, rows: 10 },
    500: { cols: 25, rows: 20 }
  };

  const $ = (selector) => document.querySelector(selector);
  const els = {
    intro: $('#intro'), game: $('#game'), results: $('#results'), form: $('#setupForm'),
    player: $('#playerName'), nameError: $('#nameError'), timerToggle: $('#timerToggle'),
    snapshot: $('#playerSnapshot'), snapshotLabel: $('#snapshotLabel'), snapshotBar: $('#snapshotBar'), snapshotMeta: $('#snapshotMeta'),
    resume: $('#resumeBtn'), resumeNotice: $('#resumeNotice'), resumeText: $('#resumeText'),
    hudPlayer: $('#hudPlayer'), progress: $('#progressText'), score: $('#scoreText'), time: $('#timeText'), progressBar: $('#progressBar'),
    saveExit: $('#saveExitBtn'), hint: $('#hintBtn'), instruction: $('#instruction'),
    board: $('#boardCanvas'), boardScroll: $('#boardScroll'), boardFeedback: $('#boardFeedback'),
    tray: $('#trayCanvas'), selectedInfo: $('#selectedInfo'), prev: $('#prevPageBtn'), next: $('#nextPageBtn'), pageText: $('#pageText'),
    zoomOut: $('#zoomOutBtn'), zoomIn: $('#zoomInBtn'), zoomText: $('#zoomText'),
    resultPlayer: $('#resultPlayer'), resultPieces: $('#resultPieces'), resultTime: $('#resultTime'), resultHints: $('#resultHints'), resultScore: $('#resultScore'), victory: $('#victoryNotice'),
    restart: $('#restartBtn'), scoreBtn: $('#scoreBtn'), resultScoreBtn: $('#resultScoreBtn'), scorePanel: $('#scorePanel'), closeScore: $('#closeScoreBtn'), scoreList: $('#scoreList'), emptyScore: $('#emptyScore'), full: $('#fullBtn')
  };

  const image = new Image();
  image.src = 'assets/puzzle-image.jpg';
  const boardCtx = els.board.getContext('2d');
  const trayCtx = els.tray.getContext('2d');
  const placedCanvas = document.createElement('canvas');
  placedCanvas.width = BOARD_W;
  placedCanvas.height = BOARD_H;
  const placedCtx = placedCanvas.getContext('2d');

  let state = freshState();
  let pieces = [];
  let pieceMap = new Map();
  let trayHitboxes = [];
  let timerId = null;
  let saveId = null;
  let hintId = null;
  let feedbackId = null;
  let draggingId = null;
  let lastFocus = null;

  function freshState() {
    return {
      active: false, finished: false, player: '', pieceCount: 20, cols: 5, rows: 4,
      seed: 0, order: [], placed: new Set(), selected: null, hinted: null,
      score: 0, hints: 0, timerEnabled: true, elapsed: 0, startedAt: 0,
      page: 0, zoom: 1
    };
  }

  const normalizeName = (value) => String(value || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const playerKey = (name) => normalizeName(name).toLocaleLowerCase('es');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const formatTime = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  const mulberry32 = (seed) => () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const shuffled = (items, random) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  };

  function loadScore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (_) { return {}; }
  }
  function saveScore(value) {
    try { localStorage.setItem(SCORE_KEY, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function getRecord(name) {
    return loadScore()[playerKey(name)] || { name: normalizeName(name), games: 0, wins: 0, totalPoints: 0, bestPercent: 0 };
  }
  function registerResult(name, points) {
    const all = loadScore();
    const key = playerKey(name);
    const previous = all[key] || { name, games: 0, wins: 0, totalPoints: 0, bestPercent: 0 };
    all[key] = {
      name: normalizeName(name),
      games: Number(previous.games || 0) + 1,
      wins: Number(previous.wins || 0) + 1,
      totalPoints: Number(previous.totalPoints || 0) + Number(points || 0),
      bestPercent: Math.max(Number(previous.bestPercent || 0), 100),
      lastPlayed: new Date().toISOString()
    };
    saveScore(all);
    return all[key];
  }
  const milestoneFor = (wins) => Math.max(5, Math.ceil(Math.max(1, Number(wins) || 0) / 5) * 5);

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
      if (!parsed || parsed.version !== 1 || !LAYOUTS[parsed.pieceCount]) return null;
      return parsed;
    } catch (_) { return null; }
  }
  function currentElapsed() {
    if (!state.timerEnabled) return state.elapsed;
    return state.elapsed + (state.active && state.startedAt ? Math.floor((Date.now() - state.startedAt) / 1000) : 0);
  }
  function progressPayload() {
    return {
      version: 1,
      player: state.player,
      pieceCount: state.pieceCount,
      seed: state.seed,
      order: state.order,
      placed: [...state.placed],
      score: state.score,
      hints: state.hints,
      timerEnabled: state.timerEnabled,
      elapsed: currentElapsed(),
      page: state.page,
      savedAt: new Date().toISOString(),
      finished: false
    };
  }
  function saveProgress() {
    if (!state.active || state.finished || !state.player) return;
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressPayload())); }
    catch (_) { /* El juego continúa aunque el almacenamiento no esté disponible. */ }
  }
  function clearProgress() {
    try { localStorage.removeItem(PROGRESS_KEY); } catch (_) { /* almacenamiento opcional */ }
  }

  function updateSnapshot() {
    const name = normalizeName(els.player.value);
    els.nameError.hidden = true;
    if (!name) {
      els.snapshot.hidden = true;
      els.resume.hidden = true;
      els.resumeNotice.hidden = true;
      return;
    }
    const record = getRecord(name);
    const milestone = milestoneFor(record.wins);
    els.snapshot.hidden = false;
    els.snapshotLabel.textContent = `${record.wins || 0} / ${milestone} victorias`;
    els.snapshotBar.style.width = `${Math.min(100, (Number(record.wins || 0) / milestone) * 100)}%`;
    els.snapshotMeta.textContent = `${record.games || 0} partidas · ${record.totalPoints || 0} puntos acumulados · mejor ${record.bestPercent || 0}%`;
    const saved = loadProgress();
    const canResume = Boolean(saved && !saved.finished && playerKey(saved.player) === playerKey(name));
    els.resume.hidden = !canResume;
    els.resumeNotice.hidden = !canResume;
    if (canResume) {
      const completed = Array.isArray(saved.placed) ? saved.placed.length : 0;
      els.resumeText.textContent = `${completed} de ${saved.pieceCount} piezas · ${saved.timerEnabled ? formatTime(saved.elapsed) : 'sin contador'}`;
    }
  }

  function showScreen(name) {
    [els.intro, els.game, els.results].forEach((screen) => screen.classList.remove('active'));
    els[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function piecePath(x, y, width, height, edges) {
    const path = new Path2D();
    const depth = Math.min(width, height) * 0.24;
    path.moveTo(x, y);
    edgeTop(path, x, y, width, depth, edges.top);
    edgeRight(path, x + width, y, height, depth, edges.right);
    edgeBottom(path, x + width, y + height, width, depth, edges.bottom);
    edgeLeft(path, x, y + height, height, depth, edges.left);
    path.closePath();
    return path;
  }
  function edgeTop(path, x, y, length, depth, edge) {
    if (!edge) { path.lineTo(x + length, y); return; }
    const offset = -edge * depth;
    path.lineTo(x + length * .34, y);
    path.bezierCurveTo(x + length * .40, y, x + length * .38, y + offset, x + length * .45, y + offset);
    path.bezierCurveTo(x + length * .48, y + offset * 1.2, x + length * .52, y + offset * 1.2, x + length * .55, y + offset);
    path.bezierCurveTo(x + length * .62, y + offset, x + length * .60, y, x + length * .66, y);
    path.lineTo(x + length, y);
  }
  function edgeRight(path, x, y, length, depth, edge) {
    if (!edge) { path.lineTo(x, y + length); return; }
    const offset = edge * depth;
    path.lineTo(x, y + length * .34);
    path.bezierCurveTo(x, y + length * .40, x + offset, y + length * .38, x + offset, y + length * .45);
    path.bezierCurveTo(x + offset * 1.2, y + length * .48, x + offset * 1.2, y + length * .52, x + offset, y + length * .55);
    path.bezierCurveTo(x + offset, y + length * .62, x, y + length * .60, x, y + length * .66);
    path.lineTo(x, y + length);
  }
  function edgeBottom(path, x, y, length, depth, edge) {
    if (!edge) { path.lineTo(x - length, y); return; }
    const offset = edge * depth;
    path.lineTo(x - length * .34, y);
    path.bezierCurveTo(x - length * .40, y, x - length * .38, y + offset, x - length * .45, y + offset);
    path.bezierCurveTo(x - length * .48, y + offset * 1.2, x - length * .52, y + offset * 1.2, x - length * .55, y + offset);
    path.bezierCurveTo(x - length * .62, y + offset, x - length * .60, y, x - length * .66, y);
    path.lineTo(x - length, y);
  }
  function edgeLeft(path, x, y, length, depth, edge) {
    if (!edge) { path.lineTo(x, y - length); return; }
    const offset = -edge * depth;
    path.lineTo(x, y - length * .34);
    path.bezierCurveTo(x, y - length * .40, x + offset, y - length * .38, x + offset, y - length * .45);
    path.bezierCurveTo(x + offset * 1.2, y - length * .48, x + offset * 1.2, y - length * .52, x + offset, y - length * .55);
    path.bezierCurveTo(x + offset, y - length * .62, x, y - length * .60, x, y - length * .66);
    path.lineTo(x, y - length);
  }

  function buildPieces(pieceCount, seed) {
    const layout = LAYOUTS[pieceCount];
    const random = mulberry32(seed >>> 0);
    const vertical = Array.from({ length: layout.rows }, () => Array.from({ length: Math.max(0, layout.cols - 1) }, () => random() < .5 ? -1 : 1));
    const horizontal = Array.from({ length: Math.max(0, layout.rows - 1) }, () => Array.from({ length: layout.cols }, () => random() < .5 ? -1 : 1));
    const cellW = BOARD_W / layout.cols;
    const cellH = BOARD_H / layout.rows;
    pieces = [];
    for (let row = 0; row < layout.rows; row += 1) {
      for (let col = 0; col < layout.cols; col += 1) {
        const id = row * layout.cols + col;
        const edges = {
          top: row === 0 ? 0 : -horizontal[row - 1][col],
          right: col === layout.cols - 1 ? 0 : vertical[row][col],
          bottom: row === layout.rows - 1 ? 0 : horizontal[row][col],
          left: col === 0 ? 0 : -vertical[row][col - 1]
        };
        const piece = { id, row, col, edges, x: col * cellW, y: row * cellH, w: cellW, h: cellH };
        piece.boardPath = piecePath(piece.x, piece.y, piece.w, piece.h, piece.edges);
        pieces.push(piece);
      }
    }
    pieceMap = new Map(pieces.map((piece) => [piece.id, piece]));
    return { pieces, random };
  }

  function ensureImage() {
    if (image.complete && image.naturalWidth) return Promise.resolve();
    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', reject, { once: true });
    });
  }

  function rebuildPlacedLayer() {
    placedCtx.clearRect(0, 0, BOARD_W, BOARD_H);
    state.placed.forEach((id) => {
      const piece = pieceMap.get(Number(id));
      if (piece) drawPlacedPiece(piece);
    });
  }
  function drawPlacedPiece(piece) {
    placedCtx.save();
    placedCtx.clip(piece.boardPath);
    placedCtx.drawImage(image, 0, 0, BOARD_W, BOARD_H);
    placedCtx.restore();
    placedCtx.save();
    placedCtx.strokeStyle = 'rgba(230,251,255,.48)';
    placedCtx.lineWidth = state.pieceCount >= 500 ? .65 : 1.2;
    placedCtx.stroke(piece.boardPath);
    placedCtx.restore();
  }

  function drawBoard() {
    boardCtx.clearRect(0, 0, BOARD_W, BOARD_H);
    boardCtx.fillStyle = '#02070c';
    boardCtx.fillRect(0, 0, BOARD_W, BOARD_H);
    boardCtx.save();
    boardCtx.globalAlpha = state.pieceCount >= 100 ? .12 : .17;
    boardCtx.drawImage(image, 0, 0, BOARD_W, BOARD_H);
    boardCtx.restore();

    boardCtx.save();
    boardCtx.strokeStyle = state.pieceCount >= 500 ? 'rgba(88,232,255,.10)' : 'rgba(88,232,255,.16)';
    boardCtx.lineWidth = state.pieceCount >= 500 ? .45 : .8;
    pieces.forEach((piece) => {
      if (!state.placed.has(piece.id)) boardCtx.stroke(piece.boardPath);
    });
    boardCtx.restore();
    boardCtx.drawImage(placedCanvas, 0, 0);

    if (state.hinted !== null && !state.placed.has(state.hinted)) {
      const target = pieceMap.get(state.hinted);
      if (target) {
        boardCtx.save();
        boardCtx.shadowColor = '#68f5ae';
        boardCtx.shadowBlur = state.pieceCount >= 500 ? 10 : 22;
        boardCtx.lineWidth = state.pieceCount >= 500 ? 4 : 7;
        boardCtx.strokeStyle = '#68f5ae';
        boardCtx.stroke(target.boardPath);
        boardCtx.restore();
      }
    }
  }

  function unplacedIds() {
    return state.order.filter((id) => !state.placed.has(id));
  }
  function pageCount() {
    return Math.max(1, Math.ceil(unplacedIds().length / PAGE_SIZE));
  }
  function visibleIds() {
    const remaining = unplacedIds();
    state.page = clamp(state.page, 0, Math.max(0, Math.ceil(remaining.length / PAGE_SIZE) - 1));
    return remaining.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE);
  }

  function drawTray() {
    const ids = visibleIds();
    const columns = 8;
    const rows = 3;
    const cellW = els.tray.width / columns;
    const cellH = els.tray.height / rows;
    trayCtx.clearRect(0, 0, els.tray.width, els.tray.height);
    trayCtx.fillStyle = '#030a10';
    trayCtx.fillRect(0, 0, els.tray.width, els.tray.height);
    trayHitboxes = [];

    ids.forEach((id, index) => {
      const piece = pieceMap.get(id);
      const col = index % columns;
      const row = Math.floor(index / columns);
      const box = { x: col * cellW, y: row * cellH, w: cellW, h: cellH, id };
      trayHitboxes.push(box);
      const padding = state.pieceCount >= 500 ? 22 : 17;
      const maxW = cellW - padding * 2;
      const maxH = cellH - padding * 2;
      const ratio = piece.w / piece.h;
      let drawW = maxW;
      let drawH = drawW / ratio;
      if (drawH > maxH) { drawH = maxH; drawW = drawH * ratio; }
      const x = box.x + (cellW - drawW) / 2;
      const y = box.y + (cellH - drawH) / 2;
      const path = piecePath(x, y, drawW, drawH, piece.edges);

      trayCtx.save();
      if (state.selected === id) {
        trayCtx.shadowColor = '#68f5ae';
        trayCtx.shadowBlur = 18;
      }
      trayCtx.clip(path);
      const scaleX = drawW / piece.w;
      const scaleY = drawH / piece.h;
      trayCtx.drawImage(image, x - piece.x * scaleX, y - piece.y * scaleY, BOARD_W * scaleX, BOARD_H * scaleY);
      trayCtx.restore();
      trayCtx.save();
      trayCtx.strokeStyle = state.selected === id ? '#68f5ae' : 'rgba(230,251,255,.62)';
      trayCtx.lineWidth = state.selected === id ? 4 : 2;
      trayCtx.stroke(path);
      trayCtx.restore();
      trayCtx.fillStyle = state.selected === id ? '#68f5ae' : 'rgba(200,226,236,.7)';
      trayCtx.font = 'bold 13px Segoe UI, sans-serif';
      trayCtx.fillText(String(id + 1).padStart(3, '0'), box.x + 8, box.y + 17);
    });

    if (!ids.length) {
      trayCtx.fillStyle = '#68f5ae';
      trayCtx.font = 'bold 30px Segoe UI, sans-serif';
      trayCtx.textAlign = 'center';
      trayCtx.fillText('TODAS LAS PIEZAS ESTÁN EN EL TABLERO', els.tray.width / 2, els.tray.height / 2);
      trayCtx.textAlign = 'start';
    }
    const pages = pageCount();
    els.pageText.textContent = `${Math.min(state.page + 1, pages)} / ${pages}`;
    els.prev.disabled = state.page <= 0;
    els.next.disabled = state.page >= pages - 1;
    updateSelectedInfo();
  }

  function updateSelectedInfo() {
    if (state.selected === null) {
      els.selectedInfo.textContent = 'Ninguna pieza seleccionada.';
      return;
    }
    els.selectedInfo.innerHTML = `Pieza <strong>${String(state.selected + 1).padStart(3, '0')}</strong> seleccionada · toca su lugar correcto en el tablero.`;
  }

  function updateHud() {
    const completed = state.placed.size;
    els.hudPlayer.textContent = state.player || '—';
    els.progress.textContent = `${completed} / ${state.pieceCount}`;
    els.score.textContent = String(state.score);
    els.time.textContent = state.timerEnabled ? formatTime(currentElapsed()) : 'SIN PRISA';
    els.progressBar.style.width = `${state.pieceCount ? (completed / state.pieceCount) * 100 : 0}%`;
  }

  function startTimers() {
    stopTimers();
    state.startedAt = Date.now();
    if (state.timerEnabled) timerId = window.setInterval(updateHud, 1000);
    saveId = window.setInterval(saveProgress, 15000);
  }
  function stopTimers() {
    if (timerId) clearInterval(timerId);
    if (saveId) clearInterval(saveId);
    timerId = null;
    saveId = null;
  }
  function commitElapsed() {
    state.elapsed = currentElapsed();
    state.startedAt = 0;
  }

  async function beginNew() {
    const name = normalizeName(els.player.value);
    if (!name) {
      els.nameError.hidden = false;
      els.player.setAttribute('aria-invalid', 'true');
      els.player.focus();
      return;
    }
    const count = Number(new FormData(els.form).get('pieceCount'));
    const layout = LAYOUTS[count] || LAYOUTS[20];
    await ensureImage();
    clearProgress();
    state = freshState();
    state.active = true;
    state.player = name;
    state.pieceCount = count;
    state.cols = layout.cols;
    state.rows = layout.rows;
    state.seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    state.timerEnabled = els.timerToggle.checked;
    const built = buildPieces(count, state.seed);
    state.order = shuffled(pieces.map((piece) => piece.id), built.random);
    try { localStorage.setItem(LAST_PLAYER_KEY, name); } catch (_) { /* almacenamiento opcional */ }
    els.player.removeAttribute('aria-invalid');
    els.nameError.hidden = true;
    prepareGame();
  }

  async function resumeGame() {
    const name = normalizeName(els.player.value);
    const saved = loadProgress();
    if (!name || !saved || playerKey(saved.player) !== playerKey(name)) { updateSnapshot(); return; }
    await ensureImage();
    const layout = LAYOUTS[saved.pieceCount];
    state = freshState();
    state.active = true;
    state.player = normalizeName(saved.player);
    state.pieceCount = saved.pieceCount;
    state.cols = layout.cols;
    state.rows = layout.rows;
    state.seed = Number(saved.seed) >>> 0;
    buildPieces(state.pieceCount, state.seed);
    state.order = Array.isArray(saved.order) && saved.order.length === saved.pieceCount ? saved.order.map(Number) : pieces.map((piece) => piece.id);
    state.placed = new Set((Array.isArray(saved.placed) ? saved.placed : []).map(Number).filter((id) => pieceMap.has(id)));
    state.score = Number(saved.score || 0);
    state.hints = Number(saved.hints || 0);
    state.timerEnabled = Boolean(saved.timerEnabled);
    state.elapsed = Number(saved.elapsed || 0);
    state.page = Number(saved.page || 0);
    prepareGame();
  }

  function prepareGame() {
    state.finished = false;
    state.selected = null;
    state.hinted = null;
    state.zoom = 1;
    rebuildPlacedLayer();
    applyZoom();
    drawBoard();
    drawTray();
    updateHud();
    showScreen('game');
    startTimers();
    saveProgress();
    els.instruction.textContent = 'Toca una pieza de la bandeja y luego su lugar en el tablero. También puedes arrastrarla.';
  }

  function selectPiece(id) {
    if (!state.active || state.placed.has(id) || !pieceMap.has(id)) return;
    state.selected = id;
    drawTray();
    els.instruction.textContent = `Pieza ${String(id + 1).padStart(3, '0')} seleccionada. Busca su lugar en la imagen.`;
  }

  function canvasPoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }
  function trayPieceAt(event) {
    const point = canvasPoint(els.tray, event);
    const box = trayHitboxes.find((item) => point.x >= item.x && point.x <= item.x + item.w && point.y >= item.y && point.y <= item.y + item.h);
    return box ? box.id : null;
  }
  function attemptBoardPoint(x, y) {
    if (state.selected === null || state.finished) {
      feedback('Selecciona primero una pieza de la bandeja.', false);
      return;
    }
    const col = clamp(Math.floor(x / (BOARD_W / state.cols)), 0, state.cols - 1);
    const row = clamp(Math.floor(y / (BOARD_H / state.rows)), 0, state.rows - 1);
    const targetId = row * state.cols + col;
    if (targetId === state.selected) placeSelected();
    else wrongPlacement();
  }
  function attemptFromEvent(event) {
    const point = canvasPoint(els.board, event);
    attemptBoardPoint(point.x, point.y);
  }

  function placeSelected() {
    const id = state.selected;
    const piece = pieceMap.get(id);
    if (id === null || !piece || state.placed.has(id)) return;
    state.placed.add(id);
    state.score += 100;
    state.selected = null;
    if (state.hinted === id) clearHint();
    drawPlacedPiece(piece);
    drawBoard();
    drawTray();
    updateHud();
    feedback('¡Encaja! Pieza colocada correctamente.', true);
    saveProgress();
    if (state.placed.size >= state.pieceCount) window.setTimeout(finishGame, 450);
  }
  function wrongPlacement() {
    els.board.classList.remove('is-wrong');
    void els.board.offsetWidth;
    els.board.classList.add('is-wrong');
    feedback('Ese no es su lugar. Observa colores, bordes y formas.', false);
  }
  function feedback(message, ok) {
    els.boardFeedback.textContent = message;
    els.boardFeedback.className = `board-feedback show ${ok ? 'ok' : 'bad'}`;
    if (feedbackId) clearTimeout(feedbackId);
    feedbackId = window.setTimeout(() => { els.boardFeedback.className = 'board-feedback'; }, 2200);
  }

  function useHint() {
    const remaining = unplacedIds();
    if (!remaining.length || state.finished) return;
    const id = state.selected !== null ? state.selected : (visibleIds()[0] ?? remaining[0]);
    state.selected = id;
    state.hinted = id;
    state.hints += 1;
    state.score = Math.max(0, state.score - 25);
    drawTray();
    drawBoard();
    updateHud();
    feedback('Pista activa: la silueta verde marca el destino.', true);
    els.instruction.textContent = 'La silueta verde indica dónde colocar la pieza seleccionada.';
    if (hintId) clearTimeout(hintId);
    hintId = window.setTimeout(clearHint, 6000);
    saveProgress();
  }
  function clearHint() {
    if (hintId) clearTimeout(hintId);
    hintId = null;
    state.hinted = null;
    drawBoard();
  }

  function finishGame() {
    if (state.finished) return;
    state.finished = true;
    commitElapsed();
    state.active = false;
    stopTimers();
    clearHint();
    clearProgress();
    const record = registerResult(state.player, state.score);
    els.resultPlayer.textContent = state.player;
    els.resultPieces.textContent = String(state.pieceCount);
    els.resultTime.textContent = state.timerEnabled ? formatTime(state.elapsed) : 'Sin tiempo';
    els.resultHints.textContent = String(state.hints);
    els.resultScore.textContent = String(state.score);
    els.victory.textContent = `VICTORIA REGISTRADA · ${record.wins} ${record.wins === 1 ? 'victoria' : 'victorias'} EN CIBERAULA`;
    showScreen('results');
  }

  function saveAndExit() {
    if (!state.active) return;
    commitElapsed();
    stopTimers();
    saveProgress();
    state.active = false;
    showScreen('intro');
    els.player.value = state.player;
    updateSnapshot();
    els.player.focus();
  }

  function applyZoom() {
    els.board.style.width = `${Math.round(state.zoom * 100)}%`;
    els.zoomText.textContent = `${Math.round(state.zoom * 100)}%`;
    els.zoomOut.disabled = state.zoom <= .75;
    els.zoomIn.disabled = state.zoom >= 2.5;
  }
  function changeZoom(delta) {
    state.zoom = clamp(Math.round((state.zoom + delta) * 100) / 100, .75, 2.5);
    applyZoom();
  }

  function renderScore() {
    const rows = Object.values(loadScore()).filter((record) => record && record.name)
      .sort((a, b) => (Number(b.wins || 0) - Number(a.wins || 0)) || (Number(b.totalPoints || 0) - Number(a.totalPoints || 0)));
    els.scoreList.replaceChildren();
    els.emptyScore.hidden = rows.length > 0;
    const maxWins = Math.max(5, ...rows.map((record) => Number(record.wins || 0)));
    rows.forEach((record, index) => {
      const row = document.createElement('article');
      row.className = 'score-row';
      const rank = document.createElement('span');
      rank.className = 'score-rank';
      rank.textContent = String(index + 1).padStart(2, '0');
      const body = document.createElement('div');
      const top = document.createElement('div');
      top.className = 'score-top';
      const name = document.createElement('strong');
      name.textContent = record.name;
      const wins = document.createElement('b');
      wins.textContent = `${record.wins || 0} ${Number(record.wins) === 1 ? 'victoria' : 'victorias'}`;
      top.append(name, wins);
      const bar = document.createElement('span');
      bar.className = 'score-bar';
      const fill = document.createElement('i');
      fill.style.width = `${Math.min(100, Number(record.wins || 0) / maxWins * 100)}%`;
      bar.append(fill);
      const meta = document.createElement('small');
      meta.textContent = `${record.games || 0} partidas · ${record.totalPoints || 0} puntos · mejor ${record.bestPercent || 0}%`;
      body.append(top, bar, meta);
      row.append(rank, body);
      els.scoreList.append(row);
    });
  }
  function openScore() {
    lastFocus = document.activeElement;
    renderScore();
    els.scorePanel.hidden = false;
    els.scorePanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    els.closeScore.focus();
  }
  function closeScore() {
    els.scorePanel.hidden = true;
    els.scorePanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocus?.focus();
  }

  els.form.addEventListener('submit', (event) => { event.preventDefault(); beginNew().catch(() => window.alert('No fue posible cargar la imagen del rompecabezas.')); });
  els.player.addEventListener('input', updateSnapshot);
  els.resume.addEventListener('click', () => resumeGame().catch(() => window.alert('No fue posible cargar la partida guardada.')));
  els.saveExit.addEventListener('click', saveAndExit);
  els.hint.addEventListener('click', useHint);
  els.restart.addEventListener('click', () => { showScreen('intro'); updateSnapshot(); els.player.focus(); });
  els.zoomOut.addEventListener('click', () => changeZoom(-.25));
  els.zoomIn.addEventListener('click', () => changeZoom(.25));
  els.prev.addEventListener('click', () => { state.page = Math.max(0, state.page - 1); drawTray(); });
  els.next.addEventListener('click', () => { state.page = Math.min(pageCount() - 1, state.page + 1); drawTray(); });

  els.tray.addEventListener('pointerdown', (event) => {
    const id = trayPieceAt(event);
    if (id === null) return;
    draggingId = id;
    selectPiece(id);
    els.tray.setPointerCapture?.(event.pointerId);
  });
  els.tray.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    const id = visibleIds()[0];
    if (id !== undefined) selectPiece(id);
  });
  els.board.addEventListener('pointerup', (event) => {
    event.preventDefault();
    attemptFromEvent(event);
  });
  els.board.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'h') { event.preventDefault(); useHint(); }
  });
  window.addEventListener('pointerup', (event) => {
    if (draggingId === null) return;
    const rect = els.board.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (inside && state.selected !== null) attemptFromEvent(event);
    draggingId = null;
  });

  [els.scoreBtn, els.resultScoreBtn].forEach((button) => button.addEventListener('click', openScore));
  els.closeScore.addEventListener('click', closeScore);
  els.scorePanel.addEventListener('click', (event) => { if (event.target === els.scorePanel) closeScore(); });
  els.full.addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.scorePanel.hidden) closeScore();
  });
  window.addEventListener('beforeunload', () => { if (state.active && !state.finished) saveProgress(); });

  try { els.player.value = localStorage.getItem(LAST_PLAYER_KEY) || ''; } catch (_) { /* almacenamiento opcional */ }
  updateSnapshot();
  updateHud();
})();
