'use client';

import { useState, useEffect } from 'react';
import { supportAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
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
  Loader2,
  LogIn,
  RefreshCw
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
  open: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  replied: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  in_progress: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  resolved: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  closed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

const statusLabels: Record<string, string> = {
  open: 'Menunggu',
  replied: 'Dibalas',
  in_progress: 'Diproses',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch tickets when user is available
  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchTickets();
    } else if (!authLoading && !user) {
      setInitialLoading(false);
    }
  }, [user, authLoading]);

  const fetchTickets = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError('');
    try {
      const response = await supportAPI.getMyTickets(user.email);
      setTickets(response.data.data || []);
    } catch {
      setError('Gagal mengambil data tiket');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleViewTicket = async (ticketNumber: string) => {
    if (!user?.email) return;

    setLoading(true);
    setReplyMessage('');
    setSuccessMessage('');
    try {
      const response = await supportAPI.getTicketByNumber(ticketNumber, user.email);
      setSelectedTicket(response.data.data);
      setShowDetail(true);
    } catch {
      setError('Gagal mengambil detail tiket');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || !user?.email) return;

    setSending(true);
    setError('');
    try {
      await supportAPI.userReply(selectedTicket.ticket_number, {
        email: user.email,
        message: replyMessage,
        name: user.displayName || selectedTicket.name,
      });
      setReplyMessage('');
      setSuccessMessage('Balasan berhasil dikirim!');
      // Refresh ticket detail
      const response = await supportAPI.getTicketByNumber(selectedTicket.ticket_number, user.email);
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

  // Show loading while checking auth
  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show login prompt for guests
  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">Tiket Saya</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Silakan login untuk melihat tiket support Anda.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/25"
          >
            <LogIn className="w-5 h-5" />
            Masuk Sekarang
          </Link>
          <div className="mt-6">
            <Link
              href="/contact"
              className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm transition-colors"
            >
              Kembali ke Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Detail View
  if (showDetail && selectedTicket) {
    return (
      <div className="min-h-screen py-8 px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-3xl mx-auto">
          {/* Navigation */}
          <button
            onClick={() => setShowDetail(false)}
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Tiket
          </button>

          <div className="space-y-8">
            {/* Ticket Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{selectedTicket.subject}</h1>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">#{selectedTicket.ticket_number}</span>
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
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm shrink-0">
                  {selectedTicket.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedTicket.name}</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Replies Thread */}
            <div className="space-y-8">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Riwayat Percakapan</h3>

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
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className={`flex-1 ${isAdmin ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'justify-end' : ''}`}>
                          <span className={`text-sm font-semibold ${isAdmin ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                            {reply.sender_name || (isAdmin ? 'Admin Support' : 'User')}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(reply.created_at)}</span>
                        </div>
                        <div className={`text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap ${isAdmin ? 'bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-2xl rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none'}`}>
                          {reply.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 border-y border-slate-200 dark:border-slate-700 border-dashed">
                  <p className="text-slate-500 dark:text-slate-400">Belum ada balasan.</p>
                </div>
              )}
            </div>

            {/* Reply Box */}
            {selectedTicket.status !== 'closed' ? (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                {successMessage && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg flex items-center gap-2 border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" /> {successMessage}
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-800">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Kirim Balasan</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Tulis pesan balasan..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none mb-4 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center border border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Hubungi Kami
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Tiket Saya</h1>
              <p className="text-slate-600 dark:text-slate-400">Riwayat tiket support untuk <span className="font-medium text-slate-900 dark:text-slate-100">{user.email}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTickets}
                disabled={loading}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Inbox className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4 mb-8 flex items-center gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
              Riwayat Tiket
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {tickets.length} tiket
            </span>
          </div>

          {loading && tickets.length === 0 ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Memuat tiket...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Belum Ada Tiket</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Anda belum memiliki tiket support.</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
              >
                Buat Tiket Baru <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleViewTicket(ticket.ticket_number)}
                  className="group py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 -mx-4 px-4 rounded-xl transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                          #{ticket.ticket_number}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColors[ticket.status]}`}>
                          {statusLabels[ticket.status]}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
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
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
