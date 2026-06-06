import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCamera } from '../src/camera.js';

const cfg = {
  canvas: { width: 640, height: 390 },
  world: { width: 3000, height: 800 },
  camera: { smoothing: 1, anchorX: 0.35, anchorY: 0.6 }, // smoothing 1 = okamžité dohnání
};

test('worldToScreen odečítá pozici kamery', () => {
  const cam = createCamera(cfg);
  cam.x = 100; cam.y = 50;
  assert.deepEqual(cam.worldToScreen(150, 80), { x: 50, y: 30 });
});

test('follow drží cíl u kotvy a klampuje do světa zleva', () => {
  const cam = createCamera(cfg);
  // Cíl blízko levého kraje → kamera nesmí jít pod 0.
  cam.follow({ x: 0, y: 600 }, cfg.world);
  assert.equal(cam.x, 0);
  assert.ok(cam.y >= 0);
});

test('follow klampuje do světa zprava', () => {
  const cam = createCamera(cfg);
  cam.follow({ x: 2999, y: 600 }, cfg.world);
  assert.equal(cam.x, cfg.world.width - cfg.canvas.width); // 2360
});
