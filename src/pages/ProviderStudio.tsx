import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit3, FilePlus2, Loader2, MapPin, ShieldAlert, Sparkles } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    createOrUpdateListing,
    getMyPosts,
    type ListingInput,
    type PostRecord,
} from '../lib/destinations';
import { LISTING_LABELS, getRoleLabel, type ListingType, canRolePublish } from '../lib/platform';
import './provider-studio.css';

const INPUT_STYLE: React.CSSProperties = {
    width: '100%',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    background: 'var(--bg-main)',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    color: 'var(--text-main)',
};

const EMPTY_FORM = (type: ListingType): ListingInput => ({
    title: '',
    description: '',
    location: '',
    image_url: '',
    type,
    sub_category: '',
    price: null,
    starts_at: '',
    status: 'published',
});

const getListingTone = (status?: string | null) => {
    switch (status) {
        case 'published':
            return { bg: 'rgba(34, 197, 94, 0.1)', color: '#15803d' };
        case 'rejected':
            return { bg: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c' };
        default:
            return { bg: 'rgba(37, 99, 235, 0.1)', color: '#1d4ed8' };
    }
};

const getListingTitle = (listing: PostRecord) => listing.title || listing.name || 'Untitled listing';

const getPrimaryActionCopy = (type: ListingType) => {
    switch (type) {
        case 'tour':
            return 'Publish tour';
        case 'activity':
            return 'Publish activity';
        case 'event':
            return 'Publish event';
    }
};

const getSingularListingLabel = (type: ListingType) => {
    switch (type) {
        case 'tour':
            return 'Tour';
        case 'activity':
            return 'Activity';
        case 'event':
            return 'Event';
    }
};

export const ProviderStudio: React.FC = () => {
    const { user, profile, isProvider, verificationLabel } = useAuth();
    const [listings, setListings] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingListingId, setEditingListingId] = useState<string | null>(null);
    const [form, setForm] = useState<ListingInput>(EMPTY_FORM('tour'));

    const allowedTypes = useMemo(
        () => (['tour', 'activity', 'event'] as ListingType[]).filter((type) => canRolePublish(profile?.role, type)),
        [profile?.role]
    );
    const canAccessStudio = isProvider && profile?.verification_status === 'approved' && allowedTypes.length > 0;

    const loadListings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const rows = await getMyPosts(user.id);
            setListings(rows);
            if (allowedTypes.length > 0) {
                setForm((current) => ({
                    ...current,
                    type: allowedTypes.includes(current.type) ? current.type : allowedTypes[0],
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !isProvider) return;
        void loadListings();
    }, [allowedTypes, isProvider, user]);

    if (!user || !isProvider) {
        return <Navigate to="/dashboard" replace />;
    }

    const resetForm = () => {
        setEditingListingId(null);
        setForm(EMPTY_FORM(allowedTypes[0] || 'tour'));
    };

    const beginEdit = (listing: PostRecord) => {
        const listingType = (listing.type || allowedTypes[0] || 'tour') as ListingType;
        setEditingListingId(listing.id);
        setForm({
            id: listing.id,
            user_id: listing.user_id,
            provider_user_id: listing.provider_user_id,
            company_profile_id: listing.company_profile_id,
            title: getListingTitle(listing),
            description: listing.description || '',
            location: listing.location || '',
            image_url: listing.image_url || listing.cover_image_url || listing.thumbnail_url || '',
            type: listingType,
            sub_category: listing.sub_category || '',
            price: typeof listing.price === 'number' ? listing.price : null,
            starts_at: listing.starts_at || '',
            status: 'published',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canAccessStudio) return;

        setSaving(true);
        try {
            await createOrUpdateListing({
                ...form,
                id: editingListingId || form.id,
                provider_user_id: user.id,
                user_id: user.id,
                company_profile_id: profile?.company_profile_id || null,
                status: 'published',
                rejection_reason: null,
                price: typeof form.price === 'number' ? form.price : Number(form.price || 0) || null,
                starts_at: form.starts_at || null,
            });
            await loadListings();
            resetForm();
        } catch (error) {
            console.error('Failed to publish listing:', error);
            alert('Failed to publish listing. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="provider-studio-page animate-fade">
            <div className="container provider-studio-shell">
                <section className="provider-studio-hero">
                    <div className="provider-studio-hero-copy">
                        <span className="provider-studio-kicker">Provider Studio</span>
                        <h1>Role-based publishing for live tours, activities, and events.</h1>
                        <p>
                            Verified providers publish directly to the live catalog. Account approval stays in admin review,
                            but listing publishing is instant once your provider account is approved.
                        </p>
                    </div>
                    <aside className="provider-studio-status-card">
                        <span className="provider-studio-mini-label">Account Snapshot</span>
                        <strong>{profile?.full_name || user.email}</strong>
                        <p>{getRoleLabel(profile?.role)} account</p>
                        <div className="provider-studio-status-grid">
                            <div>
                                <span>Status</span>
                                <strong>{verificationLabel}</strong>
                            </div>
                            <div>
                                <span>Company</span>
                                <strong>{profile?.company_name || 'Independent'}</strong>
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="provider-studio-capabilities">
                    {allowedTypes.map((type) => (
                        <article key={type} className="provider-studio-capability-card">
                            <span className="provider-studio-card-eyebrow">{LISTING_LABELS[type]}</span>
                            <h2>{getPrimaryActionCopy(type)}</h2>
                            <p>
                                {type === 'tour'
                                    ? 'Create itinerary-led tours with title, location, pricing, cover image, and launch timing.'
                                    : type === 'activity'
                                        ? 'Publish guided activities with immediate visibility after account verification.'
                                        : 'Launch events with date-aware availability and instant public listing visibility.'}
                            </p>
                            <button
                                type="button"
                                className="btn btn-soft provider-studio-chip-button"
                                disabled={!canAccessStudio}
                                onClick={() => setForm({ ...EMPTY_FORM(type), type })}
                            >
                                <FilePlus2 size={16} />
                                New {getSingularListingLabel(type)}
                            </button>
                        </article>
                    ))}
                </section>

                {!canAccessStudio && (
                    <section className="provider-studio-lock-card">
                        <ShieldAlert size={20} />
                        <div>
                            <strong>Publishing unlocks after account approval</strong>
                            <p>
                                Your provider account can sign in and view its role setup now. Live posting opens only when
                                account verification is marked approved by admin.
                            </p>
                        </div>
                    </section>
                )}

                <section className="provider-studio-grid">
                    <article className="provider-studio-form-card">
                        <div className="provider-studio-card-head">
                            <div>
                                <span className="provider-studio-card-eyebrow">Create Live Listing</span>
                                <h2>{editingListingId ? 'Edit live listing' : getPrimaryActionCopy(form.type)}</h2>
                                <p>
                                    This form publishes directly into the live catalog. It does not enter a listing moderation queue.
                                </p>
                            </div>
                            {editingListingId && (
                                <button type="button" className="btn btn-soft provider-studio-chip-button" onClick={resetForm}>
                                    Cancel edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="provider-studio-form">
                            <label className="provider-studio-field">
                                <span>Listing Type</span>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm((current) => ({ ...current, type: e.target.value as ListingType }))}
                                    style={INPUT_STYLE}
                                    disabled={!canAccessStudio}
                                >
                                    {allowedTypes.map((type) => (
                                        <option key={type} value={type}>{LISTING_LABELS[type]}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="provider-studio-field">
                                <span>Title</span>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                                    style={INPUT_STYLE}
                                    disabled={!canAccessStudio}
                                    required
                                />
                            </label>

                            <div className="provider-studio-two-up">
                                <label className="provider-studio-field">
                                    <span>Location</span>
                                    <input
                                        value={form.location}
                                        onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                                        style={INPUT_STYLE}
                                        disabled={!canAccessStudio}
                                        required
                                    />
                                </label>

                                <label className="provider-studio-field">
                                    <span>Subcategory</span>
                                    <input
                                        value={form.sub_category || ''}
                                        onChange={(e) => setForm((current) => ({ ...current, sub_category: e.target.value }))}
                                        style={INPUT_STYLE}
                                        disabled={!canAccessStudio}
                                    />
                                </label>
                            </div>

                            <label className="provider-studio-field">
                                <span>Image URL</span>
                                <input
                                    value={form.image_url}
                                    onChange={(e) => setForm((current) => ({ ...current, image_url: e.target.value }))}
                                    style={INPUT_STYLE}
                                    disabled={!canAccessStudio}
                                    required
                                />
                            </label>

                            <div className="provider-studio-two-up">
                                <label className="provider-studio-field">
                                    <span>Price</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={typeof form.price === 'number' ? form.price : ''}
                                        onChange={(e) => setForm((current) => ({ ...current, price: Number(e.target.value) || null }))}
                                        style={INPUT_STYLE}
                                        disabled={!canAccessStudio}
                                    />
                                </label>

                                <label className="provider-studio-field">
                                    <span>Start Date</span>
                                    <input
                                        type="date"
                                        value={form.starts_at || ''}
                                        onChange={(e) => setForm((current) => ({ ...current, starts_at: e.target.value }))}
                                        style={INPUT_STYLE}
                                        disabled={!canAccessStudio}
                                    />
                                </label>
                            </div>

                            <label className="provider-studio-field">
                                <span>Description</span>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                                    style={{ ...INPUT_STYLE, minHeight: '160px', resize: 'vertical' }}
                                    disabled={!canAccessStudio}
                                    required
                                />
                            </label>

                            <button
                                type="submit"
                                className="btn btn-primary provider-studio-submit"
                                disabled={!canAccessStudio || saving}
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {editingListingId ? 'Update live listing' : getPrimaryActionCopy(form.type)}
                            </button>
                        </form>
                    </article>

                    <article className="provider-studio-inventory-card">
                        <div className="provider-studio-card-head">
                            <div>
                                <span className="provider-studio-card-eyebrow">Live Inventory</span>
                                <h2>Your published listings</h2>
                                <p>Everything here is already visible in the shared catalog once published.</p>
                            </div>
                            <Link to="/dashboard" className="provider-studio-inline-link">
                                View dashboard
                            </Link>
                        </div>

                        {loading ? (
                            <div className="provider-studio-loading">
                                <Loader2 className="animate-spin" size={30} />
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="provider-studio-list">
                                {listings.slice(0, 12).map((listing) => {
                                    const tone = getListingTone(listing.status);
                                    return (
                                        <article key={listing.id} className="provider-studio-listing-card">
                                            <div className="provider-studio-listing-head">
                                                <div>
                                                    <strong>{getListingTitle(listing)}</strong>
                                                    <p>
                                                        <MapPin size={14} />
                                                        {listing.location || 'No location'}
                                                    </p>
                                                </div>
                                                <span
                                                    className="provider-studio-status-pill"
                                                    style={{ background: tone.bg, color: tone.color }}
                                                >
                                                    {listing.status || 'published'}
                                                </span>
                                            </div>
                                            <div className="provider-studio-listing-meta">
                                                <span>{LISTING_LABELS[(listing.type as ListingType) || form.type] || 'Listing'}</span>
                                                <span>{typeof listing.price === 'number' ? `Rs ${listing.price.toLocaleString()}` : 'Custom pricing'}</span>
                                            </div>
                                            <div className="provider-studio-listing-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-soft provider-studio-chip-button"
                                                    onClick={() => beginEdit(listing)}
                                                    disabled={!canAccessStudio}
                                                >
                                                    <Edit3 size={16} />
                                                    Edit
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="provider-studio-empty">
                                <Sparkles size={22} />
                                <strong>No live listings yet</strong>
                                <p>
                                    Start with a {allowedTypes[0] ? LISTING_LABELS[allowedTypes[0]].toLowerCase() : 'listing'} and it
                                    will appear here as soon as you publish it.
                                </p>
                            </div>
                        )}
                    </article>
                </section>
            </div>
        </main>
    );
};
