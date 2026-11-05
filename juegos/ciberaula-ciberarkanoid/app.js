(() => {
  "use strict";

  const GAME_ID = "ciberarkanoid";
  const GAME_NAME = "CiberArkanoid";
  const PROTOCOL = "ciberaula:score:v1";
  const STORAGE_KEY = `${PROTOCOL}:${GAME_ID}`;
  const W = 960;
  const H = 600;
  const MAX_LIVES = 5;
  const $ = selector => document.querySelector(selector);

  const LEVELS = [
    { name: "Acceso seguro", rows: 4, cols: 9, speed: 350, paddle: 154, hpChance: 0, rewardEvery: 6, hazardEvery: 9, dropSpeed: 108 },
    { name: "Alerta temprana", rows: 5, cols: 10, speed: 395, paddle: 144, hpChance: .08, rewardEvery: 6, hazardEvery: 8, dropSpeed: 122 },
    { name: "Blindaje activo", rows: 6, cols: 11, speed: 440, paddle: 134, hpChance: .16, rewardEvery: 7, hazardEvery: 7, dropSpeed: 136 },
    { name: "Respuesta crítica", rows: 7, cols: 12, speed: 490, paddle: 124, hpChance: .24, rewardEvery: 7, hazardEvery: 6, dropSpeed: 152 },
    { name: "Defensa élite", rows: 8, cols: 13, speed: 545, paddle: 114, hpChance: .32, rewardEvery: 8, hazardEvery: 5, dropSpeed: 170 }
  ];

  const GOOD_DROPS = [
    { kind: "shield", label: "ESC", icon: "🛡", color: "#baff36", name: "Escudo antimalware" },
    { kind: "mfa", label: "MFA", icon: "MFA", color: "#38e8ff", name: "Autenticación multifactor" },
    { kind: "vpn", label: "VPN", icon: "VPN", color: "#66ffd1", name: "Canal VPN cifrado" },
    { kind: "patch", label: "PATCH", icon: "↻", color: "#ffd85a", name: "Parche de seguridad" }
  ];
  const BAD_DROPS = [
    { kind: "malware", label: "MAL", icon: "!", color: "#ff416c", name: "Malware" },
    { kind: "phishing", label: "PHISH", icon: "?", color: "#ff7b42", name: "Phishing" },
    { kind: "ransomware", label: "RANS", icon: "×", color: "#dc52ff", name: "Ransomware" }
  ];

  const els = {
    canvas: $("#gameCanvas"), shell: $("#gameShell"), launchHint: $("#launchHint"),
    playerLabel: $("#playerLabel"), levelLabel: $("#levelLabel"), livesLabel: $("#livesLabel"), scoreLabel: $("#scoreLabel"),
    gamesStat: $("#gamesStat"), winsStat: $("#winsStat"), totalScoreStat: $("#totalScoreStat"), activePowers: $("#activePowers"),
    setup: $("#setupDialog"), setupForm: $("#setupForm"), playerInput: $("#playerInput"), cancelSetup: $("#cancelSetup"),
    pauseButton: $("#pauseButton"), soundButton: $("#soundButton"), pauseOverlay: $("#pauseOverlay"), resumeButton: $("#resumeButton"),
    levelBanner: $("#levelBanner"), levelBannerTitle: $("#levelBannerTitle"), levelBannerCopy: $("#levelBannerCopy"), levelBonus: $("#levelBonus"), nextLevelButton: $("#nextLevelButton"),
    result: $("#resultDialog"), resultIcon: $("#resultIcon"), resultEyebrow: $("#resultEyebrow"), resultTitle: $("#resultTitle"), resultMessage: $("#resultMessage"), finalScore: $("#finalScore"), playAgain: $("#playAgainButton"),
    newGame: $("#newGameButton"), toast: $("#toast")
  };
  const ctx = els.canvas.getContext("2d");

  let state = {
    player: "", sessionId: "", level: 0, score: 0, lives: 3, status: "ready", launched: false,
    bricks: [], drops: [], particles: [], paddle: { x: W / 2, y: 558, baseW: 154, h: 18 },
    ball: { x: W / 2, y: 535, vx: 0, vy: 0, r: 8 },
    shields: 0, mfaUntil: 0, vpnUntil: 0, malwareUntil: 0,
    stats: null, finalized: false, lastTime: 0, keys: new Set(), sound: true, audio: null, nextGood: 0, nextBad: 0
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const fmt = value => Number(value || 0).toLocaleString("es-CO");
  const playerId = name => name.trim().toLocaleLowerCase("es-CO");

  function loadDatabase() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { players: {} }; }
    catch { return { players: {} }; }
  }

  function getPlayerStats(name) {
    const saved = loadDatabase().players[playerId(name)];
    return saved || { name: name.trim(), games: 0, wins: 0, score: 0, bestScore: 0, lastPlayedAt: null };
  }

  function saveStats() {
    if (!state.player || !state.stats) return;
    const db = loadDatabase();
    db.players[playerId(state.player)] = state.stats;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    renderStats();
  }

  function protocolPayload(eventName) {
    const remaining = state.bricks.filter(brick => brick.hp > 0).length;
    return {
      protocol: PROTOCOL,
      version: 1,
      gameId: GAME_ID,
      gameName: GAME_NAME,
      event: eventName,
      timestamp: new Date().toISOString(),
      player: { name: state.player },
      session: {
        id: state.sessionId,
        level: state.level + 1,
        levelsTotal: LEVELS.length,
        levelName: LEVELS[state.level]?.name || LEVELS[0].name,
        lives: state.lives,
        bricksRemaining: remaining,
        powers: { shields: state.shields, mfaActive: Date.now() < state.mfaUntil, vpnActive: Date.now() < state.vpnUntil }
      },
      result: { completed: state.status === "victory", score: state.score },
      stats: {
        games: state.stats?.games || 0,
        wins: state.stats?.wins || 0,
        score: state.stats?.score || 0,
        bestScore: state.stats?.bestScore || 0
      }
    };
  }

  function emitScore(eventName) {
    const payload = protocolPayload(eventName);
    window.dispatchEvent(new CustomEvent(PROTOCOL, { detail: payload }));
    if (window.parent !== window) window.parent.postMessage({ type: PROTOCOL, payload }, "*");
  }

  function renderStats() {
    const stats = state.stats || { games: 0, wins: 0, score: 0 };
    els.gamesStat.textContent = stats.games;
    els.winsStat.textContent = stats.wins;
    els.totalScoreStat.textContent = fmt(stats.score);
  }

  function renderHud() {
    els.playerLabel.textContent = state.player || "—";
    els.levelLabel.textContent = `${state.level + 1}/5`;
    els.livesLabel.textContent = `${"● ".repeat(Math.max(0, state.lives)).trim()}${state.lives < 1 ? "0" : ""}`;
    els.scoreLabel.textContent = fmt(state.score);
    renderPowers();
  }

  function renderPowers() {
    const active = [];
    if (state.shields) active.push(`<b>🛡 Escudo ×${state.shields}</b>`);
    if (Date.now() < state.mfaUntil) active.push("<b>MFA · barra ampliada</b>");
    if (Date.now() < state.vpnUntil) active.push("<b>VPN · esfera ralentizada</b>");
    els.activePowers.innerHTML = active.length ? active.join("") : "<span>Sin defensas activas</span>";
  }

  function currentPaddleWidth() {
    let width = state.paddle.baseW;
    if (Date.now() < state.mfaUntil) width *= 1.42;
    if (Date.now() < state.malwareUntil) width *= .68;
    return clamp(width, 72, 230);
  }

  function buildLevel(index) {
    const config = LEVELS[index];
    const side = 54;
    const gap = 6;
    const top = 74;
    const brickH = index >= 3 ? 25 : 29;
    const brickW = (W - side * 2 - gap * (config.cols - 1)) / config.cols;
    const bricks = [];
    let serial = 0;

    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const hole = (index === 1 && row === 0 && (col === 0 || col === config.cols - 1)) ||
          (index === 2 && row % 2 === 1 && col === Math.floor(config.cols / 2)) ||
          (index === 3 && (row + col) % 11 === 0) ||
          (index === 4 && ((row === 1 || row === 6) && (col === 1 || col === 11)));
        if (hole) continue;
        const reward = ((serial + index * 2) % config.rewardEvery === 2);
        const hazard = !reward && ((serial + row + index) % config.hazardEvery === 3);
        const reinforced = index > 0 && (((serial * 17 + row * 7 + col * 3 + index) % 100) / 100 < config.hpChance);
        const hp = reinforced ? 2 : 1;
        bricks.push({
          x: side + col * (brickW + gap), y: top + row * (brickH + gap), w: brickW, h: brickH,
          row, col, hp, maxHp: hp, reward, hazard, dropSpawned: false, serial
        });
        serial++;
      }
    }
    state.bricks = bricks;
    state.drops = [];
    state.particles = [];
    state.paddle.baseW = config.paddle;
    state.paddle.x = W / 2;
    resetBall();
  }

  function resetBall() {
    state.launched = false;
    state.ball.x = state.paddle.x;
    state.ball.y = state.paddle.y - 14;
    state.ball.vx = 0;
    state.ball.vy = 0;
    els.launchHint.hidden = false;
  }

  function launchBall() {
    if (state.status !== "running" || state.launched) return;
    const speed = LEVELS[state.level].speed;
    const direction = state.paddle.x < W / 2 ? 1 : -1;
    state.ball.vx = speed * .56 * direction;
    state.ball.vy = -Math.sqrt(speed * speed - state.ball.vx * state.ball.vx);
    state.launched = true;
    els.launchHint.hidden = true;
    beep(520, .045, "triangle");
  }

  function startGame(player) {
    const stats = getPlayerStats(player);
    stats.name = player.trim();
    stats.games += 1;
    stats.lastPlayedAt = new Date().toISOString();
    state = {
      ...state,
      player: player.trim(), sessionId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      level: 0, score: 0, lives: 3, status: "running", launched: false, shields: 0, mfaUntil: 0, vpnUntil: 0, malwareUntil: 0,
      stats, finalized: false, nextGood: 0, nextBad: 0, lastTime: performance.now()
    };
    saveStats();
    buildLevel(0);
    renderHud();
    els.pauseOverlay.hidden = true;
    els.levelBanner.hidden = true;
    els.shell.dataset.state = "running";
    emitScore("game_start");
    showToast("Nivel 1 · Acceso seguro");
    els.canvas.focus({ preventScroll: true });
  }

  function movePaddleTo(x) {
    const half = currentPaddleWidth() / 2;
    state.paddle.x = clamp(x, half + 12, W - half - 12);
    if (!state.launched) {
      state.ball.x = state.paddle.x;
      state.ball.y = state.paddle.y - state.ball.r - 4;
    }
  }

  function pointerPosition(event) {
    const rect = els.canvas.getBoundingClientRect();
    return (event.clientX - rect.left) * (W / rect.width);
  }

  function update(dt, now) {
    if (state.status !== "running") return;
    const keySpeed = 650;
    if (state.keys.has("arrowleft") || state.keys.has("a")) movePaddleTo(state.paddle.x - keySpeed * dt);
    if (state.keys.has("arrowright") || state.keys.has("d")) movePaddleTo(state.paddle.x + keySpeed * dt);

    if (state.mfaUntil && now > state.mfaUntil) state.mfaUntil = 0;
    if (state.malwareUntil && now > state.malwareUntil) state.malwareUntil = 0;
    if (state.vpnUntil && now > state.vpnUntil) {
      state.vpnUntil = 0;
      normalizeBallSpeed();
    }

    if (!state.launched) {
      state.ball.x = state.paddle.x;
      state.ball.y = state.paddle.y - state.ball.r - 4;
    } else {
      moveBall(dt);
    }
    updateDrops(dt);
    updateParticles(dt);
    renderPowers();
  }

  function moveBall(dt) {
    const ball = state.ball;
    const previousX = ball.x;
    const previousY = ball.y;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.x - ball.r <= 8 && ball.vx < 0) { ball.x = 8 + ball.r; ball.vx *= -1; beep(180, .025); }
    if (ball.x + ball.r >= W - 8 && ball.vx > 0) { ball.x = W - 8 - ball.r; ball.vx *= -1; beep(180, .025); }
    if (ball.y - ball.r <= 8 && ball.vy < 0) { ball.y = 8 + ball.r; ball.vy *= -1; beep(210, .025); }

    const paddleW = currentPaddleWidth();
    const paddleLeft = state.paddle.x - paddleW / 2;
    if (ball.vy > 0 && circleRect(ball, paddleLeft, state.paddle.y, paddleW, state.paddle.h)) {
      ball.y = state.paddle.y - ball.r - 1;
      const hit = clamp((ball.x - state.paddle.x) / (paddleW / 2), -1, 1);
      const speed = Math.hypot(ball.vx, ball.vy);
      const angle = hit * 1.08;
      ball.vx = Math.sin(angle) * speed;
      ball.vy = -Math.max(145, Math.cos(angle) * speed);
      normalizeBallSpeed();
      beep(360, .035, "square");
    }

    for (const brick of state.bricks) {
      if (brick.hp <= 0 || !circleRect(ball, brick.x, brick.y, brick.w, brick.h)) continue;
      const cameFromSide = previousX + ball.r <= brick.x || previousX - ball.r >= brick.x + brick.w;
      const cameFromVertical = previousY + ball.r <= brick.y || previousY - ball.r >= brick.y + brick.h;
      if (cameFromSide && !cameFromVertical) ball.vx *= -1;
      else ball.vy *= -1;
      hitBrick(brick);
      break;
    }

    if (ball.y - ball.r > H) loseBall();
  }

  function circleRect(ball, x, y, w, h) {
    const nearestX = clamp(ball.x, x, x + w);
    const nearestY = clamp(ball.y, y, y + h);
    const dx = ball.x - nearestX;
    const dy = ball.y - nearestY;
    return dx * dx + dy * dy <= ball.r * ball.r;
  }

  function hitBrick(brick) {
    brick.hp -= 1;
    state.score += 12 + state.level * 4;
    burst(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.reward ? "#baff36" : brick.hazard ? "#ff416c" : "#38e8ff", 5);
    if (!brick.dropSpawned && brick.reward) {
      brick.dropSpawned = true;
      spawnDrop(brick, GOOD_DROPS[state.nextGood++ % GOOD_DROPS.length], true);
    }
    if (brick.hp <= 0) {
      state.score += 38 + state.level * 12 + (brick.maxHp - 1) * 20;
      if (!brick.dropSpawned && brick.hazard) {
        brick.dropSpawned = true;
        spawnDrop(brick, BAD_DROPS[state.nextBad++ % BAD_DROPS.length], false);
      }
      beep(brick.reward ? 690 : brick.hazard ? 130 : 280, .04, "triangle");
    }
    renderHud();
    emitScore("score_update");
    if (!state.bricks.some(item => item.hp > 0)) completeLevel();
  }

  function spawnDrop(brick, data, good) {
    state.drops.push({
      x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, w: good ? 62 : 68, h: 28,
      vy: LEVELS[state.level].dropSpeed * (good ? 1 : 1.08), good, ...data
    });
  }

  function updateDrops(dt) {
    const paddleW = currentPaddleWidth();
    const left = state.paddle.x - paddleW / 2;
    for (const drop of state.drops) {
      drop.y += drop.vy * dt;
      if (!drop.caught && rectsOverlap(drop.x - drop.w / 2, drop.y - drop.h / 2, drop.w, drop.h, left, state.paddle.y, paddleW, state.paddle.h)) {
        drop.caught = true;
        if (drop.good) collectPower(drop);
        else hitThreat(drop);
      }
    }
    state.drops = state.drops.filter(drop => !drop.caught && drop.y - drop.h / 2 < H + 20);
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function collectPower(drop) {
    const now = Date.now();
    if (drop.kind === "shield") state.shields = Math.min(3, state.shields + 1);
    if (drop.kind === "mfa") state.mfaUntil = Math.max(now, state.mfaUntil) + 11000;
    if (drop.kind === "vpn") {
      state.vpnUntil = Math.max(now, state.vpnUntil) + 9000;
      state.ball.vx *= .82; state.ball.vy *= .82;
    }
    if (drop.kind === "patch") state.lives = Math.min(MAX_LIVES, state.lives + 1);
    state.score += 140 + state.level * 25;
    burst(drop.x, drop.y, drop.color, 16);
    showToast(`${drop.name} activado · +${140 + state.level * 25}`);
    beep(780, .09, "sine");
    renderHud();
    emitScore("power_collect");
  }

  function hitThreat(drop) {
    if (state.shields > 0) {
      state.shields -= 1;
      state.score += 40;
      showToast(`Escudo bloqueó ${drop.name} · +40`);
      beep(620, .08, "square");
    } else {
      const now = Date.now();
      if (drop.kind === "malware") {
        state.malwareUntil = now + 7500;
        state.score = Math.max(0, state.score - 180);
        showToast("Malware: barra reducida durante 7 segundos");
      } else if (drop.kind === "phishing") {
        state.score = Math.max(0, state.score - 260);
        showToast("Phishing capturado · −260 puntos");
      } else {
        state.lives -= 1;
        state.score = Math.max(0, state.score - 200);
        showToast("Ransomware: perdiste una vida");
        if (state.lives <= 0) {
          burst(drop.x, drop.y, drop.color, 20);
          renderHud();
          endGame(false);
          return;
        }
      }
      beep(95, .16, "sawtooth");
    }
    burst(drop.x, drop.y, drop.color, 14);
    renderHud();
    emitScore("threat_hit");
  }

  function normalizeBallSpeed() {
    if (!state.launched) return;
    const base = LEVELS[state.level].speed * (Date.now() < state.vpnUntil ? .78 : 1);
    const current = Math.hypot(state.ball.vx, state.ball.vy) || base;
    const factor = base / current;
    state.ball.vx *= factor;
    state.ball.vy *= factor;
  }

  function loseBall() {
    state.lives -= 1;
    renderHud();
    if (state.lives <= 0) {
      endGame(false);
      return;
    }
    state.score = Math.max(0, state.score - 120);
    resetBall();
    showToast(`Brecha detectada. Quedan ${state.lives} vidas.`);
    emitScore("life_lost");
    beep(80, .2, "sawtooth");
  }

  function completeLevel() {
    if (state.status !== "running") return;
    const levelNumber = state.level + 1;
    const bonus = 650 * levelNumber + state.lives * 100;
    state.score += bonus;
    state.status = "levelComplete";
    state.launched = false;
    els.launchHint.hidden = true;
    els.levelBannerTitle.textContent = levelNumber === LEVELS.length ? "¡Nivel 5 completado!" : `¡Nivel ${levelNumber} completado!`;
    els.levelBannerCopy.textContent = levelNumber === LEVELS.length ? `${state.player}, superaste los cinco cortafuegos.` : `${LEVELS[state.level].name} asegurado. Prepárate para mayor exigencia.`;
    els.levelBonus.textContent = `+${fmt(bonus)} BONUS`;
    els.nextLevelButton.textContent = levelNumber === LEVELS.length ? "Ver resultado final" : `Continuar al nivel ${levelNumber + 1}`;
    els.levelBanner.hidden = false;
    renderHud();
    emitScore("level_complete");
    beep(880, .12, "triangle");
    setTimeout(() => beep(1120, .15, "triangle"), 130);
  }

  function continueLevel() {
    els.levelBanner.hidden = true;
    if (state.level >= LEVELS.length - 1) {
      endGame(true);
      return;
    }
    state.level += 1;
    state.status = "running";
    buildLevel(state.level);
    renderHud();
    emitScore("level_start");
    showToast(`Nivel ${state.level + 1} · ${LEVELS[state.level].name}`);
    els.canvas.focus({ preventScroll: true });
  }

  function endGame(won) {
    if (state.finalized) return;
    state.finalized = true;
    state.status = won ? "victory" : "gameOver";
    state.launched = false;
    els.launchHint.hidden = true;
    const stats = state.stats;
    stats.score += state.score;
    stats.bestScore = Math.max(stats.bestScore || 0, state.score);
    stats.lastPlayedAt = new Date().toISOString();
    if (won) stats.wins += 1;
    saveStats();
    renderHud();
    els.resultIcon.textContent = won ? "✓" : "!";
    els.resultEyebrow.textContent = won ? "MISIÓN COMPLETADA" : "CONEXIÓN INTERRUMPIDA";
    els.resultTitle.textContent = won ? "¡Red protegida!" : "La amenaza avanzó";
    els.resultMessage.textContent = won
      ? `${state.player}, completaste los cinco niveles y reforzaste la defensa digital.`
      : `${state.player}, alcanzaste el nivel ${state.level + 1}. Ajusta tu estrategia y vuelve a intentarlo.`;
    els.finalScore.textContent = fmt(state.score);
    emitScore(won ? "game_complete" : "game_over");
    setTimeout(() => els.result.showModal(), 260);
  }

  function togglePause(force) {
    if (!["running", "paused"].includes(state.status)) return;
    const pause = typeof force === "boolean" ? force : state.status === "running";
    state.status = pause ? "paused" : "running";
    els.pauseOverlay.hidden = !pause;
    els.pauseButton.setAttribute("aria-pressed", String(pause));
    els.pauseButton.setAttribute("aria-label", pause ? "Reanudar partida" : "Pausar partida");
    els.pauseButton.textContent = pause ? "▶" : "Ⅱ";
    if (!pause) {
      state.lastTime = performance.now();
      els.canvas.focus({ preventScroll: true });
    }
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 130;
      state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .35 + Math.random() * .45, color });
    }
  }

  function updateParticles(dt) {
    for (const p of state.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt; p.life -= dt;
    }
    state.particles = state.particles.filter(p => p.life > 0);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawBricks();
    drawDrops();
    drawPaddle();
    drawBall();
    drawParticles();
    drawLevelCaption();
  }

  function drawGrid() {
    ctx.save();
    ctx.globalAlpha = .12;
    ctx.strokeStyle = "#38e8ff";
    ctx.lineWidth = 1;
    for (let x = 20; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 20; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
  }

  function drawBricks() {
    for (const brick of state.bricks) {
      if (brick.hp <= 0) continue;
      const color = brick.reward ? "#baff36" : brick.hazard ? "#ff416c" : ["#38e8ff", "#5bf0c4", "#57a8ff", "#d6f75d"][brick.row % 4];
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = brick.reward || brick.hazard ? 15 : 6;
      ctx.fillStyle = color;
      roundRect(ctx, brick.x, brick.y, brick.w, brick.h, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.h);
      gradient.addColorStop(0, "rgba(255,255,255,.42)");
      gradient.addColorStop(.42, "rgba(255,255,255,.04)");
      gradient.addColorStop(1, "rgba(0,0,0,.25)");
      ctx.fillStyle = gradient;
      roundRect(ctx, brick.x + 2, brick.y + 2, brick.w - 4, brick.h - 4, 5);
      ctx.fill();
      ctx.fillStyle = brick.reward ? "#07110a" : "#f7fdff";
      ctx.font = "900 12px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (brick.reward) ctx.fillText("◆ DEFENSA", brick.x + brick.w / 2, brick.y + brick.h / 2 + 1);
      else if (brick.hazard) ctx.fillText("! INFECTADO", brick.x + brick.w / 2, brick.y + brick.h / 2 + 1);
      else if (brick.maxHp > 1) ctx.fillText(brick.hp > 1 ? "▰▰" : "▰", brick.x + brick.w / 2, brick.y + brick.h / 2 + 1);
      ctx.restore();
    }
  }

  function drawDrops() {
    for (const drop of state.drops) {
      ctx.save();
      ctx.translate(drop.x, drop.y);
      ctx.shadowColor = drop.color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = drop.good ? "rgba(5,24,27,.96)" : "rgba(37,5,17,.96)";
      ctx.strokeStyle = drop.color;
      ctx.lineWidth = 3;
      roundRect(ctx, -drop.w / 2, -drop.h / 2, drop.w, drop.h, 9);
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = drop.color;
      ctx.font = `900 ${drop.label.length > 4 ? 10 : 12}px ui-sans-serif, system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(drop.icon, 0, 1);
      ctx.restore();
    }
  }

  function drawPaddle() {
    const width = currentPaddleWidth();
    const x = state.paddle.x - width / 2;
    ctx.save();
    const gradient = ctx.createLinearGradient(x, state.paddle.y, x + width, state.paddle.y);
    gradient.addColorStop(0, "#38e8ff"); gradient.addColorStop(.5, "#eaffff"); gradient.addColorStop(1, "#baff36");
    ctx.shadowColor = Date.now() < state.malwareUntil ? "#ff416c" : "#38e8ff";
    ctx.shadowBlur = 20;
    ctx.fillStyle = gradient;
    roundRect(ctx, x, state.paddle.y, width, state.paddle.h, 9);
    ctx.fill();
    ctx.fillStyle = "rgba(3,16,24,.75)";
    roundRect(ctx, x + 9, state.paddle.y + 5, width - 18, 5, 3);
    ctx.fill();
    if (state.shields) {
      ctx.fillStyle = "#baff36"; ctx.font = "900 13px ui-sans-serif, system-ui"; ctx.textAlign = "center"; ctx.fillText(`🛡 ×${state.shields}`, state.paddle.x, state.paddle.y - 9);
    }
    ctx.restore();
  }

  function drawBall() {
    const ball = state.ball;
    ctx.save();
    ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 22;
    const glow = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 1, ball.x, ball.y, ball.r);
    glow.addColorStop(0, "#ffffff"); glow.addColorStop(.4, "#aaf8ff"); glow.addColorStop(1, "#38e8ff");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    for (const p of state.particles) {
      ctx.save(); ctx.globalAlpha = clamp(p.life * 2, 0, 1); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3); ctx.restore();
    }
  }

  function drawLevelCaption() {
    ctx.save();
    ctx.fillStyle = "rgba(2,13,21,.72)";
    roundRect(ctx, 18, 18, 245, 35, 10); ctx.fill();
    ctx.fillStyle = "#9db7c5"; ctx.font = "700 12px ui-sans-serif, system-ui"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(`NIVEL ${state.level + 1} · ${LEVELS[state.level]?.name.toUpperCase() || "ACCESO SEGURO"}`, 32, 36);
    ctx.restore();
  }

  function roundRect(context, x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + r, y); context.arcTo(x + w, y, x + w, y + h, r); context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r); context.arcTo(x, y, x + w, y, r); context.closePath();
  }

  function frame(time) {
    const dt = Math.min(.022, Math.max(0, (time - (state.lastTime || time)) / 1000));
    state.lastTime = time;
    update(dt, Date.now());
    draw();
    requestAnimationFrame(frame);
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2400);
  }

  function beep(frequency, duration = .05, type = "sine") {
    if (!state.sound) return;
    try {
      state.audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = state.audio.createOscillator();
      const gain = state.audio.createGain();
      oscillator.type = type; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.035, state.audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, state.audio.currentTime + duration);
      oscillator.connect(gain); gain.connect(state.audio.destination);
      oscillator.start(); oscillator.stop(state.audio.currentTime + duration);
    } catch { /* El juego sigue funcionando sin audio. */ }
  }

  function openSetup() {
    if (state.status === "running") togglePause(true);
    els.playerInput.value = state.player || localStorage.getItem(`${STORAGE_KEY}:lastPlayer`) || "";
    els.cancelSetup.hidden = !state.player;
    els.setup.showModal();
    setTimeout(() => els.playerInput.focus(), 50);
  }

  els.setupForm.addEventListener("submit", event => {
    event.preventDefault();
    const player = String(new FormData(els.setupForm).get("player") || "").trim();
    if (!player) { els.playerInput.focus(); return; }
    localStorage.setItem(`${STORAGE_KEY}:lastPlayer`, player);
    els.setup.close();
    if (els.result.open) els.result.close();
    startGame(player);
  });
  els.cancelSetup.addEventListener("click", () => {
    els.setup.close();
    if (state.status === "paused") togglePause(false);
  });
  els.newGame.addEventListener("click", openSetup);
  els.playAgain.addEventListener("click", () => { els.result.close(); openSetup(); });
  els.nextLevelButton.addEventListener("click", continueLevel);
  els.pauseButton.addEventListener("click", () => togglePause());
  els.resumeButton.addEventListener("click", () => togglePause(false));
  els.soundButton.addEventListener("click", () => {
    state.sound = !state.sound;
    els.soundButton.setAttribute("aria-pressed", String(state.sound));
    els.soundButton.setAttribute("aria-label", state.sound ? "Desactivar sonido" : "Activar sonido");
    els.soundButton.textContent = state.sound ? "♪" : "×";
    if (state.sound) beep(540, .06);
  });

  els.canvas.addEventListener("pointermove", event => {
    event.preventDefault();
    movePaddleTo(pointerPosition(event));
  }, { passive: false });
  els.canvas.addEventListener("pointerdown", event => {
    event.preventDefault();
    movePaddleTo(pointerPosition(event));
    launchBall();
    els.canvas.setPointerCapture?.(event.pointerId);
  }, { passive: false });
  els.canvas.addEventListener("click", launchBall);
  els.canvas.addEventListener("contextmenu", event => event.preventDefault());

  window.addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowRight", " ", "a", "d", "A", "D"].includes(event.key)) event.preventDefault();
    const key = event.key.toLowerCase();
    state.keys.add(key === " " ? "space" : key);
    if (event.key === " ") launchBall();
    if (event.key === "Escape") togglePause();
  });
  window.addEventListener("keyup", event => state.keys.delete(event.key.toLowerCase()));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.status === "running") togglePause(true);
  });

  window.addEventListener("message", event => {
    const message = event.data;
    if (message?.type === PROTOCOL && message.action === "request_state" && event.source) {
      event.source.postMessage({ type: PROTOCOL, payload: protocolPayload("state_snapshot") }, "*");
    }
  });

  window.CiberaulaScoreV1 = { getState: () => protocolPayload("state_snapshot"), storageKey: STORAGE_KEY };

  state.stats = { games: 0, wins: 0, score: 0, bestScore: 0 };
  buildLevel(0);
  renderHud();
  renderStats();
  requestAnimationFrame(frame);
  openSetup();
})();
