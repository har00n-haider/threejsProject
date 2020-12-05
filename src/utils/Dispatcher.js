class Dispatcher {
    constructor() {
        this.events = {};
    }

    dispatch(eventName, data) {
        const event = this.events[eventName];
        if (event) {
            event.fire(data);
        }
    }

    on(eventName, callback) {
        let event = this.events[eventName];
        if (!event) {
            event = new DispatcherEvent(eventName);
            this.events[eventName] = event;
        }
        event.registerCallback(callback);
    }

    off(eventName, callback) {
        const event = this.events[eventName];
        if (event && event.callbacks.indexOf(callback) > -1) {
            event.unregisterCallback(callback);
            if (event.callbacks.length === 0) {
                delete this.events[eventName];
            }
        }
    }
}

class DispatcherEvent {
    constructor(eventName) {
        this.eventName = eventName;
        this.callbacks = [];
    }

    /**
     * Register a function to be called,
     * when event occurs
     * @param {} callback 
     */
    regCb(callback) {
        this.callbacks.push(callback);
    }

    /**
     * Deregister a callback function
     * @param {} callback 
     */
    deRedCb(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    fire(data) {
        // We loop over a cloned version of the callbacks array
        // in case the original array is spliced while looping
        const callbacks = this.callbacks.slice(0);
        callbacks.forEach((callback) => {
            callback(data);
        });
    }
}

export default DispatcherEvent ;
