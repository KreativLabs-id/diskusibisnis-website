'use client';

interface VoteSectionProps {
  voteCount: number;
  userVote?: 'upvote' | 'downvote' | null;
  onUpvote: () => void;
  onDownvote: () => void;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  size?: 'small' | 'medium' | 'large';
}

export default function VoteSection({
  voteCount,
  userVote,
  onUpvote,
  onDownvote,
  disabled = false,
  orientation = 'vertical',
  size = 'medium'
}: VoteSectionProps) {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl sm:text-2xl',
    large: 'text-2xl sm:text-3xl'
  };

  const buttonSizeClasses = {
    small: 'w-7 h-7',
    medium: 'w-9 h-9',
    large: 'w-11 h-11'
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <div className={`
      flex items-center justify-center gap-2
      ${orientation === 'vertical' ? 'flex-col' : 'flex-row sm:flex-col'}
    `}>
      {/* Upvote Button */}
      <button
        onClick={onUpvote}
        disabled={disabled}
        className={`
          ${buttonSizeClasses[size]} rounded-lg flex items-center justify-center
          ${userVote === 'upvote'
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={disabled ? 'Login untuk voting' : 'Upvote'}
      >
        <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Vote Count */}
      <div className={`
        flex items-center gap-2 
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row sm:flex-col'}
      `}>
        <div className={`
          ${sizeClasses[size]} font-bold
          ${voteCount > 0 ? 'text-emerald-600' : voteCount < 0 ? 'text-red-600' : 'text-gray-900'}
        `}>
          {voteCount}
        </div>
        <span className={`
          text-xs text-slate-500 font-medium
          ${orientation === 'horizontal' ? 'sm:hidden' : 'hidden sm:block'}
        `}>
          votes
        </span>
      </div>

      {/* Downvote Button */}
      <button
        onClick={onDownvote}
        disabled={disabled}
        className={`
          ${buttonSizeClasses[size]} rounded-lg flex items-center justify-center
          ${userVote === 'downvote'
            ? 'bg-red-100 text-red-600'
            : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={disabled ? 'Login untuk voting' : 'Downvote'}
      >
        <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
