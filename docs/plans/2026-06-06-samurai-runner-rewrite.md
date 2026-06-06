# Samurai Runner — čistý přepis + rolování — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Přepsat hru Samurai Runner do čistých ES modulů a přidat rolování světa (kamera sleduje hráče do stran i nahoru), zem a 1–2 vyšší plošiny, při zachování vzhledu, spritů, ovládání a pocitu z pohybu.

**Architecture:** Vanilla JS, ES moduly (`<script type="module">`), bez build kroku. Hráč se pohybuje ve velkém **světě**; **kamera** překládá souřadnice světa na plátno (`obrazovka = svět − kamera`). Úroveň jsou **data** (zem + seznam plošin). Čistá logika (kamera, fyzika, úroveň) je oddělená od DOM a testovaná v Node; vykreslování se ověřuje vizuálně.

**Tech Stack:** HTML5 Canvas 2D, ES moduly, Node.js vestavěný test runner (`node --test`), Python `http.server` pro lokální běh.

**Zdroj grafiky:** `~/Downloads/nahledy grafiky/samurai runner - pracovni/assets/` (původní složka zůstává jako záloha).

**Konvence pro souřadnice:** `player.x, player.y` je **levý-dolní roh** hráče ve světě (jako v původní hře: `y` = pata, kreslí se od `y - height`). `groundY` = y-ová úroveň země (pata stojí na zemi když `y === groundY`).

---

## File Structure

```
~/projects/samurai-runner/
├── index.html          → plátno + <script type="module" src="src/main.js">
├── package.json        → { "type": "module" } (kvůli Node testům i ESM)
├── assets/             → sprity, preview.png, Flag.png (zkopírováno ze zálohy)
└── src/
    ├── config.js       → CONFIG: všechna čísla (plátno, hráč, animace, svět, kamera)
    ├── camera.js       → createCamera(): follow() + worldToScreen() [čistá logika]
    ├── level.js        → LEVEL: worldWidth/Height, groundY, platforms[] [data]
    ├── physics.js      → applyGravity/applyNinjaEffect/integrate [čistá logika]
    ├── assets.js       → loadAssets(): načte obrázky, vrátí Promise
    ├── input.js        → createInput(): stav kláves + handlery
    ├── animations.js   → currentSprite/totalFrames/updateFrame
    ├── player.js       → createPlayer(): stav + update()
    ├── leaves.js       → createLeaves(): padající listí (prostor plátna)
    ├── renderer.js     → render(): pozadí (parallax) + plošiny + hráč + vlajka + listí
    └── main.js         → boot + herní smyčka (spojí vše)
└── test/
    ├── camera.test.js
    ├── physics.test.js
    └── level.test.js
```

**Pořadí stavby:** scaffold → config → camera (test) → level (test) → physics (test) → assets → input → animations → player → leaves → renderer → main (spojení + vizuální ověření).

---

## Task 0: Scaffold projektu + grafika + prázdné plátno

**Files:**
- Create: `package.json`
- Create: `index.html`
- Copy: `assets/*` ze zálohy
- Create: `src/main.js` (dočasný placeholder)

- [ ] **Step 1: package.json (ESM režim)**

Create `package.json`:
```json
{
  "name": "samurai-runner",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Zkopíruj grafiku ze zálohy**

Run:
```bash
cd ~/projects/samurai-runner
cp "/Users/jakubbukacek/Downloads/nahledy grafiky/samurai runner - pracovni/assets/preview.png" assets/
cp "/Users/jakubbukacek/Downloads/nahledy grafiky/samurai runner - pracovni/assets/Flag.png" assets/
cp "/Users/jakubbukacek/Downloads/nahledy grafiky/samurai runner - pracovni/assets/samurai_idle_sprite.png" assets/
cp "/Users/jakubbukacek/Downloads/nahledy grafiky/samurai runner - pracovni/assets/samurai_run_sprite.png" assets/
cp "/Users/jakubbukacek/Downloads/nahledy grafiky/samurai runner - pracovni/assets/samurai_jump_sprite.png" assets/
cp "/Users/jakubbukacek/Downloads/nahledy grafiky/samurai runner - pracovni/assets/samurai_basic_attac.png" assets/
ls assets/
```
Expected: 6 PNG souborů vypsáno.

- [ ] **Step 3: index.html**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Samurai Runner</title>
  <style>
    body { margin: 0; background: #1a1a1a; display: flex; flex-direction: column;
           justify-content: center; align-items: center; height: 100vh;
           font-family: monospace; color: #ddd; gap: 10px; }
    canvas { border: 1px solid #444; image-rendering: pixelated; }
    #controls { font-size: 13px; color: #888; }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="640" height="390"></canvas>
  <div id="controls">← → pohyb · mezerník skok / dvojitý skok · A útok</div>
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Dočasný main.js (vyplní plátno barvou)**

Create `src/main.js`:
```js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#87CEEB';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#fff';
ctx.font = '16px monospace';
ctx.fillText('Scaffold OK', 20, 30);
```

- [ ] **Step 5: Ověř v prohlížeči**

Run:
```bash
cd ~/projects/samurai-runner && python3 -m http.server 8740 >/tmp/sr.log 2>&1 &
sleep 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8740/index.html
```
Expected: `200`. V prohlížeči `http://localhost:8740/` ukáže modré plátno s „Scaffold OK". Konzole bez chyb.

- [ ] **Step 6: Commit**

```bash
cd ~/projects/samurai-runner
git add -A && git commit -m "scaffold: projekt, grafika, prázdné plátno"
```

---

## Task 1: config.js — všechna čísla na jednom místě

**Files:**
- Create: `src/config.js`

- [ ] **Step 1: Napiš config.js**

Create `src/config.js`:
```js
// Všechna laditelná čísla hry na jednom místě.
export const CONFIG = {
  canvas: { width: 640, height: 390 },

  // Svět je větší než plátno → vzniká prostor pro rolování.
  world: { width: 3000, height: 800 },

  player: {
    startX: 100,
    startY: 600,            // pata hráče (y roste dolů)
    width: 100,
    height: 150,
    speed: 220,             // px/s
    deceleration: 600,      // ninja dobržďování px/s²
    jumpStrength: -620,     // počáteční rychlost skoku (nahoru = záporné)
    doubleJumpStrength: -560,
    gravity: 1500,
    maxFallVelocity: 1300,
  },

  // Kolik snímků má každý spritesheet (snímky jsou vedle sebe v jedné řadě).
  animation: {
    frameDuration: { idle: 1000 / 6, run: 1000 / 12, jump: 1000 / 8, attack: 1000 / 8 },
    totalFrames: { idle: 4, run: 8, jump: 3, attack: 5 },
    flag: { frameDuration: 1000 / 4, totalFrames: 6 },
  },

  camera: {
    smoothing: 0.12,        // 0–1, vyšší = rychlejší dohánění
    // Kde na plátně chceme hráče držet (poměr šířky/výšky plátna).
    anchorX: 0.35,
    anchorY: 0.6,
  },

  // Pozadí preview.png jako parallax (jede pomaleji než svět).
  background: { parallax: 0.4 },

  leaves: { count: 50 },

  debug: true,
};
```

- [ ] **Step 2: Ověř, že modul jde naimportovat**

Run:
```bash
cd ~/projects/samurai-runner && node -e "import('./src/config.js').then(m => console.log('frames:', m.CONFIG.animation.totalFrames.run))"
```
Expected: `frames: 8`

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "config: centrální konfigurace hry"
```

---

## Task 2: camera.js — kamera (čistá logika, TDD)

**Files:**
- Create: `test/camera.test.js`
- Create: `src/camera.js`

Kamera drží hráče u kotvy plátna (anchorX/anchorY), plynule dohání cíl (lerp) a nevyjede mimo svět.

- [ ] **Step 1: Napiš padající test**

Create `test/camera.test.js`:
```js
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
```

- [ ] **Step 2: Spusť test, ověř selhání**

Run: `cd ~/projects/samurai-runner && node --test test/camera.test.js`
Expected: FAIL — `Cannot find module '../src/camera.js'`

- [ ] **Step 3: Napiš camera.js**

Create `src/camera.js`:
```js
// Kamera: překládá souřadnice světa na plátno a plynule sleduje hráče.
export function createCamera(config) {
  const { canvas, camera } = config;
  return {
    x: 0,
    y: 0,

    // Plynule posuň kameru tak, aby cíl byl u kotvy plátna.
    follow(target, world) {
      const desiredX = target.x - canvas.width * camera.anchorX;
      const desiredY = target.y - canvas.height * camera.anchorY;

      this.x += (desiredX - this.x) * camera.smoothing;
      this.y += (desiredY - this.y) * camera.smoothing;

      // Nevyjeď mimo svět.
      const maxX = Math.max(0, world.width - canvas.width);
      const maxY = Math.max(0, world.height - canvas.height);
      this.x = Math.max(0, Math.min(maxX, this.x));
      this.y = Math.max(0, Math.min(maxY, this.y));
    },

    // Svět → plátno.
    worldToScreen(worldX, worldY) {
      return { x: worldX - this.x, y: worldY - this.y };
    },
  };
}
```

- [ ] **Step 4: Spusť test, ověř průchod**

Run: `node --test test/camera.test.js`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "camera: kamera se sledováním hráče a klampováním do světa"
```

---

## Task 3: level.js — data úrovně (zem + plošiny, TDD)

**Files:**
- Create: `test/level.test.js`
- Create: `src/level.js`

Úroveň je čistá data: velikost světa, úroveň země a seznam plošin `{ x, y, width }` (kde `y` = horní hrana plošiny).

- [ ] **Step 1: Napiš padající test**

Create `test/level.test.js`:
```js
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
```

- [ ] **Step 2: Spusť test, ověř selhání**

Run: `node --test test/level.test.js`
Expected: FAIL — modul nenalezen.

- [ ] **Step 3: Napiš level.js**

Create `src/level.js`:
```js
// Data jedné úrovně. Souřadnice ve světě; y plošiny = její horní hrana.
import { CONFIG } from './config.js';

const groundY = CONFIG.player.startY; // pata hráče stojí na zemi

export const LEVEL = {
  worldWidth: CONFIG.world.width,
  worldHeight: CONFIG.world.height,
  groundY,

  // 1–2 ukázkové vyšší plošiny (důkaz vertikálního skákání).
  platforms: [
    { x: 700, y: groundY - 120, width: 220 },
    { x: 1100, y: groundY - 210, width: 200 },
    { x: 1500, y: groundY - 110, width: 260 },
  ],
};
```

- [ ] **Step 4: Spusť test, ověř průchod**

Run: `node --test test/level.test.js`
Expected: PASS (2/2)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "level: data úrovně se zemí a vyššími plošinami"
```

---

## Task 4: physics.js — gravitace, dobržďování, kolize s plošinami (TDD)

**Files:**
- Create: `test/physics.test.js`
- Create: `src/physics.js`

Fyzika je čistá: bere entitu (`{x,y,xVelocity,yVelocity,...}`), delta čas (s), úroveň a config. `integrate()` posune entitu a vyřeší dopad na zem i na vršek plošiny (jen při pádu dolů a jen pokud byla nad plošinou).

- [ ] **Step 1: Napiš padající test**

Create `test/physics.test.js`:
```js
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
```

- [ ] **Step 2: Spusť test, ověř selhání**

Run: `node --test test/physics.test.js`
Expected: FAIL — modul nenalezen.

- [ ] **Step 3: Napiš physics.js**

Create `src/physics.js`:
```js
// Čistá fyzika: nezná DOM ani canvas. Pracuje s entitou + delta časem (s).

export function lerp(a, b, t) { return a * (1 - t) + b * t; }

export function applyGravity(e, dt, config) {
  e.yVelocity += config.player.gravity * dt;
  if (e.yVelocity > config.player.maxFallVelocity) {
    e.yVelocity = config.player.maxFallVelocity;
  }
}

// Ninja dobržďování: když se entita nemá hýbat, plynule zpomal do nuly.
export function applyNinjaEffect(e, dt, config) {
  if (e.moving || e.xVelocity === 0) return;
  const dec = config.player.deceleration * dt;
  if (e.xVelocity > 0) e.xVelocity = Math.max(0, e.xVelocity - dec);
  else e.xVelocity = Math.min(0, e.xVelocity + dec);
}

// Posuň entitu a vyřeš kolize (zem + vršky plošin) a hranice světa.
export function integrate(e, dt, level, config) {
  e.previousX = e.x;
  e.previousY = e.y;

  const prevY = e.y;
  e.x += e.xVelocity * dt;
  e.y += e.yVelocity * dt;

  let landed = false;

  // Plošiny: chytni jen při pádu dolů a jen pokud pata prošla horní hranou shora.
  if (e.yVelocity >= 0) {
    for (const p of level.platforms) {
      const withinX = e.x + e.width > p.x && e.x < p.x + p.width;
      const crossedTop = prevY <= p.y && e.y >= p.y;
      if (withinX && crossedTop) {
        e.y = p.y;
        e.yVelocity = 0;
        landed = true;
        break;
      }
    }
  }

  // Zem.
  if (e.y > level.groundY) {
    e.y = level.groundY;
    e.yVelocity = 0;
    landed = true;
  }

  if (landed) {
    e.isJumping = false;
    e.canDoubleJump = true;
    e.jumpTime = 0;
  }

  // Hranice světa vodorovně.
  e.x = Math.max(0, Math.min(level.worldWidth - e.width, e.x));
}
```

- [ ] **Step 4: Spusť test, ověř průchod**

Run: `node --test test/physics.test.js`
Expected: PASS (5/5)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "physics: gravitace, ninja dobržďování, kolize s plošinami"
```

---

## Task 5: assets.js — načtení obrázků

**Files:**
- Create: `src/assets.js`

- [ ] **Step 1: Napiš assets.js**

Create `src/assets.js`:
```js
// Načtení všech obrázků. Vrací Promise s objektem připravených Image.
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Nepodařilo se načíst: ${src}`));
    img.src = src;
  });
}

export async function loadAssets() {
  const [idle, run, jump, attack, background, flag] = await Promise.all([
    loadImage('assets/samurai_idle_sprite.png'),
    loadImage('assets/samurai_run_sprite.png'),
    loadImage('assets/samurai_jump_sprite.png'),
    loadImage('assets/samurai_basic_attac.png'),
    loadImage('assets/preview.png'),
    loadImage('assets/Flag.png'),
  ]);

  return {
    player: { idle, run, jump, attack },
    background,
    flag,
  };
}
```

- [ ] **Step 2: Ověření (proběhne až v Tasku 11 v prohlížeči)**

Pozn.: `Image` je DOM API, nejde testovat v Node. Ověří se vizuálně po spojení v Tasku 11 (sprity se vykreslí).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "assets: načítání obrázků přes Promise"
```

---

## Task 6: input.js — klávesnice

**Files:**
- Create: `src/input.js`

- [ ] **Step 1: Napiš input.js**

Create `src/input.js`:
```js
// Klávesnice. Drží stav kláves a volá akce hráče (skok, útok).
export function createInput(player) {
  const keys = {};

  function onKeyDown(e) {
    keys[e.code] = true;
    if (e.code === 'Space') { e.preventDefault(); player.tryJump(); }
    if (e.code === 'KeyA') player.attack();
  }
  function onKeyUp(e) { keys[e.code] = false; }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  return {
    keys,
    // Vrací -1 (vlevo), 1 (vpravo), nebo 0.
    moveDirection() {
      if (keys.ArrowLeft) return -1;
      if (keys.ArrowRight) return 1;
      return 0;
    },
    isJumpHeld() { return !!keys.Space; },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "input: klávesnice (pohyb, skok, útok)"
```

---

## Task 7: animations.js — výběr a posun snímku

**Files:**
- Create: `src/animations.js`

- [ ] **Step 1: Napiš animations.js**

Create `src/animations.js`:
```js
// Animace hráče: jaký stav, jaký spritesheet, kolik snímků, a posun snímku v čase.
import { CONFIG } from './config.js';

export function playerState(player) {
  if (player.isAttacking) return 'attack';
  if (player.isJumping) return 'jump';
  if (Math.abs(player.xVelocity) > 10) return 'run';
  return 'idle';
}

export function currentSprite(player, assets) {
  return assets.player[playerState(player)];
}

export function totalFrames(player) {
  return CONFIG.animation.totalFrames[playerState(player)];
}

// Posune frameIndex podle času; po dokončení útoku útok ukončí.
export function updateFrame(player, dtMs) {
  const state = playerState(player);
  const duration = CONFIG.animation.frameDuration[state];
  const frames = CONFIG.animation.totalFrames[state];

  if (state === 'idle') { player.frameTimer = 0; }
  player.frameTimer += dtMs;

  if (player.frameTimer >= duration) {
    player.frameTimer = 0;
    player.frameIndex = (player.frameIndex + 1) % frames;
    if (state === 'attack' && player.frameIndex === 0) {
      player.isAttacking = false;
    }
  }
  if (player.frameIndex >= frames) player.frameIndex = 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "animations: stav hráče, výběr spritu, posun snímku"
```

---

## Task 8: player.js — stav a update hráče

**Files:**
- Create: `src/player.js`

- [ ] **Step 1: Napiš player.js**

Create `src/player.js`:
```js
// Hráč: stav + jeden krok aktualizace. Spojuje vstup, fyziku a animaci.
import { CONFIG } from './config.js';
import { applyGravity, applyNinjaEffect, integrate } from './physics.js';
import { updateFrame } from './animations.js';

export function createPlayer() {
  const p = CONFIG.player;
  return {
    x: p.startX, y: p.startY,
    previousX: p.startX, previousY: p.startY,
    width: p.width, height: p.height,
    xVelocity: 0, yVelocity: 0,
    direction: 1,
    moving: false,
    isJumping: false,
    canDoubleJump: false,
    isAttacking: false,
    jumpTime: 0,
    maxJumpTime: 0.3,
    frameIndex: 0,
    frameTimer: 0,

    // Skok ze země nebo dvojitý skok ve vzduchu.
    tryJump() {
      if (!this.isJumping) {
        this.yVelocity = CONFIG.player.jumpStrength;
        this.isJumping = true;
        this.canDoubleJump = true;
        this.jumpTime = 0;
      } else if (this.canDoubleJump) {
        this.yVelocity = CONFIG.player.doubleJumpStrength;
        this.canDoubleJump = false;
      }
    },

    attack() {
      if (!this.isAttacking && !this.isJumping) {
        this.isAttacking = true;
        this.frameIndex = 0;
      }
    },

    // dirX: -1/0/1 z inputu; dtMs delta v ms.
    update(dirX, dtMs, level) {
      const dt = dtMs / 1000;

      this.moving = dirX !== 0 && !this.isAttacking;
      if (this.moving) {
        this.xVelocity = dirX * CONFIG.player.speed;
        this.direction = dirX;
      }

      applyNinjaEffect(this, dt, CONFIG);
      applyGravity(this, dt, CONFIG);
      integrate(this, dt, level, CONFIG);
      updateFrame(this, dtMs);
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "player: stav hráče a krok aktualizace"
```

---

## Task 9: leaves.js — padající listí

**Files:**
- Create: `src/leaves.js`

Listí je efekt v prostoru plátna (nezávislý na kameře), aby vždy padalo přes celou scénu.

- [ ] **Step 1: Napiš leaves.js**

Create `src/leaves.js`:
```js
// Padající podzimní listí v prostoru plátna.
import { CONFIG } from './config.js';

const COLORS = ['#FF6B35', '#F7931E', '#FFD23F', '#EE4266', '#C73E1D'];

export function createLeaves() {
  const w = CONFIG.canvas.width, h = CONFIG.canvas.height;
  const leaves = [];

  function spawn(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : -10,
      size: 2 + Math.random() * 4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      vx: -0.5 + Math.random() * 1,
      vy: 0.5 + Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.1,
    };
  }

  for (let i = 0; i < CONFIG.leaves.count; i++) leaves.push(spawn(true));

  return {
    update(dtMs) {
      const k = dtMs / 16;
      for (const l of leaves) {
        l.x += l.vx * k; l.y += l.vy * k; l.rot += l.vrot * k;
        if (l.y > h + 10) Object.assign(l, spawn(false));
      }
    },
    draw(ctx) {
      for (const l of leaves) {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.fillStyle = l.color;
        ctx.fillRect(-l.size / 2, -l.size / 2, l.size, l.size);
        ctx.restore();
      }
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "leaves: efekt padajícího listí"
```

---

## Task 10: renderer.js — vykreslení scény přes kameru

**Files:**
- Create: `src/renderer.js`

- [ ] **Step 1: Napiš renderer.js**

Create `src/renderer.js`:
```js
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
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "renderer: pozadí, plošiny, hráč, vlajka, listí, debug"
```

---

## Task 11: main.js — spojení + herní smyčka + vizuální ověření

**Files:**
- Modify: `src/main.js` (přepsat placeholder)

- [ ] **Step 1: Přepiš main.js**

Replace `src/main.js`:
```js
// Vstupní bod: načte assety, spojí moduly a roztočí herní smyčku.
import { CONFIG } from './config.js';
import { loadAssets } from './assets.js';
import { LEVEL } from './level.js';
import { createCamera } from './camera.js';
import { createPlayer } from './player.js';
import { createInput } from './input.js';
import { createLeaves } from './leaves.js';
import { createRenderer } from './renderer.js';

async function boot() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const assets = await loadAssets();
  const player = createPlayer();
  const input = createInput(player);
  const camera = createCamera(CONFIG);
  const leaves = createLeaves();
  const renderer = createRenderer(ctx, assets);

  const state = { camera, level: LEVEL, player, leaves };

  let last = performance.now();
  function loop(now) {
    const dtMs = Math.min(now - last, 50); // strop proti skokům
    last = now;

    player.update(input.moveDirection(), dtMs, LEVEL);
    camera.follow(player, CONFIG.world);
    leaves.update(dtMs);
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
```

- [ ] **Step 2: Spusť server a ověř načtení**

Run:
```bash
cd ~/projects/samurai-runner
pkill -f "http.server 8740" 2>/dev/null
python3 -m http.server 8740 >/tmp/sr.log 2>&1 &
sleep 1
curl -s -o /dev/null -w "main.js: %{http_code}\n" http://localhost:8740/src/main.js
```
Expected: `200`

- [ ] **Step 3: Vizuální ověření v prohlížeči**

Otevři `http://localhost:8740/` (např. `open http://localhost:8740/`). Zkontroluj:
- Samuraj stojí na zemi, pozadí z `preview.png`, padá listí, vpravo dole debug.
- ← → rozběhne samuraje, **scéna se roluje** (debug `cam:` se mění), samuraj zůstává zhruba u kotvy plátna.
- Mezerník = skok, druhý mezerník ve vzduchu = dvojitý skok.
- Doběhnutím/doskákáním na plošinu (x≈700) na ni **samuraj dopadne a stojí** (výš než zem).
- A = útok (animace proběhne).
- Konzole bez chyb.

Pokud sedí, ověření prošlo. (Pro fyziku/kameru/úroveň navíc: `node --test` musí být celé zelené.)

- [ ] **Step 4: Spusť všechny logické testy**

Run: `cd ~/projects/samurai-runner && node --test`
Expected: všechny testy (camera, level, physics) PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "main: spojení modulů a herní smyčka — hra běží s rolováním"
```

---

## Hotovo, když
- `node --test` je celé zelené (kamera, úroveň, fyzika).
- Hra běží na lokálním serveru, samuraj se pohybuje ve světě širším než plátno, kamera ho sleduje do stran i nahoru.
- Funguje dopad na 1–2 vyšší plošiny + na zem; rolující pozadí; ovládání, sprity, listí, vlajka a pocit z pohybu odpovídají původní hře.
- V repu jsou jen čisté ES moduly dle struktury; žádné mrtvé/duplicitní soubory.
