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
  const [idle, run, jump, attack, background, flag, leaf, tileset, canopy] = await Promise.all([
    loadImage('assets/samurai_idle_sprite.png'),
    loadImage('assets/samurai_run_sprite.png'),
    loadImage('assets/samurai_jump_sprite.png'),
    loadImage('assets/samurai_basic_attac.png'),
    loadImage('assets/preview.png'),
    loadImage('assets/Flag.png'),
    loadImage('assets/leaf.png'),
    loadImage('assets/tileset.png'),
    loadImage('assets/canopy.png'),
  ]);

  return {
    player: { idle, run, jump, attack },
    background,
    flag,
    leaf,
    tileset,
    canopy,
  };
}
