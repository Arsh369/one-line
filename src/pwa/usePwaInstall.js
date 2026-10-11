import { useCallback, useEffect, useRef, useState } from 'react';

const STANDALONE_QUERY = '(display-mode: standalone)';

function getIsStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia(STANDALONE_QUERY).matches ||
    window.navigator.standalone === true // iOS Safari
  );
}

function getIsIosSafari() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIosDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports itself as a Mac
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Exclude Chrome/Firefox/Edge/Opera on iOS: their Share menus differ.
  const isOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\//.test(ua);
  return isIosDevice && !isOtherBrowser;
}

/**
 * Tracks PWA installability.
 * Nothing is persisted: state lives in memory only, so every new visit starts fresh.
 */
export function usePwaInstall() {
  const deferredPromptRef = useRef(null);
  const [canPromptNatively, setCanPromptNatively] = useState(false);
  const [isStandalone, setIsStandalone] = useState(getIsStandalone);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosSafari] = useState(getIsIosSafari);

  useEffect(() => {
    const mql = window.matchMedia(STANDALONE_QUERY);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault(); // suppress the browser's mini-infobar
      deferredPromptRef.current = event;
      setCanPromptNatively(true);
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setCanPromptNatively(false);
      setIsInstalled(true);
    };

    const handleDisplayModeChange = () => setIsStandalone(getIsStandalone());

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mql.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mql.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  /** Returns 'accepted' | 'dismissed' | 'unavailable' */
  const promptInstall = useCallback(async () => {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) return 'unavailable';

    // The event is single-use; drop it whatever the outcome.
    deferredPromptRef.current = null;
    setCanPromptNatively(false);

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      return outcome;
    } catch {
      return 'unavailable';
    }
  }, []);

  const alreadyInstalled = isStandalone || isInstalled;

  return {
    canPromptNatively,
    showIosInstructions: isIosSafari && !alreadyInstalled,
    isInstalled: alreadyInstalled,
    promptInstall,
  };
}