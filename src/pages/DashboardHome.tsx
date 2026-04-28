import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
    CalendarDays,
    Compass,
    Heart,
    Loader2,
    MapPin,
    Search,
    Sparkles,
    Ticket,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
    addListingFavorite,
    getPublicListingsByType,
    isListingFavorited,
    removeListingFavorite,
    type PostRecord,
} from '../lib/destinations';
import type { ListingType } from '../lib/platform';
import { isProviderRole } from '../lib/platform';
import './dashboard-home.css';
import '../components/listing-card.css';

type RevealProps = { children: React.ReactNode; className?: string; delay?: number };

const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.unobserve(node);
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
        );

        obs.observe(node);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`dh-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
            style={{ '--delay': `${delay}ms` } as React.CSSProperties}
        >
            {children}
        </div>
    );
};

type SectionTab = 'tours' | 'activities' | 'events';
type GreetingPhase = 'morning' | 'afternoon' | 'night';
type GreetingAudience = 'tourist' | 'provider';

type TabConfig = {
    id: SectionTab;
    label: string;
    icon: LucideIcon;
    helper: string;
};

const TAB_CONFIG: TabConfig[] = [
    { id: 'tours', label: 'Tours', icon: Compass, helper: 'Multi-day plans' },
    { id: 'activities', label: 'Activities', icon: Sparkles, helper: 'One-day moments' },
    { id: 'events', label: 'Events', icon: Ticket, helper: 'Live experiences' },
];

const GREETING_COPY: Record<GreetingAudience, Record<GreetingPhase, string[]>> = {
    tourist: {
        morning: [
            'Let us build a travel plan for today.',
            'Ready to map your next getaway?',
            'Morning is perfect for planning your next trip.',
            'Pick a destination and start your adventure.',
        ],
        afternoon: [
            'Let us shape your next travel plan.',
            'Got time for a quick trip plan today?',
            'Your next tour is a few taps away.',
            'Plan now, travel smoother later.',
        ],
        night: [
            'Wind down by planning your next escape.',
            'Tonight is great for your next travel plan.',
            'Browse now and lock in your next journey.',
            'Dream destination? Let us plan it tonight.',
        ],
    },
    provider: {
        morning: [
            'Ready to post a new tour package?',
            'Start the day by publishing a fresh listing.',
            'Morning momentum: add your next package.',
            'Update your catalog and reach new travelers.',
        ],
        afternoon: [
            'Up for posting a new tour package?',
            'Afternoon push: publish a new listing now.',
            'Add a new package while demand is active.',
            'Refresh your offerings with a new post.',
        ],
        night: [
            'Close the day by posting a new package.',
            'Night shift: prep tomorrow with a new listing.',
            'Publish tonight, capture bookings tomorrow.',
            'One more listing can boost tomorrow leads.',
        ],
    },
};

const getGreetingPhase = (): GreetingPhase => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'night';
};

const getGreetingHeading = (phase: GreetingPhase): string => {
    if (phase === 'morning') return 'Good Morning';
    if (phase === 'afternoon') return 'Good Afternoon';
    return 'Good Evening';
};

const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

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
        return post.description.trim().slice(0, 90);
    }
    if (typeof post.location === 'string' && post.location.trim().length > 0) {
        return post.location.trim();
    }
    return 'Curated experience with guided details.';
};

const getPostType = (post: PostRecord): SectionTab => {
    if (post.type === 'tour') return 'tours';
    if (post.type === 'guide' || post.type === 'event') return 'events';
    return 'activities';
};

const toListingTypePath = (tab: SectionTab): 'tour' | 'activity' | 'event' => {
    if (tab === 'tours') return 'tour';
    if (tab === 'events') return 'event';
    return 'activity';
};

const toListingTypeValue = (tab: SectionTab): ListingType => {
    if (tab === 'tours') return 'tour';
    if (tab === 'events') return 'guide';
    return 'activity';
};

const formatPrice = (price: number | null | undefined): string => {
    if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
        return 'Price on request';
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};

const formatStartDate = (startsAt: string | undefined): string | null => {
    if (!startsAt) return null;
    const parsed = new Date(startsAt);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getSectionHelper = (section: SectionTab): string => {
    if (section === 'tours') return 'Signature routes with curated itineraries.';
    if (section === 'activities') return 'Short experiences for flexible schedules.';
    return 'Upcoming hosted moments you can lock quickly.';
};

const getToneClass = (section: SectionTab): string => `dh-tone-${section}`;

const ListingCard: React.FC<{ post: PostRecord }> = ({ post }) => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const canFavorite = profile?.role === 'tourist';
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const image = getPostImage(post);
    const title = getPostTitle(post);
    const subtitle = getPostSubtitle(post);
    const type = getPostType(post);
    const listingTypePath = toListingTypePath(type);
    const listingTypeValue = toListingTypeValue(type);
    const location = typeof post.location === 'string' && post.location.trim().length > 0
        ? post.location.trim()
        : 'Location shared after booking';
    const startsAt = formatStartDate(typeof post.starts_at === 'string' ? post.starts_at : undefined);
    const priceLabel = formatPrice(post.price);
    const chipLabel = post.sub_category && post.sub_category.trim().length > 0
        ? post.sub_category.trim()
        : type.slice(0, -1).toUpperCase();

    useEffect(() => {
        if (!user || !post.id || !canFavorite) {
            setIsFavorite(false);
            return;
        }

        const loadFavorite = async () => {
            const favorited = await isListingFavorited(user.id, post.id, listingTypeValue);
            setIsFavorite(favorited);
        };

        void loadFavorite();
    }, [canFavorite, listingTypeValue, post.id, user]);

    const handleFavoriteToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (!user) {
            navigate('/auth');
            return;
        }

        if (!canFavorite) {
            alert('Only tourist accounts can save favorites.');
            return;
        }

        setFavoriteLoading(true);
        try {
            if (isFavorite) {
                await removeListingFavorite(user.id, post.id, listingTypeValue);
                setIsFavorite(false);
            } else {
                await addListingFavorite(user.id, post.id, listingTypeValue);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Favorite update failed:', error);
            alert('Could not update favorites. Please try again.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const openListing = () => navigate(`/listings/${listingTypePath}/${post.id}`);

    const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openListing();
        }
    };

    return (
        <article
            className="listing-card"
            role="link"
            tabIndex={0}
            onClick={openListing}
            onKeyDown={handleCardKeyDown}
            aria-label={`Open ${title}`}
        >
            <div
                className={`listing-card-media${image ? '' : ' is-fallback'}`}
                style={image ? { backgroundImage: `url(${image})` } : undefined}
            >
                <div className="listing-card-media-overlay" />
                <div className="listing-card-media-top">
                    <span className="listing-card-chip">{chipLabel}</span>
                    <button
                        type="button"
                        className={`listing-card-fav-btn${isFavorite ? ' is-active' : ''}`}
                        onClick={handleFavoriteToggle}
                        disabled={favoriteLoading || !canFavorite}
                        title={canFavorite ? undefined : 'Only tourist accounts can save favorites'}
                    >
                        {favoriteLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                        )}
                    </button>
                </div>

                {!image && (
                    <div className="listing-card-fallback-text" aria-hidden="true">
                        {title.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="listing-card-title-static-wrap">
                    <h3 className="listing-card-title-static">{title}</h3>
                </div>

                <div className="listing-card-reveal-panel">
                    <h3 className="listing-card-title">{title}</h3>
                    <p className="listing-card-sub">{subtitle}</p>

                    <div className="listing-card-meta">
                        <span className="listing-card-meta-item">
                            <MapPin size={14} />
                            <span>{location}</span>
                        </span>
                        {startsAt && (
                            <span className="listing-card-meta-item">
                                <CalendarDays size={14} />
                                <span>{startsAt}</span>
                            </span>
                        )}
                    </div>

                    <div className="listing-card-actions">
                        <span className="listing-card-price">{priceLabel}</span>
                        <Link
                            to={`/listings/${listingTypePath}/${post.id}`}
                            className="listing-btn-book"
                            onClick={(event) => event.stopPropagation()}
                        >
                            Book Now
                        </Link>
                    </div>
                </div>
            </div>
            <div className="listing-card-mobile-content">
                <h3 className="listing-card-title">{title}</h3>
                <p className="listing-card-sub">{subtitle}</p>

                <div className="listing-card-meta">
                    <span className="listing-card-meta-item">
                        <MapPin size={14} />
                        <span>{location}</span>
                    </span>
                    {startsAt && (
                        <span className="listing-card-meta-item">
                            <CalendarDays size={14} />
                            <span>{startsAt}</span>
                        </span>
                    )}
                </div>

                <div className="listing-card-actions">
                    <span className="listing-card-price">{priceLabel}</span>
                    <Link to={`/listings/${listingTypePath}/${post.id}`} className="listing-btn-book" onClick={(event) => event.stopPropagation()}>
                        Book Now
                    </Link>
                </div>
            </div>
        </article>
    );
};

const Section: React.FC<{
    section: SectionTab;
    title: string;
    posts: PostRecord[];
    moreHref: string;
    indexOffset: number;
    expanded: boolean;
}> = ({ section, title, posts, moreHref, indexOffset, expanded }) => {
    const postsToRender = expanded ? posts : posts.slice(0, 4);

    return (
    <section className={`dh-listing-section ${getToneClass(section)}`}>
        <Reveal delay={indexOffset * 100}>
            <div className="dh-section-header">
                <div className="dh-section-heading">
                    <h2 className="dh-listing-section-title">{title}</h2>
                    <p className="dh-listing-section-sub">{getSectionHelper(section)}</p>
                </div>
                {posts.length > 0 && (
                    <Link to={expanded ? '/dashboard' : moreHref} className="dh-more-link">
                        {expanded ? 'Less' : 'More'}
                    </Link>
                )}
            </div>
        </Reveal>

        {posts.length > 0 ? (
            <div className={`dh-listing-row${expanded ? ' dh-listing-row--expanded' : ''}`}>
                {postsToRender.map((post, i) => (
                    <Reveal key={post.id} delay={indexOffset * 100 + (i + 1) * 80}>
                        <ListingCard post={post} />
                    </Reveal>
                ))}
            </div>
        ) : (
            <Reveal delay={indexOffset * 100 + 80}>
                <p className="dh-empty-text">No {title.toLowerCase()} available yet.</p>
            </Reveal>
        )}
    </section>
    );
};

export const DashboardHome: React.FC = () => {
    const { user, profile } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [tourPosts, setTourPosts] = useState<PostRecord[]>([]);
    const [activityPosts, setActivityPosts] = useState<PostRecord[]>([]);
    const [eventPosts, setEventPosts] = useState<PostRecord[]>([]);

    const activeTab = useMemo<SectionTab | null>(() => {
        const tab = searchParams.get('tab');
        if (tab === 'tours' || tab === 'activities' || tab === 'events') return tab;
        if (tab === 'guides') return 'events';
        return null;
    }, [searchParams]);

    const greetingPhase = useMemo(() => getGreetingPhase(), []);
    const greeting = useMemo(() => getGreetingHeading(greetingPhase), [greetingPhase]);
    const isProvider = isProviderRole(profile?.role);
    const greetingAudience: GreetingAudience = isProvider ? 'provider' : 'tourist';
    const greetingSub = useMemo(
        () => pickRandom(GREETING_COPY[greetingAudience][greetingPhase]),
        [greetingAudience, greetingPhase],
    );
    const name = profile?.full_name || user?.email?.split('@')[0] || 'Explorer';
    const searchQueryNormalized = searchQuery.trim().toLowerCase();

    const filterPosts = (posts: PostRecord[]): PostRecord[] => {
        if (!searchQueryNormalized) return posts;
        return posts.filter((post) => {
            const title = getPostTitle(post).toLowerCase();
            const subtitle = getPostSubtitle(post).toLowerCase();
            const location = typeof post.location === 'string' ? post.location.toLowerCase() : '';
            return title.includes(searchQueryNormalized)
                || subtitle.includes(searchQueryNormalized)
                || location.includes(searchQueryNormalized);
        });
    };

    const filteredTourPosts = useMemo(() => filterPosts(tourPosts), [tourPosts, searchQueryNormalized]);
    const filteredActivityPosts = useMemo(() => filterPosts(activityPosts), [activityPosts, searchQueryNormalized]);
    const filteredEventPosts = useMemo(() => filterPosts(eventPosts), [eventPosts, searchQueryNormalized]);

    const totalListings = filteredTourPosts.length + filteredActivityPosts.length + filteredEventPosts.length;
    const activeTabText = activeTab ? `Showing ${activeTab}. Tap again to reset.` : 'Showing all categories.';
    const primaryTabCount = activeTab
        ? activeTab === 'tours'
            ? filteredTourPosts.length
            : activeTab === 'activities'
                ? filteredActivityPosts.length
                : filteredEventPosts.length
        : totalListings;
    const tabSummary = `${primaryTabCount} option${primaryTabCount === 1 ? '' : 's'} live`;
    const searchPlaceholder = activeTab === 'events'
        ? 'Search Events'
        : activeTab === 'activities'
            ? 'Search Activities'
            : 'Search Tours';

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            setLoading(true);
            try {
                const [tours, activities, events] = await Promise.all([
                    getPublicListingsByType('tour'),
                    getPublicListingsByType('activity'),
                    getPublicListingsByType('guide'),
                ]);

                setTourPosts(tours);
                setActivityPosts(activities);
                setEventPosts(events);
            } catch (error) {
                console.error('Dashboard load error:', error);
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

    let sectionIndexOffset = 0;

    const handleTab = (tab: SectionTab) => {
        if (activeTab === tab) {
            setSearchParams({});
        } else {
            setSearchParams({ tab });
        }
    };

    return (
        <main className="dh-page">
            <div className="container dh-shell">
                <Reveal delay={0}>
                    <section className="dh-top-panel">
                        <div className="dh-search-wrap">
                            <label className="dh-search" aria-label="Search listings">
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder={searchPlaceholder}
                                />
                                <button type="button" aria-label="Search">
                                    <Search size={20} />
                                </button>
                            </label>
                        </div>

                        <div className="dh-greeting">
                            <p className="dh-greeting-kicker">Travel Workspace</p>
                            <h1 className="dh-greeting-title">{greeting}</h1>
                            <p className="dh-greeting-name">{name}</p>
                            <p className="dh-greeting-sub">{greetingSub}</p>
                        </div>

                        {isProvider && (
                            <div className="dh-provider-cta-row">
                                <Link to="/provider/studio" className="dh-provider-cta-primary">
                                    Post Tours, Activities, Events
                                </Link>
                                <Link to="/provider/studio" className="dh-provider-cta-secondary">
                                    Open Provider Studio
                                </Link>
                            </div>
                        )}
                    </section>
                </Reveal>

                <Reveal delay={150}>
                    <div className="dh-tab-strip-wrapper">
                        <div className="dh-tab-strip-head">
                            <p className="dh-tab-strip-status">{activeTabText}</p>
                            <p className="dh-tab-strip-count">{tabSummary}</p>
                        </div>

                        <div className="dh-tab-strip" role="tablist" aria-label="Content filter">
                            {TAB_CONFIG.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === tab.id}
                                        className={`dh-tab-pill ${getToneClass(tab.id)}${activeTab === tab.id ? ' is-active' : ''}`}
                                        onClick={() => handleTab(tab.id)}
                                    >
                                        <span className="dh-tab-pill-top">
                                            <Icon size={14} />
                                            <span>{tab.label}</span>
                                        </span>
                                        <span className="dh-tab-pill-helper">{tab.helper}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>

                {loading ? (
                    <Reveal delay={220}>
                        <div className="dh-loading">
                            <Loader2 size={36} className="animate-spin" />
                        </div>
                    </Reveal>
                ) : (
                    <div className="dh-sections">
                        {showTours && (
                            <Section
                                section="tours"
                                title="Tours"
                                posts={filteredTourPosts}
                                moreHref="/dashboard?tab=tours"
                                indexOffset={sectionIndexOffset++}
                                expanded={activeTab === 'tours'}
                            />
                        )}

                        {showActivities && (
                            <Section
                                section="activities"
                                title="Activities"
                                posts={filteredActivityPosts}
                                moreHref="/dashboard?tab=activities"
                                indexOffset={sectionIndexOffset++}
                                expanded={activeTab === 'activities'}
                            />
                        )}

                        {showEvents && (
                            <Section
                                section="events"
                                title="Events"
                                posts={filteredEventPosts}
                                moreHref="/dashboard?tab=events"
                                indexOffset={sectionIndexOffset++}
                                expanded={activeTab === 'events'}
                            />
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};
