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
    <aside className="w-full lg:w-80 shrink-0">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
              <UserAvatar
                src={profile.avatarUrl}
                alt={profile.displayName}
                size="xl"
                fallbackName={profile.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm">
                <VerifiedBadge isVerified={true} size="sm" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              {profile.displayName}
            </h1>
            {profile.username && (
              <p className="text-slate-500 dark:text-slate-400 text-sm truncate font-medium">
                @{profile.username}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-5 line-clamp-3 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-6 mb-5">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{profile.reputationPoints}</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Reputasi</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.questionsCount}</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Diskusi</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.answersCount}</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Jawaban</span>
          </div>
        </div>

        {/* Progress Bar (Reputation) */}
        <div className="mb-5">
          <ReputationProgress reputationPoints={profile.reputationPoints} />
        </div>

        {/* Additional Info */}
        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Bergabung {new Date(profile.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })}</span>
          </div>
          {profile.email && isOwnProfile && (
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{profile.email}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {isOwnProfile && (
          <div className="mt-5">
            <Link
              href="/settings"
              className="flex items-center justify-center w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Edit Profil
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
