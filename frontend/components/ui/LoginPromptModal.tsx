'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';

interface LoginPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    action?: 'vote' | 'answer' | 'comment' | 'bookmark' | 'report' | 'ask' | 'general';
}

const actionConfig: Record<string, { title: string; description: string }> = {
    vote: {
        title: 'Login untuk Vote',
        description: 'Masuk ke akun Anda untuk memberikan vote pada pertanyaan atau jawaban ini.',
    },
    answer: {
        title: 'Login untuk Menjawab',
        description: 'Masuk ke akun Anda untuk berbagi pengetahuan dan menjawab pertanyaan ini.',
    },
    comment: {
        title: 'Login untuk Berkomentar',
        description: 'Masuk ke akun Anda untuk menambahkan komentar pada diskusi ini.',
    },
    bookmark: {
        title: 'Login untuk Menyimpan',
        description: 'Masuk ke akun Anda untuk menyimpan pertanyaan ini agar mudah ditemukan nanti.',
    },
    report: {
        title: 'Login untuk Melaporkan',
        description: 'Masuk ke akun Anda untuk melaporkan konten yang melanggar aturan.',
    },
    ask: {
        title: 'Login untuk Bertanya',
        description: 'Masuk ke akun Anda untuk mengajukan pertanyaan kepada komunitas.',
    },
    general: {
        title: 'Login Diperlukan',
        description: 'Silakan masuk ke akun Anda untuk melakukan aksi ini.',
    },
};

export default function LoginPromptModal({ isOpen, onClose, action = 'general' }: LoginPromptModalProps) {
    const config = actionConfig[action] || actionConfig.general;
    const pathname = usePathname();
    const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname || '/')}`;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden z-10">
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                            {config.title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                            aria-label="Tutup"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {config.description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/register"
                            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-center text-sm"
                        >
                            Buat Akun Baru
                        </Link>
                        <Link
                            href={loginHref}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-center text-sm shadow-sm"
                        >
                            Masuk Sekarang
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Bergabung dengan ribuan pelaku UMKM Indonesia!
                    </p>
                </div>
            </div>
        </div>
    );
}
