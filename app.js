const STORAGE_KEY="weatherWarningsData";
function formatDate(v){if(!v)return"—";const d=new Date(v);if(Number.isNaN(d.getTime()))return v;return d.toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"})}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function levelName(v){return ({yellow:"Dzeltens",orange:"Oranžs",red:"Sarkans"})[v]||v}
function validData(d){return d&&Array.isArray(d.warnings)}
function localData(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY));return validData(x)?x:null}catch{return null}}
async function loadWarnings(){
 const local=localData();
 if(local)return local;
 try{
  const r=await fetch("./warnings.json?ts="+Date.now(),{cache:"no-store"});
  if(!r.ok)throw Error();
  const d=await r.json();
  if(!validData(d))throw Error();
  return d;
 }catch(e){console.error("Cannot read warnings.json:",e);return{updated:null,warnings:[]}}
}
function render(data){
 const list=document.getElementById("warningList"),empty=document.getElementById("empty"),now=Date.now();
 const active=(data.warnings||[]).filter(w=>!w.end||Number.isNaN(new Date(w.end).getTime())||new Date(w.end).getTime()>=now);
 const c={red:0,orange:0,yellow:0};active.forEach(w=>{if(c[w.level]!==undefined)c[w.level]++});
 document.getElementById("activeCount").textContent=active.length;
 document.getElementById("redCount").textContent=c.red;
 document.getElementById("orangeCount").textContent=c.orange;
 document.getElementById("yellowCount").textContent=c.yellow;
 document.getElementById("updated").textContent=formatDate(data.updated);
 document.getElementById("year").textContent=new Date().getFullYear();
 list.innerHTML=active.map(w=>`<article class="warning ${esc(w.level)}"><div class="warning-head"><div class="warning-title"><span class="badge">${esc(levelName(w.level))}</span><h2>${esc(w.type)}</h2></div></div><p>${esc(w.message)}</p><div class="meta"><span>📍 <b>${esc(w.area)}</b></span><span>🕐 <b>${formatDate(w.start)} → ${formatDate(w.end)}</b></span></div></article>`).join("");
 empty.classList.toggle("hidden",active.length!==0);
}
loadWarnings().then(render);