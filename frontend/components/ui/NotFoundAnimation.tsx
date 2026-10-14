'use client';

import dynamic from 'next/dynamic';
import animationData from '@/public/lottie/404.json';

const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <div className="w-60 h-60 sm:w-72 sm:h-72 mx-auto" />,
});

interface NotFoundAnimationProps {
  className?: string;
}

export default function NotFoundAnimation({ className = 'w-60 h-60 sm:w-72 sm:h-72 mx-auto' }: NotFoundAnimationProps) {
  return (
    <div className={className}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
      />
    </div>
  );
}
