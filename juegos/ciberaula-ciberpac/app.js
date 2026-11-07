(() => {
  'use strict';

  const TILE = 24;
  const COLS = 17;
  const ROWS = 19;
  const MAX_LEVEL = 5;
  const POWER_MS = 12000;
  const GHOST_MOVE_SLOWDOWN = 2.00;
  const STORAGE_KEY = 'ciberaula:score:v1';
  const NAME_KEY = 'ciberaula:jugador:v1';

  const MAZE = [
    '#################',
    '#o.............o#',
    '#.###.#.#.#.###.#',
    '#.....#.o.#.....#',
    '#...#...#...#...#',
    '#.#.###.#.###.#.#',
    '#.#.....#.....#.#',
    '#.#####...#####.#',
    '#......   ......#',
    '....###   ###....',
    '#......   ......#',
    '#.#####...#####.#',
    '#.#.....#.....#.#',
    '#.#.###.#.###.#.#',
    '#...#...#...#...#',
    '#.....#.o.#.....#',
    '#.###.#.#.#.###.#',
    '#o.............o#',
    '#################'
  ];

  const DIRECTIONS = {
    left: { dr: 0, dc: -1, angle: Math.PI },
    right: { dr: 0, dc: 1, angle: 0 },
    up: { dr: -1, dc: 0, angle: -Math.PI / 2 },
    down: { dr: 1, dc: 0, angle: Math.PI / 2 }
  };
  const DIR_NAMES = Object.keys(DIRECTIONS);
  const OPPOSITE = { left: 'right', right: 'left', up: 'down', down: 'up' };
  const JAIL = { r: 9, c: 8 };
  const PLAYER_START = { r: 15, c: 8 };

  const THREATS = [
    { name: 'PHISHING', color: '#ff4d73', behavior: 'hunter' },
    { name: 'VISHING', color: '#ff9f43', behavior: 'ambush' },
    { name: 'RANSOMWARE', color: '#b26bff', behavior: 'hunter' },
    { name: 'SPYWARE', color: '#23d6c8', behavior: 'guard' },
    { name: 'TROYANO', color: '#48a4ff', behavior: 'intercept' },
    { name: 'SMISHING', color: '#f2dd43', behavior: 'random' }
  ];

  const DEFENSES = [
    { name: 'FIREWALL', color: '#ff5b7f' },
    { name: 'MFA', color: '#52e7ff' },
    { name: 'RESPALDO', color: '#ad7bff' },
    { name: 'CIFRADO', color: '#ffcd4a' },
    { name: 'ANTIVIRUS', color: '#65f29b' },
    { name: 'PARCHES', color: '#ff8f52' }
  ];

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const els = Object.fromEntries([
    'playerName','levelValue','scoreValue','livesValue','pelletsValue','bestValue','statusBanner','powerMeter',
    'startModal','nameInput','nameError','startButton','pauseButton','levelModal','levelTitle','levelMessage',
    'nextLevelButton','resultModal','resultTitle','resultSummary','resultPlayer','resultScore','resultLevels',
    'resultDate','printButton','restartButton','threatLegend','defenseLegend'
  ].map(id => [id, document.getElementById(id)]));

  let state;
  let animationId = 0;
  let bannerTimer = 0;
  let touchStart = null;

  function freshState() {
    return {
      started: false,
      paused: false,
      level: 1,
      score: 0,
      lives: 3,
      playerName: '',
      pellets: new Set(),
      defenses: new Map(),
      player: makeEntity(PLAYER_START.r, PLAYER_START.c, 126),
      ghosts: [],
      powerUntil: 0,
      pendingLevel: 0,
      lastFrame: performance.now(),
      completed: false,
      scoreCommitted: false
    };
  }

  function makeEntity(r, c, moveEvery) {
    return { r, c, prevR: r, prevC: c, moveStart: performance.now(), moveEvery, nextMove: 0, dir: 'left', pendingDir: 'left' };
  }

  function isWalkable(r, c) {
    if (r < 0 || r >= ROWS) return false;
    if (c < 0 || c >= COLS) return r === 9;
    return MAZE[r][c] !== '#';
  }

  function wrapColumn(c) {
    if (c < 0) return COLS - 1;
    if (c >= COLS) return 0;
    return c;
  }

  function cellKey(r, c) { return `${r},${c}`; }

  function loadShared() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        version: 1,
        totalScore: Number(value.totalScore ?? value.score ?? 0) || 0,
        bestScore: Number(value.bestScore ?? value.best ?? 0) || 0,
        games: Number(value.games ?? value.partidas ?? 0) || 0,
        wins: Number(value.wins ?? value.victorias ?? 0) || 0,
        lastPlayer: String(value.lastPlayer || '')
      };
    } catch (_) {
      return { version: 1, totalScore: 0, bestScore: 0, games: 0, wins: 0, lastPlayer: '' };
    }
  }

  function saveShared(shared, reason) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shared));
      const detail = { source: 'ciberaula-ciberpac', reason, state: shared, player: state.playerName, score: state.score };
      window.dispatchEvent(new CustomEvent('ciberaula:score', { detail }));
      if (window.parent !== window) window.parent.postMessage({ type: 'ciberaula:score:v1', ...detail }, '*');
    } catch (_) { /* Storage may be blocked; the game must continue. */ }
  }

  function exposeProtocol() {
    window.CiberaulaScoreV1 = window.CiberaulaScoreV1 || {};
    window.CiberaulaScoreV1.getState = () => loadShared();
  }

  function buildLegends() {
    els.threatLegend.innerHTML = THREATS.map(t => `<div class="legend-item"><i class="legend-dot" style="background:${t.color};color:${t.color}"></i><span>${t.name}</span></div>`).join('');
    els.defenseLegend.innerHTML = DEFENSES.map(d => `<div class="legend-item"><i class="legend-dot" style="background:${d.color};color:${d.color}"></i><span>${d.name}</span></div>`).join('');
  }

  function resetLevel(now = performance.now()) {
    state.pellets = new Set();
    state.defenses = new Map();
    let defenseIndex = (state.level - 1) % DEFENSES.length;
    MAZE.forEach((row, r) => [...row].forEach((cell, c) => {
      if (cell === '.') state.pellets.add(cellKey(r, c));
      if (cell === 'o') {
        state.defenses.set(cellKey(r, c), DEFENSES[defenseIndex % DEFENSES.length]);
        defenseIndex += 1;
      }
    }));
    resetActors(now);
    state.powerUntil = 0;
    state.pendingLevel = 0;
    updateHud();
    showBanner(`NIVEL ${state.level} · PROTOCOLO ACTIVO`, '');
  }

  function resetActors(now = performance.now()) {
    state.player = makeEntity(PLAYER_START.r, PLAYER_START.c, Math.max(82, 128 - state.level * 6));
    state.player.dir = 'left';
    state.player.pendingDir = 'left';
    const starts = [{r:9,c:8},{r:9,c:7},{r:9,c:9},{r:8,c:8},{r:10,c:7},{r:10,c:9}];
    state.ghosts = THREATS.map((threat, i) => ({
      ...makeEntity(starts[i].r, starts[i].c, Math.round(Math.max(135, 245 - state.level * 16) * GHOST_MOVE_SLOWDOWN)),
      ...threat,
      status: 'jailed',
      respawnAt: now + 800 + i * 720,
      route: [],
      routeIndex: 0,
      eatenCount: 0
    }));
    state.powerUntil = 0;
  }

  function startMission() {
    const name = els.nameInput.value.trim().replace(/\s+/g, ' ');
    if (!name) {
      els.nameError.textContent = 'Escribe tu nombre para iniciar la misión.';
      els.nameInput.focus();
      return;
    }
    els.nameError.textContent = '';
    state = freshState();
    state.started = true;
    state.playerName = name.slice(0, 32);
    localStorage.setItem(NAME_KEY, state.playerName);
    const shared = loadShared();
    shared.games += 1;
    shared.lastPlayer = state.playerName;
    saveShared(shared, 'start');
    resetLevel();
    els.startModal.classList.remove('open');
    els.resultModal.classList.remove('open');
    canvas.focus({ preventScroll: true });
    cancelAnimationFrame(animationId);
    state.lastFrame = performance.now();
    animationId = requestAnimationFrame(loop);
  }

  function updateHud() {
    els.playerName.textContent = state.playerName || '—';
    els.levelValue.textContent = `${state.level}/${MAX_LEVEL}`;
    els.scoreValue.textContent = state.score.toLocaleString('es-CO');
    els.livesValue.textContent = Array(Math.max(0, state.lives)).fill('●').join(' ');
    els.livesValue.setAttribute('aria-label', `${state.lives} vidas`);
    els.pelletsValue.textContent = state.pellets.size;
    els.bestValue.textContent = Math.max(loadShared().bestScore, state.score).toLocaleString('es-CO');
  }

  function showBanner(text, type = '') {
    clearTimeout(bannerTimer);
    els.statusBanner.textContent = text;
    els.statusBanner.className = `status-banner show ${type}`.trim();
    bannerTimer = setTimeout(() => { els.statusBanner.className = 'status-banner'; }, 1700);
  }

  function validMove(entity, dir) {
    const d = DIRECTIONS[dir];
    return d && isWalkable(entity.r + d.dr, entity.c + d.dc);
  }

  function moveEntity(entity, dir, now) {
    const d = DIRECTIONS[dir];
    entity.prevR = entity.r;
    entity.prevC = entity.c;
    entity.r += d.dr;
    entity.c = wrapColumn(entity.c + d.dc);
    entity.dir = dir;
    entity.moveStart = now;
  }

  function movePlayer(now) {
    const p = state.player;
    if (now < p.nextMove) return;
    if (validMove(p, p.pendingDir)) p.dir = p.pendingDir;
    if (validMove(p, p.dir)) moveEntity(p, p.dir, now);
    p.nextMove = now + p.moveEvery;
    collectAt(p.r, p.c, now);
    checkCollisions(now);
  }

  function collectAt(r, c, now) {
    const key = cellKey(r, c);
    if (state.pellets.delete(key)) {
      state.score += 10 * state.level;
      updateHud();
      if (state.pellets.size === 0 && state.defenses.size === 0) completeLevel();
    }
    const defense = state.defenses.get(key);
    if (defense) {
      state.defenses.delete(key);
      state.powerUntil = now + POWER_MS;
      state.score += 150 * state.level;
      showBanner(`${defense.name} ACTIVADO · RIESGOS VULNERABLES`, 'neutralized');
      updateHud();
      if (state.pellets.size === 0 && state.defenses.size === 0) completeLevel();
    }
  }

  function neighbors(r, c) {
    return DIR_NAMES.flatMap(dir => {
      const d = DIRECTIONS[dir];
      const nr = r + d.dr;
      const ncRaw = c + d.dc;
      if (!isWalkable(nr, ncRaw)) return [];
      return [{ r: nr, c: wrapColumn(ncRaw), dir }];
    });
  }

  function shortestPath(start, target) {
    const queue = [{ r: start.r, c: start.c }];
    const parent = new Map([[cellKey(start.r, start.c), null]]);
    for (let qi = 0; qi < queue.length; qi += 1) {
      const cur = queue[qi];
      if (cur.r === target.r && cur.c === target.c) break;
      for (const n of neighbors(cur.r, cur.c)) {
        const key = cellKey(n.r, n.c);
        if (!parent.has(key)) {
          parent.set(key, { r: cur.r, c: cur.c });
          queue.push({ r: n.r, c: n.c });
        }
      }
    }
    const targetKey = cellKey(target.r, target.c);
    if (!parent.has(targetKey)) return [];
    const route = [];
    let cur = { r: target.r, c: target.c };
    while (cur) {
      route.push(cur);
      cur = parent.get(cellKey(cur.r, cur.c));
    }
    return route.reverse();
  }

  function shortestDistance(start, target) {
    const route = shortestPath(start, target);
    return route.length ? route.length - 1 : 999;
  }

  function ghostTarget(ghost) {
    const p = state.player;
    if (ghost.behavior === 'guard') return { r: JAIL.r, c: state.pellets.size % 2 ? 4 : 12 };
    if (ghost.behavior === 'random') return { r: Math.random() < .5 ? 1 : 17, c: Math.random() < .5 ? 1 : 15 };
    if (ghost.behavior === 'ambush') {
      const d = DIRECTIONS[p.dir];
      return { r: Math.max(1, Math.min(17, p.r + d.dr * 3)), c: Math.max(0, Math.min(16, p.c + d.dc * 3)) };
    }
    if (ghost.behavior === 'intercept') return { r: p.r, c: 16 - p.c };
    return { r: p.r, c: p.c };
  }

  function chooseGhostDirection(ghost, now) {
    let options = neighbors(ghost.r, ghost.c);
    const noReverse = options.filter(n => n.dir !== OPPOSITE[ghost.dir]);
    if (noReverse.length) options = noReverse;
    if (!options.length) return OPPOSITE[ghost.dir];
    const vulnerable = now < state.powerUntil;
    const target = ghostTarget(ghost);
    if (Math.random() < .12 + (ghost.behavior === 'random' ? .45 : 0)) return options[Math.floor(Math.random() * options.length)].dir;
    options.sort((a, b) => {
      const da = shortestDistance(a, target);
      const db = shortestDistance(b, target);
      return vulnerable ? db - da : da - db;
    });
    return options[0].dir;
  }

  function moveGhost(ghost, now) {
    if (ghost.status === 'jailed') {
      if (now < ghost.respawnAt) return;
      ghost.status = 'active';
      ghost.dir = ghost.eatenCount % 2 ? 'left' : 'right';
      ghost.nextMove = now;
    }
    if (now < ghost.nextMove) return;

    if (ghost.status === 'returning') {
      if (!ghost.route.length) ghost.route = shortestPath(ghost, JAIL);
      ghost.routeIndex += 1;
      const next = ghost.route[ghost.routeIndex];
      if (!next) {
        ghost.r = JAIL.r; ghost.c = JAIL.c;
        ghost.prevR = JAIL.r; ghost.prevC = JAIL.c;
        ghost.status = 'jailed';
        ghost.respawnAt = now + Math.max(1500, 2700 - state.level * 180);
        ghost.route = [];
        ghost.routeIndex = 0;
        ghost.nextMove = ghost.respawnAt;
        return;
      }
      ghost.prevR = ghost.r; ghost.prevC = ghost.c;
      ghost.r = next.r; ghost.c = next.c; ghost.moveStart = now;
      ghost.nextMove = now + 86;
      return;
    }

    const dir = chooseGhostDirection(ghost, now);
    if (dir && validMove(ghost, dir)) moveEntity(ghost, dir, now);
    ghost.nextMove = now + ghost.moveEvery;
  }

  function eatGhost(ghost, now) {
    ghost.status = 'returning';
    ghost.eatenCount += 1;
    ghost.route = shortestPath(ghost, JAIL);
    ghost.routeIndex = 0;
    ghost.nextMove = now + 90;
    state.score += 500 * state.level;
    showBanner(`${ghost.name} NEUTRALIZADO → REGRESA A LA CÁRCEL`, 'neutralized');
    updateHud();
  }

  function checkCollisions(now) {
    for (const ghost of state.ghosts) {
      if (ghost.status !== 'active') continue;
      const same = ghost.r === state.player.r && ghost.c === state.player.c;
      const crossed = ghost.r === state.player.prevR && ghost.c === state.player.prevC && ghost.prevR === state.player.r && ghost.prevC === state.player.c;
      if (!same && !crossed) continue;
      if (now < state.powerUntil) eatGhost(ghost, now);
      else loseLife(now, ghost.name);
    }
  }

  function loseLife(now, threatName) {
    if (state.paused || state.completed) return;
    state.lives -= 1;
    state.powerUntil = 0;
    showBanner(`${threatName} TE ALCANZÓ · ${state.lives} VIDAS`, '');
    updateHud();
    if (state.lives <= 0) {
      endGame(false);
      return;
    }
    state.paused = true;
    setTimeout(() => {
      const keepScore = state.score;
      const keepLives = state.lives;
      resetActors(performance.now());
      state.score = keepScore;
      state.lives = keepLives;
      state.paused = false;
      updateHud();
    }, 950);
  }

  function completeLevel() {
    if (state.pendingLevel || state.completed) return;
    state.paused = true;
    state.score += 1000 * state.level;
    updateHud();
    if (state.level >= MAX_LEVEL) {
      setTimeout(() => endGame(true), 500);
      return;
    }
    state.pendingLevel = state.level + 1;
    els.levelTitle.textContent = `Nivel ${state.level} superado`;
    els.levelMessage.textContent = `Puntuación: ${state.score.toLocaleString('es-CO')}. El siguiente nivel tendrá amenazas más rápidas.`;
    els.levelModal.classList.add('open');
  }

  function continueLevel() {
    if (!state.pendingLevel) return;
    state.level = state.pendingLevel;
    state.pendingLevel = 0;
    state.paused = false;
    els.levelModal.classList.remove('open');
    resetLevel();
    canvas.focus({ preventScroll: true });
  }

  function commitScore(won) {
    if (state.scoreCommitted) return;
    const shared = loadShared();
    shared.totalScore += state.score;
    shared.bestScore = Math.max(shared.bestScore, state.score);
    shared.wins += won ? 1 : 0;
    shared.lastPlayer = state.playerName;
    saveShared(shared, won ? 'win' : 'game-over');
    state.scoreCommitted = true;
  }

  function endGame(won) {
    state.completed = true;
    state.paused = true;
    commitScore(won);
    els.resultTitle.textContent = won ? '¡Ciberespacio protegido!' : 'Misión interrumpida';
    els.resultSummary.textContent = won
      ? 'Neutralizaste los riesgos y completaste los cinco protocolos de defensa.'
      : 'Las amenazas agotaron tus vidas. Reinicia la misión y vuelve a intentarlo.';
    els.resultPlayer.textContent = state.playerName;
    els.resultScore.textContent = state.score.toLocaleString('es-CO');
    els.resultLevels.textContent = `${won ? MAX_LEVEL : Math.max(0, state.level - 1)}/${MAX_LEVEL}`;
    els.resultDate.textContent = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    els.printButton.hidden = !won;
    els.resultModal.classList.add('open');
  }

  function togglePause() {
    if (!state.started || state.completed || state.pendingLevel) return;
    state.paused = !state.paused;
    els.pauseButton.textContent = state.paused ? 'Continuar' : 'Pausar';
    showBanner(state.paused ? 'MISIÓN EN PAUSA' : 'MISIÓN REANUDADA');
  }

  function interpolated(entity, now) {
    const duration = entity.status === 'returning' ? 86 : entity.moveEvery;
    const t = Math.max(0, Math.min(1, (now - entity.moveStart) / duration));
    let fromC = entity.prevC;
    let toC = entity.c;
    if (Math.abs(toC - fromC) > 1) fromC = toC < fromC ? -1 : COLS;
    return { r: entity.prevR + (entity.r - entity.prevR) * t, c: fromC + (toC - fromC) * t };
  }

  function drawRoundedRect(x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function drawMaze(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = 'rgba(0,7,18,.34)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const x = c * TILE, y = r * TILE;
        if (MAZE[r][c] === '#') {
          const pulse = .72 + Math.sin(now / 700 + r * .13 + c * .1) * .08;
          ctx.fillStyle = `rgba(8,55,118,${pulse})`;
          ctx.strokeStyle = 'rgba(47,215,255,.82)';
          ctx.lineWidth = 1.1;
          drawRoundedRect(x + 1.5, y + 1.5, TILE - 3, TILE - 3, 5);
          ctx.fill(); ctx.stroke();
        }
      }
    }
    for (const key of state.pellets) {
      const [r, c] = key.split(',').map(Number);
      ctx.beginPath(); ctx.arc(c * TILE + TILE / 2, r * TILE + TILE / 2, 2.25, 0, Math.PI * 2);
      ctx.fillStyle = '#d9f8ff'; ctx.fill();
    }
    for (const [key, defense] of state.defenses) {
      const [r, c] = key.split(',').map(Number);
      drawDefense(c * TILE + TILE / 2, r * TILE + TILE / 2, defense, now);
    }
    drawJail();
    ctx.restore();
  }

  function drawJail() {
    const x = (JAIL.c - 1.42) * TILE, y = (JAIL.r - 1.18) * TILE;
    ctx.save();
    ctx.fillStyle = 'rgba(4,13,27,.72)';
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 1.2;
    drawRoundedRect(x, y, TILE * 2.84, TILE * 2.35, 8); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#ff4d73'; ctx.lineWidth = 2.3;
    ctx.beginPath(); ctx.moveTo(JAIL.c * TILE - 5, y); ctx.lineTo(JAIL.c * TILE + TILE + 5, y); ctx.stroke();
    ctx.fillStyle = 'rgba(219,239,255,.82)'; ctx.font = '700 6px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('CÁRCEL DE RIESGOS', (JAIL.c + .5) * TILE, y + TILE * 2.13);
    ctx.restore();
  }

  function drawDefense(x, y, defense, now) {
    const s = 7 + Math.sin(now / 160) * .8;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
    ctx.shadowColor = defense.color; ctx.shadowBlur = 11;
    ctx.fillStyle = defense.color; ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.fillStyle = '#03101e'; ctx.fillRect(-3.2, -3.2, 6.4, 6.4);
    ctx.restore();
  }

  function drawPlayer(now) {
    const p = interpolated(state.player, now);
    const x = (p.c + .5) * TILE, y = (p.r + .5) * TILE;
    const mouth = .17 + Math.abs(Math.sin(now / 95)) * .2;
    const angle = DIRECTIONS[state.player.dir].angle;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.shadowColor = '#ffe646'; ctx.shadowBlur = 12; ctx.fillStyle = '#ffe24a';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 9.3, mouth, Math.PI * 2 - mouth); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawGhostShape(x, y, ghost, now) {
    const vulnerable = now < state.powerUntil;
    const flashing = vulnerable && state.powerUntil - now < 1800 && Math.floor(now / 160) % 2;
    const color = flashing ? '#f7f7ff' : vulnerable ? '#183ea6' : ghost.color;
    ctx.save(); ctx.translate(x, y);
    ctx.shadowColor = color; ctx.shadowBlur = 11;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, -2.2, 9, Math.PI, 0); ctx.lineTo(9, 8);
    ctx.lineTo(5, 4.4); ctx.lineTo(1.7, 8); ctx.lineTo(-1.7, 4.4); ctx.lineTo(-5, 8); ctx.lineTo(-9, 4.4); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(-3.2, -2.3, 2.2, 3, 0, 0, Math.PI * 2); ctx.ellipse(3.2, -2.3, 2.2, 3, 0, 0, Math.PI * 2); ctx.fill();
    const eyeShift = vulnerable ? 0 : DIRECTIONS[ghost.dir].dc * .7;
    ctx.fillStyle = '#09224a';
    ctx.beginPath(); ctx.arc(-3.2 + eyeShift, -2.3, 1, 0, Math.PI * 2); ctx.arc(3.2 + eyeShift, -2.3, 1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawReturningLabel(x, y, ghost, now) {
    const label = ghost.name;
    ctx.save();
    ctx.font = '900 7px system-ui';
    const w = Math.max(42, ctx.measureText(label).width + 16);
    const bob = Math.sin(now / 95 + ghost.eatenCount) * 1.2;
    ctx.translate(x, y + bob);
    ctx.setLineDash([3, 2]); ctx.strokeStyle = ghost.color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-w / 2 - 8, 0); ctx.lineTo(-w / 2 - 2, 0); ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowColor = ghost.color; ctx.shadowBlur = 9;
    ctx.fillStyle = 'rgba(2,10,22,.94)'; ctx.strokeStyle = ghost.color; ctx.lineWidth = 1.2;
    drawRoundedRect(-w / 2, -8, w, 16, 8); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#5ff5a5'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '900 8px system-ui'; ctx.fillText('✓', -w / 2 + 5, .5);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(label, 4, .5);
    ctx.restore();
  }

  function drawGhosts(now) {
    for (const ghost of state.ghosts) {
      if (ghost.status === 'jailed' && now < ghost.respawnAt) {
        const x = (ghost.c + .5) * TILE, y = (ghost.r + .5) * TILE;
        drawGhostShape(x, y, ghost, now);
        continue;
      }
      const p = interpolated(ghost, now);
      const x = (p.c + .5) * TILE, y = (p.r + .5) * TILE;
      if (ghost.status === 'returning') drawReturningLabel(x, y, ghost, now);
      else drawGhostShape(x, y, ghost, now);
    }
  }

  function draw(now) {
    drawMaze(now);
    drawGhosts(now);
    drawPlayer(now);
    const remaining = Math.max(0, state.powerUntil - now);
    els.powerMeter.classList.toggle('active', remaining > 0);
    els.powerMeter.firstElementChild.style.transform = `scaleX(${remaining / POWER_MS})`;
  }

  function loop(now) {
    if (!state.started) return;
    if (!state.paused && !state.completed) {
      movePlayer(now);
      for (const ghost of state.ghosts) moveGhost(ghost, now);
      checkCollisions(now);
    }
    draw(now);
    animationId = requestAnimationFrame(loop);
  }

  function setDirection(dir) {
    if (!DIRECTIONS[dir] || !state.started) return;
    state.player.pendingDir = dir;
  }

  function restart() {
    els.resultModal.classList.remove('open');
    els.startModal.classList.add('open');
    els.nameInput.value = state.playerName || localStorage.getItem(NAME_KEY) || '';
    els.nameInput.focus();
  }

  function bindEvents() {
    els.startButton.addEventListener('click', startMission);
    els.nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') startMission(); });
    els.nextLevelButton.addEventListener('click', continueLevel);
    els.pauseButton.addEventListener('click', togglePause);
    els.printButton.addEventListener('click', () => window.print());
    els.restartButton.addEventListener('click', restart);
    document.querySelectorAll('[data-dir]').forEach(button => {
      const choose = e => { e.preventDefault(); setDirection(button.dataset.dir); canvas.focus({ preventScroll: true }); };
      button.addEventListener('pointerdown', choose);
      button.addEventListener('click', choose);
    });
    window.addEventListener('keydown', e => {
      const keys = { ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down' };
      if (keys[e.key]) { e.preventDefault(); setDirection(keys[e.key]); }
      if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && state.started) togglePause();
    }, { passive: false });
    canvas.addEventListener('pointerdown', e => { touchStart = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointerup', e => {
      if (!touchStart) return;
      const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y;
      touchStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      setDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.started && !state.paused && !state.completed) togglePause();
    });
  }

  // Small, read-only diagnostics interface used by the included automated tests.
  window.__CIBERPAC_TEST__ = {
    maze: MAZE.slice(),
    threats: THREATS.map(x => ({ ...x })),
    defenses: DEFENSES.map(x => ({ ...x })),
    tuning: { powerMs: POWER_MS, ghostMoveSlowdown: GHOST_MOVE_SLOWDOWN },
    shortestPath: (a, b) => shortestPath(a, b),
    getSnapshot: () => state ? {
      level: state.level, score: state.score, lives: state.lives, pellets: state.pellets.size,
      ghosts: state.ghosts.map(g => ({ name: g.name, status: g.status, r: g.r, c: g.c }))
    } : null,
    forceEat: index => {
      const g = state.ghosts[index];
      if (!g) return false;
      eatGhost(g, performance.now());
      return { status: g.status, routeLength: g.route.length, name: g.name };
    }
  };

  function init() {
    state = freshState();
    exposeProtocol();
    buildLegends();
    bindEvents();
    const savedName = localStorage.getItem(NAME_KEY) || loadShared().lastPlayer || '';
    els.nameInput.value = savedName;
    updateHud();
    draw(performance.now());
    setTimeout(() => els.nameInput.focus(), 100);
  }

  init();
})();
