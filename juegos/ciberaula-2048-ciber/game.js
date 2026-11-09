(() => {
  'use strict';

  const STORAGE_KEY = 'ciberaula.ciber2048.players.v1';
  const LAST_PLAYER_KEY = 'ciberaula.ciber2048.lastPlayer.v1';
  const SIZE = 4;

  const POWERS = {
    2:    { name: 'Contraseña fuerte', short: 'Clave fuerte', icon: '🔑' },
    4:    { name: 'Firewall', short: 'Firewall', icon: '🔥' },
    8:    { name: 'Autenticación MFA', short: 'MFA', icon: '📲' },
    16:   { name: 'Gestor de claves', short: 'Gestor', icon: '🗝️' },
    32:   { name: 'Escudo antiphishing', short: 'Antiphishing', icon: '🎣' },
    64:   { name: 'VPN segura', short: 'VPN', icon: '🌐' },
    128:  { name: 'Cifrado de datos', short: 'Cifrado', icon: '🔐' },
    256:  { name: 'Copia de seguridad', short: 'Backup', icon: '💾' },
    512:  { name: 'Protección EDR', short: 'EDR', icon: '🧬' },
    1024: { name: 'Confianza cero', short: 'Zero Trust', icon: '🛰️' },
    2048: { name: 'Centro de operaciones SOC', short: 'SOC Maestro', icon: '🛡️' },
    4096: { name: 'Ciberresiliencia', short: 'Ciberresiliencia', icon: '⚡' }
  };

  const TIPS = [
    { tag: 'CONTRASEÑAS', title: 'Haz cada clave única', text: 'Usa frases largas y diferentes para cada servicio. Un gestor de contraseñas puede crearlas y recordarlas por ti.' },
    { tag: 'MFA', title: 'Activa una segunda barrera', text: 'Habilita autenticación multifactor. Una app autenticadora o una llave física protegen mejor que un SMS.' },
    { tag: 'PHISHING', title: 'Detente antes de hacer clic', text: 'Verifica remitente, dominio y tono. Si un mensaje genera urgencia, confirma la solicitud por otro canal.' },
    { tag: 'ACTUALIZACIONES', title: 'Corrige antes de que ataquen', text: 'Mantén sistema, navegador y aplicaciones actualizados. Activa las actualizaciones automáticas cuando sea posible.' },
    { tag: 'WI-FI', title: 'Evita redes abiertas', text: 'No ingreses datos sensibles en Wi-Fi público. Prefiere tus datos móviles o usa una VPN confiable.' },
    { tag: 'BACKUP', title: 'Conserva una copia recuperable', text: 'Aplica la regla 3-2-1: tres copias, en dos medios distintos y una fuera de línea o fuera del sitio.' },
    { tag: 'PRIVACIDAD', title: 'Comparte solo lo necesario', text: 'Revisa permisos de aplicaciones y la audiencia de tus publicaciones. Los atacantes aprovechan datos personales.' },
    { tag: 'DISPOSITIVOS', title: 'Bloquea tu pantalla', text: 'Usa PIN o biometría y configura el bloqueo automático. Nunca dejes un equipo desbloqueado sin supervisión.' },
    { tag: 'DESCARGAS', title: 'Instala desde fuentes oficiales', text: 'Evita programas piratas, adjuntos inesperados y tiendas no oficiales. Analiza los archivos antes de abrirlos.' },
    { tag: 'INCIDENTES', title: 'Reportar rápido limita el daño', text: 'Si algo parece extraño, desconecta el equipo de la red y avisa al equipo de soporte o seguridad.' },
    { tag: 'DATOS', title: 'Cifra la información sensible', text: 'Usa canales autorizados y cifrado para almacenar o enviar información confidencial. No la copies a nubes personales.' },
    { tag: 'ZERO TRUST', title: 'Verifica siempre', text: 'No confíes solo porque una solicitud viene de dentro. Confirma identidad, contexto y nivel de acceso requerido.' }
  ];

  const $ = (selector) => document.querySelector(selector);
  const boardEl = $('#tablero');
  const motionLayer = $('#motionLayer');
  const overlayEl = $('#gameOverlay');
  const playerModal = $('#playerModal');
  const confirmModal = $('#confirmModal');

  let database = loadDatabase();
  let playerKey = '';
  let profile = null;
  let state = null;
  let undoState = null;
  let tipIndex = 0;
  let touchStart = null;
  let isAnimating = false;

  function emptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function newState() {
    const next = { board: emptyBoard(), score: 0, won: false, keepPlaying: false, gameOver: false };
    addRandomTile(next.board);
    addRandomTile(next.board);
    return next;
  }

  function safeState(candidate) {
    const validBoard = candidate && Array.isArray(candidate.board) && candidate.board.length === SIZE &&
      candidate.board.every(row => Array.isArray(row) && row.length === SIZE && row.every(Number.isFinite));
    if (!validBoard) return newState();
    return {
      board: candidate.board.map(row => row.map(value => Math.max(0, Number(value) || 0))),
      score: Math.max(0, Number(candidate.score) || 0),
      won: Boolean(candidate.won),
      keepPlaying: Boolean(candidate.keepPlaying),
      gameOver: Boolean(candidate.gameOver)
    };
  }

  function loadDatabase() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function saveDatabase() {
    if (!profile || !playerKey) return;
    database[playerKey] = profile;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
      localStorage.setItem(LAST_PLAYER_KEY, playerKey);
    } catch (_) {
      // El juego sigue funcionando aunque el navegador bloquee el almacenamiento.
    }
  }

  function cleanName(value) {
    return String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
  }

  function selectPlayer(name) {
    const cleaned = cleanName(name);
    if (cleaned.length < 2) return false;
    playerKey = cleaned.toLocaleLowerCase('es');
    const saved = database[playerKey] || {};
    profile = {
      name: cleaned,
      totalScore: Math.max(0, Number(saved.totalScore) || 0),
      bestScore: Math.max(0, Number(saved.bestScore) || 0),
      maxTile: Math.max(2, Number(saved.maxTile) || 2),
      game: saved.game ? safeState(saved.game) : newState()
    };
    profile.name = cleaned;
    state = profile.game;
    undoState = null;
    saveDatabase();
    playerModal.hidden = true;
    render();
    boardEl.focus({ preventScroll: true });
    return true;
  }

  function addRandomTile(board) {
    const empty = [];
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) if (!board[row][col]) empty.push([row, col]);
    }
    if (!empty.length) return null;
    const [row, col] = empty[Math.floor(Math.random() * empty.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    board[row][col] = value;
    return { row, col, value };
  }

  function powerFor(value) {
    if (POWERS[value]) return POWERS[value];
    if (value > 2048) return POWERS[4096];
    return POWERS[2];
  }

  function flatten(board) {
    return board.reduce((all, row) => all.concat(row), []);
  }

  function highestTile(board = state.board) {
    return Math.max(...flatten(board), 2);
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('es-CO');
  }

  function getLine(board, direction, index) {
    if (direction === 'left') return [...board[index]];
    if (direction === 'right') return [...board[index]].reverse();
    if (direction === 'up') return board.map(row => row[index]);
    return board.map(row => row[index]).reverse();
  }

  function setLine(board, direction, index, line) {
    if (direction === 'left') board[index] = [...line];
    else if (direction === 'right') board[index] = [...line].reverse();
    else if (direction === 'up') line.forEach((value, row) => { board[row][index] = value; });
    else [...line].reverse().forEach((value, row) => { board[row][index] = value; });
  }

  function mergeLine(line) {
    const compact = line.filter(Boolean);
    const merged = [];
    let gain = 0;
    for (let index = 0; index < compact.length; index++) {
      if (compact[index] === compact[index + 1]) {
        const value = compact[index] * 2;
        merged.push(value);
        gain += value;
        index++;
      } else {
        merged.push(compact[index]);
      }
    }
    while (merged.length < SIZE) merged.push(0);
    return { line: merged, gain };
  }

  function coordinateFor(direction, lineIndex, position) {
    if (direction === 'left') return { row: lineIndex, col: position };
    if (direction === 'right') return { row: lineIndex, col: SIZE - 1 - position };
    if (direction === 'up') return { row: position, col: lineIndex };
    return { row: SIZE - 1 - position, col: lineIndex };
  }

  function createMovePlan(board, direction) {
    const next = emptyBoard();
    const transitions = [];
    const mergedTargets = [];
    let gain = 0;

    for (let lineIndex = 0; lineIndex < SIZE; lineIndex++) {
      const entries = [];
      for (let position = 0; position < SIZE; position++) {
        const source = coordinateFor(direction, lineIndex, position);
        const value = board[source.row][source.col];
        if (value) entries.push({ ...source, value });
      }

      let targetPosition = 0;
      for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const current = entries[entryIndex];
        const target = coordinateFor(direction, lineIndex, targetPosition);
        const pair = entries[entryIndex + 1];

        if (pair && pair.value === current.value) {
          const value = current.value * 2;
          next[target.row][target.col] = value;
          transitions.push({ from: current, to: target, merged: true });
          transitions.push({ from: pair, to: target, merged: true });
          mergedTargets.push(target);
          gain += value;
          entryIndex++;
        } else {
          next[target.row][target.col] = current.value;
          transitions.push({ from: current, to: target, merged: false });
        }
        targetPosition++;
      }
    }

    return { board: next, transitions, mergedTargets, gain };
  }

  function captureMotionTiles(transitions) {
    if (!motionLayer || !boardEl.children.length) return [];
    const layerRect = motionLayer.getBoundingClientRect();
    return transitions.map(transition => {
      const index = transition.from.row * SIZE + transition.from.col;
      const source = boardEl.children[index];
      if (!source || source.classList.contains('empty')) return null;
      const rect = source.getBoundingClientRect();
      const clone = source.cloneNode(true);
      clone.classList.add('motion-tile');
      clone.removeAttribute('role');
      clone.removeAttribute('aria-label');
      Object.assign(clone.style, {
        left: `${rect.left - layerRect.left}px`,
        top: `${rect.top - layerRect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
      return { clone, transition };
    }).filter(Boolean);
  }

  function finishTileEffects() {
    boardEl.classList.remove('is-animating');
    boardEl.querySelectorAll('[data-effect]').forEach(tile => {
      const className = `tile-${tile.dataset.effect}`;
      tile.removeAttribute('data-effect');
      tile.classList.add(className);
      setTimeout(() => tile.classList.remove(className), 420);
    });
  }

  function animateMove(captured) {
    if (!captured.length || !motionLayer) {
      finishTileEffects();
      return Promise.resolve();
    }

    boardEl.classList.add('is-animating');
    motionLayer.innerHTML = '';
    const layerRect = motionLayer.getBoundingClientRect();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animations = captured.map(({ clone, transition }) => {
      const targetIndex = transition.to.row * SIZE + transition.to.col;
      const targetRect = boardEl.children[targetIndex].getBoundingClientRect();
      const currentLeft = parseFloat(clone.style.left);
      const currentTop = parseFloat(clone.style.top);
      const dx = targetRect.left - layerRect.left - currentLeft;
      const dy = targetRect.top - layerRect.top - currentTop;
      motionLayer.appendChild(clone);
      const distance = Math.hypot(dx, dy);
      const duration = reduceMotion ? 1 : Math.min(330, 205 + distance * .16);
      const frames = [
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
        { transform: `translate3d(${dx}px,${dy}px,0) scale(${transition.merged ? .94 : 1})`, opacity: transition.merged ? .82 : 1 }
      ];
      const timing = {
        duration,
        easing: 'cubic-bezier(.22,.72,.2,1)',
        fill: 'forwards'
      };
      if (typeof clone.animate === 'function') {
        return clone.animate(frames, timing).finished.catch(() => undefined);
      }
      return new Promise(resolve => {
        clone.style.transition = `transform ${duration}ms ${timing.easing}, opacity ${duration}ms ${timing.easing}`;
        requestAnimationFrame(() => Object.assign(clone.style, frames[1]));
        setTimeout(resolve, duration + 30);
      });
    });

    return Promise.all(animations).then(() => {
      motionLayer.innerHTML = '';
      finishTileEffects();
    });
  }

  function boardsEqual(a, b) {
    return a.every((row, r) => row.every((value, c) => value === b[r][c]));
  }

  function canMove(board) {
    if (flatten(board).includes(0)) return true;
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (col + 1 < SIZE && board[row][col] === board[row][col + 1]) return true;
        if (row + 1 < SIZE && board[row][col] === board[row + 1][col]) return true;
      }
    }
    return false;
  }

  function move(direction) {
    if (!state || isAnimating || state.gameOver || !playerModal.hidden || !confirmModal.hidden || !overlayEl.hidden) return;
    const before = state.board.map(row => [...row]);
    const plan = createMovePlan(before, direction);
    const next = plan.board;
    const gain = plan.gain;

    if (boardsEqual(before, next)) return;
    const captured = captureMotionTiles(plan.transitions);

    undoState = {
      board: before,
      score: state.score,
      won: state.won,
      keepPlaying: state.keepPlaying,
      gameOver: state.gameOver,
      gain
    };

    state.board = next;
    state.score += gain;
    profile.totalScore += gain;
    profile.bestScore = Math.max(profile.bestScore, state.score);
    const spawned = addRandomTile(state.board);
    profile.maxTile = Math.max(profile.maxTile, highestTile());

    if (gain > 0) {
      showScoreGain(gain);
      tipIndex = tipForTile(highestTile());
    }

    if (highestTile() >= 2048 && !state.won) {
      state.won = true;
    }

    if (!canMove(state.board)) {
      state.gameOver = true;
    }

    profile.game = state;
    saveDatabase();
    isAnimating = true;
    render({ mergedTargets: plan.mergedTargets, spawned, suppressOverlay: true });
    animateMove(captured).finally(() => {
      isAnimating = false;
      if (state.gameOver) showOverlay('over');
      else if (state.won && !state.keepPlaying) showOverlay('win');
    });
  }

  function undo() {
    if (!undoState || !state || isAnimating) return;
    state.board = undoState.board.map(row => [...row]);
    state.score = undoState.score;
    state.won = undoState.won;
    state.keepPlaying = undoState.keepPlaying;
    state.gameOver = undoState.gameOver;
    profile.totalScore = Math.max(0, profile.totalScore - undoState.gain);
    profile.game = state;
    undoState = null;
    hideOverlay();
    saveDatabase();
    render();
  }

  function resetGame() {
    if (isAnimating) return;
    state = newState();
    profile.game = state;
    undoState = null;
    confirmModal.hidden = true;
    hideOverlay();
    saveDatabase();
    render();
    boardEl.focus({ preventScroll: true });
  }

  function showScoreGain(gain) {
    const el = $('#scoreGain');
    el.textContent = `+${formatNumber(gain)}`;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }

  function renderBoard(animation = null) {
    boardEl.innerHTML = '';
    state.board.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
      const tile = document.createElement('div');
      tile.className = value ? 'tile' : 'tile empty';
      tile.setAttribute('role', 'gridcell');
      tile.setAttribute('aria-rowindex', rowIndex + 1);
      tile.setAttribute('aria-colindex', colIndex + 1);
      if (value) {
        const power = powerFor(value);
        if (animation) {
          const merged = animation.mergedTargets.some(target => target.row === rowIndex && target.col === colIndex);
          const spawned = animation.spawned && animation.spawned.row === rowIndex && animation.spawned.col === colIndex;
          if (merged) tile.dataset.effect = 'merged';
          else if (spawned) tile.dataset.effect = 'new';
        }
        tile.dataset.value = value <= 2048 ? value : 4096;
        if (value > 2048) tile.classList.add('high');
        tile.setAttribute('aria-label', `${value}, superpoder ${power.name}`);
        const number = document.createElement('span');
        number.className = 'number';
        number.textContent = value;
        const label = document.createElement('span');
        label.className = 'power';
        label.textContent = power.short;
        tile.append(number, label);
      } else {
        tile.setAttribute('aria-label', 'Casilla vacía');
      }
      boardEl.appendChild(tile);
    }));
  }

  function renderPowerList() {
    const list = $('#powerList');
    list.innerHTML = '';
    const levels = Object.keys(POWERS).map(Number).filter(value => value <= 2048);
    const max = profile.maxTile;
    levels.forEach(value => {
      const item = document.createElement('div');
      const unlocked = value <= max;
      item.className = `power-item${unlocked ? ' unlocked' : ''}`;
      const power = POWERS[value];
      item.innerHTML = `<b>${unlocked ? value : '••'}</b><span>${unlocked ? power.short : 'Bloqueado'}</span>`;
      list.appendChild(item);
    });
    const unlockedCount = levels.filter(value => value <= max).length;
    $('#powerProgress').textContent = `${unlockedCount}/${levels.length}`;
  }

  function defenseInfo(max) {
    if (max >= 2048) return { name: 'SOC MAESTRO', percent: 100 };
    if (max >= 1024) return { name: 'ZERO TRUST', percent: 91 };
    if (max >= 512) return { name: 'RESPUESTA AVANZADA', percent: 82 };
    if (max >= 256) return { name: 'CIBERRESILIENTE', percent: 73 };
    if (max >= 128) return { name: 'DATOS CIFRADOS', percent: 64 };
    if (max >= 64) return { name: 'CONEXIÓN SEGURA', percent: 55 };
    if (max >= 32) return { name: 'ALERTA ANTIPHISHING', percent: 45 };
    if (max >= 16) return { name: 'IDENTIDAD PROTEGIDA', percent: 36 };
    if (max >= 8) return { name: 'DOBLE BARRERA', percent: 27 };
    if (max >= 4) return { name: 'PERÍMETRO ACTIVO', percent: 18 };
    return { name: 'INICIANDO', percent: 9 };
  }

  function render(options = {}) {
    if (!state || !profile) return;
    const animation = options.mergedTargets ? { mergedTargets: options.mergedTargets, spawned: options.spawned } : null;
    renderBoard(animation);
    $('#playerName').textContent = profile.name;
    $('#score').textContent = formatNumber(state.score);
    $('#bestScore').textContent = formatNumber(profile.bestScore);
    $('#totalScore').textContent = formatNumber(profile.totalScore);
    $('#undoBtn').disabled = !undoState;
    renderPowerList();
    const defense = defenseInfo(highestTile());
    $('#defenseLevel').textContent = defense.name;
    $('#defenseBar').style.width = `${defense.percent}%`;
    renderTip();

    if (!options.suppressOverlay) {
      if (state.gameOver) showOverlay('over');
      else if (state.won && !state.keepPlaying) showOverlay('win');
    }
  }

  function tipForTile(tile) {
    const map = { 2: 0, 4: 3, 8: 1, 16: 0, 32: 2, 64: 4, 128: 10, 256: 5, 512: 9, 1024: 11, 2048: 11 };
    const candidates = Object.keys(map).map(Number).sort((a, b) => b - a);
    const match = candidates.find(value => tile >= value) || 2;
    return map[match];
  }

  function renderTip() {
    const tip = TIPS[tipIndex];
    $('#tipTag').textContent = tip.tag;
    $('#tipHeading').textContent = tip.title;
    $('#tipText').textContent = tip.text;
    $('#tipIndex').textContent = tipIndex + 1;
    $('#tipCount').textContent = TIPS.length;
  }

  function changeTip(step) {
    tipIndex = (tipIndex + step + TIPS.length) % TIPS.length;
    renderTip();
  }

  function showOverlay(type) {
    overlayEl.hidden = false;
    if (type === 'win') {
      $('#overlayIcon').textContent = '🛡️';
      $('#overlayTitle').textContent = '¡SOC Maestro desbloqueado!';
      $('#overlayText').textContent = 'Llegaste a 2048 y construiste una defensa digital de élite. Puedes seguir combinando para elevar tu ciberresiliencia.';
      $('#continueBtn').hidden = false;
    } else {
      $('#overlayIcon').textContent = '🔒';
      $('#overlayTitle').textContent = 'Tablero bloqueado';
      $('#overlayText').textContent = `La misión terminó con ${formatNumber(state.score)} puntos. Tu aprendizaje y puntaje acumulado permanecen guardados.`;
      $('#continueBtn').hidden = true;
    }
  }

  function hideOverlay() {
    overlayEl.hidden = true;
  }

  function continueGame() {
    state.keepPlaying = true;
    profile.game = state;
    hideOverlay();
    saveDatabase();
    render();
    boardEl.focus({ preventScroll: true });
  }

  function openPlayerModal() {
    playerModal.hidden = false;
    $('#playerInput').value = profile ? profile.name : '';
    setTimeout(() => $('#playerInput').focus(), 30);
  }

  function preparePrint() {
    if (!state || !profile) return;
    const max = highestTile();
    const power = powerFor(max);
    $('#printPlayer').textContent = profile.name;
    $('#printScore').textContent = formatNumber(state.score);
    $('#printBest').textContent = formatNumber(profile.bestScore);
    $('#printTotal').textContent = formatNumber(profile.totalScore);
    $('#printPower').textContent = `${max} · ${power.name}`;
    $('#printDate').textContent = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
    const defense = defenseInfo(max);
    $('#printRank').textContent = `Nivel de defensa: ${defense.name}`;
    $('#printAdvice').textContent = TIPS[tipForTile(max)].text;

    const printBoard = $('#printBoard');
    printBoard.innerHTML = '';
    flatten(state.board).forEach(value => {
      const tile = document.createElement('div');
      tile.className = `print-tile${value ? '' : ' empty'}`;
      if (value) {
        tile.innerHTML = `<strong>${value}</strong><span>${powerFor(value).name}</span>`;
      } else {
        tile.innerHTML = '<strong>·</strong><span>Libre</span>';
      }
      printBoard.appendChild(tile);
    });
    window.print();
  }

  function keyHandler(event) {
    const directions = {
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right',
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowDown: 'down', s: 'down', S: 'down'
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    move(direction);
  }

  function bindEvents() {
    $('#playerForm').addEventListener('submit', event => {
      event.preventDefault();
      const input = $('#playerInput');
      if (!selectPlayer(input.value)) {
        $('#playerError').textContent = 'Escribe un nombre de al menos 2 caracteres.';
        input.focus();
      } else {
        $('#playerError').textContent = '';
      }
    });

    $('#changePlayerBtn').addEventListener('click', openPlayerModal);
    $('#newGameBtn').addEventListener('click', () => { confirmModal.hidden = false; $('#cancelNewBtn').focus(); });
    $('#restartOverlayBtn').addEventListener('click', resetGame);
    $('#cancelNewBtn').addEventListener('click', () => { confirmModal.hidden = true; boardEl.focus(); });
    $('#confirmNewBtn').addEventListener('click', resetGame);
    $('#undoBtn').addEventListener('click', undo);
    $('#continueBtn').addEventListener('click', continueGame);
    $('#printBtn').addEventListener('click', preparePrint);
    $('#prevTip').addEventListener('click', () => changeTip(-1));
    $('#nextTip').addEventListener('click', () => changeTip(1));
    document.addEventListener('keydown', keyHandler, { passive: false });

    document.querySelectorAll('[data-move]').forEach(button => {
      button.addEventListener('click', () => move(button.dataset.move));
    });

    boardEl.addEventListener('touchstart', event => {
      const touch = event.changedTouches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    boardEl.addEventListener('touchend', event => {
      if (!touchStart) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      touchStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
      move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }, { passive: true });

    setInterval(() => {
      if (document.visibilityState === 'visible' && playerModal.hidden && confirmModal.hidden) changeTip(1);
    }, 12000);
  }

  function initialize() {
    bindEvents();
    const lastKey = (() => { try { return localStorage.getItem(LAST_PLAYER_KEY) || ''; } catch (_) { return ''; } })();
    if (lastKey && database[lastKey]) $('#playerInput').value = database[lastKey].name || '';
    renderTip();
    $('#playerInput').focus();
  }

  initialize();
})();
