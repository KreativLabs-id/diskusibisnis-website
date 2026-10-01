'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-8 relative selection:bg-emerald-500 selection:text-white">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl p-1.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <img src="/logodiskusibisnisaja.png" alt="DiskusiBisnis" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">DiskusiBisnis</span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative z-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />

          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Periksa Email Anda
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Link untuk reset password telah dikirim ke <strong className="text-slate-800 dark:text-slate-200 font-semibold">{email}</strong>. Silakan periksa inbox atau folder spam Anda.
          </p>

          <div className="space-y-2.5">
            <Link
              href="/login"
              className="block w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow-sm transition-all text-center"
            >
              Kembali ke Login
            </Link>

            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="block w-full py-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Kirim ulang link
            </button>
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
          Lupa Password?
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
          Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
              placeholder="nama@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Kirim Link Reset'
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


