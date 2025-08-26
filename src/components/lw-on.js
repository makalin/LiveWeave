import { LWBase } from './lw-base.js';

export class LWOn extends LWBase {
  connectedCallback() {
    super.connectedCallback();
    this.render();
  }
  
  render() {
    const name = this.getAttribute('name');
    if (!name) return;
    
    const data = this.getSignalData(name);
    const template = this.innerHTML;
    
    this.innerHTML = template.replace(
      /\{\{\s*\$signal(?:\.(.+?))?\s*\}\}/g,
      (match, path) => {
        if (path) {
          return this.getNestedValue({ $signal: data }, `$signal.${path}`) ?? '';
        }
        return JSON.stringify({ $signal: data }, null, 2);
      }
    );
  }
  
  getSignalData(name) {
    // This will be populated by the signals system
    return window.liveweaveSignals?.get(name) || {};
  }
}

export default LWOn;
