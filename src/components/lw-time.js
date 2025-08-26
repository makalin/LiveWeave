import { LWBase } from './lw-base.js';

export class LWTime extends LWBase {
  constructor() {
    super();
    this._interval = null;
  }
  
  connectedCallback() {
    super.connectedCallback();
    this.renderTime();
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
  
  renderTime() {
    const value = this.getAttribute('value');
    const format = (this.getAttribute('format') || 'relative').toLowerCase();
    const date = value ? new Date(value) : new Date();
    
    if (format === 'relative' || format === 'ago') {
      this.updateRelativeTime(date, format);
    } else {
      this.updateFormattedTime(date);
    }
  }
  
  updateRelativeTime(date, format) {
    const update = () => {
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      let value;
      
      if (seconds < 60) {
        value = `${seconds}s`;
      } else if (seconds < 3600) {
        value = `${Math.floor(seconds / 60)}m`;
      } else if (seconds < 86400) {
        value = `${Math.floor(seconds / 3600)}h`;
      } else {
        value = `${Math.floor(seconds / 86400)}d`;
      }
      
      this.textContent = format === 'ago' ? `${value} ago` : value;
    };
    
    update();
    this._interval = setInterval(update, 1000);
  }
  
  updateFormattedTime(date) {
    try {
      this.textContent = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      this.textContent = date.toLocaleString();
    }
  }
}

export default LWTime;
