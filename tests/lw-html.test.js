const { LWHTML } = require('../src/components/lw-html.js');

describe('LWHTML', () => {
  let element;
  
  beforeEach(() => {
    element = document.createElement('lw-html');
    document.body.appendChild(element);
  });
  
  afterEach(() => {
    document.body.removeChild(element);
  });
  
  it('should create element with correct tag name', () => {
    expect(element.tagName.toLowerCase()).toBe('lw-html');
  });
  
  it('should extend LWBase', () => {
    expect(element).toBeInstanceOf(LWHTML);
  });
  
  it('should sanitize HTML content', () => {
    const dangerousHTML = '<script>alert("xss")</script><p>Safe content</p>';
    const sanitized = element.sanitize(dangerousHTML);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<p>Safe content</p>');
  });
  
  it('should remove event handlers', () => {
    const htmlWithEvents = '<div onclick="alert(1)" onmouseover="alert(2)">Content</div>';
    const sanitized = element.sanitize(htmlWithEvents);
    
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('onmouseover');
    expect(sanitized).toContain('Content');
  });
  
  it('should remove iframe elements', () => {
    const htmlWithIframe = '<iframe src="malicious.com"></iframe><p>Content</p>';
    const sanitized = element.sanitize(htmlWithIframe);
    
    expect(sanitized).not.toContain('<iframe');
    expect(sanitized).toContain('<p>Content</p>');
  });
  
  it('should handle null/undefined HTML', () => {
    expect(element.sanitize(null)).toBe('');
    expect(element.sanitize(undefined)).toBe('');
  });
  
  it('should preserve safe HTML', () => {
    const safeHTML = '<div><h1>Title</h1><p>Paragraph</p></div>';
    const sanitized = element.sanitize(safeHTML);
    
    expect(sanitized).toBe(safeHTML);
  });
});
