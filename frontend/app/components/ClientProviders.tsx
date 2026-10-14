'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PWAUpdateModal } from '@/components/PWAUpdateModal';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SearchProvider } from '@/contexts/SearchContext';
import WelcomeGuideModal from '@/components/onboarding/WelcomeGuideModal';
import { Suspense } from 'react';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Suspense fallback={null}>
            <SearchProvider>
              <OfflineIndicator />
              {children}
              <WelcomeGuideModal />
              <PWAInstallPrompt />
              <PWAUpdateModal />
            </SearchProvider>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
