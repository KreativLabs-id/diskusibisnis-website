'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Users, MapPin, Tag, FileText, Plus } from 'lucide-react';
import { communityAPI } from '@/lib/api';
import AlertModal from '@/components/ui/AlertModal';

const categories = [
  'Regional',
  'Marketing', 
  'Industri',
  'Perdagangan',
  'Teknologi',
  'Keuangan',
  'Kuliner',
  'Fashion',
  'Kesehatan',
  'Pendidikan'
];

export default function CreateCommunityPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: ''
  });
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showAlert('warning', 'Login Diperlukan', 'Silakan login untuk membuat komunitas');
      return;
    }

    setLoading(true);
    try {
      const response = await communityAPI.create(formData);
      
      if (response.data.success) {
        showAlert('success', 'Berhasil', 'Komunitas berhasil dibuat!');
        setTimeout(() => router.push('/communities'), 1500);
      }
    } catch (error: any) {
      console.error('Error creating community:', error);
      showAlert('error', 'Gagal Membuat Komunitas', error.response?.data?.message || 'Gagal membuat komunitas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Show loading skeleton while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                  <div className="h-10 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login required if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Diperlukan</h2>
          <p className="text-slate-600 mb-6">Anda perlu login untuk membuat komunitas</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Buat Komunitas Baru</h1>
            <p className="text-slate-600">
              Bangun komunitas UMKM untuk berbagi pengalaman dan saling mendukung
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Community Name */}
            <div>
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                <Users className="w-4 h-4" />
                Nama Komunitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: UMKM Bandung Kreatif"
                className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                <FileText className="w-4 h-4" />
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Jelaskan tujuan komunitas, target anggota, dan aktivitas yang akan dilakukan..."
                className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base resize-none"
                required
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-2">
                {formData.description.length}/500 karakter
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                <Tag className="w-4 h-4" />
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base bg-white"
                required
              >
                <option value="">Pilih kategori komunitas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                <MapPin className="w-4 h-4" />
                Lokasi (Opsional)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Jakarta, Bandung, atau Online"
                className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                maxLength={100}
              />
            </div>

            {/* Quick Tips - Simplified */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <h3 className="text-sm font-medium text-slate-900">Tips Singkat</h3>
              </div>
              <p className="text-sm text-slate-600">
                Nama harus unik, deskripsi jelas, dan pilih kategori yang tepat. 
                <button type="button" className="text-emerald-600 hover:text-emerald-700 font-medium ml-1">Pelajari selengkapnya</button>
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.description || !formData.category}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Membuat...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Buat Komunitas</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Alert Modal */}
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
