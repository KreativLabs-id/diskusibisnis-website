'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Award, MessageSquare, CheckCircle, Edit, ArrowLeft } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';

interface UserProfile {
  id: string;
  displayName: string;
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
  const isOwnProfile = currentUser?.id === idOrUsername;

  const fetchProfile = async () => {
    try {
      // Jika UUID gunakan endpoint lama, jika username gunakan endpoint baru
      const response = isUUID 
        ? await userAPI.getProfile(idOrUsername)
        : await userAPI.getProfileByUsername(idOrUsername);
      // Extract user data correctly
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
      
      // Map snake_case to camelCase
      setProfile({
        id: userData.id,
        displayName: userData.displayName || userData.display_name || 'User',
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
      // Extract questions data correctly
      let questionsData = [];
      if (response.data.data && response.data.data.questions) {
        questionsData = response.data.data.questions;
      } else if (response.data.questions) {
        questionsData = response.data.questions;
      } else if (response.data.data) {
        questionsData = response.data.data;
      }
      
      // Map snake_case to camelCase
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
      // Extract answers data correctly
      let answersData = [];
      if (response.data.data && response.data.data.answers) {
        answersData = response.data.data.answers;
      } else if (response.data.answers) {
        answersData = response.data.answers;
      } else if (response.data.data) {
        answersData = response.data.data;
      }
      
      // Map snake_case to camelCase
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[1,2].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-24 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Profil tidak ditemukan</h3>
          <p className="text-sm text-slate-500">User yang Anda cari tidak ada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <UserAvatar
                src={profile.avatarUrl}
                alt={profile.displayName || 'User'}
                size="xl"
                fallbackName={profile.displayName}
                className="ring-4 ring-emerald-100"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3 sm:gap-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{profile.displayName || 'User'}</h1>
                    <VerifiedBadge isVerified={profile.isVerified || false} size="md" />
                  </div>
                  {profile.email && isOwnProfile && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    Bergabung {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : 'Invalid Date'}
                  </div>
                </div>
                {isOwnProfile && (
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm sm:text-base"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profil
                  </Link>
                )}
              </div>

              {profile.bio && (
                <p className="text-slate-600 mb-4">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Reputasi</p>
                    <p className="text-lg font-bold text-emerald-700">{profile.reputationPoints}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Pertanyaan</p>
                    <p className="text-lg font-bold text-green-700">{questions.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Jawaban</p>
                    <p className="text-lg font-bold text-purple-700">{answers.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'questions'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Pertanyaan ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'answers'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Jawaban ({answers.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'questions' ? (
              questions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Belum ada pertanyaan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <Link
                      key={question.id}
                      href={`/questions/${question.id}`}
                      className="block p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                    >
                      <h3 className="font-semibold text-slate-900 mb-2 hover:text-emerald-600">
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{question.upvotesCount} upvotes</span>
                        <span>{question.answersCount} jawaban</span>
                        <span>{question.viewsCount} views</span>
                        <span>{new Date(question.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              answers.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Belum ada jawaban</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {answers.map((answer) => (
                    <div
                      key={answer.id}
                      className="p-4 border border-slate-200 rounded-xl"
                    >
                      <Link
                        href={`/questions/${answer.questionId}`}
                        className="font-semibold text-slate-900 hover:text-emerald-600 mb-2 block"
                      >
                        {answer.questionTitle}
                      </Link>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{answer.content}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{answer.upvotesCount} upvotes</span>
                        {answer.isAccepted && (
                          <span className="text-green-600 font-medium">✓ Diterima</span>
                        )}
                        <span>{new Date(answer.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
