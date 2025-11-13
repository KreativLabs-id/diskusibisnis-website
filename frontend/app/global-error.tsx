'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold text-red-600">!</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Terjadi Kesalahan
              </h1>
              <p className="text-slate-600">
                Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Coba Lagi
              </button>
              
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
