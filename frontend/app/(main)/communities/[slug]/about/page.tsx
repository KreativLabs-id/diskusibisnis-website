'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Target, Users as UsersIcon, Lightbulb, Gift, Edit } from 'lucide-react';
import api from '@/lib/api';
import AlertModal from '@/components/ui/AlertModal';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  vision?: string;
  mission?: string;
  target_members?: string;
  benefits?: string;
  user_role?: string;
  created_by: string;
  members_count?: number;
}

export default function CommunityAboutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
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
      setCommunity(response.data);
      setFormData({
        vision: response.data.vision || '',
        mission: response.data.mission || '',
        target_members: response.data.target_members || '',
        benefits: response.data.benefits || ''
      });
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
      await api.put(`/communities/${community.slug}/about`, formData);
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
    community.user_role === 'admin'
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600">Komunitas tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tentang {community.name}
            </h1>
            <p className="text-gray-600">{community.description}</p>
          </div>

          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Edit size={18} />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Value Proposition Banner */}
      {!editing && (
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-3">🚀 Kenapa Harus Bergabung?</h2>
          <p className="text-lg mb-4">Di komunitas ini kamu bisa:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <UsersIcon size={24} className="shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Networking</h3>
                <p className="text-sm opacity-90">Bangun koneksi dengan pengusaha lainnya</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lightbulb size={24} className="shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Belajar Strategi</h3>
                <p className="text-sm opacity-90">Dapatkan insight bisnis dari para ahli</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target size={24} className="shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Dapat Partner</h3>
                <p className="text-sm opacity-90">Temukan partner bisnis yang tepat</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Gift size={24} className="shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Mentorship & Investor</h3>
                <p className="text-sm opacity-90">Akses ke mentor dan peluang investasi</p>
              </div>
            </div>
          </div>
          {community.members_count && (
            <p className="text-sm mt-4 opacity-90">
              ✨ Sudah <strong>{community.members_count} anggota</strong> yang bergabung dan berkembang bersama!
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {/* Vision */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target size={24} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Visi</h2>
          </div>
          {editing ? (
            <textarea
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Contoh: Menjadi komunitas UMKM terbesar di Indonesia yang memberdayakan pengusaha lokal untuk Go Digital dan Go Global"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {community.vision || 'Visi komunitas belum diisi.'}
            </p>
          )}
        </div>

        {/* Mission */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lightbulb size={24} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Misi</h2>
          </div>
          {editing ? (
            <textarea
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Contoh: 1. Menyediakan platform diskusi dan sharing knowledge. 2. Menghubungkan UMKM dengan mentor dan investor. 3. Memfasilitasi kolaborasi bisnis antar anggota."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {community.mission || 'Misi komunitas belum diisi.'}
            </p>
          )}
        </div>

        {/* Target Members */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UsersIcon size={24} className="text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Siapa Target Anggota?</h2>
          </div>
          {editing ? (
            <textarea
              value={formData.target_members}
              onChange={(e) => setFormData({ ...formData, target_members: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Contoh: Pemilik UMKM, startup founder, pengusaha muda, calon entrepreneur, siapa saja yang ingin memulai atau mengembangkan bisnis"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {community.target_members || 'Target anggota belum diisi.'}
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Gift size={24} className="text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Manfaat Bergabung</h2>
          </div>
          {editing ? (
            <textarea
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Contoh: Networking dengan sesama pengusaha, akses ke mentor berpengalaman, peluang kolaborasi bisnis, informasi peluang investasi, belajar strategi marketing dan sales"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {community.benefits || 'Manfaat komunitas belum diisi.'}
            </p>
          )}
        </div>

        {/* Edit Actions */}
        {editing && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  vision: community.vision || '',
                  mission: community.mission || '',
                  target_members: community.target_members || '',
                  benefits: community.benefits || ''
                });
              }}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
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
