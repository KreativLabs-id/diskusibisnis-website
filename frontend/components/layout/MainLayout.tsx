'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import PromoPopupModal from '@/components/PromoPopupModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-20 lg:pb-0 transition-colors duration-200">
      {/* Mobile Sidebar Overlay with blur effect */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Navigation - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 h-14 sm:h-16 transition-colors duration-200">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </header>

      {/* Sidebar - Fixed position */}
      <aside className={`
        fixed left-0 top-14 sm:top-16 bottom-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto transition-colors duration-200
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:z-30
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onItemClick={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content Area - Adjusted for fixed sidebar on desktop */}
      <div className="flex flex-col flex-1 mt-14 sm:mt-16 lg:ml-64">
        {/* Announcement Banner */}
        <div className="px-3 sm:px-4 lg:px-6 pt-4">
          <AnnouncementBanner showOn="all" />
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </main>

        {/* Footer - Separate from sidebar */}
        <footer className="hidden lg:block bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-3 sm:px-4 lg:px-6 mt-8 transition-colors duration-200">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2026 DiskusiBisnis. Platform Q&A untuk UMKM Indonesia.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3">
              <a href="/about" className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Tentang
              </a>
              <a href="/about-community" className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Tentang Komunitas
              </a>
              <a href="/privacy" className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Privasi
              </a>
              <a href="/terms" className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Syarat & Ketentuan
              </a>
              <a href="/help" className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Bantuan
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Action Button - Removed in favor of Bottom Nav */}
      {/* <FloatingActionButton /> */}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Promo Popup Modal */}
      <PromoPopupModal />
    </div>
  );
}
