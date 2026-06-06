// Padající podzimní listí v prostoru plátna.
import { CONFIG } from './config.js';

const COLORS = ['#FF6B35', '#F7931E', '#FFD23F', '#EE4266', '#C73E1D'];

export function createLeaves() {
  const w = CONFIG.canvas.width, h = CONFIG.canvas.height;
  const leaves = [];

  function spawn(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : -10,
      size: 2 + Math.random() * 4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      vx: -0.5 + Math.random() * 1,
      vy: 0.5 + Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.1,
    };
  }

  for (let i = 0; i < CONFIG.leaves.count; i++) leaves.push(spawn(true));

  return {
    update(dtMs) {
      const k = dtMs / 16;
      for (const l of leaves) {
        l.x += l.vx * k; l.y += l.vy * k; l.rot += l.vrot * k;
        if (l.y > h + 10) Object.assign(l, spawn(false));
      }
    },
    draw(ctx) {
      for (const l of leaves) {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.fillStyle = l.color;
        ctx.fillRect(-l.size / 2, -l.size / 2, l.size, l.size);
        ctx.restore();
      }
    },
  };
}
