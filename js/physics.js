// Fyzikální systém hry
const PHYSICS = {
    // Lineární interpolace mezi dvěma hodnotami
    lerp: function(start, end, t) {
        return start * (1 - t) + end * t;
    },
    
    // Aplikace gravitace na objekt
    applyGravity: function(entity, deltaTime) {
        if (!entity || typeof entity !== 'object') return;
        
        if (entity.yVelocity !== undefined && entity.gravity !== undefined) {
            entity.yVelocity += entity.gravity * (deltaTime / 1000);
            
            if (typeof CONFIG !== 'undefined' && CONFIG.player && CONFIG.player.maxFallVelocity !== undefined) {
                entity.yVelocity = Math.min(entity.yVelocity, CONFIG.player.maxFallVelocity);
            }
        }
    },
    
    // Aktualizace pozice objektu
    updatePosition: function(entity, deltaTime) {
        if (!entity || typeof entity !== 'object') return;
        
        // Kontrola, zda objekt má potřebné vlastnosti
        if (entity.x === undefined || entity.y === undefined) {
            console.error("Entity nemá definované pozice x nebo y:", entity);
            return;
        }
        
        // Aplikace horizontální rychlosti
        if (entity.xVelocity !== undefined) {
            entity.x += entity.xVelocity * (deltaTime / 1000);
        }
        
        if (entity.yVelocity !== undefined) {
            entity.y += entity.yVelocity * (deltaTime / 1000);
        }
        
        // Kontrola kolize se zemí
        if (entity.y !== undefined && entity.groundY !== undefined) {
            if (entity.y > entity.groundY) {
                entity.y = entity.groundY;
                
                if (entity.yVelocity !== undefined) {
                    entity.yVelocity = 0;
                }
                
                // Detekce přistání ze skoku
                const wasJumping = entity.isJumping;
                
                if (entity.isJumping !== undefined) {
                    entity.isJumping = false;
                }
                
                if (entity.canSuperJump !== undefined) {
                    entity.canSuperJump = true;
                }
                
                if (entity.jumpTime !== undefined) {
                    entity.jumpTime = 0;
                }
                
                // Po přistání ze skoku
                if (wasJumping) {
                    this.updateStateAfterLanding(entity);
                }
            }
        }
        
        // Omezení pohybu na hranice plátna
        if (entity.x !== undefined && entity.width !== undefined) {
            if (typeof CONFIG !== 'undefined' && CONFIG.canvas && CONFIG.canvas.width !== undefined) {
                entity.x = Math.max(0, Math.min(CONFIG.canvas.width - entity.width, entity.x));
            }
        }
    },
    
    // Aktualizace stavu po přistání
    updateStateAfterLanding: function(entity) {
        if (!entity || typeof entity !== 'object') return;
        
        // Pokud se pohybujeme, přejdeme do stavu běhu
        if (entity.xVelocity !== undefined && Math.abs(entity.xVelocity) > 5) {
            if (entity.lastState !== undefined) entity.lastState = 'run';
            if (entity.lastAnimState !== undefined) entity.lastAnimState = 'run';
            if (entity.isIdle !== undefined) entity.isIdle = false;
        } else {
            // Jinak do idle stavu
            if (entity.lastState !== undefined) entity.lastState = 'idle';
            if (entity.lastAnimState !== undefined) entity.lastAnimState = 'idle';
            if (entity.isIdle !== undefined) entity.isIdle = true;
        }
        
        // Reset indexu animace pro plynulý přechod
        if (entity.frameIndex !== undefined) entity.frameIndex = 0;
    },
    
    // Aplikace Ninja efektu - postupné zpomalení 
    applyNinjaEffect: function(entity, deltaTime) {
        if (!entity || typeof entity !== 'object') return;
        
        // Kontrola potřebných vlastností
        if (entity.moving === undefined || entity.xVelocity === undefined) {
            return;
        }
        
        // Pokud se nemá pohybovat a má nějakou rychlost, postupně zpomal
        if (!entity.moving && Math.abs(entity.xVelocity) > 0) {
            let deceleration = 300; // Výchozí hodnota
            
            if (typeof CONFIG !== 'undefined' && 
                CONFIG.player && 
                CONFIG.player.deceleration !== undefined) {
                deceleration = CONFIG.player.deceleration;
            }
            
            deceleration *= (deltaTime / 1000);
            
            if (entity.xVelocity > 0) {
                entity.xVelocity = Math.max(0, entity.xVelocity - deceleration);
            } else {
                entity.xVelocity = Math.min(0, entity.xVelocity + deceleration);
            }
            
            // Když rychlost klesne téměř na nulu, zastav úplně
            if (Math.abs(entity.xVelocity) < 5) {
                entity.xVelocity = 0;
                
                // Přechod do idle stavu, pokud nejsme ve skoku nebo útoku
                if ((entity.isJumping === undefined || !entity.isJumping) && 
                    (entity.isAttacking === undefined || !entity.isAttacking)) {
                    
                    if (entity.isIdle !== undefined) entity.isIdle = true;
                    if (entity.lastState !== undefined) entity.lastState = 'idle';
                    if (entity.lastAnimState !== undefined) entity.lastAnimState = 'idle';
                    if (entity.frameIndex !== undefined) entity.frameIndex = 0;
                }
            }
        }
    },
    
    // Inicializace fyzikálních vlastností
    initialize: function(entity) {
        if (!entity || typeof entity !== 'object') {
            console.error("Nelze inicializovat neplatný objekt:", entity);
            return;
        }
        
        // Nastavení výchozích fyzikálních vlastností
        if (entity.x !== undefined) {
            entity.previousX = entity.x;
        }
        
        if (entity.y !== undefined) {
            entity.previousY = entity.y;
        }
        
        entity.xVelocity = 0;
        entity.yVelocity = 0;
        
        // Nastavení gravitace, pokud není definována
        if (entity.gravity === undefined && 
            typeof CONFIG !== 'undefined' && 
            CONFIG.player && 
            CONFIG.player.gravity !== undefined) {
            entity.gravity = CONFIG.player.gravity;
        }
        
        // Nastavení groundY, pokud není definována
        if (entity.groundY === undefined && 
            typeof CONFIG !== 'undefined' && 
            CONFIG.player && 
            CONFIG.player.groundY !== undefined) {
            entity.groundY = CONFIG.player.groundY;
        }
    }
};