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
G.ritaScen = (canvas, miljoId, fiender, fro, extra) => {
  const ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false;
  const W = 160, H = 90; canvas.width = W; canvas.height = H;
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
  if(extra==="mote" && fiender && fiender.length===0){}
  // fiender
  if(fiender && fiender.length){
    const levande = fiender.filter(f=>f.kp>0||f.visa);
    const n = levande.length, bredd = W-20;
    levande.forEach((f,i)=>{
      const sk = f.boss ? (f.stor?3:3) : (f.liten?1:2);
      const w = 16*sk, x = Math.round(10 + (i+0.5)*bredd/n - w/2), y = 66 - 16*sk + (f.liten?2:0) + (f.boss?8:0);
      ctx.globalAlpha = f.kp>0 ? 1 : .25;
      ctx.fillStyle="#0005"; ctx.fillRect(x+2, 64, w-4, 3);
      G.ritaSprite(ctx, f.sprite, x, Math.max(0,y), sk, PALETT_FOR[f.fid]||f.sprite, i%2===1);
      ctx.globalAlpha = 1;
      if(f.markerad){ ctx.fillStyle="#ffd23f"; ctx.fillRect(x+w/2-2, Math.max(0,y)-5, 4, 3); }
    });
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
G.ritaPortratt = (canvas, hjalte, dod) => {
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

window.GRAFIK = G;
})();
