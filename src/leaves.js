// Padající podzimní listí ve SVĚTĚ (ne na plátně) — sprite leaf.png (5 lístků 16×16).
// Listí přirozeně pomalu padá a kymácí se do stran; postava ho při průchodu rozhání.
import { CONFIG } from './config.js';

const FRAME = 16;          // jeden lístek je 16×16 px
const FRAMES = 5;          // leaf.png má 5 variant vedle sebe

export function createLeaves(leafImage) {
  const W = CONFIG.canvas.width, H = CONFIG.canvas.height;
  const L = CONFIG.leaves;
  const leaves = [];

  // Umísti lístek do světa v pásu kolem kamery. atTop = nahoru nad výřez.
  function place(l, cam, atTop) {
    l.wx = cam.x + Math.random() * (W + 200) - 100;
    l.wy = atTop ? cam.y - Math.random() * 60 - 16 : cam.y + Math.random() * H;
    l.size = 12 + Math.random() * 8;
    l.frame = (Math.random() * FRAMES) | 0;
    l.vy = L.fallSpeed * (0.7 + Math.random() * 0.6);     // rychlost pádu
    l.vx = (Math.random() - 0.5) * 2 * L.drift;           // unášení
    l.sway = Math.random() * Math.PI * 2;                 // fáze kymácení
    l.swaySpeed = 1 + Math.random() * 1.5;
    l.swayAmp = L.swayAmp * (0.5 + Math.random() * 0.8);
    l.rot = Math.random() * Math.PI * 2;
    l.vrot = (Math.random() - 0.5) * 3;                   // rychlost rotace
    return l;
  }

  // Počáteční rozmístění (kamera ještě na 0,0).
  const cam0 = { x: 0, y: 0 };
  for (let i = 0; i < L.count; i++) leaves.push(place({}, cam0, false));

  return {
    update(dtMs, camera, player) {
      const dt = dtMs / 1000;
      // Střed postavy ve světě (pro rozhánění).
      const pcx = player.x + player.width / 2;
      const pcy = player.y - player.height / 2;

      for (const l of leaves) {
        // Přirozený pád + kymácení.
        l.sway += l.swaySpeed * dt;
        l.wy += l.vy * dt;
        l.wx += (l.vx + Math.cos(l.sway) * l.swayAmp) * dt;
        l.rot += l.vrot * dt;

        // Reakce na postavu — když je blízko, odstrč lístek pryč ("prorážení").
        const dx = l.wx - pcx, dy = l.wy - pcy;
        const dist = Math.hypot(dx, dy);
        if (dist < L.pushRadius && dist > 0.01) {
          const force = (1 - dist / L.pushRadius) * L.pushStrength;
          l.wx += (dx / dist) * force * dt;
          l.wy += (dy / dist) * force * dt;
          l.rot += force * 0.01 * dt;
        }

        // Recyklace, když vypadne z pásu kolem kamery.
        if (l.wy > camera.y + H + 20 ||
            l.wx < camera.x - 120 ||
            l.wx > camera.x + W + 120) {
          place(l, camera, true);
        }
      }
    },

    draw(ctx, camera) {
      if (!leafImage || !leafImage.complete) return;
      for (const l of leaves) {
        const s = camera.worldToScreen(l.wx, l.wy);
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(l.rot);
        ctx.drawImage(
          leafImage,
          l.frame * FRAME, 0, FRAME, FRAME,
          -l.size / 2, -l.size / 2, l.size, l.size,
        );
        ctx.restore();
      }
    },
  };
}
