/* Grid-based Reactor System */
const ReactorGrid = {
    grid: [],
    selectedCell: null,

    /**
     * Initialize empty grid
     */
    init() {
        this.grid = [];
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            const row = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                row.push({
                    x, y,
                    type: null, // 'single', 'double', 'quad'
                    tier: null, // uranium, plutonium, etc.
                    active: false
                });
            }
            this.grid.push(row);
        }
    },

    /**
     * Check if position is valid
     */
    isValid(x, y) {
        return x >= 0 && x < CONFIG.GRID_WIDTH && y >= 0 && y < CONFIG.GRID_HEIGHT;
    },

    /**
     * Get cell at position
     */
    getCell(x, y) {
        if (!this.isValid(x, y)) return null;
        const row = this.grid[y];
        if (!row) return null;
        return row[x];
    },

    /**
     * Place a cell on the grid
     */
    placeCell(x, y, tier, cellType = CONFIG.CELL_TYPES.SINGLE) {
        const cell = this.getCell(x, y);
        if (!cell) return false;
        if (cell.type) return false; // Already occupied

        const tierData = CONFIG.CELL_TIERS.find(t => t.id === tier);
        if (!tierData) return false;

        cell.type = cellType;
        cell.tier = tier;
        cell.active = true;

        Events.emit('cell-placed', { x, y, tier, cellType });
        return true;
    },

    /**
     * Remove cell from grid
     */
    removeCell(x, y) {
        const cell = this.getCell(x, y);
        if (!cell || !cell.type) return false;

        cell.type = null;
        cell.tier = null;
        cell.active = false;

        Events.emit('cell-removed', { x, y });
        return true;
    },

    /**
     * Get neighbors of a cell
     */
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // left, right, up, down
        ];

        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            if (this.isValid(nx, ny)) {
                const neighbor = this.getCell(nx, ny);
                if (neighbor.type) {
                    neighbors.push(neighbor);
                }
            }
        });

        return neighbors;
    },

    /**
     * Calculate pulses from a cell
     */
    getPulses(x, y) {
        const cell = this.getCell(x, y);
        if (!cell || !cell.type) return 0;

        const tierData = CONFIG.CELL_TIERS.find(t => t.id === cell.tier);
        if (!tierData) return 0;

        return tierData.pulses[cell.type] || 0;
    },

    /**
     * Calculate power output from a cell
     */
    calculateCellPower(x, y) {
        const cell = this.getCell(x, y);
        if (!cell || !cell.type) return 0;

        const tierData = CONFIG.CELL_TIERS.find(t => t.id === cell.tier);
        if (!tierData) return 0;

        const ownPulses = this.getPulses(x, y);
        const neighbors = this.getNeighbors(x, y);
        const neighborPulses = neighbors.reduce((sum, n) => {
            const nx = n.x, ny = n.y;
            return sum + this.getPulses(nx, ny);
        }, 0);

        const totalPulses = ownPulses + neighborPulses;
        return tierData.basePower * totalPulses;
    },

    /**
     * Calculate heat output from a cell
     */
    calculateCellHeat(x, y) {
        const cell = this.getCell(x, y);
        if (!cell || !cell.type) return 0;

        const tierData = CONFIG.CELL_TIERS.find(t => t.id === cell.tier);
        if (!tierData) return 0;

        const ownPulses = this.getPulses(x, y);
        const neighbors = this.getNeighbors(x, y);
        const neighborPulses = neighbors.reduce((sum, n) => {
            const nx = n.x, ny = n.y;
            return sum + this.getPulses(nx, ny);
        }, 0);

        const totalPulses = ownPulses + neighborPulses;
        // Heat is exponential: baseHeat * 2^totalPulses
        return tierData.baseHeat * Math.pow(2, totalPulses);
    },

    /**
     * Calculate total reactor output
     */
    calculateTotalOutput() {
        let totalPower = 0;
        let totalHeat = 0;

        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const cell = this.getCell(x, y);
                if (cell && cell.type) {
                    totalPower += this.calculateCellPower(x, y);
                    totalHeat += this.calculateCellHeat(x, y);
                }
            }
        }

        return { power: totalPower, heat: totalHeat };
    },

    /**
     * Get all cells
     */
    getAllCells() {
        const cells = [];
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const cell = this.getCell(x, y);
                if (cell && cell.type) {
                    cells.push({
                        ...cell,
                        power: this.calculateCellPower(x, y),
                        heat: this.calculateCellHeat(x, y)
                    });
                }
            }
        }
        return cells;
    },

    /**
     * Get state for saving
     */
    getState() {
        return {
            grid: JSON.parse(JSON.stringify(this.grid))
        };
    },

    /**
     * Restore state from save
     */
    setState(state) {
        if (!state || !state.grid) return;
        this.grid = JSON.parse(JSON.stringify(state.grid));
        // Backfill any missing cells/rows from older saves
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            if (!this.grid[y]) this.grid[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                if (!this.grid[y][x]) {
                    this.grid[y][x] = { x, y, type: null, tier: null, active: false };
                }
            }
        }
    },

    /**
     * Reset grid
     */
    reset() {
        this.init();
        Events.emit('grid-reset');
    }
};
