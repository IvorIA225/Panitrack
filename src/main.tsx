import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Enregistrement du Service Worker pour le fonctionnement 100% Hors-Ligne (Offline PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ [PaniTrack PWA] Mode Hors-Ligne actif. Scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('⚠️ [PaniTrack PWA] Service worker non enregistré:', error);
      });
  });
}

