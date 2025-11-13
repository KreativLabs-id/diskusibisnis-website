'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Tag, 
  Calendar, 
  MessageSquare, 
  UserPlus,
  Settings,
  Crown,
  User
} from 'lucide-react';
import axios from 'axios';
import { formatDate } from '@/lib/utils';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  location?: string;
  created_at: string;
  created_by: string;
  creator_name: string;
  members_count: number;
  is_member: boolean;
  user_role?: string;
}

interface Member {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  role: string;
  joined_at: string;
}

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members'>('overview');

  useEffect(() => {
    if (params.slug) {
      fetchCommunity();
      fetchMembers();
    }
  }, [params.slug]);

  const fetchCommunity = async () => {
    try {
      const response = await axios.get(`/api/communities/${params.slug}`);
      setCommunity(response.data.data.community);
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/api/communities/${params.slug}/members`);
      setMembers(response.data.data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      alert('Silakan login untuk bergabung dengan komunitas');
      return;
    }

    setJoining(true);
    try {
      const response = await axios.post(`/api/communities/${params.slug}/join`);
      
      if (response.data.success) {
        setCommunity(prev => prev ? {
          ...prev,
          is_member: true,
          members_count: prev.members_count + 1
        } : null);
        fetchMembers(); // Refresh members list
      }
    } catch (error: any) {
      console.error('Error joining community:', error);
      alert(error.response?.data?.message || 'Gagal bergabung dengan komunitas');
    } finally {
      setJoining(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'moderator':
        return <Settings className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-slate-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Anggota';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat komunitas...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Komunitas tidak ditemukan</h2>
          <p className="text-slate-600 mb-6">Komunitas yang Anda cari tidak ada atau telah dihapus</p>
          <Link
            href="/communities"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Kembali ke Komunitas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-4 sm:mb-6 transition-colors p-2 -ml-2 rounded-lg hover:bg-emerald-50"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-medium">Kembali</span>
        </button>

        {/* Community Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Mobile-first header layout */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 break-words">{community.name}</h1>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{community.category}</span>
                      </div>
                      {community.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{community.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{community.members_count} anggota</span>
                      </div>
                    </div>
                  </div>
                </div>
              
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                  {community.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="break-words">Dibuat {formatDate(community.created_at)} oleh {community.creator_name}</span>
                </div>
              </div>

              {/* Join Button - Mobile optimized */}
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                {user && !community.is_member && (
                  <button
                    onClick={handleJoinCommunity}
                    disabled={joining}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
                  >
                    {joining ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Bergabung...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Bergabung</span>
                      </>
                    )}
                  </button>
                )}
              
                {community.is_member && (
                  <div className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-sm sm:text-base">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Sudah Bergabung</span>
                  </div>
                )}
              
                {!user && (
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Login untuk Bergabung</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Ringkasan</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'members'
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Anggota ({community.members_count})</span>
                  <span className="sm:hidden">Anggota</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Tentang Komunitas</h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {community.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Informasi</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg">
                      <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500">Kategori</p>
                        <p className="text-sm sm:text-base font-medium text-slate-900">{community.category}</p>
                      </div>
                    </div>
                    
                    {community.location && (
                      <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                        <div>
                          <p className="text-xs sm:text-sm text-slate-500">Lokasi</p>
                          <p className="text-sm sm:text-base font-medium text-slate-900">{community.location}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500">Total Anggota</p>
                        <p className="text-sm sm:text-base font-medium text-slate-900">{community.members_count} orang</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500">Dibuat</p>
                        <p className="text-sm sm:text-base font-medium text-slate-900">{formatDate(community.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">
                  Anggota Komunitas ({members.length})
                </h3>
                
                {members.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Users className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-slate-500">Belum ada anggota dalam komunitas ini</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.display_name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                            <span className="text-white text-xs sm:text-sm font-medium">
                              {member.display_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm sm:text-base font-medium text-slate-900 truncate">
                              {member.display_name}
                            </p>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500">
                            {getRoleLabel(member.role)} • Bergabung {formatDate(member.joined_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
