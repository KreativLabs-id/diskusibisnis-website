'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
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

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = callbackUrl;
    }
  }, [user, authLoading, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      window.location.href = callbackUrl;
    } catch (err: any) {
      if (err.response) {
        const message = err.response.data?.message || err.response.data?.error;
        if (err.response.status === 401) {
          setError('Email atau kata sandi tidak sesuai');
        } else if (err.response.status === 403) {
          setError(message || 'Akun Anda telah dinonaktifkan');
        } else {
          setError(message || 'Terjadi kesalahan saat masuk');
        }
      } else if (err.request) {
        setError('Tidak dapat terhubung ke server');
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
      window.location.href = callbackUrl;
    } catch (err: any) {
      if (err.response) {
        const message = err.response.data?.message || err.response.data?.error;
        setError(message || 'Gagal masuk dengan Google');
      } else {
        setError('Tidak dapat terhubung ke server');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-900">
      
      {/* LEFT PANEL - Clean, Vibrant Brand Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white p-8 xl:p-12 flex-col justify-between overflow-hidden shrink-0 min-h-screen lg:[border-top-right-radius:4rem_6rem] lg:[border-bottom-right-radius:4rem_6rem] [transform:translateZ(0)] isolate shadow-[8px_0_36px_-6px_rgba(5,150,105,0.18)] z-10">
        {/* Soft Background Glow */}
        <div className="absolute top-1/4 -right-16 w-72 h-72 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group w-fit">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl p-2 flex items-center justify-center border border-white/20 shadow-sm group-hover:scale-105 transition-transform">
              <img src="/logodiskusibisnisaja.png" alt="DiskusiBisnis" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">DiskusiBisnis</span>
          </Link>
        </div>

        {/* Lower-Middle: Pill, Headline, Subheading */}
        <div className="relative z-10 mt-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-4 shadow-sm w-fit">
            <span>Selamat Datang Kembali</span>
            <span>👋</span>
          </div>

          <h1 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-snug mb-2">
            Mulai Langkah Bisnis Anda
          </h1>
          <p className="text-emerald-50/90 text-xs xl:text-sm leading-relaxed max-w-sm font-normal">
            Masuk untuk melanjutkan diskusi, berbagi pengalaman, dan berkolaborasi bersama ribuan pelaku UMKM.
          </p>
        </div>

        {/* Bottom: 3 Stepper Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-2.5 max-w-md">
          {/* Card 1 - Active */}
          <div className="rounded-xl p-3 bg-white text-slate-900 shadow-md flex flex-col justify-between min-h-[96px] transition-all">
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
              1
            </div>
            <p className="text-xs font-semibold leading-tight text-slate-900 mt-2">
              Masuk ke akun
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl p-3 bg-white/15 backdrop-blur-sm border border-white/15 text-white flex flex-col justify-between min-h-[96px] transition-all">
            <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
              2
            </div>
            <p className="text-xs font-medium leading-tight text-white/90 mt-2">
              Pantau diskusi
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl p-3 bg-white/15 backdrop-blur-sm border border-white/15 text-white flex flex-col justify-between min-h-[96px] transition-all">
            <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
              3
            </div>
            <p className="text-xs font-medium leading-tight text-white/90 mt-2">
              Kembangkan usaha
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Compact Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-8 min-h-screen bg-white dark:bg-slate-900">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl p-2 flex items-center justify-center shadow-sm">
              <img src="/logodiskusibisnisaja.png" alt="DiskusiBisnis" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">DiskusiBisnis</span>
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-6 tracking-tight">
            Masuk ke Akun
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
                placeholder="nama@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
                  placeholder="••••••••••••"
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

            {/* Remember Me */}
            <div className="flex items-center pt-0.5">
              <input
                id="remember-me"
                type="checkbox"
                className="h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500/20 border-slate-300 dark:border-slate-700 rounded cursor-pointer transition-all"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none"
              >
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Lanjutkan</span>
                )}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-3.5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum memiliki akun?{' '}
              <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline ml-0.5">
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2.5 bg-white dark:bg-slate-900 text-slate-400 font-medium text-[11px]">
                Atau
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <div>
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Gagal masuk dengan Google')}
              text="Masuk dengan Google"
              disabled={loading}
            />
          </div>

          {/* Footer Links */}
          <div className="mt-6 flex justify-center gap-5">
            {[
              { name: 'Privasi', href: '/privasi' },
              { name: 'Syarat', href: '/syarat' },
              { name: 'Bantuan', href: '/bantuan' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wider"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
