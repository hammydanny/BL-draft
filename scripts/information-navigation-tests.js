#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
function runInformationNavigationTests(){
 const source=read('js/ui/site-directory.js').replace(/\ninitSiteDirectory\(\);\s*$/,'\n');
 let count=0;
 for(const base of ['https://hammydanny.github.io/BL-draft/','https://example.test/'])for(const file of ['changelog/index.html','privacy/index.html','legal/index.html','404.html']){
  const html=read(file),pageUrl=new URL(file,base),baseNode={href:new URL(/<base[^>]*href="([^"]+)"/.exec(html)[1],pageUrl).href};
  if(file==='404.html')vm.runInNewContext(/<script>([\s\S]*?)<\/script>/.exec(html)[1],{URL,location:pageUrl,document:{querySelector:()=>baseNode}});
  const baseURI=baseNode.href;
  const buttons=new Map();
  for(const tag of html.matchAll(/<button\b[^>]*>/g)){
   const action=/data-directory-action="([^"]+)"/.exec(tag[0])?.[1],href=/data-directory-href="([^"]+)"/.exec(tag[0])?.[1];if(action&&href)buttons.set(action,href);
  }
  let assigned=null;
  const context=vm.createContext({URL,window:{location:{assign:href=>assigned=href}},document:{baseURI,body:{dataset:{sitePage:/data-site-page="([^"]+)"/.exec(html)[1]}},querySelector(selector){const action=/data-directory-action="([^"]+)"/.exec(selector)?.[1];return buttons.has(action)?{dataset:{directoryHref:buttons.get(action)}}:null;}}});
  vm.runInContext(source,context);
  // No router, uiState or game globals exist in this information-page context.
  for(const [action,href]of buttons){assigned=null;vm.runInContext(`runDirectoryAction(${JSON.stringify(action)})`,context);assert.equal(assigned,new URL(href,base).href,file+' '+action);count++;}
  assert(buttons.has('battle-sim'));assert.equal(new URL(buttons.get('battle-sim'),baseURI).href,new URL('battle-sim/initializer/',base).href);
 }
 let opened=0;const game=vm.createContext({document:{body:{dataset:{}}},openBattleSimPage(){opened++;}});vm.runInContext(source,game);vm.runInContext("runDirectoryAction('battle-sim')",game);assert.equal(opened,1,'Game documents keep their existing navigation helper');
 const html=read('changelog/index.html'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 const links=[...html.matchAll(/href="changelog\/#([^"]+)"/g)].map(m=>m[1]);for(const id of links)assert(ids.includes(id),'Broken release anchor '+id);
 for(const version of ['0.8.8.1','0.8.8','0.8.7','0.8.6','0.8.5','0.8.4','0.8.3','0.8.2','0.8.1.2','0.8.1.1','0.8.0']){const id='release-'+version.replaceAll('.','');assert(links.includes(id),'Release missing from index '+version);assert(html.includes('>V'+version+'</h3>'),'Release missing from history '+version);}
 assert(html.includes('V0.8 SERIES')&&html.includes('V0.7 SERIES'));assert(!html.includes('V0.8.9'));
 console.log(`PASS information navigation: ${count} real header targets across all four information pages and root/subpath hosting without game globals; game Battle Sim helper; complete 0.8 history, unique IDs and every release anchor`);
}
if(require.main===module)runInformationNavigationTests();module.exports={runInformationNavigationTests};
