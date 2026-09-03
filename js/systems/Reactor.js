/* Reactor System */
const Reactor = {
    temperature: CONFIG.TEMPERATURE_BASE,
    maxTemperature: 1000,
    fuel: CONFIG.FUEL_BASE,
    fuelCapacity: CONFIG.FUEL_BASE,
    isActive: false,

    /**
     * Initialize reactor
     */
    init() {
        this.temperature = CONFIG.TEMPERATURE_BASE;
        this.fuel = CONFIG.FUEL_BASE;
        this.fuelCapacity = CONFIG.FUEL_BASE;
    },

    /**
     * Generate energy from click
     */
    click() {
        if (this.fuel <= 0) return 0;

        const energy = Player.energyPerClick;
        this.temperature += CONFIG.TEMPERATURE_PER_CLICK;
        this.fuel -= CONFIG.FUEL_CONSUMPTION_RATE;

        if (this.fuel < 0) this.fuel = 0;
        if (this.temperature > this.maxTemperature) {
            this.temperature = this.maxTemperature;
            this.isActive = false;
        }

        Events.emit('reactor-clicked', { energy, temperature: this.temperature });
        return energy;
    },

    /**
     * Update reactor (passive generation)
     */
    update(deltaTime) {
        // Decay temperature over time
        this.temperature -= CONFIG.TEMPERATURE_DECAY * deltaTime;
        if (this.temperature < CONFIG.TEMPERATURE_BASE) {
            this.temperature = CONFIG.TEMPERATURE_BASE;
        }

        // Consume fuel passively if active
        if (this.temperature > CONFIG.TEMPERATURE_BASE) {
            this.fuel -= CONFIG.FUEL_CONSUMPTION_RATE * deltaTime;
            if (this.fuel < 0) this.fuel = 0;
        }

        // Stop if out of fuel
        if (this.fuel <= 0) {
            this.isActive = false;
        }
    },

    /**
     * Refuel the reactor
     */
    refuel(amount) {
        this.fuel = Math.min(this.fuel + amount, this.fuelCapacity);
        Events.emit('reactor-refueled', this.fuel);
    },

    /**
     * Get reactor status
     */
    getStatus() {
        return {
            temperature: this.temperature,
            maxTemperature: this.maxTemperature,
            fuel: this.fuel,
            fuelCapacity: this.fuelCapacity,
            isActive: this.isActive,
            fuelPercent: (this.fuel / this.fuelCapacity) * 100
        };
    },

    /**
     * Get state for saving
     */
    getState() {
        return {
            temperature: this.temperature,
            fuel: this.fuel,
            fuelCapacity: this.fuelCapacity
        };
    },

    /**
     * Restore state from save
     */
    setState(state) {
        if (!state) return;
        this.temperature = state.temperature || CONFIG.TEMPERATURE_BASE;
        this.fuel = state.fuel || CONFIG.FUEL_BASE;
        this.fuelCapacity = state.fuelCapacity || CONFIG.FUEL_BASE;
    }
};
