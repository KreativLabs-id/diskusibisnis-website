'use client';

import { useState } from 'react';
import { supportAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Mail, Send, CheckCircle, MessageSquare, HelpCircle, Bug, Lightbulb, Inbox } from 'lucide-react';
import AlertModal from '@/components/ui/AlertModal';

const categories = [
  { value: 'general', label: 'Pertanyaan Umum', icon: HelpCircle },
  { value: 'bug', label: 'Laporan Bug', icon: Bug },
  { value: 'feature', label: 'Saran Fitur', icon: Lightbulb },
  { value: 'account', label: 'Masalah Akun', icon: MessageSquare },
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

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showAlert('warning', 'Form Tidak Lengkap', 'Mohon lengkapi semua field yang diperlukan');
      return;
    }

    setSubmitting(true);
    try {
      const response = await supportAPI.createTicket(formData);
      setTicketNumber(response.data.data.ticketNumber);
      setSubmitted(true);
    } catch (error: any) {
      showAlert('error', 'Gagal Mengirim', error.response?.data?.message || 'Terjadi kesalahan saat mengirim tiket');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Tiket Berhasil Dikirim!</h1>
          <p className="text-slate-600 mb-4">
            Terima kasih telah menghubungi kami. Tim support akan segera membalas pesan Anda.
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-600 mb-1">Nomor Tiket Anda:</p>
            <p className="text-xl font-bold text-emerald-600 font-mono">{ticketNumber}</p>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Kami telah mengirimkan email konfirmasi ke <strong>{formData.email}</strong>. 
            Anda akan menerima notifikasi email saat ada balasan.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ ...formData, subject: '', message: '' });
            }}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Kirim Tiket Lain
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Hubungi Kami</h1>
        <p className="text-slate-600 mb-4">
          Ada pertanyaan atau masalah? Tim support kami siap membantu Anda.
        </p>
        <Link 
          href="/contact/my-tickets"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <Inbox className="w-4 h-4" />
          Lihat Tiket Saya
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Informasi Kontak</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Email</p>
                  <a href="mailto:support@diskusibisnis.my.id" className="text-sm text-emerald-600 hover:underline">
                    support@diskusibisnis.my.id
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
            <h3 className="font-semibold text-emerald-800 mb-2">💡 Tips</h3>
            <ul className="text-sm text-emerald-700 space-y-2">
              <li>• Jelaskan masalah Anda dengan detail</li>
              <li>• Sertakan langkah-langkah untuk mereproduksi bug</li>
              <li>• Gunakan email yang aktif untuk menerima balasan</li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-6">Kirim Pesan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nama Anda"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      formData.category === cat.value
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subjek <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ringkasan masalah atau pertanyaan Anda"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pesan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                rows={6}
                placeholder="Jelaskan masalah atau pertanyaan Anda secara detail..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Mengirim...' : 'Kirim Pesan'}
            </button>
          </form>
        </div>
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
