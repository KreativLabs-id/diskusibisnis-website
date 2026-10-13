'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Users, MapPin, Tag, FileText, Plus, Target, Lightbulb, Gift, ImageIcon, CheckCircle } from 'lucide-react';
import { communityAPI } from '@/lib/api';
import AlertModal from '@/components/ui/AlertModal';
import ImageUpload from '@/components/ui/ImageUpload';

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
    location: '',
    avatar_url: '',
    vision: '',
    mission: '',
    target_members: '',
    benefits: ''
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
        const slug = response.data.data?.community?.slug;
        setTimeout(() => {
          if (slug) {
            router.push(`/communities/${slug}`);
          } else {
            router.push('/communities');
          }
        }, 1500);
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
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
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
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
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
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali ke Komunitas</span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Buat Komunitas Baru</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Bangun komunitas UMKM untuk berbagi pengalaman dan saling mendukung
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logo / Avatar Komunitas */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Logo Komunitas (Opsional)
              </label>
              <ImageUpload
                userId={user?.id || 'community'}
                maxImages={1}
                onImagesChange={(images) => {
                  if (images.length > 0) {
                    setFormData((prev) => ({ ...prev, avatar_url: images[0].url }));
                  } else {
                    setFormData((prev) => ({ ...prev, avatar_url: '' }));
                  }
                }}
              />
              {formData.avatar_url && (
                <div className="mt-2 text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4" /> Logo komunitas berhasil diunggah
                </div>
              )}
            </div>

            {/* Community Name */}
            <div>
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                <Users className="w-4 h-4 text-emerald-600" />
                Nama Komunitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: UMKM Bandung Kreatif"
                className="w-full px-4 py-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-base"
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                <FileText className="w-4 h-4 text-emerald-600" />
                Deskripsi Singkat <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Jelaskan tujuan komunitas, topik diskusi, dan gambaran umum kegiatan..."
                className="w-full px-4 py-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-base resize-none"
                required
                maxLength={500}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {formData.description.length}/500 karakter
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                <Tag className="w-4 h-4 text-emerald-600" />
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-base"
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
              <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Lokasi (Opsional)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Jakarta, Bandung, atau Online"
                className="w-full px-4 py-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-base"
                maxLength={100}
              />
            </div>

            {/* Detail Komunitas: Visi, Misi, Target Anggota, Manfaat */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Detail Komunitas (Visi, Misi, Target &amp; Manfaat)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Informasi ini akan ditampilkan pada tab &ldquo;Tentang&rdquo; di halaman komunitas Anda. (Opsional)
                </p>
              </div>

              <div className="space-y-6">
                {/* Vision */}
                <div>
                  <label htmlFor="vision" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Visi
                  </label>
                  <textarea
                    id="vision"
                    name="vision"
                    value={formData.vision}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Contoh: Mengangkat standar kualitas dan harga jasa industri kreatif di Timur Jawa."
                    className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-base resize-none"
                  />
                </div>

                {/* Mission */}
                <div>
                  <label htmlFor="mission" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
                    Misi
                  </label>
                  <textarea
                    id="mission"
                    name="mission"
                    value={formData.mission}
                    onChange={handleChange}
                    rows={4}
                    placeholder={`Contoh:
- Standarisasi harga jasa (biar nggak pada banting harga)
- Bikin event kolaborasi tahunan
- Sharing legalitas kontrak kerja`}
                    className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-base resize-none leading-relaxed"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Tips: Awali tiap poin dengan tanda hubung (-) untuk tampilan poin-poin yang rapi.
                  </p>
                </div>

                {/* Target Members */}
                <div>
                  <label htmlFor="target_members" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Target Anggota
                  </label>
                  <textarea
                    id="target_members"
                    name="target_members"
                    value={formData.target_members}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Contoh: Pelaku industri kreatif, agensi lokal, vendor pernikahan, seniman."
                    className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-base resize-none"
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label htmlFor="benefits" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    Manfaat Bergabung
                  </label>
                  <textarea
                    id="benefits"
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    rows={4}
                    placeholder={`Contoh:
- Sering dapet over-an job kalau tanggalnya bentrok
- Rekomendasi vendor sewa alat yang murah dan amanah
- Networking bareng EO besar`}
                    className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white text-base resize-none leading-relaxed"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Tips: Awali tiap poin dengan tanda hubung (-) untuk tampilan poin-poin yang rapi.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Tips Komunitas Menarik</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Lengkapi Visi, Misi, dan Manfaat Bergabung agar calon anggota lebih mudah memahami tujuan komunitas Anda dan tertarik untuk bergabung.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/communities"
                className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
              >
                Batal
              </Link>
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
