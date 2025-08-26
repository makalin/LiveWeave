import { LWBase } from './lw-base.js';

export class LWText extends LWBase {
  async mount() {
    const src = this.getAttribute('src');
    const sel = this.getAttribute('select');
    
    if (!src) {
      this.textContent = '';
      return;
    }
    
    try {
      this.setLoading(true);
      
      for await (const data of await this.getStreamData()) {
        const value = sel ? this.selectValue(data, sel) : data;
        if (value != null) {
          this.textContent = String(value);
        }
        if (this.hasAttribute('once')) break;
      }
    } catch (error) {
      this.setError(error);
    }
  }
  
  selectValue(data, selector) {
    return selector.split('.').reduce((obj, key) => obj?.[key], data);
  }
}

export default LWText;
