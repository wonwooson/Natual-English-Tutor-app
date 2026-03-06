import React from 'react';
import { Languages, Trophy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface HeaderProps {
    activeTab: 'home' | 'practice_box' | 'save_box' | 'qa';
    setActiveTab: (tab: 'home' | 'practice_box' | 'save_box' | 'qa') => void;
    savedExpressionsCount: number;
    savedPracticesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
    activeTab,
    setActiveTab,
    savedExpressionsCount,
    savedPracticesCount
}) => {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:h-20">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setActiveTab('home')}
                    >
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                            <Languages size={24} />
                        </div>
                        <h1 className="text-lg sm:text-xl font-serif italic font-bold tracking-tight">Natural English Tutor</h1>
                    </div>

                    <div className="md:hidden">
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100 shadow-sm">
                            <Trophy size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold tracking-widest">50P</span>
                        </div>
                    </div>
                </div>

                <nav className="flex items-center gap-1 bg-black/5 p-1 rounded-xl overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('home')}
                        className={cn(
                            "px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === 'home' ? "bg-white text-emerald-600 shadow-sm" : "text-black/40 hover:text-black/60"
                        )}
                    >
                        표현 찾기
                    </button>
                    <button
                        onClick={() => setActiveTab('practice_box')}
                        className={cn(
                            "px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap",
                            activeTab === 'practice_box' ? "bg-white text-emerald-600 shadow-sm" : "text-black/40 hover:text-black/60"
                        )}
                    >
                        실전 대화함
                        {savedExpressionsCount > 0 && (
                            <span className={cn(
                                "px-1 sm:px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold",
                                activeTab === 'practice_box' ? "bg-emerald-100 text-emerald-600" : "bg-black/10 text-black/40"
                            )}>
                                {savedExpressionsCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('save_box')}
                        className={cn(
                            "px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap",
                            activeTab === 'save_box' ? "bg-white text-emerald-600 shadow-sm" : "text-black/40 hover:text-black/60"
                        )}
                    >
                        저장함
                        {savedPracticesCount > 0 && (
                            <span className={cn(
                                "px-1 sm:px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold",
                                activeTab === 'save_box' ? "bg-emerald-100 text-emerald-600" : "bg-black/10 text-black/40"
                            )}>
                                {savedPracticesCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('qa')}
                        className={cn(
                            "px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === 'qa' ? "bg-white text-emerald-600 shadow-sm" : "text-black/40 hover:text-black/60"
                        )}
                    >
                        질문함
                    </button>
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full flex items-center gap-2 border border-emerald-100 shadow-sm">
                        <Trophy size={14} className="text-emerald-500" />
                        <span className="text-xs font-bold tracking-widest">50 POINTS</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
