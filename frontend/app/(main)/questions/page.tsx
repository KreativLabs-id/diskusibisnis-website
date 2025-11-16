import { Suspense } from 'react';
import QuestionsPageContent from '@/components/pages/QuestionsPageContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function QuestionsPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="h-8 bg-slate-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-32"></div>
          </div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>

        {/* Sort Options Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <div className="h-4 bg-slate-200 rounded w-16"></div>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-slate-200 rounded w-20"></div>
            ))}
          </div>
        </div>

        {/* Questions List Skeleton */}
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg sm:rounded-2xl border border-slate-200 p-3 sm:p-5">
              <div className="flex gap-3 sm:gap-6">
                <div className="flex flex-col gap-2 sm:gap-4">
                  <div className="min-w-[50px] sm:min-w-[70px]">
                    <div className="h-6 sm:h-8 bg-slate-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                  </div>
                  <div className="min-w-[50px] sm:min-w-[70px] h-12 sm:h-16 bg-slate-200 rounded-lg sm:rounded-2xl"></div>
                </div>
                <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-6 bg-slate-200 rounded-full w-16"></div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 sm:pt-2">
                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-6 h-6 sm:w-9 sm:h-9 bg-slate-200 rounded-full"></div>
                      <div>
                        <div className="h-3 bg-slate-200 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-slate-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<QuestionsPageSkeleton />}>
      <QuestionsPageContent />
    </Suspense>
  );
}
