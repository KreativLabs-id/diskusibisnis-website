'use client';

import { useEffect, useState } from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Gift, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'promo';
    link_url: string | null;
    link_text: string | null;
    is_dismissible: boolean;
}

const typeConfig = {
    promo: {
        icon: Gift,
        label: 'Promo',
        wrapper: 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/5 dark:from-purple-950/40 dark:via-pink-950/20 dark:to-purple-950/30 border-purple-200/80 dark:border-purple-800/50',
        iconBg: 'bg-purple-100 dark:bg-purple-900/60',
        iconColor: 'text-purple-600 dark:text-purple-400',
        titleColor: 'text-purple-950 dark:text-purple-100',
        messageColor: 'text-purple-700/90 dark:text-purple-300/80',
        buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs',
    },
    info: {
        icon: Info,
        label: 'Info',
        wrapper: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/50',
        iconBg: 'bg-blue-100 dark:bg-blue-900/60',
        iconColor: 'text-blue-600 dark:text-blue-400',
        titleColor: 'text-blue-950 dark:text-blue-100',
        messageColor: 'text-blue-700/90 dark:text-blue-300/80',
        buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
    },
    warning: {
        icon: AlertTriangle,
        label: 'Peringatan',
        wrapper: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/50',
        iconBg: 'bg-amber-100 dark:bg-amber-900/60',
        iconColor: 'text-amber-600 dark:text-amber-400',
        titleColor: 'text-amber-950 dark:text-amber-100',
        messageColor: 'text-amber-700/90 dark:text-amber-300/80',
        buttonStyle: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
    },
    success: {
        icon: CheckCircle,
        label: 'Sukses',
        wrapper: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/50',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        titleColor: 'text-emerald-950 dark:text-emerald-100',
        messageColor: 'text-emerald-700/90 dark:text-emerald-300/80',
        buttonStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
    },
    error: {
        icon: AlertCircle,
        label: 'Penting',
        wrapper: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/50',
        iconBg: 'bg-rose-100 dark:bg-rose-900/60',
        iconColor: 'text-rose-600 dark:text-rose-400',
        titleColor: 'text-rose-950 dark:text-rose-100',
        messageColor: 'text-rose-700/90 dark:text-rose-300/80',
        buttonStyle: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
    },
};

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    const getShowOnContext = () => {
        if (!pathname) return 'all';
        if (pathname === '/') return 'home';
        if (pathname.startsWith('/questions')) return 'questions';
        if (pathname.startsWith('/communities')) return 'communities';
        return 'all';
    };

    const currentShowOn = getShowOnContext();

    useEffect(() => {
        fetchAnnouncements();
    }, [currentShowOn]);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get(`/announcements/active?showOn=${currentShowOn}`);
            setAnnouncements(response.data.data.announcements || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async (id: string) => {
        try {
            await api.post(`/announcements/${id}/dismiss`);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error dismissing announcement:', error);
        }
    };

    if (loading || announcements.length === 0) {
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 pt-4 sm:pt-6 w-full space-y-2.5">
            {announcements.map(announcement => {
                const config = typeConfig[announcement.type] || typeConfig.info;
                const Icon = config.icon;
                const isMessageDuplicate =
                    Boolean(announcement.message) &&
                    announcement.message.trim().toLowerCase() === announcement.title.trim().toLowerCase();

                return (
                    <div
                        key={announcement.id}
                        className={`${config.wrapper} border rounded-2xl p-3 sm:px-4 sm:py-2.5 relative shadow-xs transition-all`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            {/* Left Section: Icon + Text */}
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                <div className={`w-8 h-8 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                                        <span className={`text-xs sm:text-sm font-bold ${config.titleColor} truncate`}>
                                            {announcement.title}
                                        </span>

                                        {!isMessageDuplicate && announcement.message && (
                                            <span className={`text-xs ${config.messageColor} line-clamp-1`}>
                                                <span className="hidden sm:inline mr-2 text-slate-300 dark:text-slate-600">·</span>
                                                {announcement.message}
                                            </span>
                                        )}
                                    </div>

                                    {/* Mobile CTA Link */}
                                    {announcement.link_url && (
                                        <div className="sm:hidden mt-2">
                                            <Link
                                                href={announcement.link_url}
                                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${config.buttonStyle}`}
                                            >
                                                <span>{announcement.link_text || 'Pelajari Selengkapnya'}</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Section: Desktop CTA Link & Dismiss Button */}
                            <div className="flex items-center gap-2 shrink-0">
                                {announcement.link_url && (
                                    <Link
                                        href={announcement.link_url}
                                        className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-xs ${config.buttonStyle}`}
                                    >
                                        <span>{announcement.link_text || 'Pelajari Selengkapnya'}</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                )}

                                {announcement.is_dismissible && (
                                    <button
                                        onClick={() => handleDismiss(announcement.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                        aria-label="Tutup pengumuman"
                                        title="Tutup pengumuman"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

