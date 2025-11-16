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
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import AlertModal from '@/components/ui/AlertModal';

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
  vision?: string;
  mission?: string;
  target_members?: string;
  benefits?: string;
}

interface Member {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  role: string;
  joined_at: string;
  is_verified?: boolean;
}

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'overview' | 'members'>('questions');
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    if (params.slug) {
      fetchCommunity();
      fetchMembers();
      fetchQuestions();
    }
  }, [params.slug]);

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/communities/${params.slug}`);
      setCommunity(response.data.data.community);
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/communities/${params.slug}/members`);
      setMembers(response.data.data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/communities/${params.slug}/questions`);
      setQuestions(response.data.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      showAlert('warning', 'Login Diperlukan', 'Silakan login untuk bergabung dengan komunitas');
      return;
    }

    setJoining(true);
    try {
      const response = await api.post(`/communities/${params.slug}/join`);
      
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
      showAlert('error', 'Gagal Bergabung', error.response?.data?.message || 'Gagal bergabung dengan komunitas');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user) return;

    if (!window.confirm('Apakah Anda yakin ingin keluar dari komunitas ini?')) {
      return;
    }

    setJoining(true);
    try {
      const response = await api.post(`/communities/${params.slug}/leave`);
      
      if (response.data.success) {
        setCommunity(prev => prev ? {
          ...prev,
          is_member: false,
          members_count: Math.max(0, prev.members_count - 1)
        } : null);
        fetchMembers();
        showAlert('success', 'Berhasil', 'Anda telah keluar dari komunitas');
      }
    } catch (error: any) {
      console.error('Error leaving community:', error);
      showAlert('error', 'Gagal Keluar', error.response?.data?.message || 'Gagal keluar dari komunitas');
    } finally {
      setJoining(false);
    }
  };

  const handlePromoteMember = async (userId: string) => {
    if (!window.confirm('Promosikan anggota ini menjadi admin?')) {
      return;
    }

    try {
      await api.post(`/communities/${params.slug}/members/${userId}/promote`);
      showAlert('success', 'Berhasil', 'Anggota berhasil dipromosikan menjadi admin');
      fetchMembers();
    } catch (error: any) {
      showAlert('error', 'Gagal', error.response?.data?.message || 'Gagal mempromosikan anggota');
    }
  };

  const handleDemoteMember = async (userId: string) => {
    if (!window.confirm('Turunkan admin ini menjadi anggota biasa?')) {
      return;
    }

    try {
      await api.post(`/communities/${params.slug}/members/${userId}/demote`);
      showAlert('success', 'Berhasil', 'Admin berhasil diturunkan menjadi anggota');
      fetchMembers();
    } catch (error: any) {
      showAlert('error', 'Gagal', error.response?.data?.message || 'Gagal menurunkan admin');
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl p-8 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-8 bg-slate-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                  <div className="h-6 bg-slate-200 rounded"></div>
                  <div className="h-16 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
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

              {/* Join/Leave Buttons - Mobile optimized */}
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
                  <>
                    <div className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-sm sm:text-base">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">Sudah Bergabung</span>
                      {community.user_role === 'admin' && (
                        <Crown className="w-4 h-4 text-yellow-600 ml-1" />
                      )}
                    </div>
                    <button
                      onClick={handleLeaveCommunity}
                      disabled={joining}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors text-sm disabled:opacity-50"
                    >
                      Keluar dari Komunitas
                    </button>
                  </>
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
                onClick={() => setActiveTab('questions')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'questions'
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Diskusi ({questions.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Tentang</span>
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
            {activeTab === 'questions' && (
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    Pertanyaan ({questions.length})
                  </h3>
                  {community.is_member && (
                    <Link
                      href={`/ask?community=${community.slug}`}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 text-white text-xs sm:text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Buat Pertanyaan</span>
                      <span className="sm:hidden">Tanya</span>
                    </Link>
                  )}
                </div>
                
                {questions.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-slate-500 mb-4">Belum ada pertanyaan dalam komunitas ini</p>
                    {community.is_member && (
                      <Link
                        href={`/ask?community=${community.slug}`}
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white text-sm sm:text-base rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Buat Pertanyaan Pertama</span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {questions.map((question) => (
                      <Link
                        key={question.id}
                        href={`/questions/${question.id}`}
                        className="block p-4 sm:p-5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                      >
                        <h4 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 line-clamp-2">
                          {question.title}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{question.answer_count} jawaban</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-600 font-medium">↑ {question.upvote_count}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              src={question.author_avatar}
                              alt={question.author_name}
                              size="xs"
                              fallbackName={question.author_name}
                            />
                            <span className="truncate">{question.author_name}</span>
                            {question.author_verified && (
                              <VerifiedBadge isVerified={true} size="sm" />
                            )}
                          </div>
                        </div>
                        
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {question.tags.map((tag: any) => (
                              <span
                                key={tag.id}
                                className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Tentang Komunitas</h3>
                  <Link
                    href={`/communities/${community.slug}/about`}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Lihat Detail →
                  </Link>
                </div>
                
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                  {community.description}
                </p>
                
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
                      <div key={member.id} className="flex flex-col gap-2 p-3 sm:p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={member.avatar_url}
                            alt={member.display_name}
                            size="md"
                            fallbackName={member.display_name}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm sm:text-base font-medium text-slate-900 truncate">
                                {member.display_name}
                              </p>
                              <VerifiedBadge isVerified={member.is_verified || false} size="sm" />
                              {getRoleIcon(member.role)}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500">
                              {getRoleLabel(member.role)} • Bergabung {formatDate(member.joined_at)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Admin Actions */}
                        {user && community.created_by === user.id && member.user_id !== user.id && (
                          <div className="flex gap-2 mt-2">
                            {member.role === 'member' && (
                              <button
                                onClick={() => handlePromoteMember(member.user_id)}
                                className="flex-1 px-3 py-1.5 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600"
                              >
                                Jadikan Admin
                              </button>
                            )}
                            {member.role === 'admin' && (
                              <button
                                onClick={() => handleDemoteMember(member.user_id)}
                                className="flex-1 px-3 py-1.5 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              >
                                Turunkan ke Anggota
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
}
