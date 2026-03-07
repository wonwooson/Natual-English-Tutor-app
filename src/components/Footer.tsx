import { Languages, RotateCcw, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FooterProps {
    handleReset: () => void;
}

export const Footer: React.FC<FooterProps> = ({ handleReset }) => {
    return (
        <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-black/5 mt-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 text-black/40">
                    <Languages size={16} />
                    <span className="text-xs font-medium uppercase tracking-widest">Natural English Tutor</span>
                </div>
                <div className="flex gap-8 items-center">
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest"
                    >
                        <LogOut size={12} />
                        Logout
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-400/60 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                        <RotateCcw size={12} />
                        Reset Data
                    </button>
                    <a href="#" className="text-xs font-medium text-black/40 hover:text-black/80 transition-colors uppercase tracking-widest">About</a>
                    <a href="#" className="text-xs font-medium text-black/40 hover:text-black/80 transition-colors uppercase tracking-widest">Privacy</a>
                    <a href="#" className="text-xs font-medium text-black/40 hover:text-black/80 transition-colors uppercase tracking-widest">Contact</a>
                </div>
            </div>
        </footer>
    );
};
