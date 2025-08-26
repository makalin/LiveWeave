const { getNestedValue, parseMs, sleep, debounce, throttle } = require('../src/utils/helpers.js');

describe('Utility Functions', () => {
  describe('getNestedValue', () => {
    it('should get nested object values', () => {
      const obj = { user: { profile: { name: 'John' } } };
      const name = getNestedValue(obj, 'user.profile.name');
      expect(name).toBe('John');
    });
    
    it('should handle undefined paths', () => {
      const obj = { name: 'John' };
      const result = getNestedValue(obj, undefined);
      expect(result).toBe(obj);
    });
    
    it('should return undefined for non-existent paths', () => {
      const obj = { user: { name: 'John' } };
      const result = getNestedValue(obj, 'user.age');
      expect(result).toBeUndefined();
    });
    
    it('should handle null objects', () => {
      const result = getNestedValue(null, 'user.name');
      expect(result).toBeUndefined();
    });
  });
  
  describe('parseMs', () => {
    it('should parse milliseconds', () => {
      expect(parseMs('100ms')).toBe(100);
      expect(parseMs('500ms')).toBe(500);
    });
    
    it('should parse seconds', () => {
      expect(parseMs('5s')).toBe(5000);
      expect(parseMs('30s')).toBe(30000);
    });
    
    it('should parse minutes', () => {
      expect(parseMs('2m')).toBe(120000);
      expect(parseMs('10m')).toBe(600000);
    });
    
    it('should handle case insensitive units', () => {
      expect(parseMs('5S')).toBe(5000);
      expect(parseMs('2M')).toBe(120000);
    });
    
    it('should return 0 for invalid formats', () => {
      expect(parseMs('invalid')).toBe(0);
      expect(parseMs('5x')).toBe(0);
      expect(parseMs('')).toBe(0);
    });
    
    it('should handle null/undefined', () => {
      expect(parseMs(null)).toBe(0);
      expect(parseMs(undefined)).toBe(0);
    });
  });
  
  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(95);
    });
  });
  
  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => callCount++, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(callCount).toBe(0);
      
      await sleep(150);
      expect(callCount).toBe(1);
    });
  });
  
  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const throttledFn = throttle(() => callCount++, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(callCount).toBe(1);
      
      await sleep(150);
      throttledFn();
      expect(callCount).toBe(2);
    });
  });
});
