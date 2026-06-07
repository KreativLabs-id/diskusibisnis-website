'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface PromoPopup {
    id: string;
    title: string;
    link_url: string | null;
}

export default function TopBanner() {
    const [popup, setPopup] = useState<PromoPopup | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchPopup = async () => {
            try {
                let deviceId = localStorage.getItem('popup_device_id');
                if (!deviceId) {
                    deviceId = crypto.randomUUID();
                    localStorage.setItem('popup_device_id', deviceId);
                }

                const response = await api.get('/popups/active', {
                    headers: { 'x-device-id': deviceId }
                });

                const fetchedPopup = response.data.data.popup;
                if (fetchedPopup) {
                    // Check if user already closed THIS specific banner
                    const isClosed = localStorage.getItem(`top_banner_closed_${fetchedPopup.id}`);
                    if (!isClosed) {
                        setPopup(fetchedPopup);
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching top banner:', error);
            }
        };

        fetchPopup();
    }, []);

    const handleClose = () => {
        if (popup) {
            localStorage.setItem(`top_banner_closed_${popup.id}`, 'true');
        }
        setIsVisible(false);
    };

    if (!isVisible || !popup) return null;

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2.5 sm:py-2 flex items-center justify-center relative shadow-md overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium z-10 w-full max-w-7xl mx-auto pr-8">
                <span className="text-center line-clamp-1 flex-1 sm:flex-none">
                    <span className="mr-2 hidden sm:inline-block">✨</span>
                    {popup.title}
                </span>
                
                {popup.link_url && (
                    <Link 
                        href={popup.link_url} 
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1 sm:py-0.5 rounded-full transition-colors whitespace-nowrap"
                    >
                        Selengkapnya
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                )}
            </div>

            <button 
                onClick={handleClose}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors z-20"
                aria-label="Tutup banner"
            >
                <X className="w-4 h-4 text-white/80 hover:text-white" />
            </button>
        </div>
    );
}
