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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
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

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6 sm:pt-14">
        {/* Professional Minimalist Header */}
        <div className="hidden sm:flex mb-8 flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
            Reputasi Anda
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-10">
            Statistik pencapaian dan riwayat kontribusi Anda.
          </p>
        </div>

        {/* Stats Container - Single unified box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/60 mb-8">
          
          {/* Total Reputation Card */}
          <div className="flex-1 p-5 flex items-center justify-between sm:flex-col sm:items-start sm:justify-start gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Poin</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.reputationPoints || 0}</span>
              <span className="text-xs font-medium text-slate-500">poin</span>
            </div>
          </div>

          {/* Weekly Growth Card */}
          <div className="flex-1 p-5 flex items-center justify-between sm:flex-col sm:items-start sm:justify-start gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Minggu Ini</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+0</span>
              <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-500/80">poin baru</span>
            </div>
          </div>

          {/* Global Rank Card */}
          <div className="flex-1 p-5 flex items-center justify-between sm:flex-col sm:items-start sm:justify-start gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Peringkat Global</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {userRank ? `#${userRank}` : '-'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                Top 1%
              </span>
            </div>
          </div>

        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content: Activity History */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Riwayat Aktivitas</h2>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                Terupdate
              </div>
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 sm:p-5 animate-pulse">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                          <div className="h-2 sm:h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
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
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-2 leading-snug">
                              {activity.description}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 shrink-0">
                              +{activity.points}
                            </span>
                          </div>

                          {activity.questionTitle && (
                            <Link
                              href={`/questions/${activity.questionId}`}
                              className="group/link flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-1.5 w-fit"
                            >
                              <span className="truncate max-w-[200px] sm:max-w-md">{activity.questionTitle}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </Link>
                          )}

                          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-2">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm sticky top-24">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Sistem Poin</h3>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <div className="flex items-center justify-between p-4 sm:p-5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Jawaban Terbaik</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">+15</span>
                </div>
                <div className="flex items-center justify-between p-4 sm:p-5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dapat Upvote</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">+10</span>
                </div>
                <div className="flex items-center justify-between p-4 sm:p-5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Buat Pertanyaan</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">+5</span>
                </div>
                <div className="flex items-center justify-between p-4 sm:p-5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dapat Downvote</span>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-md">-2</span>
                </div>
              </div>
              
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                  Kumpulkan poin untuk meningkatkan reputasi dan lencana.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
