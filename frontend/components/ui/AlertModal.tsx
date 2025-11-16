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
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
      {/* Alert Modal */}
      <div className={`relative bg-white rounded-xl shadow-xl max-w-sm w-full border ${config.borderColor} animate-in slide-in-from-top duration-300 pointer-events-auto`}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={`${config.bgColor} p-2 rounded-lg shrink-0`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-600">{message}</p>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-slate-100 rounded-b-xl overflow-hidden">
          <div className={`h-full ${config.iconColor.replace('text', 'bg')} animate-progress`} />
        </div>
      </div>
      
      <style jsx>{`
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
