'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag, ArrowLeft, MessageSquare, ThumbsUp, User, Calendar, Search } from 'lucide-react';
import { tagAPI, questionAPI } from '@/lib/api';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';

interface TagData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  questionCount: number;
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_username?: string;
  author_avatar?: string;
  author_id?: string;
  author_is_verified?: boolean;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  upvotes_count: number;
  answers_count: number;
  views_count: number;
  created_at: string;
  has_accepted_answer: boolean;
}

export default function TagDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [tag, setTag] = useState<TagData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchTagData();
      fetchQuestions();
    }
  }, [slug]);

  const fetchTagData = async () => {
    try {
      const response = await tagAPI.getBySlug(slug);
      // Extract tag data correctly from nested structure
      let tagData = null;
      if (response.data.data && response.data.data.tag) {
        tagData = response.data.data.tag;
      } else if (response.data.tag) {
        tagData = response.data.tag;
      } else if (response.data.data) {
        tagData = response.data.data;
      }
      
      if (!tagData || !tagData.name) {
        setError('Tag tidak ditemukan');
        return;
      }
      
      // Map the data to match frontend interface
      const mappedTag = {
        id: tagData.id,
        name: tagData.name,
        slug: tagData.slug,
        description: tagData.description,
        questionCount: tagData.usage_count ?? tagData.question_count ?? 0,
        createdAt: tagData.created_at
      };
      
      setTag(mappedTag);
    } catch (error) {
      console.error('Error fetching tag:', error);
      setError('Tag tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      // First get tag data to get the tag name
      const tagResponse = await tagAPI.getBySlug(slug);
      
      // Extract tag data correctly
      let tagData = null;
      if (tagResponse.data.data && tagResponse.data.data.tag) {
        tagData = tagResponse.data.data.tag;
      } else if (tagResponse.data.tag) {
        tagData = tagResponse.data.tag;
      } else if (tagResponse.data.data) {
        tagData = tagResponse.data.data;
      }
      
      if (!tagData || !tagData.name) {
        setQuestions([]);
        return;
      }
      
      const tagName = tagData.name;
      
      // Then get questions by tag name
      const response = await questionAPI.getAll({ tag: tagName });
      const questionsData = response.data.data;
      
      // Handle different response structures
      if (Array.isArray(questionsData)) {
        setQuestions(questionsData);
      } else if (questionsData && Array.isArray(questionsData.questions)) {
        setQuestions(questionsData.questions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl p-6 mb-6">
              <div className="h-10 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="flex gap-2">
                    {[1,2,3].map(j => (
                      <div key={j} className="h-6 bg-slate-200 rounded w-16"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Tag Tidak Ditemukan</h2>
          <p className="text-slate-600 mb-6">Tag yang Anda cari tidak ada atau telah dihapus.</p>
          <Link
            href="/tags"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Tags
          </Link>
        </div>
      </div>
    );
  }

  const displayedQuestionCount = tag.questionCount ?? questions.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-3 sm:mb-4 p-2 -ml-2 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base font-medium">Kembali</span>
          </button>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-3 break-words">#{tag.name}</h1>
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-3 sm:mb-4">
                  {tag.description || `Pertanyaan terkait ${tag.name}`}
                </p>
                <div className="text-xs sm:text-sm text-slate-500">
                  <span className="font-medium text-emerald-600">{displayedQuestionCount}</span> pertanyaan tersedia
                  {formatTimeAgo(tag.createdAt) && (
                    <>
                      {' '}Dibuat {formatTimeAgo(tag.createdAt)}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900">
              Pertanyaan dengan Tag <span className="text-emerald-600">#{tag.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {displayedQuestionCount} pertanyaan ditemukan
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {questionsLoading ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-slate-500 text-sm sm:text-base mt-4">Memuat pertanyaan...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                  Belum ada pertanyaan
                </h3>
                <p className="text-sm sm:text-base text-slate-500 mb-6">
                  Jadilah yang pertama bertanya dengan tag #{tag.name}
                </p>
                <Link
                  href="/ask"
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-emerald-600 text-white text-sm sm:text-base rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Tanya Pertanyaan Pertama
                </Link>
              </div>
            ) : (
              questions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 sm:p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/questions/${question.id}`)}
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Stats - Hidden on mobile, shown as inline on desktop */}
                    <div className="hidden sm:flex flex-col items-center gap-2 text-sm text-slate-500 min-w-[70px]">
                      <div className="flex flex-col items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-900">{question.upvotes_count}</span>
                        <span className="text-xs">vote</span>
                      </div>
                      <div className={`flex flex-col items-center gap-1 ${
                        question.has_accepted_answer ? 'text-green-600' : ''
                      }`}>
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-semibold text-slate-900">{question.answers_count}</span>
                        <span className="text-xs">jawaban</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/questions/${question.id}`}
                        className="block group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
                          {question.title}
                        </h3>
                        <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-3">
                          {question.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      </Link>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                        {question.tags.map((questionTag) => (
                          <Link
                            key={questionTag.id}
                            href={`/tags/${questionTag.slug}`}
                            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                              questionTag.slug === tag.slug
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 font-medium'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {questionTag.name}
                          </Link>
                        ))}
                      </div>

                      {/* Mobile Stats + Author */}
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                        {/* Mobile stats */}
                        <div className="flex sm:hidden items-center gap-3">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-medium text-slate-900">{question.upvotes_count}</span>
                          </div>
                          <div className={`flex items-center gap-1 ${
                            question.has_accepted_answer ? 'text-green-600' : ''
                          }`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="font-medium text-slate-900">{question.answers_count}</span>
                          </div>
                        </div>
                        
                        {/* Author */}
                        <Link
                          href={`/profile/${question.author_username || question.author_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'unknown'}`}
                          className="flex items-center gap-1.5 sm:gap-2 hover:text-emerald-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <UserAvatar
                            src={question.author_avatar}
                            alt={question.author_name}
                            size="xs"
                            fallbackName={question.author_name}
                          />
                          <span className="truncate max-w-[120px] sm:max-w-none">{question.author_name}</span>
                          <VerifiedBadge isVerified={question.author_is_verified || false} size="sm" />
                        </Link>
                        
                        {/* Date */}
                        <span className="ml-auto">{formatTimeAgo(question.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
