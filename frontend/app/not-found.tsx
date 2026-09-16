import Link from 'next/link';
import { Home, Compass, ArrowLeft, Search } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md text-center">
        
        {/* Minimalist Icon */}
        <div className="mx-auto mb-6 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Compass className="w-12 h-12 opacity-80" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm sm:text-base">
          Maaf, halaman yang Anda cari tidak dapat ditemukan, telah dipindahkan, atau Anda tidak memiliki akses ke halaman ini.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98] text-sm"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>
          
          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 w-full sm:w-auto py-2.5 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-bold transition-all active:scale-[0.98] text-sm"
          >
            <Search className="w-4 h-4" />
            Eksplorasi
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Butuh bantuan?{' '}
            <Link href="/bantuan" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline decoration-emerald-500/30 underline-offset-4">
              Pusat Bantuan
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
