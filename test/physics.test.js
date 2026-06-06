import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyGravity, integrate } from '../src/physics.js';

const config = {
  player: { gravity: 1400, maxFallVelocity: 1300 },
  world: { width: 3000 },
};
const level = {
  worldWidth: 3000,
  groundY: 600,
  platforms: [{ x: 700, y: 460, width: 200 }], // horní hrana ve 460
};

function makeEntity(over) {
  return { x: 100, y: 300, width: 100, xVelocity: 0, yVelocity: 0,
           isJumping: true, canDoubleJump: false, groundY: 600, ...over };
}

test('gravitace zvyšuje yVelocity', () => {
  const e = makeEntity();
  applyGravity(e, 0.1, config);
  assert.ok(e.yVelocity > 0);
});

test('dopad na zem zastaví pád a resetuje skok', () => {
  const e = makeEntity({ y: 590, yVelocity: 500 });
  integrate(e, 0.1, level, config);
  assert.equal(e.y, 600);
  assert.equal(e.yVelocity, 0);
  assert.equal(e.isJumping, false);
});

test('dopad na vršek plošiny při pádu', () => {
  // entita nad plošinou, padá dolů, x v rozsahu plošiny
  const e = makeEntity({ x: 750, y: 450, yVelocity: 300, previousY: 450 });
  integrate(e, 0.1, level, config);
  assert.equal(e.y, 460); // přistání na hraně plošiny
  assert.equal(e.yVelocity, 0);
});

test('plošina nechytá při stoupání (skok zespodu projde)', () => {
  const e = makeEntity({ x: 750, y: 470, yVelocity: -300 });
  integrate(e, 0.05, level, config);
  assert.ok(e.y < 470, 'při stoupání plošina nezastaví');
});

test('vodorovný pohyb je klampnutý do světa', () => {
  const e = makeEntity({ x: -50, xVelocity: -100 });
  integrate(e, 0.1, level, config);
  assert.ok(e.x >= 0);
});
