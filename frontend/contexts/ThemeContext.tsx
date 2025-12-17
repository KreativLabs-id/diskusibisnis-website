'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // Initial load
    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme;
        if (stored) {
            setTheme(stored);
        }
        setMounted(true);
    }, []);

    // Update DOM and resolved theme
    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        let targetTheme = theme;

        // Explicit system handling
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
            setResolvedTheme(systemTheme);
        } else {
            root.classList.add(theme);
            setResolvedTheme(theme);
        }

        if (theme !== 'system') {
            localStorage.setItem('theme', theme);
        } else {
            localStorage.removeItem('theme');
        }
    }, [theme, mounted]);

    // Listen for system changes
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');

        const listener = () => {
            if (theme === 'system') {
                const newTheme = media.matches ? 'dark' : 'light';
                setResolvedTheme(newTheme);
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(newTheme);
            }
        };

        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [theme]);

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
