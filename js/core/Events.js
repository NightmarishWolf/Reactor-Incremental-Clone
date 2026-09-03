/* Event System */
const Events = {
    listeners: {},

    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    },

    /**
     * Emit an event
     */
    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    },

    /**
     * Clear all listeners for an event
     */
    clear(event) {
        if (event) {
            delete this.listeners[event];
        } else {
            this.listeners = {};
        }
    }
};

Object.freeze(Events);
