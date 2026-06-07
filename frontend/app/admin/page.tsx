'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import {
  Users, MessageSquare, BarChart3, Shield, AlertTriangle,
  CheckCircle, Mail, Bell, Image as ImageIcon, Megaphone, Users2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface AdminStats {
  users: number;
  questions: number;
  answers: number;
  tags: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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

  const quickActions = [
    {
      href: '/admin/users',
      icon: Users,
      label: 'Kelola Pengguna',
      desc: 'Lihat, blokir, dan kelola akun pengguna',
    },
    {
      href: '/admin/questions',
      icon: MessageSquare,
      label: 'Kelola Pertanyaan',
      desc: 'Tinjau dan moderasi pertanyaan',
    },
    {
      href: '/admin/communities',
      icon: Users2,
      label: 'Kelola Komunitas',
      desc: 'Blokir/buka blokir komunitas',
    },
    {
      href: '/admin/reports',
      icon: AlertTriangle,
      label: 'Laporan',
      desc: 'Tangani laporan dan pelanggaran',
    },
    {
      href: '/admin/support',
      icon: CheckCircle,
      label: 'Support Tickets',
      desc: 'Kelola tiket bantuan dari pengguna',
    },
    {
      href: '/admin/newsletter',
      icon: Mail,
      label: 'Newsletter',
      desc: 'Kirim newsletter ke subscriber',
    },
    {
      href: '/admin/notifications',
      icon: Bell,
      label: 'Broadcast',
      desc: 'Kirim notifikasi sistem',
    },
    {
      href: '/admin/popups',
      icon: ImageIcon,
      label: 'Popup Promo',
      desc: 'Kelola popup promosi aplikasi',
    },
    {
      href: '/admin/announcements',
      icon: Megaphone,
      label: 'Pengumuman',
      desc: 'Kelola banner dan peringatan',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Selamat datang, <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.displayName}</span>
            </p>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Kelola platform DiskusiBisnis dari sini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Pengguna', value: stats?.users, icon: Users },
          { label: 'Total Pertanyaan', value: stats?.questions, icon: MessageSquare },
          { label: 'Total Jawaban', value: stats?.answers, icon: CheckCircle },
          { label: 'Total Tag', value: stats?.tags, icon: BarChart3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {statsLoading ? (
                      <span className="inline-block w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    ) : (
                      (stat.value ?? 0).toLocaleString('id-ID')
                    )}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Menu Admin</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors shrink-0">
                  <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{action.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{action.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
