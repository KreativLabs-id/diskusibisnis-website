'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { bookmarkAPI } from '@/lib/api';
import {
    Bookmark,
    MessageCircle,
    ThumbsUp,
    Eye,
    Clock,
    Trash2,
    LogIn,
    Loader2,
    BookmarkX
} from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import AlertModal from '@/components/ui/AlertModal';

interface BookmarkedQuestion {
    id: string;
    title: string;
    content: string;
    author_id: string;
    author_name: string;
    author_username?: string;
    author_avatar: string;
    author_is_verified: boolean;
    upvotes_count: number;
    views_count: number;
    answers_count: number;
    has_accepted_answer: boolean;
    tags: Array<{ id: string; name: string; slug: string }>;
    created_at: string;
    bookmarked_at: string;
}

export default function SavedPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'info', title: '', message: '' });

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setAlertModal({ isOpen: true, type, title, message });
    };

    useEffect(() => {
        if (!authLoading && !user) {
            // Don't redirect, show login prompt
            setLoading(false);
        } else if (user) {
            fetchBookmarks();
        }
    }, [user, authLoading]);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const response = await bookmarkAPI.getAll();
            console.log('Bookmarks API response:', response.data);

            // Backend returns: { success: true, data: { bookmarks: [...], pagination: {...} } }
            // Handle different response structures
            let bookmarksData = [];
            if (response.data?.data?.bookmarks) {
                bookmarksData = response.data.data.bookmarks;
            } else if (response.data?.bookmarks) {
                bookmarksData = response.data.bookmarks;
            } else if (Array.isArray(response.data?.data)) {
                bookmarksData = response.data.data;
            } else if (Array.isArray(response.data)) {
                bookmarksData = response.data;
            }

            setBookmarks(Array.isArray(bookmarksData) ? bookmarksData : []);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
            setBookmarks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (questionId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setRemoving(questionId);
            await bookmarkAPI.remove(questionId);
            setBookmarks(prev => prev.filter(b => b.id !== questionId));
            showAlert('success', 'Berhasil', 'Bookmark dihapus');
        } catch (error) {
            console.error('Error removing bookmark:', error);
            showAlert('error', 'Gagal', 'Gagal menghapus bookmark');
        } finally {
            setRemoving(null);
        }
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Memuat...</p>
                </div>
            </div>
        );
    }

    // Show login prompt for guests
    if (!user) {
        return (
            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                <div className="max-w-md mx-auto text-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bookmark className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">Tersimpan</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Silakan login untuk melihat pertanyaan yang Anda simpan.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
                    >
                        <LogIn className="w-5 h-5" />
                        Masuk Sekarang
                    </Link>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm transition-colors"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-200">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <Bookmark className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tersimpan</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pertanyaan yang Anda bookmark</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-4" />
                                <div className="flex gap-3">
                                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookmarkX className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                            Belum Ada Bookmark
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                            Anda belum menyimpan pertanyaan apapun. Tekan ikon bookmark pada pertanyaan untuk menyimpannya.
                        </p>
                        <Link
                            href="/questions"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Jelajahi Pertanyaan
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {bookmarks.length} pertanyaan tersimpan
                            </p>
                        </div>

                        {bookmarks.map((question) => (
                            <Link
                                key={question.id}
                                href={`/questions/${question.id}`}
                                className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-emerald-500/50 hover:shadow-md dark:hover:shadow-emerald-900/10 transition-all group"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
                                            {question.title}
                                        </h3>

                                        {/* Preview */}
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                                            {question.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                        </p>

                                        {/* Tags */}
                                        {question.tags && question.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {question.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {question.tags.length > 3 && (
                                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                                        +{question.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{question.upvotes_count || 0}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MessageCircle className={`w-3.5 h-3.5 ${question.has_accepted_answer ? 'text-green-600' : 'text-slate-400'}`} />
                                                <span className={`font-semibold ${question.has_accepted_answer ? 'text-green-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {question.answers_count || 0}
                                                </span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>{formatNumber(question.views_count || 0)}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{formatDate(question.created_at)}</span>
                                            </span>
                                        </div>

                                        {/* Author */}
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                            <UserAvatar
                                                src={question.author_avatar}
                                                alt={question.author_name}
                                                size="xs"
                                                fallbackName={question.author_name}
                                            />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {question.author_name}
                                            </span>
                                            <VerifiedBadge isVerified={question.author_is_verified} size="sm" />
                                        </div>
                                    </div>

                                    {/* Remove Bookmark Button */}
                                    <button
                                        onClick={(e) => handleRemoveBookmark(question.id, e)}
                                        disabled={removing === question.id}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                                        title="Hapus dari bookmark"
                                    >
                                        {removing === question.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
            />
        </div>
    );
}
