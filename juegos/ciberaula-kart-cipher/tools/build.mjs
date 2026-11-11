#!/usr/bin/env node
/**
 * Genera la versión publicada de Kart Cipher sin dependencias npm.
 * - Fuente editable: src/game.source.js
 * - Salida publicada: game.js y dist/game.js
 * - Dist completa: dist/
 *
 * La transformación reduce espacios/comentarios y cambia identificadores internos
 * estables. Esto dificulta la lectura casual, pero NO impide copiar el código: todo
 * navegador descarga los recursos necesarios para ejecutar el juego.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourcePath=path.join(root,'src','game.source.js');
const source=fs.readFileSync(sourcePath,'utf8');
const mapping=new Map(Object.entries({
 RIVAL_DEFS:'_0x12',THREATS:'_0x13',ITEMS:'_0x14',ART:'_0x15',
 loadArt:'_0x21',artReady:'_0x22',buildTrack:'_0x23',buildMapPath:'_0x24',makeObjects:'_0x25',setupRace:'_0x26',currentSegment:'_0x27',sampleSegment:'_0x28',curveWindow:'_0x29',obstacleAhead:'_0x2a',chooseSafeLane:'_0x2b',vehicleAhead:'_0x2c',planRival:'_0x2d',resolveRivalPair:'_0x2e',updateAI:'_0x2f',triggerCrash:'_0x30',resolvePlayerRival:'_0x31',updateObjects:'_0x32',spawnDriveEffects:'_0x33',updatePlayer:'_0x34',syncControlVisuals:'_0x35',updatePosition:'_0x36',updateParticles:'_0x37',particle:'_0x38',burst:'_0x39',useItem:'_0x3a',project:'_0x3b',resize:'_0x3c',drawSky:'_0x3d',polygon:'_0x3e',prepareRoad:'_0x3f',drawRoad:'_0x40',screenObject:'_0x41',drawWorldLabel:'_0x42',drawScenery:'_0x43',drawObstacle:'_0x44',drawPickup:'_0x45',drawRival:'_0x46',drawPhotorealKart:'_0x47',drawKartParts:'_0x48',drawAnonymousDriver:'_0x49',drawPlayer:'_0x4a',drawObjects:'_0x4b',drawParticles:'_0x4c',mapPoint:'_0x4d',drawMinimap:'_0x4e',updateHud:'_0x4f',announce:'_0x50',finishRace:'_0x52',showResults:'_0x53',togglePause:'_0x54',tone:'_0x55',startEngine:'_0x56',stopEngine:'_0x57',updateEngine:'_0x58',kartBody:'_0x60',obbContact:'_0x61',projectBody:'_0x62',supportPoint:'_0x63',classifyKartImpact:'_0x64',applyBodyVelocity:'_0x65',sanitizeKart:'_0x66',collisionScreenPoint:'_0x67',collisionSignals:'_0x68',impactTone:'_0x69',registerBodyImpact:'_0x6a',solveKartContact:'_0x6b',resolveKartPair:'_0x6c',resolveKartCollisions:'_0x6d',laneOccupancy:'_0x70',laneLeader:'_0x71',choosePlannedLane:'_0x72',rivalImmediatelyAhead:'_0x73',fireWeapon:'_0x74',updateProjectiles:'_0x75',drawLauncher:'_0x76',drawDefensiveProjectile:'_0x77'
}));
function transform(input){let out='',i=0,state='normal',quote='';const identStart=c=>/[A-Za-z_$]/.test(c),ident=c=>/[A-Za-z0-9_$]/.test(c);while(i<input.length){const c=input[i],n=input[i+1];if(state==='line'){if(c==='\n'){state='normal';out+='\n'}i++;continue}if(state==='block'){if(c==='*'&&n==='/'){state='normal';i+=2}else i++;continue}if(state==='string'){out+=c;if(c==='\\'){out+=input[i+1]||'';i+=2;continue}if(c===quote)state='normal';i++;continue}if(c==='/'&&n==='/'){state='line';i+=2;continue}if(c==='/'&&n==='*'){state='block';i+=2;continue}if(c==='"'||c==="'"||c==='`'){state='string';quote=c;out+=c;i++;continue}if(identStart(c)){let j=i+1;while(j<input.length&&ident(input[j]))j++;const token=input.slice(i,j);out+=mapping.get(token)||token;i=j;continue}out+=c;i++}return out}
function minify(input){let out='',i=0,state='normal',quote='';const word=c=>!!c&&/[A-Za-z0-9_$]/.test(c);while(i<input.length){const c=input[i];if(state==='string'){out+=c;if(c==='\\'){out+=input[i+1]||'';i+=2;continue}if(c===quote)state='normal';i++;continue}if(c==='"'||c==="'"||c==='`'){state='string';quote=c;out+=c;i++;continue}if(/\s/.test(c)){let j=i+1;while(j<input.length&&/\s/.test(input[j]))j++;const prev=out[out.length-1],next=input[j];if((word(prev)&&word(next))||(word(prev)&&['"',"'",'`'].includes(next))||(['+','-'].includes(prev)&&prev===next))out+=' ';i=j;continue}out+=c;i++}return out.trim()}
const published='/*! Kart Cipher v7 · distribución minificada/ofuscada razonablemente; los recursos del navegador siguen siendo descargables. */\n'+minify(transform(source))+'\n';
fs.writeFileSync(path.join(root,'game.js'),published);
const dist=path.join(root,'dist');fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
for(const name of ['index.html','styles.css','portal-card.html'])fs.copyFileSync(path.join(root,name),path.join(dist,name));
fs.cpSync(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
fs.writeFileSync(path.join(dist,'game.js'),published);
fs.writeFileSync(path.join(dist,'DEPLOY.txt'),'Kart Cipher v7 — distribución lista para publicación\n\nCopie el CONTENIDO de esta carpeta dist/ en /juegos/ciberaula-kart-cipher/ de su sitio.\nNo publique src/ ni tools/ si no desea distribuir la fuente editable.\nEl JavaScript está minificado y usa nombres internos transformados; esto solo dificulta la copia casual. El navegador siempre descarga los recursos del juego.\n');
const ratio=(published.length/source.length*100).toFixed(1);console.log(`Fuente: ${source.length} bytes`);console.log(`Publicado: ${published.length} bytes (${ratio}%)`);console.log('Salidas: game.js y dist/');
