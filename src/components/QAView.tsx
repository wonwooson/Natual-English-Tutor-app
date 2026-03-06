import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Trash2, Send } from 'lucide-react';
import { QAMessage } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface QAViewProps {
    qaHistory: QAMessage[];
    isQALoading: boolean;
    qaInput: string;
    setQAInput: (val: string) => void;
    handleQASubmit: (e: React.FormEvent) => void;
    clearQAHistory: () => void;
}

export const QAView: React.FC<QAViewProps> = ({
    qaHistory,
    isQALoading,
    qaInput,
    setQAInput,
    handleQASubmit,
    clearQAHistory
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [qaHistory, isQALoading]);

    const formatContent = (content: string) => {
        // Simple formatter for **bold** text and preserves whitespace
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-emerald-700 font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-240px)] relative"
        >
            <div className="flex items-center justify-end mb-4">
                {qaHistory.length > 0 && (
                    <button
                        onClick={clearQAHistory}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 text-[10px] font-bold text-black/40 hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-widest"
                    >
                        <Trash2 size={12} />
                        Clear History
                    </button>
                )}
            </div>

            <div className="flex-grow overflow-y-auto mb-20 p-6 space-y-6 bg-black/5 rounded-3xl border border-black/5 no-scrollbar">
                {qaHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                        <MessageCircle size={48} />
                        <p className="text-sm font-medium">궁금한 점을 아래에 입력해주세요.</p>
                    </div>
                ) : (
                    qaHistory.map((msg, idx) => (
                        <div key={idx} className={cn(
                            "flex flex-col max-w-[95%] sm:max-w-[85%]",
                            msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                        )}>
                            <div className={cn(
                                "p-4 sm:p-5 rounded-2xl text-[15px] sm:text-sm leading-loose sm:leading-relaxed shadow-sm whitespace-pre-wrap",
                                msg.role === 'user'
                                    ? "bg-emerald-600 text-white rounded-tr-none font-medium"
                                    : "bg-white border border-black/5 text-black/80 rounded-tl-none"
                            )}>
                                {formatContent(msg.content)}
                            </div>
                            <span className="text-[10px] text-black/20 mt-1 font-mono">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
                {isQALoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-black/5 p-4 rounded-2xl rounded-tl-none flex gap-1">
                            <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md pb-4 pt-2">
                <form onSubmit={handleQASubmit} className="relative flex items-center gap-3 bg-white p-4 rounded-2xl border border-black/10 shadow-lg mx-1">
                    <input
                        type="text"
                        value={qaInput}
                        onChange={(e) => setQAInput(e.target.value)}
                        placeholder="예: 'gunning for'와 'aiming for'의 차이가 뭐야?"
                        className="flex-grow bg-transparent border-none focus:ring-0 text-sm placeholder:text-black/20"
                    />
                    <button
                        type="submit"
                        disabled={!qaInput.trim() || isQALoading}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            qaInput.trim() && !isQALoading ? "bg-emerald-600 text-white" : "bg-black/5 text-black/20"
                        )}
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </motion.div>
    );
};
