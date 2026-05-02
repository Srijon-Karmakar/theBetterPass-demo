import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    Upload,
    Zap,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
    createOrUpdateListing,
    getMyPosts,
    type ListingInput,
    type PostRecord,
} from '../lib/destinations';
import { LISTING_LABELS, getRoleLabel, type ListingType, canRolePublish } from '../lib/platform';
import './provider-studio.css';

const LISTING_IMAGE_BUCKET = 'avatars';
const MAX_LISTING_IMAGE_MB = 8;

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
    status: 'pending',
});

const getStatusDotClass = (status?: string | null) => {
    switch (status) {
        case 'live':
        case 'published':
            return 'ps-status-dot ps-status-dot--live';
        case 'approved':
            return 'ps-status-dot ps-status-dot--approved';
        case 'rejected': return 'ps-status-dot ps-status-dot--rejected';
        default: return 'ps-status-dot ps-status-dot--pending';
    }
};

const getListingStatusLabel = (status?: string | null) => {
    if (status === 'published') return 'live';
    return status || 'pending';
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
        case 'tour': return 'Submit Tour';
        case 'activity': return 'Submit Activity';
        case 'guide': return 'Submit Event';
    }
};

export const ProviderStudio: React.FC = () => {
    const { user, profile, isProvider, verificationLabel } = useAuth();
    const [listings, setListings] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editingListingId, setEditingListingId] = useState<string | null>(null);
    const [form, setForm] = useState<ListingInput>(EMPTY_FORM('tour'));
    const [imgError, setImgError] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const allowedTypes = useMemo(
        () => (['tour', 'activity', 'guide'] as ListingType[]).filter((type) => canRolePublish(profile?.role, type)),
        [profile?.role]
    );
    const canAccessStudio = isProvider && allowedTypes.length > 0;

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
            status: (listing.status as ListingInput['status']) || 'pending',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canAccessStudio || uploadingImage) return;
        setSaving(true);
        try {
            await createOrUpdateListing({
                ...form,
                id: editingListingId || form.id,
                provider_user_id: user.id,
                user_id: user.id,
                company_profile_id: profile?.company_profile_id || null,
                status: 'pending',
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

    const uploadListingImage = async (file: File): Promise<string> => {
        if (!user) throw new Error('You must be logged in to upload an image.');
        const ext = file.name.split('.').pop() || 'jpg';
        const safeType = form.type || 'tour';
        const path = `${user.id}/listing-${safeType}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from(LISTING_IMAGE_BUCKET)
            .upload(path, file, { upsert: true, contentType: file.type });
        if (error) throw error;
        const { data } = supabase.storage.from(LISTING_IMAGE_BUCKET).getPublicUrl(path);
        return `${data.publicUrl}?t=${Date.now()}`;
    };

    const handleListingImageUpload = async (file: File) => {
        if (!canAccessStudio || !user) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }
        if (file.size > MAX_LISTING_IMAGE_MB * 1024 * 1024) {
            alert(`Image is too large. Max allowed size is ${MAX_LISTING_IMAGE_MB}MB.`);
            return;
        }
        setUploadingImage(true);
        try {
            const uploadedUrl = await uploadListingImage(file);
            setImgError(false);
            setForm((current) => ({ ...current, image_url: uploadedUrl }));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error || '');
            console.error('Failed to upload listing image:', error);
            if (message.toLowerCase().includes('bucket')) {
                alert('Image upload failed: storage bucket is missing. Please run docs/supabase-role-system.sql.');
            } else if (message.toLowerCase().includes('row-level security') || message.toLowerCase().includes('policy')) {
                alert('Image upload blocked by Supabase policy. Please run docs/supabase-role-system.sql.');
            } else {
                alert(message || 'Failed to upload image. Please try again.');
            }
        } finally {
            setUploadingImage(false);
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
                        Submit tours, activities, and events for admin review, then track each post until it goes live.
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
                            <strong>Provider publishing is not available for this role</strong>
                            <p>Your current role cannot create tours, activities, or events.</p>
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
                                    {editingListingId ? 'Update listing for review' : getPrimaryActionCopy(form.type)}
                                </h2>
                                <p className="ps-card-desc">
                                    New and edited listings are sent to admin moderation before they go live.
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
                                <div className="ps-image-upload-row">
                                    <button
                                        type="button"
                                        className="ps-upload-btn"
                                        disabled={!canAccessStudio || uploadingImage}
                                        onClick={() => imageInputRef.current?.click()}
                                    >
                                        {uploadingImage ? (
                                            <>
                                                <Loader2 className="animate-spin" size={14} />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={14} />
                                                Upload from device
                                            </>
                                        )}
                                    </button>
                                    <span className="ps-upload-hint">JPG, PNG, WEBP (max {MAX_LISTING_IMAGE_MB}MB)</span>
                                </div>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="ps-file-input"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) void handleListingImageUpload(file);
                                        e.target.value = '';
                                    }}
                                    disabled={!canAccessStudio || uploadingImage}
                                />
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
                                {editingListingId ? 'Update & Re-submit' : getPrimaryActionCopy(form.type)}
                            </button>
                        </form>
                    </article>

                    {/* ── Inventory Card ── */}
                    <article className="ps-card">
                        <div className="ps-card-head">
                            <div>
                                <span className="ps-card-label">
                                    <Sparkles size={11} />
                                    Posting History
                                </span>
                                <h2 className="ps-card-title">Your listings</h2>
                                <p className="ps-card-desc">
                                    {listings.length > 0
                                        ? `${listings.length} listing${listings.length === 1 ? '' : 's'} submitted`
                                        : 'No posts yet'}
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
                                                        {getListingStatusLabel(listing.status)}
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
                                    Create your first {allowedTypes[0] ? LISTING_LABELS[allowedTypes[0]].toLowerCase() : 'listing'} and track pending, approved, live, or rejected states here.
                                </p>
                            </div>
                        )}
                    </article>
                </div>
            </div>
        </main>
    );
};
