// Létající dušíci — neškodní nepřátelé, kteří poletují k hráči a dají se
// odpálit mečem (odletí ve směru úderu, rotují, zmizí a objeví se nový).
import { CONFIG } from './config.js';

const GROUND_Y = CONFIG.player.startY;

export function createEnemies(sprite) {
  const cfg = CONFIG.enemies;
  const list = [];

  function spawn(e) {
    e.wx = 300 + Math.random() * (CONFIG.world.width - 600);
    e.baseY = GROUND_Y - cfg.hoverHeight - Math.random() * 40;
    e.wy = e.baseY;
    e.bob = Math.random() * Math.PI * 2;
    e.dir = Math.random() < 0.5 ? -1 : 1;
    e.vx = 0; e.vy = 0; e.rot = 0; e.vrot = 0;
    e.knocked = false; e.life = 0;
    return e;
  }

  for (let i = 0; i < cfg.count; i++) list.push(spawn({}));

  return {
    list,

    update(dtMs, player) {
      const dt = dtMs / 1000;
      const cx = player.x + player.width / 2;

      for (const e of list) {
        if (e.knocked) {
          // Odpálený dušík letí obloukem a mizí.
          e.vy += 900 * dt;
          e.wx += e.vx * dt;
          e.wy += e.vy * dt;
          e.rot += e.vrot * dt;
          e.life -= dt;
          if (e.life <= 0) spawn(e);
          continue;
        }

        // Vznášení (houpání) + pomalý drift k hráči.
        e.bob += dt * 2.5;
        e.dir = Math.sign(cx - e.wx) || e.dir;
        e.wx += e.dir * cfg.speed * dt;
        const targetBase = GROUND_Y - cfg.hoverHeight;
        e.baseY += (targetBase - e.baseY) * Math.min(1, dt * 0.5);
        e.wy = e.baseY + Math.sin(e.bob) * cfg.bobAmp;

        // Zásah mečem → odpálení.
        if (player.isAttacking) {
          const inFront = player.direction === 1
            ? (e.wx > cx - 12 && e.wx < cx + cfg.hitReach)
            : (e.wx < cx + 12 && e.wx > cx - cfg.hitReach);
          const vClose = Math.abs(e.wy - (player.y - 40)) < cfg.hitV;
          if (inFront && vClose) {
            e.knocked = true;
            e.vx = player.direction * cfg.knockX;
            e.vy = -cfg.knockY;
            e.vrot = player.direction * 12;
            e.life = 1.2;
          }
        }
      }
    },

    draw(ctx, camera) {
      if (!sprite || !sprite.complete) return;
      const w = sprite.width, h = sprite.height;
      for (const e of list) {
        const s = camera.worldToScreen(e.wx, e.wy);
        ctx.save();
        ctx.translate(s.x, s.y);
        if (e.knocked) {
          ctx.rotate(e.rot);
          ctx.globalAlpha = Math.max(0, e.life / 1.2);
        }
        ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
    },
  };
}
