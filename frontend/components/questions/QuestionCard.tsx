'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { MouseEvent } from 'react';
import { formatDate, formatNumber } from '@/lib/utils';
import { Eye, MessageCircle, ThumbsUp, Clock, User, Award, Flag, ChevronRight } from 'lucide-react';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import { getProfileHref } from '@/lib/profile';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question_id?: string;
  title: string;
  content: string;
  images?: string[];
  author_id?: string;
  author_username?: string;
  author_name: string;
  author_avatar: string;
  author_reputation: number;
  author_is_verified: boolean;
  upvotes_count: number;
  views_count: number;
  answers_count: number;
  has_accepted_answer: boolean;
  user_vote?: 'upvote' | 'downvote' | null;
  userVote?: 'upvote' | 'downvote' | null;
  tags: Array<{ id: string; name: string; slug: string }>;
  created_at: string;
}

interface QuestionCardProps {
  question: Question;
  onReport?: (questionId: string, title: string) => void;
  currentUserId?: string;
}

export default function QuestionCard({ question, onReport, currentUserId }: QuestionCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const plainContent = (question.content || '').replace(/<[^>]*>/g, '').trim();
  const questionId = question.id || question.question_id;

  const authorProfileHref = getProfileHref({
    username: question.author_username,
    author_name: question.author_name,
  });
  
  const userVote = question.user_vote ?? question.userVote ?? null;
  const preview = plainContent.length > 150 ? `${plainContent.substring(0, 150)}...` : plainContent;

  const currentRoute = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const questionHref = questionId
    ? `/questions/${questionId}?from=${encodeURIComponent(currentRoute)}`
    : '#';
  
  const persistListScrollPosition = () => {
    if (typeof window === 'undefined') return;
    const routeKey = `${window.location.pathname}${window.location.search}`;
    const key = `list_scroll:${routeKey}`;
    sessionStorage.setItem(key, String(window.scrollY));
    sessionStorage.setItem('list_scroll_restore_target', routeKey);
  };

  return (
    <div 
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
      onClick={() => {
        if (!questionId) return;
        persistListScrollPosition();
        router.push(questionHref);
      }}
    >
      {/* Top Meta: Author & Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link
            href={authorProfileHref}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
            className="flex items-center gap-2 group/author"
          >
            <UserAvatar
              src={question.author_avatar}
              alt={question.author_name}
              fallbackName={question.author_name}
              size="sm"
              className="w-6 h-6 sm:w-8 sm:h-8 ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover/author:underline decoration-slate-400 underline-offset-4 line-clamp-1">
                {question.author_name}
              </span>
              {question.author_is_verified && (
                <VerifiedBadge isVerified={true} size="sm" />
              )}
            </div>
          </Link>
          <span className="text-slate-300 dark:text-slate-600 text-sm">•</span>
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {formatDate(question.created_at)}
          </span>
        </div>

        {onReport && currentUserId && currentUserId !== question.author_id && (
          <button
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              if (!questionId) return;
              onReport(questionId, question.title);
            }}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <Flag className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            {question.title}
          </h2>
          
          {preview && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {preview}
            </p>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {question.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  onClick={(e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Image */}
        {question.images && question.images.length > 0 && (
          <div className="shrink-0">
            <div className="relative h-20 sm:h-24 w-28 sm:w-32 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <Image
                src={question.images[0]}
                alt={question.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 112px, 128px"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats - Reddit/X style */}
      <div className="mt-2 flex items-center gap-1 sm:gap-2 -ml-2">
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-sm font-medium",
          userVote === 'upvote' ? "text-emerald-600" : userVote === 'downvote' ? "text-red-500" : "text-slate-500 dark:text-slate-400"
        )}>
          <ThumbsUp className={cn("w-4 h-4", userVote === 'downvote' && "rotate-180")} />
          <span>{formatNumber(question.upvotes_count || 0)}</span>
        </div>

        <div className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium",
          question.answers_count > 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
        )}>
          <MessageCircle className="w-4 h-4" />
          <span>{formatNumber(question.answers_count || 0)}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-500 dark:text-slate-400">
          <Eye className="w-4 h-4" />
          <span>{formatNumber(question.views_count)}</span>
        </div>
      </div>
    </div>
  );
}
