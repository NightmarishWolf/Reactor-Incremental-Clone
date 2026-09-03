/* Formatting Utilities */
const Format = {
    /**
     * Format large numbers with suffixes (K, M, B, etc.)
     */
    formatNumber(num, decimals = CONFIG.DECIMAL_PLACES) {
        if (num < CONFIG.LARGE_NUMBER_THRESHOLD) {
            return num.toFixed(decimals).replace(/\.?0+$/, '');
        }

        const suffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
        let magnitude = 0;
        let scaled = num;

        while (scaled >= 1000 && magnitude < suffixes.length - 1) {
            scaled /= 1000;
            magnitude++;
        }

        return scaled.toFixed(decimals).replace(/\.?0+$/, '') + suffixes[magnitude];
    },

    /**
     * Format cash
     */
    formatCash(amount) {
        return '$' + this.formatNumber(amount);
    },

    /**
     * Format power
     */
    formatPower(power) {
        return this.formatNumber(power) + ' W';
    },

    /**
     * Format heat
     */
    formatHeat(heat) {
        return this.formatNumber(heat) + ' H';
    },

    /**
     * Format percentage
     */
    formatPercent(value, decimals = 1) {
        return value.toFixed(decimals) + '%';
    },

    /**
     * Format time in seconds
     */
    formatTime(seconds) {
        if (seconds < 60) {
            return Math.floor(seconds) + 's';
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return minutes + 'm ' + Math.floor(seconds % 60) + 's';
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours < 24) {
            return hours + 'h ' + remainingMinutes + 'm';
        }

        const days = Math.floor(hours / 24);
        return days + 'd ' + (hours % 24) + 'h';
    }
};

Object.freeze(Format);
