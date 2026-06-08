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
            <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-8">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-96"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]"></div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                            ))}
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
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Leaderboard Kontributor
                    </h1>
                    <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 mt-1">
                        Apresiasi bagi para penggerak ekosistem yang paling aktif berbagi wawasan.
                    </p>
                </div>

                {/* Top 3 Spotlight */}
                {topThree.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
                        {/* Rank 2 */}
                        {topThree[1] && (
                            <div className="order-2 md:order-1">
                                <LeaderboardSpotlightCard user={topThree[1]} rank={2} />
                            </div>
                        )}
                        {/* Rank 1 */}
                        {topThree[0] && (
                            <div className="order-1 md:order-2">
                                <LeaderboardSpotlightCard user={topThree[0]} rank={1} isMain />
                            </div>
                        )}
                        {/* Rank 3 */}
                        {topThree[2] && (
                            <div className="order-3 md:order-3">
                                <LeaderboardSpotlightCard user={topThree[2]} rank={3} />
                            </div>
                        )}
                    </div>
                )}

                {/* List of Other Contributors */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Peringkat & anggota</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Kontribusi reputasi</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {restOfUsers.length > 0 ? (
            restOfUsers.map((user, index) => (
                <Link
                    key={user.id}
                    href={getProfileHref({ username: user.username, display_name: user.display_name })}
                    className="flex items-center justify-between p-4 sm:p-6 hover:bg-white dark:hover:bg-slate-800/60 transition-all group"
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
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
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
                            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">poin</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-200 dark:text-slate-800 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="inline-flex w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
                                    <Award className="w-8 h-8 text-slate-200" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-bold">Belum ada data kontributor tambahan.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Encouragement Footer */}
                <div className="mt-20 p-8 sm:p-12 rounded-[3rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
                    <div className="relative z-10 max-w-lg">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-2">Ingin nama Anda ada di sini?</h3>
                        <p className="text-slate-400 dark:text-slate-500 font-medium">Mulai berdiskusi, jawab pertanyaan, dan kumpulkan reputasi untuk menjadi penggerak utama di komunitas kami.</p>
                    </div>
                    <Link
                        href="/"
                        className="relative z-10 px-8 py-4 bg-emerald-500 text-white dark:text-white rounded-full font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105"
                    >
                        Mulai Berkontribusi
                    </Link>
                </div>
            </div>
        </div>
    );
}

function LeaderboardSpotlightCard({ user, rank, isMain }: { user: any, rank: number, isMain?: boolean }) {
    const rankColors = {
        1: 'text-yellow-500 bg-yellow-500/10 ring-yellow-500/20 shadow-yellow-500/10',
        2: 'text-slate-400 bg-slate-400/10 ring-slate-400/20 shadow-slate-400/10',
        3: 'text-amber-700 bg-amber-700/10 ring-amber-700/20 shadow-amber-700/10',
    }[rank as 1 | 2 | 3];

    const Icon = rank === 1 ? Trophy : rank === 2 ? Medal : Star;

    return (
        <Link
            href={getProfileHref({ username: user.username, display_name: user.display_name })}
            className={cn(
                "group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2",
                isMain ? "md:pb-12 md:pt-14 ring-2 ring-emerald-500/20 shadow-emerald-500/10 bg-white/80 dark:bg-slate-900/60" : "opacity-90 hover:opacity-100"
            )}
        >
            {/* Rank Badge */}
            <div className={cn(
                "absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl flex items-center justify-center ring-4 ring-[#f8fafc] dark:ring-slate-950",
                rankColors
            )}>
                <Icon className="w-5 h-5" />
            </div>

            {/* Avatar */}
            <div className="mb-6 relative">
                <div className={cn(
                    "p-1.5 rounded-full ring-2 transition-all duration-500 group-hover:scale-105",
                    rank === 1 ? "ring-yellow-500/30 group-hover:ring-yellow-500" :
                        rank === 2 ? "ring-slate-300 group-hover:ring-slate-400" : "ring-amber-600/30 group-hover:ring-amber-600"
                )}>
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

            {/* User Info */}
            <div className="mb-6">
                <h3 className={cn(
                    "font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors",
                    isMain ? "text-2xl" : "text-lg"
                )}>
                    {user.display_name}
                </h3>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                    Juara {rank} komunitas
                </div>
            </div>

            {/* Reputation Info */}
            <div className={cn(
                "w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100/50 dark:border-slate-700/50 transition-colors group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:border-emerald-500/20",
                isMain && "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-500/10"
            )}>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">Reputasi</div>
                <div className={cn(
                    "font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5",
                    isMain ? "text-2xl" : "text-xl"
                )}>
                    <Award className="w-5 h-5" />
                    {formatNumber(user.reputation_points)}
                </div>
            </div>

            {/* Subtle Action Hint */}
            <div className="mt-6 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                Profil Lengkap <ChevronRight className="w-4 h-4" />
            </div>
        </Link>
    );
}
