// Vykreslení celé scény. Vše se posouvá podle kamery (svět → plátno).
import { CONFIG } from './config.js';
import { currentSprite, totalFrames } from './animations.js';

export function createRenderer(ctx, assets) {
  const flagAnim = { frameIndex: 0, timer: 0 };

  function drawBackground(camera) {
    // Parallax: pozadí jede pomaleji než svět a opakuje se vodorovně.
    const bg = assets.background;
    const scale = CONFIG.canvas.height / bg.height;
    const tileW = bg.width * scale;
    const offset = -(camera.x * CONFIG.background.parallax) % tileW;
    for (let x = offset - tileW; x < CONFIG.canvas.width; x += tileW) {
      ctx.drawImage(bg, x, 0, tileW, CONFIG.canvas.height);
    }
  }

  function drawPlatforms(camera, level) {
    ctx.fillStyle = '#5b3a1a';
    // Zem.
    const g = camera.worldToScreen(0, level.groundY);
    ctx.fillRect(0, g.y, CONFIG.canvas.width, CONFIG.canvas.height - g.y);
    // Plošiny.
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

    const s = camera.worldToScreen(player.x, player.y - player.height);

    ctx.save();
    if (player.direction === -1) {
      ctx.translate(s.x + player.width, s.y);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, idx * fw, 0, fw, fh, 0, 0, player.width, player.height);
    } else {
      ctx.drawImage(sprite, idx * fw, 0, fw, fh, s.x, s.y, player.width, player.height);
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
      drawBackground(camera);
      drawPlatforms(camera, level);
      drawPlayer(camera, player);
      drawFlag(camera, level, dtMs);
      leaves.draw(ctx);
      drawDebug(player, camera);
    },
  };
}
