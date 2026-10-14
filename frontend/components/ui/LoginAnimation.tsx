'use client';

import dynamic from 'next/dynamic';
import animationData from '@/public/lottie/Team.json';

const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <div className="w-full h-44 xl:h-52 mx-auto" />,
});

interface LoginAnimationProps {
  className?: string;
}

export default function LoginAnimation({
  className = 'w-full max-w-[280px] xl:max-w-[320px] mx-auto',
}: LoginAnimationProps) {
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
