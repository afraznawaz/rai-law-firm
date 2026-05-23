// Register Service Worker
export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

// PWA Install Prompt
let deferredPrompt: any = null;

export function initPWA() {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    hideInstallBanner();
    deferredPrompt = null;
  });
}

export function triggerInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      hideInstallBanner();
    });
  }
}

function showInstallBanner() {
  const banner = document.getElementById('pwa-banner');
  if (banner) {
    banner.style.display = 'flex';
    setTimeout(() => banner.classList.add('pwa-banner--visible'), 100);
  }
}

export function hideInstallBanner() {
  const banner = document.getElementById('pwa-banner');
  if (banner) {
    banner.classList.remove('pwa-banner--visible');
    setTimeout(() => { banner.style.display = 'none'; }, 400);
  }
}
