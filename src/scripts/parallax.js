// Modul pro paralaxní scrolling a generování prostředí
const PARALLAX = {
    // ... předchozí konfigurace ...

    // Aktualizace dekorativních prvků
    updateDecorElements: function() {
        // Odstraníme prvky, které již nejsou viditelné
        this.state.decorElements = this.state.decorElements.filter(element => 
            element.x > -100  // Ponecháme prvky, které jsou mimo levý okraj o trochu déle
        );

        // Vygenerujeme nové prvky, pokud je málo
        while (this.state.decorElements.length < 10) {  // Maximálně 10 prvků současně
            // Rozhodnutí, zda generovat nový prvek
            this.config.decorElements.forEach(decorConfig => {
                if (Math.random() < decorConfig.spawnChance) {
                    // Určení pozice nového prvku
                    const lastElement = this.state.decorElements.length > 0 
                        ? this.state.decorElements[this.state.decorElements.length - 1]
                        : null;
                    
                    const newX = lastElement 
                        ? lastElement.x + decorConfig.minDistance + 
                          Math.random() * (decorConfig.maxDistance - decorConfig.minDistance)
                        : CONFIG.canvas.width + Math.random() * 500;
                    
                    // Náhodná vertikální pozice
                    const newY = CONFIG.canvas.height - 100 + Math.random() * 50;

                    this.state.decorElements.push({
                        type: decorConfig.name,
                        x: newX,
                        y: newY,
                        image: ASSETS.images.decor[decorConfig.name]
                    });
                }
            });
        }
    },

    // Vykreslení dekorativních prvků
    renderDecorElements: function(ctx) {
        this.state.decorElements.forEach(element => {
            // Posun prvků doleva podle rychlosti scrollingu
            const scrollSpeed = this.config.baseScrollSpeed * 0.8;
            element.x -= scrollSpeed * (this.state.scrollOffset / 1000);

            // Vykreslení prvku
            ctx.drawImage(
                element.image, 
                element.x, 
                element.y
            );
        });
    },

    // Rozšíření render metody o vykreslení dekorativních prvků
    render: function(ctx) {
        // Vykreslení parallax vrstev
        this.config.layers.forEach(layer => {
            const scrollAmount = this.state.scrollOffset * layer.speedFactor;
            
            // Vykreslení první dlaždice
            ctx.drawImage(
                layer.image, 
                -(scrollAmount % layer.tileWidth), 
                0, 
                layer.tileWidth, 
                CONFIG.canvas.height
            );
            
            // Vykreslení druhé dlaždice pro plynulý scrolling
            ctx.drawImage(
                layer.image, 
                layer.tileWidth - (scrollAmount % layer.tileWidth), 
                0, 
                layer.tileWidth, 
                CONFIG.canvas.height
            );
        });

        // Vykreslení dekorativních prvků
        this.renderDecorElements(ctx);
    },

    // Rozšíření update metody
    update: function(deltaTime, playerVelocity) {
        // Výpočet scrollingu kombinující rychlost hráče a konstantní posun
        const scrollSpeed = Math.abs(playerVelocity) > 0 
            ? this.config.baseScrollSpeed * (1 + Math.abs(playerVelocity) / 200)
            : this.config.baseScrollSpeed * 0.5;
        
        // Aktualizace scrollOffset
        this.state.scrollOffset += scrollSpeed * (deltaTime / 1000);
        
        // Generování dekorativních prvků
        this.updateDecorElements();
    }
};