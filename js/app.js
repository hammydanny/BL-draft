// BLUE LOCK DRAFT // APPLICATION BOOTSTRAP
// Loaded last, after all classic-script modules have initialized.

document.querySelectorAll("[data-app-version]").forEach(el=>{
    el.textContent=APP_VERSION_LABEL+el.textContent;
});

const initialSaved=loadSavedData();
if(initialSaved?.gameActive) showResumeCard(initialSaved);
else restoreSetup(initialSaved);
const initialRoute=getRouteFromLocation();

history.replaceState(
    {
        blDraftRoute:initialRoute
    },
    "",
    window.location.href
);

navigateToRoute(initialRoute,{skipHistory:true});
