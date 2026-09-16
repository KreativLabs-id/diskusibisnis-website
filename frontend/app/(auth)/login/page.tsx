'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get callbackUrl from query params (set by middleware when redirecting to login)
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Redirect already-authenticated users away from login page
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(callbackUrl);
    }
  }, [user, authLoading, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push(callbackUrl);
    } catch (err: any) {
      // Handle different error scenarios
      if (err.response) {
        // Server responded with error
        const message = err.response.data?.message || err.response.data?.error;
        if (err.response.status === 401) {
          setError('Email atau password salah');
        } else if (err.response.status === 403) {
          setError(message || 'Akun Anda telah diblokir');
        } else {
          setError(message || 'Terjadi kesalahan saat login');
        }
      } else if (err.request) {
        // Network error
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credential);
      router.push(callbackUrl);
    } catch (err: any) {
      if (err.response) {
        const message = err.response.data?.message || err.response.data?.error;
        setError(message || 'Gagal login dengan Google');
      } else {
        setError('Tidak dapat terhubung ke server');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth or while redirecting logged-in user
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-[#f8fafc] dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background Elements - Subtle Spotlight */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-5 sm:mb-6">
          <Link href="/" className="inline-block group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg shadow-emerald-500/10 p-2.5 sm:p-3 flex items-center justify-center group-hover:scale-105 transition-all duration-300 ring-1 ring-slate-100 dark:ring-slate-800">
              <img
                src="/logodiskusibisnisaja.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Selamat Datang Kembali
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Silakan masuk untuk melanjutkan diskusi.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-slate-800/50">
          {error && (
            <div className="mb-4 p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl sm:rounded-2xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-0.5">
                Alamat Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 sm:pl-11 pr-3 py-2.5 sm:py-3 border border-slate-200 dark:border-slate-700/80 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-0.5">
                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </label>
                <Link href="/forgot-password" size="sm" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 sm:pl-11 pr-10 sm:pr-11 py-2.5 sm:py-3 border border-slate-200 dark:border-slate-700/80 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500/20 border-slate-300 dark:border-slate-700 rounded cursor-pointer transition-all"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none">
                Ingat saya di perangkat ini
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 px-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-md sm:shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 dark:hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-medium">Atau masuk dengan</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-5">
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Gagal login dengan Google')}
                text="Lanjutkan dengan Google"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Belum memiliki akun?{' '}
              <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 transition-colors ml-1">
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 sm:mt-8 flex justify-center gap-6">
          {['Privasi', 'Syarat', 'Bantuan'].map((item) => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase()}`} 
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
