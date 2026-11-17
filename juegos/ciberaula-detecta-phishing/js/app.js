(()=>{
  'use strict';
  const cfg=window.CIBERAULA_PHISHING_CONFIG||{};
  const allTests=Array.isArray(window.PHISHING_TESTS)?window.PHISHING_TESTS:[];
  const $=(s)=>document.querySelector(s);
  const $$=(s)=>[...document.querySelectorAll(s)];
  const channelNames={email:'CORREO',sms:'SMS',qr:'CÓDIGO QR',call:'LLAMADA',chat:'CHAT',login:'ACCESO/OAUTH',push:'MFA',calendar:'CALENDARIO'};
  const levelNames={1:'Fundamentos engañosos',2:'Canales y suplantación',3:'Ataques avanzados',4:'Escenarios expertos'};
  const iconFor={email:'✉',sms:'▣',qr:'▦',call:'☎',chat:'◌',login:'▣',push:'◆',calendar:'▤'};
  const hintByType={email:'Compare el dominio carácter por carácter y separe el nombre visible de la dirección real.',sms:'No confíe en el hilo ni en el nombre del remitente: evalúe destino, petición y contexto.',qr:'Un QR solo oculta una URL. Verifique su origen físico o digital y la vista previa del destino.',call:'La voz y el número mostrado pueden suplantarse. Pregúntese qué secreto o acción irreversible solicita.',chat:'Revise si la cuenta es externa, si el proceso es normal y si la identidad puede confirmarse por otro canal.',login:'Evalúe el origen real, los permisos solicitados y si usted inició el flujo.',push:'Una notificación auténtica puede haber sido provocada por un atacante. ¿Usted inició la autenticación?',calendar:'El calendario puede mostrar invitaciones no verificadas. Revise organizador, adjuntos e instrucciones.'};
  const state={tests:[],index:0,score:0,correct:0,streak:0,player:'',answered:false,hintUsed:false,sound:true,perLevel:{1:{correct:0,total:0},2:{correct:0,total:0},3:{correct:0,total:0},4:{correct:0,total:0}},cumulative:0};

  function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function domainOf(value=''){
    try{const raw=value.includes('@')?value.split('@').pop():value;return new URL(raw.startsWith('http')?raw:`https://${raw}`).hostname}catch{return value}
  }
  function shuffle(a){const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
  function buildOrder(){
    return [1,2,3,4].flatMap(level=>{const group=allTests.filter(t=>t.level===level);return cfg.shuffleWithinLevel===false?group:shuffle(group)});
  }
  function safeStoreGet(key){try{return localStorage.getItem(key)}catch{return null}}
  function safeStoreSet(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
  function readTotal(){
    const raw=safeStoreGet(cfg.scoreKey||'ciberaula:score:v1'); if(!raw)return 0;
    try{const p=JSON.parse(raw);if(typeof p==='number')return p;if(p&&typeof p==='object')return Number(p.total??p.score??0)||0}catch{const n=Number(raw);if(Number.isFinite(n))return n}return 0;
  }
  function addCumulative(delta){
    if(!delta)return state.cumulative;
    const key=cfg.scoreKey||'ciberaula:score:v1';let envelope={version:1,total:0,games:{}};
    const raw=safeStoreGet(key);
    if(raw){try{const parsed=JSON.parse(raw);if(typeof parsed==='number')envelope.total=parsed;else if(parsed&&typeof parsed==='object')envelope={...parsed,total:Number(parsed.total??parsed.score??0)||0,games:{...(parsed.games||{})}}}catch{envelope.total=Number(raw)||0}}
    envelope.version=1;envelope.total=(Number(envelope.total)||0)+delta;envelope.updatedAt=new Date().toISOString();envelope.games['detecta-phishing']={...(envelope.games['detecta-phishing']||{}),lastPlayer:state.player,lastDelta:delta,lastPlayedAt:envelope.updatedAt};
    safeStoreSet(key,JSON.stringify(envelope));state.cumulative=envelope.total;
    window.dispatchEvent(new CustomEvent('ciberaula:score:v1',{detail:{version:1,gameId:'detecta-phishing',player:state.player,delta,total:envelope.total}}));
    return envelope.total;
  }
  function setConfig(){
    $('#home-link').href=cfg.homeUrl||'../../index.html';$$('.result-actions .home-button').forEach(a=>a.href=cfg.homeUrl||'../../index.html');
    $('#brand-logo').src=cfg.logoUrl||'assets/logo-configurable.svg';$('#brand-logo').alt=cfg.logoAlt||'Logo';
    if(cfg.backgroundUrl)document.documentElement.style.setProperty('--game-bg',`url("${cfg.backgroundUrl}")`);
    document.title=`${cfg.gameTitle||'Detecta el Phishing'} | ${cfg.organization||'Ciberaula'}`;
  }
  function beep(kind='ok'){
    if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;const ctx=new C();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.value=kind==='ok'?660:kind==='warn'?220:440;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.17);o.start();o.stop(ctx.currentTime+.18);o.onended=()=>ctx.close()}catch{}
  }
  function toast(text,type=''){const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=text;$('#toast-region').append(el);setTimeout(()=>el.remove(),3600)}
  function senderBlock(t){return `<div class="sender-row"><div class="sender-avatar">${esc(iconFor[t.type]||'@')}</div><div class="sender-info"><strong>${esc(t.senderName)}</strong><span>${esc(t.sender||'')}</span></div><span class="message-time">${esc(t.time||'')}</span></div>`}
  function linkBlocks(t){return (t.links||[]).map(l=>`<div class="sim-link" aria-label="Enlace simulado, no navegable"><strong>${esc(l.label)}</strong><code>Destino real: ${esc(l.url)}</code></div>`).join('')}
  function attachment(t){return t.attachment?`<div class="attachment"><span class="attachment-icon">▧</span><div><strong>${esc(t.attachment.name)}</strong><small>${esc(t.attachment.note||'Adjunto')}</small></div></div>`:''}
  function baseBody(t){return `<div class="subject-line">${esc(t.subject||t.title)}</div><div class="message-body">${(t.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${linkBlocks(t)}${attachment(t)}${t.quoted?`<div class="quoted">Hilo citado: ${esc(t.quoted)}</div>`:''}</div>`}
  function renderMessage(t){
    const top=`<div class="message-top"><strong>${esc(channelNames[t.type]||t.type)}</strong><span>SIMULACIÓN SEGURA · elementos no interactivos</span></div>`;
    if(t.type==='sms')return `${top}<div class="sms-shell"><div class="sms-contact">${esc(t.senderName)} · ${esc(t.sender)}</div><div class="sms-bubble">${(t.body||[]).map(esc).join('<br><br>')}${linkBlocks(t)}<div class="sms-meta">${esc(t.time)} · entregado</div></div></div>`;
    if(t.type==='call')return `${top}<div class="call-shell"><div class="call-icon">☎</div><h3>${esc(t.senderName)}</h3><div class="call-number">${esc(t.sender)}</div><div class="transcript">${(t.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}</div></div>`;
    if(t.type==='qr')return `${top}<div class="qr-layout"><div class="qr-card"><canvas id="qr-canvas" width="210" height="210" aria-label="Código QR simulado"></canvas><small>${esc(t.qr?.label||'Código QR')}</small></div><div>${senderBlock(t)}${baseBody(t)}</div></div>`;
    if(t.type==='chat')return `${top}<div class="chat-shell"><div class="chat-header">Conversación · ${esc(t.sender||'')}</div><div class="chat-bubble">${senderBlock(t)}${baseBody(t)}</div></div>`;
    if(t.type==='login')return `${top}<div class="login-shell"><div class="consent-card">${senderBlock(t)}${baseBody(t)}</div></div>`;
    if(t.type==='push')return `${top}<div class="push-shell"><div class="push-card"><div class="push-title"><strong>${esc(t.senderName)}</strong><span>ahora</span></div>${baseBody(t)}</div></div>`;
    if(t.type==='calendar')return `${top}<div class="calendar-shell"><div class="calendar-card">${senderBlock(t)}${baseBody(t)}</div></div>`;
    return `${top}<div class="message-content">${senderBlock(t)}${baseBody(t)}</div>`;
  }
  function drawFakeQR(payload=''){
    const canvas=$('#qr-canvas');if(!canvas)return;const c=canvas.getContext('2d'),n=29,size=canvas.width/n;let seed=2166136261;for(const ch of payload){seed^=ch.charCodeAt(0);seed=Math.imul(seed,16777619)}
    c.fillStyle='#fff';c.fillRect(0,0,canvas.width,canvas.height);const matrix=Array.from({length:n},()=>Array(n).fill(false));
    function finder(x,y){for(let r=0;r<7;r++)for(let col=0;col<7;col++)matrix[y+r][x+col]=(r===0||r===6||col===0||col===6||(r>=2&&r<=4&&col>=2&&col<=4))}
    finder(1,1);finder(n-8,1);finder(1,n-8);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){if((x<9&&y<9)||(x>n-10&&y<9)||(x<9&&y>n-10))continue;seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;matrix[y][x]=(seed>>>0)%100<47}
    c.fillStyle='#101820';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(matrix[y][x])c.fillRect(Math.floor(x*size),Math.floor(y*size),Math.ceil(size),Math.ceil(size));
  }
  function technicalHtml(t){
    const rows=[['Canal',channelNames[t.type]||t.type],['Identidad visible',t.senderName],['Origen declarado',t.sender||'No informado'],['Dominio de origen',domainOf(t.sender||'No informado')],['Asunto/acción',t.subject||t.title]];
    (t.links||[]).forEach((l,i)=>rows.push([`Destino ${i+1}`,l.url]));if(t.qr)rows.push(['Contenido QR',t.qr.payload]);if(t.attachment)rows.push(['Adjunto',`${t.attachment.name} — ${t.attachment.note||''}`]);
    return `<dl>${rows.map(([a,b])=>`<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>`;
  }
  function updateStatus(){
    const t=state.tests[state.index];$('#player-display').textContent=state.player;$('#level-display').textContent=`${t?.level||4}/4`;$('#progress-display').textContent=`${Math.min(state.index+1,state.tests.length)}/${state.tests.length}`;$('#streak-display').textContent=state.streak;$('#score-display').textContent=state.score.toLocaleString('es-CO');
    const done=state.index+(state.answered?1:0);const bar=$('.progress-track');bar.setAttribute('aria-valuenow',String(done));$('#progress-fill').style.width=`${(done/state.tests.length)*100}%`;
  }
  function showLevelNotice(level){const el=$('#level-notice');el.textContent=`Nivel ${level}: ${levelNames[level]}`;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3800)}
  function renderCurrent(){
    const t=state.tests[state.index];if(!t)return finish();state.answered=false;state.hintUsed=false;
    if(state.index===0||state.tests[state.index-1].level!==t.level)showLevelNotice(t.level);
    $('#level-badge').textContent=`NIVEL ${t.level}`;$('#channel-badge').textContent=channelNames[t.type]||t.type.toUpperCase();$('#points-badge').textContent=`${t.points} pts`;$('#challenge-title').textContent=t.title;$('#message-frame').innerHTML=renderMessage(t);drawFakeQR(t.qr?.payload);
    $('#technical-panel').innerHTML=technicalHtml(t);$('#technical-panel').hidden=true;$('#inspect-button').setAttribute('aria-expanded','false');$('#hint-panel').hidden=true;$('#hint-button').disabled=false;$('#hint-button').innerHTML='💡 Usar pista <span>(−30%)</span>';
    $('#feedback').hidden=true;$('#feedback').className='feedback';$('#decision-fieldset').disabled=false;$$('.decision').forEach(b=>{b.disabled=false;b.classList.remove('selected','correct','wrong')});
    $('#next-button').textContent=state.index===state.tests.length-1?'Ver resultado →':'Siguiente prueba →';updateStatus();window.scrollTo({top:0,behavior:'smooth'});
  }
  function answer(value){
    if(state.answered)return;const t=state.tests[state.index];state.answered=true;const correct=value===t.answer;let earned=0;
    if(correct){state.correct++;state.streak++;earned=Math.round(t.points*(state.hintUsed?.7:1));if(state.streak>0&&state.streak%3===0){const bonus=25*t.level;earned+=bonus;toast(`Racha de ${state.streak}: +${bonus} puntos`)}state.score+=earned;addCumulative(earned);beep('ok')}else{state.streak=0;beep('warn')}
    state.perLevel[t.level].total++;if(correct)state.perLevel[t.level].correct++;
    $$('.decision').forEach(b=>{b.disabled=true;if(b.dataset.answer===value)b.classList.add('selected',correct?'correct':'wrong')});
    const fb=$('#feedback');fb.hidden=false;fb.classList.add(correct?'correct':'wrong');$('#feedback-icon').textContent=correct?'✓':'!';$('#feedback-kicker').textContent=correct?`Análisis correcto · +${earned} puntos`:'Decisión incorrecta · revisa las evidencias';$('#feedback-title').textContent=t.answer==='phishing'?'Este caso es phishing':'Este caso es legítimo';$('#feedback-explanation').textContent=t.explanation;
    $('#signals-list').innerHTML=t.signals.map(s=>`<div class="signal ${esc(s.kind)}"><span class="signal-icon">${s.kind==='danger'?'⚠':s.kind==='safe'?'✓':'i'}</span><div><strong>${esc(s.label)}</strong><span>${esc(s.detail)}</span></div></div>`).join('');$('#action-text').textContent=t.action;$('#decision-fieldset').disabled=true;updateStatus();setTimeout(()=>fb.focus({preventScroll:true}),50);fb.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function next(){if(!state.answered)return;if(state.index>=state.tests.length-1)return finish();state.index++;renderCurrent()}
  function finish(){
    $('#game-screen').hidden=true;$('#result-screen').hidden=false;const accuracy=Math.round((state.correct/state.tests.length)*100);$('#result-name').textContent=state.player;$('#result-score').textContent=state.score.toLocaleString('es-CO');$('#result-correct').textContent=`${state.correct}/${state.tests.length}`;$('#result-accuracy').textContent=`${accuracy}%`;$('#result-total').textContent=state.cumulative.toLocaleString('es-CO');$('#result-date').textContent=new Intl.DateTimeFormat('es-CO',{dateStyle:'long',timeStyle:'short'}).format(new Date());
    $('#result-summary').textContent=accuracy>=90?'Excelente criterio: detectas señales técnicas y contextuales incluso en ataques modernos.':accuracy>=75?'Buen desempeño: reconoces la mayoría de los engaños; refuerza los casos donde el canal era auténtico.':accuracy>=55?'Vas por buen camino: antes de actuar, practica la verificación independiente de identidad, dominio y proceso.':'Este laboratorio reveló puntos de mejora: detente ante urgencia, secretos y cambios de proceso, aunque la apariencia sea perfecta.';
    $('#level-results').innerHTML=[1,2,3,4].map(l=>{const x=state.perLevel[l],pct=x.total?Math.round(x.correct/x.total*100):0;return `<div class="level-result"><span>Nivel ${l}</span><strong>${x.correct}/${x.total}</strong><span>${pct}% · ${esc(levelNames[l])}</span></div>`}).join('');
    const bestKey='ciberaula:detecta-phishing:best';const old=Number(safeStoreGet(bestKey)||0);if(state.score>old){safeStoreSet(bestKey,String(state.score));toast('Nuevo récord personal')}
    window.scrollTo({top:0,behavior:'smooth'});beep('ok');
  }
  function start(name){
    state.tests=buildOrder();state.index=0;state.score=0;state.correct=0;state.streak=0;state.player=name.trim();state.answered=false;state.perLevel={1:{correct:0,total:0},2:{correct:0,total:0},3:{correct:0,total:0},4:{correct:0,total:0}};state.cumulative=readTotal();safeStoreSet('ciberaula:detecta-phishing:player',state.player);$('#start-screen').hidden=true;$('#result-screen').hidden=true;$('#game-screen').hidden=false;renderCurrent();toast('Laboratorio iniciado: analiza antes de decidir');
  }
  function restart(){start(state.player)}
  function bind(){
    $('#player-form').addEventListener('submit',e=>{e.preventDefault();const name=$('#player-name').value.trim();if(name.length<2){toast('Escribe un nombre de al menos 2 caracteres','warning');return}start(name)});
    $$('.decision').forEach(b=>b.addEventListener('click',()=>answer(b.dataset.answer)));$('#next-button').addEventListener('click',next);
    $('#inspect-button').addEventListener('click',()=>{const p=$('#technical-panel');p.hidden=!p.hidden;$('#inspect-button').setAttribute('aria-expanded',String(!p.hidden));$('#inspect-button').textContent=p.hidden?'⌕ Inspeccionar datos técnicos':'× Ocultar datos técnicos'});
    $('#hint-button').addEventListener('click',()=>{if(state.hintUsed)return;state.hintUsed=true;const t=state.tests[state.index];$('#hint-panel').textContent=hintByType[t.type]||'Compruebe la identidad y la petición por un canal independiente.';$('#hint-panel').hidden=false;$('#hint-button').disabled=true;$('#hint-button').innerHTML='💡 Pista utilizada <span>(−30%)</span>';toast('La respuesta correcta valdrá el 70%','warning')});
    $('#sound-toggle').addEventListener('click',()=>{state.sound=!state.sound;$('#sound-toggle').setAttribute('aria-pressed',String(state.sound));$('#sound-toggle').innerHTML=`${state.sound?'🔊':'🔇'} <span>Sonido</span>`});$('#print-button').addEventListener('click',()=>window.print());$('#restart-button').addEventListener('click',restart);
    document.addEventListener('keydown',e=>{if($('#game-screen').hidden)return;if((e.target instanceof HTMLInputElement)||(e.target instanceof HTMLTextAreaElement))return;if(e.key==='1')answer('legit');if(e.key==='2')answer('phishing');if(e.key.toLowerCase()==='n')next()});
  }
  function init(){setConfig();bind();const saved=safeStoreGet('ciberaula:detecta-phishing:player');if(saved)$('#player-name').value=saved;if(allTests.length<30){$('#player-form').innerHTML='<p class="start-warning">No se cargó correctamente el banco de pruebas.</p>';console.error('Banco de pruebas incompleto')} }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
