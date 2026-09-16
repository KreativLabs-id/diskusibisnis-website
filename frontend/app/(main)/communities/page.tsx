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
  LayoutGrid,
  X
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
                <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Komunitas Bisnis
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
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

        {/* Desktop: Integrated Search & Filter */}
        <div 
          className="hidden lg:block sticky z-40 mb-6"
          style={{ top: 'calc(var(--header-height, 64px) + 0.5rem)' }}
        >
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm flex flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari komunitas berdasarkan nama atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-10 pr-9 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto scrollbar-hide max-w-2xl">
              {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0",
                      selectedCategory === category.value
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    {category.label}
                  </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: In-Page Search */}
        <div className="block lg:hidden mb-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs flex items-center">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari komunitas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-9 pr-8 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: Sticky Filter Tabs */}
        <div 
          className="block lg:hidden sticky z-30 mb-6 -mx-4 px-4 py-2 bg-[#f8fafc]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto scrollbar-hide"
          style={{ top: 'var(--header-height, 56px)' }}
        >
          <div className="flex gap-2 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-lg w-max min-w-full">
              {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0",
                      selectedCategory === category.value
                        ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    {category.label}
                  </button>
              ))}
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
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col cursor-pointer"
              >
                {/* Header: Avatar, Name, Category */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    {community.avatar_url ? (
                      <img src={community.avatar_url} alt={community.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-xl font-bold">{community.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {community.name}
                      </h3>
                      {community.is_popular && (
                        <span className="shrink-0 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold rounded-md">
                          POPULER
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {community.category || 'Komunitas'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                  {community.description}
                </p>

                {/* Footer: Stats */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <Users className="w-4 h-4" />
                    {formatNumber(community.member_count)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <MessageSquare className="w-4 h-4" />
                    {formatNumber(community.question_count)}
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

