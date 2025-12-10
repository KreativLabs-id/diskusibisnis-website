'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, LogIn, UserPlus, MessageCircle, ThumbsUp, Bookmark, Flag } from 'lucide-react';

interface LoginPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    action?: 'vote' | 'answer' | 'comment' | 'bookmark' | 'report' | 'ask' | 'general';
}

const actionConfig = {
    vote: {
        icon: ThumbsUp,
        title: 'Login untuk Vote',
        description: 'Masuk ke akun Anda untuk memberikan vote pada pertanyaan atau jawaban ini.',
    },
    answer: {
        icon: MessageCircle,
        title: 'Login untuk Menjawab',
        description: 'Masuk ke akun Anda untuk berbagi pengetahuan dan menjawab pertanyaan ini.',
    },
    comment: {
        icon: MessageCircle,
        title: 'Login untuk Berkomentar',
        description: 'Masuk ke akun Anda untuk menambahkan komentar pada diskusi ini.',
    },
    bookmark: {
        icon: Bookmark,
        title: 'Login untuk Menyimpan',
        description: 'Masuk ke akun Anda untuk menyimpan pertanyaan ini agar mudah ditemukan nanti.',
    },
    report: {
        icon: Flag,
        title: 'Login untuk Melaporkan',
        description: 'Masuk ke akun Anda untuk melaporkan konten yang melanggar aturan.',
    },
    ask: {
        icon: MessageCircle,
        title: 'Login untuk Bertanya',
        description: 'Masuk ke akun Anda untuk mengajukan pertanyaan kepada komunitas.',
    },
    general: {
        icon: LogIn,
        title: 'Login Diperlukan',
        description: 'Silakan masuk ke akun Anda untuk melakukan aksi ini.',
    },
};

export default function LoginPromptModal({ isOpen, onClose, action = 'general' }: LoginPromptModalProps) {
    const config = actionConfig[action];
    const Icon = config.icon;

    // Lock scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6 pt-8 text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-emerald-600" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {config.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                        {config.description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
                        >
                            <LogIn className="w-5 h-5" />
                            Masuk Sekarang
                        </Link>
                        <Link
                            href="/register"
                            className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            Buat Akun Baru
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500 text-center">
                        Bergabung dengan ribuan pelaku UMKM Indonesia!
                    </p>
                </div>
            </div>
        </div>
    );
}
