'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Eye, Edit, Trash, CheckCircle, ArrowLeft } from 'lucide-react';
import { questionAPI, answerAPI, voteAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';

interface QuestionData {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_reputation: number;
  created_at: string;
  upvotes_count: number;
  downvotes_count: number;
  views_count: number;
  answers_count: number;
  is_closed: boolean;
  tags: Array<{ id: string; name: string; slug: string }>;
  answers: Array<{
    id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_reputation: number;
    created_at: string;
    upvotes_count: number;
    downvotes_count: number;
    is_accepted: boolean;
    user_vote?: 'upvote' | 'downvote' | null;
  }>;
  user_vote?: 'upvote' | 'downvote' | null;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await questionAPI.getById(params.id as string);
      setQuestion(response.data.data);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      const questionId = params.id as string;
      
      // Always fetch question data
      fetchQuestion();
      
      // Track viewed questions in localStorage to prevent duplicate view counts
      const viewedQuestions = JSON.parse(localStorage.getItem('viewedQuestions') || '[]');
      
      // Only increment view count if not already viewed in this session
      if (!viewedQuestions.includes(questionId)) {
        // Mark as viewed
        viewedQuestions.push(questionId);
        localStorage.setItem('viewedQuestions', JSON.stringify(viewedQuestions));
        
        // Increment view count on backend
        questionAPI.incrementView(questionId).catch(err => 
          console.error('Error incrementing view count:', err)
        );
      }
    }
  }, [params.id, fetchQuestion]);

  const handleVote = async (votableType: string, votableId: string, voteType: string) => {
    if (!user) {
      alert('Silakan login untuk melakukan voting');
      return;
    }

    try {
      // Jika user sudah vote dengan type yang sama, backend akan remove vote
      // Jika user vote dengan type berbeda, backend akan update vote
      await voteAPI.cast({ votableType, votableId, voteType });
      fetchQuestion(); // Refresh data untuk update vote count
    } catch (error) {
      console.error('Error voting:', error);
      alert('Gagal melakukan voting');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to answer');
      return;
    }

    setSubmitting(true);
    try {
      await answerAPI.create({
        content: answerContent,
        questionId: params.id as string,
      });
      setAnswerContent('');
      fetchQuestion();
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await answerAPI.accept(answerId);
      fetchQuestion();
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      return;
    }

    try {
      await questionAPI.delete(params.id as string);
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Gagal menghapus pertanyaan');
    }
  };

  const handleEditQuestion = () => {
    // Redirect to edit page
    window.location.href = `/questions/${params.id}/edit`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pertanyaan tidak ditemukan</h2>
        <Link href="/" className="text-blue-600 hover:text-blue-700">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-5xl">
      {/* Back Button - Prominent */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-3 transition-colors p-2 hover:bg-emerald-50 rounded-lg"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Kembali</span>
      </button>

      {/* Question */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex gap-6">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => user ? handleVote('question', question.id, 'upvote') : alert('Silakan login untuk voting')}
              disabled={!user}
              className={`p-2 rounded-lg transition-colors ${
                question.user_vote === 'upvote' 
                  ? 'bg-slate-100' 
                  : user 
                    ? 'hover:bg-slate-50' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
              title={!user ? 'Login untuk voting' : ''}
            >
              <ArrowBigUp className={`w-6 h-6 ${
                question.user_vote === 'upvote' 
                  ? 'text-slate-900 fill-slate-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`} />
            </button>
            <span className="text-2xl font-bold text-gray-900">{question.upvotes_count || 0}</span>
            <button
              onClick={() => user ? handleVote('question', question.id, 'downvote') : alert('Silakan login untuk voting')}
              disabled={!user}
              className={`p-2 rounded-lg transition-colors ${
                question.user_vote === 'downvote' 
                  ? 'bg-slate-100' 
                  : user 
                    ? 'hover:bg-slate-50' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
              title={!user ? 'Login untuk voting' : ''}
            >
              <ArrowBigDown className={`w-6 h-6 ${
                question.user_vote === 'downvote' 
                  ? 'text-slate-900 fill-slate-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
            
            <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{question.views_count}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span>{question.answers_count}</span>
              </div>
              <span>{formatDate(question.created_at)}</span>
            </div>

            <div className="prose max-w-none mb-4">
              <p className="text-gray-700">{question.content}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-100 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {question.author_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{question.author_name}</p>
                  <p className="text-sm text-slate-500">{question.author_reputation || 0} reputasi</p>
                </div>
              </div>
              {user?.id === question.author_id && (
                <div className="flex gap-2">
                  <button 
                    onClick={handleEditQuestion}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit pertanyaan"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={handleDeleteQuestion}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus pertanyaan"
                  >
                    <Trash className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {question.answers_count} Jawaban
      </h2>

      <div className="space-y-6 mb-8">
        {question.answers?.map((answer) => (
          <div
            key={answer.id}
            className={`rounded-xl border p-4 sm:p-6 ${
              answer.is_accepted 
                ? 'bg-emerald-50 border-emerald-300 shadow-sm' 
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => user ? handleVote('answer', answer.id, 'upvote') : alert('Silakan login untuk voting')}
                  disabled={!user}
                  className={`p-2 rounded-lg transition-colors ${
                    answer.user_vote === 'upvote' 
                      ? 'bg-slate-100' 
                      : user 
                        ? 'hover:bg-slate-50' 
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                  title={!user ? 'Login untuk voting' : ''}
                >
                  <ArrowBigUp className={`w-5 h-5 ${
                    answer.user_vote === 'upvote' 
                      ? 'text-slate-900 fill-slate-900' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`} />
                </button>
                <span className="text-xl font-bold text-gray-900">{answer.upvotes_count || 0}</span>
                <button
                  onClick={() => user ? handleVote('answer', answer.id, 'downvote') : alert('Silakan login untuk voting')}
                  disabled={!user}
                  className={`p-2 rounded-lg transition-colors ${
                    answer.user_vote === 'downvote' 
                      ? 'bg-slate-100' 
                      : user 
                        ? 'hover:bg-slate-50' 
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                  title={!user ? 'Login untuk voting' : ''}
                >
                  <ArrowBigDown className={`w-5 h-5 ${
                    answer.user_vote === 'downvote' 
                      ? 'text-slate-900 fill-slate-900' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`} />
                </button>
                {answer.is_accepted && (
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                {answer.is_accepted && (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-3 bg-emerald-100 px-3 py-1.5 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Jawaban Terbaik</span>
                  </div>
                )}

                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700">{answer.content}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {answer.author_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{answer.author_name}</p>
                      <p className="text-sm text-slate-500">
                        {answer.author_reputation || 0} reputasi · {formatDate(answer.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user?.id === question.author_id && !answer.is_accepted && (
                      <button
                        onClick={() => handleAcceptAnswer(answer.id)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                      >
                        Terima Jawaban
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Form */}
      {user ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Jawaban Anda</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
              placeholder="Bagikan pengetahuan dan pengalaman Anda untuk membantu sesama pelaku UMKM..."
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-6 text-center">
          <p className="text-slate-700 mb-4">
            Anda harus login untuk menjawab pertanyaan ini.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Login untuk Menjawab
          </Link>
        </div>
      )}

      {/* Floating Answer Button - Mobile Only */}
      {user && (
        <button
          onClick={() => document.querySelector('textarea')?.focus()}
          className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center group"
          title="Tulis Jawaban"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
