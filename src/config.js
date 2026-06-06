// Všechna laditelná čísla hry na jednom místě.
export const CONFIG = {
  canvas: { width: 640, height: 390 },

  // Svět je větší než plátno → vzniká prostor pro rolování.
  world: { width: 3000, height: 800 },

  player: {
    startX: 100,
    startY: 600,            // pata hráče (y roste dolů)
    width: 100,             // kolizní šířka
    height: 150,            // kolizní výška
    // Postava zabírá jen výřez snímku (zbytek je průhledné okolí). Velikost
    // i pozici počítáme z TĚLA postavy, ne z celého rámu.
    charHeight: 50,         // požadovaná výška vykreslené postavy na obrazovce
    spriteHeadY: 47,        // řádek hlavy v 84px snímku
    spriteFeetY: 81,        // řádek nohou v 84px snímku
    speed: 270,             // px/s (svižnější)
    accel: 2800,            // zrychlení k cílové rychlosti px/s² (rychlý, ale měkký rozjezd)
    deceleration: 2000,     // zpomalení po puštění px/s² (svižné, ale plynulé zastavení)
    jumpStrength: -580,     // počáteční rychlost skoku (nahoru = záporné)
    doubleJumpStrength: -540,
    gravity: 1500,
    fallGravityMult: 1.45,  // pád je rychlejší než výstup → svižnější skok
    maxFallVelocity: 1400,
    airAttackRecoil: 170,   // při seku ve vzduchu postavu malinko strčí zpět (odpor)
  },

  // Kolik snímků má každý spritesheet (snímky jsou vedle sebe v jedné řadě).
  animation: {
    frameDuration: { idle: 1000 / 6, run: 1000 / 16, jump: 1000 / 8, attack: 1000 / 32 },
    totalFrames: { idle: 4, run: 8, jump: 3, attack: 5 },
    flag: { frameDuration: 1000 / 4, totalFrames: 6 },
  },

  // Plošiny: výhradně z tileset.png — jen horní řada s trávou (1 dlaždice = 32px).
  platforms: {
    tile: 32,
    grassTiles: [[2, 0], [3, 0]],  // vrchní řada (tráva, kde se stojí) — střídání proti opakování
  },

  // Vizuální efekty.
  effects: {
    afterimage: { duration: 0.60, alpha: 0.40, fade: 0.9 },   // rozmazání při dvojitém skoku (delší ocas)
    attackAfterimage: { alpha: 0.22, fade: 2.4 },             // stín při (drženém) sekání — mírnější, kratší
  },

  camera: {
    smoothing: 0.12,        // 0–1, vyšší = rychlejší dohánění
    // Kde na plátně chceme hráče držet (poměr šířky/výšky plátna).
    anchorX: 0.35,
    anchorY: 0.6,
  },

  // Pozadí preview.png. surfaceFraction = kde v obrázku je povrch trávy
  // (podíl od horní hrany), aby hráč stál na povrchu, ne zapuštěný.
  background: { parallax: 0.4, surfaceFraction: 0.87 },

  leaves: {
    count: 45,
    fallSpeed: 28,          // základní rychlost pádu px/s
    drift: 12,              // boční unášení px/s
    swayAmp: 22,            // amplituda kymácení do stran (px)
    pushRadius: 90,         // dosah, kdy postava listí rozhání
    pushStrength: 320,      // síla rozhánění
  },

  debug: true,
};
