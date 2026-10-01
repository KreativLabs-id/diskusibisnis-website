'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag, ArrowLeft, MessageSquare, ThumbsUp, User, Calendar, Search, Eye } from 'lucide-react';
import { tagAPI, questionAPI } from '@/lib/api';
import QuestionCard from '@/components/questions/QuestionCard';
import QuestionCardSkeleton from '@/components/questions/QuestionCardSkeleton';

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
      <div className="min-h-screen bg-white dark:bg-slate-950 px-4 py-12">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14">
          <div className="animate-pulse space-y-8">
            <div className="mb-8 sm:mb-10">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-32 mb-6"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-96 max-w-full"></div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-200 dark:divide-slate-800 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <QuestionCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white dark:border-slate-800/60 p-12">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Topik Tidak Ditemukan</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Topik yang Anda cari tidak ada atau telah dihapus.</p>
          <Link
            href="/tags"
            className="inline-flex items-center px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Topik
          </Link>
        </div>
      </div>
    );
  }

  // Use actual questions count after data is loaded, fallback to tag count while loading
  const displayedQuestionCount = questionsLoading ? (tag.questionCount ?? 0) : questions.length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14">
        {/* Professional Minimalist Header */}
        <div className="mb-8 flex flex-col gap-1">
          <Link href="/tags" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors mb-4 w-max">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            #{tag.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tag.description || `Pertanyaan terkait topik ${tag.name}`} • {displayedQuestionCount} pertanyaan
          </p>
        </div>

        {/* Questions List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-200 dark:divide-slate-800">
          {questionsLoading ? (
            <>
              <QuestionCardSkeleton />
              <QuestionCardSkeleton />
              <QuestionCardSkeleton />
            </>
          ) : questions.length === 0 ? (
            <div className="py-20 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-12">
              <div className="inline-flex w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Belum ada pertanyaan</h3>
              <p className="text-slate-500 mt-2 mb-8">Jadilah yang pertama bertanya dengan topik #{tag.name}</p>
              <Link
                href="/ask"
                className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm"
              >
                Tanya Sekarang
              </Link>
            </div>
          ) : (
            questions.map((question) => (
              <QuestionCard key={question.id} question={question as any} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

