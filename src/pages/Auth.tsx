import React, { useMemo, useState } from 'react';
import {
    Backpack,
    Building2,
    GraduationCap,
    Loader2,
    Lock,
    Mail,
    Map,
    MapPin,
    Phone,
    User,
} from 'lucide-react';
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
import './auth.css';

/* ── Background images ────────────────────────────────────────── */
const BG_IMAGES = [
    // Unsplash — forest / nature
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1920&q=85',
    // Pexels — mountain / forest
    'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/235621/pexels-photo-235621.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/371916/pexels-photo-371916.jpeg?auto=compress&cs=tinysrgb&w=1920',
];

/* ── Field types ──────────────────────────────────────────────── */
const FIELD_INPUT_TYPES: Partial<Record<RoleFormField, string>> = {
    website: 'url',
    yearsExperience: 'number',
};

const FIELD_ICONS: Partial<Record<RoleFormField, React.ReactNode>> = {
    phone: <Phone size={15} />,
    country: <MapPin size={15} />,
    city: <MapPin size={15} />,
};

/* ── Role display config ──────────────────────────────────────── */
const ROLE_ICONS: Record<string, React.ReactNode> = {
    tourist:         <Backpack size={24} />,
    tour_company:    <Building2 size={24} />,
    tour_guide:      <Map size={24} />,
    tour_instructor: <GraduationCap size={24} />,
};

const FIELD_STYLES: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontWeight: 500,
    fontFamily: 'inherit',
    fontSize: '0.88rem',
    color: '#fff',
};

/* ── Component ────────────────────────────────────────────────── */
export const Auth: React.FC = () => {
    const [bgImage] = useState(() => BG_IMAGES[Math.floor(Math.random() * BG_IMAGES.length)]);
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
    const providerRoles = (Object.keys(ROLE_LABELS) as UserRole[]).filter((r) => r !== 'admin');

    const updateField = <K extends keyof SignupFormValues>(key: K, value: SignupFormValues[K]) =>
        setFormValues((c) => ({ ...c, [key]: value }));

    const switchMode = (login: boolean) => {
        setIsLogin(login);
        setError(null);
        setInfo(null);
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
        <div
            className="auth-page"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="auth-outer">
                {/* ══════════════════════════════════
                    LOGIN
                ══════════════════════════════════ */}
                {isLogin && (
                    <div className="auth-card auth-form-enter">
                        {/* Brand */}
                        <div className="auth-brand">
                            <div className="auth-brand-mark">
                                <MapPin size={22} color="#fff" />
                            </div>
                            <span className="auth-brand-name">The Better Pass</span>
                            <span className="auth-brand-tagline">Your travel experience starts here</span>
                        </div>

                        {/* Toggle */}
                        <div className="auth-toggle-wrap">
                            <div className="auth-toggle" role="tablist">
                                <button
                                    type="button"
                                    className={`auth-toggle-btn${isLogin ? ' is-active' : ''}`}
                                    onClick={() => switchMode(true)}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    className={`auth-toggle-btn${!isLogin ? ' is-active' : ''}`}
                                    onClick={() => switchMode(false)}
                                >
                                    Signup
                                </button>
                            </div>
                        </div>

                        {error && <div className="auth-alert auth-alert-error">{error}</div>}
                        {info  && <div className="auth-alert auth-alert-info">{info}</div>}

                        <form onSubmit={handleLogin} className="auth-form">
                            <label>
                                <span className="auth-field-label">Email address</span>
                                <div className="auth-input-wrap">
                                    <Mail size={17} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="alex@example.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        style={FIELD_STYLES}
                                    />
                                </div>
                            </label>

                            <label>
                                <span className="auth-field-label">Password</span>
                                <div className="auth-input-wrap">
                                    <Lock size={17} />
                                    <input
                                        type="password"
                                        required
                                        placeholder="Enter your password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        style={FIELD_STYLES}
                                    />
                                </div>
                            </label>

                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
                            </button>
                        </form>

                        <p className="auth-footer-link">
                            No account?{' '}
                            <button type="button" onClick={() => switchMode(false)}>
                                Sign up here
                            </button>
                        </p>
                    </div>
                )}

                {/* ══════════════════════════════════
                    SIGNUP
                ══════════════════════════════════ */}
                {!isLogin && (
                    <div className="auth-signup-wrapper">
                        {/* Role Picker */}
                        <div className="auth-roles-row">
                            {providerRoles.map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    className={`auth-role-card${activeRole === role ? ' is-active' : ''}`}
                                    onClick={() => updateField('role', role)}
                                >
                                    {ROLE_ICONS[role] ?? <User size={24} />}
                                    <span>{ROLE_LABELS[role]}</span>
                                </button>
                            ))}
                        </div>

                        {/* Form Card */}
                        <div className={`auth-card auth-card--wide auth-form-enter`}>
                            {/* Toggle */}
                            <div className="auth-toggle-wrap">
                                <div className="auth-toggle" role="tablist">
                                    <button
                                        type="button"
                                        className={`auth-toggle-btn${isLogin ? ' is-active' : ''}`}
                                        onClick={() => switchMode(true)}
                                    >
                                        Login
                                    </button>
                                    <button
                                        type="button"
                                        className={`auth-toggle-btn${!isLogin ? ' is-active' : ''}`}
                                        onClick={() => switchMode(false)}
                                    >
                                        Signup
                                    </button>
                                </div>
                            </div>

                            {error && <div className="auth-alert auth-alert-error" style={{ marginTop: '14px' }}>{error}</div>}
                            {info  && <div className="auth-alert auth-alert-info" style={{ marginTop: '14px' }}>{info}</div>}

                            <form onSubmit={handleSignup} className="auth-signup-form" style={{ marginTop: '16px' }}>
                                {/* Core fields always shown */}
                                <div className="auth-section-sep"><span>Account</span></div>

                                <div className="auth-grid-2">
                                    <label>
                                        <span className="auth-field-label">Full Name</span>
                                        <div className="auth-input-box">
                                            <User size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Alex Mercer"
                                                value={formValues.fullName}
                                                onChange={(e) => updateField('fullName', e.target.value)}
                                                style={FIELD_STYLES}
                                            />
                                        </div>
                                    </label>

                                    <label>
                                        <span className="auth-field-label">Email Address</span>
                                        <div className="auth-input-box">
                                            <Mail size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                                            <input
                                                type="email"
                                                required
                                                placeholder="alex@example.com"
                                                value={formValues.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                                style={FIELD_STYLES}
                                            />
                                        </div>
                                    </label>

                                    <label className="auth-full-col">
                                        <span className="auth-field-label">Password</span>
                                        <div className="auth-input-box">
                                            <Lock size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                                            <input
                                                type="password"
                                                required
                                                minLength={8}
                                                placeholder="Minimum 8 characters"
                                                value={formValues.password}
                                                onChange={(e) => updateField('password', e.target.value)}
                                                style={FIELD_STYLES}
                                            />
                                        </div>
                                    </label>
                                </div>

                                {/* Role-specific fields */}
                                {roleConfig.fields.length > 0 && (
                                    <>
                                        <div className="auth-section-sep" style={{ marginTop: '4px' }}>
                                            <span>{ROLE_LABELS[activeRole]} details</span>
                                        </div>
                                        <div className="auth-grid-2">
                                            {roleConfig.fields.map((field) => (
                                                <label key={field.key}>
                                                    <span className="auth-field-label">{field.label}</span>
                                                    <div className="auth-input-box">
                                                        {FIELD_ICONS[field.key] && (
                                                            <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, display: 'flex' }}>
                                                                {FIELD_ICONS[field.key]}
                                                            </span>
                                                        )}
                                                        <input
                                                            type={FIELD_INPUT_TYPES[field.key] || 'text'}
                                                            required={field.required}
                                                            placeholder={field.placeholder}
                                                            value={String(formValues[field.key] ?? '')}
                                                            onChange={(e) =>
                                                                updateField(field.key, e.target.value as SignupFormValues[typeof field.key])
                                                            }
                                                            style={FIELD_STYLES}
                                                        />
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Works under company */}
                                {activeRole !== 'tour_company' && activeRole !== 'tourist' && (
                                    <label className="auth-toggle-check">
                                        <input
                                            type="checkbox"
                                            checked={formValues.worksUnderCompany}
                                            onChange={(e) => updateField('worksUnderCompany', e.target.checked)}
                                        />
                                        <span>I currently work under or collaborate with a tour company profile.</span>
                                    </label>
                                )}

                                <button type="submit" className="auth-submit" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                                </button>
                            </form>

                            <p className="auth-footer-link">
                                Already have an account?{' '}
                                <button type="button" onClick={() => switchMode(true)}>
                                    Sign in here
                                </button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
