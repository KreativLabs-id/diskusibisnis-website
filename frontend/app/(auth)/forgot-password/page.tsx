'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
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
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
              Email Terkirim!
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              Kami telah mengirim link reset password ke <strong className="text-slate-900 dark:text-slate-100">{email}</strong>.
              Silakan cek inbox Anda.
            </p>

            <Link
              href="/login"
              className="block w-full py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-center"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 mx-auto flex items-center justify-center">
              <img
                src="/logodiskusibisnisaja.png"
                alt="DiskusiBisnis Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
            Lupa Password?
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
            Masukkan email Anda dan kami akan mengirim link untuk reset password
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                placeholder="nama@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Mengirim...</span>
                </>
              ) : (
                'Kirim Link Reset'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
