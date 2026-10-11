'use strict';
// Structural validation only. This module never repairs or changes gameplay data.
const {createHash}=require('node:crypto');
const POSITIONS=new Set(['GK','CB','LB','RB','LWB','RWB','DM','CM','AM','LM','RM','LW','RW','ST','CF','FW','DF','WB','WM','SS']);
function formationFingerprint(formations){return createHash('sha256').update(JSON.stringify(formations)).digest('hex');}
function validateReferenceData(data){
    const errors=[],requireField=(valid,message)=>{if(!valid)errors.push(message);};
    const text=value=>typeof value==='string'&&!!value.trim();
    const score=value=>Number.isFinite(value)&&value>=0&&value<=100;
    const ids=new Set(),names=new Set();
    for(const player of data.players){
        requireField(Number.isInteger(player.id)&&player.id>0&&!ids.has(player.id),`Player ID invalid or duplicated: ${player.id}`);ids.add(player.id);
        const name=String(player.name||'').normalize('NFC').toLowerCase();
        requireField(text(player.name)&&player.name===player.name.trim()&&!names.has(name),`Canonical player name invalid or duplicated: ${player.name}`);names.add(name);
        requireField(text(player.image)&&data.assetExists(player.image),`${player.name}: missing/local image reference`);
        requireField(POSITIONS.has(player.primaryPosition),`${player.name}: invalid primary position`);
        requireField(Array.isArray(player.positions)&&player.positions.length>0&&player.positions.every(position=>POSITIONS.has(position))&&new Set(player.positions).size===player.positions.length&&player.positions.includes(player.primaryPosition),`${player.name}: invalid/duplicate secondary positions`);
        for(const stat of ['ovr','spd','sho','off','pas','dri','def','gk'])requireField(score(player.stats?.[stat]),`${player.name}: invalid ${stat}`);
        requireField(Number.isInteger(player.debutChapter)&&player.debutChapter>=1&&Number.isInteger(player.appearanceOrder),`${player.name}: invalid appearance metadata`);
        const weapons=new Set();
        for(const weapon of player.weapons||[]){requireField(text(weapon.id)&&!weapons.has(weapon.id)&&text(weapon.name)&&text(weapon.description),`${player.name}: malformed/duplicate weapon`);weapons.add(weapon.id);}
    }
    const canonicalNames=new Set(data.players.map(player=>player.name)),pairs=new Set(),contexts=new Set();
    for(const context of data.contexts){
        requireField(text(context.name)&&!contexts.has(context.name)&&score(context.score),`Malformed/duplicate chemistry context: ${context.name}`);contexts.add(context.name);
        requireField(Array.isArray(context.players)&&context.players.length>1&&context.players.every(name=>canonicalNames.has(name))&&new Set(context.players).size===context.players.length,`${context.name}: missing/duplicate player references`);
    }
    for(const pair of data.pairs){
        requireField(Array.isArray(pair)&&pair.length===5,'Malformed chemistry tuple');
        if(!Array.isArray(pair))continue;
        const [a,b,value,label,reason]=pair,key=[a,b].sort().join('|');
        requireField(canonicalNames.has(a)&&canonicalNames.has(b)&&a!==b,`Unknown/self chemistry pair: ${key}`);
        requireField(!pairs.has(key),`Duplicate/reversed chemistry pair: ${key}`);pairs.add(key);
        requireField(score(value)&&text(label)&&text(reason),`Invalid score/label/reason: ${key}`);
    }
    for(const [key,category] of Object.entries(data.categories)){
        requireField(text(key)&&text(category.label)&&Array.isArray(category.names)&&category.names.length>0&&category.names.every(name=>canonicalNames.has(name))&&new Set(category.names).size===category.names.length,`Invalid category: ${key}`);
        requireField(data.categoryIds[key]?.size===category.names.length,`Category ID resolution failed: ${key}`);
    }
    for(const [id,profile] of Object.entries(data.metadata)){
        requireField(ids.has(Number(id))&&text(profile.overview),`Unknown/malformed profile: ${id}`);
        requireField(['PROJECT_REFERENCE','CANON','GAMEPLAY_INTERPRETATION','PROJECT_RATING'].includes(profile.classification),`Profile classification: ${id}`);
        const roles=new Set();
        for(const role of profile.canonPositions||[]){
            requireField(POSITIONS.has(role.position)&&!roles.has(role.position)&&text(role.context)&&text(role.sourceType)&&text(role.sourceReference),`Invalid/duplicate canon role: ${id}`);roles.add(role.position);
        }
    }
    for(const entry of [...data.referencePairs,...data.referenceContexts])requireField(text(entry.id)&&entry.playerIds.length>1&&entry.playerIds.every(id=>Number.isInteger(id)&&ids.has(id))&&new Set(entry.playerIds).size===entry.playerIds.length,`Bad reference IDs: ${entry.id}`);
    for(const quote of data.quotes){
        requireField(ids.has(quote.playerId)&&text(quote.text)&&quote.verification==='VERIFIED'&&['manga','anime'].includes(quote.sourceType)&&text(quote.chapterOrEpisode)&&text(quote.sourceReference),`Unverified/malformed quote: ${quote.playerId}`);
    }
    for(const [name,slots] of Object.entries(data.formations)){
        requireField(slots.length===11&&slots.filter(slot=>slot.label==='GK').length===1,`${name}: invalid formation slot count`);
        for(const slot of slots)requireField(POSITIONS.has(slot.label)&&[slot.x,slot.y].every(axis=>Number.isFinite(axis)&&axis>=0&&axis<=100),`${name}: invalid label/coordinate`);
    }
    requireField(formationFingerprint(data.formations)===data.expectedFormationFingerprint,'Formation definitions/coordinates changed from the v0.6.9 latest-main baseline');
    return errors;
}
module.exports={formationFingerprint,validateReferenceData};
