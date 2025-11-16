import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoBannerProps {
  title: string;
  description: string;
  icon: LucideIcon;
  points?: Array<{
    text: string;
    color?: 'emerald' | 'green' | 'blue';
  }>;
  variant?: 'default' | 'success' | 'info';
  className?: string;
}

export default function InfoBanner({ 
  title, 
  description, 
  icon: Icon, 
  points,
  variant = 'default',
  className = ''
}: InfoBannerProps) {
  const variantClasses = {
    default: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200',
    success: 'bg-gradient-to-r from-green-50 to-green-100 border-green-200',
    info: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
  };

  const iconClasses = {
    default: 'bg-emerald-600',
    success: 'bg-green-600', 
    info: 'bg-blue-600'
  };

  const pointColors = {
    emerald: 'bg-emerald-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500'
  };

  return (
    <div className={`${variantClasses[variant]} border rounded-xl p-4 sm:p-6 mb-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 ${iconClasses[variant]} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {title}
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-slate-700">
              {description}
            </p>
            {points && points.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 text-sm text-slate-600">
                {points.map((point, index) => (
                  <span key={index} className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${pointColors[point.color || 'emerald']} rounded-full`}></span>
                    <span>{point.text}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
