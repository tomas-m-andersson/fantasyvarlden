# Fantasyvärlden

Ett privat hobbyprojekt: ett äventyrsspel i podden Rollspelsklubbens värld, med poddens hjältar och förenklade regler inspirerade av Drakar och Demoner. Inte en officiell produkt.

## Filer

| Fil | Vad den gör |
|---|---|
| `index.html` | Sidan och utseendet |
| `spel.js` | Själva spelet: hemmet, uppdrag, rum, strider, sparning |
| `regler.js` | Regelmotorn: tärningar, färdigheter, vapen, besvärjelser |
| `hjaltar.js` | **Datafil** – hjältarnas värden |
| `varld.js` | **Datafil** – uppdrag, monster, rum och möten |
| `grafik.js` | Pixelgrafiken (scenen och porträtten) |
| `bakgrund.js` | Bakgrunder till TV:n för alla åtta miljöer – egna målade bilder där de finns, annars ritade med kod |
| `bakgrunder/` | Målade bakgrunder, 320×180 pixlar (t.ex. `grotta1.png`, `skog2.png`, `skog2natt.png`, `miami.png` för poolen i Efterriket `vardshus.png` för värdshuset på startsidan och `basar.png` för basaren). Listas överst i `bakgrund.js` (EGNA). |
| `figurer/`, `figurer.js` | Hjältarnas pixelfigurer (8×8 varianter per bild) och vilka rutor som används |
| `fiender/`, `fiendebilder.js` | Fiendernas pixelfigurer (8×8 varianter per bild) och vilka rutor som används |
| `npc/` | NPC-ark: `stad.png` (stadsbor), `by.png` (bybor), `djur.png` (husdjur) – 64 figurer var – `kopman.png` (köpmän), `mobler.png` (värdshusmöbler), `saker_grotta.png` och `saker_by.png` (föremål och ikoner), `storn.png` (stör-örnen), `tetrok.png` (björnen Tetrok i poolen), `ikoner.png` (vapen, örter och uppdragsföremål), `givare_*.png` (uppdragsgivarna, ett ark per person), `effekter.png` (trolldom, träffar och missar i striden) – 64 figurer var – och `jens_vagn.png` (Bakhuvudet Jens vagn, sex varianter) |
| `sparfil.json` | **Datafil** – skapas automatiskt när spelet sparar till GitHub |
| `manifest.json`, `sw.js`, `icons/` | Gör att spelet kan installeras som app |

⚠️ Ändra inte datafilerna direkt här på GitHub utan att dubbelkolla. Ett saknat kommatecken eller citattecken räcker för att spelet slutar fungera.
