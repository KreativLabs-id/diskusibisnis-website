import { Suspense } from 'react';
import HomePage from '@/components/pages/HomePage';

// Force dynamic rendering to avoid prerender errors with client contexts
export const dynamic = 'force-dynamic';

function HomePageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage />
    </Suspense>
  );
}
