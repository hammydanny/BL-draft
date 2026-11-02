#!/usr/bin/env node
'use strict';
// v0.7.3 Daily Ego Draft rule experiment: generate a year of dates and play every date
// with three different deterministic policies. Prints a JSON report.
//   node scripts/v073-daily-experiment.js [days=365] [start=2026-11-02]
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createModeTestContext}=require('./game-modes-tests');
function dailyContext(){
    const {context,run}=createModeTestContext();
    vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/solo-draft.js'),'utf8'),context,{filename:'solo-draft.js'});
    return {context,run};
}
function runDailyExperiment(days=365,start='2026-11-02'){
    const {run}=dailyContext();
    return JSON.parse(run(`(()=>{
        const report={days:${days},start:${JSON.stringify(start)},themes:{},modifiers:{},sizes:{},formations:{},themeRepeats:0,modifierRepeats:0,exposure:{},objectives:{},scores:{},failures:[],rerollHelp:{tries:0,newNeed:0},minOptions:99};
        const first=dailyDayNumber(${JSON.stringify(start)});let previous=null;
        const policies=['best-ovr','needed-role','first-offer'];
        for(let d=0;d<${days};d++){
            const date=dailyDayString(first+d),rule=dailyPickRule(date);
            if(rule.rules!==3)throw Error('Expected v3 rules for '+date);
            report.themes[rule.id]=(report.themes[rule.id]||0)+1;report.modifiers[rule.modifier.id]=(report.modifiers[rule.modifier.id]||0)+1;report.sizes[rule.size]=(report.sizes[rule.size]||0)+1;
            if(previous&&previous.id===rule.id)report.themeRepeats++;if(previous&&previous.modifier.id===rule.modifier.id)report.modifierRepeats++;previous=rule;
            if((DAILY_MODIFIER_CONFLICTS[rule.id]||[]).includes(rule.modifier.id))report.failures.push({date,reason:'conflicting rule'});
            for(const policy of policies){
                const state=dailyPickNew(date);state.formation=rule.formations[(d+policies.indexOf(policy))%rule.formations.length];report.formations[state.formation]=(report.formations[state.formation]||0)+1;dailyStartPicks(state);
                let guard=0;
                while(state.phase==='picking'&&guard++<40){
                    const options=dailyPickOptions(state);report.minOptions=Math.min(report.minOptions,options.length);
                    if(!options.length){report.failures.push({date,policy,reason:'no options',ids:state.ids.length});break;}
                    if(d===0||policy==='first-offer')for(const id of options)report.exposure[id]=(report.exposure[id]||0)+1;
                    const plan=dailyPickPlan(state),shape=formationShape(plan.formation),open=shape.map((s,i)=>i).filter(i=>!plan.assignment[i]||!canonicalFit(playerById(plan.assignment[i]),shape[i].label));
                    const fits=id=>open.some(i=>canonicalFit(playerById(id),shape[i].label));
                    if(policy==='needed-role'&&state.tokens>0&&!options.some(fits)){report.rerollHelp.tries++;dailyPickAction(state,{type:'reroll'});if(dailyPickOptions(state).some(fits))report.rerollHelp.newNeed++;continue;}
                    const choice=policy==='first-offer'?options[0]:policy==='best-ovr'?[...options].sort((a,b)=>playerOverall(playerById(b))-playerOverall(playerById(a)))[0]:([...options].filter(fits).sort((a,b)=>playerOverall(playerById(b))-playerOverall(playerById(a)))[0]||options[0]);
                    dailyPickAction(state,{type:'pick',id:choice});
                }
                if(state.phase!=='review'){report.failures.push({date,policy,reason:'incomplete',phase:state.phase});continue;}
                if(rule.cap!=null&&dailyBudgetLeft(state)<0)report.failures.push({date,policy,reason:'over cap'});
                if(rule.eliteCap&&state.ids.filter(id=>playerOverall(playerById(id))>=rule.eliteCap).length>1)report.failures.push({date,policy,reason:'elite cap broken'});
                if(rule.captainId&&Object.values(state.assignment).includes(rule.captainId)&&state.captain!==rule.captainId)report.failures.push({date,policy,reason:'captain lost'});
                if(!rule.formations.includes(state.formation))report.failures.push({date,policy,reason:'formation outside rule'});
                try{const restored=normalizeSoloState(JSON.parse(JSON.stringify(state)));if(JSON.stringify(restored.ids)!==JSON.stringify(state.ids))report.failures.push({date,policy,reason:'replay mismatch'});}catch(error){report.failures.push({date,policy,reason:'reload: '+error.message,rule:rule.modifier.id,size:rule.size,captain:state.captain,inXI:Object.values(state.assignment).includes(state.captain)});}
                const result=dailyPickScore(state);const bucket=report.scores[rule.modifier.id]||(report.scores[rule.modifier.id]={n:0,sum:0,min:1e9,max:0,grades:{}});
                bucket.n++;bucket.sum+=result.score;bucket.min=Math.min(bucket.min,result.score);bucket.max=Math.max(bucket.max,result.score);bucket.grades[result.grade]=(bucket.grades[result.grade]||0)+1;
                const objective=result.goal.label;report.objectives[objective]=(report.objectives[objective]||0)+(policy==='best-ovr'?1:0);
            }
        }
        for(const bucket of Object.values(report.scores))bucket.mean=Math.round(bucket.sum/bucket.n);
        const exposure=Object.values(report.exposure);report.exposureSummary={players:exposure.length,publicPlayers:challengePool().length,min:Math.min(...exposure),max:Math.max(...exposure)};delete report.exposure;
        return JSON.stringify(report);
    })()`));
}
module.exports={runDailyExperiment,dailyContext};
if(require.main===module){
    const started=Date.now(),report=runDailyExperiment(Number(process.argv[2]||365),process.argv[3]||'2026-11-02');
    report.ms=Date.now()-started;console.log(JSON.stringify(report,null,1));
}
