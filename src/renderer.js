// Vykreslení celé scény. Vše se posouvá podle kamery (svět → plátno).
import { CONFIG } from './config.js';
import { currentSprite, totalFrames } from './animations.js';

export function createRenderer(ctx, assets) {
  const flagAnim = { frameIndex: 0, timer: 0 };

  function drawBackground(camera, level) {
    // Obloha — vyplní prostor nad scénou, když hráč vyskočí vysoko.
    ctx.fillStyle = '#2b2b42';
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
    for (const p of level.platforms) {
      const s = camera.worldToScreen(p.x, p.y);
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(s.x, s.y, p.width, 16);
      ctx.fillStyle = '#3d2812';
      ctx.fillRect(s.x, s.y + 16, p.width, 6);
    }
  }

  function drawPlayer(camera, player) {
    const sprite = currentSprite(player, assets);
    if (!sprite || !sprite.complete) return;
    const frames = totalFrames(player);
    const fw = sprite.width / frames;
    const fh = sprite.height;
    const idx = Math.floor(player.frameIndex) % frames;

    // Vykreslení v poměru snímku (ať není postava roztažená), pata na zemi.
    const drawH = CONFIG.player.drawHeight;
    const drawW = drawH * (fw / fh);
    const feet = camera.worldToScreen(player.x + player.width / 2, player.y);
    const dx = feet.x - drawW / 2;
    const dy = feet.y - drawH;

    ctx.save();
    if (player.direction === -1) {
      ctx.translate(dx + drawW, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, idx * fw, 0, fw, fh, 0, 0, drawW, drawH);
    } else {
      ctx.drawImage(sprite, idx * fw, 0, fw, fh, dx, dy, drawW, drawH);
    }
    ctx.restore();
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
      const { camera, level, player, leaves } = state;
      ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
      drawBackground(camera, level);
      drawGround(camera, level);
      drawPlatforms(camera, level);
      drawPlayer(camera, player);
      drawFlag(camera, level, dtMs);
      leaves.draw(ctx, camera);
      drawDebug(player, camera);
    },
  };
}
