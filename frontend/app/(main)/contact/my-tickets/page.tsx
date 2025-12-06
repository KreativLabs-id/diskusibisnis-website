'use client';

import { useState } from 'react';
import { supportAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Mail,
  Search,
  Clock,
  MessageSquare,
  Inbox,
  ArrowLeft,
  ChevronRight,
  Send,
  XCircle,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketDetail extends Ticket {
  name: string;
  email: string;
  message: string;
  replies: Array<{
    id: string;
    sender_name: string;
    message: string;
    is_admin: boolean;
    created_at: string;
  }>;
}

const statusColors: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  replied: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusLabels: Record<string, string> = {
  open: 'Menunggu',
  replied: 'Dibalas',
  in_progress: 'Diproses',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      const response = await supportAPI.getMyTickets(email);
      setTickets(response.data.data || []);
      setSearched(true);
      setSelectedTicket(null);
      setShowDetail(false);
    } catch {
      setError('Gagal mengambil data tiket. Pastikan email benar.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticketNumber: string) => {
    setLoading(true);
    setReplyMessage('');
    setSuccessMessage('');
    try {
      const response = await supportAPI.getTicketByNumber(ticketNumber, email);
      setSelectedTicket(response.data.data);
      setShowDetail(true);
    } catch {
      setError('Gagal mengambil detail tiket');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setSending(true);
    setError('');
    try {
      await supportAPI.userReply(selectedTicket.ticket_number, {
        email,
        message: replyMessage,
        name: selectedTicket.name,
      });
      setReplyMessage('');
      setSuccessMessage('Balasan berhasil dikirim!');
      // Refresh ticket detail
      const response = await supportAPI.getTicketByNumber(selectedTicket.ticket_number, email);
      setSelectedTicket(response.data.data);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setError('Gagal mengirim balasan');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Detail View
  if (showDetail && selectedTicket) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Navigation */}
          <button
            onClick={() => setShowDetail(false)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Tiket
          </button>

          <div className="space-y-8">
            {/* Ticket Header */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">{selectedTicket.subject}</h1>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">#{selectedTicket.ticket_number}</span>
                    <span>•</span>
                    <span>{formatDate(selectedTicket.created_at)}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedTicket.category}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selectedTicket.status]}`}>
                  {statusLabels[selectedTicket.status]}
                </div>
              </div>

              <div className="flex items-start gap-4 mt-6">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                  {selectedTicket.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedTicket.name}</p>
                  <p className="text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Replies Thread */}
            <div className="space-y-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Riwayat Percakapan</h3>

              {selectedTicket.replies?.length > 0 ? (
                selectedTicket.replies.map((reply) => {
                  const isAdmin = reply.is_admin;
                  return (
                    <div
                      key={reply.id}
                      className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="shrink-0">
                        {isAdmin ? (
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                      </div>

                      <div className={`flex-1 ${isAdmin ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'justify-end' : ''}`}>
                          <span className={`text-sm font-semibold ${isAdmin ? 'text-emerald-700' : 'text-slate-900'}`}>
                            {reply.sender_name || (isAdmin ? 'Admin Support' : 'User')}
                          </span>
                          <span className="text-xs text-slate-400">{formatDate(reply.created_at)}</span>
                        </div>
                        <div className={`text-slate-700 leading-relaxed whitespace-pre-wrap ${isAdmin ? 'bg-emerald-50/50 p-4 rounded-2xl rounded-tr-none' : 'bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none'}`}>
                          {reply.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 border-y border-slate-200 border-dashed">
                  <p className="text-slate-500">Belum ada balasan.</p>
                </div>
              )}
            </div>

            {/* Reply Box */}
            {selectedTicket.status !== 'closed' ? (
              <div className="pt-6 border-t border-slate-200">
                {successMessage && (
                  <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg flex items-center gap-2 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" /> {successMessage}
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <label className="block text-sm font-semibold text-slate-900 mb-3">Kirim Balasan</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Tulis pesan balasan..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none mb-4"
                  rows={4}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || sending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Kirim Balasan
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <p className="text-slate-500 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Tiket ini sudah ditutup.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Hubungi Kami
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Tiket Saya</h1>
              <p className="text-slate-600">Cek status dan riwayat tiket support Anda</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <Inbox className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="mb-10">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Cari Tiket dengan Email
          </label>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Cari Tiket</span>
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {searched && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-bold text-slate-900 text-lg">
                Riwayat Tiket
              </h2>
              <span className="text-sm text-slate-500">
                {tickets.length} tiket ditemukan
              </span>
            </div>

            {tickets.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Tidak Ada Tiket</h3>
                <p className="text-slate-500 mb-6">Belum ada tiket yang terdaftar dengan email ini.</p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:underline"
                >
                  Buat Tiket Baru <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleViewTicket(ticket.ticket_number)}
                    className="group py-4 cursor-pointer hover:bg-slate-50 -mx-4 px-4 rounded-xl transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                            #{ticket.ticket_number}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColors[ticket.status]}`}>
                            {statusLabels[ticket.status]}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {formatDate(ticket.created_at)}
                          </span>
                          <span className="flex items-center gap-1.5 capitalize">
                            <MessageSquare className="w-4 h-4" />
                            {ticket.category}
                          </span>
                        </div>
                      </div>
                      <div className="self-center">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
