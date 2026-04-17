export const USER_ROLES = ['tourist', 'tour_company', 'tour_instructor', 'tour_guide', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PROVIDER_ROLES = ['tour_company', 'tour_instructor', 'tour_guide'] as const;
export type ProviderRole = (typeof PROVIDER_ROLES)[number];

export const LISTING_TYPES = ['tour', 'activity', 'event'] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const VERIFICATION_STATUSES = ['not_required', 'pending', 'approved', 'rejected', 'resubmitted'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const LISTING_STATUSES = ['draft', 'pending', 'published', 'rejected'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
    tourist: 'Tourist',
    tour_company: 'Tour Company',
    tour_instructor: 'Tour Instructor',
    tour_guide: 'Tour Guide',
    admin: 'Admin',
};

export const LISTING_LABELS: Record<ListingType, string> = {
    tour: 'Tours',
    activity: 'Activities',
    event: 'Events',
};

export interface RoleSignupConfig {
    summary: string;
    requiresVerification: boolean;
    allowedListingTypes: ListingType[];
    fields: Array<{
        key: RoleFormField;
        label: string;
        placeholder: string;
        required: boolean;
    }>;
}

export type RoleFormField =
    | 'phone'
    | 'country'
    | 'city'
    | 'bio'
    | 'companyName'
    | 'registrationNumber'
    | 'website'
    | 'specialties'
    | 'licenseNumber'
    | 'languages'
    | 'yearsExperience'
    | 'governmentId'
    | 'certificateId';

export interface SignupFormValues {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    country: string;
    city: string;
    bio: string;
    companyName: string;
    registrationNumber: string;
    website: string;
    specialties: string;
    licenseNumber: string;
    languages: string;
    yearsExperience: string;
    governmentId: string;
    certificateId: string;
    worksUnderCompany: boolean;
}

export const DEFAULT_SIGNUP_VALUES: SignupFormValues = {
    fullName: '',
    email: '',
    password: '',
    role: 'tourist',
    phone: '',
    country: '',
    city: '',
    bio: '',
    companyName: '',
    registrationNumber: '',
    website: '',
    specialties: '',
    licenseNumber: '',
    languages: '',
    yearsExperience: '',
    governmentId: '',
    certificateId: '',
    worksUnderCompany: false,
};

export const ROLE_SIGNUP_CONFIG: Record<UserRole, RoleSignupConfig> = {
    tourist: {
        summary: 'Book listings, save favorites, review completed trips, and chat with providers.',
        requiresVerification: false,
        allowedListingTypes: [],
        fields: [
            { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', required: true },
            { key: 'country', label: 'Country', placeholder: 'India', required: true },
            { key: 'city', label: 'City', placeholder: 'Srinagar', required: true },
            { key: 'bio', label: 'Travel Style', placeholder: 'Slow travel, food trails, mountain stays', required: false },
        ],
    },
    tour_company: {
        summary: 'Manage a company profile and publish tours, events, and activities after approval.',
        requiresVerification: true,
        allowedListingTypes: ['tour', 'event', 'activity'],
        fields: [
            { key: 'phone', label: 'Business Phone', placeholder: '+91 98765 43210', required: true },
            { key: 'country', label: 'Country', placeholder: 'India', required: true },
            { key: 'city', label: 'City', placeholder: 'Leh', required: true },
            { key: 'companyName', label: 'Company Name', placeholder: 'North Ridge Expeditions', required: true },
            { key: 'registrationNumber', label: 'Registration Number', placeholder: 'GST / business registration', required: true },
            { key: 'website', label: 'Website', placeholder: 'https://northridge.travel', required: false },
            { key: 'bio', label: 'Company Overview', placeholder: 'Small-group expeditions focused on remote trails and local hosts', required: true },
            { key: 'governmentId', label: 'Primary Verification ID', placeholder: 'PAN / Tax ID / Registration proof ref', required: true },
        ],
    },
    tour_instructor: {
        summary: 'Offer approved activity listings and operate independently or under a company profile.',
        requiresVerification: true,
        allowedListingTypes: ['activity'],
        fields: [
            { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', required: true },
            { key: 'country', label: 'Country', placeholder: 'India', required: true },
            { key: 'city', label: 'City', placeholder: 'Manali', required: true },
            { key: 'specialties', label: 'Specialties', placeholder: 'Rock climbing, ski training, avalanche safety', required: true },
            { key: 'yearsExperience', label: 'Years of Experience', placeholder: '6', required: true },
            { key: 'certificateId', label: 'Certification Reference', placeholder: 'Instructor certificate ID', required: true },
            { key: 'governmentId', label: 'Government ID', placeholder: 'Passport / national ID / driving license ref', required: true },
            { key: 'bio', label: 'Professional Summary', placeholder: 'Certified outdoor instructor with rescue and safety experience', required: true },
        ],
    },
    tour_guide: {
        summary: 'Lead approved tour listings and optionally operate under a company profile.',
        requiresVerification: true,
        allowedListingTypes: ['tour'],
        fields: [
            { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', required: true },
            { key: 'country', label: 'Country', placeholder: 'India', required: true },
            { key: 'city', label: 'City', placeholder: 'Gangtok', required: true },
            { key: 'languages', label: 'Languages', placeholder: 'English, Hindi, Nepali', required: true },
            { key: 'licenseNumber', label: 'Guide License Number', placeholder: 'Guide permit / tourism board ID', required: true },
            { key: 'yearsExperience', label: 'Years of Experience', placeholder: '8', required: true },
            { key: 'governmentId', label: 'Government ID', placeholder: 'Passport / national ID / driving license ref', required: true },
            { key: 'bio', label: 'Guide Summary', placeholder: 'Local route guide focused on heritage, trekking, and small-group touring', required: true },
        ],
    },
    admin: {
        summary: 'Internal role for verification review and moderation.',
        requiresVerification: false,
        allowedListingTypes: [],
        fields: [],
    },
};

export const isProviderRole = (role?: string | null): role is ProviderRole => (
    typeof role === 'string' && (PROVIDER_ROLES as readonly string[]).includes(role)
);

export const isTouristRole = (role?: string | null): role is 'tourist' => role === 'tourist';

export const canRolePublish = (role: UserRole | null | undefined, type: ListingType) => {
    if (!role) return false;
    return ROLE_SIGNUP_CONFIG[role].allowedListingTypes.includes(type);
};

export const getRoleLabel = (role?: string | null) => {
    if (!role || !(role in ROLE_LABELS)) return 'Member';
    return ROLE_LABELS[role as UserRole];
};

export const getVerificationLabel = (status?: string | null) => {
    switch (status) {
        case 'approved':
            return 'Verified';
        case 'pending':
            return 'Verification Pending';
        case 'rejected':
            return 'Reapply Required';
        case 'resubmitted':
            return 'Resubmitted';
        default:
            return 'Active';
    }
};
