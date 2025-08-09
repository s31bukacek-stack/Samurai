// Soubor: js/game.js

const GAME = {
    canvas: null,
    ctx: null,
    lastTime: 0,
    isRunning: false,
    initialized: false,
    debugMode: true,

    // Pomocná funkce pro logování
    log: function(message) {
        console.log(`[GAME] ${message}`);
        if (document.getElementById('debug')) {
            const debugElement = document.getElementById('debug');
            debugElement.textContent += message + '\n';
            debugElement.scrollTop = debugElement.scrollHeight;
        }
    },

    // Pomocná funkce pro zobrazení chyb
    showError: function(message) {
        console.error(`[GAME ERROR] ${message}`);
        if (document.getElementById('error')) {
            document.getElementById('error').innerHTML = `<p>Chyba: ${message}</p>`;
        }
    },

    async initialize() {
        this.log("Spouštím inicializaci hry...");

        // Získání canvasu a kontextu
        this.canvas = document.getElementById("gameCanvas");
        if (!this.canvas) {
            throw new Error("Nepodařilo se najít element s id='gameCanvas'.");
        }
        this.ctx = this.canvas.getContext("2d");

        try {
            // Inicializace RENDERER
            if (typeof RENDERER !== 'undefined' && RENDERER.initialize) {
                this.log("Inicializace RENDERER...");
                RENDERER.initialize();
            }
            
            // Inicializace INPUT
            if (typeof INPUT !== 'undefined' && INPUT.initialize) {
                this.log("Inicializace INPUT...");
                INPUT.initialize();
            }

            // Načtení assetů
            if (typeof ASSETS !== 'undefined' && ASSETS.load) {
                this.log("Načítání assetů...");
                await ASSETS.load();
                this.log("Assety úspěšně načteny");
            }

            // Inicializace hráče až po načtení assetů
            if (typeof player !== 'undefined' && player.initialize) {
                this.log("Inicializace hráče...");
                player.initialize();
            }
            
            // Inicializace efektu padajících listů
            if (typeof LEAF_EFFECT !== 'undefined' && LEAF_EFFECT.initialize) {
                this.log("Inicializace efektu padajících listů...");
                LEAF_EFFECT.initialize();
                this.log("Efekt padajících listů byl inicializován");
            }

            this.initialized = true;
            this.isRunning = true;
            this.lastTime = performance.now();
            
            // Spuštění herní smyčky s využitím bind() pro správný kontext
            this.log("Spouštění herní smyčky...");
            requestAnimationFrame(this.gameLoop.bind(this));

            this.log("Inicializace hry dokončena.");
            return true;
        } catch (error) {
            this.showError(`Chyba při inicializaci: ${error.message}`);
            console.error(error);
            return false;
        }
    },

    gameLoop(currentTime) {
        // Pokud hra není spuštěna, nepokračuj
        if (!this.isRunning) return;
        
        try {
            // Výpočet delta času
            const deltaTimeMs = currentTime - this.lastTime;
            const deltaTime = deltaTimeMs / 1000; // převod na sekundy
            this.lastTime = currentTime;

            // Vyčištění plátna
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }

            // Aktualizace herní logiky
            
            // Aktualizace vstupu
            if (typeof INPUT !== 'undefined' && INPUT.handleMovement) {
                INPUT.handleMovement(deltaTimeMs);
            }

            // Aktualizace hráče
            if (typeof player !== 'undefined' && player.update) {
                player.update(deltaTimeMs);
            }
            
            // Aktualizace efektu listů
            if (typeof LEAF_EFFECT !== 'undefined' && LEAF_EFFECT.update) {
                LEAF_EFFECT.update(deltaTime); // Zde používáme deltaTime v sekundách
            }

            // Vykreslení scény
            if (typeof RENDERER !== 'undefined' && RENDERER.render) {
                // Použití RENDERER pro vykreslení
                RENDERER.render(1, deltaTimeMs);
            } else {
                // Fallback vykreslení, pokud RENDERER není k dispozici
                this.fallbackRender(deltaTime);
            }

            // Zajištění pokračování herní smyčky s bind pro udržení kontextu
            requestAnimationFrame(this.gameLoop.bind(this));
        } catch (error) {
            this.showError(`Chyba v herní smyčce: ${error.message}`);
            console.error("Chyba v herní smyčce:", error);
            this.isRunning = false;
        }
    },

    // Rezervní metoda pro vykreslení, když RENDERER není k dispozici
    fallbackRender(deltaTime) {
        if (!this.ctx) return;
        
        // Vykreslení pozadí
        this.ctx.fillStyle = '#87CEEB'; // Světle modrá obloha
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Vykreslení země
        this.ctx.fillStyle = '#8B4513'; // Hnědá země
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // Vykreslení hráče
        if (typeof player !== 'undefined') {
            this.ctx.fillStyle = '#FF0000'; // Červená
            this.ctx.fillRect(
                player.x, 
                player.y - player.height, 
                player.width, 
                player.height
            );
        }
        
        // Vykreslení listů
        if (typeof LEAF_EFFECT !== 'undefined' && LEAF_EFFECT.draw) {
            LEAF_EFFECT.draw(this.ctx);
        }
    },

    stop() {
        this.isRunning = false;
        this.log("Hra byla zastavena.");
    },

    resume() {
        if (!this.isRunning && this.initialized) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
            this.log("Hra byla obnovena.");
        }
    }
};