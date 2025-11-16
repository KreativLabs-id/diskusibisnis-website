'use client';

import { useState, useEffect } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';

interface VoteButtonProps {
  type: 'upvote' | 'downvote';
  isActive: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

export default function VoteButton({ 
  type, 
  isActive, 
  count, 
  onClick, 
  disabled = false,
  title = ''
}: VoteButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const [displayCount, setDisplayCount] = useState(count);

  const Icon = type === 'upvote' ? ArrowBigUp : ArrowBigDown;
  const activeColor = type === 'upvote' ? 'text-emerald-600' : 'text-red-600';
  const activeBg = type === 'upvote' ? 'bg-emerald-50' : 'bg-red-50';
  const hoverColor = type === 'upvote' ? 'hover:text-emerald-500' : 'hover:text-red-500';
  const hoverBg = type === 'upvote' ? 'hover:bg-emerald-50' : 'hover:bg-red-50';
  const particleColor = type === 'upvote' ? 'bg-emerald-400' : 'bg-red-400';

  // Animate number when count changes
  useEffect(() => {
    if (count !== prevCount) {
      const duration = 500;
      const steps = 20;
      const increment = (count - prevCount) / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setDisplayCount(Math.round(prevCount + (increment * currentStep)));
        } else {
          setDisplayCount(count);
          clearInterval(timer);
        }
      }, duration / steps);

      setPrevCount(count);
      return () => clearInterval(timer);
    }
  }, [count, prevCount]);

  const handleClick = () => {
    if (disabled) return;
    
    // Trigger animations
    setIsAnimating(true);
    setShowParticles(true);
    
    // Call the onClick handler
    onClick();
    
    // Reset animation states
    setTimeout(() => setIsAnimating(false), 600);
    setTimeout(() => setShowParticles(false), 800);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative p-2.5 rounded-xl transition-all duration-300 group
        ${isActive 
          ? `${activeBg} ${activeColor} shadow-sm` 
          : disabled 
            ? 'opacity-50 cursor-not-allowed text-gray-400' 
            : `text-gray-400 ${hoverBg} ${hoverColor}`
        }
        ${isAnimating ? 'scale-110' : 'scale-100'}
        ${!disabled && 'hover:scale-105 active:scale-95'}
      `}
      title={title}
    >
      {/* Ripple effect */}
      {isAnimating && !disabled && (
        <span 
          className={`
            absolute inset-0 rounded-xl
            ${type === 'upvote' ? 'bg-emerald-400' : 'bg-red-400'}
            animate-ping opacity-20
          `}
        />
      )}

      {/* Particles */}
      {showParticles && !disabled && (
        <>
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className={`
                absolute w-1.5 h-1.5 ${particleColor} rounded-full
                animate-particle opacity-0
              `}
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(0)`,
                animation: `particle-burst 0.8s ease-out ${i * 0.05}s forwards`,
              }}
            />
          ))}
        </>
      )}

      {/* Icon with bounce animation */}
      <Icon 
        className={`
          w-7 h-7 relative z-10 transition-all duration-300
          ${isActive ? 'fill-current' : ''}
          ${isAnimating ? 'animate-bounce-scale' : ''}
        `}
      />

      {/* Add custom animations to global CSS */}
      <style jsx>{`
        @keyframes bounce-scale {
          0%, 100% { transform: scale(1) translateY(0); }
          25% { transform: scale(1.2) translateY(-4px); }
          50% { transform: scale(0.95) translateY(2px); }
          75% { transform: scale(1.05) translateY(-2px); }
        }

        @keyframes particle-burst {
          0% {
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-30px);
            opacity: 0;
          }
        }

        .animate-bounce-scale {
          animation: bounce-scale 0.6s ease-out;
        }

        .animate-particle {
          animation: particle-burst 0.8s ease-out forwards;
        }
      `}</style>
    </button>
  );
}
