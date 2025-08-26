import { LWBase } from './lw-base.js';

export class LWChart extends LWBase {
  constructor() {
    super();
    this._chart = null;
    this._chartType = 'line';
    this._options = {};
    this._data = [];
    this._canvas = null;
    this._ctx = null;
  }
  
  connectedCallback() {
    super.connectedCallback();
    this.setupCanvas();
  }
  
  setupCanvas() {
    this._canvas = document.createElement('canvas');
    this._canvas.width = this.offsetWidth || 400;
    this._canvas.height = this.offsetHeight || 300;
    this._canvas.style.width = '100%';
    this._canvas.style.height = '100%';
    
    this.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');
  }
  
  async mount() {
    const src = this.getAttribute('src');
    const sel = this.getAttribute('select');
    const type = this.getAttribute('type') || 'line';
    const options = this.getAttribute('options');
    
    if (!src) return;
    
    try {
      this.setLoading(true);
      this._chartType = type;
      this._options = options ? JSON.parse(options) : {};
      
      for await (const data of await this.getStreamData()) {
        const value = sel ? this.getNestedValue(data, sel) : data;
        this._data = Array.isArray(value) ? value : [value];
        
        this.renderChart();
        
        if (this.hasAttribute('once')) break;
      }
    } catch (error) {
      this.setError(error);
    }
  }
  
  renderChart() {
    if (!this._ctx || !this._data.length) return;
    
    this.clearCanvas();
    
    switch (this._chartType) {
      case 'line':
        this.renderLineChart();
        break;
      case 'bar':
        this.renderBarChart();
        break;
      case 'pie':
        this.renderPieChart();
        break;
      case 'scatter':
        this.renderScatterChart();
        break;
      case 'area':
        this.renderAreaChart();
        break;
      default:
        this.renderLineChart();
    }
  }
  
  clearCanvas() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }
  
  renderLineChart() {
    const { width, height } = this._canvas;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Find data bounds
    const values = this._data.map(d => typeof d === 'object' ? d.value : d);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    // Draw axes
    this._ctx.strokeStyle = '#ccc';
    this._ctx.lineWidth = 1;
    this._ctx.beginPath();
    this._ctx.moveTo(padding, padding);
    this._ctx.lineTo(padding, height - padding);
    this._ctx.lineTo(width - padding, height - padding);
    this._ctx.stroke();
    
    // Draw line
    this._ctx.strokeStyle = this._options.color || '#007bff';
    this._ctx.lineWidth = 2;
    this._ctx.beginPath();
    
    this._data.forEach((item, i) => {
      const value = typeof item === 'object' ? item.value : item;
      const x = padding + (i / (this._data.length - 1)) * chartWidth;
      const y = height - padding - ((value - min) / range) * chartHeight;
      
      if (i === 0) {
        this._ctx.moveTo(x, y);
      } else {
        this._ctx.lineTo(x, y);
      }
    });
    
    this._ctx.stroke();
    
    // Draw points
    this._ctx.fillStyle = this._options.color || '#007bff';
    this._data.forEach((item, i) => {
      const value = typeof item === 'object' ? item.value : item;
      const x = padding + (i / (this._data.length - 1)) * chartWidth;
      const y = height - padding - ((value - min) / range) * chartHeight;
      
      this._ctx.beginPath();
      this._ctx.arc(x, y, 3, 0, 2 * Math.PI);
      this._ctx.fill();
    });
  }
  
  renderBarChart() {
    const { width, height } = this._canvas;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const values = this._data.map(d => typeof d === 'object' ? d.value : d);
    const max = Math.max(...values);
    const barWidth = chartWidth / this._data.length * 0.8;
    const barSpacing = chartWidth / this._data.length * 0.2;
    
    // Draw bars
    this._data.forEach((item, i) => {
      const value = typeof item === 'object' ? item.value : item;
      const barHeight = (value / max) * chartHeight;
      const x = padding + i * (barWidth + barSpacing);
      const y = height - padding - barHeight;
      
      this._ctx.fillStyle = this._options.color || '#007bff';
      this._ctx.fillRect(x, y, barWidth, barHeight);
    });
    
    // Draw axes
    this._ctx.strokeStyle = '#ccc';
    this._ctx.lineWidth = 1;
    this._ctx.beginPath();
    this._ctx.moveTo(padding, padding);
    this._ctx.lineTo(padding, height - padding);
    this._ctx.lineTo(width - padding, height - padding);
    this._ctx.stroke();
  }
  
  renderPieChart() {
    const { width, height } = this._canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    const values = this._data.map(d => typeof d === 'object' ? d.value : d);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    let currentAngle = 0;
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
    
    this._data.forEach((item, i) => {
      const value = typeof item === 'object' ? item.value : item;
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      this._ctx.fillStyle = colors[i % colors.length];
      this._ctx.beginPath();
      this._ctx.moveTo(centerX, centerY);
      this._ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      this._ctx.closePath();
      this._ctx.fill();
      
      currentAngle += sliceAngle;
    });
  }
  
  renderScatterChart() {
    const { width, height } = this._canvas;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Find data bounds
    const xValues = this._data.map(d => typeof d === 'object' ? d.x : d);
    const yValues = this._data.map(d => typeof d === 'object' ? d.y : d);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    
    // Draw axes
    this._ctx.strokeStyle = '#ccc';
    this._ctx.lineWidth = 1;
    this._ctx.beginPath();
    this._ctx.moveTo(padding, padding);
    this._ctx.lineTo(padding, height - padding);
    this._ctx.lineTo(width - padding, height - padding);
    this._ctx.stroke();
    
    // Draw points
    this._ctx.fillStyle = this._options.color || '#007bff';
    this._data.forEach((item, i) => {
      const x = typeof item === 'object' ? item.x : item;
      const y = typeof item === 'object' ? item.y : item;
      
      const chartX = padding + ((x - xMin) / xRange) * chartWidth;
      const chartY = height - padding - ((y - yMin) / yRange) * chartHeight;
      
      this._ctx.beginPath();
      this._ctx.arc(chartX, chartY, 4, 0, 2 * Math.PI);
      this._ctx.fill();
    });
  }
  
  renderAreaChart() {
    const { width, height } = this._canvas;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const values = this._data.map(d => typeof d === 'object' ? d.value : d);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    // Draw area
    this._ctx.fillStyle = this._options.color || '#007bff';
    this._ctx.globalAlpha = 0.3;
    this._ctx.beginPath();
    
    this._data.forEach((item, i) => {
      const value = typeof item === 'object' ? item.value : item;
      const x = padding + (i / (this._data.length - 1)) * chartWidth;
      const y = height - padding - ((value - min) / range) * chartHeight;
      
      if (i === 0) {
        this._ctx.moveTo(x, y);
      } else {
        this._ctx.lineTo(x, y);
      }
    });
    
    this._ctx.lineTo(width - padding, height - padding);
    this._ctx.lineTo(padding, height - padding);
    this._ctx.closePath();
    this._ctx.fill();
    
    this._ctx.globalAlpha = 1;
    
    // Draw line
    this.renderLineChart();
  }
  
  // Public API
  updateData(newData) {
    this._data = Array.isArray(newData) ? newData : [newData];
    this.renderChart();
  }
  
  changeType(newType) {
    this._chartType = newType;
    this.renderChart();
  }
  
  updateOptions(newOptions) {
    this._options = { ...this._options, ...newOptions };
    this.renderChart();
  }
  
  resize(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
    this.renderChart();
  }
  
  exportImage(format = 'png') {
    return this._canvas.toDataURL(`image/${format}`);
  }
  
  getData() {
    return this._data;
  }
  
  getStats() {
    if (!this._data.length) return {};
    
    const values = this._data.map(d => typeof d === 'object' ? d.value : d);
    return {
      count: this._data.length,
      min: Math.min(...values),
      max: Math.max(...values),
      sum: values.reduce((sum, val) => sum + val, 0),
      average: values.reduce((sum, val) => sum + val, 0) / values.length
    };
  }
}

export default LWChart;
