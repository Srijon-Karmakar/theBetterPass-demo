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
    created_at?: string;
}

export interface ConversationRecord {
    id: string;
    traveler_id?: string;
    provider_id?: string;
    booking_id?: string | null;
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

const normalizeListingType = (value: string | null | undefined): ListingType => {
    const normalized = (value || '').trim().toLowerCase();
    if (normalized === 'tour' || normalized === 'activity' || normalized === 'event') return normalized;
    return 'activity';
};

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
    type: 'event',
    sub_category: row.category,
    created_at: row.created_at || new Date().toISOString(),
    starts_at: row.starts_at,
    status: 'published',
});

const normalizeListingStatus = (value: ListingStatus | string | null | undefined): ListingStatus => {
    if (value === 'draft' || value === 'pending' || value === 'published' || value === 'rejected') {
        return value;
    }
    return 'published';
};

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
        console.error('Error fetching events:', error);
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
    const normalizedStatus = normalizeListingStatus(listing.status);
    const payload = {
        ...listing,
        status: normalizedStatus,
        rejection_reason: normalizedStatus === 'rejected' ? listing.rejection_reason || null : null,
        reviewed_at: null,
        reviewed_by: null,
    };

    if (listing.id) {
        const { data, error } = await supabase
            .from('posts')
            .update(payload)
            .eq('id', listing.id)
            .select()
            .maybeSingle();

        if (error) throw error;
        return data as PostRecord | null;
    }

    const { data, error } = await supabase
        .from('posts')
        .insert([payload])
        .select()
        .maybeSingle();

    if (error) throw error;
    return data as PostRecord | null;
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

    return data as PostRecord | null;
};

export const resubmitListing = async (listingId: string) => {
    const { data, error } = await supabase
        .from('posts')
        .update({
            status: 'published',
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

export const createBooking = async (booking: {
    user_id: string;
    activity_id?: string;
    listing_id?: string;
    listing_type?: ListingType;
    number_of_people: number;
    price?: number;
    unit_price?: number;
    total_price: number;
    status?: BookingStatus;
    payment_status?: PaymentStatus;
}) => {
    const unifiedPayload = {
        user_id: booking.user_id,
        listing_id: booking.listing_id || booking.activity_id,
        listing_type: booking.listing_type || 'activity',
        number_of_people: booking.number_of_people,
        unit_price: booking.unit_price ?? booking.price ?? 0,
        total_price: booking.total_price,
        status: booking.status || 'pending',
        payment_status: booking.payment_status || 'pending',
    };

    const unifiedInsert = await supabase.from('bookings').insert([unifiedPayload]).select();
    if (!unifiedInsert.error) return unifiedInsert.data;

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

    const { data: verificationData, error: verificationError } = await supabase
        .from('verification')
        .select('role, status')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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
    const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id)
        .select()
        .maybeSingle();

    if (error) throw error;
    return mapProfile(data as Record<string, unknown> | null);
};

export const createOrUpdateProfileFromSignup = async (userId: string, input: SignupInput) => {
    const roleConfig = ROLE_SIGNUP_CONFIG[input.role];
    const verificationStatus: VerificationStatus = roleConfig.requiresVerification ? 'pending' : 'not_required';

    const payload = {
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
        languages: input.languages
            ? input.languages.split(',').map((item) => item.trim()).filter(Boolean)
            : null,
    };

    const { data, error } = await supabase
        .from('profiles')
        .upsert(payload)
        .select()
        .maybeSingle();

    if (error) throw error;
    return mapProfile(data as Record<string, unknown> | null);
};

export const submitVerificationApplication = async (userId: string, input: SignupInput) => {
    if (!isProviderRole(input.role)) return null;

    const payload = {
        user_id: userId,
        role: input.role,
        status: 'pending',
        company_name: input.companyName || null,
        website: input.website || null,
        registration_number: input.registrationNumber || null,
        works_under_company: !!input.worksUnderCompany,
        specialties: input.specialties || null,
        license_number: input.licenseNumber || null,
        languages: input.languages
            ? input.languages.split(',').map((item) => item.trim()).filter(Boolean)
            : null,
        years_experience: input.yearsExperience ? Number(input.yearsExperience) : null,
        certificate_id: input.certificateId || null,
        government_id_ref: input.governmentId || null,
        bio: input.bio || null,
        rejection_reason: null,
        reviewed_at: null,
        reviewed_by: null,
    };

    const { data, error } = await supabase
        .from('verification')
        .insert([payload])
        .select()
        .maybeSingle();

    if (error) throw error;
    return data as VerificationRecord | null;
};

export const signUpWithRole = async (input: SignupInput) => {
    const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
            data: {
                full_name: input.fullName,
                role: input.role,
            },
        },
    });

    if (error) throw error;
    if (!data.user) return data;

    await createOrUpdateProfileFromSignup(data.user.id, input);
    await submitVerificationApplication(data.user.id, input);
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
    const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }

    return safeArray(data) as FavoriteRecord[];
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

export const getLatestVerification = async (userId: string): Promise<VerificationRecord | null> => {
    const { data, error } = await supabase
        .from('verification')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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

    const verificationUpdate = await supabase
        .from('verification')
        .update({
            status: nextStatus,
            updated_at: now,
            rejection_reason: null,
            reviewed_at: null,
            reviewed_by: null,
        })
        .eq('id', latest.id)
        .select()
        .maybeSingle();

    if (verificationUpdate.error) throw verificationUpdate.error;

    const profileUpdate = await supabase
        .from('profiles')
        .update({
            verification_status: nextStatus,
            is_verified: false,
        })
        .eq('id', userId)
        .select()
        .maybeSingle();

    if (profileUpdate.error) throw profileUpdate.error;

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

    return {
        verification: verificationUpdate.data as VerificationRecord | null,
        profile: mapProfile(profileUpdate.data as Record<string, unknown> | null),
    };
};

export const getVerificationQueue = async (): Promise<VerificationRecord[]> => {
    const { data, error } = await supabase
        .from('verification')
        .select(`
            *,
            profiles:user_id (
                id,
                full_name,
                email,
                phone,
                country,
                city,
                role,
                verification_status,
                company_name,
                website,
                bio,
                works_under_company
            )
        `)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching verification queue:', error);
        return [];
    }

    return safeArray(data as VerificationRecord[]).map((item) => ({
        ...item,
        profiles: item.profiles ? mapProfile(item.profiles as unknown as Record<string, unknown>) : null,
    }));
};

export const reviewVerificationApplication = async (
    application: VerificationRecord,
    status: 'approved' | 'rejected',
    options?: { reason?: string; reviewerId?: string }
) => {
    const now = new Date().toISOString();

    const verificationUpdate = await supabase
        .from('verification')
        .update({
            status,
            updated_at: now,
            rejection_reason: status === 'rejected' ? options?.reason || null : null,
            reviewed_at: now,
            reviewed_by: options?.reviewerId || null,
        })
        .eq('id', application.id)
        .select()
        .maybeSingle();

    if (verificationUpdate.error) throw verificationUpdate.error;

    const profileUpdate = await supabase
        .from('profiles')
        .update({
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
        })
        .eq('id', application.user_id)
        .select()
        .maybeSingle();

    if (profileUpdate.error) throw profileUpdate.error;

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

    return {
        verification: verificationUpdate.data as VerificationRecord | null,
        profile: mapProfile(profileUpdate.data as Record<string, unknown> | null),
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
    return `Can publish ${listingTypes.join(', ')} listings after approval`;
};

export const canCreateListing = (role: UserRole | null | undefined, type: ListingType) => canRolePublish(role, type);
