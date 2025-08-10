// Konstanty a konfigurace hry
const CONFIG = {
    // Nastavení plátna
    canvas: {
        width: 640,
        height: 390
    },
    
    // Nastavení hry
    game: {
        fps: 60,
        frameTime: 1000 / 60,
        fixedTimeStep: 1000 / 120
    },
    
    // Nastavení hráče
    player: {
        startX: 50,
        startY: 340,
        width: 100,
        height: 150,
        speed: 150,               // Rychlost pohybu
        deceleration: 450,        // Rychlost zpomalení (ninja efekt)
        jumpStrength: -500,       // Síla skoku
        superJumpStrength: -400,  // Síla super skoku
        gravity: 1200,            // Gravitace
        maxFallVelocity: 1200,    // Maximální rychlost pádu
        groundY: 340
    },
    
    // Nastavení animací
    animation: {
        frameDuration: {
            idle: 1000 / 6,       // Upravená rychlost pro nový sprite s více snímky
            run: 1000 / 10,
            jump: 1000 / 8,
            attack: 1000 / 6
        },
        totalFrames: {
            idle: 4,             // Aktualizováno zěpt na 4 snímky
            run: 8,
            jump: 3,
            attack: 5
        },
        flag: {
            frameDuration: 1000 / 4,
            totalFrames: 6
        }
    },
    
    // Debug
    debug: true
};