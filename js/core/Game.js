/* Main Game Controller */
const Game = {
    running: false,
    lastUpdateTime: Date.now(),
    autoSaveInterval: null,

    /**
     * Initialize and start the game
     */
    init() {
        console.log('Initializing Reactor Incremental...');
        
        Player.init();
        Reactor.init();
        UI.init();

        // Try to load save
        const saveData = Save.load();
        if (saveData) {
            console.log('Loading saved game...');
            Player.setState(saveData.player);
            Reactor.setState(saveData.reactor);
            UI.renderUpgrades();
            UI.updateStats();
            UI.updateReactorStatus();
        }

        this.start();
    },

    /**
     * Start the game loop
     */
    start() {
        this.running = true;
        this.lastUpdateTime = Date.now();
        
        // Auto-save every 5 seconds
        this.autoSaveInterval = setInterval(() => this.save(), CONFIG.SAVE_INTERVAL);
        
        this.gameLoop();
    },

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.running) return;

        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        // Update systems
        Player.updateTime();
        Reactor.update(deltaTime);
        Energy.update(deltaTime);

        requestAnimationFrame(() => this.gameLoop());
    },

    /**
     * Save game
     */
    save() {
        const gameState = {
            player: Player.getState(),
            reactor: Reactor.getState()
        };
        Save.save(gameState);
    },

    /**
     * Load game
     */
    load() {
        const saveData = Save.load();
        if (!saveData) {
            alert('No save found!');
            return;
        }

        Player.setState(saveData.player);
        Reactor.setState(saveData.reactor);
        UI.renderUpgrades();
        UI.updateStats();
        UI.updateReactorStatus();
        Save.showSaveStatus('Game loaded!', 'success');
    },

    /**
     * Reset game
     */
    reset() {
        Player.reset();
        Reactor.init();
        Save.delete();
        UI.renderUpgrades();
        UI.updateStats();
        UI.updateReactorStatus();
        Save.showSaveStatus('Game reset!', 'success');
    },

    /**
     * Stop the game
     */
    stop() {
        this.running = false;
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        this.save();
    }
};

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
    if (Game.running) {
        Game.save();
    }
});
