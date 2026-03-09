import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home, AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';

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

    // Redirect authenticated users to Dashboard
    React.useEffect(() => {
        if (isFetched && authData?.isAuthenticated) {
            window.location.href = createPageUrl("Dashboard");
        } else if (isFetched && !authData?.isAuthenticated) {
            base44.auth.redirectToLogin(createPageUrl("Dashboard"));
        }
    }, [isFetched, authData]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#060d1f" }}>

            {/* Ambient blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }} />
            </div>

            <div className="relative w-full max-w-md text-center">
                <div className="flex justify-center mb-8">
                    <img src={LOGO_URL} alt="TouchNet" className="h-10 object-contain"
                        style={{ filter: "brightness(0) invert(1)" }} />
                </div>

                <div className="rounded-2xl p-10"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>

                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
                        <AlertTriangle className="w-8 h-8 text-indigo-400" />
                    </div>

                    <h1 className="text-6xl font-bold text-white mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>404</h1>
                    <h2 className="text-xl font-semibold text-slate-200 mb-3">Page Not Found</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        The page <span className="text-slate-200 font-medium">"{pageName}"</span> could not be found.
                    </p>

                    {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
                        <div className="mb-6 p-4 rounded-xl text-left"
                            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}>
                            <p className="text-xs font-semibold text-indigo-300 mb-1">Admin Note</p>
                            <p className="text-xs text-indigo-200/70 leading-relaxed">
                                This page may not be implemented yet. Ask the AI to build it in the chat.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.href = createPageUrl("Home")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                        <Home className="w-4 h-4" />
                        Go Home
                    </button>
                </div>

                <p className="text-center text-[10px] text-slate-600 mt-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    © TOUCHNET v2.4.1
                </p>
            </div>
        </div>
    );
}