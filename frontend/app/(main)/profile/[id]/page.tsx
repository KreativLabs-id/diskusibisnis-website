'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Award, MessageSquare, CheckCircle, Edit, ArrowLeft, MapPin, Link as LinkIcon, TrendingUp, ChevronRight } from 'lucide-react';
import { userAPI } from '@/lib/api';
import Link from 'next/link';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import ReputationBadge, { ReputationProgress } from '@/components/ui/ReputationBadge';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileActivityTabs from '@/components/profile/ProfileActivityTabs';

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

  const fetchProfile = async (): Promise<UserProfile | null> => {
    try {
      if (!idOrUsername || idOrUsername === 'undefined') {
        router.replace('/users');
        return null;
      }

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
        return null;
      }

      const nextProfile = {
        id: userData.id,
        displayName: userData.displayName || userData.display_name || 'User',
        username: userData.username,
        email: userData.email,
        avatarUrl: userData.avatarUrl || userData.avatar_url,
        bio: userData.bio,
        reputationPoints: userData.reputationPoints || userData.reputation_points || 0,
        createdAt: userData.createdAt || userData.created_at,
        isVerified: userData.isVerified || userData.is_verified || false
      };

      setProfile(nextProfile);

      if (isUUID && nextProfile.username) {
        router.replace(`/profile/${nextProfile.username}`);
      }

      return nextProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (profileId: string) => {
    try {
      const response = await userAPI.getQuestions(profileId);
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

  const fetchAnswers = async (profileId: string) => {
    try {
      const response = await userAPI.getAnswers(profileId);
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
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setQuestions([]);
      setAnswers([]);

      const nextProfile = await fetchProfile();
      if (!mounted || !nextProfile?.id) return;

      const profileKey = nextProfile.username || nextProfile.id;

      await Promise.all([
        fetchQuestions(profileKey),
        fetchAnswers(profileKey),
      ]);
    };

    loadProfile();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-[#030712] transition-colors duration-200">
        <div className="h-32 sm:h-40 bg-slate-100 dark:bg-slate-800/50 relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60 animate-pulse"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20">
          <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
            {/* Sidebar Skeleton */}
            <div className="w-full lg:w-80 shrink-0 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full mb-6"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2 mx-auto"></div>
                <div className="mt-8 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-5/6"></div>
                </div>
              </div>
            </div>
            {/* Main Content Skeleton */}
            <div className="flex-1">
              <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-4 sm:p-6 shadow-sm min-h-[400px]">
                <div className="flex gap-4 mb-8">
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32"></div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 mb-3"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-1/4"></div>
                    </div>
                  ))}
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* Premium Profile Header Background */}
      <div className="h-40 sm:h-56 bg-slate-100 dark:bg-slate-900/50 relative overflow-hidden border-b border-white dark:border-slate-800/60">
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #10b981 1.5px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f8fafc] dark:from-slate-950 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-28 pb-20 relative z-20">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {profile && (
            <ProfileSidebar 
              profile={profile} 
              isOwnProfile={isOwnProfile || false} 
              stats={{
                questionsCount: questions.length,
                answersCount: answers.length
              }} 
            />
          )}

          <main className="flex-1 min-w-0 w-full lg:sticky lg:top-8">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800/60 p-6 sm:p-10 shadow-2xl shadow-slate-200/40 dark:shadow-none min-h-[600px]">
              <ProfileActivityTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                counts={{
                  questions: questions.length,
                  answers: answers.length
                }} 
              />

              <div className="space-y-5">
                {activeTab === 'questions' ? (
                  questions.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum ada pertanyaan</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">Pengguna ini belum pernah memulai diskusi apapun di komunitas.</p>
                    </div>
                  ) : (
                    questions.map((question) => (
                      <Link
                        key={question.id}
                        href={`/questions/${question.id}`}
                        className="group block p-6 rounded-3xl border border-slate-100/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500"
                      >
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight tracking-tight">
                            {question.title}
                          </h3>
                        </div>
                        <div className="flex items-center flex-wrap gap-6 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-2 group-hover:text-emerald-500 transition-colors">
                            <TrendingUp className="w-4 h-4" />
                            {question.upvotesCount} suara
                          </span>
                          <span className="flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            {question.answersCount} jawaban
                          </span>
                          <span className="flex items-center gap-2 ml-auto font-medium">
                            <Calendar className="w-4 h-4" />
                            {new Date(question.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </Link>
                    ))
                  )
                ) : (
                  answers.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum ada jawaban</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">Pengguna ini belum pernah memberikan kontribusi jawaban.</p>
                    </div>
                  ) : (
                    answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="group p-6 rounded-3xl border border-slate-100/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500"
                      >
                        <div className="mb-4">
                          <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Menjawab pada</div>
                          <Link href={`/questions/${answer.questionId}`} className="text-base font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1 tracking-tight">
                            {answer.questionTitle}
                          </Link>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">{answer.content}</p>
                        
                        <div className="flex items-center flex-wrap gap-6 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-2 group-hover:text-emerald-500 transition-colors">
                            <TrendingUp className="w-4 h-4" />
                            {answer.upvotesCount} suara
                          </span>
                          {answer.isAccepted && (
                            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-4 h-4 fill-emerald-500/10" />
                              Diterima
                            </span>
                          )}
                          <span className="flex items-center gap-2 ml-auto font-medium">
                            <Calendar className="w-4 h-4" />
                            {new Date(answer.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
