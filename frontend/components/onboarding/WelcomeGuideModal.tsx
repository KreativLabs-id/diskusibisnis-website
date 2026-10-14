'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Compass, 
  UserCheck, 
  ShieldCheck, 
  MessageSquare, 
  TrendingUp,
  Award,
  Store
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                           PREVIEW MOCKUP 1 (KOMUNITAS)                     */
/* -------------------------------------------------------------------------- */
function CommunityPreview() {
  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-[11px] ring-1 ring-emerald-500/20 shrink-0">
            HW
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">Hendra Wijaya</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                Roastery Owner
              </span>
            </div>
            <span className="text-[10px] text-slate-400">12 menit lalu • #ManajemenKeuangan</span>
          </div>
        </div>
        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
          Diskusi Hangat
        </span>
      </div>

      <div className="pt-3">
        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
          Cara memisahkan cashflow toko vs kebutuhan dapur pribadi saat omzet mulai tembus 30jt/bulan?
        </p>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          Seringkali uang belanja modal tercampur dengan pengeluaran rumah tangga. Rekomendasi rekening atau metode pembukuan yang paling praktis?
        </p>
      </div>

      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
            ▲ 38 upvote
          </span>
          <span className="flex items-center gap-1">
            💬 14 tanggapan
          </span>
        </div>
        <span className="text-[10px] text-slate-400">Komunitas F&B • Bandung</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           PREVIEW MOCKUP 2 (SOLUSI Q&A)                    */
/* -------------------------------------------------------------------------- */
function SolutionPreview() {
  return (
    <div className="w-full max-w-md space-y-2 select-none">
      {/* Mini Question snippet */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
          Pertanyaan Terkait Legalitas
        </span>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
          Izin edar P-IRT vs BPOM MD untuk sambal kemasan botol kaca rumahan?
        </p>
      </div>

      {/* Verified Answer snippet */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl p-3.5 border border-emerald-500/30 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Solusi Terverifikasi Komunitas</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
            Solutif
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          &ldquo;Jika daya simpan &gt;7 hari pada suhu ruang, mulailah dari P-IRT di Dinkes via OSS. Pengurusan gratis dan wajib ikut PKP.&rdquo;
        </p>
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-emerald-500/15 text-[10px] text-emerald-800/80 dark:text-emerald-300/80">
          <span>Oleh @bambang_pangan (Praktisi Mutu)</span>
          <span className="font-semibold">▲ 82 Bermanfaat</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           PREVIEW MOCKUP 3 (REPUTASI)                      */
/* -------------------------------------------------------------------------- */
function ReputationPreview() {
  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
            DL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">Dewi Lestari</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                Level 3: Mentor
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Konveksi Apparel • Solo</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-black text-emerald-600 dark:text-emerald-400">450</div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Poin Reputasi</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>Progres ke Master Komunitas</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">75%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full w-3/4" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">18</div>
          <div className="text-[10px] text-slate-400">Solusi Diterima</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">96%</div>
          <div className="text-[10px] text-slate-400">Rating Positif</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-1.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Top 5%</div>
          <div className="text-[10px] text-slate-400">Tekstil & Mode</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           PREVIEW MOCKUP 4 (PROFIL TOKO)                   */
/* -------------------------------------------------------------------------- */
function ProfilePreview() {
  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm select-none">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
          ☕
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">Kopi Seduh Nusantara</h4>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ✓ Profil Lengkap
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            F&B & Supplier Kopi Spesialti • Bandung
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
            Menyediakan roasted beans untuk coffeeshop dengan kapasitas 2 ton/bulan. Terbuka untuk diskusi suplai & B2B.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500">
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          #KopiIndonesia
        </span>
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          #SupplierB2B
        </span>
        <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
          Koneksi Siap Dibuka →
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SLIDE DATA CONFIG                            */
/* -------------------------------------------------------------------------- */
interface SlideConfig {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  points: string[];
  renderPreview: () => React.ReactNode;
}

const SLIDES: SlideConfig[] = [
  {
    tag: '01 • Ruang Komunitas',
    title: 'Wadah Terbuka Pelaku Usaha',
    subtitle: 'Saling bertukar solusi nyata di lapangan.',
    description: 'DiskusiBisnis dirancang agar Anda tidak perlu berjuang sendirian. Temukan kawan diskusi, suplier tepercaya, dan wawasan bisnis yang sudah teruji.',
    points: [
      'Terhubung dengan ribuan pemilik usaha dari beragam sektor',
      'Moderasi aktif: ruang aman bebas dari spam & promosi liar',
    ],
    renderPreview: () => <CommunityPreview />,
  },
  {
    tag: '02 • Tanya Kendala',
    title: 'Tanyakan Apapun Masalah Bisnis Anda',
    subtitle: 'Dari legalitas, suplier, hingga arus kas.',
    description: 'Jangan biarkan kebuntuan menahan kemajuan bisnis. Ajukan pertanyaan seputar perizinan, marketing, pajak, atau operasional kapan saja.',
    points: [
      'Dapatkan tanggapan dari pelaku usaha yang pernah di posisi Anda',
      'Tandai jawaban terbaik agar menjadi referensi utama anggota lain',
    ],
    renderPreview: () => <SolutionPreview />,
  },
  {
    tag: '03 • Sistem Reputasi',
    title: 'Bantu Rekan Lain, Bangun Kredibilitas',
    subtitle: 'Setiap kontribusi positif diapresiasi.',
    description: 'Jawaban yang solutif menaikkan poin reputasi Anda di komunitas. Bangun portofolio dan tingkatkan kepercayaan calon mitra pada bisnis Anda.',
    points: [
      'Poin reputasi meningkat dari setiap upvote dan solusi terpilih',
      'Raih lencana spesialisasi yang tampil di profil bisnis Anda',
    ],
    renderPreview: () => <ReputationPreview />,
  },
  {
    tag: '04 • Profil Usaha',
    title: 'Siap Memulai Langkah Bisnis Hari Ini?',
    subtitle: 'Lengkapi profil agar bisnis Anda dikenal.',
    description: 'Akun Anda sudah aktif sepenuhnya. Tambahkan nama brand, lokasi, dan kategori usaha Anda agar mudah ditemukan oleh calon pelanggan & rekan kolaborasi.',
    points: [
      'Tampilkan identitas brand dan keahlian produk Anda',
      'Mulai ajukan pertanyaan pertama atau jawab topik hangat hari ini',
    ],
    renderPreview: () => <ProfilePreview />,
  },
];

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */
export default function WelcomeGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Storage key is user-specific so new accounts each get onboarding
  const getStorageKey = useCallback(() => {
    return user ? `db_onboarding_completed_${user.id}` : null;
  }, [user]);

  // Check if onboarding should be shown
  useEffect(() => {
    if (authLoading) return;

    // Do NOT show on auth pages
    const isAuthPage = 
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password');

    if (isAuthPage) {
      setIsOpen(false);
      return;
    }

    // Allow manual trigger via URL query: ?tour=true
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tour') === 'true') {
        setCurrentStep(0);
        setIsOpen(true);
        return;
      }
    }

    // If logged in, check if already completed
    if (user) {
      const storageKey = getStorageKey();
      if (storageKey) {
        const hasCompleted = localStorage.getItem(storageKey);
        if (!hasCompleted) {
          // Delay briefly to allow initial page render to settle smoothly
          const timer = setTimeout(() => {
            setCurrentStep(0);
            setIsOpen(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [user, authLoading, pathname, getStorageKey]);

  // Listen for custom trigger event (e.g. from help menu or settings)
  useEffect(() => {
    const handleOpen = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener('open-welcome-guide', handleOpen);
    return () => window.removeEventListener('open-welcome-guide', handleOpen);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = (markCompleted = true) => {
    if (markCompleted && user) {
      const storageKey = getStorageKey();
      if (storageKey) {
        localStorage.setItem(storageKey, 'true');
      }
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < SLIDES.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGoToProfile = () => {
    handleClose(true);
    if (user?.username) {
      router.push(`/user/${user.username}`);
    } else {
      router.push('/profile');
    }
  };

  // Keyboard navigation: Escape to close, arrows or Enter to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose(true);
      } else if (e.key === 'ArrowRight' || (e.key === 'Enter' && currentStep < SLIDES.length - 1)) {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const currentSlide = SLIDES[currentStep];
  const isLastStep = currentStep === SLIDES.length - 1;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Panduan Pengguna Baru DiskusiBisnis"
    >
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-[620px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Top Linear-style Progress Track */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
              {currentSlide.tag}
            </span>

            <button
              type="button"
              onClick={() => handleClose(true)}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Tutup panduan"
            >
              <span>Tutup</span>
              <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-500">
                ESC
              </kbd>
            </button>
          </div>

          {/* Segmented Progress Bars */}
          <div className="grid grid-cols-4 gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className="group py-1 cursor-pointer focus:outline-none"
                aria-label={`Buka slide ${idx + 1}`}
              >
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'bg-emerald-600 dark:bg-emerald-500'
                      : idx < currentStep
                      ? 'bg-slate-400 dark:bg-slate-600'
                      : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Top Interactive/Visual Preview Stage */}
          <div className="bg-gradient-to-b from-slate-50/90 via-slate-50/50 to-white dark:from-slate-950/70 dark:via-slate-900/40 dark:to-slate-900 px-5 sm:px-8 py-6 sm:py-8 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80 relative min-h-[220px]">
            {/* Subtle radial ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />
            <div className="relative z-10 w-full flex justify-center">
              {currentSlide.renderPreview()}
            </div>
          </div>

          {/* Editorial Content Text */}
          <div className="px-6 sm:px-8 py-5 sm:py-6">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {currentSlide.title}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {currentSlide.subtitle}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {currentSlide.description}
            </p>

            {/* Micro Points List */}
            <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {currentSlide.points.map((point, pIdx) => (
                <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="leading-normal">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {/* Left: Skip tour link */}
          <button
            type="button"
            onClick={() => handleClose(true)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Lewati panduan
          </button>

          {/* Right: Navigation Controls */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            )}

            {isLastStep ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoToProfile}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden sm:inline-flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Profil Saya</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <span>Mulai Jelajah</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>Lanjut</span>
                <span className="opacity-40 text-[10px] font-mono hidden sm:inline">↵</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
