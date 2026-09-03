/* Math Utilities */
const MathUtils = {
    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Calculate percentage
     */
    percentage(value, total) {
        return (value / total) * 100;
    },

    /**
     * Apply multiplier to value
     */
    applyMultiplier(value, multiplier) {
        return value * multiplier;
    },

    /**
     * Calculate exponential growth cost
     */
    calculateCost(baseCost, multiplier, level) {
        return baseCost * Math.pow(multiplier, level);
    },

    /**
     * Get random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

Object.freeze(MathUtils);
