'use strict';
// Structural validation only. This module never repairs or changes gameplay data.
const {createHash}=require('node:crypto');
const POSITIONS=new Set(['GK','CB','LB','RB','LWB','RWB','DM','CM','AM','LM','RM','LW','RW','ST','CF','FW','DF','WB','WM','SS']);
function formationFingerprint(formations){return createHash('sha256').update(JSON.stringify(formations)).digest('hex');}
function validateReferenceData(data){
    const errors=[],requireField=(valid,message)=>{if(!valid)errors.push(message);};
    const text=value=>typeof value==='string'&&!!value.trim();
    const score=value=>Number.isFinite(value)&&value>=0&&value<=100;
    const positiveInteger=value=>Number.isInteger(value)&&value>0;
    const sourceValid=source=>!!source&&['official-profile','canon-reference','anime-subtitles','anime-film-subtitles','project-reference','manga','anime'].includes(source.type)&&text(source.note)&&typeof source.url==='string'&&/^https:\/\/\S+$/.test(source.url)&&['chapter','episode'].every(field=>source[field]===undefined||positiveInteger(source[field]))&&(source.timestamp===undefined||/^\d{2}:\d{2}$/.test(source.timestamp))&&(source.type!=='anime-film-subtitles'||(text(source.film)&&source.episode===undefined));
    for(const [code,country] of Object.entries(data.countries||{}))requireField(/^[A-Z]{2}$/.test(code)&&text(country.name)&&text(country.label)&&/^images\/flags\/[a-z-]+\.svg$/.test(country.flag)&&data.assetExists(country.flag),`Invalid country/flag asset: ${code}`);
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
        const weapons=new Set(),weaponNames=new Set(),weaponDescriptions=new Set();
        requireField(player.weapons===undefined||Array.isArray(player.weapons),`${player.name}: weapons must be an array`);
        for(const weapon of Array.isArray(player.weapons)?player.weapons:[]){
            const id=String(weapon?.id||'').trim().toLowerCase(),name=String(weapon?.name||'').normalize('NFC').trim().toLowerCase(),description=String(weapon?.description||'').trim();
            requireField(!!weapon&&text(weapon.id)&&!weapons.has(id)&&text(weapon.name)&&!weaponNames.has(name)&&description.length>=20&&description.split(/\s+/).length>=4&&!/^(?:tbd|placeholder|coming soon)/i.test(description)&&!weaponDescriptions.has(description.toLowerCase()),`${player.name}: malformed/duplicate weapon`);
            weapons.add(id);weaponNames.add(name);weaponDescriptions.add(description.toLowerCase());
            requireField(['physical','technical','mental'].includes(weapon?.category),`${player.name}: invalid/missing weapon category`);
            requireField(!/\bflow(?:\s+state)?\b/i.test(String(weapon?.name||'')),`${player.name}: Flow is not a weapon`);
            if(weapon?.source!==undefined)requireField(sourceValid(weapon.source),`${player.name}: invalid weapon source`);
            if(weapon?.battleSimType!==undefined)requireField(weapon.battleSimType==='TBD'&&weapon.battleSimDescription==='Placeholder: Battle Sim effect to be defined.',`${player.name}: Battle Sim must remain a placeholder`);
        }
        const nationality=player.nationality;
        if(nationality!==null&&nationality!==undefined){
            const country=data.countries?.[nationality.code];
            requireField(/^[A-Z]{2}$/.test(nationality.code)&&!!country&&nationality.name===country.name&&text(nationality.name)&&['nationality','national-team-representation'].includes(nationality.basis)&&sourceValid(nationality.source),`${player.name}: invalid nationality`);
            requireField(nationality.representation===country?.representation,`${player.name}: invalid country representation`);
        }
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
    for(const [id,aliases] of Object.entries(data.aliases||{})){
        requireField(ids.has(Number(id))&&Array.isArray(aliases)&&aliases.length>0,`Invalid/empty alias player record: ${id}`);
        const seen=new Set();
        for(const alias of Array.isArray(aliases)?aliases:[]){
            const name=String(alias?.name||'').normalize('NFC').trim().toLowerCase();
            requireField(text(alias?.name)&&alias.name===alias.name.trim()&&!seen.has(name)&&alias.verified===true&&sourceValid(alias.source),`Invalid/unverified/duplicate alias: ${id}`);
            seen.add(name);
        }
    }
    const quotedText=new Map();
    for(const quote of data.quotes){
        if(quote===null)continue;
        const normalized=String(quote?.text||'').normalize('NFC').replace(/[‘’]/g,"'").trim().replace(/\s+/g,' ').toLowerCase();
        requireField(!!quote&&ids.has(quote.playerId)&&text(quote.text)&&quote.text.trim().split(/\s+/).length<=25&&typeof quote.verified==='boolean'&&quote.verified===true&&quote.language==='en'&&quote.localization==='official-English-'+quote.sourceType&&!/[\u0400-\u052F\u0600-\u06FF\uAC00-\uD7AF\u3040-\u30FF\u3400-\u9FFF]/.test(quote.text)&&['manga','anime'].includes(quote.sourceType)&&positiveInteger(quote[quote.sourceType==='manga'?'chapter':'episode'])&&/^https:\/\/\S+$/.test(quote.sourceReference)&&text(quote.sourceNote),`Unverified/malformed quote: ${quote?.playerId}`);
        for(const field of ['chapter','episode'])if(quote?.[field]!==undefined)requireField(positiveInteger(quote[field]),`Invalid quote ${field}: ${quote.playerId}`);
        if(quote?.timestamp!==undefined)requireField(/^\d{2}:\d{2}$/.test(quote.timestamp),`Invalid quote timestamp: ${quote.playerId}`);
        requireField(!quotedText.has(normalized),`Duplicate quote across player records: ${quote?.playerId}`);quotedText.set(normalized,quote?.playerId);
    }
    for(const [name,slots] of Object.entries(data.formations)){
        requireField(slots.length===11&&slots.filter(slot=>slot.label==='GK').length===1,`${name}: invalid formation slot count`);
        for(const slot of slots)requireField(POSITIONS.has(slot.label)&&[slot.x,slot.y].every(axis=>Number.isFinite(axis)&&axis>=0&&axis<=100),`${name}: invalid label/coordinate`);
    }
    requireField(formationFingerprint(data.formations)===data.expectedFormationFingerprint,'Formation definitions/coordinates changed from the v0.6.9 latest-main baseline');
    return errors;
}
module.exports={formationFingerprint,validateReferenceData};
