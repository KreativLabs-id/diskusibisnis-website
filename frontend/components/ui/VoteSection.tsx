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
    small: 'text-[15px]',
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
      flex items-center justify-center
      ${orientation === 'vertical' 
        ? 'flex-col gap-2' 
        : 'flex-row gap-1 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors rounded-full px-1 py-1'}
    `}>
      {/* Upvote Button */}
      <button
        onClick={onUpvote}
        className={`
          flex items-center justify-center transition-colors p-1 rounded-full
          ${userVote === 'upvote'
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        title={disabled ? 'Login untuk voting' : userVote === 'upvote' ? 'Batalkan upvote' : 'Upvote'}
      >
        <ChevronUp
          className={iconSizeClasses[size]}
          strokeWidth={userVote === 'upvote' ? 3 : 2}
        />
      </button>

      {/* Vote Count */}
      <div className={`
        flex items-center justify-center font-bold
        ${orientation === 'horizontal' ? 'px-2' : 'py-1'}
        ${sizeClasses[size]}
        ${userVote === 'upvote'
          ? 'text-emerald-600 dark:text-emerald-400'
          : userVote === 'downvote'
            ? 'text-red-500 dark:text-red-400'
            : 'text-slate-700 dark:text-slate-300'
        }
      `}>
        {voteCount}
      </div>

      {/* Downvote Button */}
      <button
        onClick={onDownvote}
        className={`
          flex items-center justify-center transition-colors p-1 rounded-full
          ${userVote === 'downvote'
            ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
            : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        title={disabled ? 'Login untuk voting' : userVote === 'downvote' ? 'Batalkan downvote' : 'Downvote'}
      >
        <ChevronDown
          className={iconSizeClasses[size]}
          strokeWidth={userVote === 'downvote' ? 3 : 2}
        />
      </button>

      {/* Login hint for guests */}
      {disabled && showLoginHint && orientation === 'vertical' && (
        <div className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 truncate">
          Login
        </div>
      )}
    </div>
  );
}

