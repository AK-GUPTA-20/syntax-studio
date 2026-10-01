import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// ─── Suppress browser-extension injected noise errors ─────────────────────────
// The "No Listener: tabs:outgoing.message.ready" error originates from browser
// extensions (e.g. React DevTools, Chrome extensions) injecting content scripts,
// NOT from app code. We filter them here so they don't pollute the console.
const EXTENSION_ERROR_PATTERNS = [
  'No Listener',
  'tabs:outgoing',
  'message.ready',
  'chrome-extension://',
  'moz-extension://',
];

const _origConsoleError = console.error.bind(console);
console.error = (...args) => {
  const msg = args.map(a => (a instanceof Error ? a.message : String(a))).join(' ');
  if (EXTENSION_ERROR_PATTERNS.some(p => msg.includes(p))) return;
  _origConsoleError(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  const msg = event?.reason?.message || String(event?.reason || '');
  if (EXTENSION_ERROR_PATTERNS.some(p => msg.includes(p))) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event?.message || '';
  if (EXTENSION_ERROR_PATTERNS.some(p => msg.includes(p))) {
    event.preventDefault();
  }
});
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
