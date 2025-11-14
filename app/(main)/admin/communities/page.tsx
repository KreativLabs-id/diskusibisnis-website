'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { Users, Ban, ArrowLeft, Search, Trash2, Eye, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  is_banned: boolean;
  created_at: string;
  created_by_name: string;
  member_count: number;
  question_count: number;
}

export default function AdminCommunities() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }

    if (user && user.role === 'admin') {
      fetchCommunities();
    }
  }, [user, loading, router]);

  const fetchCommunities = async () => {
    try {
      setCommunitiesLoading(true);
      const response = await adminAPI.getCommunities();
      setCommunities(response.data.data.communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setCommunitiesLoading(false);
    }
  };

  const handleBanCommunity = async (communityId: string, isBanned: boolean) => {
    try {
      if (isBanned) {
        await adminAPI.unbanCommunity(communityId);
      } else {
        await adminAPI.banCommunity(communityId);
      }
      fetchCommunities(); // Refresh the list
    } catch (error) {
      console.error('Error updating community ban status:', error);
    }
  };

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">
          You need admin privileges to access this page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          🏠 Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Community Management</h1>
          </div>
        </div>
        <p className="text-slate-600">Manage communities, ban/unban, and monitor activity</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search communities by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Communities Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Community</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Members</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Questions</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Created</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {communitiesLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCommunities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No communities found
                  </td>
                </tr>
              ) : (
                filteredCommunities.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-slate-900">{c.name}</div>
                        <div className="text-sm text-slate-500">{c.description}</div>
                        <div className="text-xs text-slate-400 mt-1">/{c.slug}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900">{c.member_count}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900">{c.question_count}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.is_banned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {c.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-900">{new Date(c.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">by {c.created_by_name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/communities/${c.slug}`}
                          target="_blank"
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="View community"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleBanCommunity(c.id, c.is_banned)}
                          className={`p-2 rounded-lg transition-colors ${
                            c.is_banned
                              ? 'hover:bg-green-100 text-green-600'
                              : 'hover:bg-orange-100 text-orange-600'
                          }`}
                          title={c.is_banned ? 'Unban community' : 'Ban community'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 text-sm text-slate-500">
        Showing {filteredCommunities.length} of {communities.length} communities
      </div>
    </div>
  );
}
