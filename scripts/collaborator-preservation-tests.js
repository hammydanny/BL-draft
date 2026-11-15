'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..'),fixture=require('./fixtures/collaborator-v8988.json');const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function functionBody(source,name){const start=source.indexOf('function '+name+'(');assert(start>=0,name);let at=source.indexOf('{',start),depth=0,quote='',comment='';for(let i=at;i<source.length;i++){const c=source[i],n=source[i+1];if(comment==='line'){if(c==='\n')comment='';continue;}if(comment==='block'){if(c==='*'&&n==='/'){comment='';i++;}continue;}if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote='';continue;}if(c==='/'&&n==='/'){comment='line';i++;continue;}if(c==='/'&&n==='*'){comment='block';i++;continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='{')depth++;if(c==='}'&&!--depth)return source.slice(start,i+1);}throw Error(name);}
function runCollaboratorPreservationTests(){
 for(const [file,expected]of Object.entries(fixture.files))if(file!=='js/players/isagi/player.js')assert.equal(hash(fs.readFileSync(path.join(root,file),'utf8')),expected,'Syaafi source preserved '+file);
 const source=fs.readFileSync(path.join(root,'js/battle-sim.js'),'utf8');
 for(const [name,expected]of Object.entries(fixture.functions))if(!['flowAware','runPlanetHotline'].includes(name))assert.equal(hash(functionBody(source,name)),expected,'Syaafi unrelated engine preserved '+name);
 const {createModeTestContext}=require('./game-modes-tests'),h=createModeTestContext(),current=JSON.parse(h.run('JSON.stringify(playerById(1))')),original=require('./fixtures/isagi-before-restoration.json');
 const omitRequested=p=>{p=JSON.parse(JSON.stringify(p));p.image=new URL(p.image,"https://example.test/BL-draft/").href;const k=p.battleSim;delete k.dialogue.hotline;delete k.dialogue.flow;const m=k.ultimates.find(a=>a.id==='move-it');delete m.description;delete m.params.teammateRangeMeters;for(const r of k.reactions){if(r.id==='reflexive-synchronization'){delete r.description;delete r.cooldownTicks;}if(r.id==='planet-hotline')delete r.description;}return p;};
 assert.deepEqual(omitRequested(current),omitRequested(original),'only explicitly requested Isagi fields change');
 assert.equal((source.match(/function runPlanetHotline\(/g)||[]).length,1);assert.equal((source.match(/function tryMoveIt\(/g)||[]).length,1);
 assert.equal(current.battleSim.reactions.find(a=>a.id==='reflexive-synchronization').cooldownTicks,5);assert.equal(current.battleSim.ultimates.find(a=>a.id==='move-it').params.teammateRangeMeters,3);
 console.log('PASS collaborator preservation: exact Hiori/John records and unrelated engine functions; explicit Isagi correction allowlist, single reaction implementations');
}
if(require.main===module)runCollaboratorPreservationTests();module.exports={runCollaboratorPreservationTests};
