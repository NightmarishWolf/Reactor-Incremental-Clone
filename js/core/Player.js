/* Player State Management */
const Player = {
    // Core resources
    energy: 0,
    fuel: CONFIG.FUEL_BASE,
    fuelCapacity: CONFIG.FUEL_BASE,

    // Generation stats
    totalEnergyGenerated: 0,
    passivePowerPerSecond: CONFIG.BASE_POWER_GENERATION,
    energyPerClick: CONFIG.BASE_ENERGY_CLICK,
    efficiency: 1.0,

    // Upgrades tracking
    upgrades: {},
    upgradesCost: {},

    // Time tracking
    timePlayed: 0,
    lastUpdateTime: Date.now(),

    /**
     * Initialize player state
     */
    init() {
        CONFIG.UPGRADES.forEach(upgrade => {
            this.upgrades[upgrade.id] = 0;
            this.upgradesCost[upgrade.id] = upgrade.cost;
        });
    },

    /**
     * Get current energy
     */
    getEnergy() {
        return this.energy;
    },

    /**
     * Add energy
     */
    addEnergy(amount) {
        const actualAmount = amount * this.efficiency;
        this.energy += actualAmount;
        this.totalEnergyGenerated += actualAmount;
        Events.emit('energy-changed', this.energy);
        return actualAmount;
    },

    /**
     * Spend energy
     */
    spendEnergy(amount) {
        if (this.energy >= amount) {
            this.energy -= amount;
            Events.emit('energy-changed', this.energy);
            return true;
        }
        return false;
    },

    /**
     * Get upgrade cost
     */
    getUpgradeCost(upgradeId) {
        return this.upgradesCost[upgradeId];
    },

    /**
     * Get upgrade level
     */
    getUpgradeLevel(upgradeId) {
        return this.upgrades[upgradeId] || 0;
    },

    /**
     * Buy an upgrade
     */
    buyUpgrade(upgradeId) {
        const cost = this.getUpgradeCost(upgradeId);
        if (!this.spendEnergy(cost)) return false;

        const upgrade = CONFIG.UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return false;

        this.upgrades[upgradeId]++;
        this.upgradesCost[upgradeId] = MathUtils.calculateCost(
            upgrade.baseCost,
            upgrade.costMultiplier,
            this.upgrades[upgradeId]
        );

        // Apply upgrade effects
        if (upgrade.effect.energyPerClick) {
            this.energyPerClick += upgrade.effect.energyPerClick;
        }
        if (upgrade.effect.passivePower) {
            this.passivePowerPerSecond += upgrade.effect.passivePower;
        }
        if (upgrade.effect.efficiency) {
            this.efficiency += upgrade.effect.efficiency;
        }
        if (upgrade.effect.fuelCapacity) {
            this.fuelCapacity += upgrade.effect.fuelCapacity;
        }

        Events.emit('upgrade-bought', { upgradeId, level: this.upgrades[upgradeId] });
        return true;
    },

    /**
     * Get total power generation per second
     */
    getTotalPowerPerSecond() {
        return this.passivePowerPerSecond * this.efficiency;
    },

    /**
     * Update time tracking
     */
    updateTime() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
        this.timePlayed += deltaTime;
        this.lastUpdateTime = now;
    },

    /**
     * Get serializable state for saving
     */
    getState() {
        return {
            energy: this.energy,
            fuel: this.fuel,
            fuelCapacity: this.fuelCapacity,
            totalEnergyGenerated: this.totalEnergyGenerated,
            passivePowerPerSecond: this.passivePowerPerSecond,
            energyPerClick: this.energyPerClick,
            efficiency: this.efficiency,
            timePlayed: this.timePlayed,
            upgrades: { ...this.upgrades }
        };
    },

    /**
     * Restore state from save
     */
    setState(state) {
        if (!state) return;
        this.energy = state.energy || 0;
        this.fuel = state.fuel || CONFIG.FUEL_BASE;
        this.fuelCapacity = state.fuelCapacity || CONFIG.FUEL_BASE;
        this.totalEnergyGenerated = state.totalEnergyGenerated || 0;
        this.passivePowerPerSecond = state.passivePowerPerSecond || CONFIG.BASE_POWER_GENERATION;
        this.energyPerClick = state.energyPerClick || CONFIG.BASE_ENERGY_CLICK;
        this.efficiency = state.efficiency || 1.0;
        this.timePlayed = state.timePlayed || 0;
        if (state.upgrades) {
            this.upgrades = { ...state.upgrades };
            // Recalculate costs for bought upgrades
            CONFIG.UPGRADES.forEach(upgrade => {
                const level = this.upgrades[upgrade.id] || 0;
                this.upgradesCost[upgrade.id] = MathUtils.calculateCost(
                    upgrade.baseCost,
                    upgrade.costMultiplier,
                    level
                );
            });
        }
    },

    /**
     * Reset to initial state
     */
    reset() {
        this.energy = 0;
        this.fuel = CONFIG.FUEL_BASE;
        this.fuelCapacity = CONFIG.FUEL_BASE;
        this.totalEnergyGenerated = 0;
        this.passivePowerPerSecond = CONFIG.BASE_POWER_GENERATION;
        this.energyPerClick = CONFIG.BASE_ENERGY_CLICK;
        this.efficiency = 1.0;
        this.timePlayed = 0;
        this.upgrades = {};
        this.upgradesCost = {};
        CONFIG.UPGRADES.forEach(upgrade => {
            this.upgrades[upgrade.id] = 0;
            this.upgradesCost[upgrade.id] = upgrade.cost;
        });
        Events.emit('player-reset');
    }
};
