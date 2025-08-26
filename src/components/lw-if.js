import { LWBase } from './lw-base.js';

export class LWIf extends LWBase {
  async mount() {
    const src = this.getAttribute('src');
    const test = this.getAttribute('test') || 'true';
    const content = this.innerHTML;
    this._saved = content;
    
    if (!src) {
      this.innerHTML = '';
      return;
    }
    
    try {
      for await (const data of await this.getStreamData()) {
        const keys = Object.keys(data || {});
        const values = Object.values(data || {});
        let result = false;
        
        try {
          result = Function(...keys, `return !!(${test});`)(...values);
        } catch {
          result = false;
        }
        
        this.innerHTML = result ? this._saved : '';
        
        if (this.hasAttribute('once')) break;
      }
    } catch (error) {
      this.setError(error);
    }
  }
}

export default LWIf;
