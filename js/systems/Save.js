/* Save/Load System */
const Save = {
    STORAGE_KEY: 'reactor-save',

    /**
     * Save game state to localStorage
     */
    save(gameState) {
        try {
            const saveData = {
                timestamp: Date.now(),
                player: gameState.player,
                reactor: gameState.reactor
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
            this.showSaveStatus('Game saved!', 'success');
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            this.showSaveStatus('Save failed!', 'error');
            return false;
        }
    },

    /**
     * Load game state from localStorage
     */
    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch (error) {
            console.error('Load failed:', error);
            return null;
        }
    },

    /**
     * Check if save exists
     */
    hasSave() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    },

    /**
     * Delete save
     */
    delete() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    /**
     * Show save status message
     */
    showSaveStatus(message, type = 'success') {
        const element = document.getElementById('save-status');
        if (!element) return;
        
        element.textContent = message;
        element.className = 'save-status ' + type;
        
        setTimeout(() => {
            element.textContent = '';
            element.className = 'save-status';
        }, 2000);
    }
};
