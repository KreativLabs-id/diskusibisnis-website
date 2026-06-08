'use client';

import { User, Mail, Calendar, MapPin, Link as LinkIcon, Award } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import ReputationBadge, { ReputationProgress } from '@/components/ui/ReputationBadge';
import Link from 'next/link';

interface ProfileSidebarProps {
  profile: {
    id: string;
    displayName: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
    reputationPoints: number;
    createdAt: string;
    isVerified?: boolean;
  };
  isOwnProfile: boolean;
  stats: {
    questionsCount: number;
    answersCount: number;
  };
}

export default function ProfileSidebar({ profile, isOwnProfile, stats }: ProfileSidebarProps) {
  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      {/* Profile Card */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white dark:border-slate-800/60 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto relative">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
            <div className="relative aspect-square bg-white dark:bg-slate-900 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden shadow-2xl">
              <UserAvatar
                src={profile.avatarUrl}
                alt={profile.displayName}
                size="xl"
                fallbackName={profile.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            {profile.isVerified && (
              <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-lg ring-2 ring-emerald-500/20">
                <VerifiedBadge isVerified={true} size="md" />
              </div>
            )}
          </div>
        </div>

        <div className="text-center space-y-1 mb-8 relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {profile.displayName}
          </h1>
          {profile.username && (
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              @{profile.username}
            </p>
          )}
        </div>

        {profile.bio && (
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed text-center mb-8 px-2 relative z-10 font-medium">
            {profile.bio}
          </p>
        )}

        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800/60 relative z-10">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <span>Bergabung {new Date(profile.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</span>
          </div>
          {profile.email && isOwnProfile && (
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <span className="truncate">{profile.email}</span>
            </div>
          )}
        </div>

        {isOwnProfile && (
          <div className="mt-10 relative z-10">
            <Link
              href="/settings"
              className="flex items-center justify-center w-full py-3 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Edit Profil
            </Link>
          </div>
        )}
      </div>

      {/* Stats Card */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white dark:border-slate-800/60 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-6">Statistik Kontribusi</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{profile.reputationPoints}</div>
            <div className="text-[10px] font-bold text-emerald-500 mt-0.5">Reputasi</div>
          </div>
          <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.questionsCount}</div>
            <div className="text-[10px] font-bold text-emerald-500 mt-0.5">Diskusi</div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
           <ReputationProgress reputationPoints={profile.reputationPoints} />
        </div>
      </div>
    </aside>
  );
}
