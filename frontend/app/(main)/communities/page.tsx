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
    <div className="max-w-6xl mx-auto">
      {/* Compact Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Jelajahi Komunitas</h1>
          </div>
          <Link
            href="/communities/create"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Buat Komunitas</span>
          </Link>
        </div>
        <p className="text-slate-600 text-sm">
          Temukan komunitas UMKM yang sesuai
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Cari komunitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category.label}
              </button>
            ))}
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
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Komunitas Populer
              </h2>
              <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4 md:gap-6">
                {communities.filter(c => c.is_popular).map((community) => (
              <Link key={community.id} href={`/communities/${community.slug}`} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-all group block">
                {/* Header dengan ikon dan nama */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-base sm:text-lg">
                      {community.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors text-base sm:text-lg leading-tight break-words">
                        {community.name}
                      </h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium shrink-0">
                        Populer
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                      {community.description}
                    </p>
                  </div>
                </div>
                
                {/* Stats section */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{formatMemberCount(community.member_count)} anggota</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{community.question_count} pertanyaan</span>
                  </span>
                  {community.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{community.location}</span>
                    </span>
                  )}
                </div>
                
                {/* Footer dengan kategori dan link */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium border border-emerald-200">
                    {community.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
                    <span>Lihat Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

          {/* All Communities */}
          <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {selectedCategory === 'all' ? 'Semua Komunitas' : `Komunitas ${selectedCategory}`}
          </h2>
          <span className="text-sm text-slate-600">
            {filteredCommunities.length} komunitas ditemukan
          </span>
        </div>

        {filteredCommunities.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? 'Komunitas tidak ditemukan' : 'Belum ada komunitas'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? 'Coba kata kunci pencarian yang berbeda atau jelajahi kategori lain.'
                : 'Jadilah yang pertama membuat komunitas untuk kategori ini!'
              }
            </p>
            <Link
              href="/communities/create"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Buat Komunitas Baru
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-4 lg:gap-6">
            {filteredCommunities.map((community) => (
              <Link key={community.id} href={`/communities/${community.slug}`} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-all group block">
                {/* Header dengan ikon dan nama */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-base sm:text-lg">
                      {community.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors text-base sm:text-lg leading-tight break-words">
                        {community.name}
                      </h3>
                      {community.is_popular && (
                        <Star className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                      {community.description}
                    </p>
                  </div>
                </div>
                
                {/* Stats section */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{formatMemberCount(community.member_count)} anggota</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{community.question_count} pertanyaan</span>
                  </span>
                  {community.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{community.location}</span>
                    </span>
                  )}
                </div>
                
                {/* Footer dengan kategori dan link */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium border border-emerald-200">
                    {community.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
                    <span>Lihat Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
          </div>

          {/* Compact Create Community CTA */}
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Globe className="w-6 h-6 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Tidak menemukan komunitas yang sesuai?
          </h3>
        </div>
        <p className="text-slate-600 text-sm mb-4">
          Buat komunitas baru untuk sesama pemilik UMKM
        </p>
        <Link
          href="/communities/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Buat Komunitas Baru
        </Link>
          </div>
        </>
      )}
    </div>
  );
}
