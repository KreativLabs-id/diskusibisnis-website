'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Bell, User, LogOut, Settings, Plus, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

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
    <nav className="w-full bg-gradient-to-r from-white via-emerald-50/30 to-white border-b border-slate-200/60 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl hover:bg-white/80 hover:shadow-sm transition-all duration-200"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>

          {/* Logo - Simplified */}
          <Link href="/" className="group">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-emerald-800 transition-all duration-200">
              DiskusiBisnis
            </span>
          </Link>


          {/* Navigation - Mobile Optimized */}
          <div className="flex items-center space-x-2">
            {loading ? (
              <>
                <LoadingSpinner size="md" text="Memuat..." className="hidden sm:flex" />
                <LoadingSpinner size="md" text="" className="sm:hidden" />
              </>
            ) : user ? (
              <>
                {/* Desktop: Full Tanya Button */}
                <Link
                  href="/ask"
                  className="hidden md:flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tanya</span>
                </Link>


                <div className="hidden md:block">
                  <NotificationDropdown />
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 hover:bg-white/80 hover:shadow-sm rounded-xl transition-all duration-200 group"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-emerald-300 transition-all"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center group-hover:from-emerald-700 group-hover:to-emerald-800 transition-all">
                        <span className="text-white text-sm font-bold">
                          {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="text-left hidden sm:block">
                      <span className="text-sm font-semibold text-slate-900 block">{user.displayName || 'User'}</span>
                      {(user.reputationPoints || 0) >= 10 && (
                        <span className="text-xs text-emerald-600 font-medium">{user.reputationPoints} poin</span>
                      )}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 backdrop-blur-sm">
                      <div className="px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.displayName || 'User'}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900">{user.displayName || 'User'}</p>
                              <VerifiedBadge isVerified={user.isVerified} size="sm" />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {(user.reputationPoints || 0) >= 10 && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                                  {user.reputationPoints} poin
                                </span>
                              )}
                              {user.reputationPoints >= 100 && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                  Expert
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/profile/${user.id}`}
                        className="flex items-center space-x-3 px-5 py-3 text-slate-700 hover:bg-slate-50 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                          <User className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium">Profil Saya</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-5 py-3 text-slate-700 hover:bg-slate-50 transition-all duration-200 rounded-lg mx-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                          <Settings className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="font-medium">Pengaturan</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-3 px-5 py-3 text-emerald-600 hover:bg-emerald-50 transition-all duration-200 rounded-lg mx-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <Settings className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>
                      )}
                      
                      <div className="border-t border-slate-100 mt-2 pt-2">
                        <button
                          onClick={logout}
                          className="flex items-center space-x-3 w-full px-5 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg mx-2"
                        >
                          <div className="p-1.5 bg-red-100 rounded-lg">
                            <LogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="font-medium">Keluar</span>
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
