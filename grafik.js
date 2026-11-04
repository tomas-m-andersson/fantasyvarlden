// Fantasyvärlden – pixelgrafik: "TV:n" (scenen överst), fiender och hjälteporträtt.
(function(){
const G = {};

// ---------- Fiendesprites (16×16). k = kontur, övriga bokstäver färgas via palett ----------
const S = {
 orch:["................","....kkkkkkkk....","...kggggggggk...","..kggrggggrggk..","..kggggggggggk..","..kgwgggggggwk..","...kgwkkkkwgk...","....kggggggk....","..kkbbbbbbbbkk..",".kbbbbbbbbbbbbk.",".kgkbbbbbbbbkgk.",".kgkbbbbbbbbkgk.","..k.bbbbbbbb.k..","....kbbkkbbk....","....kbbk.kbbk...","...kkkk...kkkk.."],
 svartalf:["................","................",".k....kkkk....k.",".kk..kppppk..kk.","..kkkppppppkkk..","...kprppppprk...","...kppppppppk...","....kppkkppk....",".....kppppk.....","...kkddddddkk...","..kddddddddddk..","..kpkddddddkpk..","..kpkddddddkpk..","....kddddddk....","....kdk..kdk....","...kkk....kkk..."],
 rovare:["................",".....kkkkkk.....","....kbbbbbbk....","...kbbbbbbbbk...","...kbssssssbk...","...kbsesseskbk..","...kbssssssbk...","...kbddddddbk...","..kbbbbbbbbbbk..",".kbbbccccccbbbk.",".kskcccccccccsk.",".kskccccccccksk.","..k.cccbbccc.k..","....kcck.kcck...","....kcck.kcck...","...kkkk...kkkk.."],
 harpya:["................","......kkkk......",".....khhhhk.....","....khsssshk....","....khsesehk....","k...khsssshk...k","kk...kssssk...kk","kwk.kwwwwwwk.kwk","kwwkwwwwwwwwkwwk",".kwwwwwwwwwwwwk.","..kwwwwwwwwwwk..","...kkwwwwwwkk...",".....kwwwwk.....",".....kyk.kyk....","....kyyk.kyyk...","................"],
 ratta:["................","................","................","................","................","..........kk....",".........kggk.k.","...kkkkkkkggkkgk","..kggggggggggggk",".kggggggggggegrk","kgggggggggggggk.","kgggggggggggkk..",".kkgkkkkkgkk....","t.kk.....kk.....",".tt.............","..tt............"],
 varg:["................","................","..........k..k..",".........kgkkgk.","........kggggggk","........kgegggk.","..kkkkkkkggggrrk",".kgggggggggggkk.","kgggggggggggggk.","kggggggggggggk..",".kggggggggggk...","..kgk.kgk.kgk...","..kgk.kgk.kgk...","..kkk.kkk.kkk...","................","................"],
 odod:["......kkkk......",".....kwwwwk.....","....kwwwwwwk....","....kwkwwkwk....","....kwwwwwwk....",".....kwkwkwk....","......kwwk......","....kkwwwwkk....","...kwkwkwkwkw...","...kwkkwwkkwk...","...kwkwkwkwkwk..","...kwk.kwk.kwk..",".......kwwk.....","......kwkkwk....","......kwk.kwk...",".....kkk...kkk.."],
 dendroid:["......gggg......","....gggggggg....","...gggggggggg...","..gggggggggggg..","..ggggggggggggg.","...ggbbbbbbgg...","....kbebbebk....","....kbbbbbbk....","..kkbbkkkkbbkk..",".kbbkbbbbbbkbbk.","kbk.kbbbbbbk.kbk","kk..kbbbbbbk..kk","....kbbbbbbk....","...kbbk..kbbk...","..kbbk....kbbk..",".kkkk......kkkk."],
 gast:["......kkkk......","....kkwwwwkk....","...kwwwwwwwwk...","..kwwwwwwwwwwk..","..kwwkkwwkkwwk..","..kwwkkwwkkwwk..","..kwwwwwwwwwwk..","..kwwwwkkwwwwk..","..kwwwkwwkwwwk..",".kwwwwwwwwwwwwk.",".kwwwwwwwwwwwwk.","kwwwwwwwwwwwwwwk","kwwwwwwwwwwwwwwk","kwkwwkwwkwwkwwkk","kk.kk.kk.kk.kk..","................"],
 drake:["..........kk....",".........krrk...","...k....krrrrk..","..krk..krrerrk..",".krrrk.krrrrrrk.",".krrrrkrrrrkkyk.","..krrrrrrrrk....","...krrrrrrrrk...","..krrwwwrrrrrk..",".krrwwwwwrrrrrk.","krrrwwwwwrrrrrrk","krk.kwwwwrrrrk.k","kk..krrkkrrk....","....krk..krk....","...kkk...kkk....","................"]
};
S.kultist = S.rovare; S.bjorn = S.varg; S.tiger = S.varg; S.grip = S.harpya;

// Paletter per fiende (bokstav → färg)
const P = {
 orch:{k:"#1a120c",g:"#5f8f3a",r:"#d33",w:"#efe6cf",b:"#6b4a2a"},
 svartalf:{k:"#0e0a12",p:"#4b3a66",r:"#ff4b3e",d:"#22202a"},
 rovare:{k:"#140e0a",b:"#5c3d22",s:"#d9a57c",e:"#1a1a1a",d:"#2a2a2a",c:"#6f5232"},
 kultist:{k:"#0a0808",b:"#1b1a1f",s:"#cfa184",e:"#ff3b30",d:"#7a1414",c:"#2a2730"},
 stadsvakt:{k:"#0c0c0e",b:"#8c929c",s:"#d9a57c",e:"#1a1a1a",d:"#5f646c",c:"#3f6aa0"},
 harpya:{k:"#160f10",h:"#4a2c2a",s:"#c9a184",e:"#d22",w:"#7a6e66",y:"#d8a334"},
 grip:{k:"#160f08",h:"#f2efe6",s:"#f2efe6",e:"#222",w:"#c8902e",y:"#e0b23e"},
 ratta:{k:"#100c0a",g:"#6d625a",e:"#e33",r:"#e79aa0",t:"#d88a90"},
 varg:{k:"#0c0c0e",g:"#77808a",e:"#ffd23f",r:"#e9e3d6"},
 bjorn:{k:"#120a06",g:"#6b4426",e:"#111",r:"#d8c7a8"},
 tiger:{k:"#140a04",g:"#d9862c",e:"#2c2",r:"#f3ead8"},
 odod:{k:"#0d0d10",w:"#d9d3c0"},
 dendroid:{k:"#120c06",g:"#3f7a34",b:"#6a4a28",e:"#e8d34a"},
 gast:{k:"#20283a",w:"#cfe1f2"},
 drake:{k:"#140606",r:"#b2322a",e:"#ffd23f",w:"#e6b46a",y:"#ff9a2e"}
};
const PALETT_FOR = {kultist:"kultist",stadsvakt:"stadsvakt",bjorn:"bjorn",tiger:"tiger",grip:"grip"};

G.ritaSprite = (ctx, namn, x, y, skala, palettNamn, vand) => {
  const karta = S[namn] || S.orch, pal = P[palettNamn] || P[namn] || P.orch;
  for(let r=0;r<karta.length;r++){
    const rad = karta[r];
    for(let c=0;c<rad.length;c++){
      const ch = rad[c]; if(ch===".") continue;
      ctx.fillStyle = pal[ch] || "#f0f";
      const cx = vand ? (15-c) : c;
      ctx.fillRect(x+cx*skala, y+r*skala, skala, skala);
    }
  }
};

// ---------- Scenen (TV:n) ----------
// Liten pixelbild 160×90 som skalas upp. Deterministisk efter "fro" så att samma rum ser likadant ut.
function slump(fro){ let s = fro>>>0 || 1; return () => (s = (s*1664525+1013904223)>>>0) / 4294967296; }
G.ritaScen = (canvas, miljoId, fiender, fro, extra, hjaltar, npcer) => {
  const argsKopia = [canvas, miljoId, fiender, fro, extra, hjaltar, npcer];
  const omRitaVid = img => img.addEventListener("load",()=>G.ritaScen(...argsKopia),{once:true});
  const ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false;
  // TV:n är 320×180 pixlar så att målade bakgrunder syns i full upplösning. Allt annat ritas i 160×90-koordinater, förstorat två gånger.
  const W = 160, H = 90; canvas.width = W*2; canvas.height = H*2; ctx.imageSmoothingEnabled = false; // efter width – annars nollställs den
  ctx.setTransform(2,0,0,2,0,0);
  const m = (window.VARLD.MILJO[miljoId] || window.VARLD.MILJO.grotta), rnd = slump(fro||7);
  // Bakgrund ur bakgrund.js: en egen målad bild om miljön har en, annars ritad med kod
  // Klyftan har egna målade bakgrunder där sällskapet står vid kanten (bakgrunder/klyfta_ute.png och klyfta_inne.png)
  // Viloplatserna har egna lägerbilder med lägereld (inne i grottor, kloaker och gruvor, annars ute)
  const bgId = extra==="hinder:klyfta" ? (KLYFTA_UTE[miljoId] ? "klyfta_ute" : "klyfta_inne")
             : extra==="vila" ? (INNE_MILJO[miljoId] ? "lager_inne" : "lager_ute")
             : extra==="hinder:mur" ? (GATA[miljoId] || (INNE_MILJO[miljoId] ? "gata_inne" : "gata_ute"))
             : extra==="hinder:dorr" ? (INNE_MILJO[miljoId] ? "port_inne" : "port_ute")
             : extra==="hinder:stege" ? "klippa"
             : extra==="hinder:vatten" ? (INNE_MILJO[miljoId] ? "vatten_inne" : "vatten_ute") : miljoId;
  const bgVantar = window.BAKGRUND.rita(ctx, bgId, fro);
  // hur mycket längre ner (eller upp) marken ligger i just den här bilden – gäller hjältar, NPC:er och fiender
  const markNer = MARK_NER[window.BAKGRUND.namn(bgId, fro)] ?? MARK_NER[bgId] ?? 0;
  if(bgVantar) omRitaVid(bgVantar);
  // Regnväder: ungefär vart fjärde rum utomhus (på målade bakgrunder) regnar det. Himlen mörknar här,
  // och själva regnet faller i ett eget genomskinligt lager ovanpå TV:n (se REGN längre ner).
  const regnar = G.vader(miljoId, fro) === "regn";
  if(regnar){ ctx.fillStyle = "rgba(18,26,40,.38)"; ctx.fillRect(0, 0, W, H); }
  G.regnLager(canvas, regnar);
  // Lägereldarna i de målade lägerbilderna fladdrar och ryker (eget lager ovanpå, se ELD längre ner)
  G.eldLager(canvas, ELDAR[window.BAKGRUND.namn(bgId, fro)] || null);
  // rummets föremål (skatt, fälla, vila…)
  // Skattkista och lägereld ur möbelarket (npc/mobler.png): ruta 52 = kista, 36 = lägereld med stekspett
  if(extra==="skatt" || (extra==="vila" && !window.BAKGRUND.harEgen(bgId))){   // lägerbilderna har redan en eld
    const mob = G.npcBild("mobler");
    if(mob.complete && mob.naturalWidth){ ctx.fillStyle="#0005"; ctx.fillRect(88, 77, 24, 3); G.ritaRuta(ctx, mob, extra==="skatt"?52:36, 84, 53, 32); }   // står på marken i höjd med hjältarnas fötter
    else omRitaVid(mob);
  }
  // Saker ur npc/saker_grotta.png ("g") och npc/saker_by.png ("b")
  const sg = G.npcBild("saker_grotta"), sb = G.npcBild("saker_by");
  const klarBild = img => img.complete && img.naturalWidth;
  const sak = (img, r, x, y, z) => { if(klarBild(img)) G.ritaRuta(ctx, img, r, x, y, z); else omRitaVid(img); };
  const rnd2 = slump((fro||7) * 31 + 5);
  // Bakgrundssaker: kranier, ben, tunnor och lyktor i grottor och ruiner – staket, hö och brunnar ute
  const INNE = {grotta:[7,52,23,48,28,39], kloak:[23,48,52,28,7], ruin:[48,23,7,52,28], gravfalt:[7,52,28]};
  const UTE = {skog:[24,15,29,12], berg:[11,24], trask:[24,12]};   // inga lådor eller tunnor i öknen
  // (målade bakgrunder har redan egna detaljer och får inga utströdda saker)
  if(extra!=="jens" && !String(extra||"").startsWith("jens") && !window.BAKGRUND.harEgen(miljoId)){
    // sakerna står på marken (underkanten vid y ≈ 72) och får en skugga, så att de inte ser uppklistrade ut
    const pa = (img, r, x, fot, z) => { if(klarBild(img)){ ctx.fillStyle="#0004"; ctx.fillRect(x+Math.round(z*.15), fot-1, Math.round(z*.7), 2); } sak(img, r, x, fot - z + 1, z); };
    if(INNE[miljoId]){ const l=INNE[miljoId]; pa(sg, l[Math.floor(rnd2()*l.length)], 58, 70, 16); pa(sg, l[Math.floor(rnd2()*l.length)], 142, 72, 16); }
    else if(UTE[miljoId]){ const l=UTE[miljoId]; pa(sb, l[Math.floor(rnd2()*l.length)], 138, 72, 20); }
  }
  if(extra==="resa") sak(sb, 27, 74, 50, 26);                                   // vägvisare vid vägen
  if(extra==="falla") sak(sg, 53, 74, 54, 26);                                  // spikfälla
  if(extra==="skatt"){ sak(sg, 19, 76, 70, 10); sak(sg, 19, 82, 72, 9); sak(sg, 24, 114, 68, 12); sak(sg, 40, 120, 71, 10); } // mynt och ädelstenar
  if(extra==="hinder:dorr" && !window.BAKGRUND.harEgen(bgId)){ sak(sb, 26, 82, 44, 34); sak(sg, 54, 92, 60, 12); } // låst port med hänglås
  if(extra==="hinder:stege" && !window.BAKGRUND.harEgen(bgId)) sak(sb, 13, 84, 40, 38);
  if(extra==="hinder:mur" && !window.BAKGRUND.harEgen(bgId)) ritaStenport(ctx, 178, (76 + markNer)*2, fro);   // gåtan i sten: en stenport med runor
  if(extra==="hinder:klyfta" && !window.BAKGRUND.harEgen(bgId)){ ctx.fillStyle="#000c"; ctx.fillRect(72,66,30,24); ctx.fillStyle="#0006"; ctx.fillRect(70,64,34,3); }
  // Bakhuvudet Jens vagn (npc/jens_vagn.png, sex varianter). Hjältarna ritas först och vagnen ovanpå,
  // så att relingen döljer underkroppen och de ser ut att sitta på flaket bakom Jens.
  if(extra && String(extra).startsWith("jens")){
    const v = VAGNAR[(Number(String(extra).split(":")[1])||0) % VAGNAR.length];
    const vagn = G.npcBild("jens_vagn");
    const vx = Math.round((W - v.b)/2), vy = 79 - v.h, reling = vy + v.rel;
    ctx.fillStyle="#0005"; ctx.fillRect(vx+4, 77, v.b-8, 3);                       // skugga
    const vantar = [];
    if(!(vagn.complete && vagn.naturalWidth)) vantar.push(vagn);
    // sällskapet på flaket: fyra platser mellan bakkanten och Jens
    (hjaltar||[]).slice(0,4).forEach((h,i)=>{
      const img = G.figurBild(h.id); if(!img) return;
      if(!(img.complete && img.naturalWidth)){ vantar.push(img); return; }
      const r = h.ruta ?? (G.figurRutor(h.id)[0]||0), S = G.storlek(h.id);
      const x = vx - 6 + i*12 + Math.round((32-S)/2);
      const y = reling + 2 - Math.round(20*S/32) + (i%2 ? 1 : 0);           // huvud och axlar över relingen
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, reling + 8); ctx.clip();      // inga ben under flaket
      ctx.drawImage(img, (r%8)*32, Math.floor(r/8)*32, 32, 32, x, y, S, S);
      ctx.restore();
    });
    if(!vantar.length) ctx.drawImage(vagn, v.x, v.y, v.b, v.h, vx, vy, v.b, v.h);
    else vantar.forEach(omRitaVid);
    hjaltar = null;
  }
  // effekt ur npc/effekter.png ovanpå en figur (träff, miss, trolldom)
  const effektPa = (ruta, x, y, z) => { if(ruta==null) return; const ei = G.npcBild("effekter"); if(ei.complete && ei.naturalWidth){ ctx.save(); ctx.globalAlpha = ruta>=40 && ruta<48 ? .6 : .9; G.ritaRuta(ctx, ei, ruta, x, y, z); ctx.restore(); } };   // skölden lite genomskinlig
  // hjältarna (vänster sida, i två led så att fyra får plats)
  const harHjaltar = hjaltar && hjaltar.length;
  let ornRita = null;
  if(harHjaltar){
    const laddar = [];
    hjaltar.forEach((h,i)=>{
      const bn = window.BAKGRUND.namn(bgId, fro);
      const x = (HJ_START[bn] ?? HJ_START[bgId] ?? 2) + i*(HJ_STEG[bn] || HJ_STEG[bgId] || 15), y = 44 + (i%2 ? 4 : 0) + markNer; // fötterna (rad 30 i figuren) hamnar på marken, y 74–78
      const img = G.figurBild(h.id);
      if(!img){ return; }
      if(!img.complete){ laddar.push(img); return; }
      ctx.save();
      if(h.nere){ ctx.globalAlpha = .35; }
      const S = G.storlek(h.id), sx = x + Math.round((32-S)/2), sy = y + 30 - Math.round(30*S/32);
      ctx.fillStyle="#0005"; ctx.fillRect(sx+Math.round(S*.28), y+30, Math.round(S*.44), 3);
      const r = h.ruta;
      ctx.drawImage(img, (r%8)*32, Math.floor(r/8)*32, 32, 32, sx, sy, S, S);
      ctx.restore();
      effektPa(h.effekt, sx, sy, S);
      if(h.aktiv){ ctx.fillStyle="#ffd23f"; ctx.fillRect(sx+Math.round(S/2)-2, sy-3, 4, 3); }
      if(h.etikett && h.etikett.length) G.ritaEtiketter(ctx, h.etikett, sx+S/2, sy-1);
      if(h.orn && h.orn.t != null) ornRita = {h, sx, sy, S};
    });
      // Stör-örnen störtdyker in från höger, hackar Potus i huvudet och flyger iväg (ritas sist så att den syns överst)
      if(ornRita){ const {h, sx, sy, S} = ornRita;
        const ob = G.npcBild("storn");
        if(ob.complete && ob.naturalWidth){
          const t = h.orn.t, mx = sx + 6, my = sy - 16, ease = u => u*u*(3-2*u);
          let ox, oy;
          if(t < .5){ const u = ease(t/.5); ox = W + 10 + (mx - W - 10)*u; oy = -30 + (my + 30)*u; }
          else if(t < .72){ ox = mx + ((Math.floor(t*60)%2) ? 1 : -1); oy = my + ((Math.floor(t*40)%2) ? 2 : 0); }
          else { const u = ease((t-.72)/.28); ox = mx + (-70)*u; oy = my + (-60)*u; }
          G.ritaRuta(ctx, ob, h.orn.ruta, Math.round(ox), Math.round(oy), 30);
          if(t >= .5 && h.orn.d) ritaText(ctx, "-"+h.orn.d, sx+S/2, sy-2, "#ff5a4a");
        }
      }
    if(laddar.length) laddar.forEach(img=>img.addEventListener("load",()=>G.ritaScen(...argsKopia),{once:true}));
  }
  // NPC:er (mötespersoner och husdjur) står till höger och vänder sig mot hjältarna
  if(npcer && npcer.length){
    npcer.forEach((n,i)=>{
      const img = n.fiende ? G.fiendeBild(n.fiende) : G.npcBild(n.ark);
      if(!img) return;
      if(!(img.complete && img.naturalWidth)){ omRitaVid(img); return; }
      const r = n.fiende ? G.fiendeRuta(n.fiende, n.ruta, false) : n.ruta;
      const x = n.x != null ? n.x : (i===0 ? 100 : 126), fot = n.fot != null ? n.fot : (i===0 ? 77 : 74) + markNer;
      ctx.fillStyle="#0005"; ctx.fillRect(x+7, fot-1, 18, 3);
      ctx.save();
      if(n.spegel !== false){ ctx.translate(x+32, fot-30); ctx.scale(-1,1); } else ctx.translate(x, fot-30);
      if(n.fiende) ctx.drawImage(img, ...fiendeKalla(n.fiende, r), 0, 0, 32, 32);
      else ctx.drawImage(img, (r%8)*32, Math.floor(r/8)*32, 32, 32, 0, 0, 32, 32);
      ctx.restore();
    });
  }
  // fiender
  if(fiender && fiender.length){
    const levande = fiender.filter(f=>f.kp>0||f.visa);
    const n = levande.length, start = harHjaltar ? 74 : 10, slut = W - 2, vantar = [];
    // Storlek: egna pixelfigurer (32×32) i naturlig storlek, bossar 1,5 gånger större, draken dubbelt.
    const mått = levande.map(f=>{ const egen = G.fiendeBild(f.fid) && G.fiendeRutor(f.fid).length;
      const vis = egen && RUTNAT[f.fid] && RUTNAT[f.fid].vis;
      const sk = vis ? vis/32 : egen ? (f.boss ? (f.stor ? 2 : 1.5) : 1) : (f.boss ? 3 : (f.liten?1:2)); return {egen, sk, w: egen ? Math.round(32*sk) : 16*sk}; });
    const summa = mått.reduce((a,m)=>a+m.w,0), luft = slut - start - summa;
    const mellan = n>1 ? Math.min(8, luft/(n-1)) : 0;                       // negativt = de står lite omlott
    let xNu = start + Math.max(0, (luft - mellan*(n-1))/2);
    let xPos = mått.map(m=>{ const x=Math.round(xNu); xNu += m.w + mellan; return x; });
    // En jätteboss (t.ex. draken) står längst till höger, och hantlangarna ställer sig framför den, närmare hjältarna
    const jatte = levande.findIndex((f,i)=>RUTNAT[f.fid] && RUTNAT[f.fid].vis && mått[i].egen);
    if(jatte >= 0 && luft < 0){
      const ovr = levande.map((f,i)=>i).filter(i=>i!==jatte), bred = ovr.reduce((a,i)=>a+mått[i].w,0);
      let xx = start + 2;
      xPos = mått.map(()=>0); xPos[jatte] = W - mått[jatte].w;
      ovr.forEach(i=>{ xPos[i] = Math.round(xx); xx += Math.max(14, Math.min(mått[i].w, (W - start - 30 - bred)/Math.max(1,ovr.length) + mått[i].w)); });
      // rita jätten först så att hantlangarna syns framför den
      const ordning = [jatte, ...ovr];
      levande.splice(0, levande.length, ...ordning.map(i=>levande[i])); 
      const m2 = ordning.map(i=>mått[i]), x2 = ordning.map(i=>xPos[i]);
      mått.splice(0, mått.length, ...m2); xPos = x2;
    }
    levande.forEach((f,i)=>{
      const img = G.fiendeBild(f.fid), rutor = G.fiendeRutor(f.fid);
      const {egen, sk, w} = mått[i];
      const x = Math.max(start-4, Math.min(W-w, xPos[i])), fot = 76 + (i%2 ? 2 : 0) + markNer;
      const y = egen ? fot - Math.round(30*sk) : fot - 16*sk + (f.liten?1:0);
      ctx.globalAlpha = f.kp>0 ? 1 : .25;
      ctx.fillStyle="#0005"; ctx.fillRect(x+Math.round(w*.2), fot-1, Math.round(w*.6), 3);
      if(egen){
        if(!(img.complete && img.naturalWidth)){ vantar.push(img); ctx.globalAlpha=1; return; }
        const dod = f.kp <= 0, ligger = dod && G.fiendeLigger(f.fid);
        const r = G.fiendeRuta(f.fid, f.ruta, dod, i);
        if(ligger) ctx.globalAlpha = .9;   // döda fiender ligger kvar på marken i stället för att blekna
        ctx.save(); ctx.translate(x+w, Math.max(0,y)); ctx.scale(-1,1);   // spegelvänd så att fienden tittar mot hjältarna
        ctx.drawImage(img, ...fiendeKalla(f.fid, r), 0, 0, w, w);
        ctx.restore();
      } else G.ritaSprite(ctx, f.sprite, x, Math.max(0,y), sk, PALETT_FOR[f.fid]||f.sprite, i%2===1);
      ctx.globalAlpha = 1;
      effektPa(f.effekt, x, Math.max(0,y), egen ? w : Math.max(24, w));
      if(f.markerad){ ctx.fillStyle="#ffd23f"; ctx.fillRect(x+w/2-2, Math.max(0,y)-3, 4, 3); }
      if(f.etikett && f.etikett.length) G.ritaEtiketter(ctx, f.etikett, x+w/2, Math.max(10,y)-1);
    });
    if(vantar.length) [...new Set(vantar)].forEach(img=>img.addEventListener("load",()=>G.ritaScen(...argsKopia),{once:true}));
  }
};
function tradd(ctx,x,y,h,farg){ ctx.fillStyle=farg; for(let i=0;i<h;i+=3){ const w=Math.max(2,Math.floor((i/h)*12)); ctx.fillRect(x-w/2,y+i,w,3);} ctx.fillRect(x-1,y+h,2,4); }
function hex(c){ c=c.replace("#",""); if(c.length===3)c=c.split("").map(x=>x+x).join(""); return [0,2,4].map(i=>parseInt(c.substr(i,2),16)); }
function tillHex(a){ return "#"+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join(""); }
function blanda(a,b,t){ const A=hex(a),B=hex(b); return tillHex(A.map((v,i)=>v+(B[i]-v)*t)); }
function mork(c,t){ return tillHex(hex(c).map(v=>v*(1-t))); }
function ljus(c,t){ return tillHex(hex(c).map(v=>v+(255-v)*t)); }

// ---------- Hjälteporträtt (24×24, ritas med kod) ----------
const UTSEENDE = {
 monika:{hud:"#e2a983",har:"#5a3218",klader:"#6b4a2a",hatt:"bjornhatt"},
 gofnagrim:{hud:"#e7b08c",har:"#8a2f1c",klader:"#3f5a8a",hatt:"trollhatt"},
 gaston:{hud:"#dba57d",har:"#2b1d12",klader:"#4e5a2c",skagg:"stubb"},
 tola:{hud:"#f0c09a",har:"#c98a3a",klader:"#8c929c",hatt:"hjalm"},
 dagny:{hud:"#f3d6bf",har:"#e8e0c8",klader:"#5b3a7a",hatt:"trollhatt"},
 pescatore:{hud:"#f0cfb0",har:"#2c1a0c",klader:"#8a3a3a"},
 kevin:{hud:"#8a5a2e",nabb:"#e89a2e",klader:"#2a2a30"},
 ned:{hud:"#f4f1ea",nabb:"#f0a030",klader:"#5c3d22"},
 shinji:{hud:"#e6be96",har:"#141414",klader:"#6b4a2a",knut:true},
 bongo:{hud:"#e7b08c",har:"#c4421c",klader:"#7d6a52"},
 saganoren:{hud:"#f6dcc6",har:"#e8c35a",klader:"#2f6a5a"},
 teaol:{hud:"#f0d2bc",har:"#3a2a1a",klader:"#2c3f6a",hatt:"trollhatt"},
 trolleriolas:{hud:"#f0d6c0",har:"#9a7a4a",klader:"#4a6a3a",hatt:"trollhatt"},
 kristina:{hud:"#d9a07a",har:"#2a2a2a",klader:"#6a2a5a",hatt:"trollhatt",mustasch:true},
 larzone:{hud:"#e0b08a",har:"#4a2a12",klader:"#8a7a3a"},
 malexander:{hud:"#7c9a4a",har:"#d8b23a",klader:"#7a7f86"},
 ff:{hud:"#5f8a6a",klader:"#7a5a2a"},
 galfner:{hud:"#f0d6c0",har:"#1a1a1a",klader:"#3a3a5a"},
 uranus:{hud:"#e8b894",har:"#b07a3a",klader:"#2a3a6a"},
 vad:{hud:"#e8b894",har:"#7a5a3a",klader:"#a0522d"},
 potus:{hud:"#d9a57c",har:"#4a3a2a",klader:"#6a6a6a"},
 bacon:{hud:"#e2a983",har:"#e0d8c8",klader:"#5c3d22"},
 alfred:{hud:"#e8c0a0",har:"#a08a5a",klader:"#7a7a6a"}
};
// ---------- Hjältarnas pixelfigurer (bilder i figurer/) ----------
// ---------- Väder ----------
// Vilka miljöer det kan regna i (inte grottor, kloaker eller öknen) och hur ofta: 1 rum på 4.
const REGNMILJO = {port_ute:1, klippa:1, vatten_ute:1, skog:1, berg:1, ruin:1, gravfalt:1, trask:1, bududuoar:1, vag:1, boss_harpyor:1, boss_dodasjon:1};
G.vader = (miljo, fro) => {
  if(!REGNMILJO[miljo] || !(window.BAKGRUND.harEgen && window.BAKGRUND.harEgen(miljo))) return null;
  const h = Math.imul((fro||7) >>> 0, 2654435761) >>> 0;
  return (h >>> 7) % 4 === 0 ? "regn" : null;
};
// Regnlagret: en genomskinlig canvas ovanpå scenen i TV:n. Ett gemensamt animationsvarv ritar alla som finns.
const REGN = { aktiv:false, droppar:[], stank:[], blixt:0, nastaBlixt:0, senast:0 };
const STILLA = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function nyDroppe(overst){ return { x: Math.random()*360, y: overst ? -Math.random()*40 : Math.random()*180, v: 210 + Math.random()*120, l: 4 + Math.floor(Math.random()*4), fot: 128 + Math.random()*52, ljus: Math.random() < .3 }; }
function ritaRegn(c){
  const x = c.getContext("2d"); x.clearRect(0, 0, 320, 180);
  if(REGN.blixt > 0){ x.fillStyle = `rgba(230,236,255,${Math.min(.45, REGN.blixt*2.2)})`; x.fillRect(0, 0, 320, 180); }
  for(const d of REGN.droppar){
    x.fillStyle = d.ljus ? "rgba(214,226,240,.75)" : "rgba(160,178,200,.55)";
    for(let i=0;i<d.l;i++) x.fillRect(Math.round(d.x - i*0.35), Math.round(d.y - i), 1, 1);
  }
  x.fillStyle = "rgba(200,214,232,.7)";
  for(const s of REGN.stank){ const X=Math.round(s.x), Y=Math.round(s.y);
    if(s.t < .08){ x.fillRect(X, Y-1, 1, 1); } else { x.fillRect(X-1, Y-1, 1, 1); x.fillRect(X+1, Y-1, 1, 1); } }
}
function regnSteg(t){
  const lager = [...document.querySelectorAll("canvas.vader")].filter(c=>c.isConnected);
  if(!lager.length){ REGN.aktiv = false; return; }
  const dt = Math.min(.05, REGN.senast ? (t - REGN.senast)/1000 : .016); REGN.senast = t;
  for(const d of REGN.droppar){
    d.y += d.v*dt; d.x -= d.v*dt*0.35;
    if(d.y >= d.fot){ if(Math.random() < .5) REGN.stank.push({x:d.x, y:d.fot, t:0}); Object.assign(d, nyDroppe(true)); }
  }
  REGN.stank.forEach(s=>s.t += dt); REGN.stank = REGN.stank.filter(s=>s.t < .16);
  // ibland en blixt långt bort
  if(!REGN.nastaBlixt) REGN.nastaBlixt = t + 9000 + Math.random()*16000;
  if(t > REGN.nastaBlixt){ REGN.blixt = .2; REGN.nastaBlixt = t + 9000 + Math.random()*16000; }
  if(REGN.blixt > 0){ REGN.blixt -= dt; if(REGN.blixt > .08 && REGN.blixt < .12) REGN.blixt = .05; }
  lager.forEach(ritaRegn);
  requestAnimationFrame(regnSteg);
}
G.regnLager = (canvas, pa) => {
  const tv = canvas.parentElement;
  if(!tv || !tv.classList.contains("tv")) return;
  let ov = tv.querySelector("canvas.vader");
  if(!pa){ if(ov) ov.remove(); return; }
  if(!ov){ ov = document.createElement("canvas"); ov.className = "px vader"; ov.width = 320; ov.height = 180; ov.setAttribute("aria-hidden","true"); canvas.after(ov); }
  if(!REGN.droppar.length) for(let i=0;i<150;i++) REGN.droppar.push(nyDroppe(false));
  if(STILLA){ ritaRegn(ov); return; }
  if(!REGN.aktiv){ REGN.aktiv = true; REGN.senast = 0; requestAnimationFrame(regnSteg); }
};

// Miljöer där marken i den målade bilden ligger längre ner, så att figurerna inte svävar (pixlar i 160×90)
// (nyckeln kan vara en miljö eller en enskild bild, t.ex. klyfta_ute2)
const MARK_NER = { basar: 9, port_inne: 6, port_ute: 6, klippa: 6, boss_orch: 5, boss_svartalf: 3, boss_dodasjon: 7, boss_drake: 6, boss_grip: 6, boss_harpyor: 6, tehandeln: 6, vag1: 6, vag2: 6, vag3: 6, vag4: 6, skog3: 6, skog3natt: 6, klyfta_ute: -13, klyfta_ute2: -13, klyfta_inne: -18, klyfta_inne2: -19 };
// Hur tätt hjältarna står (pixlar mellan dem). Vid klyftan står de tätare så att alla får plats på kanten.
const HJ_STEG = { klyfta_ute: 9, klyfta_inne: 9, lager_ute: 12, lager_inne: 12, lager_inne2: 9 };
// Var den första hjälten står (x i 160×90). Vid klyftan börjar de längre till vänster så att ingen hamnar över kanten.
const HJ_START = { klyfta_ute: -3, klyfta_inne: -3, lager_inne2: -3 };
// Miljöer som använder den målade klyftan utomhus – övriga (grotta, kloak) får klyftan inomhus
const KLYFTA_UTE = { port_ute:1, klippa:1, vatten_ute:1, boss_grip:1, boss_harpyor:1, boss_dodasjon:1, skog:1, berg:1, oken:1, ruin:1, gravfalt:1, trask:1, vesselberget:1, bududuoar:1, vag:1 };
// Gåtan i sten: en förseglad dörr som stänger vägen, målad för varje sorts miljö
const GATA = { grotta:"gata_inne", gruva:"gata_inne_gruva", gruva_kult:"gata_inne_gruva", kloak:"gata_inne_kloak",
  ruin:"gata_ute_ruin", vesselberget:"gata_ute_ruin", oken:"gata_ute_oken" };
// (port och vatten väljer inne- eller utebild efter miljön; ruiner räknas som ute)
const INNE_MILJO = { grotta:1, kloak:1, gruva:1, gruva_kult:1, boss_orch:1, boss_svartalf:1, boss_drake:1 };

// ---------- Stenporten med gåtan (ritas med kod i full upplösning, 320×180) ----------
// cx = mitten, fot = markens höjd. Två pelare och en överliggare av huggen sten, mörk gång emellan
// och en inristad gåta som lyser svagt blått.
function ritaStenport(ctx, cx, fot, fro){
  const r = slump((fro||7)*13+1);
  ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled = false;
  // färgen på marken där porten står – stenen tonas lite mot den så att den hör hemma i miljön
  let ton = [90,88,92];
  try{ const d = ctx.getImageData(cx-20, fot-3, 40, 3).data; let a=[0,0,0], n=0; for(let k=0;k<d.length;k+=4){ a[0]+=d[k]; a[1]+=d[k+1]; a[2]+=d[k+2]; n++; } ton = a.map(v=>v/n); }catch(e){}
  const blanda = (c,t)=>`rgb(${c.map((v,k)=>Math.round(v+(ton[k]-v)*t)).join(",")})`;
  const STEN=[[104,100,104],[92,89,94],[116,111,112],[84,82,88]], LJUS=[150,145,142], SKUGGA=[58,56,62];
  const OX = 40, IX = 21, HP = 54, FOT = fot;           // ytterhalvbredd, öppningens halvbredd, pelarhöjd
  const topp = FOT - HP - OX;                            // högsta punkten på valvet
  // är (x,y) sten? Pelare upp till HP, sedan ett halvrunt valv. Ytterkanten är lite ojämn och sliten.
  const ytter = (x,y)=>{ const dx=x-cx, h=FOT-y; if(h<0) return false; if(h<=HP) return Math.abs(dx)<=OX; const u=h-HP; return dx*dx+u*u <= OX*OX; };
  const inre  = (x,y)=>{ const dx=x-cx, h=FOT-y; if(h<0) return false; if(h<=HP) return Math.abs(dx)<IX; const u=h-HP; return dx*dx+u*u < IX*IX; };
  const nagg = {}; for(let k=0;k<60;k++) nagg[(Math.floor(r()*OX*2))+","+Math.floor(r()*3)] = 1;
  // skugga på marken
  ctx.fillStyle="rgba(0,0,0,.35)"; ctx.fillRect(cx-OX-4, FOT-2, OX*2+8, 4);
  // gången: mörk, med blåaktig dimma längst ner
  for(let y=topp; y<FOT; y++) for(let x=cx-IX; x<cx+IX; x++) if(inre(x,y)){
    const t = (y - (FOT-HP-IX))/(HP+IX); ctx.fillStyle = `rgb(${10+t*8|0},${10+t*12|0},${16+t*22|0})`; ctx.fillRect(x,y,1,1); }
  // stenarna: block i rader (pelare) och kilstenar (valv)
  const blockId = (x,y)=>{ const h=FOT-y, dx=x-cx;
    if(h<=HP){ const rad=Math.floor(h/11), off=(rad%2)*6; return "p"+rad+"_"+Math.floor((dx+OX+off)/((dx<0)?19:19)); }
    const ang = Math.atan2(h-HP, dx); return "v"+Math.floor(ang/(Math.PI/9)); };
  const fargOf = {};
  for(let y=topp-1; y<=FOT; y++) for(let x=cx-OX-1; x<=cx+OX+1; x++){
    if(!ytter(x,y) || inre(x,y)) continue;
    const ut = !ytter(x,y-1)||!ytter(x-1,y)||!ytter(x+1,y);
    if(ut && nagg[(x-cx+OX)+","+((x*7+y)%3)]) continue;           // slitna kanter
    const id = blockId(x,y); if(!fargOf[id]) fargOf[id] = STEN[Math.floor(r()*STEN.length)];
    let c = fargOf[id];
    const fog = blockId(x,y)!==blockId(x,y-1) || blockId(x,y)!==blockId(x-1,y);
    const kantIn = inre(x+1,y)||inre(x-1,y)||inre(x,y+1)||inre(x,y-1);
    if(fog) c = SKUGGA; else if(ut) c = (x<cx? LJUS : SKUGGA); else if(kantIn) c = SKUGGA;
    else if(blockId(x+1,y)!==id || blockId(x,y+1)!==id) c = c.map(v=>v*.82); else if(blockId(x-1,y)!==id || blockId(x,y-1)!==id) c = c.map((v,k)=>v+(LJUS[k]-v)*.35);
    const brus = r(); if(brus<.08) c = c.map(v=>v*.85); else if(brus>.95) c = c.map(v=>Math.min(255,v*1.12));
    ctx.fillStyle = blanda(c, .22); ctx.fillRect(x,y,1,1);
  }
  // mörk kontur runt valvet
  ctx.fillStyle="#18171b";
  for(let y=topp-1; y<=FOT; y++) for(let x=cx-OX-1; x<=cx+OX+1; x++) if(!ytter(x,y) && (ytter(x+1,y)||ytter(x-1,y)||ytter(x,y+1))) ctx.fillRect(x,y,1,1);
  // mossa nertill och i fogarna
  for(let k=0;k<14;k++){ const x = cx + (r()<.5?-1:1)*(IX + 2 + r()*(OX-IX-4)), y = FOT - 2 - r()*(k<8?10:HP);
    ctx.fillStyle = "#4d6a3a"; ctx.fillRect(x|0, y|0, 3, 1); ctx.fillStyle="#6b8c4c"; ctx.fillRect((x|0)+1, (y|0)-1, 1, 1); }
  // gåtan: runor inristade runt valvbågen, med ett svagt blått sken
  const GLYF = ["010111010","111101111","100111001","011010110","101010101","110011001","001111100","111010010","010101010","101111101"];
  const antal = 9;
  for(let k=0;k<antal;k++){
    const a = Math.PI*(.12 + .76*k/(antal-1)), rr = (OX+IX)/2;
    const gx = Math.round(cx + Math.cos(a)*rr) - 1, gy = Math.round(FOT - HP - Math.sin(a)*rr) - 1;
    ctx.fillStyle = "rgba(110,190,255,.22)"; ctx.fillRect(gx-1, gy-1, 5, 5);
    const g = GLYF[Math.floor(r()*GLYF.length)];
    for(let q=0;q<9;q++) if(g[q]==="1"){ ctx.fillStyle = "#a8e0ff"; ctx.fillRect(gx + q%3, gy + Math.floor(q/3), 1, 1); }
  }
  // slutstenen överst: en inristad cirkel med ett öga, gåtans tecken
  const ky = topp + 6;
  ctx.fillStyle = "rgba(110,190,255,.18)"; ctx.fillRect(cx-6, ky-6, 12, 12);
  ctx.fillStyle = "#a8e0ff";
  [[-3,-4],[-1,-5],[1,-5],[3,-4],[4,-2],[4,0],[3,2],[1,3],[-1,3],[-3,2],[-4,0],[-4,-2]].forEach(([dx,dy])=>ctx.fillRect(cx+dx, ky+dy, 1, 1));
  ctx.fillRect(cx-1, ky-2, 2, 2); ctx.fillStyle="#e8f6ff"; ctx.fillRect(cx-1, ky-2, 1, 1);
  ctx.restore();
}

// ---------- Lägereld som brinner och ryker ----------
// Var elden står i varje lägerbild (320×180-pixlar): x = mitten, y = där lågorna börjar, s = storlek
const ELDAR = { lager_ute:{x:162, y:134, s:6}, lager_ute2:{x:160, y:153, s:9}, lager_inne:{x:160, y:134, s:9}, lager_inne2:{x:120, y:131, s:9} };
const ELD = { senast:0, gnistor:[], rok:[] };
function ritaEld(c, e, t){
  const x = c.getContext("2d"); x.clearRect(0, 0, 320, 180);
  const S = e.s, T = t/1000;
  // varmt sken på marken som pulserar
  const puls = .14 + .05*Math.sin(T*9) + .03*Math.sin(T*23);
  const g = x.createRadialGradient(e.x, e.y-S*.6, 1, e.x, e.y-S*.6, S*5);
  g.addColorStop(0, `rgba(255,170,70,${puls})`); g.addColorStop(1, "rgba(255,140,40,0)");
  x.fillStyle = g; x.fillRect(e.x-S*5, e.y-S*6, S*10, S*7);
  // lågorna: en kolumn per pixel, höjden fladdrar
  const halv = Math.round(S*.7);
  for(let dx=-halv; dx<=halv; dx++){
    const kant = 1 - Math.abs(dx)/(halv+1);
    const h = Math.max(1, Math.round(S*1.5*kant*(.65 + .35*Math.sin(T*11 + dx*1.7) + .2*Math.sin(T*27 + dx*3.1))));
    for(let k=0; k<h; k++){
      const u = k/h;
      x.fillStyle = u < .3 ? "#fff3b0" : u < .55 ? "#ffd04a" : u < .8 ? "#ff8a2a" : "#e04a20";
      if(u > .8 && Math.abs(dx) > halv*.6) continue;   // spetsiga toppar
      x.fillRect(e.x + dx, e.y - k, 1, 1);
    }
  }
  // gnistor
  x.fillStyle = "#ffd36a";
  ELD.gnistor.forEach(p=>{ if(p.e===e){ x.globalAlpha = Math.max(0, 1 - p.t/p.liv); x.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); } });
  // rök
  ELD.rok.forEach(p=>{ if(p.e===e){ const a = .28*(1 - p.t/p.liv); x.fillStyle = `rgba(150,150,160,${a})`; const z = Math.round(2 + p.t*3); x.fillRect(Math.round(p.x - z/2), Math.round(p.y - z/2), z, z); } });
  x.globalAlpha = 1;
}
function eldSteg(t){
  const lager = [...document.querySelectorAll("canvas.eld")].filter(c=>c.isConnected && c._eld);
  if(!lager.length){ ELD.aktiv = false; ELD.gnistor = []; ELD.rok = []; return; }
  const dt = Math.min(.05, ELD.senast ? (t - ELD.senast)/1000 : .016); ELD.senast = t;
  lager.forEach(c=>{ const e = c._eld;
    if(Math.random() < dt*6) ELD.gnistor.push({e, x:e.x + (Math.random()-.5)*e.s, y:e.y - e.s, vx:(Math.random()-.5)*8, vy:-18 - Math.random()*14, t:0, liv:.6 + Math.random()*.8});
    if(Math.random() < dt*4) ELD.rok.push({e, x:e.x + (Math.random()-.5)*e.s*.5, y:e.y - e.s*1.5, vx:3 + Math.random()*4, vy:-8 - Math.random()*5, t:0, liv:2.5 + Math.random()*1.5});
  });
  [...ELD.gnistor, ...ELD.rok].forEach(p=>{ p.t += dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vx += (Math.random()-.5)*20*dt; });
  ELD.gnistor = ELD.gnistor.filter(p=>p.t < p.liv); ELD.rok = ELD.rok.filter(p=>p.t < p.liv);
  lager.forEach(c=>ritaEld(c, c._eld, t));
  requestAnimationFrame(eldSteg);
}
G.eldLager = (canvas, eld) => {
  const tv = canvas.parentElement;
  if(!tv || !tv.classList.contains("tv")) return;
  let ov = tv.querySelector("canvas.eld");
  if(!eld){ if(ov) ov.remove(); return; }
  if(!ov){ ov = document.createElement("canvas"); ov.className = "px eld"; ov.width = 320; ov.height = 180; ov.setAttribute("aria-hidden","true"); canvas.after(ov); }
  ov._eld = eld;
  if(STILLA){ ritaEld(ov, eld, 0); return; }
  if(!ELD.aktiv){ ELD.aktiv = true; ELD.senast = 0; requestAnimationFrame(eldSteg); }
};

const BILDER = {};
// Storlek i pixlar: alla hjältar ritas i full storlek (32×32). Att förminska figurerna gjorde pixlarna suddiga.
G.storlek = () => 32;
G.figurBild = id => {
  if(!window.FIGURER || !window.FIGURER[id]) return null;
  if(!BILDER[id]){ const img = new Image(); img.src = "figurer/"+id+".png"; BILDER[id] = img; }
  return BILDER[id];
};
G.figurRutor = id => (window.FIGURER && window.FIGURER[id]) || [];
// Bakhuvudet Jens vagnar i npc/jens_vagn.png: läge i bilden (x, y, bredd, höjd) och relingens höjd från vagnens överkant
const VAGNAR = [
  {x:15,y:10,b:108,h:46,rel:19},{x:139,y:10,b:111,h:46,rel:21},
  {x:12,y:74,b:111,h:46,rel:21},{x:138,y:74,b:113,h:46,rel:21},
  {x:10,y:134,b:113,h:51,rel:25},{x:133,y:134,b:118,h:51,rel:25}
];
G.antalVagnar = VAGNAR.length;
// ---------- Flygande siffror i TV:n (skada, läkning, MISS) ----------
// Egen pixelfont 3×5 som ritas dubbelt så stor med svart kant, så att den syns tydligt.
const TECKEN = {"0":"111101101101111","1":"010110010010111","2":"111001111100111","3":"111001111001111","4":"101101111001001",
  "5":"111100111001111","6":"111100111101111","7":"111001010010010","8":"111101111101111","9":"111101111001111",
  "-":"000000111000000","+":"000010111010000","M":"101111111101101","I":"111010010010111","S":"111100111001111"};
function ritaText(ctx, text, cx, botten, farg){
  const z = 2, bredd = text.length*4*z - z, x0 = Math.round(cx - bredd/2), y0 = Math.round(botten - 5*z);
  const pix = (col) => { for(let k=0;k<text.length;k++){ const g = TECKEN[text[k]]; if(!g) continue;
    for(let i=0;i<15;i++) if(g[i]==="1"){ const px=x0+k*4*z+(i%3)*z, py=y0+Math.floor(i/3)*z; col(px,py); } } };
  ctx.fillStyle = "#000"; pix((px,py)=>ctx.fillRect(px-1,py-1,z+2,z+2));
  ctx.fillStyle = farg; pix((px,py)=>ctx.fillRect(px,py,z,z));
}
G.ritaEtiketter = (ctx, lista, cx, botten) => { lista.slice(-3).forEach((e,i)=>ritaText(ctx, e.text, cx, Math.max(11, botten - i*12), e.farg)); };
// Liten ikon (en ruta ur ett ark) i en egen canvas, för menyer och listor
G.ritaIkon = (canvas, ark, ruta) => {
  const ctx = canvas.getContext("2d"); canvas.width=32; canvas.height=32; ctx.imageSmoothingEnabled=false;
  const img = G.npcBild(ark), rita = () => { ctx.clearRect(0,0,32,32); G.ritaRuta(ctx, img, ruta, 0, 0, 32); };
  if(img.complete && img.naturalWidth) rita(); else img.addEventListener("load", rita, {once:true});
};
// Ritar en ruta (0–63) ur ett 8×8-ark med 32×32-rutor
G.ritaRuta = (ctx, img, ruta, x, y, storlek, spegel) => {
  const z = storlek || 32;
  ctx.save();
  if(spegel){ ctx.translate(x+z, y); ctx.scale(-1,1); ctx.drawImage(img, (ruta%8)*32, Math.floor(ruta/8)*32, 32, 32, 0, 0, z, z); }
  else ctx.drawImage(img, (ruta%8)*32, Math.floor(ruta/8)*32, 32, 32, x, y, z, z);
  ctx.restore();
};
// NPC-ark (bilder i npc/): "stad" = stadsbor, "by" = bybor, "djur" = husdjur. Alla rutor 0–63 har en figur.
const NBILDER = {};
G.npcBild = ark => { if(!NBILDER[ark]){ const img=new Image(); img.src="npc/"+ark+".png"; NBILDER[ark]=img; } return NBILDER[ark]; };
// Ritar en enskild NPC-figur i en egen liten canvas (används t.ex. för försäljarna i basaren)
// Spelledaren Isak: figurark npc/isak.png (8×8 rutor) när det finns, annars spelets tjugosidiga tärning
G.ritaIsak = (canvas, nr) => {
  const ctx = canvas.getContext("2d"); canvas.width = 32; canvas.height = 32; ctx.imageSmoothingEnabled = false;
  const ark = G.npcBild("isak");
  if(ark.complete && ark.naturalWidth){ ctx.clearRect(0,0,32,32); G.ritaRuta(ctx, ark, (nr>>>0)%64, 0, 0, 32); return; }
  if(!ark.complete){ ark.addEventListener("load", ()=>G.ritaIsak(canvas, nr), {once:true}); ark.addEventListener("error", ()=>G.ritaIsak(canvas, nr), {once:true}); }
  const d20 = G.npcBild("../icons/icon-192");
  const rita = () => { ctx.clearRect(0,0,32,32); ctx.imageSmoothingEnabled = true; ctx.drawImage(d20, 2, 2, 28, 28); };
  if(d20.complete && d20.naturalWidth) rita(); else d20.addEventListener("load", rita, {once:true});
};
G.ritaNpc = (canvas, ark, ruta, spegel) => {
  const ctx = canvas.getContext("2d"); canvas.width=32; canvas.height=32; ctx.imageSmoothingEnabled=false;
  const img = G.npcBild(ark);
  const rita = () => { ctx.clearRect(0,0,32,32); ctx.save(); if(spegel){ ctx.translate(32,0); ctx.scale(-1,1); } ctx.drawImage(img,(ruta%8)*32,Math.floor(ruta/8)*32,32,32,0,0,32,32); ctx.restore(); };
  if(img.complete && img.naturalWidth) rita(); else img.addEventListener("load", rita, {once:true});
};
// Fiendernas pixelfigurer (bilder i fiender/)
const FBILDER = {};
// De flesta fiendeark har 8×8 rutor på 32×32. Ark med större rutor anges här: c = rutans storlek, n = rutor per rad,
// vis = hur bred figuren ritas i TV:n (i 160×90-pixlar; 96 = tre gånger arkets pixlar i den höga upplösningen).
const RUTNAT = { drake: {c:64, n:4, vis:96} };
const rutnat = fid => RUTNAT[fid] || {c:32, n:8};
G.fiendeRutnat = rutnat;
G.fiendeRutor = fid => RUTNAT[fid] ? [...Array(RUTNAT[fid].n*RUTNAT[fid].n).keys()] : ((window.FIENDEFIGURER && window.FIENDEFIGURER[fid]) || []);
const fiendeKalla = (fid, r) => { const g = rutnat(fid); return [(r%g.n)*g.c, Math.floor(r/g.n)*g.c, g.c, g.c]; };
G.fiendeBild = fid => {
  if(!G.fiendeRutor(fid).length) return null;
  if(!FBILDER[fid]){ const img = new Image(); img.src = "fiender/"+fid+".png"; FBILDER[fid] = img; }
  return FBILDER[fid];
};
// Fiendearken innehåller också rutor där fienden ligger död eller håller på att försvinna.
// När arket har laddats mäts varje ruta: "upp" = står upp (nästan lika hög som fiendens vanliga höjd och ordentligt fylld),
// "ligger" = mycket lägre än vanligt (en död kropp). Tomma rutor och halvt fallna rutor används inte för levande fiender.
const FDELAR = {};
function fiendeDelar(fid){
  if(FDELAR[fid]) return FDELAR[fid];
  const img = G.fiendeBild(fid); if(!(img && img.complete && img.naturalWidth)) return null;
  try{
    const g = rutnat(fid), S = g.c*g.n;
    const c = document.createElement("canvas"); c.width = S; c.height = S;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, S, S).data;
    const info = [];
    for(let r=0;r<g.n*g.n;r++){ let n=0, y0=999, y1=-1; const cx=(r%g.n)*g.c, cy=Math.floor(r/g.n)*g.c;
      for(let y=0;y<g.c;y++) for(let xx=0;xx<g.c;xx++) if(d[((cy+y)*S+cx+xx)*4+3] >= 128){ n++; if(y<y0) y0=y; if(y>y1) y1=y; }
      info.push({r, n, h: n ? y1-y0+1 : 0}); }
    const mitt = l => { const v=[...l].sort((a,b)=>a-b); return v[Math.floor(v.length/2)] || 0; };
    const fyllda = info.filter(i=>i.n), median = mitt(fyllda.map(i=>i.n)), mh = mitt(fyllda.map(i=>i.h));
    // jämför med fiendens vanliga höjd, så att låga djur (råttor) inte räknas som liggande
    const upp = fyllda.filter(i=>i.h >= mh*0.8 && i.n >= median*0.5).map(i=>i.r);
    const ligger = fyllda.filter(i=>i.h < mh*0.6).map(i=>i.r);
    return FDELAR[fid] = {upp: upp.length ? upp : info.filter(i=>i.n).map(i=>i.r), ligger};
  }catch(e){ return FDELAR[fid] = {upp: G.fiendeRutor(fid), ligger: []}; }
}
// Vilken ruta som ska visas: en stående för levande fiender, en liggande för döda (om arket har någon)
G.fiendeRuta = (fid, ruta, dod, nr) => {
  const rutor = G.fiendeRutor(fid), del = fiendeDelar(fid);
  let r = rutor.includes(ruta) ? ruta : rutor[0];
  if(!del) return r;
  if(dod && del.ligger.length) return del.ligger[(nr||0) % del.ligger.length];
  return del.upp.includes(r) ? r : del.upp[(r>>>0) % del.upp.length];
};
G.fiendeLigger = (fid) => { const del = fiendeDelar(fid); return !!(del && del.ligger.length); };
// Ritar en figur (ruta 0–63) i en canvas. Faller tillbaka på det kodritade porträttet om bild saknas.
G.ritaPortratt = (canvas, hjalte, dod, ruta) => {
  const img = G.figurBild(hjalte.id), rutor = G.figurRutor(hjalte.id);
  if(!img || !rutor.length) return G.ritaKodPortratt(canvas, hjalte, dod);
  if(ruta==null || !rutor.includes(ruta)) ruta = rutor[0];
  const ctx = canvas.getContext("2d"); canvas.width = 32; canvas.height = 32; ctx.imageSmoothingEnabled = false;
  const rita = () => {
    ctx.clearRect(0,0,32,32);
    ctx.fillStyle = dod ? "#2a2626" : "#2b2219"; ctx.fillRect(0,0,32,32);
    ctx.fillStyle = dod ? "#201c1c" : "#231b13"; ctx.fillRect(0,24,32,8);
    ctx.save();
    if(dod){ ctx.filter = "grayscale(1) brightness(.6)"; ctx.globalAlpha = .7; }
    ctx.drawImage(img, (ruta%8)*32, Math.floor(ruta/8)*32, 32, 32, 0, 0, 32, 32);
    ctx.restore();
  };
  if(img.complete && img.naturalWidth) rita(); else { ctx.fillStyle="#2b2219"; ctx.fillRect(0,0,32,32); img.addEventListener("load", rita, {once:true}); }
};
G.ritaKodPortratt = (canvas, hjalte, dod) => {
  const ctx = canvas.getContext("2d"); canvas.width = 24; canvas.height = 24; ctx.imageSmoothingEnabled = false;
  const u = UTSEENDE[hjalte.id] || {hud:"#e0b090",har:"#4a3020",klader:"#555"};
  const f = hjalte.folk;
  const R = (x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  // bakgrund
  R(0,0,24,24, dod ? "#2a2626" : "#2b2219"); R(0,18,24,6, dod?"#201c1c":"#231b13");
  const K = "#140e0a";
  // axlar
  R(3,19,18,5,K); R(4,20,16,4,u.klader);
  if(f==="Anka"){
    R(6,5,12,13,K); R(7,6,10,11,u.hud); R(8,5,8,1,K);
    R(11,9,2,2,"#111"); R(14,9,2,2,"#111");
    R(15,12,6,3,K); R(16,12,5,2,u.nabb); R(16,14,4,1,mork(u.nabb,.3));
    if(hjalte.id==="kevin"){ R(6,8,12,2,"#2a2a30"); R(10,8,1,1,"#c33"); } // lönnmördarbindel
  } else if(f==="Drakonit"){
    R(5,5,14,13,K); R(6,6,12,11,u.hud); R(12,10,9,5,K); R(13,11,8,3,u.hud);
    R(8,4,2,3,"#d8c7a8"); R(14,4,2,3,"#d8c7a8"); R(9,8,2,2,"#ffd23f"); R(14,8,2,2,"#ffd23f");
    for(let i=0;i<5;i++) R(7+i*2,15,1,1,mork(u.hud,.3));
    R(19,12,1,1,"#111");
  } else {
    const bred = f==="Dvärg"||f==="Orch" ? 1 : 0, kort = f==="Hobbit" ? 1 : 0;
    const x0=6-bred, w=12+bred*2, y0=6+kort, h=12-kort;
    R(x0-1,y0-1,w+2,h+2,K); R(x0,y0,w,h,u.hud);
    // öron
    if(f==="Alv"){ R(x0-3,y0+3,3,2,K); R(x0-2,y0+3,2,1,u.hud); R(x0+w,y0+3,3,2,K); R(x0+w,y0+3,2,1,u.hud); R(x0-3,y0+1,1,2,K); R(x0+w+2,y0+1,1,2,K); }
    if(f==="Hobbit"){ R(x0-2,y0+4,2,3,K); R(x0-1,y0+5,1,1,u.hud); R(x0+w,y0+4,2,3,K); R(x0+w,y0+5,1,1,u.hud); }
    // hår
    if(u.har){ R(x0-1,y0-2,w+2,3,u.har); R(x0-1,y0,2,f==="Alv"?9:4,u.har); R(x0+w-1,y0,2,f==="Alv"?9:4,u.har);
      if(f==="Hobbit"){ for(let i=0;i<w;i+=2) R(x0+i,y0-3,2,1,u.har); } if(u.knut){ R(10,1,4,3,K); R(11,2,2,1,u.har); } }
    // ögon
    const ey = y0+4; R(x0+2,ey,2,2,"#f3eedf"); R(x0+w-4,ey,2,2,"#f3eedf"); R(x0+3,ey+1,1,1,"#111"); R(x0+w-3,ey+1,1,1,"#111");
    if(hjalte.id==="potus"){ R(x0+w,y0+3,2,3,"#2b2219"); } // saknar ett öra
    if(hjalte.id==="kristina"){ R(x0+1,ey+3,2,1,"#5a7a5a"); } // koala-tatuering
    // mun
    R(x0+4,y0+9,w-8,1,mork(u.hud,.45));
    if(f==="Orch"){ R(x0+3,y0+8,1,2,"#efe6cf"); R(x0+w-4,y0+8,1,2,"#efe6cf"); }
    // skägg
    if(f==="Dvärg" && hjalte.kon!=="Kvinna" || hjalte.id==="gofnagrim"){ R(x0,y0+7,w,7,u.har||"#666"); R(x0+2,y0+14,w-4,2,u.har||"#666"); R(x0+4,y0+9,w-8,1,mork(u.har||"#666",.5)); }
    if(u.mustasch){ R(x0+1,y0+8,w-2,1,u.har); R(x0,y0+7,1,1,u.har); R(x0+w-1,y0+7,1,1,u.har); }
    if(u.skagg==="stubb"){ for(let i=0;i<w;i+=2) R(x0+i,y0+10+(i%4?1:0),1,1,mork(u.hud,.4)); }
    // hattar
    if(u.hatt==="trollhatt"){ R(x0-2,y0-2,w+4,2,u.klader); R(x0+1,y0-6,w-2,4,u.klader); R(x0+4,y0-9,w-8,3,u.klader); R(x0+w/2,y0-10,1,1,"#e0b450"); R(x0+1,y0-3,w-2,1,"#e0b450"); }
    if(u.hatt==="hjalm"){ R(x0-1,y0-3,w+2,5,"#8c929c"); R(x0-1,y0-3,w+2,1,"#c0c4ca"); R(x0+w/2-1,y0-5,2,2,"#c33"); }
    if(u.hatt==="bjornhatt"){
      R(x0-2,y0-5,w+4,6,"#5a3218"); R(x0-2,y0-7,3,3,"#5a3218"); R(x0+w-1,y0-7,3,3,"#5a3218");
      R(x0+2,y0-3,2,1,"#111"); R(x0+w-4,y0-3,2,1,"#111"); R(x0+w/2-1,y0-1,2,1,"#111");
      R(x0+w/2-2,y0-10,4,4,"#f4f1ea"); R(x0+w/2+2,y0-8,2,1,"#f0a030"); R(x0+w/2,y0-9,1,1,"#111"); // ankhuvud ovanpå
    }
  }
  if(dod){ ctx.globalCompositeOperation="saturation"; R(0,0,24,24,"#888"); ctx.globalCompositeOperation="source-over"; R(0,0,24,24,"#0006"); }
};

// ---------- Efterriket: poolen på skyskrapetaket i Miami, med björnen Tetrok ----------
// Miami-taket som målad bakgrund (bakgrunder/miami.png, 320×180). Hjältarna och Tetrok sitter i poolen
// med vattenlinjen vid y 78 (i 160×90-koordinater) – allt under den linjen döljs, så att de ser ut att sitta i vattnet.
function ritaPoolMalad(canvas, doda, tetrokRuta, bild){
  const ctx = canvas.getContext("2d");
  canvas.width = 320; canvas.height = 180; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bild, 0, 0);
  ctx.setTransform(2,0,0,2,0,0);
  const VY = 78, R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  const iVattnet = (rita, x, b) => { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 160, VY); ctx.clip(); rita(); ctx.restore();
    R(x+2, VY, b-4, 1, "#b8f6f0"); R(x, VY+1, 4, 1, "#7fe3e8"); R(x+b-4, VY+1, 4, 1, "#7fe3e8"); };
  (doda||[]).slice(0,5).forEach((h,i)=>{
    const img=G.figurBild(h.id); if(!(img && img.complete && img.naturalWidth)){ if(img) img.addEventListener("load",()=>G.ritaPool(canvas, doda),{once:true}); return; }
    const r=h.ruta??(G.figurRutor(h.id)[0]||0), x=14+i*18, y=VY-21+(i%2);
    iVattnet(()=>ctx.drawImage(img,(r%8)*32,Math.floor(r/8)*32,32,32,x,y,32,32), x+6, 20);
  });
  const tb = G.npcBild("tetrok");
  if(tb.complete && tb.naturalWidth){ const tx=118, ty=VY-25; iVattnet(()=>G.ritaRuta(ctx, tb, tetrokRuta, tx, ty, 32, true), tx+3, 26); }
  ctx.setTransform(1,0,0,1,0,0);
}
function ritaPoolRuta(canvas, doda, tetrokRuta){
  const tak = G.npcBild("../bakgrunder/miami");
  if(tak.complete && tak.naturalWidth) return ritaPoolMalad(canvas, doda, tetrokRuta, tak);
  const ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false;
  const W=160, H=90; canvas.width=W; canvas.height=H; ctx.imageSmoothingEnabled = false;
  const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  // solnedgång
  const himmel=["#2a1846","#4a2160","#7a2a6e","#b8406e","#e8705a","#f6a85a"];
  himmel.forEach((c,i)=>R(0,i*7,W,7,c)); R(0,42,W,12,"#f6c46a");
  R(112,30,18,18,"#ffd27a"); R(114,28,14,22,"#ffd27a"); R(110,32,22,14,"#ffd27a");
  // palmer och skyline
  const hus=[[0,22,14],[16,30,10],[28,14,12],[42,26,9],[54,20,16],[72,34,8],[82,12,14],[98,28,10],[134,18,12],[148,26,12]];
  hus.forEach(([x,y,w])=>{ R(x,y,w,60,"#1c1430"); for(let yy=y+3;yy<56;yy+=4) for(let xx=x+2;xx<x+w-1;xx+=3) if((xx*7+yy*13)%5) R(xx,yy,1,2,(xx+yy)%3?"#ff6ad5":"#6ae3ff"); });
  const palm=(x)=>{ for(let i=0;i<20;i++) R(x+Math.round(Math.sin(i/6)*2),36+i,2,1,"#2a1a12"); [[-6,-1],[-4,-3],[0,-4],[4,-3],[6,-1]].forEach(([dx,dy])=>{ R(x+dx-2,36+dy,5,1,"#1f3a1c"); R(x+dx*1.5-1,37+dy,3,1,"#1f3a1c"); }); };
  palm(8); palm(150);
  // takkant och trädäck
  R(0,56,W,34,"#c9b08a"); for(let x=0;x<W;x+=8) R(x,56,1,34,"#b39a74"); R(0,55,W,2,"#e8e0d0");
  // poolen
  const px=14, py=60, pw=132, ph=24;
  R(px-2,py-2,pw+4,ph+4,"#eef4f8"); R(px,py,pw,ph,"#2bb5d8");
  for(let i=0;i<14;i++) R(px+4+((i*37)%(pw-12)), py+3+((i*11)%(ph-6)), 6, 1, "#7fe3f5");
  // döda hjältar flyter i poolen (bara överkroppen syns)
  (doda||[]).slice(0,5).forEach((h,i)=>{
    const img=G.figurBild(h.id); if(!img) return;
    const x=px+2+i*18, y=py-8+(i%2)*4;
    const rita=()=>{ const r=h.ruta??(G.figurRutor(h.id)[0]||0);
      const S=G.storlek(h.id), hh=Math.round(20*S/32); ctx.drawImage(img,(r%8)*32,Math.floor(r/8)*32,32,20,x+Math.round((32-S)/2),y+20-hh,S,hh);
      R(x+4,y+18,24,2,"#2bb5d8"); R(x+8,y+18,6,1,"#7fe3f5"); };
    if(img.complete&&img.naturalWidth) rita(); else img.addEventListener("load",rita,{once:true});
  });

  // Tetrok ur npc/tetrok.png (8×8 rutor, spegelvänd så att han tittar mot hjältarna): sitter i poolen till höger, vattnet ritas om framför honom
  const tb = G.npcBild("tetrok");
  if(tb.complete && tb.naturalWidth){
    const tx = 116, ty = 44, vy = ty + 26;            // vattenlinjen ligger på rad 26 i rutan
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, vy); ctx.clip();
    G.ritaRuta(ctx, tb, tetrokRuta, tx, ty, 32, true);
    ctx.restore();
    R(px, vy, pw, py+ph-vy, "#2bb5d8");
    R(tx+5, vy, 22, 1, "#7fe3f5"); R(tx+2, vy+2, 6, 1, "#7fe3f5"); R(tx+22, vy+2, 7, 1, "#7fe3f5");
  }
}
// Poolen med Tetrok som rör sig: han spelar en av sina rader (8 rutor) i taget, och vilar mellan raderna.
// Raderna: 0 röker, 1 dricker, 2 rökringar, 3 slumrar, 4 pratar, 5 skålar, 6 plaskar, 7 kliar sig.
G.ritaPool = (canvas, doda) => {
  if(!canvas) return;
  const id = (canvas._poolId = (canvas._poolId||0) + 1);
  [G.npcBild("tetrok"), G.npcBild("../bakgrunder/miami")].forEach(b=>{ if(!(b.complete && b.naturalWidth)) b.addEventListener("load", ()=>G.ritaPool(canvas, doda), {once:true}); });
  let rad = 0, ruta = 0, vila = 0;
  const STILLA = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tick = () => {
    if(!canvas.isConnected || canvas._poolId !== id) return;
    ritaPoolRuta(canvas, doda, rad*8 + ruta);
    if(STILLA) return;
    let paus = 170;
    if(vila > 0){ vila--; paus = 1000; if(vila === 0){ rad = Math.floor(Math.random()*8); ruta = 0; } }
    else if(ruta < 7){ ruta++; }
    else { ruta = 0; rad = 0; vila = 2 + Math.floor(Math.random()*3); paus = 600; }
    setTimeout(tick, paus);
  };
  tick();
};

// ---------- Värdshuset på startsidan: möbler ur npc/mobler.png, värden ur npc/kopman.png ----------
G.ritaVardshus = (canvas, hjaltar) => {
  const ctx = canvas.getContext("2d"); const W=160, H=90; ctx.imageSmoothingEnabled=false;
  const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
  // Målad bakgrund (bakgrunder/vardshus.png, 320×180): väggen med dörren till vänster och golvet från y 62.
  // Möblerna ställs mellan pelarna så att dörren och ljusen syns. Saknas bilden ritas väggen med kod.
  const tak = G.npcBild("../bakgrunder/vardshus"), malad = tak.complete && tak.naturalWidth;
  if(!tak.complete) tak.addEventListener("load",()=>G.ritaVardshus(canvas,hjaltar),{once:true});
  if(malad){
    canvas.width=W*2; canvas.height=H*2; ctx.imageSmoothingEnabled=false;
    ctx.drawImage(tak, 0, 0); ctx.setTransform(2,0,0,2,0,0);
  } else { canvas.width=W; canvas.height=H; ctx.imageSmoothingEnabled=false; }
  // vägg av timmer och golv av plankor
  if(!malad) for(let y=0;y<58;y+=6){ R(0,y,W,6,y%12?"#3a2616":"#33210f"); R(0,y+5,W,1,"#241509"); }
  if(!malad){
    for(let x=7;x<W;x+=29) R(x,0,3,58,"#2a1a0c");
    R(0,58,W,32,"#5a3a1e"); for(let y=62;y<H;y+=5) R(0,y,W,1,"#4a2e16"); for(let x=0;x<W;x+=23) R(x+((x/23)%2?11:0),58,1,32,"#4a2e16");
    R(0,57,W,2,"#241509");
  }
  const mob = G.npcBild("mobler"), kop = G.npcBild("kopman"), isak = G.npcBild("isak"), vantar=[];
  const klar = img => img.complete && img.naturalWidth;
  [mob,kop,isak].forEach(i=>{ if(!klar(i)) vantar.push(i); });
  if(!vantar.length){
    const M=(r,x,y,z,sp)=>G.ritaRuta(ctx,mob,r,x,y,z,sp);
    if(malad){
      M(33, 44, 33, 30);         // öppen spis mellan första pelarparet
      M(44, 49, 8, 20);          // älghuvud ovanför spisen
      M(43, 80, 26, 22);         // anslagstavla (uppdragen) under fönstret
      M(47, 1, 22, 15);          // sköld på väggen till vänster om dörren
    } else {
      M(44, 44, 2, 24);          // älghuvud
      M(47, 70, 6, 18);          // sköld
      M(43, 4, 10, 22);          // anslagstavla (uppdragen)
      M(46, 30, 12, 16);         // kandelaber
      M(33, 4, 30, 30);          // öppen spis
    }
    // Spelledaren Isak sitter bakom ett bord med tärningar och anteckningar mitt i rummet
    R(92, 77, 40, 3, "#0005");
    G.ritaRuta(ctx, isak, (new Date().getDate())%64, 96, 36, 32);
    M(13, 92, 50, 34);
    // bardisken längst till höger, med kortsidan mot oss, och värdshusvärden bakom den
    G.ritaRuta(ctx, kop, 2, 132, 34, 28);
    R(130, 77, 30, 3, "#0005");
    M(18, 130, 48, 32);
  }
  // sällskapet står framför bordet
  (hjaltar||[]).slice(0,4).forEach((h,i)=>{
    const img = G.figurBild(h.id); if(!img) return;
    if(!klar(img)){ vantar.push(img); return; }
    const r = h.ruta ?? (G.figurRutor(h.id)[0]||0), x = 2 + i*16, y = 52 + (i%2?3:0);
    R(x+9, y+30, 14, 2, "#0005");
    ctx.drawImage(img, (r%8)*32, Math.floor(r/8)*32, 32, 32, x, y, 32, 32);
  });
  ctx.setTransform(1,0,0,1,0,0);
  if(vantar.length) [...new Set(vantar)].forEach(img=>img.addEventListener("load",()=>G.ritaVardshus(canvas,hjaltar),{once:true}));
};

window.GRAFIK = G;
})();
