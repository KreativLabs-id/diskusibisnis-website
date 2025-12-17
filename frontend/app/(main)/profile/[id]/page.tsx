'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Award, MessageSquare, CheckCircle, Edit, ArrowLeft, MapPin, Link as LinkIcon, TrendingUp, Settings } from 'lucide-react';
import { userAPI } from '@/lib/api';
import Link from 'next/link';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import ReputationBadge, { ReputationProgress } from '@/components/ui/ReputationBadge';

interface UserProfile {
  id: string;
  displayName: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  reputationPoints: number;
  createdAt: string;
  isVerified?: boolean;
}

interface Question {
  id: string;
  title: string;
  upvotesCount: number;
  answersCount: number;
  viewsCount: number;
  createdAt: string;
}

interface Answer {
  id: string;
  content: string;
  upvotesCount: number;
  isAccepted: boolean;
  questionId: string;
  questionTitle: string;
  createdAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');

  const idOrUsername = params.id as string;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);

  // Check if own profile - compare with loaded profile ID
  const isOwnProfile = currentUser && profile ? currentUser.id === profile.id : false;

  const fetchProfile = async () => {
    try {
      const response = isUUID
        ? await userAPI.getProfile(idOrUsername)
        : await userAPI.getProfileByUsername(idOrUsername);

      let userData = null;
      if (response.data.data && response.data.data.user) {
        userData = response.data.data.user;
      } else if (response.data.user) {
        userData = response.data.user;
      } else if (response.data.data) {
        userData = response.data.data;
      }

      if (!userData) {
        console.error('No user data found');
        return;
      }

      setProfile({
        id: userData.id,
        displayName: userData.displayName || userData.display_name || 'User',
        username: userData.username,
        email: userData.email,
        avatarUrl: userData.avatarUrl || userData.avatar_url,
        bio: userData.bio,
        reputationPoints: userData.reputationPoints || userData.reputation_points || 0,
        createdAt: userData.createdAt || userData.created_at,
        isVerified: userData.isVerified || userData.is_verified || false
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await userAPI.getQuestions(params.id as string);
      let questionsData = [];
      if (response.data.data && response.data.data.questions) {
        questionsData = response.data.data.questions;
      } else if (response.data.questions) {
        questionsData = response.data.questions;
      } else if (response.data.data) {
        questionsData = response.data.data;
      }

      const mappedQuestions = questionsData.map((q: any) => ({
        id: q.id,
        title: q.title,
        upvotesCount: q.upvotes || q.upvotes_count || q.upvotesCount || 0,
        answersCount: q.answer_count || q.answers_count || q.answersCount || 0,
        viewsCount: q.views_count || q.viewsCount || 0,
        createdAt: q.created_at || q.createdAt
      }));

      setQuestions(mappedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchAnswers = async () => {
    try {
      const response = await userAPI.getAnswers(params.id as string);
      let answersData = [];
      if (response.data.data && response.data.data.answers) {
        answersData = response.data.data.answers;
      } else if (response.data.answers) {
        answersData = response.data.answers;
      } else if (response.data.data) {
        answersData = response.data.data;
      }

      const mappedAnswers = answersData.map((a: any) => ({
        id: a.id,
        content: a.content,
        upvotesCount: a.upvotes || a.upvotes_count || a.upvotesCount || 0,
        isAccepted: a.is_accepted || a.isAccepted || false,
        questionId: a.question_id || a.questionId,
        questionTitle: a.question_title || a.questionTitle,
        createdAt: a.created_at || a.createdAt
      }));

      setAnswers(mappedAnswers);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchQuestions();
    fetchAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-6"></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 mb-6 relative -mt-20 mx-4">
              <div className="flex items-end gap-6">
                <div className="w-32 h-32 bg-slate-300 dark:bg-slate-700 rounded-2xl border-4 border-white dark:border-slate-900"></div>
                <div className="flex-1 pb-2">
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Profil tidak ditemukan</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">User yang Anda cari tidak ada</p>
          <button onClick={() => router.back()} className="mt-4 text-emerald-600 dark:text-emerald-400 font-medium">Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-0 sm:px-4 py-0 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4 sm:mb-6 transition-colors group px-4 sm:px-0 pt-4 sm:pt-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 sm:rounded-3xl sm:border border-slate-200 dark:border-slate-800 sm:shadow-sm overflow-hidden mb-6 sm:mb-8 relative">
          {/* Cover Banner */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            {/* Settings Button - Absolute Top Right */}
            {isOwnProfile && (
              <Link
                href="/settings"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-sm z-20 group"
                title="Pengaturan"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </Link>
            )}
          </div>

          <div className="px-6 sm:px-10 pb-8">
            <div className="flex flex-col sm:flex-row gap-6 -mt-12 sm:-mt-20 relative z-10">
              {/* Avatar */}
              <div className="shrink-0 flex flex-col items-center sm:items-start">
                <div className="p-1.5 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                  <UserAvatar
                    src={profile.avatarUrl}
                    alt={profile.displayName || 'User'}
                    size="xl"
                    fallbackName={profile.displayName}
                    className="rounded-xl w-24 h-24 sm:w-32 sm:h-32 text-2xl sm:text-4xl"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 pt-4 sm:pt-24 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{profile.displayName || 'User'}</h1>
                      <VerifiedBadge isVerified={profile.isVerified || false} size="md" />
                      {profile.reputationPoints >= 250 && (
                        <ReputationBadge reputationPoints={profile.reputationPoints} size="sm" />
                      )}
                    </div>
                    {profile.username && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 text-center sm:text-left">@{profile.username}</p>
                    )}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Bergabung {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : ''}
                      </span>
                      {profile.email && isOwnProfile && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          {profile.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwnProfile && (
                    <Link
                      href="/settings"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all font-medium shadow-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profil
                    </Link>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto sm:mx-0 leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto sm:mx-0">
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-2 sm:p-4 text-center">
                    <div className="flex flex-col items-center gap-1 mb-1 text-emerald-600 dark:text-emerald-400">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Reputasi</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">{profile.reputationPoints}</p>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-2 sm:p-4 text-center">
                    <div className="flex flex-col items-center gap-1 mb-1 text-blue-600 dark:text-blue-400">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Tanya</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{questions.length}</p>
                  </div>

                  <div className="bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-2 sm:p-4 text-center">
                    <div className="flex flex-col items-center gap-1 mb-1 text-purple-600 dark:text-purple-400">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Jawab</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-300">{answers.length}</p>
                  </div>
                </div>

                {/* Reputation Progress - Only visible to profile owner */}
                {isOwnProfile && (
                  <div className="mt-6 max-w-lg mx-auto sm:mx-0">
                    <ReputationProgress reputationPoints={profile.reputationPoints} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0 no-scrollbar px-4 sm:px-0">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'questions'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            Pertanyaan
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'questions' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {questions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'answers'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
          >
            <CheckCircle className="w-4 h-4" />
            Jawaban
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'answers' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {answers.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 px-4 sm:px-0">
          {activeTab === 'questions' ? (
            questions.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada pertanyaan yang dibuat</p>
              </div>
            ) : (
              questions.map((question) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="block bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:shadow-md transition-all group"
                >
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-words line-clamp-2">
                    {question.title}
                  </h3>
                  <div className="flex items-center flex-wrap gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <TrendingUp className="w-4 h-4 flex-shrink-0" />
                      {question.upvotesCount} upvotes
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      {question.answersCount} jawaban
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
                    <span className="text-xs">{new Date(question.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </Link>
              ))
            )
          ) : (
            answers.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada jawaban yang diberikan</p>
              </div>
            ) : (
              answers.map((answer) => (
                <div
                  key={answer.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-start gap-2 mb-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="whitespace-nowrap">Menjawab di</span>
                    <Link href={`/questions/${answer.questionId}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline break-words line-clamp-1 flex-1 min-w-0">
                      {answer.questionTitle}
                    </Link>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm mb-3 line-clamp-3 leading-relaxed break-words">{answer.content}</p>
                  <div className="flex items-center flex-wrap gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {answer.upvotesCount} upvotes
                    </span>
                    {answer.isAccepted && (
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Diterima
                      </span>
                    )}
                    <span className="text-xs ml-auto">{new Date(answer.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
