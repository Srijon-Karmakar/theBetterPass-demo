import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Auth: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/activities');
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } }
                });
                if (error) throw error;

                if (data.user) {
                    await supabase.from('profiles').insert([{ id: data.user.id, full_name: fullName }]);
                }
                alert('Verification link sent! Please check your email.');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center animate-fade" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '160px 0 80px' }}>
            <div className="container" style={{ maxWidth: '440px' }}>
                <div style={{ background: 'var(--surface-main)', padding: '4rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)' }} className="auth-box">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 className="h1" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{isLogin ? 'Welcome back' : 'Join Vagabond'}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            {isLogin ? 'Access your curated collections' : 'Start your unconventional journey'}
                        </p>
                    </div>

                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="flex flex-col gap-6">
                        {!isLogin && (
                            <div>
                                <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'block' }}>Full Name</label>
                                <div className="flex items-center gap-3" style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                    <User size={18} color="var(--text-muted)" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Alex Mercer"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 500, fontFamily: 'inherit', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'block' }}>Email Address</label>
                            <div className="flex items-center gap-3" style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                <Mail size={18} color="var(--text-muted)" />
                                <input
                                    type="email"
                                    required
                                    placeholder="alex@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 500, fontFamily: 'inherit', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'block' }}>Password</label>
                            <div className="flex items-center gap-3" style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                <Lock size={18} color="var(--text-muted)" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 500, fontFamily: 'inherit', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1.2rem', borderRadius: 'var(--radius-full)', justifyContent: 'center', marginTop: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div style={{ marginTop: '3rem', textAlign: 'center', paddingTop: '2.5rem', borderTop: '1px solid var(--border-light)' }}>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{isLogin ? 'Explore membership' : 'Access account'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    main { padding-top: 140px !important; }
                    .auth-box { padding: 3rem 1.5rem !important; }
                    .h1 { font-size: 2rem !important; }
                    .auth-box p { font-size: 0.85rem !important; }
                    .btn { padding: 1rem !important; font-size: 0.9rem !important; }
                }
            `}</style>
        </main>
    );
};
