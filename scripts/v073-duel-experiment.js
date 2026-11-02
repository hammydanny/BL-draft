#!/usr/bin/env node
'use strict';
// Seeded Draft Duel CPU experiment. Every difficulty plays the same seeds against the
// same fixed human policy (greedy own-squad improvement, no denial). Prints JSON.
//   node scripts/v073-duel-experiment.js [seeds=40] [format=standard]
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createModeTestContext}=require('./game-modes-tests');
function duelContext(){
    const {context,run}=createModeTestContext();
    for(const file of ['solo-draft.js','draft-duel.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),context,{filename:file});
    return {context,run};
}
function runDuelExperiment(seeds=40,formats=['quick','standard','full'],levels=null){
    const {run}=duelContext();
    return JSON.parse(run(`(()=>{
        const report={seeds:${seeds},formats:${JSON.stringify(formats)},levels:{}};
        for(const level of ${JSON.stringify(levels)}||DUEL_LEVELS){
            const m=report.levels[level]={duels:0,cpuWins:0,humanWins:0,draws:0,cpuStrength:0,cpuOvr:0,cpuBase:0,cpuChemistry:0,cpuFitRate:0,cpuNaturalRate:0,cpuRedundant:0,wasted:0,complete:0,humanStrength:0,margin:0};
            for(const format of ${JSON.stringify(formats)})for(let seed=1;seed<=${seeds};seed++){
                const state=duelNew({seed:seed*7919,format,level});duelStart(state);
                while(state.phase==='draft'){
                    const options=state.market,best=[...options].sort((a,b)=>duelValue(state.human,state.humanFormation,b)-duelValue(state.human,state.humanFormation,a)||a-b)[0];
                    const before=state.cpu.length;duelPick(state,best);
                    const entry=state.log.at(-1);
                    // Wasted opportunity: the CPU took a player worth nothing to its squad while a useful one was available.
                    const offered=entry.humanFirst?[entry.cpu,...entry.discarded]:[entry.cpu,entry.human,...entry.discarded];
                    const cpuBefore=state.cpu.filter(id=>id!==entry.cpu);
                    const values=offered.filter(id=>id!==entry.human||!entry.humanFirst).map(id=>({id,v:duelValue(cpuBefore,state.cpuFormation,id)}));
                    const chosen=values.find(x=>x.id===entry.cpu)?.v??0;
                    if(chosen<=0&&values.some(x=>x.v>0.3))m.wasted++;
                    if(chosen<=0)m.cpuRedundant++;
                }
                const result=duelResult(state);m.duels++;
                if(result.outcome==='loss')m.cpuWins++;else if(result.outcome==='win')m.humanWins++;else m.draws++;
                m.cpuStrength+=result.cpu.strength;m.humanStrength+=result.human.strength;m.margin+=result.cpu.strength-result.human.strength;m.cpuOvr+=result.cpu.ovr;m.cpuBase+=result.cpu.base;m.cpuChemistry+=result.cpu.chemistry;
                const snapFit=result.cpu.fit/result.cpu.slots;m.cpuFitRate+=snapFit;
                const shape=formationShape(result.cpu.formation),natural=Object.entries(result.cpu.assignment).filter(([slot,id])=>playerPositionProfile(playerById(id),shape[slot].label).fit==='primary').length;m.cpuNaturalRate+=natural/result.cpu.slots;
                if(state.cpu.length===DUEL_FORMATS[format].size)m.complete++;
            }
            for(const key of ['humanStrength','margin','cpuStrength','cpuOvr','cpuBase','cpuChemistry','cpuFitRate','cpuNaturalRate','cpuRedundant','wasted'])m[key]=Math.round(m[key]/m.duels*1000)/1000;
            m.cpuWinRate=Math.round(m.cpuWins/m.duels*1000)/1000;m.complete=m.complete/m.duels;
        }
        return JSON.stringify(report);
    })()`));
}
module.exports={runDuelExperiment,duelContext};
if(require.main===module){
    const started=Date.now(),report=runDuelExperiment(Number(process.argv[2]||40),process.argv[3]&&process.argv[3]!=='all'?[process.argv[3]]:['quick','standard','full'],process.env.LEVELS?process.env.LEVELS.split(','):null);
    report.ms=Date.now()-started;console.log(JSON.stringify(report,null,1));
}
