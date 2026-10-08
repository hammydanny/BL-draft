// BLUE LOCK DRAFT // AUDIO / SFX
// Split from the former root script.js. Classic scripts share the same global scope.

let soundEnabled=localStorage.getItem("blAuctionSound")!=="off";
let audioCtx=null;

function ensureAudio(){
    if(!soundEnabled)return null;
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)return null;
    if(!audioCtx) audioCtx=new AudioContextClass();
    if(audioCtx.state==="suspended")audioCtx.resume();
    return audioCtx;
}
function tone(freq=440,duration=.08,type="sine",volume=.035,delay=0){
    const ctx=ensureAudio();if(!ctx)return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    const t=ctx.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+duration);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+duration+.02);
}
function playSfx(name){
    if(!soundEnabled)return;
    if(name==="reveal"){tone(180,.08,"sawtooth",.025);tone(360,.11,"square",.018,.07);}
    else if(name==="bid"){tone(520,.055,"square",.025);tone(700,.06,"square",.018,.045);}
    else if(name==="pass"){tone(230,.09,"sine",.025);tone(160,.12,"sine",.018,.06);}
    else if(name==="error"){tone(145,.11,"sawtooth",.025);tone(115,.15,"square",.018,.08);}
    else if(name==="sold"){tone(220,.08,"sawtooth",.025);tone(440,.1,"square",.025,.07);tone(880,.18,"sine",.03,.15);}
    else if(name==="nav"){tone(310,.04,"triangle",.014);tone(465,.055,"sine",.011,.03);}
    else if(name==="select"){tone(430,.035,"triangle",.013);tone(620,.045,"sine",.010,.025);}
    else if(name==="drop"){tone(500,.04,"sine",.014);tone(760,.065,"triangle",.012,.035);}
    else if(name==="confirm"){tone(420,.04,"triangle",.012);tone(630,.055,"sine",.012,.035);tone(840,.07,"sine",.009,.07);}
    else if(name==="back"){tone(320,.045,"sine",.011);tone(210,.07,"sine",.009,.035);}
    else if(name==="toggle"){tone(360,.035,"square",.008);tone(540,.04,"square",.008,.025);}
    else if(name==="result"){tone(330,.06,"triangle",.012);tone(495,.075,"triangle",.012,.05);tone(660,.10,"sine",.014,.10);}
    else if(name==="outbid"){tone(690,.04,"square",.014);tone(520,.05,"triangle",.012,.035);tone(820,.07,"sine",.011,.07);}
    else if(name==="swap"){tone(430,.04,"triangle",.012);tone(640,.05,"triangle",.012,.035);tone(430,.06,"sine",.010,.075);}
    else if(name==="warning"){tone(180,.07,"square",.012);tone(140,.10,"sine",.010,.055);}
}
function updateSoundButton(){
    document.querySelectorAll("#soundToggle,[data-sound-toggle]").forEach(b=>{
        b.classList.toggle("muted",!soundEnabled);
        b.setAttribute("aria-pressed",String(soundEnabled));
        b.setAttribute("aria-label",soundEnabled?"Mute sound effects":"Enable sound effects");
        const label=b.querySelector("strong");if(label)label.textContent=soundEnabled?"SFX":"MUTED";
        const icon=b.querySelector(".sound-icon");if(icon)icon.textContent=soundEnabled?"◖))":"◖×";
    });
}
function toggleSound(){
    soundEnabled=!soundEnabled;localStorage.setItem("blAuctionSound",soundEnabled?"on":"off");updateSoundButton();
    if(soundEnabled)playSfx("bid");
}
document.getElementById("soundToggle").addEventListener("click",toggleSound);
document.querySelectorAll("[data-sound-toggle]").forEach(b=>b.addEventListener("click",toggleSound));
updateSoundButton();


let audioUnlocked=false;
function unlockAudio(){
    if(!soundEnabled)return;
    const ctx=ensureAudio();
    if(ctx){audioUnlocked=true;if(ctx.state==="suspended")ctx.resume();}
}
document.addEventListener("pointerdown",unlockAudio,{capture:true});
document.addEventListener("keydown",unlockAudio,{capture:true});

document.addEventListener("click",e=>{
    const b=e.target.closest("button");
    if(!b || b.id==="soundToggle" || b.hasAttribute("data-sound-toggle"))return;
    if(b.id==="placeBidButton"||b.id==="placeOpeningBid"||b.id==="passButton"||b.id==="buyPlayerButton"||b.id==="controlPassButton")return;
    const text=(b.textContent||"").toLowerCase();
    if(text.includes("back")||text.includes("main menu"))playSfx("back");
    else if(text.includes("start")||text.includes("confirm")||text.includes("enter")||text.includes("finish"))playSfx("confirm");
    else if(b.closest("#formation-screen"))playSfx("select");
    else playSfx("nav");
});
document.addEventListener("change",e=>{
    if(e.target.matches("input,select"))playSfx("toggle");
});
