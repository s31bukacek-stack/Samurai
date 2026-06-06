// Vstupní bod: načte assety, spojí moduly a roztočí herní smyčku.
import { CONFIG } from './config.js';
import { loadAssets } from './assets.js';
import { LEVEL } from './level.js';
import { createCamera } from './camera.js';
import { createPlayer } from './player.js';
import { createInput } from './input.js';
import { createLeaves } from './leaves.js';
import { createEnemies } from './enemies.js';
import { createRenderer } from './renderer.js';

async function boot() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const assets = await loadAssets();
  const player = createPlayer();
  const input = createInput(player);
  const camera = createCamera(CONFIG);
  const leaves = createLeaves(assets.leaf);
  const enemies = createEnemies(assets.spirit);
  const renderer = createRenderer(ctx, assets);

  const state = { camera, level: LEVEL, player, leaves, enemies };

  let last = performance.now();
  function loop(now) {
    const dtMs = Math.min(now - last, 50); // strop proti skokům
    last = now;

    player.update(input.moveDirection(), dtMs, LEVEL, input.isAttackHeld());
    camera.follow(player, CONFIG.world);
    leaves.update(dtMs, camera, player);
    enemies.update(dtMs, player);
    renderer.render(state, dtMs);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

boot().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend',
    `<pre style="color:#f55">${err.message}</pre>`);
});
