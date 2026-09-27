'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearch } from '@/contexts/SearchContext';
import { questionAPI, userAPI, communityAPI, tagAPI } from '@/lib/api';
import UserAvatar from '@/components/ui/UserAvatar';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { MessageCircleQuestion, Users, Hash, Loader2, Search } from 'lucide-react';
import { getProfileHref } from '@/lib/profile';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface SearchResult {
  questions: any[];
  users: any[];
  communities: any[];
  tags: any[];
}

export default function GlobalSearchDropdown() {
  const searchCtx = useSearch();
  const { searchQuery, searchInput, isSearchDropdownOpen, setIsSearchDropdownOpen } = searchCtx || {};
  const [results, setResults] = useState<SearchResult>({ questions: [], users: [], communities: [], tags: [] });
  const [isLoading, setIsLoading] = useState(false);
  
  // Local debounce specifically for the dropdown to make it feel snappier or just rely on searchInput
  const [debouncedInput, setDebouncedInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchInput || '');
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!isSearchDropdownOpen || !debouncedInput) {
      setResults({ questions: [], users: [], communities: [], tags: [] });
      return;
    }

    let isMounted = true;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const [qRes, uRes, cRes, tRes] = await Promise.all([
          questionAPI.getAll({ search: debouncedInput, limit: 3 }).catch(() => ({ data: { questions: [] } })),
          userAPI.getAll({ search: debouncedInput, limit: 3 }).catch(() => ({ data: { data: [] } })),
          communityAPI.getAll({ search: debouncedInput, limit: 3 }).catch(() => ({ data: { data: [] } })),
          tagAPI.getAll({ search: debouncedInput, limit: 3 }).catch(() => ({ data: { data: [] } }))
        ]);

        if (isMounted) {
          setResults({
            questions: qRes.data?.data?.questions || qRes.data?.questions || [],
            users: uRes.data?.data?.users || uRes.data?.users || [],
            communities: cRes.data?.data?.communities || cRes.data?.communities || [],
            tags: tRes.data?.data?.tags || tRes.data?.tags || []
          });
        }
      } catch (error) {
        console.error('Error fetching global search:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [debouncedInput, isSearchDropdownOpen]);

  const hasResults = results.questions.length > 0 || results.users.length > 0 || results.communities.length > 0 || results.tags.length > 0;

  if (!isSearchDropdownOpen) return null;

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
        style={{ top: 'calc(var(--header-height, 64px))' }}
        onClick={() => setIsSearchDropdownOpen?.(false)}
      />
      
      {/* Dropdown Container */}
      <div 
        className="max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-[64px] lg:absolute lg:top-full lg:left-0 lg:mt-2 lg:w-[480px] bg-white dark:bg-slate-900 shadow-2xl lg:rounded-2xl border-t lg:border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col lg:max-h-[600px] animate-in fade-in slide-in-from-top-2 duration-200"
      >
        
        <div className="overflow-y-auto overscroll-contain flex-1 p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
              <p className="text-sm font-medium">Mencari hasil untuk "{searchInput}"...</p>
            </div>
          ) : !hasResults && debouncedInput ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-900 dark:text-white font-bold mb-1">Tidak ada hasil ditemukan</p>
              <p className="text-slate-500 text-sm">Coba gunakan kata kunci lain yang lebih umum.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              
              {/* Users */}
              {results.users.length > 0 && (
                <div className="px-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Pengguna</h3>
                  <div className="space-y-1">
                    {results.users.map((user) => (
                      <Link 
                        key={user.id} 
                        href={getProfileHref(user)}
                        onClick={() => setIsSearchDropdownOpen?.(false)}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                      >
                        <UserAvatar src={user.avatar_url} alt={user.display_name} size="sm" fallbackName={user.display_name} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.display_name}</span>
                            <VerifiedBadge isVerified={user.is_verified} size="sm" />
                          </div>
                          <span className="text-xs text-slate-500 truncate block">@{user.username}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Communities */}
              {results.communities.length > 0 && (
                <div className="px-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Komunitas</h3>
                  <div className="space-y-1">
                    {results.communities.map((community) => (
                      <Link 
                        key={community.id} 
                        href={`/communities/${community.slug}`}
                        onClick={() => setIsSearchDropdownOpen?.(false)}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">{community.name}</span>
                          <span className="text-xs text-slate-500 truncate block">{community.members_count || 0} anggota</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {results.tags.length > 0 && (
                <div className="px-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Topik</h3>
                  <div className="flex flex-wrap gap-2 px-2">
                    {results.tags.map((tag) => (
                      <Link 
                        key={tag.id} 
                        href={`/?tag=${tag.slug}`}
                        onClick={() => setIsSearchDropdownOpen?.(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Hash className="w-3.5 h-3.5" />
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions */}
              {results.questions.length > 0 && (
                <div className="px-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Diskusi Terkait</h3>
                  <div className="space-y-1">
                    {results.questions.map((question) => (
                      <Link 
                        key={question.id} 
                        href={`/questions/${question.id}`}
                        onClick={() => setIsSearchDropdownOpen?.(false)}
                        className="flex gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                          <MessageCircleQuestion className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2">{question.title}</span>
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            {formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: id })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer actions */}
        {hasResults && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
            <Link 
              href={`/?q=${encodeURIComponent(searchInput || '')}`}
              onClick={() => setIsSearchDropdownOpen?.(false)}
              className="block w-full text-center py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            >
              Lihat semua hasil untuk "{searchInput}"
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
