import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Prevent browser from automatically restoring stale bottom scroll positions
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Notify vite-plugin-prerender that React has mounted and meta tags are in the DOM.
// This fires after React renders synchronously — react-helmet-async updates <head> before this.
document.dispatchEvent(new Event('render-event'));
