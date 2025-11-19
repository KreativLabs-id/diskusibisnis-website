'use client';

import { useState, useEffect, useRef } from 'react';
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
  User,
  TrendingUp,
  Target
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

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
  const joiningRef = useRef(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'overview' | 'members'>('questions');
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { }, type: 'danger' });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    if (params.slug) {
      console.log('Fetching community data for slug:', params.slug, 'user:', user?.id);
      fetchCommunity();
      fetchMembers();
      fetchQuestions();
    }
  }, [params.slug, user?.id]); // Re-fetch when user changes

  // Force refresh when joining state changes (after operation completes)
  useEffect(() => {
    if (!joining && community && user) {
      console.log('Joining completed, checking membership status');
      // Small delay to ensure backend has processed
      const timer = setTimeout(() => {
        fetchCommunity();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [joining]);

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/communities/${params.slug}`);
      const communityData = response.data.data.community;
      console.log('Community data fetched:', {
        is_member: communityData.is_member,
        user_role: communityData.user_role
      });
      setCommunity(communityData);
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

    // Prevent if already member or already joining (using ref for immediate check)
    if (community?.is_member || joining || joiningRef.current) {
      console.log('Join prevented - already member or processing');
      return;
    }

    console.log('Attempting to join community:', params.slug);
    joiningRef.current = true;
    setJoining(true);
    try {
      const response = await api.post(`/communities/${params.slug}/join`);
      console.log('Join response:', response.data);

      if (response.data.success) {
        // Update state only if not already member
        const alreadyMember = response.data.data?.already_member;
        console.log('Already member?', alreadyMember);

        // Force refresh community data from server to ensure sync
        await fetchCommunity();
        await fetchMembers();

        if (!alreadyMember) {
          showAlert('success', 'Berhasil', 'Anda telah bergabung dengan komunitas');
        }
      }
    } catch (error: any) {
      console.error('Error joining community:', error);

      // If error says already a member, just refresh the community data
      const errorMessage = error.response?.data?.message || '';
      if (error.response?.status === 400 && errorMessage.toLowerCase().includes('already')) {
        // User is already a member, just refresh to update UI
        await fetchCommunity();
        await fetchMembers();
      } else {
        showAlert('error', 'Gagal Bergabung', errorMessage || 'Gagal bergabung dengan komunitas');
      }
    } finally {
      setJoining(false);
      joiningRef.current = false;
    }
  };

  const handleLeaveCommunity = () => {
    if (!user) return;

    // Prevent if not member or already processing (using ref for immediate check)
    if (!community?.is_member || joining || joiningRef.current) {
      console.log('Leave prevented - not member or processing');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Keluar dari Komunitas',
      message: 'Apakah Anda yakin ingin keluar dari komunitas ini?',
      type: 'warning',
      onConfirm: async () => {
        joiningRef.current = true;
        setJoining(true);
        try {
          const response = await api.post(`/communities/${params.slug}/leave`);

          if (response.data.success) {
            const alreadyLeft = response.data.data?.already_left;
            setCommunity(prev => prev ? {
              ...prev,
              is_member: false,
              members_count: alreadyLeft ? prev.members_count : Math.max(0, prev.members_count - 1)
            } : null);
            fetchMembers();

            if (!alreadyLeft) {
              showAlert('success', 'Berhasil', 'Anda telah keluar dari komunitas');
            }
          }
        } catch (error: any) {
          console.error('Error leaving community:', error);
          showAlert('error', 'Gagal Keluar', error.response?.data?.message || 'Gagal keluar dari komunitas');
        } finally {
          setJoining(false);
          joiningRef.current = false;
        }
      }
    });
  };

  const handlePromoteMember = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Promosi Anggota',
      message: 'Promosikan anggota ini menjadi admin?',
      type: 'info',
      onConfirm: async () => {
        try {
          await api.post(`/communities/${params.slug}/members/${userId}/promote`);
          showAlert('success', 'Berhasil', 'Anggota berhasil dipromosikan menjadi admin');
          fetchMembers();
        } catch (error: any) {
          showAlert('error', 'Gagal', error.response?.data?.message || 'Gagal mempromosikan anggota');
        }
      }
    });
  };

  const handleDemoteMember = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Turunkan Admin',
      message: 'Turunkan admin ini menjadi anggota biasa?',
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.post(`/communities/${params.slug}/members/${userId}/demote`);
          showAlert('success', 'Berhasil', 'Admin berhasil diturunkan menjadi anggota');
          fetchMembers();
        } catch (error: any) {
          showAlert('error', 'Gagal', error.response?.data?.message || 'Gagal menurunkan admin');
        }
      }
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'moderator':
        return <Settings className="w-4 h-4 text-emerald-600" />;
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
              {[1, 2, 3, 4, 5, 6].map(i => (
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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:hidden flex items-center gap-3 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 truncate flex-1">{community.name}</h1>
        {user && !community.is_member && (
          <button
            onClick={handleJoinCommunity}
            disabled={joining}
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {joining ? '...' : 'Gabung'}
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Desktop Back Button */}
        <button
          onClick={() => router.back()}
          className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Kembali ke Komunitas</span>
        </button>

        {/* Community Header */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-8 relative">
          {/* Decorative Background */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-emerald-600 to-emerald-800 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>

          <div className="px-4 sm:px-8 pb-6 sm:pb-8 relative">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 -mt-12 sm:-mt-16">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl p-1.5 shadow-lg shrink-0 mx-auto sm:mx-0">
                <div className="w-full h-full bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-3xl sm:text-4xl border border-emerald-100">
                  {community.name.charAt(0)}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left pt-4 sm:pt-20">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{community.name}</h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-slate-600 mb-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                        {community.category}
                      </span>
                      {community.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {community.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {community.members_count} anggota
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto sm:mx-0 mb-4">
                      {community.description}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>Dibuat {formatDate(community.created_at)} oleh <span className="font-medium text-slate-600">{community.creator_name}</span></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 w-full sm:w-auto min-w-[140px]">
                    {user && !community.is_member && (
                      <button
                        onClick={handleJoinCommunity}
                        disabled={joining}
                        className="flex items-center justify-center gap-2 w-full px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {joining ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                        <div className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-medium">
                          <Users className="w-4 h-4" />
                          <span>Member</span>
                          {community.user_role === 'admin' && (
                            <Crown className="w-4 h-4 text-yellow-500 ml-1" />
                          )}
                        </div>
                        <button
                          onClick={handleLeaveCommunity}
                          disabled={joining}
                          className="text-xs text-red-500 hover:text-red-600 hover:underline py-1"
                        >
                          Keluar Komunitas
                        </button>
                      </>
                    )}

                    {!user && (
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-600/20"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Login untuk Gabung</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'questions'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            Diskusi
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'questions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {questions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
          >
            <Tag className="w-4 h-4" />
            Tentang
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'members'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
          >
            <Users className="w-4 h-4" />
            Anggota
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'members' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {community.members_count}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Diskusi Terbaru</h3>
                {community.is_member && (
                  <Link
                    href={`/ask?community=${community.slug}`}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Buat Pertanyaan
                  </Link>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Belum ada diskusi</h3>
                  <p className="text-slate-500 mb-6">Jadilah yang pertama memulai diskusi di komunitas ini!</p>
                  {community.is_member && (
                    <Link
                      href={`/ask?community=${community.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium"
                    >
                      Mulai Diskusi
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <Link
                      key={question.id}
                      href={`/questions/${question.id}`}
                      className="block bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                            {question.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4" />
                              <span>{question.answer_count} jawaban</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                              <TrendingUp className="w-4 h-4" />
                              <span>{question.upvote_count} upvote</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              src={question.author_avatar}
                              alt={question.author_name}
                              size="xs"
                              fallbackName={question.author_name}
                            />
                            <span className="text-xs font-medium text-slate-700">{question.author_name}</span>
                            {question.tags?.map((tag: any) => (
                              <span key={tag.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full font-medium">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Tentang Komunitas</h3>
                    <Link
                      href={`/communities/${community.slug}/about`}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Lihat Selengkapnya →
                    </Link>
                  </div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {community.description}
                  </p>

                  {community.vision && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-600" />
                        Visi
                      </h4>
                      <p className="text-slate-600 text-sm">{community.vision}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Informasi</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Kategori</p>
                        <p className="text-sm font-medium text-slate-900">{community.category}</p>
                      </div>
                    </div>
                    {community.location && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Lokasi</p>
                          <p className="text-sm font-medium text-slate-900">{community.location}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Dibuat pada</p>
                        <p className="text-sm font-medium text-slate-900">{formatDate(community.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Anggota ({members.length})</h3>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Belum ada anggota</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 hover:shadow-md transition-all">
                      <UserAvatar
                        src={member.avatar_url}
                        alt={member.display_name}
                        size="md"
                        fallbackName={member.display_name}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-slate-900 truncate text-sm">{member.display_name}</p>
                          <VerifiedBadge isVerified={member.is_verified || false} size="sm" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          {getRoleIcon(member.role)}
                          <span>{getRoleLabel(member.role)}</span>
                        </div>
                      </div>

                      {user && community.created_by === user.id && member.user_id !== user.id && (
                        <div className="relative group">
                          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                            <Settings className="w-4 h-4" />
                          </button>
                          {/* Dropdown menu could go here, simplified for now */}
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 hidden group-hover:block z-10 p-1">
                            {member.role === 'member' ? (
                              <button
                                onClick={() => handlePromoteMember(member.user_id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg"
                              >
                                Jadikan Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDemoteMember(member.user_id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-yellow-50 text-slate-700 hover:text-yellow-700 rounded-lg"
                              >
                                Turunkan Admin
                              </button>
                            )}
                          </div>
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

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
