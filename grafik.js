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
G.ritaScen = (canvas, miljoId, fiender, fro, extra, hjaltar) => {
  const argsKopia = [canvas, miljoId, fiender, fro, extra, hjaltar];
  const ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false;
  const W = 160, H = 90; canvas.width = W; canvas.height = H; ctx.imageSmoothingEnabled = false; // efter width – annars nollställs den
  const m = (window.VARLD.MILJO[miljoId] || window.VARLD.MILJO.grotta), rnd = slump(fro||7);
  // himmel/bakgrund
  for(let y=0;y<H;y++){ const t=y/H; ctx.fillStyle = blanda(m.himmel[0], m.himmel[1], t); ctx.fillRect(0,y,W,1); }
  if(miljoId==="oken"){ ctx.fillStyle="#fff3c4"; ctx.fillRect(122,10,14,14); ctx.fillStyle="#ffe08a"; ctx.fillRect(120,12,18,10); }
  if(miljoId==="berg"||miljoId==="ruin"||miljoId==="gravfalt"||miljoId==="trask"){ // stjärnor/moln
    for(let i=0;i<14;i++){ ctx.fillStyle = miljoId==="berg"?"#ffffffaa":"#ffffff66"; ctx.fillRect(Math.floor(rnd()*W),Math.floor(rnd()*35),1,1); }
  }
  // bakre siluetter
  ctx.fillStyle = mork(m.sten, .35);
  if(miljoId==="skog"||miljoId==="trask"){
    for(let i=0;i<12;i++){ const x=Math.floor(rnd()*W), h=24+Math.floor(rnd()*26); tradd(ctx,x,62-h,h,mork(m.mark,.3)); }
  } else if(miljoId==="grotta"||miljoId==="kloak"){
    for(let x=0;x<W;x+=4){ const h=4+Math.floor(rnd()*14); ctx.fillRect(x,0,4,h); }
    if(miljoId==="kloak"){ ctx.fillStyle=mork(m.sten,.1); for(let x=0;x<W;x+=16) ctx.fillRect(x,8,1,50); ctx.fillRect(0,22,W,1); ctx.fillRect(0,40,W,1); }
  } else {
    let y=46; for(let x=0;x<W;x+=4){ y += Math.floor(rnd()*7)-3; y=Math.max(26,Math.min(56,y)); ctx.fillRect(x,y,4,H-y); }
  }
  if(miljoId==="ruin"){ ctx.fillStyle=mork(m.sten,.15); ctx.fillRect(18,22,10,40); ctx.fillRect(14,20,18,4); ctx.fillRect(126,30,10,32); ctx.fillRect(122,28,12,3); }
  if(miljoId==="gravfalt"){ ctx.fillStyle=m.sten; for(let i=0;i<9;i++){ const x=4+i*18+Math.floor(rnd()*6), y=58+Math.floor(rnd()*6); ctx.fillRect(x,y,6,9); ctx.fillRect(x+1,y-2,4,2); } }
  // mark
  ctx.fillStyle = m.mark; ctx.fillRect(0,64,W,H-64);
  for(let i=0;i<70;i++){ ctx.fillStyle = rnd()<.5?mork(m.mark,.15):ljus(m.mark,.12); ctx.fillRect(Math.floor(rnd()*W),64+Math.floor(rnd()*26),2,1); }
  if(miljoId==="trask"||miljoId==="kloak"){ ctx.fillStyle = miljoId==="trask"?"#3e5a3c":"#3a4a2a"; ctx.fillRect(0,76,W,6); ctx.fillStyle="#ffffff22"; for(let x=4;x<W;x+=14) ctx.fillRect(x,78,5,1); }
  if(miljoId==="grotta"||miljoId==="kloak"){ // fackla
    ctx.fillStyle="#5a3a1a"; ctx.fillRect(10,44,2,10); ctx.fillStyle="#ffb02e"; ctx.fillRect(9,40,4,4); ctx.fillStyle="#ffe08a"; ctx.fillRect(10,41,2,2);
    const g=ctx.createRadialGradient(11,42,1,11,42,40); g.addColorStop(0,"#ffb02e33"); g.addColorStop(1,"#0000"); ctx.fillStyle=g; ctx.fillRect(0,0,60,90);
  }
  // rummets föremål (skatt, fälla, vila…)
  if(extra==="skatt"){ ctx.fillStyle="#5a3a1a"; ctx.fillRect(74,58,14,8); ctx.fillStyle="#e0b450"; ctx.fillRect(74,56,14,3); ctx.fillRect(80,60,2,2); }
  if(extra==="vila"){ ctx.fillStyle="#5a3a1a"; ctx.fillRect(74,66,12,2); ctx.fillStyle="#ff8a2e"; ctx.fillRect(77,60,6,6); ctx.fillStyle="#ffe08a"; ctx.fillRect(79,62,2,3); }
  if(extra==="falla"){ ctx.fillStyle="#9aa0a8"; for(let x=62;x<98;x+=4){ ctx.fillRect(x,64,1,-0); ctx.fillRect(x,60,1,4); } }
  if(extra==="hinder"){ ctx.fillStyle="#000a"; ctx.fillRect(68,64,26,26); }
  // Bakhuvudet Jens kärra: sällskapet sitter på flaket, Jens på kuskbocken (bakhuvudet mot oss), hästen drar.
  if(extra==="jens"){
    const R2=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
    R2(26,77,112,3,"#0005");                                         // skugga
    // häst
    R2(104,56,26,12,"#7a4a26"); R2(126,46,8,14,"#7a4a26"); R2(130,42,10,8,"#7a4a26"); R2(138,45,3,4,"#5a3418");
    R2(127,42,3,3,"#2a1a10"); R2(128,44,2,10,"#2a1a10"); R2(133,44,1,1,"#111");          // man och öga
    R2(106,68,3,9,"#5a3418"); R2(114,68,3,9,"#5a3418"); R2(121,68,3,9,"#5a3418"); R2(127,68,3,9,"#5a3418");
    R2(100,57,5,2,"#2a1a10"); R2(100,59,2,8,"#2a1a10");                                   // svans
    R2(92,58,14,1,"#3a2814");                                                             // skaklar
    // kärran
    R2(28,56,64,12,"#8a5a2e"); R2(28,56,64,2,"#a8733e"); for(let x=34;x<92;x+=10) R2(x,58,1,10,"#6a4220");
    R2(84,46,10,10,"#6a4220");                                                            // kuskbock
    const hjul=(cx)=>{ R2(cx-6,64,12,12,"#2a1a10"); R2(cx-4,66,8,8,"#a8733e"); R2(cx-1,64,2,12,"#2a1a10"); R2(cx-6,69,12,2,"#2a1a10"); };
    hjul(40); hjul(80);
    // Jens: rund bakskalle, krage och tömmar
    R2(86,34,10,10,"#3a2a1a"); R2(85,36,12,6,"#3a2a1a"); R2(87,33,8,2,"#4a3622");          // bakhuvudet
    R2(87,42,8,2,"#d9a57c"); R2(96,37,2,3,"#d9a57c");                                     // nacke och öra
    R2(85,44,12,6,"#3f5a7a"); R2(84,50,14,6,"#3f5a7a"); R2(85,44,12,1,"#5a7a9a");        // rock
    R2(97,48,9,1,"#2a1a10"); R2(105,49,3,1,"#2a1a10");                                    // tömmar
    // sällskapet sitter på flaket (överkroppen syns)
    (hjaltar||[]).slice(0,4).forEach((h,i)=>{
      const img=G.figurBild(h.id); if(!img) return;
      const x=24+i*14, y=37+(i%2?2:0), r=h.ruta??(G.figurRutor(h.id)[0]||0);
      const rita=()=>{ ctx.drawImage(img,(r%8)*32,Math.floor(r/8)*32,32,20,x,y,32,20); R2(28,56,64,2,"#a8733e"); };
      if(img.complete&&img.naturalWidth) rita(); else img.addEventListener("load",rita,{once:true});
    });
    hjaltar = null;
  }
  // hjältarna (vänster sida, i två led så att fyra får plats)
  const harHjaltar = hjaltar && hjaltar.length;
  if(harHjaltar){
    const laddar = [];
    hjaltar.forEach((h,i)=>{
      const x = 2 + i*15, y = 44 + (i%2 ? 4 : 0); // fötterna (rad 30 i figuren) hamnar på marken, y 74–78
      const img = G.figurBild(h.id);
      if(!img){ return; }
      if(!img.complete){ laddar.push(img); return; }
      ctx.save();
      if(h.nere){ ctx.globalAlpha = .35; }
      ctx.fillStyle="#0005"; ctx.fillRect(x+9, y+30, 14, 3);
      const r = h.ruta;
      ctx.drawImage(img, (r%8)*32, Math.floor(r/8)*32, 32, 32, x, y, 32, 32);
      ctx.restore();
      if(h.aktiv){ ctx.fillStyle="#ffd23f"; ctx.fillRect(x+14, y-3, 4, 3); }
    });
    if(laddar.length) laddar.forEach(img=>img.addEventListener("load",()=>G.ritaScen(...argsKopia),{once:true}));
  }
  // fiender
  if(fiender && fiender.length){
    const levande = fiender.filter(f=>f.kp>0||f.visa);
    const n = levande.length, start = harHjaltar ? 74 : 10, slut = W - 2, vantar = [];
    // Storlek: egna pixelfigurer (32×32) i naturlig storlek, bossar 1,5 gånger större, draken dubbelt.
    const mått = levande.map(f=>{ const egen = G.fiendeBild(f.fid) && G.fiendeRutor(f.fid).length;
      const sk = egen ? (f.boss ? (f.stor ? 2 : 1.5) : 1) : (f.boss ? 3 : (f.liten?1:2)); return {egen, sk, w: egen ? Math.round(32*sk) : 16*sk}; });
    const summa = mått.reduce((a,m)=>a+m.w,0), luft = slut - start - summa;
    const mellan = n>1 ? Math.min(8, luft/(n-1)) : 0;                       // negativt = de står lite omlott
    let xNu = start + Math.max(0, (luft - mellan*(n-1))/2);
    const xPos = mått.map(m=>{ const x=Math.round(xNu); xNu += m.w + mellan; return x; });
    levande.forEach((f,i)=>{
      const img = G.fiendeBild(f.fid), rutor = G.fiendeRutor(f.fid);
      const {egen, sk, w} = mått[i];
      const x = Math.max(start-4, Math.min(W-w, xPos[i])), fot = 76 + (i%2 ? 2 : 0);
      const y = egen ? fot - Math.round(30*sk) : fot - 16*sk + (f.liten?1:0);
      ctx.globalAlpha = f.kp>0 ? 1 : .25;
      ctx.fillStyle="#0005"; ctx.fillRect(x+Math.round(w*.2), fot-1, Math.round(w*.6), 3);
      if(egen){
        if(!(img.complete && img.naturalWidth)){ vantar.push(img); ctx.globalAlpha=1; return; }
        const r = rutor.includes(f.ruta) ? f.ruta : rutor[0];
        ctx.save(); ctx.translate(x+w, Math.max(0,y)); ctx.scale(-1,1);   // spegelvänd så att fienden tittar mot hjältarna
        ctx.drawImage(img, (r%8)*32, Math.floor(r/8)*32, 32, 32, 0, 0, w, w);
        ctx.restore();
      } else G.ritaSprite(ctx, f.sprite, x, Math.max(0,y), sk, PALETT_FOR[f.fid]||f.sprite, i%2===1);
      ctx.globalAlpha = 1;
      if(f.markerad){ ctx.fillStyle="#ffd23f"; ctx.fillRect(x+w/2-2, Math.max(0,y)-3, 4, 3); }
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
const BILDER = {};
G.figurBild = id => {
  if(!window.FIGURER || !window.FIGURER[id]) return null;
  if(!BILDER[id]){ const img = new Image(); img.src = "figurer/"+id+".png"; BILDER[id] = img; }
  return BILDER[id];
};
G.figurRutor = id => (window.FIGURER && window.FIGURER[id]) || [];
// Fiendernas pixelfigurer (bilder i fiender/)
const FBILDER = {};
G.fiendeRutor = fid => (window.FIENDEFIGURER && window.FIENDEFIGURER[fid]) || [];
G.fiendeBild = fid => {
  if(!G.fiendeRutor(fid).length) return null;
  if(!FBILDER[fid]){ const img = new Image(); img.src = "fiender/"+fid+".png"; FBILDER[fid] = img; }
  return FBILDER[fid];
};
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
G.ritaPool = (canvas, doda) => {
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
  // Tetrok – stor björn i poolen med cigarr och bubbel
  const bx=106, by=46;
  R(bx,by+8,40,14,"#5a3418"); R(bx+2,by+6,36,4,"#5a3418");          // axlar
  R(bx+10,by-6,20,16,"#6b4022");                                   // huvud
  R(bx+8,by-9,6,6,"#6b4022"); R(bx+26,by-9,6,6,"#6b4022");         // öron
  R(bx+10,by-8,2,2,"#3a2010"); R(bx+28,by-8,2,2,"#3a2010");
  R(bx+15,by+2,10,6,"#c9a07a"); R(bx+18,by+2,4,2,"#1a0c06");        // nos
  R(bx+14,by-1,3,2,"#111"); R(bx+23,by-1,3,2,"#111");               // ögon
  R(bx+24,by+6,9,2,"#8a5a2a"); R(bx+33,by+6,2,2,"#ff6a2e");        // cigarr
  R(bx+35,by+3,1,1,"#ccc"); R(bx+37,by,1,1,"#bbb"); R(bx+36,by-3,2,1,"#aaa"); // rök
  R(bx-2,by+12,6,6,"#5a3418");                                     // tass
  R(bx-1,by+4,4,7,"#f2e6b0"); R(bx,by+5,2,3,"#ffe9a0"); R(bx+1,by+11,1,2,"#ddd"); // glas bubbel
  R(px,by+22,pw,ph-(by+22-py),"#2bb5d8"); // vatten framför björnen
  for(let i=0;i<4;i++) R(bx+2+i*9,by+21,6,1,"#7fe3f5");
  // döda hjältar flyter i poolen (bara överkroppen syns)
  (doda||[]).slice(0,5).forEach((h,i)=>{
    const img=G.figurBild(h.id); if(!img) return;
    const x=px+2+i*18, y=py-8+(i%2)*4;
    const rita=()=>{ const r=h.ruta??(G.figurRutor(h.id)[0]||0);
      ctx.drawImage(img,(r%8)*32,Math.floor(r/8)*32,32,20,x,y,32,20);
      R(x+4,y+18,24,2,"#2bb5d8"); R(x+8,y+18,6,1,"#7fe3f5"); };
    if(img.complete&&img.naturalWidth) rita(); else img.addEventListener("load",rita,{once:true});
  });
};

window.GRAFIK = G;
})();
