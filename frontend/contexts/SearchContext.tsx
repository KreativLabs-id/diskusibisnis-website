'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

interface SearchContextType {
  searchInput: string;
  setSearchInput: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isNavbarSearchOpen: boolean;
  setIsNavbarSearchOpen: (open: boolean) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchClear: () => void;
  isScrolled: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavbarSearchOpen, setIsNavbarSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

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
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(val.trim());
    }, 300);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
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
        handleSearchChange,
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
