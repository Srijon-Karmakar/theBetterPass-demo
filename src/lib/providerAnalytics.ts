import { supabase } from './supabase';
import {
    AnalyticsNotReadyError,
    fillMissingDaysGeneric,
    getAnalyticsRangeDates,
    getTimeZone,
    isAnalyticsNotReadyError,
    type AnalyticsRangeKey,
} from './analyticsShared';

export interface ProviderAnalyticsTotals {
    views: number;
    unique_viewers: number;
    favorites: number;
    booking_starts: number;
    bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    revenue: number;
    payout_amount: number;
}

export interface ProviderAnalyticsDay {
    day: string;
    views: number;
    favorites: number;
    booking_starts: number;
    bookings: number;
    revenue: number;
}

export interface ProviderListingStat {
    id: string;
    title: string;
    type: string;
    status: string;
    views: number;
    favorites: number;
    booking_starts: number;
    bookings: number;
    revenue: number;
}

export interface ProviderAnalyticsSummary {
    range: { from: string; to: string; tz: string };
    listing_count: number;
    totals: ProviderAnalyticsTotals;
    daily: ProviderAnalyticsDay[];
    listings: ProviderListingStat[];
}

const emptyTotals = (): ProviderAnalyticsTotals => ({
    views: 0,
    unique_viewers: 0,
    favorites: 0,
    booking_starts: 0,
    bookings: 0,
    confirmed_bookings: 0,
    cancelled_bookings: 0,
    revenue: 0,
    payout_amount: 0,
});

const emptyDay = (day: string): ProviderAnalyticsDay => ({ day, views: 0, favorites: 0, booking_starts: 0, bookings: 0, revenue: 0 });

export const fetchProviderAnalyticsSummary = async (key: AnalyticsRangeKey): Promise<ProviderAnalyticsSummary> => {
    const { from, to, days } = getAnalyticsRangeDates(key);
    const { data, error } = await supabase.rpc('provider_analytics_summary', {
        p_from: from.toISOString(),
        p_to: to.toISOString(),
        p_tz: getTimeZone(),
    });

    if (error) {
        if (isAnalyticsNotReadyError(error, 'provider_analytics_summary')) throw new AnalyticsNotReadyError();
        throw new Error(error.message || 'Could not load your listing analytics.');
    }

    const raw = (data || {}) as Partial<{
        range: ProviderAnalyticsSummary['range'];
        listing_count: number;
        totals: Partial<ProviderAnalyticsTotals>;
        daily_engagement: Array<{ day: string; views: number; favorites: number; booking_starts: number }>;
        daily_bookings: Array<{ day: string; bookings: number; revenue: number }>;
        listings: ProviderListingStat[];
    }>;

    const engagementByDay = new Map((raw.daily_engagement || []).map((row) => [row.day, row]));
    const bookingsByDay = new Map((raw.daily_bookings || []).map((row) => [row.day, row]));
    const mergedDays = new Set([...engagementByDay.keys(), ...bookingsByDay.keys()]);
    const merged: ProviderAnalyticsDay[] = Array.from(mergedDays).map((day) => ({
        day,
        views: engagementByDay.get(day)?.views || 0,
        favorites: engagementByDay.get(day)?.favorites || 0,
        booking_starts: engagementByDay.get(day)?.booking_starts || 0,
        bookings: bookingsByDay.get(day)?.bookings || 0,
        revenue: bookingsByDay.get(day)?.revenue || 0,
    }));

    return {
        range: raw.range || { from: from.toISOString(), to: to.toISOString(), tz: getTimeZone() },
        listing_count: raw.listing_count || 0,
        totals: { ...emptyTotals(), ...(raw.totals || {}) },
        daily: fillMissingDaysGeneric(merged, from, days, emptyDay),
        listings: raw.listings || [],
    };
};
