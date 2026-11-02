// Fantasyvärlden – själva spelet: hemmet, uppdragstavlan, resan, rummen, striderna och sparningen.
(function(){
"use strict";
const R = window.REGLER, V = window.VARLD, G = window.GRAFIK;
const HJ = Object.fromEntries(window.HJALTAR.map(h=>[h.id,h]));
const $ = s => document.querySelector(s);
const app = $("#app");
const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const vanta = ms => new Promise(r=>setTimeout(r,ms));
const datum = (d=new Date()) => d.toLocaleString("sv-SE",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
const load = (k,d) => { try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d }catch(e){ return d } };
const save = (k,v) => { try{ localStorage.setItem(k,JSON.stringify(v)) }catch(e){} };

// ================= Sparat spel =================
const KEY = "fantasyvarlden-spel";
function nyttSpel(){ return {version:1,tid:0,kassa:50,packning:["Läkedryck","Läkande ört"],sallskap:[],hj:{},tavla:[],avklarade:{},kronika:[],run:null,reset:0,rekord:{}} }
function normSpel(o){
  const n = nyttSpel(); if(!o||typeof o!=="object") return n;
  const s = Object.assign(n, o);
  s.packning = Array.isArray(s.packning)?s.packning.filter(x=>typeof x==="string"):[];
  s.sallskap = Array.isArray(s.sallskap)?s.sallskap.filter(id=>HJ[id]).slice(0,4):[];
  s.hj = s.hj&&typeof s.hj==="object"?s.hj:{};
  s.tavla = Array.isArray(s.tavla)?s.tavla.filter(id=>V.UPPDRAG.some(u=>u.id===id)):[];
  s.kronika = Array.isArray(s.kronika)?s.kronika.slice(0,40):[];
  s.kassa = Number(s.kassa)||0;
  s.rekord = s.rekord&&typeof s.rekord==="object"?s.rekord:{};
  return s;
}
let st = normSpel(load(KEY,null));
const hs = id => (st.hj[id] = st.hj[id] || {dod:false,bonus:{},aventyr:0,segrar:0,vapen:[],rustning:null});
function spara(){ st.tid = Date.now(); save(KEY,st); planeraSynk(); }

// ================= Hjältar =================
// Bygger en hjälte av grunddata + det som hänt i spelet (förbättrade färdigheter, köpt utrustning).
function bygg(id){
  const b = HJ[id], s = hs(id);
  const h = JSON.parse(JSON.stringify(b));
  h.varden = h.varden || {};
  Object.entries(s.bonus||{}).forEach(([f,n])=>{ h.varden[f] = Math.min(18, R.fardVarde(b,f) + n); });
  if(s.rustning) h.rustning = s.rustning;
  if(s.vapen && s.vapen.length) h.vapen = [...s.vapen.filter(v=>!h.vapen.includes(v)), ...h.vapen];
  return h;
}
const fv = (h,f) => (R.FARD[f] ? R.fardVarde(h,f) : (h.e[f]||10)); // färdighet eller egenskap (STY, FYS…)
const ar = id => !!(st.hj[id] && st.hj[id].dod);

// ================= Synk till GitHub (sparfil.json i repot) =================
const GKEY = "fantasyvarlden-github";
let gh = Object.assign({repo:"",branch:"main",path:"sparfil.json",token:"",auto:true}, load(GKEY,{}));
let ghSha = null, synkTimer = null;
function setSync(txt, cls=""){ const s=$("#sync"); if(s){ s.className="sync "+cls; s.lastChild.textContent=txt; } }
const ghUrl = () => "https://api.github.com/repos/"+gh.repo.trim()+"/contents/"+gh.path.trim().split("/").map(encodeURIComponent).join("/");
const ghHead = () => { const h={"Accept":"application/vnd.github+json"}; if(gh.token) h.Authorization="Bearer "+gh.token.trim(); return h; };
const ghFel = st => ({401:"GitHub godkänner inte token. Kontrollera att hela token är inklistrad och inte har gått ut.",403:"Token saknar behörighet. Den behöver Contents: Read and write för repot.",404:"Hittar inte repot. Kontrollera stavningen (ägare/repo) och att token har tillgång till det.",409:"Filen ändrades samtidigt från en annan enhet. Försök igen.",422:"GitHub tog inte emot filen. Försök igen."})[st] || ("GitHub svarade med fel "+st+".");
const b64e = s => { const b=new TextEncoder().encode(s); let r=""; for(let i=0;i<b.length;i+=0x8000) r+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000)); return btoa(r); };
const b64d = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,"")),c=>c.charCodeAt(0)));
async function ghGet(){
  const r = await fetch(ghUrl()+"?ref="+encodeURIComponent(gh.branch.trim()),{headers:ghHead(),cache:"no-store"});
  if(r.status===404) return null; if(!r.ok) throw new Error(ghFel(r.status));
  const j = await r.json(); return {sha:j.sha, data:JSON.parse(b64d(j.content))};
}
async function ghPut(){
  if(!gh.token.trim() || !gh.repo.trim()) throw new Error("Fyll i repo och token i inställningarna först.");
  const cur = await ghGet();
  if(cur && cur.data && (cur.data.spel||{}).tid > st.tid){ st = normSpel(cur.data.spel); save(KEY,st); ritaOm(); }
  const body = {message:"Fantasyvärlden: spara spelet",content:b64e(JSON.stringify({app:"Fantasyvärlden",version:1,uppdaterad:new Date().toISOString(),spel:st},null,2)+"\n"),branch:gh.branch.trim()};
  if(cur) body.sha = cur.sha;
  const r = await fetch(ghUrl(),{method:"PUT",headers:{...ghHead(),"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!r.ok) throw new Error(ghFel(r.status));
  ghSha = (await r.json()).content.sha;
}
function planeraSynk(){
  if(!gh.auto || !gh.token.trim() || !gh.repo.trim()) return;
  clearTimeout(synkTimer); setSync("Sparar snart till GitHub…");
  synkTimer = setTimeout(async()=>{ try{ await ghPut(); setSync("Sparat till GitHub "+datum().slice(11),"ok"); }catch(e){ setSync(e.message,"fel"); } }, 2500);
}
async function ghLadda(ersatt){
  if(!gh.token.trim() || !gh.repo.trim()) return;
  setSync("Hämtar från GitHub…");
  try{
    const r = await ghGet();
    if(!r){ setSync("Ingen sparfil på GitHub än – den skapas när du spelar.","ok"); planeraSynk(); return; }
    ghSha = r.sha; const fj = normSpel(r.data.spel);
    if(ersatt || fj.tid > st.tid){ st = fj; save(KEY,st); if(!strid) ritaOm(); }
    else if(st.tid > fj.tid) planeraSynk();
    setSync("Synkad med GitHub "+datum().slice(11),"ok");
  }catch(e){ setSync(e.message,"fel"); }
}

// ================= Navigering =================
let vy = "hem";
let strid = null;          // pågående strid (sparas inte – laddar man om börjar striden om)
let aktivtVal = null;      // väntande val i ett rum (t.ex. "vem slår?")
function ritaOm(){
  if(vy==="tavla") return ritaTavla();
  if(vy==="run" && st.run) return ritaRun();
  if(vy==="basar") return ritaBasar();
  if(vy==="platser") return ritaPlatser();
  vy="hem"; ritaHem();
}
function ga(v){ vy=v; ritaOm(); window.scrollTo({top:0,behavior:"instant"}); }

// ================= Små ritfunktioner =================
function portratt(id, cls="portr"){
  const c = document.createElement("canvas"); c.className = "px "+cls; G.ritaPortratt(c, HJ[id], ar(id), figur(id)); return c;
}
// Vilken av hjältens figurvarianter som används (sparas per hjälte).
function figur(id){ const r=G.figurRutor(id), v=st.hj[id]&&st.hj[id].figur; return r.includes(v)?v:(r[0]??null); }
// Hjältarna som de ska stå i TV:n
function scenHjaltar(aktiv){ return st.run ? st.run.party.map(id=>{ const x=rh(id); return {id, ruta:figur(id), nere:x.dod||x.doende||x.stabil||x.kp<=0, aktiv:aktiv===id}; }).filter(h=>!rh(h.id).dod) : []; }
function fyllPortratt(root){
  root.querySelectorAll("canvas[data-p]").forEach(c=>{ G.ritaPortratt(c, HJ[c.dataset.p], c.dataset.dod==="1", c.dataset.ruta!=null?Number(c.dataset.ruta):figur(c.dataset.p)); });
}
function modal(html, onOpen){
  const m=$("#modal"), i=$("#modal-inner"); i.innerHTML=html; m.hidden=false;
  fyllPortratt(i); if(onOpen) onOpen(i);
}
function stangModal(){ $("#modal").hidden=true; $("#modal-inner").innerHTML=""; }
$("#modal").addEventListener("click",e=>{ if(e.target.id==="modal") stangModal(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape" && !$("#modal").hidden && !$("#modal").dataset.las) stangModal(); });

// ================= HEMMET =================
function ritaHem(){
  const levande = window.HJALTAR.filter(h=>!ar(h.id)), doda = window.HJALTAR.filter(h=>ar(h.id));
  const party = st.sallskap.filter(id=>!ar(id));
  let html = "";
  if(st.run){
    html += `<section class="card quest"><h2>Pågående äventyr</h2><p><b>${esc(st.run.q.titel)}</b> – ${esc(st.run.q.plats)}</p>
      <div class="row"><button class="btn" data-a="fortsatt">Fortsätt äventyret</button><button class="btn ghost small" data-a="ge-upp">Ge upp</button></div></section>`;
  }
  html += `<section class="card"><div class="row" style="justify-content:space-between"><h2>Sällskapet</h2><span class="kassa">💰 ${st.kassa} guld</span></div>
    <div class="slots">${[0,1,2,3].map(i=>{ const id=party[i]; return id?`<button class="slot fylld" data-a="visa" data-id="${id}"><canvas class="px" data-p="${id}"></canvas><span class="lbl">${esc(HJ[id].namn)}</span></button>`:`<div class="slot">Tom plats</div>`}).join("")}</div>
    <p class="small muted">Välj 1–4 hjältar i galleriet nedan. ${party.length?"":"Tips: fyra hjältar klarar mer, men en ensam hjälte får all ära."}</p>
    <div class="row">
      <button class="btn" data-a="tavla" ${!party.length||st.run?"disabled":""}>Till uppdragstavlan<span class="sub">Lansors förmedling</span></button>
      <button class="btn" data-a="platser" ${!party.length||st.run?"disabled":""}>Utforska en plats<span class="sub">Ingen berättelse – se hur djupt ni kommer</span></button>
      <button class="btn ghost" data-a="basar">Basaren<span class="sub">Köp drycker och utrustning</span></button>
    </div>
    <p class="small muted">Packning: ${st.packning.length?esc(sammanfatta(st.packning)):"tom"}</p>
  </section>`;
  html += `<section class="card"><h2>Hjältegalleriet</h2><p class="small muted">Tryck på en hjälte för att se hjältebladet och lägga till eller ta bort ur sällskapet.</p>
    <div class="grid">${levande.map(h=>hkort(h)).join("")}</div></section>`;
  if(doda.length){
    html += `<section class="card"><h2>Efterriket</h2><p class="small muted">Döda hjältar ligger i poolen på ett skyskrapetak i Miami tillsammans med den stora björnen Tetrok – tills någon köper tillbaka dem till livet. Tryck på en hjälte för att köpa tillbaka hen.</p>
      <div class="tv"><canvas id="pool" class="px"></canvas><span class="badge">Miami</span></div>
      <div class="grid">${doda.map(h=>hkort(h,true)).join("")}</div></section>`;
  }
  if(st.kronika.length){
    html += `<section class="card"><h2>Krönikan</h2><div class="col small">${st.kronika.slice(0,12).map(k=>`<div><span class="muted">${esc(k.tid)}</span> – ${esc(k.text)}</div>`).join("")}</div></section>`;
  }
  app.innerHTML = html; fyllPortratt(app);
  if(doda.length) G.ritaPool($("#pool"), doda.map(h=>({id:h.id, ruta:figur(h.id)})));
  app.onclick = e => {
    const b = e.target.closest("[data-a]"); if(!b) return;
    const a = b.dataset.a, id = b.dataset.id;
    if(a==="visa") visaHjalte(id);
    if(a==="tavla"){ jensLedig = null; ga("tavla"); }
    if(a==="basar") ga("basar");
    if(a==="platser") ga("platser");
    if(a==="fortsatt") ga("run");
    if(a==="ge-upp") geUpp();
  };
}
function hkort(h, dod){
  const s = st.hj[h.id]||{}, vald = st.sallskap.includes(h.id);
  return `<button class="hcard ${vald?"vald":""} ${dod?"dod":""}" data-a="visa" data-id="${h.id}">
    <canvas class="px portr" data-p="${h.id}" ${dod?'data-dod="1"':""}></canvas>
    <span><span class="namn">${esc(h.namn)}</span><br><span class="info">${esc(h.folk)} · ${esc(h.yrke)}</span>
    ${s.segrar?`<br><span class="tag gold">${s.segrar} ${s.segrar===1?"seger":"segrar"}</span>`:""}${vald?` <span class="tag gold">I sällskapet</span>`:""}</span></button>`;
}
function sammanfatta(arr){ const c={}; arr.forEach(x=>c[x]=(c[x]||0)+1); return Object.entries(c).map(([k,n])=>n>1?`${k} ×${n}`:k).join(", "); }

function visaHjalte(id){
  const h = bygg(id), s = hs(id), dod = ar(id), vald = st.sallskap.includes(id);
  const fard = R.allaFard(h).filter(f=>f.tranad || R.VAPENFARD.includes(f.namn)===false).sort((a,b)=>b.varde-a.varde);
  const vapenfard = R.allaFard(h).filter(f=>R.VAPENFARD.includes(f.namn) && f.tranad);
  const sb = R.skadebonus(h,false), sba = R.skadebonus(h,true);
  modal(`<div class="row" style="gap:14px;align-items:flex-start">
      <canvas class="px" data-p="${id}" ${dod?'data-dod="1"':""} style="width:96px;height:96px;border-radius:4px;border:2px solid var(--line)"></canvas>
      <div class="col" style="gap:4px;flex:1;min-width:180px"><h2>${esc(h.namn)}</h2>
        ${h.alias?`<span class="small muted">Även känd som: ${esc(h.alias)}</span>`:""}
        <span>${esc(h.folk)} · ${esc(h.yrke)} · ${esc(h.kon)} · ${esc(h.alder)} år</span>
        ${h.citat?`<span class="citat">”${esc(h.citat)}”</span>`:""}
        ${dod?`<span class="tag red">Död – ligger i poolen i Miami med Tetrok</span>`:""}</div></div>
    <p>${esc(h.om)}</p>
    <div class="eg">${R.EGENSKAPER.map(([k,n])=>`<div><b>${h.e[k]}</b><span>${k}</span></div>`).join("")}</div>
    <div class="split">
      <div class="card" style="padding:10px;gap:4px"><b>Kroppspoäng (KP)</b><span class="kassa">${R.maxKP(h)}</span></div>
      <div class="card" style="padding:10px;gap:4px"><b>Viljepoäng (VP)</b><span class="kassa" style="color:var(--vp)">${R.maxVP(h)}</span></div>
    </div>
    <div><h3>Vapen</h3><table class="stat">${h.vapen.map(v=>{const w=R.VAPEN[v]||{};return `<tr><td>${esc(v)} <span class="muted small">(${esc(w.fard)}, ${esc(w.skada)}${w.bonus?"+"+w.bonus:""}${w.avstand?", avstånd":""})</span></td><td>${R.fardVarde(h,w.fard)}</td></tr>`}).join("")}
      <tr><td>Skadebonus närstrid / avstånd</td><td>${sb||"–"} / ${sba||"–"}</td></tr>
      <tr><td>Rustning: ${esc(h.rustning||"ingen")}${h.skold?" + sköld":""}</td><td>${R.rustning(h)}</td></tr></table></div>
    <div><h3>Färdigheter</h3><table class="stat">${R.allaFard(h).filter(f=>f.tranad).sort((a,b)=>b.varde-a.varde).map(f=>`<tr><td>${esc(f.namn)} <span class="muted small">(${f.eg})${s.bonus&&s.bonus[f.namn]?" · förbättrad +"+s.bonus[f.namn]:""}</span></td><td>${f.varde}</td></tr>`).join("")}
      <tr><td colspan="2" class="small muted" style="text-align:left">Övriga färdigheter har grundchansen (3–7 beroende på egenskapen).</td></tr></table></div>
    ${h.besv.length?`<div><h3>Besvärjelser <span class="small muted">(2 VP, slå Magi ${R.fardVarde(h,"Magi")})</span></h3><div class="col small">${h.besv.map(b=>`<div><b>${esc(b)}</b> – ${esc((R.BESV[b]||{}).text)}</div>`).join("")}</div></div>`:""}
    <div><h3>Signaturförmåga <span class="small muted">(3 VP)</span></h3><p><b>${esc(h.formaga.namn)}</b> – ${esc(h.formaga.text)}</p></div>
    ${h.saker.length?`<p class="small"><b>Utrustning:</b> ${esc(h.saker.join(", "))}</p>`:""}
    <p class="small muted">Äventyr: ${s.aventyr||0} · Segrar: ${s.segrar||0}</p>
    <div class="row">
      ${dod?`<button class="btn red" data-a="kopTillbaka" ${st.kassa<100?"disabled":""}>Köp tillbaka till livet<span class="sub">Kostar 100 guld ur kassan${st.kassa<100?` – ni har ${st.kassa}`:""}</span></button>`
        : vald?`<button class="btn ghost" data-a="ta-bort" ${st.run?"disabled":""}>Ta bort ur sällskapet</button>`
        :`<button class="btn" data-a="lagg-till" ${st.sallskap.filter(x=>!ar(x)).length>=4||st.run?"disabled":""}>Lägg till i sällskapet</button>`}
      ${G.figurRutor(id).length>1?`<button class="btn ghost" data-a="figur">Byt utseende<span class="sub">${G.figurRutor(id).length} varianter</span></button>`:""}
      <button class="btn ghost" data-a="stang">Stäng</button>
    </div>
    ${st.run&&!dod?`<p class="small muted">Sällskapet kan inte ändras medan ett äventyr pågår.</p>`:""}
    ${!dod&&!vald&&st.sallskap.filter(x=>!ar(x)).length>=4?`<p class="small muted">Sällskapet är fullt (max fyra). Ta bort någon först.</p>`:""}`,
  inner=>inner.onclick=e=>{
    const b=e.target.closest("[data-a]"); if(!b) return;
    if(b.dataset.a==="stang") return stangModal();
    if(b.dataset.a==="figur") return valjFigur(id);
    if(b.dataset.a==="lagg-till"){ st.sallskap = [...st.sallskap.filter(x=>!ar(x)), id].slice(0,4); spara(); stangModal(); ritaOm(); }
    if(b.dataset.a==="ta-bort"){ st.sallskap = st.sallskap.filter(x=>x!==id); spara(); stangModal(); ritaOm(); }
    if(b.dataset.a==="kopTillbaka"){ if(st.kassa<100) return; if(!confirm(`Betala 100 guld för att köpa tillbaka ${HJ[id].namn} till livet?`)) return;
      st.kassa-=100; hs(id).dod=false; kronika(`${HJ[id].namn} köptes tillbaka till livet för 100 guld och fick kliva upp ur poolen i Miami. Tetrok vinkade hejdå.`); spara(); stangModal(); ritaOm(); }
  });
}
function valjFigur(id){
  const nu = figur(id);
  modal(`<h2>Utseende: ${esc(HJ[id].namn)}</h2><p class="small muted">Tryck på den figur du vill använda. Den syns i galleriet, på hjältebladet och i TV:n under äventyren.</p>
    <div class="figurval">${G.figurRutor(id).map(r=>`<button class="fv ${r===nu?"vald":""}" data-r="${r}" aria-label="Variant ${r+1}"><canvas class="px" data-p="${id}" data-ruta="${r}"></canvas></button>`).join("")}</div>
    <button class="btn ghost" data-a="tillbaka">Tillbaka till hjältebladet</button>`,
  inner=>inner.onclick=e=>{
    const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.r!=null){ hs(id).figur=Number(b.dataset.r); spara(); ritaOm(); return visaHjalte(id); }
    if(b.dataset.a==="tillbaka") visaHjalte(id);
  });
}
function kronika(text){ st.kronika.unshift({tid:datum(),text}); st.kronika = st.kronika.slice(0,40); }

// ================= BASAREN =================
const BASAR_SAKER = [["Läkedryck",25],["Läkande ört",10],["Kråkmossa",15],["Krigarfasa",15],["Flaska vin",5]];
// Rött té – billigt och nästan verkningslöst. Lore: FF vill desperat ha det men får det aldrig.
const TE_PRIS = 2;
const TE_SLUT = [
  "”Tyvärr, rött té är slut.” Försäljaren tittar inte ens upp.",
  "”Rött té? Nej, tyvärr. Precis slut.” Kunden före FF går därifrån med en hel kanna.",
  "”Slut. Vi fick in en ny leverans i morse, men den tog också slut.”",
  "”Tyvärr. Vi har aldrig haft rött té.” Bakom disken står tre fulla kannor rött té.",
  "”Rött té? Det tog slut i samma sekund som du kom in.”",
  "”Ledsen, FF. Slut.” Försäljaren vet vad han heter. Det känns personligt."
];
const BASAR_UTR = [["Läderrustning",40,"rustning"],["Ringbrynja",150,"rustning"],["Långsvärd",80,"vapen"],["Stridsyxa",70,"vapen"],["Pilbåge",50,"vapen"]];
let basarMeddelande = "";
function ritaBasar(){
  const party = st.sallskap.filter(id=>!ar(id));
  app.innerHTML = `<section class="card"><div class="row" style="justify-content:space-between"><span class="row" style="gap:8px;flex-wrap:nowrap"><canvas class="px saljare" data-npc="stad:6"></canvas><h2>Basaren</h2></span><span class="kassa">💰 ${st.kassa} guld</span></div>
    <p class="muted small">Förbrukningssaker hamnar i sällskapets gemensamma packning och kan användas av vem som helst i strid.</p>
    <div class="col">${BASAR_SAKER.map(([n,p])=>`<div class="vara"><span><b>${esc(n)}</b><br><span class="small muted">${esc(R.SAKER[n].text)}</span></span><button class="btn small" data-kop="${esc(n)}" data-p="${p}" ${st.kassa<p?"disabled":""}>${p} guld</button></div>`).join("")}</div></section>
  <section class="card"><div class="row" style="gap:8px;flex-wrap:nowrap"><canvas class="px saljare" data-npc="stad:36"></canvas><h2>Tehandeln</h2></div><p class="muted small">Rött té, 2 guld koppen. Det gör inte mycket (1 KP), men det är gott. Teet hamnar i packningen.</p>
    <label class="f">Vem köper?<select id="tevem">${window.HJALTAR.filter(h=>!ar(h.id)).sort((a,b)=>(party.includes(b.id)-party.includes(a.id))).map(h=>`<option value="${h.id}">${esc(h.namn)}</option>`).join("")}</select></label>
    <div class="row"><button class="btn small" data-te="1" ${st.kassa<TE_PRIS?"disabled":""}>Köp rött té – ${TE_PRIS} guld</button></div>
    ${basarMeddelande?`<p class="small" style="color:#ff9d92">${esc(basarMeddelande)}</p>`:""}</section>
  <section class="card"><div class="row" style="gap:8px;flex-wrap:nowrap"><canvas class="px saljare" data-npc="by:12"></canvas><h2>Smeden</h2></div><p class="muted small">Utrustning köps till en hjälte i sällskapet och behålls mellan äventyren.</p>
    ${party.length?`<label class="f">Till vem?<select id="vem">${party.map(id=>`<option value="${id}">${esc(HJ[id].namn)}</option>`).join("")}</select></label>`:`<p class="small">Välj ett sällskap först.</p>`}
    <div class="col">${BASAR_UTR.map(([n,p,t])=>`<div class="vara"><span><b>${esc(n)}</b><br><span class="small muted">${t==="rustning"?"Rustning "+R.RUSTNING[n]:esc(R.VAPEN[n].fard+", "+R.VAPEN[n].skada)}</span></span><button class="btn small" data-utr="${esc(n)}" data-t="${t}" data-p="${p}" ${st.kassa<p||!party.length?"disabled":""}>${p} guld</button></div>`).join("")}</div></section>
  <button class="btn ghost" data-a="hem">Tillbaka till värdshuset</button>`;
  app.querySelectorAll("canvas[data-npc]").forEach(c=>{ const [ark,ruta]=c.dataset.npc.split(":"); G.ritaNpc(c, ark, Number(ruta), true); });
  app.onclick = e => {
    const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.a==="hem"){ basarMeddelande=""; return ga("hem"); }
    if(b.dataset.te){ const id=$("#tevem").value;
      if(id==="ff"){ basarMeddelande = R.valj(TE_SLUT); if(Math.random()<.5) kronika("FF försökte köpa rött té. Det var slut."); spara(); return ritaBasar(); }
      if(st.kassa<TE_PRIS) return; st.kassa-=TE_PRIS; st.packning.push("Rött té"); basarMeddelande=""; spara(); return ritaBasar(); }
    const p = Number(b.dataset.p);
    if(b.dataset.kop){ if(st.kassa<p) return; st.kassa-=p; st.packning.push(b.dataset.kop); spara(); ritaBasar(); }
    if(b.dataset.utr){ const id=$("#vem").value, n=b.dataset.utr; if(st.kassa<p) return; const s=hs(id);
      if(b.dataset.t==="rustning"){ if((R.RUSTNING[bygg(id).rustning]||0)>=R.RUSTNING[n]){ alert(HJ[id].namn+" har redan lika bra eller bättre rustning."); return; } s.rustning=n; }
      else { if(bygg(id).vapen.includes(n)){ alert(HJ[id].namn+" har redan "+n+"."); return; } s.vapen=[...(s.vapen||[]),n]; }
      st.kassa-=p; kronika(`${HJ[id].namn} köpte ${n} för ${p} guld.`); spara(); ritaBasar(); }
  };
}

// ================= UPPDRAGSTAVLAN =================
function fyllTavla(){
  const ids = V.UPPDRAG.map(u=>u.id);
  st.tavla = st.tavla.filter(id=>ids.includes(id));
  while(st.tavla.length<3){ const l = R.blanda(ids.filter(id=>!st.tavla.includes(id))); if(!l.length) break; st.tavla.push(l[0]); }
}
function ritaTavla(){
  fyllTavla(); spara();
  const party = st.sallskap.filter(id=>!ar(id));
  app.innerHTML = `<section class="card"><h2>Uppdragstavlan</h2><p class="muted">Lansor – svart påvehatt, Fu Manchu-mustasch, pipskägg – pekar med en lång nagel på lapparna. Han tar 10 % av alla belöningar för uppdrag han förmedlar själv.</p></section>
    ${st.tavla.map(id=>{const u=V.UPPDRAG.find(x=>x.id===id); const n=st.avklarade[id]||0; return `<section class="card quest">
      <div class="row" style="justify-content:space-between"><h2>${esc(u.titel)}</h2><span class="tag gold">${u.beloning} guld</span></div>
      <p class="small muted">Uppdragsgivare: ${esc(u.givare)} · ${esc(u.plats)}, ${esc(u.land)} · ${esc(V.MILJO[u.miljo].namn)} · ${u.rum} rum${n?` · <span class="tag">Klarat ${n} gång${n>1?"er":""}</span>`:""}</p>
      <p>${esc(u.text)}</p>
      <div class="row"><button class="btn" data-anta="${u.id}" ${!party.length?"disabled":""}>Anta uppdraget</button></div></section>`}).join("")}
    <div class="row"><button class="btn ghost" data-a="nya">Nya lappar</button><button class="btn ghost" data-a="hem">Tillbaka</button></div>`;
  app.onclick = e => {
    const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.a==="hem") return ga("hem");
    if(b.dataset.a==="nya"){ st.tavla=[]; fyllTavla(); spara(); return ritaTavla(); }
    if(b.dataset.anta) valjResa(b.dataset.anta);
  };
}

// ================= BAKHUVUDET JENS =================
// Kusken Bakhuvudet Jens skjutsar ibland äventyrare med sin kärra. Han finns inte alltid på plats.
const JENS_PRIS = 10;
let jensLedig = null; // avgörs en gång per besök vid tavlan
const JENS_BORTA = [
  "Bakhuvudet Jens är ute på en körning. Hans kärra syns inte till.",
  "Kärran står här, men Bakhuvudet Jens är inte på kuskbocken. Någon säger att han äter korv.",
  "Bakhuvudet Jens har ledigt i dag. Det står på en lapp på kärran.",
  "Bakhuvudet Jens skjutsar ett annat sällskap. Ni ser bara hans bakhuvud försvinna bort längs vägen."
];
function valjResa(qid){
  const u = V.UPPDRAG.find(x=>x.id===qid);
  if(jensLedig===null) jensLedig = Math.random() < .65;
  const borta = R.valj(JENS_BORTA);
  modal(`<h2>Hur tar ni er till ${esc(u.plats)}?</h2>
    <div class="val">
      <button class="btn ghost" data-r="fots">Till fots<span class="sub">Gratis. Två möten längs vägen.</span></button>
      ${jensLedig?`<button class="btn" data-r="jens" ${st.kassa<JENS_PRIS?"disabled":""}>Åk med Bakhuvudet Jens<span class="sub">${JENS_PRIS} guld ur kassan${st.kassa<JENS_PRIS?` – ni har ${st.kassa}`:""}. Bara en händelse på vägen – men det är Jens som kör.</span></button>`
        :`<p class="small muted">🐴 ${esc(borta)}</p>`}
      <button class="btn ghost small" data-r="avbryt">Avbryt</button>
    </div>`, inner=>inner.onclick=e=>{
      const b=e.target.closest("button"); if(!b) return;
      if(b.dataset.r==="avbryt") return stangModal();
      if(b.dataset.r==="jens" && st.kassa<JENS_PRIS) return;
      stangModal(); startaUppdrag(qid, b.dataset.r==="jens");
    });
}

// ================= ÄVENTYRET =================
function startaUppdrag(qid, medJens){
  const q = JSON.parse(JSON.stringify(V.UPPDRAG.find(u=>u.id===qid)));
  const party = st.sallskap.filter(id=>!ar(id)); if(!party.length) return;
  const resMoten = medJens ? [R.valj(V.MOTEN.filter(m=>m.jens))] : R.blanda(V.MOTEN.filter(m=>m.resa)).slice(0,2);
  const steg = resMoten.map(m=>({typ:"resa",mote:m.id,jens:!!medJens,vagn:medJens?R.t(G.antalVagnar)-1:undefined}));
  if(medJens){ st.kassa -= JENS_PRIS; jensLedig = null; }
  steg.push(...byggRum(q.miljo, q.rum, party.length, q.boss, 0));
  st.run = {q, party, steg, i:0, h:nyaHjaltar(party), guld:0, logg:[], utfall:null, start:datum()};
  st.tavla = st.tavla.filter(x=>x!==qid);
  storOrn(1/6);
  logga(`Sällskapet antar uppdraget ”${q.titel}” av ${q.givare}.`,"info");
  if(medJens){ logga(`🐴 Bakhuvudet Jens tar ${JENS_PRIS} guld, klättrar upp på kuskbocken och kör iväg utan att säga ett ord.`,"info"); kronika(`${party.map(i=>HJ[i].namn).join(", ")} åkte med Bakhuvudet Jens mot ${q.plats} för ${JENS_PRIS} guld.`); }
  spara(); ga("run");
}
// Bygger ett antal rum som slutar med en boss. extra = fler fiender (används när man utforskar djupare).
function byggRum(miljo, antalRum, antal, boss, extra){
  const rumMoten = R.blanda(V.MOTEN.filter(m=>m.rum)), ut = [];
  const typer = R.blanda(["strid","strid","falla","hinder","skatt","mote","strid","vila","hinder","skatt"]).slice(0,antalRum-1);
  if(!typer.includes("strid")) typer[0]="strid";
  typer.forEach(t=>{
    const rum = {typ:"rum",rumtyp:t,text:R.valj(V.RUMTEXT[miljo]),fro:Math.floor(Math.random()*1e9)};
    if(t==="strid") rum.fiender = slumpaFiender(miljo, antal + extra, false);
    if(t==="falla") rum.falla = R.valj(V.FALLOR[miljo]);
    if(t==="hinder"){ const l=V.HINDER.filter(x=>x.miljo.includes(miljo)); rum.hinder = R.valj(l.length?l:V.HINDER); }
    if(t==="mote") rum.mote = (rumMoten.shift()||V.MOTEN.find(m=>m.rum)).id;
    ut.push(rum);
  });
  ut.push({typ:"rum",rumtyp:"boss",text:"",fro:Math.floor(Math.random()*1e9),fiender:[boss, ...slumpaFiender(miljo, Math.min(3, antalHantlangare(antal) + extra), true)]});
  return ut;
}
function nyaHjaltar(party){
  const h = {};
  party.forEach(id=>{ const b=bygg(id); h[id]={kp:R.maxKP(b),vp:R.maxVP(b),doende:false,ok:0,miss:0,stabil:false,dod:false,
    saker:b.saker.filter(s=>R.SAKER[s]),markerade:[],anvanda:[]}; hs(id).aventyr=(hs(id).aventyr||0)+1; });
  return h;
}

// ================= UTFORSKA EN PLATS (som "Short adventure" i Nat20) =================
// Ingen uppdragsgivare och ingen berättelse: välj en plats och se hur djupt ni kommer.
// Varje kapitel = 4 rum + en boss. Efter varje boss väljer man att gå djupare eller gå hem med bytet.
const KAPITEL_RUM = 5;
const extraFiender = kap => Math.floor((kap-1)/2);          // en fiende till vartannat kapitel
const kpFaktor = kap => 1 + 0.15*(kap-1);                    // fienderna blir 15 % tåligare per kapitel
const kapitelBonus = kap => 20*kap*(kap+1)/2;                // bonus när man går hem: 20, 60, 120, 200 … guld
function ritaPlatser(){
  const party = st.sallskap.filter(id=>!ar(id));
  app.innerHTML = `<section class="card"><h2>Utforska en plats</h2><p class="muted">Ingen uppdragsgivare och ingen berättelse – välj en plats och se hur djupt ni kommer. Varje kapitel är ${KAPITEL_RUM-1} rum och en boss. Efter bossen väljer ni att gå djupare eller gå hem med bytet. Faller hela sällskapet förlorar ni allt ni hittat.</p></section>
    <div class="platsgrid">${V.PLATSER.map(p=>{ const rek=st.rekord[p.id]; return `<button class="platskort" data-plats="${p.id}" ${party.length?"":"disabled"}>
      <canvas class="px" data-scen="${p.miljo}"></canvas>
      <span class="pk"><b>${esc(p.namn)}</b><span class="small muted">${esc(p.land)} · ${esc(V.MILJO[p.miljo].namn)}</span>
      <span class="small">${esc(p.text)}</span>
      ${rek?`<span class="tag gold">Rekord: kapitel ${rek.kapitel}, rum ${rek.djup}</span>`:`<span class="tag">Inte utforskad än</span>`}</span></button>`}).join("")}</div>
    ${party.length?"":`<p class="small muted">Välj ett sällskap i galleriet först.</p>`}
    <button class="btn ghost" data-a="hem">Tillbaka till värdshuset</button>`;
  app.querySelectorAll("canvas[data-scen]").forEach((c,i)=>G.ritaScen(c, c.dataset.scen, [], 31+i*7));
  app.onclick = e => {
    const b = e.target.closest("button"); if(!b || b.disabled) return;
    if(b.dataset.a==="hem") return ga("hem");
    if(b.dataset.plats) startaUtforskning(b.dataset.plats);
  };
}
function startaUtforskning(pid){
  const p = V.PLATSER.find(x=>x.id===pid), party = st.sallskap.filter(id=>!ar(id)); if(!p || !party.length) return;
  const q = {id:"utforska-"+p.id, titel:p.namn, plats:p.namn, land:p.land, miljo:p.miljo, boss:R.valj(p.bossar), beloning:0, givare:"", svar:"", foremal:null, rum:KAPITEL_RUM, plats_id:p.id};
  st.run = {q, party, steg:byggRum(p.miljo, KAPITEL_RUM, party.length, q.boss, 0), i:0, h:nyaHjaltar(party), guld:0, logg:[], utfall:null, start:datum(),
    utforska:true, kapitel:1, djup:0, paus:false};
  storOrn(1/6);
  logga(`Sällskapet ger sig in i ${p.namn}. Kapitel 1.`,"info");
  spara(); ga("run");
}
function kapitelKlart(){
  const r = st.run; r.paus = true; r.djup++;
  logga(`★ Kapitel ${r.kapitel} klart! Sällskapet har tagit sig igenom ${r.djup} rum i ${r.q.plats}.`,"d");
  uppdateraRekord();
  r.party.forEach(id=>{ const x=rh(id); if(!x.dod){ x.kp=Math.max(x.kp,1); } });
  spara(); ritaRun();
}
function uppdateraRekord(){
  const r = st.run; if(!r || !r.utforska) return;
  const pid = r.q.plats_id, gammal = st.rekord[pid];
  const nytt = {kapitel:r.kapitel, djup:r.djup, datum:datum().slice(0,10)};
  if(!gammal || r.djup > gammal.djup){ st.rekord[pid] = nytt; r.nyttRekord = true; }
}
function nyttKapitel(){
  const r = st.run; r.paus = false; r.kapitel++;
  const p = V.PLATSER.find(x=>x.id===r.q.plats_id);
  r.q.boss = R.valj(p.bossar);
  r.steg.push(...byggRum(r.q.miljo, KAPITEL_RUM, r.party.length, r.q.boss, extraFiender(r.kapitel)));
  r.i++; r.kapStart = r.i;
  logga(`Sällskapet går djupare in i ${r.q.plats}. Kapitel ${r.kapitel}.`,"info");
  storOrn(1/6); spara(); ritaRun(); window.scrollTo({top:0,behavior:"smooth"});
}
function kapitelHtml(){
  const r = st.run, nasta = r.kapitel+1;
  return `<h2>Kapitel ${r.kapitel} klart!</h2>
    <p class="berattelse">Bossen är besegrad. Ni har tagit er igenom <b>${r.djup} rum</b> i ${esc(r.q.plats)} och hittat <b>${r.guld} guld</b> hittills.</p>
    ${r.nyttRekord?`<p><span class="tag gold">Nytt rekord för ${esc(r.q.plats)}!</span></p>`:""}
    <p class="small muted">Kapitel ${nasta}: fienderna är ${Math.round((kpFaktor(nasta)-1)*100)} % tåligare${extraFiender(nasta)?` och fler (+${extraFiender(nasta)})`:""}. Faller hela sällskapet förlorar ni allt byte.</p>
    <div class="val"><button class="btn red" data-a="djupare">Gå djupare<span class="sub">Kapitel ${nasta}</span></button>
    <button class="btn" data-a="hemmed">Gå hem med bytet<span class="sub">${r.guld} guld i byte + ${kapitelBonus(r.kapitel)} guld i kapitelbonus</span></button></div>`;
}

// Svårighetsgraden avgör hur många fiender som dyker upp och hur tåliga de är.
const SVAR = {latt:{namn:"Lätt",kp:.75},normal:{namn:"Normal",kp:.9},podden:{namn:"Som i podden (dödligt)",kp:1}};
const svar = () => SVAR[st.svarighet] ? st.svarighet : "normal";
function antalFiender(antal){
  const s = svar();
  if(s==="latt") return Math.max(1, Math.ceil(antal/2));
  if(s==="normal") return Math.max(1, Math.min(4, Math.ceil(antal/2) + (R.t(3)===3?1:0)));
  return Math.max(1, Math.min(4, antal + R.t(3) - 2));
}
function antalHantlangare(antal){ const s=svar(); return s==="latt"?0 : s==="normal"?Math.max(0,antal-3) : Math.max(0,antal-2); }
function slumpaFiender(miljo, antal, minst0){
  const n = minst0 ? antal : antalFiender(antal);
  const ut=[]; for(let i=0;i<n;i++) ut.push(R.valj(V.POOL[miljo])); return ut;
}
function logga(text, cls=""){ if(!st.run) return; st.run.logg.push({text,cls}); if(st.run.logg.length>200) st.run.logg.splice(0,st.run.logg.length-200); if(strid) strid.logg.push({text,cls}); }
const rh = id => st.run.h[id];
const kanAgera = id => { const x=rh(id); return x && !x.dod && !x.doende && !x.stabil && x.kp>0; };
const vakna = () => st.run.party.filter(kanAgera);

// Ett slag av en hjälte – med fördel/nackdel-flaggor och markering vid drake/demon.
function hjalteSlag(id, fard, lage){
  const h = bygg(id), x = rh(id);
  let l = lage || null;
  if(x.fordelNasta && x.nackdelNasta){ x.fordelNasta=false; x.nackdelNasta=false; }
  if(x.fordelNasta){ l = l==="nackdel"?null:"fordel"; x.fordelNasta=false; }
  if(x.nackdelNasta){ l = l==="fordel"?null:"nackdel"; x.nackdelNasta=false; }
  if(fard==="Simma" && h.folk==="Anka") l = l==="nackdel"?null:"fordel";
  const varde = fv(h, fard), s = R.slag(varde, l);
  if(R.FARD[fard]){ if(!x.anvanda.includes(fard)) x.anvanda.push(fard); if((s.drake||s.demon) && !x.markerade.includes(fard)) x.markerade.push(fard); }
  s.fard = fard; return s;
}
const slagText = (namn, s) => `${namn} slår ${s.fard}${s.lage==="fordel"?" med fördel":s.lage==="nackdel"?" med nackdel":""}: ${s.text}`;
const slagCls = s => s.drake?"d":s.demon?"dm":s.lyckat?"ok":"fel";

function skadaHjalte(id, mangd, kalla, ignoreraRust){
  const x = rh(id), h = bygg(id);
  const rust = ignoreraRust ? 0 : R.rustning(h) + (x.tempRust||0);
  const verklig = Math.max(0, mangd - rust);
  if(x.doende){ x.miss++; logga(`${h.namn} träffas medan hen ligger döende – ett misslyckat dödsslag (${x.miss}/3).`,"fel"); if(x.miss>=3) dor(id); return verklig; }
  x.kp = Math.max(0, x.kp - verklig);
  logga(`${h.namn} tar ${verklig} skada${rust&&mangd>verklig?` (${mangd} − ${rust} rustning)`:""}${kalla?" från "+kalla:""}. KP ${x.kp}/${R.maxKP(h)}.`, verklig?"fel":"info");
  if(x.kp<=0 && !x.dod){ x.doende=true; x.ok=0; x.miss=0; logga(`${h.namn} faller ihop och ligger döende!`,"dm"); if(!strid) dodsslagDirekt(id); }
  return verklig;
}
function lakaHjalte(id, mangd){
  const x=rh(id), h=bygg(id); if(x.dod) return 0;
  const fore = x.kp; x.kp = Math.min(R.maxKP(h), x.kp + mangd);
  if(x.doende||x.stabil){ x.doende=false; x.stabil=false; x.ok=0; x.miss=0; if(x.kp<=0) x.kp=1; logga(`${h.namn} kommer tillbaka på benen!`,"ok"); }
  return x.kp - fore;
}
function vpAndra(id, d){ const x=rh(id), h=bygg(id); if(x.dod) return 0; const f=x.vp; x.vp=Math.max(0,Math.min(R.maxVP(h), x.vp+d)); return x.vp-f; }
function dor(id){ const x=rh(id); x.dod=true; x.doende=false; x.kp=0; logga(`☠ ${HJ[id].namn} är död och hamnar i poolen på skyskrapetaket i Miami.`,"dm"); }
function dodsslag(id){
  const x=rh(id), h=bygg(id), s = R.slag(h.e.FYS);
  if(s.drake){ x.doende=false; x.ok=0; x.miss=0; x.kp=R.t(6); logga(`${h.namn} slår dödsslag ${s.text} – reser sig med ${x.kp} KP!`,"d"); return; }
  if(s.lyckat) x.ok++; else x.miss += s.demon?2:1;
  logga(`${h.namn} slår dödsslag mot FYS: ${s.text} (${x.ok} lyckade, ${Math.min(3,x.miss)} misslyckade).`, s.lyckat?"ok":"fel");
  if(x.miss>=3) dor(id); else if(x.ok>=3){ x.doende=false; x.stabil=true; logga(`${h.namn} är stabil men medvetslös.`,"info"); }
}
function dodsslagDirekt(id){ const x=rh(id); let n=0; while(x.doende && n<10){ dodsslag(id); n++; } if(x.stabil){ x.stabil=false; x.kp=1; logga(`${HJ[id].namn} vaknar med 1 KP.`,"info"); } }

// ---------- Rita äventyret ----------
function ritaRun(){
  const r = st.run, steg = r.steg[r.i];
  if(r.utfall) return ritaSlut();
  if(strid) return ritaStrid();
  if(r.utforska && r.paus){
    app.innerHTML = `<div class="tv"><canvas id="scen" class="px"></canvas><span class="badge">${esc(r.q.plats)} · kapitel ${r.kapitel}</span></div>
      ${partyHtml()}<section class="card quest">${kapitelHtml()}</section>${loggHtml()}`;
    G.ritaScen($("#scen"), r.q.miljo, [], 77+r.kapitel, "skatt", scenHjaltar());
    fyllPortratt(app); scrollaLogg();
    app.onclick = e => { const b=e.target.closest("[data-a]"); if(!b) return;
      if(b.dataset.a==="djupare") return nyttKapitel();
      if(b.dataset.a==="hemmed") return avslutaRun(true, "Sällskapet gick hem med bytet."); };
    return;
  }
  const miljo = r.q.miljo;
  let titel = "", innehall = "";
  if(steg.typ==="resa"){
    const m = V.MOTEN.find(x=>x.id===steg.mote);
    titel = steg.jens ? `På Bakhuvudet Jens kärra mot ${r.q.plats}` : `På väg mot ${r.q.plats}`;
    innehall = moteHtml(m, steg);
  } else if(steg.rumtyp==="boss"){
    titel = r.utforska ? `Kapitel ${r.kapitel} · bossen` : `${r.q.plats} – slutstriden`;
    innehall = steg.klar ? klarHtml(steg) : `<p class="berattelse">Ni har nått målet. Här finns ${esc(V.FIENDER[steg.fiender[0]].namn.toLowerCase())}${steg.fiender.length>1?" – och den är inte ensam":""}. Det är nu det gäller.</p>
      <div class="val"><button class="btn red" data-a="strid">Till strid!</button></div>`;
  } else {
    titel = r.utforska ? `Kapitel ${r.kapitel} · rum ${r.djup+1}` : `Rum ${r.i - antalResa() + 1} av ${r.steg.length - antalResa()}`;
    innehall = rumHtml(steg);
  }
  if(steg.fiender && !steg.rutor) steg.rutor = steg.fiender.map(fid=>slumpRuta(fid));
  const fiendeVisning = steg.fiender && !steg.klar ? steg.fiender.map((fid,i)=>({...V.FIENDER[fid],fid,kp:1,ruta:steg.rutor[i]})) : [];
  app.innerHTML = `
    <div class="tv"><canvas id="scen" class="px"></canvas><span class="badge">${esc(r.q.titel)}</span></div>
    <div class="prog">${progHtml()}</div>
    ${partyHtml()}
    <section class="card"><h2>${esc(titel)}</h2>${innehall}</section>
    ${loggHtml()}
    <div class="row"><button class="btn ghost small" data-a="hem">Till värdshuset (pausa)</button></div>`;
  G.ritaScen($("#scen"), steg.typ==="resa"?resMiljo(miljo,r.i):miljo, steg.typ==="resa"?[]:fiendeVisning, steg.fro||r.i*977+13, steg.jens?"jens:"+(steg.vagn||0):steg.rumtyp==="falla"?"falla":steg.rumtyp==="skatt"?"skatt":steg.rumtyp==="vila"?"vila":steg.rumtyp==="hinder"?"hinder":null, scenHjaltar(), scenNpcer(steg));
  fyllPortratt(app); scrollaLogg();
  app.onclick = e => { const b=e.target.closest("[data-a]"); if(!b||b.disabled) return; runKlick(b); };
}
// Mötespersonen (och ett husdjur vid vägkanten när man går till fots) som ska stå i TV:n
const DJUR_RUTOR = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63];
function scenNpcer(steg){
  const r = st.run, ut = [];
  if(steg.jens) return ut;
  const m = steg.mote ? V.MOTEN.find(x=>x.id===steg.mote) : null;
  if(m && m.npc) ut.push(m.npc.fiende ? {fiende:m.npc.fiende, ruta:G.fiendeRutor(m.npc.fiende)[0]} : {ark:m.npc.ark, ruta:m.npc.ruta});
  if(steg.typ==="resa"){ const fro = r.i*977 + r.q.id.length*31 + (r.start||"").length; ut.push({ark:"djur", ruta:DJUR_RUTOR[fro % DJUR_RUTOR.length], spegel:false}); }
  return ut;
}
const antalResa = () => st.run.steg.filter(s=>s.typ==="resa").length;
const resMiljo = (m,i) => i===0 ? (m==="oken"?"oken":"skog") : (m==="grotta"||m==="kloak"?"berg":m);
function progHtml(){
  const r=st.run, fran=r.utforska?(r.kapStart||0):0; return r.steg.map((s,i)=>i<fran?"":`<i class="${i<r.i||(i===r.i&&s.klar)?"klar":i===r.i?"nu":""} ${s.rumtyp==="boss"?"boss":""}" title="${s.typ==="resa"?"Resa":s.rumtyp}"></i>`).join("") + `<span class="small muted" style="margin-left:6px">Hittat: ${r.guld} guld</span>`;
}
function partyHtml(aktivId){
  const r=st.run;
  return `<div class="party">${r.party.map(id=>{ const x=rh(id), b=bygg(id), mk=R.maxKP(b), mv=R.maxVP(b);
    const status = x.dod?"☠ Död":x.doende?`Döende (${x.ok}✓ ${x.miss}✗)`:x.stabil?"Medvetslös":"";
    return `<div class="pm ${aktivId===id?"aktiv":""} ${x.dod||x.doende||x.stabil?"nere":""}"><canvas class="px" data-p="${id}" ${x.dod?'data-dod="1"':""}></canvas>
      <div style="flex:1;min-width:0"><div class="n">${esc(HJ[id].namn)}</div>
      ${status?`<div class="siffra" style="color:#ff9d92">${status}</div>`:""}
      <div class="bar"><b style="width:${100*x.kp/mk}%"></b></div><div class="siffra">KP ${x.kp}/${mk}</div>
      <div class="bar vp"><b style="width:${100*x.vp/mv}%"></b></div><div class="siffra">VP ${x.vp}/${mv}</div></div></div>`}).join("")}</div>`;
}
function loggHtml(){ const l = (strid?strid.logg:st.run.logg).slice(-30); return `<div class="logg" id="logg">${l.map(x=>`<div class="${x.cls}">${esc(x.text)}</div>`).join("")||'<div class="info">Inget har hänt än.</div>'}</div>`; }
function scrollaLogg(){ const l=$("#logg"); if(l) l.scrollTop=l.scrollHeight; }
function klarHtml(steg){ return `<p class="berattelse">${esc(steg.utfallText||"Klart.")}</p><div class="val"><button class="btn" data-a="vidare">Gå vidare</button></div>`; }

function moteHtml(m, steg){
  if(steg.klar) return klarHtml(steg);
  if(aktivtVal && aktivtVal.typ==="vem") return vemHtml();
  return `<h3>${esc(m.namn)}</h3><p class="berattelse">${esc(m.text)}</p>
    <div class="val">${m.val.map((v,i)=>{ const kostar=v.kostnad||0, kan=kostar<=st.kassa+st.run.guld;
      return `<button class="btn ${v.fard?"":"ghost"}" data-a="motval" data-i="${i}" ${kan?"":"disabled"}>${esc(v.knapp)}${v.fard?`<span class="sub">Slå ${esc(v.fard)}</span>`:kostar?`<span class="sub">Ni har ${st.kassa+st.run.guld} guld</span>`:""}</button>`}).join("")}</div>`;
}
function vemHtml(){
  const v = aktivtVal;
  return `<p class="berattelse">${esc(v.fraga)}</p><div class="val">${vakna().map(id=>{const h=bygg(id); const ext = (v.fard==="Simma"&&h.folk==="Anka")?" (fördel – anka!)":"";
    return `<button class="btn ghost" data-a="vem" data-id="${id}">${esc(h.namn)}<span class="sub">${esc(v.fard)} ${fv(h,v.fard)}${ext}</span></button>`}).join("")}
    <button class="btn ghost small" data-a="vem-avbryt">Avbryt</button></div>`;
}
function rumHtml(steg){
  if(steg.klar) return klarHtml(steg);
  if(aktivtVal && aktivtVal.typ==="vem") return vemHtml();
  const t = steg.rumtyp;
  let h = `<p class="berattelse">${esc(steg.text)}</p>`;
  if(t==="strid") h += `<p>Ni är inte ensamma. ${esc(fiendeLista(steg.fiender))} spärrar vägen!</p><div class="val"><button class="btn red" data-a="strid">Till strid!</button>
    <button class="btn ghost" data-a="smyg">Försök smyga förbi<span class="sub">Alla slår Smyga – misslyckas någon blir det strid, och fienden hinner först</span></button></div>`;
  if(t==="falla") h += `<p>Något känns fel här… Någon borde se sig för.</p><div class="val"><button class="btn" data-a="falla">Leta efter fällor<span class="sub">En hjälte slår Upptäcka fara</span></button><button class="btn ghost" data-a="falla-rusa">Bara gå på</button></div>`;
  if(t==="hinder") h += `<h3>${esc(steg.hinder.namn)}</h3><p>${esc(steg.hinder.text)}</p><div class="val"><button class="btn" data-a="hinder">${steg.hinder.alla?"Alla försöker":"Välj vem som försöker"}<span class="sub">Slå ${esc(steg.hinder.fard)}</span></button></div>`;
  if(t==="skatt") h += `<p>I ett hörn ligger en gammal kista och en hög bråte. Det kan finnas mer här än man ser.</p><div class="val"><button class="btn" data-a="skatt">Leta noga<span class="sub">En hjälte slår Finna dolda ting</span></button></div>`;
  if(t==="vila") h += `<p>Ett lugnt hörn där man kan slå sig ner en stund.</p><div class="val"><button class="btn" data-a="vila">Vila en stund<span class="sub">Alla återfår T6 KP och T4 VP – men något kan dyka upp</span></button><button class="btn ghost" data-a="hoppa">Gå vidare direkt</button></div>`;
  if(t==="mote"){ const m=V.MOTEN.find(x=>x.id===steg.mote); return h + moteHtml(m, steg); }
  return h;
}
function fiendeLista(ids){ const c={}; ids.forEach(f=>c[f]=(c[f]||0)+1); return Object.entries(c).map(([f,n])=>n>1?`${n} ${pluralis(V.FIENDER[f].namn)}`:`En ${V.FIENDER[f].namn.toLowerCase()}`).join(" och "); }
function pluralis(n){ const m={"Orch":"orcher","Svartalf":"svartalfer","Svartnisse":"svartnissar","Rövare":"rövare","Kultist från Tarragons Hand":"kultister från Tarragons Hand","Stadsvakt":"stadsvakter","Harpya":"harpyor","Jätteråtta":"jätteråttor","Ulv":"ulvar","Brunbjörn":"brunbjörnar","Odöd soldat":"odöda soldater","Dendroid":"dendroider","Sabeltandad tiger":"sabeltandade tigrar","Gast":"gastar"}; return m[n]||n.toLowerCase(); }

// ---------- Klick i äventyret ----------
function runKlick(b){
  const a=b.dataset.a, r=st.run, steg=r.steg[r.i];
  if(a==="hem"){ aktivtVal=null; return ga("hem"); }
  if(a==="vidare"){ return nastaSteg(); }
  if(a==="vem-avbryt"){ aktivtVal=null; return ritaRun(); }
  if(a==="vem"){ const v=aktivtVal; aktivtVal=null; v.gor(b.dataset.id); return; }
  if(a==="strid"){ return startaStrid(steg.fiender, {boss:steg.rumtyp==="boss"}); }
  if(a==="hoppa"){ return klart(steg,"Ni går vidare utan att vila."); }
  if(a==="smyg"){
    const res = vakna().map(id=>({id,s:hjalteSlag(id,"Smyga")}));
    res.forEach(x=>logga(slagText(HJ[x.id].namn,x.s),slagCls(x.s)));
    if(res.every(x=>x.s.lyckat)){ klart(steg,"Ni smyger förbi som skuggor. Ingen märker något."); }
    else { const klant=res.find(x=>!x.s.lyckat); logga(`${HJ[klant.id].namn} trampar på något som låter. Fienden anfaller!`,"fel"); spara(); startaStrid(steg.fiender,{overraskad:true}); }
    return;
  }
  if(a==="falla"){ return valjVem("Upptäcka fara","Vem går först och letar efter fällor?", id=>{
      const s=hjalteSlag(id,"Upptäcka fara"); logga(slagText(HJ[id].namn,s),slagCls(s));
      if(s.lyckat){ let t=`${HJ[id].namn} upptäcker fällan (${steg.falla.namn}) i tid och leder alla runt den.`; if(s.drake){ const g=R.t(10)+5; r.guld+=g; t+=` Hen hittar dessutom ${g} guld som någon tidigare offer tappat.`; } klart(steg,t); }
      else { logga(steg.falla.text,"fel"); const d=R.slaTarning(steg.falla.skada)*(s.demon?2:1); skadaHjalte(id,d,steg.falla.namn,true); if(steg.falla.vp) vpAndra(id,-R.t(4)); klart(steg,`${steg.falla.text} ${HJ[id].namn} får ta smällen.`); } }); }
  if(a==="falla-rusa"){ const id=R.valj(vakna()); logga(steg.falla.text,"fel"); skadaHjalte(id,R.slaTarning(steg.falla.skada),steg.falla.namn,true); return klart(steg,`Ni rusar rakt in. ${steg.falla.text} Det blev ${HJ[id].namn} som fick ta smällen.`); }
  if(a==="hinder"){
    const hi=steg.hinder;
    if(hi.alla){ const t=[]; vakna().forEach(id=>{ const s=hjalteSlag(id,hi.fard); logga(slagText(HJ[id].namn,s),slagCls(s)); if(!s.lyckat){ skadaHjalte(id,R.slaTarning(hi.skada),hi.namn,true); t.push(HJ[id].namn);} });
      return klart(steg, t.length?`Alla tar sig till slut förbi, men ${t.join(", ")} gjorde sig illa på vägen.`:"Alla tar sig förbi utan en skråma."); }
    return valjVem(hi.fard,`Vem försöker? (${hi.namn})`, id=>{ const s=hjalteSlag(id,hi.fard); logga(slagText(HJ[id].namn,s),slagCls(s));
      if(s.lyckat) klart(steg,`${HJ[id].namn} löser det${s.drake?" med imponerande stil":""}. Ni går vidare.`);
      else { skadaHjalte(id,R.slaTarning(hi.skada),hi.namn,true); klart(steg,`${HJ[id].namn} misslyckas och gör sig illa, men efter mycket svordomar tar ni er ändå förbi.`); } });
  }
  if(a==="skatt"){ return valjVem("Finna dolda ting","Vem letar?", id=>{
      const s=hjalteSlag(id,"Finna dolda ting"); logga(slagText(HJ[id].namn,s),slagCls(s));
      let g = s.lyckat ? R.t(20)+10 : R.t(10); if(s.drake) g*=2; let t="";
      if(r.party.includes("ned") && kanAgera("ned")){ g=Math.round(g*1.5); t=" Ned Klen värderar fyndet och lyckas pressa ut lite extra."; }
      r.guld+=g; let sak="";
      if(s.lyckat){ sak=R.valj(V.SKATTER); st.packning.push(sak); }
      klart(steg,`${HJ[id].namn} hittar ${g} guld${sak?` och ${sak.toLowerCase()}`:""}.${t}${s.demon?" (Och river dessutom ner en hylla på sig själv.)":""}`);
      if(s.demon) skadaHjalte(id,R.t(4),"en hylla",true); }); }
  if(a==="vila"){
    vakna().forEach(id=>{ lakaHjalte(id,R.t(6)); vpAndra(id,R.t(4)); });
    logga("Sällskapet vilar och samlar krafter.","ok");
    if(R.t(6)<=2){ const f=slumpaFiender(r.q.miljo, r.party.length, false); logga("Mitt i vilan hörs steg…","fel"); steg.fiender=f; spara(); return startaStrid(f,{overraskad:true}); }
    return klart(steg,"Ni vilar i lugn och ro. Alla känner sig lite bättre.");
  }
  if(a==="motval"){
    const m = V.MOTEN.find(x=>x.id===steg.mote), v = m.val[Number(b.dataset.i)];
    if(v.kostnad){ betala(v.kostnad); }
    if(v.fard){
      return valjVem(v.fard, "Vem tar sig an det?", id=>{ const s=hjalteSlag(id,v.fard); logga(slagText(HJ[id].namn,s),slagCls(s));
        tillampa(s.lyckat?v.lyckat:v.misslyckat, id, steg); });
    }
    return tillampa(v.auto, null, steg);
  }
}
function betala(n){ const r=st.run; const fran=Math.min(r.guld,n); r.guld-=fran; st.kassa=Math.max(0,st.kassa-(n-fran)); logga(`Ni betalar ${n} guld.`,"info"); }
function valjVem(fard, fraga, gor){ aktivtVal={typ:"vem",fard,fraga,gor}; ritaRun(); }
function tillampa(eff, id, steg){
  eff = eff || {}; const r=st.run, t=[eff.text||""];
  const vem = id || R.valj(vakna());
  if(eff.guld){ if(eff.guld>0){ r.guld+=eff.guld; t.push(`(+${eff.guld} guld)`); } else { betala(-eff.guld); t.push(`(−${-eff.guld} guld)`); } }
  if(eff.sak){ st.packning.push(eff.sak); t.push(`(${eff.sak} i packningen)`); }
  if(eff.sak2){ st.packning.push(eff.sak2); }
  if(eff.kp){ vakna().forEach(i=>lakaHjalte(i,R.slaTarning(eff.kp))); t.push("(alla läker)"); }
  if(eff.vp){ vakna().forEach(i=>vpAndra(i,R.slaTarning(eff.vp))); }
  if(eff.vpAlla){ const plus=String(eff.vpAlla).startsWith("+"); vakna().forEach(i=>vpAndra(i,(plus?1:-1)*R.slaTarning(String(eff.vpAlla).replace("+","")))); t.push(plus?"(alla återfår VP)":"(alla förlorar VP)"); }
  if(eff.skada && vem){ skadaHjalte(vem,R.slaTarning(eff.skada),null,true); }
  if(eff.skadaAlla){ vakna().forEach(i=>skadaHjalte(i,R.slaTarning(eff.skadaAlla),null,true)); }
  logga(t.filter(Boolean).join(" "), "info");
  if(eff.strid){
    const fid = eff.strid==="POOL" ? R.valj(V.POOL[r.q.miljo]) : eff.strid;
    const n = antalFiender(r.party.length), f=[]; for(let i=0;i<n;i++) f.push(fid);
    steg.fiender = f; steg.efterStrid = eff.text; spara();
    return startaStrid(f,{});
  }
  klart(steg, t.filter(Boolean).join(" "));
}
function klart(steg, text){
  steg.klar = true; steg.utfallText = text; aktivtVal=null;
  if(kollaAllaNere()) return;
  spara(); ritaRun();
}
function kollaAllaNere(){ if(!st.run) return false; if(vakna().length===0){ avslutaRun(false,"Hela sällskapet har fallit."); return true; } return false; }
// Stör-örnen (lore): Potus Rövhatt har en tendens att bli anfallen av örnar.
// Varje gång sällskapet kommer till ett nytt steg (1 på 6) och varje stridsrunda (1 på 10) kan en örn dyka ner på honom.
// Den gör lite skada (T4, rustning hjälper inte), men tar honom aldrig under 1 KP.
const ORN_TEXT = [
  "En stör-örn störtdyker ur skyn och hackar Potus Rövhatt i huvudet. Sedan flyger den iväg igen.",
  "Ett skri hörs. Potus hinner bara säga ”Nej, inte igen”, innan stör-örnen landar på hans axel och river.",
  "En stör-örn dyker ner, tar ett nyp i Potus kvarvarande öra och försvinner bakom en sky.",
  "Stör-örnen är tillbaka. Den kliar Potus i ansiktet med klorna och ser väldigt nöjd ut.",
  "Potus tittar upp i exakt rätt sekund för att få en stör-örn rakt i ansiktet.",
  "Från ingenstans kommer en stör-örn, tar Potus i skägget, lyfter honom en decimeter och släpper."
];
function storOrn(chans, iStrid){
  const r = st.run; if(!r || !r.party.includes("potus")) return;
  const x = rh("potus"); if(!x || x.dod || x.doende || x.stabil || x.kp<=1) return;
  if(Math.random() >= chans) return;
  const d = Math.min(R.t(4), x.kp-1);
  x.kp -= d;
  logga(`🦅 ${R.valj(ORN_TEXT)} Potus tar ${d} skada. KP ${x.kp}/${R.maxKP(bygg("potus"))}.`, "fel");
  r.ornar = (r.ornar||0) + 1;
}
function nastaSteg(){
  const r=st.run; aktivtVal=null;
  if(r.i >= r.steg.length-1){ return avslutaRun(true); }
  if(r.utforska) r.djup++;
  r.i++; storOrn(1/6); spara(); ritaRun(); window.scrollTo({top:0,behavior:"smooth"});
}
function geUpp(){
  if(!confirm("Vill ni verkligen ge upp äventyret? Ni behåller livet men får ingen belöning.")) return;
  avslutaRun(false,"Sällskapet gav upp och vände hem.", true); ga("run");
}

// ================= STRIDEN =================
// Slumpar vilken av fiendens figurvarianter som används
function slumpRuta(fid){ const r = G.fiendeRutor(fid); return r.length ? R.valj(r) : null; }
function startaStrid(fiendeIds, opt){
  opt = opt||{};
  const r = st.run, sr = r.steg[r.i], rutor = (sr && sr.fiender===fiendeIds && sr.rutor) || [];
  const fiender = fiendeIds.map((fid,i)=>{ const f=V.FIENDER[fid], kp=Math.max(1,Math.round(f.kp*SVAR[svar()].kp*(st.run&&st.run.utforska?kpFaktor(st.run.kapitel):1))); return {i, fid, ruta: rutor[i]!=null ? rutor[i] : slumpRuta(fid), namn:f.namn, sprite:f.sprite, kp, max:kp, rust:f.rust||0, typ:f.typ, anfall:f.anfall, skada:f.skada, attacker:f.attacker, boss:!!f.boss, folk:!!f.folk, stor:!!f.stor, liten:!!f.liten, besv:f.besv, stoppad:0, nackdel:false}; });
  // Numrera likadana fiender
  const c={}; fiender.forEach(f=>{c[f.namn]=(c[f.namn]||0)+1}); const n={}; fiender.forEach(f=>{ if(c[f.namn]>1){ n[f.namn]=(n[f.namn]||0)+1; f.namn+=" "+n[f.namn]; } });
  r.party.forEach(id=>{ const x=rh(id); Object.assign(x,{tempRust:0,vapenbonus:null,gift:x.gift||false,maktig:false,raseri:false,undvikAllt:false,stoppad:0}); });
  strid = {fiender, runda:0, ordning:[], pos:0, logg:[], meny:"huvud", aktiv:null, salamander:0, boss:!!opt.boss, overraskad:!!opt.overraskad, svara:null, forsvar:null, slut:null};
  strid.logg.push({text:opt.boss?"⚔ Slutstriden börjar!":"⚔ Striden börjar!",cls:"d"});
  vy="run"; stridLoop();
}
function nyRunda(){
  strid.runda++;
  const delt = [...strid.fiender.filter(f=>f.kp>0).map(f=>({typ:"f",i:f.i})), ...st.run.party.filter(id=>{const x=rh(id);return !x.dod && !x.stabil}).map(id=>({typ:"h",id}))];
  let kort = R.blanda([1,2,3,4,5,6,7,8,9,10]);
  delt.forEach((d,i)=>{ d.kort = kort[i] ?? (11+i); });
  if(strid.overraskad && strid.runda===1){ delt.forEach(d=>{ if(d.typ==="f") d.kort-=10; }); logga("Fienden hinner först!","fel"); }
  delt.sort((a,b)=>a.kort-b.kort);
  strid.ordning = delt; strid.pos = 0;
  st.run.party.forEach(id=>{ const x=rh(id); x.agerat=false; x.raseri=false; x.undvikAllt=false; });
  logga(`— Runda ${strid.runda} —`,"info");
  storOrn(1/10, true);
  if(strid.salamander>0){ const l=strid.fiender.filter(f=>f.kp>0); if(l.length){ const f=R.valj(l); const d=Math.max(0,R.t(8)-f.rust); f.kp=Math.max(0,f.kp-d); logga(`Salamandern bränner ${f.namn} för ${d} skada.`,"ok"); if(f.kp<=0) logga(`${f.namn} faller!`,"d"); } strid.salamander--; }
}
async function stridLoop(){
  while(strid){
    const slut = kollaSlut(); if(slut){ return avslutaStrid(slut); }
    if(strid.pos >= strid.ordning.length){ nyRunda(); ritaStrid(); await vanta(250); continue; }
    const tur = strid.ordning[strid.pos++];
    tur.nu = true;
    if(tur.typ==="h"){
      const x = rh(tur.id);
      if(x.dod || x.stabil){ tur.gjord=true; continue; }
      if(x.doende){ strid.aktiv=tur.id; dodsslag(tur.id); ritaStrid(); await vanta(700); tur.gjord=true; continue; }
      if(x.stoppad>0){ x.stoppad--; logga(`${HJ[tur.id].namn} är ur spel den här rundan.`,"info"); tur.gjord=true; ritaStrid(); await vanta(500); continue; }
      if(x.agerat && !tur.extra){ logga(`${HJ[tur.id].namn} har redan använt sin handling till att försvara sig.`,"info"); tur.gjord=true; continue; }
      strid.aktiv = tur.id; strid.meny = "huvud"; strid.tur = tur;
      await new Promise(res=>{ strid.svara=res; ritaStrid(); });
      if(!strid) return;
      x.agerat = true; tur.gjord = true; strid.aktiv=null;
      ritaStrid(); await vanta(300);
    } else {
      const f = strid.fiender[tur.i];
      if(!f || f.kp<=0){ tur.gjord=true; continue; }
      if(f.stoppad>0){ f.stoppad--; logga(`${f.namn} står still och kan inte agera.`,"ok"); tur.gjord=true; ritaStrid(); await vanta(500); continue; }
      strid.aktiv = "#f"+f.i; f.markerad = true; ritaStrid(); await vanta(550);
      await fiendeAgerar(f);
      if(!strid) return;
      f.markerad=false; tur.gjord=true; strid.aktiv=null; ritaStrid(); await vanta(450);
    }
  }
}
function kollaSlut(){
  if(strid.flydde) return "flydde";
  if(strid.fiender.every(f=>f.kp<=0)) return "seger";
  if(!st.run.party.some(id=>{const x=rh(id); return !x.dod && !x.doende && !x.stabil && x.kp>0;})) return "forlust";
  return null;
}

// ---------- Fiendernas tur ----------
async function fiendeAgerar(f){
  const mal = R.blanda(st.run.party.filter(kanAgera))[0];
  if(!mal) return;
  // Kultistpräst kan kasta blixt
  if(f.besv && R.t(3)===1){
    logga(`${f.namn} kastar en svart blixt mot ${HJ[mal].namn}!`,"fel");
    const fs = await fragaForsvar(mal, `${f.namn} kastar en svart blixt mot ${HJ[mal].namn} (${f.besv}).`, true);
    if(!fs) skadaHjalte(mal, R.slaTarning(f.besv), f.namn, true);
    return;
  }
  if(f.typ==="folk"){
    const s = R.slag(f.anfall, f.nackdel?"nackdel":null); f.nackdel=false;
    logga(`${f.namn} anfaller ${HJ[mal].namn}: ${s.text}`, s.lyckat?"fel":"ok");
    if(!s.lyckat) return;
    const fs = await fragaForsvar(mal, `${f.namn} träffar ${HJ[mal].namn} (${f.skada}${s.drake?", DRAKE – dubbel skada":""}).`);
    if(fs) return;
    let d = R.slaTarning(f.skada); if(s.drake) d += R.slaTarning(f.skada);
    skadaHjalte(mal, d, f.namn);
    return;
  }
  // Bestar: anfallen träffar alltid, men kan undvikas eller pareras
  const atk = R.valj(f.attacker);
  if(f.nackdel){ f.nackdel=false; if(R.t(6)<=3){ logga(`${f.namn} tvekar och missar tillfället.`,"ok"); return; } }
  if(atk.alla){
    logga(`${f.namn} ${atk.text} hela sällskapet!`,"fel");
    st.run.party.filter(kanAgera).forEach(id=>{ if(rh(id).undvikAllt){ logga(`${HJ[id].namn} teleporterar sig undan.`,"ok"); return; } if(atk.skada) skadaHjalte(id, R.slaTarning(atk.skada), atk.namn); effekt(atk.effekt,id); });
    return;
  }
  const fs = await fragaForsvar(mal, `${f.namn} ${atk.text} ${HJ[mal].namn} – ${atk.namn}${atk.skada?" ("+atk.skada+")":""}.`);
  if(fs) return;
  if(atk.skada) skadaHjalte(mal, R.slaTarning(atk.skada), atk.namn);
  else logga(`${f.namn} ${atk.text} ${HJ[mal].namn}.`,"fel");
  effekt(atk.effekt, mal);
}
function effekt(e, id){
  const x = rh(id); if(!e || x.dod) return;
  if(e==="nackdel"){ x.nackdelNasta=true; logga(`${HJ[id].namn} skakas om och får nackdel på nästa slag.`,"fel"); }
  if(e==="stoppa"){ x.stoppad=1; logga(`${HJ[id].namn} sitter fast och förlorar sin nästa handling.`,"fel"); }
  if(e==="vp"){ const d=vpAndra(id,-R.t(4)); logga(`${HJ[id].namn} förlorar ${-d} VP.`,"fel"); }
}
// Frågar spelaren om hjälten vill undvika/parera. Returnerar true om anfallet avvärjdes.
function fragaForsvar(id, beskr, barUndvika){
  const x = rh(id), h = bygg(id);
  if(x.undvikAllt){ logga(`${h.namn} teleporterar sig en meter åt sidan. Missat!`,"ok"); return Promise.resolve(true); }
  if(x.agerat || x.raseri || !kanAgera(id)){ if(x.raseri) logga(`${h.namn} är i raseri och bryr sig inte om att försvara sig.`,"info"); return Promise.resolve(false); }
  const parv = h.vapen.map(v=>R.VAPEN[v]).filter(v=>v && !v.avstand).map(v=>({v, varde:R.fardVarde(h,v.fard)})).sort((a,b)=>b.varde-a.varde)[0];
  return new Promise(res=>{
    strid.forsvar = {id, beskr, parv: barUndvika?null:parv, svar:(val)=>{
      strid.forsvar=null;
      if(val==="ta"){ logga(`${h.namn} tar smällen.`,"info"); ritaStrid(); return res(false); }
      x.agerat = true;
      const s = val==="parera" ? hjalteSlag(id, parv.v.fard, h.skold?"fordel":null) : hjalteSlag(id,"Undvika");
      logga(`${h.namn} ${val==="parera"?"parerar":"försöker undvika"}: ${s.text}`, slagCls(s));
      ritaStrid();
      res(s.lyckat);
    }};
    strid.aktiv = id; ritaStrid();
  });
}

// ---------- Hjältens handlingar ----------
function hjalteHandling(fn){ try{ fn(); }catch(e){ console.error(e); logga("Något gick fel: "+e.message,"fel"); } spara(); const r=strid&&strid.svara; if(strid){ strid.svara=null; strid.meny="huvud"; } if(r) r(); }
function skadaFiende(f, d, kalla){
  const verklig = Math.max(0, d - f.rust);
  f.kp = Math.max(0, f.kp - verklig);
  logga(`${f.namn} tar ${verklig} skada${f.rust&&d>verklig?` (${d} − ${f.rust} rustning)`:""}${kalla?" från "+kalla:""}.`, verklig?"ok":"info");
  if(f.kp<=0) logga(`${f.namn} faller!`,"d");
  return verklig;
}
function anfall(id, vapenNamn, f, extra){
  extra = extra||{};
  const h=bygg(id), x=rh(id), v=R.VAPEN[vapenNamn];
  const s = hjalteSlag(id, v.fard, extra.fordel?"fordel":null);
  logga(slagText(h.namn+" ("+vapenNamn+")", s), slagCls(s));
  if(!s.lyckat){ if(s.demon){ x.nackdelNasta=true; logga(`Fummel! ${h.namn} tappar balansen och får nackdel på nästa slag.`,"dm"); } return 0; }
  let d = R.slaTarning(v.skada) + (v.bonus||0);
  if(s.drake){ d += R.slaTarning(v.skada); logga("Drake! Dubbel vapenskada.","d"); }
  const sb = R.skadebonus(h, v.avstand); if(sb) d += R.slaTarning(sb);
  if(x.vapenbonus) d += R.slaTarning(x.vapenbonus);
  if(x.gift){ d += R.t(6); x.gift=false; logga("Giftet på vapnet gör sitt.","ok"); }
  if(extra.plus) d += R.slaTarning(extra.plus);
  if(extra.dubbel) d *= 2;
  return skadaFiende(f, d);
}
function kasta(id, namn, mal){
  const h=bygg(id), x=rh(id), b=R.BESV[namn];
  if(x.vp < R.BESV_KOSTNAD){ logga(`${h.namn} har inte tillräckligt med VP.`,"fel"); return; }
  x.vp -= R.BESV_KOSTNAD;
  const s = hjalteSlag(id, "Magi");
  logga(slagText(`${h.namn} kastar ${namn}`, s), slagCls(s));
  if(!s.lyckat){ if(s.demon){ const d=R.t(6); logga(`Magisk olycka! Besvärjelsen slår tillbaka.`,"dm"); skadaHjalte(id,d,"sin egen magi",true); } else logga("Besvärjelsen fräser och dör ut.","fel"); return; }
  const m = (x.maktig?2:1) * (s.drake?2:1); if(x.maktig){ logga("Hocus pocus i fokus – dubbel effekt!","d"); x.maktig=false; }
  if(b.skada){ const lista = b.mal==="allaFiender" ? strid.fiender.filter(f=>f.kp>0) : [mal]; lista.forEach(f=>skadaFiende(f, R.slaTarning(b.skada)*m, namn)); }
  if(b.stoppa && mal && mal.kp>0){ mal.stoppad = (b.stoppaRundor||1)*m; logga(`${mal.namn} är fastlåst i ${mal.stoppad} ${mal.stoppad>1?"handlingar":"handling"}.`,"ok"); }
  if(b.laka){ const l = lakaHjalte(mal, R.slaTarning(b.laka)*m); logga(`${HJ[mal].namn} läker ${l} KP.`,"ok"); }
  if(b.rustning){ rh(mal).tempRust = (rh(mal).tempRust||0) + b.rustning*m; logga(`${HJ[mal].namn} får +${b.rustning*m} i rustning resten av striden.`,"ok"); }
  if(b.vapenbonus){ rh(mal).vapenbonus = m>1?"2T6":b.vapenbonus; logga(`${HJ[mal].namn}s vapen glöder.`,"ok"); }
  if(b.salamander){ strid.salamander += b.salamander*m; logga("En eldsalamander kryper fram ur lågorna!","ok"); }
  if(b.skrack){ strid.fiender.forEach(f=>f.nackdel=true); logga("Fienderna vet inte längre vem som är vem.","ok"); }
  if(b.kontroll){ if(mal.folk && !mal.boss){ mal.kp=0; mal.lamnat=true; logga(`${mal.namn} sänker vapnet och går därifrån som i trans.`,"d"); } else logga(`${mal.namn} låter sig inte kontrolleras.`,"fel"); }
  if(b.fly){ if(strid.boss){ logga("Sällskapet teleporterar sig bort från slutstriden!","info"); } strid.flydde = true; strid.teleport = true; }
}
function formaga(id, mal){
  const h=bygg(id), x=rh(id), fo=h.formaga;
  if(x.vp < R.FORMAGA_KOSTNAD){ logga(`${h.namn} har inte tillräckligt med VP.`,"fel"); return; }
  x.vp -= R.FORMAGA_KOSTNAD;
  logga(`★ ${h.namn}: ${fo.namn}!`,"d");
  const forstaVapen = () => h.vapen.find(v=>R.VAPEN[v] && (!R.VAPEN[v].avstand || true));
  switch(fo.typ){
    case "bonusAnfall": if(fo.ingetForsvar) x.raseri=true; anfall(id, valtVapen(id), mal, {fordel:fo.fordel, plus:fo.extra}); break;
    case "dubbelAnfall": { const l=strid.fiender.filter(f=>f.kp>0); anfall(id, valtVapen(id), mal); const m2 = mal.kp>0?mal:R.valj(strid.fiender.filter(f=>f.kp>0)||[]); if(m2) anfall(id, h.vapen[1]&&R.VAPEN[h.vapen[1]]&&!R.VAPEN[h.vapen[1]].avstand?h.vapen[1]:valtVapen(id), m2); break; }
    case "lonnmord": { const agerat = strid.ordning.some(t=>t.typ==="f"&&t.i===mal.i&&t.gjord); if(agerat) logga(`${mal.namn} har redan agerat – inget lönnmord den här gången, men ett vanligt anfall.`,"info"); anfall(id, valtVapen(id), mal, {dubbel:!agerat}); break; }
    case "skrackAlla": strid.fiender.forEach(f=>f.nackdel=true); logga("Fienderna ryggar tillbaka i fasa.","ok"); break;
    case "fordelAllaNasta": st.run.party.filter(kanAgera).forEach(i=>rh(i).fordelNasta=true); logga("Alla hjältar får fördel på sitt nästa slag.","ok"); break;
    case "lakaAlla": st.run.party.filter(i=>!rh(i).dod).forEach(i=>{ const l=lakaHjalte(i,R.slaTarning(fo.dice)); if(l) logga(`${HJ[i].namn} återfår ${l} KP.`,"ok"); }); break;
    case "lakaSjalv": { const l=lakaHjalte(id,R.slaTarning(fo.dice)); logga(`${h.namn} återfår ${l} KP.`,"ok"); break; }
    case "vpAlla": st.run.party.filter(i=>!rh(i).dod).forEach(i=>{ if(i===id) return; const l=vpAndra(i,R.slaTarning(fo.dice)); if(l) logga(`${HJ[i].namn} återfår ${l} VP.`,"ok"); }); break;
    case "terapi": { const v=vpAndra(mal,R.slaTarning("2T6")); rh(mal).fordelNasta=true; logga(`${HJ[mal].namn} ligger på divanen en stund, återfår ${v} VP och får fördel på nästa slag.`,"ok"); break; }
    case "extraHandling": { const tur={typ:"h",id:mal,kort:0,extra:true}; strid.ordning.splice(strid.pos,0,tur); logga(`${HJ[mal].namn} får en extra handling!`,"ok"); break; }
    case "stoppaFiende": mal.stoppad = Math.max(mal.stoppad,1); logga(`${mal.namn} står helt paralyserad.`,"ok"); break;
    case "overtala": { const s=hjalteSlag(id,"Övertala"); logga(slagText(h.namn,s),slagCls(s)); if(s.lyckat && mal.folk && !mal.boss){ mal.kp=0; mal.lamnat=true; logga(`${mal.namn} rodnar, slänger vapnet och går därifrån.`,"d"); } else logga(`${mal.namn} är inte intresserad.`,"fel"); break; }
    case "fickstold": { const g=R.t(20); st.run.guld+=g; logga(`${h.namn} länsar ${mal.namn} på ${g} guld.`,"ok"); break; }
    case "undvikAllt": x.undvikAllt=true; logga(`${h.namn} är redo att teleportera sig undan alla anfall den här rundan.`,"ok"); break;
    case "kaos": { const k=R.t(6); const l=strid.fiender.filter(f=>f.kp>0);
      if(k===1){ logga("Malexander snubblar på sin egen kroksabel.","dm"); skadaHjalte(id,R.t(6),"sig själv",true); }
      else if(k===2){ logga("Malexander sjunger. Det är fruktansvärt. Alla, även vännerna, får nackdel.","fel"); st.run.party.forEach(i=>rh(i).nackdelNasta=true); l.forEach(f=>f.nackdel=true); }
      else if(k<=4){ logga("Malexander skimrar gyllene och slår till med oväntad kraft.","ok"); anfall(id, valtVapen(id), mal||R.valj(l), {fordel:true, plus:"T6"}); }
      else { logga("En gyllene våg sköljer över sällskapet!","d"); st.run.party.filter(i=>!rh(i).dod).forEach(i=>lakaHjalte(i,R.t(6))); }
      break; }
    case "eldsvard": { anfall(id, h.vapen.includes("Gorgor")?"Gorgor":valtVapen(id), mal, {plus:"2T6"}); skadaHjalte(id,R.t(4),"Gorgors lågor",true); break; }
    case "chansning": { const k=R.t(6); logga(`${h.namn} satsar allt: T6 = ${k}.`, k>=4?"ok":"fel"); if(k>=4) anfall(id, valtVapen(id), mal, {dubbel:true}); else skadaHjalte(id,R.t(4),"sin egen klumpighet",true); break; }
    case "maktigFormel": x.maktig=true; x.vp += R.FORMAGA_KOSTNAD - 1; logga(`${h.namn} fokuserar. Nästa besvärjelse får dubbel effekt. (Kostade bara 1 VP.)`,"ok"); x.agerat=false; strid.ordning.splice(strid.pos,0,{typ:"h",id,kort:0,extra:true}); break;
  }
}
function valtVapen(id){ const x=rh(id), h=bygg(id); if(x.valtVapen && h.vapen.includes(x.valtVapen)) return x.valtVapen; return h.vapen.slice().sort((a,b)=>R.fardVarde(h,R.VAPEN[b].fard)-R.fardVarde(h,R.VAPEN[a].fard))[0] || "Knytnävar"; }
function anvandSak(id, namn, kalla, mal){
  const x=rh(id), sak=R.SAKER[namn], m = mal || id;
  if(namn==="Rött té" && (id==="ff" || m==="ff")){ // FF får aldrig något rött té
    logga(id==="ff" ? "FF lyfter tekannan med darrande händer. Den är tom. Den var full nyss." : `${HJ[id].namn} räcker fram en kopp rött té till FF – och snubblar. Allt hamnar på marken. Koppen var dessutom tom.`, "fel");
    return; }
  if(kalla==="egen"){ const i=x.saker.indexOf(namn); if(i>=0) x.saker.splice(i,1); } else { const i=st.packning.indexOf(namn); if(i>=0) st.packning.splice(i,1); }
  logga(`${HJ[id].namn} använder ${namn.toLowerCase()}${m!==id?" på "+HJ[m].namn:""}. ${sak.text}`,"info");
  const xm = rh(m);
  if(sak.effekt==="kp"){ const l=lakaHjalte(m,R.slaTarning(sak.dice)); logga(`${HJ[m].namn} återfår ${l} KP.`,"ok"); }
  if(sak.effekt==="vp"){ const l=vpAndra(m,R.slaTarning(sak.dice)); logga(`${HJ[m].namn} återfår ${l} VP.`,"ok"); }
  if(sak.effekt==="vpNackdel"){ vpAndra(m,R.slaTarning(sak.dice)); xm.nackdelNasta=true; }
  if(sak.effekt==="fordelNasta") xm.fordelNasta=true;
  if(sak.effekt==="gift") xm.gift=true;
}
function hjalpDoende(id, mal){
  const s = hjalteSlag(id,"Läkekonst"); logga(slagText(`${HJ[id].namn} försöker rädda ${HJ[mal].namn}`, s), slagCls(s));
  if(s.lyckat){ lakaHjalte(mal, R.t(6)); } else if(s.demon){ rh(mal).miss++; logga("Det gör bara saken värre.","dm"); if(rh(mal).miss>=3) dor(mal); }
}

// ---------- Rita striden ----------
function ritaStrid(){
  if(!strid || !st.run) return;
  const r = st.run, akt = strid.aktiv, x = akt && !String(akt).startsWith("#f") ? rh(akt) : null;
  const steg = r.steg[r.i];
  let panel = "";
  if(strid.forsvar){
    const fo = strid.forsvar, h = bygg(fo.id);
    panel = `<h3>Försvar!</h3><p class="berattelse">${esc(fo.beskr)}</p><p class="small muted">Att försvara sig kostar ${esc(h.namn)}s handling den här rundan.</p><div class="val">
      <button class="btn" data-f="undvika">Undvika<span class="sub">Slå Undvika ${fv(h,"Undvika")}${rh(fo.id).nackdelNasta?" (nackdel)":""}</span></button>
      ${fo.parv?`<button class="btn" data-f="parera">Parera<span class="sub">Slå ${esc(fo.parv.v.fard)} ${fo.parv.varde}${h.skold?" med fördel (sköld)":""}</span></button>`:""}
      <button class="btn ghost" data-f="ta">Ta smällen<span class="sub">Spara handlingen till ett eget anfall</span></button></div>`;
  } else if(x && strid.svara){
    const h = bygg(akt);
    panel = `<h3>${esc(h.namn)}s tur</h3>` + hjalteMeny(akt, h, x);
  } else {
    panel = `<p class="muted">${akt&&String(akt).startsWith("#f")?esc((strid.fiender[Number(akt.slice(2))]||{}).namn||"")+" agerar…":"…"}</p>`;
  }
  app.innerHTML = `
    <div class="tv"><canvas id="scen" class="px"></canvas><span class="badge">Runda ${strid.runda}</span></div>
    <div class="ordning">${strid.ordning.map(t=>`<span class="${t.nu&&!t.gjord?"nu":""} ${t.gjord?"gjord":""} ${t.typ==="f"?"f":""}">${t.typ==="h"?esc(HJ[t.id].namn.split(" ")[0]):esc((strid.fiender[t.i]||{}).namn)}</span>`).join("")}</div>
    <div class="fiender">${strid.fiender.map(f=>`<div class="fiende ${f.kp<=0?"dod":""}"><span class="n">${esc(f.namn)}${f.stoppad>0?" ⛓":""}${f.nackdel?" 😨":""}</span><span class="siffra">KP ${f.kp}/${f.max}</span><div class="bar f"><b style="width:${100*f.kp/f.max}%"></b></div></div>`).join("")}</div>
    ${partyHtml(akt)}
    <section class="card">${panel}</section>
    ${loggHtml()}`;
  const fiendeVis = strid.fiender.filter(f=>!f.lamnat).map(f=>({...f, visa:true}));
  G.ritaScen($("#scen"), r.q.miljo, fiendeVis, steg.fro||7, null, scenHjaltar(akt));
  fyllPortratt(app); scrollaLogg();
  app.onclick = e => {
    const b = e.target.closest("button"); if(!b || b.disabled) return;
    if(b.dataset.f && strid.forsvar) return strid.forsvar.svar(b.dataset.f);
    if(b.dataset.m) return stridMeny(b.dataset.m, b.dataset);
  };
}
function hjalteMeny(id, h, x){
  const l = strid.fiender.filter(f=>f.kp>0);
  const mal = (akt, extra="") => l.map(f=>`<button class="btn ghost" data-m="${akt}" data-f="${f.i}" ${extra}>${esc(f.namn)}<span class="sub">KP ${f.kp}/${f.max}, rustning ${f.rust}</span></button>`).join("");
  const hjaltar = (akt, filt) => r_party().filter(filt).map(i=>`<button class="btn ghost" data-m="${akt}" data-h="${i}">${esc(HJ[i].namn)}<span class="sub">KP ${rh(i).kp}/${R.maxKP(bygg(i))}</span></button>`).join("");
  const tillbaka = `<button class="btn ghost small" data-m="huvud">← Tillbaka</button>`;
  const m = strid.meny;
  if(m==="vapen") return `<p>Vilket vapen?</p><div class="val">${h.vapen.map(v=>`<button class="btn ghost" data-m="valt-vapen" data-v="${esc(v)}">${esc(v)}<span class="sub">${esc(R.VAPEN[v].fard)} ${R.fardVarde(h,R.VAPEN[v].fard)} · ${esc(R.VAPEN[v].skada)}${R.VAPEN[v].bonus?"+"+R.VAPEN[v].bonus:""}</span></button>`).join("")}${tillbaka}</div>`;
  if(m==="anfall-mal") return `<p>Anfalla vem med ${esc(x.valtVapen)}?</p><div class="val">${mal("gor-anfall")}${tillbaka}</div>`;
  if(m==="besv") return `<p>Vilken besvärjelse? (2 VP, slå Magi ${R.fardVarde(h,"Magi")})</p><div class="val">${h.besv.map(b=>`<button class="btn ghost" data-m="valt-besv" data-b="${esc(b)}" ${x.vp<2?"disabled":""}>${esc(b)}<span class="sub">${esc(R.BESV[b].text)}</span></button>`).join("")}${tillbaka}</div>`;
  if(m==="besv-mal"){ const b=R.BESV[strid.valtBesv]; return `<p>${esc(strid.valtBesv)} – på vem?</p><div class="val">${b.mal==="hjalte"?hjaltar("gor-besv",i=>!rh(i).dod):mal("gor-besv")}${tillbaka}</div>`; }
  if(m==="formaga-mal"){ const t=h.formaga.typ; return `<p>${esc(h.formaga.namn)} – på vem?</p><div class="val">${t==="extraHandling"?hjaltar("gor-formaga",i=>i!==id&&kanAgera(i)):t==="terapi"?hjaltar("gor-formaga",i=>kanAgera(i)):mal("gor-formaga")}${tillbaka}</div>`; }
  if(m==="sak"){ const egna=x.saker.map(s=>({s,k:"egen"})), gem=st.packning.filter(s=>R.SAKER[s]).map(s=>({s,k:"packning"}));
    const alla=[...egna,...gem], sedda=new Set();
    return `<p>Använda vad?</p><div class="val">${alla.filter(o=>{const k=o.s+o.k; if(sedda.has(k)) return false; sedda.add(k); return true;}).map(o=>`<button class="btn ghost" data-m="valt-sak" data-s="${esc(o.s)}" data-k="${o.k}">${esc(o.s)}<span class="sub">${o.k==="egen"?"Egen":"Packningen"} · ${esc(R.SAKER[o.s].text)}</span></button>`).join("")||"<p class='muted'>Inget att använda.</p>"}${tillbaka}</div>`; }
  if(m==="sak-mal"){ return `<p>${esc(strid.valdSak.s)} – till vem?</p><div class="val">${hjaltar("gor-sak",i=>!rh(i).dod&&!rh(i).stabil)}${tillbaka}</div>`; }
  if(m==="hjalp") return `<p>Rädda vem? (slå Läkekonst ${fv(h,"Läkekonst")})</p><div class="val">${hjaltar("gor-hjalp",i=>rh(i).doende||rh(i).stabil)}${tillbaka}</div>`;
  // huvudmeny
  const doende = r_party().some(i=>rh(i).doende||rh(i).stabil);
  const harSak = x.saker.length || st.packning.some(s=>R.SAKER[s]);
  return `${x.nackdelNasta?`<p class="small" style="color:#ff9d92">Nackdel på nästa slag.</p>`:""}${x.fordelNasta?`<p class="small" style="color:var(--moss)">Fördel på nästa slag.</p>`:""}
  <div class="val">
    <button class="btn" data-m="vapen">Anfalla<span class="sub">Med ett av ${h.vapen.length} vapen</span></button>
    ${h.besv.length?`<button class="btn" data-m="besv" ${x.vp<2?"disabled":""}>Besvärjelse<span class="sub">${h.besv.length} besvärjelser · ${x.vp} VP kvar</span></button>`:""}
    <button class="btn" data-m="formaga" ${x.vp<3?"disabled":""}>${esc(h.formaga.namn)}<span class="sub">3 VP · ${esc(h.formaga.text)}</span></button>
    <button class="btn ghost" data-m="sak" ${harSak?"":"disabled"}>Använda något</button>
    ${doende?`<button class="btn ghost" data-m="hjalp">Rädda en döende vän<span class="sub">Läkekonst ${fv(h,"Läkekonst")}</span></button>`:""}
    <button class="btn ghost small" data-m="fly">${strid.boss?"Fly (avbryter uppdraget)":"Fly"}</button>
  </div>`;
}
const r_party = () => st.run.party;
function stridMeny(m, d){
  const id = strid.aktiv, h = bygg(id), x = rh(id);
  const fi = d.f!=null ? strid.fiender[Number(d.f)] : null;
  if(m==="huvud"||m==="vapen"||m==="besv"||m==="sak"||m==="hjalp"){ strid.meny=m; return ritaStrid(); }
  if(m==="valt-vapen"){ x.valtVapen=d.v; strid.meny="anfall-mal"; return ritaStrid(); }
  if(m==="gor-anfall") return hjalteHandling(()=>anfall(id, x.valtVapen, fi));
  if(m==="valt-besv"){ strid.valtBesv=d.b; const b=R.BESV[d.b]; if(b.mal==="ingen"||b.mal==="allaFiender") return hjalteHandling(()=>kasta(id,d.b,null)); strid.meny="besv-mal"; return ritaStrid(); }
  if(m==="gor-besv") return hjalteHandling(()=>kasta(id, strid.valtBesv, fi || d.h));
  if(m==="formaga"){ const t=h.formaga.typ; const behoverMal=["bonusAnfall","dubbelAnfall","lonnmord","stoppaFiende","overtala","fickstold","eldsvard","chansning","extraHandling","terapi","kaos"].includes(t);
    if(!behoverMal) return hjalteHandling(()=>formaga(id,null)); strid.meny="formaga-mal"; return ritaStrid(); }
  if(m==="gor-formaga") return hjalteHandling(()=>formaga(id, fi || d.h));
  if(m==="valt-sak"){ strid.valdSak={s:d.s,k:d.k}; const e=R.SAKER[d.s].effekt; if(e==="kp"||e==="vp"){ strid.meny="sak-mal"; return ritaStrid(); } return hjalteHandling(()=>anvandSak(id,d.s,d.k)); }
  if(m==="gor-sak") return hjalteHandling(()=>anvandSak(id, strid.valdSak.s, strid.valdSak.k, d.h));
  if(m==="gor-hjalp") return hjalteHandling(()=>hjalpDoende(id, d.h));
  if(m==="fly"){ if(!confirm(strid.boss?"Fly från slutstriden? Uppdraget misslyckas.":"Fly från striden? Varje fiende får ett sista anfall mot er, och ni får inget byte.")) return;
    return hjalteHandling(()=>{ strid.flydde=true; logga("Sällskapet flyr!","fel"); if(!strid.boss) strid.fiender.filter(f=>f.kp>0).forEach(f=>{ const mal=R.valj(st.run.party.filter(kanAgera)); if(!mal) return; const sk = f.typ==="folk"?R.slaTarning(f.skada):R.slaTarning((R.valj(f.attacker).skada)||"T4"); skadaHjalte(mal, sk, f.namn); }); }); }
}

// ---------- Slutet på en strid ----------
function avslutaStrid(slut){
  const r = st.run, steg = r.steg[r.i];
  const s = strid; strid = null;
  st.run.party.forEach(id=>{ const x=rh(id); x.tempRust=0; x.vapenbonus=null; x.raseri=false; x.undvikAllt=false; x.stoppad=0; x.agerat=false; x.maktig=false; });
  if(slut==="seger"){
    let g = 0; s.fiender.forEach(f=>{ if(!f.lamnat) g += f.boss ? 0 : (f.folk ? R.t(10) : R.t(4)); });
    r.guld += g;
    // Döende vänner efter striden: den bästa läkaren försöker
    r.party.filter(id=>rh(id).doende).forEach(id=>{
      const lakare = r.party.filter(kanAgera).sort((a,b)=>fv(bygg(b),"Läkekonst")-fv(bygg(a),"Läkekonst"))[0];
      if(lakare){ const sl=hjalteSlag(lakare,"Läkekonst"); logga(slagText(`${HJ[lakare].namn} tar hand om ${HJ[id].namn}`,sl),slagCls(sl)); if(sl.lyckat){ lakaHjalte(id,R.t(6)); return; } }
      dodsslagDirekt(id);
    });
    r.party.forEach(id=>{ const x=rh(id); if(x.stabil){ x.stabil=false; x.kp=1; logga(`${HJ[id].namn} vaknar upp med 1 KP.`,"info"); } });
    if(steg.rumtyp==="boss" && r.utforska){ steg.klar=true; spara(); return kapitelKlart(); }
    if(steg.rumtyp==="boss"){ steg.klar=true; steg.utfallText=`${r.q.foremal ? "Ni har fått tag på: "+r.q.foremal+". " : ""}${V.FIENDER[r.q.boss].namn} är besegrad!`; spara(); return avslutaRun(true); }
    steg.klar = true; steg.utfallText = `Segern är er!${g?` Ni plundrar fienderna på ${g} guld.`:""}${steg.efterStrid?" ":""}`;
    spara(); return ritaRun();
  }
  if(slut==="flydde"){
    if(s.boss){ return avslutaRun(false, s.teleport?"Sällskapet teleporterade sig bort från slutstriden.":"Sällskapet flydde från slutstriden.", true); }
    r.party.forEach(id=>{ const x=rh(id); if(x.doende) dodsslagDirekt(id); if(x.stabil){ x.stabil=false; x.kp=1; } });
    steg.klar = true; steg.utfallText = s.teleport ? "I en rökpuff försvinner sällskapet och dyker upp en bit längre bort. Fienderna kliar sig i huvudet." : "Ni flyr hals över huvud och tar er vidare. Inget byte den här gången.";
    if(kollaAllaNere()) return; spara(); return ritaRun();
  }
  // förlust
  r.party.forEach(id=>{ const x=rh(id); if(x.doende) dodsslagDirekt(id); });
  avslutaRun(false, "Hela sällskapet har fallit i striden.");
}

// ================= ÄVENTYRETS SLUT =================
function avslutaRun(lyckat, orsak, gavUpp){
  const r = st.run; if(!r || r.utfall) return;
  const rad = [];
  // de som fortfarande ligger döende
  r.party.forEach(id=>{ const x=rh(id); if(x.doende) dodsslagDirekt(id); if(x.stabil){ x.stabil=false; x.kp=Math.max(1,x.kp); } });
  const doda = r.party.filter(id=>rh(id).dod), levande = r.party.filter(id=>!rh(id).dod);
  let beloning = 0, avgift = 0;
  if(r.utforska){ if(!lyckat) uppdateraRekord(); rad.push(`Ni tog er igenom ${r.djup} rum och nådde kapitel ${r.kapitel} i ${r.q.plats}.`); if(r.nyttRekord) rad.push(`🏆 Nytt rekord för ${r.q.plats}!`); }
  if(lyckat && r.utforska){
    beloning = kapitelBonus(r.kapitel);
    st.kassa += r.guld + beloning;
    levande.forEach(id=>{ hs(id).segrar=(hs(id).segrar||0)+1; const x=rh(id); const kand = x.anvanda.filter(f=>!x.markerade.includes(f)); if(kand.length) x.markerade.push(R.valj(kand)); });
  } else if(lyckat){
    beloning = r.q.beloning; if(r.q.givare==="Lansor"){ avgift = Math.round(beloning*0.1); }
    st.kassa += beloning - avgift + r.guld;
    st.avklarade[r.q.id] = (st.avklarade[r.q.id]||0)+1;
    levande.forEach(id=>{ hs(id).segrar=(hs(id).segrar||0)+1; const x=rh(id); const kand = x.anvanda.filter(f=>!x.markerade.includes(f)); if(kand.length) x.markerade.push(R.valj(kand)); });
  } else if(!gavUpp){
    rad.push(`Allt ni hittat under äventyret (${r.guld} guld) går förlorat.`);
  } else { st.kassa += r.guld; }
  // Förbättringsslag
  const forb = {};
  levande.forEach(id=>{ const x=rh(id), h=bygg(id); forb[id]=[];
    x.markerade.forEach(f=>{ const v=R.fardVarde(h,f), s=R.t(20); const upp = s>v && v<18; forb[id].push({f,v,s,upp}); if(upp){ const b=hs(id).bonus=hs(id).bonus||{}; b[f]=(b[f]||0)+1; } }); });
  doda.forEach(id=>{ hs(id).dod=true; });
  st.sallskap = st.sallskap.filter(id=>!hs(id).dod);
  const namn = r.party.map(id=>HJ[id].namn).join(", ");
  if(r.utforska) kronika(`${namn} utforskade ${r.q.plats} och nådde kapitel ${r.kapitel} (${r.djup} rum). ${lyckat?`De gick hem med ${r.guld+beloning} guld.`:(orsak||"")}${doda.length?` ${doda.map(i=>HJ[i].namn).join(" och ")} dog.`:""}`);
  else kronika(lyckat ? `${namn} klarade ”${r.q.titel}” och fick ${beloning-avgift} guld${r.guld?` + ${r.guld} i byte`:""}.${doda.length?` ${doda.map(i=>HJ[i].namn).join(" och ")} dog på vägen.`:""}`
    : `${namn} misslyckades med ”${r.q.titel}”. ${orsak||""}${doda.length?` ${doda.map(i=>HJ[i].namn).join(" och ")} dog.`:""}`);
  if(r.ornar){ kronika(`Stör-örnen anföll Potus Rövhatt ${r.ornar} ${r.ornar===1?"gång":"gånger"} under ”${r.q.titel}”.`); rad.push(`🦅 Stör-örnen anföll Potus ${r.ornar} ${r.ornar===1?"gång":"gånger"}.`); }
  r.utfall = {lyckat, orsak, beloning, avgift, byte:r.guld, doda, forb, rad};
  spara(); vy="run"; ritaRun();
}
function ritaSlut(){
  const r = st.run, u = r.utfall;
  app.innerHTML = `
    <div class="tv"><canvas id="scen" class="px"></canvas><span class="badge">${r.utforska?esc(r.q.plats):u.lyckat?"Uppdraget klart!":"Misslyckat"}</span></div>
    <section class="card quest"><h2>${r.utforska?(u.lyckat?"Hemma med bytet!":"Det gick inte som planerat"):u.lyckat?"Seger!":"Det gick inte som planerat"}</h2>
      ${r.utforska?(u.lyckat?`<p>Byte: <b>${u.byte} guld</b>. Kapitelbonus för ${r.kapitel} ${r.kapitel===1?"kapitel":"kapitel"}: <b>${u.beloning} guld</b>. Totalt <b>${u.byte+u.beloning} guld</b> till kassan.</p>`:`<p class="berattelse">${esc(u.orsak||"")}</p>`):u.lyckat?`<p class="berattelse">${esc(r.q.svar)}</p>
        <p>Belöning: <b>${u.beloning} guld</b>${u.avgift?` (Lansor tar ${u.avgift} guld i avgift)`:""}. Byte under resan: <b>${u.byte} guld</b>.</p>`
      :`<p class="berattelse">${esc(u.orsak||"")}</p>`}
      ${u.rad.map(x=>`<p>${esc(x)}</p>`).join("")}
      ${u.doda.length?`<div><h3>Till poolen i Miami</h3>${u.doda.map(id=>`<p><b>${esc(HJ[id].namn)}</b>: ${esc(R.valj(V.EFTERRIKET))}</p>`).join("")}</div>`:""}
      <div><h3>Förbättringsslag</h3><p class="small muted">Färdigheter som fick en Drake eller Demon (och en till för varje överlevande vid seger) slås om: T20 över nuvärdet = +1.</p>
      ${Object.entries(u.forb).map(([id,l])=>`<p><b>${esc(HJ[id].namn)}:</b> ${l.length?l.map(x=>`${esc(x.f)} (${x.v}) slog ${x.s} → ${x.upp?`<span style="color:var(--moss)">+1!</span>`:"ingen ändring"}`).join(", "):"inget att slå för"}</p>`).join("")||"<p class='small'>Ingen överlevde för att förbättras.</p>"}</div>
      <button class="btn" data-a="klar">Tillbaka till värdshuset</button>
    </section>${loggHtml()}`;
  G.ritaScen($("#scen"), r.q.miljo, [], 99, u.lyckat?"skatt":null, scenHjaltar());
  scrollaLogg();
  app.onclick = e => { const b=e.target.closest("[data-a]"); if(b && b.dataset.a==="klar"){ st.run=null; spara(); ga("hem"); } };
}

// ================= Reglerna och inställningar =================
$("#btn-regler").onclick = () => modal(`<h2>Så funkar reglerna</h2>
  <p><b>Slag:</b> Slå en T20. Lika med eller under färdighetsvärdet = lyckat. En <b>1:a är en Drake</b> (perfekt – t.ex. dubbel vapenskada) och en <b>20 är en Demon</b> (katastrof – fummel eller magisk olycka).</p>
  <p><b>Fördel / nackdel:</b> Slå två T20 och ta det bästa (fördel) eller sämsta (nackdel). Ankor har fördel på Simma.</p>
  <p><b>Färdigheter:</b> Grundchansen är 3–7 beroende på egenskapen. Tränade färdigheter har dubbla grundchansen. Värden som nämns i podden är behållna.</p>
  <p><b>Strid:</b> Varje runda dras initiativkort 1–10. Lägst börjar. Varje hjälte har <b>en handling</b> per runda: anfalla, kasta en besvärjelse, använda sin förmåga, en sak eller rädda en vän. Blir man anfallen innan man agerat kan man <b>undvika</b> eller <b>parera</b> – men då går handlingen åt.</p>
  <p><b>Monster</b> träffar alltid – man måste undvika eller parera. <b>Människolika fiender</b> slår för att träffa.</p>
  <p><b>Skada:</b> Vapnets tärning + skadebonus (STY för närstrid, SMI för avstånd, 13+ = T4, 17+ = T6) minus rustning.</p>
  <p><b>KP och VP:</b> Kroppspoäng = FYS, viljepoäng = PSY. Besvärjelser kostar 2 VP och kräver ett lyckat Magi-slag. Signaturförmågor kostar 3 VP.</p>
  <p><b>Döende:</b> Vid 0 KP faller hjälten. Varje runda slås ett dödsslag mot FYS: tre lyckade = stabil, tre misslyckade = död. En Drake = upp på benen igen. Vänner kan rädda med Läkekonst eller Hela.</p>
  <p><b>Förbättring:</b> Färdigheter som fått en Drake eller Demon markeras. Efter äventyret slår man T20 – över nuvärdet = +1.</p>
  <p class="small muted">Reglerna är förenklade och skrivna med egna ord, inspirerade av Drakar och Demoner. Inte en officiell produkt.</p>
  <button class="btn ghost" onclick="document.getElementById('modal').hidden=true">Stäng</button>`);

$("#btn-inst").onclick = () => modal(`<h2>Inställningar</h2>
  <h3>Spara till GitHub</h3>
  <p class="small muted">Spelet sparas alltid i webbläsaren. Fyller du i det här sparas det också i filen <b>sparfil.json</b> i ditt GitHub-repo, så att du kan spela vidare på en annan enhet.</p>
  <label class="f">Repo (ägare/namn)<input type="text" id="g-repo" value="${esc(gh.repo)}" placeholder="tomas-m-andersson/fantasyvarlden"></label>
  <label class="f">Gren<input type="text" id="g-branch" value="${esc(gh.branch)}"></label>
  <label class="f">Fil<input type="text" id="g-path" value="${esc(gh.path)}"></label>
  <label class="f">Token (fine-grained, Contents: Read and write)<input type="password" id="g-token" value="${esc(gh.token)}" autocomplete="off"></label>
  <label class="row small"><input type="checkbox" id="g-auto" ${gh.auto?"checked":""}> Spara automatiskt</label>
  <div class="row"><button class="btn" id="g-spara">Spara inställningarna och hämta</button><button class="btn ghost" id="g-nu">Spara till GitHub nu</button></div>
  <h3>Spelet</h3>
  <label class="f">Svårighetsgrad<select id="svar">${Object.entries(SVAR).map(([k,v])=>`<option value="${k}" ${svar()===k?"selected":""}>${esc(v.namn)}</option>`).join("")}</select></label>
  <p class="small muted">Påverkar hur många fiender som dyker upp och hur tåliga de är. Gäller från nästa strid.</p>
  <div class="row"><button class="btn red small" id="nollstall">Börja om från början</button></div>
  <p class="small muted">Senast sparat: ${st.tid?esc(datum(new Date(st.tid))):"aldrig"}</p>
  <button class="btn ghost" id="i-stang">Stäng</button>`, inner=>{
  const las = () => { gh = {repo:$("#g-repo").value.trim(),branch:$("#g-branch").value.trim()||"main",path:$("#g-path").value.trim()||"sparfil.json",token:$("#g-token").value.trim(),auto:$("#g-auto").checked}; save(GKEY,gh); };
  $("#g-spara").onclick = async () => { las(); stangModal(); await ghLadda(false); };
  $("#g-nu").onclick = async () => { las(); setSync("Sparar till GitHub…"); try{ await ghPut(); setSync("Sparat till GitHub "+datum().slice(11),"ok"); }catch(e){ setSync(e.message,"fel"); alert(e.message); } };
  $("#i-stang").onclick = stangModal;
  $("#svar").onchange = e => { st.svarighet = e.target.value; spara(); };
  $("#nollstall").onclick = () => {
    if(!confirm("Vill du verkligen börja om? Alla hjältars framsteg, döda hjältar, guld och krönikan försvinner.")) return;
    if(!confirm("Är du helt säker? Det här går inte att ångra – och sparfilen på GitHub skrivs också över.")) return;
    const t = Date.now(); st = nyttSpel(); st.reset = t; strid=null; spara(); stangModal(); ga("hem");
  };
});

// ================= Start =================
if(st.run && !st.run.utfall){ vy="hem"; }
ritaOm();
ghLadda(false);
window.__fv = {get st(){return st}, get strid(){return strid}}; // för felsökning
})();
