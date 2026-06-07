'use client';

import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  Clock,
  MessageCircleQuestion,
  Plus,
  Search,
  Hash,
  Trophy,
  HelpCircle,
  Sparkles,
  X,
  ChevronRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';

import { questionAPI } from '@/lib/api';
import QuestionCard from '@/components/questions/QuestionCard';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatNumber } from '@/lib/utils';

interface Question {
  id: string;
  title: string;
  content: string;
  images?: string[];
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

export default function QuestionsPageContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortByState, setSortByState] = useState<'newest' | 'popular' | 'unanswered'>('newest');

  useEffect(() => {
    const savedSort = sessionStorage.getItem('questions_sortBy');
    if (savedSort === 'popular' || savedSort === 'unanswered' || savedSort === 'newest') {
      setSortByState(savedSort as any);
    }
  }, []);

  const setSortBy = (val: 'newest' | 'popular' | 'unanswered') => {
    sessionStorage.setItem('questions_sortBy', val);
    setSortByState(val);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showUmkmBanner, setShowUmkmBanner] = useState(true);
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const sort = searchParams.get('sort') || sortByState;
      const response = await questionAPI.getAll({
        sort,
        limit: 20
      });
      setQuestions(response.data?.data?.questions || response.data?.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [sortByState, searchParams]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useIsomorphicLayoutEffect(() => {
    const routeKey = `${window.location.pathname}${window.location.search}`;
    const restoreTarget = sessionStorage.getItem('list_scroll_restore_target');
    if (restoreTarget !== routeKey) return;
    const key = `list_scroll:${routeKey}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    const y = Number(raw);
    if (!Number.isFinite(y)) return;

    if (loading || questions.length === 0) return;

    const handleRestore = () => {
      window.scrollTo({ top: y, behavior: 'instant' });
      sessionStorage.removeItem(key);
      sessionStorage.removeItem('list_scroll_restore_target');
    };

    handleRestore();
  }, [questions.length, sortByState, searchQuery, loading]);

  const filteredQuestions = questions.filter((question) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const titleMatch = question.title.toLowerCase().includes(query);
    const contentMatch = question.content.toLowerCase().includes(query);
    const tagMatch = question.tags.some(tag =>
      tag.name.toLowerCase().includes(query) ||
      tag.slug.toLowerCase().includes(query)
    );

    return titleMatch || contentMatch || tagMatch;
  });

  const sortOptions = [
    { value: 'newest', label: 'Terbaru', icon: Clock },
    { value: 'popular', label: 'Populer', icon: TrendingUp },
    { value: 'unanswered', label: 'Belum Terjawab', icon: MessageCircleQuestion },
  ];

  const topTags = Array.from(
    filteredQuestions
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

  const renderSkeleton = (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white dark:border-slate-800/60 rounded-[2rem] p-6 animate-pulse"
        >
          <div className="flex gap-6">
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6 sm:pt-14">
      {/* Professional Minimalist Header - Optimized for Mobile */}
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Semua Pertanyaan
          </h1>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">
            Temukan wawasan dari {filteredQuestions.length} diskusi aktif UMKM.
          </p>
        </div>
        <Link
          href="/ask"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all shadow-sm shadow-emerald-500/20 active:scale-95 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tanya Sesuatu</span>
        </Link>
      </div>

      {/* Integrated Search & Filter - Clean UI */}
      <div 
        className="sticky z-40 mb-12"
        style={{ top: 'calc(var(--header-height, 64px) + 1rem)' }}
      >
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white dark:border-slate-800/50 rounded-2xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pertanyaan, topik, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  sortByState === option.value
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
        {/* Questions List */}
        <div className="space-y-6">
          {loading ? (
            renderSkeleton
          ) : filteredQuestions.length === 0 ? (
            <div className="py-20 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white dark:border-slate-800/60 p-12">
              <div className="inline-flex w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tidak ada diskusi ditemukan</h3>
              <p className="text-slate-500 mt-2 mb-8">Coba gunakan kata kunci lain atau bersihkan filter.</p>
              <button
                onClick={() => { setSearchQuery(''); setSortBy('newest'); }}
                className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          )}
        </div>

        {/* Desktop Right Sidebar */}
        <aside className="hidden lg:block space-y-8">
          {/* Topik Populer - Premium Card */}
          <div className="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white dark:border-slate-800/60 rounded-[2rem] p-8 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-500 overflow-hidden shadow-sm">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Hash className="h-5 w-5 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Topik Populer
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-all hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600"
                  >
                    <span>#{tag.name}</span>
                    <span className="opacity-50">· {tag.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Tips Bertanya - Premium Card */}
          <div className="group relative bg-slate-900 dark:bg-white rounded-[2rem] p-8 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <h3 className="text-xs font-bold text-white dark:text-slate-900">
                  Tips bertanya
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  { title: "Judul spesifik", text: "Gunakan 1 kalimat padat." },
                  { title: "Konteks detail", text: "Apa yang sudah dicoba?" },
                  { title: "Tag relevan", text: "Agar lebih cepat dijawab." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-[11px] font-bold text-white dark:text-slate-900">{item.title}</div>
                      <div className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">{item.text}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Leaderboard/Stats Mini Card */}
          <div className="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white dark:border-slate-800/60 rounded-[2rem] p-8 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-500 overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Aksi cepat
                </h3>
              </div>
              <div className="space-y-3">
                <Link href="/unanswered" className="group/item flex items-center justify-between p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                  <span className="text-xs font-bold">Belum terjawab</span>
                  <ChevronRight className="w-4 h-4 group-hover/item:translate-x-1 transition-transform" />
                </Link>
                <Link href="/leaderboard" className="group/item flex items-center justify-between p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                  <span className="text-xs font-bold">Kontributor top</span>
                  <ChevronRight className="w-4 h-4 group-hover/item:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
