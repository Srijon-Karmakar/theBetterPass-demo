import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Calendar, Camera, Check, ChevronLeft, Loader2,
    LogOut, Moon, RefreshCcw, ShieldAlert, Sun, Users, X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../lib/supabase';
import {
    getBookings, getConversations, getFavorites,
    getLatestVerification, getProviderBookings,
    resubmitVerificationApplication, updateProfile,
    type UnifiedBooking, type VerificationRecord,
} from '../lib/destinations';
import { isProviderRole } from '../lib/platform';

/* ── helpers ───────────────────────────────────────────────── */
const AVATARS_BUCKET = 'avatars';

const getProfileErrorMessage = (error: unknown): string => {
    const message = error instanceof Error ? error.message : String(error || '');
    const lower = message.toLowerCase();

    if (lower.includes('bucket') && (lower.includes('not found') || lower.includes('does not exist'))) {
        return 'Image upload failed: the "avatars" storage bucket is missing. Run docs/supabase-role-system.sql to create it.';
    }

    if (lower.includes('row-level security') || lower.includes('policy')) {
        return 'Request was blocked by Supabase RLS policy. Run docs/supabase-role-system.sql to apply required policies.';
    }

    if (lower.includes('missing required columns')) {
        return 'Profile table is missing columns required by this app. Run docs/supabase-role-system.sql and retry.';
    }

    return message ? `Request failed: ${message}` : 'Request failed. Check Supabase schema and policies.';
};
const uploadImage = async (file: File, userId: string, type: 'avatar' | 'cover'): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${type}.${ext}`;
    const { error } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
};

/* ── BookingCard ───────────────────────────────────────────── */
const BookingCard: React.FC<{ booking: UnifiedBooking }> = ({ booking }) => (
    <div className="prf-booking-card">
        <div className="prf-booking-thumb">
            <img src={booking.listing_image} alt={booking.listing_title} />
        </div>
        <div className="prf-booking-info">
            <h4>{booking.listing_title}</h4>
            <div className="prf-booking-meta">
                <span><Calendar size={13} /> {new Date(booking.created_at).toLocaleDateString()}</span>
                <span><Users size={13} /> {booking.number_of_people} travelers</span>
            </div>
        </div>
        <div className="prf-booking-right">
            <strong>Rs {booking.total_price.toLocaleString()}</strong>
            <span className={`prf-status prf-status--${booking.status}`}>{booking.status}</span>
        </div>
    </div>
);

/* ── ToggleSwitch ──────────────────────────────────────────── */
const ToggleSwitch: React.FC<{ on: boolean; onToggle: () => void; label: string }> = ({ on, onToggle, label }) => (
    <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        className={`prf-toggle${on ? ' prf-toggle--on' : ''}`}
    >
        <span className="prf-toggle-knob" />
    </button>
);

/* ── Main component ────────────────────────────────────────── */
export const Profile: React.FC = () => {
    const { user, profile, profileLoading, signOut, verificationLabel, roleLabel, isProvider, refreshProfile } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    /* data */
    const [travelerBookings, setTravelerBookings] = useState<UnifiedBooking[]>([]);
    const [providerBookings, setProviderBookings] = useState<UnifiedBooking[]>([]);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [conversationsCount, setConversationsCount] = useState(0);
    const [latestVerification, setLatestVerification] = useState<VerificationRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [resubmitting, setResubmitting] = useState(false);

    /* edit */
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', bio: '', phone: '', city: '', country: '', website: '' });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    /* image upload */
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [localAvatarUrl, setLocalAvatarUrl] = useState<string | undefined>();
    const [localCoverUrl, setLocalCoverUrl] = useState<string | undefined>();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    /* sync form + local images with profile */
    useEffect(() => {
        if (!profile) return;
        setEditForm({
            full_name: profile.full_name || '',
            bio: profile.bio || '',
            phone: profile.phone || '',
            city: profile.city || '',
            country: profile.country || '',
            website: profile.website || '',
        });
        setLocalAvatarUrl(profile.profile_image_url);
        setLocalCoverUrl(profile.cover_image_url);
    }, [profile]);

    /* fetch bookings, favorites, conversations */
    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            try {
                const [bookings, inbound, favorites, conversations] = await Promise.all([
                    getBookings(user.id),
                    isProviderRole(profile?.role) ? getProviderBookings(user.id) : Promise.resolve([]),
                    getFavorites(user.id),
                    getConversations(user.id),
                ]);
                setTravelerBookings(bookings);
                setProviderBookings(inbound);
                setFavoritesCount(favorites.length);
                setConversationsCount(conversations.length);
                if (isProviderRole(profile?.role)) {
                    setLatestVerification(await getLatestVerification(user.id));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [profile?.role, user]);

    /* save profile edits */
    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setSaveError('');
        try {
            await updateProfile({ id: user.id, ...editForm });
            await refreshProfile();
            setIsEditing(false);
        } catch (err) {
            setSaveError(getProfileErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    /* image uploads */
    const handleImageUpload = async (file: File, type: 'avatar' | 'cover') => {
        if (!user) return;
        const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingCover;
        setUploading(true);
        try {
            const url = await uploadImage(file, user.id, type);
            if (type === 'avatar') {
                setLocalAvatarUrl(url);
                await updateProfile({ id: user.id, profile_image_url: url });
            } else {
                setLocalCoverUrl(url);
                await updateProfile({ id: user.id, cover_image_url: url });
            }
            await refreshProfile();
        } catch (err) {
            console.error(err);
            alert(getProfileErrorMessage(err));
        } finally {
            setUploading(false);
        }
    };

    /* resubmit verification */
    const handleResubmit = async () => {
        if (!user || profile?.verification_status !== 'rejected') return;
        setResubmitting(true);
        try {
            await resubmitVerificationApplication(user.id);
            await refreshProfile();
        } catch {
            alert('Failed to resubmit. Please try again.');
        } finally {
            setResubmitting(false);
        }
    };

    /* derived */
    const avatarSrc = localAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`;
    const displayBookings = isProvider ? providerBookings : travelerBookings;
    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Member';
    const locationStr = [profile?.city, profile?.country].filter(Boolean).join(', ');

    const stats = useMemo(() => [
        { label: isProvider ? 'Inbound' : 'Trips', value: (isProvider ? providerBookings : travelerBookings).length.toString().padStart(2, '0') },
        { label: 'Favorites', value: favoritesCount.toString().padStart(2, '0') },
        { label: 'Chats', value: conversationsCount.toString().padStart(2, '0') },
        { label: isProvider ? 'Status' : 'Reviews', value: isProvider ? (verificationLabel === 'Verified' ? '✓' : '…') : '00' },
    ], [conversationsCount, favoritesCount, isProvider, providerBookings, travelerBookings, verificationLabel]);

    if (!user) return null;

    return (
        <main className="prf-page animate-fade">
            <div className="container prf-shell">

                {/* Back */}
                <button onClick={() => navigate(-1)} className="prf-back">
                    <ChevronLeft size={17} /> Back
                </button>

                {/* ── Verification banner ──────────────────────── */}
                {isProvider && profile?.verification_status === 'rejected' && (
                    <div className="prf-banner prf-banner--danger">
                        <ShieldAlert size={18} />
                        <div style={{ flex: 1 }}>
                            <strong>Verification rejected</strong>
                            {latestVerification?.rejection_reason && (
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.85 }}>
                                    Reason: {latestVerification.rejection_reason}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            className="prf-banner-btn"
                            onClick={handleResubmit}
                            disabled={resubmitting}
                        >
                            {resubmitting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                            Resubmit
                        </button>
                    </div>
                )}

                {/* ── Hero card ────────────────────────────────── */}
                <div className="prf-hero-card">

                    {/* Cover image */}
                    <div
                        className="prf-cover"
                        style={localCoverUrl ? { backgroundImage: `url(${localCoverUrl})` } : undefined}
                    >
                        {uploadingCover && (
                            <div className="prf-cover-loader">
                                <Loader2 size={24} className="animate-spin" />
                            </div>
                        )}
                        <button
                            type="button"
                            className="prf-cover-btn"
                            onClick={() => coverInputRef.current?.click()}
                        >
                            <Camera size={14} />
                            {localCoverUrl ? 'Change Cover' : 'Add Cover'}
                        </button>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) void handleImageUpload(f, 'cover');
                                e.target.value = '';
                            }}
                        />
                    </div>

                    {/* Avatar + edit profile button row */}
                    <div className="prf-avatar-row">
                        <div
                            className="prf-avatar-wrap"
                            onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
                            title="Change profile photo"
                        >
                            {uploadingAvatar ? (
                                <div className="prf-avatar-img prf-avatar-loading">
                                    <Loader2 size={24} className="animate-spin" />
                                </div>
                            ) : (
                                <img src={avatarSrc} alt={displayName} className="prf-avatar-img" />
                            )}
                            <div className="prf-avatar-overlay">
                                <Camera size={16} />
                            </div>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) void handleImageUpload(f, 'avatar');
                                    e.target.value = '';
                                }}
                            />
                        </div>

                        {!isEditing && (
                            <button className="prf-edit-btn" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Info section */}
                    <div className="prf-info-body">
                        {isEditing ? (
                            /* ── Edit form ─── */
                            <div className="prf-edit-form">
                                <div className="prf-form-grid">
                                    <div className="prf-field">
                                        <label className="prf-label">Full Name</label>
                                        <input
                                            className="prf-input"
                                            value={editForm.full_name}
                                            onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="prf-field">
                                        <label className="prf-label">Phone</label>
                                        <input
                                            className="prf-input"
                                            value={editForm.phone}
                                            onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                    <div className="prf-field prf-field--full">
                                        <label className="prf-label">Bio</label>
                                        <textarea
                                            className="prf-input prf-textarea"
                                            value={editForm.bio}
                                            onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                                            placeholder="Write something about yourself..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="prf-field">
                                        <label className="prf-label">City</label>
                                        <input
                                            className="prf-input"
                                            value={editForm.city}
                                            onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="prf-field">
                                        <label className="prf-label">Country</label>
                                        <input
                                            className="prf-input"
                                            value={editForm.country}
                                            onChange={e => setEditForm(f => ({ ...f, country: e.target.value }))}
                                            placeholder="Country"
                                        />
                                    </div>
                                    <div className="prf-field prf-field--full">
                                        <label className="prf-label">Website</label>
                                        <input
                                            className="prf-input"
                                            value={editForm.website}
                                            onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))}
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </div>
                                {saveError && <p className="prf-save-error">{saveError}</p>}
                                <div className="prf-form-actions">
                                    <button
                                        type="button"
                                        className="prf-btn prf-btn--ghost"
                                        onClick={() => { setIsEditing(false); setSaveError(''); }}
                                    >
                                        <X size={15} /> Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="prf-btn prf-btn--primary"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── Display view ─── */
                            <>
                                <div className="prf-badges">
                                    <span className="prf-badge prf-badge--role">{roleLabel}</span>
                                    <span className="prf-badge prf-badge--verify">{verificationLabel}</span>
                                </div>
                                <h1 className="prf-name">{displayName}</h1>
                                <p className="prf-email">{user.email}</p>
                                {profile?.bio && <p className="prf-bio">{profile.bio}</p>}
                                <div className="prf-meta-row">
                                    {locationStr && <span className="prf-meta-chip">📍 {locationStr}</span>}
                                    {profile?.phone && <span className="prf-meta-chip">📞 {profile.phone}</span>}
                                    {profile?.website && (
                                        <a className="prf-meta-chip prf-meta-chip--link" href={profile.website} target="_blank" rel="noopener noreferrer">
                                            🌐 {profile.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Stats ───────────────────────────────────── */}
                <div className="prf-stats-row">
                    {stats.map(s => (
                        <div key={s.label} className="prf-stat">
                            <strong className="prf-stat-val">{s.value}</strong>
                            <span className="prf-stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* ── Bookings ─────────────────────────────────── */}
                <section className="prf-card">
                    <div className="prf-card-head">
                        <div>
                            <h2 className="prf-card-title">{isProvider ? 'Inbound Bookings' : 'Your Journeys'}</h2>
                            <p className="prf-card-sub">{isProvider ? 'Bookings on your listings' : 'Your travel history'}</p>
                        </div>
                        <span className="prf-count-badge">{displayBookings.length} records</span>
                    </div>

                    {(loading || profileLoading) ? (
                        <div className="prf-center-loader"><Loader2 className="animate-spin" size={28} /></div>
                    ) : displayBookings.length > 0 ? (
                        <div className="prf-booking-list">
                            {displayBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                        </div>
                    ) : (
                        <div className="prf-empty">
                            <p>{isProvider ? 'No inbound bookings yet.' : 'No journeys recorded yet.'}</p>
                            <Link to="/dashboard" className="btn btn-primary" style={{ borderRadius: '999px', marginTop: '16px' }}>
                                {isProvider ? 'Go to Dashboard' : 'Find Adventures'}
                            </Link>
                        </div>
                    )}
                </section>

                {/* ── Settings ─────────────────────────────────── */}
                <section className="prf-card">
                    <h2 className="prf-card-title" style={{ marginBottom: '8px' }}>Settings</h2>

                    {/* Appearance */}
                    <div className="prf-setting-row">
                        <div className="prf-setting-left">
                            <div className="prf-setting-icon">
                                {isDark ? <Moon size={16} /> : <Sun size={16} />}
                            </div>
                            <div>
                                <p className="prf-setting-label">Appearance</p>
                                <p className="prf-setting-sub">{isDark ? 'Dark mode is on' : 'Light mode is on'}</p>
                            </div>
                        </div>
                        <ToggleSwitch on={isDark} onToggle={toggleTheme} label="Toggle dark mode" />
                    </div>

                    <div className="prf-setting-sep" />

                    {/* Sign out */}
                    <div className="prf-setting-row">
                        <div className="prf-setting-left">
                            <div className="prf-setting-icon prf-setting-icon--danger">
                                <LogOut size={16} />
                            </div>
                            <div>
                                <p className="prf-setting-label">Sign Out</p>
                                <p className="prf-setting-sub">Sign out of your account on this device</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="prf-signout-btn"
                            onClick={() => void signOut()}
                        >
                            Sign Out
                        </button>
                    </div>
                </section>
            </div>

            <style>{`
                /* ── Page ──────────────────────────────────────── */
                .prf-page {
                    background: var(--bg-main);
                    min-height: 100vh;
                    padding-top: 140px;
                    padding-bottom: 100px;
                }
                .prf-shell {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-width: 800px;
                }

                /* Back button */
                .prf-back {
                    align-items: center;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: inline-flex;
                    font-size: 0.9rem;
                    font-weight: 600;
                    gap: 6px;
                    padding: 0;
                    transition: color 0.18s;
                }
                .prf-back:hover { color: var(--text-main); }

                /* Verification banner */
                .prf-banner {
                    align-items: flex-start;
                    border-radius: 16px;
                    display: flex;
                    gap: 12px;
                    padding: 14px 16px;
                }
                .prf-banner--danger {
                    background: rgba(239,68,68,0.08);
                    border: 1px solid rgba(239,68,68,0.2);
                    color: var(--danger-text);
                }
                .prf-banner-btn {
                    align-items: center;
                    background: rgba(239,68,68,0.12);
                    border: 1px solid rgba(239,68,68,0.25);
                    border-radius: 999px;
                    color: var(--danger-text);
                    cursor: pointer;
                    display: inline-flex;
                    flex-shrink: 0;
                    font-size: 0.82rem;
                    font-weight: 700;
                    gap: 6px;
                    padding: 7px 14px;
                }

                /* ── Hero card ──────────────────────────────────── */
                .prf-hero-card {
                    background: var(--surface-main);
                    border: 1px solid var(--border-light);
                    border-radius: 28px;
                    box-shadow: var(--shadow-card);
                    overflow: hidden;
                }

                /* Cover */
                .prf-cover {
                    background: linear-gradient(135deg,
                        color-mix(in srgb, var(--accent) 30%, transparent),
                        color-mix(in srgb, var(--primary) 20%, transparent));
                    background-position: center;
                    background-size: cover;
                    height: 200px;
                    position: relative;
                }
                .prf-cover-loader {
                    align-items: center;
                    background: rgba(0,0,0,0.4);
                    bottom: 0; left: 0; right: 0; top: 0;
                    color: #fff;
                    display: flex;
                    justify-content: center;
                    position: absolute;
                }
                .prf-cover-btn {
                    align-items: center;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    background: rgba(0,0,0,0.38);
                    border: 1px solid rgba(255,255,255,0.25);
                    border-radius: 999px;
                    bottom: 14px;
                    color: #fff;
                    cursor: pointer;
                    display: inline-flex;
                    font-size: 0.78rem;
                    font-weight: 700;
                    gap: 6px;
                    padding: 7px 14px;
                    position: absolute;
                    right: 16px;
                    transition: background 0.18s;
                }
                .prf-cover-btn:hover { background: rgba(0,0,0,0.55); }

                /* Avatar row */
                .prf-avatar-row {
                    align-items: flex-end;
                    display: flex;
                    gap: 16px;
                    justify-content: space-between;
                    padding: 0 24px 0 24px;
                }
                .prf-avatar-wrap {
                    border: 4px solid var(--surface-main);
                    border-radius: 50%;
                    cursor: pointer;
                    flex-shrink: 0;
                    height: 104px;
                    margin-top: -52px;
                    overflow: hidden;
                    position: relative;
                    transition: transform 0.18s;
                    width: 104px;
                }
                .prf-avatar-wrap:hover { transform: scale(1.04); }
                .prf-avatar-img {
                    height: 100%;
                    object-fit: cover;
                    width: 100%;
                }
                .prf-avatar-loading {
                    align-items: center;
                    background: var(--surface-muted);
                    display: flex;
                    justify-content: center;
                }
                .prf-avatar-overlay {
                    align-items: center;
                    background: rgba(0,0,0,0.46);
                    bottom: 0; left: 0; right: 0; top: 0;
                    color: #fff;
                    display: flex;
                    justify-content: center;
                    opacity: 0;
                    position: absolute;
                    transition: opacity 0.18s;
                }
                .prf-avatar-wrap:hover .prf-avatar-overlay { opacity: 1; }

                .prf-edit-btn {
                    align-self: flex-end;
                    background: var(--surface-muted);
                    border: 1px solid var(--border-light);
                    border-radius: 999px;
                    color: var(--text-main);
                    cursor: pointer;
                    font-size: 0.82rem;
                    font-weight: 700;
                    margin-bottom: 4px;
                    padding: 8px 18px;
                    transition: background 0.18s, transform 0.18s;
                }
                .prf-edit-btn:hover {
                    background: var(--border-light);
                    transform: translateY(-1px);
                }

                /* Info body */
                .prf-info-body { padding: 16px 24px 28px; }

                /* Badges */
                .prf-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
                .prf-badge {
                    border-radius: 999px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.06em;
                    padding: 5px 12px;
                    text-transform: uppercase;
                }
                .prf-badge--role {
                    background: color-mix(in srgb, var(--accent) 14%, transparent);
                    color: var(--accent);
                }
                .prf-badge--verify {
                    background: var(--surface-muted);
                    border: 1px solid var(--border-light);
                    color: var(--text-muted);
                }

                .prf-name {
                    font-family: 'Outfit', sans-serif;
                    font-size: clamp(1.6rem, 4vw, 2.4rem);
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin-bottom: 4px;
                }
                .prf-email {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 10px;
                }
                .prf-bio {
                    color: var(--text-muted);
                    font-size: 0.92rem;
                    line-height: 1.7;
                    margin-bottom: 12px;
                    max-width: 60ch;
                }
                .prf-meta-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 8px;
                }
                .prf-meta-chip {
                    background: var(--surface-muted);
                    border: 1px solid var(--border-light);
                    border-radius: 999px;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    font-weight: 500;
                    padding: 5px 12px;
                }
                .prf-meta-chip--link {
                    color: var(--accent);
                    text-decoration: none;
                }
                .prf-meta-chip--link:hover { text-decoration: underline; }

                /* ── Edit form ──────────────────────────────────── */
                .prf-edit-form { display: flex; flex-direction: column; gap: 20px; }
                .prf-form-grid {
                    display: grid;
                    gap: 14px;
                    grid-template-columns: 1fr 1fr;
                }
                .prf-field { display: flex; flex-direction: column; gap: 6px; }
                .prf-field--full { grid-column: 1 / -1; }
                .prf-label {
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
                .prf-input {
                    background: var(--bg-main);
                    border: 1px solid var(--border-light);
                    border-radius: 12px;
                    color: var(--text-main);
                    font-family: inherit;
                    font-size: 0.9rem;
                    outline: none;
                    padding: 10px 14px;
                    transition: border-color 0.18s, box-shadow 0.18s;
                    width: 100%;
                }
                .prf-input:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
                }
                .prf-textarea { resize: vertical; }
                .prf-save-error {
                    color: var(--danger-text);
                    font-size: 0.85rem;
                    margin: 0;
                }
                .prf-form-actions {
                    align-items: center;
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                .prf-btn {
                    align-items: center;
                    border-radius: 999px;
                    cursor: pointer;
                    display: inline-flex;
                    font-family: inherit;
                    font-size: 0.85rem;
                    font-weight: 700;
                    gap: 7px;
                    padding: 9px 20px;
                    transition: transform 0.18s, box-shadow 0.18s;
                }
                .prf-btn:hover { transform: translateY(-1px); }
                .prf-btn--ghost {
                    background: var(--surface-muted);
                    border: 1px solid var(--border-light);
                    color: var(--text-main);
                }
                .prf-btn--primary {
                    background: var(--primary);
                    border: none;
                    color: var(--text-inverse);
                }
                .prf-btn--primary:disabled { opacity: 0.6; }

                /* ── Stats ──────────────────────────────────────── */
                .prf-stats-row {
                    background: var(--surface-main);
                    border: 1px solid var(--border-light);
                    border-radius: 22px;
                    box-shadow: var(--shadow-subtle);
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                }
                .prf-stat {
                    border-right: 1px solid var(--border-light);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 22px 20px;
                    text-align: center;
                }
                .prf-stat:last-child { border-right: none; }
                .prf-stat-val {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.9rem;
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    line-height: 1;
                }
                .prf-stat-label {
                    color: var(--text-muted);
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                /* ── Cards (bookings, settings) ─────────────────── */
                .prf-card {
                    background: var(--surface-main);
                    border: 1px solid var(--border-light);
                    border-radius: 24px;
                    box-shadow: var(--shadow-subtle);
                    padding: 24px;
                }
                .prf-card-head {
                    align-items: flex-start;
                    display: flex;
                    gap: 12px;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .prf-card-title {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.2rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }
                .prf-card-sub { color: var(--text-muted); font-size: 0.85rem; margin-top: 3px; }
                .prf-count-badge {
                    background: var(--surface-muted);
                    border-radius: 999px;
                    color: var(--text-muted);
                    flex-shrink: 0;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 4px 12px;
                    text-transform: uppercase;
                }

                /* Booking list */
                .prf-booking-list { display: flex; flex-direction: column; gap: 12px; }
                .prf-booking-card {
                    align-items: center;
                    background: var(--bg-main);
                    border: 1px solid var(--border-light);
                    border-radius: 16px;
                    display: flex;
                    gap: 14px;
                    padding: 14px;
                    transition: box-shadow 0.18s;
                }
                .prf-booking-card:hover { box-shadow: var(--shadow-subtle); }
                .prf-booking-thumb {
                    border-radius: 12px;
                    flex-shrink: 0;
                    height: 68px;
                    overflow: hidden;
                    width: 68px;
                }
                .prf-booking-thumb img { height: 100%; object-fit: cover; width: 100%; }
                .prf-booking-info { flex: 1; min-width: 0; }
                .prf-booking-info h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 6px; }
                .prf-booking-meta {
                    align-items: center;
                    color: var(--text-muted);
                    display: flex;
                    flex-wrap: wrap;
                    font-size: 0.78rem;
                    font-weight: 600;
                    gap: 10px;
                }
                .prf-booking-meta span {
                    align-items: center;
                    display: inline-flex;
                    gap: 5px;
                }
                .prf-booking-right { flex-shrink: 0; text-align: right; }
                .prf-booking-right strong { display: block; font-size: 1rem; font-weight: 800; margin-bottom: 6px; }
                .prf-status {
                    border-radius: 999px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.06em;
                    padding: 4px 10px;
                    text-transform: uppercase;
                }
                .prf-status--confirmed, .prf-status--completed {
                    background: var(--success-bg);
                    color: var(--success-text);
                }
                .prf-status--pending {
                    background: rgba(245,158,11,0.12);
                    color: #d97706;
                }
                .prf-status--cancelled {
                    background: rgba(239,68,68,0.1);
                    color: var(--danger-text);
                }

                /* Empty state */
                .prf-empty {
                    align-items: center;
                    display: flex;
                    flex-direction: column;
                    padding: 48px 24px;
                    text-align: center;
                }
                .prf-empty p { color: var(--text-muted); font-size: 0.95rem; }

                .prf-center-loader {
                    align-items: center;
                    color: var(--text-muted);
                    display: flex;
                    justify-content: center;
                    padding: 48px;
                }

                /* ── Settings ───────────────────────────────────── */
                .prf-setting-row {
                    align-items: center;
                    display: flex;
                    gap: 14px;
                    justify-content: space-between;
                    padding: 14px 0;
                }
                .prf-setting-left {
                    align-items: center;
                    display: flex;
                    gap: 14px;
                    min-width: 0;
                }
                .prf-setting-icon {
                    align-items: center;
                    background: var(--surface-muted);
                    border-radius: 10px;
                    color: var(--text-muted);
                    display: flex;
                    flex-shrink: 0;
                    height: 36px;
                    justify-content: center;
                    width: 36px;
                }
                .prf-setting-icon--danger {
                    background: rgba(239,68,68,0.1);
                    color: var(--danger-text);
                }
                .prf-setting-label { font-size: 0.9rem; font-weight: 700; margin: 0; }
                .prf-setting-sub { color: var(--text-muted); font-size: 0.78rem; margin: 2px 0 0; }
                .prf-setting-sep {
                    background: var(--border-light);
                    height: 1px;
                    margin: 0 -2px;
                }

                /* Toggle switch */
                .prf-toggle {
                    background: var(--border-light);
                    border: none;
                    border-radius: 999px;
                    cursor: pointer;
                    flex-shrink: 0;
                    height: 26px;
                    padding: 3px;
                    position: relative;
                    transition: background 0.25s ease;
                    width: 48px;
                }
                .prf-toggle--on { background: var(--accent); }
                .prf-toggle-knob {
                    background: #fff;
                    border-radius: 50%;
                    display: block;
                    height: 20px;
                    left: 3px;
                    position: absolute;
                    top: 3px;
                    transition: left 0.25s ease;
                    width: 20px;
                }
                .prf-toggle--on .prf-toggle-knob { left: calc(100% - 23px); }

                /* Sign out button */
                .prf-signout-btn {
                    background: rgba(239,68,68,0.08);
                    border: 1px solid rgba(239,68,68,0.2);
                    border-radius: 999px;
                    color: var(--danger-text);
                    cursor: pointer;
                    flex-shrink: 0;
                    font-size: 0.82rem;
                    font-weight: 700;
                    padding: 8px 18px;
                    transition: background 0.18s;
                }
                .prf-signout-btn:hover { background: rgba(239,68,68,0.14); }

                /* ── Responsive ─────────────────────────────────── */
                @media (max-width: 640px) {
                    .prf-page { padding-top: 110px; }
                    .prf-cover { height: 150px; }
                    .prf-avatar-wrap { height: 84px; margin-top: -42px; width: 84px; }
                    .prf-avatar-row { padding: 0 16px; }
                    .prf-info-body { padding: 12px 16px 22px; }
                    .prf-form-grid { grid-template-columns: 1fr; }
                    .prf-field--full { grid-column: auto; }
                    .prf-stats-row { grid-template-columns: repeat(2, 1fr); }
                    .prf-stat:nth-child(2) { border-right: none; }
                    .prf-stat:nth-child(3) { border-top: 1px solid var(--border-light); }
                    .prf-stat:nth-child(4) { border-top: 1px solid var(--border-light); }
                    .prf-booking-card { flex-wrap: wrap; }
                    .prf-booking-right { width: 100%; display: flex; justify-content: space-between; align-items: center; }
                }
            `}</style>
        </main>
    );
};

