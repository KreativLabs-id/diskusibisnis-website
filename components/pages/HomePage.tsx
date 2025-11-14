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

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest');
  const [currentTag, setCurrentTag] = useState<{name: string, slug: string} | null>(null);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params: { sort: string; tag?: string; limit?: number } = { 
        sort: sortBy,
        limit: 20 // Increase limit to reduce pagination requests
      };
      if (tagParam) {
        params.tag = tagParam;
      }
      const response = await questionAPI.getAll(params);
      const questions = response.data.data?.questions || response.data.questions || [];
      setQuestions(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, tagParam]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Fetch tag info when tag parameter changes
  useEffect(() => {
    const fetchTagInfo = async () => {
      if (tagParam) {
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
  }, [tagParam]);

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
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
        <MessageCircleQuestion className="w-8 h-8 text-emerald-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900">
          {currentTag ? `Belum ada pertanyaan dengan tag #${currentTag.name}` : 'Belum ada pertanyaan'}
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
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
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
          >
            Gabung Komunitas
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
      {/* Header Section - Enhanced */}
      <section className="border-b border-slate-200/60 bg-gradient-to-r from-white via-emerald-50/20 to-white backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {currentTag ? (
                  <>
                    <span className="text-slate-600 font-medium text-lg sm:text-xl">Tag:</span>{' '}
                    <span className="text-emerald-600">#{currentTag.name}</span>
                  </>
                ) : (
                  'Semua Pertanyaan'
                )}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {questions.length} pertanyaan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tag Filter Display */}
        {currentTag && (
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 mb-4 sm:mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm">
            <Tag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs sm:text-sm text-slate-600 block sm:inline">
                <span className="hidden sm:inline">Menampilkan pertanyaan dengan tag </span>
                <span className="sm:hidden">Tag: </span>
              </span>
              <span className="inline-flex items-center px-2.5 py-1 bg-emerald-600 text-white rounded-full text-xs sm:text-sm font-semibold ml-1">
                #{currentTag.name}
              </span>
            </div>
            <Link
              href="/"
              className="p-1.5 hover:bg-white/80 rounded-lg transition-colors flex-shrink-0 group"
              title="Hapus filter"
            >
              <X className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
            </Link>
          </div>
        )}
        
        {/* Sort Options - Icon-based for Mobile */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as 'newest' | 'popular' | 'unanswered')}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  sortBy === option.value
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title={option.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Questions List */}
        {loading
          ? renderSkeleton
          : questions.length === 0
            ? renderEmptyState
            : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
              )}
      </main>

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
