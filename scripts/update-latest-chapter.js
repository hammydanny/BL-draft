#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),tracker=require('../js/chapter-tracker.js');
const file=path.resolve(__dirname,'../data/latest-chapter.json');
function manualRecord(manual,now){
 if(manual.confirmed!=='true')throw Error('Explicit official-latest verification required');
 return tracker.validate({schemaVersion:1,chapter:Number(manual.chapter),part:manual.part?Number(manual.part):null,label:String(Number(manual.chapter))+(manual.part?'.'+Number(manual.part):''),publicationDate:manual.date||null,sourceUrl:manual.source,verifiedAt:new Date(now).toISOString(),verification:'manual-official',latestVerified:true},now);
}
async function check({fetcher=fetch,manual=null,now=Date.now(),filePath=file}={}){
 const previous=tracker.validate(JSON.parse(fs.readFileSync(filePath,'utf8')),now);
 // Explicit maintainer verification is the fallback when machine access is
 // blocked. This path records a human official-source check; it never scrapes
 // or infers global recency from the partial English catalog.
 if(manual){
  const candidate=manualRecord(manual,now),result=tracker.decision(previous,candidate,now,manual.confirmJump==='true');
  if(result==='update')fs.writeFileSync(filePath,JSON.stringify(candidate,null,2)+'\n');
  console.log('Manual official-source verification: '+result);return result;
 }
 try{
  const response=await fetcher(tracker.SOURCE,{signal:AbortSignal.timeout(20000),redirect:'error',headers:{'User-Agent':'BL-Draft chapter verification (github.com/hammydanny/BL-draft)'}});
  if(!response.ok)throw Error('Official source unavailable: '+response.status);
  const published=tracker.parseCatalog(await response.text());
  console.log(`Official English catalog confirms ${published.chapter}${published.part?'.'+published.part:''}; global latest publication requires manual verification. Stored data unchanged.`);return 'unconfirmed';
 }catch(error){console.warn('Chapter check preserved last confirmed value: '+error.message);return 'unavailable';}
}
if(require.main===module)check({manual:process.env.CHAPTER_NUMBER?{chapter:process.env.CHAPTER_NUMBER,part:process.env.CHAPTER_PART,date:process.env.CHAPTER_DATE,source:process.env.CHAPTER_SOURCE,confirmed:process.env.CHAPTER_CONFIRMED,confirmJump:process.env.CHAPTER_CONFIRM_JUMP}:null}).catch(()=>{process.exitCode=1;});
module.exports={check,manualRecord};
