'use client';

import Link from 'next/link';
import { formatDate, formatNumber } from '@/lib/utils';
import { Eye, MessageCircle, ThumbsUp, Clock, User, Award } from 'lucide-react';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

interface Question {
  id: string;
  title: string;
  content: string;
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

export default function QuestionCard({ question }: { question: Question }) {
  const plainContent = (question.content || '').replace(/<[^>]*>/g, '').trim();
  const preview =
    plainContent.length > 150 ? `${plainContent.substring(0, 150)}...` : plainContent;


  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group">
      {/* Content Section - Full Width */}
      <div className="space-y-3">
          {/* Title */}
          <Link href={`/questions/${question.id}`}>
            <h3 className="text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
              {question.title}
            </h3>
          </Link>

          {/* Preview Content */}
          {preview && (
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{preview}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {question.tags && question.tags.slice(0, 4).map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
            {question.tags && question.tags.length > 4 && (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                +{question.tags.length - 4}
              </span>
            )}
          </div>

          {/* Stats Row - Responsive */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 py-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-900">{question.upvotes_count || 0}</span>
              <span className="hidden sm:inline">vote</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className={`w-4 h-4 ${question.has_accepted_answer ? 'text-green-600' : question.answers_count > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className={`font-semibold ${question.has_accepted_answer ? 'text-green-600' : question.answers_count > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                {question.answers_count || 0}
              </span>
              <span className="hidden sm:inline">jawaban</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-700">{formatNumber(question.views_count)}</span>
              <span className="hidden sm:inline">views</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-slate-600">{formatDate(question.created_at)}</span>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-2">
            {question.author_avatar ? (
              <img
                src={question.author_avatar}
                alt={question.author_name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-semibold text-xs">
                {(question.author_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-slate-700">{question.author_name || 'Unknown'}</p>
                <VerifiedBadge isVerified={question.author_is_verified} size="sm" />
                {question.author_reputation >= 100 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-semibold">
                    {formatNumber(question.author_reputation)}
                  </span>
                )}
              </div>
              {question.author_reputation < 100 && question.author_reputation > 0 && (
                <p className="text-xs text-slate-500">{question.author_reputation} poin</p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
