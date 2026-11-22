// Master switchboard for P.B.I. Labs.
// Allows components to communicate cleanly without getting tangled up.

class CommunicationHub {
  constructor() {
    this.events = {};
  }

  // Subscribe to a channel and return an unsubscribe cleanup function
  subscribe(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return () => this.unsubscribe(eventName, callback);
  }

  unsubscribe(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
  }

  publish(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) => {
        callback(data);
      });
    }
  }
}

const masterHub = new CommunicationHub();
export default masterHub;