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
    charHeight: 78,         // požadovaná výška vykreslené postavy na obrazovce
    spriteHeadY: 47,        // řádek hlavy v 84px snímku
    spriteFeetY: 81,        // řádek nohou v 84px snímku
    speed: 220,             // px/s
    deceleration: 600,      // ninja dobržďování px/s²
    jumpStrength: -620,     // počáteční rychlost skoku (nahoru = záporné)
    doubleJumpStrength: -560,
    gravity: 1500,
    maxFallVelocity: 1300,
  },

  // Kolik snímků má každý spritesheet (snímky jsou vedle sebe v jedné řadě).
  animation: {
    frameDuration: { idle: 1000 / 6, run: 1000 / 12, jump: 1000 / 8, attack: 1000 / 8 },
    totalFrames: { idle: 4, run: 8, jump: 3, attack: 5 },
    flag: { frameDuration: 1000 / 4, totalFrames: 6 },
  },

  camera: {
    smoothing: 0.12,        // 0–1, vyšší = rychlejší dohánění
    // Kde na plátně chceme hráče držet (poměr šířky/výšky plátna).
    anchorX: 0.35,
    anchorY: 0.6,
  },

  // Pozadí preview.png. surfaceFraction = kde v obrázku je povrch trávy
  // (podíl od horní hrany), aby hráč stál na povrchu, ne zapuštěný.
  background: { parallax: 0.4, surfaceFraction: 0.83 },

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
