'use client';

import { LogIn, ChevronUp, ChevronDown } from 'lucide-react';

interface VoteSectionProps {
  voteCount: number;
  userVote?: 'upvote' | 'downvote' | null;
  onUpvote: () => void;
  onDownvote: () => void;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  size?: 'small' | 'medium' | 'large';
  showLoginHint?: boolean;
}

export default function VoteSection({
  voteCount,
  userVote,
  onUpvote,
  onDownvote,
  disabled = false,
  orientation = 'vertical',
  size = 'medium',
  showLoginHint = false
}: VoteSectionProps) {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl sm:text-2xl',
    large: 'text-2xl sm:text-3xl'
  };

  const buttonSizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-7 h-7'
  };

  return (
    <div className={`
      flex items-center justify-center gap-1.5
      ${orientation === 'vertical' ? 'flex-col' : 'flex-row sm:flex-col'}
    `}>
      {/* Upvote Button */}
      <button
        onClick={onUpvote}
        className={`
          ${buttonSizeClasses[size]} rounded-xl flex items-center justify-center transition-all duration-200 font-bold
          ${userVote === 'upvote'
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400/50'
            : disabled
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-500 cursor-pointer'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer hover:scale-105'
          }
        `}
        title={disabled ? 'Login untuk voting' : userVote === 'upvote' ? 'Batalkan upvote' : 'Upvote'}
      >
        <ChevronUp
          className={iconSizeClasses[size]}
          strokeWidth={userVote === 'upvote' ? 3 : 2.5}
        />
      </button>

      {/* Vote Count */}
      <div className={`
        flex items-center gap-1.5 py-1
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row sm:flex-col'}
      `}>
        <div className={`
          ${sizeClasses[size]} font-bold tabular-nums
          ${userVote === 'upvote'
            ? 'text-emerald-600 dark:text-emerald-400'
            : userVote === 'downvote'
              ? 'text-red-600 dark:text-red-400'
              : voteCount > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : voteCount < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-700 dark:text-slate-300'
          }
        `}>
          {voteCount > 0 ? `+${voteCount}` : voteCount}
        </div>
        <span className={`
          text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide
          ${orientation === 'horizontal' ? 'sm:hidden' : 'hidden sm:block'}
        `}>
          votes
        </span>
      </div>

      {/* Downvote Button */}
      <button
        onClick={onDownvote}
        className={`
          ${buttonSizeClasses[size]} rounded-xl flex items-center justify-center transition-all duration-200 font-bold
          ${userVote === 'downvote'
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105 ring-2 ring-red-400/50'
            : disabled
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 cursor-pointer'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 cursor-pointer hover:scale-105'
          }
        `}
        title={disabled ? 'Login untuk voting' : userVote === 'downvote' ? 'Batalkan downvote' : 'Downvote'}
      >
        <ChevronDown
          className={iconSizeClasses[size]}
          strokeWidth={userVote === 'downvote' ? 3 : 2.5}
        />
      </button>

      {/* Login hint for guests */}
      {disabled && showLoginHint && orientation === 'vertical' && (
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
          <LogIn className="w-3 h-3" />
          <span>Login to vote</span>
        </div>
      )}
    </div>
  );
}

