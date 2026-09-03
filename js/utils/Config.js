/* Global Configuration */
const CONFIG = {
    // Grid reactor
    GRID_WIDTH: 6,
    GRID_HEIGHT: 6,
    CELL_SIZE: 50,
    
    // Cash system
    CASH_PER_CLICK: 1,
    CASH_PER_CLICK_UPGRADE_COST: 10,
    
    // Fuel cell tiers
    CELL_TIERS: [
        { 
            id: 'uranium', 
            name: 'Uranium', 
            tier: 1,
            basePower: 1,
            baseHeat: 1,
            cost: 10,
            pulses: { single: 1, double: 2, quad: 4 }
        },
        { 
            id: 'plutonium', 
            name: 'Plutonium', 
            tier: 2,
            basePower: 2,
            baseHeat: 4,
            cost: 50,
            pulses: { single: 1, double: 2, quad: 4 }
        },
        { 
            id: 'thorium', 
            name: 'Thorium', 
            tier: 3,
            basePower: 3,
            baseHeat: 9,
            cost: 200,
            pulses: { single: 1, double: 2, quad: 4 }
        }
    ],
    
    // Cell types
    CELL_TYPES: {
        SINGLE: 'single',
        DOUBLE: 'double',
        QUAD: 'quad'
    },
    
    // Heat management
    HEAT_CLICK_DISSIPATE: 1,
    MAX_HEAT_BASE: 100,
    HEAT_EXPLOSION_THRESHOLD: 1.0, // at 100% heat, meltdown begins
    
    // Capacitors
    CAPACITOR_COST: 50,
    POWER_STORAGE_PER_CAPACITOR: 100,
    
    // Reactor plating
    PLATING_COST: 50,
    HEAT_CAPACITY_PER_PLATING: 100,
    
    // Venting (cooling)
    VENT_COST: 100,
    HEAT_DISSIPATION_PER_VENT: 5,
    
    // Upgrades
    UPGRADES: [
        {
            id: 'cash-click',
            name: 'Better Scrounging',
            description: '+1 cash per click',
            baseCost: 10,
            costMultiplier: 1.15,
            effect: { cashPerClick: 1 }
        },
        {
            id: 'heat-click',
            name: 'Advanced Cooling',
            description: '+1 heat dissipation per click',
            baseCost: 50,
            costMultiplier: 1.15,
            effect: { heatDissipation: 1 }
        }
    ],
    
    // Prestige
    PRESTIGE_UNLOCK_POWER: 1e6,
    
    // UI
    UPDATE_RATE: 100,
    SAVE_INTERVAL: 5000,
    LARGE_NUMBER_THRESHOLD: 1e6,
    DECIMAL_PLACES: 2
};

Object.freeze(CONFIG);
