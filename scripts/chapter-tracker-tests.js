#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const tracker=require('../js/chapter-tracker.js'),root=path.resolve(__dirname,'..');
function runChapterTests(){
 const current=JSON.parse(fs.readFileSync(path.join(root,'data/latest-chapter.json'),'utf8'));
 tracker.validate(current);
 const baseline={...current,chapter:364,part:null,label:'364',verification:'manual-official',latestVerified:true,publicationDate:null,verifiedAt:'2026-11-01T00:00:00Z'},next={...baseline,chapter:365,label:'365'};
 assert.equal(tracker.decision(baseline,next),'update');assert.equal(tracker.decision(baseline,baseline),'unchanged');
 assert.throws(()=>tracker.decision(next,baseline),/Decreasing/);
 assert.throws(()=>tracker.validate({...next,publicationDate:'2999-01-01'}),/future/);
 assert.throws(()=>tracker.validate({...next,publicationDate:'2026-02-30'}));
 for(const patch of [{chapter:364.1},{chapter:0},{part:1.2},{part:'2'},{label:'oops'},{sourceUrl:'https://evil.test/'},{verifiedAt:'bad'},{latestVerified:'true'},{schemaVersion:2},{latestVerified:true,verification:'official-catalog'}])assert.throws(()=>tracker.validate({...next,...patch}));
 const part=(chapter,part)=>({...baseline,chapter,part,label:String(chapter)+(part===null?'':'.'+part)});
 assert(tracker.compare(part(364,2),part(364,10))<0);assert(tracker.compare(part(364,10),part(364,null))<0);assert(tracker.compare(part(364,null),part(365,1))<0);
 assert.throws(()=>tracker.decision(baseline,{...next,chapter:390,label:'390'}),/jump/);
 assert.equal(tracker.decision(baseline,{...next,latestVerified:false,verification:'official-catalog'}),'unconfirmed');
 const html='<h1>Blue Lock Chapters</h1><h3>Chapter 364.2</h3><p>Read now for $0.99</p><h3>Chapter 365</h3><p>Coming soon / scheduled</p>';
 assert.deepEqual(tracker.parseCatalog(html),{chapter:364,part:2});
 for(const response of [null,'<h1>Other series</h1><h3>Chapter 999</h3>Read now for','<h1>Blue Lock Chapters</h1><p>365 chapters available</p>'])assert.throws(()=>tracker.parseCatalog(response));
 assert(fs.readFileSync(path.join(root,'js/version.js'),'utf8').includes('APP_SUPPORTED_CHAPTER=364'));
 const runtime=fs.readFileSync(path.join(root,'js/site-runtime.js'),'utf8');assert(runtime.includes('cache:"no-store"'));assert(runtime.includes('LATEST MANGA CHAPTER')&&runtime.includes('BL-DRAFT CANON COVERAGE')&&runtime.includes('Verification pending'));
 assert(runtime.includes('https://raw.githubusercontent.com/hammydanny/BL-draft/main/data/latest-chapter.json'),'bot data commits reach the client without a new Pages deployment');
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/latest-chapter.yml'),'utf8');assert(workflow.includes('git add -- data/latest-chapter.json'));assert(!workflow.includes('--force'));assert(!workflow.includes('set-version'));
 const before=fs.readFileSync(path.join(root,'data/latest-chapter.json'),'utf8');
 const check=require('./update-latest-chapter.js').check;
 const manualRecord=require('./update-latest-chapter.js').manualRecord;
 const human={chapter:'365',part:'',date:'',source:tracker.SOURCE,confirmed:'true'};
 assert.equal(manualRecord(human,Date.now()).label,'365');
 assert.throws(()=>manualRecord({...human,confirmed:'false'},Date.now()));
 assert.throws(()=>manualRecord({...human,source:'https://evil.test/'},Date.now()));
 const temp=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'bld-chapter-test-')),tempFile=path.join(temp,'chapter.json');fs.writeFileSync(tempFile,JSON.stringify(baseline));
 return Promise.all([
  check({manual:human,filePath:tempFile}).then(result=>{assert.equal(result,'update');assert.equal(JSON.parse(fs.readFileSync(tempFile,'utf8')).chapter,365);return check({manual:human,filePath:tempFile});}).then(result=>assert.equal(result,'unchanged')).finally(()=>{fs.unlinkSync(tempFile);fs.rmdirSync(temp);}),
  check({fetcher:async()=>{throw Error('offline');}}).then(result=>assert.equal(result,'unavailable')),
  check({fetcher:async()=>({ok:true,text:async()=>'<html>changed source</html>'})}).then(result=>assert.equal(result,'unavailable')),
  check({fetcher:async()=>({ok:true,text:async()=>html})}).then(result=>assert.equal(result,'unconfirmed'))
 ]).then(()=>{assert.equal(fs.readFileSync(path.join(root,'data/latest-chapter.json'),'utf8'),before);console.log('PASS chapter tracker: schema, ordering, future/older/jump rejection, source ambiguity/offline safety, labels, independent canon coverage and narrow workflow');});
}
if(require.main===module)runChapterTests().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={runChapterTests};
