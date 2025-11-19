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
        // Backend mengirim jumlah pertanyaan per tag di field usage_count / question_count
        questionCount: tag.usage_count ?? tag.question_count ?? 0,
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:hidden flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Tag className="w-4 h-4 text-emerald-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Tags</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Tag className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Tags</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Jelajahi pertanyaan berdasarkan kategori bisnis
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="sticky sm:static top-[60px] z-20 bg-slate-50 pt-2 pb-4 sm:py-0 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari topik bisnis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm sm:text-base bg-white shadow-sm transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => setSortBy('popular')}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none justify-center ${sortBy === 'popular'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50'
                  }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Populer</span>
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none justify-center ${sortBy === 'name'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50'
                  }`}
              >
                <Hash className="w-4 h-4" />
                <span>Nama</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tags Grid */}
        {filteredTags.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {searchQuery ? 'Tidak ada tag ditemukan' : 'Belum ada tag'}
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              {searchQuery
                ? `Tidak dapat menemukan tag "${searchQuery}"`
                : 'Tag akan muncul setelah ada pertanyaan dibuat'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm font-medium text-slate-500 px-1">
              Menampilkan {filteredTags.length} topik diskusi
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredTags.map((tag, index) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                    <Hash className="w-24 h-24 text-emerald-600 rotate-12" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide ${getTagColor(
                          index
                        )}`}
                      >
                        #{tag.name}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {tag.name}
                    </h3>

                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10 leading-relaxed">
                      {tag.description || `Diskusi dan pertanyaan seputar topik ${tag.name} dalam bisnis.`}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium bg-slate-50 px-2.5 py-1 rounded-md">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{tag.questionCount} diskusi</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Lihat Topik
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Info Box - Redesigned */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
              <Tag className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">
                Tips Menggunakan Tag
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-8">
                <div className="space-y-1">
                  <h4 className="font-semibold text-emerald-300 text-sm">Relevansi</h4>
                  <p className="text-sm text-emerald-100/80 leading-relaxed">
                    Pilih tag yang paling sesuai agar pertanyaanmu mudah ditemukan ahli yang tepat.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-emerald-300 text-sm">Eksplorasi</h4>
                  <p className="text-sm text-emerald-100/80 leading-relaxed">
                    Klik tag untuk melihat diskusi serupa dan pelajari pengalaman pebisnis lain.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-emerald-300 text-sm">Maksimal 3</h4>
                  <p className="text-sm text-emerald-100/80 leading-relaxed">
                    Gunakan hingga 3 tag spesifik untuk kategorisasi yang lebih akurat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
