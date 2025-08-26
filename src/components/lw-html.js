import { LWBase } from './lw-base.js';

export class LWHTML extends LWBase {
  async mount() {
    const src = this.getAttribute('src');
    const sel = this.getAttribute('select');
    
    if (!src) {
      this.innerHTML = '';
      return;
    }
    
    try {
      this.setLoading(true);
      
      for await (const data of await this.getStreamData()) {
        const value = sel ? this.getNestedValue(data, sel) : data;
        this.innerHTML = this.sanitize(value ?? '');
        if (this.hasAttribute('once')) break;
      }
    } catch (error) {
      this.setError(error);
    }
  }
  
  sanitize(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html);
    
    // Remove potentially dangerous elements
    template.content.querySelectorAll('script, iframe, object, embed, link').forEach(node => {
      node.remove();
    });
    
    // Remove event handlers
    template.content.querySelectorAll('*').forEach(element => {
      [...element.attributes].forEach(attr => {
        if (/^on/i.test(attr.name)) {
          element.removeAttribute(attr.name);
        }
      });
    });
    
    return template.innerHTML;
  }
}

export default LWHTML;
