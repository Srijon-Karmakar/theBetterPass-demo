import { supabase } from './supabase';
import {
    AnalyticsNotReadyError,
    fillMissingDaysGeneric,
    getAnalyticsRangeDates,
    getTimeZone,
    isAnalyticsNotReadyError,
    type AnalyticsRangeKey,
} from './analyticsShared';

export interface TouristAnalyticsTotals {
    listings_viewed: number;
    favorites_added: number;
    logins: number;
    sessions: number;
    bookings: number;
    confirmed_bookings: number;
    spend: number;
}

export interface TouristAnalyticsDay {
    day: string;
    listings_viewed: number;
    logins: number;
    bookings: number;
    spend: number;
}

export interface TouristListingRef {
    listing_id: string;
    views: number;
    title: string | null;
    type: string | null;
}

export interface TouristTrendingListing {
    listing_id: string;
    listing_type: string;
    views: number;
    title: string | null;
    type: string | null;
    image_url: string | null;
}

export interface TouristAnalyticsSummary {
    range: { from: string; to: string; tz: string };
    totals: TouristAnalyticsTotals;
    daily: TouristAnalyticsDay[];
    recentListings: TouristListingRef[];
    trending: TouristTrendingListing[];
}

const emptyTotals = (): TouristAnalyticsTotals => ({
    listings_viewed: 0,
    favorites_added: 0,
    logins: 0,
    sessions: 0,
    bookings: 0,
    confirmed_bookings: 0,
    spend: 0,
});

const emptyDay = (day: string): TouristAnalyticsDay => ({ day, listings_viewed: 0, logins: 0, bookings: 0, spend: 0 });

export const fetchTouristAnalyticsSummary = async (key: AnalyticsRangeKey): Promise<TouristAnalyticsSummary> => {
    const { from, to, days } = getAnalyticsRangeDates(key);
    const { data, error } = await supabase.rpc('tourist_analytics_summary', {
        p_from: from.toISOString(),
        p_to: to.toISOString(),
        p_tz: getTimeZone(),
    });

    if (error) {
        if (isAnalyticsNotReadyError(error, 'tourist_analytics_summary')) throw new AnalyticsNotReadyError();
        throw new Error(error.message || 'Could not load your activity.');
    }

    const raw = (data || {}) as Partial<{
        range: TouristAnalyticsSummary['range'];
        totals: Partial<TouristAnalyticsTotals>;
        daily_activity: Array<{ day: string; listings_viewed: number; logins: number }>;
        daily_bookings: Array<{ day: string; bookings: number; spend: number }>;
        recent_listings: TouristListingRef[];
        trending: TouristTrendingListing[];
    }>;

    const activityByDay = new Map((raw.daily_activity || []).map((row) => [row.day, row]));
    const bookingsByDay = new Map((raw.daily_bookings || []).map((row) => [row.day, row]));
    const mergedDays = new Set([...activityByDay.keys(), ...bookingsByDay.keys()]);
    const merged: TouristAnalyticsDay[] = Array.from(mergedDays).map((day) => ({
        day,
        listings_viewed: activityByDay.get(day)?.listings_viewed || 0,
        logins: activityByDay.get(day)?.logins || 0,
        bookings: bookingsByDay.get(day)?.bookings || 0,
        spend: bookingsByDay.get(day)?.spend || 0,
    }));

    return {
        range: raw.range || { from: from.toISOString(), to: to.toISOString(), tz: getTimeZone() },
        totals: { ...emptyTotals(), ...(raw.totals || {}) },
        daily: fillMissingDaysGeneric(merged, from, days, emptyDay),
        recentListings: raw.recent_listings || [],
        trending: raw.trending || [],
    };
};
