'use client';

import { MessageSquare, CheckCircle } from 'lucide-react';

interface ProfileActivityTabsProps {
  activeTab: 'questions' | 'answers';
  setActiveTab: (tab: 'questions' | 'answers') => void;
  counts: {
    questions: number;
    answers: number;
  };
}

export default function ProfileActivityTabs({ activeTab, setActiveTab, counts }: ProfileActivityTabsProps) {
  const tabs = [
    { id: 'questions', label: 'Pertanyaan', icon: MessageSquare, count: counts.questions },
    { id: 'answers', label: 'Jawaban', icon: CheckCircle, count: counts.answers },
  ] as const;

  return (
    <div className="flex items-center gap-4 sm:gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 px-1 text-sm font-bold transition-all relative whitespace-nowrap ${
              isActive 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              isActive 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {tab.count}
            </span>
            
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
