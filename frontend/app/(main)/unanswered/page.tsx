'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  HelpCircle,
  Clock,
  Eye,
  MessageSquare,
  Plus,
  Filter,
  ChevronDown,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

import { questionAPI } from '@/lib/api';
import QuestionCard from '@/components/questions/QuestionCard';

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
      const questionsData = response.data.data;

      if (Array.isArray(questionsData)) {
        setQuestions(questionsData);
      } else if (questionsData && Array.isArray(questionsData.questions)) {
        setQuestions(questionsData.questions);
      } else {
        setQuestions([]);
      }
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
    { value: 'votes', label: 'Vote Terbanyak', icon: TrendingUp },
    { value: 'views', label: 'Paling Dilihat', icon: Eye },
  ];

  const renderSkeleton = (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
        >
          <div className="flex gap-6">
            <div className="hidden sm:flex flex-col items-center gap-3">
              <div className="w-16 h-12 bg-slate-100 rounded-xl" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-slate-100 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 bg-slate-100 rounded-full" />
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (
    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
      <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
        <Sparkles className="w-10 h-10 text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">
        Semua Pertanyaan Sudah Terjawab!
      </h3>
      <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
        Luar biasa! Komunitas sangat aktif dan semua pertanyaan telah mendapatkan jawaban. Jadilah yang pertama bertanya lagi!
      </p>
      <Link
        href="/ask"
        className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-600/20 hover:-translate-y-1"
      >
        <Plus className="w-5 h-5" />
        Buat Pertanyaan Baru
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Header Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-6 sm:p-10 mb-8 overflow-hidden shadow-xl">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold uppercase tracking-wider">
                Komunitas
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-50 text-xs font-semibold">
                {questions.length} Pertanyaan
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight">
              Bantu Jawab Pertanyaan
            </h1>
            <p className="text-emerald-50 text-sm sm:text-base max-w-xl leading-relaxed">
              Temukan pertanyaan yang belum terjawab dan bagikan pengetahuan Anda.
              Setiap jawaban membantu komunitas tumbuh bersama.
            </p>
          </div>

          <Link
            href="/ask"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all font-semibold shadow-lg hover:shadow-xl group whitespace-nowrap"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Tanya Sesuatu
          </Link>
        </div>
      </div>

      {/* Filter & Sort Bar - Clean & Minimal */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-[70px] z-20">
        <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = sortBy === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-1 sm:flex-none justify-center ${isActive
                  ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Urutkan berdasarkan</span>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-4">
        {loading ? (
          renderSkeleton
        ) : questions.length === 0 ? (
          renderEmptyState
        ) : (
          questions.map((question) => (
            <div key={question.id} className="relative">
              {/* Mobile Badge - Positioned statically to avoid overlap */}
              <div className="sm:hidden px-4 pt-4 -mb-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 shadow-sm">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Butuh Jawaban
                </span>
              </div>

              <QuestionCard question={question} />

              {/* Desktop Badge - Absolute positioning */}
              <div className="hidden sm:block absolute top-6 right-6 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 shadow-sm">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Butuh Jawaban
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {questions.length > 0 && questions.length >= 20 && (
        <div className="mt-10 text-center">
          <button className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium shadow-sm">
            Muat Lebih Banyak
          </button>
        </div>
      )}
    </div>
  );
}
