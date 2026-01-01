'use client';

import { useEffect, useState } from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Gift, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

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
    info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-800',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-800',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-800',
        buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    error: {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-800',
        buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    promo: {
        icon: Gift,
        bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50',
        borderColor: 'border-purple-200',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-800',
        buttonColor: 'bg-purple-600 hover:bg-purple-700',
    },
};

interface AnnouncementBannerProps {
    showOn?: 'all' | 'home' | 'questions' | 'communities';
}

export default function AnnouncementBanner({ showOn = 'all' }: AnnouncementBannerProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, [showOn]);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get(`/announcements/active?showOn=${showOn}`);
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
        <div className="space-y-2 mb-4">
            {announcements.map(announcement => {
                const config = typeConfig[announcement.type];
                const Icon = config.icon;

                return (
                    <div
                        key={announcement.id}
                        className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 relative`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                                <Icon className={`w-5 h-5 ${config.iconColor}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold ${config.textColor}`}>{announcement.title}</h4>
                                <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>{announcement.message}</p>

                                {/* Link */}
                                {announcement.link_url && (
                                    <Link
                                        href={announcement.link_url}
                                        className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${config.textColor} hover:underline`}
                                    >
                                        {announcement.link_text || 'Pelajari selengkapnya'}
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>

                            {/* Dismiss button */}
                            {announcement.is_dismissible && (
                                <button
                                    onClick={() => handleDismiss(announcement.id)}
                                    className={`flex-shrink-0 p-1 rounded-full hover:bg-white/50 transition-colors ${config.textColor}`}
                                    aria-label="Tutup pengumuman"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
