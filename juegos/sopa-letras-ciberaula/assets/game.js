(() => {
  'use strict';

  const SCORE_KEY = 'ciberaula:score:v1';
  const LAST_PLAYER_KEY = 'ciberaula:last-player';
  const LEVELS = { 20: 16, 30: 18, 40: 20, 50: 22 };
  const DIRECTIONS = [
    [-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]
  ];
  const FILL_LETTERS = 'AAABCDEEEFGHIIIJKLMNNOOOPQRSTUUVWXYZ';
  const WORDS = [
    'ANTIVIRUS','CIFRADO','FIREWALL','PHISHING','MALWARE','RANSOMWARE','CONTRASEÑA','AUTENTICACIÓN','DOBLE FACTOR','PRIVACIDAD',
    'RESPALDO','ACTUALIZACIÓN','VULNERABILIDAD','AMENAZA','RIESGO','INCIDENTE','HASH','TOKEN','BIOMETRÍA','VPN',
    'SPAM','BOTNET','TROYANO','GUSANO','ADWARE','SPYWARE','INGENIERÍA SOCIAL','CIBERACOSO','SUPLANTACIÓN','IDENTIDAD',
    'METADATOS','COOKIES','NAVEGADOR','SERVIDOR','RED SEGURA','WIFI','HTTPS','CERTIFICADO','CLAVE PÚBLICA','CLAVE PRIVADA',
    'CRIPTOGRAFÍA','SEGURIDAD','ALERTAS','PERMISOS','DESCARGA','ENLACE','ARCHIVO','ACCESO','DATOS','CONFIANZA CERO'
  ].map((display, index) => ({ id: `w${index + 1}`, display, grid: normalizeWord(display) }));

  const $ = (selector) => document.querySelector(selector);
  const els = {
    intro: $('#intro'), game: $('#game'), setupForm: $('#setupForm'), playerName: $('#playerName'), nameError: $('#nameError'),
    recordText: $('#recordText'), scoreBtn: $('#scoreBtn'), exitBtn: $('#exitBtn'), hudPlayer: $('#hudPlayer'),
    foundCount: $('#foundCount'), totalCount: $('#totalCount'), scoreValue: $('#scoreValue'), timeValue: $('#timeValue'),
    progressBar: $('#progressBar'), grid: $('#wordGrid'), boardShell: $('.board-shell'), selectionStatus: $('#selectionStatus'),
    wordList: $('#wordList'), remainingText: $('#remainingText'), completionModal: $('#completionModal'), confetti: $('#confetti'),
    resultPlayer: $('#resultPlayer'), resultWords: $('#resultWords'), resultTime: $('#resultTime'), resultScore: $('#resultScore'),
    victoryLine: $('#victoryLine'), playAgainBtn: $('#playAgainBtn'), resultScoreBtn: $('#resultScoreBtn'), scoreModal: $('#scoreModal'),
    closeScoreBtn: $('#closeScoreBtn'), scoreList: $('#scoreList'), emptyScore: $('#emptyScore')
  };

  let state = freshState();
  let lastFocus = null;
  let statusTimer = null;

  function freshState() {
    return {
      active: false, finished: false, player: '', count: 20, size: 16, matrix: [], placements: [], found: new Set(),
      score: 0, elapsed: 0, timer: null, startedAt: 0, drag: null, tapAnchor: null
    };
  }

  function normalizeWord(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z]/g, '').toUpperCase();
  }
  const normalizeName = (name) => String(name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const playerKey = (name) => normalizeName(name).toLocaleLowerCase('es');
  const cellKey = (cell) => `${cell.r}:${cell.c}`;
  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

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

  function updateRecordPreview() {
    const name = normalizeName(els.playerName.value);
    if (!name) { els.recordText.textContent = 'Sin partidas registradas'; return; }
    const record = getRecord(name);
    els.recordText.textContent = record.games ? `${record.wins} victorias · ${record.totalPoints} puntos` : 'Jugador nuevo';
  }

  function buildPuzzle(words, size) {
    const ordered = [...words].sort((a, b) => b.grid.length - a.grid.length);
    for (let restart = 0; restart < 90; restart += 1) {
      const matrix = Array.from({ length: size }, () => Array(size).fill(''));
      const placements = [];
      let failed = false;
      for (const word of ordered) {
        const candidates = [];
        for (const [dr, dc] of DIRECTIONS) {
          for (let r = 0; r < size; r += 1) {
            for (let c = 0; c < size; c += 1) {
              const endR = r + dr * (word.grid.length - 1);
              const endC = c + dc * (word.grid.length - 1);
              if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
              const cells = [];
              let overlap = 0;
              let valid = true;
              for (let i = 0; i < word.grid.length; i += 1) {
                const rr = r + dr * i, cc = c + dc * i;
                const existing = matrix[rr][cc];
                if (existing && existing !== word.grid[i]) { valid = false; break; }
                if (existing === word.grid[i]) overlap += 1;
                cells.push({ r: rr, c: cc });
              }
              if (valid) candidates.push({ cells, overlap, tie: Math.random() });
            }
          }
        }
        if (!candidates.length) { failed = true; break; }
        candidates.sort((a, b) => b.overlap - a.overlap || b.tie - a.tie);
        const bestOverlap = candidates[0].overlap;
        const shortlist = candidates.filter((item) => item.overlap >= Math.max(0, bestOverlap - 1)).slice(0, 80);
        const chosen = shortlist[Math.floor(Math.random() * shortlist.length)];
        chosen.cells.forEach((cell, index) => { matrix[cell.r][cell.c] = word.grid[index]; });
        placements.push({ ...word, cells: chosen.cells });
      }
      if (failed) continue;
      for (let r = 0; r < size; r += 1) {
        for (let c = 0; c < size; c += 1) {
          if (!matrix[r][c]) matrix[r][c] = FILL_LETTERS[Math.floor(Math.random() * FILL_LETTERS.length)];
        }
      }
      return { matrix, placements };
    }
    throw new Error('No fue posible construir la matriz. Intenta iniciar una nueva partida.');
  }

  function startGame(event) {
    event.preventDefault();
    const player = normalizeName(els.playerName.value);
    if (!player) {
      els.playerName.setAttribute('aria-invalid', 'true');
      els.nameError.hidden = false;
      els.playerName.focus();
      return;
    }
    const count = Number(new FormData(els.setupForm).get('wordCount')) || 20;
    try {
      const selected = shuffle(WORDS).slice(0, count);
      const built = buildPuzzle(selected, LEVELS[count]);
      stopTimer();
      state = freshState();
      Object.assign(state, { active: true, player, count, size: LEVELS[count], matrix: built.matrix, placements: built.placements, startedAt: Date.now() });
      try { localStorage.setItem(LAST_PLAYER_KEY, player); } catch (_) { /* almacenamiento opcional */ }
      els.playerName.removeAttribute('aria-invalid');
      els.nameError.hidden = true;
      els.hudPlayer.textContent = player;
      renderGrid();
      renderWords();
      updateHud();
      showScreen('game');
      startTimer();
      setStatus('Arrastra en línea recta desde la primera letra.');
      requestAnimationFrame(fitGrid);
    } catch (error) {
      els.nameError.hidden = false;
      els.nameError.textContent = error.message;
    }
  }

  function showScreen(name) {
    [els.intro, els.game].forEach((screen) => screen.classList.remove('active'));
    els[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderGrid() {
    els.grid.replaceChildren();
    els.grid.style.setProperty('--grid-size', state.size);
    const fragment = document.createDocumentFragment();
    state.matrix.forEach((row, r) => row.forEach((letter, c) => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Fila ${r + 1}, columna ${c + 1}: ${letter}`);
      cell.textContent = letter;
      fragment.appendChild(cell);
    }));
    els.grid.appendChild(fragment);
  }

  function renderWords() {
    els.wordList.replaceChildren();
    [...state.placements].sort((a,b) => a.display.localeCompare(b.display, 'es')).forEach((word) => {
      const item = document.createElement('li');
      item.dataset.wordId = word.id;
      item.textContent = word.display;
      els.wordList.appendChild(item);
    });
  }

  function fitGrid() {
    if (!state.active || !els.boardShell.clientWidth) return;
    const available = Math.max(250, els.boardShell.clientWidth - 24);
    const size = Math.max(14, Math.min(34, Math.floor(available / state.size)));
    els.grid.style.setProperty('--cell-size', `${size}px`);
  }

  function startTimer() {
    stopTimer();
    state.timer = window.setInterval(() => {
      if (!state.active || state.finished) return;
      state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      els.timeValue.textContent = formatTime(state.elapsed);
    }, 1000);
  }
  function stopTimer() {
    if (state.timer) window.clearInterval(state.timer);
    state.timer = null;
  }

  function updateHud() {
    const found = state.found.size;
    els.foundCount.textContent = found;
    els.totalCount.textContent = state.count;
    els.scoreValue.textContent = state.score;
    els.progressBar.style.width = `${Math.round(found / state.count * 100)}%`;
    const remaining = state.count - found;
    els.remainingText.textContent = `${remaining} ${remaining === 1 ? 'PENDIENTE' : 'PENDIENTES'}`;
  }

  function cellFromTarget(target) {
    const element = target && target.closest ? target.closest('.grid-cell') : null;
    if (!element || !els.grid.contains(element)) return null;
    return { r: Number(element.dataset.row), c: Number(element.dataset.col) };
  }
  function cellFromPoint(x, y) {
    return cellFromTarget(document.elementFromPoint(x, y));
  }
  function lineBetween(start, end) {
    const drRaw = end.r - start.r, dcRaw = end.c - start.c;
    if (drRaw === 0 && dcRaw === 0) return [start];
    if (!(drRaw === 0 || dcRaw === 0 || Math.abs(drRaw) === Math.abs(dcRaw))) return null;
    const length = Math.max(Math.abs(drRaw), Math.abs(dcRaw));
    const dr = Math.sign(drRaw), dc = Math.sign(dcRaw);
    return Array.from({ length: length + 1 }, (_, i) => ({ r: start.r + dr * i, c: start.c + dc * i }));
  }
  function getCellElement(cell) {
    return els.grid.querySelector(`[data-row="${cell.r}"][data-col="${cell.c}"]`);
  }
  function clearPreview() {
    els.grid.querySelectorAll('.preview').forEach((cell) => cell.classList.remove('preview'));
  }
  function clearAnchor() {
    els.grid.querySelectorAll('.anchor').forEach((cell) => cell.classList.remove('anchor'));
  }
  function paintPreview(cells) {
    clearPreview();
    (cells || []).forEach((cell) => getCellElement(cell)?.classList.add('preview'));
  }

  function onPointerDown(event) {
    if (!state.active || state.finished || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const start = cellFromTarget(event.target);
    if (!start) return;
    event.preventDefault();
    state.drag = { pointerId: event.pointerId, start, end: start, moved: false, x: event.clientX, y: event.clientY };
    try { els.grid.setPointerCapture(event.pointerId); } catch (_) { /* captura opcional */ }
    paintPreview([start]);
  }

  function onPointerMove(event) {
    if (!state.drag || state.drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    if (Math.hypot(event.clientX - state.drag.x, event.clientY - state.drag.y) > 5) state.drag.moved = true;
    const end = cellFromPoint(event.clientX, event.clientY);
    if (!end) return;
    const line = lineBetween(state.drag.start, end);
    if (line) {
      state.drag.end = end;
      paintPreview(line);
      setStatus(`${line.length} letras seleccionadas`, false);
    } else {
      paintPreview([state.drag.start]);
      setStatus('Mantén una línea horizontal, vertical o diagonal.', false);
    }
  }

  function onPointerUp(event) {
    if (!state.drag || state.drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const drag = state.drag;
    state.drag = null;
    try { els.grid.releasePointerCapture(event.pointerId); } catch (_) { /* captura opcional */ }
    const end = cellFromPoint(event.clientX, event.clientY) || drag.end;
    if (!drag.moved) {
      clearPreview();
      if (state.tapAnchor) {
        const path = lineBetween(state.tapAnchor, end);
        state.tapAnchor = null;
        clearAnchor();
        validateSelection(path);
      } else {
        state.tapAnchor = drag.start;
        clearAnchor();
        getCellElement(drag.start)?.classList.add('anchor');
        setStatus('Primera letra marcada. Toca ahora la última letra.');
      }
      return;
    }
    state.tapAnchor = null;
    clearAnchor();
    validateSelection(lineBetween(drag.start, end));
  }

  function validateSelection(cells) {
    clearPreview();
    if (!cells || cells.length < 2) { setStatus('Selección no válida. Intenta de nuevo.', true); return; }
    const signature = cells.map(cellKey).join('|');
    const reverse = [...cells].reverse().map(cellKey).join('|');
    const word = state.placements.find((item) => {
      if (state.found.has(item.id)) return false;
      const answer = item.cells.map(cellKey).join('|');
      return answer === signature || answer === reverse;
    });
    if (!word) { setStatus('Esa secuencia no está en la lista.', true); return; }
    discoverWord(word);
  }

  function discoverWord(word) {
    state.found.add(word.id);
    const points = 100 + word.grid.length * 5;
    state.score += points;
    word.cells.forEach((cell) => {
      const element = getCellElement(cell);
      element?.classList.add('found', 'new-found');
      window.setTimeout(() => element?.classList.remove('new-found'), 550);
    });
    els.wordList.querySelector(`[data-word-id="${word.id}"]`)?.classList.add('found');
    setStatus(`¡${word.display} descubierta! +${points} puntos`);
    updateHud();
    if (state.found.size === state.count) window.setTimeout(finishGame, 650);
  }

  function setStatus(message, reset = true) {
    els.selectionStatus.textContent = message;
    if (statusTimer) window.clearTimeout(statusTimer);
    if (reset) statusTimer = window.setTimeout(() => {
      if (state.active && !state.finished) els.selectionStatus.textContent = 'Arrastra en línea recta desde la primera letra.';
    }, 2600);
  }

  function finishGame() {
    if (state.finished) return;
    state.finished = true;
    state.active = false;
    stopTimer();
    state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    const completionBonus = state.count * 25;
    const speedWindow = state.count * 22;
    const speedBonus = Math.max(0, speedWindow - state.elapsed) * 2;
    state.score += completionBonus + speedBonus;
    updateHud();
    els.timeValue.textContent = formatTime(state.elapsed);
    const record = registerResult(state.player, state.score);
    els.resultPlayer.textContent = state.player;
    els.resultWords.textContent = `${state.count}/${state.count}`;
    els.resultTime.textContent = formatTime(state.elapsed);
    els.resultScore.textContent = state.score;
    els.victoryLine.textContent = `VICTORIA REGISTRADA · ${record.wins} ${record.wins === 1 ? 'VICTORIA' : 'VICTORIAS'} EN CIBERAULA`;
    buildConfetti();
    lastFocus = document.activeElement;
    els.completionModal.hidden = false;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => els.playAgainBtn.focus(), 50);
  }

  function buildConfetti() {
    els.confetti.replaceChildren();
    const colors = ['#58e8ff','#70f5ad','#ff3d7f','#ffffff'];
    for (let i = 0; i < 48; i += 1) {
      const piece = document.createElement('i');
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty('--confetti', colors[i % colors.length]);
      piece.style.setProperty('--duration', `${3 + Math.random() * 4}s`);
      piece.style.setProperty('--delay', `${-Math.random() * 6}s`);
      piece.style.setProperty('--rotate', `${Math.random() * 180}deg`);
      piece.style.setProperty('--drift', `${-90 + Math.random() * 180}px`);
      els.confetti.appendChild(piece);
    }
  }

  function returnToIntro() {
    stopTimer();
    state.active = false;
    state.finished = false;
    els.completionModal.hidden = true;
    els.scoreModal.hidden = true;
    document.body.style.overflow = '';
    showScreen('intro');
    updateRecordPreview();
    els.playerName.focus();
  }

  function exitGame() {
    if (state.active && !window.confirm('¿Salir de la partida actual? El progreso de esta matriz no se guardará.')) return;
    returnToIntro();
  }

  function renderScore() {
    const rows = Object.values(loadScore()).filter((record) => record && record.name)
      .sort((a,b) => Number(b.wins || 0) - Number(a.wins || 0) || Number(b.totalPoints || 0) - Number(a.totalPoints || 0));
    els.scoreList.replaceChildren();
    els.emptyScore.hidden = rows.length > 0;
    rows.forEach((record, index) => {
      const row = document.createElement('article');
      row.className = 'score-row';
      const rank = document.createElement('span'); rank.className = 'score-rank'; rank.textContent = String(index + 1).padStart(2,'0');
      const info = document.createElement('div');
      const name = document.createElement('strong'); name.textContent = record.name;
      const detail = document.createElement('small'); detail.textContent = `${Number(record.wins || 0)} victorias · ${Number(record.games || 0)} partidas · mejor ${Number(record.bestPercent || 0)}%`;
      info.append(name, detail);
      const points = document.createElement('span'); points.className = 'score-points'; points.textContent = `${Number(record.totalPoints || 0)} pts`;
      row.append(rank, info, points);
      els.scoreList.appendChild(row);
    });
  }
  function openScore() {
    renderScore();
    lastFocus = document.activeElement;
    els.scoreModal.hidden = false;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => els.closeScoreBtn.focus(), 30);
  }
  function closeScore() {
    els.scoreModal.hidden = true;
    if (els.completionModal.hidden) document.body.style.overflow = '';
    lastFocus?.focus?.();
  }

  els.setupForm.addEventListener('submit', startGame);
  els.playerName.addEventListener('input', () => {
    els.playerName.removeAttribute('aria-invalid');
    els.nameError.hidden = true;
    els.nameError.textContent = 'Escribe un nombre para registrar el score.';
    updateRecordPreview();
  });
  els.grid.addEventListener('pointerdown', onPointerDown);
  els.grid.addEventListener('pointermove', onPointerMove);
  els.grid.addEventListener('pointerup', onPointerUp);
  els.grid.addEventListener('pointercancel', () => { state.drag = null; clearPreview(); });
  els.exitBtn.addEventListener('click', exitGame);
  els.scoreBtn.addEventListener('click', openScore);
  els.resultScoreBtn.addEventListener('click', openScore);
  els.closeScoreBtn.addEventListener('click', closeScore);
  els.scoreModal.addEventListener('click', (event) => { if (event.target === els.scoreModal) closeScore(); });
  els.playAgainBtn.addEventListener('click', returnToIntro);
  window.addEventListener('resize', () => requestAnimationFrame(fitGrid));
  window.addEventListener('beforeunload', stopTimer);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!els.scoreModal.hidden) closeScore();
    else if (state.tapAnchor) { state.tapAnchor = null; clearAnchor(); setStatus('Selección cancelada.'); }
  });

  try { els.playerName.value = localStorage.getItem(LAST_PLAYER_KEY) || ''; } catch (_) { /* almacenamiento opcional */ }
  updateRecordPreview();
  if (location.hash === '#score') window.setTimeout(openScore, 0);
})();
