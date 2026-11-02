// v0.7.3 localized copy for the Ego Board, Draft Duel, Challenge Lab, Ego Record and Daily rules.
// English keys are the source strings. Row order: ms, ja, ar, zh-CN, fr, de, ko, pt, ru, es.
(function(){
const languages=["ms","ja","ar","zh-CN","fr","de","ko","pt","ru","es"];
const rows={
};
const messages=Object.freeze(Object.fromEntries(Object.entries(rows).map(([key,values])=>[key,Object.freeze(Object.fromEntries(languages.map((language,index)=>[language,values[index]])))])));
window.BLD_MESSAGES=Object.freeze({...window.BLD_MESSAGES,...messages});
window.BLD_EGO_MESSAGES=messages;
})();
