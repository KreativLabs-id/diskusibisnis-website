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
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-96"></div>
            </div>
            <div className="space-y-4 pt-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]"></div>
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
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Belum Terjawab
          </h1>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 mt-1">
            Bantu sesama pebisnis dengan membagikan wawasan dan solusi Anda.
          </p>
        </div>

        {/* Integrated Filter - Glassmorphism */}
        <div className="sticky top-4 z-40 mb-12">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white dark:border-slate-800/50 rounded-2xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center">
            <div className="flex gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl overflow-x-auto scrollbar-hide w-full max-w-md">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={cn(
                    "px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex-1 flex items-center justify-center gap-2",
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

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="py-20 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white dark:border-slate-800/60 p-12 overflow-hidden relative">
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
            questions.map((question) => (
              <div key={question.id} className="relative group">
                <div className="absolute -top-3 left-8 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-3 h-3" /> Butuh Jawaban
                  </span>
                </div>
                <QuestionCard question={question} />
              </div>
            ))
          )}
        </div>

        {/* Bottom Action */}
        {questions.length > 0 && (
          <div className="mt-20 p-8 sm:p-12 rounded-[3rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
            <div className="relative z-10 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-black mb-3">Jadilah Kontributor Terbaik</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium">Setiap jawaban yang Anda berikan membangun reputasi dan membantu ekosistem UMKM Indonesia semakin kuat.</p>
            </div>
            <Link
              href="/leaderboard"
              className="relative z-10 px-8 py-4 bg-emerald-500 text-white dark:text-white rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 whitespace-nowrap"
            >
              Lihat Leaderboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
