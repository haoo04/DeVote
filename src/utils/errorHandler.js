/**
 * 错误处理工具
 */

// 防抖函数
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

// 节流函数
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

// ResizeObserver错误处理
export const handleResizeObserverError = (error) => {
  if (
    error.message &&
    (error.message.includes('ResizeObserver loop completed with undelivered notifications') ||
     error.message.includes('ResizeObserver loop limit exceeded'))
  ) {
    // 静默忽略ResizeObserver错误
    return true;
  }
  return false;
};

// 包装函数来处理可能引起ResizeObserver错误的操作
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

// 安全的setState包装器
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

// 为Select组件优化的默认配置
export const optimizedSelectProps = {
  virtual: false,
  dropdownMatchSelectWidth: false,
  showSearch: false,
  dropdownStyle: { zIndex: 1050 },
  listHeight: 200,
};

// 安全的DOM操作
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