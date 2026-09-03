/* UI System */
const UI = {
    lastUpdateTime: Date.now(),

    /**
     * Initialize UI
     */
    init() {
        this.setupEventListeners();
        this.renderUpgrades();
        this.update();
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Main buttons
        const generateBtn = document.getElementById('btn-generate');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.onGenerateClick());
        }

        const saveBtn = document.getElementById('btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => Game.save());
        }

        const loadBtn = document.getElementById('btn-load');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => Game.load());
        }

        const resetBtn = document.getElementById('btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset game? This cannot be undone.')) {
                    Game.reset();
                }
            });
        }

        // Event listeners
        Events.on('energy-changed', () => this.updateStats());
        Events.on('upgrade-bought', () => {
            this.renderUpgrades();
            this.updateStats();
        });
        Events.on('reactor-clicked', () => this.updateReactorStatus());
        Events.on('player-reset', () => {
            this.renderUpgrades();
            this.updateStats();
            this.updateReactorStatus();
        });
    },

    /**
     * Handle generate button click
     */
    onGenerateClick() {
        const energy = Reactor.click();
        if (energy > 0) {
            Player.addEnergy(energy);
            this.updateReactorStatus();
            this.updateStats();
        }
    },

    /**
     * Render upgrade buttons
     */
    renderUpgrades() {
        const container = document.getElementById('upgrades-list');
        if (!container) return;

        container.innerHTML = '';

        CONFIG.UPGRADES.forEach(upgrade => {
            const level = Player.getUpgradeLevel(upgrade.id);
            const cost = Player.getUpgradeCost(upgrade.id);
            const canAfford = Player.getEnergy() >= cost;

            const upgradeEl = document.createElement('div');
            upgradeEl.className = 'upgrade-item';
            upgradeEl.innerHTML = `
                <div class="upgrade-info">
                    <h3>${upgrade.name}</h3>
                    <p class="upgrade-desc">${upgrade.description}</p>
                    <p class="upgrade-level">Level: ${level}</p>
                </div>
                <button 
                    class="btn btn-primary upgrade-btn"
                    ${!canAfford ? 'disabled' : ''}
                    data-upgrade-id="${upgrade.id}"
                >
                    Cost: ${Format.formatNumber(cost)}
                </button>
            `;

            const btn = upgradeEl.querySelector('.upgrade-btn');
            btn.addEventListener('click', () => {
                if (Player.buyUpgrade(upgrade.id)) {
                    this.renderUpgrades();
                    this.updateStats();
                }
            });

            container.appendChild(upgradeEl);
        });
    },

    /**
     * Update reactor status display
     */
    updateReactorStatus() {
        const status = Reactor.getStatus();
        
        const tempEl = document.getElementById('reactor-temp');
        if (tempEl) {
            tempEl.textContent = `Temperature: ${Format.formatTemp(status.temperature)}`;
        }

        const fuelEl = document.getElementById('reactor-fuel');
        if (fuelEl) {
            fuelEl.textContent = `Fuel: ${Format.formatPercent(status.fuelPercent)}`;
        }
    },

    /**
     * Update all stats displays
     */
    updateStats() {
        const energy = Player.getEnergy();
        const power = Player.getTotalPowerPerSecond();

        const energyEl = document.getElementById('stat-energy');
        if (energyEl) {
            energyEl.textContent = Format.formatNumber(energy);
        }

        const powerEl = document.getElementById('stat-power');
        if (powerEl) {
            powerEl.textContent = Format.formatPower(power);
        }

        const totalGenEl = document.getElementById('stat-total-generated');
        if (totalGenEl) {
            totalGenEl.textContent = `Total Generated: ${Format.formatNumber(Player.totalEnergyGenerated)}`;
        }

        const timeEl = document.getElementById('stat-time-played');
        if (timeEl) {
            timeEl.textContent = `Time Played: ${Format.formatTime(Player.timePlayed)}`;
        }

        const efficiencyEl = document.getElementById('stat-efficiency');
        if (efficiencyEl) {
            efficiencyEl.textContent = `Efficiency: ${Format.formatPercent(Player.efficiency * 100)}`;
        }
    },

    /**
     * Update UI (called each frame)
     */
    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;

        if (deltaTime >= 0.1) { // Update UI every 100ms
            this.updateStats();
            this.lastUpdateTime = now;
        }

        requestAnimationFrame(() => this.update());
    }
};
