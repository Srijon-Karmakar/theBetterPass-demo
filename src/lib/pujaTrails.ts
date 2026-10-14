import { getPandal, type PujaPandal } from './pujaGuide';

export interface PujaTrailStop {
    pandalId: string;
    /** One practical line shown under the pandal's own highlight. */
    tip: string;
}

export interface PujaTrail {
    id: string;
    title: string;
    zone: 'North' | 'Central' | 'East' | 'South';
    /** Short line under the title on the card. */
    tagline: string;
    overview: string;
    bestTime: string;
    gettingThere: string;
    stops: PujaTrailStop[];
}

/** Free, ready-made pandal routes: seven stops each, ordered so the walk doesn't double back. */
export const PUJA_TRAILS: PujaTrail[] = [
    {
        id: 'north-heritage',
        title: 'Old North Kolkata trail',
        zone: 'North',
        tagline: 'Ghats, idol makers and the oldest pujas',
        overview: 'The oldest community and family pujas sit in the lanes between the river and Shyambazar. This trail starts by the ghats, passes the idol makers of Kumartuli and an old zamindar house, and ends at the big themed pandals of Tala.',
        bestTime: 'Start around 4 to 5 pm so the lanes are in daylight and the lights come on as you go. Weekday evenings are far calmer than the Saptami to Ashtami weekend.',
        gettingThere: 'Start near Sovabazar Ahiritola station (Circular Railway). Finish at Tala station, or walk to Shyambazar (Blue Line metro) for the way home.',
        stops: [
            { pandalId: 'ahiritola', tip: 'Start here and take a few minutes at the nearby ghats before the crowds build.' },
            { pandalId: 'kumartuli-park', tip: 'Walk the artisans\' lanes next door before you join any queue.' },
            { pandalId: 'bagbazar', tip: 'Look for the traditional ekchala idol; the riverside fair is livelier after dark.' },
            { pandalId: 'shobhabazar-rajbari', tip: 'Old family pujas are smaller and quieter, a good place to slow down.' },
            { pandalId: 'hatibagan-sarbojanin', tip: 'Busy market area: keep valuables close and grab a snack from the stalls.' },
            { pandalId: 'jagat-mukherjee-park', tip: 'Evenings are the busiest, so go straight to the queue entrance.' },
            { pandalId: 'tala-prattoy', tip: 'Finish here and head to Tala station or Shyambazar for the way back.' },
        ],
    },
    {
        id: 'central-college-street',
        title: 'Central Kolkata and College Street trail',
        zone: 'Central',
        tagline: 'From Shyambazar edge to Sealdah',
        overview: 'A compact run down the middle of the city: small neighbourhood pujas around Maniktala and Amherst Street, then the big crowd-pullers at Mohammad Ali Park, College Square and Santosh Mitra Square.',
        bestTime: 'Go before 6 pm or after 11 pm for shorter queues at the big pandals. Santosh Mitra Square is best kept for last, when you are ready for a long wait.',
        gettingThere: 'Start at Kashi Bose Lane (a short ride from Shyambazar). Finish near Sealdah, which has both rail and Green Line metro. Mahakaran (Green Line) is the closest metro to Mohammad Ali Park.',
        stops: [
            { pandalId: 'kashi-bose-lane', tip: 'A good warm-up stop close to the Hatibagan cluster.' },
            { pandalId: 'shimla-byayam-samity', tip: 'Read about its history first; it is a club puja with roots in the freedom movement.' },
            { pandalId: 'chaltabagan', tip: 'Take a moment for the richly decorated traditional idol.' },
            { pandalId: 'rammohan-sammilani', tip: 'Short stop on the way to Central Avenue.' },
            { pandalId: 'mohammad-ali-park', tip: 'Expect a large crowd; the lanes around it clog up early in the evening.' },
            { pandalId: 'college-square', tip: 'Walk around the pond; the lights reflect best after dark.' },
            { pandalId: 'santosh-mitra-square', tip: 'Finish here and use Sealdah station for trains and metro home.' },
        ],
    },
    {
        id: 'east-salt-lake',
        title: 'East and Salt Lake trail',
        zone: 'East',
        tagline: 'Lake Town to the Salt Lake blocks',
        overview: 'Spacious grounds and large theme pandals. The trail begins with the Lake Town pair, then Dum Dum Park, and finishes with a short run through the Salt Lake blocks.',
        bestTime: 'The Lake Town pandals build queues after dark, so start there by about 5 pm. The Salt Lake blocks are easier later in the evening.',
        gettingThere: 'Lake Town and Dum Dum Park are best reached by cab, bus or bike. The Salt Lake blocks are close to City Centre and Central Park stations (Green Line), so finish by metro.',
        stops: [
            { pandalId: 'lake-town-adhibasi-brinda', tip: 'Start here; Sreebhumi is just down the road.' },
            { pandalId: 'sreebhumi', tip: 'One of the most visited pandals; expect a long queue after dark.' },
            { pandalId: 'dum-dum-park-bharat-chakra', tip: 'Several big pandals sit close together here, so you can pick two or three.' },
            { pandalId: 'fd-block', tip: 'Spacious grounds; a good place to rest before the next stops.' },
            { pandalId: 'ae-block', tip: 'A short walk from FD Block.' },
            { pandalId: 'ck-cl-block', tip: 'Near BJ Block, so the last two can be done on foot.' },
            { pandalId: 'bj-block', tip: 'Finish here and use Karunamoyee or Central Park station for the metro.' },
        ],
    },
    {
        id: 'south-ballygunge',
        title: 'South Kolkata trail',
        zone: 'South',
        tagline: 'Ballygunge, Gariahat and Rashbehari',
        overview: 'The densest pandal cluster in the city, mostly within walking distance. Start with the lawns at Maddox Square, move through Ballygunge and Gariahat, and end near Kalighat.',
        bestTime: 'Evenings from around 7 pm are the classic South Kolkata experience, but also the most crowded. Aim for about 5 pm to see the idols with more room.',
        gettingThere: 'Start near Ballygunge Junction station or take a short cab ride to Maddox Square. Finish near Kalighat (Blue Line metro) for the way home.',
        stops: [
            { pandalId: 'maddox-square', tip: 'Known as an evening adda spot on open lawns; arrive early to enjoy it.' },
            { pandalId: 'ekdalia-evergreen', tip: 'Often a replica of a famous monument, so photos are worth the queue.' },
            { pandalId: 'singhi-park', tip: 'A short walk from Ekdalia, and a good place for the traditional idol.' },
            { pandalId: 'hindustan-park', tip: 'Near Gariahat, so food and shopping stops are close.' },
            { pandalId: 'tridhara-sammilani', tip: 'Look up at the lighting and design.' },
            { pandalId: 'deshapriya-park', tip: 'The central stop of the trail; the park is large, so pace yourself.' },
            { pandalId: '66-pally', tip: 'Finish here and take the Blue Line from Kalighat.' },
        ],
    },
];

export interface ResolvedTrail extends PujaTrail {
    pandals: Array<{ pandal: PujaPandal; tip: string }>;
    /** Straight-line length between stops, scaled up a little for real streets. */
    distanceKm: number;
    /** Walking time at an easy pace plus time spent at each pandal, in minutes. */
    minutes: number;
}

const toRad = (value: number) => (value * Math.PI) / 180;

const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
};

const STREET_FACTOR = 1.3;
const WALK_KMH = 4.5;
const MINUTES_PER_PANDAL = 20;

export const resolveTrail = (trail: PujaTrail): ResolvedTrail => {
    const pandals = trail.stops
        .map((stop) => ({ pandal: getPandal(stop.pandalId), tip: stop.tip }))
        .filter((item): item is { pandal: PujaPandal; tip: string } => Boolean(item.pandal));

    let distanceKm = 0;
    for (let i = 1; i < pandals.length; i += 1) {
        distanceKm += haversineKm(pandals[i - 1].pandal, pandals[i].pandal) * STREET_FACTOR;
    }
    const minutes = Math.round((distanceKm / WALK_KMH) * 60 + pandals.length * MINUTES_PER_PANDAL);
    return { ...trail, pandals, distanceKm, minutes };
};

export const formatTrailDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const rest = Math.round((minutes % 60) / 5) * 5;
    if (!hours) return `${rest} min`;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
};
