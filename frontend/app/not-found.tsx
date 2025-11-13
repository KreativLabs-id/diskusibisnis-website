import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import BackButton from './components/BackButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-emerald-600">404</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-slate-600">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          
          <BackButton />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Butuh bantuan?{' '}
            <Link href="/help" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Hubungi Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
