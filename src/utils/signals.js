const signals = new Map();
let broadcastChannel = null;

// Initialize BroadcastChannel for cross-tab communication
if ('BroadcastChannel' in self) {
  broadcastChannel = new BroadcastChannel('liveweave');
  broadcastChannel.onmessage = (event) => {
    dispatchEvent(new CustomEvent('lw:signal', { detail: event.data }));
  });
}

// Global signal function for easy access
window.lwSignal = (name, op, value) => {
  dispatchEvent(new CustomEvent('lw:signal', { detail: { name, op, value } }));
};

// Make signals available globally for components
window.liveweaveSignals = signals;

export function setupSignals() {
  // Listen for signal events
  addEventListener('lw:signal', (event) => {
    const { name, op, value } = event.detail || {};
    if (!name) return;
    
    let current = signals.get(name) || {};
    
    switch (op) {
      case 'set':
        current = value;
        break;
      case 'merge':
        current = { ...current, ...value };
        break;
      case 'clear':
        current = {};
        break;
      default:
        return;
    }
    
    signals.set(name, current);
    
    // Update all components listening to this signal
    document.querySelectorAll(`lw-on[name="${name}"]`).forEach(element => {
      if (element.render) {
        element.render();
      }
    });
    
    // Broadcast to other tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({ name, op, value });
    }
  });
}

export function getSignal(name) {
  return signals.get(name);
}

export function setSignal(name, value) {
  window.lwSignal(name, 'set', value);
}

export function mergeSignal(name, value) {
  window.lwSignal(name, 'merge', value);
}

export function clearSignal(name) {
  window.lwSignal(name, 'clear');
}
