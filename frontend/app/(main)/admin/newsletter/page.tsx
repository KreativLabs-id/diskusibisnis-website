'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import {
    Mail,
    ArrowLeft,
    Send,
    Users,
    History,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Loader2,
    Sparkles,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SimpleRichEditor from '@/components/ui/SimpleRichEditor';

interface NewsletterStats {
    totalSubscribers: number;
    totalNewslettersSent: number;
    totalRecipients: number;
    totalSuccessful: number;
    totalFailed: number;
}

interface NewsletterHistoryItem {
    id: string;
    subject: string;
    content: string;
    recipients_count: number;
    success_count: number;
    failed_count: number;
    created_at: string;
    sent_by_name: string;
}

export default function AdminNewsletter() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<NewsletterStats | null>(null);
    const [history, setHistory] = useState<NewsletterHistoryItem[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);

    // Form state
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [testEmail, setTestEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

    // Modal state
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
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Preview modal
    const [showPreview, setShowPreview] = useState(false);

    // Send results modal
    const [sendResults, setSendResults] = useState<{
        isOpen: boolean;
        totalRecipients: number;
        successCount: number;
        failedCount: number;
        successEmails: { email: string; name: string }[];
        failedEmails: { email: string; name: string; reason: string }[];
    } | null>(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/');
            return;
        }

        if (user && user.role === 'admin') {
            fetchStats();
            fetchHistory();
        }
    }, [user, loading, router]);

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const response = await adminAPI.getNewsletterStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching newsletter stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            const response = await adminAPI.getNewsletterHistory();
            setHistory(response.data.data.history);
        } catch (error) {
            console.error('Error fetching newsletter history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSendTest = async () => {
        if (!testEmail || !subject || !content) {
            setAlertModal({
                isOpen: true,
                type: 'warning',
                title: 'Form Tidak Lengkap',
                message: 'Harap isi email test, subject, dan konten newsletter.'
            });
            return;
        }

        try {
            setSendingTest(true);
            await adminAPI.sendTestNewsletter({
                email: testEmail,
                subject,
                content,
                previewHtml: content
            });

            setAlertModal({
                isOpen: true,
                type: 'success',
                title: 'Email Test Terkirim',
                message: `Email test berhasil dikirim ke ${testEmail}`
            });
        } catch (error: any) {
            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Gagal Mengirim',
                message: error.response?.data?.message || 'Gagal mengirim email test'
            });
        } finally {
            setSendingTest(false);
        }
    };

    const handleSendNewsletter = async () => {
        if (!subject || !content) {
            setAlertModal({
                isOpen: true,
                type: 'warning',
                title: 'Form Tidak Lengkap',
                message: 'Harap isi subject dan konten newsletter.'
            });
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Kirim Newsletter?',
            message: `Anda akan mengirim newsletter ke ${stats?.totalSubscribers || 0} subscriber. Pastikan Anda sudah mengecek preview dan mengirim email test terlebih dahulu.`,
            onConfirm: async () => {
                try {
                    setSending(true);
                    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => { } });

                    const response = await adminAPI.sendNewsletter({
                        subject,
                        content,
                        previewHtml: content
                    });

                    const data = response.data.data;

                    // Show detailed results modal
                    setSendResults({
                        isOpen: true,
                        totalRecipients: data.totalRecipients,
                        successCount: data.successCount,
                        failedCount: data.failedCount,
                        successEmails: data.successEmails || [],
                        failedEmails: data.failedEmails || []
                    });

                    // Reset form and refresh data
                    setSubject('');
                    setContent('');
                    fetchStats();
                    fetchHistory();
                } catch (error: any) {
                    setAlertModal({
                        isOpen: true,
                        type: 'error',
                        title: 'Gagal Mengirim',
                        message: error.response?.data?.message || 'Gagal mengirim newsletter'
                    });
                } finally {
                    setSending(false);
                }
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Dashboard</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                        <Mail className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Newsletter</h1>
                        <p className="text-slate-500">Kirim newsletter ke semua subscriber</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {statsLoading ? '-' : stats?.totalSubscribers || 0}
                            </p>
                            <p className="text-xs text-slate-500">Total Subscriber</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 rounded-lg">
                            <Send className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {statsLoading ? '-' : stats?.totalNewslettersSent || 0}
                            </p>
                            <p className="text-xs text-slate-500">Newsletter Terkirim</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {statsLoading ? '-' : stats?.totalSuccessful || 0}
                            </p>
                            <p className="text-xs text-slate-500">Berhasil Dikirim</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-100 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {statsLoading ? '-' : stats?.totalFailed || 0}
                            </p>
                            <p className="text-xs text-slate-500">Gagal</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('compose')}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'compose'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Buat Newsletter
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'history'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Riwayat
                    </span>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'compose' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Compose Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Compose Newsletter</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Contoh: Update Terbaru dari DiskusiBisnis"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Konten Newsletter <span className="text-red-500">*</span>
                                    </label>
                                    <SimpleRichEditor
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Tulis konten newsletter Anda di sini. Gunakan toolbar untuk memformat teks..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setShowPreview(true)}
                                    disabled={!content}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Eye className="w-5 h-5" />
                                    Preview
                                </button>

                                <button
                                    onClick={handleSendNewsletter}
                                    disabled={sending || !subject || !content}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Kirim ke {stats?.totalSubscribers || 0} Subscriber
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Test Email */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                Kirim Email Test
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Kirim email test ke alamat Anda untuk memastikan tampilan newsletter sudah sesuai.
                            </p>
                            <div className="space-y-3">
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleSendTest}
                                    disabled={sendingTest || !testEmail || !subject || !content}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendingTest ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Kirim Test
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Templates */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                Template Siap Pakai
                            </h3>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubject('Selamat Datang di DiskusiBisnis! 🎉');
                                        setContent(`<h2>Selamat Bergabung di DiskusiBisnis! 🎉</h2>

<p>Terima kasih telah bergabung dengan komunitas pelaku UMKM terbesar di Indonesia!</p>

<p>DiskusiBisnis adalah platform diskusi dan tanya jawab khusus untuk Anda para pebisnis dan pelaku UMKM. Di sini, Anda bisa:</p>

<h3>✨ Yang Bisa Anda Lakukan</h3>
<ul>
  <li><strong>Bertanya</strong> - Ajukan pertanyaan seputar bisnis, marketing, keuangan, dan lainnya</li>
  <li><strong>Berdiskusi</strong> - Berbagi pengalaman dan belajar dari sesama pelaku UMKM</li>
  <li><strong>Bergabung Komunitas</strong> - Temukan komunitas bisnis sesuai bidang Anda</li>
  <li><strong>Membangun Reputasi</strong> - Dapatkan poin dan badge dengan aktif berkontribusi</li>
</ul>

<h3>🚀 Mulai Sekarang</h3>
<p>Langkah pertama yang bisa Anda lakukan:</p>
<ol>
  <li>Lengkapi profil Anda agar bisa dikenal</li>
  <li>Jelajahi pertanyaan yang sudah ada</li>
  <li>Ajukan pertanyaan pertama Anda</li>
  <li>Bergabung ke komunitas yang sesuai</li>
</ol>

<p>Jika ada pertanyaan, jangan ragu untuk menghubungi tim kami melalui halaman <a href="https://diskusibisnis.my.id/contact">Hubungi Kami</a>.</p>

<p><strong>Selamat berdiskusi dan semoga sukses! 💪</strong></p>
<p>Salam hangat,<br/><strong>Tim DiskusiBisnis</strong></p>`);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-all"
                                >
                                    🎉 Selamat Datang
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubject('Update Mingguan DiskusiBisnis - Desember 2024');
                                        setContent(`<h2>Halo Sahabat Bisnis! 👋</h2>

<p>Semoga minggu ini penuh berkah dan kesuksesan untuk bisnis Anda!</p>

<h3>🔥 Diskusi Terpopuler Minggu Ini</h3>
<p>Berikut diskusi yang paling banyak dibahas oleh komunitas:</p>
<ul>
  <li><strong>Strategi Marketing untuk UMKM di 2025</strong> - 47 jawaban</li>
  <li><strong>Cara Mengelola Cash Flow dengan Benar</strong> - 32 jawaban</li>
  <li><strong>Tips Membangun Brand dengan Budget Terbatas</strong> - 28 jawaban</li>
</ul>

<h3>💡 Tips Bisnis Mingguan</h3>
<blockquote>
  "Jangan takut untuk memulai dari kecil. Bisnis besar dimulai dari langkah pertama yang sederhana. Konsistensi adalah kunci kesuksesan jangka panjang."
</blockquote>

<h3>📊 Statistik Komunitas</h3>
<ul>
  <li>✅ <strong>150+</strong> pertanyaan baru minggu ini</li>
  <li>✅ <strong>500+</strong> jawaban dari komunitas</li>
  <li>✅ <strong>50+</strong> member baru bergabung</li>
</ul>

<h3>🎯 Tantangan Minggu Ini</h3>
<p>Coba jawab minimal <strong>3 pertanyaan</strong> dari member lain. Dengan membantu orang lain, Anda juga belajar dan membangun reputasi!</p>

<p><strong>Tetap semangat berbisnis! 🚀</strong></p>
<p>Salam sukses,<br/><strong>Tim DiskusiBisnis</strong></p>`);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-all"
                                >
                                    📊 Update Mingguan
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubject('Fitur Baru: Newsletter DiskusiBisnis! 📬');
                                        setContent(`<h2>Ada yang Baru di DiskusiBisnis! 🎊</h2>

<p>Kami dengan senang hati mengumumkan peluncuran fitur terbaru kami!</p>

<h3>📬 Fitur Newsletter</h3>
<p>Mulai sekarang, Anda akan mendapatkan update berkala langsung ke email Anda!</p>

<p>Apa yang akan Anda dapatkan:</p>
<ul>
  <li>📌 <strong>Diskusi Terpopuler</strong> - Pertanyaan dan jawaban terbaik dari komunitas</li>
  <li>💡 <strong>Tips Bisnis</strong> - Tips praktis untuk mengembangkan bisnis Anda</li>
  <li>📢 <strong>Pengumuman</strong> - Info terbaru tentang fitur dan event</li>
  <li>🎯 <strong>Tantangan Mingguan</strong> - Ajakan untuk aktif berkontribusi</li>
</ul>

<h3>🔔 Apa Lagi yang Akan Datang?</h3>
<p>Kami terus bekerja untuk menghadirkan fitur-fitur baru yang membantu perjalanan bisnis Anda:</p>
<ul>
  <li>🏆 Leaderboard untuk kontributor terbaik</li>
  <li>📚 Koleksi artikel dan panduan bisnis</li>
  <li>🤝 Fitur networking antar member</li>
</ul>

<p>Tunggu update selanjutnya dan jangan lupa aktif berdiskusi!</p>

<p><strong>Terima kasih telah menjadi bagian dari DiskusiBisnis! 🙏</strong></p>
<p>Salam hangat,<br/><strong>Tim DiskusiBisnis</strong></p>`);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-all"
                                >
                                    🆕 Fitur Baru
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubject('Recap Bulanan - Desember 2024 📅');
                                        setContent(`<h2>Rekap Bulanan DiskusiBisnis 📅</h2>

<p>Halo Sahabat Bisnis!</p>

<p>Berikut adalah rangkuman aktivitas komunitas kita bulan ini:</p>

<h3>📊 Statistik Bulan Ini</h3>
<ul>
  <li>📝 <strong>650</strong> pertanyaan diajukan</li>
  <li>💬 <strong>2,100</strong> jawaban diberikan</li>
  <li>👥 <strong>200</strong> member baru bergabung</li>
  <li>⭐ <strong>15,000+</strong> upvote diberikan</li>
</ul>

<h3>🏆 Top Kontributor Bulan Ini</h3>
<p>Apresiasi untuk member yang paling aktif membantu komunitas:</p>
<ol>
  <li>🥇 @UserA - 150 jawaban, 500+ upvote</li>
  <li>🥈 @UserB - 120 jawaban, 450+ upvote</li>
  <li>🥉 @UserC - 100 jawaban, 400+ upvote</li>
</ol>

<h3>🔥 Topik Terpopuler</h3>
<ul>
  <li>Marketing Digital untuk UMKM</li>
  <li>Strategi Penjualan di E-commerce</li>
  <li>Manajemen Keuangan Bisnis Kecil</li>
  <li>Legalitas dan Perizinan Usaha</li>
</ul>

<h3>🎯 Target Bulan Depan</h3>
<p>Mari bersama-sama capai target ini:</p>
<ul>
  <li>Bantu jawab lebih banyak pertanyaan</li>
  <li>Ajak rekan bisnis untuk bergabung</li>
  <li>Bagikan pengalaman sukses Anda</li>
</ul>

<p><strong>Terima kasih sudah menjadi bagian dari komunitas! 🙏</strong></p>
<p>Sampai jumpa di bulan depan!<br/><strong>Tim DiskusiBisnis</strong></p>`);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-all"
                                >
                                    📅 Recap Bulanan
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubject('⚠️ Maintenance Terjadwal - DiskusiBisnis');
                                        setContent(`<h2>⚠️ Pemberitahuan Maintenance</h2>

<p>Kepada seluruh pengguna DiskusiBisnis yang terhormat,</p>

<p>Dengan ini kami informasikan bahwa akan ada <strong>maintenance terjadwal</strong> untuk meningkatkan performa dan keamanan platform kami.</p>

<h3>📅 Detail Maintenance</h3>
<ul>
  <li><strong>Tanggal:</strong> Sabtu, 14 Desember 2024</li>
  <li><strong>Waktu:</strong> 02:00 - 06:00 WIB</li>
  <li><strong>Durasi:</strong> Maksimal 4 jam</li>
</ul>

<h3>🔧 Yang Akan Kami Lakukan</h3>
<ul>
  <li>Upgrade server untuk performa lebih cepat</li>
  <li>Pembaruan sistem keamanan</li>
  <li>Optimisasi database</li>
  <li>Perbaikan bug yang dilaporkan</li>
</ul>

<h3>⚡ Dampak</h3>
<p>Selama maintenance berlangsung, website DiskusiBisnis akan <strong>tidak dapat diakses sementara</strong>. Kami mohon maaf atas ketidaknyamanan ini.</p>

<h3>✅ Setelah Maintenance</h3>
<p>Setelah maintenance selesai, Anda akan merasakan:</p>
<ul>
  <li>Website lebih cepat dan responsif</li>
  <li>Fitur-fitur baru yang menarik</li>
  <li>Keamanan yang lebih terjamin</li>
</ul>

<p>Jika ada pertanyaan, silakan hubungi kami di <a href="mailto:support@diskusibisnis.my.id">support@diskusibisnis.my.id</a></p>

<p><strong>Terima kasih atas pengertiannya! 🙏</strong></p>
<p>Salam,<br/><strong>Tim DiskusiBisnis</strong></p>`);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-all"
                                >
                                    ⚠️ Maintenance
                                </button>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
                            <h3 className="text-sm font-semibold text-purple-900 mb-3">💡 Tips Newsletter</h3>
                            <ul className="text-xs text-purple-700 space-y-2">
                                <li>• Gunakan subject yang menarik dan jelas</li>
                                <li>• Sertakan CTA (Call to Action) yang jelas</li>
                                <li>• Pastikan konten tidak terlalu panjang</li>
                                <li>• Selalu kirim test email terlebih dahulu</li>
                                <li>• Hindari penggunaan kata-kata spam</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                /* History Tab */
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-4 px-6 font-semibold text-slate-900">Subject</th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-900">Dikirim Oleh</th>
                                    <th className="text-center py-4 px-6 font-semibold text-slate-900">Penerima</th>
                                    <th className="text-center py-4 px-6 font-semibold text-slate-900">Status</th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-900">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12">
                                            <div className="flex items-center justify-center gap-2 text-slate-500">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Memuat riwayat...
                                            </div>
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2 text-slate-500">
                                                <History className="w-10 h-10 text-slate-300" />
                                                <p>Belum ada newsletter yang dikirim</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-slate-900 max-w-xs truncate">{item.subject}</div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600">{item.sent_by_name || 'Admin'}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                                                    {item.recipients_count}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        {item.success_count}
                                                    </span>
                                                    {item.failed_count > 0 && (
                                                        <span className="flex items-center gap-1 text-xs text-red-500">
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            {item.failed_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDate(item.created_at)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-900">Preview Newsletter</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <XCircle className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            <div className="bg-slate-100 rounded-lg p-4 mb-4">
                                <p className="text-sm text-slate-600">
                                    <strong>Subject:</strong> 📬 {subject || '(Belum diisi)'} - DiskusiBisnis Newsletter
                                </p>
                                <p className="text-sm text-slate-600 mt-1">
                                    <strong>From:</strong> newsletter@diskusibisnis.my.id
                                </p>
                            </div>
                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: content || '<p class="text-slate-400">Konten belum diisi...</p>' }}
                            />
                        </div>
                    </div>
                </div>
            )}

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
                confirmText="Ya, Kirim Semua"
                cancelText="Batal"
            />

            {/* Send Results Modal */}
            {sendResults?.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSendResults(null)}
                    ></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden shadow-xl">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-500 to-teal-500">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                📬 Hasil Pengiriman Newsletter
                            </h3>
                            <p className="text-emerald-50 text-sm mt-1">
                                Laporan detail email yang terkirim
                            </p>
                        </div>

                        {/* Summary Stats */}
                        <div className="p-6 border-b border-slate-100 grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold text-slate-900">{sendResults.totalRecipients}</p>
                                <p className="text-xs text-slate-500 mt-1">Total Penerima</p>
                            </div>
                            <div className="text-center p-4 bg-emerald-50 rounded-xl">
                                <p className="text-2xl font-bold text-emerald-600">{sendResults.successCount}</p>
                                <p className="text-xs text-emerald-600 mt-1">Berhasil ✓</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-xl">
                                <p className="text-2xl font-bold text-red-600">{sendResults.failedCount}</p>
                                <p className="text-xs text-red-600 mt-1">Gagal ✗</p>
                            </div>
                        </div>

                        {/* Email Lists */}
                        <div className="p-6 max-h-[40vh] overflow-y-auto">
                            {/* Success Emails */}
                            {sendResults.successEmails.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Email Berhasil Terkirim ({sendResults.successEmails.length})
                                    </h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {sendResults.successEmails.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 p-2 bg-emerald-50 rounded-lg text-sm">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-slate-700 truncate">{item.name}</p>
                                                    <p className="text-slate-500 text-xs truncate">{item.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Failed Emails */}
                            {sendResults.failedEmails.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" />
                                        Email Gagal Terkirim ({sendResults.failedEmails.length})
                                    </h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {sendResults.failedEmails.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg text-sm">
                                                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-slate-700 truncate">{item.name}</p>
                                                    <p className="text-slate-500 text-xs truncate">{item.email}</p>
                                                    <p className="text-red-500 text-xs">{item.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sendResults.successEmails.length === 0 && sendResults.failedEmails.length === 0 && (
                                <p className="text-center text-slate-500">Tidak ada data email</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={() => setSendResults(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

