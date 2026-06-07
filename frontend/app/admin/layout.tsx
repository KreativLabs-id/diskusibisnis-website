'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Memuat panel admin...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-sm mx-auto px-6 text-center">
          <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-red-100 dark:border-red-500/20">
            <Shield className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Akses Ditolak</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            Anda memerlukan hak akses admin untuk mengakses panel ini.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
