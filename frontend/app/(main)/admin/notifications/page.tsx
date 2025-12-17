'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { Bell, ArrowLeft, Send, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import AlertModal from '@/components/ui/AlertModal';

export default function AdminNotifications() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'system',
        link: '/'
    });

    const [isSending, setIsSending] = useState(false);
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'info', title: '', message: '' });

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/');
        }
    }, [user, loading, router]);

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setAlertModal({ isOpen: true, type, title, message });
    };

    const templates = [
        {
            id: 1,
            title: 'Pemeliharaan Sistem',
            message: 'Kami akan melakukan pemeliharaan server pada [Waktu]. Aplikasi mungkin tidak dapat diakses sementara. Mohon maaf atas ketidaknyamanannya.',
            type: 'warning',
            link: '/'
        },
        {
            id: 2,
            title: 'Update Aplikasi Tersedia 🚀',
            message: 'Versi baru DiskusiBisnis telah tersedia! Perbarui aplikasi Anda sekarang untuk menikmati fitur baru dan performa yang lebih cepat.',
            type: 'update',
            link: 'https://play.google.com/store/apps/details?id=com.diskusibisnis.app'
        },
        {
            id: 3,
            title: 'Highlight Diskusi Minggu Ini 💡',
            message: 'Ingin bisnis makin berkembang? Cek diskusi terpopuler minggu ini dan temukan insight berharga dari sesama pebisnis!',
            type: 'promo',
            link: '/questions'
        },
        {
            id: 4,
            title: 'Fitur Baru Telah Hadir! ✨',
            message: 'Halo! Kami baru saja merilis fitur baru yang akan membantu Anda berdiskusi lebih asik. Coba sekarang!',
            type: 'system',
            link: '/'
        },
        {
            id: 5,
            title: 'Ayo Tingkatkan Reputasi! 🏆',
            message: 'Jadilah member yang bermanfaat! Bantu jawab pertanyaan teman-teman komunitas dan dapatkan poin reputasi.',
            type: 'system',
            link: '/leaderboard'
        }
    ];

    const applyTemplate = (template: any) => {
        setFormData({
            title: template.title,
            message: template.message,
            type: template.type,
            link: template.link
        });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.message) return;

        setIsSending(true);
        try {
            await adminAPI.broadcastNotification(formData);
            showAlert('success', 'Berhasil', 'Notifikasi berhasil dikirim ke semua pengguna');
            setFormData({
                title: '',
                message: '',
                type: 'system',
                link: '/'
            });
        } catch (error) {
            console.error('Error sending broadcast:', error);
            showAlert('error', 'Gagal', 'Gagal mengirim notifikasi');
        } finally {
            setIsSending(false);
        }
    };

    if (loading || !user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        href="/admin"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Bell className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Broadcast Notifications</h1>
                    </div>
                </div>
                <p className="text-slate-600">Kirim notifikasi sistem ke seluruh pengguna aplikasi</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Buat Notifikasi Baru</h2>
                        <form onSubmit={handleSend} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Judul Notifikasi
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Contoh: Pemeliharaan Sistem"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Pesan
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={4}
                                    placeholder="Tulis pesan lengkap di sini..."
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Tipe Notifikasi
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="system">System Info (Default)</option>
                                        <option value="update">App Update</option>
                                        <option value="warning">Warning / Alert</option>
                                        <option value="promo">Promo / Event</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Target Link (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="/ atau https://..."
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSending || !formData.title || !formData.message}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSending ? (
                                        'Mengirim...'
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Kirim Broadcast
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Templates Section */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Template Cepat</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => applyTemplate(template)}
                                    className="text-left p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                >
                                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 mb-1">
                                        {template.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {template.message}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview & Info */}
                <div className="space-y-6">
                    {/* Card Preview */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                            Preview Tampilan
                        </h3>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="flex gap-3">
                                <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${formData.type === 'warning' ? 'bg-red-100 text-red-600' :
                                    formData.type === 'update' ? 'bg-green-100 text-green-600' :
                                        formData.type === 'promo' ? 'bg-purple-100 text-purple-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    {formData.type === 'warning' ? <AlertTriangle size={20} /> :
                                        formData.type === 'update' ? <CheckCircle size={20} /> :
                                            formData.type === 'promo' ? <Bell size={20} /> :
                                                <Info size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">
                                        {formData.title || 'Judul Notifikasi'}
                                    </h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {formData.message || 'Isi pesan notifikasi akan muncul di sini...'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">Baru saja</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-4 italic">
                            *Tampilan di HP pengguna mungkin sedikit berbeda tergantung OS dan pengaturan perangkat.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                        <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                            <Info className="w-5 h-5" />
                            Info Broadcast
                        </h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Fitur ini akan mengirimkan notifikasi ke <strong>SEMUA</strong> pengguna yang terdaftar.
                            <br /><br />
                            Harap gunakan dengan bijak. Notifikasi yang terlalu sering dapat mengganggu pengguna.
                            <br /><br />
                            Notifikasi juga akan tersimpan di riwayat notifikasi (in-app) setiap pengguna.
                        </p>
                    </div>
                </div>
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
