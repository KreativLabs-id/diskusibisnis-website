'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Eye,
    Edit,
    Trash,
    CheckCircle,
    Bookmark,
    BookmarkCheck,
    Flag,
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
import { getProfileHref } from '@/lib/profile';

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

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value || 0);
};

const toSafeNumber = (value: unknown) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
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
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const handleBack = () => {
        const fromParam = searchParams.get('from');
        if (fromParam && fromParam.startsWith('/')) {
            router.push(fromParam);
            return;
        }

        if (typeof window !== 'undefined') {
            const fallbackListRoute = sessionStorage.getItem('list_scroll_restore_target');
            if (fallbackListRoute && fallbackListRoute.startsWith('/')) {
                router.push(fallbackListRoute);
                return;
            }
        }

        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
            return;
        }
        router.push('/');
    };

    // Initialize with passed props
    const [question, setQuestion] = useState<QuestionData | null>(initialQuestion);
    const [loading, setLoading] = useState(!initialQuestion);
    const [relatedQuestions, setRelatedQuestions] = useState<any[]>([]);

    const [answerContent, setAnswerContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
    const [editAnswerContent, setEditAnswerContent] = useState('');
    const [showQuickReply, setShowQuickReply] = useState(false);
    const answerComposerRef = useRef<HTMLDivElement | null>(null);

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

        // Record view — capped at 100 entries to prevent localStorage overflow
        try {
            const viewedQuestions: string[] = JSON.parse(localStorage.getItem('viewedQuestions') || '[]');
            if (!viewedQuestions.includes(questionId)) {
                const updated = [...viewedQuestions, questionId].slice(-100); // max 100
                localStorage.setItem('viewedQuestions', JSON.stringify(updated));
                questionAPI.incrementView(questionId).catch(console.error);
            }
        } catch {
            // localStorage might be full or unavailable, ignore silently
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionId, user?.id]);

    useEffect(() => {
        if (question) {
            fetchRelatedQuestions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question?.id]);

    useEffect(() => {
        const handleScroll = () => {
            if (!answerComposerRef.current) return;
            const rect = answerComposerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const isComposerVisible = rect.top < viewportHeight - 120 && rect.bottom > 120;
            setShowQuickReply(!isComposerVisible);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [question?.id]);

    const scrollToAnswerComposer = () => {
        if (!answerComposerRef.current) return;
        answerComposerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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
                const currentVote = prevQuestion.user_vote ?? null;
                const newUserVote = currentVote === voteType ? null : (voteType as 'upvote' | 'downvote');
                const currentUpvotes = toSafeNumber(prevQuestion.upvotes_count);
                let countDelta = 0;

                // UI menampilkan upvotes_count saja, jadi delta harus berbasis upvote-only.
                if (currentVote === 'upvote' && newUserVote !== 'upvote') countDelta = -1;
                if (currentVote !== 'upvote' && newUserVote === 'upvote') countDelta = 1;

                return {
                    ...prevQuestion,
                    user_vote: newUserVote,
                    upvotes_count: Math.max(0, currentUpvotes + countDelta)
                };
            } else {
                // Handle answer votes
                return {
                    ...prevQuestion,
                    answers: prevQuestion.answers.map(answer => {
                        if (answer.id !== votableId) return answer;

                        const currentVote = answer.user_vote ?? null;
                        const newUserVote = currentVote === voteType ? null : (voteType as 'upvote' | 'downvote');
                        const currentUpvotes = toSafeNumber(answer.upvotes_count);
                        let countDelta = 0;

                        if (currentVote === 'upvote' && newUserVote !== 'upvote') countDelta = -1;
                        if (currentVote !== 'upvote' && newUserVote === 'upvote') countDelta = 1;

                        return {
                            ...answer,
                            user_vote: newUserVote,
                            upvotes_count: Math.max(0, currentUpvotes + countDelta)
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
                        user_vote: (voteData?.userVote ?? voteData?.user_vote ?? prevQuestion.user_vote ?? null) as 'upvote' | 'downvote' | null,
                        upvotes_count: Math.max(0, toSafeNumber(voteData?.upvotes_count ?? voteData?.upvotesCount ?? prevQuestion.upvotes_count)),
                        downvotes_count: Math.max(0, toSafeNumber(voteData?.downvotes_count ?? voteData?.downvotesCount ?? prevQuestion.downvotes_count))
                    };
                } else {
                    return {
                        ...prevQuestion,
                        answers: prevQuestion.answers.map(answer =>
                            answer.id === votableId
                                ? {
                                    ...answer,
                                    user_vote: (voteData?.userVote ?? voteData?.user_vote ?? answer.user_vote ?? null) as 'upvote' | 'downvote' | null,
                                    upvotes_count: Math.max(0, toSafeNumber(voteData?.upvotes_count ?? voteData?.upvotesCount ?? answer.upvotes_count)),
                                    downvotes_count: Math.max(0, toSafeNumber(voteData?.downvotes_count ?? voteData?.downvotesCount ?? answer.downvotes_count))
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
                        onClick={handleBack}
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
                        onClick={handleBack}
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
            <div className="hidden sm:block border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Kembali</span>
                    </button>
                </div>
            </div>

            {/* Question Wrapper */}
            <div className="bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                    <div className="flex gap-4 sm:gap-6 border-b border-gray-200 dark:border-slate-800 pb-8">
                        {/* Desktop Vote (Left Side) */}
                        <div className="hidden sm:flex flex-col items-center gap-2 shrink-0 w-12 pt-1 opacity-90">
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
                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                                    : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                                title={question.is_bookmarked ? 'Hapus dari tersimpan' : 'Simpan pertanyaan'}
                            >
                                {question.is_bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Header (Title, Meta) */}
                            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 leading-tight sm:leading-snug mb-4">
                                {question.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[13px] text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-800 pb-5 mb-6">
                                <span className="flex gap-1.5">Ditanya <span className="text-gray-900 dark:text-gray-200 font-medium">{formatDate(question.created_at)}</span></span>
                                
                                <span className="flex gap-1.5 items-center">
                                    <Eye className="w-3.5 h-3.5" />
                                    Dilihat <span className="text-gray-900 dark:text-gray-200 font-medium">{formatNumber(question.views_count)} kali</span>
                                </span>

                                {/* Actions Dropdown or Buttons */}
                                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                                    {user && user.id !== question.author_id && (
                                        <button
                                            onClick={() => handleReport('question', question.id, question.title)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                                            title="Laporkan"
                                        >
                                            <Flag className="w-4 h-4" />
                                        </button>
                                    )}
                                    {user?.id === question.author_id && (
                                        <>
                                            <button
                                                onClick={() => router.push(`/questions/${question.id}/edit`)}
                                                className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={handleDeleteQuestion}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-slate dark:prose-invert max-w-none mb-8 text-[15px] sm:text-[16px] leading-relaxed text-gray-800 dark:text-gray-300">
                                <RichTextParser content={question.content} />
                            </div>

                            {question.images && question.images.length > 0 && (
                                <div className="mb-8">
                                    <ImageGallery images={question.images} />
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-8">
                                {question.tags?.map((tag) => (
                                    <Link
                                            key={tag.id}
                                            href={`/tags/${tag.slug}`}
                                            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-[12px] font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {tag.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Desktop Stats & Author Card */}
                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 pb-2">
                                <div className="grid gap-4 sm:grid-cols-[1fr_240px] sm:items-start">
                                    <div className="hidden sm:flex items-center gap-6 text-[13px] text-gray-500 font-medium">
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                                        >
                                            Share
                                        </button>
                                        {user?.id === question.author_id && <button
                                            onClick={() => router.push(`/questions/${question.id}/edit`)}
                                            className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                                        >
                                            Edit
                                        </button>}
                                    </div>
                                    
                                    {/* Author Box StackOverflow style */}
                                    <div className="bg-white dark:bg-slate-900 rounded-xl px-4 py-3 w-full sm:w-[240px] mt-2 sm:mt-0 sm:justify-self-end border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">
                                            Ditanya {formatDate(question.created_at)}
                                        </div>
                                        <Link href={getProfileHref({ username: question.author_username, author_name: question.author_name })} className="flex items-center gap-2 group">
                                            <UserAvatar
                                                src={question.author_avatar}
                                                alt={question.author_name}
                                                size="sm"
                                                fallbackName={question.author_name}
                                                className="w-8 h-8 rounded"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-slate-700 dark:text-slate-200 text-[13px] group-hover:text-slate-900 dark:group-hover:text-white truncate">{question.author_name}</span>
                                                    {question.author_is_verified && <VerifiedBadge isVerified={true} size="sm" />}
                                                </div>
                                                <div className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {formatNumber(question.author_reputation)}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                                {/* Mobile Vote & Share */}
                                <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100 dark:border-gray-800 sm:hidden">
                                    <VoteSection
                                        voteCount={question.upvotes_count || 0}
                                        userVote={question.user_vote}
                                        onUpvote={() => handleVote('question', question.id, 'upvote')}
                                        onDownvote={() => handleVote('question', question.id, 'downvote')}
                                        disabled={!user}
                                        orientation="horizontal"
                                        size="small"
                                    />
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 text-[13px] text-gray-500 font-medium hover:text-emerald-600 transition-colors"
                                    >
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answers Section */}
                <div className="bg-white dark:bg-slate-900">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-2">
                        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                        {(question.answers?.length ?? question.answers_count)} Jawaban
                        </h2>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900">
                    {question.answers?.map((answer) => (
                        <div
                            key={answer.id}
                            className={`${answer.is_accepted ? 'bg-slate-50/70 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-900'}`}
                        >
                            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
                                <div className="rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 sm:px-5 py-5 sm:py-6 shadow-sm">
                                <div className="flex gap-4 sm:gap-6">
                                    {/* Desktop Vote (Left Side) */}
                                    <div className="hidden sm:flex flex-col items-center gap-2 shrink-0 pt-1 w-12">
                                        <VoteSection
                                            voteCount={answer.upvotes_count || 0}
                                            userVote={answer.user_vote}
                                            onUpvote={() => handleVote('answer', answer.id, 'upvote')}
                                            onDownvote={() => handleVote('answer', answer.id, 'downvote')}
                                            disabled={!user}
                                            showLoginHint={!user}
                                            orientation="vertical"
                                            size="medium"
                                        />
                                        {answer.is_accepted && (
                                            <div className="mt-4 text-emerald-500" title="Jawaban Terbaik">
                                                <CheckCircle className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Answer Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Link href={getProfileHref({ username: answer.author_username, author_name: answer.author_name })} className="flex items-center gap-2 group">
                                                    <UserAvatar
                                                        src={answer.author_avatar}
                                                        alt={answer.author_name}
                                                        size="xs"
                                                        fallbackName={answer.author_name}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-slate-700 dark:group-hover:text-white transition-colors">{answer.author_name}</span>
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
                                            <div className="mb-6">
                                                <MentionInput
                                                    value={editAnswerContent}
                                                    onChange={setEditAnswerContent}
                                                    placeholder="Edit jawaban Anda..."
                                                    className="text-[14px] min-h-[150px]"
                                                />
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleSaveEditAnswer(answer.id)}
                                                        className="px-4 py-1.5 bg-emerald-600 text-white rounded text-[13px] font-medium hover:bg-emerald-700 transition-colors"
                                                    >
                                                        Simpan
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingAnswerId(null);
                                                            setEditAnswerContent('');
                                                        }}
                                                        className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded text-[13px] font-medium hover:bg-gray-200 transition-colors"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="prose prose-slate dark:prose-invert max-w-none text-[15px] sm:text-[16px] leading-relaxed text-gray-800 dark:text-gray-300 mb-6 mt-2">
                                                <RichTextParser content={answer.content} />
                                            </div>
                                        )}

                                        {/* Answer Footer Row */}
                                        <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="hidden sm:flex items-center gap-3">
                                                <button className="text-[13px] text-gray-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors">
                                                    Share
                                                </button>
                                                {user?.id === question.author_id && (
                                                    <>
                                                        <span className="text-gray-300">&bull;</span>
                                                        <button
                                                            onClick={() => handleAcceptAnswer(answer.id, answer.is_accepted)}
                                                            className={`text-[13px] font-medium transition-colors ${answer.is_accepted ? 'text-emerald-600 hover:text-emerald-700' : 'text-gray-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                                        >
                                                            {answer.is_accepted ? 'Batalkan Jawaban Terbaik' : 'Tandai Jawaban Terbaik'}
                                                        </button>
                                                    </>
                                                )}
                                                {user?.id === answer.author_id && !editingAnswerId && (
                                                    <>
                                                        <span className="text-gray-300">&bull;</span>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => handleEditAnswer(answer.id, answer.content)} className="text-[13px] text-gray-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors">Edit</button>
                                                            <button onClick={() => handleDeleteAnswer(answer.id)} className="text-[13px] text-gray-500 hover:text-red-500 font-medium transition-colors">Hapus</button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mobile Vote */}
                                        <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100 dark:border-gray-800 sm:hidden">
                                            <VoteSection
                                                voteCount={answer.upvotes_count || 0}
                                                userVote={answer.user_vote}
                                                onUpvote={() => handleVote('answer', answer.id, 'upvote')}
                                                onDownvote={() => handleVote('answer', answer.id, 'downvote')}
                                                disabled={!user}
                                                orientation="horizontal"
                                                size="small"
                                            />
                                            {answer.is_accepted ? (
                                                <span className="flex items-center gap-1 text-[12px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Jawaban Terbaik
                                                </span>
                                            ) : user?.id === question.author_id ? (
                                                <button
                                                    onClick={() => handleAcceptAnswer(answer.id, false)}
                                                    className="text-[12px] text-gray-500 hover:text-emerald-600 font-medium"
                                                >
                                                    Terima Jawaban
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Answer Input */}
                <div className="bg-white dark:bg-slate-900 pt-4 pb-12">
                    <div ref={answerComposerRef} className="max-w-5xl mx-auto px-4 sm:px-6">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-6 pt-4">
                            Jawaban Anda
                        </h3>

                        {user ? (
                            <form onSubmit={handleSubmitAnswer} className="mt-4 max-w-5xl">
                                <div className="border border-gray-300 dark:border-gray-700 rounded bg-white overflow-visible transition-shadow">
                                    <MentionInput
                                        value={answerContent}
                                        onChange={setAnswerContent}
                                        onSubmit={handleSubmitAnswer}
                                        placeholder="Tulis jawaban berbobot minimal 20 karakter..."
                                        className="text-[15px] min-h-[200px]"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="mt-4 flex justify-between items-center bg-gray-50 dark:bg-slate-800/40 p-4 rounded border border-gray-200 dark:border-gray-700">
                                    <p className="text-[13px] text-gray-600 max-w-sm hidden sm:block">
                                        Pastikan jawaban Anda terstruktur, jelas, dan memberikan solusi yang efektif. Gunakan pemformatan bila diperlukan.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={submitting || !answerContent.trim()}
                                        className="px-6 py-2.5 bg-[#2F855A] text-white rounded font-medium text-[14px] hover:bg-[#276F4B] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                                    >
                                        {submitting ? 'Memposting...' : 'Posting Jawaban'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50 rounded p-8 flex flex-col items-center justify-center text-center mt-4">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Ingin menjawab pertanyaan ini?</h4>
                                <p className="text-[14px] text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                                    Silakan login untuk bergabung dalam diskusi, memberikan jawaban, dan mendapatkan poin reputasi.
                                </p>
                                <div className="flex gap-4">
                                    <Link
                                        href="/login"
                                        className="px-6 py-2.5 bg-[#2F855A] text-white rounded font-medium hover:bg-[#276F4B] transition-colors shadow-sm"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {user && showQuickReply && (
                    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl">
                        <button
                            onClick={scrollToAnswerComposer}
                            className="w-full rounded-full border border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3 text-left shadow-md hover:shadow-lg transition-all flex items-center justify-between gap-3"
                        >
                            <span className="text-sm text-gray-500 dark:text-gray-300 truncate">Tulis jawaban Anda...</span>
                            <span className="shrink-0 px-4 py-1.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium">Jawab</span>
                        </button>
                    </div>
                )}

                {/* Related Questions Section (New) */}
                {relatedQuestions.length > 0 && (
                    <div className="py-8 bg-white dark:bg-slate-900">
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
    );
}
