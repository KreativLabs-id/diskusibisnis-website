'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Search, TrendingUp, Hash, MessageSquare, ChevronRight } from 'lucide-react';
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

    if (searchQuery) {
      result = result.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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

      const mappedTags = tagsData.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
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
                <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-14">
        {/* Professional Minimalist Header - Optimized for Mobile */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Topik Bisnis
          </h1>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 mt-1">
            Temukan diskusi spesifik berdasarkan kategori minat Anda.
          </p>
        </div>

        {/* Integrated Search & Filter - Clean UI */}
        <div className="sticky top-4 z-40 mb-12">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white dark:border-slate-800/50 rounded-2xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari topik atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
            </div>
                <div className="flex gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      sortBy === 'popular'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Populer
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      sortBy === 'name'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Abjad
                  </button>
                </div>
          </div>
        </div>

        {/* Grid Section */}
        {filteredTags.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tidak ada topik ditemukan</h3>
            <p className="text-slate-500 mt-2">Coba gunakan kata kunci lain untuk pencarian kamu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2.5rem] p-8 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden"
              >
                {/* Decorative Blur Object */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                
                <div className="relative z-10">
                  <div className="inline-flex px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    {tag.name}
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {tag.name}
                  </h3>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2 min-h-[2.5rem]">
                    {tag.description || `Diskusi mendalam dan wawasan strategis seputar topik ${tag.name} untuk pertumbuhan bisnis.`}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold">{tag.questionCount} Diskusi</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                      Jelajahi <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Minimalist Sub-info */}
        <div className="mt-20 pt-10 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold">Butuh topik khusus?</h4>
            <p className="text-slate-500 text-sm mt-1">Gunakan fitur tanya untuk memulai diskusi baru.</p>
          </div>
          <Link 
            href="/ask" 
            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:scale-105 transition-transform"
          >
            Mulai Tanya
          </Link>
        </div>
      </div>
    </div>
  );
}
