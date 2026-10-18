// Shared football contribution model. Base player data and relationship scores stay untouched.
const SQUAD_BALANCE_REVISION=2;
function boundedNumber(value,min,max){return Math.max(min,Math.min(max,value));}
function ratingStrength(rating){return Math.exp((boundedNumber(Number(rating)||1,1,104)-70)/18);}
function strengthRating(value){return 70+18*Math.log(Math.max(.001,value));}
function qualityScore(rating){return boundedNumber(32+68*(ratingStrength(rating)-ratingStrength(40))/(ratingStrength(100)-ratingStrength(40)),0,100);}
function chemistryPerformanceModifier(value){
    const stops=[[40,-3],[55,-2],[65,-1],[72,0],[82,1],[90,2.2],[95,3.2],[100,4]],score=boundedNumber(Number(value)||0,40,100);
    for(let i=1;i<stops.length;i++)if(score<=stops[i][0]){const [a,x]=stops[i-1],[b,y]=stops[i];return x+(y-x)*(score-a)/(b-a);}
    return 4;
}
function playerChemistryPerformance(values){
    const links=(values||[]).map(Number).filter(Number.isFinite).sort((a,b)=>b-a);if(!links.length)return 0;
    const mean=links.reduce((a,b)=>a+b,0)/links.length,best=links.slice(0,2).reduce((a,b)=>a+b,0)/Math.min(2,links.length);
    // Strongest links help; the whole local network and its weakest link still matter.
    return chemistryPerformanceModifier(mean*.55+best*.30+links.at(-1)*.15);
}
function playerPositionProfile(player,label){
    const base=playerOverall(player);if(!player||!label)return {base,position:base,role:0,penalty:0,fit:"primary"};
    const equivalent=position=>["CF","ST"].includes(normalizePosition(position))?"ST":normalizePosition(position),primary=!!player.allPositions||equivalent(primaryPosition(player))===equivalent(label),demonstrated=playerPositions(player).some(pos=>equivalent(pos)===equivalent(label)),natural=canonicalFit(player,label),from=positionGroup(primaryPosition(player)),to=positionGroup(label);
    const role=boundedNumber(Math.round((calculatePositionOVR(player,label)-calculatePositionOVR(player,primaryPosition(player)))*.25),-3,3);
    const penalty=primary?0:demonstrated?1:natural?2:to==="GK"?35:from==="GK"?30:from===to?7:14;
    return {base,position:boundedNumber(base+role-penalty,1,100),role,penalty,fit:primary?"primary":demonstrated?"secondary":natural?"adapted":penalty>=30?"incompatible":from===to?"adapted":"poor"};
}
function playerContribution(player,label,links=[],positionProfile=null){
    const position=positionProfile||playerPositionProfile(player,label);if(!player||!label)return {...position,chemistry:0,raw:0,effective:0};
    const chemistry=playerChemistryPerformance(links),raw=boundedNumber(position.position+chemistry,1,104);
    return {...position,chemistry,raw,effective:Math.round(raw)};
}
function lineupContributionSnapshot(roster,assignment,shape,chemistry,roles=null){
    const byId=roster instanceof Map?roster:new Map(roster.map(p=>[p.id,p])),linksById=new Map();
    for(const link of chemistry?.links||[]){const a=link.a.p.id,b=link.b.p.id;(linksById.get(a)||linksById.set(a,[]).get(a)).push(link.value);(linksById.get(b)||linksById.set(b,[]).get(b)).push(link.value);}
    const members=Object.entries(assignment||{}).map(([slot,id])=>{const player=byId.get(id),label=shape[slot]?.label;if(!player||!label)return null;return {slot:Number(slot),player,label,...playerContribution(player,label,linksById.get(id)||[],roles?.[slot]?.get(id)?.positionProfile)};}).filter(Boolean);
    const base=lineupOVRProfile(members.map(m=>m.base)),position=lineupOVRProfile(members.map(m=>m.position)),effective=lineupOVRProfile(members.map(m=>m.raw));
    return {members,baseQuality:base.value,baseRaw:base.raw,positionQuality:position.value,positionRaw:position.raw,effectiveQuality:effective.value,effectiveRaw:effective.raw,chemistryImpact:effective.raw-position.raw,fitImpact:position.raw-base.raw};
}
function formationContributionSnapshot(n,assignment=formationAssignments[n]||{},name=formationByTeam[n]||"4-3-3"){
    const team=teamByNumber(n),shape=formationShape(name),active=new Set(Object.keys(assignment).map(Number)),chemistry=formationChemistryForAssignment(n,assignment,name,active);
    return {...lineupContributionSnapshot(team.players,assignment,shape,chemistry),chemistry};
}
function formationPlayerContribution(n,id,assignment=formationAssignments[n]||{},name=formationByTeam[n]||"4-3-3"){return formationContributionSnapshot(n,assignment,name).members.find(m=>m.player.id===id)||null;}
function contributionExplanation(part){return replayText("Base {base} · Position {fit} · Chemistry {chem} · Effective {effective}",{base:part.base,fit:signedImpact(part.position-part.base),chem:signedImpact(part.chemistry),effective:part.effective});}
function signedImpact(value){const rounded=Math.round(value*10)/10||0;return (rounded>0?"+":"")+rounded.toLocaleString(window.SiteI18n?.language||"en",{maximumFractionDigits:1});}
// Separate Daily definitions preserve every canonical eleven-a-side formation byte for byte.
function dailyMiniShape(rows){const shape=[{x:50,y:88,label:"GK"}],xs={1:[50],2:[30,70],3:[18,50,82],4:[12,37,63,88]},labels={DEF:{2:["CB","CB"],3:["CB","CB","CB"],4:["LB","CB","CB","RB"]},MID:{2:["CM","CM"],3:["LM","CM","RM"],4:["LM","CM","CM","RM"]},ATT:{1:["ST"],2:["ST","ST"],3:["LW","ST","RW"]}};rows.forEach((count,row)=>{const group=["DEF","MID","ATT"][row];for(let i=0;i<count;i++)shape.push({x:xs[count][i],y:[68,43,17][row],label:labels[group][count][i]});});return shape;}
const DAILY_FORMATIONS=Object.freeze(Object.fromEntries([[7,[[2,2,2],[2,3,1],[3,2,1]]],[8,[[3,2,2],[2,3,2],[3,3,1]]],[9,[[3,3,2],[3,2,3],[4,2,2]]],[10,[[3,3,3],[4,3,2],[3,4,2]]]].flatMap(([size,rows])=>rows.map(row=>[size+"v"+size+":"+row.join("-"),Object.freeze(dailyMiniShape(row).map(Object.freeze))]))));
function dailyMiniEdges(shape){const edges=[],rows=[...new Set(shape.map(s=>s.y))].sort((a,b)=>b-a),add=(a,b)=>{if(a!==b&&!edges.some(([x,y])=>x===Math.min(a,b)&&y===Math.max(a,b)))edges.push([Math.min(a,b),Math.max(a,b)]);};for(const y of rows){const row=shape.map((s,i)=>({s,i})).filter(v=>v.s.y===y).sort((a,b)=>a.s.x-b.s.x);for(let i=1;i<row.length;i++)add(row[i-1].i,row[i].i);}for(let r=1;r<rows.length;r++){const previous=shape.map((s,i)=>({s,i})).filter(v=>v.s.y===rows[r-1]),next=shape.map((s,i)=>({s,i})).filter(v=>v.s.y===rows[r]);for(const a of previous){const nearby=next.filter(b=>Math.abs(a.s.x-b.s.x)<=38);for(const b of nearby.length?nearby:[...next].sort((x,y)=>Math.abs(x.s.x-a.s.x)-Math.abs(y.s.x-a.s.x)).slice(0,1))add(a.i,b.i);}}return edges;}
const DAILY_FORMATION_EDGES=Object.freeze(Object.fromEntries(Object.entries(DAILY_FORMATIONS).map(([name,shape])=>[name,dailyMiniEdges(shape)])));
function formationShape(name){return Object.hasOwn(FORMATIONS,name)?FORMATIONS[name]:Object.hasOwn(DAILY_FORMATIONS,name)?DAILY_FORMATIONS[name]:null;}
function knownFormation(name){return typeof name==="string"&&(Object.hasOwn(FORMATIONS,name)||Object.hasOwn(DAILY_FORMATIONS,name));}
function formationLabel(name){return Object.hasOwn(DAILY_FORMATIONS,name)?name.split(":")[1]:name;}
function formationEdgePairs(name){return FORMATION_CHEMISTRY_EDGES[name]||DAILY_FORMATION_EDGES[name]||[];}
function formationPriority(name){return FORMATION_ACTIVE_PRIORITY[name]||formationShape(name)?.map((_,i)=>i)||[];}
function dailyFormationNames(size){return size<11?Object.keys(DAILY_FORMATIONS).filter(name=>DAILY_FORMATIONS[name].length===size):["4-3-3","4-2-3-1","3-4-3"];}
function availableFormationNames(n){const current=formationByTeam[n];return Object.keys(FORMATIONS).concat(DAILY_FORMATIONS[current]?dailyFormationNames(DAILY_FORMATIONS[current].length):[]);}
// Both previews and real placement use this exact swap/reserve rule.
function formationMoveAssignment(n,playerId,slotIndex){
    const shape=formationShape(formationByTeam[n]||"4-3-3"),team=teamByNumber(n);if(!Number.isInteger(slotIndex)||!shape?.[slotIndex]||!team.players.some(p=>p.id===playerId))return null;
    const assignment={...formationAssignments[n]},source=Object.keys(assignment).find(slot=>assignment[slot]===playerId),target=assignment[slotIndex];
    if(source!==undefined)delete assignment[source];if(target&&target!==playerId&&source!==undefined)assignment[source]=target;assignment[slotIndex]=playerId;return assignment;
}
