import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    getPublicListingsByType,
    type PostRecord,
} from '../lib/destinations';
import './dashboard-home.css';

type SectionTab = 'tours' | 'activities' | 'events';

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const getPostImage = (post: PostRecord): string | undefined => {
    const candidate = post.image_url || post.cover_image_url || post.thumbnail_url;
    return typeof candidate === 'string' ? candidate : undefined;
};

const getPostTitle = (post: PostRecord): string => {
    const candidate = post.title || post.name;
    return typeof candidate === 'string' && candidate.trim().length > 0 ? candidate : 'Untitled listing';
};

const getPostSubtitle = (post: PostRecord): string => {
    if (typeof post.description === 'string' && post.description.trim().length > 0) {
        return post.description.trim().slice(0, 60);
    }
    if (typeof post.location === 'string' && post.location.trim().length > 0) {
        return post.location.trim();
    }
    return '';
};

const getPostType = (post: PostRecord): SectionTab => {
    if (post.type === 'tour') return 'tours';
    if (post.type === 'event') return 'events';
    return 'activities';
};

const toListingTypePath = (tab: SectionTab): 'tour' | 'activity' | 'event' => {
    if (tab === 'tours') return 'tour';
    if (tab === 'events') return 'event';
    return 'activity';
};

const ListingCard: React.FC<{ post: PostRecord }> = ({ post }) => {
    const image = getPostImage(post);
    const title = getPostTitle(post);
    const subtitle = getPostSubtitle(post);
    const type = getPostType(post);
    const listingTypePath = toListingTypePath(type);

    return (
        <article className="listing-card">
            <div
                className="listing-card-media"
                style={image ? { backgroundImage: `url(${image})` } : undefined}
            />
            <div className="listing-card-body">
                <h3 className="listing-card-title">{title}</h3>
                {subtitle && <p className="listing-card-sub">{subtitle}</p>}
                <div className="listing-card-actions">
                    <Link to={`/listings/${listingTypePath}/${post.id}`} className="listing-btn-book">Book Now</Link>
                    <Link to={`/listings/${listingTypePath}/${post.id}`} className="listing-btn-details">Details</Link>
                </div>
            </div>
        </article>
    );
};

const Section: React.FC<{
    title: string;
    posts: PostRecord[];
    moreHref: string;
}> = ({ title, posts, moreHref }) => (
    <section className="dh-listing-section">
        <h2 className="dh-listing-section-title">{title}</h2>
        {posts.length > 0 ? (
            <>
                <div className="dh-listing-row">
                    {posts.slice(0, 4).map((post) => (
                        <ListingCard key={post.id} post={post} />
                    ))}
                </div>
                <div className="dh-more-row">
                    <Link to={moreHref} className="dh-more-btn">More &rsaquo;</Link>
                </div>
            </>
        ) : (
            <p className="dh-empty-text">No {title.toLowerCase()} available yet.</p>
        )}
    </section>
);

export const DashboardHome: React.FC = () => {
    const { user, profile } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [tourPosts, setTourPosts] = useState<PostRecord[]>([]);
    const [activityPosts, setActivityPosts] = useState<PostRecord[]>([]);
    const [eventPosts, setEventPosts] = useState<PostRecord[]>([]);

    const activeTab = useMemo<SectionTab | null>(() => {
        const t = searchParams.get('tab');
        if (t === 'tours' || t === 'activities' || t === 'events') return t;
        return null;
    }, [searchParams]);

    const greeting = useMemo(() => getGreeting(), []);
    const name = profile?.full_name || user?.email?.split('@')[0] || 'Explorer';

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            try {
                const [tours, activities, events] = await Promise.all([
                    getPublicListingsByType('tour'),
                    getPublicListingsByType('activity'),
                    getPublicListingsByType('event'),
                ]);
                setTourPosts(tours);
                setActivityPosts(activities);
                setEventPosts(events);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [user]);

    if (!user) return null;

    const showAll = activeTab === null;
    const showTours = showAll || activeTab === 'tours';
    const showActivities = showAll || activeTab === 'activities';
    const showEvents = showAll || activeTab === 'events';

    const handleTab = (tab: SectionTab) => {
        if (activeTab === tab) {
            setSearchParams({});
        } else {
            setSearchParams({ tab });
        }
    };

    return (
        <main className="dh-page animate-fade">
            <div className="container dh-shell">
                {/* Greeting */}
                <section className="dh-greeting">
                    <h1 className="dh-greeting-title">{greeting}</h1>
                    <p className="dh-greeting-name">{name},</p>
                    <p className="dh-greeting-sub">Have any tour plans yet?</p>
                </section>

                {/* Tab strip */}
                <div className="dh-tab-strip" role="tablist" aria-label="Content filter">
                    {(['tours', 'activities', 'events'] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab}
                            className={`dh-tab-pill${activeTab === tab ? ' is-active' : ''}`}
                            onClick={() => handleTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="dh-loading">
                        <Loader2 size={36} className="animate-spin" />
                    </div>
                ) : (
                    <div className="dh-sections">
                        {showTours && (
                            <Section
                                title="Tours"
                                posts={tourPosts}
                                moreHref="/dashboard?tab=tours"
                            />
                        )}
                        {showActivities && (
                            <Section
                                title="Activities"
                                posts={activityPosts}
                                moreHref="/dashboard?tab=activities"
                            />
                        )}
                        {showEvents && (
                            <Section
                                title="Events"
                                posts={eventPosts}
                                moreHref="/dashboard?tab=events"
                            />
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};
