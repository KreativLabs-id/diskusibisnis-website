'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Users,
  MessageSquare,
  AlertTriangle,
  Mail,
  Bell,
  Image as ImageIcon,
  Megaphone,
  HeadphonesIcon,
  ChevronLeft,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Users2,
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';

interface AdminNavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const adminNavItems: AdminNavItem[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Kelola Pengguna' },
  { href: '/admin/questions', icon: MessageSquare, label: 'Kelola Pertanyaan' },
  { href: '/admin/communities', icon: Users2, label: 'Kelola Komunitas' },
  { href: '/admin/reports', icon: AlertTriangle, label: 'Laporan' },
  { href: '/admin/support', icon: HeadphonesIcon, label: 'Support Tickets' },
  { href: '/admin/newsletter', icon: Mail, label: 'Newsletter' },
  { href: '/admin/notifications', icon: Bell, label: 'Broadcast' },
  { href: '/admin/popups', icon: ImageIcon, label: 'Popup Promo' },
  { href: '/admin/announcements', icon: Megaphone, label: 'Pengumuman' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Admin Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-14 sm:h-16">
        <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="hidden sm:block">
                <span className="text-slate-900 dark:text-white font-bold text-sm leading-tight block">Admin Panel</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] leading-tight block">DiskusiBisnis</span>
              </div>
            </Link>
          </div>

          {/* Right: User info & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <UserAvatar
                src={user?.avatarUrl}
                alt={user?.displayName || 'Admin'}
                size="sm"
                fallbackName={user?.displayName}
                className="w-7 h-7"
              />
              <div className="hidden md:block text-left pr-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user?.displayName}</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mt-0.5 block">Admin</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 mt-14 sm:mt-16">
        {/* Admin Sidebar */}
        <aside className={`
          fixed left-0 top-14 sm:top-16 bottom-0 z-40 w-60 xl:w-64
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          overflow-y-auto transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="p-4 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 pt-2 pb-3">
              Navigasi Admin
            </p>

            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Kembali ke Situs</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-60 xl:ml-64 min-h-full">
          {/* Breadcrumb bar with "Back to Dashboard" for sub-pages */}
          {pathname !== '/admin' && (
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors group"
                >
                  <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Dashboard
                </Link>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold capitalize">
                  {pathname.split('/').pop()?.replace(/-/g, ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Page content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
