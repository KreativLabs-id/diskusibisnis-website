'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  MessageCircleQuestion,
  Tag,
  Bookmark,
  Users,
  Trophy,
  TrendingUp,
  Clock,
  HelpCircle,
  Users2,
  User,
  Settings,
  LogOut,
  Download,
  Mail,
  Inbox
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { pwaInstaller } from '@/lib/pwa-installer';

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  count?: number;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon: Icon, label, isActive, count, onClick }) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'
          }`} />
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:group-hover:bg-slate-600'
          }`}>
          {count}
        </span>
      )}
    </Link>
  );
};

interface SidebarProps {
  onItemClick?: () => void;
}

export default function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if PWA can be installed
    const checkInstallability = () => {
      if (pwaInstaller) {
        setCanInstall(pwaInstaller.canInstall());
        setIsInstalled(pwaInstaller.isAppInstalled());
      }
    };

    checkInstallability();

    // Listen for install events
    const handleInstallAvailable = () => {
      setCanInstall(true);
      setIsInstalled(false);
    };

    const handleInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
      setIsInstalling(false);
    };

    window.addEventListener('pwaInstallAvailable', handleInstallAvailable);
    window.addEventListener('pwaInstalled', handleInstalled);

    return () => {
      window.removeEventListener('pwaInstallAvailable', handleInstallAvailable);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!pwaInstaller) return;

    setIsInstalling(true);
    const accepted = await pwaInstaller.promptInstall();

    if (!accepted) {
      setIsInstalling(false);
    }
  };

  const publicItems = [
    { href: '/', icon: Home, label: 'Beranda' },
    { href: '/questions', icon: MessageCircleQuestion, label: 'Pertanyaan' },
    { href: '/tags', icon: Tag, label: 'Tag' },
    { href: '/users', icon: Users, label: 'Pengguna' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  const userItems = user ? [
    { href: '/saved', icon: Bookmark, label: 'Tersimpan' },
    { href: '/reputation', icon: Trophy, label: 'Reputasi', count: user.reputationPoints },
  ] : [];

  const profileItems = user ? [
    { href: `/profile/${user.username || user.id}`, icon: User, label: 'Profil Saya' },
    { href: '/settings', icon: Settings, label: 'Pengaturan' },
  ] : [];

  const interestingItems = [
    { href: '/questions?sort=popular', icon: TrendingUp, label: 'Pertanyaan Populer' },
    { href: '/questions?sort=newest', icon: Clock, label: 'Pertanyaan Terbaru' },
    { href: '/unanswered', icon: HelpCircle, label: 'Belum Terjawab' },
  ];

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="p-4 sm:p-6 space-y-6 flex-1">
        {/* Main Navigation */}
        <div>
          <nav className="space-y-1">
            {publicItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
                onClick={onItemClick}
              />
            ))}
          </nav>
        </div>

        {/* User-specific items */}
        {loading ? (
          <div>
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-500 mb-3 px-4">
                Pribadi
              </h3>
              <div className="px-4 py-2.5">
                <LoadingSpinner size="sm" text="Memuat..." />
              </div>
            </div>
          </div>
        ) : user && userItems.length > 0 && (
          <div>
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-500 mb-3 px-4">
                Pribadi
              </h3>
              <nav className="space-y-1">
                {userItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    count={item.count}
                    isActive={pathname === item.href}
                    onClick={onItemClick}
                  />
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Profile Section - Mobile Only */}
        {loading ? (
          <div className="lg:hidden">
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-500 mb-3 px-4">
                Akun
              </h3>
              <div className="px-4 py-2.5">
                <LoadingSpinner size="sm" text="Memuat..." />
              </div>
            </div>
          </div>
        ) : user && profileItems.length > 0 && (
          <div className="lg:hidden">
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-500 mb-3 px-4">
                Akun
              </h3>
              <nav className="space-y-1">
                {profileItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={pathname === item.href}
                    onClick={onItemClick}
                  />
                ))}
                <button
                  onClick={() => {
                    logout();
                    onItemClick?.();
                  }}
                  className="group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Interesting Section */}
        <div>
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-500 mb-3 px-4">
              Menarik
            </h3>
            <nav className="space-y-1">
              {interestingItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                  onClick={onItemClick}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Communities Section */}
        <div>
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-500 mb-3 px-4">
              Komunitas
            </h3>
            <nav className="space-y-1">
              <SidebarItem
                href="/communities"
                icon={Users2}
                label="Jelajahi Komunitas"
                isActive={pathname === '/communities'}
                onClick={onItemClick}
              />
            </nav>
          </div>
        </div>

        {/* Help/Support Section */}
        <div>
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-500 mb-3 px-4">
              Bantuan
            </h3>
            <nav className="space-y-1">
              <SidebarItem
                href="/contact"
                icon={Mail}
                label="Hubungi Kami"
                isActive={pathname === '/contact'}
                onClick={onItemClick}
              />
              {/* Tiket Saya only for logged in users */}
              {user && (
                <SidebarItem
                  href="/contact/my-tickets"
                  icon={Inbox}
                  label="Tiket Saya"
                  isActive={pathname === '/contact/my-tickets'}
                  onClick={onItemClick}
                />
              )}
            </nav>
          </div>
        </div>

        {/* PWA Install Button - Only show if not installed */}
        {canInstall && !isInstalled && (
          <div className="pt-2">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Installing...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <div className="text-left flex-1">
                    <div className="text-sm font-semibold">Install Aplikasi</div>
                    <div className="text-xs text-green-100">Akses lebih cepat</div>
                  </div>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
