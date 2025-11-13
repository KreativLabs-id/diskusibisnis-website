'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function FloatingActionButton() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Don't show FAB on question detail pages (they have their own answer FAB)
  const isQuestionDetailPage = pathname?.includes('/questions/') && pathname.split('/').length > 3;

  // Only show FAB for logged in users on mobile, not on question detail pages
  if (!user || isQuestionDetailPage) return null;

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
