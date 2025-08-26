const { LWText } = require('../src/components/lw-text.js');

describe('LWText', () => {
  let element;
  
  beforeEach(() => {
    element = document.createElement('lw-text');
    document.body.appendChild(element);
  });
  
  afterEach(() => {
    document.body.removeChild(element);
  });
  
  it('should create element with correct tag name', () => {
    expect(element.tagName.toLowerCase()).toBe('lw-text');
  });
  
  it('should extend LWBase', () => {
    expect(element).toBeInstanceOf(LWText);
  });
  
  it('should have default attributes', () => {
    expect(element.opts.type).toBe('json');
    expect(element.opts.poll).toBe('');
    expect(element.opts.credentials).toBe('omit');
  });
  
  it('should set loading state', () => {
    element.setAttribute('loading', 'Loading...');
    element.setLoading(true);
    expect(element.textContent).toBe('Loading...');
  });
  
  it('should set error state', () => {
    element.setAttribute('error', 'Something went wrong');
    element.setError(new Error('Test error'));
    expect(element.textContent).toBe('Something went wrong');
  });
  
  it('should handle missing src attribute', async () => {
    await element.mount();
    expect(element.textContent).toBe('');
  });
  
  it('should select nested values correctly', () => {
    const data = { user: { name: 'John', age: 30 } };
    const result = element.selectValue(data, 'user.name');
    expect(result).toBe('John');
  });
  
  it('should handle undefined selectors', () => {
    const data = { message: 'Hello' };
    const result = element.selectValue(data, undefined);
    expect(result).toBe(data);
  });
});
