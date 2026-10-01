'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Eye, EyeOff, ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
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
  const { googleLogin, user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
            <span>Gabung Komunitas Kami</span>
            <span>🤩</span>
          </div>

          <h1 className="text-2xl xl:text-3xl font-bold text-white tracking-tight leading-snug mb-2">
            Mulai Langkah Bisnis Anda
          </h1>
          <p className="text-emerald-50/90 text-xs xl:text-sm leading-relaxed max-w-sm font-normal">
            Ikuti langkah mudah ini untuk membuat akun dan mulai terhubung dengan ribuan pemilik UMKM.
          </p>
        </div>

        {/* Bottom: 3 Stepper Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-2.5 max-w-md">
          {/* Step 1 */}
          <div
            className={`rounded-xl p-3 flex flex-col justify-between min-h-[96px] transition-all ${
              step === 'form'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/15 backdrop-blur-sm border border-white/15 text-white'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'form'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-400 text-slate-900'
              }`}
            >
              {step === 'otp' ? '✓' : '1'}
            </div>
            <p className={`text-xs font-semibold leading-tight mt-2 ${step === 'form' ? 'text-slate-900' : 'text-white'}`}>
              Daftarkan akun
            </p>
          </div>

          {/* Step 2 */}
          <div
            className={`rounded-xl p-3 flex flex-col justify-between min-h-[96px] transition-all ${
              step === 'otp'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/15 backdrop-blur-sm border border-white/15 text-white'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'otp'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/20 text-white'
              }`}
            >
              2
            </div>
            <p className={`text-xs font-semibold leading-tight mt-2 ${step === 'otp' ? 'text-slate-900' : 'text-white/90'}`}>
              Verifikasi identitas
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl p-3 bg-white/15 backdrop-blur-sm border border-white/15 text-white flex flex-col justify-between min-h-[96px] transition-all">
            <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
              3
            </div>
            <p className="text-xs font-medium leading-tight text-white/90 mt-2">
              Mulai diskusi
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

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2 tracking-tight">
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
                    className="w-10 sm:w-12 h-12 sm:h-13 text-center text-lg sm:text-xl font-bold bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-mono"
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-6 tracking-tight">
                Gabung Bersama Kami
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form className="space-y-3" onSubmit={handleRequestOTP}>
                {/* Full Name & Username in 2 Columns */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
                      placeholder="Nama Anda"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl pl-3 pr-7 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
                        placeholder="username"
                        minLength={3}
                        maxLength={30}
                      />
                      {formData.username.length >= 3 && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

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
                    className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
                    placeholder="nama@email.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-xl pl-3.5 pr-10 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
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
                      <span>Lanjutkan</span>
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
