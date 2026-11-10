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
function spara(){ if(st.run && st.run.arena) return;   // inget i arenan sparas
  st.tid = Date.now(); save(KEY,st); planeraSynk(); }

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

// ================= Inställningar som bara gäller den här enheten =================
const AKEY = "fantasyvarlden-alternativ";
let alt = Object.assign({tempo:"steg", tarning:"sjalv"}, load(AKEY, {}));

// ================= Navigering =================
let vy = "hem";
let strid = null;          // pågående strid (sparas inte – laddar man om börjar striden om)
let aktivtVal = null;      // väntande val i ett rum (t.ex. "vem slår?")
function ritaOm(){
  if(vy==="tavla") return ritaTavla();
  if(vy==="run" && st.run) return ritaRun();
  if(vy==="basar") return ritaBasar();
  if(vy==="platser") return ritaPlatser();
  if(vy==="arena") return ritaArena();
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
function scenHjaltar(aktiv, orn){ return st.run ? st.run.party.map(id=>{ const x=rh(id); return {id, ruta:figur(id), nere:x.dod||x.doende||x.stabil||x.kp<=0, aktiv:aktiv===id, orn: id==="potus" ? orn : undefined}; }).filter(h=>!rh(h.id).dod) : []; }
// Stör-örnen (npc/storn.png): rutor där örnen tittar åt vänster, så att den kan störtdyka in från höger mot Potus
const ORN_RUTOR = [0,2,3,4,6,8,11,13,16,17,18,19,20,21,22,23,24,26,27,28,32,33,34,35,40,41,42,43,44,45,46,47,48,49,56,57,58,59,60,62,63];
// Spelar örnens anfall i TV:n: rita(t) ritar om scenen med örnen på väg (t går från 0 till 1), rita(null) utan örn
function spelaOrn(rita){
  const start = performance.now(), langd = 1600;
  const steg = nu => { const t = Math.min(1, (nu-start)/langd); try{ rita(t); }catch(e){} if(t<1) requestAnimationFrame(steg); else { try{ rita(null); }catch(e){} } };
  requestAnimationFrame(steg);
}
function fyllPortratt(root){
  fyllIkoner(root); fyllIsak(root);
  root.querySelectorAll("canvas[data-p]").forEach(c=>{ G.ritaPortratt(c, HJ[c.dataset.p], c.dataset.dod==="1", c.dataset.ruta!=null?Number(c.dataset.ruta):figur(c.dataset.p)); });
}
function modal(html, onOpen){
  const m=$("#modal"), i=$("#modal-inner"); i.innerHTML=html; m.hidden=false;
  fyllPortratt(i); if(onOpen) onOpen(i);
}
function stangModal(){ $("#modal").hidden=true; $("#modal-inner").innerHTML=""; }
$("#modal").addEventListener("click",e=>{ if(e.target.id==="modal") stangModal(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape" && !$("#modal").hidden && !$("#modal").dataset.las) stangModal(); });

// ================= TÄRNINGSRUTAN – spelaren slår hjältarnas tärningar själv =================
// Spelet räknar ut handlingen som vanligt men spelar in hjältarnas T20-slag. Sedan visas varje slag i en ruta där
// spelaren trycker "Slå" – tärningen rullar och landar på slaget – innan resultatet syns.
let tarningLas = null;
async function medTarningar(fn){
  R.inspelning = [];
  let ut, lista;
  try{ ut = fn(); } finally { lista = R.inspelning || []; R.inspelning = null; }
  lista = lista.filter(s=>s.vem);                       // bara hjältarnas slag
  if(lista.length && (alt.tarning||"sjalv")==="sjalv") await visaTarningar(lista);
  return ut;
}
const EGNAMN = Object.fromEntries(R.EGENSKAPER);
function visaTarningar(lista){
  let klar; tarningLas = new Promise(r=>klar=r);
  let el = document.getElementById("tarning");
  if(!el){ el = document.createElement("div"); el.id = "tarning"; document.body.appendChild(el); }
  let i = 0, auto = false;
  const stang = () => { el.hidden = true; el.innerHTML = ""; const k = klar; tarningLas = null; k(); };
  const visa = () => {
    const s = lista[i], tva = s.b != null, fard = EGNAMN[s.fard] || s.fard;
    el.innerHTML = `<div class="tr-kort">
      <p class="tr-vem">${esc(s.vem)}</p><h2>slår ${esc(fard)}</h2>
      <p class="tr-mal">Behöver <b>${s.varde}</b> eller lägre</p>
      ${tva?`<p class="small muted">${s.lage==="fordel"?"Fördel: två tärningar – den lägsta räknas":"Nackdel: två tärningar – den högsta räknas"}</p>`:""}
      <div class="tr-tarningar">${(tva?[s.a,s.b]:[s.a]).map((_,k)=>`<div class="d20" id="d20-${k}"><span>?</span></div>`).join("")}</div>
      <p class="tr-utfall" id="tr-utfall">&nbsp;</p>
      <button class="btn" id="tr-sla">🎲 Slå ${tva?"tärningarna":"tärningen"}</button>
      ${lista.length>1?`<p class="small muted">Slag ${i+1} av ${lista.length}</p>`:""}
      ${lista.length-i>1?`<button class="btn ghost small" id="tr-auto">Slå resten automatiskt</button>`:""}
    </div>`;
    el.hidden = false;
    el.querySelector("#tr-sla").onclick = rulla;
    const ab = el.querySelector("#tr-auto"); if(ab) ab.onclick = () => { auto = true; rulla(); };
    if(auto) rulla();
  };
  const rulla = () => {
    const s = lista[i], tva = s.b != null, varden = tva ? [s.a, s.b] : [s.a];
    const knapp = el.querySelector("#tr-sla"); if(!knapp || knapp.disabled) return; knapp.disabled = true;
    const ab = el.querySelector("#tr-auto"); if(ab) ab.remove();
    const tar = varden.map((_,k)=>el.querySelector("#d20-"+k));
    tar.forEach(t=>t.classList.add("rullar"));
    let n = 0; const steg = auto ? 4 : 12;
    const iv = setInterval(()=>{
      n++;
      tar.forEach(t=>{ t.firstChild.textContent = 1 + Math.floor(Math.random()*20); });
      if(n < steg) return;
      clearInterval(iv);
      tar.forEach((t,k)=>{ t.classList.remove("rullar"); t.firstChild.textContent = varden[k];
        if(tva && varden[k] !== s.slag) t.classList.add("bort"); else t.classList.add(s.drake?"drake":s.demon?"demon":s.lyckat?"ok":"miss"); });
      const u = el.querySelector("#tr-utfall");
      u.className = "tr-utfall " + (s.drake?"drake":s.demon?"demon":s.lyckat?"ok":"miss");
      u.textContent = s.drake ? "NATURLIGT 1 – perfekt!" : s.demon ? "NATURLIGT 20 – katastrof!" : s.lyckat ? "LYCKAT!" : "MISSLYCKAT";
      knapp.textContent = i < lista.length-1 ? "Nästa slag ▶" : "Fortsätt ▶"; knapp.disabled = false;
      const vidare = () => { clearTimeout(tid); i++; if(i < lista.length) visa(); else stang(); };
      knapp.onclick = vidare;
      const tid = setTimeout(vidare, auto ? 500 : 1800);
    }, 60);
  };
  visa();
  return tarningLas;
}

// ================= IKONER FÖR SAKER (npc/saker_grotta.png = g, npc/saker_by.png = b) =================
const IKON = {
  // "i:" = npc/ikoner.png (ikonarket), "j:" = npc/ikoner2.png (ikonark 2), "g:" = npc/saker_grotta.png, "b:" = npc/saker_by.png
  "Läkedryck":"i:39","Läkande ört":"i:22","Grönfräken":"i:23","Gravstensalm":"i:24","Kråkmossa":"i:19","Hirtonbuske":"i:20","Tokfrans":"i:21",
  "Krigarfasa":"g:50","Flaska vin":"v:3","Vin":"v:3","Rött té":"b:34","Äppelcider":"b:33","Lite bröd":"i:55","En limpa bröd":"i:55",
  "Bröd (fyra kilo)":"i:55","Torkat kött":"i:56","Torkade fikon":"b:4","Rep":"i:16","Karta":"i:58","Karta över Grador och Liane":"i:58",
  "Trollformelbok":"i:44","Diktsamling":"g:13","Anteckningsblock":"g:13","Tärningsspel":"g:6","Elddon":"g:4",
  "Kort svärd":"i:0","Långsvärd":"i:1","Rostigt svärd":"i:2","Kroksabel":"i:3","Vantim":"i:4","Nannheim":"i:5","Gorgor":"i:6",
  "Dolk":"i:49","Gulddolk":"g:21","Dolk av draktand":"g:41","Kastknivar":"g:41","Strypsnara":"i:18","Piska":"i:17",
  "Handyxa":"i:51","Yxa":"i:51","Stridsyxa":"i:50","Stridsgissel":"g:34","Morgonstjärna":"g:10","Stridshammare":"i:52","Träpinne":"i:10","Träpåk":"i:11",
  "Spjut":"i:7","Kort spjut":"i:8","Långt spjut":"i:9","Kort båge":"i:12","Pilbåge":"i:13","Armborst":"i:14","Slunga":"i:15",
  "Ringbrynja":"g:35","Läderrustning":"i:33","Läderväst":"i:33","Plåtrustning":"i:34","Sköld":"i:30","guld":"g:19",
  "Stav":"j:0","Trollstav":"j:1","Trästav":"j:2","Knytnävar":"j:3","Tygtunika":"j:4","Ulvskinn":"j:5","Fjällpansar (ett ben)":"j:6",
  "Hästen Häst":"j:7","Skalp från en tornerspelare":"j:8","Visselpipa":"j:9","Tjurhorn":"j:10"
};
// Uppdragens föremål
const UPPDRAG_IKON = {skold:"g:63",patricia:"g:52",tarragon:"g:62",hostvakt:"i:32",slasby:"g:24",rattor:"i:25",svartalf:"i:26",broncos:"j:13",barnen:"j:11",gripagg:"j:12","doda-sjon":"i:54",krusbar:"i:28",gojan:"g:19"};
const IKONARK = {g:"saker_grotta", b:"saker_by", i:"ikoner", j:"ikoner2", v:"vinflaska"};
function ikonHtml(namn, extraKlass){ const k = IKON[namn] || namn; if(!k || !/^[gbijv]:\d+$/.test(k)) return "";
  const [a,r] = k.split(":"); return `<canvas class="px ikon ${extraKlass||""}" data-ikon="${IKONARK[a]}:${r}" aria-hidden="true"></canvas>`; }
function fyllIkoner(root){ (root||document).querySelectorAll("canvas[data-ikon]").forEach(c=>{ const [ark,r]=c.dataset.ikon.split(":"); G.ritaIkon(c, ark, Number(r)); }); }
const guldHtml = n => `${ikonHtml("guld")}${n} guld`;

// ================= HEMMET =================
function ritaHem(){
  const levande = window.HJALTAR.filter(h=>!ar(h.id)), doda = window.HJALTAR.filter(h=>ar(h.id));
  const party = st.sallskap.filter(id=>!ar(id));
  let html = `<div class="tv"><canvas id="vardshus" class="px"></canvas><span class="badge">Värdshuset</span></div>`;
  if(st.run){
    html += `<section class="card quest"><h2>Pågående äventyr</h2><p><b>${esc(st.run.q.titel)}</b> – ${esc(st.run.q.plats)}</p>
      <div class="row"><button class="btn" data-a="fortsatt">Fortsätt äventyret</button><button class="btn ghost small" data-a="ge-upp">Ge upp</button></div></section>`;
  }
  html += `<section class="card"><div class="spelledare">${isakHtml(new Date().getDate())}<div><span class="small muted">Spelledaren Isak Jansson</span><p class="berattelse" style="margin:2px 0 0">${esc(ISAK.halsning[(new Date().getDate()+new Date().getHours())%ISAK.halsning.length])}</p></div></div></section>`;
  html += `<section class="card"><div class="row" style="justify-content:space-between"><h2>Sällskapet</h2><span class="kassa">${guldHtml(st.kassa)}</span></div>
    <div class="slots">${[0,1,2,3].map(i=>{ const id=party[i]; return id?`<div class="slot fylld ${flytt.id===id?"lyft":""}" role="button" tabindex="0" data-a="visa" data-id="${id}" data-i="${i}"><canvas class="px" data-p="${id}"></canvas><span class="lbl">${esc(HJ[id].namn)}</span></div>`:`<div class="slot" data-i="${i}">Tom plats</div>`}).join("")}</div>
    <p class="small muted">${flytt.id?`<b>Tryck på den plats ${esc(HJ[flytt.id].namn)} ska flytta till</b> (eller på hen själv för att ångra).`:`<b>Håll in</b> på en hjälte här ovanför och dra hen till en annan plats för att byta ordning i TV:n. <b>Håll in</b> på en hjälte i galleriet för att ta med eller ta bort hen. Välj 1–4 hjältar.`} ${party.length?"":"Tips: fyra hjältar klarar mer, men en ensam hjälte får all ära."}</p>
    <div class="row"><button class="btn ghost small" data-a="slumpa" ${st.run?"disabled":""}>🎲 Slumpa fram ett sällskap</button></div>
    <div class="row hemval">
      <button class="btn" data-a="tavla" ${!party.length||st.run?"disabled":""}>Till uppdragstavlan<span class="sub">Lansors förmedling</span></button>
      <button class="btn" data-a="platser" ${!party.length||st.run?"disabled":""}>Utforska en plats<span class="sub">Ingen berättelse – se hur djupt ni kommer</span></button>
      <button class="btn" data-a="arena">Gladiatorgroparna<span class="sub">Möt vem som helst – utan risk</span></button>
      <button class="btn ghost" data-a="basar">Basaren<span class="sub">Köp drycker och utrustning</span></button>
    </div>
    <div class="small muted packning">Packning: ${st.packning.length?packningHtml(st.packning):"tom"}</div>
  </section>`;
  html += `<section class="card"><h2>Hjältegalleriet</h2><p class="small muted"><b>Håll in</b> på en hjälte för att ta med hen i sällskapet eller ta bort hen. <b>Tryck</b> kort för att se hjältebladet.</p>
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
  G.ritaVardshus($("#vardshus"), party.map(id=>({id, ruta:figur(id)})));
  if(doda.length) G.ritaPool($("#pool"), doda.map(h=>({id:h.id, ruta:figur(h.id)})));
  app.onclick = e => {
    if(langtryck.gjort){ langtryck.gjort = false; return; }
    if(flytt.id){   // en hjälte är upplyft – nästa tryck på en plats flyttar hen dit
      const sl = e.target.closest(".slots .slot"); const fran = flytt.fran; flytt.id = null;
      if(sl && +sl.dataset.i !== fran) return bytPlats(fran, +sl.dataset.i);
      return ritaOmKvar();
    }
    const b = e.target.closest("[data-a]"); if(!b) return;
    const a = b.dataset.a, id = b.dataset.id;
    if(a==="visa") visaHjalte(id);
    if(a==="valj") return valjHjalte(id, b);
    if(a==="slumpa") return slumpaSallskap();
    if(a==="tavla"){ jensLedig = null; ga("tavla"); }
    if(a==="basar") ga("basar");
    if(a==="platser") ga("platser");
    if(a==="arena") ga("arena");
    if(a==="fortsatt") ga("run");
    if(a==="ge-upp") geUpp();
  };
}
// Snabbval: håll in på en hjälte (ca en halv sekund) för att lägga till eller ta bort ur sällskapet
const langtryck = {tid:null, gjort:false, x:0, y:0, el:null};
function slutaLangtryck(){ clearTimeout(langtryck.tid); langtryck.tid = null; if(langtryck.el) langtryck.el.classList.remove("trycker"); langtryck.el = null; }
// I sällskapet: håll in på en hjälte och dra hen till en annan plats (eller släpp och tryck på platsen) för att byta ordning
const flytt = {id:null, fran:-1, spoke:null, drar:false};
function ritaOmKvar(){ const y = window.scrollY; ritaOm(); window.scrollTo({top:y, behavior:"instant"}); }
function bytPlats(a, b){
  const p = st.sallskap.filter(x=>!ar(x)); if(a<0 || a>=p.length) return ritaOmKvar();
  if(b >= p.length){ const [id] = p.splice(a,1); p.push(id); }   // till en tom plats = sist
  else [p[a], p[b]] = [p[b], p[a]];
  st.sallskap = p; flytt.id = null; spara(); ritaOmKvar();
}
function slotUnder(x, y){ const el = document.elementFromPoint(x, y); return el && el.closest(".slots .slot"); }
function startaFlytt(el, x, y){
  flytt.id = el.dataset.id; flytt.fran = +el.dataset.i; flytt.drar = true;
  el.classList.add("lyft");
  const r = el.getBoundingClientRect(), c = document.createElement("canvas"), k = el.querySelector("canvas");
  c.width = k.width; c.height = k.height; c.getContext("2d").drawImage(k, 0, 0);
  c.className = "px flyttspoke"; c.style.width = c.style.height = r.width + "px"; document.body.appendChild(c);
  flytt.spoke = c; flyttaSpoke(x, y);
}
function flyttaSpoke(x, y){
  if(!flytt.spoke) return; const w = flytt.spoke.offsetWidth;
  flytt.spoke.style.left = (x - w/2) + "px"; flytt.spoke.style.top = (y - w/2) + "px";
  document.querySelectorAll(".slots .slot.mal").forEach(s=>s.classList.remove("mal"));
  const sl = slotUnder(x, y); if(sl && +sl.dataset.i !== flytt.fran) sl.classList.add("mal");
}
function slappFlytt(x, y){
  flytt.drar = false; if(flytt.spoke){ flytt.spoke.remove(); flytt.spoke = null; }
  document.querySelectorAll(".slots .slot.mal").forEach(s=>s.classList.remove("mal"));
  const sl = x==null ? null : slotUnder(x, y);
  if(sl && +sl.dataset.i !== flytt.fran) return bytPlats(flytt.fran, +sl.dataset.i);
  ritaOmKvar();   // släppt på samma plats: hjälten är kvar upplyft och väntar på ett tryck
}
app.addEventListener("pointerdown", e => {
  langtryck.gjort = false;
  if(vy!=="hem" || st.run || flytt.id) return;
  const el = e.target.closest(".hcard:not(.dod), .slot.fylld"); if(!el) return;
  slutaLangtryck(); langtryck.el = el; langtryck.x = e.clientX; langtryck.y = e.clientY;
  el.classList.add("trycker");
  langtryck.tid = setTimeout(()=>{ const id = el.dataset.id; slutaLangtryck(); langtryck.gjort = true;
    try{ navigator.vibrate && navigator.vibrate(30); }catch(_){}
    if(el.classList.contains("slot")) startaFlytt(el, langtryck.x, langtryck.y);
    else valjHjalte(id); }, 480);
});
app.addEventListener("pointermove", e => {
  if(flytt.drar){ e.preventDefault(); return flyttaSpoke(e.clientX, e.clientY); }
  if(langtryck.tid && Math.hypot(e.clientX-langtryck.x, e.clientY-langtryck.y) > 10) slutaLangtryck();
});
document.addEventListener("pointerup", e => { if(flytt.drar) slappFlytt(e.clientX, e.clientY); });
document.addEventListener("pointercancel", () => { if(flytt.drar) slappFlytt(null, null); });
["pointerup","pointercancel","pointerleave"].forEach(t=>app.addEventListener(t, ()=>{ if(langtryck.tid) slutaLangtryck(); }));
app.addEventListener("contextmenu", e => { if(vy==="hem" && e.target.closest(".hcard, .slot.fylld")) e.preventDefault(); });
function valjHjalte(id, knapp){
  if(st.run || ar(id)) return;
  const party = st.sallskap.filter(x=>!ar(x));
  if(party.includes(id)) st.sallskap = st.sallskap.filter(x=>x!==id);
  else if(party.length >= 4){ const k = knapp || document.querySelector(`.hcard[data-id="${id}"]`); if(k){ k.classList.remove("skaka"); void k.offsetWidth; k.classList.add("skaka"); } return visaFullt(); }
  else st.sallskap = [...party, id];
  spara(); const y = window.scrollY; ritaOm(); window.scrollTo({top:y, behavior:"instant"});
}
// Slumpa fram ett nytt sällskap med 1–4 levande hjältar
function slumpaSallskap(){
  if(st.run) return;
  const levande = window.HJALTAR.filter(h=>!ar(h.id)).map(h=>h.id);
  if(!levande.length) return;
  modal(`<h2>🎲 Slumpa fram ett sällskap</h2>
    <p class="muted">Hur många hjältar ska vara med? Det nuvarande sällskapet byts ut mot slumpade hjältar.</p>
    <div class="row slumpval">${[1,2,3,4].map(n=>`<button class="btn" data-n="${n}" ${n>levande.length?"disabled":""}>${n}</button>`).join("")}</div>
    <button class="btn ghost small" data-n="avbryt">Avbryt</button>`, inner=>inner.onclick=e=>{
      const b = e.target.closest("button"); if(!b || b.disabled) return;
      if(b.dataset.n==="avbryt") return stangModal();
      const n = +b.dataset.n, pott = [...levande];
      for(let i=pott.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pott[i],pott[j]]=[pott[j],pott[i]]; }
      st.sallskap = pott.slice(0,n); spara(); stangModal(); ritaOm();
      window.scrollTo({top:0, behavior:"smooth"});   // visa det nya sällskapet i värdshuset
    });
}
function visaFullt(){
  let t = $("#fulltnotis"); if(!t){ t = document.createElement("div"); t.id = "fulltnotis"; t.className = "notis"; document.body.appendChild(t); }
  t.textContent = "Sällskapet är fullt (max fyra). Ta bort någon först."; t.classList.add("syns");
  clearTimeout(visaFullt.tid); visaFullt.tid = setTimeout(()=>t.classList.remove("syns"), 2200);
}
function hkort(h, dod){
  const s = st.hj[h.id]||{}, vald = st.sallskap.includes(h.id);
  return `<div class="hcard ${vald?"vald":""} ${dod?"dod":""}" role="button" tabindex="0" data-a="visa" data-id="${h.id}">
    <canvas class="px portr" data-p="${h.id}" ${dod?'data-dod="1"':""}></canvas>
    <span><span class="namn">${esc(h.namn)}</span><br><span class="info">${esc(h.folk)} · ${esc(h.yrke)}</span>
    ${s.segrar?`<br><span class="tag gold">${s.segrar} ${s.segrar===1?"seger":"segrar"}</span>`:""}${vald?` <span class="tag gold">I sällskapet</span>`:""}</span></div>`;
}
function packningHtml(arr){ const c={}; arr.forEach(x=>c[x]=(c[x]||0)+1); return Object.entries(c).map(([k,n])=>`<span class="sakchip">${ikonHtml(k)}${esc(k)}${n>1?` ×${n}`:""}</span>`).join(""); }
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
    <div><h3>Vapen</h3><table class="stat">${h.vapen.map(v=>{const w=R.VAPEN[v]||{};return `<tr><td>${ikonHtml(v)}${esc(v)} <span class="muted small">(${esc(w.fard)}, ${esc(w.skada)}${w.bonus?"+"+w.bonus:""}${w.avstand?", avstånd":""})</span></td><td>${R.fardVarde(h,w.fard)}</td></tr>`}).join("")}
      <tr><td>Skadebonus närstrid / avstånd</td><td>${sb||"–"} / ${sba||"–"}</td></tr>
      <tr><td>${h.rustning?ikonHtml(h.rustning):""}Rustning: ${esc(h.rustning||"ingen")}${h.skold?" + sköld":""}</td><td>${R.rustning(h)}</td></tr></table></div>
    <div><h3>Färdigheter</h3><table class="stat">${R.allaFard(h).filter(f=>f.tranad).sort((a,b)=>b.varde-a.varde).map(f=>`<tr><td>${esc(f.namn)} <span class="muted small">(${f.eg})${s.bonus&&s.bonus[f.namn]?" · förbättrad +"+s.bonus[f.namn]:""}</span></td><td>${f.varde}</td></tr>`).join("")}
      <tr><td colspan="2" class="small notis">Övriga färdigheter har grundchansen (3–7 beroende på egenskapen).</td></tr></table></div>
    ${h.besv.length?`<div><h3>Besvärjelser <span class="small muted">(2 VP, slå Magi ${R.fardVarde(h,"Magi")})</span></h3><div class="col small">${h.besv.map(b=>`<div><b>${esc(b)}</b> – ${esc((R.BESV[b]||{}).text)}</div>`).join("")}</div></div>`:""}
    <div><h3>Signaturförmåga <span class="small muted">(3 VP)</span></h3><p><b>${esc(h.formaga.namn)}</b> – ${esc(h.formaga.text)}</p></div>
    ${h.saker.length?`<div class="small packning"><b style="margin-right:8px">Utrustning:</b>${packningHtml(h.saker)}</div>`:""}
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
  app.innerHTML = `<div class="tv"><canvas id="basarscen" class="px"></canvas><span class="badge">Basaren</span></div>
  <section class="card"><div class="row" style="justify-content:space-between"><span class="row" style="gap:8px;flex-wrap:nowrap"><canvas class="px saljare" data-npc="kopman:22"></canvas><h2>Basaren</h2></span><span class="kassa">${guldHtml(st.kassa)}</span></div>
    <p class="muted small">Förbrukningssaker hamnar i sällskapets gemensamma packning och kan användas av vem som helst i strid.</p>
    <div class="col">${BASAR_SAKER.map(([n,p])=>`<div class="vara"><span>${ikonHtml(n)}<b>${esc(n)}</b><br><span class="small muted">${esc(R.SAKER[n].text)}</span></span><button class="btn small" data-kop="${esc(n)}" data-p="${p}" ${st.kassa<p?"disabled":""}>${p} guld</button></div>`).join("")}</div></section>
  <section class="card"><div class="tv" style="margin-bottom:10px"><canvas id="tescen" class="px"></canvas><span class="badge">Tehandeln</span></div><div class="row" style="gap:8px;flex-wrap:nowrap"><canvas class="px saljare" data-npc="stad:36"></canvas><h2>Tehandeln</h2></div><p class="muted small">Rött té, 2 guld koppen. Det gör inte mycket (1 KP), men det är gott. Teet hamnar i packningen.</p>
    <label class="f">Vem köper?<select id="tevem">${window.HJALTAR.filter(h=>!ar(h.id)).sort((a,b)=>(party.includes(b.id)-party.includes(a.id))).map(h=>`<option value="${h.id}">${esc(h.namn)}</option>`).join("")}</select></label>
    <div class="row"><button class="btn small" data-te="1" ${st.kassa<TE_PRIS?"disabled":""}>Köp rött té – ${TE_PRIS} guld</button></div>
    ${basarMeddelande?`<p class="small" style="color:#ff9d92">${esc(basarMeddelande)}</p>`:""}</section>
  <section class="card"><div class="tv" style="margin-bottom:10px"><canvas id="smedscen" class="px"></canvas><span class="badge">Smedjan</span></div><div class="row" style="gap:8px;flex-wrap:nowrap"><canvas class="px saljare" data-npc="by:12"></canvas><h2>Smeden</h2></div><p class="muted small">Utrustning köps till en hjälte i sällskapet och behålls mellan äventyren.</p>
    ${party.length?`<label class="f">Till vem?<select id="vem">${party.map(id=>`<option value="${id}">${esc(HJ[id].namn)}</option>`).join("")}</select></label>`:`<p class="small">Välj ett sällskap först.</p>`}
    <div class="col">${BASAR_UTR.map(([n,p,t])=>`<div class="vara"><span>${ikonHtml(n)}<b>${esc(n)}</b><br><span class="small muted">${t==="rustning"?"Rustning "+R.RUSTNING[n]:esc(R.VAPEN[n].fard+", "+R.VAPEN[n].skada)}</span></span><button class="btn small" data-utr="${esc(n)}" data-t="${t}" data-p="${p}" ${st.kassa<p||!party.length?"disabled":""}>${p} guld</button></div>`).join("")}</div></section>
  <button class="btn ghost" data-a="hem">Tillbaka till värdshuset</button>`;
  fyllIkoner(app);
  app.querySelectorAll("canvas[data-npc]").forEach(c=>{ const [ark,ruta]=c.dataset.npc.split(":"); G.ritaNpc(c, ark, Number(ruta), true); });
  // TV:arna: sällskapet till vänster och säljaren till höger – köpmannen på basaren, teförsäljaren i tehandeln och smeden i smedjan
  const sallskap = () => party.map(id=>({id, ruta:figur(id)}));
  G.ritaScen($("#basarscen"), "basar", [], 1, null, sallskap(), [{ark:"kopman", ruta:22, x:112, fot:87}]);
  G.ritaScen($("#tescen"), "tehandeln", [], 1, null, sallskap(), [{ark:"stad", ruta:36, x:116}]);
  G.ritaScen($("#smedscen"), "smedjan", [], 1, null, sallskap(), [{ark:"by", ruta:12, x:116}]);
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
// Uppdragsgivarnas figurark i npc/ (8×8 rutor). Familjen von Borge: rad 1 är fadern som står för familjen.
const GIVARE = {"Porsch Wilson":"porsch","Barden Baror":"baror","Mandor Marvolt":"mandor","Gitte von Gittemberg":"gitte","Lansor":"lansor",
  "Familjen von Borge":"vonborge","Slasbys församling":"hannes","Eva":"eva","Hövding Atlas":"atlas","Clark":"clark",
  "Borgmästaren i Hagbo":"hagbo","Professor Proppeteus":"proppeteus","Mona":"mona"};
// Arken tittar åt höger och speglas så att figuren vänder sig mot sällskapet – utom Eva, vars ark redan tittar åt vänster
// Uppdrag vars slutscen sker i ett annat rum än värdshuset (målad bild i bakgrunder/, ikon = var föremålet ligger)
const SLUTRUM = { gojan:{bild:"monas_gaststuga", ikon:{x:77, y:55}} };
const GIVARE_VANSTER = new Set(["givare_eva"]);
function givare(namn, fro){ const ark = "givare_" + (GIVARE[namn] || "generisk");
  return {ark, ruta: ark==="givare_vonborge" ? (fro||0) % 8 : (fro||0) % 64, spegel: !GIVARE_VANSTER.has(ark)}; }
function fyllTavla(){
  const ids = V.UPPDRAG.map(u=>u.id);
  st.tavla = st.tavla.filter(id=>ids.includes(id));
  while(st.tavla.length<3){ const l = R.blanda(ids.filter(id=>!st.tavla.includes(id))); if(!l.length) break; st.tavla.push(l[0]); }
}
function ritaTavla(){
  fyllTavla(); spara();
  const party = st.sallskap.filter(id=>!ar(id));
  app.innerHTML = `<section class="card"><div class="row" style="gap:8px;flex-wrap:nowrap"><canvas class="px saljare" data-npc="givare_lansor:0"></canvas><h2>Uppdragstavlan</h2></div><p class="muted">Lansor – svart påvehatt, Fu Manchu-mustasch, pipskägg – pekar med en lång nagel på lapparna. Han tar 10 % av alla belöningar för uppdrag han förmedlar själv.</p></section>
    ${st.tavla.map(id=>{const u=V.UPPDRAG.find(x=>x.id===id); const n=st.avklarade[id]||0; return `<section class="card quest">
      <div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><span class="row" style="gap:8px;flex-wrap:nowrap;align-items:center">${(g=>`<canvas class="px saljare" data-npc="${g.ark}:${g.ruta}"></canvas>`)(givare(u.givare, u.id.length*7))}<h2>${esc(u.titel)}</h2></span><span class="tag gold" style="flex:none;white-space:nowrap">${u.beloning} guld</span></div>
      <p class="small muted">Uppdragsgivare: ${esc(u.givare)} · ${esc(u.plats)}, ${esc(u.land)} · ${esc(V.MILJO[u.miljo].namn)} · ${u.rum} rum${n?` · <span class="tag">Klarat ${n} gång${n>1?"er":""}</span>`:""}</p>
      <p>${esc(u.text)}</p>
      ${u.foremal?`<p class="small foremal">${ikonHtml(UPPDRAG_IKON[u.id])}<span><b>Mål:</b> ${esc(u.foremal)}</span></p>`:""}
      <div class="row"><button class="btn" data-anta="${u.id}" ${!party.length?"disabled":""}>Anta uppdraget</button></div></section>`}).join("")}
    <div class="row"><button class="btn ghost" data-a="nya">Nya lappar</button><button class="btn ghost" data-a="hem">Tillbaka</button></div>`;
  app.querySelectorAll("canvas[data-npc]").forEach(c=>{ const [ark,ruta]=c.dataset.npc.split(":"); G.ritaNpc(c, ark, Number(ruta), true); });
  app.onclick = e => {
    const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.a==="hem") return ga("hem");
    if(b.dataset.a==="nya"){ st.tavla=[]; fyllTavla(); spara(); return ritaTavla(); }
    if(b.dataset.anta) valjResa(b.dataset.anta);
  };
  fyllIkoner(app);
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
  if(q.sovande) sovandeBulk(steg, party.length);
  st.run = {q, party, steg, i:0, h:nyaHjaltar(party), guld:0, logg:[], utfall:null, start:datum()};
  if(q.sovande){ st.run.bulk = 0; }
  st.tavla = st.tavla.filter(x=>x!==qid);
  storOrn(1/12);
  logga(`Sällskapet antar uppdraget ”${q.titel}” av ${q.givare}.`,"info");
  if(medJens){ logga(`🐴 Bakhuvudet Jens tar ${JENS_PRIS} guld, klättrar upp på kuskbocken och kör iväg utan att säga ett ord.`,"info"); kronika(`${party.map(i=>HJ[i].namn).join(", ")} åkte med Bakhuvudet Jens mot ${q.plats} för ${JENS_PRIS} guld.`); }
  spara(); ga("run");
}
// ---------- Gojans gladiatorgrop: den nedsövda resen Bulk ----------
// Bulk ligger nedsövd på en kärra. I några av rummen rör han på sig, och då måste någon söva honom igen.
// Varje misslyckat försök (run.bulk) gör honom piggare – och starkare – när han vaknar i gropen.
const BULK_ROR = [
  "Kärran knakar. Bulk mumlar något om sin mamma och vänder sig på sidan, så att hela kärran lutar.",
  "Bulk snarkar så högt att sanden darrar. Sedan slutar han snarka. Det är värre.",
  "Ena ögat på Bulk glider upp en springa och tittar rakt på er.",
  "Bulk sträcker på sig i sömnen och kedjorna rasslar. En av dem går av med en smäll.",
  "Bulk smackar och frågar halvsovande om det är frukost snart.",
  "Kärrans hjul fastnar i sanden. Bulk rycker till och knyter näven."
];
const BULK_KP = [0.7, 0.9, 1.1, 1.3];   // hur stark Bulk är i gropen beroende på hur mycket han hunnit vakna
const BULK_GROP = [
  "Ni rullar in kärran i Gojans gladiatorgrop. Publiken jublar. Bulk slår upp ögonen, yr och dåsig – han vet knappt var han är. Men han ser er, och han minns er.",
  "Ni rullar in kärran i Gojans gladiatorgrop. Publiken jublar. Bulk sätter sig upp, gnuggar ögonen och ser sig omkring. Sedan får han syn på er.",
  "Ni rullar in kärran i Gojans gladiatorgrop. Bulk är redan vaken. Han kliver av kärran, sträcker på sig och knäcker nacken. Publiken älskar det.",
  "Kärran hinner knappt in i gropen förrän Bulk sliter sig loss. Han är klarvaken och fullkomligt rasande. Gojan ropar från läktaren att han inte betalar för döda säljare."
];
function sovandeBulk(steg, antal){
  const rum = R.blanda(steg.filter(s=>s.typ==="rum" && s.rumtyp!=="boss")).slice(0,3);
  rum.forEach(s=>{ s.bulk = true; s.bulkText = R.valj(BULK_ROR); });
  const boss = steg.find(s=>s.rumtyp==="boss");
  if(boss) boss.fiender = [boss.fiender[0]];   // i gropen är det bara Bulk mot sällskapet
  // Efter slutstriden: Garvard väntar utanför portarna och vill ha sin skuld – med ränta
  steg.push({typ:"rum", rumtyp:"garvard", text:"", fiender:[], ranta:R.t(6)*10, fro:R.t(1000)});
}
const SKULD = 150;
function garvardHtml(steg){
  return `<p class="berattelse">Utanför de stora portarna står Garvard och väntar, lutad mot en tunna. Han slår ut med armarna. ”Där är ni ju! Och med en tung börs, ser jag. Skulden, mina vänner: ${SKULD} guld. Plus ränta, förstås – ${steg.ranta} guld. Det blir ${SKULD+steg.ranta} guld.”</p>
    <div class="val"><button class="btn" data-a="garvard" data-g="betala">Betala<span class="sub">${SKULD+steg.ranta} guld</span></button>
    <button class="btn" data-a="garvard" data-g="Bluffa">Bluffa om räntan<span class="sub">Lyckas: ingen ränta · Misslyckas: dubbel ränta</span></button>
    <button class="btn" data-a="garvard" data-g="Övertala">Pruta på räntan<span class="sub">Övertala · Lyckas: halva räntan</span></button></div>`;
}
function garvardSlag(steg, val, id){
  const r = st.run; let ranta = steg.ranta, text;
  if(val==="betala") text = "Ni räknar upp pengarna. Garvard stoppar dem i en börs med sitt eget namn på och klappar er på axeln. ”Trevligt att göra affärer med er.”";
  else { const s = hjalteSlag(id, val); logga(slagText(HJ[id].namn, s), slagCls(s));
    if(val==="Bluffa"){ if(s.lyckat){ ranta = 0; text = `${HJ[id].namn} påstår att räntan redan är betald – till Garvards kusin i Batik. Garvard kliar sig i huvudet och nöjer sig med skulden.`; }
      else { ranta *= 2; text = `${HJ[id].namn} försöker bluffa, men Garvard skrattar högt. ”Försök inte lura en mästare. Nu blir det dubbel ränta.”`; } }
    else { if(s.lyckat){ ranta = Math.round(ranta/2); text = `${HJ[id].namn} pratar om gammal vänskap och alla gånger ni hjälpt honom. Garvard suckar och går med på halva räntan.`; }
      else text = `${HJ[id].namn} försöker pruta, men Garvard skakar på huvudet. ”Ränta är ränta. Det är matematik, inte känslor.”`; } }
  r.skuldRanta = ranta;
  return klart(steg, `${text} Garvard tar ${SKULD+ranta} guld: ${SKULD} i skuld och ${ranta} i ränta.`);
}
function bulkHtml(steg){
  return `<p class="berattelse">${esc(steg.text)}</p><h3>Bulk rör på sig!</h3><p>${esc(steg.bulkText)}</p>
    <div class="val"><button class="btn" data-a="bulk" data-f="Läkekonst">Ge honom mer sömndryck<span class="sub">En hjälte slår Läkekonst</span></button>
    <button class="btn" data-a="bulk" data-f="Uppträda">Sjung en vaggvisa<span class="sub">En hjälte slår Uppträda</span></button></div>`;
}
function bulkSlag(steg, fard, id){
  const r = st.run, s = hjalteSlag(id, fard); logga(slagText(HJ[id].namn, s), slagCls(s));
  if(s.lyckat) logga(fard==="Läkekonst" ? `${HJ[id].namn} droppar mer sömndryck i munnen på Bulk. Han smackar nöjt och somnar om.` : `${HJ[id].namn} sjunger en vaggvisa. Bulk somnar om med ett lyckligt leende.`, "ok");
  else { r.bulk += s.demon ? 2 : 1; logga(fard==="Läkekonst" ? `${HJ[id].namn} spiller ut halva flaskan. Bulk hostar och blir lite piggare.` : `${HJ[id].namn} sjunger så falskt att Bulk vaknar till. Han blir lite piggare – och lite argare.`, "fel"); }
  steg.bulkKlar = true; spara(); ritaRun();
}
// Bygger ett antal rum som slutar med en boss. extra = fler fiender (används när man utforskar djupare).
// Bygger en rumsbeskrivning av tre delar och undviker delar som redan använts i samma äventyr
function rumText(miljo, anvanda){
  const D = V.RUMDELAR && V.RUMDELAR[miljo]; if(!D) return R.valj(V.RUMTEXT[miljo]);
  const ny = lista => { const l = lista.filter(x=>!anvanda.has(x)); const v = R.valj(l.length ? l : lista); anvanda.add(v); return v; };
  let t = `${ny(D.plats)}. ${ny(D.syn)}.`;
  if(Math.random() < .8) t += ` ${ny(D.sinne)}.`;
  if(V.RUMEXTRA && Math.random() < .12) t += ` ${ny(V.RUMEXTRA)}`;
  return t;
}
// Malbecs gruvor (uppdraget och platsen) har egna målade gruvbakgrunder i stället för grottans.
// Bossrummet blir kultisternas altarsal. Bara bilden byts – rumstexter och fiender är fortfarande grottans.
// Platser med egna målade bakgrunder (bara bilden byts, inte rumstexter eller fiender)
const PLATS_BILD = {"Kras-Kras kloaker":"kras_kras", "Skogen vid riksväg 40":"riksvag40", "Batik":"batik", "Östra öknen":"ostra_oknen", "Malbecks gruvor":"gruva", "Malbecs gruvor":"gruva", "Vesselberget":"vesselberget", "Bududuoar":"bududuoar",
  "Krusbärsberget":"krusbarsberget", "Döda sjön":"doda_sjon", "Tunnlarna under Mårdgård":"svartalftunnlar", "Östra bergen":"drakgrottor",
  "Marmoracs kyrkogård":"marmoracs_kyrkogard", "Harpybergen":"harpybergen", "Mt. Kraknor":"mt_kraknor", "Skogen norr om Slasby":"slasbyskogen",
  "Gollenskogen":"gollenskogen", "Gravskogen":"gravskogen"};
// Egna bossrum: när bossen själv står i rummet byts bakgrunden (gäller både uppdrag och utforskning)
const BOSS_BILD = {drake:"boss_drake", grip:"boss_grip", harpydrottning:"boss_harpyor", orchhovding:"boss_orch", svartalfkung:"boss_svartalf",
  rattkung:"boss_rattkung", general:"boss_general", gravvaktare:"boss_gravvaktare", dendroidmoder:"boss_dendroidmoder", rovarhovding:"boss_rovarhovding", rese:"arena_sten", kieslawski:"boss_kieslawski"};
// Bossrum som hör till en plats i stället för en viss boss
const BOSS_PLATS = {"Döda sjön":"boss_dodasjon"};
// Bakgrund och frö för ett steg: strider som börjar på resan (t.ex. bakhåll) stannar kvar på vägen
function stegScen(steg){ const r = st.run;
  if(steg && steg.typ==="resa") return [resMiljo(r.q.miljo, r.i), steg.fro || r.i*977+13];
  return [scenMiljo(r.q.miljo, steg), steg && steg.fro || 7]; }
function scenMiljo(m, steg){
  const r = st.run, p = r && PLATS_BILD[r.q.plats];
  if(r && steg && steg.rumtyp==="boss" && BOSS_PLATS[r.q.plats]) return BOSS_PLATS[r.q.plats];
  if(steg && steg.rumtyp==="boss" && steg.fiender && BOSS_BILD[steg.fiender[0]]) return BOSS_BILD[steg.fiender[0]];
  if(!p && m==="skog" && steg && steg.rumtyp==="skatt") return "hygge";
  // Svartborgen: bilden väljs efter vilken del av fängelset rumstexten beskriver
  if(!p && m==="fangelse" && steg && steg.text){
    const t = steg.text.split(".")[0];
    if(/cell/i.test(t)) return "fangelse_celler";
    if(/gård/i.test(t)) return "fangelse_gard";
    if(/vaktrum/i.test(t)) return "fangelse_vakt";
    if(/valv|under jord|underjordisk/i.test(t)) return "fangelse_valv";
    if(/mur/i.test(t)) return "fangelse_mur";
  }
  // öknens rum med egna bilder: bilden väljs efter vad rumstexten beskriver
  if(!p && m==="oken" && steg && steg.text){
    if(/vindslipade stenar/i.test(steg.text)) return "oken_stenfalt";
    if(/\boas/i.test(steg.text)) return "oken_oas";
  }   // skatten i skogen står på ett hygge
  if(!p) return m;
  if(p==="gruva" && steg && steg.rumtyp==="boss") return "gruva_kult";
  return p;
}
function byggRum(miljo, antalRum, antal, boss, extra){
  const rumMoten = R.blanda(V.MOTEN.filter(m=>m.rum)), ut = [];
  const anvanda = (st.run && st.run.anvandaText) ? new Set(st.run.anvandaText) : new Set();
  const typer = R.blanda(["strid","strid","falla","hinder","skatt","mote","strid","vila","hinder","skatt"]).slice(0,antalRum-1);
  if(!typer.includes("strid")) typer[0]="strid";
  typer.forEach(t=>{
    const rum = {typ:"rum",rumtyp:t,text:rumText(miljo, anvanda),fro:Math.floor(Math.random()*1e9)};
    if(t==="strid") rum.fiender = slumpaFiender(miljo, antal + extra, false);
    if(t==="falla") rum.falla = R.valj(V.FALLOR[miljo]);
    if(t==="hinder"){ const l=V.HINDER.filter(x=>x.miljo.includes(miljo)); rum.hinder = R.valj(l.length?l:V.HINDER); }
    if(t==="mote") rum.mote = (rumMoten.shift()||V.MOTEN.find(m=>m.rum)).id;
    ut.push(rum);
  });
  ut.push({typ:"rum",rumtyp:"boss",text:"",fro:Math.floor(Math.random()*1e9),fiender:[boss, ...slumpaFiender(miljo, Math.min(3, antalHantlangare(antal) + extra), true)]});
  ut.anvanda = [...anvanda];
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
      <canvas class="px" data-scen="${PLATS_BILD[p.namn]||p.miljo}"></canvas>
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
  st.run.anvandaText = st.run.steg.anvanda || [];
  storOrn(1/12);
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
  const nya = byggRum(r.q.miljo, KAPITEL_RUM, r.party.length, r.q.boss, extraFiender(r.kapitel));
  r.anvandaText = nya.anvanda; r.steg.push(...nya);
  r.i++; r.kapStart = r.i;
  logga(`Sällskapet går djupare in i ${r.q.plats}. Kapitel ${r.kapitel}.`,"info");
  storOrn(1/12); spara(); ritaRun(); window.scrollTo({top:0,behavior:"smooth"});
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
function logga(text, cls=""){ if(!st.run) return; st.run.logg.push({text,cls}); if(st.run.logg.length>200) st.run.logg.splice(0,st.run.logg.length-200); if(strid) strid.logg.push({text,cls});
  // Spelledaren Isak kommenterar naturliga 1:or och 20:or (ungefär varannan gång, så att det inte blir tjatigt)
  if(/ anfaller /.test(text)) return;                         // bara hjältarnas egna slag
  if(/NATURLIGT 1!/.test(text) && Math.random()<.6) logga("🎲 Spelledaren Isak: " + R.valj(ISAK.nat1), "d");
  else if(/NATURLIGT 20!/.test(text) && Math.random()<.6) logga("🎲 Spelledaren Isak: " + R.valj(ISAK.nat20), "dm");
}
// ---------- Spelledaren och berättaren Isak Jansson ----------
// Isak berättar rummen, hälsar i värdshuset och kommenterar tärningsslag. Han påverkar inte reglerna.
const ISAK = {
  halsning: [
    "Välkomna till Rollspelsklubben. Slå er ner. Om ni törs."
  ],
  nat1: ["Naturligt 1! Det där kommer att berättas om länge.", "Perfekt! Jag hade inte ens förberett mig på att ni skulle lyckas så bra.",
         "En etta! Beskriv gärna hur snyggt det där såg ut.", "Där satt den. Tärningsgudarna ler i dag."],
  nat20: ["Naturligt 20. Aj. Det här kommer att svida.", "En tjugo… Jag ska försöka vara snäll. Nej, förresten.",
          "Det där var ingen bra dag för tärningen. Eller för er.", "Tjugo. Någon antecknar det här till nästa avsnitt."]
};
const isakHtml = (nr, liten) => `<canvas class="px saljare isak${liten?" liten":""}" data-isak="${nr||0}" aria-hidden="true"></canvas>`;
function fyllIsak(root){ (root||document).querySelectorAll("canvas[data-isak]").forEach(c=>G.ritaIsak(c, Number(c.dataset.isak))); }
const rh = id => st.run.h[id];
const kanAgera = id => { const x=rh(id); return x && !x.dod && !x.doende && !x.stabil && x.kp>0; };
const vakna = () => st.run.party.filter(kanAgera);

// Ett slag av en hjälte – med fördel/nackdel-flaggor och markering vid naturligt 1/20.
function hjalteSlag(id, fard, lage){
  const h = bygg(id), x = rh(id);
  let l = lage || null;
  if(x.fordelNasta && x.nackdelNasta){ x.fordelNasta=false; x.nackdelNasta=false; }
  if(x.fordelNasta){ l = l==="nackdel"?null:"fordel"; x.fordelNasta=false; }
  if(x.nackdelNasta){ l = l==="fordel"?null:"nackdel"; x.nackdelNasta=false; }
  if(fard==="Simma" && h.folk==="Anka") l = l==="nackdel"?null:"fordel";
  const varde = fv(h, fard), s = R.slag(varde, l);
  if(R.FARD[fard]){ if(!x.anvanda.includes(fard)) x.anvanda.push(fard); if((s.drake||s.demon) && !x.markerade.includes(fard)) x.markerade.push(fard); }
  s.fard = fard; s.vem = h.namn; return s;
}
const slagText = (namn, s) => `${namn} slår ${s.fard}${s.lage==="fordel"?" med fördel":s.lage==="nackdel"?" med nackdel":""}: ${s.text}`;
const slagCls = s => s.drake?"d":s.demon?"dm":s.lyckat?"ok":"fel";

function skadaHjalte(id, mangd, kalla, ignoreraRust){
  const x = rh(id), h = bygg(id);
  const rust = ignoreraRust ? 0 : R.rustning(h) + (x.tempRust||0);
  const verklig = Math.max(0, mangd - rust);
  if(x.doende){ x.miss++; logga(`${h.namn} träffas medan hen ligger döende – ett misslyckat dödsslag (${x.miss}/3).`,"fel"); if(x.miss>=3) dor(id); return verklig; }
  x.kp = Math.max(0, x.kp - verklig);
  etikett("h:"+id, "-"+verklig, verklig?"#ff5a4a":"#cfc6b4"); visaEffekt("h:"+id, "traff");
  logga(`${h.namn} tar ${verklig} skada${rust&&mangd>verklig?` (${mangd} − ${rust} rustning)`:""}${kalla?" från "+kalla:""}. KP ${x.kp}/${R.maxKP(h)}.`, verklig?"fel":"info");
  if(x.kp<=0 && !x.dod){ x.doende=true; x.ok=0; x.miss=0; logga(`${h.namn} faller ihop och ligger döende!`,"dm"); if(!strid) dodsslagDirekt(id); }
  return verklig;
}
function lakaHjalte(id, mangd){
  const x=rh(id), h=bygg(id); if(x.dod) return 0;
  const fore = x.kp; x.kp = Math.min(R.maxKP(h), x.kp + mangd);
  if(x.kp>fore){ etikett("h:"+id, "+"+(x.kp-fore), "#7fe07a"); visaEffekt("h:"+id, "hela"); }
  if(x.doende||x.stabil){ x.doende=false; x.stabil=false; x.ok=0; x.miss=0; if(x.kp<=0) x.kp=1; logga(`${h.namn} kommer tillbaka på benen!`,"ok"); }
  return x.kp - fore;
}
function vpAndra(id, d){ const x=rh(id), h=bygg(id); if(x.dod) return 0; const f=x.vp; x.vp=Math.max(0,Math.min(R.maxVP(h), x.vp+d)); return x.vp-f; }
function dor(id){ const x=rh(id); x.dod=true; x.doende=false; x.kp=0; if(st.run && st.run.arena) return logga(`☠ ${HJ[id].namn} är besegrad och bärs ut ur gropen. (Bara på låtsas – ingen hamnar i Efterriket härifrån.)`,"dm"); logga(`☠ ${HJ[id].namn} är död och hamnar i poolen på skyskrapetaket i Miami.`,"dm"); }
function dodsslag(id){
  const x=rh(id), h=bygg(id), s = R.slag(h.e.FYS); s.vem = h.namn; s.fard = "Dödsslag (FYS)";
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
  if(r.arena){ vy="arena"; return ritaArena(); }
  if(r.utforska && r.paus){
    app.innerHTML = `<div class="tv fast"><canvas id="scen" class="px"></canvas><span class="badge">${esc(r.q.plats)} · kapitel ${r.kapitel}</span></div>
      ${partyHtml()}<section class="card quest">${kapitelHtml()}</section>${loggHtml()}`;
    G.ritaScen($("#scen"), scenMiljo(r.q.miljo), [], 77+r.kapitel, "skatt", scenHjaltar());
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
    titel = r.utforska ? `Kapitel ${r.kapitel} · bossen` : `${r.bulk!=null ? r.q.titel : r.q.plats} – slutstriden`;
    innehall = steg.klar ? klarHtml(steg) : r.bulk!=null ? `<p class="berattelse">${esc(BULK_GROP[Math.min(r.bulk,3)])}</p>
      <div class="val"><button class="btn red" data-a="strid">Till strid!</button></div>` : `<p class="berattelse">Ni har nått målet. Här finns ${esc(V.FIENDER[steg.fiender[0]].namn.toLowerCase())}${steg.fiender.length>1?" – och den är inte ensam":""}. Det är nu det gäller.</p>
      <div class="val"><button class="btn red" data-a="strid">Till strid!</button></div>`;
  } else {
    titel = r.utforska ? `Kapitel ${r.kapitel} · rum ${r.djup+1}` : `Rum ${r.i - antalResa() + 1} av ${r.steg.length - antalResa()}`;
    innehall = rumHtml(steg);
  }
  if(steg.fiender && !steg.rutor) steg.rutor = steg.fiender.map(fid=>slumpRuta(fid));
  const fiendeVisning = steg.fiender && !steg.klar ? steg.fiender.map((fid,i)=>({...V.FIENDER[fid],fid,kp:1,ruta:steg.rutor[i]})) : [];
  app.innerHTML = `
    <div class="tv fast"><canvas id="scen" class="px"></canvas><span class="badge">${esc(r.q.titel)}</span></div>
    <div class="prog">${progHtml()}</div>
    ${partyHtml()}
    <section class="card"><div class="spelledare">${isakHtml(r.i)}<div><span class="small muted">Spelledaren Isak berättar</span><h2>${esc(titel)}</h2></div></div>${innehall}</section>
    ${loggHtml()}
    <div class="row"><button class="btn ghost small" data-a="hem">Till värdshuset (pausa)</button></div>`;
  const moteBild = steg.rumtyp==="garvard" ? "utanfor_gropen" : steg.mote && MOTE_BILD[steg.mote];
  const ritaRum = orn => G.ritaScen($("#scen"), moteBild || (steg.typ==="resa"?resMiljo(miljo,r.i):scenMiljo(miljo, steg)), steg.typ==="resa"?[]:fiendeVisning, steg.fro||r.i*977+13, steg.jens?"jens:"+(steg.vagn||0):steg.rumtyp==="falla"?"falla":steg.rumtyp==="skatt"?"skatt":steg.rumtyp==="vila"?"vila":steg.rumtyp==="hinder"?"hinder:"+({"En låst port":"dorr","En brant klippa":"stege","En gåta i sten":"mur","En bred klyfta":"klyfta","Forsande vatten":"vatten"}[steg.hinder.namn]||""):steg.typ==="resa"&&!moteBild?"resa":null, scenHjaltar(null, orn), scenNpcer(steg));
  ritaRum();
  if(r.ornVisa){ const v = r.ornVisa; r.ornVisa = null; spelaOrn(t => ritaRum(t==null ? undefined : {ruta:v.ruta, t, d:v.d})); }
  fyllPortratt(app); scrollaLogg();
  app.onclick = e => { const b=e.target.closest("[data-a]"); if(!b||b.disabled||tarningLas) return; medTarningar(()=>runKlick(b)); };
}
// Mötespersonen (och ett husdjur vid vägkanten när man går till fots) som ska stå i TV:n
const DJUR_RUTOR = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63];
// Möten med egna figurark (npc/*.png, 8×8 rutor) – ersätter figuren i varld.js. antal = hur många som står i bild.
const MOTE_FIGUR = {
  fjass:{ark:"fjass", spegel:false},   // Fjäss-arket tittar redan åt vänster, mot sällskapet
  dunker:{ark:"dunker"},
  proppeteus:{ark:"givare_proppeteus"},   // samma bild som när han är uppdragsgivare
  garvard:{ark:"garvard", rutor:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,48,49,50,51,52,53,54,55,56,57]},
  gycklare:{ark:"gycklare", antal:2, rutor:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,48,49,50,51,52,53,54,55,58,59,60]},   // bara de som vänder sig mot sällskapet
  lik:{ark:"lik", rutor:[24,25,26,27,28,29,30,11,14,15,61,62]}   // de som ligger platt
};
const GARVARD_RUTOR = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,48,49,50,51,52,53,54,55,56,57];   // med öppen hand, pekande eller räknande mynt
// Möten med egna målade bakgrunder
const MOTE_BILD = {orter:"ortgard", dunker:"dunkers_hus"};
function scenNpcer(steg){
  const r = st.run, ut = [];
  if(steg.rumtyp==="garvard") return [{ark:"garvard", ruta:GARVARD_RUTOR[(steg.fro||0) % GARVARD_RUTOR.length]}];
  if(steg.jens) return ut;
  const m = steg.mote ? V.MOTEN.find(x=>x.id===steg.mote) : null;
  const egen = m && MOTE_FIGUR[m.id];
  if(egen){ const fro = (steg.fro || r.i*977+13), l = egen.rutor || Array.from({length:64},(_,i)=>i);
    for(let k=0;k<(egen.antal||1);k++) ut.push({ark:egen.ark, ruta:l[(fro + k*23) % l.length], spegel:egen.spegel});
    return ut; }
  if(m && MOTE_BILD[m.id]){ if(m.npc) ut.push({ark:m.npc.ark, ruta:m.npc.ruta}); return ut; }   // egen bakgrund: inga extra saker eller djur
  if(m && m.npc) ut.push(m.npc.fiende ? {fiende:m.npc.fiende, ruta:G.fiendeRutor(m.npc.fiende)[0]} : {ark:m.npc.ark, ruta:m.npc.ruta});
  if(m && m.id==="kopman"){ ut.push({ark:"saker_by", ruta:32, spegel:false}); return ut; }
  if(m && m.id==="orter"){ ut.push({ark:"saker_by", ruta:56, spegel:false}); return ut; }
  if(steg.typ==="resa" && m && m.npc && m.npc.fiende && m.id!=="garvard"){ const rr = G.fiendeRutor(m.npc.fiende); ut.push({fiende:m.npc.fiende, ruta:rr[1] ?? rr[0]}); return ut; }   // t.ex. bakhållet: fler rövare, inga husdjur
  // husdjur bara bland bönder och vid vägkanten – inte hos gycklare, demoner, professorer och liknande
  if(steg.typ==="resa" && (!m || (m.npc && m.npc.ark==="by"))){ const fro = r.i*977 + r.q.id.length*31 + (r.start||"").length; ut.push({ark:"djur", ruta:DJUR_RUTOR[fro % DJUR_RUTOR.length], spegel:false}); }
  return ut;
}
const antalResa = () => st.run.steg.filter(s=>s.typ==="resa").length;
// Första resdagen går längs landsvägen (vägbilderna), utom mot öknen. Andra dagen närmar man sig målet.
const resMiljo = (m,i) => i===0 ? (m==="oken"?"oken":"vag") : (m==="grotta"||m==="kloak"?"berg":m);
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
  if(steg.bulk && !steg.bulkKlar) return bulkHtml(steg);
  if(steg.rumtyp==="garvard") return garvardHtml(steg);
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
  if(a==="garvard"){ const g=b.dataset.g; return g==="betala" ? garvardSlag(steg, g) : valjVem(g, g==="Bluffa" ? "Vem bluffar?" : "Vem prutar?", id=>garvardSlag(steg, g, id)); }
  if(a==="bulk"){ const f=b.dataset.f; return valjVem(f, "Vem tar hand om Bulk?", id=>bulkSlag(steg, f, id)); }
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
// Varje gång sällskapet kommer till ett nytt steg (1 på 12) och varje stridsrunda (1 på 20) kan en örn dyka ner på honom.
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
  const visa = {ruta: R.valj(ORN_RUTOR), d};
  if(strid){ strid.ornVisa = visa; etikett("h:potus", "-"+d, "#ff5a4a"); } else r.ornVisa = visa;
}
function nastaSteg(){
  const r=st.run; aktivtVal=null;
  if(r.i >= r.steg.length-1){ return avslutaRun(true); }
  if(r.utforska) r.djup++;
  r.i++; storOrn(1/12); spara(); ritaRun(); window.scrollTo({top:0,behavior:"smooth"});
}
function geUpp(){
  if(!confirm("Vill ni verkligen ge upp äventyret? Ni behåller livet men får ingen belöning.")) return;
  avslutaRun(false,"Sällskapet gav upp och vände hem.", true); ga("run");
}

// ================= STRIDEN =================
// Slumpar vilken av fiendens figurvarianter som används
function slumpRuta(fid){ if(String(fid).startsWith("hj:")) return figur(fid.slice(3)); const r = G.fiendeRutor(fid); return r.length ? R.valj(r) : null; }
function startaStrid(fiendeIds, opt){
  opt = opt||{};
  const r = st.run, sr = r.steg[r.i], rutor = (sr && sr.fiender===fiendeIds && sr.rutor) || [];
  const fiender = fiendeIds.map((fid,i)=>{ const f=fiendeData(fid), kp=Math.max(1,Math.round(f.kp*(r.arena?1:SVAR[svar()].kp)*(st.run&&st.run.utforska?kpFaktor(st.run.kapitel):1))); return {i, fid, ruta: rutor[i]!=null ? rutor[i] : slumpRuta(fid), namn:f.namn, sprite:f.sprite, kp, max:kp, rust:f.rust||0, typ:f.typ, anfall:f.anfall, skada:f.skada, skadaFn:f.skadaFn, hjalte:f.hjalte, attacker:f.attacker, boss:!!f.boss, folk:!!f.folk, stor:!!f.stor, liten:!!f.liten, besv:f.besv, stoppad:0, nackdel:false}; });
  if(r.bulk!=null) fiender.forEach(f=>{ if(f.fid==="rese"){ f.kp = f.max = Math.max(1, Math.round(f.kp*BULK_KP[Math.min(r.bulk,3)]) + 4*Math.max(0, r.party.length-2)); } });
  // Numrera likadana fiender
  const c={}; fiender.forEach(f=>{c[f.namn]=(c[f.namn]||0)+1}); const n={}; fiender.forEach(f=>{ if(c[f.namn]>1){ n[f.namn]=(n[f.namn]||0)+1; f.namn+=" "+n[f.namn]; } });
  r.party.forEach(id=>{ const x=rh(id); Object.assign(x,{tempRust:0,vapenbonus:null,gift:x.gift||false,maktig:false,raseri:false,undvikAllt:false,stoppad:0}); });
  strid = {fiender, runda:0, ordning:[], pos:0, logg:[], meny:"huvud", aktiv:null, salamander:0, boss:!!opt.boss, overraskad:!!opt.overraskad, svara:null, forsvar:null, slut:null};
  strid.logg.push({text:r.arena?"⚔ Publiken vrålar. Matchen börjar!":opt.boss?"⚔ Slutstriden börjar!":"⚔ Striden börjar!",cls:"d"});
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
  storOrn(1/20, true);
  if(strid.salamander>0){ const l=strid.fiender.filter(f=>f.kp>0); if(l.length){ const f=R.valj(l); const d=Math.max(0,R.t(8)-f.rust); f.kp=Math.max(0,f.kp-d); visaEffekt("f:"+f.i, "salamander"); logga(`Salamandern bränner ${f.namn} för ${d} skada.`,"ok"); if(f.kp<=0) logga(`${f.namn} faller!`,"d"); } strid.salamander--; }
}
async function stridLoop(){
  while(strid){
    if(tarningLas) await tarningLas;
    if(!strid) return;
    const slut = kollaSlut(); if(slut){ return avslutaStrid(slut); }
    if(strid.pos >= strid.ordning.length){ strid.turStart = strid.logg.length; strid.behallStart = true; nyRunda(); ritaStrid(); await vanta(tempo().paus); continue; }
    const tur = strid.ordning[strid.pos++];
    tur.nu = true;
    if(!strid.behallStart){ strid.turStart = strid.logg.length; } strid.behallStart = false; strid.etiketter = []; strid.effekter = [];
    if(tur.typ==="h"){
      const x = rh(tur.id), namn = HJ[tur.id].namn;
      if(x.dod || x.stabil){ tur.gjord=true; continue; }
      if(x.doende){ strid.aktiv=tur.id; ritaStrid(); await medTarningar(()=>dodsslag(tur.id)); if(!strid) return; tur.gjord=true; await visaResultat(`${namn} kämpar för sitt liv`, tur.id); if(!strid) return; continue; }
      if(x.stoppad>0){ x.stoppad--; logga(`${namn} är ur spel den här rundan.`,"info"); tur.gjord=true; strid.aktiv=tur.id; await visaResultat(`${namn}s tur`, tur.id); if(!strid) return; continue; }
      if(x.agerat && !tur.extra){ logga(`${namn} har redan använt sin handling till att försvara sig.`,"info"); tur.gjord=true; continue; }
      strid.aktiv = tur.id; strid.meny = "huvud"; strid.tur = tur;
      await new Promise(res=>{ strid.svara=res; ritaStrid(); });
      if(!strid) return;
      x.agerat = true; tur.gjord = true;
      await visaResultat(`${namn}s tur`, tur.id);
      if(!strid) return;
      strid.aktiv=null;
    } else {
      const f = strid.fiender[tur.i];
      if(!f || f.kp<=0){ tur.gjord=true; continue; }
      strid.aktiv = "#f"+f.i; f.markerad = true;
      if(f.stoppad>0){ f.stoppad--; logga(`${f.namn} står still och kan inte agera.`,"ok"); tur.gjord=true; await visaResultat(`${f.namn}s tur`, null, f); if(!strid) return; f.markerad=false; continue; }
      ritaStrid(); await vanta(tempo().fore);
      await fiendeAgerar(f);
      if(!strid) return;
      tur.gjord=true;
      await visaResultat(`${f.namn}s tur`, null, f);
      if(!strid) return;
      f.markerad=false; strid.aktiv=null;
    }
  }
}
// ---------- Stridstempo och händelserutan ----------
// "steg" = stanna efter varje tur tills man trycker Fortsätt, "lugnt" = vänta ca 3 s, "snabbt" = som förut.
const TEMPON = {steg:{namn:"Steg för steg (tryck Fortsätt)",fore:700,paus:400}, lugnt:{namn:"Lugnt (automatiskt, ca 3 sekunder)",fore:900,paus:600,vanta:3000}, snabbt:{namn:"Snabbt",fore:450,paus:250,vanta:1000}};
const tempo = () => TEMPON[alt.tempo] || TEMPON.steg;
function etikett(mal, text, farg){ if(strid){ strid.etiketter = strid.etiketter||[]; strid.etiketter.push({mal, text, farg}); } }
// ---------- Effekter för trolldom och strid (npc/effekter.png, en animation per rad) ----------
const r8 = n => [0,1,2,3,4,5,6,7].map(k=>n*8+k);
const EFFEKT = { blixt:r8(0), eld:r8(1), eldklot:r8(2), frost:r8(3), hela:r8(4), skydd:r8(5), rok:r8(6),
  salamander:[56,57,58,57,58,9,19,15], traff:[59,60,61], miss:[62,63,63] };
const BESV_EFFEKT = { "Blixt":"blixt", "Eld":"eld", "Eldklot":"eldklot", "Frost":"frost", "Hela":"hela", "Motståndskraft":"skydd", "Beskyddare":"skydd",
  "Lyft":"rok", "Försegla":"skydd", "Teleportera":"rok", "Förtrolla vapen":"skydd", "Salamander":"salamander", "Kontrollera person":"hela", "Avbild":"rok" };
// Lägger en effekt på en figur ("f:<nr>" eller "h:<id>"). Första effekten per figur och handling gäller,
// så att en besvärjelse inte skrivs över av den vanliga träffgnistan när skadan delas ut.
function visaEffekt(mal, typ){ if(!strid || !EFFEKT[typ]) return; strid.effekter = strid.effekter||[]; if(strid.effekter.some(e=>e.mal===mal)) return; strid.effekter.push({mal, rutor:EFFEKT[typ]}); }
function spelaEffekter(miljo, fro, fiendeVis, hjVis){
  const ef = strid.effekter; strid.effekter = [];
  const id = strid.effektId = (strid.effektId||0) + 1, langd = Math.max(...ef.map(e=>e.rutor.length));
  let k = 0;
  const ruta = (mal) => { const e = ef.find(e=>e.mal===mal); return e && k < e.rutor.length ? e.rutor[k] : null; };
  const steg = () => {
    if(!strid || strid.effektId !== id) return;
    const c = $("#scen"); if(!c) return;
    const f2 = fiendeVis.map(f=>({...f, effekt: ruta("f:"+f.i)})), h2 = hjVis.map(h=>({...h, effekt: ruta("h:"+h.id)}));
    G.ritaScen(c, miljo, f2, fro, null, h2);
    if(k++ < langd) setTimeout(steg, 85);
  };
  steg();
}
async function visaResultat(titel, hjalteId, fiende){
  if(!strid) return;
  const rader = strid.logg.slice(strid.turStart||0).filter(l=>l.text && !/^— Runda \d+ —$/.test(l.text));
  if(!rader.length){ ritaStrid(); return; }
  strid.resultat = {titel, hjalteId, fiende: fiende ? fiende.i : null, rader};
  ritaStrid();
  const t = tempo();
  await new Promise(res=>{ strid.fortsatt = res; if(t.vanta) strid.timer = setTimeout(res, t.vanta); });
  if(!strid) return;
  clearTimeout(strid.timer); strid.resultat = null; strid.fortsatt = null; strid.etiketter = [];
  if(kollaSlut()) return;
  ritaStrid();
}
// Gör en loggrad tydligare: tärningsslag som stora brickor och utfallet i fetstil
function tydligRad(t){
  let h = esc(t);
  h = h.replace(/\[(\d+) \/ (\d+) → (\d+)\] mot (\d+)/g, (m,a,b,c,v)=>`<span class="t20">🎲 ${c}</span> <span class="small muted">(${a} och ${b})</span> mot ${v}`);
  h = h.replace(/\[(\d+)\] mot (\d+)/g, (m,a,v)=>`<span class="t20">🎲 ${a}</span> mot ${v}`);
  h = h.replace(/ – (NATURLIGT 1!|NATURLIGT 20!|lyckat|misslyckat)/g, (m,u)=>` – <b class="utfall">${u==="lyckat"?"LYCKAT":u==="misslyckat"?"MISSLYCKAT":u}</b>`);
  return h;
}
function resultatHtml(){
  const r = strid.resultat, t = tempo();
  return `<div class="resultat"><div class="rubrik">${r.hjalteId?`<canvas class="px" data-p="${r.hjalteId}"></canvas>`:""}<h3>${esc(r.titel)}</h3></div>
    <div class="rader">${r.rader.map(l=>`<p class="${l.cls}">${tydligRad(l.text)}</p>`).join("")}</div>
    <button class="btn" data-a="fortsatt">Fortsätt ▶${t.vanta?`<span class="sub">Fortsätter av sig själv om en stund</span>`:""}</button></div>`;
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
    if(!s.lyckat){ etikett("h:"+mal, "MISS", "#ffffff"); visaEffekt("h:"+mal, "miss"); return; }
    const fs = await fragaForsvar(mal, `${f.namn} träffar ${HJ[mal].namn} (${f.skada}${s.drake?", DRAKE – dubbel skada":""}).`);
    if(fs) return;
    const sl = () => f.skadaFn ? f.skadaFn() : R.slaTarning(f.skada);
    let d = sl(); if(s.drake) d += sl();
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
    strid.forsvar = {id, beskr, parv: barUndvika?null:parv, svar:async (val)=>{
      strid.forsvar=null;
      if(val==="ta"){ logga(`${h.namn} tar smällen.`,"info"); ritaStrid(); return res(false); }
      x.agerat = true;
      const s = await medTarningar(()=> val==="parera" ? hjalteSlag(id, parv.v.fard, h.skold?"fordel":null) : hjalteSlag(id,"Undvika"));
      if(!strid) return res(false);
      logga(`${h.namn} ${val==="parera"?"parerar":"försöker undvika"}: ${s.text}`, slagCls(s));
      ritaStrid();
      if(s.lyckat){ etikett("h:"+id, "MISS", "#ffffff"); visaEffekt("h:"+id, "miss"); }
      res(s.lyckat);
    }};
    strid.aktiv = id; ritaStrid();
  });
}

// ---------- Hjältens handlingar ----------
async function hjalteHandling(fn){
  if(strid) strid.svara_las = true;
  await medTarningar(()=>{ try{ fn(); }catch(e){ console.error(e); logga("Något gick fel: "+e.message,"fel"); } });
  spara(); const r=strid&&strid.svara; if(strid){ strid.svara=null; strid.meny="huvud"; strid.svara_las=false; } if(r) r(); }
function skadaFiende(f, d, kalla){
  const verklig = Math.max(0, d - f.rust);
  f.kp = Math.max(0, f.kp - verklig);
  etikett("f:"+f.i, "-"+verklig, verklig?"#ffd23f":"#cfc6b4"); visaEffekt("f:"+f.i, "traff");
  logga(`${f.namn} tar ${verklig} skada${f.rust&&d>verklig?` (${d} − ${f.rust} rustning)`:""}${kalla?" från "+kalla:""}.`, verklig?"ok":"info");
  if(f.kp<=0) logga(`${f.namn} faller!`,"d");
  return verklig;
}
function anfall(id, vapenNamn, f, extra){
  extra = extra||{};
  const h=bygg(id), x=rh(id), v=R.VAPEN[vapenNamn];
  const s = hjalteSlag(id, v.fard, extra.fordel?"fordel":null);
  logga(slagText(h.namn+" ("+vapenNamn+")", s), slagCls(s));
  if(!s.lyckat){ etikett("f:"+f.i, "MISS", "#ffffff"); visaEffekt("f:"+f.i, "miss"); if(s.demon){ x.nackdelNasta=true; logga(`Naturligt 20! ${h.namn} tappar balansen och får nackdel på nästa slag.`,"dm"); } return 0; }
  let d = R.slaTarning(v.skada) + (v.bonus||0);
  if(s.drake){ d += R.slaTarning(v.skada); logga("Naturligt 1! Dubbel vapenskada.","d"); }
  const sb = R.skadebonus(h, v.avstand); if(sb) d += R.slaTarning(sb);
  if(x.vapenbonus) d += R.slaTarning(x.vapenbonus);
  if(x.gift){ d += R.t(6); x.gift=false; logga("Giftet på vapnet gör sitt.","ok"); }
  if(extra.plus) d += R.slaTarning(extra.plus);
  if(extra.dubbel) d *= 2;
  const verklig = skadaFiende(f, d);
  if(vapenNamn==="Nannheim" && verklig > 0) grotsvardet(f);
  return verklig;
}
// Grötsvärdet (Nannheim): där det träffar förvandlas fienden till en slummig maträtt
const GROT_RATTER = ["lasagne","havregrynsgröt","ravioli ur burk","pyttipanna","blodpudding","makaroner och korv","kålpudding","fiskpinnar","risgrynsgröt","köttbullar i brun sås","kokt potatis med skirat smör","stuvade makaroner","korvstroganoff","rotmos","leverpastej","kalvsylta"];
const GROT_DELAR = ["ena armen","axeln","ena benet","magen","ryggen","huvudet","ena örat","svansen","näsan","höften"];
function grotsvardet(f){
  const ratt = R.valj(GROT_RATTER), del = R.valj(GROT_DELAR);
  if(f.kp <= 0) logga(`Grötsvärdet! ${f.namn} förvandlas helt till en rykande portion ${ratt}.`, "dm");
  else logga(`Grötsvärdet! Där Nannheim träffar blir ${del} på ${f.namn} till ${ratt}.`, "dm");
}
function kasta(id, namn, mal){
  const h=bygg(id), x=rh(id), b=R.BESV[namn];
  if(x.vp < R.BESV_KOSTNAD){ logga(`${h.namn} har inte tillräckligt med VP.`,"fel"); return; }
  x.vp -= R.BESV_KOSTNAD;
  const s = hjalteSlag(id, "Magi");
  logga(slagText(`${h.namn} kastar ${namn}`, s), slagCls(s));
  if(!s.lyckat){ if(s.demon){ const d=R.t(6); logga(`Naturligt 20 – magisk olycka! Besvärjelsen slår tillbaka.`,"dm"); skadaHjalte(id,d,"sin egen magi",true); } else logga("Besvärjelsen fräser och dör ut.","fel"); return; }
  const ef = BESV_EFFEKT[namn];
  if(ef){ if(b.mal==="allaFiender") strid.fiender.filter(f=>f.kp>0).forEach(f=>visaEffekt("f:"+f.i, ef));
    else if(b.mal==="fiende" && mal) visaEffekt("f:"+mal.i, ef);
    else if(b.mal==="hjalte" && mal) visaEffekt("h:"+mal, ef);
    else if(b.fly || b.skrack) st.run.party.filter(i=>!rh(i).dod).forEach(i=>visaEffekt("h:"+i, ef)); }
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
  } else if(strid.resultat){
    panel = resultatHtml();
  } else if(x && strid.svara){
    const h = bygg(akt);
    panel = `<div class="resultat"><div class="rubrik"><canvas class="px" data-p="${akt}"></canvas><h3>${esc(h.namn)}s tur – vad gör hen?</h3></div></div>` + hjalteMeny(akt, h, x);
  } else {
    const fn = akt&&String(akt).startsWith("#f") ? (strid.fiender[Number(akt.slice(2))]||{}).namn : null;
    panel = `<p class="agerar">${fn?`⚔ ${esc(fn)} agerar…`:`Runda ${strid.runda} börjar…`}</p>`;
  }
  app.innerHTML = `
    <div class="tv fast"><canvas id="scen" class="px"></canvas><span class="badge">Runda ${strid.runda}</span></div>
    <section class="card stridpanel">${panel}</section>
    <div class="ordning"><span class="small muted" style="border:0;background:none;padding:2px 0">Turordning:</span>${strid.ordning.map(t=>`<span class="${t.nu&&!t.gjord?"nu":""} ${t.gjord?"gjord":""} ${t.typ==="f"?"f":""}">${t.typ==="h"?esc(HJ[t.id].namn.split(" ")[0]):esc((strid.fiender[t.i]||{}).namn)}</span>`).join("")}</div>
    <div class="fiender">${strid.fiender.map(f=>`<div class="fiende ${f.kp<=0?"dod":""}"><span class="n">${esc(f.namn)}${f.stoppad>0?" ⛓":""}${f.nackdel?" 😨":""}</span><span class="siffra">KP ${f.kp}/${f.max}</span><div class="bar f"><b style="width:${100*f.kp/f.max}%"></b></div></div>`).join("")}</div>
    ${partyHtml(akt)}
    ${loggHtml()}`;
  const et = strid.etiketter || [];
  const fiendeVis = strid.fiender.filter(f=>!f.lamnat).map(f=>({...f, visa:true, etikett:et.filter(e=>e.mal==="f:"+f.i)}));
  const hjVis = scenHjaltar(akt).map(h=>({...h, etikett:et.filter(e=>e.mal==="h:"+h.id)}));
  const [sMiljo, sFro] = stegScen(steg);
  G.ritaScen($("#scen"), sMiljo, fiendeVis, sFro, null, hjVis);
  G.npcBild("effekter");   // läs in effektarket i förväg
  if(strid.effekter && strid.effekter.length) spelaEffekter(sMiljo, sFro, fiendeVis, hjVis);
  if(strid.ornVisa){ const v = strid.ornVisa; strid.ornVisa = null;
    spelaOrn(t => { const c = $("#scen"); if(c && strid) G.ritaScen(c, sMiljo, fiendeVis, sFro, null, hjVis.map(h=>h.id==="potus"&&t!=null?{...h, orn:{ruta:v.ruta, t}}:h)); }); }
  fyllPortratt(app); scrollaLogg();
  app.onclick = e => {
    const b = e.target.closest("button"); if(!b || b.disabled) return;
    if(b.dataset.a==="fortsatt" && strid.fortsatt) return strid.fortsatt();
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
    return `<p>Använda vad?</p><div class="val">${alla.filter(o=>{const k=o.s+o.k; if(sedda.has(k)) return false; sedda.add(k); return true;}).map(o=>`<button class="btn ghost" data-m="valt-sak" data-s="${esc(o.s)}" data-k="${o.k}">${ikonHtml(o.s)}${esc(o.s)}<span class="sub">${o.k==="egen"?"Egen":"Packningen"} · ${esc(R.SAKER[o.s].text)}</span></button>`).join("")||"<p class='muted'>Inget att använda.</p>"}${tillbaka}</div>`; }
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
    <button class="btn ghost small" data-m="fly">${st.run.arena?"Ge upp matchen":strid.boss?"Fly (avbryter uppdraget)":"Fly"}</button>
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
  if(m==="fly" && st.run.arena){ if(!confirm("Ge upp matchen? Ingen kommer till skada.")) return;
    return hjalteHandling(()=>{ strid.flydde=true; logga("Sällskapet kastar in handduken.","fel"); }); }
  if(m==="fly"){ if(!confirm(strid.boss?"Fly från slutstriden? Uppdraget misslyckas.":"Fly från striden? Varje fiende får ett sista anfall mot er, och ni får inget byte.")) return;
    return hjalteHandling(()=>{ strid.flydde=true; logga("Sällskapet flyr!","fel"); if(!strid.boss) strid.fiender.filter(f=>f.kp>0).forEach(f=>{ const mal=R.valj(st.run.party.filter(kanAgera)); if(!mal) return; const sk = f.typ==="folk"?R.slaTarning(f.skada):R.slaTarning((R.valj(f.attacker).skada)||"T4"); skadaHjalte(mal, sk, f.namn); }); }); }
}

// ---------- Slutet på en strid ----------
function avslutaStrid(slut){
  if(st.run && st.run.arena) return arenaSlut(slut);
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
    if(steg.rumtyp==="boss"){ steg.klar=true; steg.utfallText=`${r.q.foremal ? "Ni har fått tag på: "+r.q.foremal+". " : ""}${V.FIENDER[r.q.boss].namn} är besegrad!`; spara(); if(r.bulk!=null){ steg.utfallText = "Bulk faller ihop i sanden och somnar om, med ett lyckligt leende. Publiken jublar och Gojan kliver ner från läktaren med en tung börs."; return ritaRun(); } return avslutaRun(true); }
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

// ================= ARENAN =================
// Sällskapet möter valfria fiender, bossar eller andra hjältar. Allt är på låtsas:
// ingen dör på riktigt (ingen hamnar i Efterriket), ingen får förbättringsslag (XP), guld eller byte,
// och drycker som används kommer tillbaka. Inget i arenan sparas – efter matchen återställs spelet som det var.
const ARENA_MAX = 6;   // högst sex motståndare åt gången
const ARENA_BANOR = {sten:"Gojans gladiatorgrop", tra:"Svartspelsgropen"};
const ARENA_ORT = {sten:"i Batik", tra:"i Slasby"};
const AREKEY = "fantasyvarlden-arena";
let arena = (()=>{ try{ const a = JSON.parse(localStorage.getItem(AREKEY)||"null"); if(a) return {...a, resultat:null}; }catch(e){} return {bana:"sten", publik:true, lag:null, motst:{}, hjaltar:[], resultat:null}; })();
function sparaArenaVal(){ try{ localStorage.setItem(AREKEY, JSON.stringify({bana:arena.bana, publik:arena.publik, lag:arena.lag, motst:arena.motst, hjaltar:arena.hjaltar})); }catch(e){} }
const ISAK_ARENA = {
  seger:["Isak nickar långsamt. ”Imponerande. Det räknas inte, men imponerande.”","Isak antecknar något. ”Spara den formen till när det gäller på riktigt.”","”Publiken älskar er”, säger Isak. ”Tyvärr betalar publiken inte.”"],
  forlust:["Isak ler. ”Tur att det här bara var gladiatorgropen.”","”Det där hade varit ert slut”, säger Isak torrt. ”Om det hade räknats.”","Isak slår ihop sina anteckningar. ”Ni vaknar på bänken utanför. Med huvudvärk. Det är allt.”"],
  flydde:["Isak höjer på ett ögonbryn. ”Kloka människor vet när de ska kasta in handduken.”","”Publiken buar”, säger Isak. ”Men publiken har inga vapen.”"]
};
// En hjälte som motståndare: slåss med sitt bästa vapen, med sina egna KP och sin egen rustning
function hjalteSomFiende(id){
  const h = bygg(id);
  const v = h.vapen.filter(n=>R.VAPEN[n]).sort((a,b)=>R.fardVarde(h,R.VAPEN[b].fard)-R.fardVarde(h,R.VAPEN[a].fard))[0];
  const w = v ? R.VAPEN[v] : {fard:"Slagsmål", skada:"T3"}, sb = R.skadebonus(h, w.avstand);
  return {namn:h.namn, typ:"folk", folk:true, hjalte:id, kp:R.maxKP(h), rust:R.rustning(h), anfall:R.fardVarde(h, w.fard),
    skada:`${w.skada}${w.bonus?"+"+w.bonus:""}${sb?"+"+sb:""}`,
    skadaFn:()=>R.slaTarning(w.skada)+(w.bonus||0)+(sb?R.slaTarning(sb):0)};
}
function fiendeData(fid){ return String(fid).startsWith("hj:") ? hjalteSomFiende(fid.slice(3)) : V.FIENDER[fid]; }
function arenaLag(){ if(!arena.lag) arena.lag = st.sallskap.filter(id=>!ar(id)); arena.lag = arena.lag.filter(id=>HJ[id] && !ar(id)).slice(0,4); return arena.lag; }
function arenaMotst(){
  arena.hjaltar = arena.hjaltar.filter(id=>HJ[id] && !ar(id) && !arena.lag.includes(id));
  const ut = [];
  Object.entries(arena.motst).forEach(([fid,n])=>{ if(V.FIENDER[fid]) for(let i=0;i<n;i++) ut.push(fid); });
  ut.sort((a,b)=>(V.FIENDER[b].boss?1:0)-(V.FIENDER[a].boss?1:0));   // bossarna först
  return [...ut, ...arena.hjaltar.map(id=>"hj:"+id)];
}
const arenaBild = () => "arena_" + arena.bana + (arena.publik ? "" : "_tom");
function ritaArena(){
  const lag = arenaLag(), motst = arenaMotst(), antal = motst.length;
  const levande = window.HJALTAR.filter(h=>!ar(h.id));
  const fiendeRad = fid => { const f=V.FIENDER[fid], n=arena.motst[fid]||0;
    return `<div class="arad ${n?"pa":""}"><span>${esc(f.namn)}<span class="small muted"> · KP ${f.kp}, rustning ${f.rust||0}</span></span>
      <span class="aknapp"><button class="btn ghost small" data-minus="${fid}" ${n?"":"disabled"}>−</button><b>${n}</b><button class="btn ghost small" data-plus="${fid}" ${antal>=ARENA_MAX?"disabled":""}>+</button></span></div>`; };
  const vanliga = Object.keys(V.FIENDER).filter(f=>!V.FIENDER[f].boss), bossar = Object.keys(V.FIENDER).filter(f=>V.FIENDER[f].boss);
  const res = arena.resultat;
  let html = `<div class="tv"><canvas id="arenascen" class="px"></canvas><span class="badge">${esc(ARENA_BANOR[arena.bana])}</span></div>`;
  if(res){
    html += `<section class="card quest"><h2>${res.slut==="seger"?"🏆 Seger i gropen!":res.slut==="flydde"?"Matchen avbruten":"Förlust i gropen"}</h2>
      <p class="berattelse">${esc(res.text)}</p>
      <div class="spelledare">${isakHtml(res.isakNr)}<div><span class="small muted">Spelledaren Isak</span><p class="berattelse" style="margin:2px 0 0">${esc(res.isak)}</p></div></div>
      <p class="small muted">Ingen hamnar i Efterriket, ingen får förbättringsslag och inget guld. Allt är som innan matchen.</p>
      <div class="row"><button class="btn red" data-a="kor" ${lag.length&&antal?"":"disabled"}>Revansch – samma match igen</button><button class="btn ghost small" data-a="stang">Ändra matchen</button></div></section>`;
  }
  html += `<section class="card"><h2>Gladiatorgroparna</h2>
    <p class="muted">I Gojans gladiatorgrop i Batik och i Svartspelsgropen i Slasby kan sällskapet möta vilka fiender och bossar ni vill – och till och med varandra. Allt är på låtsas: den som faller bärs ut och vaknar på bänken utanför. Ingen hamnar i Efterriket, och ingen får förbättringsslag, guld eller byte. Drycker och örter som används i gropen kommer tillbaka efteråt.</p>
    <h3>Grop</h3>
    <div class="row">${Object.entries(ARENA_BANOR).map(([k,n])=>`<button class="btn ${arena.bana===k?"":"ghost"} small" data-bana="${k}">${n}</button>`).join("")}
      <button class="btn ${arena.publik?"":"ghost"} small" data-a="publik">${arena.publik?"Med publik":"Utan publik"}</button></div>
  </section>
  <section class="card"><h2>Ert lag <span class="small muted">(${lag.length} av 4)</span></h2>
    <p class="small muted">Tryck på hjältarna som ska slåss för er.</p>
    <div class="achips">${levande.map(h=>{ const pa=lag.includes(h.id), mot=arena.hjaltar.includes(h.id);
      return `<button class="achip ${pa?"pa":""}" data-lag="${h.id}" ${!pa&&(lag.length>=4||mot)?"disabled":""}><canvas class="px" data-p="${h.id}"></canvas><span>${esc(h.namn)}</span></button>`; }).join("")}</div>
  </section>
  <section class="card"><h2>Motståndare <span class="small muted">(${antal} av ${ARENA_MAX})</span></h2>
    <h3>Fiender</h3><div class="alista">${vanliga.map(fiendeRad).join("")}</div>
    <h3>Bossar</h3><div class="alista">${bossar.map(fiendeRad).join("")}</div>
    <h3>Andra hjältar</h3><p class="small muted">Hjältar som inte är med i ert lag kan ställa upp mot er. De slåss med sitt bästa vapen.</p>
    <div class="achips">${levande.filter(h=>!lag.includes(h.id)).map(h=>{ const pa=arena.hjaltar.includes(h.id);
      return `<button class="achip mot ${pa?"pa":""}" data-mot="${h.id}" ${!pa&&antal>=ARENA_MAX?"disabled":""}><canvas class="px" data-p="${h.id}"></canvas><span>${esc(h.namn)}</span></button>`; }).join("")||'<span class="small muted">Alla levande hjältar är med i ert lag.</span>'}</div>
    ${antal?`<button class="btn ghost small" data-a="rensa">Rensa motståndarna</button>`:""}
  </section>
  <div class="row astart"><button class="btn red" data-a="kor" ${lag.length&&antal?"":"disabled"}>Till strid! <span class="small">(${lag.length} mot ${antal})</span>${lag.length&&antal?"":`<span class="sub">${lag.length?"Välj minst en motståndare":"Välj minst en hjälte"}</span>`}</button>
    <button class="btn ghost small" data-a="hem">Till värdshuset</button></div>`;
  app.innerHTML = html; fyllPortratt(app); fyllIsak(app);
  const vis = motst.map((fid,i)=>{ const f=fiendeData(fid); return {...f, fid, i, kp:1, visa:true, ruta: f.hjalte ? figur(f.hjalte) : (G.fiendeRutor(fid)[0] ?? null)}; });
  G.ritaScen($("#arenascen"), arenaBild(), vis, 7, null, lag.map(id=>({id, ruta:figur(id)})));
  app.onclick = e => {
    const b = e.target.closest("button"); if(!b || b.disabled) return;
    const d = b.dataset;
    if(d.a==="hem"){ arena.resultat=null; return ga("hem"); }
    if(d.a==="kor") return startaArena();
    if(d.a==="stang") arena.resultat=null;
    if(d.a==="publik") arena.publik=!arena.publik;
    if(d.a==="rensa"){ arena.motst={}; arena.hjaltar=[]; }
    if(d.bana) arena.bana=d.bana;
    if(d.plus && antal<ARENA_MAX) arena.motst[d.plus]=(arena.motst[d.plus]||0)+1;
    if(d.minus){ arena.motst[d.minus]=Math.max(0,(arena.motst[d.minus]||0)-1); if(!arena.motst[d.minus]) delete arena.motst[d.minus]; }
    if(d.lag){ arena.lag = lag.includes(d.lag) ? lag.filter(x=>x!==d.lag) : [...lag, d.lag]; }
    if(d.mot){ arena.hjaltar = arena.hjaltar.includes(d.mot) ? arena.hjaltar.filter(x=>x!==d.mot) : [...arena.hjaltar, d.mot]; }
    sparaArenaVal();
    const y = window.scrollY; ritaArena(); window.scrollTo({top:y, behavior:"instant"});
  };
}
function startaArena(){
  const lag = arenaLag(), ids = arenaMotst();
  if(!lag.length || !ids.length || strid) return;
  arena.resultat = null;
  // Kopia av allt som en strid kan ändra – läggs tillbaka efter matchen
  const kopia = JSON.stringify({kassa:st.kassa, packning:st.packning, hj:st.hj, kronika:st.kronika, sallskap:st.sallskap});
  const steg = [{typ:"rum", rumtyp:"arena", text:"", fiender:ids, rutor:ids.map(slumpRuta), fro:7}];
  st.run = {arena:true, kopia, forra:st.run, q:{titel:ARENA_BANOR[arena.bana], plats:ARENA_BANOR[arena.bana], miljo:arenaBild()}, party:[...lag], steg, i:0, h:nyaHjaltar(lag), guld:0, logg:[], utfall:null};
  logga(`${lag.map(id=>HJ[id].namn).join(", ")} kliver in i ${ARENA_BANOR[arena.bana]} ${ARENA_ORT[arena.bana]}.`,"info");
  startaStrid(ids, {});
  window.scrollTo({top:0,behavior:"instant"});
}
function arenaSlut(slut){
  const r = st.run, s = strid; strid = null;
  const lag = r.party.map(id=>HJ[id].namn).join(", ");
  const kvar = r.party.filter(id=>{ const x=rh(id); return !x.dod && x.kp>0; }).map(id=>HJ[id].namn);
  const text = slut==="seger" ? `${lag} vinner matchen! ${kvar.length?kvar.join(", ")+" står kvar när dammet lagt sig.":""}`
    : slut==="flydde" ? `${lag} kastade in handduken.`
    : `Motståndarna vann matchen. ${lag} bärs ut ur gropen och vaknar på bänken utanför – med huvudvärk, men vid liv.`;
  // Lägg tillbaka spelet precis som det var före matchen
  Object.assign(st, JSON.parse(r.kopia)); st.run = r.forra || null;
  const lista = ISAK_ARENA[slut] || ISAK_ARENA.forlust;
  arena.resultat = {slut, text, isak:R.valj(lista), isakNr:Math.floor(Math.random()*64)};
  vy = "arena"; ritaOm(); window.scrollTo({top:0,behavior:"instant"});
}

// ================= ÄVENTYRETS SLUT =================
function avslutaRun(lyckat, orsak, gavUpp){
  const r = st.run; if(!r || r.utfall) return;
  if(r.arena) return arenaSlut(lyckat ? "seger" : "forlust");
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
    if(r.q.skuld){ const ranta = r.skuldRanta ?? R.t(6)*10; avgift = SKULD + ranta;
      var avgiftText = `${r.q.skuld} tog ${avgift} guld: ${SKULD} i skuld och ${ranta} i ränta`;
      }
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
  r.utfall = {lyckat, orsak, beloning, avgift, avgiftText: typeof avgiftText!=="undefined" ? avgiftText : null, byte:r.guld, doda, forb, rad};
  spara(); vy="run"; ritaRun();
}
function ritaSlut(){
  const r = st.run, u = r.utfall;
  app.innerHTML = `
    <div class="tv fast"><canvas id="scen" class="px"></canvas><span class="badge">${r.utforska?esc(r.q.plats):u.lyckat?"Uppdraget klart!":"Misslyckat"}</span></div>
    <section class="card quest"><h2>${r.utforska?(u.lyckat?"Hemma med bytet!":"Det gick inte som planerat"):u.lyckat?"Seger!":"Det gick inte som planerat"}</h2>
      ${r.utforska?(u.lyckat?`<p>Byte: <b>${u.byte} guld</b>. Kapitelbonus för ${r.kapitel} ${r.kapitel===1?"kapitel":"kapitel"}: <b>${u.beloning} guld</b>. Totalt <b>${u.byte+u.beloning} guld</b> till kassan.</p>`:`<p class="berattelse">${esc(u.orsak||"")}</p>`):u.lyckat?`<p class="berattelse">${esc(r.q.svar)}</p>${r.q.foremal?`<p class="foremal">${ikonHtml(UPPDRAG_IKON[r.q.id])}<span>Ni har fått tag på: <b>${esc(r.q.foremal)}</b></span></p>`:""}
        <p>Belöning: <b>${u.beloning} guld</b>${u.avgift?` (${esc(u.avgiftText || `Lansor tar ${u.avgift} guld i avgift`)})`:""}. Byte under resan: <b>${u.byte} guld</b>.</p>`
      :`<p class="berattelse">${esc(u.orsak||"")}</p>`}
      ${u.rad.map(x=>`<p>${esc(x)}</p>`).join("")}
      ${u.doda.length?`<div><h3>Till poolen i Miami</h3>${u.doda.map(id=>`<p><b>${esc(HJ[id].namn)}</b>: ${esc(R.valj(V.EFTERRIKET))}</p>`).join("")}</div>`:""}
      <div><h3>Förbättringsslag</h3><p class="small muted">Färdigheter som fick ett naturligt 1 eller naturligt 20 (och en till för varje överlevande vid seger) slås om: T20 över nuvärdet = +1.</p>
      ${Object.entries(u.forb).map(([id,l])=>`<p><b>${esc(HJ[id].namn)}:</b> ${l.length?l.map(x=>`${esc(x.f)} (${x.v}) slog ${x.s} → ${x.upp?`<span style="color:var(--moss)">+1!</span>`:"ingen ändring"}`).join(", "):"inget att slå för"}</p>`).join("")||"<p class='small'>Ingen överlevde för att förbättras.</p>"}</div>
      <button class="btn" data-a="klar">Tillbaka till värdshuset</button>
    </section>${loggHtml()}`;
  // Vid seger i ett uppdrag (inte utforskning) slutar det där det började: i värdshuset, där uppdragsgivaren
  // tar emot sällskapet och uppdragets föremål ligger på bordet. Annars står sällskapet kvar på platsen.
  if(u.lyckat && !r.utforska){
    const ik = UPPDRAG_IKON[r.q.id], [ia, ir] = ik ? ik.split(":") : [];
    G.ritaVardshus($("#scen"), scenHjaltar().filter(h=>!rh(h.id).dod), {npc:givare(r.q.givare, r.q.id.length*7), ikon: ik ? {ark:IKONARK[ia], ruta:Number(ir)} : null, rum:SLUTRUM[r.q.id]});
  } else G.ritaScen($("#scen"), scenMiljo(r.q.miljo), [], 99, u.lyckat?"skatt":null, scenHjaltar());
  fyllIkoner(app);
  scrollaLogg();
  app.onclick = e => { const b=e.target.closest("[data-a]"); if(b && b.dataset.a==="klar"){ st.run=null; spara(); ga("hem"); } };
}

// ================= Reglerna och inställningar =================
$("#btn-regler").onclick = () => modal(`<h2>Så funkar reglerna</h2>
  <p><b>Slag:</b> Slå en T20. Lika med eller under färdighetsvärdet = lyckat. Ett <b>naturligt 1</b> (tärningen visar 1) är ett perfekt slag – t.ex. dubbel vapenskada. Ett <b>naturligt 20</b> är en katastrof – t.ex. att man tappar balansen eller att magin slår tillbaka.</p>
  <p><b>Fördel / nackdel:</b> Slå två T20 och ta det bästa (fördel) eller sämsta (nackdel). Ankor har fördel på Simma.</p>
  <p><b>Färdigheter:</b> Grundchansen är 3–7 beroende på egenskapen. Tränade färdigheter har dubbla grundchansen. Värden som nämns i podden är behållna.</p>
  <p><b>Strid:</b> Varje runda dras initiativkort 1–10. Lägst börjar. Varje hjälte har <b>en handling</b> per runda: anfalla, kasta en besvärjelse, använda sin förmåga, en sak eller rädda en vän. Blir man anfallen innan man agerat kan man <b>undvika</b> eller <b>parera</b> – men då går handlingen åt.</p>
  <p><b>Monster</b> träffar alltid – man måste undvika eller parera. <b>Människolika fiender</b> slår för att träffa.</p>
  <p><b>Skada:</b> Vapnets tärning + skadebonus (STY för närstrid, SMI för avstånd, 13+ = T4, 17+ = T6) minus rustning.</p>
  <p><b>KP och VP:</b> Kroppspoäng = FYS, viljepoäng = PSY. Besvärjelser kostar 2 VP och kräver ett lyckat Magi-slag. Signaturförmågor kostar 3 VP.</p>
  <p><b>Döende:</b> Vid 0 KP faller hjälten. Varje runda slås ett dödsslag mot FYS: tre lyckade = stabil, tre misslyckade = död. Ett naturligt 1 = upp på benen igen. Vänner kan rädda med Läkekonst eller Hela.</p>
  <p><b>Förbättring:</b> Färdigheter som fått ett naturligt 1 eller naturligt 20 markeras. Efter äventyret slår man T20 – över nuvärdet = +1.</p>
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
  <label class="f">Tärningar<select id="tarningval"><option value="sjalv" ${(alt.tarning||"sjalv")==="sjalv"?"selected":""}>Jag slår själv</option><option value="auto" ${alt.tarning==="auto"?"selected":""}>Spelledaren Isak sköter tärningarna</option></select></label>
  <p class="small muted">Om du själv ska trycka för att slå hjältarnas tärningar. Fiendernas slag sker alltid automatiskt.</p>
  <label class="f">Stridstempo<select id="tempo">${Object.entries(TEMPON).map(([k,v])=>`<option value="${k}" ${(alt.tempo||"steg")===k?"selected":""}>${esc(v.namn)}</option>`).join("")}</select></label>
  <p class="small muted">Hur länge spelet stannar och visar vad som hände efter varje tur i striden. Sparas på den här enheten.</p>
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
  $("#tempo").onchange = e => { alt.tempo = e.target.value; save(AKEY, alt); };
  $("#tarningval").onchange = e => { alt.tarning = e.target.value; save(AKEY, alt); };
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
G.npcBild("storn"); // ladda örnen i förväg så att den syns direkt när den anfaller
window.__fv = {get st(){return st}, get strid(){return strid}}; // för felsökning
})();
