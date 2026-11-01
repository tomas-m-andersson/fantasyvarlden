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
  trask:{namn:"Träsk",himmel:["#28321f","#45543a"],mark:"#34402a",sten:"#5c6646"}
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
    {namn:"Föreläsning",text:"håller en lång och nedlåtande föreläsning för",skada:0,effekt:"nackdel",alla:true}]}
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
  trask:["dendroid","varg","ratta","gast"]
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
  text:"Rövarbyn Slasby har anfallits av dendroider, och halva församlingen är död. Hannes på Den fallande fågeln (numera stadshuset) vill att någon tar reda på vem eller vad som ligger bakom.",
  foremal:"Ett hjärta av levande trä",svar:"Hannes ställer fram en egenbryggd IPA. ”På huset. Om ni överlever.”"},
 {id:"rattor",givare:"Eva",titel:"Råttorna under Kras-Kras",plats:"Kras-Kras kloaker",land:"Dargobar",miljo:"kloak",boss:"rattkung",beloning:180,rum:6,
  text:"Kras-Kras har ett fint avloppssystem som ingen använder – folk slänger fortfarande allt genom fönstren. I tunnlarna har råttorna vuxit sig enorma. Kentauren Eva på Evas uppdragsförmedling har fått in ett jobb.",
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
 {id:"doda-sjon",givare:"Professor Proppeteus",titel:"Vattenprover från Döda sjön",plats:"Döda sjön",land:"Grador",miljo:"trask",boss:"gast",beloning:150,rum:5,
  text:"Professor Proppeteus behöver vattenprover från Döda sjön utanför Cranford för sin mycket originella forskning. Sjön lär vara förgiftad sedan kriget. Det spökar också, säger folk.",
  foremal:"Tre flaskor giftigt sjövatten",svar:"Professorn tittar på er genom tre par glasögon samtidigt."}
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
  trask:["Grönt vatten som bubblar illavarslande.","En spång av ruttnande plankor.","En döende björk med en hängsnara i.","Dimma och kväkande grodor.","En halvsjunken båt med någon sorts symbol på."]
};
V.FALLOR = {
  grotta:[{namn:"Stenras",text:"Taket börjar rasa!",skada:"T8"},{namn:"Fallgrop",text:"Marken ger vika över en grop med spetsar.",skada:"T6"}],
  skog:[{namn:"Snara",text:"En rövarsnara rycker upp någon i benet.",skada:"T6"},{namn:"Giftpil",text:"En snubbeltråd utlöser en giftpil.",skada:"T8"}],
  oken:[{namn:"Kvicksand",text:"Sanden börjar suga ner er.",skada:"T6"},{namn:"Skorpionbo",text:"Marken kryllar plötsligt av skorpioner.",skada:"T6"}],
  berg:[{namn:"Lavin",text:"Stenar dundrar nerför sluttningen.",skada:"T8"},{namn:"Isfläck",text:"Stigen är spegelblank.",skada:"T6"}],
  ruin:[{namn:"Ras",text:"Golvet ger vika.",skada:"T8"},{namn:"Gillerfälla",text:"En gammal fälla med rostiga blad slår igen.",skada:"T6"}],
  kloak:[{namn:"Gasficka",text:"En gasficka antänds av facklan!",skada:"T8"},{namn:"Strömt vatten",text:"Vattnet stiger plötsligt.",skada:"T6"}],
  gravfalt:[{namn:"Förbannad grav",text:"En förbannelse slår ut ur en gravsten.",skada:"T6",vp:true},{namn:"Kollapsande grav",text:"Någon trampar rakt ner i en gammal grav.",skada:"T6"}],
  trask:[{namn:"Dy",text:"Dyn suger tag i fötterna.",skada:"T6"},{namn:"Giftiga ångor",text:"Träsket andas ut något grönt.",skada:"T6",vp:true}]
};
// Hinder: alla måste klara slaget (alla:true) eller så räcker det att en lyckas.
V.HINDER = [
  {namn:"En bred klyfta",text:"En klyfta skär av vägen. Den går att hoppa över – om man är smidig.",fard:"Akrobatik",alla:true,skada:"T6",miljo:["berg","grotta","ruin"]},
  {namn:"Forsande vatten",text:"Vägen går genom strömt vatten. Den som inte kan simma får det jobbigt.",fard:"Simma",alla:true,skada:"T6",miljo:["grotta","skog","kloak","trask"]},
  {namn:"En låst port",text:"En tung, låst port. Någon behöver dyrka upp den.",fard:"Fingerfärdighet",alla:false,skada:"T4",miljo:["ruin","grotta","kloak","gravfalt"]},
  {namn:"En brant klippa",text:"Enda vägen fram är uppåt.",fard:"Akrobatik",alla:true,skada:"T6",miljo:["berg","oken","ruin"]},
  {namn:"En gåta i sten",text:"En stenport med en inristad gåta. Någon lärd måste klura ut svaret.",fard:"Kunskap",alla:false,skada:"T4",miljo:["ruin","grotta","gravfalt","oken"]},
  {namn:"Brännande sand",text:"En lång sträcka utan skugga. Man måste hålla ut.",fard:"FYS",alla:true,skada:"T4",miljo:["oken"]}
];
V.SKATTER = ["Läkedryck","Läkande ört","Läkande ört","Kråkmossa","Krigarfasa","Läkedryck"];

// ---------- Möten (på resan och i rummen) ----------
// effekter: guld (tal), sak (namn), kp ("T6" på alla), vp, skada (på den som slog), skadaAlla, strid (fiende-id), ingenting
V.MOTEN = [
 {id:"egon",namn:"Egon, rastplatsvakten",sprite:"manniska",resa:true,
  text:"En slö man i en vaktkur hävdar att det här är en ”Pay to stay”-rastplats. Han blev rastplatsvakt mest av en slump.",
  val:[{knapp:"Betala 5 guld och vila",kostnad:5,auto:{text:"Egon kokar välling. Den är förvånansvärt god.",kp:"T6",vp:"T4"}},
       {knapp:"Övertala honom om gratis vila",fard:"Övertala",lyckat:{text:"Egon rycker på axlarna. ”Visst, varför inte.”",kp:"T6"},misslyckat:{text:"Egon blir ledsen och ni får sova i diket. Det regnar.",skadaAlla:"T4"}},
       {knapp:"Gå vidare",auto:{text:"Ni lämnar Egon åt sitt öde."}}]},
 {id:"fjass",namn:"Fjäss, den deprimerade demonen",sprite:"gast",resa:true,
  text:"En flera hundra år gammal demon släpar på en säck med sin döde bror i. Han ser väldigt nedstämd ut.",
  val:[{knapp:"Muntra upp honom",fard:"Uppträda",lyckat:{text:"Fjäss ler för första gången på 300 år och ger er något ur säcken. Ni frågar inte vad.",guld:40},misslyckat:{text:"Fjäss blir ännu mer nedstämd. Det smittar av sig.",vpAlla:"T4"}},
       {knapp:"Fråga om hans bror",fard:"Övertala",lyckat:{text:"Han berättar en lång historia. Ni lär er en del om Efterriket.",vp:"T4"},misslyckat:{text:"Han börjar gråta. Det varar i tre timmar.",ingenting:true}},
       {knapp:"Smyg förbi",fard:"Smyga",lyckat:{text:"Ni smyger förbi utan problem."},misslyckat:{text:"Fjäss ser er och svingar säcken i ren frustration.",skada:"T6"}}]},
 {id:"garvard",namn:"Garvard, den irriterande äventyraren",sprite:"manniska",resa:true,
  text:"En blond, långhårig man i fin rustning rider förbi och berättar hur han bestigit berget Kevaros och funnit skatten bakom Magests Bur. Igen.",
  val:[{knapp:"Utmana honom på armbrytning",fard:"Slagsmål",lyckat:{text:"Garvard förlorar och rider surt därifrån. Han tappar sin börs.",guld:30},misslyckat:{text:"Garvard vinner och skrattar högt. Ert självförtroende rasar.",vpAlla:"T4"}},
       {knapp:"Låtsas vara imponerade",fard:"Bluffa",lyckat:{text:"Garvard blir så smickrad att han ger er en läkedryck.",sak:"Läkedryck"},misslyckat:{text:"Garvard genomskådar er direkt och berättar ALLA sina äventyr. Ni förlorar en hel dag."}},
       {knapp:"Ignorera honom",auto:{text:"Han rider bredvid er en stund ändå."}}]},
 {id:"ginzy",namn:"Ginzys gäng",sprite:"rovare",resa:true,
  text:"Den rödhåriga krigarkvinnan Ginzy och hennes kumpaner Legolas, Martin Mangler och halvorchen Borbor slår läger vid vägen. Hon föreslår ett vad.",
  val:[{knapp:"Anta vadet (tärningsspel)",fard:"Fingerfärdighet",lyckat:{text:"Ni fuskar skickligt och vinner potten.",guld:50},misslyckat:{text:"Ni förlorar och får betala.",guld:-30}},
       {knapp:"Avböj artigt",fard:"Övertala",lyckat:{text:"Ginzy respekterar det och delar med sig av proviant.",kp:"T4"},misslyckat:{text:"Ginzy tolkar det som en förolämpning. Det blir slagsmål.",strid:"rovare"}},
       {knapp:"Gå vidare",auto:{text:"Ni tar en omväg runt lägret."}}]},
 {id:"dunker",namn:"Dunkers hus",sprite:"alv",resa:true,
  text:"Ni passerar den exklusiva restaurangen Dunkers hus i ett trädhus. Dunker Dunkersson själv frågar om ni önskar se husets meny.",
  val:[{knapp:"Äta (10 guld)",kostnad:10,auto:{text:"Den bästa måltiden i ert liv. Alla läker.",kp:"2T6",vp:"T6"}},
       {knapp:"Smita från notan",fard:"Smyga",lyckat:{text:"Ni äter gott och smiter ut genom fönstret.",kp:"2T6"},misslyckat:{text:"”Det ska vara lugnt på Dunkers hus!” Dunker lyfter er med magi och hivar ut er genom entrén, långt ner på marken.",skadaAlla:"T6"}},
       {knapp:"Gå förbi",auto:{text:"Det luktar fantastiskt. Ni går hungriga vidare."}}]},
 {id:"proppeteus",namn:"Professor Proppeteus",sprite:"manniska",resa:true,
  text:"En lärd man med mycket originella forskningsmetoder vill testa ett nytt elixir på någon.",
  val:[{knapp:"Testa elixiret",fard:"FYS",lyckat:{text:"Det fungerar! Ni känner er starkare.",kp:"2T6",vp:"T4"},misslyckat:{text:"Det fungerar inte. Det smakar som avloppsvatten från Kras-Kras.",skada:"T6"}},
       {knapp:"Köpa hans gamla prov (15 guld)",kostnad:15,auto:{text:"Ni får två läkedrycker. Förmodligen.",sak:"Läkedryck",sak2:"Läkedryck"}},
       {knapp:"Avböj",auto:{text:"Professorn antecknar ”avböjde” i sin bok."}}]},
 {id:"vagtull",namn:"Tullstation",sprite:"rovare",resa:true,
  text:"En stadsvakt stoppar er vid en gränsstation och kräver tull. Han ser misstänksamt på er.",
  val:[{knapp:"Betala tull (10 guld)",kostnad:10,auto:{text:"Vakten stämplar något och vinkar er vidare."}},
       {knapp:"Ljug om att ni är diplomater",fard:"Bluffa",lyckat:{text:"Otroligt nog funkar det.",ingenting:true},misslyckat:{text:"Ni är usla på att ljuga. Det blir bråk.",strid:"stadsvakt"}},
       {knapp:"Smyg runt stationen",fard:"Smyga",lyckat:{text:"Ni tar er runt i skydd av mörkret."},misslyckat:{text:"Någon trampar på en kvist. Vakten slår larm.",strid:"stadsvakt"}}]},
 {id:"gycklare",namn:"Ett gycklarsällskap",sprite:"manniska",resa:true,
  text:"Ett gycklarsällskap har fått problem med sin vagn vid vägkanten.",
  val:[{knapp:"Hjälpa till med vagnen",fard:"STY",lyckat:{text:"Vagnen rullar igen! Gycklarna bjuder på mat och en låt.",kp:"T6",vp:"T4"},misslyckat:{text:"Hjulet går sönder ännu mer. Någon klämmer fingrarna.",skada:"T4"}},
       {knapp:"Sjunga med dem",fard:"Uppträda",lyckat:{text:"Ni får applåder och lite växel.",guld:20},misslyckat:{text:"Gycklarna ber er artigt att sluta.",ingenting:true}},
       {knapp:"Rida förbi",auto:{text:"Ni rider förbi. De vinkar sorgset."}}]},
 {id:"orter",namn:"En örtgård",sprite:"manniska",resa:true,
  text:"Vid vägkanten växer det gott om läkeörter – om man vet vilka som är vilka.",
  val:[{knapp:"Plocka örter",fard:"Bestiologi",lyckat:{text:"Ni hittar rätt örter.",sak:"Läkande ört",sak2:"Läkande ört"},misslyckat:{text:"Ni plockar fel. Någon får utslag överallt.",skada:"T4"}},
       {knapp:"Gå vidare",auto:{text:"Ni går vidare."}}]},
 {id:"rovarbakhall",namn:"Bakhåll!",sprite:"rovare",resa:true,
  text:"Pilar viner över vägen. Rövare kliver fram ur buskarna och kräver allt ni äger.",
  val:[{knapp:"Slåss!",auto:{text:"Ni drar vapen.",strid:"rovare"}},
       {knapp:"Ge dem 20 guld",kostnad:20,auto:{text:"Rövarna tar guldet och försvinner skrattande."}},
       {knapp:"Fly",fard:"Undvika",lyckat:{text:"Ni springer därifrån i en pilregn utan att bli träffade."},misslyckat:{text:"En pil träffar i flykten.",skada:"T8"}}]},
 // ---- Möten i rummen ----
 {id:"ormac",namn:"Häxan Ormac",sprite:"alv",rum:true,
  text:"En naken häxa vars hud bränns om man rör den. Hon erbjuder sig att hela er – för sju kopparmynt och en ”liten tjänst”.",
  val:[{knapp:"Betala (1 guld)",kostnad:1,auto:{text:"Hon blandar en salva av rävhår, granbark och kråkmossa. Det svider, men hjälper.",kp:"2T6"}},
       {knapp:"Fråga om hennes tjänst",fard:"Övertala",lyckat:{text:"Hon vill bara ha sällskap en stund. Hon ger er en giftig ört som tack.",sak:"Kråkmossa",kp:"T4"},misslyckat:{text:"Någon råkar röra vid henne. Det bränns!",skada:"T6"}},
       {knapp:"Gå vidare",auto:{text:"Hon ser besviken ut."}}]},
 {id:"torbyn",namn:"En gammal man i rob",sprite:"manniska",rum:true,
  text:"En gammal man som kallar sig Torbyn sitter på en sten. Han har konstigt röda ögon och en svans som sticker ut under roben.",
  val:[{knapp:"Göra en deal med honom",fard:"Övertala",lyckat:{text:"Han skrattar och ger er en säck guld. ”Vi ses i Efterriket.”",guld:80},misslyckat:{text:"Han skrattar och ni känner er plötsligt mycket tomma inombords.",vpAlla:"T6"}},
       {knapp:"Avslöja honom som Lucifer",fard:"Kunskap",lyckat:{text:"”Smart.” Han försvinner i en svavelpuff och lämnar något efter sig.",sak:"Läkedryck"},misslyckat:{text:"”Lucifer? Jag? Nej då.” Han är borta när ni blinkar. Er börs också.",guld:-20}},
       {knapp:"Gå förbi",auto:{text:"Han vinkar efter er. Hans getfötter klapprar mot stenen."}}]},
 {id:"fange",namn:"En fånge",sprite:"manniska",rum:true,
  text:"En fastkedjad stackare ber om hjälp. Han påstår att han är oskyldig.",
  val:[{knapp:"Dyrka upp kedjorna",fard:"Fingerfärdighet",lyckat:{text:"Fången tackar och ger er sitt gömda arv.",guld:35},misslyckat:{text:"Låset går sönder och larmet går.",strid:"POOL"}},
       {knapp:"Slå sönder kedjorna",fard:"STY",lyckat:{text:"Kedjorna brister! Fången springer därifrån och glömmer en ört.",sak:"Läkande ört"},misslyckat:{text:"Ni får ont i händerna.",skada:"T4"}},
       {knapp:"Lämna honom",auto:{text:"Han ropar saker om er mamma tills ni är utom hörhåll."}}]},
 {id:"jones",namn:"Jones Docker",sprite:"manniska",rum:true,
  text:"Arkeologen Jones Docker – träben, hatt och ärr över vänster öga – letar efter en gammal relik. Han vill ha hjälp att läsa en karta.",
  val:[{knapp:"Läsa kartan",fard:"Kunskap",lyckat:{text:"Ni hittar skatten tillsammans och delar lika.",guld:45},misslyckat:{text:"Ni läser fel och leder honom rakt in i en vägg.",ingenting:true}},
       {knapp:"Utmana honom på tisdagsfajt",fard:"Slagsmål",lyckat:{text:"Jones tar av sig fårskinnsvästen, förlorar och skrattar. Han ger er en läkedryck.",sak:"Läkedryck"},misslyckat:{text:"Han slår er medvetslösa. Med träbenet.",skada:"T6"}},
       {knapp:"Säga hej och gå",auto:{text:"Han nickar och fortsätter leta."}}]},
 {id:"lik",namn:"Ett gammalt lik",sprite:"odod",rum:true,
  text:"Ett lik ligger på golvet. Det har en börs i bältet. Det rör sig nästan inte alls.",
  val:[{knapp:"Plundra liket",fard:"Fingerfärdighet",lyckat:{text:"Ni tar börsen utan att väcka något.",guld:25},misslyckat:{text:"Liket vaknar!",strid:"odod"}},
       {knapp:"Ge det en anständig begravning",fard:"Kunskap",lyckat:{text:"Ni känner er som bättre människor (och alver, dvärgar, ankor).",vpAlla:"+T4"},misslyckat:{text:"Begravningen blir mest pinsam.",ingenting:true}},
       {knapp:"Gå förbi",auto:{text:"Ni låtsas inte se det."}}]}
];

// ---------- Efterriket ----------
V.EFTERRIKET = [
  "Hjälten vaknar i en tunnel. Långt fram lyser ett ljus. Bakåt luktar det svavel och grillat.",
  "En sjungande kaktus hälsar välkommen till Efterriket. Mitt i landskapet står en dörr helt utan vägg.",
  "Hjälten ligger i en pool tillsammans med en björn som röker cigarr och dricker bubbel. Björnen kan inte prata, eftersom det är en björn.",
  "Lucifer – horn, getfötter, röda ögon och helt rippad – tittar upp från ett papper och suckar."
];

window.VARLD = V;
})();
