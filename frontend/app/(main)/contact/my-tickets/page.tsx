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
  open: 'bg-yellow-100 text-yellow-700',
  replied: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',
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
      setError('Gagal mengambil data tiket');
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


  // Mobile: Show detail view
  if (showDetail && selectedTicket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => setShowDetail(false)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Tiket
        </button>

        {/* Ticket Detail Card */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded">
                {selectedTicket.ticket_number}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[selectedTicket.status]}`}
              >
                {statusLabels[selectedTicket.status]}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{selectedTicket.subject}</h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(selectedTicket.created_at)}
            </p>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Original Message */}
            <div className="bg-slate-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {selectedTicket.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{selectedTicket.name}</p>
                  <p className="text-xs text-slate-500">Pesan Anda</p>
                </div>
              </div>
              <p className="text-slate-700 text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
            </div>

            {/* Replies */}
            {selectedTicket.replies?.length > 0 ? (
              selectedTicket.replies.map((reply) => {
                const isAdmin = reply.is_admin;
                const senderName = reply.sender_name || 'User';
                return (
                  <div
                    key={reply.id}
                    className={`rounded-xl p-4 border ${
                      isAdmin
                        ? 'bg-emerald-50 border-emerald-100'
                        : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isAdmin ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isAdmin ? 'text-emerald-700' : 'text-blue-700'
                          }`}
                        >
                          {isAdmin ? `${senderName} (Admin)` : senderName}
                        </p>
                        <p
                          className={`text-xs ${isAdmin ? 'text-emerald-600' : 'text-blue-600'}`}
                        >
                          {formatDate(reply.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{reply.message}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Belum ada balasan</p>
                <p className="text-xs mt-1">Tim support akan segera membalas tiket Anda</p>
              </div>
            )}
          </div>

          {/* Reply Form - Only show if ticket is not closed */}
          {selectedTicket.status !== 'closed' ? (
            <div className="p-4 border-t bg-white">
              {successMessage && (
                <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <p className="text-sm font-medium text-slate-700 mb-2">Balas Tiket</p>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Tulis balasan Anda..."
                className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleReply}
                  disabled={!replyMessage.trim() || sending}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Mengirim...' : 'Kirim Balasan'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t bg-slate-50 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <XCircle className="w-4 h-4" />
                <span>Tiket ini sudah ditutup</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Hubungi Kami
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tiket Saya</h1>
            <p className="text-sm text-slate-600">Lihat status dan balasan tiket support Anda</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Masukkan email yang Anda gunakan saat membuat tiket
        </label>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 text-sm"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Mencari...' : 'Cari Tiket'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b bg-slate-50">
            <h2 className="font-semibold text-slate-900">
              {tickets.length > 0 ? `${tickets.length} Tiket Ditemukan` : 'Tidak Ada Tiket'}
            </h2>
          </div>

          {tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Tidak ada tiket dengan email ini</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-emerald-600 hover:underline text-sm mt-3"
              >
                Buat tiket baru
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleViewTicket(ticket.ticket_number)}
                  className="p-4 cursor-pointer hover:bg-slate-50 transition-colors active:bg-slate-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400">
                          {ticket.ticket_number}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}
                        >
                          {statusLabels[ticket.status]}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-900 text-sm truncate">
                        {ticket.subject}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(ticket.created_at)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
