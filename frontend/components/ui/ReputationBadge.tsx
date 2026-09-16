'use client';

import { Award, Zap, Crown, Trophy, Sparkles } from 'lucide-react';

interface ReputationBadgeProps {
    reputationPoints: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

interface ReputationLevel {
    name: string;
    minPoints: number;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    gradient: string;
}

// Definisi 4 level berdasarkan reputasi
const getReputationLevel = (points: number): ReputationLevel => {
    if (points >= 5000) {
        return {
            name: 'Legend',
            minPoints: 5000,
            color: 'text-amber-600',
            bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
            borderColor: 'border-amber-300',
            gradient: 'from-amber-500 to-yellow-500',
            icon: <Crown className="w-full h-full" />,
        };
    }
    if (points >= 1000) {
        return {
            name: 'Master',
            minPoints: 1000,
            color: 'text-purple-600',
            bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50',
            borderColor: 'border-purple-300',
            gradient: 'from-purple-500 to-pink-500',
            icon: <Trophy className="w-full h-full" />,
        };
    }
    if (points >= 250) {
        return {
            name: 'Expert',
            minPoints: 250,
            color: 'text-emerald-600',
            bgColor: 'bg-gradient-to-r from-emerald-50 to-teal-50',
            borderColor: 'border-emerald-300',
            gradient: 'from-emerald-500 to-teal-500',
            icon: <Zap className="w-full h-full" />,
        };
    }
    // Newbie (0-249) - no badge shown
    return {
        name: 'Newbie',
        minPoints: 0,
        color: 'text-slate-500',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        gradient: 'from-slate-300 to-slate-400',
        icon: <Award className="w-full h-full" />,
    };
};

// Get next level info
export const getNextLevel = (points: number): { name: string; pointsNeeded: number; progress: number } | null => {
    const levels = [250, 1000, 5000];
    const levelNames = ['Expert', 'Master', 'Legend'];

    for (let i = 0; i < levels.length; i++) {
        if (points < levels[i]) {
            const prevLevel = i === 0 ? 0 : levels[i - 1];
            const progress = ((points - prevLevel) / (levels[i] - prevLevel)) * 100;
            return {
                name: levelNames[i],
                pointsNeeded: levels[i] - points,
                progress: Math.min(100, Math.max(0, progress)),
            };
        }
    }
    return null; // Already at max level (Legend)
};

// Get ring color for avatar border based on reputation
export const getReputationRingColor = (points: number): string => {
    if (points >= 5000) return 'ring-amber-400'; // Legend
    if (points >= 1000) return 'ring-purple-400'; // Master
    if (points >= 250) return 'ring-emerald-400'; // Expert
    return 'ring-transparent'; // Newbie - no ring
};

export default function ReputationBadge({
    reputationPoints,
    showLabel = true,
    size = 'md',
    className = ''
}: ReputationBadgeProps) {
    const level = getReputationLevel(reputationPoints);

    // Don't show badge for Newbie
    if (reputationPoints < 100) return null;

    const sizeClasses = {
        sm: {
            container: 'px-2 py-1 text-xs gap-1',
            icon: 'w-3 h-3',
        },
        md: {
            container: 'px-3 py-1.5 text-sm gap-1.5',
            icon: 'w-4 h-4',
        },
        lg: {
            container: 'px-4 py-2 text-base gap-2',
            icon: 'w-5 h-5',
        },
    };

    const sizes = sizeClasses[size];

    return (
        <div
            className={`
        inline-flex items-center ${sizes.container} 
        ${level.bgColor} ${level.color} 
        border ${level.borderColor} 
        rounded-full font-semibold
        shadow-sm
        ${className}
      `}
        >
            <span className={sizes.icon}>
                {level.icon}
            </span>
            {showLabel && (
                <span>{level.name}</span>
            )}
        </div>
    );
}

// Compact version for lists/cards
export function ReputationBadgeCompact({ reputationPoints }: { reputationPoints: number }) {
    const level = getReputationLevel(reputationPoints);

    // Don't show for Newbie (< 100)
    if (reputationPoints < 100) return null;

    return (
        <span
            className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 
        ${level.bgColor} ${level.color} 
        border ${level.borderColor} 
        rounded text-[10px] font-bold uppercase tracking-wide
      `}
            title={`${level.name} - ${reputationPoints} poin reputasi`}
        >
            <span className="w-3 h-3">
                {level.icon}
            </span>
            {level.name}
        </span>
    );
}

// Level progress card for profile
export function ReputationProgress({ reputationPoints }: { reputationPoints: number }) {
    const currentLevel = getReputationLevel(reputationPoints);
    const nextLevelInfo = getNextLevel(reputationPoints);

    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 ${currentLevel.color}`}>
                        {currentLevel.icon}
                    </span>
                    <span className={`text-sm font-bold ${currentLevel.color}`}>{currentLevel.name}</span>
                </div>
                {nextLevelInfo && (
                    <span className="text-[10px] font-semibold text-slate-500">{nextLevelInfo.pointsNeeded} pt ke {nextLevelInfo.name}</span>
                )}
            </div>

            {nextLevelInfo ? (
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${currentLevel.gradient} rounded-full transition-all duration-500`}
                        style={{ width: `${nextLevelInfo.progress}%` }}
                    />
                </div>
            ) : (
                <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                    <Sparkles className="w-3 h-3" />
                    Level tertinggi tercapai!
                </p>
            )}
        </div>
    );
}

