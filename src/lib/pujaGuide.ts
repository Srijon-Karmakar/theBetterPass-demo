import { supabase } from './supabase';
import { createNotification } from './destinations';

export type PandalZone = 'North' | 'Central' | 'Salt Lake' | 'South';

export interface PujaPandal {
    id: string;
    name: string;
    area: string;
    zone: PandalZone;
    lat: number;
    lng: number;
    highlight: string;
}

/**
 * Well-known Kolkata Durga Puja pandals. Coordinates are approximate (neighbourhood level) and should be
 * checked on the ground before each Puja season; themes change every year, so highlights stay general.
 */
export const PUJA_PANDALS: PujaPandal[] = [
    { id: 'bagbazar', name: 'Bagbazar Sarbojanin', area: 'Bagbazar', zone: 'North', lat: 22.6021, lng: 88.3653, highlight: 'One of the oldest community pujas, known for its traditional ekchala idol and riverside fair.' },
    { id: 'kumartuli-park', name: 'Kumartuli Park Sarbojanin', area: 'Kumartuli', zone: 'North', lat: 22.6003, lng: 88.3612, highlight: 'Set in the idol makers\' quarter; pair it with a walk through the artisan studios.' },
    { id: 'ahiritola', name: 'Ahiritola Sarbojanin', area: 'Ahiritola', zone: 'North', lat: 22.5984, lng: 88.3597, highlight: 'A popular North Kolkata theme pandal near the ghats.' },
    { id: 'shobhabazar-rajbari', name: 'Shobhabazar Rajbari', area: 'Shobhabazar', zone: 'North', lat: 22.5946, lng: 88.3668, highlight: 'A historic family (bonedi bari) puja in an old zamindar mansion.' },
    { id: 'jagat-mukherjee-park', name: 'Jagat Mukherjee Park', area: 'Shyambazar', zone: 'North', lat: 22.6009, lng: 88.3770, highlight: 'Large North Kolkata theme pandal, usually crowded in the evenings.' },
    { id: 'tala-prattoy', name: 'Tala Prattoy', area: 'Tala', zone: 'North', lat: 22.6041, lng: 88.3801, highlight: 'Known for ambitious themed installations in recent years.' },
    { id: 'hatibagan-sarbojanin', name: 'Hatibagan Sarbojanin', area: 'Hatibagan', zone: 'North', lat: 22.5969, lng: 88.3731, highlight: 'Busy market-area puja that is easy to combine with Nalin Sarkar Street.' },
    { id: 'nalin-sarkar-street', name: 'Nalin Sarkar Street', area: 'Hatibagan', zone: 'North', lat: 22.5981, lng: 88.3718, highlight: 'Neighbourhood theme pandal a short walk from Hatibagan.' },
    { id: 'shimla-byayam-samity', name: 'Simla Byayam Samity', area: 'Simla', zone: 'North', lat: 22.5879, lng: 88.3719, highlight: 'A historic club puja with roots in the freedom movement.' },
    { id: 'mohammad-ali-park', name: 'Mohammad Ali Park', area: 'Central Avenue', zone: 'Central', lat: 22.5796, lng: 88.3604, highlight: 'Central Kolkata crowd-puller with large, elaborate pandals.' },
    { id: 'college-square', name: 'College Square Sarbojanin', area: 'College Street', zone: 'Central', lat: 22.5751, lng: 88.3634, highlight: 'Lit up around the College Square pond; striking at night.' },
    { id: 'santosh-mitra-square', name: 'Santosh Mitra Square', area: 'Sealdah', zone: 'Central', lat: 22.5651, lng: 88.3671, highlight: 'Famous for grand replica-style pandals and very large crowds.' },
    { id: 'sreebhumi', name: 'Sreebhumi Sporting Club', area: 'Lake Town', zone: 'Salt Lake', lat: 22.6055, lng: 88.4022, highlight: 'One of the most visited pandals; expect long queues after dark.' },
    { id: 'lake-town-adhibasi-brinda', name: 'Lake Town Adhibasi Brinda', area: 'Lake Town', zone: 'Salt Lake', lat: 22.6039, lng: 88.4004, highlight: 'Close to Sreebhumi, easy to visit on the same stop.' },
    { id: 'fd-block', name: 'FD Block Salt Lake', area: 'Salt Lake Sector III', zone: 'Salt Lake', lat: 22.5886, lng: 88.4071, highlight: 'Well-known Salt Lake puja with spacious grounds.' },
    { id: 'bj-block', name: 'BJ Block Salt Lake', area: 'Salt Lake Sector II', zone: 'Salt Lake', lat: 22.5834, lng: 88.4181, highlight: 'Popular Salt Lake theme pandal.' },
    { id: 'maddox-square', name: 'Maddox Square', area: 'Ballygunge', zone: 'South', lat: 22.5262, lng: 88.3631, highlight: 'A traditional puja famous as an evening adda spot on the open lawns.' },
    { id: 'ekdalia-evergreen', name: 'Ekdalia Evergreen', area: 'Ballygunge', zone: 'South', lat: 22.5181, lng: 88.3701, highlight: 'Large South Kolkata pandal, often a replica of a famous monument.' },
    { id: 'singhi-park', name: 'Singhi Park', area: 'Ballygunge', zone: 'South', lat: 22.5174, lng: 88.3661, highlight: 'Known for its traditional idol; walking distance from Ekdalia.' },
    { id: 'hindustan-park', name: 'Hindustan Park Sarbojanin', area: 'Gariahat', zone: 'South', lat: 22.5191, lng: 88.3641, highlight: 'Art-led theme pandal near Gariahat.' },
    { id: 'deshapriya-park', name: 'Deshapriya Park', area: 'Rashbehari', zone: 'South', lat: 22.5159, lng: 88.3521, highlight: 'Big park-side puja, a central stop on any South Kolkata route.' },
    { id: 'tridhara-sammilani', name: 'Tridhara Sammilani', area: 'Rashbehari', zone: 'South', lat: 22.5148, lng: 88.3489, highlight: 'Known for elaborate lighting and design.' },
    { id: '66-pally', name: '66 Pally', area: 'Kalighat', zone: 'South', lat: 22.5108, lng: 88.3542, highlight: 'Theme pandal close to Deshapriya Park and Tridhara.' },
    { id: 'mudiali-club', name: 'Mudiali Club', area: 'Mudiali', zone: 'South', lat: 22.5139, lng: 88.3401, highlight: 'Long-running South Kolkata theme puja.' },
    { id: 'chetla-agrani', name: 'Chetla Agrani', area: 'Chetla', zone: 'South', lat: 22.5159, lng: 88.3359, highlight: 'Known for its striking idol and heavy evening crowds.' },
    { id: 'badamtala-ashar-sangha', name: 'Badamtala Ashar Sangha', area: 'Kalighat', zone: 'South', lat: 22.5089, lng: 88.3441, highlight: 'Award-winning theme pandal in the Kalighat area.' },
    { id: 'jodhpur-park', name: 'Jodhpur Park Sarbojanin', area: 'Jodhpur Park', zone: 'South', lat: 22.5061, lng: 88.3651, highlight: 'Well-known theme pandal in a quieter residential area.' },
    { id: 'suruchi-sangha', name: 'Suruchi Sangha', area: 'New Alipore', zone: 'South', lat: 22.4979, lng: 88.3409, highlight: 'Often built around a state or folk-art theme.' },
    { id: 'naktala-udayan-sangha', name: 'Naktala Udayan Sangha', area: 'Naktala', zone: 'South', lat: 22.4719, lng: 88.3771, highlight: 'Far-south pandal known for thoughtful, award-winning themes.' },
    { id: 'behala-notun-dal', name: 'Behala Notun Dal', area: 'Behala', zone: 'South', lat: 22.4981, lng: 88.3129, highlight: 'Popular Behala theme pandal.' },
    { id: 'barisha-club', name: 'Barisha Club', area: 'Behala', zone: 'South', lat: 22.4801, lng: 88.3101, highlight: 'Behala stop often paired with Notun Dal.' },
];

export const PANDAL_ZONES: PandalZone[] = ['North', 'Central', 'Salt Lake', 'South'];

export const getPandal = (id: string) => PUJA_PANDALS.find((item) => item.id === id) || null;

// ---------------------------------------------------------------- pandal plan

const PLAN_STORAGE_KEY = 'tbp:puja-plan:v1';

const cleanPlan = (ids: unknown): string[] => (
    Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string' && Boolean(getPandal(id))) : []
);

const readLocalPlan = (): string[] => {
    try {
        return cleanPlan(JSON.parse(window.localStorage.getItem(PLAN_STORAGE_KEY) || '[]'));
    } catch {
        return [];
    }
};

const writeLocalPlan = (ids: string[]) => {
    try {
        window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Storage unavailable; the plan just won't survive a reload.
    }
};

/** Signed-in users keep their plan in their account; guests keep it in this browser. */
export const loadPandalPlan = async (userId: string | null): Promise<string[]> => {
    const local = readLocalPlan();
    if (!userId) return local;
    const { data, error } = await supabase.from('puja_pandal_plans').select('pandal_ids').eq('user_id', userId).maybeSingle();
    if (error) return local;
    const remote = cleanPlan((data as { pandal_ids?: unknown } | null)?.pandal_ids);
    // A guest plan made before logging in is carried into the account.
    if (!remote.length && local.length) {
        await savePandalPlan(userId, local);
        return local;
    }
    return remote;
};

export const savePandalPlan = async (userId: string | null, ids: string[]): Promise<void> => {
    writeLocalPlan(ids);
    if (!userId) return;
    await supabase.from('puja_pandal_plans').upsert({ user_id: userId, pandal_ids: ids, updated_at: new Date().toISOString() });
};

// ---------------------------------------------------------------- guides

export type PujaGuideStatus = 'pending' | 'approved' | 'rejected';

export interface PujaGuide {
    user_id: string;
    display_name: string;
    bio: string;
    languages: string;
    areas: string;
    price_per_day: number;
    max_group_size: number;
    is_active: boolean;
    status: PujaGuideStatus;
    created_at: string;
    updated_at: string;
    avatar_url?: string | null;
}

export type PujaGuideInput = Pick<PujaGuide, 'display_name' | 'bio' | 'languages' | 'areas' | 'price_per_day' | 'max_group_size' | 'is_active'>;

const GUIDE_COLUMNS = 'user_id, display_name, bio, languages, areas, price_per_day, max_group_size, is_active, status, created_at, updated_at';

const NOT_READY = 'The Puja guide feature is not set up yet. Run the puja guide migration in Supabase.';

const toMessage = (error: { code?: string; message?: string }) => (
    error.code === '42P01' || error.code === 'PGRST205' || /puja_/i.test(error.message || '') ? NOT_READY : (error.message || 'Something went wrong.')
);

const attachAvatars = async (guides: PujaGuide[]): Promise<PujaGuide[]> => {
    if (!guides.length) return guides;
    const { data } = await supabase.from('profiles').select('id, profile_image_url').in('id', guides.map((item) => item.user_id));
    const avatars = new Map(((data || []) as Array<{ id: string; profile_image_url?: string | null }>).map((row) => [row.id, row.profile_image_url || null]));
    return guides.map((item) => ({ ...item, price_per_day: Number(item.price_per_day) || 0, avatar_url: avatars.get(item.user_id) || null }));
};

export const fetchApprovedPujaGuides = async (): Promise<PujaGuide[]> => {
    const { data, error } = await supabase
        .from('puja_guides')
        .select(GUIDE_COLUMNS)
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
    if (error) throw new Error(toMessage(error));
    return attachAvatars((data || []) as PujaGuide[]);
};

export const fetchAllPujaGuides = async (): Promise<PujaGuide[]> => {
    const { data, error } = await supabase.from('puja_guides').select(GUIDE_COLUMNS).order('created_at', { ascending: false });
    if (error) throw new Error(toMessage(error));
    return attachAvatars((data || []) as PujaGuide[]);
};

export const fetchMyPujaGuide = async (userId: string): Promise<PujaGuide | null> => {
    const { data, error } = await supabase.from('puja_guides').select(GUIDE_COLUMNS).eq('user_id', userId).maybeSingle();
    if (error) throw new Error(toMessage(error));
    return (data as PujaGuide | null) || null;
};

export const saveMyPujaGuide = async (userId: string, input: PujaGuideInput): Promise<PujaGuide> => {
    const { data, error } = await supabase
        .from('puja_guides')
        .upsert({ user_id: userId, ...input, display_name: input.display_name.trim() })
        .select(GUIDE_COLUMNS)
        .single();
    if (error) throw new Error(toMessage(error));
    return data as PujaGuide;
};

export const setPujaGuideStatus = async (userId: string, status: PujaGuideStatus): Promise<void> => {
    const { error } = await supabase.from('puja_guides').update({ status }).eq('user_id', userId);
    if (error) throw new Error(toMessage(error));
};

/** True when the user is an approved, active Puja guide (used to unlock chat before a paid booking). */
export const isApprovedPujaGuide = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('puja_guides')
        .select('user_id')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .eq('is_active', true)
        .maybeSingle();
    return !error && Boolean(data);
};

// ---------------------------------------------------------------- booking requests

export type PujaRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface PujaGuideRequest {
    id: string;
    tourist_id: string;
    guide_id: string;
    visit_date: string;
    group_size: number;
    pandal_ids: string[];
    note: string;
    status: PujaRequestStatus;
    created_at: string;
    updated_at: string;
    tourist_name?: string;
    guide_name?: string;
}

const REQUEST_COLUMNS = 'id, tourist_id, guide_id, visit_date, group_size, pandal_ids, note, status, created_at, updated_at';

export const PUJA_REQUEST_LABELS: Record<PujaRequestStatus, string> = {
    pending: 'Waiting for guide',
    accepted: 'Accepted',
    declined: 'Declined',
    cancelled: 'Cancelled',
};

export const createPujaGuideRequest = async (input: {
    touristId: string;
    guideId: string;
    visitDate: string;
    groupSize: number;
    pandalIds: string[];
    note: string;
}): Promise<PujaGuideRequest> => {
    const { data, error } = await supabase
        .from('puja_guide_requests')
        .insert({
            tourist_id: input.touristId,
            guide_id: input.guideId,
            visit_date: input.visitDate,
            group_size: input.groupSize,
            pandal_ids: input.pandalIds,
            note: input.note.trim(),
        })
        .select(REQUEST_COLUMNS)
        .single();
    if (error) throw new Error(toMessage(error));

    void createNotification({
        userId: input.guideId,
        actorUserId: input.touristId,
        type: 'booking_created',
        title: 'New Durga Puja guide request',
        body: `For ${input.visitDate}, group of ${input.groupSize}${input.pandalIds.length ? `, ${input.pandalIds.length} pandals` : ''}.`,
        metadata: { route: '/dashboard/provider?section=puja', puja_request_id: (data as PujaGuideRequest).id },
    }).catch(() => undefined);

    return data as PujaGuideRequest;
};

const attachNames = async (rows: PujaGuideRequest[]): Promise<PujaGuideRequest[]> => {
    const ids = Array.from(new Set(rows.flatMap((row) => [row.tourist_id, row.guide_id])));
    if (!ids.length) return rows;
    const [{ data: profiles }, { data: guides }] = await Promise.all([
        supabase.from('profiles').select('id, full_name').in('id', ids),
        supabase.from('puja_guides').select('user_id, display_name').in('user_id', ids),
    ]);
    const names = new Map(((profiles || []) as Array<{ id: string; full_name?: string | null }>).map((row) => [row.id, row.full_name || '']));
    const guideNames = new Map(((guides || []) as Array<{ user_id: string; display_name: string }>).map((row) => [row.user_id, row.display_name]));
    return rows.map((row) => ({
        ...row,
        tourist_name: names.get(row.tourist_id) || 'Traveller',
        guide_name: guideNames.get(row.guide_id) || names.get(row.guide_id) || 'Guide',
    }));
};

export const fetchPujaRequests = async (userId: string, side: 'tourist' | 'guide'): Promise<PujaGuideRequest[]> => {
    const { data, error } = await supabase
        .from('puja_guide_requests')
        .select(REQUEST_COLUMNS)
        .eq(side === 'tourist' ? 'tourist_id' : 'guide_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
    if (error) throw new Error(toMessage(error));
    return attachNames((data || []) as PujaGuideRequest[]);
};

export const updatePujaRequestStatus = async (request: PujaGuideRequest, status: PujaRequestStatus, actorUserId: string): Promise<void> => {
    const { error } = await supabase.from('puja_guide_requests').update({ status }).eq('id', request.id);
    if (error) throw new Error(toMessage(error));

    const toGuide = actorUserId === request.tourist_id;
    void createNotification({
        userId: toGuide ? request.guide_id : request.tourist_id,
        actorUserId,
        type: status === 'accepted' ? 'booking_confirmed' : 'booking_cancelled',
        title: `Durga Puja guide request ${status}`,
        body: `${toGuide ? request.tourist_name || 'The traveller' : request.guide_name || 'Your guide'} ${status} the request for ${request.visit_date}.`,
        metadata: { route: toGuide ? '/dashboard/provider?section=puja' : `/messages?user=${actorUserId}`, puja_request_id: request.id },
    }).catch(() => undefined);
};

export const formatRupees = (value: number) => `Rs ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;
