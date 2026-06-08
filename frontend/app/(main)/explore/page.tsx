'use client';

import Link from 'next/link';
import {
    Users,
    Hash,
    Trophy,
    User,
    MessageCircleQuestion,
    HelpCircle,
    Bookmark,
    Mail,
    Search,
    ChevronRight,
    Sparkles,
    LayoutGrid,
    Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ExplorePage() {
    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14">
                {/* Professional Minimalist Header - Optimized for Mobile */}
                <div className="mb-10 sm:mb-12">
                    <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Jelajahi Forum
                    </h1>
                    <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 mt-1">
                        Temukan ekosistem dan diskusi yang tepat untuk bisnis Anda.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Main Menu Grid */}
                    <section>
                        <div className="flex items-center gap-2 mb-6 px-1">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                Navigasi utama
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <ExploreGridItem 
                                href="/communities" 
                                title="Komunitas" 
                                description="Gabung grup diskusi" 
                                icon={Globe} 
                                color="blue"
                            />
                            <ExploreGridItem 
                                href="/tags" 
                                title="Topik" 
                                description="Cari kategori bisnis" 
                                icon={Hash} 
                                color="purple"
                            />
                            <ExploreGridItem 
                                href="/leaderboard" 
                                title="Leaderboard" 
                                description="Member teraktif" 
                                icon={Trophy} 
                                color="amber"
                            />
                            <ExploreGridItem 
                                href="/users" 
                                title="Pengguna" 
                                description="Cari member lain" 
                                icon={User} 
                                color="rose"
                            />
                        </div>
                    </section>

                    {/* Questions & Content section */}
                    <section>
                        <div className="flex items-center gap-2 mb-6 px-1">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                Diskusi & bantuan
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ExploreListItem 
                                href="/questions" 
                                title="Semua pertanyaan" 
                                description="Lihat semua diskusi terbaru dari komunitas" 
                                icon={MessageCircleQuestion} 
                                color="emerald"
                            />
                            <ExploreListItem 
                                href="/unanswered" 
                                title="Belum terjawab" 
                                description="Bantu sesama dengan menjawab pertanyaan" 
                                icon={HelpCircle} 
                                color="orange"
                            />
                            <ExploreListItem 
                                href="/saved" 
                                title="Disimpan" 
                                description="Koleksi diskusi yang telah Anda simpan" 
                                icon={Bookmark} 
                                color="sky"
                            />
                            <ExploreListItem 
                                href="/contact" 
                                title="Bantuan / cs" 
                                description="Hubungi tim dukungan kami" 
                                icon={Mail} 
                                color="slate"
                            />
                        </div>
                    </section>

                    {/* Premium CTA / Info */}
                    <section className="pt-8">
                        <div className="group relative bg-slate-900 dark:bg-white rounded-2xl p-8 sm:p-12 overflow-hidden shadow-2xl text-center sm:text-left">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                                <div className="max-w-xl">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white dark:text-slate-900 mb-3">
                                        Punya pertanyaan spesifik?
                                    </h3>
                                    <p className="text-slate-400 dark:text-slate-500 font-medium">
                                        Jangan ragu untuk memulai diskusi baru. Ribuan pebisnis siap berbagi pengalaman mereka dengan Anda.
                                    </p>
                                </div>
                                <Link
                                    href="/ask"
                                    className="px-8 py-4 bg-emerald-500 text-white rounded-full font-bold text-sm shadow-xl shadow-emerald-500/20 whitespace-nowrap transition-all hover:scale-105"
                                >
                                    Tanya sekarang
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Footer links - minimalist */}
                    <footer className="pt-12 border-t border-slate-200 dark:border-slate-800/60 text-center">
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6">
                            {['Tentang', 'Komunitas', 'Privasi', 'Syarat', 'Bantuan'].map((item) => (
                                <Link 
                                    key={item} 
                                    href={`/${item.toLowerCase()}`} 
                                    className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">
                            © 2026 DiskusiBisnis
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

function ExploreGridItem({ href, title, description, icon: Icon, color }: any) {
    const colorVariants: any = {
        blue: "text-blue-500 bg-blue-500/10",
        purple: "text-purple-500 bg-purple-500/10",
        amber: "text-amber-500 bg-amber-500/10",
        rose: "text-rose-500 bg-rose-500/10",
    };

    return (
        <Link 
            href={href} 
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
        >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500", colorVariants[color])}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {description}
                </p>
            </div>
        </Link>
    );
}

function ExploreListItem({ href, title, description, icon: Icon, color }: any) {
    const colorVariants: any = {
        emerald: "text-emerald-500 bg-emerald-500/10",
        orange: "text-orange-500 bg-orange-500/10",
        sky: "text-sky-500 bg-sky-500/10",
        slate: "text-slate-500 bg-slate-500/10",
    };

    return (
        <Link 
            href={href} 
            className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:shadow-lg"
        >
            <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500", colorVariants[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {description}
                    </p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </Link>
    );
}

