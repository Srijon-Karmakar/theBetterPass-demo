import React, { useEffect, useState } from 'react';
import { MapPin, ArrowRight, Heart, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { addListingFavorite, isListingFavorited, removeListingFavorite } from '../lib/destinations';
import type { ListingType } from '../lib/platform';

interface DestinationProps {
    id: string;
    title: string;
    location: string;
    price: number;
    rating?: number;
    image_url: string;
    category?: string;
    listingType?: ListingType;
}

export const DestinationCard: React.FC<DestinationProps> = ({
    id,
    title,
    location,
    price,
    image_url,
    category,
    listingType = 'activity',
}) => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const canFavorite = profile?.role === 'tourist';
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const listingPathType = listingType === 'guide' ? 'event' : listingType;

    useEffect(() => {
        if (!user || !id || !canFavorite) {
            setIsFavorite(false);
            return;
        }

        const loadFavorite = async () => {
            const favorited = await isListingFavorited(user.id, id, listingType);
            setIsFavorite(favorited);
        };

        void loadFavorite();
    }, [canFavorite, id, listingType, user]);

    const handleFavoriteToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (!user) {
            navigate('/auth');
            return;
        }
        if (!canFavorite) {
            alert('Only tourist accounts can save favorites.');
            return;
        }

        setFavoriteLoading(true);
        try {
            if (isFavorite) {
                await removeListingFavorite(user.id, id, listingType);
                setIsFavorite(false);
            } else {
                await addListingFavorite(user.id, id, listingType);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Favorite update failed:', error);
            alert('Could not update favorites. Please try again.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    return (
        <div className="card-clean" style={{ border: 'none', background: 'transparent' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.2', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                <img src={image_url} alt={title} className="img-cover" />
                <button
                    type="button"
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading || !canFavorite}
                    title={canFavorite ? undefined : 'Only tourist accounts can save favorites'}
                    style={{
                        alignItems: 'center',
                        background: isFavorite ? 'var(--accent)' : 'rgba(0,0,0,0.38)',
                        border: '1px solid rgba(255,255,255,0.35)',
                        borderRadius: '999px',
                        color: '#fff',
                        cursor: favoriteLoading || !canFavorite ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        height: '34px',
                        justifyContent: 'center',
                        opacity: favoriteLoading || !canFavorite ? 0.6 : 1,
                        position: 'absolute',
                        right: '14px',
                        top: '14px',
                        width: '34px',
                        zIndex: 3,
                    }}
                >
                    {favoriteLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                    )}
                </button>
                <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
                    <div className="flex justify-between items-end" style={{ color: 'white', textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ flex: 1, paddingRight: '1rem' }}>
                            <div className="flex flex-col gap-1" style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9 }}>{category}</span>
                                <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>
                                    <MapPin size={12} />
                                    {location?.split(',')[0]}
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
                        </div>
                        <Link to={`/listings/${listingPathType}/${id}`} className="btn-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)', zIndex: -1 }}></div>
            </div>

            <div style={{ padding: '1.5rem 0.5rem 0' }}>
                <div className="flex justify-between items-center" style={{ fontWeight: 800 }}>
                    <span style={{ fontSize: '1rem', color: 'var(--primary)' }}>₹{price?.toLocaleString()}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Per Experience</span>
                </div>
            </div>
        </div>
    );
};
