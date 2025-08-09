// Soubor: js/leafeffect.js
// Tento soubor implementuje efekt padajících listů v Samurai Runner

const LEAF_EFFECT = {
    leaves: [],
    
    // === PARAMETRY PRO ÚPRAVU ===
    
    // Počet listů - zvýšení = více listů, snížení = méně listů
    // Doporučená hodnota: 30-100
    leafCount: 30,
    
    // Rychlost pádu (pixely za sekundu)
    // Vyšší hodnota = rychlejší pád listů
    // Doporučená hodnota: 15-40
    baseFallSpeed: 25,
    
    // Náhodná složka rychlosti - způsobuje, že každý list padá jinou rychlostí
    // Zvýšení = větší rozdíly v rychlosti mezi listy
    // Doporučená hodnota: 10-30
    additionalRandomSpeed: 20,
    
    // Amplituda větru - jak moc listy "vlají" do stran
    // Vyšší hodnota = více pohybu do stran
    // Doporučená hodnota: 10-40
    windAmplitude: 20,
    
    // Frekvence větru - jak rychle se mění směr vlání (frekvence sinusoidy)
    // Vyšší hodnota = rychlejší změny směru
    // Doporučená hodnota: 1-5
    windFrequency: 2,
    
    // Faktor rychlosti rotace - jak rychle se listy otáčejí
    // Vyšší hodnota = rychlejší rotace
    // Doporučená hodnota: 20-80
    rotationSpeedFactor: 40,
    
    // === NASTAVENÍ SPRITE SHEETU LISTŮ ===
    // Sprite sheet obsahuje 5 různých spritů listů o velikosti 16x16 px
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
        
        // Cesta k obrázku listu - můžete vyměnit za vlastní obrázek
        this.leafImage.src = 'assets/leaf.png';
        
        // Vytvoření listů
        this.leaves = [];
        for (let i = 0; i < this.leafCount; i++) {
            this.leaves.push(this.createLeaf());
        }
        
        this.log(`Vytvořeno ${this.leaves.length} listů`);
        this.initialized = true;
    },
    
    // Vytvoření náhradního obrázku listu - voláno, pokud se nepodaří načíst obrázek
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
            baseX: 0,
            amplitude: Math.random() * this.windAmplitude,
            phase: Math.random() * 2 * Math.PI,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * this.rotationSpeedFactor,
            
            // Náhodný výběr jednoho z 5 spritů (0-4)
            spriteIndex: Math.floor(Math.random() * this.leafSpriteCount),
            
            // Škálování velikosti listu - hodnota 1 zachová původní velikost (16px)
            // Pro větší listy zvyšte např. na 1.2 nebo 1.5
            // Pro menší listy snižte např. na 0.8 nebo 0.6
            scale: 0.8 + Math.random() * 0.6  // Rozsah 0.8-1.4 (80%-140% původní velikosti)
        };
    },

    // Aktualizace pozic listů - voláno v každém snímku
    update(deltaTime) {
        if (!this.initialized || !this.leaves || this.leaves.length === 0) {
            return;
        }

        // Přidáme čas (deltaTime je v sekundách)
        this.time += deltaTime;

        for (let leaf of this.leaves) {
            // Kontrola, že list existuje
            if (!leaf) continue;
            
            // Vertikální pohyb
            leaf.y += leaf.speedY * deltaTime;

            // Inicializace baseX, pokud ještě není nastavena
            if (leaf.baseX === 0) {
                leaf.baseX = leaf.x;
            }
            
            // Horizontální sinusový pohyb (efekt větru)
            leaf.x = leaf.baseX + Math.sin(this.time * this.windFrequency + leaf.phase) * leaf.amplitude;

            // Rotace listu
            leaf.rotation += leaf.rotationSpeed * deltaTime;

            // Reset, když list spadne pod canvas
            if (leaf.y > this.canvasHeight + 50) {
                leaf.y = -50;
                leaf.x = Math.random() * this.canvasWidth;
                leaf.baseX = leaf.x;
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
    }
};
