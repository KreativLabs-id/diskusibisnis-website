'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token reset password tidak valid atau telah kedaluwarsa.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Token tidak valid');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({ token, newPassword: password });
      setSuccess(true);

      // Clear any existing session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastUserRefresh');
      }

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengatur ulang kata sandi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-8 relative selection:bg-emerald-500 selection:text-white">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl p-1.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <img src="/logodiskusibisnisaja.png" alt="DiskusiBisnis" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">DiskusiBisnis</span>
        </Link>

        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative z-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />

          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Kata Sandi Berhasil Direset!
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Kata sandi baru Anda telah tersimpan. Mengalihkan Anda ke halaman masuk...
          </p>

          <div className="flex justify-center">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-8 relative selection:bg-emerald-500 selection:text-white">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
        <div className="w-8 h-8 bg-emerald-600 rounded-xl p-1.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <img src="/logodiskusibisnisaja.png" alt="DiskusiBisnis" className="w-full h-full object-contain brightness-0 invert" />
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">DiskusiBisnis</span>
      </Link>

      {/* Card Container */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative z-10">
        
        {/* Natural Back Link at top-left */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-5 group w-fit"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali</span>
        </Link>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Reset Kata Sandi
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
          Buat kata sandi baru yang kuat untuk mengamankan akun Anda.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                aria-label="Lihat kata sandi"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
                placeholder="Ulangi kata sandi baru"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Simpan Kata Sandi Baru'
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ingat kata sandi Anda?{' '}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

