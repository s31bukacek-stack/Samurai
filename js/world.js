// Soubor: js/world.js - OPRAVENÁ VERZE
// Scrolling systém a procedurální generování světa

const WORLD = {
    // === KAMERA A SCROLLING ===
    camera: {
        x: 0,
        y: 0,
        targetX: 0,
        smoothing: 0.15 // Plynulost sledování (0-1, vyšší = rychlejší)
    },
    
    // === CHUNK SYSTÉM ===
    chunks: [],
    chunkWidth: 800, // Šířka jednoho segmentu světa
    activeChunks: 5, // Kolik chunků držet v paměti
    generateDistance: 2, // Kolik chunků dopředu generovat
    
    // === POZADÍ ===
    backgrounds: [],
    backgroundWidth: 640, // Šířka pozadí pro opakování
    
    // === GENEROVÁNÍ OBSAHU ===
    spawnPatterns: {
        // Pravděpodobnosti spawnu (0-1)
        tree: 0.15,      // 15% šance na strom
        object: 0.08,    // 8% šance na objekt (lucerna, studna, brána)
        decoration: 0.12, // 12% šance na dekoraci
        forest: 0.05,    // 5% šance na malý lesík
        empty: 0.6       // 60% šance na prázdné místo
    },
    
    // Vzdálenosti mezi objekty
    spacing: {
        min: 80,   // Minimální vzdálenost mezi objekty
        max: 200,  // Maximální vzdálenost mezi objekty
        forest: 50 // Vzdálenost mezi stromy v lesíku
    },
    
    initialized: false,
    
    // === INICIALIZACE ===
    initialize() {
        console.log("[WORLD] Inicializace scrolling systému...");
        
        // Načtení pozadí
        this.loadBackgrounds();
        
        // Generování počátečních chunků
        this.generateInitialChunks();
        
        this.initialized = true;
        console.log("[WORLD] Scrolling systém inicializován");
    },
    
    // === NAČTENÍ POZADÍ ===
    loadBackgrounds() {
        console.log("[WORLD] Načítání pozadí...");
        
        // Zkusíme najít pozadí v ASSETS
        if (typeof ASSETS !== 'undefined' && ASSETS.images && ASSETS.images.environment) {
            const bg = ASSETS.images.environment.background;
            
            if (bg && bg.complete && bg.naturalWidth > 0) {
                this.backgrounds.push({
                    image: bg,
                    speed: 0.3, // Rychlost paralaxu
                    x: 0
                });
                console.log("[WORLD] Pozadí načteno úspěšně");
            } else {
                console.log("[WORLD] Pozadí není připraveno, používám fallback");
            }
        } else {
            console.log("[WORLD] ASSETS nebo pozadí nebylo nalezeno");
        }
        
        console.log(`[WORLD] Celkem načteno ${this.backgrounds.length} pozadí`);
    },
    
    // === GENEROVÁNÍ POČÁTEČNÍCH CHUNKŮ ===
    generateInitialChunks() {
        console.log("[WORLD] Generování počátečních chunků...");
        // Vygenerujeme několik chunků dopředu a dozadu
        for (let i = -2; i <= this.generateDistance; i++) {
            this.generateChunk(i);
        }
    },
    
    // === GENEROVÁNÍ JEDNOHO CHUNKU ===
    generateChunk(chunkIndex) {
        const chunk = {
            index: chunkIndex,
            x: chunkIndex * this.chunkWidth,
            objects: []
        };
        
        // Aktuální pozice v chunku pro umísťování objektů
        let currentX = chunk.x + 50; // Offset od začátku chunku
        const chunkEnd = chunk.x + this.chunkWidth - 50;
        
        // Generování objektů v chunku
        while (currentX < chunkEnd) {
            const objectType = this.getRandomObjectType();
            
            if (objectType !== 'empty') {
                if (objectType === 'forest') {
                    // Generování malého lesíku (3-5 stromů)
                    const treeCount = 3 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < treeCount && currentX < chunkEnd; i++) {
                        const tree = this.createTreeObject(currentX);
                        if (tree) {
                            chunk.objects.push(tree);
                            currentX += this.spacing.forest + Math.random() * 30;
                        }
                    }
                } else {
                    // Generování jednotlivého objektu
                    const obj = this.createObject(objectType, currentX);
                    if (obj) {
                        chunk.objects.push(obj);
                    }
                }
            }
            
            // Posun na další pozici
            const spacing = this.spacing.min + Math.random() * (this.spacing.max - this.spacing.min);
            currentX += spacing;
        }
        
        this.chunks.push(chunk);
        console.log(`[WORLD] Vygenerován chunk ${chunkIndex} s ${chunk.objects.length} objekty na pozici ${chunk.x}`);
        
        return chunk;
    },
    
    // === URČENÍ TYPU OBJEKTU ===
    getRandomObjectType() {
        const rand = Math.random();
        let cumulativeProb = 0;
        
        for (const [type, probability] of Object.entries(this.spawnPatterns)) {
            cumulativeProb += probability;
            if (rand <= cumulativeProb) {
                return type;
            }
        }
        
        return 'empty';
    },
    
    // === VYTVOŘENÍ OBJEKTU ===
    createObject(type, x) {
        const groundY = CONFIG.canvas.height - 50; // Výška země
        
        switch (type) {
            case 'tree':
                return this.createTreeObject(x);
                
            case 'object':
                return this.createSceneryObject(x);
                
            case 'decoration':
                return this.createDecorationObject(x);
                
            default:
                return null;
        }
    },
    
    // === VYTVOŘENÍ STROMU ===
    createTreeObject(x) {
        // Náhodný výběr stromu (pokud máme více variant)
        const treeVariants = [
            { name: 'tree1', width: 118, height: 133, offsetY: 27 },
            { name: 'tree2', width: 103, height: 99, offsetY: 61 },
            { name: 'tree3', width: 130, height: 125, offsetY: 35 }
        ];
        
        const variant = treeVariants[Math.floor(Math.random() * treeVariants.length)];
        const groundY = CONFIG.canvas.height - 50;
        
        return {
            type: 'tree',
            x: x,
            y: groundY - variant.height + variant.offsetY,
            width: variant.width,
            height: variant.height,
            spriteX: this.getTreeSpriteX(variant.name),
            spriteY: variant.offsetY,
            spriteSheet: 'trees',
            variant: variant.name
        };
    },
    
    // === VYTVOŘENÍ SCENÉRIE ===
    createSceneryObject(x) {
        // Objekty: lucerna, brána, studna
        const objectVariants = [
            { name: 'lamp', width: 31, height: 48, spriteX: 0, spriteY: 48 },
            { name: 'gate', width: 96, height: 75, spriteX: 32, spriteY: 21 },
            { name: 'well', width: 74, height: 74, spriteX: 138, spriteY: 22 }
        ];
        
        const variant = objectVariants[Math.floor(Math.random() * objectVariants.length)];
        const groundY = CONFIG.canvas.height - 50;
        
        return {
            type: 'object',
            x: x,
            y: groundY - variant.height,
            width: variant.width,
            height: variant.height,
            spriteX: variant.spriteX,
            spriteY: variant.spriteY,
            spriteSheet: 'objects',
            variant: variant.name
        };
    },
    
    // === VYTVOŘENÍ DEKORACE ===
    createDecorationObject(x) {
        // Dekorace z props.png
        const decorVariants = [
            { name: 'prop1', width: 32, height: 32, spriteX: 0, spriteY: 0 },
            { name: 'prop2', width: 32, height: 32, spriteX: 32, spriteY: 0 },
            { name: 'prop3', width: 32, height: 32, spriteX: 64, spriteY: 0 }
        ];
        
        const variant = decorVariants[Math.floor(Math.random() * decorVariants.length)];
        const groundY = CONFIG.canvas.height - 50;
        
        return {
            type: 'decoration',
            x: x,
            y: groundY - variant.height,
            width: variant.width,
            height: variant.height,
            spriteX: variant.spriteX,
            spriteY: variant.spriteY,
            spriteSheet: 'props',
            variant: variant.name
        };
    },
    
    // === POMOCNÁ FUNKCE PRO SPRITE POZICE ===
    getTreeSpriteX(treeName) {
        switch (treeName) {
            case 'tree1': return 19;
            case 'tree2': return 147;
            case 'tree3': return 262;
            default: return 0;
        }
    },
    
    // === AKTUALIZACE SVĚTA ===
    update(deltaTime) {
        if (!this.initialized) return;
        
        // Bezpečná kontrola existence hráče
        if (typeof player === 'undefined' || !player) {
            console.log("[WORLD] Hráč není k dispozici");
            return;
        }
        
        // Aktualizace kamery
        this.updateCamera(deltaTime);
        
        // Aktualizace pozadí
        this.updateBackgrounds(deltaTime);
        
        // Správa chunků
        this.manageChunks();
    },
    
    // === AKTUALIZACE KAMERY ===
    updateCamera(deltaTime) {
        // Bezpečná kontrola hráče
        if (typeof player === 'undefined' || player.x === undefined) {
            return;
        }
        
        // Cílová pozice kamery (střed obrazovky na hráči)
        this.camera.targetX = player.x - CONFIG.canvas.width / 2;
        
        // Plynulé sledování
        const deltaX = this.camera.targetX - this.camera.x;
        this.camera.x += deltaX * this.smoothing;
        
        // Kamera se nepohybuje ve vertikálním směru (2D side-scroller)
        this.camera.y = 0;
    },
    
    // === AKTUALIZACE POZADÍ ===
    updateBackgrounds(deltaTime) {
        this.backgrounds.forEach(bg => {
            // Pohyb pozadí podle kamery
            bg.x = -this.camera.x * bg.speed;
        });
    },
    
    // === SPRÁVA CHUNKŮ ===
    manageChunks() {
        // Bezpečná kontrola kamery
        if (isNaN(this.camera.x)) {
            console.log("[WORLD] Neplatná pozice kamery");
            return;
        }
        
        const cameraChunk = Math.floor(this.camera.x / this.chunkWidth);
        
        // Generování nových chunků dopředu
        for (let i = 0; i <= this.generateDistance; i++) {
            const chunkIndex = cameraChunk + i;
            if (!this.chunks.find(chunk => chunk.index === chunkIndex)) {
                this.generateChunk(chunkIndex);
            }
        }
        
        // Generování chunků dozadu (pro couvání)
        for (let i = 1; i <= 2; i++) {
            const chunkIndex = cameraChunk - i;
            if (!this.chunks.find(chunk => chunk.index === chunkIndex)) {
                this.generateChunk(chunkIndex);
            }
        }
        
        // Odstranění vzdálených chunků
        this.chunks = this.chunks.filter(chunk => {
            const distance = Math.abs(chunk.index - cameraChunk);
            return distance <= this.activeChunks;
        });
    },
    
    // === VYKRESLENÍ SVĚTA ===
    render(ctx) {
        if (!this.initialized) return;
        
        // Uložení stavu kontextu
        ctx.save();
        
        // Aplikace scrollingu
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Vykreslení pozadí
        this.renderBackgrounds(ctx);
        
        // Vykreslení země
        this.renderGround(ctx);
        
        // Vykreslení objektů
        this.renderObjects(ctx);
        
        // Obnovení kontextu
        ctx.restore();
    },
    
    // === VYKRESLENÍ POZADÍ ===
    renderBackgrounds(ctx) {
        // Pokud nemáme načtené pozadí, vykreslíme jednoduché pozadí
        if (this.backgrounds.length === 0) {
            // Vykreslení oblohy
            const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
            gradient.addColorStop(0, '#87CEEB'); // Světle modrá
            gradient.addColorStop(0.7, '#B0E0E6'); // Powder blue
            gradient.addColorStop(1, '#F0F8FF'); // Alice blue
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                this.camera.x - 100, 0,
                CONFIG.canvas.width + 200, CONFIG.canvas.height
            );
            return;
        }
        
        // Vykreslení načtených pozadí
        this.backgrounds.forEach(bg => {
            if (!bg.image || !bg.image.complete) return;
            
            // Počet opakování pozadí
            const startX = Math.floor((this.camera.x + bg.x) / this.backgroundWidth) * this.backgroundWidth - bg.x;
            const endX = startX + CONFIG.canvas.width + this.backgroundWidth * 2;
            
            // Vykreslení opakujícího se pozadí
            for (let x = startX; x < endX; x += this.backgroundWidth) {
                ctx.drawImage(
                    bg.image,
                    x, 0,
                    this.backgroundWidth, CONFIG.canvas.height
                );
            }
        });
    },
    
    // === VYKRESLENÍ ZEMĚ ===
    renderGround(ctx) {
        const groundY = CONFIG.canvas.height - 50;
        const groundHeight = 50;
        
        // Hnědá země
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(
            this.camera.x - 100, groundY,
            CONFIG.canvas.width + 200, groundHeight
        );
        
        // Zelená tráva
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(
            this.camera.x - 100, groundY,
            CONFIG.canvas.width + 200, 8
        );
    },
    
    // === VYKRESLENÍ OBJEKTŮ ===
    renderObjects(ctx) {
        // Vykreslení objektů ze všech aktivních chunků
        this.chunks.forEach(chunk => {
            chunk.objects.forEach(obj => {
                this.renderObject(ctx, obj);
            });
        });
    },
    
    // === VYKRESLENÍ JEDNOHO OBJEKTU ===
    renderObject(ctx, obj) {
        // Pro nyní používáme barevné obdélníky místo spritů
        let color;
        switch (obj.type) {
            case 'tree': 
                color = '#228B22'; 
                break;
            case 'object': 
                color = '#8B4513'; 
                break;
            case 'decoration': 
                color = '#DAA520'; 
                break;
            default: 
                color = '#666666';
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // Debug informace
        if (CONFIG.debug) {
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(obj.type, obj.x, obj.y - 5);
            
            if (obj.variant) {
                ctx.fillText(obj.variant, obj.x, obj.y - 18);
            }
        }
    },
    
    // === DEBUG INFORMACE ===
    getDebugInfo() {
        if (!this.initialized) return "WORLD: Neinicializováno";
        
        const cameraChunk = Math.floor(this.camera.x / this.chunkWidth);
        const totalObjects = this.chunks.reduce((sum, chunk) => sum + chunk.objects.length, 0);
        
        return `WORLD:
Kamera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}
Chunky: ${this.chunks.length} (aktuální: ${cameraChunk})
Objekty: ${totalObjects}
Pozadí: ${this.backgrounds.length}`;
    }
};