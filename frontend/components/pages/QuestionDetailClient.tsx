'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    Flag,
    LogIn,
    ThumbsUp,
    Clock,
    User,
    MoreHorizontal
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
import LoginPromptModal from '@/components/ui/LoginPromptModal';
import ReportModal from '@/components/ui/ReportModal';
import { ReputationBadgeCompact } from '@/components/ui/ReputationBadge';
import QuestionCard from '@/components/questions/QuestionCard';

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

// Same interface as before
export interface QuestionData {
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

interface QuestionDetailClientProps {
    initialQuestion: QuestionData | null;
    questionId: string;
}

export default function QuestionDetailClient({ initialQuestion, questionId }: QuestionDetailClientProps) {
    const router = useRouter();
    const { user } = useAuth();

    // Initialize with passed props
    const [question, setQuestion] = useState<QuestionData | null>(initialQuestion);
    const [loading, setLoading] = useState(!initialQuestion);
    const [relatedQuestions, setRelatedQuestions] = useState<any[]>([]);

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

    const [loginPrompt, setLoginPrompt] = useState<{
        isOpen: boolean;
        action: 'vote' | 'answer' | 'comment' | 'bookmark' | 'report' | 'ask' | 'general';
    }>({ isOpen: false, action: 'general' });

    const [reportModal, setReportModal] = useState<{
        isOpen: boolean;
        type: 'question' | 'answer';
        id: string;
        title: string;
    }>({ isOpen: false, type: 'question', id: '', title: '' });

    const showLoginPrompt = (action: 'vote' | 'answer' | 'comment' | 'bookmark' | 'report' | 'ask' | 'general') => {
        setLoginPrompt({ isOpen: true, action });
    };

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setAlertModal({ isOpen: true, type, title, message });
    };

    // Helper function to normalize question data
    const normalizeQuestion = (rawQuestion: any): QuestionData => {
        return {
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
    };

    const fetchQuestion = async () => {
        try {
            // Don't set loading true here if we already have data, to avoid flash
            // But if we want to refresh user specific data (votes), we fetch quietly
            const response = await questionAPI.getById(questionId);
            const normalized = normalizeQuestion(response.data.data);
            setQuestion(normalized);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching question:', error);
            setLoading(false);
        }
    };

    const fetchRelatedQuestions = async () => {
        if (!question || !question.tags || question.tags.length === 0) return;

        try {
            // Use the first tag to find related questions
            const firstTag = question.tags[0].slug;
            const response = await questionAPI.getAll({ tag: firstTag, limit: 4 });
            const questionsData = response.data.data?.questions || response.data.questions || [];

            // Filter out current question
            const filtered = questionsData.filter((q: any) => q.id !== question.id).slice(0, 3);
            setRelatedQuestions(filtered);
        } catch (error) {
            console.error('Error fetching related questions:', error);
        }
    };

    useEffect(() => {
        // Always fetch fresh data when user is logged in to get vote status
        // Or if we don't have initial data
        if (!initialQuestion && questionId) {
            fetchQuestion();
        } else if (user && questionId) {
            // User is logged in - always refresh to get user_vote status
            // This ensures vote state persists after page reload
            fetchQuestion();
        }

        // Record view
        const viewedQuestions = JSON.parse(localStorage.getItem('viewedQuestions') || '[]');
        if (!viewedQuestions.includes(questionId)) {
            viewedQuestions.push(questionId);
            localStorage.setItem('viewedQuestions', JSON.stringify(viewedQuestions));
            questionAPI.incrementView(questionId).catch(console.error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionId, user?.id]);

    useEffect(() => {
        if (question) {
            fetchRelatedQuestions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question?.id]);

    const handleVote = async (votableType: string, votableId: string, voteType: string) => {
        if (!user) {
            showLoginPrompt('vote');
            return;
        }

        // Store previous state for rollback on error
        const previousQuestion = question;

        // ✅ OPTIMISTIC UPDATE: Update user_vote status AND count immediately for instant feedback
        setQuestion(prevQuestion => {
            if (!prevQuestion) return null;

            if (votableType === 'question') {
                const currentVote = prevQuestion.user_vote;
                let newUserVote: 'upvote' | 'downvote' | null;
                let countDelta = 0;

                if (currentVote === voteType) {
                    // Clicking same vote type = remove vote
                    newUserVote = null;
                    countDelta = voteType === 'upvote' ? -1 : 0;
                } else if (currentVote === null) {
                    // New vote
                    newUserVote = voteType as 'upvote' | 'downvote';
                    countDelta = voteType === 'upvote' ? 1 : 0;
                } else {
                    // Switching vote type
                    newUserVote = voteType as 'upvote' | 'downvote';
                    countDelta = voteType === 'upvote' ? 2 : -2; // Remove old downvote (-1) + add upvote (+1) = +2
                }

                return {
                    ...prevQuestion,
                    user_vote: newUserVote,
                    upvotes_count: Math.max(0, (prevQuestion.upvotes_count || 0) + countDelta)
                };
            } else {
                // Handle answer votes
                return {
                    ...prevQuestion,
                    answers: prevQuestion.answers.map(answer => {
                        if (answer.id !== votableId) return answer;

                        const currentVote = answer.user_vote;
                        let newUserVote: 'upvote' | 'downvote' | null;
                        let countDelta = 0;

                        if (currentVote === voteType) {
                            newUserVote = null;
                            countDelta = voteType === 'upvote' ? -1 : 0;
                        } else if (currentVote === null) {
                            newUserVote = voteType as 'upvote' | 'downvote';
                            countDelta = voteType === 'upvote' ? 1 : 0;
                        } else {
                            newUserVote = voteType as 'upvote' | 'downvote';
                            countDelta = voteType === 'upvote' ? 2 : -2;
                        }

                        return {
                            ...answer,
                            user_vote: newUserVote,
                            upvotes_count: Math.max(0, (answer.upvotes_count || 0) + countDelta)
                        };
                    })
                };
            }
        });

        // Make API call in background
        try {
            const response = await voteAPI.cast({ votableType, votableId, voteType });
            const voteData = response.data.data;

            // ✅ Update with actual server state (including accurate count)
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
            // ❌ Rollback on error - restore previous state
            setQuestion(previousQuestion);
            showAlert('error', 'Voting Gagal', 'Gagal melakukan voting. Silakan coba lagi.');
        }
    };

    const handleSubmitAnswer = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user) {
            showLoginPrompt('answer');
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
                questionId: questionId,
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
                    await questionAPI.delete(questionId);
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
            showLoginPrompt('bookmark');
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

    const handleShare = async () => {
        if (!question) return;

        const shareUrl = window.location.href;
        const shareData = {
            title: question.title,
            text: `Lihat pertanyaan ini: ${question.title}`,
            url: shareUrl,
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                showAlert('success', 'Berhasil', 'Pertanyaan berhasil dibagikan!');
            } else {
                await navigator.clipboard.writeText(shareUrl);
                showAlert('success', 'Link Disalin', 'Link pertanyaan telah disalin ke clipboard!');
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    showAlert('success', 'Link Disalin', 'Link pertanyaan telah disalin ke clipboard!');
                } catch {
                    showAlert('error', 'Gagal', 'Tidak dapat membagikan pertanyaan');
                }
            }
        }
    };

    const handleReport = (type: 'question' | 'answer', id: string, title: string) => {
        if (!user) {
            showLoginPrompt('report');
            return;
        }
        setReportModal({ isOpen: true, type, id, title });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-200">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
                <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Pertanyaan tidak ditemukan</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 transition-colors duration-200">
            {/* Mobile Header - Sticky */}
            <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:hidden flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="p-1 -ml-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">Pertanyaan</h1>
                </div>
                <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-lg ${question.is_bookmarked ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                    {question.is_bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
            </div>

            {/* Desktop Back Button */}
            <div className="hidden sm:block border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-6 py-3">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Kembali ke Beranda</span>
                    </button>
                </div>
            </div>

            {/* Question Card */}
            <div className="border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-5xl mx-auto">
                    <div className="p-4 sm:p-6">
                        <div className="flex gap-6">
                            {/* Desktop Vote (Left Side) */}
                            <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
                                <VoteSection
                                    voteCount={question.upvotes_count || 0}
                                    userVote={question.user_vote}
                                    onUpvote={() => handleVote('question', question.id, 'upvote')}
                                    onDownvote={() => handleVote('question', question.id, 'downvote')}
                                    disabled={!user}
                                    showLoginHint={!user}
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
                                        <Link href={`/profile/${question.author_username || question.author_id}`} className="flex items-center gap-2 group">
                                            <UserAvatar
                                                src={question.author_avatar}
                                                alt={question.author_name}
                                                size="sm"
                                                fallbackName={question.author_name}
                                            />
                                            <div>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{question.author_name}</span>
                                                    <VerifiedBadge isVerified={question.author_is_verified} size="sm" />
                                                    <ReputationBadgeCompact reputationPoints={question.author_reputation} />
                                                </div>
                                                <span className="text-xs text-slate-500">{formatDate(question.created_at)}</span>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Actions Dropdown or Buttons */}
                                    <div className="flex items-center gap-2">
                                        {user && user.id !== question.author_id && (
                                            <button
                                                onClick={() => handleReport('question', question.id, question.title)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Laporkan"
                                            >
                                                <Flag className="w-4 h-4" />
                                            </button>
                                        )}
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
                                        onUpvote={() => handleVote('question', question.id, 'upvote')}
                                        onDownvote={() => handleVote('question', question.id, 'downvote')}
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
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Bagikan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answers Section */}
                <div className="border-t-4 border-slate-200 bg-slate-50">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                        <h2 className="text-lg font-bold text-slate-900">
                            {question.answers_count} Jawaban
                        </h2>
                    </div>
                </div>

                <div>
                    {question.answers?.map((answer) => (
                        <div
                            key={answer.id}
                            className={`border-b border-slate-200 ${answer.is_accepted ? 'bg-emerald-50/20' : 'bg-white'}`}
                        >
                            <div className="max-w-5xl mx-auto p-4 sm:p-6">
                                <div className="flex gap-6">
                                    {/* Desktop Vote (Left Side) */}
                                    <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
                                        <VoteSection
                                            voteCount={answer.upvotes_count || 0}
                                            userVote={answer.user_vote}
                                            onUpvote={() => handleVote('answer', answer.id, 'upvote')}
                                            onDownvote={() => handleVote('answer', answer.id, 'downvote')}
                                            disabled={!user}
                                            showLoginHint={!user}
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
                                                <Link href={`/profile/${answer.author_username || answer.author_id}`} className="flex items-center gap-2 group">
                                                    <UserAvatar
                                                        src={answer.author_avatar}
                                                        alt={answer.author_name}
                                                        size="xs"
                                                        fallbackName={answer.author_name}
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{answer.author_name}</span>
                                                            <VerifiedBadge isVerified={answer.author_is_verified} size="sm" />
                                                            <ReputationBadgeCompact reputationPoints={answer.author_reputation} />
                                                        </div>
                                                        <span className="text-xs text-slate-500">{formatDate(answer.created_at)}</span>
                                                    </div>
                                                </Link>
                                            </div>

                                            {/* Answer Actions */}
                                            <div className="flex items-center gap-2">
                                                {user && user.id !== answer.author_id && (
                                                    <button
                                                        onClick={() => handleReport('answer', answer.id, answer.content.substring(0, 50))}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Laporkan"
                                                    >
                                                        <Flag className="w-4 h-4" />
                                                    </button>
                                                )}
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
                                                onUpvote={() => handleVote('answer', answer.id, 'upvote')}
                                                onDownvote={() => handleVote('answer', answer.id, 'downvote')}
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
                        </div>
                    ))}
                </div>

                {/* Answer Input */}
                <div className="border-t border-slate-200 bg-white">
                    <div className="max-w-5xl mx-auto p-4 sm:p-6">
                        <h3 className="text-base font-bold text-slate-900 mb-4">
                            Tulis Jawaban Anda
                        </h3>

                        {user ? (
                            <form onSubmit={handleSubmitAnswer}>
                                <MentionInput
                                    value={answerContent}
                                    onChange={setAnswerContent}
                                    onSubmit={handleSubmitAnswer}
                                    placeholder="Bagikan pengetahuan Anda... Ketik @ untuk mention user"
                                    className="min-h-[150px] text-[15px]"
                                    disabled={submitting}
                                />
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submitting || !answerContent.trim()}
                                        className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                    >
                                        {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                                <div className="w-14 h-14 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Punya jawaban?</h4>
                                <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto">
                                    Bergabunglah dengan komunitas kami untuk berbagi pengetahuan dan membantu sesama pelaku bisnis.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        Masuk untuk Menjawab
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors border border-slate-200"
                                    >
                                        Buat Akun Baru
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Questions Section (New) */}
                {relatedQuestions.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50 py-8">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Pertanyaan Terkait</h3>
                            <div className="space-y-4">
                                {relatedQuestions.map((related) => (
                                    <QuestionCard key={related.id} question={related} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <AlertModal
                    isOpen={alertModal.isOpen}
                    onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                    type={alertModal.type}
                    title={alertModal.title}
                    message={alertModal.message}
                />

                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    type={confirmModal.type}
                />

                <LoginPromptModal
                    isOpen={loginPrompt.isOpen}
                    onClose={() => setLoginPrompt({ ...loginPrompt, isOpen: false })}
                    action={loginPrompt.action}
                />

                {/* Report Modal */}
                <ReportModal
                    isOpen={reportModal.isOpen}
                    onClose={() => setReportModal({ ...reportModal, isOpen: false })}
                    reportType={reportModal.type}
                    reportId={reportModal.id}
                    reportTitle={reportModal.title}
                />
            </div>
        </div>
    );
}
