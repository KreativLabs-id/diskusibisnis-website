// PWA Install Prompt Handler
export class PWAInstaller {
  private deferredPrompt: any = null;
  private isInstalled = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('[PWA] App is installed');
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('[PWA] Install prompt ready');
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwaInstallAvailable'));
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      console.log('[PWA] App installed successfully');
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwaInstalled'));
    });

    // Register service worker
    this.registerServiceWorker();

    // Listen for service worker updates
    this.listenForUpdates();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registered:', registration);

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    }
  }

  private listenForUpdates() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker activated');
        
        // Dispatch custom event untuk update modal
        window.dispatchEvent(new CustomEvent('pwaUpdateAvailable'));
      });
    }
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    // Show install prompt
    this.deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await this.deferredPrompt.userChoice;
    
    console.log('[PWA] User choice:', outcome);

    this.deferredPrompt = null;

    return outcome === 'accepted';
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('[PWA] Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  public async showNotification(title: string, options?: NotificationOptions) {
    const permission = await this.requestNotificationPermission();

    if (permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          ...options,
        });
      } else {
        new Notification(title, {
          icon: '/icons/icon-192x192.png',
          ...options,
        });
      }
    }
  }

  public async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    }
  }
}

// Create singleton instance
export const pwaInstaller = typeof window !== 'undefined' ? new PWAInstaller() : null;
