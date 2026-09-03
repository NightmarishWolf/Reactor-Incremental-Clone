/* Player State Management */
const Player = {
    // Resources
    cash: 0,
    power: 0,
    heat: 0,
    
    // Capacities
    maxPower: 100,
    maxHeat: CONFIG.MAX_HEAT_BASE,
    
    // Per-click stats
    cashPerClick: CONFIG.CASH_PER_CLICK,
    heatDissipationPerClick: CONFIG.HEAT_CLICK_DISSIPATE,
    
    // Buildings
    capacitors: 0,
    reactorPlating: 0,
    vents: 0,
    
    // Upgrades
    upgrades: {},
    
    // Stats
    totalPowerGenerated: 0,
    totalCashEarned: 0,
    
    /**
     * Initialize player
     */
    init() {
        CONFIG.UPGRADES.forEach(upgrade => {
            this.upgrades[upgrade.id] = 0;
        });
    },

    /**
     * Add cash
     */
    addCash(amount) {
        this.cash += amount;
        this.totalCashEarned += amount;
        Events.emit('cash-changed', this.cash);
        return amount;
    },

    /**
     * Spend cash
     */
    spendCash(amount) {
        if (this.cash >= amount) {
            this.cash -= amount;
            Events.emit('cash-changed', this.cash);
            return true;
        }
        return false;
    },

    /**
     * Add power
     */
    addPower(amount) {
        const clamped = Math.min(this.power + amount, this.maxPower);
        const actualAmount = clamped - this.power;
        this.power = clamped;
        this.totalPowerGenerated += actualAmount;
        Events.emit('power-changed', this.power);
        return actualAmount;
    },

    /**
     * Dissipate heat by clicking
     */
    dissipateHeat(amount) {
        this.heat = Math.max(0, this.heat - amount);
        Events.emit('heat-changed', this.heat);
    },

    /**
     * Add heat to reactor
     */
    addHeat(amount) {
        this.heat = Math.min(this.heat + amount, this.maxHeat);
        Events.emit('heat-changed', this.heat);
        
        // Check for meltdown
        if (this.heat >= this.maxHeat) {
            Events.emit('reactor-meltdown');
        }
    },

    /**
     * Get heat percentage
     */
    getHeatPercent() {
        return (this.heat / this.maxHeat) * 100;
    },

    /**
     * Buy upgrade
     */
    buyUpgrade(upgradeId) {
        const upgrade = CONFIG.UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return false;

        const level = this.upgrades[upgradeId] || 0;
        const cost = MathUtils.calculateCost(upgrade.baseCost, upgrade.costMultiplier, level);
        
        if (!this.spendCash(cost)) return false;

        this.upgrades[upgradeId]++;

        if (upgrade.effect.cashPerClick) {
            this.cashPerClick += upgrade.effect.cashPerClick;
        }
        if (upgrade.effect.heatDissipation) {
            this.heatDissipationPerClick += upgrade.effect.heatDissipation;
        }

        Events.emit('upgrade-bought', { upgradeId, level: this.upgrades[upgradeId] });
        return true;
    },

    /**
     * Buy capacitor
     */
    buyCapacitor() {
        if (this.spendCash(CONFIG.CAPACITOR_COST)) {
            this.capacitors++;
            this.maxPower += CONFIG.POWER_STORAGE_PER_CAPACITOR;
            Events.emit('capacitor-bought', this.capacitors);
            return true;
        }
        return false;
    },

    /**
     * Buy reactor plating
     */
    buyPlating() {
        if (this.spendCash(CONFIG.PLATING_COST)) {
            this.reactorPlating++;
            this.maxHeat += CONFIG.HEAT_CAPACITY_PER_PLATING;
            Events.emit('plating-bought', this.reactorPlating);
            return true;
        }
        return false;
    },

    /**
     * Buy vent
     */
    buyVent() {
        if (this.spendCash(CONFIG.VENT_COST)) {
            this.vents++;
            Events.emit('vent-bought', this.vents);
            return true;
        }
        return false;
    },

    /**
     * Get upgrade level
     */
    getUpgradeLevel(upgradeId) {
        return this.upgrades[upgradeId] || 0;
    },

    /**
     * Get upgrade cost
     */
    getUpgradeCost(upgradeId) {
        const upgrade = CONFIG.UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return 0;
        const level = this.upgrades[upgradeId] || 0;
        return MathUtils.calculateCost(upgrade.baseCost, upgrade.costMultiplier, level);
    },

    /**
     * Sell power for cash
     */
    sellPower(amount) {
        if (this.power < amount) {
            amount = this.power;
        }
        const cashEarned = amount * CONFIG.POWER_SELL_PRICE;
        this.power -= amount;
        this.addCash(cashEarned);
        Events.emit('power-sold', { powerSold: amount, cashEarned });
        return cashEarned;
    },

    /**
     * Sell all power

    /**
     * Get state for saving
     */
    getState() {
        return {
            cash: this.cash,
            power: this.power,
            heat: this.heat,
            maxPower: this.maxPower,
            maxHeat: this.maxHeat,
            cashPerClick: this.cashPerClick,
            heatDissipationPerClick: this.heatDissipationPerClick,
            capacitors: this.capacitors,
            reactorPlating: this.reactorPlating,
            vents: this.vents,
            upgrades: { ...this.upgrades },
            totalPowerGenerated: this.totalPowerGenerated,
            totalCashEarned: this.totalCashEarned
        };
    },

    /**
     * Restore state from save
     */
    setState(state) {
        if (!state) return;
        this.cash = state.cash || 0;
        this.power = state.power || 0;
        this.heat = state.heat || 0;
        this.maxPower = state.maxPower || 100;
        this.maxHeat = state.maxHeat || CONFIG.MAX_HEAT_BASE;
        this.cashPerClick = state.cashPerClick || CONFIG.CASH_PER_CLICK;
        this.heatDissipationPerClick = state.heatDissipationPerClick || CONFIG.HEAT_CLICK_DISSIPATE;
        this.capacitors = state.capacitors || 0;
        this.reactorPlating = state.reactorPlating || 0;
        this.vents = state.vents || 0;
        this.upgrades = { ...state.upgrades };
        this.totalPowerGenerated = state.totalPowerGenerated || 0;
        this.totalCashEarned = state.totalCashEarned || 0;
    },

    /**
     * Reset to initial state
     */
    reset() {
        this.cash = 0;
        this.power = 0;
        this.heat = 0;
        this.maxPower = 100;
        this.maxHeat = CONFIG.MAX_HEAT_BASE;
        this.cashPerClick = CONFIG.CASH_PER_CLICK;
        this.heatDissipationPerClick = CONFIG.HEAT_CLICK_DISSIPATE;
        this.capacitors = 0;
        this.reactorPlating = 0;
        this.vents = 0;
        this.upgrades = {};
        this.totalPowerGenerated = 0;
        this.totalCashEarned = 0;
        Events.emit('player-reset');
    }
};
