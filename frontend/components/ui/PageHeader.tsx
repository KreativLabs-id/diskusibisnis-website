import React from 'react';
import Link from 'next/link';
import { LucideIcon, Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionButton?: {
    text: string;
    href: string;
    icon?: LucideIcon;
  };
  children?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  actionButton,
  children 
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-600" />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
          </div>
          {description && (
            <p className="text-slate-600 text-sm sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actionButton && (
          <Link
            href={actionButton.href}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base"
          >
            {actionButton.icon ? <actionButton.icon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {actionButton.text}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
