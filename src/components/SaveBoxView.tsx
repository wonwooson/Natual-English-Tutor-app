import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ChevronUp, ChevronDown, Trash2, Send } from 'lucide-react';
import { SavedPractice } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SaveBoxViewProps {
    savedPractices: SavedPractice[];
    handleAskFromPractice: (practice: SavedPractice, question: string) => void;
    movePracticeUp: (id: string) => void;
    movePracticeDown: (id: string) => void;
    deletePractice: (id: string) => void;
}

export const SaveBoxView: React.FC<SaveBoxViewProps> = ({
    savedPractices,
    handleAskFromPractice,
    movePracticeUp,
    movePracticeDown,
    deletePractice
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">저장함</h2>
                <div className="text-xs font-medium text-black/30 uppercase tracking-widest">
                    {savedPractices.length} Practices Saved
                </div>
            </div>

            {savedPractices.length > 0 ? (
                <div className="grid gap-8">
                    {savedPractices.map((practice, index) => (
                        <motion.div
                            key={practice.id}
                            layout
                            className="bg-white border border-black/10 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-black/5 group relative"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-grow space-y-1">
                                    <h4 className="text-2xl md:text-3xl font-bold text-emerald-600 tracking-tight">
                                        {practice.expression}
                                    </h4>
                                    <p className="text-sm text-black/40 italic">
                                        "{practice.scenario}"
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div className="text-[10px] text-black/20 font-mono tracking-tighter">
                                        {new Date(practice.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).replace(/\s/g, '')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => movePracticeUp(practice.id)}
                                                disabled={index === 0}
                                                className="p-1.5 hover:bg-black/5 rounded-lg text-black/30 disabled:opacity-10"
                                                title="위로 이동"
                                            >
                                                <ChevronUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => movePracticeDown(practice.id)}
                                                disabled={index === savedPractices.length - 1}
                                                className="p-1.5 hover:bg-black/5 rounded-lg text-black/30 disabled:opacity-10"
                                                title="아래로 이동"
                                            >
                                                <ChevronDown size={16} />
                                            </button>
                                            <button
                                                onClick={() => deletePractice(practice.id)}
                                                className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg"
                                                title="삭제하기"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto p-6 bg-black/[0.02] rounded-3xl border border-black/5">
                                {practice.messages.map((msg, mIdx) => (
                                    <div key={mIdx} className={cn(
                                        "text-sm p-4 rounded-2xl shadow-sm",
                                        msg.role === 'user'
                                            ? "bg-emerald-50/50 ml-12 border border-emerald-100/50"
                                            : "bg-white border border-black/5 mr-12"
                                    )}>
                                        <p className="font-medium text-black/70 leading-relaxed">{msg.content}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-black/5">
                                <div className="flex items-center gap-3 bg-black/[0.02] p-3 rounded-2xl border border-black/5 focus-within:border-emerald-500/30 focus-within:bg-white transition-all">
                                    <input
                                        type="text"
                                        placeholder="이 대화에 대해 궁금한 점을 물어보세요..."
                                        className="flex-grow bg-transparent border-none focus:ring-0 text-sm placeholder:text-black/20"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAskFromPractice(practice, (e.target as HTMLInputElement).value);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={(e) => {
                                            const input = (e.currentTarget.previousSibling as HTMLInputElement);
                                            handleAskFromPractice(practice, input.value);
                                            input.value = '';
                                        }}
                                        className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-black/5 rounded-3xl">
                    <RotateCcw size={48} className="mx-auto mb-4 text-black/10" />
                    <p className="text-black/40 font-medium">아직 저장된 대화가 없습니다.</p>
                    <p className="text-xs text-black/20 mt-2">실전 대화 중 '저장하기' 버튼을 눌러보세요.</p>
                </div>
            )}
        </motion.div>
    );
};
