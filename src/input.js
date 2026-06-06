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
