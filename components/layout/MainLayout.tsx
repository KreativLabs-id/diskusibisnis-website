'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile Sidebar Overlay with blur effect */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-white/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Top Navigation - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white h-16">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </header>
      
      {/* Sidebar - Fixed position */}
      <aside className={`
        fixed left-0 top-16 bottom-0 z-40 w-64 bg-white border-r border-slate-200 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:z-30
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onItemClick={() => setSidebarOpen(false)} />
      </aside>
      
      {/* Main Content Area - Adjusted for fixed sidebar on desktop */}
      <div className="flex flex-col flex-1 mt-16 lg:ml-64">
        {/* Main Content */}
        <main className="flex-1 px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8 w-full overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </main>
        
        {/* Footer - Separate from sidebar */}
        <footer className="bg-white border-t border-slate-200 py-6 px-3 sm:px-4 lg:px-6 mt-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-slate-600">
              © 2025 DiskusiBisnis. Platform Q&A untuk UMKM Indonesia.
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="/about" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">
                Tentang
              </a>
              <a href="/privacy" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">
                Privasi
              </a>
              <a href="/terms" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">
                Syarat & Ketentuan
              </a>
              <a href="/help" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">
                Bantuan
              </a>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
