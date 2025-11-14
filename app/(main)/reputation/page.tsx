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
      const response = await fetch(`/api/users/${user?.id}/rank`);
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
      const response = await fetch(`/api/users/${user?.id}/activities`);
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Reputasi Anda</h1>
            <p className="text-slate-600 text-sm sm:text-base">Lacak perkembangan kontribusi Anda di komunitas</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Reputasi</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{user.reputationPoints || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Minggu Ini</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">+25</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Peringkat</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {userRank ? `#${userRank}` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Aktivitas Terbaru</h2>
          <p className="text-sm text-slate-600 mt-1">Riwayat perolehan poin reputasi Anda</p>
        </div>

        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="h-6 w-12 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center">
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum Ada Aktivitas</h3>
              <p className="text-slate-600 mb-6">
                Mulai berkontribusi dengan bertanya atau menjawab pertanyaan untuk mendapatkan poin reputasi.
              </p>
              <Link
                href="/questions"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Jelajahi Pertanyaan
              </Link>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 mb-1">{activity.description}</p>
                    {activity.questionTitle && (
                      <Link
                        href={`/questions/${activity.questionId}`}
                        className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        {activity.questionTitle}
                      </Link>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(activity.date)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      +{activity.points}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* How Reputation Works */}
      <div className="mt-8 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Cara Kerja Reputasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">+10</span>
              <span>Jawaban Anda mendapat upvote</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">+15</span>
              <span>Jawaban Anda diterima sebagai terbaik</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">+5</span>
              <span>Pertanyaan Anda mendapat upvote</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold">-2</span>
              <span>Pertanyaan/jawaban Anda mendapat downvote</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold">-1</span>
              <span>Anda memberikan downvote</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
