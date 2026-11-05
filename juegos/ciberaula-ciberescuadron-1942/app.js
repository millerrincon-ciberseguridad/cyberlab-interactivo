(() => {
  "use strict";

  const GAME_ID = "ciberescuadron-1942";
  const GAME_NAME = "CiberEscuadrón 1942";
  const PROTOCOL = "ciberaula:score:v1";
  const STORAGE_KEY = `${PROTOCOL}:${GAME_ID}`;
  const LAST_PLAYER_KEY = "ciberaula:last-player";
  const W = 960;
  const H = 640;
  const MAX_LIVES = 5;
  const $ = selector => document.querySelector(selector);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const fmt = value => Math.round(Number(value || 0)).toLocaleString("es-CO");
  const now = () => performance.now();

  const CONFIG = window.CiberEscuadronConfig;
  if (!CONFIG || CONFIG.levels.length !== 10) throw new Error("Configuración de 10 niveles no disponible.");
  const LEVELS = CONFIG.levels;
  const THREATS = CONFIG.threats;

  const POWERS = [
    { kind: "mfa", label: "MFA", name: "Triple verificación", color: "#31e8ff" },
    { kind: "firewall", label: "FW", name: "Firewall", color: "#b8ff38" },
    { kind: "vpn", label: "VPN", name: "Túnel VPN cifrado", color: "#72ffd5" },
    { kind: "patch", label: "↻", name: "Parche de seguridad", color: "#ffd166" },
    { kind: "backup", label: "BKP", name: "Respaldo seguro", color: "#d779ff" }
  ];

  const els = {
    canvas: $("#gameCanvas"), shell: $("#gameShell"), setup: $("#introScreen"), gameScreen: $("#gameScreen"), setupForm: $("#setupForm"), playerInput: $("#playerInput"), playerError: $("#playerError"),
    pauseOverlay: $("#pauseOverlay"), resumeButton: $("#resumeButton"), levelBanner: $("#levelBanner"), levelBannerTitle: $("#levelBannerTitle"),
    levelBannerCopy: $("#levelBannerCopy"), levelBonus: $("#levelBonus"), nextLevelButton: $("#nextLevelButton"), resultOverlay: $("#resultOverlay"),
    resultIcon: $("#resultIcon"), resultEyebrow: $("#resultEyebrow"), resultTitle: $("#resultTitle"), resultMessage: $("#resultMessage"), finalScore: $("#finalScore"),
    playAgainButton: $("#playAgainButton"), pauseButton: $("#pauseButton"), soundButton: $("#soundButton"), newGameButton: $("#newGameButton"), toast: $("#toast"),
    playerLabel: $("#playerLabel"), levelLabel: $("#levelLabel"), targetLabel: $("#targetLabel"), livesLabel: $("#livesLabel"), scoreLabel: $("#scoreLabel"),
    gamesStat: $("#gamesStat"), winsStat: $("#winsStat"), totalScoreStat: $("#totalScoreStat"), activePowers: $("#activePowers")
  };
  const ctx = els.canvas.getContext("2d");
  function setupCanvasResolution() {
    const ratio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const width = Math.round(W * ratio), height = Math.round(H * ratio);
    if (els.canvas.width !== width || els.canvas.height !== height) {
      els.canvas.width = width; els.canvas.height = height;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
  }

  const freshState = () => ({
    player: "", sessionId: "", status: "ready", level: 0, score: 0, lives: 5, kills: 0, spawnedInLevel: 0, stats: null, finalized: false,
    playerShip: { x: W / 2, y: H - 82, tx: W / 2, ty: H - 82, r: 23, invulnerableUntil: 0 },
    bullets: [], enemyBullets: [], enemies: [], drops: [], particles: [], stars: [], keys: new Set(),
    lastTime: 0, lastSpawn: 0, lastFire: 0, elapsed: 0, pointerActive: false,
    mfaUntil: 0, vpnUntil: 0, shields: 0, sound: true, audio: null, toastTimer: null, nextDropAt: 5
  });
  let state = freshState();

  function playerId(name) { return name.trim().toLocaleLowerCase("es-CO"); }
  function loadDatabase() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { players: {} }; }
    catch { return { players: {} }; }
  }
  function getPlayerStats(name) {
    return loadDatabase().players[playerId(name)] || { name: name.trim(), games: 0, wins: 0, score: 0, bestScore: 0, lastPlayedAt: null };
  }
  function saveStats() {
    if (!state.player || !state.stats) return;
    const db = loadDatabase();
    db.players[playerId(state.player)] = state.stats;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    renderStats();
  }

  function protocolPayload(eventName) {
    const level = LEVELS[state.level] || LEVELS[0];
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
        levelName: level.name,
        target: level.target,
        destroyed: state.kills,
        lives: state.lives,
        powers: { shields: state.shields, mfaActive: Date.now() < state.mfaUntil, vpnActive: Date.now() < state.vpnUntil }
      },
      result: { completed: state.status === "victory", score: Math.round(state.score) },
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

  function initStars() {
    state.stars = Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 2 + .4, v: Math.random() * 50 + 22 }));
  }
  function renderStats() {
    const stats = state.stats || { games: 0, wins: 0, score: 0 };
    els.gamesStat.textContent = stats.games;
    els.winsStat.textContent = stats.wins;
    els.totalScoreStat.textContent = fmt(stats.score);
  }
  function renderHud() {
    const level = LEVELS[state.level] || LEVELS[0];
    els.playerLabel.textContent = state.player || "—";
    els.levelLabel.textContent = `${state.level + 1}/${LEVELS.length}`;
    els.targetLabel.textContent = `${Math.min(state.kills, level.target)}/${level.target}`;
    els.livesLabel.textContent = state.lives > 0 ? "● ".repeat(state.lives).trim() : "0";
    els.scoreLabel.textContent = fmt(state.score);
    renderPowers();
  }
  function renderPowers() {
    const active = [];
    if (state.shields) active.push(`<b>FW · ${state.shields} escudo${state.shields === 1 ? "" : "s"}</b>`);
    if (Date.now() < state.mfaUntil) active.push("<b>MFA · triple disparo</b>");
    if (Date.now() < state.vpnUntil) active.push("<b>VPN · tráfico lento</b>");
    els.activePowers.innerHTML = active.length ? active.join("") : "<span>Sin defensas activas</span>";
  }

  function ensureAudio() {
    if (!state.sound) return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!state.audio) state.audio = new AudioContext();
    if (state.audio.state === "suspended") state.audio.resume();
    return state.audio;
  }
  function beep(freq = 440, duration = .045, type = "square", volume = .025) {
    const audio = ensureAudio();
    if (!audio) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audio.currentTime);
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  }

  function startGame(playerName) {
    const name = playerName.trim().slice(0, 32);
    if (!name) return;
    const sound = state.sound;
    const audio = state.audio;
    state = freshState();
    state.sound = sound;
    state.audio = audio;
    state.player = name;
    state.sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    state.stats = getPlayerStats(name);
    state.stats.games += 1;
    state.stats.lastPlayedAt = new Date().toISOString();
    state.status = "playing";
    localStorage.setItem(LAST_PLAYER_KEY, name);
    saveStats();
    initStars();
    emitScore("game_start");
    startLevel(0);
    els.setup.hidden = true;
    els.gameScreen.hidden = false;
    els.resultOverlay.classList.add("hidden");
    ensureAudio();
    els.canvas.focus({ preventScroll: true });
  }

  function startLevel(index) {
    state.level = index;
    state.kills = 0;
    state.spawnedInLevel = 0;
    state.enemies = [];
    state.enemyBullets = [];
    state.bullets = [];
    state.drops = [];
    state.lastSpawn = now() - 500;
    state.nextDropAt = Math.max(4, 7 - index);
    state.playerShip.x = W / 2;
    state.playerShip.y = H - 82;
    state.playerShip.tx = state.playerShip.x;
    state.playerShip.ty = state.playerShip.y;
    state.playerShip.invulnerableUntil = now() + 1200;
    state.status = "playing";
    state.lastTime = now();
    els.levelBanner.classList.add("hidden");
    renderHud();
    toast(`NIVEL ${index + 1} · ${LEVELS[index].name}`);
    emitScore("level_start");
  }

  function spawnEnemy() {
    const level = LEVELS[state.level];
    if (state.spawnedInLevel >= level.target || state.enemies.length >= level.maxConcurrent) return;
    const serial = state.spawnedInLevel + 1;
    const kind = level.types[(serial - 1) % level.types.length];
    const info = THREATS[kind];
    const heavy = level.heavyEvery > 0 && serial % level.heavyEvery === 0;
    const r = (heavy ? 37 : 25) * info.scale;
    const hpBoost = Math.floor(state.level / 3);
    const hp = level.hp + hpBoost + (heavy ? 4 + Math.floor(state.level / 2) : 0);
    const x = r + 20 + Math.random() * (W - (r + 20) * 2);
    state.spawnedInLevel = serial;
    state.enemies.push({
      id: `${state.level + 1}-${serial}`, serial, kind, heavy, x, y: -r - 46, originX: x, r, hp, maxHp: hp,
      vy: level.speed * (heavy ? .68 : .86 + Math.random() * .30), wave: (heavy ? 18 : 28) + Math.random() * 54,
      phase: Math.random() * Math.PI * 2, shootAt: now() + 500 + Math.random() * 1300,
      points: info.points + hpBoost * 55 + (heavy ? 380 : 0), angle: 0, passes: 0
    });
  }

  function recycleEnemy(enemy, fromCollision = false) {
    enemy.passes += 1;
    enemy.y = -enemy.r - 52 - Math.random() * 110;
    enemy.originX = enemy.r + 18 + Math.random() * (W - (enemy.r + 18) * 2);
    enemy.x = enemy.originX;
    enemy.phase = Math.random() * Math.PI * 2;
    enemy.wave = (enemy.heavy ? 16 : 26) + Math.random() * 58;
    enemy.vy *= Math.min(1.035, 1 + enemy.passes * .003);
    enemy.shootAt = now() + (fromCollision ? 900 : 420) + Math.random() * 900;
  }

  function firePlayer() {
    const ship = state.playerShip;
    const triple = Date.now() < state.mfaUntil;
    const shots = triple ? [-.22, 0, .22] : [0];
    shots.forEach(angle => state.bullets.push({ x: ship.x + Math.sin(angle) * 12, y: ship.y - 26, vx: Math.sin(angle) * 230, vy: -520, r: 4, damage: 1 }));
    beep(triple ? 760 : 680, .035, "square", .018);
  }

  function fireEnemy(enemy) {
    const dx = state.playerShip.x - enemy.x;
    const dy = state.playerShip.y - enemy.y;
    const len = Math.hypot(dx, dy) || 1;
    const level = LEVELS[state.level];
    const speed = level.bulletSpeed * (enemy.heavy ? .92 : 1);
    const spread = enemy.heavy && state.level >= 4 ? [-0.14, 0.14] : [0];
    spread.forEach(offset => {
      const cos = Math.cos(offset), sin = Math.sin(offset);
      const vx = dx / len * speed;
      const vy = Math.max(80, dy / len * speed);
      state.enemyBullets.push({ x: enemy.x, y: enemy.y + enemy.r * .72, vx: vx * cos - vy * sin, vy: vx * sin + vy * cos, r: (enemy.heavy ? 6.5 : 5) + state.level * .22 });
    });
    const cadence = 1550 - state.level * 82 - level.shoot * 320;
    enemy.shootAt = now() + Math.max(470, cadence) + Math.random() * 760;
  }

  function maybeSpawnDrop(enemy) {
    if (state.kills < state.nextDropAt) return;
    const power = POWERS[Math.floor(Math.random() * POWERS.length)];
    state.drops.push({ ...power, x: enemy.x, y: enemy.y, vy: 92 + state.level * 8, r: 18, spin: 0 });
    state.nextDropAt += Math.max(4, 7 - state.level) + Math.floor(Math.random() * 3);
  }

  function applyPower(drop) {
    const t = Date.now();
    if (drop.kind === "mfa") state.mfaUntil = Math.max(state.mfaUntil, t) + 9000;
    if (drop.kind === "firewall") state.shields = Math.min(4, state.shields + 2);
    if (drop.kind === "vpn") state.vpnUntil = Math.max(state.vpnUntil, t) + 9000;
    if (drop.kind === "patch") state.lives = Math.min(MAX_LIVES, state.lives + 1);
    if (drop.kind === "backup") {
      state.enemyBullets = [];
      state.enemies.forEach(enemy => { enemy.hp -= 2; });
      burst(W / 2, H / 2, drop.color, 34);
    }
    addScore(180 + state.level * 40, "power_collect");
    toast(`${drop.label} · ${drop.name}`);
    beep(980, .13, "sine", .04);
    renderHud();
  }

  function addScore(points, eventName = "score_update") {
    state.score = Math.max(0, state.score + points);
    renderHud();
    emitScore(eventName);
  }

  function destroyEnemy(enemy, index) {
    const info = THREATS[enemy.kind];
    state.enemies.splice(index, 1);
    state.kills += 1;
    state.score += enemy.points;
    burst(enemy.x, enemy.y, info.color, 14);
    maybeSpawnDrop(enemy);
    beep(170 + state.level * 24, .08, "sawtooth", .035);
    renderHud();
    emitScore("enemy_destroyed");
    if (state.kills >= LEVELS[state.level].target) completeLevel();
  }

  function takeHit(source = "impacto") {
    const t = now();
    if (t < state.playerShip.invulnerableUntil || state.status !== "playing") return;
    if (state.shields > 0) {
      state.shields -= 1;
      state.playerShip.invulnerableUntil = t + 600;
      burst(state.playerShip.x, state.playerShip.y, "#b8ff38", 18);
      toast("FIREWALL · impacto bloqueado");
      beep(360, .12, "triangle", .04);
      renderHud();
      return;
    }
    state.lives -= 1;
    state.score = Math.max(0, state.score - 250);
    state.playerShip.invulnerableUntil = t + 1500;
    burst(state.playerShip.x, state.playerShip.y, "#ff4778", 28);
    toast(`${source.toUpperCase()} · integridad reducida`);
    beep(90, .25, "sawtooth", .06);
    renderHud();
    emitScore("life_lost");
    if (state.lives <= 0) finishGame(false);
  }

  function completeLevel() {
    if (state.status !== "playing") return;
    const level = LEVELS[state.level];
    state.status = "levelComplete";
    state.score += level.bonus;
    state.enemyBullets = [];
    renderHud();
    emitScore("level_complete");
    const finalLevel = state.level === LEVELS.length - 1;
    els.levelBannerTitle.textContent = `¡Nivel ${state.level + 1} superado!`;
    els.levelBannerCopy.textContent = finalLevel
      ? `${level.name}: todas las amenazas fueron neutralizadas. La misión está cumplida.`
      : `${level.name}: corredor digital despejado. Prepárate para ${LEVELS[state.level + 1].name}.`;
    els.levelBonus.textContent = `+${fmt(level.bonus)} BONUS`;
    els.nextLevelButton.textContent = finalLevel ? "VER VICTORIA →" : `NIVEL ${state.level + 2} →`;
    els.levelBanner.classList.remove("hidden");
    beep(1040, .16, "sine", .05);
  }

  function finalizeStats(victory) {
    if (state.finalized || !state.stats) return;
    state.finalized = true;
    state.stats.wins += victory ? 1 : 0;
    state.stats.score += Math.round(state.score);
    state.stats.bestScore = Math.max(state.stats.bestScore, Math.round(state.score));
    state.stats.lastPlayedAt = new Date().toISOString();
    saveStats();
  }

  function finishGame(victory) {
    if (state.status === "victory" || state.status === "gameover") return;
    state.status = victory ? "victory" : "gameover";
    if (victory) state.score += 5000 + state.lives * 500;
    finalizeStats(victory);
    els.levelBanner.classList.add("hidden");
    els.resultIcon.textContent = victory ? "★" : "!";
    els.resultIcon.style.background = victory ? "var(--green)" : "var(--danger)";
    els.resultEyebrow.textContent = victory ? "MISIÓN CUMPLIDA" : "MISIÓN INTERRUMPIDA";
    els.resultTitle.textContent = victory ? "¡Espacio digital protegido!" : "La defensa necesita refuerzos";
    els.resultMessage.textContent = victory
      ? `Excelente, ${state.player}. Completaste los diez niveles y neutralizaste las amenazas.`
      : `${state.player}, alcanzaste el nivel ${state.level + 1}. Refuerza tus defensas e inténtalo de nuevo.`;
    els.finalScore.textContent = fmt(state.score);
    els.resultOverlay.classList.remove("hidden");
    renderHud();
    emitScore(victory ? "game_complete" : "game_over");
    beep(victory ? 880 : 120, victory ? .35 : .4, victory ? "sine" : "sawtooth", .055);
  }

  function burst(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 170;
      state.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: .45 + Math.random() * .55, max: 1, size: 1.5 + Math.random() * 4, color });
    }
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1800);
  }

  function update(dt, time) {
    const level = LEVELS[state.level];
    const vpnFactor = Date.now() < state.vpnUntil ? .56 : 1;
    state.elapsed += dt;

    state.stars.forEach(star => {
      star.y += star.v * dt * (1 + state.level * .12);
      if (star.y > H) { star.y = 0; star.x = Math.random() * W; }
    });

    const ship = state.playerShip;
    const keyboardSpeed = 390 * dt;
    if (state.keys.has("arrowleft") || state.keys.has("a")) ship.tx -= keyboardSpeed;
    if (state.keys.has("arrowright") || state.keys.has("d")) ship.tx += keyboardSpeed;
    if (state.keys.has("arrowup") || state.keys.has("w")) ship.ty -= keyboardSpeed;
    if (state.keys.has("arrowdown") || state.keys.has("s")) ship.ty += keyboardSpeed;
    ship.tx = clamp(ship.tx, 28, W - 28);
    ship.ty = clamp(ship.ty, H * .52, H - 32);
    ship.x += (ship.tx - ship.x) * Math.min(1, dt * 15);
    ship.y += (ship.ty - ship.y) * Math.min(1, dt * 15);

    if (time - state.lastFire > (Date.now() < state.mfaUntil ? 145 : 190)) {
      firePlayer();
      state.lastFire = time;
    }
    if (time - state.lastSpawn > level.spawn && state.spawnedInLevel < level.target && state.enemies.length < level.maxConcurrent) {
      spawnEnemy();
      state.lastSpawn = time;
    }

    state.bullets.forEach(bullet => { bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; });
    state.bullets = state.bullets.filter(bullet => bullet.y > -20 && bullet.x > -20 && bullet.x < W + 20);

    state.enemies.forEach(enemy => {
      enemy.y += enemy.vy * vpnFactor * dt;
      enemy.angle += dt * (enemy.heavy ? 1.15 : 2.2);
      const weave = 1.75 + state.level * .045;
      enemy.x = clamp(enemy.originX + Math.sin(state.elapsed * weave + enemy.phase) * enemy.wave, enemy.r + 4, W - enemy.r - 4);
      if (time > enemy.shootAt && enemy.y > 48 && enemy.y < H * .82) fireEnemy(enemy);
    });

    state.enemyBullets.forEach(bullet => { bullet.x += bullet.vx * vpnFactor * dt; bullet.y += bullet.vy * vpnFactor * dt; });
    state.drops.forEach(drop => { drop.y += drop.vy * dt; drop.spin += dt * 3; });
    state.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985; p.vy *= .985; p.life -= dt; });
    state.particles = state.particles.filter(p => p.life > 0);

    handleCollisions();

    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      if (enemy.y - enemy.r > H + 26) {
        takeHit("brecha enemiga");
        recycleEnemy(enemy);
      }
    }
    state.enemyBullets = state.enemyBullets.filter(b => b.y < H + 25 && b.x > -25 && b.x < W + 25);
    state.drops = state.drops.filter(d => d.y < H + 30);
  }

  function handleCollisions() {
    const ship = state.playerShip;
    for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
      const bullet = state.bullets[bi];
      for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
        const enemy = state.enemies[ei];
        if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < bullet.r + enemy.r) {
          state.bullets.splice(bi, 1);
          enemy.hp -= bullet.damage;
          burst(bullet.x, bullet.y, "#31e8ff", 4);
          if (enemy.hp <= 0) {
            destroyEnemy(enemy, ei);
            if (state.status !== "playing") return;
          }
          break;
        }
      }
    }

    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = state.enemyBullets[i];
      if (Math.hypot(bullet.x - ship.x, bullet.y - ship.y) < bullet.r + ship.r * .72) {
        state.enemyBullets.splice(i, 1);
        takeHit("ataque hostil");
      }
    }

    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      if (Math.hypot(enemy.x - ship.x, enemy.y - ship.y) < enemy.r + ship.r * .8) {
        burst(enemy.x, enemy.y, THREATS[enemy.kind].color, 18);
        takeHit(THREATS[enemy.kind].name);
        recycleEnemy(enemy, true);
      }
    }

    for (let i = state.drops.length - 1; i >= 0; i--) {
      const drop = state.drops[i];
      if (Math.hypot(drop.x - ship.x, drop.y - ship.y) < drop.r + ship.r) {
        state.drops.splice(i, 1);
        applyPower(drop);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawAtmosphere();
    state.drops.forEach(drawDrop);
    state.bullets.forEach(drawPlayerBullet);
    state.enemyBullets.forEach(drawEnemyBullet);
    state.enemies.forEach(drawEnemy);
    drawShip();
    state.particles.forEach(drawParticle);
  }

  function drawAtmosphere() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "rgba(0,12,22,.06)");
    gradient.addColorStop(1, "rgba(0,9,15,.58)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(160,244,255,.62)";
    state.stars.forEach(star => ctx.fillRect(star.x, star.y, star.s, star.s * 3.2));
    ctx.save();
    ctx.strokeStyle = "rgba(49,232,255,.045)";
    ctx.lineWidth = 1;
    const offset = (state.elapsed * 42) % 64;
    for (let y = -64 + offset; y < H; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.restore();
  }

  function drawShip() {
    const p = state.playerShip;
    if (now() < p.invulnerableUntil && Math.floor(now() / 90) % 2) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.lineJoin = "round";
    ctx.shadowColor = "#31e8ff";
    ctx.shadowBlur = 18;

    const body = ctx.createLinearGradient(-28, 0, 28, 0);
    body.addColorStop(0, "#5e8392"); body.addColorStop(.5, "#f4ffff"); body.addColorStop(1, "#628b9b");
    ctx.fillStyle = body; ctx.strokeStyle = "#d9fbff"; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -34); ctx.quadraticCurveTo(9, -24, 10, -7); ctx.lineTo(36, 12); ctx.lineTo(34, 18);
    ctx.lineTo(10, 13); ctx.lineTo(8, 29); ctx.lineTo(0, 24); ctx.lineTo(-8, 29); ctx.lineTo(-10, 13);
    ctx.lineTo(-34, 18); ctx.lineTo(-36, 12); ctx.lineTo(-10, -7); ctx.quadraticCurveTo(-9, -24, 0, -34); ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#163948"; ctx.strokeStyle = "#31e8ff"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(8, -11, 6, 3); ctx.lineTo(0, 10); ctx.lineTo(-6, 3); ctx.quadraticCurveTo(-8, -11, 0, -24); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#9aefff"; ctx.globalAlpha = .62; ctx.beginPath(); ctx.ellipse(-2, -9, 2.2, 7, -.1, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;

    ctx.fillStyle = "#375e6b";
    ctx.beginPath(); ctx.moveTo(-9, 12); ctx.lineTo(-20, 25); ctx.lineTo(-7, 22); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(9, 12); ctx.lineTo(20, 25); ctx.lineTo(7, 22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(49,232,255,.55)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-31, 14); ctx.lineTo(-8, 6); ctx.moveTo(31, 14); ctx.lineTo(8, 6); ctx.stroke();

    ctx.shadowColor = "#b8ff38"; ctx.fillStyle = "#b8ff38";
    ctx.fillRect(-7, 25, 4, 13 + Math.random() * 8); ctx.fillRect(3, 25, 4, 13 + Math.random() * 8);
    if (state.shields > 0) {
      ctx.strokeStyle = "rgba(184,255,56,.88)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 39 + Math.sin(state.elapsed * 5) * 2, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawThreatTag(enemy, info) {
    const text = info.label;
    ctx.font = `900 ${enemy.heavy ? 10 : 9}px ui-sans-serif,system-ui`;
    const width = Math.max(50, ctx.measureText(text).width + 14);
    const tagY = -enemy.r * .93 - 15;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = info.color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -enemy.r * .62); ctx.lineTo(0, tagY + 8); ctx.stroke();
    ctx.fillStyle = "rgba(2,9,14,.94)";
    ctx.beginPath(); ctx.roundRect(-width / 2, tagY - 7, width, 15, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, tagY + .5);
  }

  function drawEnemy(enemy) {
    const info = THREATS[enemy.kind];
    const r = enemy.r;
    ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.lineJoin = "round";
    ctx.shadowColor = info.color; ctx.shadowBlur = enemy.heavy ? 20 : 13;
    const metal = ctx.createLinearGradient(-r, 0, r, 0);
    metal.addColorStop(0, "#281721"); metal.addColorStop(.45, info.color); metal.addColorStop(.55, "#ffe8ef"); metal.addColorStop(1, "#281721");
    ctx.fillStyle = metal; ctx.strokeStyle = "rgba(255,255,255,.78)"; ctx.lineWidth = enemy.heavy ? 1.8 : 1.2;

    if (enemy.heavy) {
      ctx.beginPath();
      ctx.moveTo(0, r); ctx.quadraticCurveTo(13, r * .58, 12, r * .22); ctx.lineTo(r * 1.26, r * .04);
      ctx.lineTo(r * 1.18, -r * .24); ctx.lineTo(r * .34, -r * .12); ctx.lineTo(r * .28, -r * .68);
      ctx.lineTo(r * .58, -r * .88); ctx.lineTo(r * .18, -r * .78); ctx.quadraticCurveTo(0, -r, -r * .18, -r * .78);
      ctx.lineTo(-r * .58, -r * .88); ctx.lineTo(-r * .28, -r * .68); ctx.lineTo(-r * .34, -r * .12);
      ctx.lineTo(-r * 1.18, -r * .24); ctx.lineTo(-r * 1.26, r * .04); ctx.lineTo(-12, r * .22); ctx.quadraticCurveTo(-13, r * .58, 0, r); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#111a20";
      [-.62, .62].forEach(side => { ctx.beginPath(); ctx.ellipse(r * side, 0, r * .17, r * .31, 0, 0, Math.PI * 2); ctx.fill(); });
    } else {
      ctx.beginPath();
      ctx.moveTo(0, r); ctx.quadraticCurveTo(10, r * .52, 8, r * .16); ctx.lineTo(r, -r * .08);
      ctx.lineTo(r * .92, -r * .37); ctx.lineTo(r * .30, -r * .28); ctx.lineTo(r * .22, -r * .72);
      ctx.lineTo(r * .48, -r * .88); ctx.lineTo(r * .12, -r * .78); ctx.lineTo(0, -r * .92);
      ctx.lineTo(-r * .12, -r * .78); ctx.lineTo(-r * .48, -r * .88); ctx.lineTo(-r * .22, -r * .72);
      ctx.lineTo(-r * .30, -r * .28); ctx.lineTo(-r * .92, -r * .37); ctx.lineTo(-r, -r * .08); ctx.lineTo(-8, r * .16); ctx.quadraticCurveTo(-10, r * .52, 0, r); ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    ctx.fillStyle = "#071119"; ctx.strokeStyle = info.color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, r * .5); ctx.lineTo(r * .16, -r * .18); ctx.lineTo(0, -r * .46); ctx.lineTo(-r * .16, -r * .18); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = `950 ${Math.max(9, r * .30)}px ui-sans-serif,system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(info.short, 0, r * .02);
    ctx.strokeStyle = "rgba(255,255,255,.62)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-r * .8, -r * .1); ctx.lineTo(-r * .24, r * .06); ctx.moveTo(r * .8, -r * .1); ctx.lineTo(r * .24, r * .06); ctx.stroke();
    drawThreatTag(enemy, info);

    if (enemy.maxHp > 1) {
      const width = r * 1.65;
      ctx.fillStyle = "rgba(0,0,0,.68)"; ctx.fillRect(-width / 2, -r - 33, width, 5);
      ctx.fillStyle = info.color; ctx.fillRect(-width / 2, -r - 33, width * Math.max(0, enemy.hp / enemy.maxHp), 5);
    }
    ctx.restore();
  }

  function drawPlayerBullet(b) {
    ctx.save(); ctx.shadowColor = "#31e8ff"; ctx.shadowBlur = 10; ctx.fillStyle = "#dfffff";
    ctx.fillRect(b.x - 2, b.y - 11, 4, 17); ctx.restore();
  }
  function drawEnemyBullet(b) {
    ctx.save(); ctx.shadowColor = "#ff4778"; ctx.shadowBlur = 12; ctx.fillStyle = "#ffb0c3";
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function drawDrop(drop) {
    ctx.save(); ctx.translate(drop.x, drop.y); ctx.rotate(drop.spin); ctx.shadowColor = drop.color; ctx.shadowBlur = 20;
    ctx.fillStyle = "rgba(3,16,24,.9)"; ctx.strokeStyle = drop.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, drop.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.rotate(-drop.spin);
    ctx.fillStyle = drop.color; ctx.font = "900 10px ui-sans-serif,system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(drop.label, 0, 1); ctx.restore();
  }
  function drawParticle(p) {
    ctx.save(); ctx.globalAlpha = clamp(p.life / p.max, 0, 1); ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); ctx.restore();
  }

  function loop(time) {
    requestAnimationFrame(loop);
    const dt = Math.min(.034, Math.max(0, (time - (state.lastTime || time)) / 1000));
    state.lastTime = time;
    if (state.status === "playing") update(dt, time);
    draw();
  }

  function pointerPosition(event) {
    const rect = els.canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * W / rect.width, y: (event.clientY - rect.top) * H / rect.height };
  }
  function movePointer(event) {
    if (state.status !== "playing") return;
    const pos = pointerPosition(event);
    state.playerShip.tx = clamp(pos.x, 28, W - 28);
    state.playerShip.ty = clamp(pos.y, H * .52, H - 32);
  }

  function togglePause(forcePause = null) {
    if (!["playing", "paused"].includes(state.status)) return;
    const shouldPause = forcePause === null ? state.status === "playing" : forcePause;
    if (shouldPause && state.status === "playing") {
      state.status = "paused";
      els.pauseOverlay.classList.remove("hidden");
      els.pauseButton.textContent = "▶ Continuar";
    } else if (!shouldPause && state.status === "paused") {
      state.status = "playing";
      state.lastTime = now();
      els.pauseOverlay.classList.add("hidden");
      els.pauseButton.textContent = "Ⅱ Pausa";
      els.canvas.focus({ preventScroll: true });
    }
  }

  els.setupForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!els.playerInput.value.trim()) {
      els.playerInput.setAttribute("aria-invalid", "true");
      els.playerError.hidden = false;
      els.playerInput.focus();
      return;
    }
    els.playerInput.removeAttribute("aria-invalid");
    els.playerError.hidden = true;
    startGame(els.playerInput.value);
  });
  els.playerInput.addEventListener("input", () => {
    els.playerInput.removeAttribute("aria-invalid");
    els.playerError.hidden = true;
  });
  els.nextLevelButton.addEventListener("click", () => {
    if (state.level === LEVELS.length - 1) finishGame(true);
    else startLevel(state.level + 1);
  });
  els.resumeButton.addEventListener("click", () => togglePause(false));
  els.pauseButton.addEventListener("click", () => togglePause());
  els.soundButton.addEventListener("click", () => {
    state.sound = !state.sound;
    els.soundButton.textContent = state.sound ? "♪ Sonido" : "× Silencio";
    els.soundButton.setAttribute("aria-label", state.sound ? "Desactivar sonido" : "Activar sonido");
    if (state.sound) beep(620, .06, "sine", .03);
  });
  els.newGameButton.addEventListener("click", () => {
    if (["playing", "paused", "levelComplete"].includes(state.status) && !window.confirm("¿Interrumpir la misión actual y comenzar una nueva?")) return;
    if (["playing", "paused", "levelComplete"].includes(state.status)) { finalizeStats(false); emitScore("game_over"); }
    state.status = "ready";
    els.pauseOverlay.classList.add("hidden");
    els.levelBanner.classList.add("hidden");
    els.resultOverlay.classList.add("hidden");
    els.gameScreen.hidden = true;
    els.setup.hidden = false;
    els.playerInput.value = state.player || els.playerInput.value;
    setTimeout(() => els.playerInput.focus(), 0);
  });
  els.playAgainButton.addEventListener("click", () => startGame(state.player));

  els.canvas.addEventListener("pointerdown", event => {
    event.preventDefault();
    state.pointerActive = true;
    try { els.canvas.setPointerCapture?.(event.pointerId); } catch { /* Evento sintético o captura no disponible. */ }
    movePointer(event);
    ensureAudio();
  });
  els.canvas.addEventListener("pointermove", event => {
    if (event.pointerType === "mouse" || state.pointerActive) movePointer(event);
  });
  els.canvas.addEventListener("pointerup", event => {
    state.pointerActive = false;
    try { els.canvas.releasePointerCapture?.(event.pointerId); } catch { /* La captura pudo finalizar previamente. */ }
  });
  els.canvas.addEventListener("pointercancel", () => { state.pointerActive = false; });

  window.addEventListener("keydown", event => {
    const key = event.key.toLocaleLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault(); state.keys.add(key);
    }
    if ((key === "p" || key === "escape") && !event.repeat) { event.preventDefault(); togglePause(); }
  });
  window.addEventListener("keyup", event => state.keys.delete(event.key.toLocaleLowerCase()));
  document.addEventListener("visibilitychange", () => { if (document.hidden && state.status === "playing") togglePause(true); });

  window.addEventListener("message", event => {
    if (event.data?.type === PROTOCOL && event.data?.action === "request_state") {
      event.source?.postMessage({ type: PROTOCOL, payload: protocolPayload("state") }, event.origin === "null" ? "*" : event.origin);
    }
  });
  window.CiberaulaScoreV1 = Object.freeze({ getState: () => protocolPayload("state") });
  window.CiberEscuadron1942 = Object.freeze({
    getLevelPlan: () => LEVELS.map(({ name, target, speed, hp, shoot, heavyEvery, maxConcurrent }) => ({ name, target, speed, hp, shoot, heavyEvery, maxConcurrent }))
  });
  window.addEventListener("resize", setupCanvasResolution);
  setupCanvasResolution();

  const lastPlayer = localStorage.getItem(LAST_PLAYER_KEY) || localStorage.getItem(`${STORAGE_KEY}:lastPlayer`) || "";
  if (lastPlayer) localStorage.setItem(LAST_PLAYER_KEY, lastPlayer);
  els.playerInput.value = lastPlayer;
  if (lastPlayer) {
    state.player = lastPlayer;
    state.stats = getPlayerStats(lastPlayer);
  }
  initStars();
  renderStats();
  renderHud();
  requestAnimationFrame(loop);
  setTimeout(() => els.playerInput.focus(), 120);
})();
