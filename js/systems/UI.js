/* UI System */
const UI = {
    lastUpdateTime: Date.now(),
    selectedTier: 'uranium',
    selectedType: CONFIG.CELL_TYPES.SINGLE,

    /**
     * Initialize UI
     */
    init() {
        this.setupEventListeners();
        this.render();
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Grid canvas interactions (attach once)
        const canvas = document.getElementById('reactor-grid');
        if (canvas) {
            canvas.addEventListener('click', (e) => this.handleGridClick(e, false));
            canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleGridClick(e, true);
            });
        }

        // Cash click button
        const cashBtn = document.getElementById('btn-cash');
        if (cashBtn) {
            cashBtn.addEventListener('click', () => {
                Player.addCash(Player.cashPerClick);
                this.updateStats();
            });
        }

        // Heat dissipation button
        const coolBtn = document.getElementById('btn-cool');
        if (coolBtn) {
            coolBtn.addEventListener('click', () => {
                Player.dissipateHeat(Player.heatDissipationPerClick);
                this.updateStats();
            });
        }

        // Sell power button
        const sellBtn = document.getElementById('btn-sell-power');
        if (sellBtn) {
            sellBtn.addEventListener('click', () => {
                Player.sellPower(Player.power);
                this.render();
            });
        }

        // Tier selection
        document.getElementById('btn-buy-uranium')?.addEventListener('click', () => {
            this.selectedTier = 'uranium';
            this.updateBuildMenu();
        });
        document.getElementById('btn-buy-plutonium')?.addEventListener('click', () => {
            this.selectedTier = 'plutonium';
            this.updateBuildMenu();
        });
        document.getElementById('btn-buy-thorium')?.addEventListener('click', () => {
            this.selectedTier = 'thorium';
            this.updateBuildMenu();
        });

        // Type selection
        document.getElementById('btn-type-single')?.addEventListener('click', () => {
            this.selectedType = CONFIG.CELL_TYPES.SINGLE;
            this.updateBuildMenu();
        });
        document.getElementById('btn-type-double')?.addEventListener('click', () => {
            this.selectedType = CONFIG.CELL_TYPES.DOUBLE;
            this.updateBuildMenu();
        });
        document.getElementById('btn-type-quad')?.addEventListener('click', () => {
            this.selectedType = CONFIG.CELL_TYPES.QUAD;
            this.updateBuildMenu();
        });

        // Building cost buttons
        document.getElementById('btn-buy-capacitor')?.addEventListener('click', () => {
            Player.buyCapacitor();
            this.render();
        });
        document.getElementById('btn-buy-plating')?.addEventListener('click', () => {
            Player.buyPlating();
            this.render();
        });
        document.getElementById('btn-buy-vent')?.addEventListener('click', () => {
            Player.buyVent();
            this.render();
        });

        // Save/Load/Reset
        document.getElementById('btn-save')?.addEventListener('click', () => Game.save());
        document.getElementById('btn-load')?.addEventListener('click', () => Game.load());
        document.getElementById('btn-reset')?.addEventListener('click', () => {
            if (confirm('Reset game? This cannot be undone.')) Game.reset();
        });

        // Grid events
        Events.on('cash-changed', () => this.updateStats());
        Events.on('power-changed', () => this.updateStats());
        Events.on('heat-changed', () => this.updateStats());
        Events.on('reactor-meltdown', () => this.showMeltdown());
        Events.on('grid-reset', () => this.render());
        Events.on('player-reset', () => this.render());
    },

    /**
     * Full render
     */
    render() {
        this.renderGrid();
        this.updateStats();
        this.updateBuildMenu();
    },

    /**
     * Render the reactor grid
     */
    renderGrid() {
        const canvas = document.getElementById('reactor-grid');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const cellSize = (canvas.width / CONFIG.GRID_WIDTH);

        // Clear canvas
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = '#161620';
        ctx.lineWidth = 1;
        for (let x = 0; x <= CONFIG.GRID_WIDTH; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= CONFIG.GRID_HEIGHT; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(canvas.width, y * cellSize);
            ctx.stroke();
        }

        // Draw cells
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const cell = ReactorGrid.getCell(x, y);
                if (cell && cell.type) {
                    this.drawCell(ctx, x, y, cell, cellSize);
                }
            }
        }
    },

    /**
     * Draw a cell on canvas
     */
    drawCell(ctx, x, y, cell, cellSize) {
        const tierData = CONFIG.CELL_TIERS.find(t => t.id === cell.tier);
        if (!tierData) return;

        const px = x * cellSize;
        const py = y * cellSize;
        const colors = {
            uranium: '#4a9d6f',
            plutonium: '#cc5555',
            thorium: '#8b7000'
        };

        ctx.fillStyle = colors[cell.tier] || '#ffffff';
        ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);

        // Draw type indicator
        ctx.fillStyle = '#c0c0c0';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(cell.type[0].toUpperCase(), px + cellSize / 2, py + 4);
        
        // Draw tier indicator
        ctx.font = 'bold 14px Arial';
        ctx.textBaseline = 'middle';
        ctx.fillText(tierData.tier, px + cellSize / 2, py + cellSize / 2 + 4);
    },

    /**
     * Handle grid click/right-click
     */
    handleGridClick(e, isRightClick) {
        const canvas = document.getElementById('reactor-grid');
        if (!canvas) return;

        const cellSize = canvas.width / CONFIG.GRID_WIDTH;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);

        if (ReactorGrid.isValid(x, y)) {
            const cell = ReactorGrid.getCell(x, y);
            if (!cell) return;

            if (isRightClick) {
                // Right-click: remove cell
                if (cell.type) {
                    ReactorGrid.removeCell(x, y);
                    this.render();
                }
            } else {
                // Left-click: place cell
                if (cell.type) {
                    // Already occupied
                    Save.showSaveStatus('Cell already placed!', 'error');
                } else {
                    const tierData = CONFIG.CELL_TIERS.find(t => t.id === this.selectedTier);
                    if (!tierData) return;
                    
                    const cost = tierData.costs[this.selectedType];
                    
                    if (Player.spendCash(cost)) {
                        ReactorGrid.placeCell(x, y, this.selectedTier, this.selectedType);
                        this.render();
                    } else {
                        Save.showSaveStatus('Not enough cash!', 'error');
                    }
                }
            }
        }
    },

    /**
     * Update statistics display
     */
    updateStats() {
        const cash = Player.cash;
        const power = Player.power;
        const heat = Player.heat;
        const output = Reactor.getOutput();
        const maxPower = Player.maxPower || 1;
        const maxHeat = Player.maxHeat || 1;
        const heatPercent = (heat / maxHeat) * 100;

        const statCash = document.getElementById('stat-cash');
        if (statCash) statCash.textContent = Format.formatCash(cash);
        const statPower = document.getElementById('stat-power');
        if (statPower) statPower.textContent = Format.formatPower(power);
        const statPowerMax = document.getElementById('stat-power-max');
        if (statPowerMax) statPowerMax.textContent = Format.formatPower(maxPower);
        const statHeat = document.getElementById('stat-heat');
        if (statHeat) statHeat.textContent = Format.formatHeat(heat);
        const statHeatMax = document.getElementById('stat-heat-max');
        if (statHeatMax) statHeatMax.textContent = Format.formatHeat(maxHeat);
        const statHeatPercent = document.getElementById('stat-heat-percent');
        if (statHeatPercent) statHeatPercent.textContent = Format.formatPercent(heatPercent);

        const statPowerGen = document.getElementById('stat-power-gen');
        if (statPowerGen) statPowerGen.textContent = Format.formatPower(output.power);
        const statHeatGen = document.getElementById('stat-heat-gen');
        if (statHeatGen) statHeatGen.textContent = Format.formatHeat(output.heat);

        // Update bars
        const powerBar = document.getElementById('power-bar');
        if (powerBar) {
            powerBar.style.width = (power / maxPower * 100) + '%';
        }

        const heatBar = document.getElementById('heat-bar');
        if (heatBar) {
            heatBar.style.width = heatPercent + '%';
            // Color based on heat
            if (heatPercent > 75) {
                heatBar.style.backgroundColor = '#8b3333';
            } else if (heatPercent > 50) {
                heatBar.style.backgroundColor = '#8b7000';
            } else {
                heatBar.style.backgroundColor = '#2d7d4d';
            }
        }
    },

    /**
     * Update build menu
     */
    updateBuildMenu() {
        // Update tier buttons
        ['uranium', 'plutonium', 'thorium'].forEach(tier => {
            const btn = document.getElementById(`btn-buy-${tier}`);
            if (btn) {
                const tierData = CONFIG.CELL_TIERS.find(t => t.id === tier);
                const cost = tierData.costs[this.selectedType];
                btn.textContent = `${tierData.name} - ${Format.formatCash(cost)}`;
                btn.classList.toggle('selected', this.selectedTier === tier);
            }
        });

        // Update type buttons
        ['single', 'double', 'quad'].forEach(type => {
            const btn = document.getElementById(`btn-type-${type}`);
            if (btn) {
                btn.classList.toggle('selected', this.selectedType === type);
            }
        });

        // Update building costs
        const capacitorBtn = document.getElementById('btn-buy-capacitor');
        if (capacitorBtn) {
            capacitorBtn.textContent = `Capacitor - ${Format.formatCash(CONFIG.CAPACITOR_COST)} (${Player.capacitors})`;
        }
        const platingBtn = document.getElementById('btn-buy-plating');
        if (platingBtn) {
            platingBtn.textContent = `Plating - ${Format.formatCash(CONFIG.PLATING_COST)} (${Player.reactorPlating})`;
        }
        const ventBtn = document.getElementById('btn-buy-vent');
        if (ventBtn) {
            ventBtn.textContent = `Vent - ${Format.formatCash(CONFIG.VENT_COST)} (${Player.vents})`;
        }
    },

    /**
     * Show meltdown warning
     */
    showMeltdown() {
        Save.showSaveStatus('REACTOR MELTDOWN!', 'error');
    }
};

