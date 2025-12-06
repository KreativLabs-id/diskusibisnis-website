'use client';

import { useState } from 'react';
import { supportAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Send, CheckCircle, HelpCircle, Bug, Lightbulb, MessageSquare, ArrowRight } from 'lucide-react';
import AlertModal from '@/components/ui/AlertModal';

const categories = [
  { value: 'general', label: 'Umum', icon: HelpCircle },
  { value: 'bug', label: 'Bug', icon: Bug },
  { value: 'feature', label: 'Saran', icon: Lightbulb },
  { value: 'account', label: 'Akun', icon: MessageSquare },
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
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Tiket Terkirim</h1>
          <p className="text-slate-500 text-sm mb-6">
            Kami akan membalas ke {formData.email}
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-slate-500 mb-1">Nomor Tiket</p>
            <p className="text-lg font-mono font-bold text-slate-900">{ticketNumber}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ ...formData, subject: '', message: '' });
              }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
            >
              Kirim Lagi
            </button>
            <Link
              href="/contact/my-tickets"
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Lihat Tiket
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Hubungi Kami</h1>
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">Ada masalah? Kami siap bantu.</p>
          <Link
            href="/contact/my-tickets"
            className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Tiket Saya <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Nama</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Nama kamu"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="email@example.com"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Kategori</label>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  formData.category === cat.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Subjek</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder="Ringkasan masalah"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Pesan</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
            rows={5}
            placeholder="Jelaskan masalah kamu..."
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Mengirim...' : 'Kirim'}
        </button>

        {/* Footer note */}
        <p className="text-xs text-slate-400 text-center">
          Atau email langsung ke{' '}
          <a href="mailto:support@diskusibisnis.my.id" className="text-emerald-600 hover:underline">
            support@diskusibisnis.my.id
          </a>
        </p>
      </form>

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
