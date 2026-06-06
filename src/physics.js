// Čistá fyzika: nezná DOM ani canvas. Pracuje s entitou + delta časem (s).

export function lerp(a, b, t) { return a * (1 - t) + b * t; }

export function applyGravity(e, dt, config) {
  // Při pádu (yVelocity > 0) působí silnější gravitace → svižnější skok.
  const mult = (e.yVelocity > 0 && config.player.fallGravityMult) ? config.player.fallGravityMult : 1;
  e.yVelocity += config.player.gravity * mult * dt;
  if (e.yVelocity > config.player.maxFallVelocity) {
    e.yVelocity = config.player.maxFallVelocity;
  }
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
