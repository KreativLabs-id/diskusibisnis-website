import { Suspense } from 'react';
import QuestionsPageContent from '@/components/pages/QuestionsPageContent';
import QuestionCardSkeleton from '@/components/questions/QuestionCardSkeleton';

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
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <QuestionCardSkeleton key={i} />
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
