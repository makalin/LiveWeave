# LiveWeave

A **revolutionary** tiny realtime HTML layer for modern browsers. LiveWeave provides custom elements that automatically update HTML content from WebSocket, Server-Sent Events, or polling sources, with **advanced features** that set it apart from other solutions.

## 🚀 What Makes LiveWeave Unique?

- **🎭 Advanced Animations**: Smooth transitions and effects for content updates
- **📊 Built-in Charts**: Real-time charting with multiple chart types
- **🔄 Data Transformations**: Filter, sort, group, and map data declaratively
- **✅ Smart Validation**: Real-time form validation with custom rules
- **📈 Performance Monitoring**: Built-in performance tracking and caching
- **🔒 Enhanced Security**: Advanced HTML sanitization and validation
- **⚡ Cross-tab Communication**: Seamless multi-tab synchronization
- **🎨 Modern UI Components**: Beautiful, responsive components out of the box

## Features

- **Lightweight**: Only ~5KB minified (with all features)
- **Modern**: Built for Chrome 114+, Edge 114+, Firefox 115+, Safari 16+
- **Drop-in**: Single script tag to get started
- **Multiple Sources**: WebSocket, SSE, and HTTP polling support
- **Safe**: Advanced HTML sanitization and security features
- **Reactive**: Real-time updates with minimal configuration
- **Extensible**: Plugin system for custom components and validators

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="liveweave.min.js"></script>
</head>
<body>
  <!-- Animated real-time updates -->
  <lw-animate src="/api/status" animation="fade" duration="500">
    <div>Status: {{status.message}}</div>
  </lw-animate>
  
  <!-- Real-time charts -->
  <lw-chart src="/api/metrics" type="line" select="data"></lw-chart>
  
  <!-- Advanced data transformations -->
  <lw-transform src="/api/users" filter="age >= 25" sort="name:asc" group-by="department">
    <div>{{key}}: {{count}} users</div>
  </lw-transform>
  
  <!-- Smart form validation -->
  <lw-validate rules='{"email": ["required", "email"], "password": ["required", "password-strength"]}'>
    <form>
      <input name="email" type="email">
      <input name="password" type="password">
    </form>
  </lw-validate>
</body>
</html>
```

## Installation

### CDN (Recommended)

```html
<script type="module" src="https://unpkg.com/liveweave@0.1.0/liveweave.min.js"></script>
```

### NPM

```bash
npm install liveweave
```

```javascript
import 'liveweave';
```

## 🎭 Advanced Components

### `<lw-animate>`

Smooth animations for content updates with multiple animation types.

```html
<lw-animate src="/api/content" animation="fade" duration="500">
  <div>Content with fade animation</div>
</lw-animate>
```

**Animation Types:**
- `fade`: Smooth opacity transitions
- `slide`: Height-based sliding animations
- `scale`: Scale and opacity effects
- `flip`: 3D flip transitions
- `typewriter`: Character-by-character typing effect

### `<lw-chart>`

Real-time charting with multiple chart types and live updates.

```html
<lw-chart src="/api/data" type="line" select="metrics"></lw-chart>
```

**Chart Types:**
- `line`: Line charts with smooth curves
- `bar`: Bar charts with customizable spacing
- `pie`: Pie charts with color coding
- `scatter`: Scatter plots for data correlation
- `area`: Area charts with fill effects

### `<lw-transform>`

Advanced data manipulation with declarative syntax.

```html
<lw-transform src="/api/users" filter="age >= 25" sort="name:asc" group-by="department" limit="10">
  <div>{{key}}: {{count}} users</div>
</lw-transform>
```

**Transformations:**
- `filter`: JavaScript expressions for filtering
- `sort`: Field-based sorting with direction
- `group-by`: Data grouping with aggregation
- `map`: Data transformation expressions
- `limit/offset`: Pagination support

### `<lw-validate>`

Real-time form validation with custom rules and visual feedback.

```html
<lw-validate rules='{"email": ["required", "email"], "password": ["required", "password-strength"]}'>
  <form>
    <input name="email" type="email">
    <input name="password" type="password">
  </form>
</lw-validate>
```

**Built-in Validators:**
- `required`, `email`, `url`, `phone`
- `minLength`, `maxLength`, `min`, `max`
- `pattern`, `date`, `number`, `boolean`
- `password-strength`, `postal-code`, `unique`

## 🔧 Advanced Utilities

### Smart Caching System

```javascript
import { cache } from 'liveweave';

// Configure cache
cache.set('user-data', userData, 300000); // 5 minutes TTL
const data = cache.get('user-data');

// Get cache statistics
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate}`);
```

### Performance Monitoring

```javascript
import { monitor } from 'liveweave';

// Mark performance points
monitor.mark('start-operation');
// ... perform operation ...
monitor.mark('end-operation');

// Measure duration
const duration = monitor.measure('operation-time', 'start-operation', 'end-operation');

// Track custom metrics
monitor.track('api-calls', 1);
monitor.track('response-time', 150);

// Get performance report
const report = monitor.getReport();
```

### Data Transformation

```javascript
import { transformer } from 'liveweave';

// Deep clone objects
const cloned = transformer.clone(originalObject);

// Merge objects deeply
const merged = transformer.merge(target, source1, source2);

// Flatten nested objects
const flat = transformer.flatten(nestedObject);

// Convert to query string
const query = transformer.toQueryString({ name: 'John', age: 30 });
```

## 📊 Data Sources

### JSON API with Polling

```html
<lw-text src="/api/status" poll="5s"></lw-text>
```

### WebSocket Streams

```html
<lw-chart src="ws://localhost:8080/metrics" type="line"></lw-chart>
```

### Server-Sent Events

```html
<lw-transform src="/api/events" type="sse" filter="type === 'alert'"></lw-transform>
```

## 🎯 Signals & Cross-tab Communication

```javascript
// Send signals
lwSignal('userStatus', 'set', { status: 'online', lastSeen: Date.now() });

// Merge with existing data
lwSignal('userStatus', 'merge', { lastSeen: Date.now() });

// Clear signal
lwSignal('userStatus', 'clear');

// React to signals in HTML
<lw-on name="userStatus">
  <div>Status: {{$signal.status}}</div>
  <div>Last seen: {{$signal.lastSeen}}</div>
</lw-on>
```

## 🎨 Styling & Customization

### Validation States

```css
.lw-valid { border-color: #28a745; }
.lw-invalid { border-color: #dc3545; }
.lw-error-message { color: #dc3545; font-size: 0.9em; }
```

### Animation Customization

```css
.lw-animate {
  transition: all 0.3s ease-in-out;
}

.lw-animate[animation="fade"] {
  opacity: 1;
}
```

## 📱 Browser Support

- Chrome 114+
- Edge 114+
- Firefox 115+
- Safari 16+

## 🚀 Performance Features

- **Lazy Loading**: Components only load when needed
- **Smart Caching**: LRU cache with TTL support
- **Debounced Updates**: Prevents excessive API calls
- **Memory Management**: Automatic cleanup of disconnected components
- **Performance Monitoring**: Built-in metrics and profiling

## 🔒 Security Features

- **HTML Sanitization**: Automatic removal of dangerous elements
- **Event Handler Removal**: Prevents XSS through event attributes
- **Safe Template Evaluation**: Isolated expression evaluation
- **Input Validation**: Comprehensive validation rules
- **CSRF Protection**: Built-in form security

## 📚 Examples

Check the `examples/` directory for complete working examples:

- [Basic Usage](examples/basic.html) - Core components
- [Advanced Features](examples/advanced.html) - All new features
- [Real-time Chat](examples/chat.html) - WebSocket communication
- [Dashboard](examples/dashboard.html) - Charts and metrics

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build minified version
npm run build

# Development mode with auto-rebuild
npm run dev

# Code quality
npm run lint
npm run format
```

## 📖 API Documentation

Comprehensive API documentation is available in the `docs/` directory:

- [API Reference](docs/API.md) - Complete component reference
- [Advanced Features](docs/Advanced.md) - Advanced usage patterns
- [Performance Guide](docs/Performance.md) - Optimization tips

## 🤝 Contributing

LiveWeave is open source! We welcome contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🌟 Why LiveWeave?

**LiveWeave isn't just another real-time library** - it's a complete solution that combines:

- **Simplicity**: Drop-in components that just work
- **Power**: Advanced features without complexity
- **Performance**: Optimized for speed and efficiency
- **Security**: Built with security best practices
- **Extensibility**: Plugin system for custom needs
- **Modern**: Built for today's web standards

**Start building the future of real-time web applications with LiveWeave today!** 🚀
