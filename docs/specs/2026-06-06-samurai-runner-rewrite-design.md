# Samurai Runner — čistý přepis (návrh)

**Datum:** 2026-06-06
**Autor hry:** Jakub
**Cíl:** Uklidit a přepsat projekt načisto tak, aby byl srozumitelný a snadno rozšiřitelný — a postupně do něj přidat rolování světa a skákání na vyšší plošiny (styl Mario).

---

## Kontext

Původní projekt: `~/Downloads/nahledy grafiky/samurai runner - pracovni/`
(modulární, funkční, ale zarostlý pokusy). Hra = jedna statická scéna 640×390, samuraj
běhá/skáče/útočí, animovaná vlajka, padající listí. Hráč je dnes „přibitý" na šířku plátna,
svět se neroluje. Rozdělaný (nezapojený) `world.js` mířil k rolování, ale nebyl dokončen.

## Rozhodnutí (odsouhlasená s Jakubem)

1. **Rozsah kroku 1:** čistý přepis + rovnou základ **rolování** (kamera).
2. **Více úrovní = vyšší plošiny v jednom souvislém světě** (Mario styl), kamera sleduje
   hráče do stran i nahoru. NE samostatné levely (to případně mnohem později).
3. **Spouštění přes lokální server** → moderní **ES moduly** (`import`/`export`).
4. **Vše postupně** — krok 1 položí základ + horizontální rolování + zem + 1–2 ukázkové
   vyšší plošiny. Vyladěné navrhování pater přijde jako další krok.

## A. Umístění a úklid

- **Nový projekt:** `~/projects/samurai-runner/` (čistý start).
- **Původní složka v Downloads zůstává netknutá jako záloha** — nic se nemaže nenávratně.
- Přeneseme jen živé: grafiku (sprity, `preview.png`, vlajka) + funkční logiku, ale přepsanou.
- Mimo nový projekt zůstane: 5 kopií `leafeffect.js`, nedopsaný `parallax.js`,
  `scrolling_terrain.js`, `terrain_rendering.js`, demo HTML.
- **Level editor:** řešíme později, až bude nový systém hotový.

## B. Klíčový koncept — svět vs. okénko + kamera

Dnes se pozice počítá přímo v pixelech plátna → hráč nemůže odběhnout.

Nově **dva souřadnicové systémy:**
- **Svět** — velký prostor (např. tisíce px), kde žije hráč, plošiny, země.
- **Plátno (640×390)** — okénko, kterým se do světa díváme.
- **Kamera** — určuje, kterou část světa okénko ukazuje; plynule sleduje hráče (X i Y).

Vykreslení: `pozice na plátně = pozice ve světě − pozice kamery`.

Tím se odemkne rolování do stran i dorovnání nahoru (příprava na vyšší plošiny).

**Úroveň jako data:** ne zadrátováno v kódu, ale **seznam plošin**
(`{ x, y, width }`) + země + velikost světa. Fyzika kontroluje dopad na plošinu.
Snadno rozšiřitelné; později z toho bude těžit i level editor.

## C. Struktura projektu

```
~/projects/samurai-runner/
├── index.html          → načte hru, plátno, spustí
├── assets/             → grafika (sprity, preview.png, vlajka)
└── src/
    ├── main.js         → start hry + herní smyčka
    ├── config.js       → všechna čísla (rychlost, gravitace, snímky animací)
    ├── assets.js       → načtení obrázků
    ├── input.js        → klávesnice (šipky, mezerník, A)
    ├── camera.js       → 🆕 kamera: sleduje hráče ve světě
    ├── level.js        → 🆕 data úrovně: plošiny + země, velikost světa
    ├── physics.js      → gravitace + dopad na plošiny
    ├── player.js       → stav samuraje (běh/skok/útok)
    ├── animations.js   → výběr snímku ze spritesheetu
    ├── renderer.js     → kreslení scény přes kameru
    └── leaves.js       → padající listí
```

Principy: malé soubory s jednou zodpovědností; žádné globální proměnné (vše přes
`import`/`export`); přidání věci = přidání souboru, ne zásah do všeho.

## Grafika a sprity (beze změny přístupu)

- Sprity zůstávají jako **spritesheety** (snímky v řadě): run 848×84 = 8×(106×84),
  idle 424×84 = 4 snímky, jump 318×84 = 3, attack 530×84 = 5. Vlajka 174×64 = 6 snímků.
- Kód **vyřízne správný snímek za běhu** (slicing přes `drawImage`) — stejně jako dosud.
  Grafika se fyzicky neřeže do samostatných souborů.
- Počty snímků se sjednotí do přehledné tabulky v `config.js`.
- `preview.png` (1280×780) → **rolující pozadí** (jede pomaleji než svět = hloubka).

## Co zůstává zachováno 1:1

Vzhled, sprity, pocit z pohybu (ninja dobržďování), ovládání (←/→, mezerník = skok +
dvojitý skok, A = útok), padající listí, animovaná vlajka.

## Krok 1 — hotovo, když

- Nový projekt `~/projects/samurai-runner/` běží přes lokální server.
- Kód je v čistých ES modulech podle struktury výše; žádné mrtvé/duplicitní soubory.
- Samuraj se pohybuje ve **světě širším než plátno**, kamera ho plynule sleduje do stran
  i nahoru; už není přibitý na okraj plátna.
- Existuje `level.js` se zemí a **1–2 ukázkovými vyššími plošinami**, na které lze
  vyskočit a dopadnout (důkaz, že vertikální plošiny fungují).
- Rolující pozadí z `preview.png`.
- Vzhled, ovládání a pocit z pohybu odpovídají původní hře.

## Mimo rozsah kroku 1 (další kroky, postupně)

- Vyladěné navrhování více pater / delší úroveň.
- Předělání level editoru na nový systém dat.
- Herní obsah (nepřátelé, skóre, životy, zvuky).
- Případné samostatné levely.
