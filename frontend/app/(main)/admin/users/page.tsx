'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { Users, Ban, UserX, ArrowLeft, Search, Filter, MoreVertical, CheckCircle, XCircle, Bell } from 'lucide-react';
import Link from 'next/link';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
  reputation_points: number;
  is_banned: boolean;
  is_verified: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    userId: string;
    title: string;
    message: string;
  }>({ isOpen: false, userId: '', title: '', message: '' });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }

    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, loading, router]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      if (isBanned) {
        await adminAPI.unbanUser(userId);
      } else {
        await adminAPI.banUser(userId);
      }
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user ban status:', error);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await adminAPI.deleteUser(userId);
          showAlert('success', 'Success', 'User has been deleted');
          fetchUsers(); // Refresh the list
        } catch (error) {
          console.error('Error deleting user:', error);
          showAlert('error', 'Error', 'Failed to delete user');
        }
      }
    });
  };

  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    try {
      if (isVerified) {
        await adminAPI.unverifyUser(userId);
      } else {
        await adminAPI.verifyUser(userId);
      }
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user verification:', error);
    }
  };

  const handleSendNotification = async () => {
    try {
      await adminAPI.sendNotification(notificationModal.userId, {
        title: notificationModal.title,
        message: notificationModal.message
      });
      showAlert('success', 'Success', 'Notification sent successfully');
      setNotificationModal({ isOpen: false, userId: '', title: '', message: '' });
    } catch (error) {
      console.error('Error sending notification:', error);
      showAlert('error', 'Error', 'Failed to send notification');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'banned' && u.is_banned) ||
      (filterStatus === 'active' && !u.is_banned);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          </div>
        </div>
        <p className="text-slate-600">Manage user accounts, roles, and permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">User</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Reputation</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Verified</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Joined</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-slate-900">{u.display_name}</div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-900">{u.reputation_points}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.is_banned
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {u.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <VerifiedBadge isVerified={u.is_verified} size="sm" />
                        <span className={`text-sm ${u.is_verified ? 'text-blue-600' : 'text-slate-500'}`}>
                          {u.is_verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setNotificationModal({
                            isOpen: true,
                            userId: u.id,
                            title: '',
                            message: ''
                          })}
                          className="p-2 rounded-lg transition-colors hover:bg-yellow-100 text-yellow-600"
                          title="Send Notification"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyUser(u.id, u.is_verified)}
                          className={`p-2 rounded-lg transition-colors ${u.is_verified
                            ? 'hover:bg-orange-100 text-orange-600'
                            : 'hover:bg-blue-100 text-blue-600'
                            }`}
                          title={u.is_verified ? 'Unverify user' : 'Verify user'}
                          disabled={u.role === 'admin'}
                        >
                          {u.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleBanUser(u.id, u.is_banned)}
                          className={`p-2 rounded-lg transition-colors ${u.is_banned
                            ? 'hover:bg-green-100 text-green-600'
                            : 'hover:bg-orange-100 text-orange-600'
                            }`}
                          title={u.is_banned ? 'Unban user' : 'Ban user'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 text-sm text-slate-500">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
      />

      {/* Notification Modal */}
      {notificationModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Send Notification
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Send a push notification to this user.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            type="text"
                            value={notificationModal.title}
                            onChange={(e) => setNotificationModal({ ...notificationModal, title: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Notification Title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Message</label>
                          <textarea
                            value={notificationModal.message}
                            onChange={(e) => setNotificationModal({ ...notificationModal, message: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Notification Message"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSendNotification}
                  disabled={!notificationModal.title || !notificationModal.message}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationModal({ ...notificationModal, isOpen: false })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
