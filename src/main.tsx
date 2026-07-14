import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { registerS2BServiceWorker } from './lib/service-worker';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void registerS2BServiceWorker().catch((error) =>
      console.warn('[S2B Services] Service worker registration failed:', error)
    );
  });
}
