import React from 'react';

interface LottieLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function LottieLoader({ size = 'md', className = '' }: LottieLoaderProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}
