import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    ArrowRight,
    CalendarDays,
    Compass,
    Loader2,
    Sparkles,
    Ticket,
    UserRound,
    Waves,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    getBookings,
    getPosts,
    getProfile,
} from '../lib/destinations';
import type {
    BookingWithDetails,
    PostRecord,
    Profile,
} from '../lib/destinations';
import './dashboard-home.css';

type DashboardTab = 'home' | 'tours' | 'activities' | 'events';

const TAB_CONFIG: Array<{
    key: DashboardTab;
    label: string;
    type?: 'tour' | 'activity' | 'event';
}> = [
    { key: 'home', label: 'Home' },
    { key: 'tours', label: 'Tours', type: 'tour' },
    { key: 'activities', label: 'Activities', type: 'activity' },
    { key: 'events', label: 'Events', type: 'event' },
];

const normalizeType = (value: string | null | undefined) => (value || '').trim().toLowerCase();

const formatPrice = (value: number | null | undefined) => (
    typeof value === 'number' && !Number.isNaN(value) ? `Rs ${value.toLocaleString()}` : null
);

const getPostImage = (post: PostRecord) => {
    const candidate = post.image_url || post.cover_image_url || post.thumbnail_url;
    return typeof candidate === 'string' ? candidate : undefined;
};

const getPostTitle = (post: PostRecord) => {
    const candidate = post.title || post.name;
    return typeof candidate === 'string' && candidate.trim().length > 0 ? candidate : 'Untitled listing';
};

const getPostMeta = (post: PostRecord) => {
    const location = typeof post.location === 'string' && post.location.trim().length > 0 ? post.location : null;
    const price = formatPrice(typeof post.price === 'number' ? post.price : null);
    const subCategory = typeof post.sub_category === 'string' && post.sub_category.trim().length > 0 ? post.sub_category : null;
    const description = typeof post.description === 'string' && post.description.trim().length > 0 ? post.description : null;

    if (location && price) return `${location} - ${price}`;
    if (location) return location;
    if (price) return price;
    if (subCategory) return subCategory;
    if (description) return description;
    return 'Available now';
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
                            <span className="dh-rail-tag">{typeof post.sub_category === 'string' && post.sub_category ? post.sub_category : normalizeType(post.type) || 'general'}</span>
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

export const DashboardHome: React.FC = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [posts, setPosts] = useState<PostRecord[]>([]);

    const activeTab = useMemo<DashboardTab>(() => {
        const requested = searchParams.get('tab');
        if (requested === 'tours' || requested === 'activities' || requested === 'events') return requested;
        return 'home';
    }, [searchParams]);

    useEffect(() => {
        if (!user) return;

        const loadDashboard = async () => {
            setLoading(true);
            try {
                const [profileData, bookingsData, postData] = await Promise.all([
                    getProfile(user.id),
                    getBookings(user.id),
                    getPosts(),
                ]);

                setProfile(profileData);
                setBookings(bookingsData);
                setPosts(postData);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [user]);

    const greeting = useMemo(() => {
        const name = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Explorer';
        return name.trim();
    }, [profile, user]);

    const tourPosts = useMemo(() => posts.filter((post) => normalizeType(post.type) === 'tour'), [posts]);
    const activityPosts = useMemo(() => posts.filter((post) => normalizeType(post.type) === 'activity'), [posts]);
    const eventPosts = useMemo(() => posts.filter((post) => normalizeType(post.type) === 'event'), [posts]);

    const stats = useMemo(
        () => [
            { label: 'Tours', value: tourPosts.length.toString().padStart(2, '0') },
            { label: 'Activities', value: activityPosts.length.toString().padStart(2, '0') },
            { label: 'Events', value: eventPosts.length.toString().padStart(2, '0') },
            { label: 'Bookings', value: bookings.length.toString().padStart(2, '0') },
        ],
        [activityPosts.length, bookings.length, eventPosts.length, tourPosts.length],
    );

    if (!user) return null;

    return (
        <main className="dh-page animate-fade">
            <div className="container dh-shell">
                <section className="dh-hero">
                    <div className="dh-hero-copy">
                        <span className="dh-kicker">Unified Explorer Hub</span>
                        <h1>
                            Explore every listing by <span>type</span>.
                        </h1>
                        <p>
                            Tours, activities, and events now live in one smoother dashboard experience. Switch
                            in place and browse curated content filtered directly from your post types.
                        </p>
                    </div>

                    <div className="dh-tab-strip" role="tablist" aria-label="Content type tabs">
                        {TAB_CONFIG.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`dh-tab-pill${isActive ? ' is-active' : ''}`}
                                    aria-pressed={isActive}
                                    onClick={() => setSearchParams(tab.key === 'home' ? {} : { tab: tab.key })}
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
                                <span className="dh-mini-label">Profile Snapshot</span>
                                <h2>{greeting}</h2>
                                <p>{user.email}</p>
                            </div>
                        </div>

                        <div className="dh-profile-meta">
                            <div>
                                <span>Role</span>
                                <strong>{profile?.role || 'Traveler'}</strong>
                            </div>
                            <div>
                                <span>Status</span>
                                <strong>{profile?.is_verified ? 'Verified' : 'Active'}</strong>
                            </div>
                        </div>

                        <p className="dh-profile-bio">
                            {profile?.bio || 'Your dashboard is now driven by typed content from the posts table with smoother in-place tab switching.'}
                        </p>
                    </aside>
                </section>

                <section className="dh-stats-grid">
                    {stats.map((stat, index) => (
                        <article key={stat.label} className="dh-stat-card" style={{ animationDelay: `${index * 70}ms` }}>
                            <span>{stat.label}</span>
                            <strong>{stat.value}</strong>
                        </article>
                    ))}
                </section>

                {loading ? (
                    <section className="dh-loading">
                        <Loader2 size={40} className="animate-spin" />
                        <p>Loading your typed content...</p>
                    </section>
                ) : (
                    <>
                        {activeTab === 'home' && (
                            <>
                                <PostGrid
                                    title="Tour type listings"
                                    eyebrow="Tours"
                                    subtitle="Rows from posts where type is set to tour."
                                    icon={<Compass size={22} />}
                                    posts={tourPosts.slice(0, 4)}
                                    emptyTitle="No tour posts yet"
                                    emptyCopy="Add rows in posts with type = tour and they will appear here."
                                />

                                <PostGrid
                                    title="Activity type listings"
                                    eyebrow="Activities"
                                    subtitle="Rows from posts where type is set to activity."
                                    icon={<Waves size={22} />}
                                    posts={activityPosts.slice(0, 4)}
                                    emptyTitle="No activity posts yet"
                                    emptyCopy="Add rows in posts with type = activity and they will appear here."
                                />

                                <PostGrid
                                    title="Event type listings"
                                    eyebrow="Events"
                                    subtitle="Rows from posts where type is set to event."
                                    icon={<Ticket size={22} />}
                                    posts={eventPosts.slice(0, 4)}
                                    emptyTitle="No event posts yet"
                                    emptyCopy="Add rows in posts with type = event and they will appear here."
                                />
                            </>
                        )}

                        {activeTab === 'tours' && (
                            <PostGrid
                                title="Tours"
                                eyebrow="Typed Content"
                                subtitle="Filtered directly from posts.type = tour."
                                icon={<Compass size={22} />}
                                posts={tourPosts}
                                emptyTitle="No tour posts yet"
                                emptyCopy="There are currently no posts with type set to tour."
                            />
                        )}

                        {activeTab === 'activities' && (
                            <PostGrid
                                title="Activities"
                                eyebrow="Typed Content"
                                subtitle="Filtered directly from posts.type = activity."
                                icon={<Waves size={22} />}
                                posts={activityPosts}
                                emptyTitle="No activity posts yet"
                                emptyCopy="There are currently no posts with type set to activity."
                            />
                        )}

                        {activeTab === 'events' && (
                            <PostGrid
                                title="Events"
                                eyebrow="Typed Content"
                                subtitle="Filtered directly from posts.type = event."
                                icon={<Ticket size={22} />}
                                posts={eventPosts}
                                emptyTitle="No event posts yet"
                                emptyCopy="There are currently no posts with type set to event."
                            />
                        )}

                        <section className="dh-section">
                            <div className="dh-section-head">
                                <div>
                                    <span className="dh-section-eyebrow">Recent Bookings</span>
                                    <h2>Your latest confirmed journeys</h2>
                                    <p>Booking data still comes from your existing booking tables and stays unchanged.</p>
                                </div>
                                <Link to="/profile" className="dh-inline-link">
                                    Manage profile <ArrowRight size={16} />
                                </Link>
                            </div>

                            {bookings.length > 0 ? (
                                <div className="dh-booking-list">
                                    {bookings.slice(0, 5).map((booking) => (
                                        <article key={booking.id} className="dh-booking-card">
                                            <div className="dh-booking-main">
                                                <div className="dh-booking-thumb">
                                                    <img src={booking.activity_image} alt={booking.activity_title} />
                                                </div>
                                                <div>
                                                    <h3>{booking.activity_title}</h3>
                                                    <p>
                                                        <CalendarDays size={15} />
                                                        {new Date(booking.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="dh-booking-side">
                                                <strong>Rs {booking.total_price.toLocaleString()}</strong>
                                                <span>{booking.number_of_people} travelers</span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="dh-empty-card">
                                    <div className="dh-empty-icon"><Sparkles size={22} /></div>
                                    <h3>No bookings yet</h3>
                                    <p>Once a traveler books an activity, the latest records will appear here.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
};
