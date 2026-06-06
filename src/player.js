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
