'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Users,
  MessageSquare,
  TrendingUp,
  Search,
  Star,
  MapPin,
  Calendar,
  ChevronRight,
  Plus,
  Tag,
  LayoutGrid
} from 'lucide-react';
import { communityAPI } from '@/lib/api';
import { cn, formatNumber } from '@/lib/utils';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  member_count: number;
  question_count: number;
  category: string;
  location?: string;
  is_popular?: boolean;
  created_at: string;
  avatar_url?: string;
}

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, [selectedCategory, searchQuery]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const response = await communityAPI.getAll(params);
      setCommunities(response.data?.data?.communities || response.data?.communities || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'Regional', label: 'Regional' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Industri', label: 'Industri' },
    { value: 'Perdagangan', label: 'Perdagangan' },
    { value: 'Teknologi', label: 'Teknologi' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-48"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
              </div>
            </div>
            <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-14">
        {/* Professional Minimalist Header - Optimized for Mobile */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Komunitas Bisnis
              </h1>
              <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">
                Bergabung dengan {communities.length} ekosistem yang tepat untuk bisnis Anda.
              </p>
            </div>
            <Link
              href="/communities/create"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all shadow-sm shadow-emerald-500/20 active:scale-95 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Komunitas</span>
            </Link>
          </div>
        </div>

        {/* Integrated Search & Filter - Clean UI */}
        <div className="sticky top-4 z-40 mb-12">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white dark:border-slate-800/50 rounded-2xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari komunitas berdasarkan nama atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
            </div>
            <div className="flex gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={cn(
                      "px-5 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                      selectedCategory === category.value
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    )}
                  >
                    {category.label}
                  </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Section */}
        {filteredCommunities.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tidak ada komunitas ditemukan</h3>
            <p className="text-slate-500 mt-2">Coba gunakan kata kunci lain untuk pencarian kamu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <Link
                key={community.id}
                href={`/communities/${community.slug}`}
                className="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white dark:border-slate-800/60 rounded-[2.5rem] p-8 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden flex flex-col"
              >
                {/* Decorative Blur Object */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                      {community.avatar_url ? (
                        <img src={community.avatar_url} alt={community.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <span className="text-2xl font-black">{community.name.charAt(0)}</span>
                      )}
                    </div>
                    {community.is_popular && (
                      <div className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-yellow-500/20">
                        Populer
                      </div>
                    )}
                  </div>

                  <div className="mb-6 flex-1">
                    <div className="flex items-center gap-2 mb-6 px-1">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                      <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        Kategori
                      </h2>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {community.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {community.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">Anggota</span>
                        <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-bold text-xs">
                          <Users className="w-3.5 h-3.5 text-emerald-500" />
                          {formatNumber(community.member_count)}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">Diskusi</span>
                        <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-bold text-xs">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          {formatNumber(community.question_count)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                      Masuk <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Minimalist Sub-info */}
        <div className="mt-24 p-8 sm:p-12 rounded-[3rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
          <div className="relative z-10 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Tidak menemukan komunitas yang tepat?</h3>
            <p className="text-slate-400 dark:text-slate-500 font-medium">Jadilah pionir dengan membangun komunitas baru dan kumpulkan rekan bisnis dengan visi yang sama.</p>
          </div>
          <Link
            href="/communities/create"
            className="relative z-10 px-8 py-4 bg-emerald-500 text-white dark:text-white rounded-full font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Buat Komunitas Baru
          </Link>
        </div>
      </div>
    </div>
  );
}

