import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        console.info('Service Worker مسجل بنجاح بنطاق:', registration.scope);
      }
    },
    onRegisterError(error) {
      console.warn('فشل تسجيل Service Worker:', error);
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
