'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Award, ChevronRight, LayoutGrid,
  X, UserPlus
} from 'lucide-react';
import { userAPI } from '@/lib/api';
import UserAvatar from '@/components/ui/UserAvatar';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { getProfileHref } from '@/lib/profile';
import { cn, formatNumber } from '@/lib/utils';

interface User {
  id: string;
  display_name: string;
  username?: string;
  avatar_url?: string;
  reputation_points: number;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll({ sort: 'reputation' });

      // Extract users data correctly
      let usersData = [];
      if (response.data.data && response.data.data.users) {
        usersData = response.data.data.users;
      } else if (response.data.users) {
        usersData = response.data.users;
      }

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-48"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
              </div>
            </div>
            <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 shadow-sm">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 sm:w-48"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4 sm:w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-14">
        {/* Professional Minimalist Header - Optimized for Mobile */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Pebisnis & Ahli
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Terhubung dengan {users.length} pebisnis aktif di komunitas kami.
          </p>
        </div>

        {/* Integrated Search - Clean UI */}
        <div 
          className="sticky z-40 mb-8"
          style={{ top: 'calc(var(--header-height, 64px) + 0.5rem)' }}
        >
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm flex flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pengguna berdasarkan nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-10 pr-9 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pengguna tidak ditemukan</h3>
            <p className="text-sm text-slate-500 mt-1">Coba gunakan nama lain untuk pencarian kamu.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredUsers.map((user) => (
              <Link
                key={user.id}
                href={getProfileHref({ username: user.username, display_name: user.display_name })}
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <UserAvatar
                      src={user.avatar_url}
                      alt={user.display_name}
                      size="lg"
                      fallbackName={user.display_name}
                    />
                    {user.is_verified && (
                      <div className="absolute -bottom-1 -right-1">
                        <VerifiedBadge isVerified={true} size="sm" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate max-w-[150px] sm:max-w-xs">
                        {user.display_name}
                      </h3>
                      {/* Role Badge */}
                      {user.role === 'admin' ? (
                        <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-bold rounded-md ring-1 ring-purple-500/20">
                          Admin
                        </span>
                      ) : user.role === 'moderator' ? (
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded-md ring-1 ring-blue-500/20">
                          Mod
                        </span>
                      ) : null}
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Award className="w-3.5 h-3.5" />
                        {formatNumber(user.reputation_points)} <span className="hidden sm:inline">Reputasi</span>
                      </div>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[11px] font-medium text-slate-500">
                        Gabung {new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* Minimalist Sub-info */}
        <div className="mt-20 pt-10 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold">Ingin membangun reputasi?</h4>
            <p className="text-slate-500 text-sm mt-1">Bantu sesama pebisnis dengan menjawab pertanyaan mereka.</p>
          </div>
          <Link 
            href="/" 
            className="px-8 py-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Mulai Berkontribusi
          </Link>
        </div>
      </div>
    </div>
  );
}
