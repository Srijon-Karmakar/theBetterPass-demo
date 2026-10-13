import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, Footprints, Pause, Play, Trash2 } from 'lucide-react';
import {
    averageSpeedKmh,
    formatTrailDistance,
    formatTrailDuration,
    trailDuration,
    type TrailSegment,
} from '../../lib/walkTrail';

interface WalkTrailCardProps {
    tracking: boolean;
    distance: number;
    segments: TrailSegment[];
    pointCount: number;
    accuracy: number | null;
    keepAwake: boolean;
    error: string;
    onStart: () => void;
    onStop: () => void;
    onClear: () => void;
}

/** Live stats for the walk trail: distance, time and speed, with pause/resume and clear. */
export const WalkTrailCard: React.FC<WalkTrailCardProps> = ({
    tracking,
    distance,
    segments,
    pointCount,
    accuracy,
    keepAwake,
    error,
    onStart,
    onStop,
    onClear,
}) => {
    // Clearing a walk cannot be undone, so the first tap only asks for confirmation.
    const [confirmClear, setConfirmClear] = useState(false);
    // Collapsed, the walk keeps recording; only the stats card gets out of the way of the map.
    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {
        if (!confirmClear) return undefined;
        const timer = window.setTimeout(() => setConfirmClear(false), 3500);
        return () => window.clearTimeout(timer);
    }, [confirmClear]);

    // The clock lives here, not in the map page: ticking every second must not re-render the whole map.
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!tracking) return undefined;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [tracking]);
    const duration = trailDuration(segments, tracking ? now : null);

    // The collapsed pill can be dragged out of the way; a short tap still expands the card.
    const [pillOffset, setPillOffset] = useState({ x: 0, y: 0 });
    const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number; moved: boolean } | null>(null);
    const pillRef = useRef<HTMLButtonElement | null>(null);

    const onPillPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        drag.current = { startX: event.clientX, startY: event.clientY, baseX: pillOffset.x, baseY: pillOffset.y, moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPillPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        const current = drag.current;
        const pill = pillRef.current;
        const area = pill?.offsetParent as HTMLElement | null;
        if (!current || !pill || !area) return;
        const dx = event.clientX - current.startX;
        const dy = event.clientY - current.startY;
        if (!current.moved && Math.hypot(dx, dy) < 6) return;
        current.moved = true;
        // Keep the whole pill inside the map area.
        const pillRect = pill.getBoundingClientRect();
        const areaRect = area.getBoundingClientRect();
        const wantX = current.baseX + dx;
        const wantY = current.baseY + dy;
        const shiftX = wantX - pillOffset.x;
        const shiftY = wantY - pillOffset.y;
        const clampedX = Math.min(Math.max(pillRect.left + shiftX, areaRect.left + 4), areaRect.right - pillRect.width - 4) - pillRect.left;
        const clampedY = Math.min(Math.max(pillRect.top + shiftY, areaRect.top + 4), areaRect.bottom - pillRect.height - 4) - pillRect.top;
        setPillOffset({ x: pillOffset.x + clampedX, y: pillOffset.y + clampedY });
    };
    const onPillPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
        const current = drag.current;
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        if (current && !current.moved) setCollapsed(false);
    };

    const status = tracking
        ? (accuracy !== null ? `Tracking · GPS ±${Math.round(accuracy)} m` : 'Tracking · finding GPS...')
        : pointCount ? 'Paused' : 'Not tracking';

    if (collapsed) {
        return (
            <button
                type="button"
                className={`map2-trail-pill${tracking ? ' is-live' : ''}`}
                ref={pillRef}
                style={{ transform: `translate(calc(-50% + ${pillOffset.x}px), ${pillOffset.y}px)`, touchAction: 'none', cursor: 'grab' }}
                onPointerDown={onPillPointerDown}
                onPointerMove={onPillPointerMove}
                onPointerUp={onPillPointerUp}
                onPointerCancel={() => { drag.current = null; }}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setCollapsed(false); } }}
                aria-label="Show walk details (drag to move)"
            >
                <Footprints size={15} aria-hidden="true" />
                <strong>{formatTrailDistance(distance)}</strong>
                <span>{formatTrailDuration(duration)}</span>
                <ChevronUp size={15} className="map2-trail-pill-chevron" aria-hidden="true" />
            </button>
        );
    }

    return (
        <section className={`map2-trail-card${tracking ? ' is-live' : ''}`} aria-label="Walk trail" aria-live="polite">
            <header>
                <span className="map2-trail-icon" aria-hidden="true"><Footprints size={16} /></span>
                <div>
                    <strong>My walk</strong>
                    <small>{status}</small>
                </div>
                <button type="button" className="map2-trail-collapse" onClick={() => setCollapsed(true)} aria-label="Collapse walk details" title="Collapse">
                    <ChevronUp size={18} aria-hidden="true" />
                </button>
            </header>

            <dl className="map2-trail-stats">
                <div><dt>Distance</dt><dd>{formatTrailDistance(distance)}</dd></div>
                <div><dt>Time</dt><dd>{formatTrailDuration(duration)}</dd></div>
                <div><dt>Avg speed</dt><dd>{duration > 5000 ? `${averageSpeedKmh(distance, duration).toFixed(1)} km/h` : '--'}</dd></div>
            </dl>

            {error ? <p className="map2-trail-note is-error">{error}</p> : null}
            {tracking && !error ? (
                <p className="map2-trail-note">
                    {keepAwake ? 'Screen stays on while tracking.' : 'Keep this page open and the screen on to keep tracking.'}
                </p>
            ) : null}

            <div className="map2-trail-actions">
                {tracking ? (
                    <button type="button" className="is-primary" onClick={onStop}>
                        <Pause size={15} aria-hidden="true" />
                        <span>Pause</span>
                    </button>
                ) : (
                    <button type="button" className="is-primary" onClick={onStart}>
                        <Play size={15} aria-hidden="true" />
                        <span>{pointCount ? 'Resume' : 'Start'}</span>
                    </button>
                )}
                {pointCount || confirmClear ? (
                    <button
                        type="button"
                        className={confirmClear ? 'is-danger' : ''}
                        onClick={() => {
                            if (confirmClear) {
                                setConfirmClear(false);
                                onClear();
                            } else {
                                setConfirmClear(true);
                            }
                        }}
                    >
                        <Trash2 size={15} aria-hidden="true" />
                        <span>{confirmClear ? 'Tap again to clear' : 'Clear'}</span>
                    </button>
                ) : null}
            </div>
        </section>
    );
};
