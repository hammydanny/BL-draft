// Shared metadata and static-asset cache registration; no game-state writes.
document.querySelectorAll("[data-app-version]").forEach(element=>element.textContent=APP_VERSION_LABEL+element.textContent);
document.querySelectorAll("[data-supported-chapter]").forEach(element=>element.textContent=APP_SUPPORTED_CHAPTER);
if("serviceWorker" in navigator&&window.isSecureContext){
    window.addEventListener("load",()=>{
        const root=new URL("./",document.baseURI);
        navigator.serviceWorker.register(new URL(`service-worker.js?v=${APP_VERSION}`,root),{scope:root.pathname,updateViaCache:"none"}).catch(()=>{});
    },{once:true});
}

// Publication data is independent from release caches and the reviewed canon cutoff.
(async function(){
 const containers=[...document.querySelectorAll("[data-chapter-status]")];if(!containers.length||!window.ChapterTracker)return;
 const key="bldLatestVerifiedChapterV1";let confirmed=null;
 function render(value){containers.forEach(root=>{
  root.replaceChildren();const make=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
  const latest=make("div","");latest.append(make("span","LATEST MANGA CHAPTER"),make("strong",value?.latestVerified?value.label:"Verification pending"));root.append(latest);
  if(value&&!value.latestVerified){const last=make("div","");last.append(make("span","LAST CONFIRMED PUBLICATION"),make("strong",value.label));root.append(last);}
  const coverage=make("div","");coverage.append(make("span","BL-DRAFT CANON COVERAGE"),make("strong",String(APP_SUPPORTED_CHAPTER)));root.append(coverage);
  const source=make("a","OFFICIAL SOURCE ↗");source.href=value?.sourceUrl||ChapterTracker.SOURCE;source.target="_blank";source.rel="noopener noreferrer";root.append(source);
  window.SiteI18n?.apply(root);
 });}
 try{confirmed=ChapterTracker.validate(JSON.parse(localStorage.getItem(key)));}catch(e){}render(confirmed);
 const sources=[new URL("data/latest-chapter.json",document.baseURI)];
 // GITHUB_TOKEN commits do not trigger branch-based Pages builds. Read the same
 // authoritative public main-branch file directly, with the deployed copy as fallback.
 if(window.location.hostname==="hammydanny.github.io")sources.unshift(new URL("https://raw.githubusercontent.com/hammydanny/BL-draft/main/data/latest-chapter.json"));
 for(const source of sources)try{
  const response=await fetch(source,{cache:"no-store",signal:AbortSignal.timeout(8000)});if(!response.ok)continue;
  const candidate=ChapterTracker.validate(await response.json());
  if(!confirmed||ChapterTracker.compare(candidate,confirmed)>=0&&Date.parse(candidate.verifiedAt)>=Date.parse(confirmed.verifiedAt)){
   confirmed=candidate;render(confirmed);try{localStorage.setItem(key,JSON.stringify(confirmed));}catch(e){}
  }
  break;
 }catch(e){/* Try the deployed copy, then retain the last validated browser record. */}
})();
