import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    loadTrail,
    saveTrail,
    shouldAppendPoint,
    snapToStreets,
    trailDistance,
    trailPointCount,
    type TrailPoint,
    type TrailSegment,
} from '../../lib/walkTrail';

export interface LivePosition {
    lat: number;
    lng: number;
    accuracy: number;
}

interface WakeLockSentinelLike {
    released?: boolean;
    release: () => Promise<void>;
    addEventListener?: (type: 'release', listener: () => void) => void;
}

type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } };

/** Saving serialises the whole trail, so while walking it runs at most this often (and again on pagehide/unmount). */
const SAVE_INTERVAL_MS = 8000;

const describeGeolocationError = (error: GeolocationPositionError): string => {
    if (error.code === error.PERMISSION_DENIED) return 'Location permission is blocked. Allow location for this site to track your walk.';
    if (error.code === error.POSITION_UNAVAILABLE) return 'Your location is unavailable right now. Try moving outdoors.';
    return 'Waiting for a GPS signal...';
};

/**
 * Records the user's walk from the live GPS position. The trail is kept in this browser so a reload does not lose
 * it. Tracking only runs while the page is open; the screen wake lock keeps it from sleeping mid-walk.
 */
export const useWalkTrail = () => {
    const [segments, setSegments] = useState<TrailSegment[]>(() => loadTrail());
    const [tracking, setTracking] = useState(false);
    const [position, setPosition] = useState<LivePosition | null>(null);
    const [error, setError] = useState('');
    const [keepAwake, setKeepAwake] = useState(false);

    const watchId = useRef<number | null>(null);
    const trackingRef = useRef(false);
    const lockRef = useRef<WakeLockSentinelLike | null>(null);
    const segmentsRef = useRef(segments);
    const saveTimer = useRef<number | null>(null);
    const snapBusy = useRef(false);
    const snapFromT = useRef(0);
    const alive = useRef(true);

    const acquireLock = useCallback(async () => {
        try {
            const wakeLock = (navigator as WakeLockNavigator).wakeLock;
            if (!wakeLock) return;
            const sentinel = await wakeLock.request('screen');
            lockRef.current = sentinel;
            setKeepAwake(true);
            sentinel.addEventListener?.('release', () => setKeepAwake(false));
        } catch {
            setKeepAwake(false);
        }
    }, []);

    const releaseLock = useCallback(() => {
        const sentinel = lockRef.current;
        lockRef.current = null;
        setKeepAwake(false);
        void sentinel?.release().catch(() => undefined);
    }, []);

    const onFix = useCallback((fix: GeolocationPosition) => {
        const { latitude, longitude, accuracy } = fix.coords;
        setPosition({ lat: latitude, lng: longitude, accuracy });
        setError('');
        const point: TrailPoint = { lat: latitude, lng: longitude, t: fix.timestamp || Date.now() };
        setSegments((previous) => {
            const current = previous[previous.length - 1] ?? [];
            if (!shouldAppendPoint(current[current.length - 1], point, accuracy)) return previous;
            return [...previous.slice(0, -1), [...current, point]];
        });
    }, []);

    const stop = useCallback(() => {
        if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
        trackingRef.current = false;
        setTracking(false);
        setPosition(null);
        setSegments((previous) => previous.filter((segment) => segment.length > 0));
        releaseLock();
    }, [releaseLock]);

    const start = useCallback(() => {
        if (trackingRef.current) return;
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            setError('Geolocation is not supported on this device.');
            return;
        }
        trackingRef.current = true;
        snapFromT.current = Date.now() - 1000;
        setTracking(true);
        setError('');
        // Each start opens a fresh segment so a gap between walks is never drawn as a line.
        setSegments((previous) => [...previous.filter((segment) => segment.length > 0), []]);
        watchId.current = navigator.geolocation.watchPosition(
            onFix,
            (geoError) => {
                setError(describeGeolocationError(geoError));
                if (geoError.code === geoError.PERMISSION_DENIED) stop();
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 },
        );
        void acquireLock();
    }, [acquireLock, onFix, stop]);

    const clear = useCallback(() => {
        stop();
        setSegments([]);
        setError('');
        saveTrail([]);
    }, [stop]);

    // Snap new fixes to the street network, one lookup at a time, newest segment only.
    useEffect(() => {
        if (snapBusy.current || !tracking) return;
        const segment = segments[segments.length - 1];
        if (!segment) return;
        const index = segment.findIndex((point, i) => i > 0 && point.path === undefined && point.t >= snapFromT.current);
        if (index < 1) return;
        const from = segment[index - 1];
        const target = segment[index];
        snapBusy.current = true;
        void snapToStreets(from, target).then((path) => {
            snapBusy.current = false;
            if (!alive.current) return;
            setSegments((previous) => {
                const last = previous[previous.length - 1];
                if (!last) return previous;
                const at = last.findIndex((point) => point.t === target.t);
                if (at < 0) return previous;
                const next = last.slice();
                next[at] = { ...next[at], path: path ?? [] };
                return [...previous.slice(0, -1), next];
            });
        });
    }, [segments, tracking]);

    // Throttled save: the first change schedules one write, later changes ride along with it.
    useEffect(() => {
        segmentsRef.current = segments;
        if (saveTimer.current !== null) return;
        saveTimer.current = window.setTimeout(() => {
            saveTimer.current = null;
            saveTrail(segmentsRef.current);
        }, SAVE_INTERVAL_MS);
    }, [segments]);

    useEffect(() => {
        const flush = () => saveTrail(segmentsRef.current);
        window.addEventListener('pagehide', flush);
        return () => window.removeEventListener('pagehide', flush);
    }, []);

    // Browsers release the wake lock when the tab is hidden; take it back when the user returns.
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState !== 'visible' || !trackingRef.current) return;
            if (!lockRef.current || lockRef.current.released) void acquireLock();
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [acquireLock]);

    useEffect(() => () => {
        alive.current = false;
        if (watchId.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId.current);
        }
        if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
        saveTrail(segmentsRef.current);
        void lockRef.current?.release().catch(() => undefined);
    }, []);

    const distance = useMemo(() => trailDistance(segments), [segments]);

    return {
        tracking,
        position,
        error,
        keepAwake,
        segments,
        distance,
        pointCount: trailPointCount(segments),
        start,
        stop,
        clear,
    };
};
