'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PWAUpdateModal } from '@/components/PWAUpdateModal';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <OfflineIndicator />
          {children}
          <PWAInstallPrompt />
          <PWAUpdateModal />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
