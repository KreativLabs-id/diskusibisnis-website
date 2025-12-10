'use client';

import Link from 'next/link';
import { Plus, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function FloatingActionButton() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't show FAB on question detail pages (they have their own answer FAB)
  const isQuestionDetailPage = pathname?.includes('/questions/') && pathname.split('/').length > 3;

  // Don't show on auth pages
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');

  // Hide on question detail pages and auth pages
  if (isQuestionDetailPage || isAuthPage) return null;

  // Don't render during loading to prevent flicker
  if (loading) return null;

  // For logged in users - show "Ask Question" button
  if (user) {
    return (
      <Link
        href="/ask"
        className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center group"
        title="Tanya Pertanyaan"
      >
        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </Link>
    );
  }

  // For guest users - show "Login to Ask" button
  return (
    <Link
      href="/login"
      className="fixed bottom-6 right-6 z-50 md:hidden flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 group"
      title="Login untuk Bertanya"
    >
      <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="text-sm font-semibold">Login</span>
    </Link>
  );
}

