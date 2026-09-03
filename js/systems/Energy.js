/* Energy System - handles passive energy ticks */
const Energy = {
    /**
     * Passive generation from reactor
     */
    update(deltaTime) {
        const output = ReactorGrid.calculateTotalOutput();
        Player.addPower(output.power * deltaTime);
        Player.addHeat(output.heat * deltaTime);
    }
};
