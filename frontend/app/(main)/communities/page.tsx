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
  X,
  Utensils,
  Store,
  Briefcase,
  MonitorSmartphone,
  Building,
  Sprout,
  Ship
} from 'lucide-react';
import { communityAPI } from '@/lib/api';
import { cn, formatNumber, getImageUrl } from '@/lib/utils';

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
    { value: 'fnb', label: 'F&B & Kuliner' },
    { value: 'retail', label: 'Retail & Toko' },
    { value: 'jasa', label: 'Jasa & Agensi' },
    { value: 'teknologi', label: 'Teknologi' },
    { value: 'properti', label: 'Properti' },
    { value: 'agribisnis', label: 'Agribisnis' },
    { value: 'export', label: 'Ekspor Impor' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 px-4 py-12">
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
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 transition-colors duration-300">
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

        {/* Search & Filter Section */}
        <div className="mb-10 space-y-5">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari komunitas berdasarkan nama atau topik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-12 py-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Pills */}
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 snap-x">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap border snap-start",
                    selectedCategory === category.value
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
            {/* Edge fade gradient for scroll indicator */}
            <div className="absolute top-0 right-0 bottom-2 w-12 bg-gradient-to-l from-[#f8fafc] dark:from-slate-950 to-transparent pointer-events-none sm:hidden"></div>
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
                      <img src={getImageUrl(community.avatar_url)} alt={community.name} className="w-full h-full object-cover rounded-lg" />
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

      </div>
    </div>
  );
}

