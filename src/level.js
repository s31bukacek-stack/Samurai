// Data jedné úrovně. Souřadnice ve světě; y plošiny = její horní hrana.
import { CONFIG } from './config.js';

const groundY = CONFIG.player.startY; // pata hráče stojí na zemi

export const LEVEL = {
  worldWidth: CONFIG.world.width,
  worldHeight: CONFIG.world.height,
  groundY,

  // 1–2 ukázkové vyšší plošiny (důkaz vertikálního skákání).
  platforms: [
    { x: 700, y: groundY - 120, width: 224 },
    { x: 1100, y: groundY - 210, width: 192 },
    { x: 1500, y: groundY - 110, width: 256 },
  ],
};
