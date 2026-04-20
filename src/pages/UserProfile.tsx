import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrCreateConversation, getUserProfileById, type Profile } from '../lib/destinations';

export const UserProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        if (!id) return;
        if (user?.id === id) {
            navigate('/profile', { replace: true });
            return;
        }
        const load = async () => {
            setLoading(true);
            try {
                setProfile(await getUserProfileById(id));
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [id, navigate, user?.id]);

    const handleMessage = async () => {
        if (!user || !id) return;
        setMessageLoading(true);
        try {
            const conversation = await getOrCreateConversation(user.id, id);
            navigate(`/messages?conversation=${conversation.id}`);
        } catch (error) {
            console.error(error);
            alert('Could not start conversation. Check Supabase conversation policies.');
        } finally {
            setMessageLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', paddingTop: '120px' }}>
                <Loader2 className="animate-spin" size={36} />
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', paddingTop: '120px' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>User profile not found.</h2>
                    <Link to="/dashboard" className="btn btn-secondary">Go Back</Link>
                </div>
            </main>
        );
    }

    const location = [profile.city, profile.country].filter(Boolean).join(', ');
    const name = profile.full_name || 'Member';
    const avatar = profile.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`;

    return (
        <main style={{ paddingTop: '128px', paddingBottom: '80px' }}>
            <div className="container" style={{ display: 'grid', gap: '20px' }}>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    style={{ border: 'none', background: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <section style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ height: '180px', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: profile.cover_image_url ? `url(${profile.cover_image_url})` : undefined, backgroundColor: 'color-mix(in srgb, var(--accent) 12%, var(--surface-muted))' }} />
                    <div style={{ padding: '20px 22px 26px', display: 'grid', gap: '12px' }}>
                        <div style={{ marginTop: '-72px', width: '108px', height: '108px', borderRadius: '50%', border: '4px solid var(--surface-main)', overflow: 'hidden' }}>
                            <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ display: 'grid', gap: '4px' }}>
                            <h1 style={{ margin: 0, fontSize: '2rem', fontFamily: 'Outfit, sans-serif' }}>{name}</h1>
                            {location && (
                                <p style={{ margin: 0, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                                    <MapPin size={14} /> {location}
                                </p>
                            )}
                        </div>

                        {profile.bio && <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: '70ch', lineHeight: 1.75 }}>{profile.bio}</p>}

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button type="button" onClick={handleMessage} disabled={messageLoading} className="btn btn-primary" style={{ borderRadius: '999px', justifyContent: 'center' }}>
                                {messageLoading ? <Loader2 className="animate-spin" size={16} /> : <MessageCircle size={16} />}
                                Message
                            </button>
                            <Link to="/messages" className="btn btn-secondary" style={{ borderRadius: '999px', justifyContent: 'center' }}>
                                Open Inbox
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

