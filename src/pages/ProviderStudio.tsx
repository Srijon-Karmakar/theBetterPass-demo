import React, { useEffect, useMemo, useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Compass,
    DollarSign,
    Edit3,
    FileText,
    Image,
    Loader2,
    MapPin,
    ShieldAlert,
    Sparkles,
    Tag,
    Type,
    Zap,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    createOrUpdateListing,
    getMyPosts,
    type ListingInput,
    type PostRecord,
} from '../lib/destinations';
import { LISTING_LABELS, getRoleLabel, type ListingType, canRolePublish } from '../lib/platform';
import './provider-studio.css';

const TYPE_META: Record<ListingType, { icon: React.ReactNode; description: string }> = {
    tour: { icon: <Compass size={22} />, description: 'Itinerary-led guided tour' },
    activity: { icon: <Zap size={22} />, description: 'Hands-on guided activity' },
    guide: { icon: <Calendar size={22} />, description: 'Date-based event listing' },
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

const getStatusDotClass = (status?: string | null) => {
    switch (status) {
        case 'published': return 'ps-status-dot ps-status-dot--published';
        case 'rejected': return 'ps-status-dot ps-status-dot--rejected';
        default: return 'ps-status-dot ps-status-dot--pending';
    }
};

const getStatusPillClass = (verificationStatus?: string | null) => {
    switch (verificationStatus) {
        case 'approved': return 'ps-status-pill ps-status-pill--approved';
        case 'rejected': return 'ps-status-pill ps-status-pill--rejected';
        default: return 'ps-status-pill ps-status-pill--pending';
    }
};

const getListingTitle = (listing: PostRecord) => listing.title || listing.name || 'Untitled listing';

const getPrimaryActionCopy = (type: ListingType) => {
    switch (type) {
        case 'tour': return 'Publish Tour';
        case 'activity': return 'Publish Activity';
        case 'guide': return 'Publish Event';
    }
};

export const ProviderStudio: React.FC = () => {
    const { user, profile, isProvider, verificationLabel } = useAuth();
    const [listings, setListings] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingListingId, setEditingListingId] = useState<string | null>(null);
    const [form, setForm] = useState<ListingInput>(EMPTY_FORM('tour'));
    const [imgError, setImgError] = useState(false);

    const allowedTypes = useMemo(
        () => (['tour', 'activity', 'guide'] as ListingType[]).filter((type) => canRolePublish(profile?.role, type)),
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

    if (!user || !isProvider) return <Navigate to="/dashboard" replace />;

    const resetForm = () => {
        setEditingListingId(null);
        setImgError(false);
        setForm(EMPTY_FORM(allowedTypes[0] || 'tour'));
    };

    const beginEdit = (listing: PostRecord) => {
        const listingType = (listing.type === 'event' ? 'guide' : listing.type || allowedTypes[0] || 'tour') as ListingType;
        setEditingListingId(listing.id);
        setImgError(false);
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
            const err = error as {
                error?: { code?: string; message?: string; details?: string | null; hint?: string | null };
                code?: string;
                message?: string;
                details?: string | null;
                hint?: string | null;
            };
            const normalized = err?.error && typeof err.error === 'object' ? err.error : err;
            const message = normalized?.message || 'Failed to submit listing. Please try again.';
            console.error('Failed to submit listing:', normalized);
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    const avatarInitial = (profile?.full_name || user.email || 'P')[0].toUpperCase();

    return (
        <main className="ps-page animate-fade">
            <div className="container" style={{ maxWidth: '1160px' }}>

                {/* Header */}
                <div className="ps-header">
                    <span className="ps-badge">
                        <Sparkles size={12} />
                        Provider Studio
                    </span>
                    <h1 className="ps-title">Your Posting Studio</h1>
                    <p className="ps-subtitle">
                        Publish tours, activities, and events directly to the live catalog — no queue, instant visibility.
                    </p>
                </div>

                {/* Account Status Bar */}
                <div className="ps-status-bar">
                    <div className="ps-status-bar-avatar">{avatarInitial}</div>
                    <div>
                        <p className="ps-status-bar-name">{profile?.full_name || user.email}</p>
                        <p className="ps-status-bar-role">{getRoleLabel(profile?.role)} account</p>
                    </div>
                    <div className="ps-status-bar-divider" />
                    <span className={getStatusPillClass(profile?.verification_status)}>
                        {verificationLabel}
                    </span>
                    {profile?.company_name && (
                        <>
                            <div className="ps-status-bar-divider" />
                            <span className="ps-status-bar-company">{profile.company_name}</span>
                        </>
                    )}
                </div>

                {/* Lock Banner */}
                {!canAccessStudio && (
                    <div className="ps-lock-banner">
                        <ShieldAlert size={20} />
                        <div>
                            <strong>Publishing unlocks after account approval</strong>
                            <p>Your account is set up. Live posting opens once verification is marked approved by admin.</p>
                        </div>
                    </div>
                )}

                {/* Quick-start capability chips */}
                {allowedTypes.length > 0 && (
                    <div className="ps-capability-strip">
                        {allowedTypes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                className="ps-capability-chip"
                                disabled={!canAccessStudio}
                                onClick={() => {
                                    setEditingListingId(null);
                                    setImgError(false);
                                    setForm({ ...EMPTY_FORM(type), type });
                                }}
                            >
                                {TYPE_META[type].icon}
                                New {LISTING_LABELS[type]}
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Grid */}
                <div className="ps-grid">

                    {/* ── Form Card ── */}
                    <article className="ps-card">
                        <div className="ps-card-head">
                            <div>
                                <span className="ps-card-label">
                                    <FileText size={11} />
                                    {editingListingId ? 'Editing' : 'Create Listing'}
                                </span>
                                <h2 className="ps-card-title">
                                    {editingListingId ? 'Edit live listing' : getPrimaryActionCopy(form.type)}
                                </h2>
                                <p className="ps-card-desc">
                                    Publishes directly into the live catalog — no moderation queue.
                                </p>
                            </div>
                            {editingListingId && (
                                <button type="button" className="ps-cancel-btn" onClick={resetForm}>
                                    Cancel edit
                                </button>
                            )}
                        </div>

                        {/* Type Picker */}
                        {allowedTypes.length > 1 && (
                            <div className="ps-type-picker">
                                {allowedTypes.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`ps-type-card${form.type === type ? ' ps-type-card--active' : ''}`}
                                        disabled={!canAccessStudio}
                                        onClick={() => setForm((f) => ({ ...f, type }))}
                                    >
                                        {TYPE_META[type].icon}
                                        <span>{LISTING_LABELS[type]}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="ps-form">
                            <label className="ps-field">
                                <span className="ps-field-label"><Type size={13} /> Title</span>
                                <input
                                    className="ps-input"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Sunrise Hike through Margalla Hills"
                                    disabled={!canAccessStudio}
                                    required
                                />
                            </label>

                            <div className="ps-two-up">
                                <label className="ps-field">
                                    <span className="ps-field-label"><MapPin size={13} /> Location</span>
                                    <input
                                        className="ps-input"
                                        value={form.location}
                                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                        placeholder="City, Country"
                                        disabled={!canAccessStudio}
                                        required
                                    />
                                </label>
                                <label className="ps-field">
                                    <span className="ps-field-label"><Tag size={13} /> Subcategory</span>
                                    <input
                                        className="ps-input"
                                        value={form.sub_category || ''}
                                        onChange={(e) => setForm((f) => ({ ...f, sub_category: e.target.value }))}
                                        placeholder="e.g. Hiking, Cooking class"
                                        disabled={!canAccessStudio}
                                    />
                                </label>
                            </div>

                            <label className="ps-field">
                                <span className="ps-field-label"><Image size={13} /> Cover Image URL</span>
                                <input
                                    className="ps-input"
                                    value={form.image_url}
                                    onChange={(e) => {
                                        setImgError(false);
                                        setForm((f) => ({ ...f, image_url: e.target.value }));
                                    }}
                                    placeholder="https://..."
                                    disabled={!canAccessStudio}
                                    required
                                />
                                <div className="ps-image-preview">
                                    {form.image_url && !imgError ? (
                                        <img
                                            src={form.image_url}
                                            alt="Cover preview"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="ps-image-placeholder">
                                            <Image size={26} />
                                            <span>{imgError ? 'Could not load image' : 'Preview will appear here'}</span>
                                        </div>
                                    )}
                                </div>
                            </label>

                            <div className="ps-two-up">
                                <label className="ps-field">
                                    <span className="ps-field-label"><DollarSign size={13} /> Price (Rs)</span>
                                    <input
                                        className="ps-input"
                                        type="number"
                                        min="0"
                                        value={typeof form.price === 'number' ? form.price : ''}
                                        onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || null }))}
                                        placeholder="0"
                                        disabled={!canAccessStudio}
                                    />
                                </label>
                                <label className="ps-field">
                                    <span className="ps-field-label"><Clock size={13} /> Start Date</span>
                                    <input
                                        className="ps-input"
                                        type="date"
                                        value={form.starts_at || ''}
                                        onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                                        disabled={!canAccessStudio}
                                    />
                                </label>
                            </div>

                            <label className="ps-field">
                                <span className="ps-field-label">Description</span>
                                <textarea
                                    className="ps-textarea"
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Describe the experience, what's included, meeting point..."
                                    disabled={!canAccessStudio}
                                    required
                                />
                            </label>

                            <button type="submit" className="ps-submit" disabled={!canAccessStudio || saving}>
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {editingListingId ? 'Update Listing' : getPrimaryActionCopy(form.type)}
                            </button>
                        </form>
                    </article>

                    {/* ── Inventory Card ── */}
                    <article className="ps-card">
                        <div className="ps-card-head">
                            <div>
                                <span className="ps-card-label">
                                    <Sparkles size={11} />
                                    Live Inventory
                                </span>
                                <h2 className="ps-card-title">Your listings</h2>
                                <p className="ps-card-desc">
                                    {listings.length > 0
                                        ? `${listings.length} listing${listings.length === 1 ? '' : 's'} live in the catalog`
                                        : 'Nothing published yet'}
                                </p>
                            </div>
                            <Link to="/dashboard" className="ps-inventory-link">
                                View dashboard →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="ps-loading">
                                <Loader2 className="animate-spin" size={28} />
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="ps-listing-grid">
                                {listings.slice(0, 15).map((listing) => {
                                    const listingType = ((listing.type === 'event' ? 'guide' : listing.type) as ListingType) || form.type;
                                    const thumb = listing.image_url || listing.cover_image_url || listing.thumbnail_url;
                                    return (
                                        <div key={listing.id} className="ps-listing-card">
                                            <div className="ps-listing-thumb">
                                                {thumb ? (
                                                    <img src={thumb} alt={getListingTitle(listing)} />
                                                ) : (
                                                    TYPE_META[listingType]?.icon ?? <Sparkles size={20} />
                                                )}
                                            </div>
                                            <div className="ps-listing-body">
                                                <div className="ps-listing-top">
                                                    <span className="ps-listing-name">{getListingTitle(listing)}</span>
                                                    <button
                                                        type="button"
                                                        className="ps-edit-btn"
                                                        onClick={() => beginEdit(listing)}
                                                        disabled={!canAccessStudio}
                                                    >
                                                        <Edit3 size={12} /> Edit
                                                    </button>
                                                </div>
                                                <p className="ps-listing-loc">
                                                    <MapPin size={11} />
                                                    {listing.location || 'No location'}
                                                </p>
                                                <div className="ps-listing-footer">
                                                    <span className="ps-type-pill">{LISTING_LABELS[listingType] || 'Listing'}</span>
                                                    <span className={getStatusDotClass(listing.status)}>
                                                        {listing.status || 'published'}
                                                    </span>
                                                    {typeof listing.price === 'number' && (
                                                        <span className="ps-price">Rs {listing.price.toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="ps-empty">
                                <Sparkles size={26} />
                                <strong>No listings yet</strong>
                                <p>
                                    Create your first {allowedTypes[0] ? LISTING_LABELS[allowedTypes[0]].toLowerCase() : 'listing'} — it appears here instantly after publishing.
                                </p>
                            </div>
                        )}
                    </article>
                </div>
            </div>
        </main>
    );
};
