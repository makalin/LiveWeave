import { LWText } from './components/lw-text.js';
import { LWHTML } from './components/lw-html.js';
import { LWFor } from './components/lw-for.js';
import { LWIf } from './components/lw-if.js';
import { LWTime } from './components/lw-time.js';
import { LWOn } from './components/lw-on.js';
import { LWForm } from './components/lw-form.js';
import { LWAnimate } from './components/lw-animate.js';
import { LWTransform } from './components/lw-transform.js';
import { LWChart } from './components/lw-chart.js';
import { LWValidate } from './components/lw-validate.js';
import { setupSignals } from './utils/signals.js';

const __LW_VERSION__ = '0.1.0';

class LiveWeave {
  constructor() {
    this.version = __LW_VERSION__;
    this.components = {
      LWText,
      LWHTML,
      LWFor,
      LWIf,
      LWTime,
      LWOn,
      LWForm,
      LWAnimate,
      LWTransform,
      LWChart,
      LWValidate
    };
    
    // Initialize signals system
    setupSignals();
    
    // Register all components
    this.registerComponents();
    
    console.debug('[LiveWeave]', this.version);
  }
  
  registerComponents() {
    customElements.define('lw-text', LWText);
    customElements.define('lw-html', LWHTML);
    customElements.define('lw-for', LWFor);
    customElements.define('lw-if', LWIf);
    customElements.define('lw-time', LWTime);
    customElements.define('lw-on', LWOn);
    customElements.define('lw-form', LWForm, { extends: 'form' });
    customElements.define('lw-animate', LWAnimate);
    customElements.define('lw-transform', LWTransform);
    customElements.define('lw-chart', LWChart);
    customElements.define('lw-validate', LWValidate);
  }
  
  // Utility method to send signals
  signal(name, op, value) {
    dispatchEvent(new CustomEvent('lw:signal', {
      detail: { name, op, value }
    }));
  }
  
  // Get component instance by name
  getComponent(name) {
    return this.components[name] || null;
  }
  
  // Check if component is registered
  isRegistered(name) {
    return customElements.get(name) !== undefined;
  }
  
  // Get all registered component names
  getRegisteredComponents() {
    return Array.from(customElements.keys()).filter(name => name.startsWith('lw-'));
  }
  
  // Get component statistics
  getComponentStats() {
    const stats = {};
    for (const [name, component] of Object.entries(this.components)) {
      stats[name] = {
        registered: this.isRegistered(name.toLowerCase().replace('LW', 'lw-')),
        hasMount: typeof component.prototype.mount === 'function',
        hasUnmount: typeof component.prototype.unmount === 'function'
      };
    }
    return stats;
  }
}

// Auto-initialize when imported
const liveweave = new LiveWeave();

// Export both the class and instance
export default LiveWeave;
export { liveweave };

// Also export the instance as default for backward compatibility
export { liveweave as default };
