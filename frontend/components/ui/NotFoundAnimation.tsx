'use client';

import dynamic from 'next/dynamic';

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  {
    ssr: false,
    loading: () => <div className="w-56 h-56 sm:w-64 sm:h-64 mx-auto" />,
  }
);

interface NotFoundAnimationProps {
  className?: string;
}

export default function NotFoundAnimation({ className = 'w-60 h-60 sm:w-72 sm:h-72 mx-auto' }: NotFoundAnimationProps) {
  return (
    <div className={className}>
      <DotLottieReact
        src="/404.lottie"
        loop
        autoplay
      />
    </div>
  );
}
