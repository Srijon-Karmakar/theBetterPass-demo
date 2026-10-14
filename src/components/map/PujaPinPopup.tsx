import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Hospital, Navigation, Plus, TrainFront, UtensilsCrossed, X } from 'lucide-react';

export type PujaPinTone = 'pandal' | 'restaurant' | 'metro' | 'train' | 'hospital';

export interface PujaPinPopupProps {
    tone: PujaPinTone;
    title: string;
    /** Neighbourhood or short descriptor under the title. */
    subtitle: string;
    /** Small coloured tag, e.g. "North Kolkata". */
    tag?: { label: string; color: string };
    /** Extra detail lines, shown in the plain card used for restaurants, stations and hospitals. */
    lines?: string[];
    directionsHref: string;
    /** Only pandals can be added to the plan. */
    plan?: { inPlan: boolean; onToggle: () => void };
    onClose: () => void;
}

const PETALS = Array.from({ length: 12 }, (_, i) => i * 30);
const RAYS = Array.from({ length: 36 }, (_, i) => i * 10);

const TONE_COLORS: Record<PujaPinTone, { main: string; soft: string }> = {
    pandal: { main: '#ffb21f', soft: '#8a1c2b' },
    restaurant: { main: '#fb7185', soft: '#7f1d1d' },
    metro: { main: '#60a5fa', soft: '#1e3a8a' },
    train: { main: '#1ba1bf', soft: '#0b4a5a' },
    hospital: { main: '#4ade80', soft: '#14532d' },
};

const ToneIcon: React.FC<{ tone: PujaPinTone }> = ({ tone }) => {
    if (tone === 'pandal') return <img src="/icons/puja.png" alt="" draggable={false} />;
    if (tone === 'restaurant') return <UtensilsCrossed size={26} aria-hidden="true" />;
    if (tone === 'hospital') return <Hospital size={26} aria-hidden="true" />;
    return <TrainFront size={26} aria-hidden="true" />;
};

/**
 * Circular popup that opens in the middle of the map when a Puja guide pin is tapped, instead of a card that
 * eats the bottom sheet. The ring, petals and glow animate in the same way as the Kolkata welcome poster.
 */
export const PujaPinPopup: React.FC<PujaPinPopupProps> = ({ tone, title, subtitle, tag, lines, directionsHref, plan, onClose }) => {
    const colors = TONE_COLORS[tone];

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    // Restaurants, stations and hospitals get a plain rounded card with the details; only pandals get the animated circle.
    if (tone !== 'pandal') {
        return createPortal(
            <div
                className="puja-pin-backdrop is-plain"
                onClick={(event) => {
                    if (event.target === event.currentTarget) onClose();
                }}
            >
                <div
                    className={`puja-card is-${tone}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                    style={{ '--pp-main': colors.main } as React.CSSProperties}
                >
                    <button type="button" className="puja-card__close" onClick={onClose} aria-label="Close details">
                        <X size={16} aria-hidden="true" />
                    </button>
                    <div className="puja-card__head">
                        <span className="puja-card__icon"><ToneIcon tone={tone} /></span>
                        <div>
                            <h2>{title}</h2>
                            <p>{subtitle}</p>
                        </div>
                    </div>
                    <ul className="puja-card__lines">
                        {tag ? <li>{tag.label}</li> : null}
                        {(lines ?? []).map((line) => <li key={line}>{line}</li>)}
                    </ul>
                    <a className="puja-card__btn" href={directionsHref} target="_blank" rel="noopener noreferrer">
                        <Navigation size={16} aria-hidden="true" />
                        <span>Directions in Google Maps</span>
                    </a>
                </div>
            </div>,
            document.body,
        );
    }

    return createPortal(
        <div
            className="puja-pin-backdrop"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className={`puja-pin is-${tone}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                style={{ '--pp-main': colors.main, '--pp-soft': colors.soft } as React.CSSProperties}
            >
                <div className="puja-pin__disc">
                    <svg className="puja-pin__art" viewBox="-110 -110 220 220" aria-hidden="true">
                        <defs>
                            <radialGradient id="ppin-glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor={colors.main} stopOpacity="0.5" />
                                <stop offset="100%" stopColor={colors.main} stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <circle r="108" fill="url(#ppin-glow)" className="puja-pin__halo" />
                        <g className="puja-pin__spin-slow">
                            <circle r="104" fill="none" stroke={colors.main} strokeWidth="1.4" strokeDasharray="2 6" />
                            {RAYS.map((angle) => (
                                <rect
                                    key={angle}
                                    x="-0.8"
                                    y="-104"
                                    width="1.6"
                                    height={angle % 30 === 0 ? 9 : 5}
                                    fill={colors.main}
                                    opacity="0.8"
                                    transform={`rotate(${angle})`}
                                />
                            ))}
                        </g>
                        <g className="puja-pin__spin-fast">
                            {PETALS.map((angle) => (
                                <path
                                    key={angle}
                                    d="M0 -92 C 13 -78 13 -58 0 -46 C -13 -58 -13 -78 0 -92 Z"
                                    fill="none"
                                    stroke={colors.main}
                                    strokeWidth="1.2"
                                    opacity="0.75"
                                    transform={`rotate(${angle})`}
                                />
                            ))}
                        </g>
                    </svg>

                    <button type="button" className="puja-pin__close" onClick={onClose} aria-label="Close details">
                        <X size={16} aria-hidden="true" />
                    </button>

                    <div className="puja-pin__body">
                        <span className="puja-pin__icon"><ToneIcon tone={tone} /></span>
                        <h2>{title}</h2>
                        <p>{subtitle}</p>
                        {tag ? (
                            <span className="puja-pin__tag">
                                <i style={{ background: tag.color }} aria-hidden="true" />
                                {tag.label}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="puja-pin__actions">
                    <a
                        className="puja-pin__btn puja-pin__btn--dark"
                        href={directionsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Navigation size={16} aria-hidden="true" />
                        <span>Directions</span>
                    </a>
                    {plan ? (
                        <button
                            type="button"
                            className={`puja-pin__btn puja-pin__btn--accent${plan.inPlan ? ' is-in' : ''}`}
                            onClick={plan.onToggle}
                        >
                            {plan.inPlan ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                            <span>{plan.inPlan ? 'In plan' : 'Add to plan'}</span>
                        </button>
                    ) : null}
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default PujaPinPopup;
