// Data jedné úrovně. Souřadnice ve světě; y plošiny = její horní hrana.
import { CONFIG } from './config.js';

const groundY = CONFIG.player.startY; // pata hráče stojí na zemi

export const LEVEL = {
  worldWidth: CONFIG.world.width,
  worldHeight: CONFIG.world.height,
  groundY,

  // Tenké plošiny (jen vrchní travnatá dlaždice), pořádně široké, šířky = násobky 32px.
  platforms: [
    { x: 460,  y: groundY - 90,  width: 224 },
    { x: 820,  y: groundY - 150, width: 192 },
    { x: 1150, y: groundY - 100, width: 256 },
    { x: 1520, y: groundY - 160, width: 192 },
    { x: 1850, y: groundY - 110, width: 224 },
    { x: 2200, y: groundY - 150, width: 256 },
  ],
};
