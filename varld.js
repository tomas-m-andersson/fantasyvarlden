// Fantasyvärlden – platser, uppdragsgivare, uppdrag, monster, rum och händelser.
// Bygger på Rollspelsklubbens värld. Alla texter är egna sammanfattningar.
(function(){
const V = {};

// ---------- Miljöer ----------
V.MILJO = {
  grotta:{namn:"Grotta",himmel:["#0d0b10","#1c1820"],mark:"#3a3226",sten:"#5a4e3e"},
  skog:{namn:"Skog",himmel:["#16261b","#22402a"],mark:"#2d4a26",sten:"#4b3a24"},
  oken:{namn:"Öken",himmel:["#f0a85a","#f6d28a"],mark:"#d9a75c",sten:"#b9813f"},
  berg:{namn:"Berg",himmel:["#7aa3c9","#b9d4e8"],mark:"#6b6f78",sten:"#8d929c"},
  ruin:{namn:"Ruin",himmel:["#3d4660","#6f7a96"],mark:"#4a4a44",sten:"#77766c"},
  kloak:{namn:"Kloak",himmel:["#10140f","#1d2419"],mark:"#3d4a2c",sten:"#56604a"},
  gravfalt:{namn:"Gravfält",himmel:["#1c1a2c","#3a3554"],mark:"#2e3326",sten:"#6c6e74"},
  trask:{namn:"Träsk",himmel:["#28321f","#45543a"],mark:"#34402a",sten:"#5c6646"},
  fangelse:{namn:"Fängelse",himmel:["#121116","#24222a"],mark:"#2c2a2e",sten:"#4a474e"}
};

// ---------- Fiender ----------
// typ "folk" = slår för att träffa (anfall), "best" = anfallen träffar alltid men kan undvikas/pareras.
// attacker: slumpas för "best". alla:true = träffar alla hjältar. effekt: "nackdel" | "stoppa" | "vp"
V.FIENDER = {
  orch:{namn:"Orch",typ:"folk",kp:10,rust:1,anfall:12,skada:"T8",sprite:"orch",folk:true},
  svartalf:{namn:"Svartalf",typ:"folk",kp:8,rust:1,anfall:12,skada:"T6",sprite:"svartalf",folk:true},
  svartnisse:{namn:"Svartnisse",typ:"folk",kp:5,rust:0,anfall:10,skada:"T4",sprite:"svartalf",folk:true,liten:true},
  rovare:{namn:"Rövare",typ:"folk",kp:9,rust:1,anfall:11,skada:"T8",sprite:"rovare",folk:true},
  kultist:{namn:"Kultist från Tarragons Hand",typ:"folk",kp:9,rust:0,anfall:12,skada:"T6",sprite:"kultist",folk:true},
  stadsvakt:{namn:"Stadsvakt",typ:"folk",kp:11,rust:3,anfall:12,skada:"T8",sprite:"rovare",folk:true},
  desertor:{namn:"Desertör",typ:"folk",kp:10,rust:2,anfall:12,skada:"T8",sprite:"rovare",folk:true},
  harpya:{namn:"Harpya",typ:"best",kp:10,rust:1,sprite:"harpya",attacker:[
    {namn:"Klor",text:"river med klorna",skada:"T6"},
    {namn:"Störtdyk",text:"störtdyker",skada:"T8"},
    {namn:"Skrik",text:"skriker så att öronen blöder",skada:"T4",effekt:"nackdel"}]},
  ratta:{namn:"Jätteråtta",typ:"best",kp:6,rust:0,sprite:"ratta",liten:true,attacker:[
    {namn:"Bett",text:"biter",skada:"T4"},{namn:"Smittbett",text:"biter med smutsiga tänder",skada:"T6"}]},
  varg:{namn:"Ulv",typ:"best",kp:10,rust:1,sprite:"varg",attacker:[
    {namn:"Bett",text:"biter",skada:"T6"},{namn:"Strupgrepp",text:"hugger efter strupen",skada:"T8"},
    {namn:"Ylande",text:"ylar så att blodet isar sig",skada:0,effekt:"nackdel"}]},
  bjorn:{namn:"Brunbjörn",typ:"best",kp:22,rust:2,sprite:"bjorn",stor:true,attacker:[
    {namn:"Ramslag",text:"slår med ramen",skada:"T8"},{namn:"Bett",text:"biter",skada:"T10"},
    {namn:"Björnkram",text:"kramar",skada:"2T6"}]},
  odod:{namn:"Odöd soldat",typ:"best",kp:12,rust:2,sprite:"odod",attacker:[
    {namn:"Rostigt svärd",text:"hugger med ett rostigt svärd",skada:"T8"},
    {namn:"Gravgrepp",text:"griper med iskalla benfingrar",skada:"T6",effekt:"vp"},
    {namn:"Ihåligt skri",text:"skriker ur sin tomma strupe",skada:0,effekt:"nackdel"}]},
  dendroid:{namn:"Dendroid",typ:"best",kp:16,rust:3,sprite:"dendroid",attacker:[
    {namn:"Grenslag",text:"piskar med grenarna",skada:"T8"},
    {namn:"Rötter",text:"snärjer med rötter",skada:"T4",effekt:"stoppa"},
    {namn:"Lövkvävning",text:"kväver med lövverket",skada:"T6"}]},
  tiger:{namn:"Sabeltandad tiger",typ:"best",kp:18,rust:1,sprite:"tiger",stor:true,attacker:[
    {namn:"Klor",text:"river",skada:"T8"},{namn:"Sabeltänder",text:"hugger med sabeltänderna",skada:"T10"},
    {namn:"Språng",text:"kastar sig över",skada:"2T6"}]},
  gast:{namn:"Gast",typ:"best",kp:14,rust:0,sprite:"gast",attacker:[
    {namn:"Isande beröring",text:"rör vid",skada:"T6",effekt:"vp"},
    {namn:"Klagan",text:"klagar så hjärtskärande att",skada:0,effekt:"nackdel",alla:true},
    {namn:"Spökkast",text:"kastar en gravsten på",skada:"T8"}]},
  // ---- Bossar ----
  orchhovding:{namn:"Orchhövdingen Grorm",typ:"folk",kp:22,rust:3,anfall:14,skada:"T10+2",sprite:"orch",boss:true,folk:true},
  rovarhovding:{namn:"Rövarhövdingen",typ:"folk",kp:18,rust:2,anfall:14,skada:"T8+2",sprite:"rovare",boss:true,folk:true},
  svartalfkung:{namn:"Den nya svartalfkungen",typ:"folk",kp:20,rust:2,anfall:14,skada:"T8+3",sprite:"svartalf",boss:true,folk:true},
  hogprast:{namn:"Högprästen i Tarragons Hand",typ:"folk",kp:20,rust:1,anfall:13,skada:"T8+1",sprite:"kultist",boss:true,folk:true,besv:"2T6"},
  harpydrottning:{namn:"Harpydrottningen",typ:"best",kp:26,rust:2,sprite:"harpya",boss:true,attacker:[
    {namn:"Klor",text:"river med enorma klor",skada:"2T6"},{namn:"Vingstorm",text:"piskar upp en storm mot",skada:"T6",alla:true},
    {namn:"Skrik",text:"skriker så att alla tappar fattningen –",skada:0,effekt:"nackdel",alla:true}]},
  rattkung:{namn:"Råttkungen",typ:"best",kp:22,rust:1,sprite:"ratta",boss:true,attacker:[
    {namn:"Svärm",text:"skickar en svärm råttor över",skada:"T4",alla:true},{namn:"Tandgarnityr",text:"biter",skada:"2T6"},
    {namn:"Pestandedräkt",text:"andas ut ett pestmoln över",skada:"T6",alla:true}]},
  general:{namn:"Den odöda generalen",typ:"best",kp:28,rust:4,sprite:"odod",boss:true,attacker:[
    {namn:"Tvåhandssvärd",text:"klyver med ett väldigt svärd",skada:"2T8"},
    {namn:"Dödens order",text:"befaller de döda att slå mot",skada:"T6",alla:true},
    {namn:"Gravkyla",text:"blåser gravkyla över",skada:"T4",effekt:"vp",alla:true}]},
  dendroidmoder:{namn:"Dendroidmodern",typ:"best",kp:32,rust:4,sprite:"dendroid",boss:true,attacker:[
    {namn:"Stamslag",text:"slår med hela stammen",skada:"2T8"},{namn:"Rotnät",text:"låter rötter skjuta upp under",skada:"T6",alla:true,effekt:"stoppa"},
    {namn:"Sporer",text:"sprider kvävande sporer över",skada:"T4",alla:true}]},
  grip:{namn:"Gripen",typ:"best",kp:24,rust:2,sprite:"grip",boss:true,attacker:[
    {namn:"Näbb",text:"hackar",skada:"T10"},{namn:"Klor",text:"griper",skada:"2T6"},
    {namn:"Vingslag",text:"slår omkull",skada:"T6",effekt:"stoppa"}]},
  gravvaktare:{namn:"Kyrkogårdsvaktaren",typ:"best",kp:24,rust:2,sprite:"gast",boss:true,attacker:[
    {namn:"Spade",text:"drämmer en spade i",skada:"2T6"},{namn:"Isande blick",text:"stirrar på",skada:"T6",effekt:"vp"},
    {namn:"Begravning",text:"vräker jord över",skada:"T4",alla:true,effekt:"nackdel"}]},
  drake:{namn:"Den talande draken",typ:"best",kp:38,rust:4,sprite:"drake",boss:true,stor:true,attacker:[
    {namn:"Eldlunga",text:"sprutar eld över",skada:"2T6",alla:true},{namn:"Klor",text:"sliter i",skada:"2T8"},
    {namn:"Svans",text:"sveper med svansen mot",skada:"2T6"},
    {namn:"Föreläsning",text:"håller en lång och nedlåtande föreläsning för",skada:0,effekt:"nackdel",alla:true}]},
  // Resen Bulk – fångad i Mörka Gollenskogen, såld till Gojans gladiatorgrop. Bossen i ”Gojans gladiatorgrop”.
  rese:{namn:"Resen Bulk",typ:"best",kp:30,rust:2,sprite:"orch",boss:true,stor:true,attacker:[
    {namn:"Spikklubba",text:"svingar sin spikklubba mot",skada:"2T8"},{namn:"Knytnäve",text:"drämmer en knytnäve stor som en tunna i",skada:"2T6"},
    {namn:"Bänkkast",text:"river loss en läktarbänk och slänger den mot",skada:"T6",alla:true},
    {namn:"Stampa",text:"stampar så att hela gropen skakar under",skada:"T4",alla:true,effekt:"stoppa"},
    {namn:"Vrål",text:"vrålar så att publiken tystnar –",skada:0,effekt:"nackdel",alla:true}]},
  // General Kieslawski – ledare för desertörerna norr om Svartborgen, har utropat en egen stat. Bossen i Svartborgen.
  kieslawski:{namn:"General Kieslawski",typ:"best",kp:28,rust:3,sprite:"rovare",boss:true,attacker:[
    {namn:"Sabelhugg",text:"hugger med sin böjda sabel mot",skada:"2T6"},{namn:"Handarmborst",text:"skjuter med sitt handarmborst på",skada:"T8"},
    {namn:"Till anfall!",text:"vrålar en order, och hans desertörer hugger mot",skada:"T6",alla:true},
    {namn:"Medaljglans",text:"putsar sina stulna medaljer så att de bländar",skada:0,effekt:"nackdel",alla:true},
    {namn:"Kappsvep",text:"sveper med den pälskantade kappan och sparkar undan benen på",skada:"T4",effekt:"stoppa"}]}
};

// Vilka fiender som hör hemma var
V.POOL = {
  grotta:["orch","orch","svartnisse","tiger","ratta"],
  skog:["varg","rovare","harpya","bjorn","dendroid"],
  oken:["rovare","rovare","varg","kultist"],
  berg:["harpya","orch","varg","tiger"],
  ruin:["rovare","gast","kultist","odod"],
  kloak:["ratta","ratta","kultist","svartnisse"],
  gravfalt:["odod","odod","gast","rovare"],
  trask:["dendroid","varg","ratta","gast"],
  fangelse:["desertor","desertor","stadsvakt","orch"]
};

// ---------- Uppdrag ----------
// Varje uppdrag har en uppdragsgivare, en plats, en miljö och en boss.
V.UPPDRAG = [
 {id:"skold",givare:"Porsch Wilson",titel:"Abu Bagars gyllene sköld",plats:"Östra bergen",land:"Bedinin",miljo:"grotta",boss:"drake",beloning:300,rum:7,
  text:"Kung Abu Bagars gyllene favoritsköld åkte ner i magen på en drake under en drakjakt. Porsch Wilson – alven med svetsarglasögonen – samlar ihop ett gäng som ska hämta tillbaka den. Draken bor i en grotta i Östra bergen, bortom den brännheta Östra öknen.",
  foremal:"Abu Bagars gyllene sköld",svar:"Porsch Wilson nickar bakom de mörka glasögonen. Gripen bakom honom gäspar."},
 {id:"barnen",givare:"Barden Baror",titel:"Barden Barors barn",plats:"Harpybergen",land:"Grador",miljo:"berg",boss:"harpydrottning",beloning:600,rum:7,
  text:"Superkändisen Barden Baror har fortfarande inte fått tillbaka sina kidnappade barn Ulf och Ulfina. Nya spår pekar mot Harpybergen. Belöningen är fortfarande saftig, och Midsol kryllar av lycksökare.",
  foremal:"Ulf och Ulfina",svar:"Barden Baror torkar en tår och nynnar på en av sina hits."},
 {id:"patricia",givare:"Mandor Marvolt",titel:"Patricias sista vila",plats:"Marmoracs kyrkogård",land:"Grador",miljo:"gravfalt",boss:"gravvaktare",beloning:250,rum:6,
  text:"Gasten Mandor Marvolt på Vesselberget kan inte bli fri förrän hans trolovade Patricia återvänder. Hon ligger begravd på Marmoracs kyrkogård, gravplats 362B. Någon – eller något – vaktar gravarna. Håna inte Mandor. Han är känslig.",
  foremal:"Patricias kvarlevor",svar:"”Sluta håna mig! Jag är en gast!” säger Mandor, fast ingen hånade honom."},
 {id:"gripagg",givare:"Gitte von Gittemberg",titel:"Ett gripägg till Gitte",plats:"Mt. Kraknor",land:"Liane",miljo:"berg",boss:"grip",beloning:400,rum:6,
  text:"Den ofantligt rika Gitte von Gittemberg, som äger nästan hela Marmoracs hamn, vill ha ett gripägg. Hennes betjänt Mulder pekar mot Mt. Kraknor i Liane, där vilda gripar häckar.",
  foremal:"Ett gripägg",svar:"Mulder räcker över en kontrakt-rulle utan att säga ett ord."},
 {id:"tarragon",givare:"Lansor",titel:"Tarragons Hand i gruvorna",plats:"Malbecks gruvor",land:"Mårdgård",miljo:"grotta",boss:"hogprast",beloning:280,rum:6,
  text:"Gruvarbetare i Malbec försvinner, och det viskas om svartklädda kultister från Tarragons Hand – organisationen som leds av ”Ondskan Själv”. Lansor har ett uppdrag. Han tar sina vanliga 10 procent.",
  foremal:"Tarragons svarta sigill",svar:"Lansor drar i sin Fu Manchu-mustasch. ”Tio procent. Som vanligt.”"},
 {id:"hostvakt",givare:"Familjen von Borge",titel:"Höstvakterna",plats:"Bududuoar",land:"Gallvenien",miljo:"gravfalt",boss:"general",beloning:260,rum:6,
  text:"Det är höst i Bududuoar, och de döda från det uråldriga blodiga kriget vaknar som vanligt. Familjen von Borge behöver höstvakter som skyddar egendomen mot både odöda och banditer.",
  foremal:"Generalens hjälm",svar:"Familjen spikar igen fönstren och åker därifrån."},
 {id:"slasby",givare:"Slasbys församling",titel:"Dendroiderna i Slasby",plats:"Skogen norr om Slasby",land:"Dorisbergen",miljo:"skog",boss:"dendroidmoder",beloning:240,rum:6,
  text:"Rövarbyn Slasby har anfallits av dendroider, och halva församlingen är död. Hannes – bryggare, bartender och en av Slasbys borgmästare – på Den fallande fågeln (numera stadshuset) vill att någon tar reda på vem eller vad som ligger bakom.",
  foremal:"Ett hjärta av levande trä",svar:"Hannes ställer fram en egenbryggd IPA. ”På huset. Om ni överlever.”"},
 {id:"rattor",givare:"Eva",titel:"Råttorna under Kras-Kras",plats:"Kras-Kras kloaker",land:"Dargobar",miljo:"kloak",boss:"rattkung",beloning:180,rum:6,
  text:"Kras-Kras har ett fint avloppssystem som ingen använder – folk slänger fortfarande allt genom fönstren. I tunnlarna har råttorna vuxit sig enorma. Kentauren Eva på Evas uppdragsförmedling i Hjälmby lottar ut sina jobb genom att kasta kniv med ögonbindel – och den här gången träffade kniven Kras-Kras.",
  foremal:"Råttkungens krona",svar:"Eva stampar med hovarna. ”Jobb är jobb.”"},
 {id:"svartalf",givare:"Hövding Atlas",titel:"Den nya svartalfkungen",plats:"Tunnlarna under Mårdgård",land:"Mårdgård",miljo:"grotta",boss:"svartalfkung",beloning:220,rum:6,
  text:"Svartalfkungen klövs på mitten av en blixt, men nu har en ny kung tagit över tunnlarna under Mårdgård. Hövding Atlas i Skrovby betalar gärna igen. Han undrar fortfarande var hans son Greg är.",
  foremal:"Svartalfkungens krona",svar:"Atlas tittar misstänksamt på er. ”Har ni sett Greg?”"},
 {id:"krusbar",givare:"Clark",titel:"Orcherna i Krusbärsberget",plats:"Krusbärsberget",land:"Bedinin",miljo:"grotta",boss:"orchhovding",beloning:200,rum:6,
  text:"Clark på värdshuset Den stegrande hingsten har inte glömt sin son Greger, som dog i Krusbärsberget. Orcherna där har blivit fler och tar nu karavaner vid Draksjön. Clark vill ha hämnd.",
  foremal:"Gregers halsduk",svar:"Clark torkar ett glas med en smutsig trasa och tittar bort."},
 {id:"broncos",givare:"Borgmästaren i Hagbo",titel:"Broncos i Hagbo",plats:"Skogen vid riksväg 40",land:"Gallvenien",miljo:"skog",boss:"rovarhovding",beloning:160,rum:5,
  text:"Det lokala rövarbandet Broncos har börjat råna folk längs riksväg 40. Hagbo, där alla hus ser exakt likadana ut och alla har en Hagwow, vill bli av med dem.",
  foremal:"Broncos fana",svar:"Borgmästaren klappar sin Hagwow."},
 {id:"gojan",givare:"Mona",titel:"Gojans gladiatorgrop",plats:"Batik",land:"Bedinin",miljo:"oken",boss:"rese",beloning:400,rum:6,sovande:true,skuld:"Garvard",
  text:"Sällskapet är skyldigt Garvard pengar – och skulden växer med ränta. På Monas gäststuga i ökenhamnen Batik får ni höra att Gojan, som äger gladiatorgropen ute i öknen, betalar bra för starka kämpar. Och ni har ju resen Bulk, som ni fångade i Mörka Gollenskogen. Han ligger nedsövd på en kärra. Nu gäller det bara att få honom fram innan sömndrycken går ur.",
  foremal:"",svar:"Gojan räknar upp guldet mynt för mynt medan Bulk bärs ut på en dörr. Mona pratar redan om luftskeppet till spaöarna Bedjar och Kali."},
 {id:"doda-sjon",givare:"Professor Proppeteus",titel:"Vattenprover från Döda sjön",plats:"Döda sjön",land:"Grador",miljo:"trask",boss:"gast",beloning:150,rum:5,
  text:"Professor Proppeteus behöver vattenprover från Döda sjön utanför Cranford för sin mycket originella forskning. Sjön lär vara förgiftad sedan kriget. Det spökar också, säger folk.",
  foremal:"Tre flaskor giftigt sjövatten",svar:"Professorn tittar på er genom tre par glasögon samtidigt."}
];

// ---------- Platser att utforska (läget "Utforska en plats", utan berättelse) ----------
// Varje kapitel är några rum och slutar med en av platsens bossar. Ju djupare, desto svårare.
V.PLATSER = [
 {id:"gollenskogen",namn:"Gollenskogen",land:"Mårdgård",miljo:"skog",bossar:["dendroidmoder","harpydrottning"],text:"Mörk och läskig skog nära Malbec. Sedan Raven dog har harpyor flyttat in."},
 {id:"krusbarsberget",namn:"Krusbärsberget",land:"Bedinin",miljo:"grotta",bossar:["orchhovding"],text:"Berget vid Draksjön, där grottorna kryllar av orcher."},
 {id:"harpybergen",namn:"Harpybergen",land:"Grador",miljo:"berg",bossar:["harpydrottning","grip"],text:"En läskig och obehaglig bergskedja full av harpyor."},
 {id:"ostra-oknen",namn:"Östra öknen",land:"Bedinin",miljo:"oken",bossar:["rovarhovding","drake"],text:"Fruktansvärd hetta. Längst österut bor en talande drake."},
 {id:"malbecs-gruvor",namn:"Malbecs gruvor",land:"Mårdgård",miljo:"grotta",bossar:["hogprast","svartalfkung"],text:"Gruvgångarna under arbetarstaden Malbec. Det viskas om Tarragons Hand."},
 {id:"kras-kras",namn:"Kras-Kras kloaker",land:"Dargobar",miljo:"kloak",bossar:["rattkung"],text:"Ett fint avloppssystem som ingen använder. Råttorna har vuxit sig enorma."},
 {id:"gravskogen",namn:"Gravskogen",land:"Gallvenien",miljo:"gravfalt",bossar:["general","gravvaktare"],text:"Gravarna från Det röda slaget står så tätt att de bildat en skog."},
 {id:"vesselberget",namn:"Vesselberget",land:"Grador",miljo:"ruin",bossar:["rovarhovding","gravvaktare"],text:"Ett förfallet utkikstorn och fästning. Gasten Mandor Marvolt spökar här. Under tornruinen ska hans skatt ligga nedgrävd – 136 guldmynt, enligt honom själv."},
 {id:"svartborgen",namn:"Svartborgen",land:"Waltsala",miljo:"fangelse",bossar:["kieslawski"],text:"Det svarta fängelset som ni en gång rymde från. Nu har general Kieslawski och hans desertörer tagit över – och efterlysningarna med era ansikten sitter kvar på väggarna."},
 {id:"doda-sjon",namn:"Döda sjön",land:"Grador",miljo:"trask",bossar:["dendroidmoder","gast"],text:"Sjön nära Cranford, förgiftad sedan kriget. Allt som rinner ut i den är också förgiftat."}
];

// ---------- Rum ----------
V.RUMTEXT = {
  grotta:["En fuktig grotta där vatten droppar från taket.","En smal gång som slingrar sig nedåt i mörkret.","En stor sal med stalaktiter som hänger som tänder.","Ett kyligt rum som luktar orch och gammal ost.","En grotta full av ben. Mest djurben. Mest."],
  skog:["En glänta där solen knappt når ner.","Tät granskog där stigen nästan försvinner.","En bäck som porlar mellan mossiga stenar.","En nedbrunnen lägereld som fortfarande är varm.","Gamla ekar med ansikten inristade i barken."],
  oken:["Sanddyner så långt ögat når. Det är fruktansvärt varmt.","Ett uttorkat flodfår med blekta ben.","En liten oas med ett grumligt vattenhål.","En halvt begravd staty av en häst med människohuvud.","Klippor som ger lite efterlängtad skugga."],
  berg:["En smal stig längs en brant klippvägg.","En blåsig bergsplatå med utsikt över halva Fantasyvärlden.","En klyfta med en vinglig hängbro.","Ett gammalt bo med fjädrar stora som åror.","Snöfläckar och isande vind."],
  ruin:["En kollapsad sal där valvet har rasat in.","Ett gammalt utkikstorn med trappor som saknar steg.","En övervuxen gård med en torr brunn.","En kapellruin där någon nyligen tänt ljus.","En källare med tunnor som luktar surt vin."],
  kloak:["En kloaktunnel där det är mycket tydligt att ingen använder avloppet.","En kulvert där vattnet når upp till knäna.","En korsning av fyra tunnlar och oräkneliga ögon i mörkret.","En gammal pumpstation full av spindelväv.","En tunnel där väggarna rör sig. Det är råttor."],
  gravfalt:["Gravstenar står tätt, lutar åt alla håll.","Ett gravkor med en tung järngrind.","En öppen grav. Den var inte öppen nyss.","Ett gammalt gravkapell med söndriga fönster.","Dimma ligger tung över kullarna."],
  trask:["Grönt vatten som bubblar illavarslande.","En spång av ruttnande plankor.","En döende björk med en hängsnara i.","Dimma och kväkande grodor.","En halvsjunken båt med någon sorts symbol på."],
  fangelse:["En lång cellgång med rostiga galler.","Fängelsegården, full av desertörernas tält.","Vaktrummet, där tärningarna fortfarande ligger på bordet.","Valven långt under jord, där kedjorna hänger från väggarna.","Uppe på ringmuren, där vinden river i fanorna."]
};
// ---------- Rumsbeskrivningar som byggs ihop av delar: plats + något man ser + något man hör/luktar/känner ----------
// Spelet slumpar en del ur varje lista (och undviker upprepningar under samma äventyr), så att rummen sällan blir likadana.
V.RUMDELAR = {
  grotta:{
    plats:["En fuktig grotta där vatten droppar från taket","En smal gång som slingrar sig nedåt i mörkret","En stor sal med stalaktiter som hänger som tänder","En låg tunnel där alla utom ankorna måste huka sig","En grotta med ett underjordiskt vattenhål i mitten","En spricka i berget, precis bred nog att klämma sig igenom","En grottsal där taket försvinner upp i mörkret","Ett runt rum som någon har huggit ut med hacka","En korsning där tre gångar möts","En sluttande gång täckt av löst grus","En grotta full av glittrande kristaller","En trång passage med kalla, svettiga väggar"],
    syn:["Ben ligger utspridda över golvet – mest djurben. Mest","En slocknad lägereld omges av ohyggligt dåligt huggna träsniderier","På väggen har någon ristat ”ORCHER ÄR BÄST” med stavfel","En rostig hjälm ligger upp och ner i ett hörn","Fladdermöss hänger i taket och följer er med blicken","Ett gammalt rep hänger ner ur ett hål i taket","Spår i leran visar att något stort nyss gick här","En halväten ost ligger på en sten","Väggmålningar visar jägare som jagar något med alldeles för många ben","En trasig tunna läcker något som kanske en gång var öl","Någon har lämnat ett par strumpor på tork","Svamp växer i ringar på golvet och lyser svagt blått"],
    sinne:["Det luktar orch och gammal ost","Det droppar oavbrutet någonstans i mörkret","Ett avlägset muller får golvet att darra","Luften är så kall att andedräkten syns","Ett ekande skratt hörs – sedan blir det helt tyst","Det luktar bränt, som om någon nyss stekt något","Vinden viner genom gångarna som en sorgsen flöjt","Det knastrar under fötterna","Det luktar fuktig ull och svavel","Långt borta hörs någon som slår på en gryta"]},
  skog:{
    plats:["En glänta där solen knappt når ner","Tät granskog där stigen nästan försvinner","En bäck som porlar mellan mossiga stenar","Gamla ekar med ansikten inristade i barken","En stig kantad av enorma ormbunkar","En sänka full av nedfallna stammar","Ett hygge med stubbar så långt ögat når","En skogssjö blank som en spegel","En stig som går i cirklar – ni har varit här förut","En dunge av vita björkar","En backe täckt av blåbärsris","Ett snår så tätt att ni måste hugga er igenom"],
    syn:["En nedbrunnen lägereld är fortfarande varm","En ensam sko hänger i ett träd","Svampar i alla regnbågens färger växer i en ring","En rävlya med ett kranium utanför","En skylt säger ”HÄR BOR INGEN” med stora bokstäver","Spår efter en björn – eller en väldigt stor dvärg","En trasig armborst ligger i mossan","Fåglarna i träden har slutat sjunga","Någon har knutit små tygbitar på grenarna","En stor myrstack har rasat ihop, som om något trampat i den","En hydda av grenar som ser nybyggd ut","Ett gammalt rövarläger med en tom tunna"],
    sinne:["Det doftar kåda och regn","Myggen är fruktansvärda","En gök gal någonstans – trettiofyra gånger","Det prasslar i buskarna bakom er","Luften är tung och fuktig","Ett grenbrott hörs, sedan ett till","Det luktar rök från en eld någon annanstans","Vinden får träden att knaka som gamla dörrar","Det är så tyst att man hör sina egna hjärtslag","Doften av vilda smultron är nästan förförisk"]},
  oken:{
    plats:["Sanddyner så långt ögat når","Ett uttorkat flodfår med blekta ben","En liten oas med ett grumligt vattenhål","En halvt begravd staty av en häst med människohuvud","Klippor som ger lite efterlängtad skugga","En saltöken som glittrar i solen","En karavanväg markerad med stenrösen","Ett raviner där sanden har blåst bort","Ruinerna av ett tält, halvt begravt i sanden","En platå av röd, sprucken lera","Ett fält av märkliga, vindslipade stenar","En sänka där hettan står stilla"],
    syn:["Ett kamelskelett pekar med nosen mot öster","En skylt: ”BEDININ CITY – INGA DVÄRGAR”","Gamar cirklar långt ovanför","En tom vattensäck ligger och fladdrar","Spår av hästar – många hästar","En hägring visar en sjö som inte finns","En gammal krukskärva med hästfolkets tecken","Skorpioner kryper fram ur en spricka","Någon har ritat en karta i sanden – och sedan suddat ut den","Resterna av en karavan som aldrig kom fram","En ensam palm som har gett upp","Sanden är full av små, glittrande mynt – nej, det är skalbaggar"],
    sinne:["Det är fruktansvärt varmt","Sanden letar sig in överallt","Vinden viskar och kastar sand i ögonen","Luften dallrar av hetta","Det luktar bränd sten","Ni hör en avlägsen kamelklocka","Tystnaden är total","Solen bränner som om den har något personligt emot er","Svetten rinner och vattnet tar slut alldeles för fort","En het vind kommer plötsligt från ingenstans"]},
  berg:{
    plats:["En smal stig längs en brant klippvägg","En blåsig bergsplatå med utsikt över halva Fantasyvärlden","En klyfta med en vinglig hängbro","Ett gammalt bo med fjädrar stora som åror","Ett pass mellan två toppar","En grotta halvvägs upp i bergväggen","En glaciär som knakar under fötterna","En sluttning full av lösa stenar","En utsiktspunkt där någon har byggt ett stenröse","En smal kam med stup på båda sidor","En dal där molnen ligger lågt","En gammal gruvgång, igenspikad med plankor"],
    syn:["Ett örnbo med stulna smycken i","En bergsget stirrar oavbrutet på er","Snöfläckar ligger kvar i skuggorna","Ett gammalt rep sitter fast i en järnkrok","Rester av en lavin har begravt stigen","En vimpel från Harpybergen fladdrar i vinden","Spår av klor i klippan, djupa som fingrar","Ett kors av sten där någon en gång föll","En övergiven ryggsäck full av gamla kartor","Någon har ristat ”Garvard var här” – såklart","Tre små stenhögar i rad, som ett meddelande","Ben från något som har flugit in i berget"],
    sinne:["Isande vind river i kläderna","Luften är tunn och svår att andas","Det ekar så att varje ord kommer tillbaka tre gånger","Stenar rasar någonstans ovanför","Ett skri hörs från toppen","Det luktar snö och järn","Molnen sveper förbi under era fötter","Det knakar oroväckande i berget","Solen bländar mot snön","Vinden ylar som en ensam varg"]},
  ruin:{
    plats:["En kollapsad sal där valvet har rasat in","Ett gammalt utkikstorn med trappor som saknar steg","En övervuxen gård med en torr brunn","En kapellruin där någon nyligen tänt ljus","En källare med tunnor","En gammal tronsal utan tak","En korridor med söndriga fönster","Ett bibliotek där böckerna har ruttnat","En vallgrav fylld med grönt vatten","En matsal där bordet fortfarande är dukat","Ett vakttorn där trappan går rakt ut i luften","En kyrkogård innanför murarna"],
    syn:["Ett porträtt av en ädling följer er med blicken","En sköld med ett vapen ingen längre minns","Murgröna har vuxit genom golvet","Ett skelett i rustning sitter lutat mot väggen","En fresk visar en kung som ser väldigt nöjd ut","Spindelväv täcker allt som ett grått tyg","En tunna med texten ”VIN – EJ FÖR TJÄNARE”","Någon har nyligen sopat golvet – men varför?","Ett nedfallet ljuskrona ligger mitt i rummet","Inskriptioner på ett språk som kanske är baklänges svenska","En gammal ringbrynja hänger på en krok","En barnleksak – en trähäst – står mitt på golvet"],
    sinne:["Det luktar surt vin och damm","Dörrar knarrar fast ingen rör dem","Duvor kurrar i takbjälkarna","Vinden visslar genom springorna","Det är kallare här än det borde vara","Ett avlägset klingande, som av en klocka","Damm virvlar upp vid minsta rörelse","Det luktar gammalt papper och mögel","Sten skrapar mot sten någonstans","En röst viskar ert namn – eller var det bara vinden?"]},
  kloak:{
    plats:["En kloaktunnel där det är mycket tydligt att ingen använder avloppet","En kulvert där vattnet når upp till knäna","En korsning av fyra tunnlar","En gammal pumpstation","En tunnel där väggarna rör sig – det är råttor","En valvsal där allt avfall från Kras-Kras samlas","En smal avsats längs en strid ström","En rostig gallergrind som står på glänt","Ett schakt som leder uppåt mot ett lock","En sal med pelare täckta av slem","En tunnel som sluttar brant nedåt","Ett gammalt förråd som någon har bott i"],
    syn:["Något flyter förbi. Ni bestämmer er för att inte titta närmare","Ett råttbo byggt av gamla skor","Någon har ritat en pil och skrivit ”UT” – pilen pekar rakt in i väggen","En väldigt stor, väldigt död fisk","Svamp som växer i formen av ett ansikte","Ett tappat gräddtårtsfat, halvätet","Rester av en uppbruten skattkista","Ögon som glänser i mörkret – många ögon","En gammal kartlapp över kloakerna, uppäten i kanterna","Spår av något med väldigt många tår","En hög med fönsterkastat bråte från staden ovanför","En ensam stövel som står upprätt, som om någon fortfarande har den på sig"],
    sinne:["Det stinker fruktansvärt","Vatten porlar och kluckar överallt","Det piper och tisslar i mörkret","Luften är så fuktig att det droppar från näsan","Ekot gör att varje steg låter som tio","Det luktar ruttna ägg och ännu värre saker","Ett avlägset brus, som av en stor ström","Något skrapar mot röret ovanför","Det luktar faktiskt lite gott här – det är oroväckande"]},
  gravfalt:{
    plats:["Gravstenar står tätt och lutar åt alla håll","Ett gravkor med en tung järngrind","En öppen grav – den var inte öppen nyss","Ett gammalt gravkapell med söndriga fönster","Kullar av gravar så långt ögat når","En massgrav från Det röda slaget","En allé av döda träd mellan gravarna","Ett mausoleum med en adelssläkts namn","En liten kyrkogård bakom en rostig grind","En kulle där korsen står i rader","En dödgrävarstuga med släckt fönster","En sänka där dimman samlas"],
    syn:["En gravsten säger ”HÄR VILAR NÅGON SOM INTE VILAR”","Färska blommor på en mycket gammal grav","En spade står nedstucken i jorden","Ett skelett har satt sig upp och ser fundersamt ut","Kråkor sitter på varje kors och tittar","En lykta brinner på en grav – ingen har tänt den","En hand sticker upp ur marken. Den vinkar","Graven bredvid har ert namn på sig – nej, ett annat namn, tack och lov","Ett gammalt vapen ligger bland gravarna","Någon har ställt fram en kopp rött té på en grav","Rustningar från kriget ligger halvt nedgrävda","En gravsten med ett ristat ankhuvud"],
    sinne:["Dimman ligger tung över kullarna","Det luktar fuktig jord och förruttnelse","En klocka slår tretton gånger","Det knastrar som av ben under mossan","Ett jämrande hörs långt borta","Kylan kryper in under rustningen","Det är helt vindstilla – men gräset rör sig","Det luktar rökelse och gammalt blod","Viskningar hörs från gravarna","Det är så tyst att ni hör er själva svälja"]},
  trask:{
    plats:["Grönt vatten som bubblar illavarslande","En spång av ruttnande plankor","En döende björk mitt i dyn","Dimma och kväkande grodor","En halvsjunken båt","En liten ö av fast mark","Ett vassbälte högre än en hobbit","En strand där vattnet är svart","En gammal hydda på pålar","Ett gyttjigt flodfår","En gammal damm som har brustit","En gyttjig väg som är mer väg i teorin än i praktiken"],
    syn:["En symbol är målad på båtens sida","Lyktgubbar dansar ute i dimman","En stövel sticker upp ur dyn – med en fot i","Myggor i moln stora som hus","En gammal fiskare har lämnat sitt nät","Döda fiskar flyter med magen upp","En skylt: ”BADA EJ – GIFT”","Grodor sitter i rad och stirrar","Bubblor stiger upp i ett regelbundet mönster, som andetag","Ett skelett med ett metspö","En krokodil – nej, en stock – nej, en krokodil","Rester av ett fiskeläger, övergivet i hast"],
    sinne:["Det luktar ruttet och sött","Det plaskar någonstans i vassen","Myggen surrar i öronen","Dyn suger tag i stövlarna","Dimman gör allt grått och mjukt","Grodor kväker i kör","Det bubblar och puttrar runt omkring","Luften är varm och kvav","Det luktar gift och dött vatten","Ett djupt läte hörs från mitten av träsket"]},
  fangelse:{
    plats:["En lång cellgång med rostiga galler på båda sidor","En cellgång där hälften av celldörrarna är utbrutna","Cellen ni själva satt i en gång – nummer sju","En rad trånga celler med halm på golvet","Fängelsegården, där desertörerna slagit upp sina tält","Den leriga fängelsegården med en sprucken brunn","Ett hörn av gården under ett vakttorn","Vaktrummet med ett bord fullt av tärningar och sejdlar","Ett vaktrum med en nyckelknippa på kroken","Vaktrummets spisrum, där elden nästan slocknat","Valven långt under jord, där vattnet droppar","Ett lågt valv med kedjor som hänger från väggarna","En underjordisk gång med igengallrade hål i golvet","Uppe på ringmuren, där vinden river i fanorna","En vallgång på muren med en rostig armborstkastare","Ringmuren vid ett halvt raserat vakttorn"],
    syn:["En efterlysning med era ansikten sitter spikad på väggen – 1000 guldmynt","Någon har ritat ett skägg på efterlysningen av er","En gammal fånge känner igen er och viskar att ni måste vara galna som kom tillbaka","Generalens svartröda fanor hänger överallt","En stulen kista står öppen och tom","Ett tärningsspel har avbrutits mitt i","Någon har ristat ett streck för varje dag på väggen – det är väldigt många streck","En hög med stulna rustningar ligger i ett hörn","Ett porträtt av Kieslawski hänger snett, med alla medaljerna noga målade","Råttor har byggt bo i en gammal fångdräkt","En vaktlista med en enda regel: ”Generalen har alltid rätt”"],
    sinne:["Det luktar surt öl och gammal halm","Någonstans rasslar kedjor","Desertörer skrålar en sång om generalens storhet","Det ekar när någon slår igen en järndörr","Det är iskallt mellan stenväggarna","Kråkor kraxar uppe på murarna","En trumma slår långsamt någonstans uppe på gården","Någon snarkar högt bakom en dörr","Vinden viner genom gluggarna"]
  }
};
// Ibland läggs en extra rad till – små detaljer från Fantasyvärlden
V.RUMEXTRA = [
  "Långt borta hörs en ensam luta spela Lasse Holm.",
  "Någon har ristat ”Bakhuvudet Jens var här” på väggen.",
  "Ett gammalt anslag från Lansors förmedling hänger halvt nedrivet: ”10 % – som vanligt”.",
  "En tom kopp med en rödaktig fläck i botten. Rött té? FF skulle bli så avundsjuk.",
  "En björnhatt med ett ankhuvud ovanpå ligger kvarglömd. Nej, det är inte Monikas. Den här är mindre.",
  "En lapp: ”Har ni sett Greg? / Atlas”.",
  "Ett efterlysningsanslag med Obdullahs sigill.",
  "Någon har lämnat fyra kilo bröd i en prydlig hög.",
  "En fjäder från en stör-örn virvlar förbi."
];

V.FALLOR = {
  grotta:[{namn:"Stenras",text:"Taket börjar rasa!",skada:"T8"},{namn:"Fallgrop",text:"Marken ger vika över en grop med spetsar.",skada:"T6"}],
  skog:[{namn:"Snara",text:"En rövarsnara rycker upp någon i benet.",skada:"T6"},{namn:"Giftpil",text:"En snubbeltråd utlöser en giftpil.",skada:"T8"}],
  oken:[{namn:"Kvicksand",text:"Sanden börjar suga ner er.",skada:"T6"},{namn:"Skorpionbo",text:"Marken kryllar plötsligt av skorpioner.",skada:"T6"}],
  berg:[{namn:"Lavin",text:"Stenar dundrar nerför sluttningen.",skada:"T8"},{namn:"Isfläck",text:"Stigen är spegelblank.",skada:"T6"}],
  ruin:[{namn:"Ras",text:"Golvet ger vika.",skada:"T8"},{namn:"Gillerfälla",text:"En gammal fälla med rostiga blad slår igen.",skada:"T6"}],
  kloak:[{namn:"Gasficka",text:"En gasficka antänds av facklan!",skada:"T8"},{namn:"Strömt vatten",text:"Vattnet stiger plötsligt.",skada:"T6"}],
  gravfalt:[{namn:"Förbannad grav",text:"En förbannelse slår ut ur en gravsten.",skada:"T6",vp:true},{namn:"Kollapsande grav",text:"Någon trampar rakt ner i en gammal grav.",skada:"T6"}],
  trask:[{namn:"Dy",text:"Dyn suger tag i fötterna.",skada:"T6"},{namn:"Giftiga ångor",text:"Träsket andas ut något grönt.",skada:"T6",vp:true}],
  fangelse:[{namn:"Fallgaller",text:"Ett tungt fallgaller rasar ner bakom er!",skada:"T8"},{namn:"Larmklocka",text:"Någon trampar på en snubbeltråd och en larmklocka börjar ringa – armborstpilar viner genom gången.",skada:"T6"}]
};
// Hinder: alla måste klara slaget (alla:true) eller så räcker det att en lyckas.
V.HINDER = [
  {namn:"En bred klyfta",text:"En klyfta skär av vägen. Den går att hoppa över – om man är smidig.",fard:"Akrobatik",alla:true,skada:"T6",miljo:["berg","grotta","ruin"]},
  {namn:"Forsande vatten",text:"Vägen går genom strömt vatten. Den som inte kan simma får det jobbigt.",fard:"Simma",alla:true,skada:"T6",miljo:["grotta","skog","kloak","trask"]},
  {namn:"En låst port",text:"En tung, låst port. Någon behöver dyrka upp den.",fard:"Fingerfärdighet",alla:false,skada:"T4",miljo:["ruin","grotta","kloak","gravfalt","fangelse"]},
  {namn:"En brant klippa",text:"Enda vägen fram är uppåt.",fard:"Akrobatik",alla:true,skada:"T6",miljo:["berg","oken","ruin"]},
  {namn:"En gåta i sten",text:"En stenport med en inristad gåta. Någon lärd måste klura ut svaret.",fard:"Kunskap",alla:false,skada:"T4",miljo:["ruin","grotta","gravfalt","oken"]},
  {namn:"Vaktrundan",text:"En vaktrunda med fackla kommer gående. Alla måste smyga förbi utan att märkas.",fard:"Smyga",alla:true,skada:"T6",miljo:["fangelse"]},
  {namn:"En låst cell",text:"Vägen går genom en låst cell. Någon stark måste bända upp gallret.",fard:"STY",alla:false,skada:"T4",miljo:["fangelse"]},
  {namn:"Brännande sand",text:"En lång sträcka utan skugga. Man måste hålla ut.",fard:"FYS",alla:true,skada:"T4",miljo:["oken"]}
];
V.SKATTER = ["Läkedryck","Läkande ört","Läkande ört","Kråkmossa","Krigarfasa","Läkedryck"];

// ---------- Möten (på resan och i rummen) ----------
// npc = figuren som visas i TV:n: ark "stad"/"by" (npc/stad.png, npc/by.png) och ruta 0–63, eller en fiendefigur.
// effekter: guld (tal), sak (namn), kp ("T6" på alla), vp, skada (på den som slog), skadaAlla, strid (fiende-id), ingenting
V.MOTEN = [
 {id:"egon",namn:"Egon, rastplatsvakten",npc:{ark:"by",ruta:10},sprite:"manniska",resa:true,
  text:"En slö man i en vaktkur hävdar att det här är en ”Pay to stay”-rastplats. Han blev rastplatsvakt mest av en slump.",
  val:[{knapp:"Betala 5 guld och vila",kostnad:5,auto:{text:"Egon kokar välling. Den är förvånansvärt god.",kp:"T6",vp:"T4"}},
       {knapp:"Övertala honom om gratis vila",fard:"Övertala",lyckat:{text:"Egon rycker på axlarna. ”Visst, varför inte.”",kp:"T6"},misslyckat:{text:"Egon blir ledsen och ni får sova i diket. Det regnar.",skadaAlla:"T4"}},
       {knapp:"Gå vidare",auto:{text:"Ni lämnar Egon åt sitt öde."}}]},
 {id:"fjass",namn:"Fjäss, den deprimerade demonen",npc:{ark:"stad",ruta:26},sprite:"gast",resa:true,
  text:"En flera hundra år gammal demon släpar på en säck med sin döde bror i. Han ser väldigt nedstämd ut.",
  val:[{knapp:"Muntra upp honom",fard:"Uppträda",lyckat:{text:"Fjäss ler för första gången på 300 år och ger er något ur säcken. Ni frågar inte vad.",guld:40},misslyckat:{text:"Fjäss blir ännu mer nedstämd. Det smittar av sig.",vpAlla:"T4"}},
       {knapp:"Fråga om hans bror",fard:"Övertala",lyckat:{text:"Han berättar en lång historia. Ni lär er en del om Efterriket.",vp:"T4"},misslyckat:{text:"Han börjar gråta. Det varar i tre timmar.",ingenting:true}},
       {knapp:"Smyg förbi",fard:"Smyga",lyckat:{text:"Ni smyger förbi utan problem."},misslyckat:{text:"Fjäss ser er och svingar säcken i ren frustration.",skada:"T6"}}]},
 {id:"garvard",namn:"Garvard, den irriterande äventyraren",npc:{fiende:"stadsvakt"},sprite:"manniska",resa:true,
  text:"En blond, långhårig man i fin rustning rider förbi och berättar hur han bestigit berget Kevaros och funnit skatten bakom Magests Bur. Igen.",
  val:[{knapp:"Utmana honom på armbrytning",fard:"Slagsmål",lyckat:{text:"Garvard förlorar och rider surt därifrån. Han tappar sin börs.",guld:30},misslyckat:{text:"Garvard vinner och skrattar högt. Ert självförtroende rasar.",vpAlla:"T4"}},
       {knapp:"Låtsas vara imponerade",fard:"Bluffa",lyckat:{text:"Garvard blir så smickrad att han ger er en läkedryck.",sak:"Läkedryck"},misslyckat:{text:"Garvard genomskådar er direkt och berättar ALLA sina äventyr. Ni förlorar en hel dag."}},
       {knapp:"Ignorera honom",auto:{text:"Han rider bredvid er en stund ändå."}}]},
 {id:"ginzy",namn:"Ginzys gäng",npc:{fiende:"rovare"},sprite:"rovare",resa:true,
  text:"Den rödhåriga krigarkvinnan Ginzy och hennes kumpaner Legolas, Martin Mangler och halvorchen Borbor slår läger vid vägen. Hon föreslår ett vad.",
  val:[{knapp:"Anta vadet (tärningsspel)",fard:"Fingerfärdighet",lyckat:{text:"Ni fuskar skickligt och vinner potten.",guld:50},misslyckat:{text:"Ni förlorar och får betala.",guld:-30}},
       {knapp:"Avböj artigt",fard:"Övertala",lyckat:{text:"Ginzy respekterar det och delar med sig av proviant.",kp:"T4"},misslyckat:{text:"Ginzy tolkar det som en förolämpning. Det blir slagsmål.",strid:"rovare"}},
       {knapp:"Gå vidare",auto:{text:"Ni tar en omväg runt lägret."}}]},
 {id:"dunker",namn:"Dunkers hus",npc:{ark:"by",ruta:17},sprite:"alv",resa:true,
  text:"Ni passerar den exklusiva restaurangen Dunkers hus i ett trädhus. Dunker Dunkersson själv frågar om ni önskar se husets meny.",
  val:[{knapp:"Äta (10 guld)",kostnad:10,auto:{text:"Den bästa måltiden i ert liv. Alla läker.",kp:"2T6",vp:"T6"}},
       {knapp:"Smita från notan",fard:"Smyga",lyckat:{text:"Ni äter gott och smiter ut genom fönstret.",kp:"2T6"},misslyckat:{text:"”Det ska vara lugnt på Dunkers hus!” Dunker lyfter er med magi och hivar ut er genom entrén, långt ner på marken.",skadaAlla:"T6"}},
       {knapp:"Gå förbi",auto:{text:"Det luktar fantastiskt. Ni går hungriga vidare."}}]},
 {id:"proppeteus",namn:"Professor Proppeteus",npc:{ark:"stad",ruta:7},sprite:"manniska",resa:true,
  text:"En lärd man med mycket originella forskningsmetoder vill testa ett nytt elixir på någon.",
  val:[{knapp:"Testa elixiret",fard:"FYS",lyckat:{text:"Det fungerar! Ni känner er starkare.",kp:"2T6",vp:"T4"},misslyckat:{text:"Det fungerar inte. Det smakar som avloppsvatten från Kras-Kras.",skada:"T6"}},
       {knapp:"Köpa hans gamla prov (15 guld)",kostnad:15,auto:{text:"Ni får två läkedrycker. Förmodligen.",sak:"Läkedryck",sak2:"Läkedryck"}},
       {knapp:"Avböj",auto:{text:"Professorn antecknar ”avböjde” i sin bok."}}]},
 {id:"vagtull",namn:"Tullstation",npc:{fiende:"stadsvakt"},sprite:"rovare",resa:true,
  text:"En stadsvakt stoppar er vid en gränsstation och kräver tull. Han ser misstänksamt på er.",
  val:[{knapp:"Betala tull (10 guld)",kostnad:10,auto:{text:"Vakten stämplar något och vinkar er vidare."}},
       {knapp:"Ljug om att ni är diplomater",fard:"Bluffa",lyckat:{text:"Otroligt nog funkar det.",ingenting:true},misslyckat:{text:"Ni är usla på att ljuga. Det blir bråk.",strid:"stadsvakt"}},
       {knapp:"Smyg runt stationen",fard:"Smyga",lyckat:{text:"Ni tar er runt i skydd av mörkret."},misslyckat:{text:"Någon trampar på en kvist. Vakten slår larm.",strid:"stadsvakt"}}]},
 {id:"gycklare",namn:"Ett gycklarsällskap",npc:{ark:"stad",ruta:34},sprite:"manniska",resa:true,
  text:"Ett gycklarsällskap har fått problem med sin vagn vid vägkanten.",
  val:[{knapp:"Hjälpa till med vagnen",fard:"STY",lyckat:{text:"Vagnen rullar igen! Gycklarna bjuder på mat och en låt.",kp:"T6",vp:"T4"},misslyckat:{text:"Hjulet går sönder ännu mer. Någon klämmer fingrarna.",skada:"T4"}},
       {knapp:"Sjunga med dem",fard:"Uppträda",lyckat:{text:"Ni får applåder och lite växel.",guld:20},misslyckat:{text:"Gycklarna ber er artigt att sluta.",ingenting:true}},
       {knapp:"Rida förbi",auto:{text:"Ni rider förbi. De vinkar sorgset."}}]},
 {id:"orter",namn:"En örtgård",npc:{ark:"by",ruta:8},sprite:"manniska",resa:true,
  text:"Vid vägkanten växer det gott om läkeörter – om man vet vilka som är vilka.",
  val:[{knapp:"Plocka örter",fard:"Bestiologi",lyckat:{text:"Ni hittar rätt örter.",sak:"Läkande ört",sak2:"Läkande ört"},misslyckat:{text:"Ni plockar fel. Någon får utslag överallt.",skada:"T4"}},
       {knapp:"Gå vidare",auto:{text:"Ni går vidare."}}]},
 {id:"kopman",namn:"En kringresande köpman",npc:{ark:"kopman",ruta:0},sprite:"manniska",resa:true,
  text:"En köpman med en enorm packning på ryggen vinkar in er till vägkanten. ”Allt måste bort! Läkedrycker, örter, äkta drakfjäll!”",
  val:[{knapp:"Köpa en läkedryck (15 guld)",kostnad:15,auto:{text:"Köpmannen räcker över en flaska som ser nästan äkta ut.",sak:"Läkedryck"}},
       {knapp:"Pruta",fard:"Övertala",lyckat:{text:"Ni prutar ner honom till nästan ingenting. För 5 guld får ni en läkedryck och en ört på köpet.",guld:-5,sak:"Läkedryck",sak2:"Läkande ört"},misslyckat:{text:"Köpmannen blir förolämpad och tar 5 guld för att ni slösat hans tid.",guld:-5}},
       {knapp:"Gå vidare",auto:{text:"”Ni kommer att ångra er!” ropar han efter er."}}]},
 {id:"rovarbakhall",namn:"Bakhåll!",npc:{fiende:"rovare"},sprite:"rovare",resa:true,
  text:"Pilar viner över vägen. Rövare kliver fram ur buskarna och kräver allt ni äger.",
  val:[{knapp:"Slåss!",auto:{text:"Ni drar vapen.",strid:"rovare"}},
       {knapp:"Ge dem 20 guld",kostnad:20,auto:{text:"Rövarna tar guldet och försvinner skrattande."}},
       {knapp:"Fly",fard:"Undvika",lyckat:{text:"Ni springer därifrån i en pilregn utan att bli träffade."},misslyckat:{text:"En pil träffar i flykten.",skada:"T8"}}]},
 // ---- Bakhuvudet Jens: händelser när han skjutsar sällskapet med sin kärra ----
 {id:"jens-genvag",namn:"Bakhuvudet Jens tar en genväg",sprite:"manniska",jens:true,
  text:"Jens svänger av vägen utan förvarning. ”Genväg”, säger han, utan att vända sig om.",
  val:[{knapp:"Lita på Jens",auto:{text:"Det var faktiskt en genväg. Ni hinner till och med sova en stund i kärran.",kp:"T6",vp:"T4"}},
       {knapp:"Kräv att han tar stora vägen",fard:"Övertala",lyckat:{text:"Jens muttrar och vänder. Resan blir lång men lugn.",kp:"T4"},misslyckat:{text:"Jens låtsas inte höra. Genvägen går rakt genom ett törnsnår.",skadaAlla:"T4"}}]},
 {id:"jens-hjulet",namn:"Hjulet lossnar",sprite:"manniska",jens:true,
  text:"Det smäller till. Ett hjul rullar förbi kärran och vidare ner i diket. Bakhuvudet Jens sitter kvar på kuskbocken och väntar.",
  val:[{knapp:"Lyfta kärran och sätta tillbaka hjulet",fard:"STY",lyckat:{text:"Hjulet sitter på plats igen. Jens nickar mot hästen och kör vidare."},misslyckat:{text:"Kärran glider. Någon klämmer handen ordentligt.",skada:"T6"}},
       {knapp:"Låta Jens fixa det",auto:{text:"Jens kliver ner, fixar hjulet på tre sekunder och tar 5 guld för besväret.",guld:-5}}]},
 {id:"jens-rovare",namn:"Rövare vid vägen",sprite:"rovare",jens:true,
  text:"Rövare kastar sig fram och griper tag i hästens betsel. Jens drar åt sig tömmarna och väntar på att ni ska göra något.",
  val:[{knapp:"Hoppa av och slåss",auto:{text:"Ni hoppar av kärran med vapnen dragna.",strid:"rovare"}},
       {knapp:"Be Jens köra rakt igenom",fard:"Rida",lyckat:{text:"Jens smäller med piskan och kärran dundrar förbi. Rövarna dyker i diket."},misslyckat:{text:"Kärran välter och ni ligger i en hög på vägen. Det blir strid ändå.",strid:"rovare"}}]},
 {id:"jens-somnar",namn:"Jens somnar",sprite:"manniska",jens:true,
  text:"Kärran börjar sakta glida åt sidan. Bakhuvudet Jens har somnat vid tömmarna med hakan mot bröstet.",
  val:[{knapp:"Ta över tömmarna",fard:"Rida",lyckat:{text:"Ni styr kärran rätt hela vägen. Jens vaknar när ni är framme och tar ändå fullt betalt."},misslyckat:{text:"Kärran kör ner i ett dike. Alla flyger av.",skadaAlla:"T4"}},
       {knapp:"Väcka honom med en sång",fard:"Uppträda",lyckat:{text:"Jens vaknar och nynnar med. Stämningen i kärran är på topp.",vp:"T4"},misslyckat:{text:"Jens vaknar, men är på dåligt humör resten av resan och kräver 5 guld extra.",guld:-5}}]},
 {id:"jens-korv",namn:"Korvståndet",sprite:"manniska",jens:true,
  text:"Jens stannar kärran tvärt vid ett korvstånd. ”Fem minuter”, säger han.",
  val:[{knapp:"Bjuda Jens på korv (5 guld)",kostnad:5,auto:{text:"Jens äter i tystnad. Sedan kör han som han aldrig kört förut. Ni kommer fram utvilade.",kp:"T6"}},
       {knapp:"Äta er egen matsäck",auto:{text:"Ni äter ert eget. Jens äter två korvar och delar inte med sig."}}]},
 {id:"jens-liftare",namn:"En liftare",sprite:"manniska",jens:true,
  text:"En blond, långhårig man i fin rustning står vid vägkanten och vinkar. Det är Garvard, den irriterande äventyraren. Jens saktar in.",
  val:[{knapp:"Låta honom åka med",auto:{text:"Garvard berättar om berget Kevaros hela vägen. Ni förlorar lite av livsglädjen.",vpAlla:"T4"}},
       {knapp:"Säga åt Jens att köra vidare",fard:"Övertala",lyckat:{text:"Jens trampar på. Garvard blir en liten prick i fjärran."},misslyckat:{text:"Jens stannar ändå. Garvard pratar hela vägen men tappar sin börs när han kliver av.",guld:20}}]},
 // ---- Möten i rummen ----
 {id:"ormac",namn:"Häxan Ormac",npc:{ark:"stad",ruta:46},sprite:"alv",rum:true,
  text:"En naken häxa på över 400 år, från Skuggberget, vars hud bränns om man rör den. Hon är känd för att kunna bota Nattdöden. Hon erbjuder sig att hela er – för sju kopparmynt och en ”liten tjänst”.",
  val:[{knapp:"Betala (1 guld)",kostnad:1,auto:{text:"Hon blandar en salva av rävhår, granbark och kråkmossa. Det svider, men hjälper.",kp:"2T6"}},
       {knapp:"Fråga om hennes tjänst",fard:"Övertala",lyckat:{text:"Hon vill bara ha sällskap en stund. Hon ger er en giftig ört som tack.",sak:"Kråkmossa",kp:"T4"},misslyckat:{text:"Någon råkar röra vid henne. Det bränns!",skada:"T6"}},
       {knapp:"Gå vidare",auto:{text:"Hon ser besviken ut."}}]},
 {id:"torbyn",namn:"En gammal man i rob",npc:{ark:"by",ruta:4},sprite:"manniska",rum:true,
  text:"En gammal man som kallar sig Torbyn sitter på en sten. Han har konstigt röda ögon och en svans som sticker ut under roben.",
  val:[{knapp:"Göra en deal med honom",fard:"Övertala",lyckat:{text:"Han skrattar och ger er en säck guld. ”Vi ses i Efterriket.”",guld:80},misslyckat:{text:"Han skrattar och ni känner er plötsligt mycket tomma inombords.",vpAlla:"T6"}},
       {knapp:"Avslöja honom som Lucifer",fard:"Kunskap",lyckat:{text:"”Smart.” Han försvinner i en svavelpuff och lämnar något efter sig.",sak:"Läkedryck"},misslyckat:{text:"”Lucifer? Jag? Nej då.” Han är borta när ni blinkar. Er börs också.",guld:-20}},
       {knapp:"Gå förbi",auto:{text:"Han vinkar efter er. Hans getfötter klapprar mot stenen."}}]},
 {id:"fange",namn:"En fånge",npc:{ark:"stad",ruta:31},sprite:"manniska",rum:true,
  text:"En fastkedjad stackare ber om hjälp. Han påstår att han är oskyldig.",
  val:[{knapp:"Dyrka upp kedjorna",fard:"Fingerfärdighet",lyckat:{text:"Fången tackar och ger er sitt gömda arv.",guld:35},misslyckat:{text:"Låset går sönder och larmet går.",strid:"POOL"}},
       {knapp:"Slå sönder kedjorna",fard:"STY",lyckat:{text:"Kedjorna brister! Fången springer därifrån och glömmer en ört.",sak:"Läkande ört"},misslyckat:{text:"Ni får ont i händerna.",skada:"T4"}},
       {knapp:"Lämna honom",auto:{text:"Han ropar saker om er mamma tills ni är utom hörhåll."}}]},
 {id:"jones",namn:"Jones Docker",npc:{ark:"stad",ruta:8},sprite:"manniska",rum:true,
  text:"Arkeologen Jones Docker – träben, hatt och ärr över vänster öga – letar efter en gammal relik. Han lämnade familjen för äventyren, och på kvällarna slåss han mot dvärgen Croxy på värdshuset Den vämjeliga varanen. Nu vill han ha hjälp att läsa en karta.",
  val:[{knapp:"Läsa kartan",fard:"Kunskap",lyckat:{text:"Ni hittar skatten tillsammans och delar lika.",guld:45},misslyckat:{text:"Ni läser fel och leder honom rakt in i en vägg.",ingenting:true}},
       {knapp:"Utmana honom på tisdagsfajt",fard:"Slagsmål",lyckat:{text:"Jones tar av sig fårskinnsvästen, förlorar och skrattar. Han ger er en läkedryck.",sak:"Läkedryck"},misslyckat:{text:"Han slår er medvetslösa. Med träbenet.",skada:"T6"}},
       {knapp:"Säga hej och gå",auto:{text:"Han nickar och fortsätter leta."}}]},
 {id:"lik",namn:"Ett gammalt lik",npc:{fiende:"odod"},sprite:"odod",rum:true,
  text:"Ett lik ligger på golvet. Det har en börs i bältet. Det rör sig nästan inte alls.",
  val:[{knapp:"Plundra liket",fard:"Fingerfärdighet",lyckat:{text:"Ni tar börsen utan att väcka något.",guld:25},misslyckat:{text:"Liket vaknar!",strid:"odod"}},
       {knapp:"Ge det en anständig begravning",fard:"Kunskap",lyckat:{text:"Ni känner er som bättre människor (och alver, dvärgar, ankor).",vpAlla:"+T4"},misslyckat:{text:"Begravningen blir mest pinsam.",ingenting:true}},
       {knapp:"Gå förbi",auto:{text:"Ni låtsas inte se det."}}]}
];

// ---------- Efterriket: poolen på skyskrapetaket i Miami ----------
// Döda hjältar ligger i poolen tillsammans med den stora björnen Tetrok tills de köps tillbaka till livet.
V.EFTERRIKET = [
  "Vaknar i en ljummen pool på taket av en skyskrapa i Miami. Bredvid flyter Tetrok, en stor björn med cigarr och ett glas bubbel.",
  "Tetrok skjuter fram ett glas bubbel och nickar. Han säger ingenting, eftersom han är en björn.",
  "Neonljusen från Miami speglar sig i poolvattnet. Tetrok blåser en rökring och flyttar lite på sig så att det blir plats.",
  "Plaskar ner i poolen på skyskrapetaket. Tetrok tittar upp, suckar nöjt och tar en klunk bubbel. Här blir man kvar tills någon betalar."
];

window.VARLD = V;
})();
