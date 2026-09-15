import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline capability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nova versão do Aferix disponível.');
  },
  onOfflineReady() {
    console.log('Aferix pronto para operação 100% offline.');
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
