import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, RefreshCw, MessageCircle, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { Expression } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface HomeViewProps {
    scenario: string;
    setScenario: (val: string) => void;
    handleSubmit: (e?: React.FormEvent) => void;
    isLoading: boolean;
    error: string | null;
    results: Expression[];
    handleAdopt: (exp: Expression) => void;
    handleReject: (id: string) => void;
    playTTS: (text: string, id: string) => void;
    isPlayingAudio: string | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
    scenario,
    setScenario,
    handleSubmit,
    isLoading,
    error,
    results,
    handleAdopt,
    handleReject,
    playTTS,
    isPlayingAudio
}) => {
    const resultsRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (results.length > 0 && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [results]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >

            <section className="mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic font-light mb-4 leading-tight tracking-tight">
                    원어민처럼 자연스럽게,<br />
                    <span className="text-emerald-600 font-normal not-italic">진짜 영어</span>를 배워보세요.
                </h2>
                <p className="text-black/60 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                    격식 있는 표현은 이미 충분히 알고 계신가요? 일상생활에서 원어민들이 실제로 사용하는 생생한 표현들을 상황별로 알려드립니다.
                </p>

            </section>

            <section className="mb-16">
                <form onSubmit={handleSubmit} className="relative">
                    <div className="group relative bg-white border border-black/10 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/5">
                        <textarea
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                            placeholder="어떤 상황인가요? (예: 친구랑 약속을 잡을 때, 회사에서 회의를 미뤄야 할 때...)"
                            className="w-full min-h-[140px] p-6 bg-transparent border-none focus:ring-0 text-lg resize-none placeholder:text-black/20"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleSubmit();
                                }
                            }}
                        />
                        <div className="flex items-center justify-between px-6 pb-4">
                            <div className="text-xs text-black/40 font-mono">
                                {scenario.length} characters • Press ⌘+Enter to send
                            </div>
                            <button
                                type="submit"
                                disabled={!scenario.trim() || isLoading}
                                className={cn(
                                    "flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap",
                                    scenario.trim() && !isLoading
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95"
                                        : "bg-black/5 text-black/20 cursor-not-allowed"
                                )}
                            >
                                {isLoading ? (
                                    <RefreshCw className="animate-spin" size={18} />
                                ) : (
                                    <Send size={18} />
                                )}
                                <span>{isLoading ? '생성 중...' : '표현 찾기'}</span>
                            </button>
                        </div>
                    </div>
                </form>
                {error && (
                    <p className="mt-4 text-red-500 text-sm flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                        {error}
                    </p>
                )}
            </section>

            <section ref={resultsRef} className="relative px-4 pb-20 scroll-mt-32">
                <AnimatePresence mode="wait">

                    {results.length > 0 ? (
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center justify-between mb-8 px-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-emerald-500" size={20} />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-black/30">더 나은 표현을 골라보세요</h3>
                                </div>
                                <div className="text-[10px] font-mono text-black/20 uppercase tracking-tighter">
                                    {results.length} Candidates Generated
                                </div>
                            </div>

                            {/* Horizontal Snap Shelf */}
                            <div className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-8 no-scrollbar scroll-smooth px-4 -mx-4">
                                {results.map((item, idx) => {
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="min-w-[85vw] sm:min-w-[400px] snap-center"
                                        >
                                            <div className="group relative bg-white border border-black/10 rounded-[2.5rem] p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[480px] sm:h-[520px] border-b-4 border-b-emerald-500/20">
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-sm">
                                                            0{idx + 1}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                playTTS(item.expression, item.id);
                                                            }}
                                                            className={cn(
                                                                "p-3 rounded-2xl transition-all shadow-sm",
                                                                isPlayingAudio === item.id
                                                                    ? "bg-emerald-600 text-white scale-110"
                                                                    : "bg-black/5 text-black/40 hover:bg-emerald-50 hover:text-emerald-600"
                                                            )}
                                                        >
                                                            <Volume2 size={20} className={isPlayingAudio === item.id ? "animate-pulse" : ""} />
                                                        </button>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-3xl sm:text-4xl font-bold text-emerald-900 leading-tight tracking-tight">
                                                            {item.expression}
                                                        </h4>
                                                        <p className="text-lg sm:text-xl text-black/70 font-medium leading-snug">
                                                            {item.meaning}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="py-6 border-t border-black/5">
                                                        <div className="flex items-start gap-3">
                                                            <BookOpen size={18} className="text-emerald-500 mt-1 flex-shrink-0" />
                                                            <p className="text-sm text-black/50 leading-relaxed italic">
                                                                {item.usage_tip}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            handleAdopt(item);
                                                        }}

                                                        className="w-full py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group/btn mt-4"
                                                    >
                                                        <span>이 표현으로 결정하기</span>
                                                        <Sparkles size={18} className="transition-transform group-hover/btn:rotate-12" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : !isLoading && (
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 border-2 border-dashed border-black/5 rounded-[3rem] bg-black/[0.02]"
                        >
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-black/10">
                                <MessageCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-black/40 mb-3 font-serif italic">상황을 들려주세요</h3>
                            <p className="text-black/30 max-w-sm mx-auto font-medium">
                                어떤 대화가 필요한가요? 상황을 입력하시면<br />
                                가장 어울리는 3가지 제안을 드립니다.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

        </motion.div >
    );
};
