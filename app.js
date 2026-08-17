const SUPABASE_URL = "https://whmtnbyqathjvbxqoajd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cMFioKF3OCWUysE03hYNkg_1lNY_rG9";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const SUPABASE_URL = "https://whmtnbyqathjvbxqoajd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cMFioKF3OCWUysE03hYNkg_1lNY_rG9";
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ===============================
// PUSH NOTIFICATIONS
// ===============================

async function enablePushNotifications() {
  if (!("serviceWorker" in navigator)) {
    console.log("Service workers are not supported.");
    return;
  }

  if (!("PushManager" in window)) {
    console.log("Push notifications are not supported.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");

    console.log("Service worker registered.");

    // IMPORTANT:
    // We will put your VAPID public key here later.
    const vapidPublicKey = "sb_publishable_cMFioKF3OCWUysE03hYNkg_1lNY_rG9";

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    const subscriptionJSON = subscription.toJSON();

    const { error } = await supabaseClient
      .from("push_subscriptions")
      .upsert({
        endpoint: subscriptionJSON.endpoint,
        subscription: subscriptionJSON
      }, {
        onConflict: "endpoint"
      });

    if (error) {
      console.error("Could not save push subscription:", error);
      return;
    }

    console.log("✅ Push notifications enabled!");
  } catch (error) {
    console.error("Push notification error:", error);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(char => char.charCodeAt(0))
  );
}

function formatDate(v){
  if(!v) return "—";
  const d=new Date(v);
  if(Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("lv-LV",{dateStyle:"medium",timeStyle:"short"});
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function levelName(v){return ({yellow:"Dzeltens",orange:"Oranžs",red:"Sarkans"})[v]||v}

async function loadWarnings(){
  const {data:rows,error}=await supabaseClient
    .from("warnings")
    .select("id, level, type, area, start, end, message, created_at")
    .order("start",{ascending:true});
  if(error){
    console.error("Supabase warnings error:",error);
    return {updated:null,warnings:[]};
  }
  return {updated:new Date().toISOString(),warnings:rows||[]};
}

function render(data){
  const list=document.getElementById("warningList"),empty=document.getElementById("empty"),now=Date.now();
  const active=(data.warnings||[]).filter(w=>!w.end||Number.isNaN(new Date(w.end).getTime())||new Date(w.end).getTime()>=now);
  const c={red:0,orange:0,yellow:0};
  active.forEach(w=>{if(c[w.level]!==undefined)c[w.level]++});
  document.getElementById("activeCount").textContent=active.length;
  document.getElementById("redCount").textContent=c.red;
  document.getElementById("orangeCount").textContent=c.orange;
  document.getElementById("yellowCount").textContent=c.yellow;
  document.getElementById("updated").textContent=formatDate(data.updated);
  document.getElementById("year").textContent=new Date().getFullYear();
  list.innerHTML=active.map(w=>`<article class="warning ${esc(w.level)}"><div class="warning-head"><div class="warning-title"><span class="badge">${esc(levelName(w.level))}</span><h2>${esc(w.type)}</h2></div></div><p>${esc(w.message)}</p><div class="meta"><span>📍 <b>${esc(w.area)}</b></span><span>🕐 <b>${formatDate(w.start)} → ${formatDate(w.end)}</b></span></div></article>`).join("");
  empty.classList.toggle("hidden",active.length!==0);
}

async function refresh(){render(await loadWarnings());}
refresh();
setInterval(refresh,15000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh()});
