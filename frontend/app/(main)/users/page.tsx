'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Award, MessageSquare, CheckCircle } from 'lucide-react';
import { userAPI } from '@/lib/api';
import UserAvatar from '@/components/ui/UserAvatar';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

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

  const renderSkeleton = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-200" />
            <div className="w-32 h-5 bg-slate-200 rounded" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-200">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:hidden flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pengguna</h1>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-full">
          {users.length}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Pengguna</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Temukan dan terhubung dengan {users.length} pebisnis lainnya
          </p>
        </div>

        {/* Search Bar - Sticky on Mobile */}
        <div className="sticky sm:static top-[60px] z-20 bg-slate-50 dark:bg-slate-950 pt-2 pb-4 sm:py-0 mb-4 sm:mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengguna berdasarkan nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          renderSkeleton
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Pengguna tidak ditemukan
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {searchQuery
                ? `Tidak dapat menemukan pengguna dengan nama "${searchQuery}"`
                : 'Belum ada pengguna terdaftar saat ini'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredUsers.map((user) => {
              const profileLink = user.username || user.id;

              return (
                <Link
                  key={user.id}
                  href={`/profile/${profileLink}`}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Decorative Background */}
                  <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-700 dark:to-slate-800 border-b border-slate-100 dark:border-slate-700"></div>

                  <div className="relative flex flex-col items-center">
                    {/* Avatar with Ring */}
                    <div className="mb-3 p-1 bg-white dark:bg-slate-800 rounded-full ring-1 ring-slate-100 dark:ring-slate-600 shadow-sm group-hover:ring-emerald-100 dark:group-hover:ring-emerald-800 group-hover:scale-105 transition-all duration-300">
                      <UserAvatar
                        src={user.avatar_url}
                        alt={user.display_name}
                        size="lg"
                        fallbackName={user.display_name}
                      />
                    </div>

                    {/* Name & Badge */}
                    <div className="text-center mb-4 w-full">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate max-w-[180px]">
                          {user.display_name}
                        </h3>
                        <VerifiedBadge isVerified={user.is_verified} size="sm" />
                      </div>

                      <div className="flex items-center justify-center gap-2 min-h-[24px]">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800 text-[10px] font-bold uppercase tracking-wider rounded-full">
                            Admin
                          </span>
                        ) : user.role === 'moderator' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-[10px] font-bold uppercase tracking-wider rounded-full">
                            Mod
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">Anggota</span>
                        )}
                      </div>
                    </div>

                    {/* Stats Card */}
                    <div className="w-full bg-slate-50 dark:bg-slate-700 rounded-xl p-3 border border-slate-100 dark:border-slate-600 flex items-center justify-between mb-4 group-hover:bg-emerald-50/30 dark:group-hover:bg-emerald-900/20 group-hover:border-emerald-100 dark:group-hover:border-emerald-800 transition-colors">
                      <div className="flex flex-col items-center flex-1 border-r border-slate-200/60 dark:border-slate-600">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Reputasi</span>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Award className="w-3.5 h-3.5" />
                          {user.reputation_points}
                        </div>
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Bergabung</span>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          {new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Action Hint */}
                    <div className="w-full text-center">
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-center gap-1">
                        Lihat Profil
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
