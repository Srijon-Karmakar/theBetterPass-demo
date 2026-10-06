import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon, point, type DivIcon } from 'leaflet';
import {
    Castle,
    Church,
    Flame,
    Landmark,
    Library,
    MapPin,
    Moon,
    Mountain,
    School,
    ShoppingBag,
    Tent,
    Trees,
    UtensilsCrossed,
    type LucideIcon,
} from 'lucide-react';
import { supabase } from './supabase';

export type PinCategory =
    | 'temple' | 'mosque' | 'church' | 'school' | 'historical' | 'heritage'
    | 'durga_puja' | 'museum' | 'park' | 'market' | 'food' | 'viewpoint' | 'other';

/** Each category is a head colour plus a glyph; the second pin colour (outline, needle, glyph) is always ink. */
export const PIN_CATEGORIES: Array<{ key: PinCategory; label: string; color: string; Icon: LucideIcon }> = [
    { key: 'temple', label: 'Temple', color: '#fb923c', Icon: Flame },
    { key: 'durga_puja', label: 'Durga Puja Pandal', color: '#f87171', Icon: Tent },
    { key: 'heritage', label: 'Heritage', color: '#fbbf24', Icon: Landmark },
    { key: 'historical', label: 'Historical', color: '#c4b5fd', Icon: Castle },
    { key: 'school', label: 'School', color: '#fde047', Icon: School },
    { key: 'museum', label: 'Museum', color: '#5eead4', Icon: Library },
    { key: 'church', label: 'Church', color: '#93c5fd', Icon: Church },
    { key: 'mosque', label: 'Mosque', color: '#34d399', Icon: Moon },
    { key: 'park', label: 'Park', color: '#a3e635', Icon: Trees },
    { key: 'market', label: 'Market', color: '#e879f9', Icon: ShoppingBag },
    { key: 'food', label: 'Food', color: '#fb7185', Icon: UtensilsCrossed },
    { key: 'viewpoint', label: 'Viewpoint', color: '#38bdf8', Icon: Mountain },
    { key: 'other', label: 'Other', color: '#d4d4d8', Icon: MapPin },
];

export const PIN_INK = '#171717';

export const getPinCategory = (key: string | null | undefined) => (
    PIN_CATEGORIES.find((item) => item.key === key) || PIN_CATEGORIES[PIN_CATEGORIES.length - 1]
);

/** Maps the curated attraction labels on /map onto pin categories. */
export const categoryFromLabel = (label: string): PinCategory => {
    const normalized = label.trim().toLowerCase();
    const direct = PIN_CATEGORIES.find((item) => item.key === normalized || item.label.toLowerCase() === normalized);
    if (direct) return direct.key;
    if (normalized === 'spiritual') return 'temple';
    if (normalized === 'landmark') return 'historical';
    if (normalized === 'science' || normalized === 'family') return 'museum';
    if (normalized === 'riverfront') return 'viewpoint';
    if (normalized === 'art district') return 'durga_puja';
    return 'other';
};

const glyphCache = new Map<PinCategory, string>();

const getGlyphMarkup = (category: PinCategory): string => {
    const cached = glyphCache.get(category);
    if (cached) return cached;
    const { Icon } = getPinCategory(category);
    const markup = renderToStaticMarkup(createElement(Icon, { size: 12, color: PIN_INK, strokeWidth: 2.6, 'aria-hidden': true }));
    glyphCache.set(category, markup);
    return markup;
};

// Thumbtack drawn upright in a 48-unit box, then tilted 40deg so the needle points bottom-left.
// The needle tip (24,45) lands at (10.5,40.1) after the tilt; that is the marker anchor.
const TACK_TILT = 40;
const TIP = { x: 10.5, y: 40.1 };

const iconCache = new Map<string, DivIcon>();

export const buildPinIcon = (category: PinCategory, options: { active?: boolean; draft?: boolean; route?: boolean } = {}): DivIcon => {
    const cacheKey = `${category}:${options.active ? 1 : 0}:${options.draft ? 1 : 0}:${options.route ? 1 : 0}`;
    const cached = iconCache.get(cacheKey);
    if (cached) return cached;

    const size = options.active || options.draft ? 56 : 44;
    const scale = size / 48;
    const { color } = getPinCategory(category);
    const html = `
<span class="map2-tack${options.active ? ' is-active' : ''}${options.draft ? ' is-draft' : ''}${options.route ? ' is-route' : ''}">
  <svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true">
    <g transform="rotate(${TACK_TILT} 24 24)" stroke="${PIN_INK}" stroke-width="2.4" stroke-linejoin="round">
      <line x1="24" y1="29" x2="24" y2="45" stroke-width="2.8" stroke-linecap="round" />
      <path d="M17.5 10 H30.5 L29 21 L35.4 27 Q36.4 29 34.4 29 H13.6 Q11.6 29 12.6 27 L19 21 Z" fill="${color}" />
      <rect x="14" y="3" width="20" height="7.5" rx="3.75" fill="${color}" />
      <g transform="translate(24 16.5) rotate(${-TACK_TILT}) translate(-6 -6)" stroke="none">${getGlyphMarkup(category)}</g>
    </g>
  </svg>
</span>`;

    const icon = divIcon({
        className: '',
        html,
        iconSize: point(size, size),
        iconAnchor: point(Math.round(TIP.x * scale), Math.round(TIP.y * scale)),
    });
    iconCache.set(cacheKey, icon);
    return icon;
};

export interface MapPinRecord {
    id: string;
    user_id: string;
    author_name: string;
    lat: number;
    lng: number;
    category: PinCategory;
    title: string;
    review: string;
    rating: number;
    created_at: string;
}

export type NewMapPin = Pick<MapPinRecord, 'lat' | 'lng' | 'category' | 'title' | 'review' | 'rating'>;

const isMissingTable = (error: { code?: string; message?: string }) => (
    error.code === '42P01' || error.code === 'PGRST205' || /map_pins/i.test(error.message || '')
);

const PINS_NOT_READY = 'Pins are not set up yet. Run the map_pins migration in Supabase.';

export const fetchMapPins = async (): Promise<MapPinRecord[]> => {
    const { data, error } = await supabase
        .from('map_pins')
        .select('id, user_id, author_name, lat, lng, category, title, review, rating, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
    if (error) throw new Error(isMissingTable(error) ? PINS_NOT_READY : error.message);
    return (data || []) as MapPinRecord[];
};

export const createMapPin = async (pin: NewMapPin, userId: string, authorName: string): Promise<MapPinRecord> => {
    const { data, error } = await supabase
        .from('map_pins')
        .insert({
            ...pin,
            user_id: userId,
            author_name: authorName.trim().slice(0, 80) || 'Traveller',
            title: pin.title.trim(),
            review: pin.review.trim(),
        })
        .select('id, user_id, author_name, lat, lng, category, title, review, rating, created_at')
        .single();
    if (error) throw new Error(isMissingTable(error) ? PINS_NOT_READY : error.message);
    return data as MapPinRecord;
};

export const deleteMapPin = async (id: string): Promise<void> => {
    const { error } = await supabase.from('map_pins').delete().eq('id', id);
    if (error) throw new Error(error.message);
};
