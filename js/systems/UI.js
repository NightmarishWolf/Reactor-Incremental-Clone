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

        // Building buttons
        document.getElementById('btn-buy-uranium')?.addEventListener('click', () => this.selectedTier = 'uranium');
        document.getElementById('btn-buy-plutonium')?.addEventListener('click', () => this.selectedTier = 'plutonium');
        document.getElementById('btn-buy-thorium')?.addEventListener('click', () => this.selectedTier = 'thorium');

        document.getElementById('btn-type-single')?.addEventListener('click', () => this.selectedType = CONFIG.CELL_TYPES.SINGLE);
        document.getElementById('btn-type-double')?.addEventListener('click', () => this.selectedType = CONFIG.CELL_TYPES.DOUBLE);
        document.getElementById('btn-type-quad')?.addEventListener('click', () => this.selectedType = CONFIG.CELL_TYPES.QUAD);

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
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = '#2d3561';
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

        // Add click handler
        canvas.addEventListener('click', (e) => this.handleGridClick(e, canvas, cellSize));
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
            uranium: '#51cf66',
            plutonium: '#ff6b6b',
            thorium: '#ffd93d'
        };

        ctx.fillStyle = colors[cell.tier] || '#ffffff';
        ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);

        // Draw tier indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tierData.tier, px + cellSize / 2, py + cellSize / 2);
    },

    /**
     * Handle grid click
     */
    handleGridClick(e, canvas, cellSize) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);

        if (ReactorGrid.isValid(x, y)) {
            const cell = ReactorGrid.getCell(x, y);
            if (cell.type) {
                // Remove cell
                ReactorGrid.removeCell(x, y);
            } else {
                // Place cell
                const tierData = CONFIG.CELL_TIERS.find(t => t.id === this.selectedTier);
                if (tierData && Player.spendCash(tierData.cost)) {
                    ReactorGrid.placeCell(x, y, this.selectedTier, this.selectedType);
                } else {
                    Save.showSaveStatus('Not enough cash!', 'error');
                }
            }
            this.render();
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

        document.getElementById('stat-cash').textContent = Format.formatCash(cash);
        document.getElementById('stat-power').textContent = Format.formatPower(power);
        document.getElementById('stat-power-max').textContent = Format.formatPower(Player.maxPower);
        document.getElementById('stat-heat').textContent = Format.formatHeat(heat);
        document.getElementById('stat-heat-max').textContent = Format.formatHeat(Player.maxHeat);
        document.getElementById('stat-heat-percent').textContent = Format.formatPercent(Player.getHeatPercent());

        document.getElementById('stat-power-gen').textContent = Format.formatPower(output.power);
        document.getElementById('stat-heat-gen').textContent = Format.formatHeat(output.heat);

        // Update bars
        const powerBar = document.getElementById('power-bar');
        if (powerBar) {
            powerBar.style.width = (power / Player.maxPower * 100) + '%';
        }

        const heatBar = document.getElementById('heat-bar');
        if (heatBar) {
            heatBar.style.width = Player.getHeatPercent() + '%';
            // Color based on heat
            if (Player.getHeatPercent() > 75) {
                heatBar.style.backgroundColor = '#ff6b6b';
            } else if (Player.getHeatPercent() > 50) {
                heatBar.style.backgroundColor = '#ffd93d';
            } else {
                heatBar.style.backgroundColor = '#51cf66';
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
                btn.textContent = `${tierData.name} - ${Format.formatCash(tierData.cost)}`;
                btn.classList.toggle('selected', this.selectedTier === tier);
            }
        });

        // Update building costs
        document.getElementById('btn-buy-capacitor').textContent = `Capacitor - ${Format.formatCash(CONFIG.CAPACITOR_COST)} (${Player.capacitors})`;
        document.getElementById('btn-buy-plating').textContent = `Plating - ${Format.formatCash(CONFIG.PLATING_COST)} (${Player.reactorPlating})`;
        document.getElementById('btn-buy-vent').textContent = `Vent - ${Format.formatCash(CONFIG.VENT_COST)} (${Player.vents})`;
    },

    /**
     * Show meltdown warning
     */
    showMeltdown() {
        Save.showSaveStatus('REACTOR MELTDOWN!', 'error');
    }
};

