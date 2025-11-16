'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  HelpCircle,
  Clock,
  Eye,
  MessageSquare,
  Plus,
  Filter,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

import { questionAPI } from '@/lib/api';
import QuestionCard from '@/components/questions/QuestionCard';

interface Question {
  id: string;
  title: string;
  content: string;
  author_id: string;
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
    { value: 'newest', label: 'Terbaru', icon: Clock, description: 'Pertanyaan yang baru saja diposting' },
    { value: 'votes', label: 'Vote Terbanyak', icon: HelpCircle, description: 'Pertanyaan dengan vote tertinggi' },
    { value: 'views', label: 'Paling Dilihat', icon: Eye, description: 'Pertanyaan yang paling banyak dilihat' },
  ];

  const renderSkeleton = (
    <div className="space-y-3 sm:space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-6 animate-pulse"
        >
          <div className="flex gap-3 sm:gap-6">
            {/* Vote section skeleton - Hidden on mobile */}
            <div className="hidden sm:flex flex-col items-center gap-3">
              <div className="w-16 h-10 bg-slate-200 rounded-lg" />
              <div className="w-16 h-10 bg-slate-200 rounded-lg" />
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-2 sm:space-y-3">
              {/* Title */}
              <div className="h-5 sm:h-6 bg-slate-200 rounded w-3/4" />
              
              {/* Description */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-full" />
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-5/6" />
              </div>
              
              {/* Tags and meta */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <div className="h-5 sm:h-6 w-16 sm:w-20 bg-slate-200 rounded-full" />
                <div className="h-5 sm:h-6 w-20 sm:w-24 bg-slate-200 rounded-full" />
                <div className="h-5 sm:h-6 w-14 sm:w-16 bg-slate-200 rounded-full" />
              </div>
              
              {/* Footer */}
              <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-3">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-slate-200 rounded-full" />
                <div className="h-3 sm:h-4 w-24 sm:w-32 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (
    <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-6 sm:p-8 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
        Semua Pertanyaan Sudah Terjawab!
      </h3>
      <p className="text-slate-500 mb-4 sm:mb-6 text-xs sm:text-sm max-w-sm mx-auto px-4">
        Komunitas sangat aktif! Tidak ada pertanyaan yang menunggu jawaban saat ini.
      </p>
      <Link
        href="/questions"
        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs sm:text-sm"
      >
        Lihat Pertanyaan Terpopuler
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4">
      {/* Header - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                Pertanyaan<br className="sm:hidden" /> Belum Terjawab
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                {questions.length} pertanyaan membutuhkan jawaban
              </p>
            </div>
          </div>
          <Link
            href="/ask"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs sm:text-base shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Tanya Pertanyaan</span>
            <span className="sm:hidden">Tanya</span>
          </Link>
        </div>
      </div>

      {/* Info Banner - Mobile Optimized */}
      <div className="bg-linear-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg sm:rounded-xl p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">
              Bantu Komunitas dengan Menjawab!
            </h3>
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-xs sm:text-sm text-slate-700">
                Setiap jawaban membantu sesama UMKM dan meningkatkan reputasi Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full"></span>
                  <span>+10 poin per jawaban</span>
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></span>
                  <span>+15 poin jika diterima</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Sort Filter - Mobile Optimized */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <span className="text-xs sm:text-sm text-slate-500 font-medium">Urutkan:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'votes' | 'views')}
              className="appearance-none bg-slate-50 border-0 rounded-md px-2.5 sm:px-3 py-1 sm:py-1.5 pr-6 sm:pr-7 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="text-xs sm:text-sm text-slate-500 font-medium">
          {questions.length} <span className="hidden sm:inline">pertanyaan</span>
        </div>
      </div>

      {/* Questions List - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        {loading
          ? renderSkeleton
          : questions.length === 0
            ? renderEmptyState
            : questions.map((question) => (
                <div key={question.id} className="relative">
                  <QuestionCard question={question} />
                  {/* Unanswered Badge - Mobile Optimized */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-emerald-200 shadow-sm">
                      <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="font-medium">Butuh Jawaban</span>
                    </div>
                  </div>
                </div>
              ))
        }
      </div>

      {/* Load More - Mobile Optimized */}
      {questions.length > 0 && questions.length >= 20 && (
        <div className="mt-6 sm:mt-8 text-center pb-4">
          <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm sm:text-base">
            Muat Lebih Banyak Pertanyaan
          </button>
        </div>
      )}
    </div>
  );
}
