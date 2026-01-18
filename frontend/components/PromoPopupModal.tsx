'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

// Generic blur placeholder for loading
const shimmerBlur = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+';

interface PromoPopup {
    id: string;
    title: string;
    image_url: string;
    link_url: string | null;
    link_type: string;
    description: string | null;
}

export default function PromoPopupModal() {
    const [popup, setPopup] = useState<PromoPopup | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        // Delay popup to not interfere with page load
        const timer = setTimeout(() => {
            if (!hasShown) {
                fetchPopup();
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [hasShown]);

    const fetchPopup = async () => {
        try {
            // Get device ID from localStorage or create one
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
                setPopup(fetchedPopup);
                setIsOpen(true);
                setHasShown(true);
            }
        } catch (error) {
            console.error('Error fetching popup:', error);
        }
    };

    const handleClose = async () => {
        setIsOpen(false);
        if (popup) {
            await recordView(popup.id, false);
        }
    };

    const handleClick = async () => {
        setIsOpen(false);
        if (popup) {
            await recordView(popup.id, true);
        }
    };

    const recordView = async (popupId: string, clicked: boolean) => {
        try {
            let deviceId = localStorage.getItem('popup_device_id');
            await api.post(`/popups/${popupId}/view`,
                { clicked },
                { headers: { 'x-device-id': deviceId || '' } }
            );
        } catch (error) {
            console.error('Error recording popup view:', error);
        }
    };

    if (!isOpen || !popup) {
        return null;
    }

    const content = (
        <div className="relative max-w-lg w-full mx-4">
            {/* Close button */}
            <button
                onClick={handleClose}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Tutup popup"
            >
                <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Popup content */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative w-full aspect-[4/3]">
                    <Image
                        src={popup.image_url}
                        alt={popup.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 95vw, 512px"
                        priority
                        placeholder="blur"
                        blurDataURL={shimmerBlur}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/800x600?text=Promo';
                        }}
                    />
                </div>
                {popup.description && (
                    <div className="p-4 text-center">
                        <h3 className="font-semibold text-lg text-gray-900">{popup.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{popup.description}</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            {popup.link_url ? (
                <Link href={popup.link_url} onClick={handleClick}>
                    {content}
                </Link>
            ) : (
                <div onClick={handleClick} className="cursor-pointer">
                    {content}
                </div>
            )}
        </div>
    );
}
