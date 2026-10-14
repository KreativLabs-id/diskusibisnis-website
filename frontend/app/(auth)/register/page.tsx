'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Eye, EyeOff, ArrowLeft, Check, CheckCircle2, Mail, Lock, User, AtSign, X } from 'lucide-react';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import api from '@/lib/api';

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    username: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [usernameMessage, setUsernameMessage] = useState<string>('');
  const { googleLogin, user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Real-time debounced username availability check
  useEffect(() => {
    const raw = formData.username.trim();

    if (!raw) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    if (raw.length < 3) {
      setUsernameStatus('unavailable');
      setUsernameMessage('Minimal 3 karakter');
      return;
    }

    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(raw)) {
      setUsernameStatus('unavailable');
      setUsernameMessage('Hanya huruf kecil, angka, dan underscore');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('');

    const timer = setTimeout(async () => {
      try {
        const response = await api.get(`/auth/check-username/${encodeURIComponent(raw)}`);
        const { available, message } = response.data.data;
        if (available) {
          setUsernameStatus('available');
          setUsernameMessage(message || 'Username tersedia');
        } else {
          setUsernameStatus('unavailable');
          setUsernameMessage(message || 'Username sudah digunakan');
        }
      } catch (err: any) {
        setUsernameStatus('idle');
        setUsernameMessage('');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (usernameStatus === 'checking') {
      setError('Sedang memeriksa ketersediaan username...');
      return;
    }

    if (usernameStatus === 'unavailable') {
      setError(usernameMessage || 'Username tidak tersedia, silakan pilih username lain');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register/request-otp', formData);
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal mengirim OTP';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Masukkan 6 digit kode OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register/verify-otp', {
        email: formData.email,
        otp: otpCode,
      });

      const { user: userData, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      updateUser(userData);

      router.push('/');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Kode OTP salah';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register/request-otp', formData);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, '');
      setOtp(newOtp);
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credential);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal daftar dengan Google');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-900 overflow-y-auto lg:overflow-hidden">
      
      {/* Hidden SVG Definitions for Custom Slanted Card Shape */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <clipPath id="slantedHeroCardRegister" clipPathUnits="objectBoundingBox">
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
            style={{ WebkitClipPath: 'url(#slantedHeroCardRegister)', clipPath: 'url(#slantedHeroCardRegister)' }}
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

            {/* TOP SECTION: Typography Overlaid On Top */}
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-extrabold tracking-widest text-emerald-400 uppercase drop-shadow-md">
                  WELCOME TO
                </p>
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight mt-1 leading-tight drop-shadow-md">
                  DiskusiBisnis
                </h1>
                <p className="text-xs sm:text-sm text-slate-200/90 font-medium mt-2.5 leading-relaxed max-w-sm drop-shadow-md">
                  Mulai Langkah Bisnis Anda & Terhubung dengan Ribuan Pelaku UMKM Indonesia.
                </p>
              </div>

              {/* Logo Badge in Top Right */}
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

      {/* RIGHT COLUMN: REGISTER / OTP FORM (Full screen centered on mobile, 50% on desktop) */}
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
          {step === 'otp' ? (
            /* OTP View */
            <div className="animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors mb-4 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Kembali</span>
              </button>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-1.5 tracking-tight">
                Verifikasi Email
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6">
                Masukkan 6 digit kode OTP yang dikirim ke <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.email}</span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* OTP Inputs */}
              <div className="flex justify-between gap-2 mb-5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 sm:w-12 h-12 sm:h-13 text-center text-lg sm:text-xl font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi & Selesai</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tidak menerima kode?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-slate-400 font-medium ml-0.5">Kirim ulang ({resendCooldown}s)</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline ml-0.5"
                    >
                      Kirim Ulang
                    </button>
                  )}
                </p>
              </div>
            </div>
          ) : (
            /* Register Form View */
            <div className="animate-in fade-in duration-200">
              <div className="text-center lg:text-left mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Gabung Bersama Kami
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Buat akun untuk mulai berdiskusi dan berjejaring.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form className="space-y-3" onSubmit={handleRequestOTP}>
                {/* Full Name & Username (1 Col on mobile, 2 Cols on sm+) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-8 pr-2.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium transition-all"
                        placeholder="Nama Lengkap"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <AtSign className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className={`w-full bg-slate-50 dark:bg-slate-800/80 border rounded-xl pl-8 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium transition-all ${
                          usernameStatus === 'available'
                            ? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : usernameStatus === 'unavailable'
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-slate-200 dark:border-slate-700/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        }`}
                        placeholder="username"
                        minLength={3}
                        maxLength={30}
                      />
                      {usernameStatus === 'checking' && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          <div className="w-3.5 h-3.5 border-2 border-slate-300 dark:border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                      )}
                      {usernameStatus === 'available' && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-in fade-in zoom-in-75 duration-150">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      )}
                      {usernameStatus === 'unavailable' && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500 flex items-center justify-center animate-in fade-in zoom-in-75 duration-150">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                    {usernameMessage && (
                      <p className={`mt-1 text-[10px] font-medium transition-all ${
                        usernameStatus === 'available' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        {usernameMessage}
                      </p>
                    )}
                  </div>
                </div>

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
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium transition-all"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium transition-all"
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
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    Minimal 6 karakter, kombinasi huruf & angka disarankan.
                  </p>
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
                      <span>Daftar Sekarang</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Login Link */}
              <div className="mt-3.5 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline ml-0.5">
                    Masuk
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

              {/* Google Sign Up */}
              <div>
                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Gagal daftar dengan Google')}
                  text="Daftar dengan Google"
                  disabled={loading}
                />
              </div>

              {/* Terms Disclaimer */}
              <div className="mt-5 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                  Dengan mendaftar, Anda menyetujui{' '}
                  <Link href="/syarat" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    Ketentuan
                  </Link>{' '}
                  &{' '}
                  <Link href="/privasi" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    Privasi
                  </Link>{' '}
                  DiskusiBisnis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
