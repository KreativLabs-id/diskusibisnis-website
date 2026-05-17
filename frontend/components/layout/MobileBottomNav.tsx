'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, Bell, User, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileHref } from '@/lib/profile';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname?.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe lg:hidden transition-colors duration-200">
            <div className="flex items-center justify-around h-16 px-1">
                {/* Home */}
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <Home className="w-6 h-6" strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Beranda</span>
                </Link>

                {/* Explore */}
                <Link
                    href="/explore"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/explore') ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <Compass className="w-6 h-6" strokeWidth={isActive('/explore') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Jelajah</span>
                </Link>

                {/* Center Action Button (Ask) */}
                <div className="relative -top-5">
                    <Link
                        href={user ? "/ask" : "/login"}
                        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-white dark:ring-slate-900"
                    >
                        {user ? <Plus className="w-7 h-7" strokeWidth={2.5} /> : <LogIn className="w-6 h-6" />}
                    </Link>
                </div>

                {/* Notifications */}
                <Link
                    href="/notifications"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${isActive('/notifications') ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <div className="relative">
                        <Bell className="w-6 h-6" strokeWidth={isActive('/notifications') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium">Notifikasi</span>
                </Link>

                {/* Profile / Login */}
                <Link
                    href={user ? getProfileHref(user) : "/login"}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300",
                        isActive('/profile') || isActive('/login') ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                >
                    {user ? (
                        <div className={cn(
                            "p-0.5 rounded-full border transition-all",
                            isActive('/profile') ? "border-emerald-600 dark:border-emerald-400 scale-110" : "border-transparent"
                        )}>
                            <UserAvatar
                                src={user.avatarUrl}
                                alt={user.displayName || 'User'}
                                size="xs"
                                fallbackName={user.displayName}
                            />
                        </div>
                    ) : (
                        <LogIn className={cn("w-6 h-6", isActive('/login') && "scale-110")} />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        {user ? 'Profil' : 'Masuk'}
                    </span>
                </Link>
            </div>
        </div>
    );
}
