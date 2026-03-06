import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, RefreshCw, Languages, X, Volume2, Send, Bookmark } from 'lucide-react';
import { Expression, PracticeMessage } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PracticeModalProps {
    activePractice: Expression;
    practiceMessages: PracticeMessage[];
    isPracticeLoading: boolean;
    practiceInput: string;
    setPracticeInput: (val: string) => void;
    handlePracticeSubmit: (e?: React.FormEvent) => void;
    isPlayingAll: boolean;
    playbackProgress: number;
    playAllMessages: () => void;
    toggleAllTranslations: () => void;
    isKoreanMode: boolean;
    isTranslating: string | null;
    translations: Record<string, string>;
    translateMessage: (text: string, id: string) => void;
    playTTS: (text: string, id: string, role?: 'assistant' | 'user') => void;
    isPlayingAudio: string | null;

    savePractice: () => void;
    closeModal: () => void;
    chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
    activePractice,
    practiceMessages,
    isPracticeLoading,
    practiceInput,
    setPracticeInput,
    handlePracticeSubmit,
    isPlayingAll,
    playbackProgress,
    playAllMessages,
    toggleAllTranslations,
    isKoreanMode,
    isTranslating,
    translations,
    translateMessage,
    playTTS,
    isPlayingAudio,
    savePractice,
    closeModal,
    chatEndRef
}) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        // Only auto-focus if we have at least 2 messages (AI turn followed by something else) 
        // to prevent keyboard from popping up immediately on the very first screen.
        if (!isPracticeLoading && practiceMessages.length > 1) {
            inputRef.current?.focus();
        }
    }, [isPracticeLoading, practiceMessages.length]);


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-2xl h-full sm:h-[85vh] rounded-none sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="relative border-b border-black/5 bg-emerald-50/30">
                    <AnimatePresence>
                        {isPlayingAll && (
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${playbackProgress}%` }}
                                exit={{ opacity: 0 }}
                                className="absolute top-0 left-0 h-1 bg-emerald-500 z-10 transition-all duration-300"
                            />
                        )}
                    </AnimatePresence>

                    <div className="p-4 sm:p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={playAllMessages}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg",
                                    isPlayingAll
                                        ? "bg-emerald-500 animate-pulse"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                )}
                                title={isPlayingAll ? "재생 중지" : "전체 대화 듣기"}
                            >
                                {isPlayingAll ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <div className="max-w-[150px] sm:max-w-none">
                                <h3 className="font-bold text-emerald-900 leading-tight text-sm sm:text-base">실전 대화하기</h3>
                                <p className="text-[10px] sm:text-xs text-emerald-600/60 font-medium uppercase tracking-widest truncate">
                                    Target: {activePractice.expression}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleAllTranslations}
                                disabled={isPracticeLoading}
                                className={cn(
                                    "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all",
                                    isKoreanMode
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50",
                                    isPracticeLoading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isTranslating ? (
                                    <RefreshCw size={12} className="animate-spin" />
                                ) : (
                                    <Languages size={12} />
                                )}
                                <span className="hidden xs:inline">{isKoreanMode ? "원문 보기" : "전체 번역"}</span>
                                <span className="xs:hidden">{isKoreanMode ? "원문" : "번역"}</span>
                            </button>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X size={20} className="text-black/40" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#FDFCFB]">
                    {isPracticeLoading && practiceMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <RefreshCw className="animate-spin text-emerald-600" size={32} />
                            <p className="text-sm text-black/40 font-medium">AI가 생생한 대화 시나리오를 만들고 있습니다...</p>
                        </div>
                    ) : (
                        <>
                            {practiceMessages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "flex flex-col max-w-[85%]",
                                        msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                    )}
                                >
                                    <div className={cn(
                                        "p-3 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group/msg",
                                        msg.role === 'user'
                                            ? "bg-emerald-600 text-white rounded-tr-none"
                                            : "bg-white border border-black/5 text-black/80 rounded-tl-none"
                                    )}>
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={isKoreanMode ? 'ko' : 'en'}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {isKoreanMode && translations[idx.toString()] ? (
                                                    <p className="font-medium">{translations[idx.toString()]}</p>
                                                ) : (
                                                    msg.content.split('\n').map((line, i) => (
                                                        <p key={i} className={cn(line.startsWith('[Correction:') && "text-emerald-600 font-bold mb-2 italic bg-emerald-50 p-2 rounded-lg")}>
                                                            {line}
                                                        </p>
                                                    ))
                                                )}
                                            </motion.div>
                                        </AnimatePresence>

                                        <button
                                            onClick={() => translateMessage(msg.content, idx.toString())}
                                            className={cn(
                                                "absolute top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/5",
                                                msg.role === 'user' ? "right-full mr-2 text-white/40 hover:text-white" : "left-full ml-2 text-black/20 hover:text-emerald-600"
                                            )}
                                            title="번역하기"
                                        >
                                            {isTranslating === idx.toString() ? (
                                                <RefreshCw size={12} className="animate-spin" />
                                            ) : (
                                                <Languages size={12} />
                                            )}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => playTTS(msg.content, idx.toString(), msg.role)}
                                        className={cn(

                                            "mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors",
                                            isPlayingAudio === idx.toString() ? "text-emerald-600" : "text-black/20 hover:text-emerald-600",
                                            msg.role === 'user' && "flex-row-reverse"
                                        )}
                                    >
                                        {isPlayingAudio === idx.toString() ? (
                                            <Volume2 size={12} className="animate-pulse" />
                                        ) : (
                                            <Volume2 size={12} />
                                        )}
                                        {isPlayingAudio === idx.toString() ? "재생 중..." : "목소리 듣기"}
                                    </button>
                                </motion.div>
                            ))}

                            {isPracticeLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-black/5 p-4 rounded-2xl rounded-tl-none flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 sm:p-6 border-t border-black/5 bg-white pb-safe">
                    <form onSubmit={handlePracticeSubmit} className="relative flex items-center gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={practiceInput}
                            onChange={(e) => setPracticeInput(e.target.value)}
                            placeholder="대화를 이어가 보세요..."
                            className="flex-grow bg-black/5 border-none focus:ring-2 focus:ring-emerald-500/20 rounded-full px-5 sm:px-6 py-3 text-sm placeholder:text-black/20"
                            disabled={isPracticeLoading}
                        />

                        <button
                            type="submit"
                            disabled={!practiceInput.trim() || isPracticeLoading}
                            className={cn(
                                "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                                practiceInput.trim() && !isPracticeLoading
                                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                                    : "bg-black/5 text-black/20"
                            )}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <div className="mt-3 flex items-center justify-between px-2">
                        <p className="text-[10px] text-black/20 font-medium uppercase tracking-widest">
                            AI가 생성한 시나리오를 읽고 대화를 이어가세요
                        </p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={savePractice}
                                className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-widest hover:underline"
                            >
                                <Bookmark size={12} />
                                저장하기
                            </button>
                            <button
                                onClick={closeModal}
                                className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest hover:underline"
                            >
                                연습 종료
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
