const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? '',
};

export const isFirebaseWebConfigured = Object.values(firebaseConfig).every(Boolean);

let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

function buildServiceWorkerUrl(): string {
  const params = new URLSearchParams({ version: '7' });

  if (isFirebaseWebConfigured) {
    Object.entries(firebaseConfig).forEach(([key, value]) => params.set(key, value));
  }

  return `/sw.js?${params.toString()}`;
}

export function registerS2BServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    return Promise.reject(new Error('Service workers are not supported by this browser.'));
  }

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register(buildServiceWorkerUrl(), { scope: '/' })
      .then(async (registration) => {
        await navigator.serviceWorker.ready;
        return registration;
      })
      .catch((error) => {
        registrationPromise = null;
        throw error;
      });
  }

  return registrationPromise;
}
