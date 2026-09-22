(function(){
"use strict";
const p=new URLSearchParams(location.search),req=p.get("hubLang")||p.get("lang"),lang=req==="en"?"en":"es";
document.documentElement.lang=lang;
const exact=new Map(window.CG_ES||[]);
const partial=[
["Back to Sustainability Hub","Volver al Sustainability Hub"],["How to Play","Cómo jugar"],["Knowledge Base","Base de conocimiento"],
["Stage ","Etapa "],["Learning checkpoint ","Punto de aprendizaje "],["Mission Readiness","Disponibilidad de misión"],
["Audit risk","Riesgo de auditoría"],["EMS Control","Control del SGA"],["Containment","Contención"],["Readiness","Disponibilidad"],
["Score","Puntuación"],["Speak","Hablar"],["Continue","Continuar"],["Evaluate","Evaluar"],["Back","Volver"],
["Release package accepted","Paquete de liberación aceptado"],["Release package incomplete","Paquete de liberación incompleto"]
];
function tr(v){
  if(lang!=="es"||!v)return v;
  const t=v.trim();
  if(exact.has(t))return v.replace(t,exact.get(t));
  let o=v;
  for(const [a,b] of partial)o=o.split(a).join(b);
  return o;
}
function walk(root){
  if(lang!=="es"||!root)return;
  if(root.nodeType===3){
    const x=tr(root.nodeValue); if(x!==root.nodeValue)root.nodeValue=x; return;
  }
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),ns=[];
  while(w.nextNode())ns.push(w.currentNode);
  for(const n of ns){
    if(!n.parentElement||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(n.parentElement.tagName))continue;
    const x=tr(n.nodeValue);if(x!==n.nodeValue)n.nodeValue=x;
  }
  root.querySelectorAll?.("[title],[aria-label],[alt],[placeholder],[data-guide]").forEach(el=>{
    for(const a of ["title","aria-label","alt","placeholder","data-guide"]){
      if(el.hasAttribute(a))el.setAttribute(a,tr(el.getAttribute(a)));
    }
  });
}
function control(){
  if(document.getElementById("sn-language-control"))return;
  const b=document.createElement("div");
  b.id="sn-language-control";
  b.setAttribute("role","group");
  b.setAttribute("aria-label",lang==="es"?"Idioma":"Language");
  b.innerHTML='<button data-l="es">ES</button><span>|</span><button data-l="en">EN</button>';
  b.style.cssText="position:fixed;z-index:2147483647;top:12px;right:12px;display:flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;background:#071b33;color:#fff;border:2px solid rgba(255,255,255,.75);font:800 12px/1 system-ui,sans-serif;box-shadow:0 5px 18px rgba(0,0,0,.3)";
  b.querySelectorAll("button").forEach(x=>{
    x.type="button";
    x.style.cssText="border:0;background:transparent;color:#fff;font:inherit;cursor:pointer;padding:2px 4px";
    x.setAttribute("aria-pressed",x.dataset.l===lang?"true":"false");
    if(x.dataset.l===lang)x.style.textDecoration="underline";
    x.onclick=()=>{const u=new URL(location.href);u.searchParams.set("hubLang",x.dataset.l);location.href=u.toString();};
  });
  document.body.appendChild(b);
}
function init(){
  if(lang==="es"){document.title=tr(document.title);walk(document.body);}
  control();

  const hub=document.getElementById("sn-hub-return");
  if(hub){
    hub.href=lang==="es"
      ?"https://aug79-droid.github.io/sustainability-navigator/?lang=es#applications"
      :"https://aug79-droid.github.io/sustainability-navigator/?lang=en#applications";
    hub.textContent=lang==="es"?"← Volver al Sustainability Hub":"← Back to Sustainability Hub";
    hub.setAttribute("aria-label",lang==="es"?"Volver al Sustainability Hub":"Back to Sustainability Hub");
  }

  if(lang==="es"){
    const target=document.querySelector(".shell")||document.body;
    let queued=false; const pending=new Set();
    const flush=()=>{queued=false;const nodes=[...pending];pending.clear();nodes.forEach(walk);};
    const obs=new MutationObserver(ms=>{
      for(const m of ms){
        if(m.type==="characterData"&&m.target)pending.add(m.target);
        for(const n of m.addedNodes)pending.add(n);
      }
      if(!queued){queued=true;queueMicrotask(flush);}
    });
    obs.observe(target,{subtree:true,childList:true,characterData:true});

    // Override Mara speech in Spanish using the text that is actually visible after translation.
    document.addEventListener("click",ev=>{
      const btn=ev.target.closest?.("#speakBtn");
      if(!btn)return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(!("speechSynthesis" in window))return;
      window.speechSynthesis.cancel();
      const msg=document.getElementById("avatarMsg")?.textContent||"";
      const u=new SpeechSynthesisUtterance(msg);
      u.lang="es-ES";u.rate=.95;
      const avatar=document.getElementById("avatarSvg");
      u.onstart=()=>avatar?.classList.add("speaking");
      u.onend=()=>avatar?.classList.remove("speaking");
      u.onerror=()=>avatar?.classList.remove("speaking");
      speechSynthesis.speak(u);
    },true);
  }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();