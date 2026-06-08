'use client';

import { useEffect, useState } from 'react';
import { userAPI } from '@/lib/api';
import UserAvatar from '@/components/ui/UserAvatar';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { Award, Trophy, Medal, Star, ChevronRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getProfileHref } from '@/lib/profile';
import { cn, formatNumber } from '@/lib/utils';

export default function LeaderboardPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userAPI.getAll({ limit: 50 });
                setUsers(response.data?.data?.users || response.data?.users || []);
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20">
                <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14">
                    <div className="animate-pulse">
                        {/* Header Skeleton */}
                        <div className="mb-4 sm:mb-6 flex flex-col items-center md:items-start">
                            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 mb-4"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-96 max-w-full"></div>
                        </div>

                        {/* Podium Skeleton */}
                        <div className="mb-12 pt-6 sm:pt-8 flex items-end justify-center gap-2 sm:gap-6 overflow-visible">
                            {[2, 1, 3].map((rank) => (
                                <div key={rank} className="flex flex-col items-center w-28 sm:w-48">
                                    {/* Icon */}
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-3 sm:mb-4"></div>
                                    {/* Avatar */}
                                    <div className={`rounded-full bg-slate-200 dark:bg-slate-800 mb-3 sm:mb-5 ${rank === 1 ? 'w-24 h-24 sm:w-32 sm:h-32' : 'w-16 h-16 sm:w-24 sm:h-24'}`}></div>
                                    {/* Details */}
                                    <div className="w-full flex flex-col items-center px-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-2"></div>
                                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16 mb-4 sm:mb-6"></div>
                                    </div>
                                    {/* Podium Step */}
                                    <div className={`w-full rounded-t-2xl sm:rounded-t-[2rem] bg-slate-200 dark:bg-slate-800 ${rank === 1 ? 'h-32 sm:h-44' : rank === 2 ? 'h-24 sm:h-32' : 'h-20 sm:h-28'}`}></div>
                                </div>
                            ))}
                        </div>

                        {/* List Skeleton */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex items-center justify-between p-4 sm:p-6">
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div className="w-8 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                                <div>
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-2"></div>
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12 mb-1"></div>
                                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-8"></div>
                                            </div>
                                            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const topThree = users.slice(0, 3);
    const restOfUsers = users.slice(3);

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14">
                {/* Professional Minimalist Header - Optimized for Mobile */}
                <div className="mb-4 sm:mb-6 text-center md:text-left">
                    <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Leaderboard Kontributor
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
                        Apresiasi bagi para penggerak ekosistem yang paling aktif berbagi wawasan.
                    </p>
                </div>

                {/* Top 3 Spotlight Podium */}
                {topThree.length > 0 && (
                    <div className="mb-12 pt-6 sm:pt-8 flex items-end justify-center gap-2 sm:gap-6 overflow-visible">
                        {/* Rank 2 */}
                        {topThree[1] && (
                            <PodiumUser user={topThree[1]} rank={2} />
                        )}
                        {/* Rank 1 */}
                        {topThree[0] && (
                            <PodiumUser user={topThree[0]} rank={1} isMain />
                        )}
                        {/* Rank 3 */}
                        {topThree[2] && (
                            <PodiumUser user={topThree[2]} rank={3} />
                        )}
                    </div>
                )}

                {/* List of Other Contributors */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Peringkat & Anggota</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reputasi Poin</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {restOfUsers.length > 0 ? (
            restOfUsers.map((user, index) => (
                <Link
                    key={user.id}
                    href={getProfileHref({ username: user.username, display_name: user.display_name })}
                    className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                >
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-8 text-center font-bold text-slate-300 dark:text-slate-700 text-lg group-hover:text-emerald-500 transition-colors">
                            {index + 4}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <UserAvatar
                                    src={user.avatar_url}
                                    alt={user.display_name}
                                    fallbackName={user.display_name}
                                    size="md"
                                />
                                {user.is_verified && (
                                    <div className="absolute -bottom-1 -right-1">
                                        <VerifiedBadge isVerified={true} size="sm" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {user.display_name}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                    Bergabung {new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1 group-hover:text-emerald-600 transition-colors">
                                {formatNumber(user.reputation_points)}
                            </div>
                            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">poin</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="inline-flex w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                                    <Award className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada data kontributor tambahan.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Encouragement Footer */}
                <div className="mt-16 sm:mt-20 p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-sm">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[100px]" />
                    <div className="relative z-10 max-w-lg">
                        <h3 className="text-xl sm:text-2xl font-bold mb-2">Ingin nama Anda ada di sini?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Mulai berdiskusi, jawab pertanyaan, dan kumpulkan reputasi untuk menjadi penggerak utama di komunitas.</p>
                    </div>
                    <Link
                        href="/"
                        className="relative z-10 px-8 py-3.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-emerald-700 dark:hover:bg-emerald-400 flex items-center gap-2 whitespace-nowrap transition-all"
                    >
                        Mulai Berkontribusi
                    </Link>
                </div>
            </div>
        </div>
    );
}

function PodiumUser({ user, rank, isMain }: { user: any, rank: number, isMain?: boolean }) {
    const rankColors = {
        1: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-600 dark:text-yellow-500',
        2: 'from-slate-400/20 to-slate-400/5 border-slate-400/30 text-slate-500 dark:text-slate-400',
        3: 'from-amber-700/20 to-amber-700/5 border-amber-700/30 text-amber-800 dark:text-amber-600',
    }[rank as 1 | 2 | 3];

    const Icon = rank === 1 ? Trophy : rank === 2 ? Medal : Star;
    const heightClass = rank === 1 ? 'h-32 sm:h-44' : rank === 2 ? 'h-24 sm:h-32' : 'h-20 sm:h-28';

    return (
        <Link
            href={getProfileHref({ username: user.username, display_name: user.display_name })}
            className="flex flex-col items-center group w-28 sm:w-48 relative transition-transform hover:-translate-y-2 duration-300"
        >
            {/* Rank Icon */}
            <div className={cn("mb-3 sm:mb-4 transition-transform group-hover:scale-110", rank === 1 && "animate-bounce")}>
                <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border", rank === 1 ? "border-yellow-500/30" : rank === 2 ? "border-slate-400/30" : "border-amber-700/30")}>
                    <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", rank === 1 ? "text-yellow-500" : rank === 2 ? "text-slate-400" : "text-amber-700")} />
                </div>
            </div>

            {/* Avatar */}
            <div className="relative mb-3 sm:mb-5">
                <div className={cn("p-1 sm:p-1.5 rounded-full ring-2 bg-white dark:bg-slate-900 transition-all", rank === 1 ? "ring-yellow-500" : rank === 2 ? "ring-slate-300 dark:ring-slate-600" : "ring-amber-700/50")}>
                    <UserAvatar
                        src={user.avatar_url}
                        alt={user.display_name}
                        size={isMain ? "xl" : "lg"}
                        fallbackName={user.display_name}
                    />
                </div>
                {user.is_verified && (
                    <div className="absolute -bottom-1 -right-1">
                        <VerifiedBadge isVerified={true} size={isMain ? "md" : "sm"} />
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="text-center z-10 px-1 w-full">
                <div className={cn("font-bold text-slate-900 dark:text-white truncate w-full group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors", isMain ? "text-base sm:text-lg" : "text-sm sm:text-base")}>
                    {user.display_name}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 mt-1 bg-white/80 dark:bg-slate-900/80 rounded-full py-0.5 px-2.5 w-max mx-auto border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                    <Award className="w-3.5 h-3.5" />
                    {formatNumber(user.reputation_points)}
                </div>
            </div>

            {/* Podium Step */}
            <div className={cn("w-full rounded-t-2xl sm:rounded-t-[2rem] mt-4 sm:mt-6 border-t border-l border-r relative overflow-hidden shadow-lg", heightClass, rankColors.split(' text-')[0])}>
                <div className="absolute inset-0 bg-gradient-to-t opacity-50 dark:opacity-20" />
                <div className="w-full h-full flex justify-center pt-4 sm:pt-6">
                    <span className={cn("font-black text-5xl sm:text-7xl opacity-40 dark:opacity-20", rankColors.split(' text-')[1])}>
                        {rank}
                    </span>
                </div>
            </div>
        </Link>
    );
}
