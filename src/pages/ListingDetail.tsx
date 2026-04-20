import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2, MapPin, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    createBooking,
    getListingById,
    getOrCreateConversation,
    type PostRecord,
} from '../lib/destinations';
import type { ListingType } from '../lib/platform';
import './listing-detail.css';

const toInternalListingType = (value: string | undefined): ListingType | undefined => {
    if (value === 'event') return 'guide';
    if (value === 'tour' || value === 'activity' || value === 'guide') return value;
    return undefined;
};

const getListingTitle = (listing: PostRecord): string => {
    const title = listing.title || listing.name;
    return typeof title === 'string' && title.trim().length > 0 ? title : 'Untitled listing';
};

const getListingImage = (listing: PostRecord): string => (
    listing.image_url
    || listing.cover_image_url
    || listing.thumbnail_url
    || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200'
);

export const ListingDetail: React.FC = () => {
    const { id, type } = useParams<{ id: string; type?: string }>();
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [checkIn, setCheckIn] = useState('');
    const [guests, setGuests] = useState(1);
    const [listing, setListing] = useState<PostRecord | null>(null);

    const listingType = toInternalListingType(type);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setLoading(true);
            try {
                const row = await getListingById(id, listingType);
                setListing(row);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [id, listingType]);

    const title = listing ? getListingTitle(listing) : '';
    const image = listing ? getListingImage(listing) : '';
    const description = typeof listing?.description === 'string' ? listing.description : 'No description provided yet.';
    const location = typeof listing?.location === 'string' ? listing.location : 'Location available after booking';
    const unitPrice = typeof listing?.price === 'number' ? listing.price : 0;
    const ownerUserId = typeof listing?.provider_user_id === 'string'
        ? listing.provider_user_id
        : typeof listing?.user_id === 'string'
            ? listing.user_id
            : null;
    const listingTypeValue = listing?.type;
    const effectiveType: ListingType = toInternalListingType(listingTypeValue || undefined)
        ? (toInternalListingType(listingTypeValue || undefined) as ListingType)
        : (listingType || 'activity');
    const displayType = effectiveType === 'guide' ? 'event' : effectiveType;
    const total = useMemo(() => unitPrice * guests, [guests, unitPrice]);
    const canBook = profile?.role === 'tourist';

    const handleBooking = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user || !listing?.id) {
            navigate('/auth');
            return;
        }
        if (!canBook) {
            alert('Only tourist accounts can place bookings.');
            return;
        }

        setBookingLoading(true);
        try {
            await createBooking({
                user_id: user.id,
                listing_id: listing.id,
                listing_type: effectiveType,
                provider_user_id: ownerUserId,
                listing_title: title,
                listing_image: image,
                number_of_people: guests,
                unit_price: unitPrice,
                total_price: total,
                status: 'confirmed',
                booking_date: checkIn || null,
            });
            setBookingSuccess(true);
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!user || !ownerUserId || ownerUserId === user.id) return;
        setMessageLoading(true);
        try {
            const conversation = await getOrCreateConversation(user.id, ownerUserId);
            navigate(`/messages?conversation=${conversation.id}`);
        } catch (error) {
            console.error('Conversation start failed:', error);
            alert('Could not start chat. Check conversation policies in Supabase.');
        } finally {
            setMessageLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', paddingTop: '120px' }}>
                <Loader2 className="animate-spin" size={38} />
            </main>
        );
    }

    if (!listing) {
        return (
            <main className="container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', paddingTop: '120px' }}>
                <h2>Listing not found.</h2>
            </main>
        );
    }

    return (
        <main className="listing-detail-page">
            <div className="container listing-detail-shell">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="listing-detail-back"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="listing-detail-grid">
                    <section className="listing-detail-card">
                        <div className="listing-detail-hero-image" style={{ backgroundImage: `url(${image})` }} />
                        <div className="listing-detail-content">
                            <div className="listing-detail-meta-row">
                                <span className="listing-detail-type-pill">{displayType}</span>
                                <span className="listing-detail-location-chip">
                                    <MapPin size={14} /> {location}
                                </span>
                            </div>
                            <h1 className="listing-detail-title">{title}</h1>
                            <p className="listing-detail-description">{description}</p>
                            {ownerUserId && (
                                <div className="listing-detail-actions">
                                    <Link to={`/users/${ownerUserId}`} className="btn btn-secondary listing-detail-pill-btn">
                                        View Host
                                    </Link>
                                    {user && ownerUserId !== user.id && (
                                        <button type="button" onClick={handleMessage} className="btn btn-secondary listing-detail-pill-btn" disabled={messageLoading}>
                                            {messageLoading ? <Loader2 className="animate-spin" size={16} /> : <MessageCircle size={16} />}
                                            Message
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="listing-book-card">
                        {bookingSuccess ? (
                            <div className="listing-book-success">
                                <h3>Booking confirmed</h3>
                                <p>Your spot is reserved for this listing.</p>
                                <Link to="/profile" className="btn btn-primary listing-detail-pill-btn listing-detail-center-btn">
                                    View My Bookings
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleBooking} className="listing-book-form">
                                <div className="listing-book-head">
                                    <h3>Reserve</h3>
                                    <strong>Rs {unitPrice.toLocaleString()}</strong>
                                </div>

                                <label className="listing-book-field">
                                    <span>Date</span>
                                    <span className="listing-book-input-wrap">
                                        <Calendar size={16} />
                                        <input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required type="date" />
                                    </span>
                                </label>

                                <label className="listing-book-field">
                                    <span>Travelers</span>
                                    <span className="listing-book-input-wrap">
                                        <Users size={16} />
                                        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                                            {[1, 2, 3, 4, 5, 6].map((count) => (
                                                <option key={count} value={count}>{count}</option>
                                            ))}
                                        </select>
                                    </span>
                                </label>

                                <div className="listing-book-total">
                                    <span>Total</span>
                                    <strong>Rs {total.toLocaleString()}</strong>
                                </div>

                                {!canBook && (
                                    <p className="listing-book-warning">
                                        Only tourist accounts can place bookings.
                                    </p>
                                )}

                                <button className="btn btn-primary listing-detail-pill-btn listing-detail-center-btn" type="submit" disabled={bookingLoading || !canBook}>
                                    {bookingLoading ? <Loader2 className="animate-spin" size={18} /> : 'Book Now'}
                                </button>

                                <p className="listing-book-security">
                                    <ShieldCheck size={14} /> Secure booking, no hidden charges.
                                </p>
                            </form>
                        )}
                    </aside>
                </div>
            </div>
        </main>
    );
};
