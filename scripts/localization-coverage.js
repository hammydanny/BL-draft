#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function parseFrozen(source,name){
    const token='const '+name+'=Object.freeze(',start=source.indexOf(token);
    if(start<0)return {};
    let i=start+token.length,depth=0,inString=false,escaped=false,quote='',begin=i;
    for(;i<source.length;i++){
        const char=source[i];
        if(inString){if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char===quote)inString=false;continue;}
        if(char==='"'||char==="'"){inString=true;quote=char;continue;}
        if(char==='{')depth++;
        else if(char==='}'&&--depth===0)return JSON.parse(source.slice(begin,i+1));
    }
    throw new Error('Unclosed localization catalog '+name);
}
function catalog(){
    const context=vm.createContext({window:{}});
    vm.runInContext(read('js/i18n/messages.js'),context);
    for(const file of ['js/i18n/quote-messages.js','js/i18n/replayability-messages.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
    const localization=read('js/localization.js');
    return {
        ...context.window.BLD_MESSAGES,
        ...parseFrozen(localization,'overrides'),
        ...parseFrozen(localization,'releaseGateOverrides')
    };
}
function resolver(entries){
    const folded=new Map(Object.entries(entries).map(([key,value])=>[key.toLocaleLowerCase('en'),value]));
    const direct=key=>entries[key]||entries[key.toUpperCase()]||folded.get(key.toLocaleLowerCase('en'));
    return function covered(value,seen=new Set()){
        const key=String(value).replace(/\s+/g,' ').trim();
        if(!key||seen.has(key))return false;
        seen.add(key);
        if(direct(key))return true;
        let match=key.match(/^Blue Lock Draft — (.+?) — (.+)$/);
        if(match)return covered(match[1],seen)&&covered(match[2],seen);
        if(key.startsWith('Blue Lock Draft — '))return covered(key.slice(18),seen);
        if(key.endsWith(' — Blue Lock Draft'))return covered(key.slice(0,-18),seen);
        match=key.match(/^\d{2}\s*\/{1,2}\s*(.+)$/);
        if(match)return covered(match[1],seen);
        if(key.startsWith('FORMATION // '))return covered('FORMATION',seen);
        if(key.includes(' // ')){
            const parts=key.split(' // ');
            return parts.every(part=>!/[A-Za-z]/.test(part)||intentional(part)||covered(part,new Set(seen)));
        }
        if(/^No sustained shared on-field system has been demonstrated in Blue Lock through chapter \d+\.$/.test(key))
            return !!direct('No sustained shared on-field system has been demonstrated in Blue Lock through chapter {chapter}.');
        return false;
    };
}
function decode(value){
    return value.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
}
function intentional(value){
    return /^(?:BLUE LOCK|BLUE LOCK DRAFT|English|Bahasa Melayu|日本語|Français|Deutsch|한국어|Português|Русский|Español|العربية|简体中文|website|noindex|HAMMYDANNY(?: ↗)?|SYAAFIBWN(?: ↗)?|#[0-9A-F]{6}|[A-Z]{1,3}|SIDE-B|NG XI|\$[\d,]+(?: \/\/ \$\d+ INTERVAL)?|\d+v\d+|V\d+(?:\.\d+)*(?:\.x)?(?: ALPHA)?|V0\.5\.1 \/ 0\.51|Noto Sans.*SIL OFL 1\.1)$/i.test(value);
}
function sourceStrings(html){
    html=html.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'')
        // Viewport directives configure the browser; descriptive metadata still needs translation.
        .replace(/<meta\b(?=[^>]*\bname\s*=\s*["']viewport["'])[^>]*>/gi,'');
    const values=[];
    for(const match of html.matchAll(/>([^<>]+)</g))values.push(decode(match[1]));
    for(const match of html.matchAll(/\b(?:aria-label|aria-description|title|placeholder|content)="([^"]+)"/gi))values.push(decode(match[1]));
    return [...new Set(values)];
}
function staticCoverage(covered){
    const pages=[
        'index.html','404.html','privacy/index.html','legal/index.html','changelog/index.html',
        'lore/index.html','team-builder/index.html','auction/setup/index.html','auction/room/index.html',
        'auction/results/index.html','auction/team-builder/index.html'
    ];
    const missing=[];
    for(const file of pages){
        for(const value of sourceStrings(read(file))){
            if(!/[A-Za-z]/.test(value)||value.length<2||intentional(value)||covered(value))continue;
            // <time datetime> is localized at runtime with Intl.DateTimeFormat.
            if(/^\d{1,2} [A-Za-z]+ 20\d{2}$/.test(value))continue;
            missing.push({file,value});
        }
    }
    return missing;
}
function quoteCoverage(covered){
    const reference=read('js/player-reference.js'),marker='const PLAYER_QUOTES=Object.freeze(',start=reference.indexOf(marker);
    if(start<0)return [{file:'js/player-reference.js',value:'PLAYER_QUOTES registry missing'}];
    let i=start+marker.length,depth=0,inString=false,escaped=false,quote='',begin=i,end=-1;
    for(;i<reference.length;i++){
        const char=reference[i];
        if(inString){if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char===quote)inString=false;continue;}
        if(char==='"'||char==="'"){inString=true;quote=char;continue;}
        if(char==='[')depth++;
        else if(char===']'&&--depth===0){end=i+1;break;}
    }
    if(end<0)return [{file:'js/player-reference.js',value:'PLAYER_QUOTES registry could not be parsed'}];
    const canonical=JSON.parse(reference.slice(begin,end)).map(record=>record?.text).filter(value=>typeof value==='string'&&/[\p{L}]/u.test(value));
    const players=read('js/players.js'),secret=[];
    for(const match of players.matchAll(/\bquote\s*:\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g)){
        try{const value=vm.runInNewContext(match[1]);if(typeof value==='string'&&/[\p{L}]/u.test(value))secret.push(value);}catch{}
    }
    return [...new Set([...canonical,...secret])].filter(value=>!covered(value)).map(value=>({file:'player-quotes',value}));
}
function dynamicCoverage(covered){
    // Hotspots that generate user-visible text dynamically and therefore are not present
    // as ordinary static page text during the HTML scan.
    const required=[
        'ADD PLAYER','BEST FIT','GOOD FIT','OUT OF POSITION','NO RESERVES AVAILABLE','CLOSE',
        'ASSIGNED','NO FORMATION BUILT','Auction results report',
        'Select at least one player from the Global Player Pool first. Auto Best Team only uses players in your selected standalone roster.',
        'SELECT A ROSTER','No valid lineup could be generated from this roster.','Standalone Auto Best failed:',
        'Bid amount','CONTINUE BUILDING','ENTER A VALID TEAM SIZE','best XI',
        'SPECIAL CHEMISTRY','You know the guy with blonde hair and sharp teeth?','NO LINK',
        'A player cannot form chemistry with themself.',
        'No sustained shared on-field system has been demonstrated in Blue Lock through chapter 364.'
    ];
    return required.filter(value=>!covered(value)).map(value=>({file:'dynamic-ui',value}));
}
function replayabilityCoverage(covered){
    const missing=[];
    for(const file of ['js/replayability.js','js/ui/replayability-ui.js']){
        const source=read(file),values=[];
        for(const match of source.matchAll(/(?:replayFail|replayText|replayDialog|showSiteError|showConfirm)\("([^"\n]+)"/g))values.push(match[1]);
        for(const match of source.matchAll(/(?:showSiteError|showConfirm)\("[^"\n]+",\s*"([^"\n]+)"/g))values.push(match[1]);
        for(const match of source.matchAll(/modeDefinition\("[^"\n]+","([^"\n]+)","([^"\n]+)"/g))values.push(match[1],match[2]);
        for(const match of source.matchAll(/\blabel:"([A-Z][A-Z ]+)"/g))values.push(match[1]);
        if(file.endsWith('-ui.js'))for(const match of source.matchAll(/>\s*([A-Za-z][^<>${}`\n]*?)\s*</g))values.push(match[1]);
        for(const match of source.matchAll(/(?:aria-label|placeholder)="([^"${}]+)"/g))values.push(match[1]);
        for(const value of new Set(values.map(decode))){if(value!=="S+"&&!intentional(value)&&!covered(value))missing.push({file,value});}
    }
    for(const value of ['CPU considering…','CPU passes','CPU raises','CPU prioritising squad need','EASY','NORMAL','HARD','PREPARING IMAGE…','SAVE IMAGE','Some portraits are not ready. Try again.','Image export is unavailable.','I can run my ass off.','CHALLENGE COMPLETE','CHALLENGE IN PROGRESS','COMPLETE SQUAD','CHALLENGE POOL']){
        if(!covered(value))missing.push({file:'replayability-dynamic-ui',value});
    }
    for(const value of ['NOMINATE','A star-first manager who can overlook squad balance.','Balances starting roles, value and chemistry.','Plans formations, protects future contracts and rejects marginal upgrades.','Choose one of three public targets before each auction. Spend scouting refreshes carefully.','Classic auction rules. Objectives are checked at squad review.','Build a squad within the challenge rules.','EXTREME','VS CPU','CHALLENGES','COMPLETED','PERSONAL BEST','TODAY\'S MISSION','EGO SINGULARITY','WORLD CLASS DRAFT','ELITE SQUAD','STRONG FOUNDATION','INCOMPLETE EGO','REBUILD THE VISION','ELITE CONTRACTS','BONUS','MISSION FAILED','YOUR SQUAD HAS THE EDGE','CPU SQUAD HAS THE EDGE','BALANCED DRAFT','DAILY REPORT','MISSION REPORT','DAILY MARKET','MISSION MARKET','TEAM REPORT','SAVE PREVIEW','Result image preview','This is the exact image that will be saved.','NOMINATE YOUR NEXT TARGET','Choose the footballer who best serves this mission. Both managers may bid.','SCOUT MARKET','Refresh moves these targets to the back of the market. It does not remove them.','EXCLUSIVE CONTRACT','The other squad cannot sign this player under the mission rules.','SIGN PLAYER','This contract exceeds the mission limit.','Enter a budget in valid bid intervals.'])if(!covered(value))missing.push({file:'v072-mode-ui',value});
    return missing;
}
function soloDraftCoverage(covered){
    const missing=[];
    for(const file of ['js/solo-draft.js','js/ui/solo-draft-ui.js']){
        const source=read(file),values=[];
        for(const match of source.matchAll(/(?:replayFail|replayText|replayDialog|showSiteError|showConfirm)\("([^"\n]+)"/g))values.push(match[1]);
        for(const match of source.matchAll(/(?:showSiteError|showConfirm)\("[^"\n]+",\s*"([^"\n]+)"/g))values.push(match[1]);
        for(const match of source.matchAll(/(?:title|description):"([^"\n]+)"/g))values.push(match[1]);
        for(const match of source.matchAll(/mission\("[^"\n]+","([^"\n]+)","([^"\n]+)"/g))values.push(match[1],match[2]);
        for(const match of source.matchAll(/"([A-Z][A-Z '+.:?\/-]+)"/g))values.push(match[1]);
        if(file.endsWith('-ui.js'))for(const match of source.matchAll(/>\s*([A-Za-z][^<>${}`\n]*?)\s*</g))values.push(match[1]);
        for(const match of source.matchAll(/(?:aria-label|placeholder)="([^"${}]+)"/g))values.push(match[1]);
        for(const value of new Set(values.map(decode)))if(value!=="S+"&&!intentional(value)&&!covered(value))missing.push({file,value});
    }
    return missing;
}
function scanCoverage(){
    const entries=catalog(),covered=resolver(entries);
    const missing=[...staticCoverage(covered),...dynamicCoverage(covered),...quoteCoverage(covered),...replayabilityCoverage(covered),...soloDraftCoverage(covered)];
    return {missing,catalogSize:Object.keys(entries).length};
}
module.exports={scanCoverage,sourceStrings,resolver,quoteCoverage};

if(require.main===module){
    const result=scanCoverage();
    for(const item of result.missing)console.error('MISSING',item.file,JSON.stringify(item.value));
    console.log(`Localization coverage: ${result.missing.length} uncovered source string(s), ${result.catalogSize} catalog entries.`);
    process.exitCode=result.missing.length?1:0;
}
