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
    if (points >= 1000) {
        return {
            name: 'Legend',
            minPoints: 1000,
            color: 'text-amber-600',
            bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
            borderColor: 'border-amber-300',
            gradient: 'from-amber-500 to-yellow-500',
            icon: <Crown className="w-full h-full" />,
        };
    }
    if (points >= 500) {
        return {
            name: 'Master',
            minPoints: 500,
            color: 'text-purple-600',
            bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50',
            borderColor: 'border-purple-300',
            gradient: 'from-purple-500 to-pink-500',
            icon: <Trophy className="w-full h-full" />,
        };
    }
    if (points >= 100) {
        return {
            name: 'Expert',
            minPoints: 100,
            color: 'text-emerald-600',
            bgColor: 'bg-gradient-to-r from-emerald-50 to-teal-50',
            borderColor: 'border-emerald-300',
            gradient: 'from-emerald-500 to-teal-500',
            icon: <Zap className="w-full h-full" />,
        };
    }
    // Newbie (0-99) - no badge shown
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
    const levels = [100, 500, 1000];
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
    if (points >= 1000) return 'ring-amber-400'; // Legend
    if (points >= 500) return 'ring-purple-400'; // Master
    if (points >= 100) return 'ring-emerald-400'; // Expert
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
        <div className={`${currentLevel.bgColor} border ${currentLevel.borderColor} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentLevel.gradient} flex items-center justify-center text-white shadow-lg`}>
                    <span className="w-5 h-5">
                        {currentLevel.icon}
                    </span>
                </div>
                <div>
                    <p className={`font-bold ${currentLevel.color}`}>{currentLevel.name}</p>
                    <p className="text-xs text-slate-500">{reputationPoints} poin reputasi</p>
                </div>
            </div>

            {nextLevelInfo && (
                <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Menuju {nextLevelInfo.name}</span>
                        <span>{nextLevelInfo.pointsNeeded} poin lagi</span>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${currentLevel.gradient} rounded-full transition-all duration-500`}
                            style={{ width: `${nextLevelInfo.progress}%` }}
                        />
                    </div>
                </div>
            )}

            {!nextLevelInfo && (
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Level tertinggi tercapai!
                </p>
            )}
        </div>
    );
}

