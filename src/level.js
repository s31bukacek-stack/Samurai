// Data jedné úrovně. Souřadnice ve světě; y plošiny = její horní hrana.
import { CONFIG } from './config.js';

const groundY = CONFIG.player.startY; // pata hráče stojí na zemi

export const LEVEL = {
  worldWidth: CONFIG.world.width,
  worldHeight: CONFIG.world.height,
  groundY,

  // Malé schody (tenké plošiny z tilesetu, šířky = násobky 32px).
  platforms: [
    { x: 460,  y: groundY - 70,  width: 64 },
    { x: 580,  y: groundY - 120, width: 64 },
    { x: 700,  y: groundY - 170, width: 96 },
    { x: 1000, y: groundY - 100, width: 96 },
    { x: 1240, y: groundY - 160, width: 64 },
    { x: 1450, y: groundY - 90,  width: 128 },
    { x: 1720, y: groundY - 150, width: 64 },
    { x: 1950, y: groundY - 110, width: 96 },
    { x: 2200, y: groundY - 170, width: 64 },
    { x: 2400, y: groundY - 90,  width: 96 },
  ],
};
