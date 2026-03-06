import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, Volume2, Copy, Trash2, MessageCircle } from 'lucide-react';
import { Expression } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PracticeBoxViewProps {
    savedExpressions: Expression[];
    isPlayingAudio: string | null;
    playTTS: (text: string, id: string) => void;
    copyToClipboard: (text: string) => void;
    removeSaved: (id: string) => void;
    startPractice: (item: Expression) => void;
    setActiveTab: (tab: any) => void;
}

export const PracticeBoxView: React.FC<PracticeBoxViewProps> = ({
    savedExpressions,
    isPlayingAudio,
    playTTS,
    copyToClipboard,
    removeSaved,
    startPractice,
    setActiveTab
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-serif italic">실전 대화함</h2>
                </div>
                <div className="text-xs font-medium text-black/30 uppercase tracking-widest">
                    {savedExpressions.length} Expressions Saved
                </div>
            </div>

            {savedExpressions.length > 0 ? (
                <div className="grid gap-6">
                    {savedExpressions.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                        <Bookmark size={10} />
                                        Saved Expression
                                    </div>
                                    {item.scenario && (
                                        <div className="text-[11px] text-black/30 italic">
                                            Situation: "{item.scenario}"
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => playTTS(item.expression, item.id)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            isPlayingAudio === item.id ? "bg-emerald-100 text-emerald-700" : "hover:bg-emerald-50 text-emerald-600"
                                        )}
                                        title="듣기"
                                    >
                                        <Volume2 size={16} className={isPlayingAudio === item.id ? "animate-pulse" : ""} />
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(item.expression)}
                                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                        title="복사하기"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={() => removeSaved(item.id)}
                                        className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                                        title="삭제하기"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xl font-semibold text-emerald-700">{item.expression}</h4>
                                <p className="text-black/80">{item.meaning}</p>
                                <div className="bg-black/5 p-4 rounded-xl text-sm text-black/60 italic">
                                    {item.usage_tip}
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={() => startPractice(item)}
                                        className="flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        <MessageCircle size={12} />
                                        <span>실전 대화하기</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-black/5 rounded-3xl">
                    <Bookmark size={48} className="mx-auto mb-4 text-black/10" />
                    <p className="text-black/40 font-medium">아직 보관된 표현이 없습니다.</p>
                    <button
                        onClick={() => setActiveTab('home')}
                        className="mt-4 text-emerald-600 text-sm font-semibold hover:underline"
                    >
                        표현 찾으러 가기
                    </button>
                </div>
            )}
        </motion.div>
    );
};
