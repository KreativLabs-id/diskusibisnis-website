'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Target, Users as UsersIcon, Lightbulb, Gift, Edit, CheckCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-50 pb-20">
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-50 pb-20">
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

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Tentang {community.name}
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
            {community.description}
          </p>
        </div>

        {/* Value Proposition Banner */}
        {!editing && (
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-lg shadow-emerald-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">🚀</span> Kenapa Harus Bergabung?
              </h2>
              <p className="text-emerald-50 text-lg mb-6 font-medium">Di komunitas ini kamu bisa:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <UsersIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Networking</h3>
                    <p className="text-sm text-emerald-50 leading-relaxed">Bangun koneksi dengan pengusaha lainnya</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Belajar Strategi</h3>
                    <p className="text-sm text-emerald-50 leading-relaxed">Dapatkan insight bisnis dari para ahli</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Dapat Partner</h3>
                    <p className="text-sm text-emerald-50 leading-relaxed">Temukan partner bisnis yang tepat</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Mentorship & Investor</h3>
                    <p className="text-sm text-emerald-50 leading-relaxed">Akses ke mentor dan peluang investasi</p>
                  </div>
                </div>
              </div>

              {community.members_count && (
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2 text-sm font-medium text-emerald-50">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>Sudah <strong className="text-white">{community.members_count} anggota</strong> yang bergabung dan berkembang bersama!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Vision */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Visi</h2>
                <p className="text-sm text-slate-500">Tujuan jangka panjang komunitas</p>
              </div>
            </div>

            {editing ? (
              <textarea
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 min-h-[120px]"
                placeholder="Contoh: Menjadi komunitas UMKM terbesar di Indonesia yang memberdayakan pengusaha lokal untuk Go Digital dan Go Global"
              />
            ) : (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {community.vision || <span className="text-slate-400 italic">Visi komunitas belum diisi.</span>}
              </p>
            )}
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <Lightbulb className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Misi</h2>
                <p className="text-sm text-slate-500">Langkah-langkah mencapai visi</p>
              </div>
            </div>

            {editing ? (
              <textarea
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 min-h-[120px]"
                placeholder="Contoh: 1. Menyediakan platform diskusi dan sharing knowledge. 2. Menghubungkan UMKM dengan mentor dan investor. 3. Memfasilitasi kolaborasi bisnis antar anggota."
              />
            ) : (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {community.mission || <span className="text-slate-400 italic">Misi komunitas belum diisi.</span>}
              </p>
            )}
          </div>

          {/* Target Members */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <UsersIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Siapa Target Anggota?</h2>
                <p className="text-sm text-slate-500">Profil anggota yang cocok</p>
              </div>
            </div>

            {editing ? (
              <textarea
                value={formData.target_members}
                onChange={(e) => setFormData({ ...formData, target_members: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 min-h-[120px]"
                placeholder="Contoh: Pemilik UMKM, startup founder, pengusaha muda, calon entrepreneur, siapa saja yang ingin memulai atau mengembangkan bisnis"
              />
            ) : (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {community.target_members || <span className="text-slate-400 italic">Target anggota belum diisi.</span>}
              </p>
            )}
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Manfaat Bergabung</h2>
                <p className="text-sm text-slate-500">Keuntungan menjadi anggota</p>
              </div>
            </div>

            {editing ? (
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 min-h-[120px]"
                placeholder="Contoh: Networking dengan sesama pengusaha, akses ke mentor berpengalaman, peluang kolaborasi bisnis, informasi peluang investasi, belajar strategi marketing dan sales"
              />
            ) : (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {community.benefits || <span className="text-slate-400 italic">Manfaat komunitas belum diisi.</span>}
              </p>
            )}
          </div>
        </div>

        {/* Edit Actions */}
        {editing && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex items-center justify-end gap-3 sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 sm:mt-8">
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
