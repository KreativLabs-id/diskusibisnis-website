'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Trophy, 
  MessageSquare, 
  ThumbsUp,
  Calendar,
  MapPin,
  Award
} from 'lucide-react';
import { userAPI } from '@/lib/api';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  reputationPoints: number;
  role: string;
  location?: string;
  bio?: string;
  createdAt: string;
  questionsCount?: number;
  answersCount?: number;
  isVerified?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'reputation' | 'newest' | 'name'>('reputation');

  useEffect(() => {
    fetchUsers();
  }, [sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll({ sort: sortBy });
      const usersData = response.data?.data?.users || response.data?.users || [];
      
      // Map the data to match frontend interface
      const mappedUsers = usersData.map((user: any) => ({
        id: user.id,
        displayName: user.displayName || user.display_name || 'Anonymous',
        email: user.email || '',
        avatarUrl: user.avatarUrl || user.avatar_url,
        reputationPoints: user.reputationPoints || user.reputation_points || 0,
        role: user.role || 'user',
        bio: user.bio,
        createdAt: user.createdAt || user.created_at || new Date().toISOString(),
        questionsCount: user.questionCount || user.question_count || 0,
        answersCount: user.answerCount || user.answer_count || 0,
        isVerified: user.isVerified || user.is_verified || false
      }));
      
      setUsers(Array.isArray(mappedUsers) ? mappedUsers : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    (user.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) : [];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hari ini';
    if (diffInDays === 1) return 'Kemarin';
    if (diffInDays < 30) return `${diffInDays} hari lalu`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} bulan lalu`;
    return `${Math.floor(diffInDays / 365)} tahun lalu`;
  };

  const getUserBadge = (reputation: number) => {
    if (reputation >= 10000) return { name: 'Emas', color: 'text-yellow-600 bg-yellow-100' };
    if (reputation >= 5000) return { name: 'Perak', color: 'text-gray-600 bg-gray-100' };
    if (reputation >= 1000) return { name: 'Perunggu', color: 'text-amber-600 bg-amber-100' };
    return null;
  };

  const renderSkeleton = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
        >
          <div className="flex flex-col items-center text-center">
            {/* Avatar skeleton */}
            <div className="w-20 h-20 bg-slate-200 rounded-full mb-4" />
            
            {/* Name skeleton */}
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
            
            {/* Role badge skeleton */}
            <div className="h-5 w-20 bg-slate-200 rounded-full mb-3" />
            
            {/* Stats skeleton */}
            <div className="flex items-center justify-center gap-4 mb-4 w-full">
              <div className="text-center">
                <div className="h-6 w-12 bg-slate-200 rounded mb-1 mx-auto" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </div>
              <div className="text-center">
                <div className="h-6 w-12 bg-slate-200 rounded mb-1 mx-auto" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </div>
              <div className="text-center">
                <div className="h-6 w-12 bg-slate-200 rounded mb-1 mx-auto" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </div>
            </div>
            
            {/* Bio skeleton */}
            <div className="w-full space-y-2 mb-4">
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-4/5 mx-auto" />
            </div>
            
            {/* Button skeleton */}
            <div className="h-9 bg-slate-200 rounded-lg w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Pengguna</h1>
            <p className="text-slate-600 text-sm">
              {users.length} pengguna dalam komunitas kami
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          />
        </div>
      </div>

      {/* Sort Filters - Separate Row */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setSortBy('reputation')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            sortBy === 'reputation'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Reputasi</span>
        </button>
        <button
          onClick={() => setSortBy('name')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            sortBy === 'name'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Nama</span>
        </button>
        <button
          onClick={() => setSortBy('newest')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            sortBy === 'newest'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Terbaru</span>
        </button>
      </div>

      {/* Users Grid */}
      {loading ? (
        renderSkeleton
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchQuery ? 'Pengguna tidak ditemukan' : 'Belum ada pengguna'}
          </h3>
          <p className="text-slate-500">
            {searchQuery
              ? 'Coba sesuaikan kata kunci pencarian Anda'
              : 'Jadilah yang pertama bergabung dengan komunitas kami!'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredUsers.map((user) => {
            const badge = getUserBadge(user.reputationPoints);
            return (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {(user.displayName || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                        {user.displayName}
                      </h3>
                      <VerifiedBadge isVerified={user.isVerified || false} size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Trophy className="w-4 h-4" />
                        <span className="font-bold text-lg">{user.reputationPoints}</span>
                      </div>
                      {badge && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {user.bio && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {user.bio}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <span>Bergabung {formatTimeAgo(user.createdAt)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {filteredUsers.length > 0 && filteredUsers.length >= 18 && (
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Muat Lebih Banyak Pengguna
          </button>
        </div>
      )}
    </div>
  );
}
