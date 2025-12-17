'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const icon = theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Laptop className="w-5 h-5" />;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
            >
                {icon}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={() => { setTheme('light'); setIsOpen(false); }}
                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${theme === 'light' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <Sun className="w-4 h-4" />
                        <span>Light</span>
                    </button>
                    <button
                        onClick={() => { setTheme('dark'); setIsOpen(false); }}
                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${theme === 'dark' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <Moon className="w-4 h-4" />
                        <span>Dark</span>
                    </button>
                    <button
                        onClick={() => { setTheme('system'); setIsOpen(false); }}
                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${theme === 'system' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <Laptop className="w-4 h-4" />
                        <span>System</span>
                    </button>
                </div>
            )}
        </div>
    );
}
