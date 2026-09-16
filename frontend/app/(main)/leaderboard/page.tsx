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
                        <div className="mb-12 pt-6 sm:pt-8 flex items-end justify-center gap-4 sm:gap-10 overflow-visible">
                            {[2, 1, 3].map((rank) => (
                                <div key={rank} className="flex flex-col items-center w-24 sm:w-36">
                                    {rank === 1 && <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-800 rounded-full mb-3"></div>}
                                    {/* Avatar */}
                                    <div className={`rounded-full bg-slate-200 dark:bg-slate-800 mb-4 sm:mb-5 ${rank === 1 ? 'w-20 h-20 sm:w-28 sm:h-28' : 'w-16 h-16 sm:w-20 sm:h-20'}`}></div>
                                    {/* Details */}
                                    <div className="w-full flex flex-col items-center px-2 gap-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
                                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
                                    </div>
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
                <div className="mb-8 text-center md:text-left flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Leaderboard Kontributor
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Apresiasi bagi para penggerak ekosistem yang paling aktif berbagi wawasan.
                    </p>
                </div>

                {/* Top 3 Spotlight Podium */}
                {topThree.length > 0 && (
                    <div className="mb-12 pt-6 sm:pt-10 flex items-end justify-center gap-4 sm:gap-12 overflow-visible">
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
    const isGold = rank === 1;
    const isSilver = rank === 2;
    const isBronze = rank === 3;

    return (
        <Link
            href={getProfileHref({ username: user.username, display_name: user.display_name })}
            className="flex flex-col items-center group relative transition-transform hover:-translate-y-1.5 duration-300 w-24 sm:w-36"
        >
            {/* Crown / Rank indicator above */}
            {isGold && (
                <div className="mb-2.5 transform group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-7 h-7 sm:w-9 sm:h-9 text-yellow-500 drop-shadow-md" fill="currentColor" />
                </div>
            )}
            
            {/* Avatar */}
            <div className="relative mb-4 sm:mb-5">
                <div className={cn(
                    "p-1 rounded-full ring-4 transition-all bg-white dark:bg-slate-900",
                    isGold ? "ring-yellow-400 shadow-xl shadow-yellow-500/20" : 
                    isSilver ? "ring-slate-200 dark:ring-slate-700 shadow-lg shadow-slate-400/10" : 
                    "ring-amber-700/40 shadow-lg shadow-amber-600/10"
                )}>
                    <UserAvatar
                        src={user.avatar_url}
                        alt={user.display_name}
                        size={isMain ? "xl" : "lg"}
                        fallbackName={user.display_name}
                    />
                </div>
                
                {/* Rank Badge attached to avatar */}
                <div className={cn(
                    "absolute -bottom-2.5 sm:-bottom-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center font-extrabold rounded-full border-[3px] border-white dark:border-slate-950",
                    isGold ? "w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md text-sm sm:text-base" : 
                    isSilver ? "w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-sm text-xs sm:text-sm" : 
                    "w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm text-xs sm:text-sm"
                )}>
                    {rank}
                </div>
            </div>

            {/* Details */}
            <div className="text-center mt-1 sm:mt-2 px-1 w-full">
                <div className={cn("font-bold text-slate-900 dark:text-white truncate w-full group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors", isMain ? "text-base sm:text-lg" : "text-sm sm:text-base")}>
                    {user.display_name}
                </div>
                <div className="text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 mt-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full py-1 px-3 w-max mx-auto border border-emerald-100 dark:border-emerald-800 shadow-sm">
                    <Award className="w-3.5 h-3.5" />
                    {formatNumber(user.reputation_points)}
                </div>
            </div>
        </Link>
    );
}
