import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Destination } from '../lib/destinations';
import { getDestinationById, createBooking } from '../lib/destinations';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Users, Calendar, ArrowLeft, ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const DestinationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Booking Form State
    const [checkIn, setCheckIn] = useState('');
    const [guests, setGuests] = useState(1);

    useEffect(() => {
        if (id) {
            getDestinationById(id).then(data => {
                setDestination(data);
                setLoading(false);
            });
        }
    }, [id]);

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            navigate('/auth');
            return;
        }
        if (!destination) return;

        setBookingLoading(true);
        try {
            await createBooking({
                user_id: user.id,
                activity_id: destination.id,
                number_of_people: guests,
                price: destination.price,
                total_price: destination.price * guests,
                status: 'confirmed'
            });
            setBookingSuccess(true);
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-main)' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
    );

    if (!destination) return (
        <div className="flex h-screen items-center justify-center">
            <h2 className="animate-fade">Destination not found</h2>
        </div>
    );

    return (
        <main style={{ backgroundColor: 'var(--bg-main)', paddingTop: '160px', paddingBottom: '120px' }} className="animate-fade">
            <div className="container">
                <div className="grid grid-cols-2 gap-24 items-start responsive-detail-grid">
                    {/* Left: Image & Info */}
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2"
                            style={{ marginBottom: '2rem', fontWeight: 600, color: 'var(--text-muted)', border: 'none', background: 'none' }}
                        >
                            <ArrowLeft size={18} /> Back
                        </button>

                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', marginBottom: '3rem' }} className="detail-image-box">
                            <img src={destination.image_url} alt={destination.title} className="img-cover" />
                        </div>

                        <div style={{ marginBottom: '4rem' }} className="detail-text-content">
                            <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{destination.category}</span>
                                <div style={{ width: '1px', height: '12px', background: 'var(--border-light)' }}></div>
                                <div className="flex items-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <MapPin size={14} /> {destination.location}
                                </div>
                            </div>
                            <h1 className="h1" style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>{destination.title}</h1>
                            <p className="text-lead" style={{ lineHeight: '1.8', fontSize: '1.2rem', color: 'var(--text-main)' }}>{destination.description}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-6 responsive-stats">
                            {[
                                { icon: <Clock size={20} />, label: 'Duration', value: 'Flexible' },
                                { icon: <Users size={20} />, label: 'Capacity', value: '12 People' },
                                { icon: <Sparkles size={20} />, label: 'Rating', value: destination.rating || '4.9' }
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '1.5rem', background: 'var(--surface-main)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-subtle)' }}>
                                    <div style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>{item.icon}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '0.25rem' }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Booking Soft UI Card */}
                    <div className="sticky-booking" style={{ position: 'sticky', top: '160px' }}>
                        <div style={{ background: 'var(--surface-main)', padding: '3.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)' }} className="booking-card">
                            {bookingSuccess ? (
                                <div className="text-center animate-fade">
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="h3" style={{ marginBottom: '1rem' }}>Success!</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your booking for {destination.title} is confirmed. Check your email for details.</p>
                                    <button onClick={() => navigate('/activities')} className="btn btn-primary" style={{ width: '100%', borderRadius: 'var(--radius-full)', justifyContent: 'center' }}>Explore More</button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start" style={{ marginBottom: '2.5rem' }}>
                                        <div>
                                            <h3 className="h3">Reserve Now</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Secure your experience</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>₹{destination.price?.toLocaleString()}</span>
                                            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Per Person</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleBooking} className="flex flex-col gap-6">
                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'block' }}>Start Date</label>
                                            <div className="flex items-center gap-3" style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                                <Calendar size={18} color="var(--text-muted)" />
                                                <input
                                                    type="date"
                                                    required
                                                    value={checkIn}
                                                    onChange={(e) => setCheckIn(e.target.value)}
                                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, fontFamily: 'inherit' }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'block' }}>Guests</label>
                                            <div className="flex items-center gap-3" style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                                <Users size={18} color="var(--text-muted)" />
                                                <select
                                                    value={guests}
                                                    onChange={(e) => setGuests(parseInt(e.target.value))}
                                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 700, fontFamily: 'inherit' }}
                                                >
                                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Explorer' : 'Explorers'}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ margin: '1rem 0', padding: '1.5rem 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                                            <div className="flex justify-between items-center">
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Total Investment</span>
                                                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{((destination.price || 0) * guests).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', padding: '1.2rem', borderRadius: 'var(--radius-full)', justifyContent: 'center' }}
                                            disabled={bookingLoading}
                                        >
                                            {bookingLoading ? <Loader2 className="animate-spin" size={20} /> : 'Book Experience'}
                                        </button>

                                        <div className="flex items-center justify-center gap-2" style={{ opacity: 0.5, fontSize: '0.65rem', textAlign: 'center' }}>
                                            <ShieldCheck size={14} /> <span>Secure processing · No hidden fees</span>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .responsive-detail-grid { grid-template-columns: 1fr !important; gap: 4rem !important; }
                    .sticky-booking { position: static !important; }
                    .detail-image-box { aspect-ratio: 16/9 !important; }
                }

                @media (max-width: 768px) {
                    main { padding-top: 140px !important; }
                    .h1 { font-size: 2.25rem !important; }
                    .text-lead { font-size: 1rem !important; }
                    .responsive-stats { grid-template-columns: 1fr !important; }
                    .booking-card { padding: 2rem !important; }
                    .h3 { font-size: 1.5rem !important; }
                }
            `}</style>
        </main>
    );
};
