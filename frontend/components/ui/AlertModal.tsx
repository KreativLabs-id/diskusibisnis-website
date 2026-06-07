'use client';

import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export default function AlertModal({ isOpen, onClose, type = 'info', title, message }: AlertModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 2 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      borderColor: 'border-slate-200 dark:border-slate-700'
    },
    error: {
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-700',
      borderColor: 'border-slate-200 dark:border-slate-700'
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      borderColor: 'border-slate-200 dark:border-slate-700'
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      borderColor: 'border-slate-200 dark:border-slate-700'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pointer-events-none">
      {/* Alert Modal */}
      <div className={`relative bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-md w-full border ${config.borderColor} animate-in slide-in-from-top duration-300 pointer-events-auto`}>
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className={`${config.iconBg} dark:bg-slate-800 p-2 rounded-md shrink-0`}>
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-[2px] bg-slate-100 dark:bg-slate-800 rounded-b-lg overflow-hidden">
          <div className="h-full bg-slate-700 dark:bg-slate-300 animate-progress" />
        </div>
      </div>
      
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress 2s linear;
        }
      `}</style>
    </div>
  );
}
