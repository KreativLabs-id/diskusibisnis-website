'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error?: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-red-600">!</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Terjadi Kesalahan
          </h1>
          <p className="text-slate-600">
            Maaf, terjadi kesalahan yang tidak terduga.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Coba Lagi
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            🏠 Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
