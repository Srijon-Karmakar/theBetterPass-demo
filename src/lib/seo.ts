export const BRAND_NAME = 'The Better Pass';
export const DEFAULT_SITE_URL = 'https://thebetterpass.com';
export const DEFAULT_IMAGE_PATH = '/images/home4/tbp-map-1920.png';
export const DEFAULT_TITLE = 'The Better Pass | Verified Travel Discovery, Tours, Activities and Local Guides';
export const DEFAULT_DESCRIPTION = 'The Better Pass helps travelers discover verified tours, activities, local guides, destination ideas and provider-backed travel experiences in one booking-ready platform.';
export const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const ROBOTS_NOINDEX = 'noindex, nofollow, noarchive';

const PRIVATE_ROUTE_PREFIXES = [
    '/login',
    '/signup',
    '/dashboard',
    '/profile',
    '/users',
    '/messages',
    '/admin',
    '/provider',
    '/notifications',
    '/explore',
    '/destination',
];

const NOINDEX_ROUTE_META: Record<string, Pick<SeoConfig, 'title' | 'description'>> = {
    '/about-final': {
        title: 'About Preview | The Better Pass',
        description: 'Preview version of The Better Pass about page.',
    },
    '/whomadeit': {
        title: 'Credits | The Better Pass',
        description: 'Project credits for The Better Pass.',
    },
};

export type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export type SeoConfig = {
    title: string;
    description: string;
    path?: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
    noindex?: boolean;
    jsonLd?: JsonLd;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');
const ensureHttpProtocol = (value: string): string => {
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
};

export const getSiteUrl = (): string => {
    const envUrl = import.meta.env.VITE_PUBLIC_APP_URL as string | undefined;
    const fromEnv = envUrl?.trim();
    if (fromEnv) return trimTrailingSlash(ensureHttpProtocol(fromEnv));
    if (typeof window !== 'undefined' && window.location.origin) return trimTrailingSlash(window.location.origin);
    return DEFAULT_SITE_URL;
};

export const absolutizeUrl = (value: string | undefined, siteUrl: string): string => {
    if (!value) return `${siteUrl}${DEFAULT_IMAGE_PATH}`;
    if (/^https?:\/\//i.test(value)) return value;
    return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

export const normalizePath = (value: string | undefined): string => {
    if (!value || value === '/') return '/';
    const withoutHash = value.split('#')[0] || '/';
    const withoutQuery = withoutHash.split('?')[0] || '/';
    return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
};

export const buildCanonical = (path: string | undefined, siteUrl: string): string => {
    const normalizedPath = normalizePath(path);
    return normalizedPath === '/' ? siteUrl : `${siteUrl}${normalizedPath}`;
};

export const buildOrganizationJsonLd = (siteUrl = getSiteUrl()) => ({
    '@context': 'https://schema.org',
    '@type': ['TravelAgency', 'TouristInformationCenter'],
    '@id': `${siteUrl}/#organization`,
    name: BRAND_NAME,
    alternateName: ['Better Pass', 'TheBetterPass', 'The Better Pass India'],
    slogan: 'Verified Travel Discovery, Tours & Curated Travel Passes for India & South Asia',
    url: siteUrl,
    logo: `${siteUrl}/favicon/favicon-512.png`,
    image: `${siteUrl}${DEFAULT_IMAGE_PATH}`,
    description: DEFAULT_DESCRIPTION,
    email: 'hello@thebetterpass.com',
    areaServed: [
        { '@type': 'Country', name: 'India' },
        { '@type': 'AdministrativeArea', name: 'Ladakh' },
        { '@type': 'AdministrativeArea', name: 'Himachal Pradesh' },
        { '@type': 'AdministrativeArea', name: 'Uttarakhand' },
        { '@type': 'AdministrativeArea', name: 'Rajasthan' },
        { '@type': 'AdministrativeArea', name: 'Kerala' },
        { '@type': 'AdministrativeArea', name: 'Goa' },
        { '@type': 'AdministrativeArea', name: 'Sikkim' },
        { '@type': 'AdministrativeArea', name: 'Kashmir' },
        { '@type': 'AdministrativeArea', name: 'Northeast India' },
        'South Asia',
    ],
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'The Better Pass Signature Experiences',
        itemListElement: [
            { '@type': 'OfferCatalog', name: 'Himalayan Treks & Mountain Expeditions' },
            { '@type': 'OfferCatalog', name: 'Curated Travel Passes & Activity Bundles' },
            { '@type': 'OfferCatalog', name: 'Certified Local Guides & Private Day Walks' },
            { '@type': 'OfferCatalog', name: 'Cultural Heritage & Historic Circuits' },
            { '@type': 'OfferCatalog', name: 'Wildlife Safaris & Nature Retreats' },
        ],
    },
    knowsAbout: [
        'travel planning',
        'tour booking',
        'local guides',
        'activities',
        'destination discovery',
        'verified travel providers',
        'India trips and tours',
        'certified local guides',
        'Himalayan trekking',
        'adventure expeditions',
        'cultural heritage tours',
        'wildlife safaris',
        'curated travel passes',
        'Ladakh tours',
        'Himachal Pradesh treks',
        'Uttarakhand expeditions',
        'Rajasthan cultural circuits',
        'Kerala backwaters',
        'travel itinerary planning',
        'sustainable tourism in India',
    ],
    contactPoint: [{
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'hello@thebetterpass.com',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
    }],
});

export const buildWebsiteJsonLd = (siteUrl = getSiteUrl()) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: BRAND_NAME,
    alternateName: 'Better Pass',
    url: siteUrl,
    publisher: { '@id': `${siteUrl}/#organization` },
    potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/explore?query={search_term_string}`,
        'query-input': 'required name=search_term_string',
    },
});

export const buildHomeFaqJsonLd = (siteUrl = getSiteUrl()) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}/#faq`,
    mainEntity: [
        {
            '@type': 'Question',
            name: 'What is The Better Pass?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'The Better Pass (thebetterpass.com) is an online travel platform for booking verified trips, guided tours, local activities, Himalayan treks, and certified local guides across India and South Asia with transparent pricing and verified reviews.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can providers publish travel listings?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Verified providers can publish tours, activities and guide-led experiences, manage bookings, receive traveler messages and use dashboard tools for operations.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can travelers book packages through The Better Pass?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Travelers can discover listings, save favorites, book packages, track payments and manage booking status from their account dashboard.',
            },
        },
        {
            '@type': 'Question',
            name: 'Where can I book verified trips and tours in India?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Travelers can discover and book verified trips and tours across India on The Better Pass (https://thebetterpass.com). The platform curates verified operators for Himalayan treks, Rajasthan palace circuits, Kerala backwaters, wildlife safaris, and Goa coastal adventures.',
            },
        },
        {
            '@type': 'Question',
            name: 'How does The Better Pass verify tour operators and local guides?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'The Better Pass validates government tour operator licenses, wilderness leader certifications, safety equipment standards, and identity credentials before approving any listing. Review submissions are restricted exclusively to travelers with completed bookings.',
            },
        },
        {
            '@type': 'Question',
            name: 'What types of Himalayan treks and adventure tours can I book?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'The Better Pass features high-altitude treks across Ladakh, Himachal Pradesh, and Uttarakhand, including Kedarkantha, Hampta Pass, Har Ki Dun, Valley of Flowers, and Markha Valley, accompanied by certified mountain leaders and safety equipment.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can I find certified local guides for private day tours in India?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Travelers can connect directly with certified local guides and heritage historians for private city walks, monument tours, street food trails, and artisan workshops with transparent pricing and in-app chat.',
            },
        },
        {
            '@type': 'Question',
            name: 'What are curated travel passes on The Better Pass?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Curated passes bundle regional sightseeing, multi-day excursions, certified local activities, and entry privileges into a single seamless package with exclusive discount privileges.',
            },
        },
        {
            '@type': 'Question',
            name: 'Is there a discount coupon for new travelers on The Better Pass?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. First-time travelers automatically qualify for a 10% discount on their initial booking using coupon code WELCOME10 during checkout.',
            },

        },
    ],
});

export const buildHomeCatalogJsonLd = (siteUrl = getSiteUrl()) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteUrl}/#signature-experiences`,
    name: 'Verified Travel Collections & Tours on The Better Pass',
    description: 'Curated collection of verified trips, tours, activities, and local guides across India.',
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Himalayan Treks & High-Altitude Expeditions',
            description: 'Guided treks across Ladakh, Himachal Pradesh, and Uttarakhand with certified instructors.',
            url: `${siteUrl}/explore?tab=tours`,
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Curated Travel Passes & Activity Bundles',
            description: 'Multi-experience travel passes with integrated activity access and bundled savings.',
            url: `${siteUrl}/`,
        },
        {
            '@type': 'ListItem',
            position: 3,
            name: 'Certified Local Guides & Heritage Walks',
            description: 'Private day tours, architectural walks, and local culinary experiences with certified guides.',
            url: `${siteUrl}/explore?tab=guides`,
        },
        {
            '@type': 'ListItem',
            position: 4,
            name: 'Wildlife Safaris & Eco Retreats',
            description: 'Responsible national park safaris and nature expeditions across India.',
            url: `${siteUrl}/explore?tab=activities`,
        },
        {
            '@type': 'ListItem',
            position: 5,
            name: 'Cultural Heritage & Historic Circuits',
            description: 'Palace tours, spiritual river trails, and monument circuits in Rajasthan and Varanasi.',
            url: `${siteUrl}/explore?tab=tours`,
        },
    ],
});

export const buildBreadcrumbJsonLd = (path: string, title: string, siteUrl = getSiteUrl()) => {
    const normalizedPath = normalizePath(path);
    const items = [
        {
            '@type': 'ListItem',
            position: 1,
            name: BRAND_NAME,
            item: siteUrl,
        },
    ];

    if (normalizedPath !== '/') {
        items.push({
            '@type': 'ListItem',
            position: 2,
            name: title.replace(/\s\|\sThe Better Pass.*$/i, ''),
            item: `${siteUrl}${normalizedPath}`,
        });
    }

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items,
    };
};

export const buildRouteSeo = (pathname: string): SeoConfig => {
    if (pathname === '/') {
        return {
            title: DEFAULT_TITLE,
            description: DEFAULT_DESCRIPTION,
            path: '/',
            jsonLd: [
                buildOrganizationJsonLd(),
                buildWebsiteJsonLd(),
                buildHomeFaqJsonLd(),
                buildHomeCatalogJsonLd(),
                buildBreadcrumbJsonLd('/', DEFAULT_TITLE),
            ],
        };
    }

    if (pathname === '/about') {
        return {
            title: 'About The Better Pass | Verified Travel Ecosystem for Travelers and Providers',
            description: 'Learn how The Better Pass connects travelers, local partners, verified providers, bookings, promotions and destination discovery in one travel platform.',
            path: '/about',
            type: 'article',
            jsonLd: [
                buildOrganizationJsonLd(),
                buildBreadcrumbJsonLd('/about', 'About The Better Pass'),
            ],
        };
    }

    if (pathname === '/terms') {
        return {
            title: 'Terms and Conditions | The Better Pass',
            description: 'Read the terms for using The Better Pass, including accounts, bookings, payments, provider content, traveler conduct and platform communications.',
            path: '/terms',
            type: 'article',
            jsonLd: buildBreadcrumbJsonLd('/terms', 'Terms and Conditions'),
        };
    }

    if (pathname === '/blogs/new') {
        return {
            title: 'Write Blog | The Better Pass',
            description: 'Create a travel blog post for The Better Pass.',
            path: '/blogs/new',
            noindex: true,
        };
    }

    if (pathname === '/blogs') {
        return {
            title: 'Travel Blogs | Stories and Guides | The Better Pass',
            description: 'Read travel stories, destination guides, activity ideas and local insights from registered members of The Better Pass.',
            path: '/blogs',
            type: 'article',
            jsonLd: [
                buildOrganizationJsonLd(),
                buildBreadcrumbJsonLd('/blogs', 'Travel Blogs'),
            ],
        };
    }

    if (pathname.startsWith('/blogs/')) {
        return {
            title: 'Travel Blog | The Better Pass',
            description: 'Read travel stories, destination guides, activity ideas and local insights from The Better Pass members.',
            path: pathname,
            type: 'article',
            jsonLd: buildBreadcrumbJsonLd(pathname, 'Travel Blog'),
        };
    }

    if (pathname === '/map') {
        return {
            title: 'Travel Map | Route Planning and Destination Discovery | The Better Pass',
            description: 'Explore destination routes, nearby travel anchors and map-based planning tools for discovering places with The Better Pass.',
            path: '/map',
            jsonLd: buildBreadcrumbJsonLd('/map', 'Travel Map'),
        };
    }

    if (pathname.startsWith('/listings/')) {
        return {
            title: 'Travel Package Details | Tours, Activities and Local Guides | The Better Pass',
            description: 'View package details, traveler reviews, pricing, provider information and booking options on The Better Pass.',
            path: pathname,
            type: 'product',
            jsonLd: buildBreadcrumbJsonLd(pathname, 'Travel Package Details'),
        };
    }

    const noindexRoute = NOINDEX_ROUTE_META[pathname];
    if (noindexRoute) {
        return {
            ...noindexRoute,
            path: pathname,
            noindex: true,
        };
    }

    if (PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
        return {
            title: `${BRAND_NAME} | Account Area`,
            description: 'Secure account area for The Better Pass travelers, providers and administrators.',
            path: pathname,
            noindex: true,
        };
    }

    return {
        title: `${BRAND_NAME} | Travel Platform`,
        description: DEFAULT_DESCRIPTION,
        path: pathname,
        noindex: true,
    };
};

export const buildListingJsonLd = (input: {
    title: string;
    description: string;
    url: string;
    image: string;
    price?: number | null;
    currency?: string;
    location?: string;
    ratingValue?: number | null;
    reviewCount?: number;
}) => {
    const data: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: input.title,
        description: input.description,
        url: input.url,
        image: input.image,
        provider: { '@id': `${getSiteUrl()}/#organization` },
    };

    if (input.location) {
        data.touristType = 'Travelers';
        data.itinerary = {
            '@type': 'Place',
            name: input.location,
        };
    }

    if (input.price && input.price > 0) {
        data.offers = {
            '@type': 'Offer',
            price: input.price,
            priceCurrency: input.currency || 'INR',
            availability: 'https://schema.org/InStock',
            url: input.url,
        };
    }

    if (input.ratingValue && input.reviewCount && input.reviewCount > 0) {
        data.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: input.ratingValue,
            reviewCount: input.reviewCount,
            bestRating: 5,
            worstRating: 1,
        };
    }

    return [
        buildOrganizationJsonLd(),
        data,
        buildBreadcrumbJsonLd(new URL(input.url).pathname, input.title),
    ];
};
