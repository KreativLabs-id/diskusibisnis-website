'use client';

import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
    >
      <ArrowLeft className="w-4 h-4" />
      Kembali ke Halaman Sebelumnya
    </button>
  );
}
