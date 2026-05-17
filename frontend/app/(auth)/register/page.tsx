'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
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

  /* Client-side redirect disabled to fix access issues
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  */

  // Resend cooldown timer
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
        otp: otpCode
      });

      // Set user and token from response
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
      // Handle paste
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (user) return null;

  // OTP Verification Step
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 bg-[#f8fafc] dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl py-10 px-6 sm:px-10 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] border border-white dark:border-slate-800/50">
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Kembali</span>
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/20">
                <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Verifikasi Email</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
                Masukkan kode 6 digit yang dikirim ke
              </p>
              <p className="font-bold text-slate-900 dark:text-white mt-1">{formData.email}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-8">
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
                  className="w-12 h-14 text-center text-2xl font-black border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-4 px-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/25 hover:bg-emerald-700 dark:hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Verifikasi Akun</span>
                </>
              )}
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Tidak menerima kode?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-slate-400 font-bold ml-1">Kirim ulang dalam {resendCooldown}s</span>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-emerald-600 dark:text-emerald-400 font-black hover:text-emerald-700 transition-colors ml-1"
                  >
                    Kirim Ulang
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form Step
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 bg-[#f8fafc] dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Background Elements - Subtle Spotlight */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <div className="w-16 h-16 mx-auto mb-6 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-xl shadow-emerald-500/10 p-4 flex items-center justify-center group-hover:scale-105 transition-all duration-500 ring-1 ring-slate-100 dark:ring-slate-800">
              <img src="/logodiskusibisnisaja.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gabung Komunitas</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Mulai perjalanan bisnis Anda sekarang.</p>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl py-10 px-6 sm:px-10 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] border border-white dark:border-slate-800/50">
          {error && (
            <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRequestOTP}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full pl-10 pr-4 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 font-medium text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Username</label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className="w-full pl-8 pr-4 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 font-medium text-sm"
                    placeholder="username"
                    minLength={3}
                    maxLength={30}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 font-medium text-sm"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 font-medium text-sm"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-bold text-base shadow-xl shadow-emerald-500/25 hover:bg-emerald-700 dark:hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Minta Kode OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 font-medium">Atau daftar dengan</span>
              </div>
            </div>

            <div className="mt-8">
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Gagal daftar dengan Google')}
                text="Lanjutkan dengan Google"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-black hover:text-emerald-700 transition-colors ml-1">
                Masuk Sekarang
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] leading-relaxed">
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="/terms" className="text-emerald-600/70 dark:text-emerald-400/70 hover:text-emerald-600 transition-colors underline decoration-2 underline-offset-4">Syarat & Ketentuan</Link>
            {' '}kami.
          </p>
        </div>
      </div>
    </div>
  );
}
