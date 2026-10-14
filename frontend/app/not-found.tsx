import Link from 'next/link';
import { Home } from 'lucide-react';
import NotFoundAnimation from '@/components/ui/NotFoundAnimation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-sm text-center flex flex-col items-center">
        {/* Lottie Animation */}
        <NotFoundAnimation />

        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 mb-2">
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-all shadow-sm active:scale-[0.98] text-sm"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
