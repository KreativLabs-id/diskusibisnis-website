'use client';

import { useEffect, useState } from 'react';
import { supportAPI } from '@/lib/api';
import { 
  Shield, Clock, CheckCircle, AlertCircle, 
  MessageSquare, Send, Trash, 
  Inbox, Reply, XCircle, AlertTriangle
} from 'lucide-react';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Ticket {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  replies?: Reply[];
}

interface Reply {
  id: string;
  sender_name: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

const statusColors: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-700',
  replied: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',
};

const statusLabels: Record<string, string> = {
  open: 'Baru',
  replied: 'Dibalas',
  in_progress: 'Diproses',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

export default function AdminReportsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportAPI.getTickets({ status: statusFilter, category: 'report' });
      setTickets(response.data.data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (id: string) => {
    try {
      const response = await supportAPI.getTicketById(id);
      setSelectedTicket(response.data.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    
    setSending(true);
    try {
      await supportAPI.replyToTicket(selectedTicket.id, replyMessage);
      showAlert('success', 'Berhasil', 'Balasan berhasil dikirim ke email pengguna');
      setReplyMessage('');
      fetchTicketDetail(selectedTicket.id);
      fetchTickets();
    } catch (error) {
      showAlert('error', 'Gagal', 'Gagal mengirim balasan');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    
    try {
      await supportAPI.updateStatus(selectedTicket.id, status);
      showAlert('success', 'Berhasil', 'Status laporan berhasil diperbarui');
      fetchTicketDetail(selectedTicket.id);
      fetchTickets();
    } catch (error) {
      showAlert('error', 'Gagal', 'Gagal memperbarui status');
    }
  };

  const handleDelete = (ticket: Ticket) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Laporan',
      message: `Apakah Anda yakin ingin menghapus laporan ${ticket.ticket_number}?`,
      onConfirm: async () => {
        try {
          await supportAPI.deleteTicket(ticket.id);
          showAlert('success', 'Berhasil', 'Laporan berhasil dihapus');
          setSelectedTicket(null);
          fetchTickets();
        } catch (error) {
          showAlert('error', 'Gagal', 'Gagal menghapus laporan');
        }
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Laporan & Moderasi</h1>
            <p className="text-slate-600 dark:text-slate-400">Kelola laporan konten dari pengguna</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report List */}
        <div className="lg:col-span-1 bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Daftar Laporan
            </h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border rounded-lg px-2 py-1"
            >
              <option value="all">Semua</option>
              <option value="open">Baru</option>
              <option value="replied">Dibalas</option>
              <option value="in_progress">Diproses</option>
              <option value="resolved">Selesai</option>
              <option value="closed">Ditutup</option>
            </select>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Memuat...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada laporan</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => fetchTicketDetail(ticket.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500">{ticket.ticket_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900 text-sm line-clamp-1">{ticket.subject}</h3>
                  <p className="text-xs text-slate-500 mt-1.5">{ticket.name} • {ticket.email}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Report Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-slate-500">{selectedTicket.ticket_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedTicket.status]}`}>
                        {statusLabels[selectedTicket.status]}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedTicket.subject}</h2>
                    <p className="text-sm text-slate-600 mt-2">
                      Dari: <strong>{selectedTicket.name}</strong> ({selectedTicket.email})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="text-sm border rounded-lg px-3 py-1.5"
                    >
                      <option value="open">Baru</option>
                      <option value="replied">Dibalas</option>
                      <option value="in_progress">Diproses</option>
                      <option value="resolved">Selesai</option>
                      <option value="closed">Ditutup</option>
                    </select>
                    <button
                      onClick={() => handleDelete(selectedTicket)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 max-h-[350px] overflow-y-auto space-y-4">
                {/* Original Message */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {selectedTicket.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{selectedTicket.name}</p>
                      <p className="text-xs text-slate-500">{formatDate(selectedTicket.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((reply) => {
                  const senderName = reply.sender_name || 'User';
                  return (
                    <div
                      key={reply.id}
                      className={`rounded-lg p-4 ${
                        reply.is_admin ? 'bg-red-50 ml-8' : 'bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            reply.is_admin ? 'bg-red-500' : 'bg-slate-500'
                          }`}
                        >
                          {reply.is_admin ? (
                            <Shield className="w-4 h-4" />
                          ) : (
                            senderName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-medium text-sm ${
                              reply.is_admin ? 'text-red-700' : 'text-slate-700'
                            }`}
                          >
                            {senderName} {reply.is_admin && '(Admin)'}
                          </p>
                          <p
                            className={`text-xs ${reply.is_admin ? 'text-red-600' : 'text-slate-600'}`}
                          >
                            {formatDate(reply.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t bg-slate-50">
                <p className="text-xs font-medium text-slate-500 mb-3">Aksi Cepat:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.status !== 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Tandai Diproses
                    </button>
                  )}
                  {selectedTicket.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Tandai Selesai
                    </button>
                  )}
                  {selectedTicket.status !== 'closed' && (
                    <button
                      onClick={() => handleUpdateStatus('closed')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Tutup Laporan
                    </button>
                  )}
                  {selectedTicket.status === 'closed' && (
                    <button
                      onClick={() => handleUpdateStatus('open')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Buka Kembali
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedTicket)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    Hapus Laporan
                  </button>
                </div>
              </div>

              {/* Reply Form */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Reply className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Tanggapi Pelapor</span>
                  </div>
                </div>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Tulis tanggapan Anda... (akan dikirim ke email pelapor)"
                  className="w-full border rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                />
                <div className="flex items-center justify-end mt-2">
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || sending}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Mengirim...' : 'Kirim Tanggapan'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-slate-500">
              <div>
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Pilih laporan untuk melihat detail</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
      />
    </div>
  );
}
