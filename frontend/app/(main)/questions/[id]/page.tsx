'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageCircle, 
  Eye, 
  Edit, 
  Trash, 
  CheckCircle, 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck 
} from 'lucide-react';
import { questionAPI, answerAPI, voteAPI, bookmarkAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import VoteSection from '@/components/ui/VoteSection';
import VoteButton from '@/components/ui/VoteButton';
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
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} hari lalu`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} bulan lalu`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} tahun lalu`;
  };

  const fetchQuestion = useCallback(async () => {
    if (!params.id || params.id === 'undefined') {
      console.error('Invalid question ID');
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
      showAlert('warning', 'Login Diperlukan', 'Silakan login untuk melakukan voting');
      return;
    }

    try {
      // Call the vote API
      const response = await voteAPI.cast({ votableType, votableId, voteType });
      const voteData = response.data.data;
      
      // Update state immediately with response data
      setQuestion(prevQuestion => {
        if (!prevQuestion) return null;
        
        if (votableType === 'question') {
          // Update question vote
          return {
            ...prevQuestion,
            user_vote: voteData.userVote,
            upvotes_count: voteData.upvotes_count,
            downvotes_count: voteData.downvotes_count
          };
        } else {
          // Update answer vote
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
      console.error('Error voting:', error);
      showAlert('error', 'Voting Gagal', 'Gagal melakukan voting');
      // Refresh on error to ensure consistency
      fetchQuestion();
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
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

    console.log('Submitting answer:', { 
      questionId: params.id, 
      contentLength: trimmedContent.length,
      content: trimmedContent.substring(0, 50) + '...'
    });

    setSubmitting(true);
    try {
      const response = await answerAPI.create({
        content: trimmedContent,
        questionId: params.id as string,
      });
      console.log('Answer created successfully:', response.data);
      setAnswerContent('');
      showAlert('success', 'Berhasil', 'Jawaban Anda telah dikirim!');
      fetchQuestion();
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Gagal mengirim jawaban';
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
      console.error('Error accepting answer:', error);
      showAlert('error', 'Gagal', 'Terjadi kesalahan saat memproses jawaban');
    }
  };

  const handleDeleteQuestion = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Pertanyaan',
      message: 'Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini tidak dapat dibatalkan.',
      onConfirm: async () => {
        try {
          console.log('Deleting question:', params.id);
          console.log('User:', user);
          const response = await questionAPI.delete(params.id as string);
          console.log('Delete response:', response);
          showAlert('success', 'Berhasil', 'Pertanyaan berhasil dihapus');
          setTimeout(() => router.push('/'), 1500);
        } catch (error: any) {
          console.error('Error deleting question:', error);
          if (error.response?.status === 401) {
            showAlert('warning', 'Login Diperlukan', 'Anda harus login untuk menghapus pertanyaan');
          } else if (error.response?.status === 403) {
            showAlert('error', 'Akses Ditolak', 'Anda tidak memiliki izin untuk menghapus pertanyaan ini');
          } else {
            showAlert('error', 'Gagal Menghapus', error.response?.data?.message || error.message);
          }
        }
      }
    });
  };

  const handleEditQuestion = () => {
    // Redirect to edit page
    router.push(`/questions/${params.id}/edit`);
  };

  const handleEditAnswer = (answerId: string, currentContent: string) => {
    setEditingAnswerId(answerId);
    setEditAnswerContent(currentContent);
  };

  const handleCancelEditAnswer = () => {
    setEditingAnswerId(null);
    setEditAnswerContent('');
  };

  const handleSaveEditAnswer = async (answerId: string) => {
    const trimmedContent = editAnswerContent.trim();
    
    if (!trimmedContent) {
      showAlert('warning', 'Konten Kosong', 'Silakan tulis jawaban Anda');
      return;
    }

    if (trimmedContent.length < 20) {
      showAlert('warning', 'Jawaban Terlalu Pendek', 'Jawaban harus minimal 20 karakter');
      return;
    }

    try {
      await answerAPI.update(answerId, trimmedContent);
      showAlert('success', 'Berhasil', 'Jawaban berhasil diperbarui');
      setEditingAnswerId(null);
      setEditAnswerContent('');
      fetchQuestion();
    } catch (error: any) {
      console.error('Error updating answer:', error);
      showAlert('error', 'Gagal', error.response?.data?.message || 'Gagal memperbarui jawaban');
    }
  };

  const handleDeleteAnswer = (answerId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Jawaban',
      message: 'Apakah Anda yakin ingin menghapus jawaban ini? Tindakan ini tidak dapat dibatalkan.',
      onConfirm: async () => {
        try {
          await answerAPI.delete(answerId);
          showAlert('success', 'Berhasil', 'Jawaban berhasil dihapus');
          fetchQuestion();
        } catch (error: any) {
          console.error('Error deleting answer:', error);
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

    if (!question) {
      showAlert('error', 'Error', 'Pertanyaan tidak ditemukan');
      return;
    }

    try {
      if (question.is_bookmarked) {
        await bookmarkAPI.remove(question.id);
        showAlert('success', 'Berhasil', 'Pertanyaan dihapus dari saved');
      } else {
        await bookmarkAPI.add(question.id);
        showAlert('success', 'Berhasil', 'Pertanyaan disimpan ke saved');
      }
      await fetchQuestion(); // Refresh to update bookmark status
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Gagal menyimpan pertanyaan';
      showAlert('error', 'Bookmark Gagal', errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Question skeleton */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-10 bg-slate-200 rounded-lg" />
                <div className="w-16 h-10 bg-slate-200 rounded-lg" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                  <div className="h-4 bg-slate-200 rounded w-4/5" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                  <div className="h-6 w-24 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          {/* Answers skeleton */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4" />
            {[1, 2].map((i) => (
              <div key={i} className="border-t border-slate-200 pt-6 mt-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                  <div className="flex items-center gap-3 pt-3">
                    <div className="h-8 w-8 bg-slate-200 rounded-full" />
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pertanyaan tidak ditemukan</h2>
        <Link href="/" className="text-emerald-600 hover:text-emerald-700">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
        {/* Back Button - Mobile Optimized */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-4 transition-colors p-2 hover:bg-emerald-50 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Question Card - Mobile Responsive */}
        <div className="border-b-2 border-slate-300 pb-6 mb-12 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Vote Section with Animations */}
            <div className="flex items-center justify-center gap-4 order-2 sm:order-1">
              <VoteSection
                voteCount={question.upvotes_count || 0}
                userVote={question.user_vote}
                onUpvote={() => user ? handleVote('question', question.id, 'upvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                onDownvote={() => user ? handleVote('question', question.id, 'downvote') : showAlert('warning', 'Login Diperlukan', 'Silakan login untuk voting')}
                disabled={!user}
                orientation="horizontal"
                size="medium"
              />
              
              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                disabled={!user}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  question.is_bookmarked 
                    ? 'bg-amber-100 text-amber-600 scale-105 shadow-sm' 
                    : user 
                      ? 'hover:bg-slate-50 text-gray-400 hover:text-amber-500 hover:scale-105' 
                      : 'opacity-50 cursor-not-allowed text-gray-400'
                }`}
                title={!user ? 'Login untuk menyimpan' : question.is_bookmarked ? 'Hapus dari tersimpan' : 'Simpan pertanyaan'}
              >
                {question.is_bookmarked ? (
                  <BookmarkCheck className="w-5 h-5 animate-bounce-in" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 order-1 sm:order-2">
              {/* Question Title - Mobile Optimized */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight break-words">{question.title}</h1>
            
              {/* Question Content */}
              <div className="prose max-w-none mb-4 sm:mb-6">
                <RichTextParser 
                  content={question.content} 
                  className="text-gray-700 text-sm sm:text-base leading-relaxed" 
                />
              </div>

              {/* Question Images */}
              {question.images && question.images.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <ImageGallery images={question.images} />
                </div>
              )}

              {/* Question Tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {question.tags?.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>

              {/* Question Meta Info - Mobile Optimized */}
              <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{question.views_count} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{question.answers_count} jawaban</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Edit & Delete Buttons for Question Owner */}
                  {user?.id === question.author_id && (
                    <div className="flex items-center gap-1 mr-2">
                      <button
                        onClick={handleEditQuestion}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Pertanyaan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDeleteQuestion}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Pertanyaan"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <Link
                    href={`/profile/${question.author_username || question.author_name?.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UserAvatar
                      src={question.author_avatar}
                      alt={question.author_name}
                      size="sm"
                      fallbackName={question.author_name}
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-slate-900 text-xs sm:text-sm">{question.author_name}</p>
                        <VerifiedBadge isVerified={question.author_is_verified} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500">{formatDate(question.created_at)}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section - Mobile Optimized */}
        <div className="border-t-2 sm:border-t-4 border-slate-100 pt-6 sm:pt-8 mt-6 sm:mt-8">
          <div className="bg-slate-50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 sm:py-3 mb-4 sm:mb-6 rounded-lg">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              {question.answers_count} Jawaban
            </h2>
          </div>
        </div>

        <div className="space-y-0 mb-6 sm:mb-8">
          {question.answers?.map((answer) => (
            <div
              key={answer.id}
              className="border-b-2 border-slate-300 pb-6 mb-12 p-3 sm:p-4 lg:p-6 last:border-b-0 last:pb-0 last:mb-0"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                {/* Vote Section with Animations */}
                <div className="flex items-center justify-center gap-3 order-2 sm:order-1">
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
                    <div className="flex items-center justify-center p-2">
                      <CheckCircle className="w-6 h-6 text-emerald-600 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Answer Content */}
                <div className="flex-1 order-1 sm:order-2">
                  {answer.is_accepted && (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium mb-3 sm:mb-4 bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm border-l-4 border-emerald-400">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>Jawaban Terbaik</span>
                    </div>
                  )}

                  {editingAnswerId === answer.id ? (
                    <div className="mb-3 sm:mb-4">
                      <MentionInput
                        value={editAnswerContent}
                        onChange={setEditAnswerContent}
                        placeholder="Edit jawaban Anda... Ketik @ untuk mention"
                        className="text-sm"
                        minRows={6}
                        maxRows={15}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEditAnswer(answer.id)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={handleCancelEditAnswer}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose max-w-none mb-3 sm:mb-4">
                      <RichTextParser 
                        content={answer.content} 
                        className="text-gray-700 text-sm sm:text-base leading-relaxed" 
                      />
                    </div>
                  )}

                  <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-slate-200">
                    <Link
                      href={`/profile/${answer.author_username || answer.author_name?.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <UserAvatar
                        src={answer.author_avatar}
                        alt={answer.author_name}
                        size="sm"
                        fallbackName={answer.author_name}
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-slate-900 text-xs sm:text-sm">{answer.author_name}</p>
                          <VerifiedBadge isVerified={answer.author_is_verified} size="sm" />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500">
                          {answer.author_reputation || 0} reputasi · {formatDate(answer.created_at)}
                        </p>
                      </div>
                    </Link>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      {/* Edit & Delete Buttons for Answer Owner */}
                      {user?.id === answer.author_id && editingAnswerId !== answer.id && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditAnswer(answer.id, answer.content)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Jawaban"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnswer(answer.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Jawaban"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {user?.id === question.author_id && (
                        <>
                          {answer.is_accepted ? (
                            <button
                              onClick={() => handleAcceptAnswer(answer.id, answer.is_accepted)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg transition-colors text-xs sm:text-sm font-medium"
                              title="Klik untuk membatalkan penerimaan"
                            >
                              Batalkan Penerimaan
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAcceptAnswer(answer.id, answer.is_accepted)}
                              disabled={question.answers?.some(a => a.is_accepted && a.id !== answer.id)}
                              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                                question.answers?.some(a => a.is_accepted && a.id !== answer.id)
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                              title={
                                question.answers?.some(a => a.is_accepted && a.id !== answer.id)
                                  ? 'Sudah ada jawaban lain yang diterima'
                                  : 'Klik untuk menerima jawaban ini'
                              }
                            >
                              Terima Jawaban
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Answer Form - Mobile Optimized */}
        {user ? (
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Jawaban Anda</h3>
            <form onSubmit={handleSubmitAnswer}>
              <MentionInput
                value={answerContent}
                onChange={setAnswerContent}
                onSubmit={handleSubmitAnswer}
                placeholder="Bagikan pengetahuan dan pengalaman Anda... Ketik @ untuk mention user atau paste link"
                className="text-sm"
                minRows={5}
                maxRows={15}
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
              >
                {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 lg:p-6 text-center">
            <p className="text-slate-700 mb-3 sm:mb-4 text-sm sm:text-base">
              Anda harus login untuk menjawab pertanyaan ini.
            </p>
            <Link
              href="/login"
              className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm sm:text-base"
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
        type="danger"
      />
    </div>
  );
}


