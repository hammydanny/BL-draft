// Load individual character modules before the shared player registries.
// Keep this as a classic, non-deferred script so the deferred module tags are
// inserted before js/players.js and js/player-reference.js in parser order.
(function () {
  const script = document.currentScript;
  if (!script || typeof document.write !== "function") return;
  const base = new URL("players/", script.src).href;
  const version = "0.7.9.3";
  const folders = ["isagi","ryosuke-kira","noel-noa","meguru-bachira","gurimu-igarashi","rensuke-kunigami","hyoma-chigiri","gin-gagamaru","jingo-raichi","asahi-naruhaya","okuhito-iemon","wataru-kuon","yudai-imamura","sae-itoshi","shoei-baro","ikki-niko","hibiki-okawa","junichi-wanima","keisuke-wanima","reo-mikage","seishiro-nagi","zantetsu-tsurugi","rin-itoshi","jyubei-aryu","aoshi-tokimitsu","ranze-kurona","yo-hiori","tabito-karasu","eita-otoya","kenyu-yukimiya","ryusei-shido","nijiro-nanase","jin-kiyora","leonardo-luna","pablo-cavasoz","adam-blake","dada-silva","julien-loki","gen-fukaku","oliver-aiku","kazuma-nio","miroku-darai","teppei-neru","itsuki-wakatsuki","haru-hayate","kento-cho","teru-kitsunezato","shuto-sendo","michael-kaiser","alexis-ness","benedict-grim","lavinho","chris-prince","agi","marc-snuffy","don-lorenzo","charles-chevalier","rooke","renoir","haneru-shindo","bunny-iglesias","innocent-onazi","godwin-kuso","vivien-hugo","achanpong","lockhart","teddy-knight","childs","shigeo-mizuki","hajime-nishioka","shizuka-haiji","reiji-hiiragi","taiga-tsunzaki","oboabona","bello","bats","leyden","hermes","aiki-himizu","john-paccini","zaruchi"];
  const tags = [];
  for (const folder of folders) {
    tags.push('<script defer src="' + base + folder + '/player.js?v=' + version + '"><' + '/script>');
  }
  for (const folder of folders) {
    tags.push('<script defer src="' + base + folder + '/reference.js?v=' + version + '"><' + '/script>');
  }
  document.write(tags.join("\n"));
})();
