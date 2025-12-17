'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { Users, MessageSquare, BarChart3, Shield, AlertTriangle, CheckCircle, Mail, Bell } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  users: number;
  questions: number;
  answers: number;
  tags: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      fetchStats();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-600 mb-6">
          Anda memerlukan hak akses admin untuk mengakses halaman ini.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          🏠 Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <p className="text-slate-600">Kelola platform DiskusiBisnis</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Pengguna</p>
              <p className="text-2xl font-bold text-slate-900">
                {statsLoading ? '...' : stats?.users || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Pertanyaan</p>
              <p className="text-2xl font-bold text-slate-900">
                {statsLoading ? '...' : stats?.questions || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Jawaban</p>
              <p className="text-2xl font-bold text-slate-900">
                {statsLoading ? '...' : stats?.answers || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Tag</p>
              <p className="text-2xl font-bold text-slate-900">
                {statsLoading ? '...' : stats?.tags || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Link
          href="/admin/users"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Kelola Pengguna</h3>
              <p className="text-sm text-slate-600">Lihat, blokir, dan kelola akun pengguna</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/questions"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Kelola Pertanyaan</h3>
              <p className="text-sm text-slate-600">Tinjau dan moderasi pertanyaan</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/communities"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Kelola Komunitas</h3>
              <p className="text-sm text-slate-600">Blokir/buka blokir komunitas dan pantau aktivitas</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-red-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Laporan</h3>
              <p className="text-sm text-slate-600">Tangani laporan pengguna dan pelanggaran</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/support"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Support Tickets</h3>
              <p className="text-sm text-slate-600">Kelola tiket bantuan dari pengguna</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/newsletter"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-pink-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Newsletter</h3>
              <p className="text-sm text-slate-600">Kirim newsletter ke semua subscriber</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/notifications"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-yellow-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Broadcast</h3>
              <p className="text-sm text-slate-600">Kirim notifikasi sistem ke semua pengguna</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
