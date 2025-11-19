'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageCircle,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  Share2,
  MoreHorizontal,
  Flag,
  CornerDownRight
} from 'lucide-react';
import { questionAPI, answerAPI, voteAPI, bookmarkAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import VoteSection from '@/components/ui/VoteSection';
import ImageGallery from '@/components/ui/ImageGallery';
import MentionInput from '@/components/ui/MentionInput';
import RichTextParser from '@/components/ui/RichTextParser';

interface QuestionData {
  id: string;
  title: string;
  content: string;
  images?: string[];
  author_id: string;
  author_name: string;
  author_username?: string;
  author_avatar?: string;
  author_reputation: number;
  author_is_verified: boolean;
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
    author_username?: string;
    author_avatar?: string;
    author_reputation: number;
    author_is_verified: boolean;
    created_at: string;
    upvotes_count: number;
    downvotes_count: number;
    is_accepted: boolean;
    user_vote?: 'upvote' | 'downvote' | null;
  }>;
  user_vote?: 'upvote' | 'downvote' | null;
  is_bookmarked?: boolean;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editAnswerContent, setEditAnswerContent] = useState('');
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { }, type: 'danger' });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchQuestion = useCallback(async () => {
    if (!params.id || params.id === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await questionAPI.getById(params.id as string);
      const rawQuestion: any = response.data.data;

      const normalizedQuestion: QuestionData = {
        ...rawQuestion,
        images: Array.isArray(rawQuestion.images)
          ? rawQuestion.images
          : typeof rawQuestion.images === 'string'
            ? (() => {
              try {
                const parsed = JSON.parse(rawQuestion.images);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            })()
            : [],
      };

      setQuestion(normalizedQuestion);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id && params.id !== 'undefined') {
      const questionId = params.id as string;
      fetchQuestion();

      const viewedQuestions = JSON.parse(localStorage.getItem('viewedQuestions') || '[]');
      if (!viewedQuestions.includes(questionId)) {
        viewedQuestions.push(questionId);
        localStorage.setItem('viewedQuestions', JSON.stringify(viewedQuestions));
        questionAPI.incrementView(questionId).catch(console.error);
      }
    }
  }, [params.id, fetchQuestion]);

  const handleVote = async (votableType: string, votableId: string, voteType: string) => {
    if (!user) {
      showAlert('warning', 'Login Diperlukan', 'Silakan login untuk melakukan voting');
      return;
    }

    try {
      const response = await voteAPI.cast({ votableType, votableId, voteType });
      const voteData = response.data.data;

      setQuestion(prevQuestion => {
        if (!prevQuestion) return null;

        if (votableType === 'question') {
          return {
            ...prevQuestion,
            user_vote: voteData.userVote,
            upvotes_count: voteData.upvotes_count,
            downvotes_count: voteData.downvotes_count
          };
        } else {
          return {
            ...prevQuestion,
            answers: prevQuestion.answers.map(answer =>
              answer.id === votableId
                ? {
                  ...answer,
                  user_vote: voteData.userVote,
                  upvotes_count: voteData.upvotes_count,
                  downvotes_count: voteData.downvotes_count
                }
                : answer
            )
          };
        }
      });
    } catch (error) {
      showAlert('error', 'Voting Gagal', 'Gagal melakukan voting');
      fetchQuestion();
    }
  };

  const handleSubmitAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      showAlert('warning', 'Login Diperlukan', 'Silakan login untuk menjawab pertanyaan');
      return;
    }

    const trimmedContent = answerContent.trim();
    if (!trimmedContent) {
      showAlert('warning', 'Konten Kosong', 'Silakan tulis jawaban Anda');
      return;
    }

    if (trimmedContent.length < 20) {
      showAlert('warning', 'Jawaban Terlalu Pendek', 'Jawaban harus minimal 20 karakter');
      return;
    }

    setSubmitting(true);
    try {
      await answerAPI.create({
        content: trimmedContent,
        questionId: params.id as string,
      });
      setAnswerContent('');
      showAlert('success', 'Berhasil', 'Jawaban Anda telah dikirim!');
      fetchQuestion();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal mengirim jawaban';
      showAlert('error', 'Gagal Mengirim', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string, isCurrentlyAccepted: boolean) => {
    try {
      const response = await answerAPI.accept(answerId);
      const action = response.data.action;

      if (action === 'accepted') {
        showAlert('success', 'Berhasil', 'Jawaban telah diterima!');
      } else if (action === 'unaccepted') {
        showAlert('info', 'Dibatalkan', 'Penerimaan jawaban telah dibatalkan');
      }
      fetchQuestion();
    } catch (error) {
      showAlert('error', 'Gagal', 'Terjadi kesalahan saat memproses jawaban');
    }
  };

  const handleDeleteQuestion = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Pertanyaan',
      message: 'Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await questionAPI.delete(params.id as string);
          showAlert('success', 'Berhasil', 'Pertanyaan berhasil dihapus');
          setTimeout(() => router.push('/'), 1500);
        } catch (error: any) {
          showAlert('error', 'Gagal Menghapus', error.response?.data?.message || error.message);
        }
      }
    });
  };

  const handleEditAnswer = (answerId: string, currentContent: string) => {
    setEditingAnswerId(answerId);
    setEditAnswerContent(currentContent);
  };

  const handleSaveEditAnswer = async (answerId: string) => {
    const trimmedContent = editAnswerContent.trim();
    if (!trimmedContent) {
      showAlert('warning', 'Konten Kosong', 'Silakan tulis jawaban Anda');
      return;
    }

    try {
      await answerAPI.update(answerId, trimmedContent);
      showAlert('success', 'Berhasil', 'Jawaban berhasil diperbarui');
      setEditingAnswerId(null);
      setEditAnswerContent('');
      fetchQuestion();
    } catch (error: any) {
      showAlert('error', 'Gagal', error.response?.data?.message || 'Gagal memperbarui jawaban');
    }
  };

  const handleDeleteAnswer = (answerId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Jawaban',
      message: 'Apakah Anda yakin ingin menghapus jawaban ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await answerAPI.delete(answerId);
          showAlert('success', 'Berhasil', 'Jawaban berhasil dihapus');
          fetchQuestion();
        } catch (error: any) {
          showAlert('error', 'Gagal', error.response?.data?.message || 'Gagal menghapus jawaban');
        }
      }
    });
  };

  const handleBookmark = async () => {
    if (!user) {
      showAlert('warning', 'Login Diperlukan', 'Silakan login untuk menyimpan pertanyaan');
      return;
    }
    if (!question) return;

    try {
      if (question.is_bookmarked) {
        await bookmarkAPI.remove(question.id);
        showAlert('success', 'Berhasil', 'Pertanyaan dihapus dari saved');
      } else {
        await bookmarkAPI.add(question.id);
        showAlert('success', 'Berhasil', 'Pertanyaan disimpan ke saved');
      }
      await fetchQuestion();
    } catch (error: any) {
      showAlert('error', 'Bookmark Gagal', error.response?.data?.message || 'Gagal menyimpan pertanyaan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
            <div className="h-40 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium">Pertanyaan tidak ditemukan</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:hidden flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 truncate">Detail Pertanyaan</h1>
        </div>
        <button
          onClick={handleBookmark}
          className={`p-2 rounded-full ${question.is_bookmarked ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
        >
          {question.is_bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali</span>
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex gap-6">
              {/* Desktop Vote (Left Side) */}
              <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
                <VoteSection
                  voteCount={question.upvotes_count || 0}
                  userVote={question.user_vote}
                  onUpvote={() => user ? handleVote('question', question.id, 'upvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                  onDownvote={() => user ? handleVote('question', question.id, 'downvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                  disabled={!user}
                  orientation="vertical"
                  size="medium"
                />
                <button
                  onClick={handleBookmark}
                  className={`mt-4 p-2 rounded-full transition-colors ${question.is_bookmarked
                    ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  title={question.is_bookmarked ? 'Hapus dari tersimpan' : 'Simpan pertanyaan'}
                >
                  {question.is_bookmarked ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${question.author_username || question.author_name}`} className="flex items-center gap-2 group">
                      <UserAvatar
                        src={question.author_avatar}
                        alt={question.author_name}
                        size="sm"
                        fallbackName={question.author_name}
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{question.author_name}</span>
                          <VerifiedBadge isVerified={question.author_is_verified} size="sm" />
                        </div>
                        <span className="text-xs text-slate-500">{formatDate(question.created_at)}</span>
                      </div>
                    </Link>
                  </div>

                  {/* Actions Dropdown or Buttons */}
                  <div className="flex items-center gap-2">
                    {user?.id === question.author_id && (
                      <>
                        <button
                          onClick={() => router.push(`/questions/${question.id}/edit`)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleDeleteQuestion}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 leading-tight">
                  {question.title}
                </h1>

                <div className="prose prose-slate max-w-none mb-6 text-slate-700">
                  <RichTextParser content={question.content} />
                </div>

                {question.images && question.images.length > 0 && (
                  <div className="mb-6">
                    <ImageGallery images={question.images} />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                  {question.tags?.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>

                {/* Mobile Vote & Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 sm:hidden">
                  <VoteSection
                    voteCount={question.upvotes_count || 0}
                    userVote={question.user_vote}
                    onUpvote={() => user ? handleVote('question', question.id, 'upvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                    onDownvote={() => user ? handleVote('question', question.id, 'downvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                    disabled={!user}
                    orientation="horizontal"
                    size="small"
                  />
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {question.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {question.answers_count}
                    </span>
                  </div>
                </div>

                {/* Desktop Stats */}
                <div className="hidden sm:flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-2" title="Dilihat">
                      <Eye className="w-4 h-4" />
                      {question.views_count} views
                    </span>
                    <span className="flex items-center gap-2" title="Jawaban">
                      <MessageCircle className="w-4 h-4" />
                      {question.answers_count} jawaban
                    </span>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Bagikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              {question.answers_count} Jawaban
            </h2>
          </div>

          <div className="space-y-6">
            {question.answers?.map((answer) => (
              <div
                key={answer.id}
                className={`bg-white rounded-2xl border p-6 sm:p-8 transition-all ${answer.is_accepted
                  ? 'border-emerald-200 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-100'
                  : 'border-slate-200 shadow-sm'
                  }`}
              >
                <div className="flex gap-6">
                  {/* Desktop Vote (Left Side) */}
                  <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
                    <VoteSection
                      voteCount={answer.upvotes_count || 0}
                      userVote={answer.user_vote}
                      onUpvote={() => user ? handleVote('answer', answer.id, 'upvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                      onDownvote={() => user ? handleVote('answer', answer.id, 'downvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                      disabled={!user}
                      orientation="vertical"
                      size="small"
                    />
                    {answer.is_accepted && (
                      <div className="mt-4 p-2 bg-emerald-100 text-emerald-600 rounded-full" title="Jawaban Terbaik">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Answer Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${answer.author_username || answer.author_name}`} className="flex items-center gap-2 group">
                          <UserAvatar
                            src={answer.author_avatar}
                            alt={answer.author_name}
                            size="xs"
                            fallbackName={answer.author_name}
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{answer.author_name}</span>
                              <VerifiedBadge isVerified={answer.author_is_verified} size="sm" />
                            </div>
                            <span className="text-xs text-slate-500">{formatDate(answer.created_at)}</span>
                          </div>
                        </Link>
                      </div>

                      {/* Answer Actions */}
                      <div className="flex items-center gap-2">
                        {user?.id === answer.author_id && editingAnswerId !== answer.id && (
                          <>
                            <button
                              onClick={() => handleEditAnswer(answer.id, answer.content)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnswer(answer.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Answer Content */}
                    {editingAnswerId === answer.id ? (
                      <div className="mb-4">
                        <MentionInput
                          value={editAnswerContent}
                          onChange={setEditAnswerContent}
                          placeholder="Edit jawaban Anda..."
                          className="text-sm min-h-[150px]"
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleSaveEditAnswer(answer.id)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => {
                              setEditingAnswerId(null);
                              setEditAnswerContent('');
                            }}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-slate max-w-none mb-4 text-slate-700">
                        <RichTextParser content={answer.content} />
                      </div>
                    )}

                    {/* Mobile Vote & Accept Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 sm:hidden">
                      <VoteSection
                        voteCount={answer.upvotes_count || 0}
                        userVote={answer.user_vote}
                        onUpvote={() => user ? handleVote('answer', answer.id, 'upvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                        onDownvote={() => user ? handleVote('answer', answer.id, 'downvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                        disabled={!user}
                        orientation="horizontal"
                        size="small"
                      />
                      {answer.is_accepted && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Terbaik
                        </span>
                      )}
                    </div>

                    {/* Accept Answer Action (Question Owner Only) */}
                    {user?.id === question.author_id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        {answer.is_accepted ? (
                          <button
                            onClick={() => handleAcceptAnswer(answer.id, answer.is_accepted)}
                            className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors"
                          >
                            Batalkan sebagai jawaban terbaik
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAcceptAnswer(answer.id, answer.is_accepted)}
                            disabled={question.answers?.some(a => a.is_accepted && a.id !== answer.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${question.answers?.some(a => a.is_accepted && a.id !== answer.id)
                              ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Tandai sebagai Jawaban Terbaik
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answer Input */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CornerDownRight className="w-5 h-5 text-slate-400" />
            Tulis Jawaban Anda
          </h3>

          {user ? (
            <form onSubmit={handleSubmitAnswer}>
              <MentionInput
                value={answerContent}
                onChange={setAnswerContent}
                onSubmit={handleSubmitAnswer}
                placeholder="Bagikan pengetahuan Anda... Ketik @ untuk mention user"
                className="min-h-[150px] text-base"
                disabled={submitting}
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !answerContent.trim()}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:shadow-none"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200 border-dashed">
              <p className="text-slate-600 mb-4">Anda perlu login untuk menjawab pertanyaan ini.</p>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                Login Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
