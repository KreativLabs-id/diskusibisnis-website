'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, X } from 'lucide-react';
import { tagAPI } from '@/lib/api';
import { useSearch } from '@/contexts/SearchContext';

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
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'popular'>('popular');
  const searchCtx = useSearch();

  const searchQuery = searchCtx ? searchCtx.searchInput : localSearchQuery;

  useEffect(() => {
    if (searchCtx) {
      searchCtx.handleSearchClear();
    }
  }, []);

  const handleSearchChange = (val: string) => {
    if (searchCtx) {
      searchCtx.setSearchInput(val);
      searchCtx.setSearchQuery(val);
    } else {
      setLocalSearchQuery(val);
    }
  };

  const handleSearchClear = () => {
    if (searchCtx) {
      searchCtx.handleSearchClear();
    } else {
      setLocalSearchQuery('');
    }
  };

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
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-lg w-32"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-56"></div>
            </div>
            <div className="h-11 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-5 sm:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Topik
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Temukan pertanyaan dan diskusi berdasarkan topik bisnis.
          </p>
        </div>

        {/* Desktop: Integrated Search & Sort */}
        <div 
          className="hidden lg:block sticky z-40 mb-6"
          style={{ top: 'calc(var(--header-height, 64px) + 0.5rem)' }}
        >
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm flex flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari topik..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-transparent pl-10 pr-9 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  sortBy === 'popular'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Populer</span>
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  sortBy === 'name'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <span>Abjad</span>
              </button>
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
                placeholder="Cari topik..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-transparent pl-9 pr-8 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
          className="block lg:hidden sticky z-30 mb-4 -mx-4 px-4 py-2 bg-[#f8fafc]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60"
          style={{ top: 'var(--header-height, 56px)' }}
        >
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-200/70 dark:bg-slate-900 rounded-lg">
            <button
              onClick={() => setSortBy('popular')}
              className={`py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                sortBy === 'popular'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Populer</span>
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`py-1.5 rounded-md text-xs font-semibold transition-colors ${
                sortBy === 'name'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>Abjad</span>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredTags.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm">Tidak ada topik yang sesuai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      #{tag.name}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                      {tag.questionCount} diskusi
                    </span>
                  </div>
                  {tag.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {tag.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
