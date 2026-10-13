import { supabase } from './supabase';
import { createNotification } from './destinations';

export type PandalZone = 'North' | 'Central' | 'East' | 'South';

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
    { id: 'nalin-sarkar-street', name: 'Hatibagan Nabin Pally', area: 'Nalin Sarkar Street, Hatibagan', zone: 'North', lat: 22.5981, lng: 88.3718, highlight: 'Neighbourhood theme pandal a short walk from Hatibagan.' },
    { id: 'shimla-byayam-samity', name: 'Simla Byayam Samity', area: 'Simla', zone: 'North', lat: 22.5879, lng: 88.3719, highlight: 'A historic club puja with roots in the freedom movement.' },
    { id: 'mohammad-ali-park', name: 'Mohammad Ali Park', area: 'Central Avenue', zone: 'Central', lat: 22.5796, lng: 88.3604, highlight: 'Central Kolkata crowd-puller with large, elaborate pandals.' },
    { id: 'college-square', name: 'College Square Sarbojanin', area: 'College Street', zone: 'Central', lat: 22.5751, lng: 88.3634, highlight: 'Lit up around the College Square pond; striking at night.' },
    { id: 'santosh-mitra-square', name: 'Santosh Mitra Square', area: 'Sealdah', zone: 'Central', lat: 22.5651, lng: 88.3671, highlight: 'Famous for grand replica-style pandals and very large crowds.' },
    { id: 'sreebhumi', name: 'Sreebhumi Sporting Club', area: 'Lake Town', zone: 'East', lat: 22.6055, lng: 88.4022, highlight: 'One of the most visited pandals; expect long queues after dark.' },
    { id: 'lake-town-adhibasi-brinda', name: 'Lake Town Adhibasi Brinda', area: 'Lake Town', zone: 'East', lat: 22.6039, lng: 88.4004, highlight: 'Close to Sreebhumi, easy to visit on the same stop.' },
    { id: 'fd-block', name: 'FD Block Salt Lake', area: 'Salt Lake Sector III', zone: 'East', lat: 22.5886, lng: 88.4071, highlight: 'Well-known Salt Lake puja with spacious grounds.' },
    { id: 'bj-block', name: 'BJ Block Salt Lake', area: 'Salt Lake Sector II', zone: 'East', lat: 22.5834, lng: 88.4181, highlight: 'Popular Salt Lake theme pandal.' },
    { id: 'maddox-square', name: 'Maddox Square', area: 'Ballygunge', zone: 'South', lat: 22.5262, lng: 88.3631, highlight: 'A traditional puja famous as an evening adda spot on the open lawns.' },
    { id: 'ekdalia-evergreen', name: 'Ekdalia Evergreen', area: 'Ballygunge', zone: 'South', lat: 22.5222, lng: 88.3662, highlight: 'Large South Kolkata pandal, often a replica of a famous monument.' },
    { id: 'singhi-park', name: 'Singhi Park', area: 'Ballygunge', zone: 'South', lat: 22.5217, lng: 88.3626, highlight: 'Known for its traditional idol; walking distance from Ekdalia.' },
    { id: 'hindustan-park', name: 'Hindusthan Club', area: 'Gariahat', zone: 'South', lat: 22.5209, lng: 88.3610, highlight: 'Art-led theme pandal near Gariahat.' },
    { id: 'deshapriya-park', name: 'Deshapriya Park', area: 'Rashbehari', zone: 'South', lat: 22.5187, lng: 88.3534, highlight: 'Big park-side puja, a central stop on any South Kolkata route.' },
    { id: 'tridhara-sammilani', name: 'Tridhara Sammilani', area: 'Rashbehari', zone: 'South', lat: 22.5196, lng: 88.3554, highlight: 'Known for elaborate lighting and design.' },
    { id: '66-pally', name: '66 Pally', area: 'Kalighat', zone: 'South', lat: 22.5182, lng: 88.3427, highlight: 'Theme pandal close to Deshapriya Park and Tridhara.' },
    { id: 'mudiali-club', name: 'Mudiali Club', area: 'Mudiali', zone: 'South', lat: 22.5139, lng: 88.3401, highlight: 'Long-running South Kolkata theme puja.' },
    { id: 'chetla-agrani', name: 'Chetla Agrani', area: 'Chetla', zone: 'South', lat: 22.5164, lng: 88.3371, highlight: 'Known for its striking idol and heavy evening crowds.' },
    { id: 'badamtala-ashar-sangha', name: 'Badamtala Ashar Sangha', area: 'Kalighat', zone: 'South', lat: 22.5188, lng: 88.3435, highlight: 'Award-winning theme pandal in the Kalighat area.' },
    { id: 'jodhpur-park', name: 'Jodhpur Park Sarbojanin', area: 'Jodhpur Park', zone: 'South', lat: 22.5061, lng: 88.3651, highlight: 'Well-known theme pandal in a quieter residential area.' },
    { id: 'suruchi-sangha', name: 'Suruchi Sangha', area: 'New Alipore', zone: 'South', lat: 22.5090, lng: 88.3340, highlight: 'Often built around a state or folk-art theme.' },
    { id: 'naktala-udayan-sangha', name: 'Naktala Udayan Sangha', area: 'Naktala', zone: 'South', lat: 22.4745, lng: 88.3666, highlight: 'Far-south pandal known for thoughtful, award-winning themes.' },
    { id: 'behala-notun-dal', name: 'Behala Notun Dal', area: 'Behala', zone: 'South', lat: 22.4981, lng: 88.3129, highlight: 'Popular Behala theme pandal.' },
    { id: 'barisha-club', name: 'Barisha Club', area: 'Behala', zone: 'South', lat: 22.4801, lng: 88.3101, highlight: 'Behala stop often paired with Notun Dal.' },
    { id: 'kashi-bose-lane', name: 'Kashi Bose Lane Sarbojanin', area: 'Shyambazar', zone: 'North', lat: 22.5925, lng: 88.3700, highlight: 'Well-known North Kolkata theme pandal close to Hatibagan.' },
    { id: 'kumartuli-sarbojanin', name: 'Kumartuli Sarbojanin', area: 'Kumartuli', zone: 'North', lat: 22.6015, lng: 88.3605, highlight: 'Neighbourhood puja in the idol makers\' lanes, next to Kumartuli Park.' },
    { id: 'ahiritola-jubak-brinda', name: 'Ahiritola Jubak Brinda', area: 'Ahiritola', zone: 'North', lat: 22.5992, lng: 88.3588, highlight: 'A second Ahiritola stop, a short walk from Ahiritola Sarbojanin.' },
    { id: 'pathuriaghata-panchar-pally', name: 'Pathuriaghata Panchar Pally', area: 'Pathuriaghata', zone: 'North', lat: 22.5890, lng: 88.3570, highlight: 'Old North Kolkata neighbourhood puja near the river.' },
    { id: 'sikdar-bagan', name: 'Sikdar Bagan Sadharan Durgotsav', area: 'Hatibagan', zone: 'North', lat: 22.6000, lng: 88.3735, highlight: 'Long-running community puja in the Hatibagan cluster.' },
    { id: 'tala-barowari', name: 'Tala Barowari', area: 'Tala', zone: 'North', lat: 22.6052, lng: 88.3812, highlight: 'One of the older community pujas, next door to Tala Prattoy.' },
    { id: 'belgachia-sarbojanin', name: 'Belgachia Sarbojanin', area: 'Belgachia', zone: 'North', lat: 22.6070, lng: 88.3890, highlight: 'Popular stop between Shyambazar and Lake Town.' },
    { id: 'chaltabagan', name: 'Chaltabagan Lohapatty', area: 'Maniktala', zone: 'North', lat: 22.5860, lng: 88.3650, highlight: 'Known for a traditional, richly decorated idol.' },
    { id: 'dum-dum-park-bharat-chakra', name: 'Dum Dum Park Bharat Chakra', area: 'Dum Dum Park', zone: 'North', lat: 22.6122, lng: 88.4132, highlight: 'Part of the Dum Dum Park cluster, where several big pandals sit close together.' },
    { id: 'dum-dum-park-tarun-sangha', name: 'Dum Dum Park Tarun Sangha', area: 'Dum Dum Park', zone: 'North', lat: 22.6131, lng: 88.4108, highlight: 'Theme pandal in the Dum Dum Park cluster.' },
    { id: 'dum-dum-park-yubak-brinda', name: 'Dum Dum Park Yubak Brinda', area: 'Dum Dum Park', zone: 'North', lat: 22.6108, lng: 88.4145, highlight: 'Theme pandal in the Dum Dum Park cluster.' },
    { id: 'dum-dum-park-sarbojanin', name: 'Dum Dum Park Sarbojanin', area: 'Dum Dum Park', zone: 'North', lat: 22.6142, lng: 88.4121, highlight: 'Theme pandal in the Dum Dum Park cluster.' },
    { id: 'rammohan-sammilani', name: 'Rammohan Sammilani', area: 'Amherst Street', zone: 'Central', lat: 22.5800, lng: 88.3680, highlight: 'Central Kolkata theme puja near Amherst Street.' },
    { id: 'bakul-bagan', name: 'Bakul Bagan Sarbojanin', area: 'Bhowanipore', zone: 'Central', lat: 22.5282, lng: 88.3478, highlight: 'Bhowanipore puja known for art-led themes.' },
    { id: '75-pally', name: '75 Pally', area: 'Bhowanipore', zone: 'Central', lat: 22.5318, lng: 88.3442, highlight: 'Neighbourhood theme pandal in Bhowanipore.' },
    { id: 'hazra-park', name: 'Hazra Park Durgotsav', area: 'Hazra', zone: 'Central', lat: 22.5240, lng: 88.3490, highlight: 'Large park-side puja on the way to South Kolkata.' },
    { id: 'alipore-sarbojanin', name: 'Alipore Sarbojanin', area: 'Alipore', zone: 'Central', lat: 22.5280, lng: 88.3330, highlight: 'Established puja in Alipore.' },
    { id: 'ae-block', name: 'AE Block Salt Lake', area: 'Salt Lake Sector I', zone: 'East', lat: 22.5902, lng: 88.4118, highlight: 'Salt Lake block puja, close to FD and BJ Blocks.' },
    { id: 'ck-cl-block', name: 'CK-CL Block Salt Lake', area: 'Salt Lake Sector II', zone: 'East', lat: 22.5872, lng: 88.4162, highlight: 'Salt Lake block puja near BJ Block.' },
    { id: 'telengabagan', name: 'Telengabagan Sarbojanin', area: 'Ultadanga', zone: 'East', lat: 22.5900, lng: 88.4020, highlight: 'Theme pandal near Ultadanga, on the way to Salt Lake.' },
    { id: 'kankurgachi-mitali', name: 'Kankurgachi Mitali', area: 'Kankurgachi', zone: 'East', lat: 22.5770, lng: 88.3910, highlight: 'Popular East Kolkata theme pandal.' },
    { id: 'beleghata-33-pally', name: 'Beleghata 33 Pally', area: 'Beleghata', zone: 'East', lat: 22.5640, lng: 88.3940, highlight: 'Beleghata stop, close to Beleghata Sandhani.' },
    { id: 'beleghata-sandhani', name: 'Beleghata Sandhani', area: 'Beleghata', zone: 'East', lat: 22.5660, lng: 88.3960, highlight: 'Beleghata theme pandal.' },
    { id: 'ballygunge-cultural', name: 'Ballygunge Cultural Association', area: 'Ballygunge', zone: 'South', lat: 22.5163, lng: 88.3558, highlight: 'Large Ballygunge puja near Ekdalia and Singhi Park.' },
    { id: 'samaj-sebi', name: 'Samaj Sebi Sangha', area: 'Lake View Road', zone: 'South', lat: 22.5140, lng: 88.3560, highlight: 'Known for a traditional idol and decor.' },
    { id: 'shib-mandir', name: 'Shib Mandir Sarbojanin', area: 'Lake Market', zone: 'South', lat: 22.5170, lng: 88.3550, highlight: 'Lake Market puja close to Deshapriya Park.' },
    { id: 'sanghashree', name: 'Sanghashree', area: 'Kalighat', zone: 'South', lat: 22.5180, lng: 88.3510, highlight: 'Kalighat area theme pandal.' },
    { id: 'kalighat-milan-sangha', name: 'Kalighat Milan Sangha', area: 'Kalighat', zone: 'South', lat: 22.5200, lng: 88.3450, highlight: 'Kalighat puja near the temple area.' },
    { id: '95-pally', name: '95 Pally', area: 'Jodhpur Park', zone: 'South', lat: 22.5050, lng: 88.3640, highlight: 'Jodhpur Park theme pandal.' },
    { id: 'babubagan', name: 'Babubagan Sarbojanin', area: 'Dhakuria', zone: 'South', lat: 22.5070, lng: 88.3720, highlight: 'Dhakuria neighbourhood puja.' },
    { id: 'selimpur-pally', name: 'Selimpur Pally', area: 'Dhakuria', zone: 'South', lat: 22.5040, lng: 88.3740, highlight: 'Dhakuria theme pandal, close to Babubagan.' },
    { id: 'bosepukur-sitala-mandir', name: 'Bosepukur Sitala Mandir', area: 'Kasba', zone: 'South', lat: 22.5150, lng: 88.3920, highlight: 'Kasba puja known for crafted, material-based pandals.' },
    { id: 'bosepukur-talbagan', name: 'Bosepukur Talbagan', area: 'Kasba', zone: 'South', lat: 22.5160, lng: 88.3942, highlight: 'Kasba theme pandal near Sitala Mandir.' },
    { id: 'rajdanga-naba-uday', name: 'Rajdanga Naba Uday Sangha', area: 'Kasba', zone: 'South', lat: 22.5110, lng: 88.3880, highlight: 'Kasba theme pandal.' },
    { id: 'santoshpur-lake-pally', name: 'Santoshpur Lake Pally', area: 'Santoshpur', zone: 'South', lat: 22.4920, lng: 88.3890, highlight: 'Santoshpur theme pandal near the lake.' },
    { id: 'santoshpur-trikon-park', name: 'Santoshpur Trikon Park', area: 'Santoshpur', zone: 'South', lat: 22.4870, lng: 88.3850, highlight: 'Santoshpur theme pandal.' },
    { id: 'haridevpur-ajeya-sanghati', name: 'Haridevpur Ajeya Sanghati', area: 'Haridevpur', zone: 'South', lat: 22.4810, lng: 88.3310, highlight: 'South-west Kolkata theme pandal.' },
    { id: 'haridevpur-41-pally', name: 'Haridevpur 41 Pally', area: 'Haridevpur', zone: 'South', lat: 22.4835, lng: 88.3387, highlight: 'Haridevpur neighbourhood theme pandal.' },
    { id: 'behala-club', name: 'Behala Club', area: 'Behala', zone: 'South', lat: 22.4960, lng: 88.3140, highlight: 'Behala puja near Notun Dal.' },
    { id: 'behala-friends', name: 'Behala Friends', area: 'Behala', zone: 'South', lat: 22.4890, lng: 88.3180, highlight: 'Behala theme pandal.' },
    { id: 'barisha-sarbojanin', name: 'Barisha Sarbojanin', area: 'Behala', zone: 'South', lat: 22.4780, lng: 88.3120, highlight: 'Behala stop close to Barisha Club.' },
    { id: 'sb-park', name: 'SB Park Sarbojanin', area: 'Thakurpukur', zone: 'South', lat: 22.4600, lng: 88.3070, highlight: 'Far-south Behala theme pandal.' },
    // Added from OpenStreetMap place coordinates. Chorbagan is the club's own mapped spot; the rest are neighbourhood-level.
    { id: 'chorbagan-sarbojanin', name: 'Chorbagan Sarbojanin', area: 'Chorbagan, Jorasanko', zone: 'North', lat: 22.5835, lng: 88.3632, highlight: 'Old North Kolkata community puja in the Jorasanko lanes, close to Tagore House and Burrabazar.' },
    { id: 'kidderpore-25-pally', name: 'Kidderpore 25 Pally', area: 'Kidderpore', zone: 'South', lat: 22.5354, lng: 88.3206, highlight: 'Port-side neighbourhood puja known for large themed pandals; a good stop with the Khidirpur food lanes.' },
    { id: 'hedua-park', name: 'Hedua Park Sarbojanin', area: 'Hedua, Bidhan Sarani', zone: 'Central', lat: 22.5877, lng: 88.3688, highlight: 'Park-side puja on Bidhan Sarani, easy to pair with Simla Byayam Samity and College Square.' },
    { id: 'wellington-square', name: 'Wellington Square Sarbojanin', area: 'Wellington', zone: 'Central', lat: 22.5543, lng: 88.3593, highlight: 'Central Kolkata square-side puja near Wellington crossing and Park Street.' },
    { id: 'aj-block-salt-lake', name: 'AJ Block Salt Lake', area: 'Salt Lake, Sector II', zone: 'East', lat: 22.5920, lng: 88.4293, highlight: 'One of the better-known Salt Lake block pujas, with neat park-side pandals.' },
    { id: 'bd-block-salt-lake', name: 'BD Block Salt Lake', area: 'Salt Lake, Sector I', zone: 'East', lat: 22.5948, lng: 88.4081, highlight: 'Salt Lake Sector I block puja close to the Sector I and Bidhannagar stretch of pandals.' },
    { id: 'kestopur-prafullakanan', name: 'Kestopur Prafullakanan', area: 'Kestopur', zone: 'East', lat: 22.5973, lng: 88.4339, highlight: 'Large Kestopur-area puja on the north-east edge of Salt Lake, usually with a big fair.' },
    { id: 'new-town-sarbojanin', name: 'New Town Sarbojanin', area: 'New Town', zone: 'East', lat: 22.5883, lng: 88.4734, highlight: 'New Town housing-complex and action-area pujas, a cluster that works as a separate evening trip.' },
    { id: 'lake-gardens', name: 'Lake Gardens Sarbojanin', area: 'Lake Gardens', zone: 'South', lat: 22.5081, lng: 88.3533, highlight: 'Residential-neighbourhood puja between Gariahat and Jodhpur Park, convenient with the south Kolkata circuit.' },
    { id: 'garia-sarbojanin', name: 'Garia Sarbojanin', area: 'Garia', zone: 'South', lat: 22.4727, lng: 88.3978, highlight: 'Far-south Garia and New Garia pujas near the Kavi Subhash metro, usually less crowded than Gariahat.' },
];

export interface PujaRestaurant {
    id: string;
    name: string;
    area: string;
    zone: PandalZone;
    lat: number;
    lng: number;
    cuisine: string;
    /** The pandal hotspot this place is a good meal stop for. */
    near: string;
}

/**
 * Well-known places to eat next to the busiest pandal clusters. Most positions come from OpenStreetMap; a few
 * are neighbourhood-level estimates. Menus, branches and festival hours should be checked before each Puja season.
 */
export const PUJA_RESTAURANTS: PujaRestaurant[] = [
    { id: 'nakur-nandy', name: 'Girish Chandra Dey & Nakur Chandra Nandy', area: 'Bagbazar', zone: 'North', lat: 22.6025, lng: 88.366, cuisine: 'Traditional Bengali sweets', near: 'Bagbazar and Kumartuli pandals' },
    { id: 'lamprini-cafe', name: 'Lamprini Cafe', area: 'Shobhabazar', zone: 'North', lat: 22.5945, lng: 88.3646, cuisine: 'Cafe, Italian and American', near: 'Shobhabazar Rajbari' },
    { id: 'fatsos-roll', name: 'Fatso\'s Roll', area: 'Maniktala', zone: 'North', lat: 22.5888, lng: 88.3697, cuisine: 'Kolkata rolls', near: 'Chaltabagan and Kashi Bose Lane pandals' },
    { id: 'bhojohori-manna-shyambazar', name: 'Bhojohori Manna', area: 'Shyambazar', zone: 'North', lat: 22.5941, lng: 88.3708, cuisine: 'Bengali', near: 'Kashi Bose Lane and Hatibagan pandals' },
    { id: 'golbari', name: 'Golbari', area: 'Shyambazar', zone: 'North', lat: 22.5968, lng: 88.3712, cuisine: 'Legendary fiery kosha mangsho (spicy mutton)', near: 'Ahiritola and Kashi Bose Lane pandals' },
    { id: 'aminia-hatibagan', name: 'Aminia, Hatibagan', area: 'Hatibagan', zone: 'North', lat: 22.5989, lng: 88.3727, cuisine: 'Awadhi and Mughlai, biryani and kebab', near: 'Hatibagan and Nalin Sarkar Street pandals' },
    { id: 'chowman-gouribari', name: 'Chowman', area: 'Hatibagan', zone: 'North', lat: 22.5945, lng: 88.3774, cuisine: 'Chinese, Thai and seafood', near: 'Hatibagan and Jagat Mukherjee Park' },
    { id: 'benfish', name: 'Benfish', area: 'Tala', zone: 'North', lat: 22.6072, lng: 88.3829, cuisine: 'Fish, Chinese and Indian', near: 'Tala Prattoy and Tala Barowari' },
    { id: 'aminia-dum-dum-park', name: 'Aminia, Dum Dum Park', area: 'Dum Dum Park', zone: 'North', lat: 22.6151, lng: 88.412, cuisine: 'Awadhi and Mughlai, biryani', near: 'Dum Dum Park pandal cluster' },
    { id: 'barbeque-nation-dum-dum', name: 'Barbeque Nation', area: 'Dum Dum Park', zone: 'North', lat: 22.6157, lng: 88.4123, cuisine: 'Barbecue buffet', near: 'Dum Dum Park pandal cluster' },
    { id: 'new-rajkumar-sweets', name: 'New Rajkumar Sweets', area: 'Dum Dum', zone: 'North', lat: 22.6202, lng: 88.4135, cuisine: 'Sweets and snacks', near: 'Dum Dum Park pandal cluster' },
    { id: 'royal-indian-hotel', name: 'Royal Indian Hotel', area: 'Zakaria Street', zone: 'Central', lat: 22.5812, lng: 88.361, cuisine: 'Mughlai, Kolkata biryani', near: 'Mohammad Ali Park' },
    { id: 'indian-coffee-house', name: 'Indian Coffee House', area: 'College Street', zone: 'Central', lat: 22.5761, lng: 88.3639, cuisine: 'Coffee and snacks, the classic College Street adda', near: 'College Square' },
    { id: 'paramount-sherbet', name: 'Paramount Sherbet', area: 'College Street', zone: 'Central', lat: 22.574, lng: 88.3646, cuisine: 'Sherbets and cold drinks', near: 'College Square' },
    { id: 'nizams', name: 'Nizam\'s', area: 'New Market', zone: 'Central', lat: 22.5621, lng: 88.3535, cuisine: 'Kathi rolls and kebabs', near: 'Santosh Mitra Square' },
    { id: 'sidheshwari-ashram', name: 'Hotel Sidheshwari Ashram', area: 'New Market', zone: 'Central', lat: 22.5613, lng: 88.3553, cuisine: 'Old-style Bengali "pice hotel" meals', near: 'Santosh Mitra Square' },
    { id: 'kasturi-new-market', name: 'Kasturi', area: 'New Market', zone: 'Central', lat: 22.558, lng: 88.3543, cuisine: 'Bengali, fish curry', near: 'Santosh Mitra Square' },
    { id: 'peter-cat', name: 'Peter Cat', area: 'Park Street', zone: 'Central', lat: 22.5524, lng: 88.3526, cuisine: 'Continental, famous chelo kebab', near: 'Park Street, between the Central and South pandal routes' },
    { id: 'mocambo', name: 'Mocambo', area: 'Park Street', zone: 'Central', lat: 22.5532, lng: 88.3532, cuisine: 'Continental and Indian', near: 'Park Street, between the Central and South pandal routes' },
    { id: 'trincas', name: 'Trincas', area: 'Park Street', zone: 'Central', lat: 22.5541, lng: 88.3516, cuisine: 'Continental, a live-music classic', near: 'Park Street, between the Central and South pandal routes' },
    { id: 'kusum-rolls', name: 'Kusum Rolls', area: 'Park Street', zone: 'Central', lat: 22.5535, lng: 88.3523, cuisine: 'Kolkata kathi rolls', near: 'Park Street, between the Central and South pandal routes' },
    { id: 'oudh-park-street', name: 'Oudh 1590', area: 'Park Street', zone: 'Central', lat: 22.5558, lng: 88.3507, cuisine: 'Awadhi', near: 'Park Street, between the Central and South pandal routes' },
    { id: 'arsalan-park-circus', name: 'Arsalan', area: 'Park Circus', zone: 'Central', lat: 22.5439, lng: 88.366, cuisine: 'Biryani and Mughlai', near: 'Park Circus, a short ride from the Ballygunge pandals' },
    { id: 'zeeshan', name: 'Zeeshan', area: 'Park Circus', zone: 'Central', lat: 22.5413, lng: 88.3659, cuisine: 'Mughlai and kebabs', near: 'Park Circus, a short ride from the Ballygunge pandals' },
    { id: 'kewpies-kitchen', name: 'Kewpie\'s', area: 'Elgin Road', zone: 'Central', lat: 22.5366, lng: 88.351, cuisine: 'Homestyle Bengali', near: 'Bakul Bagan, 75 Pally and Hazra Park' },
    { id: 'oh-calcutta-elgin', name: 'Oh! Calcutta', area: 'Elgin Road', zone: 'Central', lat: 22.5381, lng: 88.3512, cuisine: 'Bengali fine dining', near: 'Bakul Bagan, 75 Pally and Hazra Park' },
    { id: 'balwant-singhs', name: 'Balwant Singh\'s Eating House', area: 'Elgin Road', zone: 'Central', lat: 22.5378, lng: 88.3441, cuisine: 'Punjabi dhaba food', near: '75 Pally and Alipore Sarbojanin' },
    { id: 'six-ballygunge-place', name: '6 Ballygunge Place', area: 'Ballygunge', zone: 'South', lat: 22.5278, lng: 88.3686, cuisine: 'Bengali fine dining', near: 'Maddox Square, Ekdalia and Singhi Park' },
    { id: 'kasturi-ballygunge', name: 'Kasturi', area: 'Ballygunge', zone: 'South', lat: 22.5272, lng: 88.3673, cuisine: 'Bengali, fish curry', near: 'Maddox Square, Ekdalia and Singhi Park' },
    { id: 'kolkata-tram-world', name: 'Kolkata Tram World', area: 'Ballygunge', zone: 'South', lat: 22.5253, lng: 88.3654, cuisine: 'Multi-cuisine in a restored tram', near: 'Maddox Square and Ekdalia Evergreen' },
    { id: 'bhojohori-manna-hindustan-park', name: 'Bhojohori Manna', area: 'Hindustan Park', zone: 'South', lat: 22.5202, lng: 88.3609, cuisine: 'Bengali', near: 'Hindusthan Club and Singhi Park' },
    { id: 'azad-hind-dhaba', name: 'Azad Hind Dhaba', area: 'Gariahat', zone: 'South', lat: 22.5172, lng: 88.3614, cuisine: 'Punjabi dhaba food', near: 'Hindusthan Club and Ballygunge pandals' },
    { id: 'saptapadi', name: 'Saptapadi', area: 'Gariahat', zone: 'South', lat: 22.5192, lng: 88.3655, cuisine: 'Bengali, fish and prawn dishes', near: 'Hindusthan Club and Ballygunge pandals' },
    { id: 'aminia-gariahat', name: 'Aminia, Gariahat', area: 'Gariahat', zone: 'South', lat: 22.5168, lng: 88.3669, cuisine: 'Awadhi and Mughlai, biryani', near: 'Hindusthan Club and Ballygunge pandals' },
    { id: 'potboiler-coffee-house', name: 'Potboiler Coffee House', area: 'Lake Market', zone: 'South', lat: 22.5175, lng: 88.3578, cuisine: 'Cafe and snacks', near: 'Shib Mandir and Deshapriya Park' },
    { id: 'cheese-cherry-pineapple', name: 'Cheese Cherry Pineapple', area: 'Deshapriya Park', zone: 'South', lat: 22.5144, lng: 88.3526, cuisine: 'Cafe, pizza and sandwiches', near: 'Deshapriya Park and 66 Pally' },
    { id: 'barbeque-nation-tridhara', name: 'Barbeque Nation', area: 'Rashbehari', zone: 'South', lat: 22.5165, lng: 88.3487, cuisine: 'Barbecue buffet', near: 'Tridhara Sammilani and Sanghashree' },
    { id: 'aminia-naktala', name: 'Aminia, Garia', area: 'Garia', zone: 'South', lat: 22.4655, lng: 88.3767, cuisine: 'Awadhi and Mughlai, biryani', near: 'Naktala Udayan Sangha' },
    { id: 'aminia-behala', name: 'Aminia, Behala', area: 'Behala', zone: 'South', lat: 22.4978, lng: 88.3165, cuisine: 'Awadhi and Mughlai, biryani', near: 'Behala Notun Dal and Behala Club' },
    { id: 'panna-sweets', name: 'Panna Sweets', area: 'Behala', zone: 'South', lat: 22.4992, lng: 88.3171, cuisine: 'Bengali sweets and snacks', near: 'Behala Notun Dal and Behala Club' },
    { id: 'chowman-behala', name: 'Chowman', area: 'Behala', zone: 'South', lat: 22.4893, lng: 88.3169, cuisine: 'Chinese', near: 'Behala Friends and Behala Club' },
    { id: 'oudh-salt-lake', name: 'Oudh 1590', area: 'Salt Lake Sector I', zone: 'East', lat: 22.5921, lng: 88.4118, cuisine: 'Awadhi and Mughlai', near: 'AE, FD and BJ Block pandals' },
    { id: 'six-ballygunge-place-salt-lake', name: '6 Ballygunge Place', area: 'Salt Lake Sector I', zone: 'East', lat: 22.5902, lng: 88.4092, cuisine: 'Bengali fine dining', near: 'AE, FD and BJ Block pandals' },
    { id: 'calcutta-64', name: 'Calcutta 64', area: 'Salt Lake Sector I', zone: 'East', lat: 22.5935, lng: 88.4059, cuisine: 'Bengali', near: 'AE, FD and BJ Block pandals' },
    { id: 'fly-kouzina', name: 'Fly Kouzina', area: 'Salt Lake Sector I', zone: 'East', lat: 22.5925, lng: 88.4125, cuisine: 'Pure-veg family dining', near: 'AE, FD and BJ Block pandals' },
    { id: 'pinkk-sugars', name: 'Pinkk Sugars', area: 'Salt Lake Sector I', zone: 'East', lat: 22.5915, lng: 88.4095, cuisine: 'Cafe and bakery', near: 'AE, FD and BJ Block pandals' },
    { id: 'que-pasa', name: 'Que Pasa', area: 'Salt Lake Sector I', zone: 'East', lat: 22.5959, lng: 88.4067, cuisine: 'Cafe, pasta and pizza', near: 'AE, FD and BJ Block pandals' },
    { id: 'shiraz-salt-lake', name: 'Shiraz', area: 'Salt Lake Sector II', zone: 'East', lat: 22.5772, lng: 88.4109, cuisine: 'Mughlai and biryani', near: 'BJ Block and CK-CL Block pandals' },
    { id: 'bhatura-singh', name: 'Bhatura Singh', area: 'Kankurgachi', zone: 'East', lat: 22.5845, lng: 88.391, cuisine: 'Punjabi, chole bhature', near: 'Kankurgachi Mitali and Telengabagan' },
    { id: 'bean-stop-lake-town', name: 'Bean Stop', area: 'Lake Town', zone: 'East', lat: 22.6016, lng: 88.4073, cuisine: 'Cafe and sandwiches', near: 'Sreebhumi and Lake Town Adhibasi Brinda' },
];

export type PujaTransitMode = 'metro' | 'train';

export interface PujaTransit {
    id: string;
    name: string;
    area: string;
    lat: number;
    lng: number;
    mode: PujaTransitMode;
    /** Metro line colour, or the kind of railway service. */
    line: string;
    /** The pandals closest to this station. */
    near: string;
}

/**
 * Metro and railway stations around the pandal clusters. Positions come from OpenStreetMap; "near" is worked out
 * from the pandal coordinates above. Only the Blue, Green and Purple metro lines are listed. Check timings and
 * Puja-special services before travelling.
 */
export const PUJA_TRANSIT: PujaTransit[] = [
    { id: 'dum-dum-metro', name: 'Dum Dum', area: 'Dum Dum', lat: 22.6211, lng: 88.3929, mode: 'metro', line: 'Blue', near: 'Belgachia Sarbojanin (about 1.6 km)' },
    { id: 'belgachia-metro', name: 'Belgachia', area: 'Belgachia', lat: 22.6059, lng: 88.3864, mode: 'metro', line: 'Blue', near: 'Belgachia Sarbojanin, Tala Barowari and Tala Prattoy' },
    { id: 'shyambazar-metro', name: 'Shyambazar', area: 'Shyambazar', lat: 22.6013, lng: 88.3725, mode: 'metro', line: 'Blue', near: 'Sikdar Bagan Sadharan Durgotsav, Hatibagan Nabin Pally and Jagat Mukherjee Park' },
    { id: 'shobhabazar-sutanuti-metro', name: 'Shobhabazar Sutanuti', area: 'Shobhabazar', lat: 22.5959, lng: 88.3652, mode: 'metro', line: 'Blue', near: 'Shobhabazar Rajbari, Kashi Bose Lane Sarbojanin and Ahiritola Sarbojanin' },
    { id: 'girish-park-metro', name: 'Girish Park', area: 'Girish Park', lat: 22.5871, lng: 88.3629, mode: 'metro', line: 'Blue', near: 'Chaltabagan Lohapatty, Chorbagan Sarbojanin and Hedua Park Sarbojanin' },
    { id: 'mahatma-gandhi-road-metro', name: 'Mahatma Gandhi Road', area: 'Burrabazar', lat: 22.5809, lng: 88.3613, mode: 'metro', line: 'Blue', near: 'Mohammad Ali Park, Chorbagan Sarbojanin and Chaltabagan Lohapatty' },
    { id: 'central-metro', name: 'Central', area: 'College Street', lat: 22.5725, lng: 88.3587, mode: 'metro', line: 'Blue', near: 'College Square Sarbojanin, Mohammad Ali Park and Santosh Mitra Square' },
    { id: 'chandni-chowk-metro', name: 'Chandni Chowk', area: 'New Market', lat: 22.5670, lng: 88.3542, mode: 'metro', line: 'Blue', near: 'College Square Sarbojanin (about 1.3 km)' },
    { id: 'esplanade-metro', name: 'Esplanade', area: 'Esplanade', lat: 22.5636, lng: 88.3512, mode: 'metro', line: 'Blue and Green', near: 'Wellington Square Sarbojanin (about 1.3 km)' },
    { id: 'park-street-metro', name: 'Park Street', area: 'Park Street', lat: 22.5552, lng: 88.3501, mode: 'metro', line: 'Blue', near: 'Wellington Square Sarbojanin' },
    { id: 'maidan-metro', name: 'Maidan', area: 'Maidan', lat: 22.5495, lng: 88.3488, mode: 'metro', line: 'Blue', near: 'Wellington Square Sarbojanin (about 1.2 km)' },
    { id: 'rabindra-sadan-metro', name: 'Rabindra Sadan', area: 'Rabindra Sadan', lat: 22.5415, lng: 88.3473, mode: 'metro', line: 'Blue', near: '75 Pally' },
    { id: 'netaji-bhavan-metro', name: 'Netaji Bhavan', area: 'Bhowanipore', lat: 22.5332, lng: 88.3459, mode: 'metro', line: 'Blue', near: '75 Pally, Bakul Bagan Sarbojanin and Hazra Park Durgotsav' },
    { id: 'jatin-das-park-metro', name: 'Jatin Das Park', area: 'Hazra', lat: 22.5242, lng: 88.3465, mode: 'metro', line: 'Blue', near: 'Hazra Park Durgotsav, Bakul Bagan Sarbojanin and Kalighat Milan Sangha' },
    { id: 'kalighat-metro', name: 'Kalighat', area: 'Kalighat', lat: 22.5169, lng: 88.3458, mode: 'metro', line: 'Blue', near: 'Badamtala Ashar Sangha, 66 Pally and Kalighat Milan Sangha' },
    { id: 'rabindra-sarobar-metro', name: 'Rabindra Sarobar', area: 'Lake Gardens', lat: 22.5079, lng: 88.3455, mode: 'metro', line: 'Blue', near: 'Lake Gardens Sarbojanin, Mudiali Club and 66 Pally' },
    { id: 'mahanayak-uttam-kumar-tollygunge-metro', name: 'Mahanayak Uttam Kumar (Tollygunge)', area: 'Tollygunge', lat: 22.4948, lng: 88.3451, mode: 'metro', line: 'Blue', near: 'Haridevpur 41 Pally (about 1.4 km)' },
    { id: 'netaji-metro', name: 'Netaji', area: 'Netaji Nagar', lat: 22.4809, lng: 88.3459, mode: 'metro', line: 'Blue', near: 'Haridevpur 41 Pally' },
    { id: 'gitanjali-metro', name: 'Gitanjali', area: 'Naktala', lat: 22.4695, lng: 88.3698, mode: 'metro', line: 'Blue', near: 'Naktala Udayan Sangha' },
    { id: 'kavi-nazrul-metro', name: 'Kavi Nazrul', area: 'Naktala', lat: 22.4643, lng: 88.3805, mode: 'metro', line: 'Blue', near: 'Naktala Udayan Sangha (about 1.8 km)' },
    { id: 'howrah-maidan-metro', name: 'Howrah Maidan', area: 'Howrah', lat: 22.5839, lng: 88.3340, mode: 'metro', line: 'Green', near: 'Pathuriaghata Panchar Pally (about 2.4 km)' },
    { id: 'howrah-metro', name: 'Howrah', area: 'Howrah', lat: 22.5834, lng: 88.3403, mode: 'metro', line: 'Green', near: 'Pathuriaghata Panchar Pally (about 1.8 km)' },
    { id: 'mahakaran-metro', name: 'Mahakaran', area: 'BBD Bagh', lat: 22.5721, lng: 88.3505, mode: 'metro', line: 'Green', near: 'Mohammad Ali Park (about 1.3 km)' },
    { id: 'sealdah-metro', name: 'Sealdah', area: 'Sealdah', lat: 22.5680, lng: 88.3711, mode: 'metro', line: 'Green', near: 'Santosh Mitra Square and College Square Sarbojanin' },
    { id: 'phoolbagan-metro', name: 'Phoolbagan', area: 'Phoolbagan', lat: 22.5721, lng: 88.3902, mode: 'metro', line: 'Green', near: 'Kankurgachi Mitali, Beleghata Sandhani and Beleghata 33 Pally' },
    { id: 'salt-lake-stadium-metro', name: 'Salt Lake Stadium', area: 'Salt Lake', lat: 22.5731, lng: 88.4031, mode: 'metro', line: 'Green', near: 'Beleghata Sandhani' },
    { id: 'bengal-chemical-metro', name: 'Bengal Chemical', area: 'Salt Lake', lat: 22.5801, lng: 88.4013, mode: 'metro', line: 'Green', near: 'Telengabagan Sarbojanin, Kankurgachi Mitali and FD Block Salt Lake' },
    { id: 'city-centre-metro', name: 'City Centre', area: 'Salt Lake', lat: 22.5871, lng: 88.4079, mode: 'metro', line: 'Green', near: 'FD Block Salt Lake, AE Block Salt Lake and Telengabagan Sarbojanin' },
    { id: 'central-park-metro', name: 'Central Park', area: 'Salt Lake', lat: 22.5905, lng: 88.4156, mode: 'metro', line: 'Green', near: 'CK-CL Block Salt Lake, AE Block Salt Lake and BJ Block Salt Lake' },
    { id: 'karunamoyee-metro', name: 'Karunamoyee', area: 'Salt Lake', lat: 22.5864, lng: 88.4215, mode: 'metro', line: 'Green', near: 'BJ Block Salt Lake, CK-CL Block Salt Lake and AJ Block Salt Lake' },
    { id: 'salt-lake-sector-v-metro', name: 'Salt Lake Sector V', area: 'Salt Lake Sector V', lat: 22.5809, lng: 88.4291, mode: 'metro', line: 'Green', near: 'BJ Block Salt Lake' },
    { id: 'majerhat-metro', name: 'Majerhat', area: 'Majerhat', lat: 22.5191, lng: 88.3237, mode: 'metro', line: 'Purple', near: 'Alipore Sarbojanin (about 1.4 km)' },
    { id: 'taratala-metro', name: 'Taratala', area: 'Taratala', lat: 22.5077, lng: 88.3204, mode: 'metro', line: 'Purple', near: 'Behala Notun Dal (about 1.3 km)' },
    { id: 'behala-bazar-metro', name: 'Behala Bazar', area: 'Behala', lat: 22.4988, lng: 88.3174, mode: 'metro', line: 'Purple', near: 'Behala Club, Behala Notun Dal and Behala Friends' },
    { id: 'behala-chowrasta-metro', name: 'Behala Chowrasta', area: 'Behala', lat: 22.4874, lng: 88.3134, mode: 'metro', line: 'Purple', near: 'Behala Friends, Barisha Club and Behala Club' },
    { id: 'sakher-bazar-metro', name: 'Sakher Bazar', area: 'Behala', lat: 22.4749, lng: 88.3100, mode: 'metro', line: 'Purple', near: 'Barisha Sarbojanin and Barisha Club' },
    { id: 'thakurpukur-metro', name: 'Thakurpukur', area: 'Thakurpukur', lat: 22.4644, lng: 88.3075, mode: 'metro', line: 'Purple', near: 'SB Park Sarbojanin' },
    { id: 'howrah-junction-rail', name: 'Howrah Junction', area: 'Howrah', lat: 22.5829, lng: 88.3428, mode: 'train', line: 'Main line and long-distance', near: 'Pathuriaghata Panchar Pally (about 1.6 km)' },
    { id: 'sealdah-rail', name: 'Sealdah', area: 'Sealdah', lat: 22.5680, lng: 88.3711, mode: 'train', line: 'Main line and long-distance', near: 'Santosh Mitra Square and College Square Sarbojanin' },
    { id: 'kolkata-chitpur-terminal-rail', name: 'Kolkata (Chitpur) Terminal', area: 'Chitpur', lat: 22.6013, lng: 88.3841, mode: 'train', line: 'Long-distance', near: 'Tala Prattoy, Tala Barowari and Jagat Mukherjee Park' },
    { id: 'shalimar-rail', name: 'Shalimar', area: 'Howrah', lat: 22.5552, lng: 88.3154, mode: 'train', line: 'Long-distance', near: 'Kidderpore 25 Pally (about 2.3 km)' },
    { id: 'sovabazar-ahiritola-rail', name: 'Sovabazar Ahiritola', area: 'Ahiritola', lat: 22.5975, lng: 88.3549, mode: 'train', line: 'Circular Railway', near: 'Ahiritola Jubak Brinda, Ahiritola Sarbojanin and Kumartuli Park Sarbojanin' },
    { id: 'tala-rail', name: 'Tala', area: 'Tala', lat: 22.6064, lng: 88.3784, mode: 'train', line: 'Suburban', near: 'Tala Prattoy, Tala Barowari and Jagat Mukherjee Park' },
    { id: 'bidhannagar-road-rail', name: 'Bidhannagar Road', area: 'Ultadanga', lat: 22.5913, lng: 88.3910, mode: 'train', line: 'Suburban', near: 'Telengabagan Sarbojanin' },
    { id: 'park-circus-rail', name: 'Park Circus', area: 'Park Circus', lat: 22.5408, lng: 88.3739, mode: 'train', line: 'Suburban', near: 'Maddox Square (about 2.0 km)' },
    { id: 'ballygunge-junction-rail', name: 'Ballygunge Junction', area: 'Ballygunge', lat: 22.5194, lng: 88.3721, mode: 'train', line: 'Suburban', near: 'Ekdalia Evergreen, Singhi Park and Hindusthan Club' },
    { id: 'dhakuria-rail', name: 'Dhakuria', area: 'Dhakuria', lat: 22.5091, lng: 88.3711, mode: 'train', line: 'Suburban', near: 'Babubagan Sarbojanin, Selimpur Pally and Jodhpur Park Sarbojanin' },
    { id: 'lake-gardens-rail', name: 'Lake Gardens', area: 'Lake Gardens', lat: 22.5081, lng: 88.3533, mode: 'train', line: 'Suburban', near: 'Lake Gardens Sarbojanin, Samaj Sebi Sangha and Ballygunge Cultural Association' },
    { id: 'jadavpur-rail', name: 'Jadavpur', area: 'Jadavpur', lat: 22.4951, lng: 88.3750, mode: 'train', line: 'Suburban', near: 'Selimpur Pally' },
    { id: 'tollygunge-rail', name: 'Tollygunge', area: 'Tollygunge', lat: 22.5078, lng: 88.3477, mode: 'train', line: 'Suburban', near: 'Lake Gardens Sarbojanin, Mudiali Club and Samaj Sebi Sangha' },
    { id: 'baghajatin-rail', name: 'Baghajatin', area: 'Baghajatin', lat: 22.4827, lng: 88.3867, mode: 'train', line: 'Suburban', near: 'Santoshpur Trikon Park and Santoshpur Lake Pally' },
    { id: 'garia-rail', name: 'Garia', area: 'Garia', lat: 22.4656, lng: 88.4055, mode: 'train', line: 'Suburban', near: 'Garia Sarbojanin' },
    { id: 'bbd-bagh-rail', name: 'BBD Bagh', area: 'BBD Bagh', lat: 22.5768, lng: 88.3466, mode: 'train', line: 'Circular Railway', near: 'Mohammad Ali Park (about 1.4 km)' },
    { id: 'prinsep-ghat-rail', name: 'Prinsep Ghat', area: 'Prinsep Ghat', lat: 22.5566, lng: 88.3314, mode: 'train', line: 'Circular Railway', near: 'Kidderpore 25 Pally (about 2.6 km)' },
    { id: 'new-alipore-rail', name: 'New Alipore', area: 'New Alipore', lat: 22.5105, lng: 88.3354, mode: 'train', line: 'Suburban', near: 'Suruchi Sangha, Mudiali Club and Chetla Agrani' },
];

export type PujaHospitalType = 'Government' | 'Private' | 'Trust';

export interface PujaHospital {
    id: string;
    name: string;
    area: string;
    lat: number;
    lng: number;
    type: PujaHospitalType;
    /** The pandals closest to this hospital. */
    near: string;
}

/**
 * Larger hospitals near the pandal routes. Positions come from OpenStreetMap. Emergency services and bed
 * availability are not tracked here, so call ahead; in an emergency dial 112 (ambulance 102 or 108).
 */
export const PUJA_HOSPITALS: PujaHospital[] = [
    { id: 'rg-kar-medical-college-and-hospital', name: 'R.G. Kar Medical College and Hospital', area: 'Shyambazar', lat: 22.6044, lng: 88.3784, type: 'Government', near: 'Tala Prattoy, Tala Barowari and Jagat Mukherjee Park' },
    { id: 'sterling-hospital', name: 'Sterling Hospital', area: 'Shyambazar', lat: 22.6000, lng: 88.3678, type: 'Private', near: 'Bagbazar Sarbojanin, Hatibagan Nabin Pally and Sikdar Bagan Sadharan Durgotsav' },
    { id: 'marwari-relief-society-hospital', name: 'Marwari Relief Society Hospital', area: 'Burrabazar', lat: 22.5827, lng: 88.3573, type: 'Trust', near: 'Mohammad Ali Park, Chorbagan Sarbojanin and Pathuriaghata Panchar Pally' },
    { id: 'dum-dum-municipal-specialized-hospital', name: 'Dum Dum Municipal Specialized Hospital', area: 'Dum Dum', lat: 22.6390, lng: 88.4151, type: 'Government', near: 'Dum Dum Park Sarbojanin (about 2.8 km)' },
    { id: 'calcutta-medical-college-and-hospital', name: 'Calcutta Medical College and Hospital', area: 'College Street', lat: 22.5638, lng: 88.3685, type: 'Government', near: 'Santosh Mitra Square, College Square Sarbojanin and Wellington Square Sarbojanin' },
    { id: 'nrs-medical-college-and-hospital', name: 'NRS Medical College and Hospital', area: 'Sealdah', lat: 22.5653, lng: 88.3692, type: 'Government', near: 'Santosh Mitra Square and College Square Sarbojanin' },
    { id: 'lady-dufferin-victoria-hospital', name: 'Lady Dufferin Victoria Hospital', area: 'Sealdah', lat: 22.5691, lng: 88.3658, type: 'Government', near: 'Santosh Mitra Square, College Square Sarbojanin and Rammohan Sammilani' },
    { id: 'b-r-singh-hospital-railway', name: 'B R Singh Hospital (Railway)', area: 'Sealdah', lat: 22.5654, lng: 88.3711, type: 'Government', near: 'Santosh Mitra Square and College Square Sarbojanin' },
    { id: 'esi-hospital-maniktala', name: 'ESI Hospital Maniktala', area: 'Maniktala', lat: 22.5857, lng: 88.3925, type: 'Government', near: 'Kankurgachi Mitali and Telengabagan Sarbojanin' },
    { id: 'north-city-hospital', name: 'North City Hospital', area: 'Ultadanga', lat: 22.5887, lng: 88.3935, type: 'Private', near: 'Telengabagan Sarbojanin, Kankurgachi Mitali and FD Block Salt Lake' },
    { id: 'id-and-bg-hospital', name: 'I.D. and B.G. Hospital', area: 'Beliaghata', lat: 22.5645, lng: 88.3984, type: 'Government', near: 'Beleghata Sandhani and Beleghata 33 Pally' },
    { id: 'sskm-ipgmer-hospital', name: 'SSKM (IPGMER) Hospital', area: 'Bhowanipore', lat: 22.5400, lng: 88.3424, type: 'Government', near: '75 Pally and Bakul Bagan Sarbojanin' },
    { id: 'woodlands-multispeciality-hospital', name: 'Woodlands Multispeciality Hospital', area: 'Alipore', lat: 22.5323, lng: 88.3292, type: 'Private', near: 'Alipore Sarbojanin and Kidderpore 25 Pally' },
    { id: 'cmri', name: 'CMRI', area: 'Alipore', lat: 22.5324, lng: 88.3279, type: 'Private', near: 'Alipore Sarbojanin and Kidderpore 25 Pally' },
    { id: 'belle-vue-clinic', name: 'Belle Vue Clinic', area: 'Loudon Street', lat: 22.5425, lng: 88.3551, type: 'Private', near: 'Wellington Square Sarbojanin' },
    { id: 'institute-of-neurosciences', name: 'Institute of Neurosciences', area: 'Park Street', lat: 22.5470, lng: 88.3621, type: 'Private', near: 'Wellington Square Sarbojanin' },
    { id: 'calcutta-national-medical-college', name: 'Calcutta National Medical College', area: 'Park Circus', lat: 22.5461, lng: 88.3715, type: 'Government', near: 'Wellington Square Sarbojanin (about 1.5 km)' },
    { id: 'chittaranjan-national-cancer-institute', name: 'Chittaranjan National Cancer Institute', area: 'Kalighat', lat: 22.5253, lng: 88.3466, type: 'Government', near: 'Hazra Park Durgotsav, Bakul Bagan Sarbojanin and Kalighat Milan Sangha' },
    { id: 'apollo-gleneagles-hospital', name: 'Apollo Gleneagles Hospital', area: 'Canal Circular Road', lat: 22.5743, lng: 88.4016, type: 'Private', near: 'Beleghata Sandhani, Kankurgachi Mitali and Beleghata 33 Pally' },
    { id: 'columbia-asia-hospital', name: 'Columbia Asia Hospital', area: 'Salt Lake', lat: 22.5723, lng: 88.4128, type: 'Private', near: 'BJ Block Salt Lake' },
    { id: 'bidhannagar-state-general-hospital', name: 'Bidhannagar State General Hospital', area: 'Salt Lake', lat: 22.5912, lng: 88.4111, type: 'Government', near: 'AE Block Salt Lake, BD Block Salt Lake and FD Block Salt Lake' },
    { id: 'fortis-hospital', name: 'Fortis Hospital', area: 'Anandapur', lat: 22.5203, lng: 88.4010, type: 'Private', near: 'Bosepukur Talbagan and Bosepukur Sitala Mandir' },
    { id: 'ruby-general-hospital', name: 'Ruby General Hospital', area: 'Kasba', lat: 22.5135, lng: 88.4030, type: 'Private', near: 'Bosepukur Talbagan and Bosepukur Sitala Mandir' },
    { id: 'amri-hospital-dhakuria', name: 'AMRI Hospital Dhakuria', area: 'Dhakuria', lat: 22.5125, lng: 88.3676, type: 'Private', near: 'Jodhpur Park Sarbojanin, Babubagan Sarbojanin and 95 Pally' },
    { id: 'calcutta-heart-research-centre', name: 'Calcutta Heart Research Centre', area: 'Lake Market', lat: 22.5233, lng: 88.3526, type: 'Private', near: 'Hazra Park Durgotsav, Tridhara Sammilani and Deshapriya Park' },
    { id: 'bp-poddar-hospital', name: 'B.P. Poddar Hospital', area: 'New Alipore', lat: 22.5118, lng: 88.3324, type: 'Private', near: 'Suruchi Sangha, Chetla Agrani and Mudiali Club' },
    { id: 'mr-bangur-hospital', name: 'M.R. Bangur Hospital', area: 'Tollygunge', lat: 22.4992, lng: 88.3465, type: 'Government', near: 'Lake Gardens Sarbojanin' },
    { id: 'peerless-hospital', name: 'Peerless Hospital', area: 'Panchasayar', lat: 22.4810, lng: 88.3938, type: 'Private', near: 'Garia Sarbojanin, Santoshpur Trikon Park and Santoshpur Lake Pally' },
    { id: 'vidyasagar-state-general-hospital', name: 'Vidyasagar State General Hospital', area: 'Behala', lat: 22.4987, lng: 88.3163, type: 'Government', near: 'Behala Notun Dal, Behala Club and Behala Friends' },
];

export const getTransit = (id: string) => PUJA_TRANSIT.find((item) => item.id === id) || null;

export const getHospital = (id: string) => PUJA_HOSPITALS.find((item) => item.id === id) || null;

export const PANDAL_ZONES: PandalZone[] = ['North', 'Central', 'East', 'South'];

export const getRestaurant = (id: string) => PUJA_RESTAURANTS.find((item) => item.id === id) || null;

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
