import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getContentModerationQueue,
    getModerationAuditLogs,
    getVerificationQueue,
    reviewListing,
    reviewVerificationApplication,
    type ModerationAuditLogRecord,
    type PostRecord,
    type VerificationRecord,
} from '../lib/destinations';
import { LISTING_LABELS, getRoleLabel } from '../lib/platform';

const statusTone = (status?: string | null) => {
    switch (status) {
        case 'approved':
            return { bg: 'rgba(34, 197, 94, 0.1)', color: '#15803d' };
        case 'rejected':
            return { bg: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c' };
        case 'resubmitted':
            return { bg: 'rgba(37, 99, 235, 0.1)', color: '#1d4ed8' };
        default:
            return { bg: 'rgba(245, 158, 11, 0.12)', color: '#b45309' };
    }
};

type BulkConfirmationState =
    | { target: 'verification'; count: number }
    | { target: 'listing'; count: number }
    | null;

export const AdminConsole: React.FC = () => {
    const { user, isAdmin, loading } = useAuth();
    const [queue, setQueue] = useState<VerificationRecord[]>([]);
    const [listingQueue, setListingQueue] = useState<PostRecord[]>([]);
    const [auditLogs, setAuditLogs] = useState<ModerationAuditLogRecord[]>([]);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);
    const [verificationRejectReason, setVerificationRejectReason] = useState<Record<string, string>>({});
    const [listingRejectReason, setListingRejectReason] = useState<Record<string, string>>({});
    const [verificationStatusFilter, setVerificationStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'resubmitted'>('all');
    const [verificationRoleFilter, setVerificationRoleFilter] = useState<'all' | 'tour_company' | 'tour_instructor' | 'tour_guide'>('all');
    const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'pending' | 'rejected' | 'published'>('all');
    const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'tour' | 'activity' | 'guide'>('all');
    const [verificationSearch, setVerificationSearch] = useState('');
    const [listingSearch, setListingSearch] = useState('');
    const [verificationSort, setVerificationSort] = useState<'updated_desc' | 'updated_asc' | 'reviewed_desc'>('updated_desc');
    const [listingSort, setListingSort] = useState<'created_desc' | 'created_asc' | 'reviewed_desc'>('created_desc');
    const [selectedVerificationIds, setSelectedVerificationIds] = useState<string[]>([]);
    const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
    const [bulkBusy, setBulkBusy] = useState<'verification' | 'listing' | null>(null);
    const [bulkVerificationRejectReason, setBulkVerificationRejectReason] = useState('');
    const [bulkListingRejectReason, setBulkListingRejectReason] = useState('');
    const [bulkConfirmation, setBulkConfirmation] = useState<BulkConfirmationState>(null);

    const loadQueue = async () => {
        setFetching(true);
        try {
            const [data, listings, logs] = await Promise.all([
                getVerificationQueue(),
                getContentModerationQueue(),
                getModerationAuditLogs(),
            ]);
            setQueue(data);
            setListingQueue(listings);
            setAuditLogs(logs);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (!user || !isAdmin) return;
        void loadQueue();
    }, [isAdmin, user]);

    const pendingCount = useMemo(() => queue.filter((item) => item.status === 'pending' || item.status === 'resubmitted').length, [queue]);
    const approvedCount = useMemo(() => queue.filter((item) => item.status === 'approved').length, [queue]);
    const rejectedCount = useMemo(() => queue.filter((item) => item.status === 'rejected').length, [queue]);
    const pendingListingCount = useMemo(() => listingQueue.filter((item) => item.status === 'pending').length, [listingQueue]);
    const rejectedListingCount = useMemo(() => listingQueue.filter((item) => item.status === 'rejected').length, [listingQueue]);
    const formatAuditAction = (log: ModerationAuditLogRecord) => {
        if (log.entity_type === 'verification') {
            if (log.action === 'approved') return 'Approved provider verification';
            if (log.action === 'rejected') return 'Rejected provider verification';
            return 'Provider verification resubmitted';
        }

        if (log.action === 'published') return 'Published listing';
        if (log.action === 'rejected') return 'Rejected listing';
        return 'Listing resubmitted';
    };
    const filteredVerificationQueue = useMemo(() => {
        const query = verificationSearch.trim().toLowerCase();
        const filtered = queue.filter((item) => {
            const matchesStatus = verificationStatusFilter === 'all' || item.status === verificationStatusFilter;
            const matchesRole = verificationRoleFilter === 'all' || item.role === verificationRoleFilter;
            const haystack = [
                item.profiles?.full_name,
                item.profiles?.email,
                item.profiles?.phone,
                item.company_name,
                item.profiles?.company_name,
                item.role,
            ].filter(Boolean).join(' ').toLowerCase();
            const matchesSearch = !query || haystack.includes(query);
            return matchesStatus && matchesRole && matchesSearch;
        });

        return filtered.sort((a, b) => {
            if (verificationSort === 'updated_asc') {
                return new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
            }
            if (verificationSort === 'reviewed_desc') {
                return new Date(b.reviewed_at || 0).getTime() - new Date(a.reviewed_at || 0).getTime();
            }
            return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
        });
    }, [queue, verificationRoleFilter, verificationSearch, verificationSort, verificationStatusFilter]);
    const filteredListingQueue = useMemo(() => {
        const query = listingSearch.trim().toLowerCase();
        const filtered = listingQueue.filter((item) => {
            const matchesStatus = listingStatusFilter === 'all' || item.status === listingStatusFilter;
            const normalizedType = item.type === 'event' ? 'guide' : item.type;
            const matchesType = listingTypeFilter === 'all' || normalizedType === listingTypeFilter;
            const haystack = [
                item.title,
                item.name,
                item.location,
                normalizedType,
                item.sub_category,
            ].filter(Boolean).join(' ').toLowerCase();
            const matchesSearch = !query || haystack.includes(query);
            return matchesStatus && matchesType && matchesSearch;
        });

        return filtered.sort((a, b) => {
            if (listingSort === 'created_asc') {
                return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
            }
            if (listingSort === 'reviewed_desc') {
                return new Date(b.reviewed_at || 0).getTime() - new Date(a.reviewed_at || 0).getTime();
            }
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    }, [listingQueue, listingSearch, listingSort, listingStatusFilter, listingTypeFilter]);

    const handleReview = async (item: VerificationRecord, decision: 'approved' | 'rejected') => {
        setBusyId(item.id);
        try {
            await reviewVerificationApplication(item, decision, {
                reviewerId: user?.id,
                reason: decision === 'rejected' ? verificationRejectReason[item.id]?.trim() : undefined,
            });
            await loadQueue();
            setVerificationRejectReason((current) => ({ ...current, [item.id]: '' }));
        } catch (error) {
            console.error(`Failed to mark application as ${decision}:`, error);
            alert(`Failed to mark application as ${decision}.`);
        } finally {
            setBusyId(null);
        }
    };

    const handleListingReview = async (listingId: string, decision: 'published' | 'rejected') => {
        setBusyId(listingId);
        try {
            await reviewListing(listingId, decision, {
                reviewerId: user?.id,
                reason: decision === 'rejected' ? listingRejectReason[listingId]?.trim() : undefined,
            });
            await loadQueue();
            setListingRejectReason((current) => ({ ...current, [listingId]: '' }));
        } catch (error) {
            console.error(`Failed to mark listing as ${decision}:`, error);
            alert(`Failed to mark listing as ${decision}.`);
        } finally {
            setBusyId(null);
        }
    };

    const toggleVerificationSelection = (id: string) => {
        setSelectedVerificationIds((current) => (
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        ));
    };

    const toggleListingSelection = (id: string) => {
        setSelectedListingIds((current) => (
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        ));
    };

    const toggleAllVisibleVerifications = () => {
        const visibleIds = filteredVerificationQueue.map((item) => item.id);
        const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedVerificationIds.includes(id));
        setSelectedVerificationIds(allSelected ? [] : visibleIds);
    };

    const toggleAllVisibleListings = () => {
        const visibleIds = filteredListingQueue.map((item) => item.id);
        const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedListingIds.includes(id));
        setSelectedListingIds(allSelected ? [] : visibleIds);
    };

    const handleBulkVerificationReview = async (decision: 'approved' | 'rejected') => {
        const selectedItems = filteredVerificationQueue.filter((item) => selectedVerificationIds.includes(item.id));
        if (selectedItems.length === 0) return;

        setBulkBusy('verification');
        try {
            for (const item of selectedItems) {
                await reviewVerificationApplication(item, decision, {
                    reviewerId: user?.id,
                    reason: decision === 'rejected'
                        ? (bulkVerificationRejectReason.trim() || verificationRejectReason[item.id]?.trim())
                        : undefined,
                });
            }
            await loadQueue();
            setSelectedVerificationIds([]);
            setBulkVerificationRejectReason('');
        } catch (error) {
            console.error(`Failed bulk verification ${decision}:`, error);
            alert(`Failed bulk verification ${decision}.`);
        } finally {
            setBulkBusy(null);
        }
    };

    const requestBulkVerificationReject = () => {
        const selectedItems = filteredVerificationQueue.filter((item) => selectedVerificationIds.includes(item.id));
        if (selectedItems.length === 0) return;
        setBulkConfirmation({ target: 'verification', count: selectedItems.length });
    };

    const handleBulkListingReview = async (decision: 'published' | 'rejected') => {
        const selectedItems = filteredListingQueue.filter((item) => selectedListingIds.includes(item.id));
        if (selectedItems.length === 0) return;

        setBulkBusy('listing');
        try {
            for (const item of selectedItems) {
                await reviewListing(item.id, decision, {
                    reviewerId: user?.id,
                    reason: decision === 'rejected'
                        ? (bulkListingRejectReason.trim() || listingRejectReason[item.id]?.trim())
                        : undefined,
                });
            }
            await loadQueue();
            setSelectedListingIds([]);
            setBulkListingRejectReason('');
        } catch (error) {
            console.error(`Failed bulk listing ${decision}:`, error);
            alert(`Failed bulk listing ${decision}.`);
        } finally {
            setBulkBusy(null);
        }
    };

    const requestBulkListingReject = () => {
        const selectedItems = filteredListingQueue.filter((item) => selectedListingIds.includes(item.id));
        if (selectedItems.length === 0) return;
        setBulkConfirmation({ target: 'listing', count: selectedItems.length });
    };

    if (loading) return null;
    if (!user || !isAdmin) return <Navigate to="/dashboard" replace />;

    const resetVerificationControls = () => {
        setVerificationStatusFilter('all');
        setVerificationRoleFilter('all');
        setVerificationSearch('');
        setVerificationSort('updated_desc');
        setSelectedVerificationIds([]);
        setBulkVerificationRejectReason('');
        setBulkConfirmation((current) => (current?.target === 'verification' ? null : current));
    };

    const resetListingControls = () => {
        setListingStatusFilter('all');
        setListingTypeFilter('all');
        setListingSearch('');
        setListingSort('created_desc');
        setSelectedListingIds([]);
        setBulkListingRejectReason('');
        setBulkConfirmation((current) => (current?.target === 'listing' ? null : current));
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '156px 0 96px' }} className="animate-fade">
            <div className="container" style={{ maxWidth: '1180px' }}>
                <section style={{ marginBottom: '24px' }}>
                    <span style={{ display: 'inline-flex', padding: '8px 12px', borderRadius: '999px', background: 'rgba(24, 124, 103, 0.1)', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                        Admin Console
                    </span>
                    <h1 style={{ margin: 0, fontSize: 'clamp(2.2rem, 3vw, 3.2rem)', lineHeight: 1.02 }}>Provider verification queue</h1>
                    <p style={{ marginTop: '12px', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '780px' }}>
                        Review provider onboarding requests, approve trusted accounts, and reject incomplete applications so they can resubmit.
                    </p>
                </section>

                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }} className="admin-stats-grid">
                    {[
                        { label: 'Pending', value: pendingCount.toString().padStart(2, '0') },
                        { label: 'Approved', value: approvedCount.toString().padStart(2, '0') },
                        { label: 'Rejected', value: rejectedCount.toString().padStart(2, '0') },
                    ].map((stat) => (
                        <article key={stat.label} style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
                            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{stat.label}</span>
                            <strong style={{ fontSize: '2rem' }}>{stat.value}</strong>
                        </article>
                    ))}
                </section>

                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }} className="admin-stats-grid">
                    {[
                        { label: 'Pending Listings', value: pendingListingCount.toString().padStart(2, '0') },
                        { label: 'Rejected Listings', value: rejectedListingCount.toString().padStart(2, '0') },
                    ].map((stat) => (
                        <article key={stat.label} style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
                            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{stat.label}</span>
                            <strong style={{ fontSize: '2rem' }}>{stat.value}</strong>
                        </article>
                    ))}
                </section>

                <section style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '20px 22px', boxShadow: 'var(--shadow-card)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
                        <div>
                            <span style={{ display: 'inline-flex', padding: '7px 11px', borderRadius: '999px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                                Audit Trail
                            </span>
                            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Recent moderation activity</h2>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{auditLogs.length} recent action{auditLogs.length === 1 ? '' : 's'}</span>
                    </div>
                    {auditLogs.length === 0 ? (
                        <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                            No audit records are available yet. Apply the SQL migration for `moderation_audit_logs`, then new approval, rejection, and resubmission events will appear here.
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {auditLogs.map((log) => (
                                <article key={log.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', padding: '14px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-main)', border: '1px solid var(--border-light)' }}>
                                    <div style={{ minWidth: '260px', flex: '1 1 380px' }}>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                                            <strong>{formatAuditAction(log)}</strong>
                                            <span style={{ padding: '0.35rem 0.65rem', borderRadius: '999px', background: log.entity_type === 'verification' ? 'rgba(24, 124, 103, 0.1)' : 'rgba(37, 99, 235, 0.1)', color: log.entity_type === 'verification' ? 'var(--accent)' : '#1d4ed8', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                {log.entity_type}
                                            </span>
                                            <span style={{ padding: '0.35rem 0.65rem', borderRadius: '999px', background: 'rgba(15, 23, 42, 0.06)', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                {log.action}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                                            Record {log.entity_id}
                                            {log.target_user_id ? ` • target ${log.target_user_id}` : ''}
                                            {log.actor_user_id ? ` • actor ${log.actor_user_id}` : ''}
                                        </p>
                                        {log.reason && (
                                            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                                                Reason: {log.reason}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: '160px' }}>
                                        <p style={{ margin: 0, fontWeight: 700 }}>
                                            {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'Unknown date'}
                                        </p>
                                        <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                            {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'No timestamp'}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }} className="admin-filter-grid">
                    <article style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '18px', boxShadow: 'var(--shadow-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Verification Filters</h2>
                            <button type="button" className="btn btn-soft" style={{ borderRadius: '999px', padding: '9px 14px' }} onClick={resetVerificationControls}>
                                Reset
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                            <label>
                                <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Search</span>
                                <input
                                    value={verificationSearch}
                                    onChange={(e) => setVerificationSearch(e.target.value)}
                                    placeholder="Name, email, company"
                                    style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '11px 12px', background: 'var(--bg-main)', fontFamily: 'inherit' }}
                                />
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</span>
                                <select value={verificationStatusFilter} onChange={(e) => setVerificationStatusFilter(e.target.value as typeof verificationStatusFilter)} style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '11px 12px', background: 'var(--bg-main)', fontFamily: 'inherit' }}>
                                    <option value="all">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="resubmitted">Resubmitted</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role</span>
                                <select value={verificationRoleFilter} onChange={(e) => setVerificationRoleFilter(e.target.value as typeof verificationRoleFilter)} style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '11px 12px', background: 'var(--bg-main)', fontFamily: 'inherit' }}>
                                    <option value="all">All roles</option>
                                    <option value="tour_company">Tour Company</option>
                                    <option value="tour_instructor">Tour Instructor</option>
                                    <option value="tour_guide">Tour Guide</option>
                                </select>
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sort</span>
                                <select value={verificationSort} onChange={(e) => setVerificationSort(e.target.value as typeof verificationSort)} style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '11px 12px', background: 'var(--bg-main)', fontFamily: 'inherit' }}>
                                    <option value="updated_desc">Newest updated</option>
                                    <option value="updated_asc">Oldest updated</option>
                                    <option value="reviewed_desc">Latest reviewed</option>
                                </select>
                            </label>
                        </div>
                    </article>

                    <article style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '18px', boxShadow: 'var(--shadow-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Listing Filters</h2>
                            <button type="button" className="btn btn-soft" style={{ borderRadius: '999px', padding: '9px 14px' }} onClick={resetListingControls}>
                                Reset
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                            <label>
                                <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Search</span>
                                <input
                                    value={listingSearch}
                                    onChange={(e) => setListingSearch(e.target.value)}
                                    placeholder="Title, location, type"
                                    style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '11px 12px', background: 'var(--bg-main)', fontFamily: 'inherit' }}
                                />
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</span>
                                <select value={listingStatusFilter} onChange={(e) => setListingStatusFilter(e.target.value as typeof listingStatusFilter)} style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '11px 12px', background: 'var(--bg-main)', fontFamily: 'inherit' }}>
                                    <option value="all">All statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="published">Published</option>
                                </select>
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Type</span>
                                <select value={listingTypeFilter} onChange={(e) => setListingTypeFilter(e.target.value as typeof listingTypeFilter)} style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '11px 12px', background: 'var(--bg-main)', fontFamily: 'inherit' }}>
                                    <option value="all">All types</option>
                                    <option value="tour">{LISTING_LABELS.tour}</option>
                                    <option value="activity">{LISTING_LABELS.activity}</option>
                                    <option value="guide">{LISTING_LABELS.guide}</option>
                                </select>
                            </label>
                            <label>
                                <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sort</span>
                                <select value={listingSort} onChange={(e) => setListingSort(e.target.value as typeof listingSort)} style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '11px 12px', background: 'var(--bg-main)', fontFamily: 'inherit' }}>
                                    <option value="created_desc">Newest created</option>
                                    <option value="created_asc">Oldest created</option>
                                    <option value="reviewed_desc">Latest reviewed</option>
                                </select>
                            </label>
                        </div>
                    </article>
                </section>

                {fetching ? (
                    <section style={{ display: 'grid', placeItems: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin" size={34} />
                    </section>
                ) : filteredVerificationQueue.length === 0 ? (
                    <section style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '64px 24px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
                        <ShieldCheck size={26} style={{ marginBottom: '14px' }} />
                        <h2 style={{ marginBottom: '10px' }}>No verification records match these filters</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Adjust the filters to inspect a different slice of the verification queue.</p>
                    </section>
                ) : (
                    <section style={{ display: 'grid', gap: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '16px 18px', background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    <input
                                        type="checkbox"
                                        checked={filteredVerificationQueue.length > 0 && filteredVerificationQueue.every((item) => selectedVerificationIds.includes(item.id))}
                                        onChange={toggleAllVisibleVerifications}
                                    />
                                    Select visible
                                </label>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedVerificationIds.length} selected</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ borderRadius: '999px', padding: '10px 16px' }}
                                    disabled={selectedVerificationIds.length === 0 || bulkBusy === 'verification'}
                                    onClick={() => handleBulkVerificationReview('approved')}
                                >
                                    {bulkBusy === 'verification' ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                    Bulk Approve ({selectedVerificationIds.length})
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-soft"
                                    style={{ borderRadius: '999px', padding: '10px 16px' }}
                                    disabled={selectedVerificationIds.length === 0 || bulkBusy === 'verification'}
                                    onClick={requestBulkVerificationReject}
                                >
                                    {bulkBusy === 'verification' ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                    Bulk Reject ({selectedVerificationIds.length})
                                </button>
                            </div>
                        </div>
                        {bulkConfirmation?.target === 'verification' && (
                            <div style={{ padding: '16px 18px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '6px' }}>Confirm bulk rejection</strong>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                                            You are about to reject {bulkConfirmation.count} provider application{bulkConfirmation.count === 1 ? '' : 's'}.
                                            {bulkVerificationRejectReason.trim()
                                                ? ' The shared reject reason will be used for all selected records.'
                                                : ' If no shared reason is provided, each item uses its own per-record reason if available.'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            className="btn btn-soft"
                                            style={{ borderRadius: '999px', padding: '10px 16px' }}
                                            disabled={bulkBusy === 'verification'}
                                            onClick={() => setBulkConfirmation(null)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            style={{ borderRadius: '999px', padding: '10px 16px' }}
                                            disabled={bulkBusy === 'verification'}
                                            onClick={async () => {
                                                await handleBulkVerificationReview('rejected');
                                                setBulkConfirmation(null);
                                            }}
                                        >
                                            {bulkBusy === 'verification' ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                            Confirm Reject ({bulkConfirmation.count})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div style={{ padding: '16px 18px', background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}>
                            <label>
                                <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shared Bulk Reject Reason</span>
                                <textarea
                                    value={bulkVerificationRejectReason}
                                    onChange={(e) => setBulkVerificationRejectReason(e.target.value)}
                                    placeholder="Optional shared reason for all selected verification rejections."
                                    style={{ width: '100%', minHeight: '90px', resize: 'vertical', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', background: 'var(--bg-main)', fontFamily: 'inherit', fontSize: '0.92rem', color: 'var(--text-main)' }}
                                />
                            </label>
                        </div>
                        {filteredVerificationQueue.map((item) => {
                            const tone = statusTone(item.status);
                            const isBusy = busyId === item.id;
                            const profile = item.profiles;
                            return (
                                <article key={item.id} style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '22px', boxShadow: 'var(--shadow-card)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', marginBottom: '18px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedVerificationIds.includes(item.id)}
                                                onChange={() => toggleVerificationSelection(item.id)}
                                                style={{ marginTop: '6px' }}
                                            />
                                            <div>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                                <span style={{ padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                    {getRoleLabel(item.role)}
                                                </span>
                                                <span style={{ padding: '0.45rem 0.75rem', borderRadius: '999px', background: tone.bg, color: tone.color, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{profile?.full_name || 'Unnamed applicant'}</h2>
                                            <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>{profile?.email || 'No email'} {profile?.phone ? `• ${profile.phone}` : ''}</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleReview(item, 'approved')}
                                                disabled={isBusy || item.status === 'approved'}
                                                className="btn btn-primary"
                                                style={{ borderRadius: '999px', padding: '10px 16px' }}
                                            >
                                                {isBusy ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleReview(item, 'rejected')}
                                                disabled={isBusy || item.status === 'rejected'}
                                                className="btn btn-soft"
                                                style={{ borderRadius: '999px', padding: '10px 16px' }}
                                            >
                                                {isBusy ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                                Reject
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }} className="admin-detail-grid">
                                        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Company</p>
                                            <strong>{item.company_name || profile?.company_name || 'Independent'}</strong>
                                        </div>
                                        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Location</p>
                                            <strong>{[profile?.city, profile?.country].filter(Boolean).join(', ') || 'Not provided'}</strong>
                                        </div>
                                        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Experience</p>
                                            <strong>{item.years_experience ? `${item.years_experience} years` : 'Not provided'}</strong>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', marginTop: '14px' }} className="admin-detail-grid">
                                        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Verification refs</p>
                                            <strong>{item.government_id_ref || item.license_number || item.certificate_id || 'Not provided'}</strong>
                                        </div>
                                        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>Works under company</p>
                                            <strong>{item.works_under_company ? 'Yes' : 'No'}</strong>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Bio / summary</p>
                                        <p style={{ margin: 0, lineHeight: 1.7 }}>{item.bio || profile?.bio || 'No summary provided.'}</p>
                                    </div>

                                    <div style={{ marginTop: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Reject reason for provider</p>
                                        <textarea
                                            value={verificationRejectReason[item.id] || ''}
                                            onChange={(e) => setVerificationRejectReason((current) => ({ ...current, [item.id]: e.target.value }))}
                                            placeholder="Explain what the provider needs to fix before approval."
                                            style={{ width: '100%', minHeight: '100px', resize: 'vertical', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', background: 'var(--surface-main)', fontFamily: 'inherit', fontSize: '0.92rem', color: 'var(--text-main)' }}
                                        />
                                        {item.rejection_reason && (
                                            <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                                                Current reason: {item.rejection_reason}
                                            </p>
                                        )}
                                    </div>

                                    {item.reviewed_at && (
                                        <p style={{ margin: '12px 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                                            Last reviewed {new Date(item.reviewed_at).toLocaleDateString()}
                                        </p>
                                    )}

                                    {item.status === 'rejected' && (
                                        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b45309', background: 'rgba(245, 158, 11, 0.12)', borderRadius: 'var(--radius-lg)', padding: '12px 14px' }}>
                                            <ShieldAlert size={18} />
                                            <span>Rejected applicants can resubmit directly from their account after addressing the review reason.</span>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </section>
                )}

                <section style={{ marginTop: '28px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <span style={{ display: 'inline-flex', padding: '7px 11px', borderRadius: '999px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                            Legacy Listing Review
                        </span>
                        <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Listing queue</h2>
                        <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '760px' }}>
                            Verified provider accounts now publish content instantly. This section is only for older listing rows that still remain in a manual review state.
                        </p>
                    </div>

                    {filteredListingQueue.length === 0 ? (
                        <section style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No legacy listing reviews are waiting. Newly created provider content should publish directly once the account is approved.</p>
                        </section>
                    ) : (
                        <section style={{ display: 'grid', gap: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '16px 18px', background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                        <input
                                            type="checkbox"
                                            checked={filteredListingQueue.length > 0 && filteredListingQueue.every((item) => selectedListingIds.includes(item.id))}
                                            onChange={toggleAllVisibleListings}
                                        />
                                        Select visible
                                    </label>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedListingIds.length} selected</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ borderRadius: '999px', padding: '10px 16px' }}
                                        disabled={selectedListingIds.length === 0 || bulkBusy === 'listing'}
                                        onClick={() => handleBulkListingReview('published')}
                                    >
                                        {bulkBusy === 'listing' ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                        Bulk Publish ({selectedListingIds.length})
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-soft"
                                        style={{ borderRadius: '999px', padding: '10px 16px' }}
                                        disabled={selectedListingIds.length === 0 || bulkBusy === 'listing'}
                                        onClick={requestBulkListingReject}
                                    >
                                        {bulkBusy === 'listing' ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                        Bulk Reject ({selectedListingIds.length})
                                    </button>
                                </div>
                            </div>
                            {bulkConfirmation?.target === 'listing' && (
                                <div style={{ padding: '16px 18px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div>
                                            <strong style={{ display: 'block', marginBottom: '6px' }}>Confirm bulk rejection</strong>
                                            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                                                You are about to reject {bulkConfirmation.count} listing{bulkConfirmation.count === 1 ? '' : 's'}.
                                                {bulkListingRejectReason.trim()
                                                    ? ' The shared reject reason will be applied to all selected listings.'
                                                    : ' If no shared reason is provided, each listing uses its own per-record reason if available.'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                className="btn btn-soft"
                                                style={{ borderRadius: '999px', padding: '10px 16px' }}
                                                disabled={bulkBusy === 'listing'}
                                                onClick={() => setBulkConfirmation(null)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                style={{ borderRadius: '999px', padding: '10px 16px' }}
                                                disabled={bulkBusy === 'listing'}
                                                onClick={async () => {
                                                    await handleBulkListingReview('rejected');
                                                    setBulkConfirmation(null);
                                                }}
                                            >
                                                {bulkBusy === 'listing' ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                                Confirm Reject ({bulkConfirmation.count})
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div style={{ padding: '16px 18px', background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}>
                                <label>
                                    <span style={{ display: 'block', marginBottom: '8px', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shared Bulk Reject Reason</span>
                                    <textarea
                                        value={bulkListingRejectReason}
                                        onChange={(e) => setBulkListingRejectReason(e.target.value)}
                                        placeholder="Optional shared reason for all selected listing rejections."
                                        style={{ width: '100%', minHeight: '90px', resize: 'vertical', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', background: 'var(--bg-main)', fontFamily: 'inherit', fontSize: '0.92rem', color: 'var(--text-main)' }}
                                    />
                                </label>
                            </div>
                            {filteredListingQueue.map((listing) => {
                                const isBusy = busyId === listing.id;
                                return (
                                    <article key={listing.id} style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '22px', boxShadow: 'var(--shadow-card)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedListingIds.includes(listing.id)}
                                                    onChange={() => toggleListingSelection(listing.id)}
                                                    style={{ marginTop: '6px' }}
                                                />
                                                <div>
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                                    <span style={{ padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                        {(listing.type === 'event' ? 'guide' : listing.type) || 'listing'}
                                                    </span>
                                                    <span style={{ padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'rgba(37, 99, 235, 0.1)', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                        {listing.status || 'pending'}
                                                    </span>
                                                </div>
                                                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{listing.title || listing.name || 'Untitled listing'}</h3>
                                                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>{listing.location || 'No location'} {typeof listing.price === 'number' ? `• Rs ${listing.price.toLocaleString()}` : ''}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleListingReview(listing.id, 'published')}
                                                    disabled={isBusy || listing.status === 'published'}
                                                    className="btn btn-primary"
                                                    style={{ borderRadius: '999px', padding: '10px 16px' }}
                                                >
                                                    {isBusy ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                                    Publish
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleListingReview(listing.id, 'rejected')}
                                                    disabled={isBusy || listing.status === 'rejected'}
                                                    className="btn btn-soft"
                                                    style={{ borderRadius: '999px', padding: '10px 16px' }}
                                                >
                                                    {isBusy ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Description</p>
                                            <p style={{ margin: 0, lineHeight: 1.7 }}>{listing.description || 'No description provided.'}</p>
                                        </div>
                                        <div style={{ marginTop: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Reject reason for provider</p>
                                            <textarea
                                                value={listingRejectReason[listing.id] || ''}
                                                onChange={(e) => setListingRejectReason((current) => ({ ...current, [listing.id]: e.target.value }))}
                                                placeholder="Explain what needs to change before this listing can be published."
                                                style={{ width: '100%', minHeight: '100px', resize: 'vertical', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', background: 'var(--surface-main)', fontFamily: 'inherit', fontSize: '0.92rem', color: 'var(--text-main)' }}
                                            />
                                            {listing.rejection_reason && (
                                                <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                                                    Current reason: {listing.rejection_reason}
                                                </p>
                                            )}
                                        </div>
                                        {listing.reviewed_at && (
                                            <p style={{ margin: '12px 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                                                Last reviewed {new Date(listing.reviewed_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </article>
                                );
                            })}
                        </section>
                    )}
                </section>
            </div>

                <style>{`
                    @media (max-width: 860px) {
                        .admin-stats-grid,
                    .admin-detail-grid,
                    .admin-filter-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
};
