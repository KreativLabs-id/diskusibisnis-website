'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, Save, AlertCircle, Upload, Camera, Trash2, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { userAPI, authAPI } from '@/lib/api';
import { uploadAvatar, deleteAvatar } from '@/lib/image-upload';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    if (!authLoading && !user) {
      router.push('/login');
    }

    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: '',
        avatarUrl: user.avatarUrl || '',
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [user, authLoading, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showAlert('error', 'Format Tidak Valid', 'Gunakan format JPG, PNG, GIF, atau WebP');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'File Terlalu Besar', 'Ukuran maksimal adalah 5MB');
      return;
    }

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      setUploadingAvatar(true);

      // Delete from Supabase if there's an existing avatar
      if (formData.avatarUrl) {
        await deleteAvatar(formData.avatarUrl);
      }

      // Update backend
      await userAPI.deleteAvatar(user.id);

      // Update local state
      setFormData({ ...formData, avatarUrl: '' });
      setAvatarPreview('');
      setAvatarFile(null);

      // Update context
      updateUser({ ...user, avatarUrl: '' });

      showAlert('success', 'Berhasil', 'Foto profil berhasil dihapus');
    } catch (err: any) {
      console.error('Delete avatar error:', err);
      showAlert('error', 'Gagal', 'Gagal menghapus foto profil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = formData.avatarUrl;

      // Upload avatar if new file is selected
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          // Delete old avatar from Supabase if exists
          if (formData.avatarUrl) {
            await deleteAvatar(formData.avatarUrl);
          }

          // Upload new avatar
          const uploadResult = await uploadAvatar(avatarFile, user.id);
          avatarUrl = uploadResult.url;
        } catch (uploadErr: any) {
          console.error('Avatar upload error:', uploadErr);
          showAlert('error', 'Gagal Upload', uploadErr.message || 'Gagal upload foto profil');
          setUploadingAvatar(false);
          setLoading(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      // Update profile data
      const updateData = {
        displayName: formData.displayName,
        bio: formData.bio || undefined,
        avatarUrl: avatarUrl || undefined
      };

      const response = await userAPI.updateProfile(user.id, updateData);

      // Update user in context
      if (response.data.success) {
        const updatedUserData = response.data.data.user || response.data.data;
        updateUser({
          ...user,
          displayName: updatedUserData.displayName || updatedUserData.display_name || formData.displayName,
          avatarUrl: updatedUserData.avatarUrl || updatedUserData.avatar_url || avatarUrl,
        });

        setSuccess('Profil berhasil diperbarui!');

        // Redirect to profile after 2 seconds
        setTimeout(() => {
          router.push(`/profile/${user.username || user.id}`);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-3xl mx-auto px-0 sm:px-4 py-0 sm:py-8">
        <div className="mb-8 px-4 sm:px-0 pt-6 sm:pt-0">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pengaturan Akun</h1>
          <p className="text-slate-600">Kelola informasi profil dan preferensi akun Anda</p>
        </div>

        {/* Success Message */}
        <div className="px-4 sm:px-0">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="p-1 bg-emerald-100 rounded-full">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Berhasil Disimpan</p>
                <p className="text-sm text-emerald-600 mt-0.5">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="p-1 bg-red-100 rounded-full">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-800">Terjadi Kesalahan</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Settings */}
        <div className="bg-white sm:rounded-3xl p-6 sm:p-8 mb-2 sm:mb-6 shadow-none sm:shadow-sm border-y sm:border border-slate-100">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Informasi Profil</h2>
              <p className="text-sm text-slate-500">Perbarui informasi profil publik Anda</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-900">
                Foto Profil
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {avatarPreview ? (
                  <div className="relative group">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-2xl object-cover shadow-md ring-4 ring-white"
                    />
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
                    <User className="w-10 h-10 text-slate-300" />
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar || loading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar || loading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      {avatarPreview ? 'Ganti Foto' : 'Upload Foto'}
                    </button>

                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar || loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Format: JPG, PNG, GIF, atau WebP. Maksimal 5MB.<br />
                    Disarankan menggunakan gambar persegi minimal 500x500px.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label htmlFor="displayName" className="block text-sm font-bold text-slate-900">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="block text-sm font-bold text-slate-900">
                  Bio Singkat
                </label>
                <div className="relative">
                  <textarea
                    id="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-900 placeholder:text-slate-400 resize-none"
                    placeholder="Ceritakan sedikit tentang diri Anda, keahlian, atau minat..."
                    maxLength={200}
                  />
                  <div className="absolute bottom-3 right-3 text-xs font-medium text-slate-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
                    {formData.bio.length}/200
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors font-medium text-sm"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 whitespace-nowrap"
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
        <div className="bg-white sm:rounded-3xl p-6 sm:p-8 mb-2 sm:mb-6 shadow-none sm:shadow-sm border-y sm:border border-slate-100">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Informasi Akun</h2>
              <p className="text-sm text-slate-500">Detail akun dan keamanan</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Password</p>
                  {user.googleId && !user.hasPassword ? (
                    // Google-only user (no password)
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Login dengan Google
                    </p>
                  ) : user.googleId && user.hasPassword ? (
                    // Hybrid user (Google + Password)
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Google + Password
                    </p>
                  ) : (
                    // Regular user (password only)
                    <p className="text-sm font-medium text-slate-900">••••••••</p>
                  )}
                </div>
              </div>
              {/* Show 'Buat Password' only for Google users WITHOUT password */}
              {/* Show 'Ubah' for users WITH password (including Google users who already set one) */}
              {user.googleId && !user.hasPassword ? (
                <button
                  onClick={() => setShowSetPasswordModal(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  Buat Password
                </button>
              ) : (
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  Ubah
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white sm:rounded-3xl p-6 sm:p-8 shadow-none sm:shadow-sm border-y sm:border border-red-100">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-red-100">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900">Zona Berbahaya</h2>
              <p className="text-sm text-red-600">Tindakan yang tidak dapat dibatalkan</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-red-900">Hapus Akun</h3>
                <p className="text-sm text-red-600 mt-1">
                  Menghapus akun akan menghapus semua data Anda secara permanen,
                  termasuk pertanyaan, jawaban, komentar, dan reputasi.
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="shrink-0 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 font-medium text-sm flex items-center gap-2 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <PasswordChangeModal
          userId={user.id}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          user={user}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={async () => {
            await logout();
            router.push('/');
          }}
        />
      )}

      {/* Set Password Modal for Google Users */}
      {showSetPasswordModal && (
        <SetPasswordModal
          onClose={() => setShowSetPasswordModal(false)}
          onSuccess={() => {
            setShowSetPasswordModal(false);
            setAlertModal({
              isOpen: true,
              type: 'success',
              title: 'Password Berhasil Dibuat!',
              message: 'Sekarang Anda bisa login dengan email dan password sebagai alternatif selain Google.'
            });
          }}
        />
      )}

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

function PasswordChangeModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Password baru tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.changePassword({ userId, currentPassword, newPassword });

      setSuccess('Password berhasil diubah!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Ubah Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Password Lama
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Minimal 6 karakter"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Konfirmasi Password Baru
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ketik ulang password baru"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Set Password Modal for Google Users
function SetPasswordModal({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.setPassword({ newPassword, confirmPassword });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Buat Password</h2>
              <p className="text-sm text-slate-500">Login alternatif selain Google</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-700">
            💡 Dengan membuat password, Anda bisa login menggunakan <strong>email + password</strong> sebagai alternatif selain Google. Ini berguna jika Anda ingin mengakses akun dari device yang tidak login Google.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimal 6 karakter"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Konfirmasi Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ketik ulang password"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Buat Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Account Modal
function DeleteAccountModal({
  user,
  onClose,
  onSuccess
}: {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is Google-authenticated (no password needed)
  // If user has googleId, they logged in with Google
  const isGoogleUser = !!user.googleId;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify confirmation text
    if (confirmText !== 'HAPUS AKUN SAYA') {
      setError('Ketik "HAPUS AKUN SAYA" untuk mengkonfirmasi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For non-Google users, password is required
      await userAPI.deleteAccount(user.id, isGoogleUser ? undefined : password);

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      onSuccess();
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err.response?.data?.message || 'Gagal menghapus akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-900">Hapus Akun</h2>
            <p className="text-sm text-red-600">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800">
            <strong>Peringatan:</strong> Menghapus akun akan menghapus secara permanen:
          </p>
          <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
            <li>Semua pertanyaan Anda</li>
            <li>Semua jawaban Anda</li>
            <li>Semua komentar Anda</li>
            <li>Poin reputasi Anda</li>
            <li>Keanggotaan komunitas</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleDelete} className="space-y-4">
          {!isGoogleUser && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Masukkan Password Anda
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Password Anda"
                required={!isGoogleUser}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Ketik <span className="font-bold text-red-600">HAPUS AKUN SAYA</span> untuk mengkonfirmasi
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="HAPUS AKUN SAYA"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              disabled={loading || confirmText !== 'HAPUS AKUN SAYA'}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Akun</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
