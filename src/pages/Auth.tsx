import React, { useMemo, useState } from 'react';
import { Loader2, Lock, Mail, ShieldCheck, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { signUpWithRole } from '../lib/destinations';
import {
    DEFAULT_SIGNUP_VALUES,
    ROLE_LABELS,
    ROLE_SIGNUP_CONFIG,
    type RoleFormField,
    type SignupFormValues,
    type UserRole,
} from '../lib/platform';

const FIELD_INPUT_TYPES: Partial<Record<RoleFormField, string>> = {
    website: 'url',
    yearsExperience: 'number',
};

const COMMON_FIELD_STYLES: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontWeight: 500,
    fontFamily: 'inherit',
    fontSize: '0.92rem',
    color: 'var(--text-main)',
};

export const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [formValues, setFormValues] = useState<SignupFormValues>(DEFAULT_SIGNUP_VALUES);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const navigate = useNavigate();

    const activeRole = formValues.role;
    const roleConfig = useMemo(() => ROLE_SIGNUP_CONFIG[activeRole], [activeRole]);

    const updateField = <K extends keyof SignupFormValues>(key: K, value: SignupFormValues[K]) => {
        setFormValues((current) => ({ ...current, [key]: value }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setInfo(null);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });
            if (signInError) throw signInError;
            navigate('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setInfo(null);

        try {
            await signUpWithRole({
                fullName: formValues.fullName,
                email: formValues.email,
                password: formValues.password,
                role: formValues.role,
                phone: formValues.phone,
                country: formValues.country,
                city: formValues.city,
                bio: formValues.bio,
                companyName: formValues.companyName,
                registrationNumber: formValues.registrationNumber,
                website: formValues.website,
                specialties: formValues.specialties,
                licenseNumber: formValues.licenseNumber,
                languages: formValues.languages,
                yearsExperience: formValues.yearsExperience,
                governmentId: formValues.governmentId,
                certificateId: formValues.certificateId,
                worksUnderCompany: formValues.worksUnderCompany,
            });

            setInfo(
                roleConfig.requiresVerification
                    ? 'Account created. Check your email, then sign in to see your verification pending status.'
                    : 'Account created. Check your email verification link to continue.'
            );
            setIsLogin(true);
            setLoginEmail(formValues.email);
            setLoginPassword('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="animate-fade"
            style={{
                minHeight: '100vh',
                background:
                    'radial-gradient(circle at top left, rgba(28, 163, 150, 0.12), transparent 32%), radial-gradient(circle at top right, rgba(14, 116, 144, 0.12), transparent 36%), var(--bg-main)',
                padding: '150px 0 96px',
            }}
        >
            <div className="container" style={{ maxWidth: '1180px' }}>
                <div className="auth-layout">
                    <section className="auth-intro-card">
                        <span className="auth-kicker">The Better Pass</span>
                        <h1>{isLogin ? 'Sign back into your travel system.' : 'Create a role-aware account.'}</h1>
                        <p>
                            One auth flow now supports travelers, tour companies, instructors, and guides.
                            Provider roles stay usable after signup but surface a clear verification pending state
                            until an admin approves them.
                        </p>

                        <div className="auth-feature-list">
                            <article>
                                <ShieldCheck size={18} />
                                <div>
                                    <strong>Verification-first providers</strong>
                                    <span>Provider roles submit onboarding data at signup and can reapply if rejected.</span>
                                </div>
                            </article>
                            <article>
                                <Users size={18} />
                                <div>
                                    <strong>Company + individual model</strong>
                                    <span>Companies own profiles, while guides and instructors can optionally work under them.</span>
                                </div>
                            </article>
                            <article>
                                <User size={18} />
                                <div>
                                    <strong>Unified traveler experience</strong>
                                    <span>Favorites, history, reviews after completed bookings, and provider chat are all supported.</span>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="auth-panel">
                        <div className="auth-panel-top">
                            <div>
                                <h2>{isLogin ? 'Welcome back' : 'Join Vagabond'}</h2>
                                <p>
                                    {isLogin
                                        ? 'Use your existing email and password.'
                                        : 'Choose the role that matches how you will use the platform.'}
                                </p>
                            </div>
                            <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
                                <button
                                    type="button"
                                    className={isLogin ? 'is-active' : ''}
                                    onClick={() => setIsLogin(true)}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    className={!isLogin ? 'is-active' : ''}
                                    onClick={() => setIsLogin(false)}
                                >
                                    Signup
                                </button>
                            </div>
                        </div>

                        {error && <div className="auth-alert auth-alert-error">{error}</div>}
                        {info && <div className="auth-alert auth-alert-info">{info}</div>}

                        {isLogin ? (
                            <form onSubmit={handleLogin} className="auth-form-grid">
                                <label className="auth-field">
                                    <span>Email Address</span>
                                    <div className="auth-input-shell">
                                        <Mail size={18} color="var(--text-muted)" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="alex@example.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            style={COMMON_FIELD_STYLES}
                                        />
                                    </div>
                                </label>

                                <label className="auth-field">
                                    <span>Password</span>
                                    <div className="auth-input-shell">
                                        <Lock size={18} color="var(--text-muted)" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="Enter your password"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            style={COMMON_FIELD_STYLES}
                                        />
                                    </div>
                                </label>

                                <button className="btn btn-primary auth-submit" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup} className="auth-signup-flow">
                                <div className="auth-role-grid">
                                    {((Object.keys(ROLE_LABELS) as UserRole[]).filter((role) => role !== 'admin')).map((role) => {
                                        const config = ROLE_SIGNUP_CONFIG[role];
                                        const isActive = activeRole === role;
                                        return (
                                            <button
                                                key={role}
                                                type="button"
                                                className={`auth-role-card${isActive ? ' is-active' : ''}`}
                                                onClick={() => updateField('role', role)}
                                            >
                                                <strong>{ROLE_LABELS[role]}</strong>
                                                <span>{config.summary}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="auth-role-summary">
                                    <strong>{ROLE_LABELS[activeRole]}</strong>
                                    <span>
                                        {roleConfig.requiresVerification
                                            ? 'Needs admin verification after signup.'
                                            : 'No admin verification required.'}
                                    </span>
                                </div>

                                <div className="auth-form-grid auth-form-grid-signup">
                                    <label className="auth-field">
                                        <span>Full Name</span>
                                        <div className="auth-input-shell">
                                            <User size={18} color="var(--text-muted)" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Alex Mercer"
                                                value={formValues.fullName}
                                                onChange={(e) => updateField('fullName', e.target.value)}
                                                style={COMMON_FIELD_STYLES}
                                            />
                                        </div>
                                    </label>

                                    <label className="auth-field">
                                        <span>Email Address</span>
                                        <div className="auth-input-shell">
                                            <Mail size={18} color="var(--text-muted)" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="alex@example.com"
                                                value={formValues.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                                style={COMMON_FIELD_STYLES}
                                            />
                                        </div>
                                    </label>

                                    <label className="auth-field">
                                        <span>Password</span>
                                        <div className="auth-input-shell">
                                            <Lock size={18} color="var(--text-muted)" />
                                            <input
                                                type="password"
                                                required
                                                minLength={8}
                                                placeholder="Minimum 8 characters"
                                                value={formValues.password}
                                                onChange={(e) => updateField('password', e.target.value)}
                                                style={COMMON_FIELD_STYLES}
                                            />
                                        </div>
                                    </label>

                                    {roleConfig.fields.map((field) => (
                                        <label className="auth-field" key={field.key}>
                                            <span>{field.label}</span>
                                            <div className="auth-input-shell">
                                                <input
                                                    type={FIELD_INPUT_TYPES[field.key] || 'text'}
                                                    required={field.required}
                                                    placeholder={field.placeholder}
                                                    value={String(formValues[field.key] ?? '')}
                                                    onChange={(e) => updateField(field.key, e.target.value as SignupFormValues[typeof field.key])}
                                                    style={COMMON_FIELD_STYLES}
                                                />
                                            </div>
                                        </label>
                                    ))}

                                    {activeRole !== 'tour_company' && activeRole !== 'tourist' && (
                                        <label className="auth-toggle-field">
                                            <input
                                                type="checkbox"
                                                checked={formValues.worksUnderCompany}
                                                onChange={(e) => updateField('worksUnderCompany', e.target.checked)}
                                            />
                                            <span>I currently work under or collaborate with a tour company profile.</span>
                                        </label>
                                    )}
                                </div>

                                <button className="btn btn-primary auth-submit" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                                </button>
                            </form>
                        )}
                    </section>
                </div>
            </div>

            <style>{`
                .auth-layout {
                    display: grid;
                    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.2fr);
                    gap: 28px;
                    align-items: start;
                }

                .auth-intro-card,
                .auth-panel {
                    background: var(--surface-main);
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-card);
                }

                .auth-intro-card {
                    padding: 40px 34px;
                    position: sticky;
                    top: 116px;
                }

                .auth-kicker {
                    display: inline-flex;
                    padding: 8px 12px;
                    border-radius: 999px;
                    background: rgba(24, 124, 103, 0.1);
                    color: var(--accent);
                    font-size: 0.78rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-bottom: 18px;
                }

                .auth-intro-card h1,
                .auth-panel h2 {
                    margin: 0 0 12px;
                    font-size: clamp(2rem, 2.8vw, 3.1rem);
                    line-height: 1.04;
                }

                .auth-intro-card p,
                .auth-panel p {
                    margin: 0;
                    color: var(--text-muted);
                    line-height: 1.75;
                }

                .auth-feature-list {
                    display: grid;
                    gap: 16px;
                    margin-top: 28px;
                }

                .auth-feature-list article {
                    display: grid;
                    grid-template-columns: 18px minmax(0, 1fr);
                    gap: 14px;
                    align-items: start;
                    padding: 16px 18px;
                    border-radius: var(--radius-lg);
                    background: var(--bg-main);
                    border: 1px solid var(--border-light);
                }

                .auth-feature-list strong,
                .auth-role-summary strong {
                    display: block;
                    margin-bottom: 4px;
                    font-size: 0.95rem;
                }

                .auth-feature-list span,
                .auth-role-summary span {
                    color: var(--text-muted);
                    font-size: 0.88rem;
                    line-height: 1.55;
                }

                .auth-panel {
                    padding: 34px;
                }

                .auth-panel-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: end;
                    gap: 18px;
                    margin-bottom: 24px;
                }

                .auth-mode-switch {
                    display: inline-flex;
                    padding: 4px;
                    border-radius: 999px;
                    background: var(--bg-main);
                    border: 1px solid var(--border-light);
                }

                .auth-mode-switch button {
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    padding: 10px 16px;
                    border-radius: 999px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .auth-mode-switch button.is-active {
                    background: var(--primary);
                    color: var(--text-inverse);
                }

                .auth-alert {
                    padding: 14px 16px;
                    border-radius: var(--radius-md);
                    font-size: 0.88rem;
                    font-weight: 600;
                    margin-bottom: 16px;
                }

                .auth-alert-error {
                    background: rgba(239, 68, 68, 0.1);
                    color: #d62828;
                }

                .auth-alert-info {
                    background: rgba(37, 99, 235, 0.1);
                    color: #1d4ed8;
                }

                .auth-signup-flow,
                .auth-form-grid {
                    display: grid;
                    gap: 18px;
                }

                .auth-role-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 14px;
                }

                .auth-role-card {
                    text-align: left;
                    padding: 18px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-light);
                    background: var(--bg-main);
                    cursor: pointer;
                    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .auth-role-card strong {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 1rem;
                }

                .auth-role-card span {
                    display: block;
                    color: var(--text-muted);
                    font-size: 0.84rem;
                    line-height: 1.55;
                }

                .auth-role-card.is-active {
                    border-color: rgba(24, 124, 103, 0.38);
                    box-shadow: 0 0 0 1px rgba(24, 124, 103, 0.16);
                    transform: translateY(-1px);
                }

                .auth-role-summary {
                    padding: 16px 18px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-light);
                    background: linear-gradient(180deg, rgba(24, 124, 103, 0.08), rgba(24, 124, 103, 0.02));
                }

                .auth-form-grid-signup {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .auth-field {
                    display: grid;
                    gap: 10px;
                }

                .auth-field span {
                    font-size: 0.72rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-muted);
                }

                .auth-input-shell {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 16px;
                    min-height: 54px;
                    background: var(--bg-main);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-light);
                }

                .auth-toggle-field {
                    grid-column: 1 / -1;
                    display: flex;
                    gap: 12px;
                    align-items: start;
                    font-size: 0.92rem;
                    color: var(--text-muted);
                    padding: 14px 16px;
                    background: var(--bg-main);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-light);
                }

                .auth-submit {
                    width: 100%;
                    justify-content: center;
                    padding: 16px 24px;
                    border-radius: 999px;
                    margin-top: 4px;
                }

                @media (max-width: 980px) {
                    .auth-layout {
                        grid-template-columns: 1fr;
                    }

                    .auth-intro-card {
                        position: static;
                    }
                }

                @media (max-width: 700px) {
                    .auth-panel,
                    .auth-intro-card {
                        padding: 24px 18px;
                    }

                    .auth-panel-top {
                        flex-direction: column;
                        align-items: start;
                    }

                    .auth-role-grid,
                    .auth-form-grid-signup {
                        grid-template-columns: 1fr;
                    }

                    .auth-mode-switch {
                        width: 100%;
                    }

                    .auth-mode-switch button {
                        flex: 1;
                    }
                }
            `}</style>
        </main>
    );
};
