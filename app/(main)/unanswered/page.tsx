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
        sort: sortBy === 'newest' ? 'newest' : sortBy === 'votes' ? 'popular' : 'newest'
      });
      const questionsData = response.data.data;
      
      if (Array.isArray(questionsData)) {
        // Filter out questions that have answers or accepted answers
        const unansweredQuestions = questionsData.filter((q: Question) => 
          q.answers_count === 0 && !q.has_accepted_answer
        );
        setQuestions(unansweredQuestions);
      } else if (questionsData && Array.isArray(questionsData.questions)) {
        const unansweredQuestions = questionsData.questions.filter((q: Question) => 
          q.answers_count === 0 && !q.has_accepted_answer
        );
        setQuestions(unansweredQuestions);
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
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
        >
          <div className="flex gap-6">
            {/* Vote section skeleton */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-10 bg-slate-200 rounded-lg" />
              <div className="w-16 h-10 bg-slate-200 rounded-lg" />
            </div>
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              {/* Title */}
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              
              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
              </div>
              
              {/* Tags and meta */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
                <div className="h-6 w-16 bg-slate-200 rounded-full" />
              </div>
              
              {/* Footer */}
              <div className="flex items-center gap-4 pt-3">
                <div className="h-8 w-8 bg-slate-200 rounded-full" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        Semua Pertanyaan Sudah Terjawab!
      </h3>
      <p className="text-slate-500 mb-6 text-sm max-w-sm mx-auto">
        Komunitas sangat aktif! Tidak ada pertanyaan yang menunggu jawaban saat ini.
      </p>
      <Link
        href="/questions"
        className="inline-flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
      >
        Lihat Pertanyaan Terpopuler
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Pertanyaan Belum Terjawab</h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base">
            {questions.length} pertanyaan membutuhkan jawaban Anda
          </p>
        </div>
        <Link
          href="/ask"
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Tanya Pertanyaan
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Bantu Komunitas dengan Menjawab!
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                Setiap jawaban membantu sesama UMKM dan meningkatkan reputasi Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>+10 poin per jawaban</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>+15 poin jika diterima</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Sort Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Urutkan:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'votes' | 'views')}
              className="appearance-none bg-slate-50 border-0 rounded-md px-3 py-1 pr-6 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading
          ? renderSkeleton
          : questions.length === 0
            ? renderEmptyState
            : questions.map((question) => (
                <div key={question.id} className="relative">
                  <QuestionCard question={question} />
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                      <HelpCircle className="w-3 h-3" />
                      <span>Butuh Jawaban</span>
                    </div>
                  </div>
                </div>
              ))
        }
      </div>

      {/* Load More */}
      {questions.length > 0 && questions.length >= 20 && (
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Muat Lebih Banyak Pertanyaan
          </button>
        </div>
      )}
    </div>
  );
}
