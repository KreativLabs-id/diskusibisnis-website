'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, Save, AlertCircle, Upload, Camera, Trash2, X } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { uploadAvatar, deleteAvatar } from '@/lib/image-upload';
import AlertModal from '@/components/ui/AlertModal';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, loading: authLoading } = useAuth();
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
          router.push(`/profile/${user.username || user.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
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

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                Foto Profil
              </label>
              
              {/* Avatar Preview */}
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
                    />
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-50">
                    <User className="w-12 h-12 text-emerald-600" />
                  </div>
                )}

                <div className="flex-1 flex flex-wrap gap-2">
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-4 h-4" />
                    {avatarPreview ? 'Ganti Foto' : 'Pilih Foto'}
                  </button>
                  
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar || loading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-slate-500">
                Format: JPG, PNG, GIF, atau WebP. Maksimal 5MB.
              </p>
            </div>

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
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Ubah Password
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
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess('Password berhasil diubah!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Ubah Password</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Password Lama
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
