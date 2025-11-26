'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isVoting, setIsVoting] = useState(false);
  const prevVoteCountRef = useRef(voteCount);
  const lastVoteTimeRef = useRef(0);
  const VOTE_COOLDOWN = 500; // 500ms cooldown between votes

  // Debounced vote handler to prevent spam
  const handleVoteWithDebounce = useCallback((voteAction: () => void) => {
    const now = Date.now();
    if (now - lastVoteTimeRef.current < VOTE_COOLDOWN || isVoting) {
      return; // Ignore if within cooldown or already voting
    }
    
    lastVoteTimeRef.current = now;
    setIsVoting(true);
    
    // Execute vote action
    voteAction();
    
    // Reset voting state after a short delay
    setTimeout(() => {
      setIsVoting(false);
    }, VOTE_COOLDOWN);
  }, [isVoting]);

  const handleUpvote = useCallback(() => {
    handleVoteWithDebounce(onUpvote);
  }, [handleVoteWithDebounce, onUpvote]);

  const handleDownvote = useCallback(() => {
    handleVoteWithDebounce(onDownvote);
  }, [handleVoteWithDebounce, onDownvote]);

  // Sync displayCount when voteCount changes from parent (e.g., after API response)
  useEffect(() => {
    const prevCount = prevVoteCountRef.current;
    
    // Only animate if the change is small (typical vote change is -2 to +2)
    const difference = Math.abs(voteCount - prevCount);
    
    if (difference <= 2 && voteCount !== displayCount) {
      // Small change - animate smoothly
      setIsCountAnimating(true);
      
      const duration = 300;
      const steps = 10;
      const startCount = displayCount;
      const increment = (voteCount - startCount) / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep < steps) {
          setDisplayCount(Math.round(startCount + (increment * currentStep)));
        } else {
          setDisplayCount(voteCount);
          setIsCountAnimating(false);
          clearInterval(timer);
        }
      }, duration / steps);

      prevVoteCountRef.current = voteCount;
      return () => clearInterval(timer);
    } else if (voteCount !== displayCount) {
      // Large change or initial load - set immediately without animation
      setDisplayCount(voteCount);
      prevVoteCountRef.current = voteCount;
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
