// Létající dušíci — přilétají k hráči ze všech stran a hráč je odráží sekem.
// Odraz jde do libovolného směru (zleva, zprava, shora, diagonálně) podle toho,
// kde dušík vůči hráči je. Neškodní — jen na odpálení.
import { CONFIG } from './config.js';

const GROUND_Y = CONFIG.player.startY;

export function createEnemies(sprite) {
  const cfg = CONFIG.enemies;
  const list = [];
  let deflected = 0;

  function playerCenter(player) {
    return { x: player.x + player.width / 2, y: player.y - 50 };
  }

  // Umísti dušíka na náhodnou stranu kolem hráče (přiletí zvenčí).
  function spawn(e, player) {
    const c = player ? playerCenter(player) : { x: CONFIG.world.width / 2, y: GROUND_Y - 120 };
    const ang = Math.random() * Math.PI * 2;
    e.wx = c.x + Math.cos(ang) * cfg.spawnDist;
    e.wy = c.y + Math.sin(ang) * cfg.spawnDist * 0.7;
    e.wy = Math.min(e.wy, GROUND_Y - 24);   // ať nelezou ze země
    e.bob = Math.random() * Math.PI * 2;
    e.vx = 0; e.vy = 0; e.rot = 0; e.vrot = 0;
    e.knocked = false; e.life = 0;
    return e;
  }

  for (let i = 0; i < cfg.count; i++) list.push(spawn({}, null));

  return {
    list,
    get deflected() { return deflected; },

    update(dtMs, player) {
      const dt = dtMs / 1000;
      const c = playerCenter(player);

      for (const e of list) {
        if (e.knocked) {
          e.vy += 900 * dt;
          e.wx += e.vx * dt;
          e.wy += e.vy * dt;
          e.rot += e.vrot * dt;
          e.life -= dt;
          if (e.life <= 0) spawn(e, player);
          continue;
        }

        // Přílet k hráči ze všech stran + jemné houpání.
        e.bob += dt * 4;
        const dx = c.x - e.wx;
        const dy = c.y - e.wy;
        const d = Math.hypot(dx, dy) || 1;
        e.wx += (dx / d) * cfg.speed * dt;
        e.wy += (dy / d) * cfg.speed * dt + Math.sin(e.bob) * cfg.bobAmp * dt;

        // Sek míří určitým směrem (šipky) → zasáhne jen dušíky v tom sektoru
        // a odrazí je TÍM směrem (rozlišuje, kam sekáš).
        if (player.isAttacking) {
          const rx = e.wx - c.x;
          const ry = e.wy - c.y;
          const rd = Math.hypot(rx, ry);
          if (rd < cfg.hitRadius) {
            const nx = rd > 0.001 ? rx / rd : player.attackAimX;
            const ny = rd > 0.001 ? ry / rd : player.attackAimY;
            const dot = nx * player.attackAimX + ny * player.attackAimY;
            if (dot > 0.35) {   // dušík je ve směru seku (~sektor ±70°)
              e.knocked = true;
              e.vx = player.attackAimX * cfg.knockSpeed;
              e.vy = player.attackAimY * cfg.knockSpeed;
              e.vrot = (player.attackAimX >= 0 ? 1 : -1) * 14;
              e.life = 1.1;
              deflected++;
            }
          }
        }
      }
    },

    draw(ctx, camera) {
      if (sprite && sprite.complete) {
        const w = sprite.width, h = sprite.height;
        for (const e of list) {
          const s = camera.worldToScreen(e.wx, e.wy);
          ctx.save();
          ctx.translate(s.x, s.y);
          if (e.knocked) {
            ctx.rotate(e.rot);
            ctx.globalAlpha = Math.max(0, e.life / 1.1);
          }
          ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
          ctx.restore();
        }
      }
      // Počítadlo odpálených (skóre).
      ctx.fillStyle = '#ffd27a';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Odpáleno: ${deflected}`, CONFIG.canvas.width - 10, 22);
      ctx.textAlign = 'left';
    },
  };
}
