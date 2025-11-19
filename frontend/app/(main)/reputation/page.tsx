'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Trophy,
  TrendingUp,
  Award,
  Star,
  Calendar,
  MessageSquare,
  ThumbsUp,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface ReputationActivity {
  id: string;
  type: 'question_upvote' | 'answer_upvote' | 'answer_accepted' | 'question_posted';
  points: number;
  description: string;
  date: string;
  questionTitle?: string;
  questionId?: string;
}

export default function ReputationPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ReputationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchReputationData();
      fetchUserRank();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserRank = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${user?.id}/rank`);
      if (response.ok) {
        const data = await response.json();
        setUserRank(data.data.rank);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  const fetchReputationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${user?.id}/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching reputation data:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'question_upvote':
      case 'answer_upvote':
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'answer_accepted':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'question_posted':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <Star className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="h-10 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Diperlukan</h2>
        <p className="text-slate-600 mb-6">
          Anda perlu login untuk melihat reputasi Anda.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          Login untuk Melanjutkan
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:hidden flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Trophy className="w-4 h-4 text-yellow-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Reputasi</h1>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
          <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">{user.reputationPoints || 0}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center shadow-sm transform -rotate-3">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Reputasi Anda</h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl">
            Lacak perkembangan kontribusi dan dampak positif yang Anda berikan kepada komunitas.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Total Reputation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Total Poin</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">{user.reputationPoints || 0}</span>
                <span className="text-sm text-slate-400">poin</span>
              </div>
            </div>
          </div>

          {/* Weekly Growth */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Minggu Ini</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-green-600">+25</span>
                <span className="text-sm text-green-600/80 font-medium">poin baru</span>
              </div>
            </div>
          </div>

          {/* Rank */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500">Peringkat Global</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  {userRank ? `#${userRank}` : '-'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                  Top 10%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content: Activity History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Riwayat Aktivitas</h2>
                <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  Terakhir diperbarui: Hari ini
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-100 rounded w-3/4" />
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Belum Ada Aktivitas</h3>
                    <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                      Mulai berkontribusi dengan bertanya atau menjawab untuk mendapatkan poin.
                    </p>
                    <Link
                      href="/questions"
                      className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium text-sm shadow-lg shadow-emerald-600/20"
                    >
                      Mulai Berdiskusi
                    </Link>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-5 hover:bg-slate-50/80 transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:border-slate-200 group-hover:scale-105 transition-all">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-slate-900 text-sm sm:text-base">
                              {activity.description}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                              +{activity.points}
                            </span>
                          </div>

                          {activity.questionTitle && (
                            <Link
                              href={`/questions/${activity.questionId}`}
                              className="block mt-1 text-sm text-emerald-600 hover:text-emerald-700 hover:underline decoration-emerald-300 underline-offset-2 truncate transition-all"
                            >
                              {activity.questionTitle}
                            </Link>
                          )}

                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(activity.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: How it Works */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden sticky top-24">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-bold">Sistem Poin</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-sm text-slate-300">Jawaban Terbaik</span>
                    <span className="text-sm font-bold text-emerald-400">+15</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-sm text-slate-300">Dapat Upvote</span>
                    <span className="text-sm font-bold text-emerald-400">+10</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-sm text-slate-300">Buat Pertanyaan</span>
                    <span className="text-sm font-bold text-emerald-400">+5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-sm text-slate-300">Dapat Downvote</span>
                    <span className="text-sm font-bold text-red-400">-2</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-slate-400 leading-relaxed text-center">
                    Reputasi tinggi membuka fitur eksklusif dan lencana khusus di profil Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
