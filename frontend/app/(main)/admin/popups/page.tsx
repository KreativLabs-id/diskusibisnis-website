'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, Edit, Eye, EyeOff, BarChart2, Image as ImageIcon, ExternalLink, Calendar, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface PromoPopup {
    id: string;
    title: string;
    image_url: string;
    link_url: string | null;
    link_type: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
    priority: number;
    target_audience: string;
    show_once_per_user: boolean;
    created_at: string;
    status: string;
    view_count: number;
    click_count: number;
}

export default function AdminPopupsPage() {
    const { user, loading } = useAuth();
    const [popups, setPopups] = useState<PromoPopup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPopup, setEditingPopup] = useState<PromoPopup | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        linkUrl: '',
        linkType: 'external',
        description: '',
        startDate: '',
        endDate: '',
        isActive: true,
        priority: 0,
        targetAudience: 'all',
        showOncePerUser: false,
    });

    useEffect(() => {
        if (!loading && user?.role === 'admin') {
            fetchPopups();
        }
    }, [user, loading]);

    const fetchPopups = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/popups/admin');
            setPopups(response.data.data.popups);
        } catch (error) {
            console.error('Error fetching popups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPopup) {
                await api.put(`/popups/admin/${editingPopup.id}`, formData);
            } else {
                await api.post('/popups/admin', formData);
            }
            setShowCreateModal(false);
            setEditingPopup(null);
            resetForm();
            fetchPopups();
        } catch (error) {
            console.error('Error saving popup:', error);
            alert('Gagal menyimpan popup');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await api.post(`/popups/admin/${id}/toggle`);
            fetchPopups();
        } catch (error) {
            console.error('Error toggling popup:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus popup ini?')) return;
        try {
            await api.delete(`/popups/admin/${id}`);
            fetchPopups();
        } catch (error) {
            console.error('Error deleting popup:', error);
        }
    };

    const handleEdit = (popup: PromoPopup) => {
        setEditingPopup(popup);
        setFormData({
            title: popup.title,
            imageUrl: popup.image_url,
            linkUrl: popup.link_url || '',
            linkType: popup.link_type,
            description: popup.description || '',
            startDate: popup.start_date ? new Date(popup.start_date).toISOString().slice(0, 16) : '',
            endDate: popup.end_date ? new Date(popup.end_date).toISOString().slice(0, 16) : '',
            isActive: popup.is_active,
            priority: popup.priority,
            targetAudience: popup.target_audience,
            showOncePerUser: popup.show_once_per_user,
        });
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            imageUrl: '',
            linkUrl: '',
            linkType: 'external',
            description: '',
            startDate: '',
            endDate: '',
            isActive: true,
            priority: 0,
            targetAudience: 'all',
            showOncePerUser: false,
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
                        <div className="p-2 bg-pink-100 rounded-lg">
                            <ImageIcon className="w-6 h-6 text-pink-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Popup Promo</h1>
                    </div>
                    <p className="text-slate-600">Kelola popup promosi yang muncul saat pengguna membuka aplikasi</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingPopup(null); setShowCreateModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Buat Popup Baru
                </button>
            </div>

            {/* Popup List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
            ) : popups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Belum ada popup</h3>
                    <p className="text-slate-500">Buat popup pertama Anda untuk mulai promosi!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {popups.map((popup) => (
                        <div key={popup.id} className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex gap-6">
                                {/* Image Preview */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={popup.image_url}
                                        alt={popup.title}
                                        className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image';
                                        }}
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{popup.title}</h3>
                                            <p className="text-sm text-slate-500 mt-1">{popup.description || 'Tidak ada deskripsi'}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(popup.status)}`}>
                                            {popup.status === 'active' ? 'Aktif' :
                                                popup.status === 'scheduled' ? 'Terjadwal' :
                                                    popup.status === 'expired' ? 'Kadaluarsa' : 'Nonaktif'}
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-6 mt-4 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Eye className="w-4 h-4" />
                                            <span>{popup.view_count} views</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <BarChart2 className="w-4 h-4" />
                                            <span>{popup.click_count} clicks</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(popup.start_date).toLocaleDateString('id-ID')}</span>
                                            {popup.end_date && <span>- {new Date(popup.end_date).toLocaleDateString('id-ID')}</span>}
                                        </div>
                                        {popup.link_url && (
                                            <a href={popup.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                                <ExternalLink className="w-4 h-4" />
                                                <span>Link</span>
                                            </a>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleToggle(popup.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${popup.is_active
                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                        >
                                            {popup.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            {popup.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(popup)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(popup.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingPopup ? 'Edit Popup' : 'Buat Popup Baru'}
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
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar *</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                    required
                                />
                                {formData.imageUrl && (
                                    <img src={formData.imageUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg border" />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                />
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Link</label>
                                    <select
                                        value={formData.linkType}
                                        onChange={(e) => setFormData({ ...formData, linkType: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="external">External URL</option>
                                        <option value="question">Pertanyaan</option>
                                        <option value="community">Komunitas</option>
                                    </select>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                    <input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                                    <select
                                        value={formData.targetAudience}
                                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="all">Semua</option>
                                        <option value="new_users">Pengguna Baru</option>
                                        <option value="returning_users">Pengguna Lama</option>
                                    </select>
                                </div>
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
                                        checked={formData.showOncePerUser}
                                        onChange={(e) => setFormData({ ...formData, showOncePerUser: e.target.checked })}
                                        className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-slate-700">Tampilkan sekali per user</span>
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
                                    {editingPopup ? 'Simpan Perubahan' : 'Buat Popup'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
