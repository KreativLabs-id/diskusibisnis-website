'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface SearchContextType {
  searchInput: string;
  setSearchInput: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isNavbarSearchOpen: boolean;
  setIsNavbarSearchOpen: (open: boolean) => void;
  isSearchDropdownOpen: boolean;
  setIsSearchDropdownOpen: (open: boolean) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchSubmit: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSearchClear: () => void;
  isScrolled: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavbarSearchOpen, setIsNavbarSearchOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial search query from URL on mount
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && pathname === '/') {
      setSearchInput(q);
      setSearchQuery(q);
    }
  }, [searchParams, pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // Threshold 100px is past the hero area so the search button appears when user scrolls down
      const scrolled = window.scrollY > 100;
      setIsScrolled(scrolled);
      if (!scrolled) {
        setIsNavbarSearchOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    
    // Only update query instantly on homepage, otherwise wait for submit
    if (pathname === '/') {
      searchDebounceRef.current = setTimeout(() => {
        setSearchQuery(val.trim());
      }, 300);
    }
  }, [pathname]);

  const handleSearchSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsSearchDropdownOpen(false);
      const val = searchInput.trim();
      
      if (pathname !== '/') {
        router.push(`/?q=${encodeURIComponent(val)}`);
      } else {
        setSearchQuery(val);
      }
    }
  }, [searchInput, pathname, router]);

  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setIsSearchDropdownOpen(false);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchInput,
        setSearchInput,
        searchQuery,
        setSearchQuery,
        isNavbarSearchOpen,
        setIsNavbarSearchOpen,
        isSearchDropdownOpen,
        setIsSearchDropdownOpen,
        handleSearchChange,
        handleSearchSubmit,
        handleSearchClear,
        isScrolled,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  return context;
}
