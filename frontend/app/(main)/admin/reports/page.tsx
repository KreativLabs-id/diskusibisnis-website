'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminReports() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

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
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Reports & Moderation</h1>
          </div>
        </div>
        <p className="text-slate-600">Handle user reports and content moderation</p>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Clock className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Reports System Coming Soon</h2>
        <p className="text-slate-600 mb-6">
          The reporting and moderation system is currently under development. 
          This will include features for handling user reports, content moderation, and automated flagging.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">User Reports</h3>
            <p className="text-sm text-slate-600">Handle reports from users about inappropriate content</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">Auto Moderation</h3>
            <p className="text-sm text-slate-600">Automated content filtering and flagging system</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">Content Actions</h3>
            <p className="text-sm text-slate-600">Take actions on reported content and users</p>
          </div>
        </div>
      </div>
    </div>
  );
}
