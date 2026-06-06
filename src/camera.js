// Kamera: překládá souřadnice světa na plátno a plynně sleduje hráče.
export function createCamera(config) {
  const { canvas, camera } = config;
  return {
    x: 0,
    y: 0,

    // Plynně posuň kameru tak, aby cíl byl u kotvy plátna.
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
