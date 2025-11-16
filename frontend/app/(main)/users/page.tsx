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
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Pengguna
            </h1>
            <p className="text-slate-600 text-sm">
              {users.length} pengguna terdaftar
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-colors"
          />
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        renderSkeleton
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Pengguna tidak ditemukan
          </h3>
          <p className="text-slate-500">
            {searchQuery
              ? 'Coba sesuaikan kata kunci pencarian'
              : 'Belum ada pengguna terdaftar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const username = user.username || user.display_name.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            return (
              <Link
                key={user.id}
                href={`/profile/${username}`}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex flex-col items-center space-y-4">
                  {/* Avatar */}
                  <UserAvatar
                    src={user.avatar_url}
                    alt={user.display_name}
                    size="lg"
                    fallbackName={user.display_name}
                  />

                  {/* Name & Badge */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {user.display_name}
                      </h3>
                      <VerifiedBadge isVerified={user.is_verified} size="sm" />
                    </div>
                    {user.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        <Award className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    {user.role === 'moderator' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        <Award className="w-3 h-3" />
                        Moderator
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-slate-900">
                        {user.reputation_points}
                      </span>
                      <span className="hidden sm:inline">reputasi</span>
                    </div>
                  </div>

                  {/* Join Date */}
                  <p className="text-xs text-slate-500">
                    Bergabung {new Date(user.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
