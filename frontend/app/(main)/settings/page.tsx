'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Mail, Lock, Save, AlertCircle, Trash2, Camera, X, CheckCircle, AlertTriangle, ChevronRight, Shield, LogOut, Moon, Sun, BellRing, HelpCircle, Info, ExternalLink } from 'lucide-react';
import { userAPI, authAPI } from '@/lib/api';
import { uploadAvatar, deleteAvatar } from '@/lib/image-upload';
import AlertModal from '@/components/ui/AlertModal';
import UserAvatar from '@/components/ui/UserAvatar';
import { getProfileHref } from '@/lib/profile';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout, loading: authLoading, forceRefreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
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

  // Track if initial data load has been done
  const initialLoadDone = useRef(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Force refresh user data on mount to get fresh bio (only once)
  useEffect(() => {
    if (!authLoading && user && !initialLoadDone.current) {
      initialLoadDone.current = true;
      forceRefreshUser();
    }
  }, [authLoading, user, forceRefreshUser]);

  // Update form data when user changes (after refresh)
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [user]);

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
          bio: updatedUserData.bio || formData.bio,
        });
        setSuccess('Profil berhasil diperbarui!');
        setTimeout(() => router.push(getProfileHref(user)), 2000);
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
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 md:px-0 py-8">

        {/* Header - Simple & Clean */}
        <div className="mb-8 px-2 md:px-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pengaturan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kelola preferensi akun Anda</p>
        </div>

        {/* Notifications */}
        <div className="px-2 md:px-0 mb-6 space-y-4">
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

        <div className="space-y-8">
          <section className="px-2 md:px-0">
            <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Profil</h2>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-6">

                {/* Avatar Section - Compact */}
                <div className="flex items-center gap-5">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative z-10 overflow-hidden">
                      <UserAvatar
                        src={avatarPreview}
                        alt="Avatar"
                        size="xl"
                        fallbackName={formData.displayName}
                        className="w-full h-full"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar || loading}
                      className="absolute bottom-0 right-0 z-20 p-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-all border-2 border-white dark:border-slate-950 shadow-sm"
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
                  
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">Foto Profil</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                      >
                        Ubah Foto
                      </button>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="text-xs font-semibold px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields - Minimalist, unified styles */}
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Display Name</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 rounded-xl outline-none text-sm transition-all text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder="Nama Lengkap"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Bio</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 rounded-xl outline-none text-sm transition-all text-slate-900 dark:text-slate-100 font-medium resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      placeholder="Ceritakan sedikit tentang Anda..."
                      maxLength={200}
                    />
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

          {/* Account Section - List Style */}
          <section className="px-2 md:px-0">
            <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Akun & Keamanan</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">

              <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Email</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Google Account Indicator */}
              {user.googleId && (
                <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Login dengan Google</p>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Terhubung</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Aktif</span>
                  </div>
                </div>
              )}

              <button type="button" className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                onClick={() => user.googleId && !user.hasPassword ? setShowSetPasswordModal(true) : setShowPasswordModal(true)}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Password</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {user.googleId && !user.hasPassword ? 'Belum diset (opsional)' : '••••••••'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              </button>

              <button type="button" className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                onClick={logout}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">Keluar Akun</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Keluar dari sesi ini</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              </button>

            </div>
          </section>

          {/* Preferences Section */}
          <section className="px-2 md:px-0">
            <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Preferensi</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">

              <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Mode Gelap</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tampilan ramah mata</p>
                  </div>
                </div>
                {/* Functional Toggle */}
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${theme === 'dark' ? 'right-1' : 'left-1'
                    }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifikasi Email</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Info terbaru via email</p>
                  </div>
                </div>
                {/* Visual Toggle (Dummy - On) */}
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer transition-colors">
                  <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                </div>
              </div>

            </div>
          </section>

          {/* About & Support Section */}
          <section className="px-2 md:px-0">
            <h2 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Tentang & Bantuan</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">

              <a href="/help" className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Pusat Bantuan</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">FAQ dan Hubungi Kami</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </a>

              <a href="/terms" className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Tentang Aplikasi</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Versi 1.0.0 (Beta)</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              </a>

            </div>
          </section>

          {/* Danger Zone */}
          <section className="px-2 md:px-0">
            <div
              className="flex items-center justify-between p-4 sm:p-5 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 rounded-2xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group shadow-sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">Hapus Akun</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tindakan ini permanen</p>
                  </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-300 dark:text-red-600" />
            </div>
          </section>

        </div>
      </div>

      {/* Modals - Clean & Minimal */}
      {showPasswordModal && <PasswordChangeModal email={user.email} onClose={() => setShowPasswordModal(false)} />}
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
function PasswordChangeModal({ email, onClose }: { email: string; onClose: () => void }) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendResetEmail = async () => {
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim email. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAfterReset = async () => {
    await logout();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {success ? 'Email Terkirim!' : 'Ubah Password'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium border border-red-100 dark:border-red-900/30">{error}</div>}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Link reset password telah dikirim!</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">
                    Cek email <span className="font-semibold">{email}</span> untuk mereset password Anda.
                    Link berlaku selama 1 jam.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs">
              <p className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Setelah mengganti password, Anda akan otomatis logout dari semua perangkat.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-lg shadow-emerald-600/20"
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm">
              <p>Kami akan mengirim link untuk mereset password ke email:</p>
              <p className="font-semibold mt-1 text-slate-900 dark:text-slate-100">{email}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs">
              <p className="flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Link reset password akan berlaku selama 1 jam. Setelah password diganti, Anda akan otomatis logout.</span>
              </p>
            </div>
            <button
              onClick={handleSendResetEmail}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Kirim Link Reset Password</span>
                </>
              )}
            </button>
          </div>
        )}
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Buat Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
        </div>
        <div className="mb-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          Buat password untuk login menggunakan email.
        </div>
        {error && <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 rounded-xl outline-none text-sm transition-all text-slate-900 dark:text-slate-100"
            placeholder="Password Baru"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 rounded-xl outline-none text-sm transition-all text-slate-900 dark:text-slate-100"
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hapus Akun</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mb-6 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          Permanen. Semua data akan hilang.
        </p>

        {error && <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">{error}</div>}

        <form onSubmit={handleDelete} className="space-y-4">
          {!isGoogleUser && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-red-500 rounded-xl outline-none text-sm transition-all text-slate-900 dark:text-slate-100"
              placeholder="Password Anda"
              required={!isGoogleUser}
            />
          )}
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-red-500 rounded-xl outline-none text-sm transition-all text-slate-900 dark:text-slate-100"
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
