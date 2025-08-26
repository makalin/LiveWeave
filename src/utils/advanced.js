// Advanced utility functions for LiveWeave

// Data validation utilities
export class DataValidator {
  constructor() {
    this.rules = new Map();
    this.customValidators = new Map();
  }
  
  // Add validation rule
  addRule(name, validator) {
    this.rules.set(name, validator);
  }
  
  // Validate data against rules
  validate(data, schema) {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = this.getNestedValue(data, field);
      
      for (const rule of rules) {
        const [ruleName, ...params] = Array.isArray(rule) ? rule : [rule];
        const validator = this.rules.get(ruleName) || this.customValidators.get(ruleName);
        
        if (validator && !validator(value, ...params)) {
          errors.push({
            field,
            rule: ruleName,
            value,
            message: `Validation failed for ${field} with rule ${ruleName}`
          });
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Built-in validators
  static validators = {
    required: (value) => value != null && value !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (value, min) => String(value).length >= min,
    maxLength: (value, max) => String(value).length <= max,
    min: (value, min) => Number(value) >= min,
    max: (value, max) => Number(value) <= max,
    pattern: (value, regex) => new RegExp(regex).test(value),
    url: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    date: (value) => !isNaN(Date.parse(value)),
    number: (value) => !isNaN(Number(value)),
    boolean: (value) => typeof value === 'boolean',
    array: (value) => Array.isArray(value),
    object: (value) => typeof value === 'object' && !Array.isArray(value)
  };
}

// Advanced caching system
export class SmartCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 60000; // 1 minute
    this.cache = new Map();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }
  
  set(key, value, ttl = this.ttl) {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    const item = {
      value,
      expires: Date.now() + ttl,
      accessed: Date.now()
    };
    
    this.cache.set(key, item);
    this.updateAccessOrder(key);
    this.stats.sets++;
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > item.expires) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    
    item.accessed = Date.now();
    this.updateAccessOrder(key);
    this.stats.hits++;
    return item.value;
  }
  
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.removeFromAccessOrder(key);
    }
    return deleted;
  }
  
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
  
  has(key) {
    return this.cache.has(key) && Date.now() <= this.cache.get(key).expires;
  }
  
  keys() {
    return Array.from(this.cache.keys());
  }
  
  values() {
    return Array.from(this.cache.values()).map(item => item.value);
  }
  
  size() {
    return this.cache.size;
  }
  
  private evictLRU() {
    if (this.accessOrder.length === 0) return;
    
    const oldestKey = this.accessOrder.shift();
    this.delete(oldestKey);
  }
  
  private updateAccessOrder(key) {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }
  
  private removeFromAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
  
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    return {
      ...this.stats,
      hitRate: hitRate.toFixed(4),
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.marks = new Map();
    this.measures = new Map();
  }
  
  // Mark a point in time
  mark(name) {
    this.marks.set(name, performance.now());
  }
  
  // Measure time between two marks
  measure(name, startMark, endMark) {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);
    
    if (start && end) {
      const duration = end - start;
      this.measures.set(name, duration);
      return duration;
    }
    
    return null;
  }
  
  // Track custom metrics
  track(metric, value) {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    this.metrics.get(metric).push({
      value,
      timestamp: Date.now()
    });
  }
  
  // Get metric statistics
  getMetricStats(metric) {
    const values = this.metrics.get(metric);
    if (!values || values.length === 0) return null;
    
    const numbers = values.map(v => Number(v.value)).filter(n => !isNaN(n));
    if (numbers.length === 0) return null;
    
    return {
      count: numbers.length,
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      sum: numbers.reduce((sum, n) => sum + n, 0),
      average: numbers.reduce((sum, n) => sum + n, 0) / numbers.length,
      median: this.calculateMedian(numbers)
    };
  }
  
  private calculateMedian(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }
  
  // Get all performance data
  getReport() {
    const report = {
      marks: Object.fromEntries(this.marks),
      measures: Object.fromEntries(this.measures),
      metrics: {}
    };
    
    for (const [metric] of this.metrics) {
      report.metrics[metric] = this.getMetricStats(metric);
    }
    
    return report;
  }
  
  // Clear all data
  clear() {
    this.marks.clear();
    this.measures.clear();
    this.metrics.clear();
  }
}

// Data transformation utilities
export class DataTransformer {
  // Deep clone object
  static clone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => DataTransformer.clone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = DataTransformer.clone(obj[key]);
        }
      }
      return cloned;
    }
  }
  
  // Merge objects deeply
  static merge(target, ...sources) {
    if (!sources.length) return target;
    
    const source = sources.shift();
    if (source === null || typeof source !== 'object') return target;
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = target[key] || {};
          DataTransformer.merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    
    return DataTransformer.merge(target, ...sources);
  }
  
  // Flatten nested objects
  static flatten(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(flattened, DataTransformer.flatten(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }
  
  // Unflatten objects
  static unflatten(obj) {
    const unflattened = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const keys = key.split('.');
        let current = unflattened;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const k = keys[i];
          current[k] = current[k] || {};
          current = current[k];
        }
        
        current[keys[keys.length - 1]] = obj[key];
      }
    }
    
    return unflattened;
  }
  
  // Convert object to query string
  static toQueryString(obj) {
    return Object.entries(obj)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }
  
  // Convert query string to object
  static fromQueryString(queryString) {
    const params = new URLSearchParams(queryString);
    const obj = {};
    
    for (const [key, value] of params) {
      obj[key] = value;
    }
    
    return obj;
  }
}

// Export all utilities
export const validator = new DataValidator();
export const cache = new SmartCache();
export const monitor = new PerformanceMonitor();
export const transformer = DataTransformer;
