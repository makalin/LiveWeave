# LiveWeave API Reference

## Core Components

### `<lw-text>`

Updates text content from a data source.

**Attributes:**
- `src` (required): Data source URL
- `select`: JSON path to extract value
- `type`: Source type (`json`, `ws`, `sse`)
- `poll`: Polling interval (e.g., `5s`, `100ms`)
- `auth`: Credentials (`omit`, `same-origin`, `include`)
- `loading`: Loading text
- `error`: Error text
- `once`: Update only once

**Example:**
```html
<lw-text src="/api/status" select="status.message" poll="5s"></lw-text>
```

### `<lw-html>`

Updates HTML content with automatic sanitization.

**Attributes:** Same as `lw-text`

**Example:**
```html
<lw-html src="/api/dashboard" select="html"></lw-html>
```

### `<lw-for>`

Renders lists with templates.

**Attributes:** Same as `lw-text` plus:
- `as`: Variable name for each item (default: `item`)

**Example:**
```html
<lw-for src="/api/users" select="users" as="user">
  <div>{{user.name}} - {{user.email}}</div>
</lw-for>
```

### `<lw-if>`

Conditionally shows content based on data.

**Attributes:** Same as `lw-text` plus:
- `test`: JavaScript expression to evaluate

**Example:**
```html
<lw-if src="/api/status" test="user.isOnline">
  <span>🟢 Online</span>
</lw-if>
```

### `<lw-time>`

Displays real-time timestamps.

**Attributes:**
- `value`: ISO date string (default: current time)
- `format`: `relative`, `ago`, or `formatted`

**Example:**
```html
<lw-time value="2024-01-01T00:00:00Z" format="ago"></lw-time>
```

### `<lw-on>`

Reacts to signals and cross-tab communication.

**Attributes:**
- `name`: Signal name to listen to

**Example:**
```html
<lw-on name="userStatus">
  <div>Status: {{$signal.status}}</div>
</lw-on>
```

### `<form is="lw-form">`

Enhanced forms with live submission.

**Attributes:**
- `live`: Enable live submission
- `on`: Event to trigger submission (default: `submit`)

**Example:**
```html
<form is="lw-form" live action="/api/submit" method="POST">
  <input name="message" required>
  <button type="submit">Send</button>
</form>
```

## Data Sources

### JSON API
```html
<lw-text src="/api/status" poll="5s"></lw-text>
```

### WebSocket
```html
<lw-text src="ws://localhost:8080/stream" type="ws"></lw-text>
```

### Server-Sent Events
```html
<lw-text src="/api/events" type="sse"></lw-text>
```

## Signals API

### Global Signal Function
```javascript
// Send a signal
lwSignal('userStatus', 'set', { status: 'online' });

// Merge with existing signal
lwSignal('userStatus', 'merge', { lastSeen: Date.now() });

// Clear signal
lwSignal('userStatus', 'clear');
```

### Signal Operations
- `set`: Replace signal value
- `merge`: Merge with existing value
- `clear`: Clear signal value

### Cross-tab Communication
Signals automatically sync across browser tabs using BroadcastChannel API.

## Utility Functions

### `getNestedValue(obj, path)`
Safely get nested object properties.

```javascript
import { getNestedValue } from 'liveweave';

const user = { profile: { name: 'John' } };
const name = getNestedValue(user, 'profile.name'); // 'John'
```

### `parseMs(timeString)`
Parse time strings to milliseconds.

```javascript
import { parseMs } from 'liveweave';

parseMs('5s');   // 5000
parseMs('100ms'); // 100
parseMs('2m');   // 120000
```

### `sleep(ms)`
Delay execution for specified milliseconds.

```javascript
import { sleep } from 'liveweave';

await sleep(1000); // Wait 1 second
```

### `debounce(func, wait)`
Create a debounced function.

```javascript
import { debounce } from 'liveweave';

const debouncedSearch = debounce(searchFunction, 300);
```

### `throttle(func, limit)`
Create a throttled function.

```javascript
import { throttle } from 'liveweave';

const throttledScroll = throttle(scrollHandler, 100);
```

## Error Handling

All components support error handling through the `error` attribute:

```html
<lw-text 
  src="/api/status" 
  error="Failed to load status. Please try again."
></lw-text>
```

## Loading States

Components can show loading states:

```html
<lw-text 
  src="/api/status" 
  loading="Loading status..."
></lw-text>
```

## Security Features

### HTML Sanitization
The `<lw-html>` component automatically sanitizes HTML content by:
- Removing `<script>`, `<iframe>`, `<object>`, `<embed>`, and `<link>` tags
- Removing event handler attributes (e.g., `onclick`, `onmouseover`)

### Safe Template Rendering
Template expressions are safely evaluated without access to global scope.

## Browser Support

- Chrome 114+
- Edge 114+
- Firefox 115+
- Safari 16+

## Performance Considerations

- Use `once` attribute for one-time updates
- Implement appropriate polling intervals
- Consider WebSocket/SSE for high-frequency updates
- Use signals for cross-tab communication instead of polling
