'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  HelpCircle,
  Clock,
  Eye,
  MessageSquare,
  Plus,
  TrendingUp,
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

import { questionAPI } from '@/lib/api';
import QuestionCard from '@/components/questions/QuestionCard';
import QuestionCardSkeleton from '@/components/questions/QuestionCardSkeleton';
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
  tags: Array<{ id: string; name: string; slug: string }>;
  created_at: string;
  updated_at: string;
}

export default function UnansweredPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'views'>('newest');

  const fetchUnansweredQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getAll({
        sort: sortBy === 'votes' ? 'most_voted' : sortBy === 'views' ? 'most_viewed' : 'newest',
        status: 'unanswered',
        limit: 20
      });
      const questionsData = response.data?.data?.questions || response.data?.questions || [];
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error) {
      console.error('Error fetching unanswered questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchUnansweredQuestions();
  }, [fetchUnansweredQuestions]);

  const sortOptions = [
    { value: 'newest', label: 'Terbaru', icon: Clock },
    { value: 'votes', label: 'Populer', icon: TrendingUp },
    { value: 'views', label: 'Dilihat', icon: Eye },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-4 py-12">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14">
          <div className="animate-pulse space-y-8">
            <div className="mb-8 sm:mb-10">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-96 max-w-full"></div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-200 dark:divide-slate-800 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <QuestionCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14">
        {/* Professional Minimalist Header - Optimized for Mobile */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Belum Terjawab
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bantu sesama pebisnis dengan membagikan wawasan dan solusi Anda.
          </p>
        </div>

        {/* Desktop: Integrated Filter */}
        <div 
          className="hidden lg:block sticky z-40 mb-6"
          style={{ top: 'calc(var(--header-height, 64px) + 0.5rem)' }}
        >
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm flex flex-row gap-2 justify-center">
            <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto scrollbar-hide">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0",
                    sortBy === option.value
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <option.icon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Sticky Filter Tabs */}
        <div 
          className="block lg:hidden sticky z-30 mb-6 -mx-4 px-4 py-2 bg-[#f8fafc]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto scrollbar-hide"
          style={{ top: 'var(--header-height, 56px)' }}
        >
          <div className="flex gap-2 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-lg w-max min-w-full">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0",
                  sortBy === option.value
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <option.icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="py-20 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white dark:border-slate-800/60 p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="inline-flex w-20 h-20 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Semua Pertanyaan Terjawab!</h3>
                <p className="text-slate-500 mt-2 mb-8">Luar biasa! Komunitas sangat aktif dan tidak ada pertanyaan yang menggantung.</p>
                <Link
                  href="/ask"
                  className="px-8 py-3 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/25 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Mulai Tanya Sesuatu
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-200 dark:divide-slate-800">
              {questions.map((question) => (
                <div key={question.id} className="relative group/unanswered">
                  <QuestionCard question={question} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
