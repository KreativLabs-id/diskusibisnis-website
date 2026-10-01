'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Target, Users as UsersIcon, Lightbulb, Gift, Edit, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import AlertModal from '@/components/ui/AlertModal';
import ImageUpload, { UploadedImage } from '@/components/ui/ImageUpload';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  location?: string;
  vision?: string;
  mission?: string;
  target_members?: string;
  benefits?: string;
  avatar_url?: string;
  user_role?: string;
  created_by: string;
  members_count?: number;
}

export default function CommunityAboutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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
  const [saving, setSaving] = useState(false);
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
    loadCommunity();
  }, [params.slug]);

  const loadCommunity = async () => {
    try {
      const response = await api.get(`/communities/${params.slug}`);
      const communityData = response.data.data?.community || response.data;
      setCommunity(communityData);
      setFormData({
        name: communityData.name || '',
        description: communityData.description || '',
        category: communityData.category || '',
        location: communityData.location || '',
        avatar_url: communityData.avatar_url || '',
        vision: communityData.vision || '',
        mission: communityData.mission || '',
        target_members: communityData.target_members || '',
        benefits: communityData.benefits || ''
      });
      if (searchParams.get('edit') === 'true') {
        setEditing(true);
      }
    } catch (error: any) {
      console.error('Failed to load community:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!community) return;

    setSaving(true);
    try {
      await Promise.all([
        api.put(`/communities/${community.slug}`, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          avatar_url: formData.avatar_url
        }),
        api.put(`/communities/${community.slug}/about`, {
          vision: formData.vision,
          mission: formData.mission,
          target_members: formData.target_members,
          benefits: formData.benefits
        })
      ]);
      await loadCommunity();
      setEditing(false);
      showAlert('success', 'Berhasil', 'Perubahan berhasil disimpan');
    } catch (error: any) {
      showAlert('error', 'Gagal', error.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = user && community && (
    community.created_by === user.id ||
    community.user_role === 'admin' ||
    user.role === 'admin'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-40 bg-slate-200 rounded-2xl"></div>
              <div className="h-40 bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium">Komunitas tidak ditemukan</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:hidden flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 truncate">Tentang Komunitas</h1>
        </div>
        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-emerald-600 font-medium text-sm"
          >
            Edit
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali</span>
          </button>

          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Halaman
            </button>
          )}
        </div>

        <div className="space-y-6 mb-8">
          {editing ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Informasi Dasar</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Logo/Gambar Komunitas</label>
                    <ImageUpload 
                      userId={user?.id || ''}
                      maxImages={1}
                      onImagesChange={(images) => {
                        if (images.length > 0) {
                          setFormData({ ...formData, avatar_url: images[0].url });
                        } else {
                          setFormData({ ...formData, avatar_url: '' });
                        }
                      }}
                    />
                    {formData.avatar_url && (
                      <div className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Gambar telah diunggah
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Komunitas *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50"
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="Regional">Regional</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Industri">Industri</option>
                      <option value="Perdagangan">Perdagangan</option>
                      <option value="Teknologi">Teknologi</option>
                      <option value="Keuangan">Keuangan</option>
                      <option value="Kuliner">Kuliner</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Kesehatan">Kesehatan</option>
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi (opsional)</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50"
                      placeholder="Contoh: Jakarta, Indonesia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi Singkat *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Detail Komunitas</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Visi</label>
                    <textarea
                      value={formData.vision}
                      onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 min-h-[100px]"
                      placeholder="Contoh: Menjadi komunitas UMKM terbesar di Indonesia yang memberdayakan pengusaha lokal untuk Go Digital dan Go Global"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Misi</label>
                    <textarea
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 min-h-[100px]"
                      placeholder="Contoh: 1. Menyediakan platform diskusi dan sharing knowledge. 2. Menghubungkan UMKM dengan mentor dan investor."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Siapa Target Anggota?</label>
                    <textarea
                      value={formData.target_members}
                      onChange={(e) => setFormData({ ...formData, target_members: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 min-h-[100px]"
                      placeholder="Contoh: Pemilik UMKM, startup founder, pengusaha muda..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Manfaat Bergabung</label>
                    <textarea
                      value={formData.benefits}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 min-h-[100px]"
                      placeholder="Contoh: Networking dengan sesama pengusaha, akses ke mentor berpengalaman..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                  Tentang {community.name}
                </h1>
                <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
                  {community.description}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Info Komunitas</h2>
                    <p className="text-sm text-slate-500">Kategori: {community.category || 'Umum'}</p>
                  </div>
                </div>
                {community.members_count && community.members_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span><strong>{community.members_count}</strong> anggota sudah bergabung</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <Target className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-bold text-slate-900">Visi</h2>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {community.vision || <span className="text-slate-400 italic">Visi komunitas belum diisi.</span>}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <Lightbulb className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-bold text-slate-900">Misi</h2>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {community.mission || <span className="text-slate-400 italic">Misi komunitas belum diisi.</span>}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <UsersIcon className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-bold text-slate-900">Siapa Target Anggota?</h2>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {community.target_members || <span className="text-slate-400 italic">Target anggota belum diisi.</span>}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <Gift className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-bold text-slate-900">Manfaat Bergabung</h2>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {community.benefits || <span className="text-slate-400 italic">Manfaat komunitas belum diisi.</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Actions */}
        {editing && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex items-center justify-end gap-3 sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 sm:mt-8">
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  name: community.name || '',
                  description: community.description || '',
                  category: community.category || '',
                  location: community.location || '',
                  avatar_url: community.avatar_url || '',
                  vision: community.vision || '',
                  mission: community.mission || '',
                  target_members: community.target_members || '',
                  benefits: community.benefits || ''
                });
              }}
              disabled={saving}
              className="px-6 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 font-medium text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-medium shadow-lg shadow-emerald-600/20 transition-all"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        )}
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
