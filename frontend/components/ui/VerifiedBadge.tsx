interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VerifiedBadge({ isVerified, size = 'sm', className = '' }: VerifiedBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const checkmarkSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };

  return (
    <div 
      className={`${sizeClasses[size]} bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      title="Pengguna Terverifikasi"
    >
      {/* Bold checkmark with stroke */}
      <svg 
        className={`${checkmarkSizeClasses[size]} text-white`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}
