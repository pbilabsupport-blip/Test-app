// This acts as the master switchboard for P.B.I. Labs.
// It allows different parts of the app to send messages to each other without getting tangled up.

class CommunicationHub {
  constructor() {
    this.events = {};
  }

  // A component can "subscribe" to a channel to listen for instructions
  subscribe(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // Another component can "publish" a message to that channel
  publish(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        callback(data);
      });
    }
  }
}

// We export a single master version of this switchboard for the whole app to share
const masterHub = new CommunicationHub();
export default masterHub;