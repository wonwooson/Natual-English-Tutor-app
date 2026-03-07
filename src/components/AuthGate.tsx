import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        console.log("AuthGate: Initializing session check...");
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) console.error("AuthGate: Session check error:", error);
            console.log("AuthGate: Session received:", session ? "YES" : "NO");
            setSession(session);
            setLoading(false);
        }).catch(err => {
            console.error("AuthGate: Unexpected promise rejection:", err);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        console.log("AuthGate: Rendering loading state...");
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!session) {
        console.log("AuthGate: Rendering login UI...");
        try {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] px-4">
                    <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-natural-100">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Natural English Tutor</h1>
                            <p className="text-gray-500">나만의 영어 학습 기록을 시작해보세요</p>
                        </div>
                        <Auth
                            supabaseClient={supabase}
                            appearance={{
                                theme: ThemeSupa,
                                variables: {
                                    default: {
                                        colors: {
                                            brand: '#10b981',
                                            brandAccent: '#059669',
                                        },
                                    },
                                },
                            }}
                            providers={['google']}
                        />
                    </div>
                </div>
            );
        } catch (err) {
            console.error("AuthGate: Crash during Auth UI render:", err);
            return <div className="p-10 text-red-500 font-bold">인증 화면 로드 중 오류가 발생했습니다.</div>;
        }
    }

    console.log("AuthGate: Rendering App children...");

    return <>{children}</>;
};
