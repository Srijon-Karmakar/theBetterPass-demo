import { supabase } from './supabase';
import type {
    BookingStatus,
    ListingType,
    ListingStatus,
    PaymentStatus,
    UserRole,
    VerificationStatus,
} from './platform';
import {
    PROVIDER_ROLES,
    ROLE_SIGNUP_CONFIG,
    canRolePublish,
    isProviderRole,
} from './platform';

export interface Destination {
    id: string;
    title: string;
    location: string;
    price: number;
    rating?: number;
    image_url: string;
    description: string;
    category: string;
    user_id: string;
}

export interface Profile {
    id: string;
    username?: string;
    full_name: string;
    email?: string;
    phone?: string;
    country?: string;
    city?: string;
    profile_image_url?: string;
    cover_image_url?: string;
    bio?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    role?: UserRole;
    is_verified?: boolean;
    verification_status?: VerificationStatus;
    company_name?: string;
    company_profile_id?: string | null;
    works_under_company?: boolean;
    provider_specialties?: string | null;
    guide_license_number?: string | null;
    certificate_id?: string | null;
    government_id_ref?: string | null;
    years_experience?: number | null;
    languages?: string[] | string | null;
    created_at?: string;
    updated_at?: string;
}

export interface EventRecord {
    id: string;
    title: string;
    location?: string;
    description?: string;
    category?: string;
    image_url?: string;
    starts_at?: string;
    created_at?: string;
}

export interface PostRecord {
    id: string;
    user_id?: string;
    provider_user_id?: string;
    company_profile_id?: string | null;
    title?: string;
    name?: string;
    description?: string;
    location?: string;
    image_url?: string;
    cover_image_url?: string;
    thumbnail_url?: string;
    type?: string | null;
    sub_category?: string | null;
    price?: number | null;
    created_at?: string;
    starts_at?: string;
    status?: ListingStatus | string | null;
    rejection_reason?: string | null;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
    [key: string]: unknown;
}

export interface ListingInput {
    id?: string;
    user_id?: string;
    provider_user_id?: string;
    company_profile_id?: string | null;
    title: string;
    description: string;
    location: string;
    image_url: string;
    type: ListingType;
    sub_category?: string;
    price?: number | null;
    starts_at?: string | null;
    status?: ListingStatus;
    rejection_reason?: string | null;
}

export interface FavoriteRecord {
    id: string;
    user_id: string;
    listing_id: string;
    listing_type: ListingType;
    has_explicit_type?: boolean;
    created_at?: string;
}

export interface FavoriteListingRecord {
    favorite_id: string;
    listing_id: string;
    listing_type: ListingType;
    title: string;
    image_url: string;
    location: string;
    price: number | null;
    created_at?: string;
}

export interface ConversationRecord {
    id: string;
    traveler_id?: string;
    provider_id?: string;
    booking_id?: string | null;
    created_at?: string;
}

export interface ConversationMessageRecord {
    id: string;
    conversation_id: string;
    sender_user_id: string;
    body: string;
    created_at?: string;
}

export type AppNotificationType =
    | 'message_new'
    | 'booking_created'
    | 'booking_confirmed'
    | 'booking_cancelled'
    | 'booking_completed'
    | 'payment_paid'
    | 'payment_refunded'
    | 'payment_failed'
    | 'verification_submitted'
    | 'verification_resubmitted'
    | 'verification_approved'
    | 'verification_rejected'
    | 'listing_approved'
    | 'listing_rejected';

export interface AppNotificationRecord {
    id: string;
    user_id: string;
    type: AppNotificationType | string;
    title: string;
    body?: string | null;
    metadata?: Record<string, unknown> | null;
    is_read: boolean;
    read_at?: string | null;
    created_at?: string;
}

export interface ModerationAuditLogRecord {
    id: string;
    entity_type: 'verification' | 'listing';
    entity_id: string;
    action: 'approved' | 'rejected' | 'published' | 'resubmitted';
    actor_user_id?: string | null;
    target_user_id?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown> | null;
    created_at?: string;
}

export interface VerificationRecord {
    id: string;
    user_id: string;
    role: UserRole;
    status: VerificationStatus;
    company_name?: string | null;
    submitted_at?: string;
    updated_at?: string;
    website?: string | null;
    registration_number?: string | null;
    works_under_company?: boolean;
    specialties?: string | null;
    license_number?: string | null;
    languages?: string[] | null;
    years_experience?: number | null;
    certificate_id?: string | null;
    government_id_ref?: string | null;
    bio?: string | null;
    rejection_reason?: string | null;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
    profiles?: Profile | null;
}

export interface ProviderApplicationInput {
    role: UserRole;
    companyName?: string;
    registrationNumber?: string;
    website?: string;
    specialties?: string;
    licenseNumber?: string;
    languages?: string;
    yearsExperience?: string;
    governmentId?: string;
    certificateId?: string;
    worksUnderCompany?: boolean;
}

export interface SignupInput extends ProviderApplicationInput {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    country: string;
    city: string;
    bio?: string;
}

export interface UnifiedBooking {
    id: string;
    user_id?: string;
    provider_user_id?: string | null;
    company_profile_id?: string | null;
    listing_id: string;
    listing_type: ListingType;
    listing_title: string;
    listing_image: string;
    number_of_people: number;
    unit_price: number;
    total_price: number;
    status: BookingStatus;
    payment_status?: PaymentStatus;
    payment_order_id?: string | null;
    payment_id?: string | null;
    payment_signature?: string | null;
    payment_currency?: string | null;
    paid_at?: string | null;
    booking_date?: string | null;
    created_at: string;
}

type LegacyBookingRow = {
    id: string;
    activity_id: string;
    number_of_people: number;
    price: number;
    total_price: number;
    status: string;
    created_at: string;
    activities: {
        title?: string;
        image_url?: string;
    } | null;
};

const DEFAULT_BOOKING_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';

const safeArray = <T,>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

const isMissingRelationError = (error: { code?: string; message?: string } | null | undefined) => (
    error?.code === 'PGRST205' || error?.message?.toLowerCase().includes('moderation_audit_logs')
);

const isMissingNotificationsError = (error: { code?: string; message?: string } | null | undefined) => {
    const message = error?.message?.toLowerCase() || '';
    return (
        error?.code === 'PGRST205'
        || message.includes('notifications')
        || message.includes('relation') && message.includes('does not exist')
    );
};

const mapNotificationRecord = (row: Record<string, unknown> | null): AppNotificationRecord | null => {
    if (!row || typeof row.id !== 'string' || typeof row.user_id !== 'string') return null;

    return {
        id: row.id,
        user_id: row.user_id,
        type: typeof row.type === 'string' ? row.type : 'message_new',
        title: typeof row.title === 'string' ? row.title : 'Notification',
        body: typeof row.body === 'string' ? row.body : null,
        metadata: row.metadata && typeof row.metadata === 'object'
            ? row.metadata as Record<string, unknown>
            : null,
        is_read: row.is_read === true || Boolean(row.read_at),
        read_at: typeof row.read_at === 'string' ? row.read_at : null,
        created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    };
};

const isMissingColumnError = (error: { code?: string; message?: string } | null | undefined) => {
    const message = error?.message?.toLowerCase() || '';
    return (
        error?.code === '42703'
        || error?.code === 'PGRST204'
        || (message.includes('column') && message.includes('does not exist'))
        || message.includes('could not find the') && message.includes('column')
    );
};

const extractMissingColumnName = (message: string | undefined): string | null => {
    if (!message) return null;

    const quoted = message.match(/"([a-zA-Z_][a-zA-Z0-9_]*)"/);
    if (quoted?.[1]) return quoted[1];

    const postgrest = message.match(/the\s+['"]?([a-zA-Z_][a-zA-Z0-9_]*)['"]?\s+column/i);
    if (postgrest?.[1]) return postgrest[1];

    return null;
};

const extractNotNullColumnName = (message: string | undefined): string | null => {
    if (!message) return null;

    const quoted = message.match(/null value in column "([a-zA-Z_][a-zA-Z0-9_]*)"/i);
    if (quoted?.[1]) return quoted[1];

    return null;
};

const extractCheckConstraintName = (message: string | undefined): string | null => {
    if (!message) return null;
    const match = message.match(/check constraint "([a-zA-Z_][a-zA-Z0-9_]*)"/i);
    return match?.[1] || null;
};

type FavoriteIdColumn = 'listing_id' | 'activity_id' | 'destination_id' | 'post_id';
type FavoriteTypeColumn = 'listing_type' | 'type';

const FAVORITE_ID_COLUMNS: FavoriteIdColumn[] = ['listing_id', 'activity_id', 'destination_id', 'post_id'];
const FAVORITE_TYPE_COLUMNS: FavoriteTypeColumn[] = ['listing_type', 'type'];

let favoriteIdColumnHint: FavoriteIdColumn = 'listing_id';
let favoriteTypeColumnHint: FavoriteTypeColumn | null = 'listing_type';
let favoriteGuideTypeHint: 'guide' | 'event' = 'guide';

const uniqueValues = <T,>(values: T[]): T[] => Array.from(new Set(values));

const getOrderedFavoriteIdColumns = (): FavoriteIdColumn[] => uniqueValues([
    favoriteIdColumnHint,
    ...FAVORITE_ID_COLUMNS,
]);

const getOrderedFavoriteTypeColumns = (): Array<FavoriteTypeColumn | null> => uniqueValues([
    favoriteTypeColumnHint,
    ...FAVORITE_TYPE_COLUMNS,
    null,
]);

const getFavoriteTypeValues = (listingType: ListingType): string[] => {
    if (listingType === 'guide') {
        return uniqueValues([favoriteGuideTypeHint, 'guide', 'event']);
    }
    return [listingType];
};

const isInvalidUuidInputError = (error: { code?: string; message?: string } | null | undefined) => {
    const message = error?.message?.toLowerCase() || '';
    return (
        error?.code === '22P02'
        || message.includes('invalid input syntax for type uuid')
        || message.includes('invalid input syntax for uuid')
    );
};

const pickFavoriteListingId = (row: Record<string, unknown>): string | null => {
    for (const column of FAVORITE_ID_COLUMNS) {
        const value = row[column];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim();
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
            return String(value);
        }
    }
    return null;
};

const pickFavoriteListingType = (row: Record<string, unknown>): ListingType => normalizeListingType(
    typeof row.listing_type === 'string'
        ? row.listing_type
        : typeof row.type === 'string'
            ? row.type
            : 'activity'
);

const normalizeFavoriteLookupId = (value: string | number): string => String(value).trim();

const mapFavoriteRow = (row: Record<string, unknown>): FavoriteRecord | null => {
    const listingId = pickFavoriteListingId(row);
    const userId = typeof row.user_id === 'string' ? row.user_id : '';
    const rawId = row.id;
    const id = typeof rawId === 'string'
        ? rawId
        : typeof rawId === 'number' && Number.isFinite(rawId)
            ? String(rawId)
            : '';
    const hasExplicitType = (
        typeof row.listing_type === 'string' && row.listing_type.trim().length > 0
    ) || (
        typeof row.type === 'string' && row.type.trim().length > 0
    );
    if (!listingId || !userId || !id) return null;

    return {
        id,
        user_id: userId,
        listing_id: listingId,
        listing_type: pickFavoriteListingType(row),
        has_explicit_type: hasExplicitType,
        created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    };
};

const rememberFavoriteSchemaHints = (
    idColumn: FavoriteIdColumn,
    typeColumn: FavoriteTypeColumn | null,
    typeValue?: string | null
) => {
    favoriteIdColumnHint = idColumn;
    favoriteTypeColumnHint = typeColumn;
    if (typeValue === 'guide' || typeValue === 'event') {
        favoriteGuideTypeHint = typeValue;
    }
};

const isMissingSpecificColumnError = (
    error: { code?: string; message?: string } | null | undefined,
    columnName: string
) => {
    if (!isMissingColumnError(error)) return false;
    const missing = extractMissingColumnName(error?.message);
    return missing === columnName;
};

const getPostFallbackValue = (columnName: string, payload: Record<string, unknown>) => {
    switch (columnName) {
        case 'id':
            return payload.id || crypto.randomUUID();
        case 'name':
        case 'title':
            return payload.title || payload.name || 'Untitled listing';
        case 'category':
        case 'sub_category':
            return payload.sub_category || payload.category || payload.type || 'activity';
        case 'description':
            return payload.description || 'No description provided.';
        case 'location':
            return payload.location || 'Not specified';
        case 'image_url':
        case 'cover_image_url':
        case 'thumbnail_url':
            return payload.image_url || payload.cover_image_url || payload.thumbnail_url || '';
        case 'price':
            return typeof payload.price === 'number' ? payload.price : 0;
        case 'status':
            return 'published';
        case 'type':
            return payload.type || 'activity';
        case 'created_at':
            return new Date().toISOString();
        default:
            return undefined;
    }
};

const PROFILE_UPDATE_KEYS: Array<keyof Profile> = [
    'full_name',
    'bio',
    'phone',
    'city',
    'country',
    'website',
    'profile_image_url',
    'cover_image_url',
];

const normalizeListingType = (value: string | null | undefined): ListingType => {
    const normalized = (value || '').trim().toLowerCase();
    if (normalized === 'event') return 'guide';
    if (normalized === 'tour' || normalized === 'activity' || normalized === 'guide') return normalized;
    return 'activity';
};

const getListingTitleFromPost = (post: PostRecord): string => {
    const title = post.title || post.name;
    return typeof title === 'string' && title.trim().length > 0 ? title : 'Untitled listing';
};

const getListingImageFromPost = (post: PostRecord): string => (
    post.image_url
    || post.cover_image_url
    || post.thumbnail_url
    || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200'
);

const normalizeBookingStatus = (value: string | null | undefined): BookingStatus => {
    const normalized = (value || '').trim().toLowerCase();
    if (normalized === 'pending' || normalized === 'confirmed' || normalized === 'cancelled' || normalized === 'completed') {
        return normalized;
    }
    return 'pending';
};

const normalizeVerificationStatus = (profile: Partial<Profile> | null): VerificationStatus => {
    if (!profile) return 'not_required';
    if (profile.verification_status) return profile.verification_status;
    if (profile.role === 'tourist') return 'not_required';
    return profile.is_verified ? 'approved' : 'pending';
};

const splitLanguages = (value: string | string[] | null | undefined) => {
    if (Array.isArray(value)) return value;
    if (!value) return null;
    return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const mapProfile = (data: Record<string, unknown> | null): Profile | null => {
    if (!data) return null;

    const languages = data.languages;

    return {
        id: String(data.id ?? ''),
        username: typeof data.username === 'string' ? data.username : undefined,
        full_name: typeof data.full_name === 'string' ? data.full_name : '',
        email: typeof data.email === 'string' ? data.email : undefined,
        phone: typeof data.phone === 'string' ? data.phone : undefined,
        country: typeof data.country === 'string' ? data.country : undefined,
        city: typeof data.city === 'string' ? data.city : undefined,
        profile_image_url: typeof data.profile_image_url === 'string' ? data.profile_image_url : undefined,
        cover_image_url: typeof data.cover_image_url === 'string' ? data.cover_image_url : undefined,
        bio: typeof data.bio === 'string' ? data.bio : undefined,
        facebook: typeof data.facebook === 'string' ? data.facebook : undefined,
        instagram: typeof data.instagram === 'string' ? data.instagram : undefined,
        youtube: typeof data.youtube === 'string' ? data.youtube : undefined,
        website: typeof data.website === 'string' ? data.website : undefined,
        role: typeof data.role === 'string' ? data.role as UserRole : undefined,
        is_verified: typeof data.is_verified === 'boolean' ? data.is_verified : undefined,
        verification_status: typeof data.verification_status === 'string'
            ? data.verification_status as VerificationStatus
            : undefined,
        company_name: typeof data.company_name === 'string' ? data.company_name : undefined,
        company_profile_id: typeof data.company_profile_id === 'string' ? data.company_profile_id : null,
        works_under_company: typeof data.works_under_company === 'boolean' ? data.works_under_company : undefined,
        provider_specialties: typeof data.provider_specialties === 'string' ? data.provider_specialties : null,
        guide_license_number: typeof data.guide_license_number === 'string' ? data.guide_license_number : null,
        certificate_id: typeof data.certificate_id === 'string' ? data.certificate_id : null,
        government_id_ref: typeof data.government_id_ref === 'string' ? data.government_id_ref : null,
        years_experience: typeof data.years_experience === 'number' ? data.years_experience : null,
        languages: Array.isArray(languages) || typeof languages === 'string' ? languages as string[] | string : null,
        created_at: typeof data.created_at === 'string' ? data.created_at : undefined,
        updated_at: typeof data.updated_at === 'string' ? data.updated_at : undefined,
    };
};

const mapUnifiedBooking = (row: Record<string, unknown>): UnifiedBooking => ({
    id: String(row.id),
    user_id: typeof row.user_id === 'string' ? row.user_id : undefined,
    provider_user_id: typeof row.provider_user_id === 'string' ? row.provider_user_id : null,
    company_profile_id: typeof row.company_profile_id === 'string' ? row.company_profile_id : null,
    listing_id: String(row.listing_id ?? row.activity_id ?? row.post_id ?? ''),
    listing_type: normalizeListingType(typeof row.listing_type === 'string' ? row.listing_type : typeof row.type === 'string' ? row.type : undefined),
    listing_title: typeof row.listing_title === 'string'
        ? row.listing_title
        : typeof row.title === 'string'
            ? row.title
            : 'Booked listing',
    listing_image: typeof row.listing_image === 'string'
        ? row.listing_image
        : typeof row.image_url === 'string'
            ? row.image_url
            : DEFAULT_BOOKING_IMAGE,
    number_of_people: typeof row.number_of_people === 'number' ? row.number_of_people : 1,
    unit_price: typeof row.unit_price === 'number'
        ? row.unit_price
        : typeof row.price === 'number'
            ? row.price
            : 0,
    total_price: typeof row.total_price === 'number' ? row.total_price : 0,
    status: normalizeBookingStatus(typeof row.status === 'string' ? row.status : undefined),
    payment_status: typeof row.payment_status === 'string' ? row.payment_status as PaymentStatus : undefined,
    payment_order_id: typeof row.payment_order_id === 'string' ? row.payment_order_id : null,
    payment_id: typeof row.payment_id === 'string' ? row.payment_id : null,
    payment_signature: typeof row.payment_signature === 'string' ? row.payment_signature : null,
    payment_currency: typeof row.payment_currency === 'string' ? row.payment_currency : null,
    paid_at: typeof row.paid_at === 'string' ? row.paid_at : null,
    booking_date: typeof row.booking_date === 'string' ? row.booking_date : null,
    created_at: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
});

const mapLegacyDestinationToPost = (row: Destination, type: ListingType): PostRecord => ({
    id: row.id,
    user_id: row.user_id,
    provider_user_id: row.user_id,
    title: row.title,
    description: row.description,
    location: row.location,
    image_url: row.image_url,
    type,
    sub_category: row.category,
    price: row.price,
    created_at: new Date().toISOString(),
    status: 'published',
});

const mapLegacyEventToPost = (row: EventRecord): PostRecord => ({
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    image_url: row.image_url,
    type: 'guide',
    sub_category: row.category,
    created_at: row.created_at || new Date().toISOString(),
    starts_at: row.starts_at,
    status: 'published',
});

const dedupePostsById = (rows: PostRecord[]) => {
    const seen = new Set<string>();
    return rows.filter((row) => {
        if (!row.id || seen.has(row.id)) return false;
        seen.add(row.id);
        return true;
    });
};

export const getActivities = async () => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
    return safeArray(data) as Destination[];
};

export const getTours = async () => {
    const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tours:', error);
        return [];
    }
    return safeArray(data) as Destination[];
};

export const getEvents = async () => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching legacy events:', error);
        return [];
    }

    return safeArray(data) as EventRecord[];
};

export const getPosts = async () => {
    const [postsResult, toursResult, activitiesResult, eventsResult] = await Promise.all([
        supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false }),
        supabase
            .from('tours')
            .select('*')
            .order('created_at', { ascending: false }),
        supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false }),
        supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false }),
    ]);

    if (postsResult.error) {
        console.error('Error fetching posts:', postsResult.error);
    }
    if (toursResult.error) {
        console.error('Error fetching tours for unified feed:', toursResult.error);
    }
    if (activitiesResult.error) {
        console.error('Error fetching activities for unified feed:', activitiesResult.error);
    }
    if (eventsResult.error) {
        console.error('Error fetching events for unified feed:', eventsResult.error);
    }

    const combined = [
        ...safeArray(postsResult.data) as PostRecord[],
        ...safeArray(toursResult.data as Destination[]).map((row) => mapLegacyDestinationToPost(row, 'tour')),
        ...safeArray(activitiesResult.data as Destination[]).map((row) => mapLegacyDestinationToPost(row, 'activity')),
        ...safeArray(eventsResult.data as EventRecord[]).map(mapLegacyEventToPost),
    ];

    return dedupePostsById(combined).sort((a, b) => (
        new Date(b.created_at || b.starts_at || 0).getTime() - new Date(a.created_at || a.starts_at || 0).getTime()
    ));
};

export const getPublicListingsByType = async (type: ListingType): Promise<PostRecord[]> => {
    const publishedPostsQuery = supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .eq('type', type)
        .order('created_at', { ascending: false });

    if (type === 'tour') {
        const [postsResult, toursResult] = await Promise.all([
            publishedPostsQuery,
            supabase.from('tours').select('*').order('created_at', { ascending: false }),
        ]);

        if (postsResult.error) console.error('Error fetching published tours from posts:', postsResult.error);
        if (toursResult.error) console.error('Error fetching legacy tours:', toursResult.error);

        return dedupePostsById([
            ...safeArray(postsResult.data) as PostRecord[],
            ...safeArray(toursResult.data as Destination[]).map((row) => mapLegacyDestinationToPost(row, 'tour')),
        ]);
    }

    if (type === 'activity') {
        const [postsResult, activitiesResult] = await Promise.all([
            publishedPostsQuery,
            supabase.from('activities').select('*').order('created_at', { ascending: false }),
        ]);

        if (postsResult.error) console.error('Error fetching published activities from posts:', postsResult.error);
        if (activitiesResult.error) console.error('Error fetching legacy activities:', activitiesResult.error);

        return dedupePostsById([
            ...safeArray(postsResult.data) as PostRecord[],
            ...safeArray(activitiesResult.data as Destination[]).map((row) => mapLegacyDestinationToPost(row, 'activity')),
        ]);
    }

    const [postsResult, eventsResult] = await Promise.all([
        publishedPostsQuery,
        supabase.from('events').select('*').order('created_at', { ascending: false }),
    ]);

    if (postsResult.error) console.error('Error fetching published events from posts:', postsResult.error);
    if (eventsResult.error) console.error('Error fetching legacy events:', eventsResult.error);

    return dedupePostsById([
        ...safeArray(postsResult.data) as PostRecord[],
        ...safeArray(eventsResult.data as EventRecord[]).map(mapLegacyEventToPost),
    ]);
};

export const getMyPosts = async (userId: string) => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`user_id.eq.${userId},provider_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching provider posts:', error);
        return [];
    }

    return safeArray(data) as PostRecord[];
};

export const createOrUpdateListing = async (listing: ListingInput) => {
    const normalizedStatus: ListingStatus = 'published';
    const normalizedTitle = listing.title?.trim() || 'Untitled listing';
    const normalizedType = normalizeListingType(listing.type);
    const normalizedCategory = listing.sub_category?.trim() || normalizedType;
    const normalizedImage = listing.image_url?.trim() || '';
    const normalizedPrice = typeof listing.price === 'number' ? listing.price : Number(listing.price || 0) || 0;
    const payload = {
        ...listing,
        title: normalizedTitle,
        name: normalizedTitle,
        type: normalizedType,
        category: normalizedCategory,
        sub_category: normalizedCategory,
        image_url: normalizedImage,
        cover_image_url: normalizedImage,
        thumbnail_url: normalizedImage,
        price: normalizedPrice,
        status: normalizedStatus,
        rejection_reason: null,
        reviewed_at: null,
        reviewed_by: null,
        created_at: new Date().toISOString(),
    };

    if (!listing.id) {
        delete payload.id;
    }

    return writePostWithSchemaFallback(payload, listing.id);
};

export const getContentModerationQueue = async (): Promise<PostRecord[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .in('status', ['pending', 'rejected'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching moderation queue:', error);
        return [];
    }

    return safeArray(data) as PostRecord[];
};

export const reviewListing = async (
    listingId: string,
    status: 'published' | 'rejected',
    options?: { reason?: string; reviewerId?: string }
) => {
    const reviewedAt = new Date().toISOString();
    const { data, error } = await supabase
        .from('posts')
        .update({
            status,
            rejection_reason: status === 'rejected' ? options?.reason || null : null,
            reviewed_at: reviewedAt,
            reviewed_by: options?.reviewerId || null,
        })
        .eq('id', listingId)
        .select()
        .maybeSingle();

    if (error) throw error;

    await writeModerationAuditLog({
        entityType: 'listing',
        entityId: listingId,
        action: status,
        actorUserId: options?.reviewerId,
        targetUserId: typeof data?.provider_user_id === 'string' ? data.provider_user_id : null,
        reason: status === 'rejected' ? options?.reason || null : null,
        metadata: {
            listingType: typeof data?.type === 'string' ? data.type : null,
            listingTitle: typeof data?.title === 'string' ? data.title : typeof data?.name === 'string' ? data.name : null,
            reviewedAt,
        },
    });

    const targetProviderId = typeof data?.provider_user_id === 'string'
        ? data.provider_user_id
        : typeof data?.user_id === 'string'
            ? data.user_id
            : null;

    if (targetProviderId) {
        const listingTitle = typeof data?.title === 'string'
            ? data.title
            : typeof data?.name === 'string'
                ? data.name
                : 'your listing';
        const isRejected = status === 'rejected';
        await createNotification({
            userId: targetProviderId,
            actorUserId: options?.reviewerId || targetProviderId,
            type: isRejected ? 'listing_rejected' : 'listing_approved',
            title: isRejected ? 'Listing rejected' : 'Listing approved',
            body: isRejected
                ? `${listingTitle} needs updates before going live.${options?.reason ? ` Reason: ${options.reason}` : ''}`
                : `${listingTitle} is approved and live.`,
            metadata: { listing_id: listingId, route: '/provider/studio' },
        });
    }

    return data as PostRecord | null;
};

export const resubmitListing = async (listingId: string) => {
    const { data, error } = await supabase
        .from('posts')
        .update({
            status: 'pending',
            rejection_reason: null,
            reviewed_at: null,
            reviewed_by: null,
        })
        .eq('id', listingId)
        .select()
        .maybeSingle();

    if (error) throw error;

    await writeModerationAuditLog({
        entityType: 'listing',
        entityId: listingId,
        action: 'resubmitted',
        actorUserId: typeof data?.provider_user_id === 'string' ? data.provider_user_id : typeof data?.user_id === 'string' ? data.user_id : null,
        targetUserId: typeof data?.provider_user_id === 'string' ? data.provider_user_id : typeof data?.user_id === 'string' ? data.user_id : null,
        metadata: {
            listingType: typeof data?.type === 'string' ? data.type : null,
            listingTitle: typeof data?.title === 'string' ? data.title : typeof data?.name === 'string' ? data.name : null,
        },
    });

    return data as PostRecord | null;
};

export const getDestinationById = async (id: string) => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching activity:', error);
        return null;
    }
    return data as Destination;
};

export const getListingById = async (
    id: string,
    type?: ListingType
): Promise<PostRecord | null> => {
    if (!id) return null;

    const mapActivity = async () => {
        const { data, error } = await supabase.from('activities').select('*').eq('id', id).maybeSingle();
        if (error || !data) return null;
        return mapLegacyDestinationToPost(data as Destination, 'activity');
    };

    const mapTour = async () => {
        const { data, error } = await supabase.from('tours').select('*').eq('id', id).maybeSingle();
        if (error || !data) return null;
        return mapLegacyDestinationToPost(data as Destination, 'tour');
    };

    const mapGuide = async () => {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
        if (error || !data) return null;
        return mapLegacyEventToPost(data as EventRecord);
    };

    if (type) {
        let postData: PostRecord | null = null;
        const { data: typedPostData, error: postError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .eq('type', type)
            .maybeSingle();
        if (postError) console.error('Error fetching listing from posts:', postError);
        if (typedPostData) postData = typedPostData as PostRecord;

        if (!postData && type === 'guide') {
            const { data: legacyGuidePost } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .eq('type', 'event')
                .maybeSingle();
            if (legacyGuidePost) {
                postData = {
                    ...(legacyGuidePost as PostRecord),
                    type: 'guide',
                };
            }
        }

        if (postData) return postData;

        if (type === 'activity') return mapActivity();
        if (type === 'tour') return mapTour();
        return mapGuide();
    }

    const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (postError) console.error('Error fetching listing from posts:', postError);
    if (postData) return postData as PostRecord;

    const [activity, tour, guide] = await Promise.all([mapActivity(), mapTour(), mapGuide()]);
    return activity || tour || guide;
};

export const createBooking = async (booking: {
    user_id: string;
    activity_id?: string;
    listing_id?: string;
    listing_type?: ListingType;
    provider_user_id?: string | null;
    listing_title?: string;
    listing_image?: string;
    number_of_people: number;
    price?: number;
    unit_price?: number;
    total_price: number;
    status?: BookingStatus;
    payment_status?: PaymentStatus;
    payment_order_id?: string | null;
    payment_id?: string | null;
    payment_signature?: string | null;
    payment_currency?: string | null;
    paid_at?: string | null;
    booking_date?: string | null;
}) => {
    const { data: travelerProfile, error: travelerProfileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', booking.user_id)
        .maybeSingle();

    if (travelerProfileError) throw travelerProfileError;
    if ((travelerProfile as { role?: string } | null)?.role !== 'tourist') {
        throw new Error('Only tourist accounts can place bookings.');
    }

    const unifiedPayload = {
        user_id: booking.user_id,
        listing_id: booking.listing_id || booking.activity_id,
        listing_type: normalizeListingType(booking.listing_type || 'activity'),
        provider_user_id: booking.provider_user_id || null,
        listing_title: booking.listing_title || null,
        listing_image: booking.listing_image || null,
        number_of_people: booking.number_of_people,
        unit_price: booking.unit_price ?? booking.price ?? 0,
        total_price: booking.total_price,
        status: booking.status || 'pending',
        payment_status: booking.payment_status || 'pending',
        payment_order_id: booking.payment_order_id || null,
        payment_id: booking.payment_id || null,
        payment_signature: booking.payment_signature || null,
        payment_currency: booking.payment_currency || 'INR',
        paid_at: booking.paid_at || null,
        booking_date: booking.booking_date || null,
    };

    const unifiedPayloadWithFallback: Record<string, unknown> = { ...unifiedPayload };
    let unifiedInsert: {
        data: unknown[] | null;
        error: { code?: string; message?: string } | null;
    } = { data: null, error: null };

    while (Object.keys(unifiedPayloadWithFallback).length > 0) {
        const result = await supabase
            .from('bookings')
            .insert([unifiedPayloadWithFallback])
            .select();

        if (!result.error) {
            unifiedInsert = {
                data: result.data as unknown[] | null,
                error: null,
            };
            break;
        }

        if (!isMissingColumnError(result.error)) {
            unifiedInsert = { data: null, error: result.error };
            break;
        }

        const missingColumn = extractMissingColumnName(result.error.message);
        if (!missingColumn || !(missingColumn in unifiedPayloadWithFallback)) {
            unifiedInsert = { data: null, error: result.error };
            break;
        }

        delete unifiedPayloadWithFallback[missingColumn];
    }

    if (!unifiedInsert.error) {
        const inserted = safeArray(unifiedInsert.data as Array<Record<string, unknown>>)[0] || null;
        const bookingId = typeof inserted?.id === 'string' ? inserted.id : undefined;
        const listingTitle = (booking.listing_title || 'Listing').trim();
        const providerId = booking.provider_user_id
            || (typeof inserted?.provider_user_id === 'string' ? inserted.provider_user_id : null);
        const status = String(unifiedPayloadWithFallback.status || 'pending').toLowerCase();
        const paymentStatus = String(unifiedPayloadWithFallback.payment_status || 'pending').toLowerCase();
        const route = '/profile';

        const notifications: CreateNotificationInput[] = [
            {
                userId: booking.user_id,
                actorUserId: booking.user_id,
                type: 'booking_created',
                title: 'Booking created',
                body: `Your booking for ${listingTitle} is now in the system.`,
                metadata: { booking_id: bookingId || null, listing_id: unifiedPayloadWithFallback.listing_id || null, route },
            },
        ];

        if (providerId && providerId !== booking.user_id) {
            notifications.push({
                userId: providerId,
                actorUserId: booking.user_id,
                type: 'booking_created',
                title: 'New booking received',
                body: `${booking.number_of_people} traveler(s) booked ${listingTitle}.`,
                metadata: { booking_id: bookingId || null, listing_id: unifiedPayloadWithFallback.listing_id || null, route },
            });
        }

        if (status === 'confirmed') {
            notifications.push({
                userId: booking.user_id,
                actorUserId: booking.user_id,
                type: 'booking_confirmed',
                title: 'Booking confirmed',
                body: `${listingTitle} is confirmed.`,
                metadata: { booking_id: bookingId || null, route },
            });
            if (providerId && providerId !== booking.user_id) {
                notifications.push({
                    userId: providerId,
                    actorUserId: booking.user_id,
                    type: 'booking_confirmed',
                    title: 'Booking confirmed',
                    body: `Booking for ${listingTitle} is confirmed.`,
                    metadata: { booking_id: bookingId || null, route },
                });
            }
        } else if (status === 'cancelled' || status === 'canceled') {
            notifications.push({
                userId: booking.user_id,
                actorUserId: booking.user_id,
                type: 'booking_cancelled',
                title: 'Booking cancelled',
                body: `${listingTitle} booking was cancelled.`,
                metadata: { booking_id: bookingId || null, route },
            });
            if (providerId && providerId !== booking.user_id) {
                notifications.push({
                    userId: providerId,
                    actorUserId: booking.user_id,
                    type: 'booking_cancelled',
                    title: 'Booking cancelled',
                    body: `Booking for ${listingTitle} was cancelled.`,
                    metadata: { booking_id: bookingId || null, route },
                });
            }
        } else if (status === 'completed') {
            notifications.push({
                userId: booking.user_id,
                actorUserId: booking.user_id,
                type: 'booking_completed',
                title: 'Trip completed',
                body: `${listingTitle} has been marked completed.`,
                metadata: { booking_id: bookingId || null, route },
            });
            if (providerId && providerId !== booking.user_id) {
                notifications.push({
                    userId: providerId,
                    actorUserId: booking.user_id,
                    type: 'booking_completed',
                    title: 'Trip completed',
                    body: `${listingTitle} booking has been marked completed.`,
                    metadata: { booking_id: bookingId || null, route },
                });
            }
        }

        if (paymentStatus === 'paid') {
            notifications.push({
                userId: booking.user_id,
                actorUserId: booking.user_id,
                type: 'payment_paid',
                title: 'Payment successful',
                body: `Payment received for ${listingTitle}.`,
                metadata: { booking_id: bookingId || null, route },
            });
            if (providerId && providerId !== booking.user_id) {
                notifications.push({
                    userId: providerId,
                    actorUserId: booking.user_id,
                    type: 'payment_paid',
                    title: 'Payment received',
                    body: `Payment was completed for ${listingTitle}.`,
                    metadata: { booking_id: bookingId || null, route },
                });
            }
        } else if (paymentStatus === 'refunded') {
            notifications.push({
                userId: booking.user_id,
                actorUserId: booking.user_id,
                type: 'payment_refunded',
                title: 'Payment refunded',
                body: `Refund processed for ${listingTitle}.`,
                metadata: { booking_id: bookingId || null, route },
            });
            if (providerId && providerId !== booking.user_id) {
                notifications.push({
                    userId: providerId,
                    actorUserId: booking.user_id,
                    type: 'payment_refunded',
                    title: 'Payment refunded',
                    body: `A refund was processed for ${listingTitle}.`,
                    metadata: { booking_id: bookingId || null, route },
                });
            }
        } else if (paymentStatus === 'failed') {
            notifications.push({
                userId: booking.user_id,
                actorUserId: booking.user_id,
                type: 'payment_failed',
                title: 'Payment failed',
                body: `Payment failed for ${listingTitle}. Retry to complete booking.`,
                metadata: { booking_id: bookingId || null, route },
            });
        }

        await createNotifications(notifications);
        return unifiedInsert.data;
    }

    const legacyPayload = {
        user_id: booking.user_id,
        activity_id: booking.activity_id || booking.listing_id,
        number_of_people: booking.number_of_people,
        price: booking.price ?? booking.unit_price ?? 0,
        total_price: booking.total_price,
        status: booking.status || 'pending',
    };

    const legacyInsert = await supabase.from('bookings_acts').insert([legacyPayload]).select();
    if (legacyInsert.error) throw legacyInsert.error;
    await createNotification({
        userId: booking.user_id,
        actorUserId: booking.user_id,
        type: 'booking_created',
        title: 'Booking created',
        body: `Your booking for ${(booking.listing_title || 'Listing').trim()} is now in the system.`,
        metadata: { route: '/profile' },
    });
    return legacyInsert.data;
};

export const getProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    const profile = mapProfile(data as Record<string, unknown> | null);
    if (!profile) return null;
    const normalizedProfile = {
        ...profile,
        verification_status: normalizeVerificationStatus(profile),
    };

    let verificationResult = await supabase
        .from('verification')
        .select('role, status')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (isMissingSpecificColumnError(verificationResult.error, 'updated_at')) {
        verificationResult = await supabase
            .from('verification')
            .select('role, status')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .maybeSingle();
    }

    if (isMissingColumnError(verificationResult.error)) {
        verificationResult = await supabase
            .from('verification')
            .select('role, status')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
    }

    const verificationData = verificationResult.data;
    const verificationError = verificationResult.error;

    if (verificationError) {
        console.error('Error fetching latest verification for profile:', verificationError);
        return normalizedProfile;
    }

    if (!verificationData) {
        return normalizedProfile;
    }

    return {
        ...normalizedProfile,
        role: isProviderRole(normalizedProfile.role) ? normalizedProfile.role : verificationData.role as UserRole,
        verification_status: verificationData.status as VerificationStatus,
        is_verified: verificationData.status === 'approved',
    };
};

export const updateProfile = async (profile: Partial<Profile>) => {
    if (!profile.id) return null;
    const payload: Record<string, unknown> = {};
    for (const key of PROFILE_UPDATE_KEYS) {
        const value = profile[key];
        if (value !== undefined) {
            payload[key] = value;
        }
    }

    if (Object.keys(payload).length === 0) {
        return getProfile(profile.id);
    }

    const upsertProfilePayload = async () => {
        const { data: upsertData, error: upsertError } = await supabase
            .from('profiles')
            .upsert([{ id: profile.id, ...payload }], { onConflict: 'id' })
            .select()
            .maybeSingle();

        if (upsertError) throw upsertError;
        if (!upsertData) throw new Error('Profile save did not return persisted data.');
        return mapProfile(upsertData as Record<string, unknown> | null);
    };

    while (Object.keys(payload).length > 0) {
        const { data, error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', profile.id)
            .select()
            .maybeSingle();

        if (!error) {
            if (data) return mapProfile(data as Record<string, unknown> | null);
            return upsertProfilePayload();
        }
        if (!isMissingColumnError(error)) throw error;

        const missingColumn = extractMissingColumnName(error.message);
        if (!missingColumn || !(missingColumn in payload)) throw error;
        delete payload[missingColumn as keyof Profile];
    }

    return upsertProfilePayload();
};

const upsertProfileWithSchemaFallback = async (payload: Record<string, unknown>) => {
    const nextPayload = { ...payload };

    while (Object.keys(nextPayload).length > 0) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert([nextPayload], { onConflict: 'id' })
            .select()
            .maybeSingle();

        if (!error) return mapProfile(data as Record<string, unknown> | null);
        if (!isMissingColumnError(error)) throw error;

        const missingColumn = extractMissingColumnName(error.message);
        if (!missingColumn || !(missingColumn in nextPayload)) throw error;
        delete nextPayload[missingColumn];
    }

    return null;
};

const updateProfileWithSchemaFallback = async (profileId: string, payload: Record<string, unknown>) => {
    const nextPayload = { ...payload };

    while (Object.keys(nextPayload).length > 0) {
        const { data, error } = await supabase
            .from('profiles')
            .update(nextPayload)
            .eq('id', profileId)
            .select()
            .maybeSingle();

        if (!error) return mapProfile(data as Record<string, unknown> | null);
        if (!isMissingColumnError(error)) throw error;

        const missingColumn = extractMissingColumnName(error.message);
        if (!missingColumn || !(missingColumn in nextPayload)) throw error;
        delete nextPayload[missingColumn];
    }

    return getProfile(profileId);
};

const insertVerificationWithSchemaFallback = async (payload: Record<string, unknown>) => {
    const nextPayload = { ...payload };

    while (Object.keys(nextPayload).length > 0) {
        const { data, error } = await supabase
            .from('verification')
            .insert([nextPayload])
            .select()
            .maybeSingle();

        if (!error) return data as VerificationRecord | null;
        if (!isMissingColumnError(error)) throw error;

        const missingColumn = extractMissingColumnName(error.message);
        if (!missingColumn || !(missingColumn in nextPayload)) throw error;
        delete nextPayload[missingColumn];
    }

    return null;
};

const writePostWithSchemaFallback = async (
    payload: Record<string, unknown>,
    listingId?: string
) => {
    const nextPayload = { ...payload };
    let attemptCount = 0;
    let idLikelyNumeric = false;
    let numericIdSeed = Math.floor((Date.now() / 1000) % 2_000_000_000);

    while (Object.keys(nextPayload).length > 0) {
        attemptCount += 1;
        if (attemptCount > 30) {
            throw {
                code: 'POST_WRITE_RETRY_LIMIT',
                message: 'Could not write listing after multiple schema fallback attempts.',
            };
        }

        const result = listingId
            ? await supabase
                .from('posts')
                .update(nextPayload)
                .eq('id', listingId)
                .select()
                .maybeSingle()
            : await supabase
                .from('posts')
                .insert([nextPayload])
                .select()
                .maybeSingle();

        if (!result.error) return result.data as PostRecord | null;

        if (isMissingColumnError(result.error)) {
            const missingColumn = extractMissingColumnName(result.error.message);
            if (!missingColumn || !(missingColumn in nextPayload)) throw result.error;
            if (missingColumn === 'id' && !listingId) {
                nextPayload.id = nextPayload.id || crypto.randomUUID();
                continue;
            }
            delete nextPayload[missingColumn];
            continue;
        }

        if (result.error.code === '23502') {
            const notNullColumn = extractNotNullColumnName(result.error.message);
            if (!notNullColumn) throw result.error;

            if (notNullColumn === 'id' && idLikelyNumeric && !listingId) {
                numericIdSeed += 1;
                nextPayload.id = numericIdSeed;
                continue;
            }

            const fallback = getPostFallbackValue(notNullColumn, nextPayload);
            if (fallback === undefined) throw result.error;
            nextPayload[notNullColumn] = fallback;
            continue;
        }

        if (
            result.error.code === '22P02'
            && typeof result.error.message === 'string'
            && result.error.message.toLowerCase().includes('invalid input syntax')
            && result.error.message.toLowerCase().includes('id')
            && 'id' in nextPayload
        ) {
            const lowerMessage = result.error.message.toLowerCase();
            if (
                lowerMessage.includes('smallint')
                || lowerMessage.includes('integer')
                || lowerMessage.includes('bigint')
            ) {
                idLikelyNumeric = true;
                numericIdSeed += 1;
                nextPayload.id = numericIdSeed;
                continue;
            }

            delete nextPayload.id;
            continue;
        }

        if (
            result.error.code === '23505'
            && !listingId
            && idLikelyNumeric
            && typeof nextPayload.id === 'number'
            && typeof result.error.message === 'string'
            && result.error.message.toLowerCase().includes('posts_pkey')
        ) {
            numericIdSeed = Number(nextPayload.id) + 1;
            nextPayload.id = numericIdSeed;
            continue;
        }

        if (result.error.code === '23514') {
            const constraintName = extractCheckConstraintName(result.error.message)?.toLowerCase() || '';
            if (constraintName.includes('status')) {
                nextPayload.status = 'published';
                continue;
            }
            if (constraintName.includes('category')) {
                const normalizedCategory = String(nextPayload.type || 'activity');
                nextPayload.category = normalizedCategory;
                nextPayload.sub_category = normalizedCategory;
                continue;
            }
        }

        throw result.error;
    }

    return null;
};

export const createOrUpdateProfileFromSignup = async (userId: string, input: SignupInput) => {
    const roleConfig = ROLE_SIGNUP_CONFIG[input.role];
    const verificationStatus: VerificationStatus = roleConfig.requiresVerification ? 'pending' : 'not_required';

    const payload: Record<string, unknown> = {
        id: userId,
        email: input.email,
        full_name: input.fullName,
        phone: input.phone,
        country: input.country,
        city: input.city,
        bio: input.bio || null,
        role: input.role,
        is_verified: input.role === 'tourist',
        verification_status: verificationStatus,
        company_name: input.companyName || null,
        works_under_company: !!input.worksUnderCompany,
        website: input.website || null,
        provider_specialties: input.specialties || null,
        guide_license_number: input.licenseNumber || null,
        certificate_id: input.certificateId || null,
        government_id_ref: input.governmentId || null,
        years_experience: input.yearsExperience ? Number(input.yearsExperience) : null,
        languages: splitLanguages(input.languages),
    };

    return upsertProfileWithSchemaFallback(payload);
};

export const submitVerificationApplication = async (userId: string, input: SignupInput) => {
    if (!isProviderRole(input.role)) return null;

    let existingResult = await supabase
        .from('verification')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (isMissingSpecificColumnError(existingResult.error, 'updated_at')) {
        existingResult = await supabase
            .from('verification')
            .select('*')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .maybeSingle();
    }

    if (isMissingColumnError(existingResult.error)) {
        existingResult = await supabase
            .from('verification')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
    }

    if (!existingResult.error && existingResult.data) {
        return existingResult.data as VerificationRecord;
    }

    const now = new Date().toISOString();
    const payload: Record<string, unknown> = {
        id: crypto.randomUUID(),
        user_id: userId,
        role: input.role,
        verification_type: 'account',
        owner_name: input.fullName || input.email.split('@')[0] || 'Provider',
        owner_id_card_url: input.governmentId || '',
        status: 'pending',
        submitted_at: now,
        updated_at: now,
        company_name: input.companyName || null,
        website: input.website || null,
        registration_number: input.registrationNumber || null,
        works_under_company: !!input.worksUnderCompany,
        specialties: input.specialties || null,
        license_number: input.licenseNumber || null,
        languages: splitLanguages(input.languages),
        years_experience: input.yearsExperience ? Number(input.yearsExperience) : null,
        certificate_id: input.certificateId || null,
        government_id_ref: input.governmentId || null,
        bio: input.bio || null,
        rejection_reason: null,
        reviewed_at: null,
        reviewed_by: null,
    };

    const createdVerification = await insertVerificationWithSchemaFallback(payload);
    if (createdVerification) {
        await createNotification({
            userId,
            actorUserId: userId,
            type: 'verification_submitted',
            title: 'Verification submitted',
            body: 'Your verification request is in review.',
            metadata: { verification_id: createdVerification.id, route: '/profile' },
        });
        await notifyAdmins({
            actorUserId: userId,
            type: 'verification_submitted',
            title: 'New verification request',
            body: `${input.fullName || input.email.split('@')[0] || 'Provider'} submitted account verification.`,
            metadata: { verification_id: createdVerification.id, target_user_id: userId, route: '/admin' },
        });
    }

    return createdVerification;
};

export const ensureProviderVerificationRecord = async (
    userId: string,
    profile: Profile | null | undefined
) => {
    if (!profile?.role || !isProviderRole(profile.role)) return null;

    const existing = await getLatestVerification(userId);
    if (existing) return existing;

    const now = new Date().toISOString();
    const payload: Record<string, unknown> = {
        id: crypto.randomUUID(),
        user_id: userId,
        role: profile.role,
        verification_type: 'account',
        owner_name: profile.full_name || profile.email?.split('@')[0] || 'Provider',
        owner_id_card_url: profile.government_id_ref || '',
        status: 'pending',
        submitted_at: now,
        updated_at: now,
        company_name: profile.company_name || null,
        website: profile.website || null,
        works_under_company: !!profile.works_under_company,
        specialties: profile.provider_specialties || null,
        license_number: profile.guide_license_number || null,
        languages: splitLanguages(profile.languages),
        years_experience: profile.years_experience || null,
        certificate_id: profile.certificate_id || null,
        government_id_ref: profile.government_id_ref || null,
        bio: profile.bio || null,
        rejection_reason: null,
        reviewed_at: null,
        reviewed_by: null,
    };

    const data = await insertVerificationWithSchemaFallback(payload);

    await updateProfileWithSchemaFallback(userId, {
        verification_status: 'pending',
        is_verified: false,
    });

    if (data) {
        await createNotification({
            userId,
            actorUserId: userId,
            type: 'verification_submitted',
            title: 'Verification submitted',
            body: 'Your verification request is in review.',
            metadata: { verification_id: data.id, route: '/profile' },
        });
        await notifyAdmins({
            actorUserId: userId,
            type: 'verification_submitted',
            title: 'New verification request',
            body: `${profile.full_name || profile.email || 'Provider'} submitted account verification.`,
            metadata: { verification_id: data.id, target_user_id: userId, route: '/admin' },
        });
    }

    return data;
};

export const signUpWithRole = async (input: SignupInput) => {
    const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
            data: {
                full_name: input.fullName,
                role: input.role,
                phone: input.phone,
                country: input.country,
                city: input.city,
                bio: input.bio || null,
                company_name: input.companyName || null,
                registration_number: input.registrationNumber || null,
                website: input.website || null,
                specialties: input.specialties || null,
                license_number: input.licenseNumber || null,
                languages: input.languages || null,
                years_experience: input.yearsExperience ? Number(input.yearsExperience) : null,
                government_id_ref: input.governmentId || null,
                certificate_id: input.certificateId || null,
                works_under_company: !!input.worksUnderCompany,
            },
        },
    });

    if (error) throw error;
    if (!data.user) return data;

    try {
        await createOrUpdateProfileFromSignup(data.user.id, input);
    } catch (profileErr) {
        if (data.session) throw profileErr;
        console.error('Failed to submit profile during signup (will retry on first login):', profileErr);
    }
    try {
        await submitVerificationApplication(data.user.id, input);
    } catch (verificationErr) {
        console.error('Failed to submit verification application during signup (will retry on first login):', verificationErr);
    }
    return data;
};

export const getBookings = async (userId: string): Promise<UnifiedBooking[]> => {
    const unified = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (!unified.error && unified.data) {
        return safeArray(unified.data as Record<string, unknown>[]).map(mapUnifiedBooking);
    }

    const legacy = await supabase
        .from('bookings_acts')
        .select(`
            id,
            activity_id,
            number_of_people,
            price,
            total_price,
            status,
            created_at,
            activities:activity_id (
                title,
                image_url
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (legacy.error) {
        console.error('Error fetching bookings:', legacy.error);
        return [];
    }

    return safeArray(legacy.data as LegacyBookingRow[]).map((booking) => ({
        id: booking.id,
        listing_id: booking.activity_id,
        listing_type: 'activity',
        listing_title: booking.activities?.title || 'Unknown Experience',
        listing_image: booking.activities?.image_url || DEFAULT_BOOKING_IMAGE,
        number_of_people: booking.number_of_people,
        unit_price: booking.price,
        total_price: booking.total_price,
        status: normalizeBookingStatus(booking.status),
        payment_status: 'pending',
        created_at: booking.created_at,
    }));
};

export const getProviderBookings = async (userId: string): Promise<UnifiedBooking[]> => {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching provider bookings:', error);
        return [];
    }

    return safeArray(data as Record<string, unknown>[]).map(mapUnifiedBooking);
};

export const getFavorites = async (userId: string): Promise<FavoriteRecord[]> => {
    let result = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (isMissingSpecificColumnError(result.error, 'created_at')) {
        result = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId);
    }

    const { data, error } = result;

    if (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }

    return safeArray(data as Record<string, unknown>[])
        .map((row) => mapFavoriteRow(row))
        .filter((row): row is FavoriteRecord => Boolean(row));
};

export const isListingFavorited = async (
    userId: string,
    listingId: string | number,
    listingType: ListingType
): Promise<boolean> => {
    const normalizedListingId = normalizeFavoriteLookupId(listingId);
    const favorites = await getFavorites(userId);
    if (!favorites.length) return false;

    const normalizedRequestedType = normalizeListingType(listingType);
    return favorites.some((favorite) => {
        if (normalizeFavoriteLookupId(favorite.listing_id) !== normalizedListingId) return false;
        if (!favorite.has_explicit_type) return true;
        return normalizeListingType(favorite.listing_type) === normalizedRequestedType;
    });
};

export const addListingFavorite = async (
    userId: string,
    listingId: string | number,
    listingType: ListingType
) => {
    const normalizedListingId = normalizeFavoriteLookupId(listingId);
    const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

    if (roleError) throw roleError;
    if ((roleData as { role?: string } | null)?.role !== 'tourist') {
        throw new Error('Only tourist accounts can add favorites.');
    }

    const alreadyFavorited = await isListingFavorited(userId, normalizedListingId, listingType);
    if (alreadyFavorited) return true;

    const typeValues = getFavoriteTypeValues(listingType);
    const numericListingId = /^[0-9]+$/.test(normalizedListingId) ? Number(normalizedListingId) : null;
    const idValueCandidates: Array<string | number> = numericListingId === null
        ? [normalizedListingId]
        : [normalizedListingId, numericListingId];
    let lastError: { code?: string; message?: string } | null = null;

    for (const idColumn of getOrderedFavoriteIdColumns()) {
        for (const typeColumn of getOrderedFavoriteTypeColumns()) {
            const values = typeColumn ? typeValues : [null];

            for (const typeValue of values) {
                for (const idValue of idValueCandidates) {
                    const payload: Record<string, unknown> = {
                        user_id: userId,
                        [idColumn]: idValue,
                    };

                    if (typeColumn && typeValue) {
                        payload[typeColumn] = typeValue;
                    }

                    const { error } = await supabase.from('favorites').insert([payload]).select('id').limit(1);
                    if (!error) {
                        rememberFavoriteSchemaHints(idColumn, typeColumn, typeValue);
                        return true;
                    }

                    if (error.code === '23505') return true;

                    if (
                        isMissingSpecificColumnError(error, idColumn)
                        || (typeColumn && isMissingSpecificColumnError(error, typeColumn))
                        || isInvalidUuidInputError(error)
                    ) {
                        continue;
                    }

                    lastError = error;
                }
            }
        }
    }

    if (lastError) throw lastError;
    throw new Error('Favorites schema is not compatible with this listing.');
};

export const removeListingFavorite = async (
    userId: string,
    listingId: string | number,
    listingType: ListingType
) => {
    const normalizedListingId = normalizeFavoriteLookupId(listingId);
    const favorites = await getFavorites(userId);
    if (!favorites.length) return true;

    const normalizedRequestedType = normalizeListingType(listingType);
    const targetFavoriteIds = favorites
        .filter((favorite) => {
            if (normalizeFavoriteLookupId(favorite.listing_id) !== normalizedListingId) return false;
            if (!favorite.has_explicit_type) return true;
            return normalizeListingType(favorite.listing_type) === normalizedRequestedType;
        })
        .map((favorite) => favorite.id);

    if (!targetFavoriteIds.length) return true;

    const { error } = await supabase
        .from('favorites')
        .delete()
        .in('id', targetFavoriteIds);

    if (error) {
        throw error;
    }
    return true;
};

export const getFavoriteListings = async (userId: string): Promise<FavoriteListingRecord[]> => {
    const favoriteRows = await getFavorites(userId);
    if (!favoriteRows.length) return [];

    const rows = await Promise.all(
        favoriteRows.map(async (favorite) => {
            const primaryType = normalizeListingType(favorite.listing_type);
            const candidateTypes = uniqueValues<ListingType>([
                primaryType,
                'activity',
                'tour',
                'guide',
            ]);

            let listing: PostRecord | null = null;
            let resolvedType: ListingType = primaryType;

            for (const candidateType of candidateTypes) {
                const found = await getListingById(favorite.listing_id, candidateType);
                if (found) {
                    listing = found;
                    resolvedType = normalizeListingType(
                        typeof found.type === 'string' ? found.type : candidateType
                    );
                    break;
                }
            }

            if (!listing) {
                listing = await getListingById(favorite.listing_id);
                if (listing) {
                    resolvedType = normalizeListingType(typeof listing.type === 'string' ? listing.type : primaryType);
                }
            }

            if (!listing) return null;

            const title = getListingTitleFromPost(listing);
            const image = getListingImageFromPost(listing);
            const location = typeof listing.location === 'string' && listing.location.trim()
                ? listing.location
                : 'Location unavailable';
            const price = typeof listing.price === 'number' ? listing.price : null;

            return {
                favorite_id: favorite.id,
                listing_id: favorite.listing_id,
                listing_type: resolvedType,
                title,
                image_url: image,
                location,
                price,
                created_at: favorite.created_at,
            } as FavoriteListingRecord;
        })
    );

    return rows.filter((row): row is FavoriteListingRecord => Boolean(row));
};

export const getConversations = async (userId: string): Promise<ConversationRecord[]> => {
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`traveler_id.eq.${userId},provider_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }

    return safeArray(data) as ConversationRecord[];
};

export interface CreateNotificationInput {
    userId: string;
    type: AppNotificationType;
    title: string;
    body?: string | null;
    metadata?: Record<string, unknown> | null;
    actorUserId?: string | null;
}

const getAdminUserIds = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

    if (error) {
        console.error('Error fetching admin profiles for notifications:', error);
        return [];
    }

    return safeArray(data as Array<{ id?: unknown }>).flatMap((row) => (
        typeof row.id === 'string' && row.id ? [row.id] : []
    ));
};

export const createNotifications = async (
    inputs: CreateNotificationInput[]
): Promise<AppNotificationRecord[]> => {
    const dedupedRows = Array.from(
        new Map(
            inputs
                .filter((item) => Boolean(item.userId && item.title))
                .map((item) => [`${item.userId}:${item.type}:${item.title}`, item])
        ).values()
    ).map((item) => ({
        user_id: item.userId,
        actor_user_id: item.actorUserId || item.userId,
        type: item.type,
        title: item.title,
        body: item.body || null,
        metadata: item.metadata || null,
        is_read: false,
        read_at: null,
    }));

    if (dedupedRows.length === 0) return [];

    const { data, error } = await supabase
        .from('notifications')
        .insert(dedupedRows)
        .select('*');

    if (error) {
        if (isMissingNotificationsError(error) || isMissingColumnError(error)) {
            console.warn('Notifications table/policies are not ready yet. Apply docs/supabase-role-system.sql.');
            return [];
        }
        console.error('Failed to insert notifications:', error);
        return [];
    }

    return safeArray(data as Array<Record<string, unknown>>)
        .map((row) => mapNotificationRecord(row))
        .filter((row): row is AppNotificationRecord => Boolean(row));
};

export const createNotification = async (
    input: CreateNotificationInput
): Promise<AppNotificationRecord | null> => {
    const rows = await createNotifications([input]);
    return rows[0] || null;
};

export const notifyAdmins = async (
    input: Omit<CreateNotificationInput, 'userId'>
) => {
    const adminIds = await getAdminUserIds();
    if (!adminIds.length) return [];
    return createNotifications(adminIds.map((adminId) => ({ ...input, userId: adminId })));
};

export const getNotifications = async (
    userId: string,
    limit = 120
): Promise<AppNotificationRecord[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        if (isMissingNotificationsError(error) || isMissingColumnError(error)) {
            return [];
        }
        console.error('Failed to fetch notifications:', error);
        return [];
    }

    return safeArray(data as Array<Record<string, unknown>>)
        .map((row) => mapNotificationRecord(row))
        .filter((row): row is AppNotificationRecord => Boolean(row));
};

export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
    if (!userId) return 0;
    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        if (isMissingNotificationsError(error) || isMissingColumnError(error)) {
            return 0;
        }
        console.error('Failed to fetch unread notification count:', error);
        return 0;
    }

    return count || 0;
};

export const markNotificationRead = async (userId: string, notificationId: string) => {
    if (!userId || !notificationId) return;
    const now = new Date().toISOString();
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('id', notificationId)
        .eq('user_id', userId);

    if (error && !isMissingNotificationsError(error) && !isMissingColumnError(error)) {
        throw error;
    }
};

export const markNotificationUnread = async (userId: string, notificationId: string) => {
    if (!userId || !notificationId) return;
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: false, read_at: null })
        .eq('id', notificationId)
        .eq('user_id', userId);

    if (error && !isMissingNotificationsError(error) && !isMissingColumnError(error)) {
        throw error;
    }
};

export const markAllNotificationsRead = async (userId: string) => {
    if (!userId) return;
    const now = new Date().toISOString();
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: now })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error && !isMissingNotificationsError(error) && !isMissingColumnError(error)) {
        throw error;
    }
};

export const getConversationByUsers = async (
    currentUserId: string,
    otherUserId: string
): Promise<ConversationRecord | null> => {
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(
            `and(traveler_id.eq.${currentUserId},provider_id.eq.${otherUserId}),and(traveler_id.eq.${otherUserId},provider_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching conversation by users:', error);
        return null;
    }

    return data as ConversationRecord | null;
};

export const getOrCreateConversation = async (
    currentUserId: string,
    otherUserId: string
): Promise<ConversationRecord> => {
    if (currentUserId === otherUserId) {
        throw new Error('Cannot create a conversation with yourself.');
    }

    const existing = await getConversationByUsers(currentUserId, otherUserId);
    if (existing) return existing;

    const { data, error } = await supabase
        .from('conversations')
        .insert([{
            traveler_id: currentUserId,
            provider_id: otherUserId,
        }])
        .select('*')
        .maybeSingle();

    if (error || !data) throw error || new Error('Failed to create conversation.');
    return data as ConversationRecord;
};

export const getConversationMessages = async (
    conversationId: string
): Promise<ConversationMessageRecord[]> => {
    const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) {
        if (error.code === 'PGRST205' || error.message?.toLowerCase().includes('conversation_messages')) {
            return [];
        }
        console.error('Error fetching conversation messages:', error);
        return [];
    }

    return safeArray(data) as ConversationMessageRecord[];
};

export const sendConversationMessage = async (input: {
    conversation_id: string;
    sender_user_id: string;
    body: string;
}): Promise<ConversationMessageRecord | null> => {
    const { data, error } = await supabase
        .from('conversation_messages')
        .insert([{
            conversation_id: input.conversation_id,
            sender_user_id: input.sender_user_id,
            body: input.body.trim(),
        }])
        .select('*')
        .maybeSingle();

    if (error) throw error;

    const message = (data as ConversationMessageRecord | null) || null;
    if (message) {
        const { data: conversationData, error: conversationError } = await supabase
            .from('conversations')
            .select('id, traveler_id, provider_id')
            .eq('id', input.conversation_id)
            .maybeSingle();

        if (!conversationError && conversationData) {
            const receiverUserId = conversationData.traveler_id === input.sender_user_id
                ? conversationData.provider_id
                : conversationData.traveler_id;
            if (receiverUserId && receiverUserId !== input.sender_user_id) {
                const senderProfile = await getUserProfileById(input.sender_user_id);
                const senderName = senderProfile?.full_name || senderProfile?.email || 'A user';
                await createNotification({
                    userId: receiverUserId,
                    actorUserId: input.sender_user_id,
                    type: 'message_new',
                    title: `New message from ${senderName}`,
                    body: input.body.trim().slice(0, 140),
                    metadata: {
                        conversation_id: input.conversation_id,
                        sender_user_id: input.sender_user_id,
                        route: `/messages?conversation=${input.conversation_id}`,
                    },
                });
            }
        }
    }

    return message;
};

export const getUserProfileById = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }

    return mapProfile(data as Record<string, unknown> | null);
};

export const getLatestVerification = async (userId: string): Promise<VerificationRecord | null> => {
    let result = await supabase
        .from('verification')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (isMissingSpecificColumnError(result.error, 'updated_at')) {
        result = await supabase
            .from('verification')
            .select('*')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .maybeSingle();
    }

    if (isMissingColumnError(result.error)) {
        result = await supabase
            .from('verification')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
    }

    const { data, error } = result;

    if (error) {
        console.error('Error fetching verification:', error);
        return null;
    }

    return data as VerificationRecord | null;
};

export const resubmitVerificationApplication = async (userId: string) => {
    const latest = await getLatestVerification(userId);
    if (!latest) {
        throw new Error('No verification request found to resubmit.');
    }

    const now = new Date().toISOString();
    const nextStatus: VerificationStatus = 'resubmitted';

    const verificationPayload: Record<string, unknown> = {
        status: nextStatus,
        updated_at: now,
        rejection_reason: null,
        reviewed_at: null,
        reviewed_by: null,
    };
    let verificationUpdate: {
        data: VerificationRecord | null;
        error: { code?: string; message?: string } | null;
    } = { data: null, error: null };

    while (Object.keys(verificationPayload).length > 0) {
        const result = await supabase
            .from('verification')
            .update(verificationPayload)
            .eq('id', latest.id)
            .select()
            .maybeSingle();

        if (!result.error) {
            verificationUpdate = {
                data: result.data as VerificationRecord | null,
                error: null,
            };
            break;
        }
        if (!isMissingColumnError(result.error)) {
            verificationUpdate = { data: null, error: result.error };
            break;
        }

        const missingColumn = extractMissingColumnName(result.error.message);
        if (!missingColumn || !(missingColumn in verificationPayload)) {
            verificationUpdate = { data: null, error: result.error };
            break;
        }
        delete verificationPayload[missingColumn];
    }

    if (verificationUpdate.error) throw verificationUpdate.error;

    const profileUpdate = await updateProfileWithSchemaFallback(userId, {
        verification_status: nextStatus,
        is_verified: false,
    });

    await writeModerationAuditLog({
        entityType: 'verification',
        entityId: latest.id,
        action: 'resubmitted',
        actorUserId: userId,
        targetUserId: userId,
        metadata: {
            role: latest.role,
            companyName: latest.company_name || null,
        },
    });

    await createNotification({
        userId,
        actorUserId: userId,
        type: 'verification_resubmitted',
        title: 'Verification resubmitted',
        body: 'Your verification request was sent back to admin review.',
        metadata: { verification_id: latest.id, route: '/profile' },
    });
    await notifyAdmins({
        actorUserId: userId,
        type: 'verification_resubmitted',
        title: 'Verification resubmitted',
        body: `${latest.company_name || 'Provider'} resubmitted verification.`,
        metadata: { verification_id: latest.id, target_user_id: userId, route: '/admin' },
    });

    return {
        verification: verificationUpdate.data as VerificationRecord | null,
        profile: profileUpdate,
    };
};

export const getVerificationQueue = async (): Promise<VerificationRecord[]> => {
    const attempts: Array<PromiseLike<{
        data: unknown[] | null;
        error: { code?: string; message?: string } | null;
    }>> = [
        supabase
            .from('verification')
            .select('*')
            .order('updated_at', { ascending: false }),
        supabase
            .from('verification')
            .select('*')
            .order('submitted_at', { ascending: false }),
        supabase
            .from('verification')
            .select('*')
            .order('created_at', { ascending: false }),
        supabase
            .from('verification')
            .select('*'),
    ];

    let verificationRows: unknown[] | null = null;
    let lastError: { code?: string; message?: string } | null = null;

    for (const attempt of attempts) {
        const { data, error } = await attempt;
        if (!error) {
            verificationRows = data;
            lastError = null;
            break;
        }
        lastError = error;
    }

    if (lastError) {
        console.error('Error fetching verification queue:', lastError);
        verificationRows = [];
    }

    const items = safeArray(verificationRows as VerificationRecord[]);

    const userIds = Array.from(new Set(items.map((item) => item.user_id).filter(Boolean)));
    const profileMap = new Map<string, Profile>();

    if (userIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

        if (profileError) {
            console.error('Error fetching profiles for verification queue:', profileError);
        } else {
            for (const row of safeArray(profileRows as Record<string, unknown>[])) {
                const mapped = mapProfile(row);
                if (mapped?.id) profileMap.set(mapped.id, mapped);
            }
        }
    }

    const normalizedFromVerification = items.map((item) => ({
        ...item,
        profiles: profileMap.get(item.user_id) || null,
    }));

    const coveredUserIds = new Set(normalizedFromVerification.map((item) => item.user_id));
    const providerProfilesResult = await supabase
        .from('profiles')
        .select('*')
        .in('role', Array.from(PROVIDER_ROLES));

    const { data: pendingProfiles, error: pendingProfilesError } = providerProfilesResult;

    if (pendingProfilesError) {
        console.error('Error fetching fallback provider profiles for verification queue:', pendingProfilesError);
        return normalizedFromVerification;
    }

    const fallbackRows = safeArray(pendingProfiles as Record<string, unknown>[])
        .map((row) => mapProfile(row))
        .filter((profile): profile is Profile => Boolean(profile?.id && profile?.role && isProviderRole(profile.role)))
        .filter((profile) => (
            profile.verification_status === 'pending'
            || profile.verification_status === 'rejected'
            || profile.verification_status === 'resubmitted'
            || profile.is_verified === false
        ))
        .filter((profile) => !coveredUserIds.has(profile.id))
        .map((profile) => ({
            id: `profile-${profile.id}`,
            user_id: profile.id,
            role: profile.role as UserRole,
            status: (profile.verification_status || 'pending') as VerificationStatus,
            company_name: profile.company_name || null,
            website: profile.website || null,
            works_under_company: !!profile.works_under_company,
            specialties: profile.provider_specialties || null,
            license_number: profile.guide_license_number || null,
            languages: Array.isArray(profile.languages)
                ? profile.languages
                : typeof profile.languages === 'string'
                    ? profile.languages.split(',').map((item) => item.trim()).filter(Boolean)
                    : null,
            years_experience: profile.years_experience || null,
            certificate_id: profile.certificate_id || null,
            government_id_ref: profile.government_id_ref || null,
            bio: profile.bio || null,
            rejection_reason: null,
            reviewed_at: null,
            reviewed_by: null,
            submitted_at: profile.created_at,
            updated_at: profile.updated_at || profile.created_at,
            profiles: profile,
        } as VerificationRecord));

    return [...normalizedFromVerification, ...fallbackRows];
};

export const reviewVerificationApplication = async (
    application: VerificationRecord,
    status: 'approved' | 'rejected',
    options?: { reason?: string; reviewerId?: string }
) => {
    const now = new Date().toISOString();
    const isProfileFallbackRow = typeof application.id === 'string' && application.id.startsWith('profile-');

    if (isProfileFallbackRow) {
        const profileUpdate = await updateProfileWithSchemaFallback(application.user_id, {
            role: application.role,
            is_verified: status === 'approved',
            verification_status: status,
            company_name: application.company_name || null,
            website: application.website || null,
            provider_specialties: application.specialties || null,
            guide_license_number: application.license_number || null,
            certificate_id: application.certificate_id || null,
            government_id_ref: application.government_id_ref || null,
            years_experience: application.years_experience || null,
            languages: application.languages || null,
            bio: application.bio || null,
            works_under_company: application.works_under_company || false,
        });

        await writeModerationAuditLog({
            entityType: 'verification',
            entityId: application.id,
            action: status,
            actorUserId: options?.reviewerId,
            targetUserId: application.user_id,
            reason: status === 'rejected' ? options?.reason || null : null,
            metadata: {
                role: application.role,
                companyName: application.company_name || null,
                reviewedAt: now,
                source: 'profiles-fallback',
            },
        });

        await createNotification({
            userId: application.user_id,
            actorUserId: options?.reviewerId || application.user_id,
            type: status === 'approved' ? 'verification_approved' : 'verification_rejected',
            title: status === 'approved' ? 'Verification approved' : 'Verification rejected',
            body: status === 'approved'
                ? 'Your account is verified and fully active.'
                : `Admin requested updates before approval.${options?.reason ? ` Reason: ${options.reason}` : ''}`,
            metadata: { verification_id: application.id, route: '/profile' },
        });

        return {
            verification: null,
            profile: profileUpdate,
        };
    }

    const verificationPayload: Record<string, unknown> = {
        status,
        updated_at: now,
        rejection_reason: status === 'rejected' ? options?.reason || null : null,
        reviewed_at: now,
        reviewed_by: options?.reviewerId || null,
    };
    let verificationUpdate: {
        data: VerificationRecord | null;
        error: { code?: string; message?: string } | null;
    } = { data: null, error: null };

    while (Object.keys(verificationPayload).length > 0) {
        const result = await supabase
            .from('verification')
            .update(verificationPayload)
            .eq('id', application.id)
            .select()
            .maybeSingle();

        if (!result.error) {
            verificationUpdate = {
                data: result.data as VerificationRecord | null,
                error: null,
            };
            break;
        }
        if (!isMissingColumnError(result.error)) {
            verificationUpdate = { data: null, error: result.error };
            break;
        }

        const missingColumn = extractMissingColumnName(result.error.message);
        if (!missingColumn || !(missingColumn in verificationPayload)) {
            verificationUpdate = { data: null, error: result.error };
            break;
        }
        delete verificationPayload[missingColumn];
    }

    if (verificationUpdate.error) throw verificationUpdate.error;

    const profileUpdate = await updateProfileWithSchemaFallback(application.user_id, {
        role: application.role,
        is_verified: status === 'approved',
        verification_status: status,
        company_name: application.company_name || null,
        website: application.website || null,
        provider_specialties: application.specialties || null,
        guide_license_number: application.license_number || null,
        certificate_id: application.certificate_id || null,
        government_id_ref: application.government_id_ref || null,
        years_experience: application.years_experience || null,
        languages: application.languages || null,
        bio: application.bio || null,
        works_under_company: application.works_under_company || false,
    });

    await writeModerationAuditLog({
        entityType: 'verification',
        entityId: application.id,
        action: status,
        actorUserId: options?.reviewerId,
        targetUserId: application.user_id,
        reason: status === 'rejected' ? options?.reason || null : null,
        metadata: {
            role: application.role,
            companyName: application.company_name || null,
            reviewedAt: now,
        },
    });

    await createNotification({
        userId: application.user_id,
        actorUserId: options?.reviewerId || application.user_id,
        type: status === 'approved' ? 'verification_approved' : 'verification_rejected',
        title: status === 'approved' ? 'Verification approved' : 'Verification rejected',
        body: status === 'approved'
            ? 'Your account is verified and fully active.'
            : `Admin requested updates before approval.${options?.reason ? ` Reason: ${options.reason}` : ''}`,
        metadata: { verification_id: application.id, route: '/profile' },
    });

    return {
        verification: verificationUpdate.data as VerificationRecord | null,
        profile: profileUpdate,
    };
};

const writeModerationAuditLog = async (entry: {
    entityType: ModerationAuditLogRecord['entity_type'];
    entityId: string;
    action: ModerationAuditLogRecord['action'];
    actorUserId?: string | null;
    targetUserId?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown> | null;
}) => {
    const { error } = await supabase
        .from('moderation_audit_logs')
        .insert([{
            entity_type: entry.entityType,
            entity_id: entry.entityId,
            action: entry.action,
            actor_user_id: entry.actorUserId || null,
            target_user_id: entry.targetUserId || null,
            reason: entry.reason || null,
            metadata: entry.metadata || null,
        }]);

    if (error && !isMissingRelationError(error)) {
        console.error('Error writing moderation audit log:', error);
    }
};

export const getModerationAuditLogs = async (limit = 12): Promise<ModerationAuditLogRecord[]> => {
    const { data, error } = await supabase
        .from('moderation_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        if (!isMissingRelationError(error)) {
            console.error('Error fetching moderation audit logs:', error);
        }
        return [];
    }

    return safeArray(data) as ModerationAuditLogRecord[];
};

export const getAllowedListingTypes = (role: UserRole | null | undefined): ListingType[] => {
    if (!role) return [];
    return ROLE_SIGNUP_CONFIG[role].allowedListingTypes;
};

export const getProviderCapabilitySummary = (role: UserRole | null | undefined) => {
    const listingTypes = getAllowedListingTypes(role);
    if (!role || listingTypes.length === 0) return 'Bookings, favorites, reviews, and provider chat';
    return `Can publish ${listingTypes.map((type) => (type === 'guide' ? 'event' : type)).join(', ')} listings after account verification`;
};

export const canCreateListing = (role: UserRole | null | undefined, type: ListingType) => canRolePublish(role, type);
