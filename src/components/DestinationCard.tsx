import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DestinationProps {
    id: string;
    title: string;
    location: string;
    price: number;
    rating?: number;
    image_url: string;
    category?: string;
}

export const DestinationCard: React.FC<DestinationProps> = ({ id, title, location, price, image_url, category }) => {
    return (
        <div className="card-clean" style={{ border: 'none', background: 'transparent' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.2', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                <img src={image_url} alt={title} className="img-cover" />
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
                        <Link to={`/listings/activity/${id}`} className="btn-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
