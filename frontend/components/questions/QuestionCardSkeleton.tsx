import React from 'react';

export default function QuestionCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 sm:p-8 animate-pulse">
      {/* Top Meta */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>

      {/* Title and Content */}
      <div className="space-y-3 mb-4 sm:mb-5">
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="h-6 w-14 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center gap-4 sm:gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="w-6 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="w-6 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="w-6 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}
