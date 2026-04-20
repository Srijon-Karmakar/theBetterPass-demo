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

const isListingType = (value: string | undefined): value is ListingType => (
    value === 'tour' || value === 'activity' || value === 'event'
);

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
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [checkIn, setCheckIn] = useState('');
    const [guests, setGuests] = useState(1);
    const [listing, setListing] = useState<PostRecord | null>(null);

    const listingType = isListingType(type) ? type : undefined;

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
    const effectiveType: ListingType = isListingType(listingTypeValue || undefined)
        ? (listingTypeValue as ListingType)
        : (listingType || 'activity');
    const total = useMemo(() => unitPrice * guests, [guests, unitPrice]);

    const handleBooking = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user || !listing?.id) {
            navigate('/auth');
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
        <main style={{ background: 'var(--bg-main)', paddingTop: '128px', paddingBottom: '90px' }}>
            <div className="container" style={{ display: 'grid', gap: '26px' }}>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    style={{ border: 'none', background: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '22px' }} className="listing-detail-grid">
                    <section style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: '24px', overflow: 'hidden' }}>
                        <div style={{ width: '100%', aspectRatio: '16/9', backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <div style={{ padding: '20px 22px 24px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                                <span style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-light)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', padding: '5px 11px', textTransform: 'uppercase' }}>{effectiveType}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    <MapPin size={14} /> {location}
                                </span>
                            </div>
                            <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontFamily: 'Outfit, sans-serif' }}>{title}</h1>
                            <p style={{ marginTop: '12px', color: 'var(--text-muted)', lineHeight: 1.75 }}>{description}</p>
                            {ownerUserId && (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                                    <Link to={`/users/${ownerUserId}`} className="btn btn-secondary" style={{ borderRadius: '999px' }}>
                                        View Host
                                    </Link>
                                    {user && ownerUserId !== user.id && (
                                        <button type="button" onClick={handleMessage} className="btn btn-secondary" disabled={messageLoading} style={{ borderRadius: '999px' }}>
                                            {messageLoading ? <Loader2 className="animate-spin" size={16} /> : <MessageCircle size={16} />}
                                            Message
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <aside style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: '20px' }}>
                        {bookingSuccess ? (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <h3 style={{ margin: 0 }}>Booking confirmed</h3>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Your spot is reserved for this listing.</p>
                                <Link to="/profile" className="btn btn-primary" style={{ justifyContent: 'center', borderRadius: '999px' }}>
                                    View My Bookings
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleBooking} style={{ display: 'grid', gap: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <h3 style={{ margin: 0 }}>Reserve</h3>
                                    <strong style={{ color: 'var(--accent)', fontSize: '1.6rem' }}>Rs {unitPrice.toLocaleString()}</strong>
                                </div>

                                <label style={{ display: 'grid', gap: '7px' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px 12px' }}>
                                        <Calendar size={16} />
                                        <input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required type="date" style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontFamily: 'inherit' }} />
                                    </span>
                                </label>

                                <label style={{ display: 'grid', gap: '7px' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Travelers</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px 12px' }}>
                                        <Users size={16} />
                                        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontFamily: 'inherit' }}>
                                            {[1, 2, 3, 4, 5, 6].map((count) => (
                                                <option key={count} value={count}>{count}</option>
                                            ))}
                                        </select>
                                    </span>
                                </label>

                                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Total</span>
                                    <strong>Rs {total.toLocaleString()}</strong>
                                </div>

                                <button className="btn btn-primary" type="submit" disabled={bookingLoading} style={{ justifyContent: 'center', borderRadius: '999px' }}>
                                    {bookingLoading ? <Loader2 className="animate-spin" size={18} /> : 'Book Now'}
                                </button>

                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                    <ShieldCheck size={14} /> Secure booking, no hidden charges.
                                </p>
                            </form>
                        )}
                    </aside>
                </div>
            </div>

            <style>{`
              @media (max-width: 960px) {
                .listing-detail-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
        </main>
    );
};
