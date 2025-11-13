'use client';

import React from 'react';
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
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
      className={`group flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 transition-colors ${
          isActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'
        }`} />
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          isActive ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
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

  const publicItems = [
    { href: '/', icon: Home, label: 'Beranda' },
    { href: '/questions', icon: MessageCircleQuestion, label: 'Pertanyaan' },
    { href: '/tags', icon: Tag, label: 'Tag' },
    { href: '/users', icon: Users, label: 'Pengguna' },
  ];

  const userItems = user ? [
    { href: '/saved', icon: Bookmark, label: 'Tersimpan' },
    { href: '/reputation', icon: Trophy, label: 'Reputasi', count: user.reputationPoints },
  ] : [];

  const profileItems = user ? [
    { href: `/profile/${user.id}`, icon: User, label: 'Profil Saya' },
    { href: '/settings', icon: Settings, label: 'Pengaturan' },
  ] : [];

  const interestingItems = [
    { href: '/questions?sort=popular', icon: TrendingUp, label: 'Pertanyaan Populer' },
    { href: '/questions?sort=newest', icon: Clock, label: 'Pertanyaan Terbaru' },
    { href: '/unanswered', icon: HelpCircle, label: 'Belum Terjawab' },
  ];

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col bg-white">
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
      </div>
    </div>
  );
}
