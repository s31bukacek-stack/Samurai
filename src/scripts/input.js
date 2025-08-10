// Správa vstupu a ovládání
const INPUT = {
    // Stav kláves
    keys: {},
    
    // Inicializace ovládání
    initialize: function() {
        // Přidání event listenerů pro klávesy
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    },
    
    // Handler pro stisknutí klávesy
    handleKeyDown: function(e) {
        this.keys[e.code] = true;
        
        // Zpracování speciálních kláves
        if (e.code === 'Space') {
            this.handleJump();
        }
        
        if (e.code === 'KeyA') {
            this.handleAttack();
        }
    },
    
    // Handler pro uvolnění klávesy
    handleKeyUp: function(e) {
        this.keys[e.code] = false;
        
        // Reset stavu pohybu při uvolnění směrových kláves
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            player.moving = false;
            // Ninja efekt zajistí postupné zpomalení a přechod do správného stavu
        }
    },
    
    // Zpracování skoku
    handleJump: function() {
        // Základní skok ze země nebo super skok ve vzduchu
        if (!player.isJumping && player.y === player.groundY) {
            // Základní skok
            player.jump();
        } else if (player.canSuperJump) {
            // Super skok (druhý skok ve vzduchu)
            player.superJump();
        }
    },
    
    // Zpracování útoku
    handleAttack: function() {
        player.attack();
    },
    
    // Zpracování horizontálního pohybu
    handleMovement: function(deltaTime) {
        // Zjistíme, zda je stisknuta některá směrová klávesa
        const leftPressed = this.keys.ArrowLeft;
        const rightPressed = this.keys.ArrowRight;
        
        // Pohyb doleva
        if (leftPressed) {
            player.xVelocity = -player.speed;
            player.moving = true;
            player.direction = -1;
            
            // Aktualizace stavu pro běh
            if (!player.isJumping && !player.isAttacking) {
                player.lastState = 'run';
                player.lastAnimState = 'run';
                player.isIdle = false;
                
                // Reset indexu animace při změně stavu
                if (player.frameIndex === 0) {
                    player.frameIndex = 0;
                }
            }
        } 
        // Pohyb doprava 
        else if (rightPressed) {
            player.xVelocity = player.speed;
            player.moving = true;
            player.direction = 1;
            
            // Aktualizace stavu pro běh
            if (!player.isJumping && !player.isAttacking) {
                player.lastState = 'run';
                player.lastAnimState = 'run';
                player.isIdle = false;
                
                // Reset indexu animace při změně stavu
                if (player.frameIndex === 0) {
                    player.frameIndex = 0;
                }
            }
        }
        
        // Pokračování ve skoku s držením mezerníku
        if (player.isJumping) {
            player.jumpTime += deltaTime / 1000;
            
            if (player.jumpTime < player.maxJumpTime && this.keys.Space) {
                player.yVelocity += CONFIG.player.jumpStrength * (deltaTime / 1000);
            } else {
                player.isJumping = false;
                player.canSuperJump = true;
            }
        }
    }
};