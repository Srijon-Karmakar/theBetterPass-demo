export const BRAND_NAME = 'The Better Pass';
export const DEFAULT_SITE_URL = 'https://thebetterpass.com';
export const DEFAULT_IMAGE_PATH = '/images/home4/tbp-map-1920.png';
export const DEFAULT_TITLE = 'The Better Pass | Verified Travel Discovery, Tours, Activities and Local Guides';
export const DEFAULT_DESCRIPTION = 'The Better Pass helps travelers discover verified tours, activities, local guides, destination ideas and provider-backed travel experiences in one booking-ready platform.';
export const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const ROBOTS_NOINDEX = 'noindex, nofollow, noarchive';
export const PUBLIC_STATUSES = ['approved', 'live', 'published'];

export const STATIC_ROUTES = [
  {
    path: '/',
    changefreq: 'daily',
    priority: '1.0',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    jsonLd: (siteUrl) => [
      buildOrganizationJsonLd(siteUrl),
      buildWebsiteJsonLd(siteUrl),
      buildHomeFaqJsonLd(siteUrl),
      buildHomeCatalogJsonLd(siteUrl),
      buildBreadcrumbJsonLd('/', DEFAULT_TITLE, siteUrl),
    ],
  },
  {
    path: '/about',
    changefreq: 'monthly',
    priority: '0.8',
    type: 'article',
    title: 'About The Better Pass | Verified Travel Ecosystem for Travelers and Providers',
    description: 'Learn how The Better Pass connects travelers, local partners, verified providers, bookings, promotions and destination discovery in one travel platform.',
    jsonLd: (siteUrl) => [
      buildOrganizationJsonLd(siteUrl),
      buildBreadcrumbJsonLd('/about', 'About The Better Pass', siteUrl),
    ],
  },
  {
    path: '/map',
    changefreq: 'weekly',
    priority: '0.7',
    title: 'Travel Map | Route Planning and Destination Discovery | The Better Pass',
    description: 'Explore destination routes, nearby travel anchors and map-based planning tools for discovering places with The Better Pass.',
    jsonLd: (siteUrl) => buildBreadcrumbJsonLd('/map', 'Travel Map', siteUrl),
  },
  {
    path: '/terms',
    changefreq: 'yearly',
    priority: '0.3',
    type: 'article',
    title: 'Terms and Conditions | The Better Pass',
    description: 'Read the terms for using The Better Pass, including accounts, bookings, payments, provider content, traveler conduct and platform communications.',
    jsonLd: (siteUrl) => buildBreadcrumbJsonLd('/terms', 'Terms and Conditions', siteUrl),
  },
  {
    path: '/blogs',
    changefreq: 'daily',
    priority: '0.7',
    type: 'article',
    title: 'Travel Blogs | Stories and Guides | The Better Pass',
    description: 'Read travel stories, destination guides, activity ideas and local insights from registered members of The Better Pass.',
    jsonLd: (siteUrl) => [
      buildOrganizationJsonLd(siteUrl),
      buildBreadcrumbJsonLd('/blogs', 'Travel Blogs', siteUrl),
    ],
  },
];

export const PRIVATE_ROUTE_PREFIXES = [
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

export const NOINDEX_ROUTES = {
  '/blogs/new': {
    title: 'Write Blog | The Better Pass',
    description: 'Create a travel blog post for The Better Pass.',
  },
  '/about-final': {
    title: 'About Preview | The Better Pass',
    description: 'Preview version of The Better Pass about page.',
  },
  '/whomadeit': {
    title: 'Credits | The Better Pass',
    description: 'Project credits for The Better Pass.',
  },
};

export const STATIC_NOINDEX_PATHS = [
  '/login',
  '/signup',
  '/dashboard',
  '/profile',
  '/messages',
  '/admin',
  '/blogs/new',
  '/provider/studio',
  '/provider/terms',
  '/notifications',
  '/explore',
  '/about-final',
  '/whomadeit',
];

export function normalizeSiteUrl(value) {
  const normalized = String(value || DEFAULT_SITE_URL).trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `https://${normalized}`;
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.VITE_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || DEFAULT_SITE_URL);
}

export function normalizePath(value) {
  if (!value || value === '/') return '/';
  const withoutHash = String(value).split('#')[0] || '/';
  const withoutQuery = withoutHash.split('?')[0] || '/';
  return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
}

export function buildUrl(path, siteUrl = getSiteUrl()) {
  const normalizedPath = normalizePath(path);
  if (normalizedPath === '/') return `${siteUrl}/`;
  return `${siteUrl}${normalizedPath}`;
}

export function buildCanonical(path, siteUrl = getSiteUrl()) {
  const normalizedPath = normalizePath(path);
  return normalizedPath === '/' ? siteUrl : `${siteUrl}${normalizedPath}`;
}

export function absolutizeUrl(value, siteUrl = getSiteUrl()) {
  if (!value) return `${siteUrl}${DEFAULT_IMAGE_PATH}`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

export function normalizeListingType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'event') return 'guide';
  if (normalized === 'tour' || normalized === 'activity' || normalized === 'guide') return normalized;
  return null;
}

export function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function htmlEscape(value) {
  return xmlEscape(value);
}

export function toDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function buildOrganizationJsonLd(siteUrl = getSiteUrl()) {
  return {
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
  };
}

export function buildWebsiteJsonLd(siteUrl = getSiteUrl()) {
  return {
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
  };
}

export function buildHomeFaqJsonLd(siteUrl = getSiteUrl()) {
  return {
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
  };
}

export function buildHomeCatalogJsonLd(siteUrl = getSiteUrl()) {
  return {
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
  };
}

export function buildBreadcrumbJsonLd(path, title, siteUrl = getSiteUrl()) {
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
      name: String(title).replace(/\s\|\sThe Better Pass.*$/i, ''),
      item: `${siteUrl}${normalizedPath}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function buildListingJsonLd(input, siteUrl = getSiteUrl()) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: input.title,
    description: input.description,
    url: input.url,
    image: input.image,
    provider: { '@id': `${siteUrl}/#organization` },
  };

  if (input.location) {
    data.touristType = 'Travelers';
    data.itinerary = {
      '@type': 'Place',
      name: input.location,
    };
  }

  if (input.price && Number(input.price) > 0) {
    data.offers = {
      '@type': 'Offer',
      price: Number(input.price),
      priceCurrency: input.currency || 'INR',
      availability: 'https://schema.org/InStock',
      url: input.url,
    };
  }

  if (input.ratingValue && input.reviewCount && Number(input.reviewCount) > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.ratingValue,
      reviewCount: input.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return [
    buildOrganizationJsonLd(siteUrl),
    data,
    buildBreadcrumbJsonLd(new URL(input.url).pathname, input.title, siteUrl),
  ];
}

export function buildRouteSeo(path, siteUrl = getSiteUrl()) {
  const normalizedPath = normalizePath(path);
  const staticRoute = STATIC_ROUTES.find((route) => route.path === normalizedPath);
  if (staticRoute) {
    return {
      title: staticRoute.title,
      description: staticRoute.description,
      path: staticRoute.path,
      type: staticRoute.type || 'website',
      image: DEFAULT_IMAGE_PATH,
      noindex: false,
      jsonLd: staticRoute.jsonLd(siteUrl),
    };
  }

  if (/^\/listings\/[^/]+\/[^/]+/.test(normalizedPath)) {
    return {
      title: 'Travel Package Details | Tours, Activities and Local Guides | The Better Pass',
      description: 'View package details, traveler reviews, pricing, provider information and booking options on The Better Pass.',
      path: normalizedPath,
      type: 'product',
      image: DEFAULT_IMAGE_PATH,
      noindex: false,
      jsonLd: buildBreadcrumbJsonLd(normalizedPath, 'Travel Package Details', siteUrl),
    };
  }

  const noindexRoute = NOINDEX_ROUTES[normalizedPath];
  if (noindexRoute) {
    return {
      ...noindexRoute,
      path: normalizedPath,
      type: 'website',
      image: DEFAULT_IMAGE_PATH,
      noindex: true,
    };
  }

  if (PRIVATE_ROUTE_PREFIXES.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))) {
    return {
      title: `${BRAND_NAME} | Account Area`,
      description: 'Secure account area for The Better Pass travelers, providers and administrators.',
      path: normalizedPath,
      type: 'website',
      image: DEFAULT_IMAGE_PATH,
      noindex: true,
    };
  }

  return {
    title: `${BRAND_NAME} | Travel Platform`,
    description: DEFAULT_DESCRIPTION,
    path: normalizedPath,
    type: 'website',
    image: DEFAULT_IMAGE_PATH,
    noindex: true,
  };
}

export function renderSeoTags(seo, siteUrl = getSiteUrl()) {
  const canonical = buildCanonical(seo.path, siteUrl);
  const image = absolutizeUrl(seo.image || DEFAULT_IMAGE_PATH, siteUrl);
  const robots = seo.noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX;
  const type = seo.type || 'website';
  const jsonLdItems = seo.jsonLd ? (Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd]) : [];
  const jsonLdTags = jsonLdItems
    .map((item) => `    <script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join('\n');

  return [
    `    <title>${htmlEscape(seo.title)}</title>`,
    `    <meta name="description" content="${htmlEscape(seo.description)}" />`,
    `    <meta name="robots" content="${htmlEscape(robots)}" />`,
    `    <meta name="googlebot" content="${htmlEscape(robots)}" />`,
    `    <meta name="bingbot" content="${htmlEscape(robots)}" />`,
    `    <meta name="author" content="${htmlEscape(BRAND_NAME)}" />`,
    `    <meta name="application-name" content="${htmlEscape(BRAND_NAME)}" />`,
    `    <meta name="apple-mobile-web-app-title" content="${htmlEscape(BRAND_NAME)}" />`,
    `    <meta name="theme-color" content="#0b1320" />`,
    `    <link rel="canonical" href="${htmlEscape(canonical)}" />`,
    `    <meta property="og:site_name" content="${htmlEscape(BRAND_NAME)}" />`,
    `    <meta property="og:type" content="${htmlEscape(type)}" />`,
    '    <meta property="og:locale" content="en_IN" />',
    `    <meta property="og:title" content="${htmlEscape(seo.title)}" />`,
    `    <meta property="og:description" content="${htmlEscape(seo.description)}" />`,
    `    <meta property="og:url" content="${htmlEscape(canonical)}" />`,
    `    <meta property="og:image" content="${htmlEscape(image)}" />`,
    `    <meta property="og:image:alt" content="${htmlEscape(`${BRAND_NAME} travel discovery platform`)}" />`,
    '    <meta property="og:image:width" content="1200" />',
    '    <meta property="og:image:height" content="630" />',
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:title" content="${htmlEscape(seo.title)}" />`,
    `    <meta name="twitter:description" content="${htmlEscape(seo.description)}" />`,
    `    <meta name="twitter:image" content="${htmlEscape(image)}" />`,
    `    <meta name="twitter:image:alt" content="${htmlEscape(`${BRAND_NAME} travel discovery platform`)}" />`,
    jsonLdTags,
  ].filter(Boolean).join('\n');
}

export function renderSemanticPrerenderHtml(seo, siteUrl = getSiteUrl()) {
  const path = normalizePath(seo.path);
  const title = htmlEscape(seo.title || BRAND_NAME);
  const description = htmlEscape(seo.description || DEFAULT_DESCRIPTION);

  if (path === '/') {
    return `
    <main class="static-seo-prerender">
      <header>
        <h1>${title}</h1>
        <p class="static-seo-lead">${description}</p>
      </header>

      <section class="static-seo-section">
        <h2>Signature Travel Experiences &amp; Tours in India</h2>
        <ul>
          <li>
            <strong>Himalayan Treks &amp; Mountain Expeditions:</strong>
            High-altitude guided treks across Ladakh (Markha Valley, Chadar), Himachal Pradesh (Hampta Pass, Spiti Valley), and Uttarakhand (Kedarkantha, Valley of Flowers, Har Ki Dun) with certified mountain instructors and safety standards.
          </li>
          <li>
            <strong>Curated Travel Passes &amp; Activity Bundles:</strong>
            Seamless multi-experience passes combining regional sightseeing, local transport, and activity access with exclusive coupon savings (Code: WELCOME10 for 10% off first booking).
          </li>
          <li>
            <strong>Certified Local Guides &amp; Private Day Walks:</strong>
            Vetted historians and local guides for architectural heritage walks, artisan workshops, street food trails, and cultural immersions.
          </li>
          <li>
            <strong>Wildlife Safaris &amp; Nature Retreats:</strong>
            Guided national park expeditions across Ranthambore, Jim Corbett, Kaziranga, and Kerala backwaters.
          </li>
          <li>
            <strong>Cultural Heritage &amp; Historic Circuits:</strong>
            Curated journeys through Rajasthan fortresses, Golden Triangle circuits, and spiritual trails in Varanasi.
          </li>
        </ul>
      </section>

      <section class="static-seo-section">
        <h2>Frequently Asked Questions About Trips, Tours &amp; Guides</h2>
        <article>
          <h3>What is The Better Pass?</h3>
          <p>The Better Pass (thebetterpass.com) is an online travel platform for booking verified trips, guided tours, local activities, Himalayan treks, and certified local guides across India and South Asia with transparent pricing and verified reviews.</p>
        </article>
        <article>
          <h3>Where can I book verified trips and tours in India?</h3>
          <p>Travelers can discover and book verified trips and tours across India on The Better Pass (https://thebetterpass.com). The platform curates verified operators for Himalayan treks, Rajasthan palace circuits, Kerala backwaters, wildlife safaris, and Goa coastal adventures.</p>
        </article>
        <article>
          <h3>How does The Better Pass verify tour operators and local guides?</h3>
          <p>The Better Pass validates government tour operator licenses, wilderness leader certifications, safety equipment standards, and identity credentials before approving any listing. Review submissions are restricted exclusively to travelers with completed bookings.</p>
        </article>
        <article>
          <h3>What types of Himalayan treks and adventure tours can I book?</h3>
          <p>The Better Pass features high-altitude treks across Ladakh, Himachal Pradesh, and Uttarakhand, including Kedarkantha, Hampta Pass, Har Ki Dun, Valley of Flowers, and Markha Valley, accompanied by certified mountain leaders and safety equipment.</p>
        </article>
        <article>
          <h3>Can I find certified local guides for private day tours in India?</h3>
          <p>Yes. Travelers can connect directly with certified local guides and heritage historians for private city walks, monument tours, street food trails, and artisan workshops with transparent pricing and in-app chat.</p>
        </article>
        <article>
          <h3>What are curated travel passes on The Better Pass?</h3>
          <p>Curated passes bundle regional sightseeing, multi-day excursions, certified local activities, and entry privileges into a single seamless package with exclusive discount privileges.</p>
        </article>
        <article>
          <h3>Is there a discount coupon for new travelers on The Better Pass?</h3>
          <p>Yes. First-time travelers automatically qualify for a 10% discount on their initial booking using coupon code WELCOME10 during checkout.</p>
        </article>
        <article>
          <h3>Can travel providers and tour agencies list packages on The Better Pass?</h3>
          <p>Verified tour operators, local guides, and activity providers can sign up at thebetterpass.com, submit verification documents, and manage their listings and bookings via the Provider Studio.</p>
        </article>
      </section>
    </main>`;
  }

  if (path === '/about') {
    return `
    <main class="static-seo-prerender">
      <header>
        <h1>${title}</h1>
        <p class="static-seo-lead">${description}</p>
      </header>
      <section class="static-seo-section">
        <h2>About The Better Pass Travel Ecosystem</h2>
        <p>The Better Pass bridges the gap between modern travelers and authentic local tour providers across India and South Asia. Our mission is to elevate experiential tourism through strict provider verification, transparent pricing, and seamless booking technology.</p>
      </section>
    </main>`;
  }

  return `
    <main class="static-seo-prerender">
      <header>
        <h1>${title}</h1>
        <p class="static-seo-lead">${description}</p>
      </header>
    </main>`;
}

export function injectSeoIntoHtml(html, seo, siteUrl = getSiteUrl()) {
  const managedMetaNames = [
    'description',
    'robots',
    'googlebot',
    'bingbot',
    'author',
    'application-name',
    'apple-mobile-web-app-title',
    'theme-color',
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image',
    'twitter:image:alt',
  ];
  const managedProperties = [
    'og:site_name',
    'og:type',
    'og:locale',
    'og:title',
    'og:description',
    'og:url',
    'og:image',
    'og:image:alt',
    'og:image:width',
    'og:image:height',
  ];

  let nextHtml = html
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');

  for (const name of managedMetaNames) {
    nextHtml = nextHtml.replace(new RegExp(`<meta\\s+[^>]*name=["']${escapeRegExp(name)}["'][^>]*>\\s*`, 'gi'), '');
  }
  for (const property of managedProperties) {
    nextHtml = nextHtml.replace(new RegExp(`<meta\\s+[^>]*property=["']${escapeRegExp(property)}["'][^>]*>\\s*`, 'gi'), '');
  }

  const withHead = nextHtml.replace('</head>', `${renderSeoTags(seo, siteUrl)}\n  </head>`);
  const prerenderBody = renderSemanticPrerenderHtml(seo, siteUrl);
  return withHead.replace('<div id="root"></div>', `<div id="root">${prerenderBody}</div>`);
}

export function buildListingSeo(row, type, siteUrl = getSiteUrl()) {
  const listingType = normalizeListingType(type || row?.type) || 'activity';
  const displayType = listingType === 'guide' ? 'event' : listingType;
  const title = cleanString(row?.title) || cleanString(row?.name) || `${capitalize(displayType)} Package`;
  const sourceDescription = cleanString(row?.description);
  const location = cleanString(row?.location);
  const descriptionBase = sourceDescription
    ? truncate(stripHtml(sourceDescription), 155)
    : `Book ${title} with verified provider details, traveler reviews and secure checkout on The Better Pass.`;
  const description = `${descriptionBase}${location ? ` Location: ${location}.` : ''}`.trim();
  const image = absolutizeUrl(getPrimaryListingImage(row), siteUrl);
  const path = `/listings/${listingType}/${encodeURIComponent(String(row.id))}`;
  const url = buildUrl(path, siteUrl);

  return {
    title: `${title} | ${capitalize(displayType)} Package | The Better Pass`,
    description,
    path,
    type: 'product',
    image,
    noindex: false,
    jsonLd: buildListingJsonLd({
      title,
      description,
      url,
      image,
      price: row?.price,
      currency: 'INR',
      location,
    }, siteUrl),
  };
}

export function buildBlogSeo(row, siteUrl = getSiteUrl()) {
  const title = cleanString(row?.title) || 'Travel Blog';
  const location = cleanString(row?.location);
  const descriptionBase = truncate(stripHtml(cleanString(row?.excerpt) || cleanString(row?.content) || DEFAULT_DESCRIPTION), 155);
  const description = `${descriptionBase}${location ? ` Location: ${location}.` : ''}`.trim();
  const path = `/blogs/${encodeURIComponent(String(row.slug || ''))}`;
  const image = absolutizeUrl(cleanUrl(row?.cover_image_url) || DEFAULT_IMAGE_PATH, siteUrl);
  const url = buildUrl(path, siteUrl);
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image,
    datePublished: row?.published_at || row?.created_at,
    dateModified: row?.updated_at || row?.published_at || row?.created_at,
    author: {
      '@type': 'Person',
      name: cleanString(row?.author_name) || 'The Better Pass member',
    },
    publisher: { '@id': `${siteUrl}/#organization` },
    mainEntityOfPage: url,
  };

  if (location) {
    articleJsonLd.contentLocation = {
      '@type': 'Place',
      name: location,
    };
  }

  return {
    title: `${title} | The Better Pass Blog`,
    description,
    path,
    type: 'article',
    image,
    noindex: false,
    jsonLd: [
      buildOrganizationJsonLd(siteUrl),
      articleJsonLd,
      buildBreadcrumbJsonLd(path, title, siteUrl),
    ],
  };
}

export async function fetchDynamicListingsForSeo(siteUrl = getSiteUrl()) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('SEO: Supabase env vars missing, using static routes only.');
    return [];
  }

  const [posts, tours, activities, events] = await Promise.all([
    safeFetchListings('posts', () => fetchPostListings(supabaseUrl, supabaseAnonKey)),
    safeFetchListings('tours', () => fetchLegacyListings('tours', supabaseUrl, supabaseAnonKey)),
    safeFetchListings('activities', () => fetchLegacyListings('activities', supabaseUrl, supabaseAnonKey)),
    safeFetchListings('events', () => fetchLegacyListings('events', supabaseUrl, supabaseAnonKey)),
  ]);

  return [
    ...posts.map((row) => listingEntry(row, normalizeListingType(row.type), siteUrl)),
    ...tours.map((row) => listingEntry(row, 'tour', siteUrl)),
    ...activities.map((row) => listingEntry(row, 'activity', siteUrl)),
    ...events.map((row) => listingEntry(row, 'guide', siteUrl)),
  ].filter(Boolean);
}

export async function fetchDynamicBlogsForSeo(siteUrl = getSiteUrl()) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('SEO: Supabase env vars missing, using static blog routes only.');
    return [];
  }

  try {
    const rows = await fetchRows('blogs', {
      select: 'id,title,slug,excerpt,content,cover_image_url,author_name,category,location,tags,published_at,updated_at,created_at,status',
      status: 'eq.published',
      order: 'published_at.desc.nullslast',
      limit: '5000',
    }, supabaseUrl, supabaseAnonKey);

    return rows.map((row) => blogEntry(row, siteUrl)).filter(Boolean);
  } catch (error) {
    if (isMissingColumnError(error, 'location', 'blogs')) {
      try {
        const rows = await fetchRows('blogs', {
          select: 'id,title,slug,excerpt,content,cover_image_url,author_name,category,tags,published_at,updated_at,created_at,status',
          status: 'eq.published',
          order: 'published_at.desc.nullslast',
          limit: '5000',
        }, supabaseUrl, supabaseAnonKey);

        return rows.map((row) => blogEntry(row, siteUrl)).filter(Boolean);
      } catch (fallbackError) {
        console.warn(`SEO: could not fetch blogs. ${fallbackError.message}`);
        return [];
      }
    }
    console.warn(`SEO: could not fetch blogs. ${error.message}`);
    return [];
  }
}

async function safeFetchListings(label, fetcher) {
  try {
    return await fetcher();
  } catch (error) {
    if (isMissingRelationError(error, label)) return [];
    console.warn(`SEO: could not fetch ${label} listings. ${error.message}`);
    return [];
  }
}

function listingEntry(row, type, siteUrl) {
  if (!row?.id || !type) return null;
  const seo = buildListingSeo(row, type, siteUrl);
  return {
    loc: buildUrl(seo.path, siteUrl),
    path: seo.path,
    lastmod: toDate(row.updated_at || row.reviewed_at || row.created_at),
    changefreq: 'weekly',
    priority: '0.8',
    seo,
  };
}

function blogEntry(row, siteUrl) {
  if (!row?.slug || !row?.title) return null;
  const seo = buildBlogSeo(row, siteUrl);
  return {
    loc: buildUrl(seo.path, siteUrl),
    path: seo.path,
    lastmod: toDate(row.updated_at || row.published_at || row.created_at),
    changefreq: 'weekly',
    priority: '0.7',
    seo,
  };
}

async function fetchRows(table, params, supabaseUrl, supabaseAnonKey) {
  const url = new URL(`${normalizeSiteUrl(supabaseUrl)}/rest/v1/${table}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      signal: controller.signal,
    });
    const body = await response.text();

    if (!response.ok) {
      throw new Error(`${table} query failed with ${response.status}: ${body.slice(0, 240)}`);
    }

    return body ? JSON.parse(body) : [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchPostListings(supabaseUrl, supabaseAnonKey) {
  const select = 'id,type,status,updated_at,reviewed_at,created_at,title,name,description,location,image_url,cover_image_url,thumbnail_url,gallery_images,price';
  try {
    return await fetchRows('posts', {
      select,
      status: `in.(${PUBLIC_STATUSES.join(',')})`,
      order: 'updated_at.desc.nullslast',
      limit: '5000',
    }, supabaseUrl, supabaseAnonKey);
  } catch {
    return fetchRows('posts', {
      select: 'id,type,status,created_at,title,name,description,location,image_url,cover_image_url,thumbnail_url,gallery_images,price',
      status: `in.(${PUBLIC_STATUSES.join(',')})`,
      order: 'created_at.desc.nullslast',
      limit: '5000',
    }, supabaseUrl, supabaseAnonKey);
  }
}

async function fetchLegacyListings(table, supabaseUrl, supabaseAnonKey) {
  const attempts = [
    {
      select: 'id,status,updated_at,created_at,title,name,description,location,image_url,cover_image_url,thumbnail_url,gallery_images,price',
      status: `in.(${PUBLIC_STATUSES.join(',')})`,
      order: 'updated_at.desc.nullslast',
      limit: '5000',
    },
    {
      select: 'id,status,updated_at,created_at,title,description,location,image_url,cover_image_url,thumbnail_url,gallery_images,price',
      status: `in.(${PUBLIC_STATUSES.join(',')})`,
      order: 'updated_at.desc.nullslast',
      limit: '5000',
    },
    {
      select: 'id,status,created_at,title,description,location,image_url,price',
      status: `in.(${PUBLIC_STATUSES.join(',')})`,
      order: 'created_at.desc.nullslast',
      limit: '5000',
    },
    {
      select: 'id,created_at,title,description,location,image_url,price',
      order: 'created_at.desc.nullslast',
      limit: '5000',
    },
  ];

  let lastError;
  for (const params of attempts) {
    try {
      return await fetchRows(table, params, supabaseUrl, supabaseAnonKey);
    } catch (error) {
      if (isMissingRelationError(error, table)) return [];
      lastError = error;
      if (!isMissingColumnError(error)) throw error;
    }
  }
  throw lastError;
}

function isMissingRelationError(error, table) {
  const message = String(error?.message || '').toLowerCase();
  const normalizedTable = String(table || '').toLowerCase();
  return (
    message.includes('pgrst205')
    || (message.includes('could not find the table') && (!normalizedTable || message.includes(`'public.${normalizedTable}'`)))
    || (message.includes('relation') && normalizedTable && message.includes(normalizedTable) && message.includes('does not exist'))
  );
}

function isMissingColumnError(error, column, table) {
  const message = String(error?.message || '').toLowerCase();
  const normalizedColumn = String(column || '').toLowerCase();
  const normalizedTable = String(table || '').toLowerCase();
  return (
    message.includes('42703')
    && (!normalizedColumn || message.includes(normalizedColumn))
    && (!normalizedTable || message.includes(normalizedTable))
  );
}

function cleanString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function capitalize(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function cleanUrl(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

function cleanGallery(value) {
  if (Array.isArray(value)) {
    return value.map(cleanUrl).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(cleanUrl).filter(Boolean);
      }
    } catch {
      return [trimmed];
    }
    return [trimmed];
  }

  return [];
}

function getPrimaryListingImage(row) {
  const candidates = [
    cleanUrl(row?.image_url),
    ...cleanGallery(row?.gallery_images),
    cleanUrl(row?.cover_image_url),
    cleanUrl(row?.thumbnail_url),
  ].filter(Boolean);
  return Array.from(new Set(candidates))[0] || DEFAULT_IMAGE_PATH;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
