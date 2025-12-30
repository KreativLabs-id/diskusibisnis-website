'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Bell, User, LogOut, Settings, Plus, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';

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
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tanya</span>
                </Link>

                {/* Notification - All devices (Hidden on mobile) */}
                <div className="hidden lg:block">
                  <NotificationDropdown />
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hidden lg:flex items-center gap-2 p-1.5 sm:p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                  >
                    <UserAvatar
                      src={user.avatarUrl}
                      alt={user.displayName || 'User'}
                      size="sm"
                      fallbackName={user.displayName}
                      className="border-2 border-slate-200 dark:border-slate-700 group-hover:border-emerald-300 transition-colors"
                    />
                    <div className="text-left hidden lg:block">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block leading-tight">{user.displayName || 'User'}</span>
                      {(user.reputationPoints || 0) >= 10 && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{user.reputationPoints} poin</span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 hidden lg:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-52 sm:w-64 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 sm:py-2 backdrop-blur-sm">
                      <div className="px-3 sm:px-5 py-2.5 sm:py-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <UserAvatar
                            src={user.avatarUrl}
                            alt={user.displayName || 'User'}
                            size="md"
                            fallbackName={user.displayName}
                            className="ring-2 ring-slate-200 dark:ring-slate-600"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.displayName || 'User'}</p>
                              <VerifiedBadge isVerified={user.isVerified} size="sm" />
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1 flex-wrap">
                              {(user.reputationPoints || 0) >= 10 && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-semibold whitespace-nowrap">
                                  {user.reputationPoints} poin
                                </span>
                              )}
                              {(user.reputationPoints || 0) >= 250 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${(user.reputationPoints || 0) >= 5000
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                  : (user.reputationPoints || 0) >= 1000
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                  }`}>
                                  {(user.reputationPoints || 0) >= 5000 ? 'Legend' : (user.reputationPoints || 0) >= 1000 ? 'Master' : 'Expert'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/profile/${user.username || user.id}`}
                        className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-5 py-2 sm:py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 rounded-lg mx-1.5 sm:mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="p-1 sm:p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">Profil Saya</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-5 py-2 sm:py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 rounded-lg mx-1.5 sm:mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="p-1 sm:p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">Pengaturan</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-5 py-2 sm:py-3 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 rounded-lg mx-1.5 sm:mx-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="p-1 sm:p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium">Admin Dashboard</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-700 mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 px-1.5 sm:px-2">
                        <button
                          onClick={logout}
                          className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-5 py-2 sm:py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg"
                        >
                          <div className="p-1 sm:p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium">Keluar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Desktop: Both buttons */}
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="px-5 py-2.5 text-slate-700 hover:text-emerald-600 transition-all duration-200 font-semibold hover:bg-white/80 rounded-xl"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Daftar
                  </Link>
                </div>

                {/* Mobile: Single consolidated button - Hidden on mobile to keep header clean */}
                <Link
                  href="/login"
                  className="hidden md:hidden p-2.5 text-slate-700 hover:text-emerald-600 transition-colors rounded-xl hover:bg-white/80"
                  title="Masuk / Daftar"
                >
                  <User className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>

        </div>

      </div>

    </nav>
  );
}
