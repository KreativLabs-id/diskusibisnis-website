'use client';

import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react';

// Use an isomorphic layout effect to avoid warnings on the server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  Clock,
  MessageCircleQuestion,
  Sparkles,
  Hash,
  HelpCircle,
  Trophy,
  Tag,
  X,
  Plus,
  Search,
  ChevronRight,
} from 'lucide-react';

import { questionAPI, tagAPI } from '@/lib/api';
import QuestionCard from '../questions/QuestionCard';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ReportModal from '../ui/ReportModal';
import LoginPromptModal from '../ui/LoginPromptModal';
import { cn, formatNumber } from '@/lib/utils';

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
  user_vote?: 'upvote' | 'downvote' | null;
  userVote?: 'upvote' | 'downvote' | null;
  tags: Array<{ id: string; name: string; slug: string }>;
  created_at: string;
  updated_at: string;
}

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortByState] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync sortBy state with session storage
  useEffect(() => {
    const savedSort = sessionStorage.getItem('home_sortBy');
    if (savedSort === 'popular' || savedSort === 'unanswered') {
      setSortByState(savedSort);
    }
  }, []);

  const setSortBy = (val: 'newest' | 'popular' | 'unanswered') => {
    sessionStorage.setItem('home_sortBy', val);
    setSortByState(val);
  };

  const [currentTag, setCurrentTag] = useState<{ name: string; slug: string } | null>(null);
  const [showUmkmBanner, setShowUmkmBanner] = useState(true);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    questionId: string;
    title: string;
  }>({ isOpen: false, questionId: '', title: '' });
  const [loginPrompt, setLoginPrompt] = useState(false);
  const listTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('home_page_size');
    if (saved && ['10', '20', '30'].includes(saved)) {
      setPageSize(Number(saved));
    }
  }, []);

  const getCacheKey = (sort: string, tag: string | null) => `questions_cache_${user?.id || 'guest'}_${sort}_${tag || 'all'}`;

  const getFromCache = (key: string) => {
    try {
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 10000) {
        return { data, fresh: true };
      }
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

  const fetchQuestions = useCallback(
    async (showLoading = true) => {
      const cacheKey = getCacheKey(sortBy, tagParam);
      const cached = getFromCache(cacheKey);

      if (cached) {
        setQuestions(cached.data);
        if (cached.fresh) {
          setLoading(false);
          return;
        }
        setLoading(false);
      } else if (showLoading) {
        setLoading(true);
      }

      try {
        const params: { sort: string; tag?: string; limit?: number } = {
          sort: sortBy,
          limit: 100,
        };
        if (tagParam) {
          params.tag = tagParam;
        }
        const response = await questionAPI.getAll(params);
        const fetchedQuestionsRaw = response.data.data?.questions || response.data.questions || [];
        const fetchedQuestions = fetchedQuestionsRaw.map((q: Question & { userVote?: 'upvote' | 'downvote' | null }) => ({
          ...q,
          user_vote: q.user_vote ?? q.userVote ?? null,
        }));
        setQuestions(fetchedQuestions);
        setCache(cacheKey, fetchedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        if (!cached) {
          setQuestions([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [sortBy, tagParam, user?.id]
  );

  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      if (mounted) {
        await fetchQuestions();
      }
    };

    loadQuestions();

    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchQuestions(false);
      }
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
    };
  }, [fetchQuestions]);

  useEffect(() => {
    let mounted = true;

    const fetchTagInfo = async () => {
      if (tagParam && mounted) {
        try {
          const response = await tagAPI.getBySlug(tagParam);
          setCurrentTag({
            name: response.data.data.name,
            slug: response.data.data.slug,
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

  useIsomorphicLayoutEffect(() => {
    const routeKey = `${window.location.pathname}${window.location.search}`;
    const restoreTarget = sessionStorage.getItem('list_scroll_restore_target');
    if (restoreTarget !== routeKey) return;
    const key = `list_scroll:${routeKey}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    const y = Number(raw);
    if (!Number.isFinite(y)) return;

    if (loading || questions.length === 0) return; // Wait until content finishes loading

    const handleRestore = () => {
      window.scrollTo({ top: y, behavior: 'instant' });
      sessionStorage.removeItem(key);
      sessionStorage.removeItem('list_scroll_restore_target');
    };

    // Eksekusi segera karena ini ada di dalam useLayoutEffect (sebelum repaint layar)
    handleRestore();
  }, [sortBy, tagParam, questions.length, loading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, tagParam, pageSize]);

  const sortOptions = [
    { value: 'newest', label: 'Terbaru', icon: Clock },
    { value: 'popular', label: 'Populer', icon: TrendingUp },
    { value: 'unanswered', label: 'Belum Terjawab', icon: MessageCircleQuestion },
  ];

  const topTags = Array.from(
    questions
      .flatMap((question) => question.tags || [])
      .reduce((acc, tag) => {
        const current = acc.get(tag.slug) || { ...tag, count: 0 };
        current.count += 1;
        acc.set(tag.slug, current);
        return acc;
      }, new Map<string, { id: string; name: string; slug: string; count: number }>())
      .values()
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));
  const paginatedQuestions = questions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleReport = (questionId: string, title: string) => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    setReportModal({ isOpen: true, questionId, title });
  };

  const goToPage = (nextPage: number) => {
    setCurrentPage(nextPage);
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderSkeleton = (
    <div className="space-y-4 pt-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-5 sm:p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl animate-pulse">
          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 sm:min-w-[80px] shrink-0 pt-1">
            <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (
    <div className="py-20 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white dark:border-slate-800/60 p-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
      <div className="relative z-10">
        <div className="inline-flex w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full items-center justify-center mb-6">
          <MessageCircleQuestion className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {currentTag ? `Belum ada pertanyaan dengan tag #${currentTag.name}` : 'Belum ada pertanyaan'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
          {currentTag
            ? `Jadilah yang pertama bertanya dengan tag #${currentTag.name}.`
            : 'Mulai diskusi pertama dan bantu sesama pemilik UMKM di komunitas kami.'}
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/ask"
            className="inline-flex items-center gap-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Tanya Pertanyaan
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-14">
        {/* Professional Minimalist Header - Optimized for Mobile */}
        <div className="mb-10 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentTag ? `Diskusi #${currentTag.name}` : 'Diskusi Terkini'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {currentTag
                ? `Menampilkan diskusi dengan topik ${currentTag.name}.`
                : `Temukan wawasan dari ${questions.length} diskusi aktif UMKM Indonesia.`}
            </p>
          </div>
          <Link
            href="/ask"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all shadow-sm shadow-emerald-500/20 active:scale-95 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tanya Sesuatu</span>
          </Link>
        </div>

        {/* Integrated Search & Sort - Glassmorphism */}
        <div 
          className="sticky z-40 mb-12"
          style={{ top: 'calc(var(--header-height, 64px) + 1rem)' }}
        >
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white dark:border-slate-800/50 rounded-2xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari diskusi, topik, atau kata kunci..."
                className="w-full bg-transparent pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
            </div>
            <div className="flex gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl overflow-x-auto scrollbar-hide">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={cn(
                    "px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2",
                    sortBy === option.value
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  <option.icon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main Content: Question List */}
          <div ref={listTopRef} className="space-y-6">
            {loading ? (
              renderSkeleton
            ) : questions.length === 0 ? (
              renderEmptyState
            ) : (
              paginatedQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onReport={handleReport}
                  currentUserId={user?.id}
                />
              ))
            )}

            {/* Pagination - Professional Style */}
            {!loading && questions.length > pageSize && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white dark:border-slate-800/60 rounded-[2rem]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tampil</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setPageSize(next);
                      sessionStorage.setItem('home_page_size', String(next));
                    }}
                    className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <div className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Professional Premium Cards */}
          <aside className="hidden lg:block space-y-8">
            {/* Topik Populer */}
            <div className="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white dark:border-slate-800/60 rounded-[2rem] p-8 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 overflow-hidden shadow-sm">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Hash className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">
                    Topik Populer
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topTags.map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`/?tag=${tag.slug}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all",
                        tagParam === tag.slug
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600"
                      )}
                    >
                      <span>#{tag.name}</span>
                      <span className="opacity-50">· {tag.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips Bertanya */}
            <div className="group relative bg-slate-900 dark:bg-white rounded-[2rem] p-8 overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white dark:text-slate-900">
                    Tips Bertanya
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { title: "Judul spesifik", text: "Gunakan 1 kalimat padat." },
                    { title: "Konteks detail", text: "Apa yang sudah dicoba?" },
                    { title: "Tag relevan", text: "Agar lebih cepat dijawab." }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-400">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-[11px] font-black text-white dark:text-slate-900 uppercase tracking-widest">{item.title}</div>
                        <div className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">{item.text}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Aksi Cepat */}
            <div className="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white dark:border-slate-800/60 rounded-[2rem] p-8 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 overflow-hidden shadow-sm">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">
                    Aksi Cepat
                  </h3>
                </div>
                <div className="space-y-3">
                  <Link href="/unanswered" className="group/item flex items-center justify-between p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                    <span className="text-xs font-black uppercase tracking-widest">Belum terjawab</span>
                    <ChevronRight className="w-4 h-4 group-hover/item:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/leaderboard" className="group/item flex items-center justify-between p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                    <span className="text-xs font-black uppercase tracking-widest">Kontributor top</span>
                    <ChevronRight className="w-4 h-4 group-hover/item:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal((prev) => ({ ...prev, isOpen: false }))}
        reportType="question"
        reportId={reportModal.questionId}
        reportTitle={reportModal.title}
      />

      <LoginPromptModal isOpen={loginPrompt} onClose={() => setLoginPrompt(false)} action="report" />
    </div>
  );
}
