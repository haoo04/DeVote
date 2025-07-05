import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { handleResizeObserverError } from './utils/errorHandler';

// 全局错误处理
window.addEventListener('error', (e) => {
  if (!handleResizeObserverError(e)) {
    console.error('Unhandled error:', e);
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (!handleResizeObserverError(e)) {
    console.error('Unhandled promise rejection:', e);
  }
});

// 特别处理ResizeObserver错误
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorMessage = args[0] && args[0].toString();
  if (errorMessage && errorMessage.includes('ResizeObserver loop completed with undelivered notifications')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
