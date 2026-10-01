'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface TopBannerItem {
    id: string;
    title: string;
    link_url: string | null;
    link_text: string | null;
}

export default function TopBanner() {
    const [banner, setBanner] = useState<TopBannerItem | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const response = await api.get('/top-banners/active');
                const activeBanner = response.data?.data?.banner;

                if (activeBanner) {
                    const isClosed = localStorage.getItem(`top_banner_closed_${activeBanner.id}`);
                    if (!isClosed) {
                        setBanner(activeBanner);
                        setIsVisible(true);
                    }
                } else {
                    setBanner(null);
                    setIsVisible(false);
                }
            } catch (error) {
                console.error('Error fetching top banner:', error);
            }
        };

        fetchBanner();
    }, []);

    const handleClose = () => {
        if (banner) {
            localStorage.setItem(`top_banner_closed_${banner.id}`, 'true');
        }
        setIsVisible(false);
    };

    if (!isVisible || !banner) return null;

    const isExternal = banner.link_url?.startsWith('http://') || banner.link_url?.startsWith('https://');

    return (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-2 sm:py-1.5 flex items-center justify-center relative shadow-sm overflow-hidden z-50">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium z-10 w-full max-w-7xl mx-auto pr-8">
                <span className="text-center line-clamp-1 flex-1 sm:flex-none">
                    <span className="mr-2 hidden sm:inline-block">✨</span>
                    {banner.title}
                </span>
                
                {banner.link_url && (
                    isExternal ? (
                        <a
                            href={banner.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 sm:py-0.5 rounded-full transition-colors whitespace-nowrap active:scale-95"
                        >
                            {banner.link_text || 'Selengkapnya'}
                            <ArrowRight className="w-3 h-3" />
                        </a>
                    ) : (
                        <Link 
                            href={banner.link_url} 
                            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 sm:py-0.5 rounded-full transition-colors whitespace-nowrap active:scale-95"
                        >
                            {banner.link_text || 'Selengkapnya'}
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    )
                )}
            </div>

            <button 
                onClick={handleClose}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors z-20"
                aria-label="Tutup banner"
                title="Tutup banner"
            >
                <X className="w-4 h-4 text-white/80 hover:text-white" />
            </button>
        </div>
    );
}

