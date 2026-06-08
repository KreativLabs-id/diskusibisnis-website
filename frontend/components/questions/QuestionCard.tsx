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
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5 cursor-pointer overflow-hidden"
      onClick={() => {
        if (!questionId) return;
        persistListScrollPosition();
        router.push(questionHref);
      }}
    >
      {/* Decorative Gradient Blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

      {/* Top Meta: Author & Time */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <Link
            href={authorProfileHref}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
            className="flex items-center gap-2 group/author"
          >
            <div className="relative">
              <UserAvatar
                src={question.author_avatar}
                alt={question.author_name}
                fallbackName={question.author_name}
                size="sm"
                className="w-7 h-7 sm:w-8 sm:h-8 ring-1 ring-slate-200 dark:ring-slate-700 group-hover/author:ring-emerald-500/50 transition-all"
              />
              {question.author_is_verified && (
                <div className="absolute -bottom-1 -right-1">
                  <VerifiedBadge isVerified={true} size="sm" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-slate-100 group-hover/author:text-emerald-600 transition-colors line-clamp-1">
                {question.author_name}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {formatDate(question.created_at)}
              </span>
            </div>
          </Link>
        </div>

        {onReport && currentUserId && currentUserId !== question.author_id && (
          <button
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              if (!questionId) return;
              onReport(questionId, question.title);
            }}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
          >
            <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
            {question.title}
          </h2>
          
          {preview && (
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 sm:mb-6">
              {preview}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {question.tags?.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                onClick={(e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
                className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-all border border-transparent"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Thumbnail Image */}
        {question.images && question.images.length > 0 && (
          <div className="shrink-0">
            <div className="relative h-40 sm:h-48 lg:h-28 w-full lg:w-40 rounded-xl sm:rounded-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 group-hover:ring-emerald-500/20 transition-all">
              <Image
                src={question.images[0]}
                alt={question.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 160px"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className={cn(
            "flex items-center gap-2 text-[11px] font-bold transition-colors",
            userVote === 'upvote' ? "text-emerald-600" : userVote === 'downvote' ? "text-red-500" : "text-slate-400"
          )}>
            <ThumbsUp className={cn("w-4 h-4", userVote === 'downvote' && "rotate-180")} />
            <span>{formatNumber(question.upvotes_count || 0)} suara</span>
          </div>

          <div className={cn(
            "flex items-center gap-2 text-[11px] font-bold transition-colors",
            question.answers_count > 0 ? "text-emerald-600" : "text-slate-400"
          )}>
            <MessageCircle className="w-4 h-4" />
            <span>{formatNumber(question.answers_count || 0)} jawaban</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Eye className="w-4 h-4" />
            <span>{formatNumber(question.views_count)} dilihat</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
          Detail Diskusi <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
