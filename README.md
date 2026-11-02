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
| `figurer/`, `figurer.js` | Hjältarnas pixelfigurer (8×8 varianter per bild) och vilka rutor som används |
| `fiender/`, `fiendebilder.js` | Fiendernas pixelfigurer (8×8 varianter per bild) och vilka rutor som används |
| `npc/` | NPC-ark: `stad.png` (stadsbor), `by.png` (bybor), `djur.png` (husdjur) – 64 figurer var – `kopman.png` (köpmän), `mobler.png` (värdshusmöbler), `saker_grotta.png` och `saker_by.png` (föremål och ikoner) – 64 figurer var – och `jens_vagn.png` (Bakhuvudet Jens vagn, sex varianter) |
| `sparfil.json` | **Datafil** – skapas automatiskt när spelet sparar till GitHub |
| `manifest.json`, `sw.js`, `icons/` | Gör att spelet kan installeras som app |

⚠️ Ändra inte datafilerna direkt här på GitHub utan att dubbelkolla. Ett saknat kommatecken eller citattecken räcker för att spelet slutar fungera.
