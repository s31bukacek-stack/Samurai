// Vykreslování herních objektů
const RENDERER = {
    // Inicializace plátna
    canvas: document.getElementById('gameCanvas'),
    ctx: null,
    debugElement: document.getElementById('debug'),
    
    // Inicializace rendereru
    initialize: function() {
        this.ctx = this.canvas.getContext('2d');
    },
    
    // Vymazání plátna
    clear: function() {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    },
    
    // Vykreslení pozadí
    drawBackground: function() {
        if (!this.ctx) return;
        
        if (typeof ASSETS !== 'undefined' && 
            ASSETS.images && 
            ASSETS.images.environment && 
            ASSETS.images.environment.background && 
            ASSETS.images.environment.background.complete) {
            
            this.ctx.drawImage(
                ASSETS.images.environment.background, 
                0, 0, 
                CONFIG.canvas.width, CONFIG.canvas.height
            );
        }
    },
    
    // Vykreslení vlajky
    drawFlag: function(deltaTime) {
        if (!this.ctx) return;
        
        if (typeof ASSETS !== 'undefined' && 
            ASSETS.images && 
            ASSETS.images.environment && 
            ASSETS.images.environment.flag && 
            ASSETS.images.environment.flag.complete) {
            
            // Aktualizace animace vlajky, pokud existuje
            if (typeof ANIMATIONS !== 'undefined' && 
                ANIMATIONS.flag && 
                ANIMATIONS.flag.update) {
                
                ANIMATIONS.flag.update(deltaTime);
                
                const frameWidth = ASSETS.images.environment.flag.width / CONFIG.animation.flag.totalFrames;
                const frameHeight = ASSETS.images.environment.flag.height;
                
                // Faktor zvětšení vlajky
                const scaleFactor = 2.0;
                
                this.ctx.drawImage(
                    ASSETS.images.environment.flag, 
                    ANIMATIONS.flag.frameIndex * frameWidth, 0, 
                    frameWidth, frameHeight, 
                    510, 205,  // Upravená pozice
                    frameWidth * scaleFactor, frameHeight * scaleFactor  // Zvětšené rozměry
                );
            }
        }
    },
    
    // Vykreslení hráče
    drawPlayer: function(interpolationFactor) {
        if (!this.ctx) return;
        if (typeof player === 'undefined' || !player) return;
        
        // Ověříme, zda existuje ANIMATIONS a potřebné metody
        if (typeof ANIMATIONS === 'undefined' || 
            !ANIMATIONS.getPlayerCurrentSprite ||
            !ANIMATIONS.getPlayerTotalFrames) {
            
            // Nouzové vykreslení hráče jako obdélníku
            this.ctx.fillStyle = 'blue';
            this.ctx.fillRect(
                player.x, 
                player.y - player.height, 
                player.width, 
                player.height
            );
            return;
        }
        
        // Získání správného spritu pro aktuální stav
        const currentSprite = ANIMATIONS.getPlayerCurrentSprite(player);
        const totalFrames = ANIMATIONS.getPlayerTotalFrames(player);
        
        // Kontrola, zda je sprite načten
        if (!currentSprite || !currentSprite.complete) {
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(
                player.x, 
                player.y - player.height, 
                player.width, 
                player.height
            );
            return;
        }
        
        // Výpočet rozměrů snímku
        const frameWidth = currentSprite.width / totalFrames;
        const frameHeight = currentSprite.height;
        
        // Použití přesnější interpolace pro plynulý pohyb
        let interpolatedX, interpolatedY;
        
        // Ověříme, zda má hráč všechny potřebné vlastnosti
        if (player.previousX !== undefined && player.previousY !== undefined) {
            interpolatedX = PHYSICS.lerp(player.previousX, player.x, interpolationFactor);
            interpolatedY = PHYSICS.lerp(player.previousY, player.y, interpolationFactor);
        } else {
            interpolatedX = player.x;
            interpolatedY = player.y;
        }
        
        // Uložení kontextu pro transformace
        this.ctx.save();
        
        // Výpočet aktuálního snímku
        const currentFrameIndex = Math.floor(player.frameIndex);
        
        // Vykreslení podle směru
        if (player.direction === -1) {
            // Otočení pro pohyb doleva
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                currentSprite,
                currentFrameIndex * frameWidth, 0, 
                frameWidth, frameHeight,
                -interpolatedX - player.width, interpolatedY - player.height, 
                player.width, player.height
            );
        } else {
            // Standardní vykreslení pro pohyb doprava
            this.ctx.drawImage(
                currentSprite,
                currentFrameIndex * frameWidth, 0, 
                frameWidth, frameHeight,
                interpolatedX, interpolatedY - player.height, 
                player.width, player.height
            );
        }
        
        // Obnovení kontextu
        this.ctx.restore();
    },
    
    // Vykreslení efektu padajících listů
    drawLeafEffect: function() {
        if (!this.ctx) return;
        
        if (typeof LEAF_EFFECT !== 'undefined' && 
            LEAF_EFFECT.draw) {
            LEAF_EFFECT.draw(this.ctx);
        }
    },
    
    // Aktualizace debugovacích informací
    updateDebugInfo: function(deltaTime) {
        if (!CONFIG.debug || !this.debugElement) return;
        
        let debugText = `FPS: ${Math.round(1000 / deltaTime)}\n`;
        
        if (typeof player !== 'undefined' && player) {
            debugText += `Pozice hráče: x=${Math.round(player.x)}, y=${Math.round(player.y)}\n`;
            debugText += `Rychlost - X: ${player.xVelocity.toFixed(2)}, Y: ${player.yVelocity.toFixed(2)}\n`;
            debugText += `Stav: ${player.isJumping ? 'Skáče' : (player.isIdle ? 'Idle' : (player.isAttacking ? 'Útok' : 'Běží'))}\n`;
            debugText += `Poslední stav: ${player.lastState}\n`;
            debugText += `Může provést super výskok: ${player.canSuperJump ? 'Ano' : 'Ne'}\n`;
            
            let totalFrames = 0;
            if (player.isAttacking && CONFIG.animation.totalFrames.attack !== undefined) {
                totalFrames = CONFIG.animation.totalFrames.attack;
            } else if (player.isJumping && CONFIG.animation.totalFrames.jump !== undefined) {
                totalFrames = CONFIG.animation.totalFrames.jump;
            } else if (player.isIdle && CONFIG.animation.totalFrames.idle !== undefined) {
                totalFrames = CONFIG.animation.totalFrames.idle;
            } else if (CONFIG.animation.totalFrames.run !== undefined) {
                totalFrames = CONFIG.animation.totalFrames.run;
            }
            
            debugText += `Aktuální snímek: ${player.frameIndex + 1}/${totalFrames}\n`;
            debugText += `Směr: ${player.direction === 1 ? 'Vpravo' : 'Vlevo'}`;
        }
        
        // Přidání informací o cestách k assetům
        if (typeof ASSETS !== 'undefined' && ASSETS.actualPaths) {
            debugText += `\n\nCesty k assetům:`;
            debugText += `\nBackground: ${ASSETS.actualPaths.background || 'nenalezeno'}`;
            debugText += `\nFlag: ${ASSETS.actualPaths.flag || 'nenalezeno'}`;
            debugText += `\nRun: ${ASSETS.actualPaths.run || 'nenalezeno'}`;
            debugText += `\nIdle: ${ASSETS.actualPaths.idle || 'nenalezeno'}`;
            debugText += `\nJump: ${ASSETS.actualPaths.jump || 'nenalezeno'}`;
            debugText += `\nAttack: ${ASSETS.actualPaths.attack || 'nenalezeno'}`;
        }
        
        // Přidání informací o LEAF_EFFECT
        if (typeof LEAF_EFFECT !== 'undefined') {
            debugText += `\n\nLeaf Effect:`;
            debugText += `\nPočet listů: ${LEAF_EFFECT.leaves ? LEAF_EFFECT.leaves.length : 0}`;
        }
        
        this.debugElement.textContent = debugText;
    },
    
    // Vykreslení celé scény
    render: function(interpolationFactor, deltaTime) {
        this.clear();
        this.drawBackground();
        this.drawPlayer(interpolationFactor);
        this.drawFlag(deltaTime);
        this.drawLeafEffect();
        this.updateDebugInfo(deltaTime);
    }
};