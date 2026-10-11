import { useEffect, useState } from 'react';
import { usePwaInstall } from './usePwaInstall';
import './InstallPrompt.css';

export default function InstallPrompt({
  appName = 'My App',
  description = 'Install for faster access and a full-screen experience.',
  iconSrc = '/pwa-192x192.png', // use an icon from your manifest
}) {
  const { canPromptNatively, showIosInstructions, isInstalled, promptInstall } =
    usePwaInstall();

  // In-memory only: resets on every page load / new visit.
  const [dismissed, setDismissed] = useState(false);

  const visible =
    !isInstalled && !dismissed && (canPromptNatively || showIosInstructions);

  useEffect(() => {
    if (!visible) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && setDismissed(true);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  if (!visible) return null;

  const handleInstall = async () => {
    const outcome = await promptInstall();
    // accepted -> isInstalled flips and the popup unmounts
    // dismissed -> hide for the rest of this visit (the event can't be reused)
    if (outcome === 'dismissed') setDismissed(true);
  };

  return (
    <div
      className="pwa-install"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      <button
        type="button"
        className="pwa-install__close"
        onClick={() => setDismissed(true)}
        aria-label="Close install prompt"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="pwa-install__header">
        <img className="pwa-install__icon" src={iconSrc} alt="" width="56" height="56" />
        <div>
          <h2 id="pwa-install-title" className="pwa-install__title">{appName}</h2>
          <p id="pwa-install-desc" className="pwa-install__desc">{description}</p>
        </div>
      </div>

      {canPromptNatively ? (
        <button type="button" className="pwa-install__btn" onClick={handleInstall}>
          Install App
        </button>
      ) : (
        <ol className="pwa-install__steps">
          <li>
            Tap the <strong>Share</strong> button
            <svg className="pwa-install__share" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            in Safari's toolbar.
          </li>
          <li>Scroll down and choose <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong> to finish.</li>
        </ol>
      )}
    </div>
  );
}