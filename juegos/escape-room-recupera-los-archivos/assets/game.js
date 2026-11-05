(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const STORAGE_KEY = 'ciberaula:score:v1';
  const LAST_PLAYER_KEY = 'ciberaula:last-player';
  const PROGRESS_KEY = 'ciberaula:escape-progress:v1';
  const WIN_PERCENT = 75;

  const els = {
    intro: $('#intro'), game: $('#game'), results: $('#results'), start: $('#startBtn'), resume: $('#resumeBtn'), restart: $('#restartBtn'), print: $('#printBtn'),
    playerName: $('#playerName'), roundSize: $('#roundSize'), nameError: $('#nameError'), snapshot: $('#playerSnapshot'), snapshotLabel: $('#snapshotLabel'),
    snapshotBar: $('#snapshotBar'), snapshotMeta: $('#snapshotMeta'), resumeNotice: $('#resumeNotice'), hudPlayer: $('#hudPlayer'), progressText: $('#progressText'),
    scoreText: $('#scoreText'), timeText: $('#timeText'), progressBar: $('#progressBar'), remainingText: $('#remainingText'), fileGrid: $('#fileGrid'),
    decoderEmpty: $('#decoderEmpty'), challenge: $('#challenge'), challengeId: $('#challengeId'), challengeSector: $('#challengeSector'), challengeIcon: $('#challengeIcon'),
    challengeFile: $('#challengeFile'), challengeTitle: $('#challengeTitle'), challengeScenario: $('#challengeScenario'), challengeQuestion: $('#challengeQuestion'),
    optionList: $('#optionList'), hintBtn: $('#hintBtn'), hintText: $('#hintText'), feedback: $('#feedback'), feedbackTitle: $('#feedbackTitle'),
    feedbackText: $('#feedbackText'), actionText: $('#actionText'), continueBtn: $('#continueBtn'), saveExit: $('#saveExitBtn'), resultPlayer: $('#resultPlayer'),
    resultRing: $('#resultRing'), percentText: $('#percentText'), resultTitle: $('#resultTitle'), resultMessage: $('#resultMessage'), victoryNotice: $('#victoryNotice'),
    correctText: $('#correctText'), wrongText: $('#wrongText'), finalScoreText: $('#finalScoreText'), finalTimeText: $('#finalTimeText'), review: $('#review'),
    scoreBtn: $('#scoreBtn'), resultScoreBtn: $('#resultScoreBtn'), scorePanel: $('#scorePanel'), closeScore: $('#closeScoreBtn'), scoreList: $('#scoreList'),
    emptyScore: $('#emptyScore'), scaleLegend: $('#scoreScaleLegend'), full: $('#fullBtn')
  };

  let state = freshState();
  let timer = null;
  let lastFocus = null;

  function freshState() {
    return { tests: [], player: '', resolved: new Set(), answers: new Map(), score: 0, streak: 0, correct: 0, current: null, answered: false, hintUsed: false, startedAt: 0, elapsedMs: 0 };
  }

  const safeText = (element, value) => { if (element) element.textContent = String(value ?? ''); };
  const normalizeName = (name) => name.trim().replace(/\s+/g, ' ').slice(0, 40);
  const playerKey = (name) => normalizeName(name).toLocaleLowerCase('es');
  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const random = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[random]] = [copy[random], copy[index]];
    }
    return copy;
  };
  const validTest = (test) => test && test.id && test.icono && test.archivo && test.sector && Number.isFinite(Number(test.nivel)) &&
    test.titulo && test.escenario && test.pregunta && Array.isArray(test.opciones) && test.opciones.length >= 3 &&
    Number.isInteger(test.correcta) && test.correcta >= 0 && test.correcta < test.opciones.length && test.pista && test.explicacion && test.accion;
  const bank = () => (window.PRUEBAS_ESCAPE_ARCHIVOS || []).filter(validTest);

  const formatTime = (milliseconds) => {
    const seconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  };
  const currentElapsed = () => state.startedAt ? state.elapsedMs + (Date.now() - state.startedAt) : state.elapsedMs;
  const startTimer = () => {
    stopTimer();
    safeText(els.timeText, formatTime(currentElapsed()));
    timer = window.setInterval(() => safeText(els.timeText, formatTime(currentElapsed())), 1000);
  };
  const stopTimer = () => { if (timer) window.clearInterval(timer); timer = null; };

  const loadScore = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (_) { return {}; }
  };
  const saveScore = (score) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(score)); return true; }
    catch (_) { return false; }
  };
  const getPlayerRecord = (name) => loadScore()[playerKey(name)] || { name: normalizeName(name), games: 0, wins: 0, totalPoints: 0, bestPercent: 0 };
  const registerResult = (name, percent, points) => {
    const all = loadScore();
    const key = playerKey(name);
    const previous = all[key] || { name, games: 0, wins: 0, totalPoints: 0, bestPercent: 0 };
    const won = percent >= WIN_PERCENT;
    all[key] = {
      name: normalizeName(name), games: Number(previous.games || 0) + 1, wins: Number(previous.wins || 0) + (won ? 1 : 0),
      totalPoints: Number(previous.totalPoints || 0) + points, bestPercent: Math.max(Number(previous.bestPercent || 0), percent), lastPlayed: new Date().toISOString()
    };
    saveScore(all);
    return { record: all[key], won };
  };
  const milestoneFor = (wins) => Math.max(5, Math.ceil(Math.max(1, wins) / 5) * 5);

  const loadProgress = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
      return saved && saved.version === 1 && Array.isArray(saved.testIds) ? saved : null;
    } catch (_) { return null; }
  };
  const clearProgress = () => { try { localStorage.removeItem(PROGRESS_KEY); } catch (_) { /* almacenamiento opcional */ } };
  const saveProgress = () => {
    if (!state.player || !state.tests.length) return;
    const answers = [...state.answers.entries()].map(([id, answer]) => [id, answer]);
    const payload = {
      version: 1, player: state.player, testIds: state.tests.map((test) => test.id), answers, score: state.score, streak: state.streak,
      correct: state.correct, elapsedMs: currentElapsed(), savedAt: new Date().toISOString()
    };
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload)); } catch (_) { /* almacenamiento opcional */ }
  };

  const showScreen = (name) => {
    [els.intro, els.game, els.results].forEach((screen) => screen.classList.remove('active'));
    els[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSnapshot = () => {
    const name = normalizeName(els.playerName.value);
    els.nameError.hidden = true;
    if (!name) {
      els.snapshot.hidden = true; els.resume.hidden = true; els.resumeNotice.hidden = true; return;
    }
    const record = getPlayerRecord(name);
    const milestone = milestoneFor(record.wins);
    els.snapshot.hidden = false;
    safeText(els.snapshotLabel, `${record.wins} / ${milestone} victorias`);
    els.snapshotBar.style.width = `${Math.min(100, (Number(record.wins || 0) / milestone) * 100)}%`;
    safeText(els.snapshotMeta, `${record.games || 0} partidas · ${record.totalPoints || 0} puntos acumulados · mejor resultado ${record.bestPercent || 0}%`);
    const saved = loadProgress();
    const canResume = Boolean(saved && playerKey(saved.player) === playerKey(name) && saved.answers.length < saved.testIds.length);
    els.resume.hidden = !canResume;
    els.resumeNotice.hidden = !canResume;
  };

  const updateHud = () => {
    const total = state.tests.length;
    const resolved = state.resolved.size;
    safeText(els.progressText, `${resolved} / ${total}`);
    safeText(els.scoreText, state.score);
    safeText(els.timeText, formatTime(currentElapsed()));
    els.progressBar.style.width = `${total ? (resolved / total) * 100 : 0}%`;
    safeText(els.remainingText, `${Math.max(0, total - resolved)} ${total - resolved === 1 ? 'pendiente' : 'pendientes'}`);
  };

  const renderFiles = () => {
    els.fileGrid.replaceChildren();
    state.tests.forEach((test, index) => {
      const answer = state.answers.get(test.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'file-card';
      if (state.current?.id === test.id && !answer) button.classList.add('is-active');
      if (answer?.ok) button.classList.add('is-recovered');
      if (answer && !answer.ok) button.classList.add('is-damaged');
      button.dataset.testId = test.id;
      button.disabled = Boolean(answer);
      const icon = document.createElement('span'); icon.className = 'file-icon'; icon.textContent = answer ? (answer.ok ? '✓' : '!') : test.icono;
      const body = document.createElement('span'); body.className = 'file-body';
      const code = document.createElement('b'); code.textContent = `${String(index + 1).padStart(2, '0')} · ${test.id}`;
      const name = document.createElement('small'); name.textContent = test.archivo;
      body.append(code, name); button.append(icon, body);
      button.setAttribute('aria-label', answer ? `${test.titulo}: ${answer.ok ? 'recuperado' : 'por reforzar'}` : `Abrir ${test.titulo}`);
      button.addEventListener('click', () => openChallenge(test, button));
      els.fileGrid.append(button);
    });
  };

  const openChallenge = (test, button) => {
    if (state.resolved.has(test.id)) return;
    lastFocus = button;
    state.current = test;
    state.answered = false;
    state.hintUsed = false;
    els.decoderEmpty.hidden = true;
    els.challenge.hidden = false;
    els.feedback.hidden = true;
    els.feedback.className = 'feedback';
    els.hintText.hidden = true;
    els.hintBtn.hidden = false;
    els.hintBtn.disabled = false;
    safeText(els.challengeId, test.id);
    safeText(els.challengeSector, `${test.sector.toUpperCase()} · NIVEL ${test.nivel}`);
    safeText(els.challengeIcon, test.icono);
    safeText(els.challengeFile, test.archivo);
    safeText(els.challengeTitle, test.titulo);
    safeText(els.challengeScenario, test.escenario);
    safeText(els.challengeQuestion, test.pregunta);
    els.optionList.replaceChildren();
    test.opciones.forEach((option, index) => {
      const choice = document.createElement('button');
      choice.type = 'button'; choice.className = 'option';
      const letter = document.createElement('b'); letter.textContent = String.fromCharCode(65 + index);
      const label = document.createElement('span'); label.textContent = option;
      choice.append(letter, label);
      choice.addEventListener('click', () => answer(index));
      els.optionList.append(choice);
    });
    renderFiles();
    window.setTimeout(() => els.optionList.querySelector('button')?.focus(), 20);
  };

  const useHint = () => {
    if (!state.current || state.answered || state.hintUsed) return;
    state.hintUsed = true;
    state.score = Math.max(0, state.score - 25);
    els.hintBtn.disabled = true;
    els.hintText.hidden = false;
    safeText(els.hintText, `PISTA: ${state.current.pista}`);
    updateHud(); saveProgress();
  };

  const answer = (selected) => {
    if (state.answered || !state.current) return;
    state.answered = true;
    const test = state.current;
    const ok = selected === test.correcta;
    if (ok) {
      state.correct += 1;
      state.streak += 1;
      state.score += 100 + ((Math.max(1, Number(test.nivel)) - 1) * 15) + Math.min((state.streak - 1) * 15, 75);
    } else {
      state.streak = 0;
    }
    state.answers.set(test.id, { ok, selected, hintUsed: state.hintUsed });
    state.resolved.add(test.id);
    [...els.optionList.children].forEach((button, index) => {
      button.disabled = true;
      if (index === test.correcta) button.classList.add('correct');
      if (index === selected && !ok) button.classList.add('wrong');
    });
    els.hintBtn.hidden = true;
    els.feedback.hidden = false;
    els.feedback.classList.toggle('is-wrong', !ok);
    safeText(els.feedbackTitle, ok ? '✓ ARCHIVO RECUPERADO' : '✕ RECUPERACIÓN INSEGURA');
    safeText(els.feedbackText, test.explicacion);
    safeText(els.actionText, test.accion);
    updateHud(); renderFiles(); saveProgress();
    els.continueBtn.focus();
  };

  const continueVault = () => {
    const completed = state.tests.length > 0 && state.resolved.size === state.tests.length;
    if (completed) { finish(); return; }
    state.current = null; state.answered = false; state.hintUsed = false;
    els.challenge.hidden = true; els.decoderEmpty.hidden = false;
    renderFiles();
    lastFocus?.focus();
  };

  const begin = (tests, name, restored = null) => {
    state = freshState();
    state.tests = tests; state.player = name;
    if (restored) {
      state.answers = new Map(restored.answers);
      state.resolved = new Set(restored.answers.map(([id]) => id));
      state.score = Number(restored.score || 0); state.streak = Number(restored.streak || 0); state.correct = Number(restored.correct || 0);
      state.elapsedMs = Number(restored.elapsedMs || 0);
    }
    state.startedAt = Date.now();
    try { localStorage.setItem(LAST_PLAYER_KEY, name); } catch (_) { /* almacenamiento opcional */ }
    safeText(els.hudPlayer, name);
    els.challenge.hidden = true; els.decoderEmpty.hidden = false;
    renderFiles(); updateHud(); showScreen('game'); startTimer(); saveProgress();
  };

  const start = () => {
    const name = normalizeName(els.playerName.value);
    if (!name) {
      els.nameError.hidden = false; els.playerName.setAttribute('aria-invalid', 'true'); els.playerName.focus(); return;
    }
    const tests = bank();
    if (tests.length < 20) { window.alert('El juego necesita al menos 20 pruebas válidas en pruebas.js.'); return; }
    const count = els.roundSize.value === 'all' ? tests.length : Math.min(Number(els.roundSize.value), tests.length);
    clearProgress();
    els.playerName.removeAttribute('aria-invalid'); els.nameError.hidden = true;
    begin(shuffle(tests).slice(0, count), name);
  };

  const resume = () => {
    const name = normalizeName(els.playerName.value);
    const saved = loadProgress();
    if (!name || !saved || playerKey(saved.player) !== playerKey(name)) { updateSnapshot(); return; }
    const byId = new Map(bank().map((test) => [test.id, test]));
    const tests = saved.testIds.map((id) => byId.get(id)).filter(Boolean);
    if (tests.length < 1 || tests.length !== saved.testIds.length) {
      clearProgress(); updateSnapshot(); window.alert('La misión guardada ya no coincide con el banco de pruebas actual.'); return;
    }
    begin(tests, normalizeName(saved.player), saved);
  };

  const saveAndExit = () => {
    state.elapsedMs = currentElapsed(); state.startedAt = 0; stopTimer(); saveProgress();
    state.current = null; state.answered = false;
    showScreen('intro'); updateSnapshot(); els.playerName.focus();
  };

  const finish = () => {
    stopTimer();
    state.elapsedMs = currentElapsed(); state.startedAt = 0;
    clearProgress();
    const total = state.tests.length;
    const percent = Math.round((state.correct / total) * 100);
    safeText(els.resultPlayer, state.player); safeText(els.percentText, `${percent}%`); els.resultRing.style.setProperty('--p', percent);
    safeText(els.correctText, `${state.correct}/${total}`); safeText(els.wrongText, total - state.correct);
    safeText(els.finalScoreText, state.score); safeText(els.finalTimeText, formatTime(state.elapsedMs));
    let title; let message;
    if (percent >= 90) { title = 'Bóveda restaurada'; message = 'Recuperaste los archivos con criterio de respuesta, evidencia e integridad de nivel experto.'; }
    else if (percent >= 75) { title = 'Misión cumplida'; message = 'La información crítica volvió a estar disponible. Revisa los pocos protocolos que aún pueden fallar bajo presión.'; }
    else if (percent >= 60) { title = 'Recuperación parcial'; message = 'Abriste la bóveda, pero varias decisiones podrían reinfectar, alterar o exponer la información.'; }
    else { title = 'Bóveda comprometida'; message = 'Repite la misión: contiene primero, preserva la evidencia y recupera solo desde fuentes verificadas.'; }
    safeText(els.resultTitle, title); safeText(els.resultMessage, message);
    const saved = registerResult(state.player, percent, state.score);
    els.victoryNotice.className = `victory-notice ${saved.won ? 'won' : 'practice'}`;
    safeText(els.victoryNotice, saved.won ? `VICTORIA REGISTRADA · ${saved.record.wins} ganadas` : `PARTIDA REGISTRADA · alcanza ${WIN_PERCENT}% para sumar una victoria`);
    els.review.replaceChildren();
    const missed = state.tests.filter((test) => !state.answers.get(test.id)?.ok);
    if (missed.length) {
      const heading = document.createElement('h3'); heading.textContent = 'Protocolos para repasar'; els.review.append(heading);
      missed.forEach((test) => {
        const article = document.createElement('article');
        const name = document.createElement('b'); name.textContent = `${test.id} · ${test.titulo}`;
        const text = document.createElement('p'); text.textContent = `${test.explicacion} ${test.accion}`;
        article.append(name, text); els.review.append(article);
      });
    }
    showScreen('results');
  };

  const renderScore = () => {
    const records = Object.values(loadScore()).filter((record) => record && record.name)
      .sort((a, b) => (Number(b.wins || 0) - Number(a.wins || 0)) || (Number(b.totalPoints || 0) - Number(a.totalPoints || 0)));
    els.scoreList.replaceChildren(); els.emptyScore.hidden = records.length > 0;
    const maxWins = Math.max(0, ...records.map((record) => Number(record.wins || 0)));
    const milestone = milestoneFor(maxWins); els.scaleLegend.replaceChildren();
    for (let value = 0; value <= milestone; value += 1) {
      if (value === 0 || value === milestone || value % 5 === 0) {
        const tick = document.createElement('span'); tick.textContent = String(value); tick.style.left = `${(value / milestone) * 100}%`; els.scaleLegend.append(tick);
      }
    }
    records.forEach((record, index) => {
      const row = document.createElement('article'); row.className = 'score-row';
      const rank = document.createElement('span'); rank.className = 'score-rank'; rank.textContent = String(index + 1).padStart(2, '0');
      const body = document.createElement('div'); body.className = 'score-body';
      const top = document.createElement('div'); top.className = 'score-row-top';
      const name = document.createElement('strong'); name.textContent = record.name;
      const wins = document.createElement('b'); wins.textContent = `${record.wins || 0} ${Number(record.wins) === 1 ? 'victoria' : 'victorias'}`;
      top.append(name, wins);
      const track = document.createElement('div'); track.className = 'victory-scale'; track.setAttribute('aria-label', `${record.name}: ${record.wins || 0} de ${milestone} victorias en la escala`);
      const fill = document.createElement('i'); fill.style.width = `${Math.min(100, (Number(record.wins || 0) / milestone) * 100)}%`; track.append(fill);
      const meta = document.createElement('small'); meta.textContent = `${record.games || 0} partidas · ${record.totalPoints || 0} puntos · mejor ${record.bestPercent || 0}%`;
      body.append(top, track, meta); row.append(rank, body); els.scoreList.append(row);
    });
  };

  const openScore = () => {
    lastFocus = document.activeElement; renderScore(); els.scorePanel.hidden = false; els.scorePanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open'); els.closeScore.focus();
  };
  const closeScore = () => {
    els.scorePanel.hidden = true; els.scorePanel.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); lastFocus?.focus();
  };

  els.start.addEventListener('click', start);
  els.resume.addEventListener('click', resume);
  els.restart.addEventListener('click', () => { showScreen('intro'); updateSnapshot(); els.playerName.focus(); });
  els.playerName.addEventListener('input', updateSnapshot);
  els.playerName.addEventListener('keydown', (event) => { if (event.key === 'Enter') start(); });
  els.hintBtn.addEventListener('click', useHint);
  els.continueBtn.addEventListener('click', continueVault);
  els.saveExit.addEventListener('click', saveAndExit);
  els.print.addEventListener('click', () => window.print());
  [els.scoreBtn, els.resultScoreBtn].forEach((button) => button.addEventListener('click', openScore));
  els.closeScore.addEventListener('click', closeScore);
  els.scorePanel.addEventListener('click', (event) => { if (event.target === els.scorePanel) closeScore(); });
  els.full.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !els.scorePanel.hidden) closeScore(); });
  window.addEventListener('beforeunload', () => { if (els.game.classList.contains('active')) saveProgress(); });

  try { els.playerName.value = localStorage.getItem(LAST_PLAYER_KEY) || ''; } catch (_) { /* almacenamiento opcional */ }
  updateSnapshot();
})();
