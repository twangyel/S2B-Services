import { useEffect, useMemo, useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { useLocation } from 'react-router';

type BeforeInstallPromptChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptChoice>;
};

const DISMISSED_UNTIL_KEY = 's2b-services:pwa-install-dismissed-until';
const DISMISS_DAYS = 7;

function getDismissedUntil() {
  const value = Number(window.localStorage.getItem(DISMISSED_UNTIL_KEY) || 0);
  return Number.isFinite(value) ? value : 0;
}

function isDismissed() {
  return Date.now() < getDismissedUntil();
}

function dismissForNow() {
  const dismissedUntil = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(DISMISSED_UNTIL_KEY, String(dismissedUntil));
}

function clearDismissed() {
  window.localStorage.removeItem(DISMISSED_UNTIL_KEY);
}

function isStandaloneMode() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isCustomerRoute(pathname: string) {
  return !pathname.startsWith('/admin') && !pathname.startsWith('/provider');
}

export default function PWAInstallBanner() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  const isCustomerPage = useMemo(() => isCustomerRoute(location.pathname), [location.pathname]);

  useEffect(() => {
    setInstalled(isStandaloneMode());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      clearDismissed();
      setDeferredPrompt(event as BeforeInstallPromptEvent);

      window.setTimeout(() => {
        if (!isStandaloneMode() && !isDismissed()) {
          setShowBanner(true);
        }
      }, 1200);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowBanner(false);
      setShowIosGuide(false);
      clearDismissed();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (installed || !isCustomerPage || isDismissed()) {
      setShowBanner(false);
      setShowIosGuide(false);
      return;
    }

    if (deferredPrompt) {
      const timer = window.setTimeout(() => setShowBanner(true), 700);
      return () => window.clearTimeout(timer);
    }

    if (isIosDevice() && !isStandaloneMode()) {
      const timer = window.setTimeout(() => {
        if (!isDismissed()) setShowIosGuide(true);
      }, 1800);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [deferredPrompt, installed, isCustomerPage, location.pathname]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowBanner(false);

      if (choice.outcome === 'dismissed') {
        dismissForNow();
      }
    } catch (error) {
      console.warn('[PWAInstallBanner] Install prompt failed:', error);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    dismissForNow();
    setShowBanner(false);
    setShowIosGuide(false);
  };

  if (installed || !isCustomerPage) return null;

  if (showIosGuide) {
    return (
      <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[95] px-4 sm:top-5">
        <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-blue-100 bg-white p-4 shadow-2xl shadow-blue-950/15">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Share2 size={21} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-gray-950">Add S2B Services to Home Screen</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                On iPhone, tap the Share button, then choose <b>Add to Home Screen</b>.
              </p>
              <button
                type="button"
                onClick={handleDismiss}
                className="mt-3 h-9 rounded-2xl bg-gray-100 px-4 text-xs font-bold text-gray-700 active:scale-[0.98]"
              >
                Got it
              </button>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 active:bg-gray-100"
              aria-label="Dismiss install guide"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[95] px-4 sm:top-5">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-blue-100 bg-white p-4 shadow-2xl shadow-blue-950/15">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Smartphone size={21} strokeWidth={2.4} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-gray-950">Install S2B Services</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Add the app to your phone for faster access and a native-app feel.
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-2xl bg-blue-600 px-4 text-xs font-extrabold text-white active:scale-[0.98]"
              >
                <Download size={14} strokeWidth={2.5} />
                Install
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="h-9 rounded-2xl bg-gray-100 px-4 text-xs font-bold text-gray-700 active:scale-[0.98]"
              >
                Later
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 active:bg-gray-100"
            aria-label="Dismiss install banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
