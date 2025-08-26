import { LWBase } from './lw-base.js';

export class LWTransform extends LWBase {
  constructor() {
    super();
    this._transformers = new Map();
    this._cache = new Map();
    this._cacheTimeout = 5000; // 5 seconds
  }
  
  async mount() {
    const src = this.getAttribute('src');
    const sel = this.getAttribute('select');
    const filter = this.getAttribute('filter');
    const sort = this.getAttribute('sort');
    const limit = parseInt(this.getAttribute('limit')) || 0;
    const offset = parseInt(this.getAttribute('offset')) || 0;
    const map = this.getAttribute('map');
    const groupBy = this.getAttribute('group-by');
    const cache = this.getAttribute('cache') === 'true';
    
    if (!src) {
      this.innerHTML = '';
      return;
    }
    
    try {
      this.setLoading(true);
      
      for await (const data of await this.getStreamData()) {
        let value = sel ? this.getNestedValue(data, sel) : data;
        
        // Apply transformations
        value = await this.applyTransformations(value, {
          filter,
          sort,
          limit,
          offset,
          map,
          groupBy,
          cache
        });
        
        // Render the transformed data
        this.renderTransformedData(value);
        
        if (this.hasAttribute('once')) break;
      }
    } catch (error) {
      this.setError(error);
    }
  }
  
  async applyTransformations(data, options) {
    let result = data;
    
    // Apply filter
    if (options.filter) {
      result = this.filterData(result, options.filter);
    }
    
    // Apply sorting
    if (options.sort) {
      result = this.sortData(result, options.sort);
    }
    
    // Apply mapping
    if (options.map) {
      result = this.mapData(result, options.map);
    }
    
    // Apply grouping
    if (options.groupBy) {
      result = this.groupData(result, options.groupBy);
    }
    
    // Apply pagination
    if (options.limit > 0) {
      result = this.paginateData(result, options.limit, options.offset);
    }
    
    return result;
  }
  
  filterData(data, filterExpr) {
    if (!Array.isArray(data)) return data;
    
    try {
      return data.filter(item => {
        const keys = Object.keys(item);
        const values = Object.values(item);
        return Function(...keys, `return ${filterExpr};`)(...values);
      });
    } catch (error) {
      console.warn('Filter expression error:', error);
      return data;
    }
  }
  
  sortData(data, sortExpr) {
    if (!Array.isArray(data)) return data;
    
    try {
      const [field, direction] = sortExpr.split(':');
      const order = direction === 'desc' ? -1 : 1;
      
      return [...data].sort((a, b) => {
        const aVal = this.getNestedValue(a, field);
        const bVal = this.getNestedValue(b, field);
        
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    } catch (error) {
      console.warn('Sort expression error:', error);
      return data;
    }
  }
  
  mapData(data, mapExpr) {
    if (!Array.isArray(data)) return data;
    
    try {
      return data.map(item => {
        const keys = Object.keys(item);
        const values = Object.values(item);
        return Function(...keys, `return ${mapExpr};`)(...values);
      });
    } catch (error) {
      console.warn('Map expression error:', error);
      return data;
    }
  }
  
  groupData(data, groupBy) {
    if (!Array.isArray(data)) return data;
    
    try {
      const groups = {};
      
      data.forEach(item => {
        const key = this.getNestedValue(item, groupBy);
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
      });
      
      return Object.entries(groups).map(([key, items]) => ({
        key,
        items,
        count: items.length
      }));
    } catch (error) {
      console.warn('Group expression error:', error);
      return data;
    }
  }
  
  paginateData(data, limit, offset) {
    if (!Array.isArray(data)) return data;
    
    return data.slice(offset, offset + limit);
  }
  
  renderTransformedData(data) {
    const template = this.innerHTML;
    
    if (Array.isArray(data)) {
      this.innerHTML = data.map((item, index) => 
        this.renderTemplate(template, item, index)
      ).join('');
    } else if (typeof data === 'object') {
      this.innerHTML = this.renderTemplate(template, data, 0);
    } else {
      this.innerHTML = String(data);
    }
  }
  
  renderTemplate(template, item, index) {
    return template
      .replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const value = this.getNestedValue(item, path);
        return value != null ? String(value) : '';
      })
      .replace(/\{\{index\}\}/g, index)
      .replace(/\{\{key\}\}/g, item.key || '');
  }
  
  // Public API for manual transformations
  transform(data, options) {
    return this.applyTransformations(data, options);
  }
  
  // Add custom transformer
  addTransformer(name, fn) {
    this._transformers.set(name, fn);
  }
  
  // Remove custom transformer
  removeTransformer(name) {
    this._transformers.delete(name);
  }
  
  // Get transformation statistics
  getStats() {
    return {
      transformers: this._transformers.size,
      cacheSize: this._cache.size,
      cacheTimeout: this._cacheTimeout
    };
  }
  
  // Clear cache
  clearCache() {
    this._cache.clear();
  }
}

export default LWTransform;
