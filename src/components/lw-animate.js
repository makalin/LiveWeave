import { LWBase } from './lw-base.js';

export class LWAnimate extends LWBase {
  constructor() {
    super();
    this._animations = new Map();
    this._defaultDuration = 300;
  }
  
  async mount() {
    const src = this.getAttribute('src');
    const sel = this.getAttribute('select');
    const animation = this.getAttribute('animation') || 'fade';
    const duration = parseInt(this.getAttribute('duration')) || this._defaultDuration;
    
    if (!src) {
      this.innerHTML = '';
      return;
    }
    
    try {
      this.setLoading(true);
      
      for await (const data of await this.getStreamData()) {
        const value = sel ? this.getNestedValue(data, sel) : data;
        await this.animateContent(value, animation, duration);
        
        if (this.hasAttribute('once')) break;
      }
    } catch (error) {
      this.setError(error);
    }
  }
  
  async animateContent(content, animationType, duration) {
    const oldContent = this.innerHTML;
    const newContent = this.sanitize(content ?? '');
    
    if (oldContent === newContent) return;
    
    // Store animation for cleanup
    const animationId = `lw-animate-${Date.now()}`;
    
    switch (animationType) {
      case 'fade':
        await this.fadeTransition(oldContent, newContent, duration);
        break;
      case 'slide':
        await this.slideTransition(oldContent, newContent, duration);
        break;
      case 'scale':
        await this.scaleTransition(oldContent, newContent, duration);
        break;
      case 'flip':
        await this.flipTransition(oldContent, newContent, duration);
        break;
      case 'typewriter':
        await this.typewriterTransition(newContent, duration);
        break;
      default:
        this.innerHTML = newContent;
    }
    
    this._animations.set(animationId, { type: animationType, duration });
  }
  
  async fadeTransition(oldContent, newContent, duration) {
    this.style.transition = `opacity ${duration}ms ease-in-out`;
    this.style.opacity = '0';
    
    await this.wait(duration / 2);
    this.innerHTML = newContent;
    this.style.opacity = '1';
    
    await this.wait(duration / 2);
    this.style.transition = '';
    this.style.opacity = '';
  }
  
  async slideTransition(oldContent, newContent, duration) {
    const oldHeight = this.offsetHeight;
    this.style.overflow = 'hidden';
    this.style.transition = `height ${duration}ms ease-in-out`;
    this.style.height = '0';
    
    await this.wait(duration);
    this.innerHTML = newContent;
    this.style.height = '';
    this.style.transition = '';
    this.style.overflow = '';
  }
  
  async scaleTransition(oldContent, newContent, duration) {
    this.style.transition = `transform ${duration}ms ease-in-out`;
    this.style.transform = 'scale(0.8)';
    this.style.opacity = '0';
    
    await this.wait(duration / 2);
    this.innerHTML = newContent;
    this.style.transform = 'scale(1)';
    this.style.opacity = '1';
    
    await this.wait(duration / 2);
    this.style.transition = '';
    this.style.transform = '';
    this.style.opacity = '';
  }
  
  async flipTransition(oldContent, newContent, duration) {
    this.style.transition = `transform ${duration}ms ease-in-out`;
    this.style.transform = 'rotateX(90deg)';
    
    await this.wait(duration / 2);
    this.innerHTML = newContent;
    this.style.transform = 'rotateX(0deg)';
    
    await this.wait(duration / 2);
    this.style.transition = '';
    this.style.transform = '';
  }
  
  async typewriterTransition(content, duration) {
    this.innerHTML = '';
    const chars = content.split('');
    const delay = duration / chars.length;
    
    for (let i = 0; i < chars.length; i++) {
      this.innerHTML += chars[i];
      await this.wait(delay);
    }
  }
  
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  sanitize(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html);
    
    template.content.querySelectorAll('script, iframe, object, embed, link').forEach(node => {
      node.remove();
    });
    
    template.content.querySelectorAll('*').forEach(element => {
      [...element.attributes].forEach(attr => {
        if (/^on/i.test(attr.name)) {
          element.removeAttribute(attr.name);
        }
      });
    });
    
    return template.innerHTML;
  }
  
  // Public API for manual animations
  animate(animationType, duration = this._defaultDuration) {
    const content = this.innerHTML;
    return this.animateContent(content, animationType, duration);
  }
  
  // Chain multiple animations
  chain(...animations) {
    return animations.reduce(async (promise, [type, duration]) => {
      await promise;
      return this.animate(type, duration);
    }, Promise.resolve());
  }
}

export default LWAnimate;
