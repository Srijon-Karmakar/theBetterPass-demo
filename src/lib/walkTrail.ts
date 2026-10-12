export interface TrailPoint {
    lat: number;
    lng: number;
    /** Epoch milliseconds of the GPS fix. */
    t: number;
    /**
     * The street route from the previous fix to this one, as [lat, lng] pairs. `undefined` means it has not been
     * looked up yet; an empty array means the lookup failed, so a straight line is used.
     */
    path?: Array<[number, number]>;
}

/** A walk is a list of segments; pausing and resuming starts a new one so the map never draws a false straight line. */
export type TrailSegment = TrailPoint[];

const STORAGE_KEY = 'tbp:walk-trail:v1';
const MAX_POINTS = 20000;

/** Fixes worse than this are shown as the live dot but never added to the trail. */
export const MAX_TRAIL_ACCURACY_M = 60;
/** Anything faster than this between two fixes is treated as a GPS jump (about 126 km/h). */
const MAX_SPEED_MS = 35;

const EARTH_RADIUS_M = 6371000;
const toRad = (value: number) => (value * Math.PI) / 180;

export const distanceBetween = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
};

const pathLength = (path: Array<[number, number]>): number => {
    let total = 0;
    for (let index = 1; index < path.length; index += 1) {
        total += distanceBetween({ lat: path[index - 1][0], lng: path[index - 1][1] }, { lat: path[index][0], lng: path[index][1] });
    }
    return total;
};

export const trailDistance = (segments: TrailSegment[]): number => {
    let total = 0;
    for (const segment of segments) {
        for (let index = 1; index < segment.length; index += 1) {
            const path = segment[index].path;
            total += path && path.length >= 2 ? pathLength(path) : distanceBetween(segment[index - 1], segment[index]);
        }
    }
    return total;
};

/** Vertices to draw for a segment: the street route between fixes where it is known, straight lines elsewhere. */
export const trailRenderPositions = (segment: TrailSegment): Array<[number, number]> => {
    const positions: Array<[number, number]> = [];
    segment.forEach((point, index) => {
        if (index > 0 && point.path && point.path.length >= 2) positions.push(...point.path.slice(1));
        else positions.push([point.lat, point.lng]);
        if (index === 0) positions[0] = [point.lat, point.lng];
    });
    return positions;
};

const OSRM_ROUTE_URL = 'https://router.project-osrm.org/route/v1/walking';
const MAX_PATH_VERTICES = 40;

/**
 * Looks up the walkable street route between two GPS fixes so the trail follows roads instead of cutting corners.
 * Returns null when the service is unreachable or the answer is implausible (a long detour), and the caller then
 * keeps the straight line.
 */
export const snapToStreets = async (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
): Promise<Array<[number, number]> | null> => {
    try {
        const url = `${OSRM_ROUTE_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=false`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) return null;
        const payload = await response.json() as { routes?: Array<{ geometry?: { coordinates?: unknown } }> };
        const coordinates = payload.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(coordinates)) return null;
        let path = coordinates
            .filter((item): item is [number, number] => Array.isArray(item) && Number.isFinite(item[0]) && Number.isFinite(item[1]))
            .map((item): [number, number] => [item[1], item[0]]);
        if (path.length < 2) return null;
        // The route service may return a long way round (one-way streets); a real step is never that much longer.
        const straight = distanceBetween(from, to);
        if (pathLength(path) > straight * 3 + 60) return null;
        if (path.length > MAX_PATH_VERTICES) {
            const every = Math.ceil(path.length / MAX_PATH_VERTICES);
            path = path.filter((_, index) => index % every === 0 || index === path.length - 1);
        }
        // Start and end on the real fixes so consecutive pieces join without gaps.
        path[0] = [from.lat, from.lng];
        path[path.length - 1] = [to.lat, to.lng];
        return path;
    } catch {
        return null;
    }
};

/** Time spent walking: first to last fix of each segment (to `now` for the segment still being recorded). */
export const trailDuration = (segments: TrailSegment[], liveNow: number | null): number => {
    let total = 0;
    segments.forEach((segment, index) => {
        if (!segment.length) return;
        const end = liveNow !== null && index === segments.length - 1 ? liveNow : segment[segment.length - 1].t;
        total += Math.max(0, end - segment[0].t);
    });
    return total;
};

export const trailPointCount = (segments: TrailSegment[]): number => segments.reduce((sum, segment) => sum + segment.length, 0);

/**
 * Decides whether a new GPS fix extends the trail. Small moves inside the GPS error circle are jitter from standing
 * still, and impossible jumps are bad fixes; both are skipped.
 */
export const shouldAppendPoint = (last: TrailPoint | undefined, next: TrailPoint, accuracy: number): boolean => {
    if (!Number.isFinite(accuracy) || accuracy > MAX_TRAIL_ACCURACY_M) return false;
    if (!last) return true;
    const moved = distanceBetween(last, next);
    if (moved < Math.max(5, accuracy * 0.5)) return false;
    const seconds = (next.t - last.t) / 1000;
    if (seconds > 0 && moved / seconds > MAX_SPEED_MS) return false;
    return true;
};

const isPoint = (value: unknown): value is TrailPoint => {
    const point = value as Partial<TrailPoint> | null;
    return Boolean(point) && Number.isFinite(point!.lat) && Number.isFinite(point!.lng) && Number.isFinite(point!.t);
};

const cleanPath = (path: unknown): Array<[number, number]> | undefined => {
    if (!Array.isArray(path)) return undefined;
    return path.filter((item): item is [number, number] => (
        Array.isArray(item) && Number.isFinite(item[0]) && Number.isFinite(item[1])
    ));
};

export const loadTrail = (): TrailSegment[] => {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter(Array.isArray)
            .map((segment) => (segment as unknown[]).filter(isPoint).map((point) => ({ ...point, path: cleanPath(point.path) })))
            .filter((segment) => segment.length > 0);
    } catch {
        return [];
    }
};

export const saveTrail = (segments: TrailSegment[]): void => {
    try {
        const clean = segments.filter((segment) => segment.length > 0);
        if (!clean.length) {
            window.localStorage.removeItem(STORAGE_KEY);
            return;
        }
        // Keep the most recent points if a very long walk ever hits the cap.
        let budget = MAX_POINTS;
        const trimmed: TrailSegment[] = [];
        for (let index = clean.length - 1; index >= 0 && budget > 0; index -= 1) {
            const segment = clean[index].slice(-budget);
            budget -= segment.length;
            trimmed.unshift(segment);
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
        // Storage unavailable or full; the trail just won't survive a reload.
    }
};

export const formatTrailDistance = (meters: number): string => {
    if (!Number.isFinite(meters) || meters < 1) return '0 m';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(meters < 10000 ? 2 : 1)} km`;
};

export const formatTrailDuration = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const averageSpeedKmh = (meters: number, ms: number): number => (ms > 0 ? (meters / 1000) / (ms / 3600000) : 0);

export type DirectionsMode = 'walking' | 'driving' | 'cycling';

/**
 * Google Maps "directions" link. With no origin Google starts from the person's current location, so this works
 * without us ever asking for it. The `dir` API link opens the Google Maps app on phones and the website elsewhere.
 */
export const googleMapsDirectionsUrl = (
    destination: { lat: number; lng: number },
    mode: DirectionsMode = 'walking',
): string => {
    const params = new URLSearchParams({
        api: '1',
        destination: `${destination.lat},${destination.lng}`,
        travelmode: mode === 'cycling' ? 'bicycling' : mode,
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
};
