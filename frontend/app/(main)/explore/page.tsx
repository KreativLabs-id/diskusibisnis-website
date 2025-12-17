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
    ArrowRight
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ExplorePage() {
    return (
        <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="mb-8 p-6 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-2">Jelajahi Forum</h1>
                    <p className="text-emerald-50 text-sm">Temukan komunitas, topik menarik, dan diskusi yang relevan untuk bisnis Anda.</p>
                </div>
            </div>

            <div className="space-y-8 px-2 md:px-0">

                {/* Main Menu Grid */}
                <section>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Menu Utama
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <Link href="/communities" className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-32 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Users className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 w-fit rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Komunitas</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Gabung grup diskusi</p>
                            </div>
                        </Link>

                        <Link href="/tags" className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-32 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Hash className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 w-fit rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                                <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Topik / Tag</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Cari kategori</p>
                            </div>
                        </Link>

                        <Link href="/reputation" className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-32 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Trophy className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 w-fit rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Leaderboard</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Member teraktif</p>
                            </div>
                        </Link>

                        <Link href="/users" className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-32 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <User className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 w-fit rounded-lg group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
                                <User className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Pengguna</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Cari member lain</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Questions Navigation */}
                <section>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 px-1 uppercase tracking-wider flex items-center gap-2">
                        <MessageCircleQuestion className="w-4 h-4" />
                        Diskusi
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <Link
                            href="/questions"
                            className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <MessageCircleQuestion className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Semua Pertanyaan</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lihat diskusi terbaru</div>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link href="/unanswered" className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-500 hover:bg-orange-50/30 dark:hover:bg-orange-900/20 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-700 dark:group-hover:text-orange-400">Belum Terjawab</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bantu jawab pertanyaan</div>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link href="/saved" className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-sky-500 hover:bg-sky-50/30 dark:hover:bg-sky-900/20 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <Bookmark className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400">Disimpan</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Koleksi diskusi Anda</div>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link href="/contact" className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-200">Bantuan / CS</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hubungi dukungan</div>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </section>

                {/* Information & Legal */}
                <section className="pt-4">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            <Link href="/about" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">Tentang</Link>
                            <Link href="/about-community" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">Tentang Komunitas</Link>
                            <Link href="/privacy" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">Privasi</Link>
                            <Link href="/terms" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">Syarat & Ketentuan</Link>
                            <Link href="/help" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium">Bantuan</Link>
                        </div>

                        <div className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                            © 2025 DiskusiBisnis. Platform Q&A untuk UMKM Indonesia.
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
