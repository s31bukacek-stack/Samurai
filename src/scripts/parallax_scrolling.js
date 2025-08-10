// Náhodně generovaná skrolující zem z tilesetu

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Nastavení šířky a výšky canvasu
canvas.width = 800;
canvas.height = 400;

// Načtení tilesetu
const tileset = new Image();
tileset.src = "assets/bg/tileset.png";

// Definice dlaždic a jejich rozměrů
const tileSize = 64;
const tilesPerRow = 6;
const terrainWidth = Math.ceil(canvas.width / tileSize) + 2;
let terrainX = 0;
const scrollSpeed = 2;

// Předdefinované vzory dlaždic (odpovídající referenci)
const terrainPattern = [
    [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0] // Pevně dané bloky pro hladké napojení
];

// Generování segmentů terénu
let terrain = [];
for (let i = 0; i < terrainWidth; i++) {
    terrain.push(terrainPattern[Math.floor(Math.random() * terrainPattern.length)]);
}

function update() {
    terrainX -= scrollSpeed;
    if (terrainX <= -tileSize) {
        terrainX = 0;
        terrain.shift();
        terrain.push(terrainPattern[Math.floor(Math.random() * terrainPattern.length)]);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < terrain.length; i++) {
        const [tileX, tileY] = terrain[i];
        const x = (i * tileSize) + terrainX;
        ctx.drawImage(
            tileset, 
            tileX * tileSize, tileY * tileSize, tileSize, tileSize, 
            x, canvas.height - tileSize, tileSize, tileSize
        );
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

window.onload = () => {
    loop();
};
