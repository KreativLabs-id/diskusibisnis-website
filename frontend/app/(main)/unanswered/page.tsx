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
  author_name: string;
  author_avatar: string;
  author_reputation: number;
  upvotes_count: number;
  views_count: number;
  answers_count: number;
  has_accepted_answer: boolean;
  tags: Array<{ id: string; name: string; slug: string }>;
  created_at: string;
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
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
        >
          <div className="flex gap-6">
            <div className="space-y-3">
              <div className="h-10 w-16 rounded-lg bg-slate-200" />
              <div className="h-10 w-16 rounded-lg bg-slate-200" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-slate-200" />
                <div className="h-6 w-16 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <HelpCircle className="w-6 h-6 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        Semua Pertanyaan Sudah Terjawab
      </h3>
      <p className="text-slate-500 mb-6 text-sm max-w-sm mx-auto">
        Komunitas sangat aktif! Tidak ada pertanyaan yang menunggu jawaban saat ini.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/questions"
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          Lihat Semua Pertanyaan
        </Link>
        <Link
          href="/ask"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajukan Pertanyaan
        </Link>
      </div>
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

      {/* Sort Dropdown */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-medium text-slate-600">Urutkan Berdasarkan:</span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'votes' | 'views')}
            className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
