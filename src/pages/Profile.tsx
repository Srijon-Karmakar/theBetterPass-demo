import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, getBookings } from '../lib/destinations';
import type { Profile as ProfileType, BookingWithDetails } from '../lib/destinations';
import { Loader2, Calendar, Users, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileAndBookings = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const [profileData, bookingsData] = await Promise.all([
                    getProfile(user.id),
                    getBookings(user.id)
                ]);
                setProfile(profileData);
                setBookings(bookingsData);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndBookings();
    }, [user]);

    if (!user) return null;

    return (
        <main style={{ backgroundColor: 'var(--bg-main)', paddingTop: '160px', paddingBottom: '120px', minHeight: '100vh' }} className="animate-fade">
            <div className="container" style={{ maxWidth: '800px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 nav-desktop"
                    style={{ marginBottom: '2rem', fontWeight: 600, color: 'var(--text-muted)', border: 'none', background: 'none' }}
                >
                    <ArrowLeft size={18} /> Back
                </button>

                {/* Minimal Header */}
                <div style={{ background: 'var(--surface-main)', padding: '4rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)', marginBottom: '3rem', textAlign: 'center' }} className="responsive-profile-header">
                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '4px solid var(--surface-main)', boxShadow: 'var(--shadow-card)' }}>
                            <img
                                src={profile?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--accent)', color: 'var(--text-inverse)', padding: '0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.7rem', fontWeight: 800 }}>Lvl 5</div>
                    </div>

                    <h1 className="h1" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{profile?.full_name || 'Adventurer'}</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>{user?.email}</p>

                    <div className="flex justify-center gap-4 flex-wrap">
                        <button className="btn btn-soft" style={{ borderRadius: 'var(--radius-full)', padding: '10px 20px', fontSize: '0.85rem' }}>Edit Profile</button>
                        <button onClick={() => signOut()} className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '10px 20px', fontSize: '0.85rem' }}>Sign Out</button>
                    </div>
                </div>

                {/* Bookings Section */}
                <div className="booking-list-container">
                    <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
                        <h2 className="h2" style={{ fontSize: '1.5rem' }}>Your Journeys</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{bookings.length} Experiences</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center" style={{ padding: '60px 0' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {bookings.map((booking) => (
                                <div key={booking.id} style={{ background: 'var(--surface-main)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-subtle)' }} className="booking-item-card">
                                    <div className="flex items-center gap-6 inner-info">
                                        <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                                            <img src={booking.activity_image} alt="T" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{booking.activity_title}</h4>
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-1">
                                                <div className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    <Calendar size={14} /> Scheduled
                                                </div>
                                                <div className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    <Users size={14} /> {booking.number_of_people} Travelers
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }} className="price-tag">
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>₹{booking.total_price.toLocaleString()}</div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--success-text)', textTransform: 'uppercase', background: 'var(--success-bg)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>Confirmed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--surface-main)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontWeight: 500 }}>No journeys recorded yet.</p>
                            <Link to="/activities" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '14px 28px' }}>Find Your First Adventure</Link>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    main { padding-top: 140px !important; }
                    .responsive-profile-header { padding: 3rem 2rem !important; }
                    .h1 { font-size: 2rem !important; }
                    .booking-item-card { 
                        flex-direction: column !important; 
                        align-items: flex-start !important; 
                        gap: 1.5rem !important; 
                        padding: 1.5rem !important;
                    }
                    .inner-info { width: 100% !important; }
                    .price-tag { 
                        width: 100% !important; 
                        text-align: left !important; 
                        display: flex !important; 
                        justify-content: space-between !important; 
                        align-items: center !important;
                        padding-top: 1.5rem;
                        border-top: 1px solid var(--border-light);
                    }
                    .price-tag div { margin-bottom: 0 !important; }
                    .nav-desktop { display: none !important; }
                }
            `}</style>
        </main>
    );
};
