import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, Calendar, Loader2, MessageCircle, RefreshCcw, ShieldAlert, ShieldCheck, Star, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getBookings,
    getConversations,
    getFavorites,
    getLatestVerification,
    getProviderBookings,
    resubmitVerificationApplication,
    type UnifiedBooking,
    type VerificationRecord,
} from '../lib/destinations';
import { getRoleLabel, isProviderRole } from '../lib/platform';

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <article style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</span>
        <strong style={{ fontSize: '1.8rem', lineHeight: 1 }}>{value}</strong>
    </article>
);

const BookingCard: React.FC<{ booking: UnifiedBooking }> = ({ booking }) => (
    <div
        style={{
            background: 'var(--surface-main)',
            padding: '1.35rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: 'var(--shadow-subtle)',
            flexWrap: 'wrap',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px', flex: '1 1 320px' }}>
            <div style={{ width: '78px', height: '78px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                <img src={booking.listing_image} alt={booking.listing_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>{booking.listing_title}</h4>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} /> {booking.number_of_people} travelers
                    </span>
                </div>
            </div>
        </div>
        <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Rs {booking.total_price.toLocaleString()}</div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--success-text)', textTransform: 'uppercase', background: 'var(--success-bg)', padding: '0.4rem 0.7rem', borderRadius: 'var(--radius-sm)' }}>
                {booking.status}
            </span>
        </div>
    </div>
);

export const Profile: React.FC = () => {
    const { user, profile, profileLoading, signOut, verificationLabel, roleLabel, isProvider, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [travelerBookings, setTravelerBookings] = useState<UnifiedBooking[]>([]);
    const [providerBookings, setProviderBookings] = useState<UnifiedBooking[]>([]);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [conversationsCount, setConversationsCount] = useState(0);
    const [latestVerification, setLatestVerification] = useState<VerificationRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [resubmitting, setResubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const [bookingRows, inboundRows, favoriteRows, conversationRows] = await Promise.all([
                    getBookings(user.id),
                    isProviderRole(profile?.role) ? getProviderBookings(user.id) : Promise.resolve([]),
                    getFavorites(user.id),
                    getConversations(user.id),
                ]);
                setTravelerBookings(bookingRows);
                setProviderBookings(inboundRows);
                setFavoritesCount(favoriteRows.length);
                setConversationsCount(conversationRows.length);
                if (isProviderRole(profile?.role)) {
                    const verificationRow = await getLatestVerification(user.id);
                    setLatestVerification(verificationRow);
                } else {
                    setLatestVerification(null);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [profile?.role, user]);

    const stats = useMemo(() => {
        if (isProvider) {
            return [
                { label: 'Inbound Bookings', value: providerBookings.length.toString().padStart(2, '0') },
                { label: 'Favorites', value: favoritesCount.toString().padStart(2, '0') },
                { label: 'Chats', value: conversationsCount.toString().padStart(2, '0') },
                { label: 'Verification', value: verificationLabel === 'Verified' ? 'OK' : 'Pending' },
            ];
        }

        return [
            { label: 'Trips', value: travelerBookings.length.toString().padStart(2, '0') },
            { label: 'Favorites', value: favoritesCount.toString().padStart(2, '0') },
            { label: 'Chats', value: conversationsCount.toString().padStart(2, '0') },
            { label: 'Reviews', value: 'Post-trip' },
        ];
    }, [conversationsCount, favoritesCount, isProvider, providerBookings.length, travelerBookings.length, verificationLabel]);

    if (!user) return null;

    const languages = Array.isArray(profile?.languages)
        ? profile.languages.join(', ')
        : profile?.languages || 'Not provided';

    const headlineCopy = isProvider
        ? 'Provider account linked to the same Supabase backend with verification-aware access.'
        : 'Traveler account with favorites, bookings, reviews after completed trips, and provider chat readiness.';

    const canResubmitVerification = isProvider && profile?.verification_status === 'rejected';

    const handleResubmit = async () => {
        if (!user || !canResubmitVerification) return;

        setResubmitting(true);
        try {
            await resubmitVerificationApplication(user.id);
            await refreshProfile();
        } catch (error) {
            console.error('Failed to resubmit verification:', error);
            alert('Failed to resubmit verification. Please try again.');
        } finally {
            setResubmitting(false);
        }
    };

    return (
        <main style={{ backgroundColor: 'var(--bg-main)', paddingTop: '156px', paddingBottom: '120px', minHeight: '100vh' }} className="animate-fade">
            <div className="container" style={{ maxWidth: '1040px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 nav-desktop"
                    style={{ marginBottom: '2rem', fontWeight: 600, color: 'var(--text-muted)', border: 'none', background: 'none' }}
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <section
                    style={{
                        background: 'var(--surface-main)',
                        padding: '3rem',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-card)',
                        marginBottom: '2rem',
                    }}
                >
                    {canResubmitVerification && (
                        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '14px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.18)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                <ShieldAlert size={18} />
                                <div>
                                    <strong>Verification was rejected</strong>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Reapply with your current provider details to move this account back into admin review.
                                    </p>
                                    {latestVerification?.rejection_reason && (
                                        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                            Reason: {latestVerification.rejection_reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleResubmit}
                                disabled={resubmitting}
                                className="btn btn-primary"
                                style={{ borderRadius: '999px', padding: '10px 18px' }}
                            >
                                {resubmitting ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                                Resubmit Verification
                            </button>
                        </div>
                    )}

                    <div className="profile-header-grid" style={{ display: 'grid', gridTemplateColumns: '132px minmax(0, 1fr)', gap: '26px', alignItems: 'center' }}>
                        <div style={{ width: '132px', height: '132px', borderRadius: '28px', overflow: 'hidden', border: '4px solid var(--surface-main)', boxShadow: 'var(--shadow-card)' }}>
                            <img
                                src={profile?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                <span style={{ padding: '0.5rem 0.8rem', borderRadius: '999px', background: 'rgba(24, 124, 103, 0.1)', color: 'var(--accent)', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{roleLabel}</span>
                                <span style={{ padding: '0.5rem 0.8rem', borderRadius: '999px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{verificationLabel}</span>
                            </div>
                            <h1 className="h1" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{profile?.full_name || 'Member'}</h1>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem' }}>{user.email}</p>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '720px' }}>{profile?.bio || headlineCopy}</p>

                            <div className="flex gap-4 flex-wrap" style={{ marginTop: '1.4rem' }}>
                                <Link to="/dashboard" className="btn btn-soft" style={{ borderRadius: 'var(--radius-full)', padding: '10px 20px', fontSize: '0.85rem' }}>Dashboard</Link>
                                <button onClick={() => signOut()} className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '10px 20px', fontSize: '0.85rem' }}>Sign Out</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: '2rem' }} className="profile-stats-grid">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} label={stat.label} value={stat.value} />
                    ))}
                </section>

                <section style={{ display: 'grid', gap: '18px', gridTemplateColumns: '1.1fr 0.9fr', marginBottom: '2rem' }} className="profile-detail-grid">
                    <article style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', padding: '1.75rem' }}>
                        <span style={{ display: 'inline-flex', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Account Details</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }} className="profile-detail-cells">
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Role</p>
                                <strong>{roleLabel}</strong>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Verification</p>
                                <strong>{verificationLabel}</strong>
                                {latestVerification?.reviewed_at && (
                                    <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                        Reviewed {new Date(latestVerification.reviewed_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Phone</p>
                                <strong>{profile?.phone || 'Not provided'}</strong>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Location</p>
                                <strong>{[profile?.city, profile?.country].filter(Boolean).join(', ') || 'Not provided'}</strong>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Website</p>
                                <strong>{profile?.website || 'Not provided'}</strong>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Languages</p>
                                <strong>{languages}</strong>
                            </div>
                        </div>
                    </article>

                    <article style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', padding: '1.75rem' }}>
                        <span style={{ display: 'inline-flex', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Role Summary</span>
                        <div style={{ display: 'grid', gap: '14px' }}>
                            {isProvider && (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                    <Building2 size={18} />
                                    <div>
                                        <strong>{profile?.company_name || 'Independent provider'}</strong>
                                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                            {profile?.works_under_company ? 'Works under an associated company profile.' : 'Operates directly from the individual account.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                <ShieldCheck size={18} />
                                <div>
                                    <strong>{getRoleLabel(profile?.role)} system status</strong>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Providers keep a visible verification pending state. Travelers stay active without admin review.
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                <MessageCircle size={18} />
                                <div>
                                    <strong>{conversationsCount} current chats</strong>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Recommended messaging rule: traveler-to-provider chat only, tied to inquiries or bookings.
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                <Star size={18} />
                                <div>
                                    <strong>Review policy</strong>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Reviews should only unlock after a completed booking for the same listing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>
                </section>

                <section style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', padding: '1.75rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                            <h2 className="h2" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{isProvider ? 'Inbound Bookings' : 'Your Journeys'}</h2>
                            <p style={{ color: 'var(--text-muted)' }}>
                                {isProvider
                                    ? 'Bookings coming into your approved provider listings.'
                                    : 'Past and active bookings from the unified booking model.'}
                            </p>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                            {(isProvider ? providerBookings : travelerBookings).length} records
                        </span>
                    </div>

                    {(loading || profileLoading) ? (
                        <div className="flex justify-center" style={{ padding: '60px 0' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    ) : (isProvider ? providerBookings : travelerBookings).length > 0 ? (
                        <div style={{ display: 'grid', gap: '14px' }}>
                            {(isProvider ? providerBookings : travelerBookings).map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '72px 32px', background: 'var(--bg-main)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.8rem', fontWeight: 500 }}>
                                {isProvider ? 'No inbound bookings recorded yet.' : 'No journeys recorded yet.'}
                            </p>
                            <Link to="/dashboard" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '14px 28px' }}>
                                {isProvider ? 'Return to Dashboard' : 'Find Your First Adventure'}
                            </Link>
                        </div>
                    )}
                </section>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .profile-stats-grid,
                    .profile-detail-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }

                    .profile-detail-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 768px) {
                    main { padding-top: 138px !important; }
                    .profile-header-grid {
                        grid-template-columns: 1fr !important;
                    }

                    .profile-stats-grid,
                    .profile-detail-cells {
                        grid-template-columns: 1fr !important;
                    }

                    .nav-desktop { display: none !important; }
                }
            `}</style>
        </main>
    );
};
