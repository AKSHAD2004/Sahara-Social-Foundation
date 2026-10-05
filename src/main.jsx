import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ensure crisp circular PNG favicon is rendered in browser tab
function initFavicon() {
  if (typeof window === 'undefined') return;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(32, 32, 31, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, 64, 64);
      const url = canvas.toDataURL('image/png');

      const existingIcons = document.querySelectorAll("link[rel*='icon']");
      existingIcons.forEach((el) => el.remove());

      const fav = document.createElement('link');
      fav.rel = 'icon';
      fav.type = 'image/png';
      fav.href = url;
      document.head.appendChild(fav);

      const short = document.createElement('link');
      short.rel = 'shortcut icon';
      short.type = 'image/png';
      short.href = url;
      document.head.appendChild(short);
    };
    img.src = '/sahara-logo.jpg?v=' + Date.now();
  } catch (err) {
    console.warn('Favicon init:', err);
  }
}

initFavicon();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
