'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
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
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-900 overflow-y-auto lg:overflow-hidden">

      {/* Hidden SVG Definitions for Custom Slanted Card Shape */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <clipPath id="slantedHeroCard" clipPathUnits="objectBoundingBox">
            <path d="M 0.08 0 L 0.92 0 Q 1.0 0.0 0.995 0.06 L 0.885 0.94 Q 0.88 1.0 0.80 1.0 L 0.08 1.0 Q 0 1.0 0 0.94 L 0 0.06 Q 0 0 0.08 0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* LEFT COLUMN: SLANTED ROUNDED HERO PHOTO CARD (Desktop Only, hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 p-3 sm:p-5 lg:p-6 xl:p-8 items-center justify-center lg:h-screen shrink-0">
        <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[calc(100vh-3rem)] max-h-[820px] filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)]">
          
          {/* Card Container with Slanted Shape on Desktop */}
          <div 
            className="relative w-full h-full rounded-[2rem] lg:rounded-none overflow-hidden flex flex-col justify-between p-6 sm:p-10 xl:p-12 text-white group"
            style={{ WebkitClipPath: 'url(#slantedHeroCard)', clipPath: 'url(#slantedHeroCard)' }}
          >
            {/* Background Image with Hover Micro-Zoom */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('/images/auth-bg.jpg')` }}
            />

            {/* Dark Overlay Gradient for Perfect Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/70" />

            {/* SVG Crisp Non-Scaling Border Outline */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-20 hidden lg:block" 
              viewBox="0 0 1 1" 
              preserveAspectRatio="none"
            >
              <path 
                d="M 0.08 0 L 0.92 0 Q 1.0 0.0 0.995 0.06 L 0.885 0.94 Q 0.88 1.0 0.80 1.0 L 0.08 1.0 Q 0 1.0 0 0.94 L 0 0.06 Q 0 0 0.08 0 Z" 
                fill="none" 
                stroke="rgba(255,255,255,0.25)" 
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* TOP SECTION: Typography Overlaid On Top (Exactly Like Reference) */}
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-extrabold tracking-widest text-emerald-400 uppercase drop-shadow-md">
                  WELCOME TO
                </p>
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight mt-1 leading-tight drop-shadow-md">
                  DiskusiBisnis
                </h1>
                <p className="text-xs sm:text-sm text-slate-200/90 font-medium mt-2.5 leading-relaxed max-w-sm drop-shadow-md">
                  Wadah Kolaborasi, Berbagi Pengalaman & Solusi Pelaku UMKM Indonesia.
                </p>
              </div>

              {/* Logo Badge in Top Right (Like 'N' in reference) */}
              <Link 
                href="/" 
                className="w-12 h-12 sm:w-14 sm:h-14 bg-white/15 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/30 flex items-center justify-center shrink-0 shadow-xl hover:scale-105 transition-transform mr-2 sm:mr-4"
              >
                <img src="/logodiskusibisnisaja.png" alt="DiskusiBisnis" className="w-full h-full object-contain brightness-0 invert" />
              </Link>
            </div>

            {/* BOTTOM SECTION: Social Proof / Community Badge */}
            <div className="relative z-10 mt-auto pt-6 hidden sm:block">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-white/95 shadow-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>5.000+ Pelaku UMKM Telah Bergabung</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM (Full screen centered on mobile, 50% on desktop) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-5 sm:px-8 lg:px-16 xl:px-24 py-8 min-h-screen lg:h-screen lg:overflow-y-auto bg-white dark:bg-slate-900">
        <div className="w-full max-w-sm mx-auto">

          {/* Mobile Header Logo (Only on mobile < lg) */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl p-2 flex items-center justify-center shadow-md">
                <img src="/logodiskusibisnisaja.png" alt="DiskusiBisnis" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DiskusiBisnis</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Masuk ke Akun
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Silakan masukkan email dan kata sandi Anda.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 animate-in fade-in">
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
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium transition-all"
                  placeholder="nama@email.com"
                />
              </div>
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
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium transition-all"
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
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-emerald-600/20"
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
  )
}
