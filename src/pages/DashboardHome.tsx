import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    ArrowRight,
    CalendarDays,
    Compass,
    Loader2,
    MessageCircle,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Ticket,
    UserRound,
    Waves,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    getBookings,
    getConversations,
    getFavorites,
    getLatestVerification,
    getMyPosts,
    getPublicListingsByType,
    getProviderBookings,
    resubmitVerificationApplication,
    type PostRecord,
    type UnifiedBooking,
    type VerificationRecord,
} from '../lib/destinations';
import type { ListingType } from '../lib/platform';
import { LISTING_LABELS, canRolePublish, getRoleLabel, isProviderRole } from '../lib/platform';
import './dashboard-home.css';

type DashboardTab = 'overview' | 'tours' | 'activities' | 'events';

const TAB_CONFIG: Array<{
    key: DashboardTab;
    label: string;
    type?: ListingType;
}> = [
    { key: 'overview', label: 'Overview' },
    { key: 'tours', label: 'Tours', type: 'tour' },
    { key: 'activities', label: 'Activities', type: 'activity' },
    { key: 'events', label: 'Events', type: 'event' },
];

const normalizeType = (value: string | null | undefined) => {
    const normalized = (value || '').trim().toLowerCase();
    if (normalized === 'tour' || normalized === 'activity' || normalized === 'event') return normalized as ListingType;
    return null;
};

const getPostImage = (post: PostRecord) => {
    const candidate = post.image_url || post.cover_image_url || post.thumbnail_url;
    return typeof candidate === 'string' ? candidate : undefined;
};

const getPostTitle = (post: PostRecord) => {
    const candidate = post.title || post.name;
    return typeof candidate === 'string' && candidate.trim().length > 0 ? candidate : 'Untitled listing';
};

const formatPrice = (value: number | null | undefined) => (
    typeof value === 'number' && !Number.isNaN(value) ? `Rs ${value.toLocaleString()}` : 'Custom pricing'
);

const getPostMeta = (post: PostRecord) => {
    const location = typeof post.location === 'string' && post.location.trim().length > 0 ? post.location : null;
    const price = formatPrice(typeof post.price === 'number' ? post.price : null);
    if (location) return `${location} • ${price}`;
    return price;
};

const PostGrid: React.FC<{
    title: string;
    eyebrow: string;
    subtitle: string;
    posts: PostRecord[];
    icon: React.ReactNode;
    emptyTitle: string;
    emptyCopy: string;
}> = ({ title, eyebrow, subtitle, posts, icon, emptyTitle, emptyCopy }) => (
    <section className="dh-section">
        <div className="dh-section-head">
            <div>
                <span className="dh-section-eyebrow">{eyebrow}</span>
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
        </div>

        {posts.length > 0 ? (
            <div className="dh-rail">
                {posts.map((post) => (
                    <article key={post.id} className="dh-rail-card">
                        <div
                            className="dh-rail-media"
                            style={getPostImage(post) ? { backgroundImage: `linear-gradient(180deg, rgba(7, 7, 10, 0.02), rgba(7, 7, 10, 0.68)), url(${getPostImage(post)})` } : undefined}
                        >
                            {!getPostImage(post) && <div className="dh-rail-icon">{icon}</div>}
                            <span className="dh-rail-tag">{normalizeType(post.type) || 'listing'}</span>
                        </div>
                        <div className="dh-rail-body">
                            <h3>{getPostTitle(post)}</h3>
                            <p>{getPostMeta(post)}</p>
                        </div>
                    </article>
                ))}
            </div>
        ) : (
            <div className="dh-empty-card">
                <div className="dh-empty-icon">{icon}</div>
                <h3>{emptyTitle}</h3>
                <p>{emptyCopy}</p>
            </div>
        )}
    </section>
);

const BookingList: React.FC<{ title: string; subtitle: string; bookings: UnifiedBooking[] }> = ({ title, subtitle, bookings }) => (
    <section className="dh-section">
        <div className="dh-section-head">
            <div>
                <span className="dh-section-eyebrow">Bookings</span>
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
            <Link to="/profile" className="dh-inline-link">
                Open profile <ArrowRight size={16} />
            </Link>
        </div>

        {bookings.length > 0 ? (
            <div className="dh-booking-list">
                {bookings.slice(0, 5).map((booking) => (
                    <article key={booking.id} className="dh-booking-card">
                        <div className="dh-booking-main">
                            <div className="dh-booking-thumb">
                                <img src={booking.listing_image} alt={booking.listing_title} />
                            </div>
                            <div>
                                <h3>{booking.listing_title}</h3>
                                <p>
                                    <CalendarDays size={15} />
                                    {new Date(booking.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="dh-booking-side">
                            <strong>Rs {booking.total_price.toLocaleString()}</strong>
                            <span>{booking.number_of_people} travelers • {booking.status}</span>
                        </div>
                    </article>
                ))}
            </div>
        ) : (
            <div className="dh-empty-card">
                <div className="dh-empty-icon"><Sparkles size={22} /></div>
                <h3>No bookings yet</h3>
                <p>Once bookings flow through this account, they will appear here.</p>
            </div>
        )}
    </section>
);

export const DashboardHome: React.FC = () => {
    const { user, profile, profileLoading, roleLabel, verificationLabel, isProvider, refreshProfile } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [tourPosts, setTourPosts] = useState<PostRecord[]>([]);
    const [activityPosts, setActivityPosts] = useState<PostRecord[]>([]);
    const [eventPosts, setEventPosts] = useState<PostRecord[]>([]);
    const [myPosts, setMyPosts] = useState<PostRecord[]>([]);
    const [travelerBookings, setTravelerBookings] = useState<UnifiedBooking[]>([]);
    const [providerBookings, setProviderBookings] = useState<UnifiedBooking[]>([]);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [conversationCount, setConversationCount] = useState(0);
    const [latestVerification, setLatestVerification] = useState<VerificationRecord | null>(null);
    const [resubmitting, setResubmitting] = useState(false);

    const activeTab = useMemo<DashboardTab>(() => {
        const requested = searchParams.get('tab');
        if (requested === 'tours' || requested === 'activities' || requested === 'events') return requested;
        return 'overview';
    }, [searchParams]);

    useEffect(() => {
        if (!user) return;

        const loadDashboard = async () => {
            setLoading(true);
            try {
                const providerMode = isProviderRole(profile?.role);
                const [tourRows, activityRows, eventRows, personalPosts, travelerBookingsData, providerBookingsData, favoritesData, conversationsData] = await Promise.all([
                    getPublicListingsByType('tour'),
                    getPublicListingsByType('activity'),
                    getPublicListingsByType('event'),
                    providerMode ? getMyPosts(user.id) : Promise.resolve([]),
                    getBookings(user.id),
                    providerMode ? getProviderBookings(user.id) : Promise.resolve([]),
                    getFavorites(user.id),
                    getConversations(user.id),
                ]);

                setTourPosts(tourRows);
                setActivityPosts(activityRows);
                setEventPosts(eventRows);
                setMyPosts(personalPosts);
                setTravelerBookings(travelerBookingsData);
                setProviderBookings(providerBookingsData);
                setFavoritesCount(favoritesData.length);
                setConversationCount(conversationsData.length);
                if (providerMode) {
                    const verificationRow = await getLatestVerification(user.id);
                    setLatestVerification(verificationRow);
                } else {
                    setLatestVerification(null);
                }
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        void loadDashboard();
    }, [isProvider, profile?.role, user]);

    const greeting = useMemo(() => {
        const name = profile?.full_name || user?.email?.split('@')[0] || 'Explorer';
        return name.trim();
    }, [profile, user]);
    const myListingsByType = useMemo(() => ({
        tour: myPosts.filter((post) => normalizeType(post.type) === 'tour'),
        activity: myPosts.filter((post) => normalizeType(post.type) === 'activity'),
        event: myPosts.filter((post) => normalizeType(post.type) === 'event'),
    }), [myPosts]);

    const stats = useMemo(() => {
        if (isProvider) {
            return [
                { label: 'My Listings', value: myPosts.length.toString().padStart(2, '0') },
                { label: 'Inbound Bookings', value: providerBookings.length.toString().padStart(2, '0') },
                { label: 'Chats', value: conversationCount.toString().padStart(2, '0') },
                { label: 'Traveler Favorites', value: favoritesCount.toString().padStart(2, '0') },
            ];
        }

        return [
            { label: 'Tours', value: tourPosts.length.toString().padStart(2, '0') },
            { label: 'Activities', value: activityPosts.length.toString().padStart(2, '0') },
            { label: 'Events', value: eventPosts.length.toString().padStart(2, '0') },
            { label: 'Favorites', value: favoritesCount.toString().padStart(2, '0') },
        ];
    }, [activityPosts.length, conversationCount, eventPosts.length, favoritesCount, isProvider, myPosts.length, providerBookings.length, tourPosts.length]);

    if (!user) return null;

    const isVerificationPending = isProvider && profile?.verification_status !== 'approved';
    const isVerificationRejected = isProvider && profile?.verification_status === 'rejected';
    const overviewCopy = isProvider
        ? 'Publish live listings, monitor inbound bookings, and keep your provider account approval visible.'
        : 'Browse typed listings, manage favorites, track bookings, and continue traveler conversations.';
    const currentPosts = activeTab === 'tours' ? tourPosts : activeTab === 'activities' ? activityPosts : eventPosts;

    const handleResubmit = async () => {
        if (!user || !isVerificationRejected) return;

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
        <main className="dh-page animate-fade">
            <div className="container dh-shell">
                <section className="dh-hero">
                    <div className="dh-hero-copy">
                        <span className="dh-kicker">{isProvider ? 'Provider Control Room' : 'Traveler Control Room'}</span>
                        <h1>
                            Welcome back, <span>{greeting}</span>.
                        </h1>
                        <p>{overviewCopy}</p>
                    </div>

                    <div className="dh-tab-strip" role="tablist" aria-label="Content type tabs">
                        {TAB_CONFIG.map((tab) => {
                            const isActive = activeTab === tab.key;
                            const disabled = !!tab.type && isProvider && !canRolePublish(profile?.role, tab.type);
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`dh-tab-pill${isActive ? ' is-active' : ''}`}
                                    aria-pressed={isActive}
                                    disabled={disabled}
                                    onClick={() => setSearchParams(tab.key === 'overview' ? {} : { tab: tab.key })}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <aside className="dh-profile-card">
                        <div className="dh-profile-top">
                            <div className="dh-avatar-wrap">
                                {profile?.profile_image_url ? (
                                    <img src={profile.profile_image_url} alt={greeting} className="dh-avatar" />
                                ) : (
                                    <div className="dh-avatar dh-avatar-fallback">
                                        <UserRound size={24} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className="dh-mini-label">Account Snapshot</span>
                                <h2>{greeting}</h2>
                                <p>{user.email}</p>
                            </div>
                        </div>

                        <div className="dh-profile-meta">
                            <div>
                                <span>Role</span>
                                <strong>{roleLabel}</strong>
                            </div>
                            <div>
                                <span>Status</span>
                                <strong>{verificationLabel}</strong>
                            </div>
                        </div>

                        <p className="dh-profile-bio">
                            {profile?.bio || `${getRoleLabel(profile?.role)} account ready on the same Supabase system.`}
                        </p>
                    </aside>
                </section>

                {isVerificationPending && (
                    <section className="dh-empty-card" style={{ marginTop: '18px', borderColor: 'rgba(214, 158, 46, 0.28)', background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.03))' }}>
                        <div className="dh-empty-icon"><ShieldAlert size={22} /></div>
                        <h3>{isVerificationRejected ? 'Verification rejected' : 'Verification pending'}</h3>
                        <p>
                            {isVerificationRejected
                                ? 'This provider request was rejected. Resubmit the current application to place it back into admin review.'
                                : 'Your provider onboarding is recorded. You can sign in and manage your account now, but live publishing stays locked until an admin approves the provider account.'}
                        </p>
                        {isVerificationRejected && latestVerification?.rejection_reason && (
                            <p style={{ marginTop: '10px' }}>
                                Reason: {latestVerification.rejection_reason}
                            </p>
                        )}
                        {isVerificationRejected && (
                            <div style={{ marginTop: '14px' }}>
                                <button
                                    type="button"
                                    onClick={handleResubmit}
                                    disabled={resubmitting}
                                    className="btn btn-primary"
                                    style={{ borderRadius: '999px', padding: '10px 18px' }}
                                >
                                    {resubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Resubmit Verification'}
                                </button>
                            </div>
                        )}
                    </section>
                )}

                <section className="dh-stats-grid">
                    {stats.map((stat, index) => (
                        <article key={stat.label} className="dh-stat-card" style={{ animationDelay: `${index * 70}ms` }}>
                            <span>{stat.label}</span>
                            <strong>{stat.value}</strong>
                        </article>
                    ))}
                </section>

                {(loading || profileLoading) ? (
                    <section className="dh-loading">
                        <Loader2 size={40} className="animate-spin" />
                        <p>Loading role-aware dashboard...</p>
                    </section>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <>
                                {isProvider ? (
                                    <>
                                        <section className="dh-section">
                                            <div className="dh-section-head">
                                                <div>
                                                    <span className="dh-section-eyebrow">Publishing Rights</span>
                                                    <h2>What this role can publish</h2>
                                                    <p>Once your provider account is approved, these listing types publish instantly.</p>
                                                </div>
                                            </div>
                                            <div className="dh-stats-grid">
                                                {(['tour', 'activity', 'event'] as ListingType[]).map((type) => {
                                                    const allowed = canRolePublish(profile?.role, type);
                                                    return (
                                                        <article key={type} className="dh-stat-card">
                                                            <span>{LISTING_LABELS[type]}</span>
                                                            <strong>{allowed ? 'Allowed' : 'Blocked'}</strong>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        </section>

                                        <section className="dh-section">
                                            <div className="dh-section-head">
                                                <div>
                                                    <span className="dh-section-eyebrow">Publishing</span>
                                                    <h2>Publish new listings</h2>
                                                    <p>Use the provider studio to create live tours, activities, or events based on your role.</p>
                                                </div>
                                                <Link to="/provider/studio" className="dh-inline-link">
                                                    Open studio <ArrowRight size={16} />
                                                </Link>
                                            </div>
                                        </section>

                                        <PostGrid
                                            title="Your listings"
                                            eyebrow="Provider Inventory"
                                            subtitle="Listings currently owned by this user account in the shared posts table."
                                            icon={<ShieldCheck size={22} />}
                                            posts={myPosts.slice(0, 6)}
                                            emptyTitle="No provider listings yet"
                                            emptyCopy="Publish your first live listing from the provider studio and it will appear here immediately."
                                        />
                                        <BookingList
                                            title="Bookings received"
                                            subtitle="Inbound bookings from travelers on your listings."
                                            bookings={providerBookings}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <PostGrid
                                            title="Tour collections"
                                            eyebrow="Tours"
                                            subtitle="Browse all tour listings from the shared posts table."
                                            icon={<Compass size={22} />}
                                            posts={tourPosts.slice(0, 4)}
                                            emptyTitle="No tour listings yet"
                                            emptyCopy="Add rows in posts with type = tour and they will appear here."
                                        />
                                        <PostGrid
                                            title="Activity collections"
                                            eyebrow="Activities"
                                            subtitle="Browse all activities from the shared posts table."
                                            icon={<Waves size={22} />}
                                            posts={activityPosts.slice(0, 4)}
                                            emptyTitle="No activity listings yet"
                                            emptyCopy="Add rows in posts with type = activity and they will appear here."
                                        />
                                        <PostGrid
                                            title="Event collections"
                                            eyebrow="Events"
                                            subtitle="Browse all events from the shared posts table."
                                            icon={<Ticket size={22} />}
                                            posts={eventPosts.slice(0, 4)}
                                            emptyTitle="No event listings yet"
                                            emptyCopy="Add rows in posts with type = event and they will appear here."
                                        />
                                        <BookingList
                                            title="Your trips"
                                            subtitle="Completed and active traveler bookings live in the unified booking model."
                                            bookings={travelerBookings}
                                        />
                                    </>
                                )}

                                <section className="dh-section">
                                    <div className="dh-section-head">
                                        <div>
                                            <span className="dh-section-eyebrow">Messaging</span>
                                            <h2>Chat visibility</h2>
                                            <p>Recommended rule: travelers chat with providers, and providers reply inside booking or inquiry conversations.</p>
                                        </div>
                                    </div>
                                    <div className="dh-empty-card">
                                        <div className="dh-empty-icon"><MessageCircle size={22} /></div>
                                        <h3>{conversationCount} active conversations</h3>
                                        <p>Traveler-to-provider chat is enabled conceptually here and backed by the existing `conversations` and `messages` tables.</p>
                                    </div>
                                </section>
                            </>
                        )}

                        {activeTab !== 'overview' && (
                            isProvider ? (
                                canRolePublish(profile?.role, activeTab === 'tours' ? 'tour' : activeTab === 'activities' ? 'activity' : 'event') ? (
                                    <PostGrid
                                        title={`My ${TAB_CONFIG.find((tab) => tab.key === activeTab)?.label}`}
                                        eyebrow="Provider Inventory"
                                        subtitle="Filtered from your listings based on allowed role permissions."
                                        icon={activeTab === 'tours' ? <Compass size={22} /> : activeTab === 'activities' ? <Waves size={22} /> : <Ticket size={22} />}
                                        posts={myListingsByType[activeTab === 'tours' ? 'tour' : activeTab === 'activities' ? 'activity' : 'event']}
                                        emptyTitle="No listings in this category"
                                        emptyCopy="As soon as you publish a live listing in this category, it will appear here."
                                    />
                                ) : (
                                    <div className="dh-empty-card">
                                        <div className="dh-empty-icon"><ShieldAlert size={22} /></div>
                                        <h3>Category not allowed for this role</h3>
                                        <p>Your current provider role cannot publish {TAB_CONFIG.find((tab) => tab.key === activeTab)?.label.toLowerCase()}.</p>
                                    </div>
                                )
                            ) : (
                                <PostGrid
                                    title={TAB_CONFIG.find((tab) => tab.key === activeTab)?.label || 'Listings'}
                                    eyebrow="Typed Content"
                                    subtitle="Filtered directly from posts.type."
                                    icon={activeTab === 'tours' ? <Compass size={22} /> : activeTab === 'activities' ? <Waves size={22} /> : <Ticket size={22} />}
                                    posts={currentPosts}
                                    emptyTitle="No listings yet"
                                    emptyCopy="There are currently no listings in this category."
                                />
                            )
                        )}
                    </>
                )}
            </div>
        </main>
    );
};
