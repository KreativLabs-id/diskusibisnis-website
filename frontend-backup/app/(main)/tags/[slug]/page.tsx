'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag, ArrowLeft, MessageSquare, ThumbsUp, User, Calendar, Search } from 'lucide-react';
import { tagAPI, questionAPI } from '@/lib/api';

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
  author_avatar?: string;
  author_id?: string;
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
      setTag(response.data.data);
    } catch (error) {
      console.error('Error fetching tag:', error);
      setError('Tag tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await questionAPI.getAll({ tag: slug });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat tag...</p>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/tags"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Tags
          </Link>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-3">#{tag.name}</h1>
                <p className="text-lg text-slate-600 mb-4">
                  {tag.description || `Pertanyaan terkait ${tag.name}`}
                </p>
                <div className="text-sm text-slate-500">
                  <span>{tag.questionCount} pertanyaan tersedia • Dibuat {formatTimeAgo(tag.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Pertanyaan dengan Tag #{tag.name}
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {questionsLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-slate-500 mt-4">Memuat pertanyaan...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="p-12 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Belum ada pertanyaan
                </h3>
                <p className="text-slate-500 mb-6">
                  Jadilah yang pertama bertanya dengan tag #{tag.name}
                </p>
                <Link
                  href="/ask"
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Tanya Pertanyaan Pertama
                </Link>
              </div>
            ) : (
              questions.map((question) => (
                <div key={question.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex gap-4">
                    {/* Stats */}
                    <div className="flex flex-col items-center gap-2 text-sm text-slate-500 min-w-[80px]">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-medium">{question.upvotes_count}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${
                        question.has_accepted_answer ? 'text-green-600' : ''
                      }`}>
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">{question.answers_count}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <Link
                        href={`/questions/${question.id}`}
                        className="block group"
                      >
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                          {question.title}
                        </h3>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                          {question.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      </Link>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.tags.map((questionTag) => (
                          <Link
                            key={questionTag.id}
                            href={`/tags/${questionTag.slug}`}
                            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                              questionTag.slug === tag.slug
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            #{questionTag.name}
                          </Link>
                        ))}
                      </div>

                      {/* Author and Date */}
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <Link
                          href={`/profile/${question.author_id || 'unknown'}`}
                          className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                        >
                          {question.author_avatar ? (
                            <img
                              src={question.author_avatar}
                              alt={question.author_name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {question.author_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span>{question.author_name}</span>
                        </Link>
                        <span>{formatTimeAgo(question.created_at)}</span>
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
