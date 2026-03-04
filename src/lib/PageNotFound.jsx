import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home, AlertTriangle } from 'lucide-react';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a157d4dbdca56a3bccf4d3/bce74e947_image0011.png";

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{ background: "linear-gradient(135deg, #1e2a4a 0%, #0f172a 60%, #1a1a2e 100%)" }}>

            {/* Decorative grid */}
            <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: "linear-gradient(rgba(220,38,38,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.3) 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }} />
            <div className="fixed top-0 right-0 w-96 h-96 opacity-20 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, #dc2626 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

            <div className="relative w-full max-w-md text-center">
                <div className="flex justify-center mb-8">
                    <img src={LOGO_URL} alt="TouchNet" className="h-10 object-contain"
                        style={{ filter: "brightness(0) invert(1)" }} />
                </div>

                <div className="rounded-2xl p-10"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>

                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)" }}>
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>

                    <h1 className="text-6xl font-bold text-white mb-2"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}>404</h1>
                    <h2 className="text-xl font-semibold text-slate-200 mb-3">Page Not Found</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        The page <span className="text-slate-200 font-medium">"{pageName}"</span> could not be found.
                    </p>

                    {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
                        <div className="mb-6 p-4 rounded-xl text-left"
                            style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.3)" }}>
                            <p className="text-xs font-semibold text-orange-300 mb-1">Admin Note</p>
                            <p className="text-xs text-orange-200/70 leading-relaxed">
                                This page may not be implemented yet. Ask the AI to build it in the chat.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.href = '/'}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(90deg, #dc2626, #b91c1c)", boxShadow: "0 4px 20px rgba(220,38,38,0.4)" }}>
                        <Home className="w-4 h-4" />
                        Go Home
                    </button>
                </div>

                <p className="text-center text-[10px] text-slate-600 mt-6"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    © TOUCHNET v2.4.1
                </p>
            </div>
        </div>
    );
}