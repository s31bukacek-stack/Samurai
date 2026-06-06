// Padající podzimní listí v prostoru plátna (sprite leaf.png: 5 lístků po 16×16).
import { CONFIG } from './config.js';

const FRAME = 16;          // jeden lístek je 16×16 px
const FRAMES = 5;          // leaf.png má 5 variant vedle sebe

export function createLeaves(leafImage) {
  const w = CONFIG.canvas.width, h = CONFIG.canvas.height;
  const leaves = [];

  function spawn(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : -16,
      size: 12 + Math.random() * 8,            // velikost vykresleného lístku
      frame: (Math.random() * FRAMES) | 0,     // která varianta lístku
      vx: -0.5 + Math.random() * 1,
      vy: 0.5 + Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.08,
    };
  }

  for (let i = 0; i < CONFIG.leaves.count; i++) leaves.push(spawn(true));

  return {
    update(dtMs) {
      const k = dtMs / 16;
      for (const l of leaves) {
        l.x += l.vx * k; l.y += l.vy * k; l.rot += l.vrot * k;
        if (l.y > h + 16) Object.assign(l, spawn(false));
      }
    },
    draw(ctx) {
      if (!leafImage || !leafImage.complete) return;
      for (const l of leaves) {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.drawImage(
          leafImage,
          l.frame * FRAME, 0, FRAME, FRAME,        // výřez z spritesheetu
          -l.size / 2, -l.size / 2, l.size, l.size, // kam na plátno
        );
        ctx.restore();
      }
    },
  };
}
