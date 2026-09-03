/* Global Configuration */
const CONFIG = {
    // Game mechanics
    BASE_ENERGY_CLICK: 1,
    BASE_POWER_GENERATION: 0.1,
    TEMPERATURE_BASE: 20,
    TEMPERATURE_PER_CLICK: 5,
    TEMPERATURE_DECAY: 0.5,
    FUEL_BASE: 100,
    FUEL_CONSUMPTION_RATE: 0.1,
    
    // Upgrades
    UPGRADES: [
        {
            id: 'click-power',
            name: 'Enhanced Reactor Click',
            description: '+1 energy per click',
            cost: 10,
            baseCost: 10,
            costMultiplier: 1.15,
            effect: { energyPerClick: 1 }
        },
        {
            id: 'passive-power',
            name: 'Passive Generation',
            description: '+0.1 energy/sec',
            cost: 50,
            baseCost: 50,
            costMultiplier: 1.15,
            effect: { passivePower: 0.1 }
        },
        {
            id: 'efficiency',
            name: 'Improved Efficiency',
            description: '+5% energy efficiency',
            cost: 100,
            baseCost: 100,
            costMultiplier: 1.15,
            effect: { efficiency: 0.05 }
        },
        {
            id: 'fuel-capacity',
            name: 'Expanded Fuel Tank',
            description: '+100 fuel capacity',
            cost: 200,
            baseCost: 200,
            costMultiplier: 1.15,
            effect: { fuelCapacity: 100 }
        }
    ],
    
    // UI update frequency
    UPDATE_RATE: 100, // ms
    SAVE_INTERVAL: 5000, // ms
    
    // Formatting
    LARGE_NUMBER_THRESHOLD: 1e6,
    DECIMAL_PLACES: 2
};

Object.freeze(CONFIG);
