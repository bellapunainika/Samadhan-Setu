import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Dismiss splash loader once React mounts
const dismissSplash = () => {
  const splash = document.getElementById('splash-loader');
  if (splash) {
    splash.classList.add('fade-out');
    setTimeout(() => splash.remove(), 600);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Fade out splash after a short delay to let paint settle
requestAnimationFrame(() => {
  setTimeout(dismissSplash, 300);
});
