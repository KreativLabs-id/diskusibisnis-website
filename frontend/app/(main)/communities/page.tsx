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
    <div className="min-h-screen bg-white pb-20">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:hidden flex items-center justify-between">
        <h1 className="text-base font-semibold text-slate-900">Komunitas</h1>
        <Link
          href="/communities/create"
          className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Komunitas</h1>
            <p className="text-slate-600 text-sm">
              Temukan dan bergabung dengan komunitas UMKM
            </p>
          </div>
          <Link
            href="/communities/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Komunitas</span>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="mb-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari komunitas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${selectedCategory === category.value
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
            {selectedCategory === 'all' && communities.filter(c => c.is_popular).length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-base font-bold text-slate-900">Komunitas Populer</h2>
                </div>

                <div className="space-y-3">
                  {communities.filter(c => c.is_popular).map((community) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.slug}`}
                      className="block bg-white border border-slate-200 p-4 hover:border-emerald-500 hover:bg-emerald-50/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-lg">
                            {community.name.charAt(0)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                              {community.name}
                            </h3>
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-semibold rounded shrink-0">
                              Populer
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {community.description}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {formatMemberCount(community.member_count)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900">
                  {selectedCategory === 'all' ? 'Semua Komunitas' : selectedCategory}
                </h2>
                <span className="text-xs text-slate-500">
                  {filteredCommunities.length} komunitas
                </span>
              </div>

              {filteredCommunities.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 p-8 text-center">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    Tidak ada komunitas
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {searchQuery
                      ? `Tidak ditemukan untuk "${searchQuery}"`
                      : 'Belum ada komunitas di kategori ini'
                    }
                  </p>
                  <Link
                    href="/communities/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Komunitas
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCommunities.map((community) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.slug}`}
                      className="block bg-white border border-slate-200 p-4 hover:border-emerald-500 hover:bg-emerald-50/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 font-semibold text-slate-600">
                          {community.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                              {community.name}
                            </h3>
                            {community.is_popular && (
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {community.category}
                            </span>
                            {community.location && (
                              <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
                                <MapPin className="w-2.5 h-2.5" />
                                {community.location}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {community.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {formatMemberCount(community.member_count)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {community.question_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            {filteredCommunities.length > 0 && (
              <div className="mt-6 bg-emerald-600 p-6 text-center">
                <h3 className="text-base font-bold text-white mb-2">
                  Tidak menemukan yang dicari?
                </h3>
                <p className="text-emerald-50 text-sm mb-4">
                  Buat komunitas baru dan kumpulkan rekan bisnis
                </p>
                <Link
                  href="/communities/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-semibold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Buat Komunitas
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
