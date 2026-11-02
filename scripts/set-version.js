#!/usr/bin/env node
'use strict';
// Moves every cache-busting reference to the release in js/version.js.
//
//   node scripts/set-version.js            align references with the current APP_VERSION
//   node scripts/set-version.js 0.7.3      set APP_VERSION first, then align
//   node scripts/set-version.js --check    report stale references without writing
//
// Covers HTML asset query strings (`?v=`), the per-character module loader and the
// image/font service-worker cache name. Other query parameters are preserved.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.name.startsWith('.')||entry.name==='node_modules'?[]:entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
function currentVersion(){return /const APP_VERSION="([^"]+)"/.exec(read('js/version.js'))[1];}
function expected(version){
    const files={};
    for(const file of walk(root).filter(file=>file.endsWith('.html'))){
        const relative=path.relative(root,file),source=read(relative);
        files[relative]=source.replace(/((?:src|href)="[^"?]+\?v=)[^"&]+/g,(_,prefix)=>prefix+version);
    }
    files['js/players-loader.js']=read('js/players-loader.js').replace(/const version = "[^"]+";/,`const version = "${version}";`);
    files['service-worker.js']=read('service-worker.js').replace(/const CACHE_NAME="bld-static-v[^"]+";/,`const CACHE_NAME="bld-static-v${version}";`);
    return files;
}
function stale(version=currentVersion()){return Object.entries(expected(version)).filter(([file,content])=>read(file)!==content).map(([file])=>file);}
module.exports={stale,currentVersion};

if(require.main===module){
    const args=process.argv.slice(2);
    if(args.includes('--check')){const files=stale();for(const file of files)console.error('STALE',file);console.log(`Version references: ${files.length} stale file(s) for ${currentVersion()}.`);process.exitCode=files.length?1:0;return;}
    const requested=args.find(arg=>/^\d+(?:\.\d+){1,3}$/.test(arg));
    if(requested){const file=path.join(root,'js/version.js');fs.writeFileSync(file,read('js/version.js').replace(/const APP_VERSION="[^"]+";/,`const APP_VERSION="${requested}";`));}
    const version=currentVersion();let written=0;
    for(const [file,content] of Object.entries(expected(version)))if(read(file)!==content){fs.writeFileSync(path.join(root,file),content);written++;}
    console.log(`Version ${version}: ${written} file(s) updated.`);
}
