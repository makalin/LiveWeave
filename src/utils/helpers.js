// Utility function to safely get nested object properties
export function getNestedValue(obj, path) {
  return path?.split('.').reduce((current, key) => current?.[key], obj);
}

// Utility function to sleep/delay execution
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility function to parse time strings (e.g., "5s", "100ms", "2m")
export function parseMs(timeString) {
  if (!timeString) return 0;
  
  const match = /^(\d+)(ms|s|m)$/i.exec(timeString.trim());
  if (!match) return 0;
  
  const number = +match[1];
  const unit = match[2].toLowerCase();
  
  switch (unit) {
    case 'ms':
      return number;
    case 's':
      return number * 1000;
    case 'm':
      return number * 60000;
    default:
      return 0;
  }
}

// Utility function to create a debounced function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Utility function to throttle function calls
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
