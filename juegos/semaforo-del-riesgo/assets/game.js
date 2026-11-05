(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const STORAGE_KEY = 'ciberaula:score:v1';
  const LAST_PLAYER_KEY = 'ciberaula:last-player';
  const WIN_PERCENT = 75;
  const LEVEL_LABELS = { bajo: 'riesgo bajo', medio: 'riesgo medio', alto: 'riesgo alto' };

  const els = {
    intro: $('#intro'), game: $('#game'), results: $('#results'), start: $('#startBtn'), restart: $('#restartBtn'), print: $('#printBtn'),
    playerName: $('#playerName'), roundSize: $('#roundSize'), nameError: $('#nameError'), snapshot: $('#playerSnapshot'),
    snapshotLabel: $('#snapshotLabel'), snapshotBar: $('#snapshotBar'), snapshotMeta: $('#snapshotMeta'), hudPlayer: $('#hudPlayer'),
    progressText: $('#progressText'), scoreText: $('#scoreText'), streakText: $('#streakText'), progressBar: $('#progressBar'),
    quit: $('#quitBtn'), card: $('#situationCard'), caseId: $('#caseId'), caseCounter: $('#caseCounter'), caseIcon: $('#caseIcon'),
    caseTitle: $('#caseTitle'), caseText: $('#caseText'), zones: $$('.risk-zone'), feedback: $('#feedback'), feedbackMark: $('#feedbackMark'),
    feedbackLabel: $('#feedbackLabel'), feedbackTitle: $('#feedbackTitle'), feedbackText: $('#feedbackText'), actionText: $('#actionText'),
    continueBtn: $('#continueBtn'), resultPlayer: $('#resultPlayer'), resultRing: $('#resultRing'), percentText: $('#percentText'),
    resultTitle: $('#resultTitle'), resultMessage: $('#resultMessage'), victoryNotice: $('#victoryNotice'), correctText: $('#correctText'),
    wrongText: $('#wrongText'), finalScoreText: $('#finalScoreText'), review: $('#review'), scoreBtn: $('#scoreBtn'),
    resultScoreBtn: $('#resultScoreBtn'), scorePanel: $('#scorePanel'), closeScore: $('#closeScoreBtn'), scoreList: $('#scoreList'),
    emptyScore: $('#emptyScore'), scaleLegend: $('#scoreScaleLegend'), full: $('#fullBtn')
  };

  let state = { tests: [], player: '', index: 0, answers: [], score: 0, streak: 0, correct: 0, answered: false };
  let lastFocus = null;

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
  const validTest = (test) => test && test.id && test.icono && ['bajo', 'medio', 'alto'].includes(test.nivel) &&
    test.titulo && test.escenario && test.explicacion && test.accion;

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
  const getPlayerRecord = (name) => loadScore()[playerKey(name)] || {
    name: normalizeName(name), games: 0, wins: 0, totalPoints: 0, bestPercent: 0
  };
  const registerResult = (name, percent, points) => {
    const all = loadScore();
    const key = playerKey(name);
    const previous = all[key] || { name, games: 0, wins: 0, totalPoints: 0, bestPercent: 0 };
    const won = percent >= WIN_PERCENT;
    all[key] = {
      name: normalizeName(name),
      games: Number(previous.games || 0) + 1,
      wins: Number(previous.wins || 0) + (won ? 1 : 0),
      totalPoints: Number(previous.totalPoints || 0) + points,
      bestPercent: Math.max(Number(previous.bestPercent || 0), percent),
      lastPlayed: new Date().toISOString()
    };
    saveScore(all);
    return { record: all[key], won };
  };
  const milestoneFor = (wins) => Math.max(5, Math.ceil(Math.max(1, wins) / 5) * 5);

  const showScreen = (name) => {
    [els.intro, els.game, els.results].forEach((screen) => screen.classList.remove('active'));
    els[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSnapshot = () => {
    const name = normalizeName(els.playerName.value);
    els.nameError.hidden = true;
    if (!name) { els.snapshot.hidden = true; return; }
    const record = getPlayerRecord(name);
    const milestone = milestoneFor(record.wins);
    els.snapshot.hidden = false;
    safeText(els.snapshotLabel, `${record.wins} / ${milestone} victorias`);
    els.snapshotBar.style.width = `${Math.min(100, (Number(record.wins || 0) / milestone) * 100)}%`;
    safeText(els.snapshotMeta, `${record.games || 0} partidas · ${record.totalPoints || 0} puntos acumulados · mejor resultado ${record.bestPercent || 0}%`);
  };

  const updateHud = () => {
    const answered = state.answers.length;
    const total = state.tests.length;
    safeText(els.progressText, `${answered} / ${total}`);
    safeText(els.scoreText, state.score);
    safeText(els.streakText, `${state.streak} 🔥`);
    els.progressBar.style.width = `${total ? (answered / total) * 100 : 0}%`;
  };

  const resetZones = () => {
    els.zones.forEach((zone) => {
      zone.disabled = false;
      zone.classList.remove('drag-over', 'is-correct', 'is-wrong', 'is-muted');
      zone.removeAttribute('aria-pressed');
    });
  };

  const renderCase = () => {
    const test = state.tests[state.index];
    state.answered = false;
    resetZones();
    els.feedback.hidden = true;
    els.feedback.classList.remove('is-wrong');
    els.card.classList.remove('dragging', 'answered');
    els.card.draggable = true;
    safeText(els.caseId, test.id);
    safeText(els.caseCounter, `${state.index + 1} / ${state.tests.length}`);
    safeText(els.caseIcon, test.icono);
    safeText(els.caseTitle, test.titulo);
    safeText(els.caseText, test.escenario);
    window.setTimeout(() => els.card.focus({ preventScroll: true }), 50);
  };

  const start = () => {
    const name = normalizeName(els.playerName.value);
    if (!name) {
      els.nameError.hidden = false;
      els.playerName.setAttribute('aria-invalid', 'true');
      els.playerName.focus();
      return;
    }
    const bank = (window.PRUEBAS_SEMAFORO_RIESGO || []).filter(validTest);
    if (bank.length < 20) {
      window.alert('El juego necesita al menos 20 pruebas válidas en pruebas.js.');
      return;
    }
    const count = els.roundSize.value === 'all' ? bank.length : Math.min(Number(els.roundSize.value), bank.length);
    state = { tests: shuffle(bank).slice(0, count), player: name, index: 0, answers: [], score: 0, streak: 0, correct: 0, answered: false };
    try { localStorage.setItem(LAST_PLAYER_KEY, name); } catch (_) { /* almacenamiento opcional */ }
    els.playerName.removeAttribute('aria-invalid');
    els.nameError.hidden = true;
    safeText(els.hudPlayer, name);
    updateHud();
    showScreen('game');
    renderCase();
  };

  const classify = (selected) => {
    if (state.answered || !LEVEL_LABELS[selected]) return;
    const test = state.tests[state.index];
    const ok = selected === test.nivel;
    state.answered = true;
    if (ok) {
      state.correct += 1;
      state.streak += 1;
      state.score += 100 + Math.min((state.streak - 1) * 20, 100);
    } else {
      state.streak = 0;
    }
    state.answers.push({ id: test.id, selected, ok });
    els.card.draggable = false;
    els.card.classList.add('answered');
    els.zones.forEach((zone) => {
      zone.disabled = true;
      zone.classList.remove('drag-over');
      const level = zone.dataset.level;
      if (level === test.nivel) zone.classList.add('is-correct');
      else if (level === selected) zone.classList.add('is-wrong');
      else zone.classList.add('is-muted');
      zone.setAttribute('aria-pressed', level === selected ? 'true' : 'false');
    });
    els.feedback.hidden = false;
    els.feedback.classList.toggle('is-wrong', !ok);
    safeText(els.feedbackMark, ok ? '✓' : '!');
    safeText(els.feedbackLabel, ok ? 'CLASIFICACIÓN CORRECTA' : 'CLASIFICACIÓN POR REFORZAR');
    safeText(els.feedbackTitle, ok ? `Correcto: ${LEVEL_LABELS[test.nivel]}` : `Era ${LEVEL_LABELS[test.nivel]}`);
    safeText(els.feedbackText, test.explicacion);
    safeText(els.actionText, test.accion);
    safeText(els.continueBtn, state.answers.length === state.tests.length ? 'VER RESULTADO  →' : 'SIGUIENTE SITUACIÓN  →');
    updateHud();
    els.feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    els.continueBtn.focus({ preventScroll: true });
  };

  const next = () => {
    if (!state.answered) return;
    if (state.index + 1 >= state.tests.length) finish();
    else {
      state.index += 1;
      renderCase();
      window.scrollTo({ top: Math.max(0, els.game.offsetTop - 12), behavior: 'smooth' });
    }
  };

  const finish = () => {
    const total = state.tests.length;
    const percent = Math.round((state.correct / total) * 100);
    safeText(els.resultPlayer, state.player);
    safeText(els.percentText, `${percent}%`);
    els.resultRing.style.setProperty('--p', percent);
    safeText(els.correctText, `${state.correct}/${total}`);
    safeText(els.wrongText, total - state.correct);
    safeText(els.finalScoreText, state.score);
    let title; let message;
    if (percent >= 90) { title = 'Analista de señales'; message = 'Clasificas conexiones con criterio y reconoces incluso los riesgos residuales.'; }
    else if (percent >= 75) { title = 'Semáforo bajo control'; message = 'Distingues los niveles de riesgo y sabes cuándo detener una conexión.'; }
    else if (percent >= 60) { title = 'Señales intermitentes'; message = 'Tienes una base útil, pero algunas conexiones aún pueden parecer más seguras de lo que son.'; }
    else { title = 'Conexión en rojo'; message = 'Repite la misión y aplica la regla: verifica, limita y protege antes de conectarte.'; }
    safeText(els.resultTitle, title);
    safeText(els.resultMessage, message);
    const saved = registerResult(state.player, percent, state.score);
    els.victoryNotice.className = `victory-notice ${saved.won ? 'won' : 'practice'}`;
    safeText(els.victoryNotice, saved.won ? `VICTORIA REGISTRADA · ${saved.record.wins} ganadas` : `PARTIDA REGISTRADA · alcanza ${WIN_PERCENT}% para sumar una victoria`);
    els.review.replaceChildren();
    const missed = state.tests.filter((test) => !state.answers.find((answer) => answer.id === test.id)?.ok);
    if (missed.length) {
      const heading = document.createElement('h3');
      heading.textContent = 'Situaciones para repasar';
      els.review.append(heading);
      missed.forEach((test) => {
        const article = document.createElement('article');
        const name = document.createElement('b');
        const text = document.createElement('p');
        name.textContent = `${test.id} · ${test.titulo} · ${LEVEL_LABELS[test.nivel]}`;
        text.textContent = `${test.explicacion} ${test.accion}`;
        article.append(name, text);
        els.review.append(article);
      });
    }
    showScreen('results');
  };

  const renderScore = () => {
    const records = Object.values(loadScore()).filter((record) => record && record.name)
      .sort((a, b) => (Number(b.wins || 0) - Number(a.wins || 0)) || (Number(b.totalPoints || 0) - Number(a.totalPoints || 0)));
    els.scoreList.replaceChildren();
    els.emptyScore.hidden = records.length > 0;
    const maxWins = Math.max(0, ...records.map((record) => Number(record.wins || 0)));
    const milestone = milestoneFor(maxWins);
    els.scaleLegend.replaceChildren();
    for (let value = 0; value <= milestone; value += 1) {
      if (value === 0 || value === milestone || value % 5 === 0) {
        const tick = document.createElement('span');
        tick.textContent = String(value);
        tick.style.left = `${(value / milestone) * 100}%`;
        els.scaleLegend.append(tick);
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
      const track = document.createElement('div'); track.className = 'victory-scale';
      track.setAttribute('aria-label', `${record.name}: ${record.wins || 0} de ${milestone} victorias en la escala`);
      const fill = document.createElement('i'); fill.style.width = `${Math.min(100, (Number(record.wins || 0) / milestone) * 100)}%`;
      track.append(fill);
      const meta = document.createElement('small'); meta.textContent = `${record.games || 0} partidas · ${record.totalPoints || 0} puntos · mejor ${record.bestPercent || 0}%`;
      body.append(top, track, meta); row.append(rank, body); els.scoreList.append(row);
    });
  };

  const openScore = () => {
    lastFocus = document.activeElement;
    renderScore();
    els.scorePanel.hidden = false;
    els.scorePanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    els.closeScore.focus();
  };
  const closeScore = () => {
    els.scorePanel.hidden = true;
    els.scorePanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocus?.focus();
  };

  els.card.addEventListener('dragstart', (event) => {
    if (state.answered) { event.preventDefault(); return; }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', state.tests[state.index]?.id || 'situacion');
    els.card.classList.add('dragging');
  });
  els.card.addEventListener('dragend', () => {
    els.card.classList.remove('dragging');
    els.zones.forEach((zone) => zone.classList.remove('drag-over'));
  });
  els.zones.forEach((zone) => {
    zone.addEventListener('click', () => classify(zone.dataset.level));
    zone.addEventListener('dragenter', (event) => { event.preventDefault(); if (!state.answered) zone.classList.add('drag-over'); });
    zone.addEventListener('dragover', (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (event) => { event.preventDefault(); zone.classList.remove('drag-over'); classify(zone.dataset.level); });
  });

  els.start.addEventListener('click', start);
  els.restart.addEventListener('click', () => { showScreen('intro'); updateSnapshot(); els.playerName.focus(); });
  els.playerName.addEventListener('input', updateSnapshot);
  els.playerName.addEventListener('keydown', (event) => { if (event.key === 'Enter') start(); });
  els.quit.addEventListener('click', () => { if (window.confirm('¿Salir de la misión actual? El intento no se registrará.')) showScreen('intro'); });
  els.continueBtn.addEventListener('click', next);
  els.print.addEventListener('click', () => window.print());
  [els.scoreBtn, els.resultScoreBtn].forEach((button) => button.addEventListener('click', openScore));
  els.closeScore.addEventListener('click', closeScore);
  els.scorePanel.addEventListener('click', (event) => { if (event.target === els.scorePanel) closeScore(); });
  els.full.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.scorePanel.hidden) closeScore();
    if (!els.game.classList.contains('active') || state.answered || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === '1') classify('bajo');
    if (event.key === '2') classify('medio');
    if (event.key === '3') classify('alto');
  });

  try { els.playerName.value = localStorage.getItem(LAST_PLAYER_KEY) || ''; } catch (_) { /* almacenamiento opcional */ }
  updateSnapshot();
})();
