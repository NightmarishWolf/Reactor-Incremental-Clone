/* Energy System */
const Energy = {
    /**
     * Calculate passive energy generation
     */
    generatePassive(deltaTime) {
        const powerPerSecond = Player.getTotalPowerPerSecond();
        return powerPerSecond * deltaTime;
    },

    /**
     * Apply passive generation
     */
    update(deltaTime) {
        const passiveEnergy = this.generatePassive(deltaTime);
        if (passiveEnergy > 0) {
            Player.addEnergy(passiveEnergy);
        }
    },

    /**
     * Get current generation rate
     */
    getCurrentRate() {
        return Player.getTotalPowerPerSecond();
    },

    /**
     * Get energy efficiency
     */
    getEfficiency() {
        return Player.efficiency;
    }
};
