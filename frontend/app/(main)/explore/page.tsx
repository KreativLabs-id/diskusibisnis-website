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
                    {/* Main Menu App-like Grid */}
                    <section>
                        <div className="grid grid-cols-4 gap-y-6 gap-x-2 sm:gap-6 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800/60">
                            <ExploreAppMenu 
                                href="/communities" 
                                title="Komunitas" 
                                icon={Globe} 
                                color="blue"
                            />
                            <ExploreAppMenu 
                                href="/tags" 
                                title="Topik" 
                                icon={Hash} 
                                color="purple"
                            />
                            <ExploreAppMenu 
                                href="/leaderboard" 
                                title="Peringkat" 
                                icon={Trophy} 
                                color="amber"
                            />
                            <ExploreAppMenu 
                                href="/users" 
                                title="Pengguna" 
                                icon={User} 
                                color="rose"
                            />
                        </div>
                    </section>

                    {/* Questions & Content section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                Diskusi & Bantuan
                            </h2>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800/60 divide-y divide-slate-100 dark:divide-slate-800/60">
                            <ExploreListRow 
                                href="/questions" 
                                title="Semua pertanyaan" 
                                icon={MessageCircleQuestion} 
                                color="emerald"
                            />
                            <ExploreListRow 
                                href="/unanswered" 
                                title="Belum terjawab" 
                                icon={HelpCircle} 
                                color="orange"
                            />
                            <ExploreListRow 
                                href="/saved" 
                                title="Disimpan" 
                                icon={Bookmark} 
                                color="sky"
                            />
                            <ExploreListRow 
                                href="/contact" 
                                title="Bantuan / Layanan" 
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

function ExploreAppMenu({ href, title, icon: Icon }: any) {
    return (
        <Link 
            href={href} 
            className="flex flex-col items-center gap-2.5 group outline-none"
        >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 text-center tracking-tight leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {title}
            </span>
        </Link>
    );
}

function ExploreListRow({ href, title, icon: Icon }: any) {
    return (
        <Link 
            href={href} 
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group outline-none"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 dark:group-hover:text-emerald-400 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {title}
                </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
        </Link>
    );
}

