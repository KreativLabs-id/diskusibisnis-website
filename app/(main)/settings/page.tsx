'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, Save, AlertCircle, Upload, Camera } from 'lucide-react';
import { userAPI } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(user.id, formData);
      
      // Update user in context
      updateUser({
        ...user,
        displayName: response.data.data.displayName,
        avatarUrl: response.data.data.avatarUrl,
      });

      setSuccess('Profil berhasil diperbarui!');
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push(`/profile/${user.id}`);
      }, 2000);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Pengaturan Akun</h1>
          <p className="text-slate-600">Kelola informasi profil dan preferensi akun Anda</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Berhasil</p>
              <p className="text-sm text-green-600 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Informasi Profil</h2>
              <p className="text-sm text-slate-500">Perbarui informasi profil publik Anda</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="displayName" className="block text-sm font-semibold text-slate-900">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-0 py-3 border-0 border-b-2 border-slate-200 bg-transparent focus:outline-none focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 transition-colors"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-900">
                Bio Singkat
              </label>
              <textarea
                id="bio"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-0 py-3 border-0 border-b-2 border-slate-200 bg-transparent focus:outline-none focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 transition-colors resize-none"
                placeholder="Ceritakan tentang diri Anda"
                maxLength={200}
              />
              <p className="text-xs text-slate-500">
                {formData.bio.length}/200 karakter
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-900">
                Foto Profil
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="photo-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Create a preview URL
                        const url = URL.createObjectURL(file);
                        setFormData({ ...formData, avatarUrl: url });
                        // TODO: Implement actual file upload to server
                        alert('Fitur upload foto akan segera tersedia');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    <Camera className="w-4 h-4" />
                    Pilih Foto
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Pilih foto dari galeri atau kamera Anda
              </p>
            </div>

            {formData.avatarUrl && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Preview Avatar</p>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200">
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Informasi Akun</h2>
              <p className="text-sm text-slate-500">Detail akun dan keamanan</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Password</p>
                  <p className="text-sm text-slate-500">••••••••</p>
                </div>
              </div>
              <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Ubah Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
