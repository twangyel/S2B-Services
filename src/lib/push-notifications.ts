import { supabase } from '@/lib/supabase';
import { isFirebaseWebConfigured, registerS2BServiceWorker } from '@/lib/service-worker';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim() ?? '';
const TOKEN_STORAGE_KEY = 's2b-services-fcm-token';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? '',
};

export type PushPermissionState = NotificationPermission | 'unsupported' | 'unconfigured';

export interface PushCapability {
  supported: boolean;
  configured: boolean;
  permission: PushPermissionState;
  enabled: boolean;
}

/**
 * Local payload shape used to avoid depending on Firebase's public type facade.
 * It includes the fields used by S2B Services and remains compatible with FCM.
 */
export interface FirebaseMessagePayload {
  collapseKey?: string;
  from?: string;
  messageId?: string;
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: Record<string, string>;
  fcmOptions?: {
    link?: string;
    analyticsLabel?: string;
  };
}

type FirebaseAppInstance = object;
type FirebaseMessagingInstance = object;

type FirebaseAppModule = {
  initializeApp: (config: typeof firebaseConfig) => FirebaseAppInstance;
  getApps: () => FirebaseAppInstance[];
  getApp: () => FirebaseAppInstance;
};

type FirebaseMessagingModule = {
  isSupported: () => Promise<boolean>;
  getMessaging: (app?: FirebaseAppInstance) => FirebaseMessagingInstance;
  getToken: (
    messaging: FirebaseMessagingInstance,
    options?: {
      vapidKey?: string;
      serviceWorkerRegistration?: ServiceWorkerRegistration;
    }
  ) => Promise<string>;
  deleteToken: (messaging: FirebaseMessagingInstance) => Promise<boolean>;
  onMessage: (
    messaging: FirebaseMessagingInstance,
    next: (payload: FirebaseMessagePayload) => void
  ) => () => void;
};

type FirebaseModules = {
  app: FirebaseAppModule;
  messaging: FirebaseMessagingModule;
};

let firebaseModulesPromise: Promise<FirebaseModules> | null = null;
let messagingPromise: Promise<FirebaseMessagingInstance | null> | null = null;

export const isPushConfigured = isFirebaseWebConfigured && Boolean(VAPID_KEY);

/**
 * Some Windows/npm combinations resolve Firebase's ESM facade as
 * `{ default: module }`, while others expose named exports directly.
 * This normalizes both shapes at runtime and avoids fragile type re-exports.
 */
function resolveFirebaseModule<T extends object>(loadedModule: unknown, expectedExport: string): T {
  if (!loadedModule || typeof loadedModule !== 'object') {
    throw new Error(`Firebase module is invalid: missing ${expectedExport}.`);
  }

  const namespace = loadedModule as Record<string, unknown>;
  if (expectedExport in namespace) return namespace as T;

  const defaultExport = namespace.default;
  if (defaultExport && typeof defaultExport === 'object') {
    const defaultNamespace = defaultExport as Record<string, unknown>;
    if (expectedExport in defaultNamespace) return defaultNamespace as T;
  }

  throw new Error(`Firebase module is missing the ${expectedExport} export.`);
}

async function getFirebaseModules(): Promise<FirebaseModules> {
  if (!firebaseModulesPromise) {
    firebaseModulesPromise = Promise.all([
      import('firebase/app'),
      import('firebase/messaging'),
    ]).then(([appImport, messagingImport]) => ({
      app: resolveFirebaseModule<FirebaseAppModule>(appImport, 'initializeApp'),
      messaging: resolveFirebaseModule<FirebaseMessagingModule>(messagingImport, 'getMessaging'),
    }));
  }

  return firebaseModulesPromise;
}

async function getMessagingInstance(): Promise<FirebaseMessagingInstance | null> {
  if (!isPushConfigured || typeof window === 'undefined') return null;

  if (!messagingPromise) {
    messagingPromise = getFirebaseModules().then(async ({ app, messaging }) => {
      const supported = await messaging.isSupported();
      if (!supported) return null;

      const firebaseApp = app.getApps().length > 0
        ? app.getApp()
        : app.initializeApp(firebaseConfig);

      return messaging.getMessaging(firebaseApp);
    });
  }

  return messagingPromise;
}

function describeDevice(): string {
  const userAgentData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const platform = userAgentData?.platform || navigator.platform || 'Web';
  const browser = navigator.userAgent.match(/(Chrome|CriOS|Firefox|FxiOS|Edg|Safari)\/?([\d.]+)/i);
  const browserName = browser ? `${browser[1]} ${browser[2] ?? ''}`.trim() : 'Browser';
  return `${platform} · ${browserName}`.slice(0, 120);
}

async function saveToken(token: string): Promise<void> {
  const { error } = await supabase.rpc('register_push_token', {
    p_token: token,
    p_platform: 'web',
    p_device_name: describeDevice(),
  });

  if (error) throw error;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export async function getPushCapability(): Promise<PushCapability> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return { supported: false, configured: isPushConfigured, permission: 'unsupported', enabled: false };
  }

  if (!isPushConfigured) {
    return { supported: true, configured: false, permission: 'unconfigured', enabled: false };
  }

  const messaging = await getMessagingInstance();
  const supported = Boolean(messaging);
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  return {
    supported,
    configured: true,
    permission: supported ? Notification.permission : 'unsupported',
    enabled: supported && Notification.permission === 'granted' && Boolean(storedToken),
  };
}

export async function enablePushNotifications(): Promise<string> {
  if (!isPushConfigured) throw new Error('Firebase web push is not configured yet.');
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    throw new Error('Push notifications are not supported on this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notifications are blocked. Enable them from your browser or device settings.'
        : 'Notification permission was not granted.'
    );
  }

  const messagingInstance = await getMessagingInstance();
  if (!messagingInstance) throw new Error('Firebase Messaging is not supported on this browser.');

  const registration = await registerS2BServiceWorker();
  const { messaging } = await getFirebaseModules();
  const token = await messaging.getToken(messagingInstance, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) throw new Error('The browser did not return a push notification token.');
  await saveToken(token);
  return token;
}

export async function syncExistingPushToken(): Promise<void> {
  if (!isPushConfigured || typeof window === 'undefined' || Notification.permission !== 'granted') return;

  const messagingInstance = await getMessagingInstance();
  if (!messagingInstance) return;

  const registration = await registerS2BServiceWorker();
  const { messaging } = await getFirebaseModules();
  const token = await messaging.getToken(messagingInstance, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (token) await saveToken(token);
}

export async function disablePushNotifications(): Promise<void> {
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (storedToken) {
    const { error } = await supabase.rpc('deactivate_push_token', { p_token: storedToken });
    if (error) throw error;
  }

  const messagingInstance = await getMessagingInstance();
  if (messagingInstance) {
    const { messaging } = await getFirebaseModules();
    await messaging.deleteToken(messagingInstance).catch(() => false);
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function deactivateCurrentPushTokenForSignOut(): Promise<void> {
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!storedToken) return;

  const { error } = await supabase.rpc('deactivate_push_token', { p_token: storedToken });
  if (error) console.warn('[S2B Services] Unable to deactivate push token during sign-out:', error.message);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function createTestPushNotification(): Promise<void> {
  const { error } = await supabase.rpc('send_test_notification_to_self');
  if (error) throw error;
}

export async function subscribeToForegroundPush(
  handler: (payload: FirebaseMessagePayload) => void
): Promise<(() => void) | null> {
  const messagingInstance = await getMessagingInstance();
  if (!messagingInstance) return null;

  const { messaging } = await getFirebaseModules();
  return messaging.onMessage(messagingInstance, handler);
}
