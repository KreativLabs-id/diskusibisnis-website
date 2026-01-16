'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  Clock,
  MessageCircleQuestion,
  Sparkles,
  ArrowRight,
  Tag,
  X,
  Plus,
} from 'lucide-react';

import { questionAPI, tagAPI } from '@/lib/api';
import QuestionCard from '../questions/QuestionCard';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ReportModal from '../ui/ReportModal';
import LoginPromptModal from '../ui/LoginPromptModal';

interface Question {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_username?: string;
  author_name: string;
  author_avatar: string;
  author_reputation: number;
  author_is_verified: boolean;
  upvotes_count: number;
  views_count: number;
  answers_count: number;
  has_accepted_answer: boolean;
  is_closed: boolean;
  tags: Array<{ id: string; name: string; slug: string }>;
  created_at: string;
  updated_at: string;
}

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  const [currentTag, setCurrentTag] = useState<{ name: string, slug: string } | null>(null);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    questionId: string;
    title: string;
  }>({ isOpen: false, questionId: '', title: '' });
  const [loginPrompt, setLoginPrompt] = useState(false);

  // ✅ Client-side cache helper (stale-while-revalidate pattern)
  const getCacheKey = (sort: string, tag: string | null) => `questions_cache_${sort}_${tag || 'all'}`;

  const getFromCache = (key: string) => {
    try {
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 10 seconds (reduced for faster vote updates)
      if (Date.now() - timestamp < 10000) {
        return { data, fresh: true };
      }
      // Return stale data but mark as not fresh
      return { data, fresh: false };
    } catch {
      return null;
    }
  };

  const setCache = (key: string, data: Question[]) => {
    try {
      sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
      // Ignore cache errors
    }
  };

  const fetchQuestions = useCallback(async (showLoading = true) => {
    const cacheKey = getCacheKey(sortBy, tagParam);

    // ✅ Show cached data immediately if available (stale-while-revalidate)
    const cached = getFromCache(cacheKey);
    if (cached) {
      setQuestions(cached.data);
      if (cached.fresh) {
        setLoading(false);
        return; // Cache is fresh, no need to fetch
      }
      // Cache is stale, show it but fetch in background
      setLoading(false);
    } else if (showLoading) {
      setLoading(true);
    }

    try {
      const params: { sort: string; tag?: string; limit?: number } = {
        sort: sortBy,
        limit: 20
      };
      if (tagParam) {
        params.tag = tagParam;
      }
      const response = await questionAPI.getAll(params);
      const fetchedQuestions = response.data.data?.questions || response.data.questions || [];
      setQuestions(fetchedQuestions);

      // ✅ Update cache with fresh data
      setCache(cacheKey, fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (!cached) {
        setQuestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [sortBy, tagParam]);

  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      if (mounted) {
        await fetchQuestions();
      }
    };

    loadQuestions();

    // ✅ Auto-refresh every 15 seconds for realtime vote updates
    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchQuestions(false); // Silent refresh without showing loading
      }
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
    };
  }, [fetchQuestions]);

  // Fetch tag info when tag parameter changes
  useEffect(() => {
    let mounted = true;

    const fetchTagInfo = async () => {
      if (tagParam && mounted) {
        try {
          const response = await tagAPI.getBySlug(tagParam);
          setCurrentTag({
            name: response.data.data.name,
            slug: response.data.data.slug
          });
        } catch (error) {
          console.error('Error fetching tag info:', error);
          setCurrentTag(null);
        }
      } else {
        setCurrentTag(null);
      }
    };

    fetchTagInfo();

    return () => {
      mounted = false;
    };
  }, [tagParam]);

  const sortOptions = [
    { value: 'newest', label: 'Terbaru', icon: Clock },
    { value: 'popular', label: 'Populer', icon: TrendingUp },
    { value: 'unanswered', label: 'Belum Terjawab', icon: MessageCircleQuestion },
  ];

  const handleReport = (questionId: string, title: string) => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    setReportModal({ isOpen: true, questionId, title });
  };

  const renderSkeleton = (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse"
        >
          <div className="flex gap-6">
            {/* Vote section skeleton */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>

            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              {/* Title */}
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
              </div>

              {/* Tags and meta */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 pt-3">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
        <MessageCircleQuestion className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {currentTag ? `Belum ada pertanyaan dengan tag #${currentTag.name}` : 'Belum ada pertanyaan'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {currentTag
            ? `Jadilah yang pertama bertanya dengan tag #${currentTag.name}`
            : 'Mulai diskusi pertama dan bantu sesama pemilik UMKM'
          }
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/ask"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Tanya Pertanyaan
        </Link>
        {!user && (
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200"
          >
            Gabung Komunitas
          </Link>
        )}
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Hero Section - Optimized for Mobile Performance */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 pb-24 pt-8 sm:pt-12 overflow-hidden rounded-b-[2rem] sm:rounded-b-[3rem] shadow-lg sm:shadow-2xl z-10">
        {/* Decorative Elements - Hidden on mobile for performance */}
        <div className="hidden sm:block absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="hidden sm:block absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              {currentTag ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 sm:backdrop-blur-md rounded-full border border-white/30 text-white text-xs sm:text-sm font-medium mb-4">
                  <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Filter Tag</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 sm:backdrop-blur-md rounded-full border border-white/30 text-white text-xs sm:text-sm font-medium mb-4">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
                  <span>Komunitas UMKM Terpercaya</span>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                {currentTag ? (
                  <span>
                    Diskusi tentang <span className="text-emerald-100 underline decoration-emerald-300/50 underline-offset-4">#{currentTag.name}</span>
                  </span>
                ) : (
                  <span>
                    Temukan Jawaban & <br />
                    <span className="text-emerald-100">Bangun Bisnismu</span>
                  </span>
                )}
              </h1>

              <p className="text-emerald-50 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-6 sm:mb-8">
                {currentTag
                  ? `Jelajahi semua pertanyaan dan diskusi yang berkaitan dengan topik ${currentTag.name}.`
                  : "Bergabung dengan ribuan pemilik bisnis lainnya. Tanyakan masalahmu, bagikan pengalaman, dan tumbuh bersama."
                }
              </p>

              <div className="flex flex-wrap items-center gap-3 relative z-30">
                <Link
                  href="/ask"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Buat Pertanyaan
                </Link>
                <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm font-medium px-4 py-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <MessageCircleQuestion className="w-4 h-4" />
                  <span>{questions.length} diskusi aktif</span>
                </div>
              </div>
            </div>

            {/* Hero Illustration / Icon - Desktop only */}
            <div className="hidden md:block relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white/10 rounded-3xl rotate-12 flex items-center justify-center border border-white/20 shadow-xl">
                <MessageCircleQuestion className="w-16 h-16 lg:w-20 lg:h-20 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-emerald-400/20 rounded-2xl -rotate-6 border border-white/10 -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with negative margin to overlap hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 -mt-12 relative z-20">
        {/* Tag Filter Display */}
        {currentTag && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 mb-4 sm:mb-6 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 rounded-xl shadow-lg shadow-emerald-900/5">
            <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 block sm:inline">
                <span className="hidden sm:inline">Menampilkan pertanyaan dengan tag </span>
                <span className="sm:hidden">Tag: </span>
              </span>
              <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-xs sm:text-sm font-semibold ml-1">
                #{currentTag.name}
              </span>
            </div>
            <Link
              href="/"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 group"
              title="Hapus filter"
            >
              <X className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            </Link>
          </div>
        )}

        {/* Filter & Sort Section - Clean & Minimal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md sm:shadow-xl border border-slate-100 dark:border-slate-800 p-2 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as 'newest' | 'popular' | 'unanswered')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-1 sm:flex-none justify-center ${isActive
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                  title={option.label}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Urutkan diskusi</span>
          </div>
        </div>

        {/* Questions List */}
        {loading
          ? renderSkeleton
          : questions.length === 0
            ? renderEmptyState
            : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onReport={handleReport}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
      </main>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal(prev => ({ ...prev, isOpen: false }))}
        reportType="question"
        reportId={reportModal.questionId}
        reportTitle={reportModal.title}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={loginPrompt}
        onClose={() => setLoginPrompt(false)}
        action="report"
      />
    </div>
  );
}
