// Herni scena se skrolujici zemi, paralaxnim pozadim a popredim

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// Nacteni vrstev pozadi, tilesetu, objektu a hrace
const background1 = new Image();
background1.src = "assets/bg/background1.png";
const background2 = new Image();
background2.src = "assets/bg/background2.png";
const background3 = new Image();
background3.src = "assets/bg/background3.png";
const tileset = new Image();
tileset.src = "assets/bg/tileset.png";
const props = new Image();
props.src = "assets/bg/props.png";
const trees = new Image();
trees.src = "assets/bg/trees.png";
const playerImage = new Image();
playerImage.src = "assets/player.png";

const tileSize = 64;
const terrainWidth = Math.ceil(canvas.width / tileSize) + 2;
let terrainX = 0;
const scrollSpeed = 0.8;

// Paralaxni rychlosti vrstev pozadi
let background1X = 0, background2X = 0, background3X = 0;
const bgSpeeds = { background1: 0.1, background2: 0.3, background3: 0.5 };

// Pevne dany vzor dlazdic podle referencniho obrazku
const terrainPattern = [
    [2, 0], [3, 0], [4, 0], [5, 0], [0, 0], [1, 0]
];

// Dekorace v popredi
const decorations = [
    { img: props, sx: 0, sy: 0, sw: 64, sh: 64, dx: 100, dy: canvas.height - 128 },
    { img: props, sx: 64, sy: 0, sw: 64, sh: 64, dx: 300, dy: canvas.height - 128 },
    { img: trees, sx: 0, sy: 0, sw: 128, sh: 128, dx: 500, dy: canvas.height - 192 },
    { img: props, sx: 128, sy: 0, sw: 64, sh: 64, dx: 700, dy: canvas.height - 128 }
];

// Hrac
const player = {
    x: 150,
    y: canvas.height - tileSize - 32,
    width: 32,
    height: 48,
    speed: 2,
    moving: false
};

let terrain = [];
for (let i = 0; i < terrainWidth; i++) {
    terrain.push(terrainPattern[i % terrainPattern.length]);
}

function update() {
    terrainX -= scrollSpeed;
    if (terrainX <= -tileSize) {
        terrainX = 0;
        terrain.shift();
        terrain.push(terrainPattern[terrain.length % terrainPattern.length]);
    }

    // Pohyb vrstev pozadi (paralaxni efekt)
    background1X -= bgSpeeds.background1;
    background2X -= bgSpeeds.background2;
    background3X -= bgSpeeds.background3;
    
    if (background1X <= -canvas.width) background1X = 0;
    if (background2X <= -canvas.width) background2X = 0;
    if (background3X <= -canvas.width) background3X = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vykresleni vrstev pozadi
    ctx.drawImage(background3, background3X, 0, canvas.width, canvas.height);
    ctx.drawImage(background3, background3X + canvas.width, 0, canvas.width, canvas.height);
    ctx.drawImage(background2, background2X, 0, canvas.width, canvas.height);
    ctx.drawImage(background2, background2X + canvas.width, 0, canvas.width, canvas.height);
    ctx.drawImage(background1, background1X, 0, canvas.width, canvas.height);
    ctx.drawImage(background1, background1X + canvas.width, 0, canvas.width, canvas.height);
    
    // Vykresleni terenu
    for (let i = 0; i < terrain.length; i++) {
        const [tileX, tileY] = terrain[i];
        const x = (i * tileSize) + terrainX;
        ctx.drawImage(
            tileset, 
            tileX * tileSize, tileY * tileSize, tileSize, tileSize, 
            x, canvas.height - tileSize, tileSize, tileSize
        );
    }
    
    // Vykresleni dekoraci v popredi
    decorations.forEach(deco => {
        ctx.drawImage(deco.img, deco.sx, deco.sy, deco.sw, deco.sh, deco.dx, deco.dy, deco.sw, deco.sh);
    });
    
    // Vykresleni hrace
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

window.onload = () => {
    loop();
};
