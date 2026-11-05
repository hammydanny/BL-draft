// Shared validation for the static client and scheduled maintenance. No canon writes.
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.ChapterTracker=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const SOURCE='https://kodansha.us/series/blue-lock/chapters/';
 function official(url){try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&['kodansha.us','kmanga.kodansha.com','s.kmanga.kodansha.com','pocket.shonenmagazine.com','shonenmagazine.com'].includes(u.hostname);}catch{return false;}}
 function validate(value,now=Date.now()){
  if(!value||value.schemaVersion!==1||!Number.isInteger(value.chapter)||value.chapter<1||value.chapter>2000)throw Error('Invalid chapter schema');
  if(value.part!==null&&(!Number.isInteger(value.part)||value.part<1||value.part>99))throw Error('Invalid chapter part');
  if(value.label!==String(value.chapter)+(value.part===null?'':'.'+value.part))throw Error('Invalid chapter label');
  if(!official(value.sourceUrl)||!['official-catalog','manual-official'].includes(value.verification)||typeof value.latestVerified!=='boolean')throw Error('Invalid verification source');
  if(value.latestVerified&&value.verification!=='manual-official')throw Error('Catalog cannot establish the global latest release');
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value.verifiedAt)||!Number.isFinite(Date.parse(value.verifiedAt))||Date.parse(value.verifiedAt)>now)throw Error('Invalid verification timestamp');
  if(value.publicationDate!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(value.publicationDate)||!Number.isFinite(Date.parse(value.publicationDate))||new Date(value.publicationDate).toISOString().slice(0,10)!==value.publicationDate||Date.parse(value.publicationDate)>now))throw Error('Invalid or future publication date');
  return value;
 }
 // A whole chapter supersedes its numbered parts. Parts are integers, never floats.
 function compare(a,b){return a.chapter-b.chapter||(a.part===null?100:a.part)-(b.part===null?100:b.part);}
 function decision(previous,candidate,now=Date.now(),manualJump=false){
  validate(previous,now);validate(candidate,now);
  const order=compare(candidate,previous);
  if(order<0)throw Error('Decreasing chapter rejected');
  if(candidate.chapter-previous.chapter>3&&!manualJump)throw Error('Unexpected chapter jump requires manual verification');
  if(!candidate.latestVerified)return 'unconfirmed';
  return order===0&&previous.latestVerified?'unchanged':'update';
 }
 function parseCatalog(html){
  if(typeof html!=='string'||html.length>5000000||!/<h1[^>]*>\s*Blue Lock Chapters\s*<\/h1>/i.test(html))throw Error('Unrecognized official catalog');
  const entries=[];
  for(const m of html.matchAll(/<h[23][^>]*>\s*Chapter\s+(\d+)(?:\.(\d+))?\s*<\/h[23]>([\s\S]*?)(?=<h[23]\b|$)/gi)){
   // Listed counts, schedules, free-access dates and titles are never release evidence.
   if(!/Read now for/i.test(m[3])||/coming soon|pre-?order|scheduled/i.test(m[3]))continue;
   entries.push({chapter:Number(m[1]),part:m[2]?Number(m[2]):null});
  }
  if(!entries.length)throw Error('No published catalog entries');
  return entries.sort(compare).at(-1);
 }
 return Object.freeze({SOURCE,official,validate,compare,decision,parseCatalog});
});
