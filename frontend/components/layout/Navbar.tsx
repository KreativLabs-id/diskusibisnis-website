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
    <nav className="w-full bg-white sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
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

                {/* Notification - All devices */}
                <NotificationDropdown />

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 sm:p-2 hover:bg-slate-50 rounded-lg transition-colors group"
                  >
                    <UserAvatar
                      src={user.avatarUrl}
                      alt={user.displayName || 'User'}
                      size="sm"
                      fallbackName={user.displayName}
                      className="border-2 border-slate-200 group-hover:border-emerald-300 transition-colors"
                    />
                    <div className="text-left hidden lg:block">
                      <span className="text-sm font-semibold text-slate-900 block leading-tight">{user.displayName || 'User'}</span>
                      {(user.reputationPoints || 0) >= 10 && (
                        <span className="text-xs text-emerald-600 font-medium">{user.reputationPoints} poin</span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-52 sm:w-64 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 py-1.5 sm:py-2 backdrop-blur-sm">
                      <div className="px-3 sm:px-5 py-2.5 sm:py-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <UserAvatar
                            src={user.avatarUrl}
                            alt={user.displayName || 'User'}
                            size="md"
                            fallbackName={user.displayName}
                            className="ring-2 ring-slate-200"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{user.displayName || 'User'}</p>
                              <VerifiedBadge isVerified={user.isVerified} size="sm" />
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                              {(user.reputationPoints || 0) >= 10 && (
                                <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] sm:text-xs font-semibold">
                                  {user.reputationPoints} poin
                                </span>
                              )}
                              {user.reputationPoints >= 100 && (
                                <span className="px-1.5 sm:px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] sm:text-xs font-semibold">
                                  Expert
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/profile/${user.username || user.id}`}
                        className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-5 py-2 sm:py-3 text-slate-700 hover:bg-slate-50 transition-all duration-200 rounded-lg mx-1.5 sm:mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="p-1 sm:p-1.5 bg-emerald-100 rounded-lg">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">Profil Saya</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-5 py-2 sm:py-3 text-slate-700 hover:bg-slate-50 transition-all duration-200 rounded-lg mx-1.5 sm:mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="p-1 sm:p-1.5 bg-slate-100 rounded-lg">
                          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">Pengaturan</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-5 py-2 sm:py-3 text-emerald-600 hover:bg-emerald-50 transition-all duration-200 rounded-lg mx-1.5 sm:mx-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="p-1 sm:p-1.5 bg-emerald-100 rounded-lg">
                            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium">Admin Dashboard</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 mt-1.5 sm:mt-2 pt-1.5 sm:pt-2">
                        <button
                          onClick={logout}
                          className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-5 py-2 sm:py-3 text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg mx-1.5 sm:mx-2"
                        >
                          <div className="p-1 sm:p-1.5 bg-red-100 rounded-lg">
                            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
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

                {/* Mobile: Single consolidated button */}
                <Link
                  href="/login"
                  className="md:hidden p-2.5 text-slate-700 hover:text-emerald-600 transition-colors rounded-xl hover:bg-white/80"
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
