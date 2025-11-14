'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Search, TrendingUp, Hash, MessageSquare } from 'lucide-react';
import { tagAPI } from '@/lib/api';

interface TagData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  questionCount: number;
  createdAt: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'popular'>('popular');

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    let result = Array.isArray(tags) ? [...tags] : [];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort tags
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => b.questionCount - a.questionCount);
    }

    setFilteredTags(result);
  }, [tags, searchQuery, sortBy]);

  const fetchTags = async () => {
    try {
      const response = await tagAPI.getAll();
      const tagsData = response.data?.data?.tags || response.data?.tags || [];
      
      // Map the data to match frontend interface
      const mappedTags = tagsData.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        questionCount: tag.question_count || 0,
        createdAt: tag.created_at
      }));
      
      setTags(Array.isArray(mappedTags) ? mappedTags : []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-emerald-50 text-emerald-700 border-emerald-200',
      'bg-green-50 text-green-700 border-green-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-amber-50 text-amber-700 border-amber-200',
      'bg-pink-50 text-pink-700 border-pink-200',
      'bg-cyan-50 text-cyan-700 border-cyan-200',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6,7,8,9].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 space-y-2">
                  <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-emerald-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tags</h1>
          </div>
          <p className="text-slate-600 text-sm">
            Jelajahi pertanyaan berdasarkan kategori bisnis
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            />
          </div>
        </div>

        {/* Sort Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setSortBy('popular')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              sortBy === 'popular'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Populer</span>
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              sortBy === 'name'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Nama</span>
          </button>
        </div>

        {/* Tags Grid */}
        {filteredTags.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery ? 'Tidak ada tag yang ditemukan' : 'Belum ada tag'}
            </h3>
            <p className="text-sm text-slate-500">
              {searchQuery
                ? 'Coba gunakan kata kunci yang berbeda'
                : 'Tag akan muncul setelah pertanyaan pertama dibuat'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-600">
              Menampilkan {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTags.map((tag, index) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-emerald-300 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${getTagColor(
                        index
                      )}`}
                    >
                      #{tag.name}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">{tag.questionCount}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {tag.description || `Pertanyaan terkait ${tag.name}`}
                  </p>
                  <div className="mt-4 text-xs text-slate-500 group-hover:text-emerald-600 transition-colors">
                    Lihat pertanyaan →
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Bagaimana cara menggunakan tags?
              </h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>
                    Gunakan tag saat membuat pertanyaan untuk membantu orang lain menemukan topik Anda
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Klik tag untuk melihat semua pertanyaan dalam kategori tersebut</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Pilih maksimal 3 tag yang paling relevan dengan pertanyaan Anda</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
