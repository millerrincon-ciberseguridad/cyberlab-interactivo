(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const STORAGE_KEY = 'ciberaula:score:v1';
  const LAST_PLAYER_KEY = 'ciberaula:last-player';
  const WIN_PERCENT = 75;

  const els = {
    intro: $('#intro'), game: $('#game'), results: $('#results'), start: $('#startBtn'), restart: $('#restartBtn'), print: $('#printBtn'),
    playerName: $('#playerName'), roundSize: $('#roundSize'), nameError: $('#nameError'), snapshot: $('#playerSnapshot'),
    snapshotLabel: $('#snapshotLabel'), snapshotBar: $('#snapshotBar'), snapshotMeta: $('#snapshotMeta'), hudPlayer: $('#hudPlayer'),
    progressText: $('#progressText'), scoreText: $('#scoreText'), streakText: $('#streakText'), progressBar: $('#progressBar'),
    hotspotLayer: $('#hotspotLayer'), sceneViewport: $('#sceneViewport'), remainingText: $('#remainingText'), mapHint: $('#mapHintBtn'), quit: $('#quitBtn'),
    challengePanel: $('#challengePanel'), challengeId: $('#challengeId'), challengeIcon: $('#challengeIcon'), challengeTitle: $('#challengeTitle'),
    challengeQuestion: $('#challengeQuestion'), optionList: $('#optionList'), challengeFeedback: $('#challengeFeedback'),
    feedbackTitle: $('#feedbackTitle'), feedbackText: $('#feedbackText'), actionText: $('#actionText'), continueBtn: $('#continueBtn'),
    closeChallenge: $('#closeChallengeBtn'), resultPlayer: $('#resultPlayer'), resultRing: $('#resultRing'), percentText: $('#percentText'),
    resultTitle: $('#resultTitle'), resultMessage: $('#resultMessage'), victoryNotice: $('#victoryNotice'), correctText: $('#correctText'),
    wrongText: $('#wrongText'), finalScoreText: $('#finalScoreText'), review: $('#review'), scoreBtn: $('#scoreBtn'),
    resultScoreBtn: $('#resultScoreBtn'), scorePanel: $('#scorePanel'), closeScore: $('#closeScoreBtn'), scoreList: $('#scoreList'),
    emptyScore: $('#emptyScore'), scaleLegend: $('#scoreScaleLegend'), full: $('#fullBtn')
  };

  let state = { tests: [], player: '', found: new Set(), answers: new Map(), score: 0, streak: 0, correct: 0, current: null, answered: false };
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
  const validTest = (test) => test && test.id && test.icono && Number.isFinite(Number(test.x)) && Number.isFinite(Number(test.y)) &&
    test.titulo && test.pregunta && Array.isArray(test.opciones) && test.opciones.length >= 2 &&
    Number.isInteger(test.correcta) && test.correcta >= 0 && test.correcta < test.opciones.length && test.explicacion && test.accion;

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
    const total = state.tests.length;
    const found = state.found.size;
    safeText(els.progressText, `${found} / ${total}`);
    safeText(els.scoreText, state.score);
    safeText(els.streakText, `${state.streak} 🔥`);
    els.progressBar.style.width = `${total ? (found / total) * 100 : 0}%`;
    safeText(els.remainingText, `${Math.max(0, total - found)} ${total - found === 1 ? 'riesgo pendiente' : 'riesgos pendientes'}`);
  };

  const renderHotspots = () => {
    els.hotspotLayer.replaceChildren();
    state.tests.forEach((test) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `hotspot${state.found.has(test.id) ? ' solved' : ''}`;
      button.style.setProperty('--x', `${Math.max(3, Math.min(97, Number(test.x)))}%`);
      button.style.setProperty('--y', `${Math.max(5, Math.min(95, Number(test.y)))}%`);
      button.dataset.testId = test.id;
      button.textContent = state.found.has(test.id) ? '✓' : test.icono;
      button.setAttribute('aria-label', state.found.has(test.id) ? `${test.titulo}: neutralizado` : `Revisar objeto: ${test.titulo}`);
      button.title = state.found.has(test.id) ? `${test.titulo} · neutralizado` : test.titulo;
      button.disabled = state.found.has(test.id);
      button.addEventListener('click', () => openChallenge(test, button));
      els.hotspotLayer.append(button);
    });
  };

  const start = () => {
    const name = normalizeName(els.playerName.value);
    if (!name) {
      els.nameError.hidden = false;
      els.playerName.setAttribute('aria-invalid', 'true');
      els.playerName.focus();
      return;
    }
    const bank = (window.PRUEBAS_HACKER_DENTRO || []).filter(validTest);
    if (bank.length < 20) {
      window.alert('El juego necesita al menos 20 pruebas válidas en pruebas.js.');
      return;
    }
    const count = els.roundSize.value === 'all' ? bank.length : Math.min(Number(els.roundSize.value), bank.length);
    state = { tests: shuffle(bank).slice(0, count), player: name, found: new Set(), answers: new Map(), score: 0, streak: 0, correct: 0, current: null, answered: false };
    try { localStorage.setItem(LAST_PLAYER_KEY, name); } catch (_) { /* almacenamiento opcional */ }
    els.playerName.removeAttribute('aria-invalid');
    els.nameError.hidden = true;
    safeText(els.hudPlayer, name);
    renderHotspots();
    updateHud();
    showScreen('game');
    window.setTimeout(() => {
      els.sceneViewport.scrollLeft = Math.max(0, (els.sceneViewport.scrollWidth - els.sceneViewport.clientWidth) / 2);
      els.sceneViewport.focus({ preventScroll: true });
    }, 80);
  };

  const openChallenge = (test, button) => {
    if (state.found.has(test.id)) return;
    lastFocus = button;
    state.current = test;
    state.answered = false;
    safeText(els.challengeId, test.id);
    safeText(els.challengeIcon, test.icono);
    safeText(els.challengeTitle, test.titulo);
    safeText(els.challengeQuestion, test.pregunta);
    els.challengeFeedback.hidden = true;
    els.challengeFeedback.className = 'challenge-feedback';
    els.optionList.replaceChildren();
    test.opciones.forEach((option, index) => {
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.className = 'option';
      const letter = document.createElement('b');
      letter.textContent = String.fromCharCode(65 + index);
      const label = document.createElement('span');
      label.textContent = option;
      choice.append(letter, label);
      choice.addEventListener('click', () => answer(index));
      els.optionList.append(choice);
    });
    els.challengePanel.hidden = false;
    els.challengePanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    els.optionList.querySelector('button')?.focus();
  };

  const answer = (selected) => {
    if (state.answered || !state.current) return;
    state.answered = true;
    const test = state.current;
    const ok = selected === test.correcta;
    if (ok) {
      state.correct += 1;
      state.streak += 1;
      state.score += 100 + Math.min((state.streak - 1) * 20, 100);
    } else {
      state.streak = 0;
    }
    state.answers.set(test.id, { ok, selected });
    state.found.add(test.id);
    [...els.optionList.children].forEach((button, index) => {
      button.disabled = true;
      if (index === test.correcta) button.classList.add('correct');
      if (index === selected && !ok) button.classList.add('wrong');
    });
    els.challengeFeedback.hidden = false;
    els.challengeFeedback.classList.toggle('is-wrong', !ok);
    safeText(els.feedbackTitle, ok ? '✓ RIESGO NEUTRALIZADO' : '✕ DECISIÓN INSEGURA');
    safeText(els.feedbackText, test.explicacion);
    safeText(els.actionText, test.accion);
    updateHud();
    renderHotspots();
    els.continueBtn.focus();
  };

  const hideChallenge = () => {
    els.challengePanel.hidden = true;
    els.challengePanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    state.current = null;
    state.answered = false;
  };

  const continueExploration = () => {
    const completed = state.tests.length > 0 && state.found.size === state.tests.length;
    hideChallenge();
    if (completed) finish();
    else lastFocus?.focus();
  };

  const closeChallenge = () => {
    if (state.answered) continueExploration();
    else { hideChallenge(); lastFocus?.focus(); }
  };

  const trackRisks = () => {
    if (!els.game.classList.contains('active')) return;
    state.score = Math.max(0, state.score - 25);
    updateHud();
    const pending = [...els.hotspotLayer.querySelectorAll('.hotspot:not(.solved)')];
    pending.forEach((button) => button.classList.add('tracking'));
    window.setTimeout(() => pending.forEach((button) => button.classList.remove('tracking')), 3100);
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
    if (percent >= 90) { title = 'Radar de élite'; message = 'Detectaste los detalles que convierten una oficina en un objetivo difícil.'; }
    else if (percent >= 75) { title = 'Oficina protegida'; message = 'Tienes buen criterio. Refuerza los pocos riesgos que todavía pueden pasar inadvertidos.'; }
    else if (percent >= 60) { title = 'Perímetro vulnerable'; message = 'Encuentras amenazas, pero algunas decisiones aún abren oportunidades al atacante.'; }
    else { title = 'El hacker sigue dentro'; message = 'Repite la misión: observa, verifica y aplica el control antes de actuar.'; }
    safeText(els.resultTitle, title);
    safeText(els.resultMessage, message);
    const saved = registerResult(state.player, percent, state.score);
    els.victoryNotice.className = `victory-notice ${saved.won ? 'won' : 'practice'}`;
    safeText(els.victoryNotice, saved.won ? `VICTORIA REGISTRADA · ${saved.record.wins} ganadas` : `PARTIDA REGISTRADA · alcanza ${WIN_PERCENT}% para sumar una victoria`);
    els.review.replaceChildren();
    const missed = state.tests.filter((test) => !state.answers.get(test.id)?.ok);
    if (missed.length) {
      const heading = document.createElement('h3');
      heading.textContent = 'Riesgos para repasar';
      els.review.append(heading);
      missed.forEach((test) => {
        const article = document.createElement('article');
        const name = document.createElement('b');
        const text = document.createElement('p');
        name.textContent = `${test.id} · ${test.titulo}`;
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

  els.start.addEventListener('click', start);
  els.restart.addEventListener('click', () => { showScreen('intro'); updateSnapshot(); els.playerName.focus(); });
  els.playerName.addEventListener('input', updateSnapshot);
  els.playerName.addEventListener('keydown', (event) => { if (event.key === 'Enter') start(); });
  els.mapHint.addEventListener('click', trackRisks);
  els.quit.addEventListener('click', () => { if (window.confirm('¿Salir de la misión actual? El intento no se registrará.')) showScreen('intro'); });
  els.continueBtn.addEventListener('click', continueExploration);
  els.closeChallenge.addEventListener('click', closeChallenge);
  els.challengePanel.addEventListener('click', (event) => { if (event.target === els.challengePanel && !state.answered) closeChallenge(); });
  els.print.addEventListener('click', () => window.print());
  [els.scoreBtn, els.resultScoreBtn].forEach((button) => button.addEventListener('click', openScore));
  els.closeScore.addEventListener('click', closeScore);
  els.scorePanel.addEventListener('click', (event) => { if (event.target === els.scorePanel) closeScore(); });
  els.full.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!els.scorePanel.hidden) closeScore();
    else if (!els.challengePanel.hidden) closeChallenge();
  });

  try { els.playerName.value = localStorage.getItem(LAST_PLAYER_KEY) || ''; } catch (_) { /* almacenamiento opcional */ }
  updateSnapshot();
})();
