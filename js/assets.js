// Správa assetů hry
const ASSETS = {
    // Zkusíme najít obrázky ve třech různých cestách
    // 1. přímo v kořenovém adresáři
    // 2. ve složce assets
    // 3. v případě samurai_basic_attac.png zkusíme i správnou verzi s "k" na konci
    possiblePaths: {
        background: ['Preview.png', 'assets/Preview.png', 'Assets/Preview.png', 'preview.png', 'assets/preview.png'],
        flag: ['Flag.png', 'assets/Flag.png', 'Assets/Flag.png', 'flag.png', 'assets/flag.png'],
        run: ['samurai_run_sprite.png', 'assets/samurai_run_sprite.png', 'Assets/samurai_run_sprite.png'],
        idle: [
            'samurai_idle_sprite_new.png', 'assets/samurai_idle_sprite_new.png', 'Assets/samurai_idle_sprite_new.png',  // Nejprve zkusíme nový sprite
            'samurai_idle_sprite.png', 'assets/samurai_idle_sprite.png', 'Assets/samurai_idle_sprite.png'              // Pak původní
        ],
        jump: ['samurai_jump_sprite.png', 'assets/samurai_jump_sprite.png', 'Assets/samurai_jump_sprite.png'],
        attack: [
            'samurai_basic_attac.png', 'assets/samurai_basic_attac.png', 'Assets/samurai_basic_attac.png',
            'samurai_basic_attack.png', 'assets/samurai_basic_attack.png', 'Assets/samurai_basic_attack.png'
        ]
    },
    
    // Objekty obrázků
    images: {
        player: {
            run: new Image(),
            jump: new Image(),
            idle: new Image(),
            attack: new Image()
        },
        environment: {
            background: new Image(),
            flag: new Image()
        }
    },
    
    // Skutečné cesty, které byly nalezeny
    actualPaths: {
        background: null,
        flag: null,
        run: null,
        idle: null,
        jump: null,
        attack: null
    },
    
    // Testování existence obrázku
    testImageExists: function(path) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = path;
        });
    },
    
    // Najít první platný obrázek z několika možností
    findValidPath: async function(pathOptions, key) {
        for (const path of pathOptions) {
            const exists = await this.testImageExists(path);
            if (exists) {
                console.log(`Nalezen obrázek: ${path}`);
                this.actualPaths[key] = path;
                return path;
            }
        }
        console.error(`Žádný obrázek nebyl nalezen pro: ${pathOptions[0]}`);
        return null;
    },
    
    // Načítání obrázků
    load: async function() {
        try {
            // Najdi platné cesty k obrázkům
            const backgroundPath = await this.findValidPath(this.possiblePaths.background, 'background');
            const flagPath = await this.findValidPath(this.possiblePaths.flag, 'flag');
            const runPath = await this.findValidPath(this.possiblePaths.run, 'run');
            const idlePath = await this.findValidPath(this.possiblePaths.idle, 'idle');
            const jumpPath = await this.findValidPath(this.possiblePaths.jump, 'jump');
            const attackPath = await this.findValidPath(this.possiblePaths.attack, 'attack');
            
            // Kontrola, zda byly všechny obrázky nalezeny
            if (!backgroundPath || !flagPath || !runPath || !idlePath || !jumpPath || !attackPath) {
                let missingFiles = [];
                if (!backgroundPath) missingFiles.push("Preview.png");
                if (!flagPath) missingFiles.push("Flag.png");
                if (!runPath) missingFiles.push("samurai_run_sprite.png");
                if (!idlePath) missingFiles.push("samurai_idle_sprite.png");
                if (!jumpPath) missingFiles.push("samurai_jump_sprite.png");
                if (!attackPath) missingFiles.push("samurai_basic_attac.png");
                
                throw new Error(`Některé obrázky nebyly nalezeny: ${missingFiles.join(", ")}`);
            }
            
            // Načtení obrázků
            return new Promise((resolve, reject) => {
                let loadedCount = 0;
                const totalImages = 6;
                
                const checkAllLoaded = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        console.log('Všechny assety byly načteny');
                        resolve();
                    }
                };
                
                // Přiřazení cest k obrázkům
                this.images.environment.background.src = backgroundPath;
                this.images.environment.flag.src = flagPath;
                this.images.player.run.src = runPath;
                this.images.player.idle.src = idlePath;
                this.images.player.jump.src = jumpPath;
                this.images.player.attack.src = attackPath;
                
                // Přidání event listenerů pro načtení
                this.images.player.run.onload = checkAllLoaded;
                this.images.player.jump.onload = checkAllLoaded;
                this.images.player.idle.onload = checkAllLoaded;
                this.images.player.attack.onload = checkAllLoaded;
                this.images.environment.background.onload = checkAllLoaded;
                this.images.environment.flag.onload = checkAllLoaded;
                
                // Chybové handlery
                const onError = (e) => {
                    reject(new Error(`Chyba při načítání spritu: ${e}`));
                };
                
                this.images.player.run.onerror = onError;
                this.images.player.jump.onerror = onError;
                this.images.player.idle.onerror = onError;
                this.images.player.attack.onerror = onError;
                this.images.environment.background.onerror = onError;
                this.images.environment.flag.onerror = onError;
            });
        } catch (error) {
            throw error;
        }
    }
};