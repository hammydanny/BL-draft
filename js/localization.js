// Local, deterministic UI translation. Game records, IDs, input values and saves
// are never written here. Original text is retained per DOM node for switching.
(function(){
    const messages=window.BLD_MESSAGES||{},templates=window.BLD_MESSAGE_TEMPLATES||[];
    const texts=new WeakMap(),attributes=new WeakMap();
    const folded=new Map(Object.entries(messages).map(([key,value])=>[key.toLocaleLowerCase('en'),value]));
    const ignore='script,style,code,pre,[data-i18n-ignore],.character-profile-quote,.position-badges,.slot-position,.report-position,.captain-badge,.report-captain,.player-stats-axis,.character-profile-stat>span,[name="siteLanguage"] option,[data-app-version],[data-supported-chapter]';
    const nameAreas='.site-header-brand,.home-hero h1,.share-card-top h2,.character-profile-overview h2,.character-lore-card-name,.character-profile-person-link,.character-profile-team-card h4,.player-info-name h2,.player-card-name,.formation-player-token>strong,.team-header h3,.final-team-top h3,.share-team-head h3,.share-versus>span,.turn-indicator>strong,.sold-panel h2,#homeResumeTeam1,#homeResumeTeam2';
    let language=window.SitePreferences?.get().language||'en',proper=new Set(),observer;
    function names(){
        proper=new Set(['Blue Lock','Blue Lock Draft','OVR','GK','SPD','SHO','DEF','PAS','DRI','TBD']);
        if(typeof players!=='undefined')players.forEach(player=>proper.add(player.name));
        if(typeof PLAYER_ALIASES!=='undefined')Object.values(PLAYER_ALIASES).flat().forEach(alias=>proper.add(alias.name));
        if(typeof CHEMISTRY_CONTEXTS!=='undefined')CHEMISTRY_CONTEXTS.forEach(context=>proper.add(context.name));
    }
    function text(value){
        const source=String(value),key=source.replace(/\s+/g,' ').trim();
        if(language==='en'||!key||proper.has(key))return source;
        if(key.startsWith('FORMATION // '))return source.replace('FORMATION // ',text('FORMATION')+' // ');
        const entry=messages[key]||messages[key.toUpperCase()]||folded.get(key.toLocaleLowerCase('en'));
        let translated=entry?.[language];
        const isolate=value=>language==='ar'?'\u2068'+value+'\u2069':value;
        if(!translated&&/^(?:.*? attributes\. )?(?:Speed|Defence): \d+ out of 100, grade [SABCDEFG]/.test(key)){
            translated=key.replace(/^(.+?) attributes\. /,(_,name)=>text('{name} attributes.').replace('{name}',isolate(name)))
                .replace(/(Speed|Defence|Passing|Dribbling|Shooting|Offence): (\d+) out of 100, grade ([SABCDEFG])/g,(_,label,value,grade)=>text('{stat}: {value} out of 100, grade {grade}').replace('{stat}',text(label.toUpperCase())).replace('{value}',isolate(value)).replace('{grade}',isolate(grade)))
                .replace(/Goalkeeping is shown separately\./,text('Goalkeeping is shown separately.'));
        }
        if(!translated){
            for(const template of templates){const match=key.match(template.pattern);if(match&&template[language]){translated=template[language].replace(/\{(\d+)\}/g,(_,index)=>{let value=match[Number(index)]||'';if((key.startsWith('AUCTION ')||key.startsWith('SQUAD '))&&Number(index)===2)value=value.replace(/^( \/\/ )?(.*)$/,(_,separator,part)=>(separator||'')+text(part));return isolate(value);});break;}}
        }
        if(!translated){const relation=key.match(/^(.+) and (.+) chemistry (\d+), (.+)$/);if(relation)translated=text('{a} and {b} chemistry {value}, {tier}').replace('{a}',isolate(relation[1])).replace('{b}',isolate(relation[2])).replace('{value}',isolate(relation[3])).replace('{tier}',text(relation[4]));}
        if(!translated){const metric=key.match(/^(Goalkeeper specialist|Goalkeeping): (\d+) out of 100, grade ([SABCDEFG])$/);if(metric)translated=text('{stat}: {value} out of 100, grade {grade}').replace('{stat}',text(metric[1].toUpperCase())).replace('{value}',isolate(metric[2])).replace('{grade}',isolate(metric[3]));}
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
        if(entry)return entry[nodes.indexOf(node)]??null;
        if(messages[key]?.[language])return nodes.indexOf(node)===0?text(key):'';
        return null;
    }
    function translateText(node){
        const parent=node.parentElement;if(!parent||parent.closest(ignore)||parent.closest(nameAreas))return;
        if(parent.closest('.player-nationality'))return; // Country/representation proper names.
        if(parent.matches('option')&&parent.value.startsWith('context-'))return;
        if(parent.matches('.formation-team-tabs button'))return; // Direct custom team-name text only.
        const source=original(node),output=headingText(node)??text(source);
        // Mark text owners without moving DOM nodes or reversing the page grids.
        // Known source text stays marked when switching back to English.
        if(output!==source||parent.hasAttribute('data-i18n-text'))parent.setAttribute('data-i18n-text','');
        texts.set(node,{source,output});if(node.nodeValue!==output)node.nodeValue=output;
    }
    function translateAttributes(element){
        if(element.closest(ignore)&&!element.matches('[aria-label]'))return;
        if(element.matches('input:not([type]),input[type=text],input[type=search],textarea')&&!element.hasAttribute('dir'))element.setAttribute('dir','auto');
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
    window.SiteI18n=Object.freeze({text,apply,get language(){return language;},supported:Object.freeze(window.SitePreferences.locales.map(locale=>locale.code))});
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
