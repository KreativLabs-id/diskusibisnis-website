'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  Clock,
  MessageCircleQuestion,
  Plus,
  Filter,
  Search,
} from 'lucide-react';
import Link from 'next/link';

import { questionAPI } from '@/lib/api';
import QuestionCard from '@/components/questions/QuestionCard';
import { useAuth } from '@/contexts/AuthContext';

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

export default function QuestionsPageContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const sort = searchParams.get('sort') || sortBy;
      const response = await questionAPI.getAll({ 
        sort,
        limit: 20 // Increase limit for better performance
      });
      setQuestions(response.data.data?.questions || response.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, searchParams]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const sortOptions = [
    { value: 'newest', label: 'Terbaru', icon: Clock },
    { value: 'popular', label: 'Populer', icon: TrendingUp },
    { value: 'unanswered', label: 'Belum Terjawab', icon: MessageCircleQuestion },
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
    <div className="text-center py-16">
      <MessageCircleQuestion className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        Belum ada pertanyaan
      </h3>
      <p className="text-slate-600 mb-6">
        Jadilah yang pertama bertanya di komunitas kami!
      </p>
      <Link
        href="/ask"
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
      >
        <Plus className="w-4 h-4" />
        Tanya Pertanyaan
      </Link>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Compact Header with Search */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Semua Pertanyaan</h1>
          <span className="text-xs text-slate-500">
            {questions ? questions.length : 0} pertanyaan
          </span>
        </div>
        
        {/* Search Bar - Compact */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari pertanyaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
          />
        </div>
      </div>

      {/* Sort Options - Icon-based for Mobile */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = sortBy === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as 'newest' | 'popular' | 'unanswered')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={option.label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="space-y-2.5">
        {loading
          ? renderSkeleton
          : !questions || questions.length === 0
            ? renderEmptyState
            : questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))
        }
      </div>

      {/* Load More */}
      {!loading && questions && questions.length > 0 && (
        <div className="text-center mt-6">
          <button className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded font-medium text-sm hover:bg-slate-50 transition-colors">
            Muat Lebih Banyak
          </button>
        </div>
      )}

      {/* Floating Action Button - Mobile */}
      <Link
        href="/ask"
        className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center group"
        title="Ajukan Pertanyaan"
      >
        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </Link>
    </div>
  );
}
