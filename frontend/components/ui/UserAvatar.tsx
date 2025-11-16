'use client';

import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackName?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = 'User',
  size = 'md',
  className = '',
  fallbackName,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const showFallback = !src || imageError;
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];

  // Get first letter of name for fallback
  const fallbackLetter = fallbackName?.charAt(0)?.toUpperCase() || alt?.charAt(0)?.toUpperCase() || 'U';

  if (showFallback) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 ${className}`}
        title={alt}
      >
        {fallbackName ? (
          <span className="font-semibold text-emerald-700">{fallbackLetter}</span>
        ) : (
          <User className={`${iconSize} text-emerald-600`} />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

export default UserAvatar;
