#!/usr/bin/env node
'use strict';
// One master document, many URLs.
//
// `index.html` is the single editable game shell. The canonical directory pages are
// regenerated from it (only their <base>, title, canonical URL and descriptive
// metadata differ), every other document receives the identical site header and
// footer, and legacy `*.html` URLs become tiny redirects into their canonical route.
//
//   node scripts/sync-shells.js          rewrite generated documents
//   node scripts/sync-shells.js --check  report drift without writing (used by preflight)
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const MASTER='index.html';
const GAME_SHELLS={
    'lore/index.html':{base:'../',title:'Blue Lock Draft — Lore',canonical:'lore/'},
    'team-builder/index.html':{base:'../',title:'Blue Lock Draft — Team Builder',canonical:'team-builder/'},
    'auction/setup/index.html':{base:'../../',title:'Blue Lock Draft — Auction Setup',canonical:'auction/setup/'},
    'auction/room/index.html':{base:'../../',title:'Blue Lock Draft — Auction Room',canonical:'auction/room/'},
    'auction/results/index.html':{base:'../../',title:'Blue Lock Draft — Auction Results',canonical:'auction/results/'},
    'auction/team-builder/index.html':{base:'../../',title:'Blue Lock Draft — Auction Team Builder',canonical:'auction/team-builder/'}
};
const LEGACY_REDIRECTS={
    'lore.html':'lore/index.html',
    'team-builder.html':'team-builder/index.html',
    'auction/setup.html':'auction/setup/index.html',
    'auction/room.html':'auction/room/index.html',
    'auction/results.html':'auction/results/index.html',
    'auction/team-builder.html':'auction/team-builder/index.html'
};
// Documents with their own body that still share the global header and footer.
const SHARED_CHROME=['changelog/index.html','privacy/index.html','legal/index.html','404.html','battle-sim/initializer/index.html','battle-sim/game/index.html','battle-sim/results/index.html'];

const headerBlock=source=>source.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
const footerBlock=source=>source.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
const attr=value=>value.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const describe=title=>`${title} — an unofficial Blue Lock fan project for player drafting, squad building and chemistry.`;

function gameShell(master,{base,title,canonical}){
    const lines=master.split('\n'),out=[];
    for(const line of lines){
        if(/^\s*<title>/.test(line)){out.push(`    <title>${title}</title>`);continue;}
        if(/rel="canonical"/.test(line)){out.push(`    <link rel="canonical" href="${canonical}">`);continue;}
        if(/property="og:title"/.test(line)){out.push(`    <meta property="og:title" content="${attr(title)}">`);continue;}
        if(/property="og:description"/.test(line)){out.push(`    <meta property="og:description" content="${attr(describe(title))}">`);continue;}
        if(/name="description"/.test(line)){out.push(`    <meta name="description" content="${attr(describe(title))}">`);continue;}
        out.push(line);
        if(/<meta charset=/.test(line))out.push(`    <base href="${base}">`);
    }
    return out.join('\n');
}
function legacyRedirect(legacy,target){
    const shell=GAME_SHELLS[target],base=legacy.includes('/')?'../':'./';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <base href="${base}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${shell.title}</title>
  <link rel="canonical" href="${shell.canonical}">
  <meta name="robots" content="noindex">
  <meta name="description" content="${attr(describe(shell.title))}">
  <meta property="og:title" content="${attr(shell.title)}">
  <meta property="og:description" content="${attr(describe(shell.title))}">
  <script>(function(){var target=new URL("${shell.canonical}",document.querySelector("base").href);target.search=window.location.search;target.hash=window.location.hash;window.location.replace(target.href);})();</script>
</head>
<body>
  <p><a href="${shell.canonical}">${shell.title}</a></p>
</body>
</html>
`;
}
function expectedDocuments(){
    const master=read(MASTER),header=headerBlock(master),footer=footerBlock(master),docs={};
    if(!header||!footer)throw new Error('index.html must contain the shared header and footer');
    for(const [file,meta] of Object.entries(GAME_SHELLS))docs[file]=gameShell(master,meta);
    for(const [legacy,target] of Object.entries(LEGACY_REDIRECTS))docs[legacy]=legacyRedirect(legacy,target);
    for(const file of SHARED_CHROME){
        const source=read(file);
        if(!headerBlock(source)||!footerBlock(source))throw new Error(file+' lost its shared header/footer markers');
        docs[file]=source.replace(headerBlock(source),()=>header).replace(footerBlock(source),()=>footer);
    }
    return docs;
}
function drift(){
    return Object.entries(expectedDocuments()).filter(([file,content])=>!fs.existsSync(path.join(root,file))||read(file)!==content).map(([file])=>file);
}
module.exports={drift,expectedDocuments,GAME_SHELLS,LEGACY_REDIRECTS,SHARED_CHROME};

if(require.main===module){
    if(process.argv.includes('--check')){
        const files=drift();
        for(const file of files)console.error('DRIFT',file);
        console.log(`Shell sync: ${files.length} document(s) differ from index.html.`);
        process.exitCode=files.length?1:0;
    }else{
        const docs=expectedDocuments();let written=0;
        for(const [file,content] of Object.entries(docs)){
            if(fs.existsSync(path.join(root,file))&&read(file)===content)continue;
            fs.writeFileSync(path.join(root,file),content);written++;console.log('wrote',file);
        }
        console.log(`Shell sync: ${written} document(s) updated from index.html.`);
    }
}
