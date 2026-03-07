import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!session) {
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
    }

    return <>{children}</>;
};
