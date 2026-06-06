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
