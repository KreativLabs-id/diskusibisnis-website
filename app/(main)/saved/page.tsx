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
      const bookmarks = response.data.data.bookmarks || [];
      
      // Map bookmarks to SavedQuestion format
      const mappedQuestions = bookmarks.map((bookmark: any) => ({
        id: bookmark.id,
        title: bookmark.title,
        content: bookmark.content,
        author_name: bookmark.author_name,
        author_avatar: bookmark.author_avatar,
        author_reputation: bookmark.author_reputation || 0,
        author_is_verified: bookmark.author_is_verified || false,
        upvotes_count: bookmark.upvotes_count || 0,
        views_count: bookmark.views_count || 0,
        answers_count: bookmark.answers_count || 0,
        has_accepted_answer: false,
        tags: bookmark.tags || [],
        created_at: bookmark.created_at,
        saved_at: bookmark.bookmarked_at
      }));
      
      setSavedQuestions(mappedQuestions);
    } catch (error) {
      console.error('Error fetching saved questions:', error);
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Pertanyaan Tersimpan</h1>
            <p className="text-slate-600 text-sm sm:text-base">
              {savedQuestions.length} pertanyaan tersimpan
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      {savedQuestions.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Cari pertanyaan tersimpan Anda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          />
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {loading
          ? renderSkeleton
          : filteredQuestions.length === 0
            ? renderEmptyState
            : filteredQuestions.map((question) => (
                <div key={question.id} className="relative">
                  <QuestionCard question={question} />
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>Disimpan {formatTimeAgo(question.saved_at)}</span>
                    </div>
                  </div>
                </div>
              ))
        }
      </div>

      {/* Tips */}
      {savedQuestions.length === 0 && !loading && (
        <div className="mt-12 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Cara menyimpan pertanyaan
              </h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>
                    Klik ikon bookmark pada pertanyaan untuk menyimpannya ke koleksi pribadi Anda
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Pertanyaan tersimpan bersifat pribadi dan hanya terlihat oleh Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Gunakan halaman ini untuk mengakses pertanyaan yang ingin Anda referensikan nanti</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
