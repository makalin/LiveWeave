export class LWForm extends HTMLFormElement {
  connectedCallback() {
    if (this.getAttribute('live') != null) {
      const mode = this.getAttribute('on') || 'submit';
      this.addEventListener(mode, this.handleSubmit.bind(this));
    }
  }
  
  handleSubmit(event) {
    if (event.type !== 'submit' || this.getAttribute('live') != null) {
      event.preventDefault();
    }
    
    const formData = new FormData(this);
    const body = Object.fromEntries(formData.entries());
    
    fetch(this.action || this.getAttribute('action'), {
      method: (this.method || this.getAttribute('method') || 'POST').toUpperCase(),
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).catch(() => {
      // Silent fail for now
    });
  }
}

export default LWForm;
