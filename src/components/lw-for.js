import { LWBase } from './lw-base.js';

export class LWFor extends LWBase {
  async mount() {
    const src = this.getAttribute('src');
    const sel = this.getAttribute('select');
    const as = this.getAttribute('as') || 'item';
    const template = this.innerHTML;
    
    if (!src) {
      this.innerHTML = '';
      return;
    }
    
    try {
      this.setLoading(true);
      
      for await (const data of await this.getStreamData()) {
        const array = sel ? this.getNestedValue(data, sel) : data;
        
        if (!Array.isArray(array)) {
          this.innerHTML = '';
          continue;
        }
        
        this.innerHTML = array.map((item, index) => 
          this.renderTemplate(template, item, as, index)
        ).join('');
        
        if (this.hasAttribute('once')) break;
      }
    } catch (error) {
      this.setError(error);
    }
  }
  
  renderTemplate(template, item, as, index) {
    return template
      .replaceAll(`{{${as}.`, '{{__dot__.')
      .replace(/\{\{__dot__\.(.+?)\}\}/g, (_, path) => 
        this.getNestedValue(item, path) ?? ''
      )
      .replaceAll('{{i}}', index);
  }
}

export default LWFor;
