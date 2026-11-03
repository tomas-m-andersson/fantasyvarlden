// Fantasyvärlden – detaljerade bakgrunder till TV:n (160×90 pixlar).
// Varje miljö ritas i flera lager: himmel/vägg längst bak, siluetter, mellanlager och mark.
// Marken börjar ungefär vid y 64 och figurerna står med fötterna vid y 76–78.
// "fro" gör att samma rum alltid ser likadant ut, men olika rum blir olika.
(function(){
const W = 160, H = 90;

// ---------- Hjälpfunktioner ----------
function slump(fro){ let s = (fro>>>0) || 1; return () => (s = (s*1664525 + 1013904223)>>>0) / 4294967296; }
function hex(c){ c = c.replace("#",""); return [0,2,4].map(i=>parseInt(c.substr(i,2),16)); }
function tillHex(a){ return "#"+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join(""); }
function mix(a,b,t){ const A=hex(a), B=hex(b); return tillHex(A.map((v,i)=>v+(B[i]-v)*t)); }
const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const dither = (x,y) => BAYER[(y&3)*4 + (x&3)];

function mal(ctx){
  const R = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };
  const P = (x,y,c) => { ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),1,1); };
  // Vertikal färgövergång med flera färger och "dithering" (pixelmönster) mellan banden
  const gradient = (y0, y1, farger, x0=0, x1=W) => {
    const n = farger.length-1;
    for(let y=y0; y<y1; y++){
      const t = (y-y0)/Math.max(1,(y1-y0-1)) * n, i = Math.min(n-1, Math.floor(t)), f0 = t - i;
      // Mönstret syns bara i en smal skarv mellan färgerna, resten är jämn färg
      const f = Math.max(0, Math.min(1, (f0 - 0.3) / 0.4));
      if(f <= 0 || f >= 1){ R(x0, y, x1-x0, 1, f >= 1 ? farger[i+1] : farger[i]); continue; }
      for(let x=x0; x<x1; x++) P(x, y, f > dither(x,y) ? farger[i+1] : farger[i]);
    }
  };
  // Halvgenomskinlig yta (dimma, ljusstrålar)
  const alfa = (x,y,w,h,c,a) => { ctx.save(); ctx.globalAlpha=a; R(x,y,w,h,c); ctx.restore(); };
  // Bergskam/siluett: höjd per x-kolumn byggd av sinusvågor
  const kam = (rnd, bas, amp, frekvenser) => {
    const fas = frekvenser.map(()=>rnd()*Math.PI*2);
    return Array.from({length:W}, (_,x) => bas + frekvenser.reduce((s,f,i)=>s + Math.sin(x*f + fas[i]) * amp/(i+1), 0));
  };
  const fyllKam = (hojd, farg, botten=H) => { for(let x=0;x<W;x++) R(x, hojd[x], 1, botten-hojd[x], farg); };
  return {R, P, gradient, alfa, kam, fyllKam};
}

// Gran: lager av grenar, ljus höger sida, stam
function gran(ctx, x, bas, h, morkF, ljusF, stamF){
  const {R} = mal(ctx), topp = bas - h;
  for(let i=0;i<h;i++){
    const nivå = i % 6, w = Math.floor((i/h) * h*0.32 + nivå*0.7);
    R(x-w, topp+i, w*2+1, 1, morkF);
    if(w>1) R(x+1, topp+i, Math.max(1,Math.floor(w*0.6)), 1, ljusF);
  }
  R(x-1, bas, 3, Math.max(2, Math.floor(h*0.1)), stamF);
}
// Kalt dött träd med grenar
function dottTrad(ctx, x, bas, h, farg, rnd){
  const {R} = mal(ctx);
  R(x, bas-h, 2, h, farg);
  const gren = (gx, gy, langd, riktning, niva) => {
    let px=gx, py=gy;
    for(let i=0;i<langd;i++){ px += riktning; if(i%2===0) py -= 1; R(px, py, 1, 1, farg); }
    if(niva>0){ gren(px, py, Math.floor(langd*0.6), riktning, niva-1); gren(px, py, Math.floor(langd*0.5), -riktning, niva-1); }
  };
  for(let k=0;k<4;k++){ const gy = bas - h + 2 + Math.floor(rnd()*h*0.6); gren(x + (k%2?1:0), gy, 4+Math.floor(rnd()*6), k%2?1:-1, 1); }
}

// ==================== MILJÖERNA ====================
const RITA = {};

// ---------- GROTTA ----------
RITA.grotta = (ctx, rnd) => {
  const {R, P, gradient, alfa} = mal(ctx);
  gradient(0, 64, ["#0e0b10","#1b1519","#2a2024","#3a2c28"]);
  // bergvägg: ljusa och mörka stråk, sprickor
  for(let i=0;i<70;i++){ const x=rnd()*W, y=8+rnd()*54, l=3+rnd()*10; R(x,y,l,1, rnd()<.5?"#44352d":"#140f12"); }
  for(let i=0;i<10;i++){ let x=rnd()*W, y=10+rnd()*30; for(let k=0;k<10;k++){ P(x,y,"#0c090c"); x += rnd()<.5?1:-1; y+=1; } }
  // stalagmiter längst bak
  for(let i=0;i<9;i++){ const x=rnd()*W, h=6+rnd()*12, b=64; for(let k=0;k<h;k++){ const w=Math.max(0,Math.floor((k/h)*3.5)); R(x-w, b-h+k, w*2+1, 1, "#2c221f"); P(x+w, b-h+k, "#3d2f28"); } }
  // stalaktiter i taket
  for(let x=0;x<W;){
    const h = 4 + rnd()*20, w = 2 + Math.floor(rnd()*3);
    for(let k=0;k<h;k++){ const ww=Math.max(0, Math.round(w*(1-k/h))); R(x-ww, k, ww*2+1, 1, "#3a2d27"); if(ww>0){ P(x+ww, k, "#5a4636"); P(x-ww, k, "#211819"); } }
    if(rnd()<.4) P(x, h+2, "#7fb3d8"); // droppe
    x += 5 + rnd()*10;
  }
  // kristaller som lyser
  for(let i=0;i<2;i++){
    const cx = 30 + rnd()*110, cy = 44 + rnd()*14, farg = rnd()<.5 ? ["#6fe3ff","#2a8fb8"] : ["#c58bff","#6a3fb0"];
    const g = ctx.createRadialGradient(cx,cy,1,cx,cy,16); g.addColorStop(0, farg[0]+"55"); g.addColorStop(1,"#0000"); ctx.fillStyle=g; ctx.fillRect(cx-16,cy-16,32,32);
    for(let k=0;k<3;k++){ const kx=cx-3+k*3, kh=4+Math.floor(rnd()*5); for(let j=0;j<kh;j++){ const ww = j<2?0:1; R(kx-ww, cy-kh+j, ww*2+1, 1, farg[1]); } P(kx, cy-kh+1, farg[0]); }
  }
  // golv
  gradient(64, H, ["#4a3b2e","#3a2e24","#2a211a","#1e1813"]);
  R(0, 63, W, 1, "#5a4838"); R(0, 64, W, 1, "#241b15");
  for(let i=0;i<90;i++){ const x=rnd()*W, y=65+rnd()*25, s=rnd()<.8?1:2; R(x,y,s+1,s, rnd()<.5?"#5a4838":"#1e1611"); }
  // vattenpöl med reflex
  const px = 40 + rnd()*80, py = 80 + rnd()*5, pw = 16 + rnd()*14;
  for(let k=0;k<4;k++) R(px - pw/2 + k*2, py+k, pw - k*4, 1, k===0?"#3c5868":"#26394a");
  R(px - pw/4, py+1, 4, 1, "#7fb3d8");
  // facklor med ljussken
  [[10,40],[150,36]].forEach(([fx,fy])=>{
    const g = ctx.createRadialGradient(fx+1,fy,1,fx+1,fy,44); g.addColorStop(0,"#ffb02e40"); g.addColorStop(1,"#0000"); ctx.fillStyle=g; ctx.fillRect(fx-44,fy-44,88,88);
    R(fx, fy+3, 2, 10, "#5a3a1a"); R(fx-1, fy+3, 4, 1, "#3a2410");
    R(fx-1, fy-1, 4, 4, "#ff8a1e"); R(fx, fy-3, 2, 3, "#ffb02e"); P(fx, fy-4, "#ffe08a"); R(fx, fy, 2, 2, "#ffe08a");
  });
  alfa(0,0,W,6,"#000",.35);
};

// ---------- SKOG ----------
RITA.skog = (ctx, rnd) => {
  const {R, P, gradient, alfa, kam, fyllKam} = mal(ctx);
  gradient(0, 64, ["#10202c","#1b3a40","#35604f","#7a9a64","#b9c47e"]);
  // solsken bakom träden
  const sx = 100 + rnd()*40; const g = ctx.createRadialGradient(sx,40,2,sx,40,40); g.addColorStop(0,"#fff4c080"); g.addColorStop(1,"#0000"); ctx.fillStyle=g; ctx.fillRect(0,0,W,64);
  // avlägsna kullar
  fyllKam(kam(rnd, 40, 5, [0.04,0.11]), "#3c6552", 64);
  // tre lager granar
  for(let i=0;i<22;i++) gran(ctx, rnd()*W, 54+rnd()*4, 14+rnd()*12, "#2c4f45", "#3a6152", "#2c4f45");
  for(let i=0;i<14;i++) gran(ctx, rnd()*W, 60+rnd()*4, 22+rnd()*16, "#1d3830", "#2a4d3c", "#1d2a20");
  // ljusstrålar
  ctx.save(); ctx.globalAlpha=.07; ctx.fillStyle="#fff4c0";
  for(let k=0;k<3;k++){ const bx = 20 + rnd()*120; ctx.beginPath(); ctx.moveTo(bx,0); ctx.lineTo(bx+8,0); ctx.lineTo(bx+30,64); ctx.lineTo(bx+18,64); ctx.fill(); }
  ctx.restore();
  // mark med gräs
  gradient(62, H, ["#3f6a32","#335a2a","#284a22","#1d381a"]);
  R(0, 62, W, 1, "#557f3f");
  // stig där sällskapet går
  for(let y=70;y<84;y++){ const kant = Math.sin(y*0.7)*2; for(let x=0;x<W;x++){ const t = Math.abs(y-77)/7; if(t + dither(x,y)*0.35 < 0.95) P(x+kant*0, y, t<.5 ? "#6a5638" : "#5a4a30"); } }
  for(let i=0;i<40;i++) R(rnd()*W, 71+rnd()*12, 1, 1, rnd()<.5?"#7a6644":"#4a3c26");
  // grästuvor, blommor, svamp
  for(let i=0;i<70;i++){ const x=rnd()*W, y=63+rnd()*27; if(y>69 && y<85 && rnd()<.7) continue; P(x,y,"#6a9a4a"); P(x-1,y+1,"#4f7f38"); P(x+1,y+1,"#4f7f38"); }
  for(let i=0;i<14;i++){ const x=rnd()*W, y=64+rnd()*6; P(x,y,["#f2e45a","#ffffff","#c58bff","#ff8a8a"][Math.floor(rnd()*4)]); }
  for(let i=0;i<3;i++){ const x=rnd()*W, y=86+rnd()*3; R(x,y-2,3,1,"#d23a2a"); P(x+1,y-1,"#efe6cf"); P(x+1,y-3,"#ffffff"); }
  // stora granar i kanterna, nära kameran
  gran(ctx, -2, 92, 80, "#0c1c17", "#14281f", "#0c1612");
  gran(ctx, 163, 92, 76, "#0c1c17", "#14281f", "#0c1612");
  // ormbunkar i förgrunden
  for(let i=0;i<6;i++){ const fx = rnd()<.5 ? rnd()*30 : 130+rnd()*30, fy = 88; for(let k=0;k<5;k++){ R(fx-k, fy-k*2, k*2+1, 1, "#2f5a28"); } }
};

// ---------- ÖKEN ----------
RITA.oken = (ctx, rnd) => {
  const {R, P, gradient, alfa, kam, fyllKam} = mal(ctx);
  gradient(0, 64, ["#d9683a","#ec8f4c","#f6b867","#fbd78f","#fde9b8"]);
  // sol med glorior
  const sx = 120 + rnd()*20, sy = 16;
  for(let r=18;r>8;r-=3){ ctx.save(); ctx.globalAlpha=.12; ctx.fillStyle="#fff6d0"; ctx.beginPath(); ctx.arc(sx,sy,r,0,7); ctx.fill(); ctx.restore(); }
  ctx.fillStyle="#fff8e0"; ctx.beginPath(); ctx.arc(sx,sy,7,0,7); ctx.fill();
  // fåglar
  for(let i=0;i<3;i++){ const bx=20+rnd()*80, by=8+rnd()*14; P(bx,by,"#5a3a2a"); P(bx+1,by-1,"#5a3a2a"); P(bx+2,by,"#5a3a2a"); P(bx-1,by-1,"#5a3a2a"); }
  // platåberg (mesas) långt bort
  for(let i=0;i<3;i++){ const mx = rnd()*W, mw = 18+rnd()*26, mh = 8+rnd()*10, my = 52-mh;
    R(mx, my, mw, mh+2, "#c48054"); R(mx, my, mw, 1, "#d99a68"); R(mx-2, my+3, 2, mh-1, "#c48054"); R(mx+mw, my+3, 2, mh-1, "#a96a44");
    for(let k=0;k<3;k++) R(mx+2, my+3+k*3, mw-4, 1, "#b37350"); }
  // värmedallring
  for(let k=0;k<4;k++){ const y=47+k*2; for(let x=0;x<W;x+=1) if(Math.sin(x*0.3+k)>0.6) P(x,y,"#fff2c8"); }
  // sanddyner i två lager
  const d1 = kam(rnd, 54, 4, [0.05,0.13]); fyllKam(d1, "#e5b46c", 66);
  for(let x=0;x<W;x++){ P(x, d1[x], "#f6d394"); if(x>0 && d1[x]>d1[x-1]) P(x, d1[x]+1, "#cf9a56"); }
  const d2 = kam(rnd, 60, 3, [0.07,0.17]); fyllKam(d2, "#dba760", 66);
  for(let x=0;x<W;x++) P(x, d2[x], "#f2c983");
  // kaktusar på dynerna
  // kaktusar som står på den främre dynens kant (med skugga vid foten)
  for(let i=0;i<2;i++){ const cx = Math.floor(10+rnd()*140), cy = Math.round(d2[cx]) + 2;
    R(cx-1, cy, 5, 1, "#c48a46");
    R(cx, cy-9, 2, 9, "#4f7a3a"); R(cx+1, cy-9, 1, 9, "#3c5f2c");
    R(cx-3, cy-6, 1, 3, "#4f7a3a"); R(cx-3, cy-4, 3, 1, "#4f7a3a"); R(cx+2, cy-7, 3, 1, "#4f7a3a"); R(cx+4, cy-9, 1, 3, "#4f7a3a"); P(cx, cy-9, "#7aa85a"); }
  // sandmark med vindmönster
  gradient(64, H, ["#e9be78","#ddab62","#cf9a52","#bf8a46"]);
  for(let y=66;y<H;y+=3){ const fas = rnd()*6; for(let x=0;x<W;x++) if(Math.sin(x*0.25 + fas + y*0.4) > 0.75) P(x, y + (Math.sin(x*0.1+fas)>0?0:1), "#c48a46"); }
  for(let i=0;i<30;i++) R(rnd()*W, 65+rnd()*25, rnd()<.7?1:2, 1, rnd()<.5?"#a87440":"#f4d39a");
  // blekt kranium och ben
  const bx = 130 + rnd()*20, by = 84; R(bx, by, 5, 3, "#efe6cf"); P(bx+1, by+1, "#3a2a1a"); P(bx+3, by+1, "#3a2a1a"); R(bx+6, by+2, 6, 1, "#e0d6bf");
};

// ---------- BERG ----------
RITA.berg = (ctx, rnd) => {
  const {R, P, gradient, alfa} = mal(ctx);
  gradient(0, 64, ["#3d6ea8","#5a8cc4","#86b2dc","#b9d4ea","#dbe8f2"]);
  // moln
  const moln = (mx, my, w) => { for(let k=0;k<w;k+=4){ const h = 3 + Math.floor(Math.sin(k/w*Math.PI)*4); R(mx+k, my-h, 6, h, "#ffffff"); R(mx+k, my, 6, 2, "#c9d8e8"); } };
  for(let i=0;i<3;i++) moln(rnd()*130, 10+rnd()*16, 16+rnd()*20);
  // snöklädda toppar längst bak
  const topp = (tx, ty, bredd, morkF, ljusF, snoL, snoM) => {
    const h = 64 - ty;
    for(let k=0;k<h;k++){ const w = Math.floor(k * bredd); const y = ty+k;
      R(tx-w, y, w, 1, morkF); R(tx, y, w+1, 1, ljusF);
      if(k < h*0.32){ R(tx-w, y, w, 1, snoM); R(tx, y, w+1, 1, snoL); if(k > h*0.22 && (tx+k)%3===0){ R(tx-w, y, 2, 1, morkF); } } }
  };
  for(let i=0;i<4;i++) topp(10+rnd()*140, 12+rnd()*14, 0.9+rnd()*0.5, "#6a7890", "#8e9cb2", "#f4f8fc", "#c8d4e2");
  for(let i=0;i<3;i++) topp(rnd()*W, 28+rnd()*10, 1.2+rnd()*0.4, "#4f5868", "#6c7586", "#e6edf4", "#b4c0cf");
  // tallar på sluttningen
  for(let i=0;i<12;i++){ const x=rnd()*W, b=58+rnd()*6; gran(ctx, x, b, 6+rnd()*6, "#22392f", "#2f4a3c", "#22392f"); }
  // klippig mark och stig
  gradient(62, H, ["#7b7f88","#676b74","#555960","#43464c"]);
  R(0, 62, W, 1, "#9aa0aa");
  for(let i=0;i<26;i++){ const x=rnd()*W, y=64+rnd()*24, w=3+rnd()*6, h=2+rnd()*3; R(x,y,w,h,"#5c6068"); R(x,y,w,1,"#8e939d"); R(x+w-1,y+1,1,h-1,"#44474e"); }
  for(let i=0;i<10;i++){ const x=rnd()*W, y=64+rnd()*24; R(x,y,4+rnd()*6,1,"#eef3f8"); R(x+1,y+1,3,1,"#d0dae6"); }
  for(let i=0;i<12;i++){ let x=rnd()*W, y=66+rnd()*20; for(let k=0;k<5;k++){ P(x,y,"#3a3d42"); x+=rnd()<.5?1:-1; y+=1; } }
};

// ---------- RUIN ----------
RITA.ruin = (ctx, rnd) => {
  const {R, P, gradient, alfa} = mal(ctx);
  gradient(0, 64, ["#121528","#1c2140","#2c3456","#46506e","#636b86"]);
  for(let i=0;i<40;i++){ const x=rnd()*W, y=rnd()*40; P(x,y, rnd()<.2?"#ffffff":"#aab4d4"); }
  // måne
  const mx = 128 + rnd()*20, my = 14; const g = ctx.createRadialGradient(mx,my,2,mx,my,22); g.addColorStop(0,"#f6f0d080"); g.addColorStop(1,"#0000"); ctx.fillStyle=g; ctx.fillRect(mx-22,my-22,44,44);
  ctx.fillStyle="#f2ecd2"; ctx.beginPath(); ctx.arc(mx,my,7,0,7); ctx.fill(); P(mx-2,my-2,"#d6cfb2"); R(mx+2,my+1,2,2,"#d6cfb2"); P(mx-3,my+3,"#d6cfb2");
  // borg i siluett långt bort
  const bx = 20 + rnd()*60;
  R(bx, 34, 40, 26, "#1d2238"); for(let k=0;k<40;k+=4) R(bx+k, 32, 2, 2, "#1d2238");
  R(bx+6, 22, 8, 38, "#1d2238"); R(bx+28, 26, 7, 34, "#1d2238"); R(bx+5, 20, 10, 2, "#1d2238"); R(bx+27, 24, 9, 2, "#1d2238");
  P(bx+9, 30, "#ffcc66"); P(bx+31, 34, "#ffcc66");
  // trasig mur med tegel framför
  const top = Array.from({length:W}, (_,x) => 34 + Math.abs(Math.sin(x*0.09 + 1))*8 + (Math.sin(x*0.5)>0.7 ? 6 : 0) + (x>60 && x<92 ? 14 : 0));
  for(let x=0;x<W;x++){ for(let y=Math.floor(top[x]); y<64; y++){
    const rad = Math.floor((y-30)/4), forskj = (rad%2)*4, fog = (y%4===3) || ((x+forskj)%8===7);
    P(x, y, fog ? "#3e3c38" : ((x+forskj+rad*3)%8<2 ? "#6e6a60" : "#5a5850")); } P(x, Math.floor(top[x]), "#7c786c"); }
  // valvfönster i muren
  for(let i=0;i<2;i++){ const fx = i ? 110+rnd()*20 : 20+rnd()*20, fy = 44; R(fx, fy, 8, 12, "#151827"); R(fx+1, fy-2, 6, 2, "#151827"); R(fx+2, fy-3, 4, 1, "#151827"); }
  // murgröna
  for(let i=0;i<6;i++){ const ix = rnd()*W; let iy = top[Math.floor(ix)]; for(let k=0;k<8+rnd()*10;k++){ P(ix + (k%3===0?1:0), iy+k, k%2?"#3a5a30":"#4a7038"); if(rnd()<.3) P(ix+1, iy+k, "#2c4a26"); } }
  // två avbrutna pelare
  [[8+rnd()*10, 26], [136+rnd()*12, 32]].forEach(([px,py])=>{ R(px, py, 9, 64-py, "#8a867a"); R(px+1, py, 1, 64-py, "#a8a496"); R(px+4, py, 1, 64-py, "#6e6a60"); R(px+7, py, 1, 64-py, "#6e6a60"); R(px-1, 61, 11, 3, "#77736a");
    for(let k=0;k<3;k++) P(px+k*3, py-1, "#8a867a"); });
  // stenplattor på marken
  gradient(64, H, ["#57554e","#4a4843","#3c3b37","#2f2e2b"]);
  for(let y=64;y<H;y+=6) R(0, y, W, 1, "#2a2926");
  for(let y=64;y<H;y+=6){ const f = (y/6)%2 ? 0 : 7; for(let x=f;x<W;x+=14) R(x, y, 1, 6, "#2a2926"); }
  for(let i=0;i<25;i++) P(rnd()*W, 64+rnd()*26, "#4f6a3c");
  for(let i=0;i<8;i++){ const x=rnd()*W, y=66+rnd()*20; R(x,y,4,3,"#6e6a60"); R(x,y,4,1,"#8a867a"); }
};

// ---------- KLOAK ----------
RITA.kloak = (ctx, rnd) => {
  const {R, P, gradient, alfa} = mal(ctx);
  R(0,0,W,64,"#141a12");
  // välvt tak i tegel
  for(let x=0;x<W;x++){
    const valv = 6 + Math.pow((x-80)/80, 2) * 26;
    for(let y=0;y<64;y++){
      const iBak = y > valv;
      const rad = Math.floor(y/4), forskj = (rad%2)*5, fog = (y%4===3) || ((x+forskj)%10===9);
      if(!iBak) P(x,y, fog ? "#1e241a" : ((x+rad)%7===0 ? "#46503a" : "#3a4430"));
      else P(x,y, fog ? "#161c13" : "#262e20");
    }
  }
  // tunnelöppning långt bak
  const tx = 80, ty = 40;
  for(let r=18;r>0;r--){ ctx.fillStyle = mix("#26301f","#050705", 1 - r/18); ctx.beginPath(); ctx.ellipse(tx, ty, r*1.2, r, 0, 0, 7); ctx.fill(); }
  const g = ctx.createRadialGradient(tx,ty+4,1,tx,ty+4,10); g.addColorStop(0,"#9ac06a30"); g.addColorStop(1,"#0000"); ctx.fillStyle=g; ctx.fillRect(tx-12,ty-8,24,24);
  // rör längs väggen
  [[0,30],[0,46]].forEach(([_,py],i)=>{ R(0, py, i?56:40, 4, "#5a4a36"); R(0, py, i?56:40, 1, "#7a6648"); R(0, py+3, i?56:40, 1, "#3a2e22"); for(let k=8;k<(i?56:40);k+=14) R(k, py-1, 3, 6, "#4a3c2c"); });
  R(124, 26, 36, 4, "#5a4a36"); R(124, 26, 36, 1, "#7a6648"); R(124, 26, 2, 30, "#5a4a36");
  // galler
  R(130, 40, 18, 14, "#0c100a"); for(let k=0;k<18;k+=3) R(130+k, 40, 1, 14, "#4a4a44"); R(130, 40, 18, 1, "#5a5a54"); R(130, 46, 18, 1, "#4a4a44");
  // slemränder och droppar
  for(let i=0;i<14;i++){ const x=rnd()*W, y0 = 20+rnd()*30, l = 4+rnd()*12; for(let k=0;k<l;k++) P(x, y0+k, k%3?"#4a7a2e":"#5e9438"); }
  for(let i=0;i<10;i++) P(rnd()*W, rnd()*60, "#8fd06a");
  // gångbana av sten där sällskapet står
  gradient(64, 84, ["#5a6048","#4c523c","#3e4432"]);
  R(0, 63, W, 1, "#6e7458");
  for(let x=0;x<W;x+=10) R(x, 64, 1, 20, "#33382a");
  for(let i=0;i<40;i++) P(rnd()*W, 65+rnd()*18, rnd()<.5?"#6a7056":"#2e3326");
  R(0, 83, W, 1, "#2a2e22");
  // kloakvatten längst fram
  gradient(84, H, ["#2e4a28","#24401f","#1a3016"]);
  for(let i=0;i<14;i++){ const x=rnd()*W, y=85+rnd()*4; R(x, y, 3+rnd()*5, 1, "#5a7a3e"); }
  for(let i=0;i<4;i++){ const x=rnd()*W; R(x, 86, 2, 1, "#c9d870"); }
};

// ---------- GRAVFÄLT ----------
RITA.gravfalt = (ctx, rnd) => {
  const {R, P, gradient, alfa, kam, fyllKam} = mal(ctx);
  gradient(0, 64, ["#120f20","#1f1a34","#332b4e","#4f4468","#6e5f80"]);
  for(let i=0;i<30;i++) P(rnd()*W, rnd()*36, rnd()<.3?"#ffffff":"#b8b0d0");
  // stor måne med moln
  const mx = 30 + rnd()*100, my = 16; const g = ctx.createRadialGradient(mx,my,3,mx,my,28); g.addColorStop(0,"#e8e0ff70"); g.addColorStop(1,"#0000"); ctx.fillStyle=g; ctx.fillRect(mx-28,my-28,56,56);
  ctx.fillStyle="#ece6f6"; ctx.beginPath(); ctx.arc(mx,my,9,0,7); ctx.fill(); R(mx-3,my-3,3,2,"#cfc6e2"); R(mx+2,my+2,2,2,"#cfc6e2");
  for(let k=0;k<2;k++){ const cy = my-2+k*6; for(let x=mx-24;x<mx+28;x++) if(Math.sin(x*0.3+k*2)>-0.3) P(x, cy + (Math.sin(x*0.2)>0?0:1), "#3a3352"); }
  // kullar och kapell i siluett
  fyllKam(kam(rnd, 48, 4, [0.03,0.09]), "#262238", 64);
  const kx = 100 + rnd()*40;
  R(kx, 36, 14, 14, "#1a1728"); R(kx+5, 26, 4, 10, "#1a1728"); R(kx+6, 22, 2, 4, "#1a1728"); R(kx+4, 23, 6, 1, "#1a1728");
  R(kx+2, 34, 10, 2, "#1a1728"); P(kx+5, 41, "#ffcc66"); P(kx+6, 41, "#ffcc66"); P(kx+5, 42, "#e0a040");
  // döda träd
  for(let i=0;i<3;i++) dottTrad(ctx, 8+rnd()*144, 60, 16+rnd()*14, "#1a1728", rnd);
  // dimma vid horisonten
  for(let k=0;k<3;k++) alfa(0, 50+k*4, W, 3, "#9a94b8", .12);
  // smidesstaket
  for(let x=2;x<W;x+=4){ if(rnd()<.15) continue; R(x, 52, 1, 11, "#1c1a26"); P(x, 51, "#2c2a36"); }
  R(0, 55, W, 1, "#1c1a26"); R(0, 60, W, 1, "#1c1a26");
  // gravstenar i olika former
  for(let i=0;i<10;i++){
    const x = 2 + i*16 + rnd()*6, y = 56 + rnd()*6, typ = Math.floor(rnd()*3), lut = rnd()<.3 ? 1 : 0;
    if(typ===0){ R(x, y, 7, 9, "#6c6e78"); R(x+1, y-2, 5, 2, "#6c6e78"); R(x+2, y-3, 3, 1, "#6c6e78"); R(x+5, y-1, 2, 10, "#4e5058"); R(x+2, y+2, 3, 1, "#4e5058"); }
    else if(typ===1){ R(x+2, y-4, 2, 13, "#6c6e78"); R(x, y-1, 6, 2, "#6c6e78"); P(x+3, y-4, "#8a8c96"); }
    else { R(x, y+2, 8, 7, "#5c5e66"); R(x, y+2, 8, 1, "#7a7c86"); R(x+lut*3, y, 3, 2, "#5c5e66"); }
  }
  // gräs och gravkullar
  gradient(64, H, ["#323a2a","#2a3122","#22281c","#1a1f16"]);
  R(0, 63, W, 1, "#3e4834");
  for(let i=0;i<3;i++){ const x=10+rnd()*140, y=80+rnd()*6; R(x, y, 18, 2, "#3a3020"); R(x+2, y-1, 14, 1, "#4a3e2a"); }
  for(let i=0;i<50;i++){ const x=rnd()*W, y=64+rnd()*26; P(x,y,"#465238"); P(x,y-1,"#3a4430"); }
  for(let k=0;k<2;k++) alfa(0, 72+k*8, W, 4, "#a8a2c4", .10);
};

// ---------- TRÄSK ----------
RITA.trask = (ctx, rnd) => {
  const {R, P, gradient, alfa, kam, fyllKam} = mal(ctx);
  gradient(0, 64, ["#1e2618","#2c3822","#44523a","#66734f","#8a9468"]);
  // blek sol i diset
  const sx = 40 + rnd()*80; ctx.save(); ctx.globalAlpha=.35; ctx.fillStyle="#e8ecc0"; ctx.beginPath(); ctx.arc(sx,20,8,0,7); ctx.fill(); ctx.restore();
  // döda träd med hängande mossa
  for(let i=0;i<6;i++){ const x=rnd()*W, h=18+rnd()*22; dottTrad(ctx, x, 60, h, "#1c2416", rnd);
    for(let k=0;k<4;k++){ const mx = x - 6 + rnd()*12, my = 60 - h + 4 + rnd()*h*0.5; for(let j=0;j<4+rnd()*6;j++) P(mx, my+j, "#4a5a34"); } }
  // dimslöjor
  for(let k=0;k<4;k++) alfa(0, 40+k*5, W, 4, "#c8ceb0", .10);
  // svart vatten
  gradient(58, H, ["#2e3c28","#26341f","#1e2a19","#172114"]);
  // spegling av träd i vattnet
  for(let i=0;i<20;i++){ const x=rnd()*W; for(let k=0;k<6+rnd()*8;k++) if(k%2===0) P(x, 60+k, "#1a2414"); }
  for(let i=0;i<10;i++){ const x=rnd()*W, y=60+rnd()*28; R(x, y, 4+rnd()*6, 1, "#4a5c3c"); }
  // näckrosblad
  for(let i=0;i<7;i++){ const x=rnd()*W, y=62+rnd()*26; R(x, y, 5, 2, "#4f7a34"); R(x+1, y-1, 3, 1, "#5e8c3e"); P(x+2, y, "#2e3c28"); if(rnd()<.3) P(x+1, y-1, "#f2d0e0"); }
  // lerig holme där sällskapet står
  const kant = Array.from({length:W}, (_,x) => 68 + Math.sin(x*0.08 + rnd()*0.01)*2 + Math.sin(x*0.23)*1.5);
  for(let x=0;x<W;x++){ for(let y=Math.floor(kant[x]); y<85; y++) P(x, y, y < kant[x]+2 ? "#5a5434" : (dither(x,y) > 0.5 ? "#454128" : "#3c3822")); }
  for(let i=0;i<30;i++) P(rnd()*W, 70+rnd()*14, rnd()<.5?"#5e5838":"#2e2a1a");
  // vass och kaveldun i kanterna
  for(let i=0;i<16;i++){ const x = rnd()<.5 ? rnd()*24 : 136+rnd()*24, b = 70+rnd()*16, h = 8+rnd()*12;
    R(x, b-h, 1, h, "#5a6a30"); if(rnd()<.6){ R(x, b-h, 1, 3, "#5a3a1e"); } else P(x+1, b-h+2, "#6a7a3a"); }
  // lyktgubbar
  for(let i=0;i<5;i++){ const x=10+rnd()*140, y=30+rnd()*30; const g = ctx.createRadialGradient(x,y,0,x,y,4); g.addColorStop(0,"#d8ff8a90"); g.addColorStop(1,"#0000"); ctx.fillStyle=g; ctx.fillRect(x-4,y-4,8,8); P(x,y,"#f4ffc0"); }
};

// ---------- Vägg- och golvbakgrund för värdshuset finns i grafik.js ----------

// Rita med cache: varje (miljö, frö) ritas en gång och återanvänds sedan
const CACHE = new Map();
// Egna målade bakgrunder (320×180, dubbel upplösning) i mappen bakgrunder/. Saknas en miljö här ritas den med kod.
const EGNA = { grotta:["grotta1","grotta2"], skog:["skog1","skog2","skog1natt","skog2natt"], oken:["oken1","oken2"], berg:["berg1","berg2"] };
const EBILDER = {};
const egenBild = namn => { if(!EBILDER[namn]){ const i=new Image(); i.src="bakgrunder/"+namn+".png"; EBILDER[namn]=i; } return EBILDER[namn]; };
window.BAKGRUND = {
  // Returnerar en bild som inte hunnit laddas (så att scenen kan ritas om när den är klar), annars null.
  rita(ctx, miljo, fro){
    const lista = EGNA[miljo];
    if(lista){
      const img = egenBild(lista[((fro||7)>>>0) % lista.length]);
      if(img.complete && img.naturalWidth){
        ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=false;
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
        return null;
      }
      if(!img.complete) { this.kod(ctx, miljo, fro); return img; }
    }
    this.kod(ctx, miljo, fro); return null;
  },
  kod(ctx, miljo, fro){
    const nyckel = miljo + ":" + (fro||7);
    let c = CACHE.get(nyckel);
    if(!c){
      c = document.createElement("canvas"); c.width = W; c.height = H;
      const cx = c.getContext("2d"); cx.imageSmoothingEnabled = false;
      (RITA[miljo] || RITA.grotta)(cx, slump((fro||7) * 7 + 3));
      CACHE.set(nyckel, c);
      if(CACHE.size > 40) CACHE.delete(CACHE.keys().next().value);
    }
    ctx.drawImage(c, 0, 0);
  },
  finns: miljo => !!RITA[miljo],
  harEgen: miljo => !!EGNA[miljo]
};
})();
