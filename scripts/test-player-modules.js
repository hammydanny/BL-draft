// Mirror the parser-ordered per-character loader in dependency-free VM tests.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function playerModuleFiles(root=path.resolve(__dirname,'..')){
    const source=fs.readFileSync(path.join(root,'js/players-loader.js'),'utf8'),folders=JSON.parse(source.match(/const folders = (\[[^;]+\]);/)[1]);
    return ['player','reference'].flatMap(kind=>folders.map(folder=>'js/players/'+folder+'/'+kind+'.js'));
}
function loadPlayerModules(context,root=path.resolve(__dirname,'..')){for(const file of playerModuleFiles(root))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});}
module.exports={loadPlayerModules,playerModuleFiles};
