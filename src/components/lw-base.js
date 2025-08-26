import { getStreamJSON } from '../streams/index.js';

export class LWBase extends HTMLElement {
  constructor() {
    super();
    this._connected = false;
  }
  
  connectedCallback() {
    this._connected = true;
    if (this.mount) {
      this.mount();
    }
  }
  
  disconnectedCallback() {
    this._connected = false;
    if (this.unmount) {
      this.unmount();
    }
  }
  
  get opts() {
    return {
      type: (this.getAttribute('type') || 'json').toLowerCase(),
      poll: this.getAttribute('poll') || '',
      credentials: this.getAttribute('auth') || 'omit'
    };
  }
  
  setLoading(on) {
    if (this.hasAttribute('loading')) {
      const text = this.getAttribute('loading') || '…';
      if (on) {
        this.textContent = text;
      }
    }
  }
  
  setError(error) {
    const message = this.getAttribute('error') || ('⚠️ ' + (error?.message || error));
    this.textContent = message;
  }
  
  async getStreamData() {
    const src = this.getAttribute('src');
    return getStreamJSON(src, this.opts.type, this.opts);
  }
  
  // Utility method to safely get nested object properties
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  // Check if component is still connected
  get isConnected() {
    return this._connected;
  }
}
