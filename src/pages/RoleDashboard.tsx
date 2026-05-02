import React, { useEffect, useMemo, useState } from 'react';
import {
    BadgeDollarSign,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Heart,
    LayoutDashboard,
    Loader2,
    Search,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
    getBookings,
    getContentModerationQueue,
    getConversations,
    getFavoriteListings,
    getModerationAuditLogs,
    getMyPosts,
    getNotifications,
    getPosts,
    getProviderBookings,
    getVerificationQueue,
    type AppNotificationRecord,
    type ConversationRecord,
    type FavoriteListingRecord,
    type ModerationAuditLogRecord,
    type PostRecord,
    type UnifiedBooking,
    type VerificationRecord,
} from '../lib/destinations';
import { isProviderRole } from '../lib/platform';
import './role-dashboard.css';

type DashboardRole = 'tourist' | 'provider' | 'admin';

type SidebarKey =
    | 'overview'
    | 'explore'
    | 'bookings'
    | 'favorites'
    | 'listings'
    | 'messages'
    | 'moderation'
    | 'users'
    | 'audits';

type AdminProfileRow = {
    id: string;
    role?: string | null;
    full_name?: string | null;
    email?: string | null;
    created_at?: string | null;
};

type NavItem = {
    key: SidebarKey;
    label: string;
};

const LIVE_STATUSES = new Set(['live', 'published', 'approved']);

const normalizeRoleParam = (value?: string): DashboardRole | null => {
    if (!value) return null;
    const v = value.trim().toLowerCase();
    if (v === 'tourist') return 'tourist';
    if (v === 'provider' || v === 'vendor') return 'provider';
    if (v === 'admin') return 'admin';
    return null;
};

const effectiveRoleFromProfile = (role?: string | null): DashboardRole => {
    if (role === 'admin') return 'admin';
    if (isProviderRole(role)) return 'provider';
    return 'tourist';
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

const formatDate = (value?: string | null) => {
    if (!value) return 'N/A';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return 'N/A';
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (value?: string | null) => {
    if (!value) return 'Just now';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return 'Just now';
    return dt.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const titleForPost = (item: PostRecord) => item.title || item.name || 'Untitled listing';

const sectionMeta: Record<SidebarKey, { title: string; subtitle: string }> = {
    overview: { title: 'Dashboard', subtitle: 'Your role-based operational summary.' },
    explore: { title: 'Explore', subtitle: 'Suggested items and quick jump context.' },
    bookings: { title: 'Bookings', subtitle: 'Booking records and status timelines.' },
    favorites: { title: 'Favorites', subtitle: 'Saved listings from your activity.' },
    listings: { title: 'Listings', subtitle: 'Provider listing lifecycle and publication state.' },
    messages: { title: 'Messages', subtitle: 'Conversation and notification overview.' },
    moderation: { title: 'Moderation', subtitle: 'Queue and verification decisions.' },
    users: { title: 'Users', subtitle: 'Platform user distribution and recent profiles.' },
    audits: { title: 'Audit Logs', subtitle: 'Recent administrative actions on platform entities.' },
};

export const RoleDashboard: React.FC = () => {
    const { user, profile, profileLoading } = useAuth();
    const { role: roleParam } = useParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [activeSection, setActiveSection] = useState<SidebarKey>('overview');

    const routeRole = normalizeRoleParam(roleParam);
    const metadataRole = typeof user?.user_metadata?.role === 'string' ? user.user_metadata.role : null;
    const effectiveRole = useMemo(
        () => effectiveRoleFromProfile(profile?.role || metadataRole),
        [metadataRole, profile?.role],
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);

    const [touristBookings, setTouristBookings] = useState<UnifiedBooking[]>([]);
    const [touristFavorites, setTouristFavorites] = useState<FavoriteListingRecord[]>([]);
    const [touristConversations, setTouristConversations] = useState<ConversationRecord[]>([]);
    const [touristNotifications, setTouristNotifications] = useState<AppNotificationRecord[]>([]);

    const [providerListings, setProviderListings] = useState<PostRecord[]>([]);
    const [providerBookings, setProviderBookings] = useState<UnifiedBooking[]>([]);
    const [providerConversations, setProviderConversations] = useState<ConversationRecord[]>([]);
    const [providerNotifications, setProviderNotifications] = useState<AppNotificationRecord[]>([]);

    const [adminPublishedPosts, setAdminPublishedPosts] = useState<PostRecord[]>([]);
    const [adminQueuePosts, setAdminQueuePosts] = useState<PostRecord[]>([]);
    const [adminVerifications, setAdminVerifications] = useState<VerificationRecord[]>([]);
    const [adminAuditLogs, setAdminAuditLogs] = useState<ModerationAuditLogRecord[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminProfileRow[]>([]);

    useEffect(() => {
        if (!user || profileLoading) return;
        if (!routeRole || routeRole !== effectiveRole) {
            navigate(`/dashboard/${effectiveRole}`, { replace: true });
        }
    }, [effectiveRole, navigate, profileLoading, routeRole, user]);

    useEffect(() => {
        setActiveSection('overview');
    }, [effectiveRole]);

    useEffect(() => {
        if (!user || profileLoading) return;
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                if (effectiveRole === 'tourist') {
                    const [bookings, favorites, conversations, notifications] = await Promise.all([
                        getBookings(user.id),
                        getFavoriteListings(user.id),
                        getConversations(user.id),
                        getNotifications(user.id, 50),
                    ]);
                    if (cancelled) return;
                    setTouristBookings(bookings);
                    setTouristFavorites(favorites);
                    setTouristConversations(conversations);
                    setTouristNotifications(notifications);
                }

                if (effectiveRole === 'provider') {
                    const [listings, bookings, conversations, notifications] = await Promise.all([
                        getMyPosts(user.id),
                        getProviderBookings(user.id),
                        getConversations(user.id),
                        getNotifications(user.id, 50),
                    ]);
                    if (cancelled) return;
                    setProviderListings(listings);
                    setProviderBookings(bookings);
                    setProviderConversations(conversations);
                    setProviderNotifications(notifications);
                }

                if (effectiveRole === 'admin') {
                    const [posts, queuePosts, verifications, audits, usersResult] = await Promise.all([
                        getPosts(),
                        getContentModerationQueue(),
                        getVerificationQueue(),
                        getModerationAuditLogs(),
                        supabase
                            .from('profiles')
                            .select('id, role, full_name, email, created_at')
                            .order('created_at', { ascending: false })
                            .limit(5000),
                    ]);
                    if (cancelled) return;
                    setAdminPublishedPosts(posts);
                    setAdminQueuePosts(queuePosts);
                    setAdminVerifications(verifications);
                    setAdminAuditLogs(audits);
                    setAdminUsers(usersResult.error ? [] : (usersResult.data as AdminProfileRow[] || []));
                }
                if (!cancelled) setLastLoadedAt(new Date().toISOString());
            } catch (err: unknown) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    }, [effectiveRole, profileLoading, user]);

    const navItems: NavItem[] = useMemo(() => {
        if (effectiveRole === 'admin') {
            return [
                { key: 'overview', label: 'Dashboard' },
                { key: 'moderation', label: 'Moderation' },
                { key: 'users', label: 'Users' },
                { key: 'audits', label: 'Audit Logs' },
            ];
        }
        if (effectiveRole === 'provider') {
            return [
                { key: 'overview', label: 'Dashboard' },
                { key: 'listings', label: 'Listings' },
                { key: 'bookings', label: 'Bookings' },
                { key: 'messages', label: 'Messages' },
            ];
        }
        return [
            { key: 'overview', label: 'Dashboard' },
            { key: 'explore', label: 'Explore' },
            { key: 'bookings', label: 'Bookings' },
            { key: 'favorites', label: 'Favorites' },
        ];
    }, [effectiveRole]);

    const query = search.trim().toLowerCase();

    const touristMetrics = useMemo(() => {
        const completed = touristBookings.filter((item) => item.status === 'completed').length;
        const upcoming = touristBookings.filter((item) => {
            if (item.status !== 'pending' && item.status !== 'confirmed') return false;
            if (!item.booking_date) return true;
            return new Date(item.booking_date).getTime() >= Date.now() - 86400000;
        }).length;
        const spend = touristBookings
            .filter((item) => item.status !== 'cancelled')
            .reduce((sum, item) => sum + (item.total_price || 0), 0);

        return {
            completed,
            upcoming,
            spend,
            reviewable: completed,
        };
    }, [touristBookings]);

    const providerMetrics = useMemo(() => {
        const pending = providerListings.filter((item) => item.status === 'pending').length;
        const live = providerListings.filter((item) => LIVE_STATUSES.has((item.status || '').toLowerCase())).length;
        const revenue = providerBookings
            .filter((item) => item.status !== 'cancelled')
            .reduce((sum, item) => sum + (item.total_price || 0), 0);
        const rejected = providerListings.filter((item) => item.status === 'rejected').length;
        return { pending, live, revenue, rejected };
    }, [providerBookings, providerListings]);

    const adminMetrics = useMemo(() => {
        const packageIds = new Set<string>();
        for (const p of adminPublishedPosts) if (p.id) packageIds.add(p.id);
        for (const p of adminQueuePosts) if (p.id) packageIds.add(p.id);

        let adminCount = 0;
        let providerCount = 0;
        let touristCount = 0;
        for (const row of adminUsers) {
            if (row.role === 'admin') adminCount += 1;
            else if (isProviderRole(row.role || null)) providerCount += 1;
            else touristCount += 1;
        }

        const pendingPosts = adminQueuePosts.filter((item) => item.status === 'pending').length;
        const rejectedPosts = adminQueuePosts.filter((item) => item.status === 'rejected').length;
        const approvedPosts = adminQueuePosts.filter((item) => item.status === 'approved').length + adminPublishedPosts.length;

        return {
            totalPackages: packageIds.size,
            totalUsers: adminUsers.length,
            adminCount,
            providerCount,
            touristCount,
            pendingPosts,
            rejectedPosts,
            approvedPosts,
            pendingVerifications: adminVerifications.filter((v) => v.status === 'pending' || v.status === 'resubmitted').length,
        };
    }, [adminPublishedPosts, adminQueuePosts, adminUsers, adminVerifications]);

    const touristRows = touristBookings
        .filter((item) => !query || `${item.listing_title || ''} ${item.status || ''}`.toLowerCase().includes(query));

    const favoriteRows = touristFavorites
        .filter((item) => !query || `${item.title || ''} ${item.location || ''} ${item.listing_type || ''}`.toLowerCase().includes(query));

    const providerRows = providerListings
        .filter((item) => !query || `${titleForPost(item)} ${item.status || ''} ${item.type || ''}`.toLowerCase().includes(query));

    const providerBookingRows = providerBookings
        .filter((item) => !query || `${item.listing_title || ''} ${item.status || ''}`.toLowerCase().includes(query));

    const adminQueueRows = adminQueuePosts
        .filter((item) => !query || `${titleForPost(item)} ${item.status || ''} ${item.type || ''}`.toLowerCase().includes(query));

    const adminAuditRows = adminAuditLogs
        .filter((item) => !query || `${item.entity_type} ${item.action} ${item.entity_id}`.toLowerCase().includes(query));

    const adminUserRows = adminUsers
        .filter((item) => !query || `${item.full_name || ''} ${item.email || ''} ${item.role || ''}`.toLowerCase().includes(query));

    const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || '';

    const headerMeta = sectionMeta[activeSection] || sectionMeta.overview;
    const activeNavLabel = navItems.find((item) => item.key === activeSection)?.label || 'Dashboard';
    const sectionCounts: Partial<Record<SidebarKey, number>> = useMemo(() => {
        if (effectiveRole === 'tourist') {
            return {
                bookings: touristRows.length,
                favorites: favoriteRows.length,
            };
        }
        if (effectiveRole === 'provider') {
            return {
                listings: providerRows.length,
                bookings: providerBookingRows.length,
                messages: providerNotifications.length,
            };
        }
        return {
            moderation: adminQueueRows.length,
            users: adminUserRows.length,
            audits: adminAuditRows.length,
        };
    }, [
        adminAuditRows.length,
        adminQueueRows.length,
        adminUserRows.length,
        effectiveRole,
        favoriteRows.length,
        providerBookingRows.length,
        providerNotifications.length,
        providerRows.length,
        touristRows.length,
    ]);

    const renderTouristSection = () => {
        if (activeSection === 'bookings') {
            return (
                <section className="rdb-panel rdb-panel-wide">
                    <div className="rdb-panel-head">
                        <h2>Bookings</h2>
                        <small>{query ? `Filtered by "${search}"` : `${touristRows.length} records`}</small>
                    </div>
                    <div className="rdb-list">
                        {touristRows.slice(0, 16).map((item) => (
                            <div key={item.id} className="rdb-list-row">
                                <div>
                                    <p>{item.listing_title || 'Package'}</p>
                                    <small>{formatDate(item.booking_date || item.created_at)}</small>
                                </div>
                                <span className={`rdb-pill rdb-pill-${item.status}`}>{item.status}</span>
                            </div>
                        ))}
                        {touristRows.length === 0 && <p className="rdb-empty">No matching bookings.</p>}
                    </div>
                </section>
            );
        }

        if (activeSection === 'favorites') {
            return (
                <section className="rdb-panel rdb-panel-wide">
                    <div className="rdb-panel-head">
                        <h2>Favorites</h2>
                        <small>{query ? `Filtered by "${search}"` : `${favoriteRows.length} records`}</small>
                    </div>
                    <div className="rdb-list">
                        {favoriteRows.slice(0, 16).map((item) => (
                            <div key={item.favorite_id} className="rdb-list-row">
                                <div>
                                    <p>{item.title}</p>
                                    <small>{item.location || 'N/A'} - {item.listing_type}</small>
                                </div>
                                <small>{formatDate(item.created_at)}</small>
                            </div>
                        ))}
                        {favoriteRows.length === 0 && <p className="rdb-empty">No matching favorites.</p>}
                    </div>
                </section>
            );
        }

        if (activeSection === 'explore') {
            return (
                <section className="rdb-content-grid">
                    <article className="rdb-panel">
                        <h2>Travel Snapshot</h2>
                        <div className="rdb-stat-list">
                            <div><span>Upcoming Trips</span><strong>{touristMetrics.upcoming}</strong></div>
                            <div><span>Completed Trips</span><strong>{touristMetrics.completed}</strong></div>
                            <div><span>Saved Places</span><strong>{touristFavorites.length}</strong></div>
                            <div><span>Total Spend</span><strong>{formatCurrency(touristMetrics.spend)}</strong></div>
                        </div>
                    </article>
                    <article className="rdb-panel">
                        <h2>Quick Actions</h2>
                        <div className="rdb-action-list">
                            <Link to="/?tab=tours" className="rdb-inline-link">Open tours</Link>
                            <Link to="/?tab=activities" className="rdb-inline-link">Open activities</Link>
                            <Link to="/profile" className="rdb-inline-link">Open profile bookings</Link>
                        </div>
                    </article>
                </section>
            );
        }

        return (
            <>
                <section className="rdb-kpis">
                    <article className="rdb-kpi rdb-kpi-highlight">
                        <div className="rdb-kpi-head"><ClipboardList size={15} /><p>Total Bookings</p></div>
                        <strong>{touristBookings.length}</strong>
                        <span>All trips booked by you</span>
                    </article>
                    <article className="rdb-kpi">
                        <div className="rdb-kpi-head"><CheckCircle2 size={15} /><p>Completed</p></div>
                        <strong>{touristMetrics.completed}</strong>
                        <span>Trips completed</span>
                    </article>
                    <article className="rdb-kpi">
                        <div className="rdb-kpi-head"><TrendingUp size={15} /><p>Upcoming</p></div>
                        <strong>{touristMetrics.upcoming}</strong>
                        <span>Pending and confirmed</span>
                    </article>
                    <article className="rdb-kpi">
                        <div className="rdb-kpi-head"><Heart size={15} /><p>Favorites</p></div>
                        <strong>{touristFavorites.length}</strong>
                        <span>Saved places</span>
                    </article>
                </section>

                <section className="rdb-content-grid">
                    <article className="rdb-panel rdb-panel-wide">
                        <div className="rdb-panel-head">
                            <h2>Upcoming and Recent Trips</h2>
                            <small>{query ? `Filtered by "${search}"` : 'Latest 6 records'}</small>
                        </div>
                        <div className="rdb-list">
                            {touristRows.slice(0, 6).map((item) => (
                                <div key={item.id} className="rdb-list-row">
                                    <div>
                                        <p>{item.listing_title || 'Package'}</p>
                                        <small>{formatDate(item.booking_date || item.created_at)}</small>
                                    </div>
                                    <span className={`rdb-pill rdb-pill-${item.status}`}>{item.status}</span>
                                </div>
                            ))}
                            {touristRows.length === 0 && <p className="rdb-empty">No matching bookings.</p>}
                        </div>
                    </article>

                    <article className="rdb-panel">
                        <h2>Quick Snapshot</h2>
                        <div className="rdb-stat-list">
                            <div><span>Review Queue</span><strong>{touristMetrics.reviewable}</strong></div>
                            <div><span>Total Spend</span><strong>{formatCurrency(touristMetrics.spend)}</strong></div>
                            <div><span>Conversations</span><strong>{touristConversations.length}</strong></div>
                            <div><span>Notifications</span><strong>{touristNotifications.length}</strong></div>
                        </div>
                    </article>

                    <article className="rdb-panel">
                        <h2>Suggested Actions</h2>
                        <div className="rdb-action-list">
                            <button type="button" className="rdb-inline-link" onClick={() => setActiveSection('explore')}>Open explore panel</button>
                            <button type="button" className="rdb-inline-link" onClick={() => setActiveSection('bookings')}>Open bookings panel</button>
                            <button type="button" className="rdb-inline-link" onClick={() => setActiveSection('favorites')}>Open favorites panel</button>
                        </div>
                    </article>
                </section>
            </>
        );
    };

    const renderProviderSection = () => {
        if (activeSection === 'bookings') {
            return (
                <section className="rdb-panel rdb-panel-wide">
                    <div className="rdb-panel-head">
                        <h2>Provider Bookings</h2>
                        <small>{query ? `Filtered by "${search}"` : `${providerBookingRows.length} records`}</small>
                    </div>
                    <div className="rdb-list">
                        {providerBookingRows.slice(0, 16).map((item) => (
                            <div key={item.id} className="rdb-list-row">
                                <div>
                                    <p>{item.listing_title || 'Package'}</p>
                                    <small>{formatDate(item.booking_date || item.created_at)}</small>
                                </div>
                                <span className={`rdb-pill rdb-pill-${item.status}`}>{item.status}</span>
                            </div>
                        ))}
                        {providerBookingRows.length === 0 && <p className="rdb-empty">No matching bookings.</p>}
                    </div>
                </section>
            );
        }

        if (activeSection === 'messages') {
            return (
                <section className="rdb-content-grid">
                    <article className="rdb-panel">
                        <h2>Communication</h2>
                        <div className="rdb-stat-list">
                            <div><span>Conversations</span><strong>{providerConversations.length}</strong></div>
                            <div><span>Notifications</span><strong>{providerNotifications.length}</strong></div>
                        </div>
                    </article>
                    <article className="rdb-panel">
                        <h2>Recent Notifications</h2>
                        <div className="rdb-list">
                            {providerNotifications.slice(0, 8).map((item) => (
                                <div key={item.id} className="rdb-list-row">
                                    <div>
                                        <p>{item.title}</p>
                                        <small>{item.body || item.type}</small>
                                    </div>
                                    <small>{formatDate(item.created_at)}</small>
                                </div>
                            ))}
                            {providerNotifications.length === 0 && <p className="rdb-empty">No notifications yet.</p>}
                        </div>
                    </article>
                </section>
            );
        }

        if (activeSection === 'listings') {
            return (
                <section className="rdb-panel rdb-panel-wide">
                    <div className="rdb-panel-head">
                        <h2>Listings and Status</h2>
                        <small>{query ? `Filtered by "${search}"` : `${providerRows.length} records`}</small>
                    </div>
                    <div className="rdb-list">
                        {providerRows.slice(0, 18).map((item) => (
                            <div key={item.id} className="rdb-list-row">
                                <div>
                                    <p>{titleForPost(item)}</p>
                                    <small>{item.type || 'listing'} - {formatDate(item.created_at)}</small>
                                </div>
                                <span className={`rdb-pill rdb-pill-${(item.status || 'pending').toLowerCase()}`}>{item.status || 'pending'}</span>
                            </div>
                        ))}
                        {providerRows.length === 0 && <p className="rdb-empty">No matching listings.</p>}
                    </div>
                </section>
            );
        }

        return (
            <>
                <section className="rdb-kpis">
                    <article className="rdb-kpi rdb-kpi-highlight">
                        <div className="rdb-kpi-head"><LayoutDashboard size={15} /><p>Total Listings</p></div>
                        <strong>{providerListings.length}</strong>
                        <span>All provider posts</span>
                    </article>
                    <article className="rdb-kpi">
                        <div className="rdb-kpi-head"><Clock3 size={15} /><p>Pending</p></div>
                        <strong>{providerMetrics.pending}</strong>
                        <span>Awaiting admin review</span>
                    </article>
                    <article className="rdb-kpi">
                        <div className="rdb-kpi-head"><CheckCircle2 size={15} /><p>Live</p></div>
                        <strong>{providerMetrics.live}</strong>
                        <span>Currently published</span>
                    </article>
                    <article className="rdb-kpi">
                        <div className="rdb-kpi-head"><BadgeDollarSign size={15} /><p>Revenue</p></div>
                        <strong>{formatCurrency(providerMetrics.revenue)}</strong>
                        <span>Non-cancelled bookings</span>
                    </article>
                </section>

                <section className="rdb-content-grid">
                    <article className="rdb-panel rdb-panel-wide">
                        <div className="rdb-panel-head">
                            <h2>Listings and Status</h2>
                            <small>{query ? `Filtered by "${search}"` : 'Latest 6 records'}</small>
                        </div>
                        <div className="rdb-list">
                            {providerRows.slice(0, 6).map((item) => (
                                <div key={item.id} className="rdb-list-row">
                                    <div>
                                        <p>{titleForPost(item)}</p>
                                        <small>{item.type || 'listing'} - {formatDate(item.created_at)}</small>
                                    </div>
                                    <span className={`rdb-pill rdb-pill-${(item.status || 'pending').toLowerCase()}`}>{item.status || 'pending'}</span>
                                </div>
                            ))}
                            {providerRows.length === 0 && <p className="rdb-empty">No matching listings.</p>}
                        </div>
                    </article>

                    <article className="rdb-panel">
                        <h2>Operational Summary</h2>
                        <div className="rdb-stat-list">
                            <div><span>Rejected Listings</span><strong>{providerMetrics.rejected}</strong></div>
                            <div><span>Total Bookings</span><strong>{providerBookings.length}</strong></div>
                            <div><span>Conversations</span><strong>{providerConversations.length}</strong></div>
                            <div><span>Notifications</span><strong>{providerNotifications.length}</strong></div>
                        </div>
                    </article>

                    <article className="rdb-panel">
                        <h2>Suggested Actions</h2>
                        <div className="rdb-action-list">
                            <button type="button" className="rdb-inline-link" onClick={() => setActiveSection('listings')}>Open listings panel</button>
                            <button type="button" className="rdb-inline-link" onClick={() => setActiveSection('bookings')}>Open bookings panel</button>
                            <button type="button" className="rdb-inline-link" onClick={() => setActiveSection('messages')}>Open messages panel</button>
                        </div>
                    </article>
                </section>
            </>
        );
    };

    const renderAdminSection = () => {
        if (activeSection === 'users') {
            return (
                <section className="rdb-content-grid">
                    <article className="rdb-panel">
                        <h2>User Categories</h2>
                        <div className="rdb-user-split">
                            <div><p>Tourists</p><strong>{adminMetrics.touristCount}</strong></div>
                            <div><p>Providers</p><strong>{adminMetrics.providerCount}</strong></div>
                            <div><p>Admins</p><strong>{adminMetrics.adminCount}</strong></div>
                        </div>
                    </article>
                    <article className="rdb-panel rdb-panel-wide">
                        <div className="rdb-panel-head">
                            <h2>Recent Users</h2>
                            <small>{query ? `Filtered by "${search}"` : `${adminUserRows.length} records`}</small>
                        </div>
                        <div className="rdb-list">
                            {adminUserRows.slice(0, 16).map((item) => (
                                <div key={item.id} className="rdb-list-row">
                                    <div>
                                        <p>{item.full_name || item.email || 'Unnamed user'}</p>
                                        <small>{item.email || 'N/A'}</small>
                                    </div>
                                    <small>{item.role || 'tourist'}</small>
                                </div>
                            ))}
                            {adminUserRows.length === 0 && <p className="rdb-empty">No matching users.</p>}
                        </div>
                    </article>
                </section>
            );
        }

        if (activeSection === 'moderation') {
            return (
                <section className="rdb-content-grid">
                    <article className="rdb-panel">
                        <h2>Moderation Totals</h2>
                        <div className="rdb-stat-list">
                            <div><span>Approved Posts</span><strong>{adminMetrics.approvedPosts}</strong></div>
                            <div><span>Pending Posts</span><strong>{adminMetrics.pendingPosts}</strong></div>
                            <div><span>Rejected Posts</span><strong>{adminMetrics.rejectedPosts}</strong></div>
                            <div><span>Pending Verifications</span><strong>{adminMetrics.pendingVerifications}</strong></div>
                        </div>
                    </article>
                    <article className="rdb-panel rdb-panel-wide">
                        <div className="rdb-panel-head">
                            <h2>Moderation Queue</h2>
                            <small>{query ? `Filtered by "${search}"` : `${adminQueueRows.length} records`}</small>
                        </div>
                        <div className="rdb-list">
                            {adminQueueRows.slice(0, 16).map((item) => (
                                <div key={item.id} className="rdb-list-row">
                                    <div>
                                        <p>{titleForPost(item)}</p>
                                        <small>{item.type || 'listing'} - {formatDate(item.created_at)}</small>
                                    </div>
                                    <span className={`rdb-pill rdb-pill-${(item.status || 'pending').toLowerCase()}`}>{item.status || 'pending'}</span>
                                </div>
                            ))}
                            {adminQueueRows.length === 0 && <p className="rdb-empty">No matching moderation items.</p>}
                        </div>
                    </article>
                </section>
            );
        }

        if (activeSection === 'audits') {
            return (
                <section className="rdb-panel rdb-panel-wide">
                    <div className="rdb-panel-head">
                        <h2>Recent Audit Events</h2>
                        <small>{query ? `Filtered by "${search}"` : `${adminAuditRows.length} records`}</small>
                    </div>
                    <div className="rdb-list">
                        {adminAuditRows.slice(0, 18).map((item) => (
                            <div key={item.id} className="rdb-list-row">
                                <div>
                                    <p>{item.entity_type} - {item.action}</p>
                                    <small>{item.entity_id}</small>
                                </div>
                                <small>{formatDate(item.created_at)}</small>
                            </div>
                        ))}
                        {adminAuditRows.length === 0 && <p className="rdb-empty">No matching audit events.</p>}
                    </div>
                </section>
            );
        }

        return (
            <>
                <section className="rdb-kpis">
                    <article className="rdb-kpi rdb-kpi-highlight">
                        <div className="rdb-kpi-head"><LayoutDashboard size={15} /><p>Total Packages</p></div>
                        <strong>{adminMetrics.totalPackages}</strong>
                        <span>Published and queued posts</span>
                    </article>
                    <article className="rdb-kpi">
                        <div className="rdb-kpi-head"><Users size={15} /><p>Total Users</p></div>
                        <strong>{adminMetrics.totalUsers}</strong>
                        <span>All profiles</span>
                    </article>
                    <article className="rdb-kpi">
                        <div className="rdb-kpi-head"><CheckCircle2 size={15} /><p>Approved</p></div>
                        <strong>{adminMetrics.approvedPosts}</strong>
                        <span>Approved plus published</span>
                    </article>
                    <article className="rdb-kpi">
                        <div className="rdb-kpi-head"><Clock3 size={15} /><p>Pending</p></div>
                        <strong>{adminMetrics.pendingPosts}</strong>
                        <span>Awaiting moderation</span>
                    </article>
                </section>

                <section className="rdb-content-grid">
                    <article className="rdb-panel">
                        <h2>User Categories</h2>
                        <div className="rdb-user-split">
                            <div><p>Tourists</p><strong>{adminMetrics.touristCount}</strong></div>
                            <div><p>Providers</p><strong>{adminMetrics.providerCount}</strong></div>
                            <div><p>Admins</p><strong>{adminMetrics.adminCount}</strong></div>
                        </div>
                    </article>

                    <article className="rdb-panel">
                        <h2>Control Summary</h2>
                        <div className="rdb-stat-list">
                            <div><span>Rejected Posts</span><strong>{adminMetrics.rejectedPosts}</strong></div>
                            <div><span>Pending Verifications</span><strong>{adminMetrics.pendingVerifications}</strong></div>
                            <div><span>Verification Records</span><strong>{adminVerifications.length}</strong></div>
                            <div><span>Audit Events</span><strong>{adminAuditLogs.length}</strong></div>
                        </div>
                    </article>

                    <article className="rdb-panel rdb-panel-wide">
                        <div className="rdb-panel-head">
                            <h2>Moderation Queue</h2>
                            <small>{query ? `Filtered by "${search}"` : 'Latest 6 records'}</small>
                        </div>
                        <div className="rdb-list">
                            {adminQueueRows.slice(0, 6).map((item) => (
                                <div key={item.id} className="rdb-list-row">
                                    <div>
                                        <p>{titleForPost(item)}</p>
                                        <small>{item.type || 'listing'} - {formatDate(item.created_at)}</small>
                                    </div>
                                    <span className={`rdb-pill rdb-pill-${(item.status || 'pending').toLowerCase()}`}>{item.status || 'pending'}</span>
                                </div>
                            ))}
                            {adminQueueRows.length === 0 && <p className="rdb-empty">No matching moderation items.</p>}
                        </div>
                    </article>
                </section>
            </>
        );
    };

    if (!user || profileLoading) return null;

    return (
        <main className="rdb-page">
            <div className="container rdb-shell">
                <aside className="rdb-sidebar">
                    <div className="rdb-brand">
                        <span className="rdb-brand-mark" />
                        <div>
                            <p className="rdb-brand-name">The Better Pass</p>
                            <p className="rdb-brand-role">{effectiveRole.toUpperCase()} DASHBOARD</p>
                        </div>
                    </div>

                    <nav className="rdb-nav" aria-label="Dashboard menu">
                        {navItems.map((item) => (
                            <button
                                type="button"
                                key={item.key}
                                className={`rdb-nav-item${item.key === activeSection ? ' is-active' : ''}`}
                                onClick={() => setActiveSection(item.key)}
                            >
                                <span>{item.label}</span>
                                {typeof sectionCounts[item.key] === 'number' && (
                                    <span className="rdb-nav-count">{sectionCounts[item.key]}</span>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="rdb-profile">
                        <p className="rdb-profile-name">{userName}</p>
                        <p className="rdb-profile-email">{userEmail}</p>
                    </div>
                </aside>

                <section className="rdb-main">
                    <header className="rdb-header">
                        <div className="rdb-search">
                            <Search size={16} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search in dashboard..."
                                aria-label="Search dashboard data"
                            />
                        </div>

                        <div className="rdb-header-actions">
                            {effectiveRole === 'admin' && <Link to="/admin" className="rdb-btn">Open Admin Console</Link>}
                            {effectiveRole === 'provider' && <Link to="/provider/studio" className="rdb-btn">Open Provider Studio</Link>}
                            {effectiveRole === 'tourist' && <Link to="/?tab=tours" className="rdb-btn">Explore Trips</Link>}
                        </div>
                    </header>

                    <section className="rdb-title-row">
                        <div className="rdb-title-head">
                            <h1>{headerMeta.title}</h1>
                            <div className="rdb-title-badges">
                                <span className="rdb-chip">{activeNavLabel}</span>
                                <span className="rdb-chip">Updated {formatDateTime(lastLoadedAt)}</span>
                            </div>
                        </div>
                        <p>{headerMeta.subtitle}</p>
                    </section>

                    <nav className="rdb-inline-nav" aria-label="Dashboard quick sections">
                        {navItems.map((item) => (
                            <button
                                type="button"
                                key={`inline-${item.key}`}
                                className={`rdb-inline-tab${item.key === activeSection ? ' is-active' : ''}`}
                                onClick={() => setActiveSection(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {loading ? (
                        <div className="rdb-loading"><Loader2 size={34} className="animate-spin" /></div>
                    ) : error ? (
                        <div className="rdb-error">{error}</div>
                    ) : (
                        <>
                            {effectiveRole === 'tourist' && renderTouristSection()}
                            {effectiveRole === 'provider' && renderProviderSection()}
                            {effectiveRole === 'admin' && renderAdminSection()}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
};
