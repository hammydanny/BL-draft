// v0.7.3 Ego Record: a private, local summary of finished results. No account or network.
// Only results recorded by this browser are counted; nothing is estimated.
const EGO_RECORD_KEY="bldEgoRecordV1";
const EGO_ACHIEVEMENTS=Object.freeze([
    {id:"first-mission",title:"FIRST MISSION",description:"Complete any Draft Challenge."},
    {id:"world-class-day",title:"WORLD CLASS DAY",description:"Earn an S grade or better in a Daily Ego Draft."},
    {id:"singularity",title:"EGO SINGULARITY",description:"Earn an S+ grade in a Daily Ego Draft."},
    {id:"tactician",title:"TACTICIAN",description:"Solve five Daily Tactical Challenges."},
    {id:"manager-duel",title:"MANAGER DUEL",description:"Beat the Normal CPU in a Draft Duel."},
    {id:"giant-killer",title:"GIANT KILLER",description:"Beat the Hard CPU in a Draft Duel."},
    {id:"chemical-reaction",title:"CHEMICAL REACTION",description:"Finish a squad with 85+ chemistry."},
    {id:"natural-eleven",title:"NATURAL ELEVEN",description:"Finish an 11-player XI with every starter in a primary role."},
    {id:"budget-master",title:"BUDGET MASTER",description:"Earn an A grade or better in a Budget challenge."},
    {id:"tactical-range",title:"TACTICAL RANGE",description:"Complete squads with a back three, a back four and a back five."},
    {id:"gold-standard",title:"GOLD STANDARD",description:"Earn gold medals in five Draft Challenges."},
    {id:"architect",title:"ARCHITECT",description:"Create a solvable Challenge Lab code."},
    {id:"full-board",title:"FULL BOARD",description:"Finish all three Ego Board activities on the same day."},
    {id:"regular",title:"REGULAR",description:"Finish an activity on five different days within one week."}
]);
const EGO_MODES=Object.freeze(["daily","tactic","duel","challenge","lab"]);
function egoGradeRank(grade){return ["D","C","B","A","S","S+"].indexOf(grade);}
function egoMedal(grade,complete=true){if(!complete||!grade||grade==="D")return null;return egoGradeRank(grade)>=4?"gold":grade==="A"?"silver":"bronze";}
// Blue Lock Man is a locked Auction keeper, not a roster player, so he is never a favourite.
function egoCountablePlayer(id){return !!playerById(id)&&!(typeof isBlueLockManId==="function"&&isBlueLockManId(id));}
function egoEmpty(){return {v:1,since:localDraftDate(),activity:{},counts:{daily:0,tactic:0,duel:0,challenge:0,lab:0,created:0},dailyBest:null,gradeCounts:{"S+":0,S:0},formations:{},players:{},families:{},best:{chemistry:null,ovr:null},duel:{easy:0,normal:0,hard:0},achievements:{},migrated:false};}
function egoCleanBest(value){return replayRecord(value)&&Number.isFinite(value.value)&&value.value>=0&&value.value<=120&&EGO_MODES.includes(value.mode)&&typeof value.date==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value.date)&&(value.formation==null||knownFormation(value.formation))?{value:Math.round(value.value),mode:value.mode,date:value.date,formation:value.formation??null}:null;}
function egoNormalize(raw){
    const clean=egoEmpty();if(!replayRecord(raw)||raw.v!==1)return clean;
    const count=value=>Number.isInteger(value)&&value>=0&&value<=1000000?value:0,date=value=>typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value);
    if(date(raw.since))clean.since=raw.since;
    if(replayRecord(raw.activity))for(const [day,modes]of Object.entries(raw.activity).sort(([a],[b])=>b.localeCompare(a)).slice(0,120))if(date(day)&&Array.isArray(modes))clean.activity[day]=[...new Set(modes.filter(mode=>EGO_MODES.includes(mode)))];
    if(replayRecord(raw.counts))for(const key of Object.keys(clean.counts))clean.counts[key]=count(raw.counts[key]);
    if(replayRecord(raw.gradeCounts))for(const key of ["S+","S"])clean.gradeCounts[key]=count(raw.gradeCounts[key]);
    if(Number.isInteger(raw.dailyBest)&&raw.dailyBest>=0&&raw.dailyBest<=20000)clean.dailyBest=raw.dailyBest;
    if(replayRecord(raw.formations))for(const [name,n]of Object.entries(raw.formations).slice(0,40))if(knownFormation(name))clean.formations[name]=count(n);
    if(replayRecord(raw.players))for(const [id,n]of Object.entries(raw.players).slice(0,200))if(/^\d+$/.test(id)&&egoCountablePlayer(Number(id)))clean.players[id]=count(n);
    if(replayRecord(raw.families))for(const key of ["3","4","5"])if(raw.families[key]===true)clean.families[key]=true;
    if(replayRecord(raw.best))for(const key of ["chemistry","ovr"])clean.best[key]=egoCleanBest(raw.best[key]);
    if(replayRecord(raw.duel))for(const key of DUEL_LEVELS)clean.duel[key]=count(raw.duel[key]);
    if(replayRecord(raw.achievements))for(const item of EGO_ACHIEVEMENTS)if(date(raw.achievements[item.id]))clean.achievements[item.id]=raw.achievements[item.id];
    clean.migrated=raw.migrated===true;return clean;
}
// First run: credit results that earlier versions already stored. Activity days come from dated Daily records only.
function egoMigrate(record){
    const solo=soloRecords();
    for(const [key,item]of Object.entries(solo)){
        if(key.startsWith("daily:")&&item.score>0){const day=key.slice(6);(record.activity[day]??=[]).includes("daily")||record.activity[day].push("daily");record.counts.daily++;record.dailyBest=Math.max(record.dailyBest||0,item.score);if(item.grade==="S+"||item.grade==="S")record.gradeCounts[item.grade]++;}
        else if(key.startsWith("puzzle:")&&!key.startsWith("puzzle:tactic:")&&!key.startsWith("puzzle:lab:")&&item.complete)record.counts.challenge++;
        if(item.squad&&item.score>0)egoTrackSquad(record,item.squad.formation,item.squad.playerIds);
    }
    record.migrated=true;return record;
}
function egoTrackSquad(record,formation,ids){
    if(knownFormation(formation)){record.formations[formation]=(record.formations[formation]||0)+1;if(Object.hasOwn(FORMATIONS,formation)&&["3","4","5"].includes(formation[0]))record.families[formation[0]]=true;}
    for(const id of ids||[])if(Number.isInteger(id)&&egoCountablePlayer(id))record.players[id]=(record.players[id]||0)+1;
}
function egoRecordLoad(){
    let record;try{record=egoNormalize(JSON.parse(localStorage.getItem(EGO_RECORD_KEY)||"null"));}catch{record=egoEmpty();}
    if(!record.migrated){egoMigrate(record);egoEvaluateAchievements(record,localDraftDate());egoRecordWrite(record);}
    return record;
}
function egoRecordWrite(record){try{localStorage.setItem(EGO_RECORD_KEY,JSON.stringify(record));return true;}catch{return false;}}
function egoActiveDays(record,from,days){const start=dailyDayNumber(from);return Array.from({length:days},(_,i)=>dailyDayString(start-i)).filter(day=>record.activity[day]?.length);}
function egoEvaluateAchievements(record,today,event=null){
    const unlocked=[],give=id=>{if(!record.achievements[id]){record.achievements[id]=today;unlocked.push(id);}},solo=soloRecords();
    if(record.counts.challenge>0)give("first-mission");
    if(record.gradeCounts.S>0||record.gradeCounts["S+"]>0)give("world-class-day");
    if(record.gradeCounts["S+"]>0)give("singularity");
    if(record.counts.tactic>=5)give("tactician");
    if(record.duel.normal>0||record.duel.hard>0)give("manager-duel");
    if(record.duel.hard>0)give("giant-killer");
    if((record.best.chemistry?.value||0)>=85)give("chemical-reaction");
    if(record.counts.created>0)give("architect");
    if(["3","4","5"].every(key=>record.families[key]))give("tactical-range");
    const golds=curatedPuzzleMissions().filter(m=>egoMedal(solo["puzzle:"+m.id]?.grade,solo["puzzle:"+m.id]?.complete)==="gold").length;if(golds>=5)give("gold-standard");
    if(curatedPuzzleMissions().some(m=>m.category==="Budget"&&solo["puzzle:"+m.id]?.complete&&egoGradeRank(solo["puzzle:"+m.id].grade)>=3)||event?.mode==="tactic"&&event.category==="Budget"&&egoGradeRank(event.grade)>=3)give("budget-master");
    if(event?.naturalEleven)give("natural-eleven");
    if(["daily","tactic","duel"].every(mode=>record.activity[today]?.includes(mode)))give("full-board");
    for(let offset=0;offset<7;offset++){const end=dailyDayString(dailyDayNumber(today)-offset);if(egoActiveDays(record,end,7).length>=5){give("regular");break;}}
    return unlocked;
}
// Called once for every finished result. Returns newly unlocked achievement ids.
function egoRecordEvent(event){
    if(!replayRecord(event)||!EGO_MODES.includes(event.mode))return [];
    const record=egoRecordLoad(),today=localDraftDate(),finished=event.complete!==false;
    if(finished){(record.activity[today]??=[]).includes(event.mode)||record.activity[today].push(event.mode);record.counts[event.mode]++;}
    if(event.mode==="daily"&&Number.isInteger(event.score)){record.dailyBest=Math.max(record.dailyBest||0,event.score);if(event.grade==="S+"||event.grade==="S")record.gradeCounts[event.grade]++;}
    if(event.mode==="duel"&&event.outcome==="win"&&DUEL_LEVELS.includes(event.level))record.duel[event.level]++;
    if(finished&&event.formation){
        egoTrackSquad(record,event.formation,event.playerIds);
        for(const key of ["chemistry","ovr"]){const value=event[key];if(Number.isFinite(value)&&(!record.best[key]||value>record.best[key].value))record.best[key]={value:Math.round(value),mode:event.mode,date:today,formation:event.formation};}
    }
    if(event.created)record.counts.created++;
    const unlocked=egoEvaluateAchievements(record,today,event);egoRecordWrite(record);return unlocked;
}
// Helpers that turn a finished squad snapshot into an event.
function egoNaturalEleven(snap){const entries=Object.entries(snap.assignment||{});return entries.length===11&&entries.every(([slot,id])=>playerPositionProfile(playerById(id),snap.shape[slot]?.label).fit==="primary");}
function egoEventFromSolo(state,result){
    const kind=state.kind==="daily"?"daily":puzzleKind(state.mission)==="tactic"?"tactic":puzzleKind(state.mission)==="lab"?"lab":"challenge",snap=result.snap;
    return {mode:kind,complete:state.kind==="daily"?true:result.complete,score:result.score,grade:result.grade,formation:state.formation,playerIds:[...state.ids],chemistry:snap.chemistry?.overall,ovr:snap.ovr,naturalEleven:(state.kind==="daily"||result.complete)&&egoNaturalEleven(snap),category:state.kind==="puzzle"?puzzleMission(state.mission).category:null};
}
function egoFavourites(record){
    const formation=Object.entries(record.formations).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]||null;
    // Secret players never appear in the record, even in an unlocked session.
    const players=Object.entries(record.players).map(([id,n])=>[playerById(Number(id)),n]).filter(([p])=>p&&!p.secretCharacter&&egoCountablePlayer(p.id)).sort((a,b)=>b[1]-a[1]||a[0].id-b[0].id).slice(0,5);
    return {formation,players};
}
