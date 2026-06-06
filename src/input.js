// Vstup: klávesnice (pohyb, skok) + myš (míření a sek pod úhlem).
export function createInput(player, canvas) {
  const keys = {};
  let mouseX = canvas.width / 2;
  let mouseY = canvas.height / 2;
  let mouseActive = false;
  let mouseDown = false;

  function onKeyDown(e) {
    keys[e.code] = true;
    if (e.code === 'Space') { e.preventDefault(); player.tryJump(); }
    if (e.code.startsWith('Arrow')) e.preventDefault();
    if (e.code === 'KeyA') player.attack();
  }
  function onKeyUp(e) { keys[e.code] = false; }

  function toCanvas(e) {
    const r = canvas.getBoundingClientRect();
    mouseX = (e.clientX - r.left) * (canvas.width / r.width);
    mouseY = (e.clientY - r.top) * (canvas.height / r.height);
    mouseActive = true;
  }
  function onMouseMove(e) { toCanvas(e); }
  function onMouseDown(e) { toCanvas(e); mouseDown = true; player.attack(); }
  function onMouseUp() { mouseDown = false; }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  return {
    keys,
    moveDirection() {
      if (keys.ArrowLeft) return -1;
      if (keys.ArrowRight) return 1;
      return 0;
    },
    isJumpHeld() { return !!keys.Space; },
    // Klávesa A drží sek průběžně; myš seká jednorázově (klik = jeden mířený odraz).
    isAttackHeld() { return !!keys.KeyA; },
    // Pozice myši na plátně (pro výpočet úhlu míření).
    mouse() { return { x: mouseX, y: mouseY, active: mouseActive }; },
  };
}
