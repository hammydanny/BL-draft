// Local, deterministic UI translation. Game records, IDs, input values and saves
// are never written here. Original text is retained per DOM node for switching.
(function(){
    const messages=window.BLD_MESSAGES||{},templates=window.BLD_MESSAGE_TEMPLATES||[];
    const texts=new WeakMap(),attributes=new WeakMap();
    const ignore='script,style,code,pre,[data-i18n-ignore],.character-profile-quote,.position-badges,.slot-position,.report-position,.captain-badge,.report-captain,[data-app-version],[data-supported-chapter]';
    const nameAreas='.site-header-brand,.home-hero h1,.character-profile-overview h2,.character-lore-card-name,.character-profile-person-link,.character-profile-team-card h4,.player-info-name h2,.player-card-name,.formation-player-token>strong,.team-header h3,.final-team-top h3,.share-team-head h3,.share-versus>span,.turn-indicator>strong,.sold-panel h2,#homeResumeTeam1,#homeResumeTeam2';
    let language=window.SitePreferences?.get().language||'en',proper=new Set(),observer;
    function names(){
        proper=new Set(['Blue Lock','Blue Lock Draft','OVR','GK','SPD','OFF','SHO','DEF','PAS','DRI','TBD']);
        if(typeof players!=='undefined')players.forEach(player=>proper.add(player.name));
        if(typeof PLAYER_ALIASES!=='undefined')Object.values(PLAYER_ALIASES).flat().forEach(alias=>proper.add(alias.name));
        if(typeof CHEMISTRY_CONTEXTS!=='undefined')CHEMISTRY_CONTEXTS.forEach(context=>proper.add(context.name));
    }
    function text(value){
        const source=String(value),key=source.replace(/\s+/g,' ').trim();
        if(language==='en'||!key||proper.has(key))return source;
        const entry=messages[key]||messages[key.toUpperCase()];
        let translated=entry?.[language];
        if(!translated&&/^(?:.*? attributes\. )?(?:Speed|Defence): \d+ out of 100, grade [SABCDEFG]/.test(key)){
            translated=key.replace(/^(.+?) attributes\. /,(_,name)=>name+(language==='ms'?' atribut. ':'の能力。'))
                .replace(/(Speed|Defence|Passing|Dribbling|Shooting|Offence): (\d+) out of 100, grade ([SABCDEFG])/g,(_,label,value,grade)=>text(label.toUpperCase())+(language==='ms'?`: ${value} daripada 100, gred ${grade}`:`：${value}/100、ランク${grade}`))
                .replace(/Goalkeeping is shown separately\./,language==='ms'?'GK ditunjukkan berasingan.':'GKは別に表示します。');
        }
        if(!translated){
            for(const template of templates){const match=key.match(template.pattern);if(match){translated=template[language].replace(/\{(\d+)\}/g,(_,index)=>{const value=match[Number(index)]||'';return ((key.startsWith('AUCTION ')||key.startsWith('SQUAD '))&&Number(index)===2)?text(value.replace(/^ \/\/ /,'')):value;});break;}}
        }
        if(!translated){const relation=key.match(/^(.+) and (.+) chemistry (\d+), (.+)$/);if(relation)translated=language==='ms'?`${relation[1]} dan ${relation[2]} kimia ${relation[3]}, ${text(relation[4])}`:`${relation[1]}と${relation[2]}：相性${relation[3]}、${text(relation[4])}`;}
        if(!translated&&/^[0-9]{2} \/ /.test(key))translated=key.slice(0,5)+text(key.slice(5));
        if(!translated&&key.startsWith('Blue Lock Draft — '))translated='Blue Lock Draft — '+text(key.slice(18));
        if(!translated&&key.endsWith(' — Blue Lock Draft'))translated=text(key.slice(0,-18))+' — Blue Lock Draft';
        if(!translated&&key.includes(' // ')){
            const parts=key.split(' // '),mapped=parts.map(part=>text(part));if(mapped.some((part,index)=>part!==parts[index]))translated=mapped.join(' // ');
        }
        if(!translated)return source;
        return (source.match(/^\s*/)?.[0]||'')+translated+(source.match(/\s*$/)?.[0]||'');
    }
    const titles={
        'TEAM BUILDER':{ms:['PEMBINA ','PASUKAN'],ja:['チーム','ビルダー']},
        'AUCTION SETUP':{ms:['TETAPAN ','LELONGAN'],ja:['オークション','設定']},
        'AUCTION ROOM':{ms:['BILIK ','LELONGAN'],ja:['オークション','ルーム']},
        'AUCTION RESULTS':{ms:['KEPUTUSAN ','LELONGAN'],ja:['オークション','結果']},
        'CHEMISTRY DATABASE':{ms:['PANGKALAN DATA ','KIMIA'],ja:['相性','データベース']},
        'PRIVACY NOTICE':{ms:['NOTIS ','PRIVASI'],ja:['プライバシー','通知']},
        'LEGAL NOTICE':{ms:['NOTIS ','UNDANG-UNDANG'],ja:['法的','注意事項']},
        'CHANGE LOG':{ms:['CATATAN ','PERUBAHAN'],ja:['更新','履歴']}
    };
    function original(node){const record=texts.get(node);return record&&node.nodeValue===record.output?record.source:node.nodeValue;}
    function headingText(node){
        const heading=node.parentElement?.closest('h1');if(!heading||language==='en')return null;
        const walk=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT),nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);
        const key=nodes.map(original).join('').replace(/\s+/g,' ').trim(),entry=titles[key]?.[language];
        return entry?.[nodes.indexOf(node)]??null;
    }
    function translateText(node){
        const parent=node.parentElement;if(!parent||parent.closest(ignore)||parent.closest(nameAreas))return;
        if(parent.closest('.player-nationality'))return; // Country/representation proper names.
        if(parent.matches('option')&&parent.value.startsWith('context-'))return;
        if(parent.matches('.formation-team-tabs button'))return; // Direct custom team-name text only.
        const source=original(node),output=headingText(node)??text(source);
        texts.set(node,{source,output});if(node.nodeValue!==output)node.nodeValue=output;
    }
    function translateAttributes(element){
        if(element.closest(ignore)&&!element.matches('[aria-label]'))return;
        let record=attributes.get(element);if(!record){record={};attributes.set(element,record);}
        for(const name of ['aria-label','aria-description','aria-roledescription','aria-valuetext','title','placeholder','alt']){
            if(!element.hasAttribute(name)||(name==='alt'&&element.matches('[data-player-image],[data-theme-logo]')))continue;
            const current=element.getAttribute(name),last=record[name],source=last&&last.output===current?last.source:current,output=text(source);
            record[name]={source,output};if(output!==current)element.setAttribute(name,output);
        }
        if(element.matches('meta[name="description"],meta[property="og:description"],meta[property="og:title"]')){
            const current=element.content,last=record.content,source=last&&last.output===current?last.source:current,output=text(source);record.content={source,output};if(current!==output)element.content=output;
        }
    }
    function apply(root=document.body){
        if(!root||typeof document.createTreeWalker!=='function')return;
        names();
        if(root.nodeType===3){translateText(root);return;}
        if(root.nodeType!==1)return;
        translateAttributes(root);
        root.querySelectorAll('[aria-label],[aria-description],[aria-roledescription],[aria-valuetext],[title],[placeholder],[alt],meta[name="description"],meta[property="og:description"],meta[property="og:title"]').forEach(translateAttributes);
        const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walk.nextNode())translateText(walk.currentNode);
    }
    window.SiteI18n=Object.freeze({text,apply,get language(){return language;},supported:Object.freeze(['en','ms','ja'])});
    if(typeof document.createTreeWalker!=='function')return;
    names();apply();apply(document.documentElement.querySelector('head'));
    document.documentElement.classList.remove('i18n-loading');
    if(typeof MutationObserver==='function'){
        observer=new MutationObserver(records=>{
            const roots=new Set();for(const record of records){if(record.type==='characterData')roots.add(record.target);else if(record.type==='attributes')roots.add(record.target);else record.addedNodes.forEach(node=>roots.add(node));}
            names();for(const root of roots){if(root.isConnected)apply(root);}
        });
        observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-description','aria-roledescription','aria-valuetext','title','placeholder','alt','content']});
    }
    window.addEventListener('bld:preferences',()=>{
        const next=SitePreferences.get().language||'en';if(next===language)return;
        language=next;document.documentElement.lang=next;apply();apply(document.head);
        window.dispatchEvent(new CustomEvent('bld:language',{detail:{language}}));
    });
    // Native messages keep their original behavior and return values.
    for(const method of ['alert','confirm','prompt'])if(typeof window[method]==='function'){
        const native=window[method].bind(window);window[method]=(message,...rest)=>native(text(message),...rest);
    }
})();
