// Mock fetch globally
global.fetch = jest.fn();

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  close: jest.fn()
}));

// Mock EventSource
global.EventSource = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  close: jest.fn()
}));

// Mock BroadcastChannel
global.BroadcastChannel = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  onmessage: null
}));

// Mock console.debug to reduce noise in tests
global.console.debug = jest.fn();

// Setup DOM environment
document.body.innerHTML = '<div id="root"></div>';
