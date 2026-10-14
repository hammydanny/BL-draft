// BLUE LOCK DRAFT // VISUAL FEEDBACK ONLY
function triggerFx(type,text=""){
    const layer=document.getElementById("fxLayer");
    if(!layer)return;
    if(type==="bid"){
        const el=document.getElementById("bidFlash");if(!el)return;
        el.classList.remove("go");void el.offsetWidth;el.classList.add("go");
    }
    if(type==="sold"){
        const el=document.getElementById("soldBurst");if(!el)return;
        el.textContent=text||"SOLD";el.classList.remove("go");void el.offsetWidth;el.classList.add("go");
    }
}
