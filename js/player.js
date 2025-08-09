// Objekt hráče a jeho logika
const player = {
    // Pozice a rozměry
    x: CONFIG.player.startX,
    y: CONFIG.player.startY,
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    previousX: CONFIG.player.startX,
    previousY: CONFIG.player.startY,
    
    // Pohyb
    speed: CONFIG.player.speed,
    xVelocity: 0,
    yVelocity: 0,
    jumpStrength: CONFIG.player.jumpStrength,
    superJumpStrength: CONFIG.player.superJumpStrength,
    gravity: CONFIG.player.gravity,
    moving: false,
    direction: 1,
    groundY: CONFIG.player.groundY,
    
    // Stavy
    isJumping: false,
    canSuperJump: false,
    isIdle: true,
    isAttacking: false,
    
    // Sledování posledních stavů pro plynulé animace
    lastState: 'idle',
    lastAnimState: 'idle',
    
    // Parametry skoku
    jumpTime: 0,
    maxJumpTime: 0.3,
    
    // Animace
    frameIndex: 0,
    frameTimer: 0,
    
    // Inicializace hráče
    initialize: function() {
        PHYSICS.initialize(this);
        this.updateDimensions();
        // Zajistíme, že začínáme v idle stavu
        this.isIdle = true;
        this.lastState = 'idle';
        this.lastAnimState = 'idle';
        this.frameIndex = 0;
    },
    
    // Aktualizace rozměrů podle spritu
    updateDimensions: function() {
        // Nastavení šířky a výšky podle spritu běhu
        if (ASSETS.images.player.run.complete) {
            this.width = ASSETS.images.player.run.width / CONFIG.animation.totalFrames.run;
            this.height = ASSETS.images.player.run.height;
        }
    },
    
    // Aktualizace stavu hráče
    update: function(deltaTime) {
        // Zapamatování předchozí pozice pro interpolaci
        this.previousX = this.x;
        this.previousY = this.y;
        
        // Zpracování vstupu pro pohyb
        INPUT.handleMovement(deltaTime);
        
        // Aplikace ninja efektu zpomalení
        PHYSICS.applyNinjaEffect(this, deltaTime);
        
        // Fyzika
        PHYSICS.applyGravity(this, deltaTime);
        PHYSICS.updatePosition(this, deltaTime);
        
        // Aktualizace animace
        ANIMATIONS.updatePlayerFrame(this, deltaTime);
        
        // Manuální reset stavů
        this.ensureValidState();
    },
    
    // Zajištění konzistentního a viditelného stavu
    ensureValidState: function() {
        // Pokud jsme na zemi a nemáme žádný pohyb
        if (this.y === this.groundY && Math.abs(this.xVelocity) < 5) {
            // Vždy zajistíme, že jsme v idle stavu
            if (!this.isJumping && !this.isAttacking) {
                this.isIdle = true;
                this.lastState = 'idle';
                this.lastAnimState = 'idle';
                
                // Zajistíme, že máme platný frameIndex pro idle animaci
                if (this.frameIndex >= CONFIG.animation.totalFrames.idle) {
                    this.frameIndex = 0;
                }
            }
        }
    },
    
    // Vykonání základního skoku
    jump: function() {
        if (!this.isJumping && this.y === this.groundY) {
            this.yVelocity = this.jumpStrength / 2;
            this.isJumping = true;
            this.isIdle = false;
            this.jumpTime = 0;
            this.frameIndex = 0;
            this.lastState = 'jump';
            this.lastAnimState = 'jump';
        }
    },
    
    // Vykonání super skoku (druhý skok ve vzduchu)
    superJump: function() {
        if (this.canSuperJump) {
            this.yVelocity += this.superJumpStrength;
            this.canSuperJump = false;
        }
    },
    
    // Vykonání útoku
    attack: function() {
        if (!this.isAttacking && !this.isJumping) {
            this.isAttacking = true;
            this.isIdle = false;
            this.frameIndex = 0;
            this.lastState = 'attack';
            this.lastAnimState = 'attack';
        }
    }
};