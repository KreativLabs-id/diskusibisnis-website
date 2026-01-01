'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, Edit, Eye, EyeOff, Megaphone, ExternalLink, Calendar, X, AlertTriangle, Info, CheckCircle, AlertCircle, Gift } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'promo';
    link_url: string | null;
    link_text: string | null;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
    is_dismissible: boolean;
    priority: number;
    show_on: string;
    created_at: string;
    status: string;
    dismiss_count: number;
}

const typeConfig = {
    info: { icon: Info, color: 'blue', label: 'Info' },
    warning: { icon: AlertTriangle, color: 'yellow', label: 'Peringatan' },
    success: { icon: CheckCircle, color: 'green', label: 'Sukses' },
    error: { icon: AlertCircle, color: 'red', label: 'Error' },
    promo: { icon: Gift, color: 'purple', label: 'Promo' },
};

export default function AdminAnnouncementsPage() {
    const { user, loading } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as Announcement['type'],
        linkUrl: '',
        linkText: '',
        startDate: '',
        endDate: '',
        isActive: true,
        isDismissible: true,
        priority: 0,
        showOn: 'all',
    });

    useEffect(() => {
        if (!loading && user?.role === 'admin') {
            fetchAnnouncements();
        }
    }, [user, loading]);

    const fetchAnnouncements = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/announcements/admin');
            setAnnouncements(response.data.data.announcements);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAnnouncement) {
                await api.put(`/announcements/admin/${editingAnnouncement.id}`, formData);
            } else {
                await api.post('/announcements/admin', formData);
            }
            setShowCreateModal(false);
            setEditingAnnouncement(null);
            resetForm();
            fetchAnnouncements();
        } catch (error) {
            console.error('Error saving announcement:', error);
            alert('Gagal menyimpan pengumuman');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await api.post(`/announcements/admin/${id}/toggle`);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error toggling announcement:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
        try {
            await api.delete(`/announcements/admin/${id}`);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            linkUrl: announcement.link_url || '',
            linkText: announcement.link_text || '',
            startDate: announcement.start_date ? new Date(announcement.start_date).toISOString().slice(0, 16) : '',
            endDate: announcement.end_date ? new Date(announcement.end_date).toISOString().slice(0, 16) : '',
            isActive: announcement.is_active,
            isDismissible: announcement.is_dismissible,
            priority: announcement.priority,
            showOn: announcement.show_on,
        });
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'info',
            linkUrl: '',
            linkText: '',
            startDate: '',
            endDate: '',
            isActive: true,
            isDismissible: true,
            priority: 0,
            showOn: 'all',
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            active: 'bg-green-100 text-green-700',
            scheduled: 'bg-blue-100 text-blue-700',
            expired: 'bg-gray-100 text-gray-700',
            inactive: 'bg-red-100 text-red-700',
        };
        return badges[status] || badges.inactive;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
                <Link href="/" className="text-green-600 hover:underline">Kembali ke Beranda</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <Megaphone className="w-6 h-6 text-cyan-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Pengumuman</h1>
                    </div>
                    <p className="text-slate-600">Kelola banner pengumuman, peringatan, dan notifikasi sistem</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingAnnouncement(null); setShowCreateModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Buat Pengumuman
                </button>
            </div>

            {/* Preview Banner */}
            <div className="mb-8 p-4 bg-slate-100 rounded-xl">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Preview Tipe Banner:</h3>
                <div className="space-y-2">
                    {Object.entries(typeConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                            <div key={key} className={`flex items-center gap-3 p-3 rounded-lg bg-${config.color}-50 border border-${config.color}-200`} style={{ backgroundColor: `var(--${config.color}-50, #f0f9ff)` }}>
                                <Icon className={`w-5 h-5 text-${config.color}-600`} />
                                <span className="text-sm font-medium">{config.label}: Contoh pesan pengumuman</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Announcement List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Belum ada pengumuman</h3>
                    <p className="text-slate-500">Buat pengumuman pertama Anda!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => {
                        const config = typeConfig[announcement.type];
                        const Icon = config.icon;
                        return (
                            <div key={announcement.id} className="bg-white rounded-xl border border-slate-200 p-6">
                                <div className="flex items-start gap-4">
                                    {/* Type Icon */}
                                    <div className={`p-3 rounded-lg bg-${config.color}-100`} style={{ backgroundColor: `var(--${config.color}-100, #dbeafe)` }}>
                                        <Icon className={`w-6 h-6 text-${config.color}-600`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
                                                        {config.label}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(announcement.status)}`}>
                                                        {announcement.status === 'active' ? 'Aktif' :
                                                            announcement.status === 'scheduled' ? 'Terjadwal' :
                                                                announcement.status === 'expired' ? 'Kadaluarsa' : 'Nonaktif'}
                                                    </span>
                                                    {!announcement.is_dismissible && (
                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                                            Tidak bisa ditutup
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-900">{announcement.title}</h3>
                                                <p className="text-slate-600 mt-1">{announcement.message}</p>
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex gap-6 mt-3 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(announcement.start_date).toLocaleDateString('id-ID')}</span>
                                                {announcement.end_date && <span>- {new Date(announcement.end_date).toLocaleDateString('id-ID')}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                <span>Tampil di: {announcement.show_on === 'all' ? 'Semua' : announcement.show_on}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <X className="w-4 h-4" />
                                                <span>{announcement.dismiss_count} dismiss</span>
                                            </div>
                                            {announcement.link_url && (
                                                <a href={announcement.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span>{announcement.link_text || 'Link'}</span>
                                                </a>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleToggle(announcement.id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${announcement.is_active
                                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {announcement.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                {announcement.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(announcement)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(announcement.id)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Judul *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Contoh: Maintenance Server"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Pesan *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Contoh: Server akan mengalami downtime pada tanggal..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Announcement['type'] })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="info">ℹ️ Info</option>
                                        <option value="warning">⚠️ Peringatan</option>
                                        <option value="success">✅ Sukses</option>
                                        <option value="error">❌ Error</option>
                                        <option value="promo">🎁 Promo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tampilkan di</label>
                                    <select
                                        value={formData.showOn}
                                        onChange={(e) => setFormData({ ...formData, showOn: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="all">Semua Halaman</option>
                                        <option value="home">Beranda</option>
                                        <option value="questions">Pertanyaan</option>
                                        <option value="communities">Komunitas</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">URL Link (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Teks Link</label>
                                    <input
                                        type="text"
                                        value={formData.linkText}
                                        onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Contoh: Pelajari Selengkapnya"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Priority (semakin tinggi, semakin atas)</label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    min="0"
                                />
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-slate-700">Aktif</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDismissible}
                                        onChange={(e) => setFormData({ ...formData, isDismissible: e.target.checked })}
                                        className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-slate-700">Bisa ditutup user</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    {editingAnnouncement ? 'Simpan Perubahan' : 'Buat Pengumuman'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
