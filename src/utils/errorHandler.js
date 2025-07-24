/**
 * Error handling tools
 */

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ResizeObserver error handling
export const handleResizeObserverError = (error) => {
  if (
    error.message &&
    (error.message.includes('ResizeObserver loop completed with undelivered notifications') ||
     error.message.includes('ResizeObserver loop limit exceeded'))
  ) {
    // Silent ignore ResizeObserver error
    return true;
  }
  return false;
};

// Wrapper function to handle operations that may cause ResizeObserver errors
export const safeExecute = (fn, fallback = () => {}) => {
  try {
    return fn();
  } catch (error) {
    if (!handleResizeObserverError(error)) {
      console.error('Unexpected error:', error);
      fallback();
    }
  }
};

// Safe setState wrapper
export const safeSetState = (setter) => {
  return debounce((value) => {
    try {
      setter(value);
    } catch (error) {
      if (!handleResizeObserverError(error)) {
        console.error('State update error:', error);
      }
    }
  }, 50);
};

// Default configuration optimized for Select component
export const optimizedSelectProps = {
  virtual: false,
  dropdownMatchSelectWidth: false,
  showSearch: false,
  dropdownStyle: { zIndex: 1050 },
  listHeight: 200,
};

// Safe DOM operation
export const safeDOMOperation = (operation) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      try {
        const result = operation();
        resolve(result);
      } catch (error) {
        if (!handleResizeObserverError(error)) {
          console.error('DOM operation error:', error);
        }
        resolve(null);
      }
    });
  });
}; 