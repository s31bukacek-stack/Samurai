// Hráč: stav + jeden krok aktualizace. Spojuje vstup, fyziku a animaci.
import { CONFIG } from './config.js';
import { applyGravity, integrate } from './physics.js';
import { updateFrame, playerState } from './animations.js';

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

    afterimageTime: 0,   // jak dlouho ještě emitovat „duchy" (po dvojitém skoku)
    afterimages: [],     // mizející kopie spritu (rozmazaný efekt)

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
        this.afterimageTime = CONFIG.effects.afterimage.duration;  // spusť rozmazání
      }
    },

    // Útok jde i ve vzduchu a za běhu (akčnější pocit).
    attack() {
      if (!this.isAttacking) {
        this.isAttacking = true;
        this.frameIndex = 0;
      }
    },

    // Přidá jeden „stín" (mizející kopii) s danou průhledností a rychlostí mizení.
    spawnGhost(alpha, fade) {
      this.afterimages.push({
        wx: this.x + this.width / 2,
        wy: this.y,
        state: playerState(this),
        frame: Math.floor(this.frameIndex),
        dir: this.direction,
        alpha,
        fade,
      });
    },

    // Mizející kopie spritu za postavou.
    updateAfterimages(dt, attackHeld) {
      for (const g of this.afterimages) g.alpha -= g.fade * dt;
      this.afterimages = this.afterimages.filter(g => g.alpha > 0);

      // Skok (dvojitý) — výrazný delší ocas.
      if (this.afterimageTime > 0) {
        this.afterimageTime -= dt;
        const a = CONFIG.effects.afterimage;
        this.spawnGhost(a.alpha, a.fade);
      }
      // Sekání — jen při delším (drženém) sekání a mírnější efekt.
      if (this.isAttacking && attackHeld) {
        const a = CONFIG.effects.attackAfterimage;
        this.spawnGhost(a.alpha, a.fade);
      }
    },

    // dirX: -1/0/1 z inputu; dtMs delta v ms; attackHeld: drží se útok?
    update(dirX, dtMs, level, attackHeld) {
      const dt = dtMs / 1000;
      const cfg = CONFIG.player;

      // Dynamické sekání: držením útoku sekej plynule za sebou
      // (jakmile jeden sek doběhne, hned začne další).
      if (attackHeld && !this.isAttacking) this.attack();

      this.moving = dirX !== 0;
      if (dirX !== 0) this.direction = dirX;

      // Plynulé zrychlení/zpomalení k cílové rychlosti (měkký, ale svižný pocit).
      const target = dirX * cfg.speed;
      const rate = (dirX !== 0 ? cfg.accel : cfg.deceleration) * dt;
      if (this.xVelocity < target) this.xVelocity = Math.min(target, this.xVelocity + rate);
      else if (this.xVelocity > target) this.xVelocity = Math.max(target, this.xVelocity - rate);

      applyGravity(this, dt, CONFIG);
      integrate(this, dt, level, CONFIG);
      updateFrame(this, dtMs);
      this.updateAfterimages(dt, attackHeld);
    },
  };
}
