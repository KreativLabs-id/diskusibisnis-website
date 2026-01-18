'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDate, formatNumber } from '@/lib/utils';
import { Eye, MessageCircle, ThumbsUp, Clock, User, Award, Flag, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import UserAvatar from '@/components/ui/UserAvatar';
import { getReputationRingColor } from '@/components/ui/ReputationBadge';

// Blur placeholder for loading
const shimmerBlur = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=';

interface Question {
  id: string;
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
  const plainContent = (question.content || '').replace(/<[^>]*>/g, '').trim();

  // Use author_username if available, otherwise fallback to author_id (UUID)
  const authorProfileLink = question.author_username || question.author_id || 'unknown';

  const preview =
    plainContent.length > 150 ? `${plainContent.substring(0, 150)}...` : plainContent;

  // Get ring color based on reputation
  const ringColor = getReputationRingColor(question.author_reputation);

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:shadow-md dark:hover:shadow-emerald-900/10 transition-all duration-200 group cursor-pointer relative mb-4">
      {/* Report Button - Top Right */}
      {onReport && currentUserId && currentUserId !== question.author_id && (
        <div className="absolute top-4 right-3 sm:right-4 lg:right-6 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReport(question.id, question.title);
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Laporkan Pertanyaan"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        className="space-y-3"
        onClick={() => router.push(`/questions/${question.id}`)}
      >
        {/* Title */}
        <Link
          href={`/questions/${question.id}`}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2 leading-tight mt-1">
            {question.title}
          </h3>
        </Link>

        {/* Preview Content */}
        {preview && (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{preview}</p>
        )}

        {/* Question Image Thumbnail */}
        {question.images && question.images.length > 0 && (
          <div className="mt-2">
            <div className="relative aspect-video max-w-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
              <Image
                src={question.images[0]}
                alt={question.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 576px"
                placeholder="blur"
                blurDataURL={shimmerBlur}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {question.tags && question.tags.slice(0, 4).map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              {tag.name}
            </Link>
          ))}
          {question.tags && question.tags.length > 4 && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
              +{question.tags.length - 4}
            </span>
          )}
        </div>

        {/* Stats Row - Responsive */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 py-2 border-t border-slate-100 dark:border-slate-700/50 mt-2">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">{question.upvotes_count || 0}</span>
            <span className="hidden sm:inline">vote</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className={`w-4 h-4 ${question.has_accepted_answer ? 'text-green-600 dark:text-green-500' : question.answers_count > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400'}`} />
            <span className={`font-semibold ${question.has_accepted_answer ? 'text-green-600 dark:text-green-500' : question.answers_count > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-900 dark:text-slate-200'}`}>
              {question.answers_count || 0}
            </span>
            <span className="hidden sm:inline">jawaban</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{formatNumber(question.views_count)}</span>
            <span className="hidden sm:inline">views</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-slate-600 dark:text-slate-400">{formatDate(question.created_at)}</span>
          </div>
        </div>

        {/* Author Info - with reputation ring color */}
        <div className="flex items-center gap-2 pt-1">
          <div className={`rounded-full ring-2 ${ringColor}`}>
            <UserAvatar
              src={question.author_avatar}
              alt={question.author_name}
              size="xs"
              fallbackName={question.author_name}
            />
          </div>
          <Link
            href={`/profile/${authorProfileLink}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="flex items-center gap-1.5 group/author"
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover/author:text-emerald-600 dark:group-hover/author:text-emerald-400 transition-colors">{question.author_name || 'Unknown'}</p>
            <VerifiedBadge isVerified={question.author_is_verified} size="sm" />
          </Link>
        </div>
      </div>
    </div>
  );
}

