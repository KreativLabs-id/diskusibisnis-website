'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Award, ChevronRight, UserPlus } from 'lucide-react';
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
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
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pebisnis & Ahli
          </h1>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 mt-1">
            Terhubung dengan {users.length} pebisnis aktif di komunitas kami.
          </p>
        </div>

        {/* Integrated Search - Clean UI */}
        <div 
          className="sticky z-40 mb-12"
          style={{ top: 'calc(var(--header-height, 64px) + 0.5rem)' }}
        >
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white dark:border-slate-800/50 rounded-2xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pengguna berdasarkan nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pengguna tidak ditemukan</h3>
            <p className="text-slate-500 mt-2">Coba gunakan nama lain untuk pencarian kamu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
              <Link
                key={user.id}
                href={getProfileHref({ username: user.username, display_name: user.display_name })}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden flex flex-col items-center text-center"
              >
                {/* Decorative Blur Object */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

                {/* Avatar with Ring */}
                <div className="relative mb-4">
                  <div className="p-1.5 bg-white dark:bg-slate-800 rounded-full ring-1 ring-slate-100 dark:ring-slate-700 shadow-sm group-hover:ring-emerald-500/30 transition-all duration-500 group-hover:scale-105">
                    <UserAvatar
                      src={user.avatar_url}
                      alt={user.display_name}
                      size="xl"
                      fallbackName={user.display_name}
                    />
                  </div>
                  {user.is_verified && (
                    <div className="absolute -bottom-1 -right-1">
                      <VerifiedBadge isVerified={true} size="md" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="mb-6 w-full px-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {user.display_name}
                  </h3>
                  <div className="mt-1 flex items-center justify-center">
                        {user.role === 'admin' ? (
                          <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-full ring-1 ring-purple-500/20">
                            Administrator
                          </span>
                        ) : user.role === 'moderator' ? (
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full ring-1 ring-blue-500/20">
                            Moderator
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                            Anggota Komunitas
                          </span>
                        )}
                  </div>
                </div>

                {/* Stats Container */}
                <div className="w-full grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100/50 dark:border-slate-700/50 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/20 group-hover:border-emerald-500/20 transition-all duration-500">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">Reputasi</span>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        <Award className="w-3.5 h-3.5" />
                        {formatNumber(user.reputation_points)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100/50 dark:border-slate-700/50 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/20 group-hover:border-emerald-500/20 transition-all duration-500">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">Bergabung</span>
                      <span className="text-slate-700 dark:text-slate-200 font-bold text-sm">
                        {new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Link */}
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-xs opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                  Lihat Profil Lengkap <ChevronRight className="w-4 h-4" />
                </div>
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
