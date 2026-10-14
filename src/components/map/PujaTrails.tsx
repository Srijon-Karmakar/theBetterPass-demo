import React, { useMemo, useState } from 'react';
import { CalendarCheck, Check, ChevronDown, Clock, Loader2, MapPinned, Pause, Play, Plus, Route, Ticket, Train } from 'lucide-react';
import { Anchor } from 'reicon-react';
import { type PujaPandal } from '../../lib/pujaGuide';
import { formatTrailDuration, PUJA_TRAILS, resolveTrail, type ResolvedTrail } from '../../lib/pujaTrails';
import './puja-trails.css';

interface PujaTrailsProps {
    plan: string[];
    onPlanChange: (ids: string[]) => void;
    /** Builds the walking route through these pandals and shows it on the map, with the stops numbered. */
    onShowRoute: (pandals: PujaPandal[], title: string) => Promise<void>;
    /** Removes the trail's route and stops from the map. */
    onClearRoute: () => void;
    playing: boolean;
    onPlayToggle: () => void;
    onSelectPandal: (id: string | null) => void;
}

const ZONE_ACCENT: Record<ResolvedTrail['zone'], string> = {
    North: '#38bdf8',
    Central: '#fbbf24',
    East: '#c084fc',
    South: '#fb7185',
};

/** Free, ready-made pandal routes: a short read plus buttons to draw the route or add every stop to the plan. */
export const PujaTrails: React.FC<PujaTrailsProps> = ({ plan, onPlanChange, onShowRoute, onClearRoute, playing, onPlayToggle, onSelectPandal }) => {
    const trails = useMemo(() => PUJA_TRAILS.map(resolveTrail), []);
    const [openId, setOpenId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const addAll = (trail: ResolvedTrail) => {
        const missing = trail.pandals.map((item) => item.pandal.id).filter((id) => !plan.includes(id));
        if (!missing.length) {
            setMessage('Every stop of this trail is already in your plan.');
            return;
        }
        onPlanChange([...plan, ...missing]);
        setMessage(`Added ${missing.length} stop${missing.length === 1 ? '' : 's'} to your plan.`);
    };

    // Opening a trail draws its route straight away; closing it takes it off the map again.
    const toggleTrail = async (trail: ResolvedTrail) => {
        if (openId === trail.id) {
            setOpenId(null);
            onClearRoute();
            return;
        }
        setOpenId(trail.id);
        setBusyId(trail.id);
        setMessage('');
        try {
            await onShowRoute(trail.pandals.map((item) => item.pandal), trail.title);
        } catch {
            setMessage('Route service is unavailable right now. Please try again in a moment.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section className="puja-trails" aria-label="Free pandal trails">
            <header className="puja-trails__head">
                <strong>Trail guides</strong>
                <span className="puja-trails__free">Free</span>
            </header>
            <p className="puja-trails__intro">Ready-made routes with seven pandals each. Open one to see its route and stops on the map, then press Play to watch it from start to end.</p>

            <ul className="puja-trails__list">
                {trails.map((trail) => {
                    const open = openId === trail.id;
                    const inPlan = trail.pandals.every((item) => plan.includes(item.pandal.id));
                    return (
                        <li key={trail.id} className={`puja-trail${open ? ' is-open' : ''}`} style={{ '--zone': ZONE_ACCENT[trail.zone] } as React.CSSProperties}>
                            <button
                                type="button"
                                className="puja-trail__head"
                                onClick={() => void toggleTrail(trail)}
                                aria-expanded={open}
                            >
                                <span className="puja-trail__badge" aria-hidden="true"><Anchor size={20} color="currentColor" /></span>
                                <span className="puja-trail__titles">
                                    <strong>{trail.title}</strong>
                                    <small>{trail.tagline}</small>
                                    <span className="puja-trail__meta">
                                        <span><MapPinned size={12} aria-hidden="true" />{trail.pandals.length} stops</span>
                                        <span><Route size={12} aria-hidden="true" />{trail.distanceKm.toFixed(1)} km</span>
                                        <span><Clock size={12} aria-hidden="true" />{formatTrailDuration(trail.minutes)}</span>
                                    </span>
                                </span>
                                <ChevronDown size={18} className="puja-trail__chevron" aria-hidden="true" />
                            </button>

                            {open ? (
                                <div className="puja-trail__body">
                                    <div className="puja-trail__actions">
                                        <button type="button" className="puja-trail__btn is-primary" onClick={onPlayToggle} disabled={busyId !== null}>
                                            {busyId === trail.id
                                                ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                                                : playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                                            <span>{busyId === trail.id ? 'Drawing route' : playing ? 'Stop' : 'Play route'}</span>
                                        </button>
                                        <button type="button" className="puja-trail__btn" onClick={() => addAll(trail)}>
                                            {inPlan ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                                            <span>{inPlan ? 'In my plan' : 'Add all to my plan'}</span>
                                        </button>
                                    </div>

                                    <p>{trail.overview}</p>

                                    <dl className="puja-trail__facts">
                                        <div>
                                            <dt><CalendarCheck size={13} aria-hidden="true" />Best time</dt>
                                            <dd>{trail.bestTime}</dd>
                                        </div>
                                        <div>
                                            <dt><Train size={13} aria-hidden="true" />Getting there</dt>
                                            <dd>{trail.gettingThere}</dd>
                                        </div>
                                    </dl>

                                    <h3><Ticket size={14} aria-hidden="true" />Stop by stop</h3>
                                    <ol className="puja-trail__stops">
                                        {trail.pandals.map(({ pandal, tip }, index) => (
                                            <li key={pandal.id}>
                                                <b>{index + 1}</b>
                                                <button type="button" onClick={() => onSelectPandal(pandal.id)}>
                                                    <strong>{pandal.name}</strong>
                                                    <small>{pandal.area}</small>
                                                    <span>{pandal.highlight}</span>
                                                    <em>{tip}</em>
                                                </button>
                                            </li>
                                        ))}
                                    </ol>

                                    <p className="puja-trail__note">Distance and time are estimates for walking with about 20 minutes at each pandal. Use a cab or bike between far stops.</p>
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>

            {message ? <p className="puja-trails__message" role="status">{message}</p> : null}
        </section>
    );
};

export default PujaTrails;
