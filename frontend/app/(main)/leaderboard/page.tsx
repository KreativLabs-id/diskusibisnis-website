'use client';
import { useEffect, useState } from 'react';
import { userAPI } from '@/lib/api';
import UserAvatar from '@/components/ui/UserAvatar';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { Award, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userAPI.getAll({ limit: 50 }); // fetch top 50
                setUsers(response.data.data.users);
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
            <div className="min-h-screen bg-slate-50 pt-20 px-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="bg-emerald-600 text-white py-12 px-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/pattern.svg')]"></div>
                <div className="relative max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                        <Trophy className="w-8 h-8 text-yellow-300" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Top Contributors</h1>
                    <p className="text-emerald-100 max-w-md mx-auto">
                        Apresiasi untuk anggota komunitas yang paling aktif berbagi pengetahuan dan membantu sesama.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                    {users.length > 0 ? (
                        users.map((user, index) => (
                            <div key={user.id} className="flex items-center p-4 sm:p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                <div className={`w-10 text-center font-bold text-lg mr-4 ${index === 0 ? 'text-yellow-500 text-2xl' :
                                        index === 1 ? 'text-slate-400 text-xl' :
                                            index === 2 ? 'text-amber-700 text-xl' : 'text-slate-400'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
                                    <UserAvatar
                                        src={user.avatar_url}
                                        alt={user.display_name}
                                        fallbackName={user.display_name}
                                        size="md"
                                    />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <Link href={`/profile/${user.username || user.id}`} className="font-semibold text-slate-900 group-hover:text-emerald-600 truncate transition-colors text-base sm:text-lg">
                                                {user.display_name}
                                            </Link>
                                            <VerifiedBadge isVerified={user.is_verified} size="sm" />
                                        </div>
                                        <div className="text-xs text-slate-500 hidden sm:block">
                                            Bergabung sejak {new Date(user.created_at).getFullYear()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right pl-2">
                                    <div className="font-bold text-emerald-600 flex items-center justify-end gap-1.5 text-base sm:text-lg">
                                        <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                                        {user.reputation_points}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide font-medium">Reputasi</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">Belum ada data kontributor.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
