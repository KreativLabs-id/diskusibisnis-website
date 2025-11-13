'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Shield, Users, CheckCircle, XCircle } from 'lucide-react';

export default function AdminTest() {
  const { user, loading } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`/api/debug/user?email=${user?.email}`);
      const data = await response.json();
      if (data.success) {
        setUserInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const updateToAdmin = async () => {
    if (!user?.email) return;
    
    try {
      setUpdating(true);
      const response = await fetch('/api/debug/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          role: 'admin'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setUserInfo(data.data);
        alert('Role updated to admin! Please refresh the page.');
        window.location.reload();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Network error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Please Login First</h1>
        <p className="text-slate-600">You need to login to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Test Page</h1>
        </div>

        {/* Current User Info */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Current User Info</h2>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-slate-600">Email:</span>
                <p className="text-slate-900">{user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Display Name:</span>
                <p className="text-slate-900">{user.displayName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Role (from context):</span>
                <p className="text-slate-900">{user.role}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">User ID:</span>
                <p className="text-slate-900 font-mono text-sm">{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Database User Info */}
        {userInfo && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Database User Info</h2>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-slate-600">Email:</span>
                  <p className="text-slate-900">{userInfo.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Display Name:</span>
                  <p className="text-slate-900">{userInfo.display_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Role (from DB):</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userInfo.role === 'admin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userInfo.role}
                    </span>
                    {userInfo.role === 'admin' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Created:</span>
                  <p className="text-slate-900">{new Date(userInfo.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={fetchUserInfo}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Refresh User Info
          </button>

          {userInfo && userInfo.role !== 'admin' && (
            <button
              onClick={updateToAdmin}
              disabled={updating}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Make Admin'}
            </button>
          )}

          {userInfo && userInfo.role === 'admin' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">You are an admin!</span>
              </div>
              <p className="text-green-700 mt-1">You can now access the admin dashboard at <strong>/admin</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
