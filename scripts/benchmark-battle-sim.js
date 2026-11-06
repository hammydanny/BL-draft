#!/usr/bin/env node
'use strict';
// Comparable synthetic-DOM allocation/CPU benchmark, not browser paint timing.
const fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const {createModeTestContext}=require('./game-modes-tests.js');
function benchmark(source,incremental){
 const {context,run}=createModeTestContext();let allocations=0;
 class Element{
  constructor(){allocations++;this.children=[];this.dataset={};this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){}};this.attributes={};}
  appendChild(c){this.children.push(c);return c;}
  setAttribute(k,v){this.attributes[k]=String(v);if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v);}
  querySelectorAll(selector){const all=this.children.flatMap(c=>[c,...c.querySelectorAll('*')]);return selector==='*'?all:all.filter(c=>selector.startsWith('.')?(c.className||'').split(' ').includes(selector.slice(1)):selector==='[data-player-id]'&&c.dataset.playerId);}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 }
 context.document.createElement=()=>new Element();context.document.createElementNS=()=>new Element();
 const hook='globalThis.api={normalizeTeam,runtimeTeam,matchTeamPanel,update:typeof updateTeamPanel==="function"?updateTeamPanel:null,set:s=>match=s};';
 vm.runInContext(source.replace('document.addEventListener("DOMContentLoaded",function()',hook+'document.addEventListener("DOMContentLoaded",function()'),context);
 const configs=run(`[1,2].map(n=>({name:'Team '+n,roster:players.filter(p=>!p.secretCharacter).slice((n-1)*20,(n-1)*20+15),formation:'4-3-3'}))`).map((t,i)=>context.api.normalizeTeam(t,i+1));
 const state={teams:{1:context.api.runtimeTeam(configs[0],1),2:context.api.runtimeTeam(configs[1],2)},status:'playing',possession:1,requiredSub:null,events:[],presentedEventId:0};context.api.set(state);
 const panels=[context.api.matchTeamPanel(1),context.api.matchTeamPanel(2)];if(incremental)for(const n of [1,2])context.api.update(panels[n-1],state.teams[n]);allocations=0;
 const start=performance.now();
 for(let frame=0;frame<200;frame++)for(const n of [1,2]){if(incremental)context.api.update(panels[n-1],state.teams[n]);else context.api.matchTeamPanel(n);}
 return{frames:200,elementsCreated:allocations,milliseconds:Math.round((performance.now()-start)*100)/100};
}
const before=execFileSync('git',['show','2c91974:js/battle-sim.js'],{encoding:'utf8'}),after=fs.readFileSync('js/battle-sim.js','utf8');
console.log(JSON.stringify({note:'Latest-main 2c91974 vs working tree; synthetic DOM, same two 15-player rosters; 200 ordinary live frames after binding warmup. Excludes browser layout/paint.',before:benchmark(before,true),after:benchmark(after,true)},null,2));

const {loadPlayerModules,playerModuleFiles}=require('./test-player-modules.js');
let sourceTime=0,bundleTime=0;const iterations=20;
for(let i=0;i<iterations;i++){let start=performance.now();loadPlayerModules(vm.createContext({}));sourceTime+=performance.now()-start;start=performance.now();vm.runInContext(fs.readFileSync('js/characters.generated.js','utf8'),vm.createContext({}));bundleTime+=performance.now()-start;}
const originalShell=execFileSync('git',['show','66b2ada:index.html'],{encoding:'utf8'}),currentShell=fs.readFileSync('index.html','utf8'),scripts=html=>[...html.matchAll(/<script[^>]+src=/g)].length;
console.log(JSON.stringify({note:'20 Node VM warm-disk read/evaluate runs; excludes browser and network',characterRequestsBefore:playerModuleFiles().length,characterRequestsAfter:1,totalScriptRequestsBefore:scripts(originalShell)+playerModuleFiles().length,totalScriptRequestsAfter:scripts(currentShell)+1,meanMillisecondsBefore:Math.round(sourceTime/iterations*100)/100,meanMillisecondsAfter:Math.round(bundleTime/iterations*100)/100},null,2));
