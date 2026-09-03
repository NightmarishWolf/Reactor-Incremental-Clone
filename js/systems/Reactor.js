/* Reactor System - handles generation updates */
const Reactor = {
    /**
     * Update reactor generation (passive tick)
     */
    update(deltaTime) {
        const output = ReactorGrid.calculateTotalOutput();
        
        // Generate power and heat
        Player.addPower(output.power * deltaTime);
        Player.addHeat(output.heat * deltaTime);
        
        Events.emit('reactor-updated', output);
    },

    /**
     * Get current output
     */
    getOutput() {
        return ReactorGrid.calculateTotalOutput();
    },

    /**
     * Get state for saving
     */
    getState() {
        return ReactorGrid.getState();
    },

    /**
     * Restore state from save
     */
    setState(state) {
        ReactorGrid.setState(state);
    },

    /**
     * Reset reactor
     */
    reset() {
        ReactorGrid.reset();
    }
};
