'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Search,
  BookmarkX,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { bookmarkAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import QuestionCard from '@/components/questions/QuestionCard';

interface SavedQuestion {
  id: string;
  title: string;
  content: string;
  images?: string[];
  author_id?: string;
  author_name: string;
  author_avatar: string;
  author_reputation: number;
  author_is_verified: boolean;
  upvotes_count: number;
  views_count: number;
  answers_count: number;
  has_accepted_answer: boolean;
  tags: Array<{ id: string; name: string; slug: string }>;
  created_at: string;
  saved_at: string;
  is_bookmarked?: boolean;
}

export default function SavedPage() {
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSavedQuestions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSavedQuestions = async () => {
    try {
      setLoading(true);
      const response = await bookmarkAPI.getAll();
      console.log('Bookmarks response:', response.data);

      const bookmarks = response.data.data?.bookmarks || response.data.bookmarks || [];

      // Map bookmarks to SavedQuestion format
      const mappedQuestions = bookmarks.map((bookmark: any) => ({
        id: bookmark.id,
        title: bookmark.title,
        content: bookmark.content,
        images: bookmark.images || undefined,
        author_id: bookmark.author_id,
        author_name: bookmark.author_name,
        author_avatar: bookmark.author_avatar,
        author_reputation: bookmark.author_reputation || 0,
        author_is_verified: bookmark.author_is_verified || false,
        upvotes_count: parseInt(bookmark.upvotes_count) || 0,
        views_count: parseInt(bookmark.views_count) || 0,
        answers_count: parseInt(bookmark.answers_count) || 0,
        has_accepted_answer: bookmark.has_accepted_answer || false,
        tags: bookmark.tags || [],
        created_at: bookmark.created_at,
        saved_at: bookmark.bookmarked_at,
        is_bookmarked: true // Always true for saved page
      }));

      console.log('Mapped saved questions:', mappedQuestions);
      setSavedQuestions(mappedQuestions);
    } catch (error: any) {
      console.error('Error fetching saved questions:', error);
      console.error('Error details:', error.response?.data);
      setSavedQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = savedQuestions.filter(question =>
    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <BookmarkX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Diperlukan</h2>
        <p className="text-slate-600 mb-6">
          Anda perlu login untuk melihat pertanyaan yang tersimpan.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          Login untuk Melanjutkan
        </Link>
      </div>
    );
  }

  const renderSkeleton = (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
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
                <div className="h-6 w-24 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
      <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {searchQuery ? 'Pertanyaan tersimpan tidak ditemukan' : 'Belum ada pertanyaan tersimpan'}
      </h3>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">
        {searchQuery
          ? 'Coba sesuaikan kata kunci pencarian untuk menemukan yang Anda cari.'
          : 'Mulai simpan pertanyaan yang menarik atau ingin Anda referensikan nanti. Klik ikon bookmark pada pertanyaan untuk menyimpannya.'
        }
      </p>
      {!searchQuery && (
        <Link
          href="/questions"
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          Jelajahi Pertanyaan
        </Link>
      )}
    </div>
  );

  return (

    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:hidden flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Bookmark className="w-4 h-4 text-emerald-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Tersimpan</h1>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {savedQuestions.length}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Pertanyaan Tersimpan</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Koleksi {savedQuestions.length} pertanyaan yang Anda simpan
          </p>
        </div>

        {/* Search - Sticky on Mobile */}
        {savedQuestions.length > 0 && (
          <div className="sticky sm:static top-[60px] z-20 bg-slate-50 pt-2 pb-4 sm:py-0 mb-4 sm:mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari pertanyaan tersimpan Anda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm sm:text-base bg-white shadow-sm transition-all"
              />
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {loading
            ? renderSkeleton
            : filteredQuestions.length === 0
              ? renderEmptyState
              : filteredQuestions.map((question) => (
                <div key={question.id} className="relative group">
                  {/* Saved Time Badge - Absolute positioned for desktop, relative for mobile */}
                  <div className="sm:absolute sm:top-6 sm:right-6 z-10 mb-2 sm:mb-0 flex justify-end px-2 sm:px-0">
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Disimpan {formatTimeAgo(question.saved_at)}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
                    <QuestionCard question={question} />
                  </div>
                </div>
              ))
          }
        </div>

        {/* Tips */}
        {savedQuestions.length === 0 && !loading && (
          <div className="mt-8 sm:mt-12 bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                <Bookmark className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Tips Menyimpan Pertanyaan
                </h3>
                <div className="grid sm:grid-cols-3 gap-4 sm:gap-8">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-emerald-300 text-sm">Koleksi Pribadi</h4>
                    <p className="text-sm text-emerald-100/80 leading-relaxed">
                      Simpan diskusi menarik untuk dibaca kembali nanti. Hanya Anda yang bisa melihatnya.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-emerald-300 text-sm">Referensi Cepat</h4>
                    <p className="text-sm text-emerald-100/80 leading-relaxed">
                      Tandai jawaban solusi yang mungkin berguna untuk masalah bisnis Anda di masa depan.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-emerald-300 text-sm">Mudah Diakses</h4>
                    <p className="text-sm text-emerald-100/80 leading-relaxed">
                      Temukan kembali semua yang Anda simpan dengan cepat melalui halaman ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
