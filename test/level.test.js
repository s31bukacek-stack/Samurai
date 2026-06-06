import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVEL } from '../src/level.js';

test('úroveň má velikost světa a zem', () => {
  assert.ok(LEVEL.worldWidth > 640);
  assert.ok(LEVEL.groundY > 0);
});

test('úroveň má aspoň dvě vyšší plošiny nad zemí', () => {
  assert.ok(Array.isArray(LEVEL.platforms));
  assert.ok(LEVEL.platforms.length >= 2);
  for (const p of LEVEL.platforms) {
    assert.equal(typeof p.x, 'number');
    assert.equal(typeof p.width, 'number');
    assert.ok(p.y < LEVEL.groundY, 'plošina musí být výš než zem (menší y)');
  }
});
