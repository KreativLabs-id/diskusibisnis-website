'use client';

import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  questionCount: number;
  category: string;
  location?: string;
  isPopular: boolean;
  createdAt: string;
  avatar?: string;
}

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Real data - will be fetched from API
  const communities: Community[] = [];

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'Regional', label: 'Regional' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Industri', label: 'Industri' },
    { value: 'Perdagangan', label: 'Perdagangan' },
    { value: 'Teknologi', label: 'Teknologi' }
  ];

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Compact Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-emerald-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Jelajahi Komunitas</h1>
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

      {/* Popular Communities */}
      {selectedCategory === 'all' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Komunitas Populer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communities.filter(c => c.isPopular).map((community) => (
              <div key={community.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {community.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{community.name}</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                        Populer
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{community.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatMemberCount(community.memberCount)} anggota
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {community.questionCount} pertanyaan
                      </span>
                      {community.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {community.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium">
                    {community.category}
                  </span>
                  <Link
                    href={`/communities/${community.id}`}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                  >
                    Lihat Detail
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
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
            <button className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
              Buat Komunitas Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCommunities.map((community) => (
              <div key={community.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {community.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {community.name}
                      </h3>
                      {community.isPopular && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatMemberCount(community.memberCount)} anggota
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {community.questionCount} pertanyaan
                      </span>
                      {community.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {community.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                    {community.category}
                  </span>
                  <Link
                    href={`/communities/${community.id}`}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                  >
                    Bergabung
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
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
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" />
          Buat Komunitas Baru
        </button>
      </div>
    </div>
  );
}
