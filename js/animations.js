// Správa animací
const ANIMATIONS = {
    // Flag animace
    flag: {
        frameIndex: 0,
        frameTimer: 0,
        
        update: function(deltaTime) {
            this.frameTimer += deltaTime;
            if (this.frameTimer > CONFIG.animation.flag.frameDuration) {
                this.frameTimer -= CONFIG.animation.flag.frameDuration;
                this.frameIndex = (this.frameIndex + 1) % CONFIG.animation.flag.totalFrames;
            }
        }
    },
    
    // Aktualizace animačního rámce hráče
    updatePlayerFrame: function(player, deltaTime) {
        let frameDuration, totalFrames;
        
        // Prioritní určení stavu
        if (player.isAttacking) {
            frameDuration = CONFIG.animation.frameDuration.attack;
            totalFrames = CONFIG.animation.totalFrames.attack;
        } else if (player.isJumping) {
            frameDuration = CONFIG.animation.frameDuration.jump;
            totalFrames = CONFIG.animation.totalFrames.jump;
        } else if (player.isIdle) {
            frameDuration = CONFIG.animation.frameDuration.idle;
            totalFrames = CONFIG.animation.totalFrames.idle;
        } else {
            // Běh
            frameDuration = CONFIG.animation.frameDuration.run;
            totalFrames = CONFIG.animation.totalFrames.run;
        }
        
        // Ochrana před neplatným indexem snímku
        player.frameIndex = Math.min(player.frameIndex, totalFrames - 1);
        
        // Aktualizace časovače a indexu snímku
        player.frameTimer += deltaTime;
        
        // Kontrola, zda je čas na další snímek
        if (player.frameTimer >= frameDuration) {
            // Reset časovače
            player.frameTimer = 0;
            
            // Zvýšení indexu snímku s ochranou proti překročení
            player.frameIndex = (player.frameIndex + 1) % totalFrames;
            
            // Reset útoku po dokončení animace
            if (player.isAttacking && player.frameIndex === 0) {
                player.isAttacking = false;
                player.isIdle = true;
                player.lastState = 'idle';
                player.lastAnimState = 'idle';
            }
        }
    },
    
    // Získání správného spritu pro aktuální stav hráče
    getPlayerCurrentSprite: function(player) {
        // Vždy vrátit idle sprite, pokud žádný jiný není aktivní
        if (player.isAttacking) {
            return ASSETS.images.player.attack;
        } else if (player.isJumping) {
            return ASSETS.images.player.jump;
        } else if (player.isIdle) {
            return ASSETS.images.player.idle;
        } else {
            return ASSETS.images.player.run;
        }
    },
    
    // Získání celkového počtu snímků pro aktuální stav hráče
    getPlayerTotalFrames: function(player) {
        if (player.isAttacking) {
            return CONFIG.animation.totalFrames.attack;
        } else if (player.isJumping) {
            return CONFIG.animation.totalFrames.jump;
        } else if (player.isIdle) {
            return CONFIG.animation.totalFrames.idle;
        } else {
            return CONFIG.animation.totalFrames.run;
        }
    }
};