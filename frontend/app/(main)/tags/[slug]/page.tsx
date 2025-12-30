'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag, ArrowLeft, MessageSquare, ThumbsUp, User, Calendar, Search, Eye } from 'lucide-react';
import { tagAPI, questionAPI } from '@/lib/api';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import { getReputationRingColor } from '@/components/ui/ReputationBadge';

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
  author_reputation?: number;
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
      const tagResponse = await tagAPI.getBySlug(slug);

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
      const response = await questionAPI.getAll({ tag: tagName });
      const questionsData = response.data.data;

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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mnt`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white sm:bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-14 bg-slate-100 border-b border-slate-200"></div>
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="py-4 border-b border-slate-100">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                  <div className="flex gap-2">
                    {[1, 2].map(j => (
                      <div key={j} className="h-5 bg-slate-100 rounded w-16"></div>
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
      <div className="min-h-screen bg-white sm:bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Tag Tidak Ditemukan</h2>
          <p className="text-slate-500 text-sm mb-6">Tag yang Anda cari tidak ada.</p>
          <Link
            href="/tags"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  // Use actual questions count after data is loaded, fallback to tag count while loading
  const displayedQuestionCount = questionsLoading ? (tag.questionCount ?? 0) : questions.length;

  return (
    <div className="min-h-screen bg-white sm:bg-slate-50 pb-20">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 sm:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-slate-900 truncate">#{tag.name}</h1>
            <p className="text-xs text-slate-500">{displayedQuestionCount} pertanyaan</p>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">#{tag.name}</h1>
              <p className="text-sm text-slate-500">
                {tag.description || `Pertanyaan terkait ${tag.name}`} • {displayedQuestionCount} pertanyaan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tag Info */}
      <div className="sm:hidden px-4 py-3 bg-emerald-50 border-b border-emerald-100">
        <p className="text-sm text-emerald-800">
          {tag.description || `Pertanyaan terkait ${tag.name}`}
        </p>
      </div>

      {/* Questions List */}
      <div className="max-w-4xl mx-auto">
        {questionsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-slate-500 text-sm mt-3">Memuat...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 mb-1">Belum ada pertanyaan</h3>
            <p className="text-sm text-slate-500 mb-4">Jadilah yang pertama bertanya dengan tag #{tag.name}</p>
            <Link
              href="/ask"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg font-medium"
            >
              Tanya Sekarang
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 sm:bg-white sm:rounded-xl sm:border sm:border-slate-200 sm:mt-6 sm:mx-4">
            {questions.map((question) => {
              const ringColor = getReputationRingColor(question.author_reputation || 0);
              return (
                <div
                  key={question.id}
                  className="px-4 py-4 hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100"
                  onClick={() => router.push(`/questions/${question.id}`)}
                >
                  {/* Title */}
                  <h3 className="text-[15px] font-semibold text-slate-900 leading-snug mb-2 line-clamp-2">
                    {question.title}
                  </h3>

                  {/* Preview - Desktop only */}
                  <p className="hidden sm:block text-sm text-slate-600 mb-3 line-clamp-2">
                    {question.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {question.tags.slice(0, 3).map((questionTag) => (
                      <span
                        key={questionTag.id}
                        className={`px-2 py-0.5 text-xs rounded ${questionTag.slug === tag.slug
                          ? 'bg-emerald-100 text-emerald-700 font-medium'
                          : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        {questionTag.name}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-500">
                        +{question.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Stats & Author Row */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      {/* Stats */}
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="font-medium text-slate-700">{question.upvotes_count}</span>
                      </span>
                      <span className={`flex items-center gap-1 ${question.has_accepted_answer ? 'text-green-600' : ''}`}>
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-medium text-slate-700">{question.answers_count}</span>
                      </span>
                      <span className="hidden sm:flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{question.views_count}</span>
                      </span>
                    </div>

                    {/* Author & Time */}
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full ring-2 ${ringColor}`}>
                        <UserAvatar
                          src={question.author_avatar}
                          alt={question.author_name}
                          size="xs"
                          fallbackName={question.author_name}
                          className="w-5 h-5"
                        />
                      </div>
                      <span className="truncate max-w-[80px]">{question.author_name}</span>
                      <span className="text-slate-400">•</span>
                      <span>{formatTimeAgo(question.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

