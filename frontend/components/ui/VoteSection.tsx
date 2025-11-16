'use client';

import { useState, useEffect } from 'react';
import VoteButton from './VoteButton';

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
  const [displayCount, setDisplayCount] = useState(voteCount);
  const [isCountAnimating, setIsCountAnimating] = useState(false);

  // Smooth number animation when vote count changes
  useEffect(() => {
    if (voteCount !== displayCount) {
      setIsCountAnimating(true);
      
      const duration = 500;
      const steps = 15;
      const difference = voteCount - displayCount;
      const increment = difference / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setDisplayCount(prev => {
            const next = prev + increment;
            return Math.round(next);
          });
        } else {
          setDisplayCount(voteCount);
          setIsCountAnimating(false);
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [voteCount, displayCount]);

  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-xl sm:text-2xl',
    large: 'text-2xl sm:text-3xl'
  };

  return (
    <div className={`
      flex items-center justify-center gap-3
      ${orientation === 'vertical' ? 'flex-col' : 'flex-row sm:flex-col'}
    `}>
      {/* Upvote Button */}
      <VoteButton
        type="upvote"
        isActive={userVote === 'upvote'}
        count={voteCount}
        onClick={onUpvote}
        disabled={disabled}
        title={disabled ? 'Login untuk voting' : 'Upvote'}
      />

      {/* Vote Count with Animation */}
      <div className={`
        flex items-center gap-2 
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row sm:flex-col'}
      `}>
        <div className={`
          ${sizeClasses[size]} font-bold transition-all duration-300
          ${isCountAnimating ? 'scale-110 text-emerald-600' : 'scale-100 text-gray-900'}
          ${displayCount > 0 ? 'text-emerald-600' : displayCount < 0 ? 'text-red-600' : 'text-gray-900'}
        `}>
          {displayCount > 0 && '+'}
          {displayCount}
        </div>
        <span className={`
          text-xs text-slate-500 font-medium
          ${orientation === 'horizontal' ? 'sm:hidden' : 'hidden sm:block'}
        `}>
          votes
        </span>
      </div>

      {/* Downvote Button */}
      <VoteButton
        type="downvote"
        isActive={userVote === 'downvote'}
        count={voteCount}
        onClick={onDownvote}
        disabled={disabled}
        title={disabled ? 'Login untuk voting' : 'Downvote'}
      />
    </div>
  );
}
