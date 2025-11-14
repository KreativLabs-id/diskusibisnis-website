'use client';

import { useEffect, useState } from 'react';
import { pwaInstaller } from '@/lib/pwa-installer';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = () => {
      // Tunggu 3 detik sebelum menampilkan prompt
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    const handleInstalled = () => {
      setShowPrompt(false);
      setIsInstalling(false);
      
      // Show success notification
      if (pwaInstaller) {
        pwaInstaller.showNotification('DiskusiBisnis Terinstall!', {
          body: 'Aplikasi berhasil ditambahkan ke home screen Anda.',
          icon: '/icons/icon-192x192.png',
        });
      }
    };

    window.addEventListener('pwaInstallAvailable', handleInstallAvailable);
    window.addEventListener('pwaInstalled', handleInstalled);

    return () => {
      window.removeEventListener('pwaInstallAvailable', handleInstallAvailable);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!pwaInstaller) return;

    setIsInstalling(true);
    const accepted = await pwaInstaller.promptInstall();
    
    if (!accepted) {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Tampilkan lagi setelah 7 hari
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <img 
                src="/icons/icon-96x96.png" 
                alt="DiskusiBisnis" 
                className="w-12 h-12 rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">
                Install DiskusiBisnis
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Install aplikasi untuk akses lebih cepat dan pengalaman yang lebih baik!
              </p>
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Nanti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
