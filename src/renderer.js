// Vykreslení celé scény. Vše se posouvá podle kamery (svět → plátno).
import { CONFIG } from './config.js';
import { currentSprite, totalFrames } from './animations.js';

export function createRenderer(ctx, assets) {
  const flagAnim = { frameIndex: 0, timer: 0 };

  function drawBackground(camera, level) {
    // Obloha — vyplní prostor nad scénou, když hráč vyskočí vysoko.
    ctx.fillStyle = '#2a2f4e';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    // Namalovaná scéna: povrch trávy v obrázku (surfaceFraction) ukotven na
    // úroveň země, takže hráč stojí NA povrchu. Svisle jede s kamerou,
    // vodorovně parallax + opakování.
    const bg = assets.background;
    const drawH = CONFIG.canvas.height;
    const tileW = bg.width * (drawH / bg.height);
    const groundScreenY = camera.worldToScreen(0, level.groundY).y;
    const topY = groundScreenY - CONFIG.background.surfaceFraction * drawH;

    const offset = -(camera.x * CONFIG.background.parallax) % tileW;
    for (let x = offset - tileW; x < CONFIG.canvas.width; x += tileW) {
      ctx.drawImage(bg, x, topY, tileW, drawH);
    }
  }

  function drawGround(camera, level) {
    // Zemina až POD spodní hranou namalované scény (aby ji nepřekrývala).
    const drawH = CONFIG.canvas.height;
    const groundScreenY = camera.worldToScreen(0, level.groundY).y;
    const imageBottomY = groundScreenY + (1 - CONFIG.background.surfaceFraction) * drawH;
    if (imageBottomY < CONFIG.canvas.height) {
      ctx.fillStyle = '#3a2a18';
      ctx.fillRect(0, imageBottomY, CONFIG.canvas.width, CONFIG.canvas.height - imageBottomY);
    }
  }

  function drawPlatforms(camera, level) {
    const cfg = CONFIG.platforms;
    const T = cfg.tile;
    const ts = assets.tileset;
    if (!ts || !ts.complete) return;

    for (const p of level.platforms) {
      const s0 = camera.worldToScreen(p.x, p.y);
      const cols = Math.ceil(p.width / T);
      // Jedna dlaždice s trávou (1 sprite) — tenká plošina, žádné vysoké sloupy.
      for (let c = 0; c < cols; c++) {
        const [gx, gy] = cfg.grassTiles[c % cfg.grassTiles.length];
        ctx.drawImage(ts, gx * T, gy * T, T, T, s0.x + c * T, s0.y, T, T);
      }
    }
  }

  // Vykreslí jeden snímek postavy (sdílené pro hráče i mizející „duchy").
  // wx = střed postavy ve světě, wy = pata; měřítko/pozice podle těla postavy.
  function drawCharacter(camera, sprite, frames, frameIndex, wx, wy, dir, alpha) {
    if (!sprite || !sprite.complete) return;
    const fw = sprite.width / frames;
    const fh = sprite.height;
    const idx = ((Math.floor(frameIndex) % frames) + frames) % frames;

    const p = CONFIG.player;
    const scale = p.charHeight / (p.spriteFeetY - p.spriteHeadY);
    const drawW = fw * scale;
    const drawH = fh * scale;
    const feet = camera.worldToScreen(wx, wy);
    const dx = feet.x - drawW / 2;
    const dy = feet.y - p.spriteFeetY * scale;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (dir === -1) {
      ctx.translate(dx + drawW, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, idx * fw, 0, fw, fh, 0, 0, drawW, drawH);
    } else {
      ctx.drawImage(sprite, idx * fw, 0, fw, fh, dx, dy, drawW, drawH);
    }
    ctx.restore();
  }

  function drawPlayer(camera, player) {
    // Mizející „duchové" za postavou (rozmazaný efekt po dvojitém skoku).
    for (const g of player.afterimages) {
      drawCharacter(
        camera, assets.player[g.state], CONFIG.animation.totalFrames[g.state],
        g.frame, g.wx, g.wy, g.dir, g.alpha,
      );
    }
    // Samotná postava.
    drawCharacter(
      camera, currentSprite(player, assets), totalFrames(player),
      player.frameIndex, player.x + player.width / 2, player.y, player.direction, 1,
    );

    const aimO = camera.worldToScreen(player.x + player.width / 2, player.y - 50);

    // Čára míření — pořád viditelná (myš), ukazuje zvolený úhel odrazu.
    {
      const len = 170;
      const tx = aimO.x + player.aimX * len, ty = aimO.y + player.aimY * len;
      ctx.save();
      // tmavý podklad pro kontrast
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(aimO.x, aimO.y); ctx.lineTo(tx, ty); ctx.stroke();
      // jasná čára
      ctx.strokeStyle = 'rgba(255,224,150,0.95)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(aimO.x, aimO.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.setLineDash([]);
      // špička (kam odpálím)
      ctx.fillStyle = 'rgba(255,224,150,1)';
      ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Náznak švihu při seku (oblouk ve směru seku).
    if (player.isAttacking) {
      const ang = Math.atan2(player.attackAimY, player.attackAimX);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(aimO.x, aimO.y, 52, ang - 0.55, ang + 0.55);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawFlag(camera, level, dtMs) {
    const flag = assets.flag;
    const f = CONFIG.animation.flag;
    flagAnim.timer += dtMs;
    if (flagAnim.timer >= f.frameDuration) {
      flagAnim.timer = 0;
      flagAnim.frameIndex = (flagAnim.frameIndex + 1) % f.totalFrames;
    }
    const fw = flag.width / f.totalFrames;
    // Vlajka na konci úrovně.
    const s = camera.worldToScreen(level.worldWidth - 200, level.groundY - flag.height * 2);
    ctx.drawImage(flag, flagAnim.frameIndex * fw, 0, fw, flag.height,
                  s.x, s.y, fw * 2, flag.height * 2);
  }

  function drawDebug(player, camera) {
    if (!CONFIG.debug) return;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, 210, 70);
    ctx.fillStyle = '#0f0';
    ctx.font = '12px monospace';
    ctx.fillText(`x:${player.x|0} y:${player.y|0} vy:${player.yVelocity|0}`, 8, 18);
    ctx.fillText(`cam:${camera.x|0},${camera.y|0}`, 8, 34);
    ctx.fillText(`jump:${player.isJumping} dbl:${player.canDoubleJump}`, 8, 50);
    ctx.fillText(`atk:${player.isAttacking} dir:${player.direction}`, 8, 66);
  }

  return {
    render(state, dtMs) {
      const { camera, level, player, leaves, enemies } = state;
      ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
      drawBackground(camera, level);
      drawGround(camera, level);
      drawPlatforms(camera, level);
      enemies.draw(ctx, camera);
      drawPlayer(camera, player);
      drawFlag(camera, level, dtMs);
      leaves.draw(ctx, camera);
      drawDebug(player, camera);
    },
  };
}
