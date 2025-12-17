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
  CheckCircle,
  ArrowUpRight
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
        return <ThumbsUp className="w-4 h-4 text-emerald-600" />;
      case 'answer_accepted':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'question_posted':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      default:
        return <Star className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="h-8 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Diperlukan</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          Anda perlu login untuk melihat statistik reputasi dan pencapaian Anda.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-600/20"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-200">
      {/* Mobile Header - Clean & Minimalist */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Reputasi</h1>
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800">
            <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{user.reputationPoints || 0}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transform -rotate-3">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Reputasi Anda</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Statistik pencapaian dan kontribusi Anda
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Responsive */}
        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Total Reputation Card */}
          <div className="col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Total Poin</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{user.reputationPoints || 0}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">poin</span>
              </div>
            </div>
          </div>

          {/* Weekly Growth Card */}
          <div className="col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500">Minggu Ini</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-600">+0</span>
                <span className="text-xs sm:text-sm font-medium text-emerald-600/70">poin baru</span>
              </div>
            </div>
          </div>

          {/* Global Rank Card */}
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500">Peringkat Global</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {userRank ? `#${userRank}` : '-'}
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                  Top 1%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content: Activity History */}
          {/* Main Content: Activity History */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold text-slate-900">Riwayat Aktivitas</h2>
              <div className="text-[10px] sm:text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                Terupdate
              </div>
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="divide-y divide-slate-200/50">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="py-4 animate-pulse pt-2">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 sm:h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-2 sm:h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Belum Ada Aktivitas</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
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
                <div className="divide-y divide-slate-200 border-t border-slate-200/50">
                  {activities.map((activity) => (
                    <div key={activity.id} className="py-4 hover:bg-white/50 transition-colors -mx-4 px-4 sm:mx-0 sm:px-0 rounded-xl">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug">
                              {activity.description}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                              +{activity.points}
                            </span>
                          </div>

                          {activity.questionTitle && (
                            <Link
                              href={`/questions/${activity.questionId}`}
                              className="group/link flex items-center gap-1 text-xs sm:text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-1.5 w-fit"
                            >
                              <span className="truncate max-w-[200px] sm:max-w-md">{activity.questionTitle}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </Link>
                          )}

                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-medium">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(activity.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: How it Works */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl flex items-center justify-center border border-white/10">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">Sistem Poin</h3>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-emerald-950/30 rounded-lg sm:rounded-xl border border-emerald-700/30 hover:bg-emerald-950/50 transition-colors">
                    <span className="text-xs sm:text-sm text-emerald-100">Jawaban Terbaik</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400">+15</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-emerald-950/30 rounded-lg sm:rounded-xl border border-emerald-700/30 hover:bg-emerald-950/50 transition-colors">
                    <span className="text-xs sm:text-sm text-emerald-100">Dapat Upvote</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400">+10</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-emerald-950/30 rounded-lg sm:rounded-xl border border-emerald-700/30 hover:bg-emerald-950/50 transition-colors">
                    <span className="text-xs sm:text-sm text-emerald-100">Buat Pertanyaan</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400">+5</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-emerald-950/30 rounded-lg sm:rounded-xl border border-emerald-700/30 hover:bg-emerald-950/50 transition-colors">
                    <span className="text-xs sm:text-sm text-emerald-100">Dapat Downvote</span>
                    <span className="text-xs sm:text-sm font-bold text-red-400">-2</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-emerald-700/30">
                  <p className="text-[10px] sm:text-xs text-emerald-200/80 leading-relaxed text-center">
                    Kumpulkan poin untuk meningkatkan reputasi dan mendapatkan lencana eksklusif.
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
