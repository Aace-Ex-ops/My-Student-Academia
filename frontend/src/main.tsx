import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register Ultra-Fast Service Worker Cache in Production and Dev
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[MSA Cache Engine] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[MSA Cache Engine] Service Worker registration skipped:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
