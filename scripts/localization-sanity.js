#!/usr/bin/env node
'use strict';
// Integrity errors block the check. Statistical warnings require contextual review;
// they are not proof of a bad translation or a substitute for language review.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const languages=['ms','ja','ar','zh-CN','fr','de','ko','pt','ru','es'];
const placeholders=value=>[...value.matchAll(/\{([A-Za-z_][\w]*|\d+)\}/g)].map(match=>match[1]).sort();
function scan(records){
    const errors=[],warnings=[];
    for(const {source,values,slots} of records){
        for(const language of languages){
            const value=values[language],entry={source,language};
            if(typeof value!=='string'||!value.trim()){
                errors.push({...entry,reason:'Missing or empty required translation'});continue;
            }
            const actual=placeholders(value),expected=slots||placeholders(source);
            if(JSON.stringify(actual)!==JSON.stringify(expected))errors.push({...entry,reason:'Interpolation placeholders changed',expected,actual});
            if(/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value)||/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value))errors.push({...entry,reason:'Broken Unicode or control character'});
            if(/[{}]/.test(value.replace(/\{(?:[A-Za-z_][\w]*|\d+)\}/g,'')))errors.push({...entry,reason:'Malformed interpolation braces'});
            const words=(value.toLocaleLowerCase(language).match(/[\p{L}\p{M}\p{N}]+/gu)||[]);
            const counts=new Map();let run=0,maximumRun=0,previous='';
            for(const word of words){counts.set(word,(counts.get(word)||0)+1);run=word===previous?run+1:1;maximumRun=Math.max(maximumRun,run);previous=word;}
            const common=[...counts].sort((a,b)=>b[1]-a[1])[0];
            if(maximumRun>=5||common&&common[1]>=12&&common[1]/words.length>0.35)warnings.push({...entry,reason:'Excessive word repetition',word:common?.[0],maximumRun});
            // Also catches unspaced CJK corruption such as 등등등등등등등등.
            if(/([\p{L}\p{M}]{1,12})\1{7,}/u.test(value))warnings.push({...entry,reason:'Repeated character sequence'});
            if(value.length>200&&value.length>source.length*3.5)warnings.push({...entry,reason:'Unusually long translation',sourceLength:source.length,valueLength:value.length});
            if(/\?\s*\?/.test(value)||/^(?:TODO|TBD|undefined|null)$/i.test(value.trim()))warnings.push({...entry,reason:'Possible placeholder garbage'});
            if(source.includes('S–G')&&!value.includes('S–G'))warnings.push({...entry,reason:'Grade-scale formatting lost'});
        }
    }
    return {errors,warnings};
}
function load(root){
    const context=vm.createContext({window:{}});
    vm.runInContext(fs.readFileSync(path.join(root,'js/i18n/messages.js'),'utf8'),context);
    const localization=fs.readFileSync(path.join(root,'js/localization.js'),'utf8');
    const match=localization.match(/const overrides=Object\.freeze\((\{.*\})\);/);
    const overrides=match?JSON.parse(match[1]):{};
    const messages=context.window.BLD_MESSAGES;
    const records=Object.keys({...messages,...overrides}).map(source=>({source,values:{...messages[source],...overrides[source]}}));
    for(const template of context.window.BLD_MESSAGE_TEMPLATES){
        // Templates have no English literal. Require all languages to preserve
        // the same numbered substitution slots as the Malay reference template.
        records.push({source:template.pattern.source,values:template,slots:placeholders(template.ms)});
    }
    return records;
}
module.exports={scan,load,languages};
if(require.main===module){
    const root=path.resolve(__dirname,'..'),result=scan(load(root));
    if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
    else{
        for(const item of result.errors)console.error('ERROR',item.language,item.reason,JSON.stringify(item.source));
        for(const item of result.warnings)console.warn('REVIEW',item.language,item.reason,JSON.stringify(item.source));
        console.log(`Localization sanity: ${result.errors.length} integrity errors, ${result.warnings.length} contextual review warnings.`);
    }
    process.exitCode=result.errors.length?1:0;
}
