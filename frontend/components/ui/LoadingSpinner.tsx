import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Memuat...', 
  className = '',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2', 
    lg: 'h-8 w-8 border-3',
    xl: 'h-16 w-16 border-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base', 
    xl: 'text-xl'
  };

  const spinner = (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div 
        className={`animate-spin rounded-full border-emerald-600 border-t-transparent ${sizeClasses[size]}`}
      />
      {text && (
        <span className={`text-slate-600 font-medium ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            className={`animate-spin rounded-full border-emerald-600 border-t-transparent mx-auto mb-4 ${sizeClasses[size]}`}
          />
          {text && (
            <p className={`text-slate-600 font-medium ${textSizeClasses[size]}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return spinner;
}
