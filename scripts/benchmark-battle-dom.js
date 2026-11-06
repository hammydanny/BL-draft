#!/usr/bin/env node
'use strict';
// Optional benchmark: linkedom via NODE_PATH, plus baseline git history.
const path=require('node:path'),root=path.resolve(__dirname,'..');
const fs=require('node:fs'),{execFileSync}=require('node:child_process'),{parseHTML}=require('linkedom'),{battleContext}=require('./battle-sim-tests');
const shell=fs.readFileSync(path.join(root,'battle-sim/game/index.html'),'utf8');
function measure(source){const h=battleContext(source),{document}=parseHTML(shell);h.context.document=document;h.context.window.SiteI18n={text:x=>x,apply(){}};h.bs.setTeams(h.run(`[1,2].map(n=>bs.normalizeTeam({name:'Team '+n,roster:[blueLockManFor(n),...players.filter(p=>!p.secretCharacter).slice((n-1)*20,(n-1)*20+14)],assignment:{0:9100+n}},n))`));h.context.window.crypto={getRandomValues:a=>a[0]=42};const s=h.bs.createMatch();h.bs.setMatch(s);h.bs.renderMatch();let allocations=0;for(const name of ['createElement','createElementNS']){const original=document[name].bind(document);document[name]=(...args)=>{allocations++;return original(...args);};}const start=performance.now();for(let i=0;i<200;i++)h.bs.renderMatch();return{milliseconds:performance.now()-start,elements:allocations};}
const baseline=execFileSync('git',['-C',root,'show','c600089:js/battle-sim.js'],{encoding:'utf8'}),updated=fs.readFileSync(path.join(root,'js/battle-sim.js'),'utf8');const results={baseline:[],updated:[]};for(let i=0;i<5;i++){results.baseline.push(measure(baseline));results.updated.push(measure(updated));}
console.log(JSON.stringify({note:'Five runs of 200 unchanged-state full renderMatch calls using linkedom. JS/DOM work only, no browser CSS/layout/paint. Identical rosters and seeded kickoff.',...results},null,2));
