// Fantasyvärlden – regelmotorn. Bygger på hur Drakar och Demoner fungerar, men allt är skrivet med egna ord.
// Grundidé: slå T20 och få LIKA MED eller UNDER färdighetsvärdet. Naturligt 1 = perfekt slag, naturligt 20 = katastrof.
(function(){
const R = {};

// ---------- Tärningar ----------
R.t = n => 1 + Math.floor(Math.random()*n);
// "2T6+1", "T8", "T4" → summa
R.slaTarning = (uttryck) => {
  if(!uttryck) return 0;
  const m = String(uttryck).replace(/\s/g,"").match(/^(\d*)T(\d+)([+-]\d+)?$/i);
  if(!m) return Number(uttryck)||0;
  const antal = Number(m[1]||1), sidor = Number(m[2]), plus = Number(m[3]||0);
  let s = plus; for(let i=0;i<antal;i++) s += R.t(sidor);
  return s;
};
R.valj = arr => arr[Math.floor(Math.random()*arr.length)];
R.blanda = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a; };

// ---------- Egenskaper och färdigheter ----------
R.EGENSKAPER = [["STY","Styrka"],["FYS","Fysik"],["SMI","Smidighet"],["INT","Intelligens"],["PSY","Psyke"],["KAR","Karisma"]];
R.FARD = {
  "Svärd":"STY","Yxor":"STY","Slagvapen":"STY","Spjut":"STY","Slagsmål":"STY",
  "Kniv":"SMI","Stav":"SMI","Pilbåge":"SMI","Armborst":"SMI","Slunga":"SMI","Kastvapen":"SMI",
  "Undvika":"SMI","Smyga":"SMI","Akrobatik":"SMI","Fingerfärdighet":"SMI","Simma":"SMI","Rida":"SMI",
  "Upptäcka fara":"INT","Finna dolda ting":"INT","Läkekonst":"INT","Bestiologi":"INT","Kunskap":"INT",
  "Övertala":"KAR","Bluffa":"KAR","Uppträda":"KAR",
  "Magi":"PSY"
};
R.VAPENFARD = ["Svärd","Yxor","Slagvapen","Spjut","Slagsmål","Kniv","Stav","Pilbåge","Armborst","Slunga","Kastvapen"];
// Grundchansen beror på egenskapen. Tränade färdigheter får den dubbla.
R.grundchans = v => v<=5?3 : v<=8?4 : v<=12?5 : v<=15?6 : 7;

// ---------- Vapen och rustning ----------
// fard = färdighet, skada = tärning, avstand = skjuts/kastas, bonus = fast tillägg
R.VAPEN = {
  "Dolk":{fard:"Kniv",skada:"T4"}, "Gulddolk":{fard:"Kniv",skada:"T4",bonus:1}, "Dolk av draktand":{fard:"Kniv",skada:"T4",bonus:2},
  "Strypsnara":{fard:"Kniv",skada:"T6"},
  "Kort svärd":{fard:"Svärd",skada:"T8"}, "Kroksabel":{fard:"Svärd",skada:"T8"}, "Rostigt svärd":{fard:"Svärd",skada:"T6"},
  "Vantim":{fard:"Svärd",skada:"T8",bonus:1,magisk:true}, "Nannheim":{fard:"Svärd",skada:"T8",bonus:1,magisk:true},
  "Gorgor":{fard:"Svärd",skada:"T8",magisk:true}, "Långsvärd":{fard:"Svärd",skada:"T10"},
  "Handyxa":{fard:"Yxor",skada:"T6"}, "Yxa":{fard:"Yxor",skada:"T8"}, "Stridsyxa":{fard:"Yxor",skada:"T10"},
  "Stridsgissel":{fard:"Slagvapen",skada:"T10"}, "Morgonstjärna":{fard:"Slagvapen",skada:"T8"}, "Träpåk":{fard:"Slagvapen",skada:"T6"},
  "Piska":{fard:"Slagvapen",skada:"T4"}, "Träpinne":{fard:"Slagvapen",skada:"T4"}, "Stridshammare":{fard:"Slagvapen",skada:"T10"},
  "Spjut":{fard:"Spjut",skada:"T8"}, "Kort spjut":{fard:"Spjut",skada:"T8"}, "Långt spjut":{fard:"Spjut",skada:"T10"},
  "Stav":{fard:"Stav",skada:"T6"}, "Trollstav":{fard:"Stav",skada:"T6"}, "Trästav":{fard:"Stav",skada:"T6"},
  "Kort båge":{fard:"Pilbåge",skada:"T8",avstand:true}, "Pilbåge":{fard:"Pilbåge",skada:"T10",avstand:true},
  "Armborst":{fard:"Armborst",skada:"T10",avstand:true}, "Slunga":{fard:"Slunga",skada:"T6",avstand:true},
  "Kastknivar":{fard:"Kastvapen",skada:"T4",avstand:true},
  "Knytnävar":{fard:"Slagsmål",skada:"T4"}
};
R.RUSTNING = { "Tygtunika":0, "Läderväst":1, "Ulvskinn":1, "Fjällpansar (ett ben)":1, "Läderrustning":1, "Ringbrynja":3, "Plåtrustning":5 };

// ---------- Besvärjelser (kostar 2 VP och kräver ett lyckat Magi-slag) ----------
// mal: "fiende", "allaFiender", "hjalte", "sjalv", "ingen"
R.BESV = {
  "Blixt":{mal:"fiende",text:"En blixt ur fingertopparna: 2T6 skada.",skada:"2T6"},
  "Eld":{mal:"fiende",text:"En eldstråle: 2T6 skada.",skada:"2T6"},
  "Eldklot":{mal:"allaFiender",text:"Ett eldklot som exploderar: T6 skada på alla fiender.",skada:"T6"},
  "Frost":{mal:"fiende",text:"Isande kyla: T6 skada och fienden tappar sin nästa handling.",skada:"T6",stoppa:true},
  "Hela":{mal:"hjalte",text:"Läker 2T6 KP. Kan rädda en döende hjälte.",laka:"2T6"},
  "Motståndskraft":{mal:"hjalte",text:"En hjälte får +2 i rustning resten av striden.",rustning:2},
  "Beskyddare":{mal:"hjalte",text:"Ett skimrande skydd: +3 i rustning resten av striden.",rustning:3},
  "Lyft":{mal:"fiende",text:"Lyfter fienden högt upp och släpper: T8 skada och den tappar sin nästa handling.",skada:"T8",stoppa:true},
  "Försegla":{mal:"fiende",text:"Låser fienden på plats: den tappar sina två nästa handlingar.",stoppa:true,stoppaRundor:2},
  "Teleportera":{mal:"ingen",text:"Hela sällskapet försvinner i en rökpuff och flyr striden.",fly:true},
  "Förtrolla vapen":{mal:"hjalte",text:"Ett vapen glöder: +T6 skada på alla anfall resten av striden.",vapenbonus:"T6"},
  "Salamander":{mal:"ingen",text:"Frammanar en eldsalamander som bränner en slumpad fiende för T8 varje runda i tre rundor.",salamander:3},
  "Kontrollera person":{mal:"fiende",text:"Tar över en människolik fiendes vilja: den slutar slåss och går därifrån.",kontroll:true},
  "Avbild":{mal:"ingen",text:"Illusoriska kopior av hela sällskapet: alla fiender får nackdel nästa runda.",skrack:true}
};
R.BESV_KOSTNAD = 2;
R.FORMAGA_KOSTNAD = 3;

// ---------- Saker som går att använda ----------
R.SAKER = {
  "Äppelcider":{text:"Monika blir glad och mordlysten: fördel på nästa anfall.",effekt:"fordelNasta",forbrukas:true},
  "Vin":{text:"Ett glas vin lugnar nerverna: återfå T4 VP.",effekt:"vp",dice:"T4",forbrukas:true},
  "Flaska vin":{text:"Klunkar vin: återfå T4 VP.",effekt:"vp",dice:"T4",forbrukas:true},
  "Grönfräken":{text:"Läkande ört: återfå T6 KP.",effekt:"kp",dice:"T6",forbrukas:true},
  "Läkande ört":{text:"Återfå T6 KP.",effekt:"kp",dice:"T6",forbrukas:true},
  "Läkedryck":{text:"Återfå 2T6 KP.",effekt:"kp",dice:"2T6",forbrukas:true},
  "Lite bröd":{text:"Mumsar bröd: återfå T4 KP.",effekt:"kp",dice:"T4",forbrukas:true},
  "En limpa bröd":{text:"Mumsar bröd: återfå T4 KP.",effekt:"kp",dice:"T4",forbrukas:true},
  "Torkat kött":{text:"Tuggar torkat kött: återfå T4 KP.",effekt:"kp",dice:"T4",forbrukas:true},
  "Torkade fikon":{text:"Äter fikon: återfå T4 KP.",effekt:"kp",dice:"T4",forbrukas:true},
  "Kråkmossa":{text:"Smörjer vapnet med gift: nästa träff gör +T6 skada.",effekt:"gift",forbrukas:true},
  "Hirtonbuske":{text:"Smörjer vapnet med gift: nästa träff gör +T6 skada.",effekt:"gift",forbrukas:true},
  "Krigarfasa":{text:"Röker en mystisk ört: fördel på nästa anfall.",effekt:"fordelNasta",forbrukas:true},
  "Tokfrans":{text:"Tuggar tokfrans: återfå T6 VP men nackdel på nästa slag.",effekt:"vpNackdel",dice:"T6",forbrukas:true},
  "Gravstensalm":{text:"Doftar på gravstensalm: återfå T4 VP.",effekt:"vp",dice:"T4",forbrukas:true},
  "Rött té":{text:"En kopp rött té. Gott, men inte mycket mer: återfå 1 KP.",effekt:"kp",dice:"1",forbrukas:true}
};

// ---------- Bygg en spelbar hjälte av grunddata ----------
R.fardVarde = (h, fard) => {
  if(h.varden && h.varden[fard]!=null) return Math.min(18, h.varden[fard]);
  const eg = R.FARD[fard] || "INT";
  const g = R.grundchans(h.e[eg]);
  return (h.tranad||[]).includes(fard) ? g*2 : g;
};
R.allaFard = h => Object.keys(R.FARD).map(f => ({namn:f, eg:R.FARD[f], varde:R.fardVarde(h,f), tranad:(h.tranad||[]).includes(f) || (h.varden&&h.varden[f]!=null)}));
R.skadebonus = (h, avstand) => {
  const v = avstand ? h.e.SMI : h.e.STY;
  return v>=17 ? "T6" : v>=13 ? "T4" : null;
};
R.maxKP = h => h.e.FYS;
R.maxVP = h => h.e.PSY;
R.rustning = h => (h.rustning ? (R.RUSTNING[h.rustning]||0) : 0);

// ---------- Slå ett slag ----------
// Returnerar {lyckat, drake, demon, slag, varde, text}
R.slag = (varde, lage) => { // lage: "fordel" | "nackdel" | undefined
  let a = R.t(20), b = null, s = a;
  if(lage==="fordel" || lage==="nackdel"){ b = R.t(20); s = lage==="fordel" ? Math.min(a,b) : Math.max(a,b); }
  const drake = s===1, demon = s===20;
  const lyckat = drake || (!demon && s<=varde);
  let text = (b!=null ? `[${a} / ${b} → ${s}]` : `[${s}]`) + ` mot ${varde}`;
  if(drake) text += " – NATURLIGT 1!"; else if(demon) text += " – NATURLIGT 20!"; else text += lyckat ? " – lyckat" : " – misslyckat";
  const res = {lyckat, drake, demon, slag:s, varde, text, lage, a, b};
  if(R.inspelning) R.inspelning.push(res);   // spelet kan visa slaget i tärningsrutan så att spelaren "slår" själv
  return res;
};
R.inspelning = null;

window.REGLER = R;
})();
