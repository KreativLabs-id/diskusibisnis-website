'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Bell, User, LogOut, Settings, Plus, Menu, X, ChevronDown, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import { getProfileHref } from '@/lib/profile';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout, loading, forceRefreshUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Mobile Menu Button - Hidden as we use Bottom Nav & Discovery Page */}
          <button
            onClick={onMenuClick}
            className="hidden lg:hidden p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-200" />
          </button>

          {/* Logo - Centered on mobile, left on desktop */}
          <Link href="/" className="group flex-1 lg:flex-none text-center lg:text-left">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-emerald-800 transition-all duration-200">
              DiskusiBisnis
            </span>
          </Link>

          {/* Navigation - Mobile Optimized */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {loading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></div>
              </div>
            ) : user ? (
              <>
                {/* Desktop: Full Tanya Button */}
                <Link
                  href="/ask"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tanya Sesuatu</span>
                </Link>

                {/* Notification - All devices (Hidden on mobile) */}
                <div className="hidden lg:block">
                  <NotificationDropdown />
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 sm:p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                  >
                    <UserAvatar
                      src={user.avatarUrl}
                      alt={user.displayName || 'User'}
                      size="sm"
                      fallbackName={user.displayName}
                      className="border-2 border-slate-100 dark:border-slate-700 group-hover:border-emerald-500 transition-colors"
                    />
                    <div className="text-left hidden lg:block">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block leading-tight">{user.displayName || 'User'}</span>
                      {(user.reputationPoints || 0) >= 10 && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {user.reputationPoints} poin
                      </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 hidden lg:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-52 sm:w-64 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 backdrop-blur-xl z-50">
                      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={user.avatarUrl}
                            alt={user.displayName || 'User'}
                            size="md"
                            fallbackName={user.displayName}
                            className="ring-2 ring-slate-100 dark:ring-slate-700"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{user.displayName || 'User'}</p>
                              <VerifiedBadge isVerified={user.isVerified} size="sm" />
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-bold">
                                {user.reputationPoints || 0} poin
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={getProfileHref(user)}
                        className="flex items-center space-x-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white transition-all duration-200 rounded-xl mx-2 mt-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-bold">Profil Saya</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-3 px-4 py-3 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-200 rounded-xl mx-2 bg-emerald-50 dark:bg-emerald-900/20"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-bold">Panel Admin</span>
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 rounded-xl mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-bold">Pengaturan</span>
                      </Link>
                      <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2 px-2">
                        <button
                          onClick={logout}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-bold">Keluar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Desktop: Login/Register buttons - Hidden on mobile as they are in bottom nav */}
                <div className="hidden md:flex items-center gap-2 sm:gap-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 sm:px-5 sm:py-2.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all duration-200 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    Daftar
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>

      </div>

    </nav>
  );
}
