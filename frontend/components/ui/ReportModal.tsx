'use client';

import { useState } from 'react';
import Modal from './Modal';
import { supportAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Flag, Loader2 } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: 'question' | 'answer';
    reportId: string;
    reportTitle?: string; // Content preview
}

export default function ReportModal({ isOpen, onClose, reportType, reportId, reportTitle }: ReportModalProps) {
    const { user } = useAuth();
    const [reason, setReason] = useState('spam');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (!user) {
                throw new Error('Anda harus login untuk melaporkan konten.');
            }

            const subject = `Laporan ${reportType === 'question' ? 'Pertanyaan' : 'Jawaban'} #${reportId}`;
            const message = `
Tipe Laporan: ${reason}
ID Konten: ${reportId}
Tipe Konten: ${reportType}
URL: ${window.location.href}

Detail Tambahan:
${description}

Konten Preview:
${reportTitle || '-'}
      `.trim();

            await supportAPI.createTicket({
                name: user.displayName || user.username || 'User',
                email: user.email,
                subject: subject,
                message: message,
                category: 'report'
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setDescription('');
                setReason('spam');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Gagal mengirim laporan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Laporan Terkirim">
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flag className="w-8 h-8" />
                    </div>
                    <p className="text-slate-600">Terima kasih atas laporan Anda. Kami akan segera meninjau konten tersebut.</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Laporkan ${reportType === 'question' ? 'Pertanyaan' : 'Jawaban'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Mengapa Anda melaporkan konten ini?
                    </label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full rounded-lg border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    >
                        <option value="spam">Spam atau Iklan</option>
                        <option value="inappropriate">Konten Tidak Pantas / Kasar</option>
                        <option value="irrelevant">Tidak Relevan / Topik Salah</option>
                        <option value="plagiarism">Plagiarisme / Hak Cipta</option>
                        <option value="other">Lainnya</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Detail Tambahan (Opsional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Jelaskan masalahnya lebih detail..."
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        disabled={isSubmitting}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            'Kirim Laporan'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
