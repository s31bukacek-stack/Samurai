// Soubor: js/leafeffect.js
// Tento soubor implementuje efekt padajících listů v Samurai Runner s interakcí postavy

const LEAF_EFFECT = {
    leaves: [],
    
    // === PARAMETRY PRO ÚPRAVU ===
    
    // Počet listů - zvýšen pro hustší dojem
    leafCount: 45,
    
    // Rychlost pádu (pixely za sekundu)
    baseFallSpeed: 25,
    additionalRandomSpeed: 20,
    
    // Amplituda větru - jak moc listy "vlají" do stran
    windAmplitude: 20,
    
    // Frekvence větru - jak rychle se mění směr vlání
    windFrequency: 2,
    
    // Faktor rychlosti rotace - jak rychle se listy otáčejí
    rotationSpeedFactor: 200,
    
    // === NASTAVENÍ INTERAKCE S HRÁČEM ===
    
    // Vzdálenost, na kterou hráč ovlivňuje listy
    playerInfluenceRadius: 15,
    
    // Síla efektu "splašení" listů při přiblížení hráče
    playerInfluenceStrength: 100,
    
    // Přídavná rychlost pádu po interakci s hráčem
    additionalFallSpeed: 45,
    
    // === NASTAVENÍ EFEKTU NADLÉTNUTÍ ===
    
    // Šance, že list po kolizi nadlétne nahoru (0-1)
    updriftChance: 0.4,
    
    // Síla nadlétnutí (negativní rychlost = směr nahoru)
    updriftStrength: -40,
    
    // Maximální doba trvání nadlétnutí v sekundách
    updriftMaxDuration: 0.6,
    
    // === NASTAVENÍ ROTACE ===
    
    // Zvýšení rotace po interakci s hráčem (násobitel)
    rotationBoostFactor: 4.5,
    
    // Okamžitý impulz rotace při kolizi (ve stupních za sekundu)
    rotationImpulse: 720,  // 720 stupňů = 2 plné otáčky
    
    // Doba trvání efektu "splašení" (v sekundách)
    playerInfluenceDuration: 1.2,
    
    // === NASTAVENÍ SPRITE SHEETU LISTŮ ===
    leafSpriteSize: 16,     // Velikost jednoho sprite (šířka a výška v pixelech)
    leafSpriteCount: 5,     // Počet různých spritů listů v souboru
    
    // === OSTATNÍ VLASTNOSTI ===
    leafImage: null,
    canvasWidth: 640,
    canvasHeight: 390,
    time: 0,
    initialized: false,
    
    // Pomocná funkce pro logování
    log: function(message) {
        console.log(`[LEAF_EFFECT] ${message}`);
    },

    // Inicializace efektu - voláno při startu hry
    initialize() {
        this.log("Inicializace efektu padajících listů...");
        
        // Nastavení rozměrů canvasu
        const canvas = document.getElementById("gameCanvas");
        if (canvas) {
            this.canvasWidth = canvas.width;
            this.canvasHeight = canvas.height;
        }

        // Načtení obrázku listu
        this.leafImage = new Image();
        this.leafImage.onload = () => {
            this.log("Obrázek listu úspěšně načten");
        };
        this.leafImage.onerror = () => {
            this.log("Nepodařilo se načíst obrázek listu, vytvářím náhradní");
            this.createFallbackLeafImage();
        };
        
        // Cesta k obrázku listu
        this.leafImage.src = 'assets/leaf.png';
        
        // Vytvoření listů
        this.leaves = [];
        for (let i = 0; i < this.leafCount; i++) {
            this.leaves.push(this.createLeaf());
        }
        
        this.log(`Vytvořeno ${this.leaves.length} listů`);
        this.initialized = true;
    },
    
    // Vytvoření náhradního obrázku listu
    createFallbackLeafImage() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 16;
        tempCanvas.height = 16;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Vykreslení náhradního listu
        tempCtx.fillStyle = 'rgba(0, 128, 0, 0.7)';
        tempCtx.beginPath();
        tempCtx.arc(8, 8, 6, 0, Math.PI * 2);
        tempCtx.fill();
        
        this.leafImage = tempCanvas;
    },

    // Vytvoření jednoho listu s náhodnými vlastnostmi
    createLeaf() {
        return {
            x: Math.random() * this.canvasWidth,
            y: Math.random() * this.canvasHeight - this.canvasHeight, // začnou nad obrazovkou
            speedY: this.baseFallSpeed + Math.random() * this.additionalRandomSpeed,
            speedX: 0, // Horizontální rychlost (při interakci s hráčem)
            baseX: 0,
            amplitude: Math.random() * this.windAmplitude,
            phase: Math.random() * 2 * Math.PI,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * this.rotationSpeedFactor,
            // defaultní rotační rychlost pro návrat po interakci
            defaultRotationSpeed: 0,
            // Flag pro sledování, zda se jedná o první frame kolize
            freshCollision: false,
            
            // Parametry efektu nadlétnutí
            isUpdrifting: false,
            updriftTimer: 0,
            
            // Náhodný výběr jednoho z 5 spritů (0-4)
            spriteIndex: Math.floor(Math.random() * this.leafSpriteCount),
            
            // Škálování velikosti listu
            scale: 0.8 + Math.random() * 0.6,  // Rozsah 0.8-1.4
            
            // Stav interakce s hráčem
            influencedByPlayer: false,
            influenceTimer: 0,
            influenceDirectionX: 0
        };
    },

    // Výpočet vzdálenosti mezi dvěma body
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },

    // Aktualizace pozic listů s interakcí hráče
    update(deltaTime) {
        if (!this.initialized || !this.leaves || this.leaves.length === 0) {
            return;
        }

        // Přidáme čas (deltaTime je v sekundách)
        this.time += deltaTime;

        // Získáme referenci na hráče, pokud existuje
        const playerExists = typeof player !== 'undefined' && player !== null;
        let playerX = 0, playerY = 0, playerWidth = 0, playerHeight = 0, playerXVelocity = 0;
        
        if (playerExists) {
            playerX = player.x || 0;
            playerY = player.y || 0;
            playerWidth = player.width || 50;
            playerHeight = player.height || 100;
            playerXVelocity = player.xVelocity || 0;
        }

        for (let leaf of this.leaves) {
            // Kontrola, že list existuje
            if (!leaf) continue;
            
            // Uložení výchozí rotační rychlosti, pokud ještě nebyla uložena
            if (leaf.defaultRotationSpeed === 0) {
                leaf.defaultRotationSpeed = leaf.rotationSpeed;
            }
            
            // Zpracování interakce s hráčem
            if (playerExists) {
                // Výpočet středu hráče
                const playerCenterX = playerX + playerWidth / 2;
                const playerCenterY = playerY - playerHeight / 2;
                
                // Výpočet vzdálenosti od hráče
                const dist = this.distance(leaf.x, leaf.y, playerCenterX, playerCenterY);
                
                // Pokud je list v dosahu hráče a není již pod vlivem
                if (dist < this.playerInfluenceRadius && !leaf.influencedByPlayer) {
                    // Označíme list jako ovlivněný hráčem
                    leaf.influencedByPlayer = true;
                    leaf.influenceTimer = this.playerInfluenceDuration;
                    
                    // Označíme jako čerstvou kolizi pro okamžitý impulz rotace
                    leaf.freshCollision = true;
                    
                    // Výpočet směru "splašení" - horizontálně pryč od hráče
                    const dirX = leaf.x - playerCenterX;
                    
                    // Zachováme pouze horizontální složku pohybu
                    if (dirX !== 0) {
                        leaf.influenceDirectionX = Math.sign(dirX);
                    } else {
                        // Pokud jsou přesně nad sebou, náhodně určíme směr
                        leaf.influenceDirectionX = (Math.random() > 0.5) ? 1 : -1;
                    }
                    
                    // Přidání složky rychlosti hráče - při běhu
                    if (Math.abs(playerXVelocity) > 20) {
                        leaf.influenceDirectionX = Math.sign(playerXVelocity);
                    }
                    
                    // Určíme, zda list bude nadlétávat
                    if (Math.random() < this.updriftChance) {
                        leaf.isUpdrifting = true;
                        leaf.updriftTimer = this.updriftMaxDuration * (0.5 + Math.random() * 0.5); // 50-100% maximální doby
                        
                        // Nastavíme zápornou rychlost (směr nahoru)
                        leaf.speedY = this.updriftStrength * (0.7 + Math.random() * 0.6); // Variabilní síla nadlétnutí
                    } else {
                        // Pokud list nebude nadlétávat, přidáme standardní zvýšení rychlosti pádu
                        leaf.speedY += this.additionalFallSpeed;
                    }
                    
                    // Zvýšení rotace - základní zvýšení
                    leaf.rotationSpeed = leaf.defaultRotationSpeed * this.rotationBoostFactor;
                    if (Math.random() > 0.5) {
                        leaf.rotationSpeed = -leaf.rotationSpeed; // Náhodná změna směru rotace
                    }
                }
            }
            
            // Zpracování listů pod vlivem hráče
            if (leaf.influencedByPlayer) {
                // Aplikace okamžitého rotačního impulzu při první detekci kolize
                if (leaf.freshCollision) {
                    // Přidáme okamžitý impulz rotace - náhodný směr
                    if (Math.random() > 0.5) {
                        leaf.rotation += this.rotationImpulse * deltaTime;
                    } else {
                        leaf.rotation -= this.rotationImpulse * deltaTime;
                    }
                    leaf.freshCollision = false;
                }
                
                // Aktualizace časovače vlivu hráče
                leaf.influenceTimer -= deltaTime;
                
                // Zpracování efektu nadlétnutí
                if (leaf.isUpdrifting) {
                    leaf.updriftTimer -= deltaTime;
                    
                    if (leaf.updriftTimer <= 0) {
                        // Konec nadlétnutí, přechod na pád
                        leaf.isUpdrifting = false;
                        
                        // Pozvolný nástup gravitace
                        leaf.speedY = this.baseFallSpeed * 0.5;
                    } else {
                        // Postupné zpomalení nadlétnutí a přechod ke klesání (gravitace)
                        leaf.speedY += (this.baseFallSpeed * 2) * deltaTime;
                    }
                }
                
                if (leaf.influenceTimer <= 0) {
                    // Konec vlivu hráče
                    leaf.influencedByPlayer = false;
                    leaf.speedX = 0;
                    
                    // Resetujeme také nadlétnutí, pokud již netrvá
                    if (!leaf.isUpdrifting) {
                        // Postupný návrat k původní rotační rychlosti
                        leaf.rotationSpeed = leaf.rotationSpeed * 0.9 + leaf.defaultRotationSpeed * 0.1;
                        
                        // Postupný návrat k původní rychlosti pádu, pokud již neprobíhá nadlétnutí
                        leaf.speedY = Math.max(
                            this.baseFallSpeed,
                            leaf.speedY * 0.95
                        );
                    }
                } else {
                    // Aplikace síly "splašení" - pouze horizontálně
                    const influenceFactor = leaf.influenceTimer / this.playerInfluenceDuration;
                    leaf.speedX = leaf.influenceDirectionX * this.playerInfluenceStrength * influenceFactor;
                }
            } else {
                // Pokud list již není pod vlivem, postupně se vrací k normálu
                if (Math.abs(leaf.rotationSpeed - leaf.defaultRotationSpeed) > 0.1) {
                    leaf.rotationSpeed = leaf.rotationSpeed * 0.95 + leaf.defaultRotationSpeed * 0.05;
                }
                
                // Pokud stále probíhá nadlétnutí
                if (leaf.isUpdrifting) {
                    leaf.updriftTimer -= deltaTime;
                    
                    if (leaf.updriftTimer <= 0) {
                        // Konec nadlétnutí
                        leaf.isUpdrifting = false;
                        leaf.speedY = this.baseFallSpeed * 0.5;
                    } else {
                        // Postupné zpomalení nadlétnutí
                        leaf.speedY += (this.baseFallSpeed * 2) * deltaTime;
                    }
                } 
                // Pokud není pod vlivem nadlétnutí, aplikujeme standardní pád
                else if (leaf.speedY < this.baseFallSpeed) {
                    // Postupně zrychlujeme na základní rychlost pádu
                    leaf.speedY = Math.min(
                        this.baseFallSpeed,
                        leaf.speedY + (this.baseFallSpeed * deltaTime)
                    );
                }
            }
            
            // Vertikální pohyb 
            leaf.y += leaf.speedY * deltaTime;
            
            // Horizontální pohyb - kombinace větru a vlivu hráče
            if (leaf.baseX === 0) {
                leaf.baseX = leaf.x;
            }
            
            // Pokud není list pod vlivem hráče, aplikujeme normální sinusový pohyb
            if (!leaf.influencedByPlayer) {
                leaf.x = leaf.baseX + Math.sin(this.time * this.windFrequency + leaf.phase) * leaf.amplitude;
            } else {
                // Jinak přidáme přímý horizontální pohyb od vlivu hráče
                leaf.x += leaf.speedX * deltaTime;
                leaf.baseX = leaf.x; // Aktualizace základní pozice pro budoucí sinusový pohyb
            }

            // Rotace listu
            leaf.rotation += leaf.rotationSpeed * deltaTime;

            // Reset, když list spadne pod canvas nebo vyletí mimo
            if (leaf.y > this.canvasHeight + 50 || 
                leaf.x < -50 || 
                leaf.x > this.canvasWidth + 50) {
                leaf.y = -50;
                leaf.x = Math.random() * this.canvasWidth;
                leaf.baseX = leaf.x;
                leaf.speedY = this.baseFallSpeed + Math.random() * this.additionalRandomSpeed;
                leaf.influencedByPlayer = false;
                leaf.isUpdrifting = false;
                leaf.rotationSpeed = leaf.defaultRotationSpeed;
            }
        }
    },

    // Vykreslení listů - voláno v každém snímku
    draw(ctx) {
        if (!ctx || !this.initialized || !this.leaves || this.leaves.length === 0) {
            return;
        }
        
        // Kontrola, jestli máme platný obrázek
        if (!this.leafImage) {
            return;
        }

        for (let leaf of this.leaves) {
            if (!leaf) continue;
            
            ctx.save();
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate((leaf.rotation * Math.PI) / 180);
            
            // Velikost listu s aplikovaným faktorem zvětšení/zmenšení
            const scale = leaf.scale || 1;
            const scaledSize = this.leafSpriteSize * scale;
            
            if (this.leafImage instanceof HTMLCanvasElement) {
                // Použití náhradního canvas elementu
                ctx.drawImage(this.leafImage, -scaledSize/2, -scaledSize/2, scaledSize, scaledSize);
            } else if (this.leafImage.complete) {
                // Použití správného sprites z sprite sheetu
                const spriteIndex = leaf.spriteIndex || 0;
                
                // Výpočet pozice ve sprite sheetu
                const sourceX = spriteIndex * this.leafSpriteSize;
                const sourceY = 0;
                
                // Vykreslení sprite ze sprite sheetu
                ctx.drawImage(
                    this.leafImage,
                    sourceX, sourceY, this.leafSpriteSize, this.leafSpriteSize,
                    -scaledSize/2, -scaledSize/2, scaledSize, scaledSize
                );
            } else {
                // Záložní vykreslení, pokud obrázek není načtený
                ctx.fillStyle = 'rgba(0, 128, 0, 0.7)';
                ctx.beginPath();
                ctx.arc(0, 0, scaledSize/2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    },
    
    // Informace o stavu efektu listů pro debug zobrazení
    getDebugInfo() {
        const influencedCount = this.leaves.filter(leaf => leaf.influencedByPlayer).length;
        const updriftingCount = this.leaves.filter(leaf => leaf.isUpdrifting).length;
        return `Leaf Effect:\nPočet listů: ${this.leafCount}\nPod vlivem hráče: ${influencedCount}\nNadlétá: ${updriftingCount}`;
    }
};