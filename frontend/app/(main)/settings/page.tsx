'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, Save, AlertCircle, Trash2, Camera, X, CheckCircle, AlertTriangle, ChevronRight, Shield, LogOut } from 'lucide-react';
import { userAPI, authAPI } from '@/lib/api';
import { uploadAvatar, deleteAvatar } from '@/lib/image-upload';
import AlertModal from '@/components/ui/AlertModal';

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
      if (formData.avatarUrl) {
        await deleteAvatar(formData.avatarUrl);
      }
      await userAPI.deleteAvatar(user.id);
      setFormData({ ...formData, avatarUrl: '' });
      setAvatarPreview('');
      setAvatarFile(null);
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
    setLoading(true); setError(''); setSuccess('');

    try {
      let avatarUrl = formData.avatarUrl;
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          if (formData.avatarUrl) {
            await deleteAvatar(formData.avatarUrl);
          }
          const uploadResult = await uploadAvatar(avatarFile, user.id);
          avatarUrl = uploadResult.url;
        } catch (uploadErr: any) {
          showAlert('error', 'Gagal Upload', uploadErr.message || 'Gagal upload foto profil');
          setUploadingAvatar(false); setLoading(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      const updateData = {
        displayName: formData.displayName,
        bio: formData.bio || undefined,
        avatarUrl: avatarUrl || undefined
      };

      const response = await userAPI.updateProfile(user.id, updateData);
      if (response.data.success) {
        const updatedUserData = response.data.data.user || response.data.data;
        updateUser({
          ...user,
          displayName: updatedUserData.displayName || updatedUserData.display_name || formData.displayName,
          avatarUrl: updatedUserData.avatarUrl || updatedUserData.avatar_url || avatarUrl,
        });
        setSuccess('Profil berhasil diperbarui!');
        setTimeout(() => router.push(`/profile/${user.username || user.id}`), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <div className="max-w-2xl mx-auto px-4 md:px-0 py-8">

        {/* Header - Simple & Clean */}
        <div className="mb-10 px-2 md:px-0">
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola preferensi akun Anda</p>
        </div>

        {/* Notifications */}
        <div className="px-2 md:px-0 mb-8 space-y-4">
          {success && (
            <div className="bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border border-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Main Form Area - No "Cards", just stacked inputs */}
        <div className="space-y-12">

          <section className="px-2 md:px-0">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Profil</h2>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">

                {/* Avatar Row */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover border-2 border-slate-100"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar || loading}
                      className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full hover:bg-slate-700 transition-colors border-2 border-white shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Foto Profil</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Ubah
                      </button>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields - Minimalist, underline/clean style */}
                <div className="space-y-6 mt-2">
                  <div className="group">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Display Name</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full py-2.5 bg-transparent border-b border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors text-slate-900 font-medium placeholder:text-slate-300"
                      placeholder="Nama Lengkap"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Bio</label>
                    <textarea
                      rows={2}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full py-2.5 bg-transparent border-b border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors text-slate-900 resize-none placeholder:text-slate-300"
                      placeholder="Ceritakan sedikit tentang Anda..."
                      maxLength={200}
                    />
                    <div className="text-right mt-1 text-xs text-slate-400">
                      {formData.bio.length}/200
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all font-medium text-sm shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

              </div>
            </form>
          </section>

          <hr className="border-slate-100 mx-2 md:mx-0" />

          {/* Account Section - List Style */}
          <section className="px-2 md:px-0">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Akun & Keamanan</h2>
            <div className="flex flex-col">

              <div className="flex items-center justify-between py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors -mx-4 px-4 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Email</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors -mx-4 px-4 rounded-xl cursor-pointer"
                onClick={() => user.googleId && !user.hasPassword ? setShowSetPasswordModal(true) : setShowPasswordModal(true)}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Password</p>
                    <p className="text-xs text-slate-500">
                      {user.googleId && !user.hasPassword ? 'Belum diset (Login Google)' : '••••••••'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>

              <div className="flex items-center justify-between py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors -mx-4 px-4 rounded-xl cursor-pointer"
                onClick={logout}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Keluar</p>
                    <p className="text-xs text-slate-500">
                      Keluar dari akun Anda
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>

            </div>
          </section>

          <hr className="border-slate-100 mx-2 md:mx-0" />

          {/* Danger Zone - Subtle */}
          <section className="px-2 md:px-0">
            <div
              className="flex items-center justify-between py-4 cursor-pointer group"
              onClick={() => setShowDeleteModal(true)}
            >
              <div>
                <h3 className="text-sm font-medium text-red-600 group-hover:text-red-700 transition-colors">Hapus Akun</h3>
                <p className="text-xs text-slate-400 mt-0.5">Hapus permanen akun dan data Anda</p>
              </div>
              <div className="p-2 text-slate-300 group-hover:text-red-600 group-hover:bg-red-50 rounded-full transition-all">
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Modals - Clean & Minimal */}
      {showPasswordModal && <PasswordChangeModal userId={user.id} onClose={() => setShowPasswordModal(false)} />}
      {showDeleteModal && <DeleteAccountModal user={user} onClose={() => setShowDeleteModal(false)} onSuccess={async () => { await logout(); router.push('/'); }} />}
      {showSetPasswordModal && (
        <SetPasswordModal
          onClose={() => setShowSetPasswordModal(false)}
          onSuccess={() => {
            setShowSetPasswordModal(false);
            showAlert('success', 'Password Berhasil Dibuat!', 'Sekarang Anda bisa login dengan email dan password.');
          }}
        />
      )}
      <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({ ...alertModal, isOpen: false })} type={alertModal.type} title={alertModal.title} message={alertModal.message} />
    </div>
  );
}

// ... Modals code remains similar but simplified ...
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
    if (newPassword !== confirmPassword) { setError('Password baru tidak cocok'); return; }
    if (newPassword.length < 6) { setError('Password minimal 6 karakter'); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      await authAPI.changePassword({ userId, currentPassword, newPassword });
      setSuccess('Password berhasil diubah!');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Ubah Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-xs font-medium">{error}</div>}
        {success && <div className="p-3 mb-4 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-all"
              placeholder="Password Lama"
              required
            />
          </div>
          <div className="space-y-1">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-all"
              placeholder="Password Baru"
              required
            />
          </div>
          <div className="space-y-1">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-all"
              placeholder="Konfirmasi Password Baru"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function SetPasswordModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void; }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Password tidak cocok'); return; }
    if (newPassword.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true); setError('');
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Buat Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="mb-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
          Buat password untuk login menggunakan email.
        </div>
        {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-xs font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-all"
            placeholder="Password Baru"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm transition-all"
            placeholder="Konfirmasi Password"
            required
          />
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Buat Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DeleteAccountModal({ user, onClose, onSuccess }: { user: any; onClose: () => void; onSuccess: () => void; }) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isGoogleUser = !!user.googleId;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'HAPUS AKUN SAYA') { setError('Ketik "HAPUS AKUN SAYA"'); return; }
    setLoading(true); setError('');
    try {
      await userAPI.deleteAccount(user.id, isGoogleUser ? undefined : password);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Hapus Akun</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-red-600 mb-6 bg-red-50 p-3 rounded-lg">
          Permanen. Semua data akan hilang.
        </p>

        {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-xs font-medium">{error}</div>}

        <form onSubmit={handleDelete} className="space-y-4">
          {!isGoogleUser && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-red-500 rounded-xl outline-none text-sm transition-all"
              placeholder="Password Anda"
              required={!isGoogleUser}
            />
          )}
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-red-500 rounded-xl outline-none text-sm transition-all"
            placeholder="Ketik 'HAPUS AKUN SAYA'"
            required
          />
          <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm shadow-lg shadow-red-600/20 disabled:opacity-50" disabled={loading || confirmText !== 'HAPUS AKUN SAYA'}>
            {loading ? 'Menghapus...' : 'Hapus Akun Permanen'}
          </button>
        </form>
      </div>
    </div>
  );
}
