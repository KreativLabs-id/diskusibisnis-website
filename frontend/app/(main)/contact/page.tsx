'use client';

import { useState } from 'react';
import { supportAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Send, CheckCircle, HelpCircle, Bug, Lightbulb, MessageSquare, ArrowRight } from 'lucide-react';
import AlertModal from '@/components/ui/AlertModal';

const categories = [
  {
    value: 'general',
    label: 'Umum',
    description: 'Pertanyaan seputar platform',
    icon: HelpCircle,
  },
  {
    value: 'bug',
    label: 'Lapor Bug',
    description: 'Kendala teknis atau error',
    icon: Bug,
  },
  {
    value: 'feature',
    label: 'Saran Fitur',
    description: 'Ide untuk kemajuan platform',
    icon: Lightbulb,
  },
  {
    value: 'account',
    label: 'Masalah Akun',
    description: 'Login, profil, atau keamanan',
    icon: MessageSquare,
  },
];

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showAlert('warning', 'Form Tidak Lengkap', 'Mohon lengkapi semua field');
      return;
    }

    setSubmitting(true);
    try {
      const response = await supportAPI.createTicket(formData);
      setTicketNumber(response.data.data.ticketNumber);
      setSubmitted(true);
    } catch (error: any) {
      showAlert(
        'error',
        'Gagal Mengirim',
        error.response?.data?.message || 'Terjadi kesalahan'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Tiket Terkirim</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Kami akan membalas ke <span className="font-semibold text-slate-900">{formData.email}</span>
          </p>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Nomor Tiket</p>
            <p className="text-3xl font-mono font-bold text-slate-900 tracking-tight">{ticketNumber}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/contact/my-tickets"
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              Lihat Status Tiket <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ ...formData, subject: '', message: '' });
              }}
              className="w-full px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Kirim Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Tim kami siap membantu Anda menyelesaikan masalah secepat mungkin.
          </p>
          <Link
            href="/contact/my-tickets"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-full hover:bg-emerald-50 transition-all text-sm font-medium border border-slate-200 hover:border-emerald-200 shadow-sm"
          >
            Cek Status Tiket Saya
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-4">Kategori Masalah</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`flex items-start p-4 rounded-xl border transition-all text-left ${formData.category === cat.value
                      ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <cat.icon className={`w-5 h-5 mr-3 mt-0.5 ${formData.category === cat.value ? 'text-emerald-600' : 'text-slate-400'
                    }`} />
                  <div>
                    <div className={`font-medium ${formData.category === cat.value ? 'text-emerald-900' : 'text-slate-900'
                      }`}>
                      {cat.label}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {cat.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="Nama kamu"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Subjek</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              placeholder="Judul masalah"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Pesan</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none min-h-[150px]"
              placeholder="Jelaskan detail masalah..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {submitting ? 'Mengirim...' : 'Kirim Pesan'}
              {!submitting && <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
}
