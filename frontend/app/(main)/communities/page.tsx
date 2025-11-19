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
  ArrowRight,
  Plus,
  Tag
} from 'lucide-react';
import { communityAPI } from '@/lib/api';

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
      setCommunities(response.data.data.communities || []);
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

  const formatMemberCount = (count: number): string => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderSkeleton = (
    <div className="space-y-6">
      {/* Popular Communities Skeleton */}
      <div>
        <div className="h-7 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-3 mb-4">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* All Communities Skeleton */}
      <div>
        <div className="h-7 w-40 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2" />
              <div className="h-4 bg-slate-200 rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:hidden flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-emerald-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Komunitas</h1>
        </div>
        <Link
          href="/communities/create"
          className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-sm transform -rotate-3">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Jelajahi Komunitas</h1>
            </div>
            <p className="text-slate-600 text-lg max-w-2xl">
              Temukan dan bergabung dengan komunitas UMKM yang sesuai dengan minat Anda.
            </p>
          </div>
          <Link
            href="/communities/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Buat Komunitas</span>
          </Link>
        </div>

        {/* Search and Filter - Sticky on Mobile */}
        <div className="sticky sm:static top-[60px] z-20 bg-slate-50 pt-2 pb-4 sm:py-0 mb-6 sm:mb-8">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari komunitas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-none focus:ring-0 text-slate-900 placeholder-slate-400 bg-transparent"
                />
              </div>
              <div className="h-px sm:h-auto sm:w-px bg-slate-200 mx-2"></div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 px-2 sm:px-0 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${selectedCategory === category.value
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          renderSkeleton
        ) : (
          <>
            {/* Popular Communities */}
            {selectedCategory === 'all' && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-yellow-100 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Komunitas Populer</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {communities.filter(c => c.is_popular).map((community) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.slug}`}
                      className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Globe className="w-32 h-32 text-emerald-600 -rotate-12" />
                      </div>

                      <div className="relative z-10 flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                          <span className="text-white font-bold text-2xl">
                            {community.name.charAt(0)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors truncate pr-2">
                              {community.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-yellow-100 shrink-0">
                              Populer
                            </span>
                          </div>

                          <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10 leading-relaxed">
                            {community.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {formatMemberCount(community.member_count)}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                              {community.question_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Communities */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedCategory === 'all' ? 'Semua Komunitas' : `Komunitas ${selectedCategory}`}
                </h2>
                <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  {filteredCommunities.length} ditemukan
                </span>
              </div>

              {filteredCommunities.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Komunitas tidak ditemukan
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchQuery
                      ? `Tidak ada komunitas yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
                      : 'Belum ada komunitas di kategori ini. Jadilah yang pertama membuatnya!'
                    }
                  </p>
                  <Link
                    href="/communities/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-600/20"
                  >
                    <Plus className="w-5 h-5" />
                    Buat Komunitas Baru
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredCommunities.map((community) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.slug}`}
                      className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors font-bold text-lg text-slate-500">
                          {community.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                              {community.name}
                            </h3>
                            {community.is_popular && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {community.category}
                            </span>
                            {community.location && (
                              <span className="flex items-center gap-1 text-xs text-slate-500 truncate">
                                <MapPin className="w-3 h-3" />
                                {community.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">
                        {community.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {formatMemberCount(community.member_count)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {community.question_count}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Detail
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            {filteredCommunities.length > 0 && (
              <div className="mt-12 bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Tidak menemukan komunitas yang dicari?
                  </h3>
                  <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
                    Jadilah inisiator! Buat komunitas baru dan kumpulkan rekan bisnis dengan minat yang sama.
                  </p>
                  <Link
                    href="/communities/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-colors font-bold shadow-lg shadow-emerald-500/25 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Komunitas Sekarang
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
