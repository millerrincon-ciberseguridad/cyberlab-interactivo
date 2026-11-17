import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync(new URL('../js/tests.js', import.meta.url),'utf8');
const sandbox={window:{}}; vm.createContext(sandbox); vm.runInContext(src,sandbox);
const tests=sandbox.window.PHISHING_TESTS;
const errors=[];
if(!Array.isArray(tests)) errors.push('PHISHING_TESTS no es un arreglo');
if(tests.length<30) errors.push(`Solo hay ${tests.length} pruebas`);
const ids=new Set();
for(const [i,t] of tests.entries()){
 for(const k of ['id','level','type','answer','title','body','signals','explanation','action']) if(t[k]===undefined) errors.push(`#${i+1}: falta ${k}`);
 if(ids.has(t.id)) errors.push(`ID duplicado: ${t.id}`); ids.add(t.id);
 if(![1,2,3,4].includes(t.level)) errors.push(`${t.id}: nivel inválido`);
 if(!['phishing','legit'].includes(t.answer)) errors.push(`${t.id}: respuesta inválida`);
 if(!Array.isArray(t.signals)||t.signals.length<3) errors.push(`${t.id}: necesita al menos 3 señales`);
 if(!t.signals?.some(s=>s.kind==='danger') && t.answer==='phishing') errors.push(`${t.id}: phishing sin señal danger`);
 if(!t.signals?.some(s=>s.kind==='safe') && t.answer==='legit') errors.push(`${t.id}: legítimo sin señal safe`);
}
for(let level=1;level<=4;level++){ const n=tests.filter(t=>t.level===level).length; if(n<7) errors.push(`Nivel ${level}: solo ${n} pruebas`); }
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`OK: ${tests.length} pruebas válidas; `+[1,2,3,4].map(l=>`nivel ${l}: ${tests.filter(t=>t.level===l).length}`).join(', '));
