import { supabase } from './supabase';
import {
    AnalyticsNotReadyError,
    fillMissingDaysGeneric,
    getAnalyticsRangeDates,
    getPreviousRangeDates,
    getTimeZone,
    isAnalyticsNotReadyError,
    type AnalyticsRangeKey,
} from './analyticsShared';

export {
    ANALYTICS_RANGES,
    AnalyticsNotReadyError,
    formatCompact,
    formatFull,
    getAnalyticsRangeDates,
    percentChange,
    type AnalyticsRangeKey,
} from './analyticsShared';

export interface AnalyticsTotals {
    visitors: number;
    sessions: number;
    page_views: number;
    clicks: number;
    logins: number;
    signups: number;
    link_visits: number;
    listing_views: number;
    booking_starts: number;
    signed_in_visitors?: number;
    returning_visitors?: number;
}

export interface AnalyticsDay {
    day: string;
    visitors: number;
    page_views: number;
    clicks: number;
    logins: number;
    signups: number;
    link_visits: number;
    listing_views: number;
    booking_starts: number;
}

/** Page views in one hour of the day. Only filled for the "Today" range. */
export interface AnalyticsHour {
    hour: number;
    page_views: number;
}

export interface NewsletterAnalytics {
    daily: Array<{ day: string; subscribers: number }>;
    totals: { active_subscribers: number; new_subscribers: number; prev_new_subscribers: number };
}

export interface CrmFunnelAnalytics {
    leads: number;
    contacted: number;
    qualified: number;
    converted: number;
}

export interface AnalyticsSummary {
    range: { from: string; to: string; tz: string };
    totals: AnalyticsTotals;
    previous: AnalyticsTotals;
    daily: AnalyticsDay[];
    top_pages: Array<{ path: string; views: number; visitors: number }>;
    /** Last page viewed in each finished session; page_views is that page's total views, for exit rate. */
    exit_pages: Array<{ path: string; exits: number; page_views: number }>;
    exit_sessions: number;
    top_sources: Array<{ source: string; visitors: number }>;
    top_clicks: Array<{ target: string; clicks: number }>;
    top_links: Array<{ link: string; visits: number; visitors: number }>;
    devices: Array<{ device: string; visitors: number }>;
    heatmap: Array<{ dow: number; hour: number; events: number }>;
    hourly?: AnalyticsHour[];
    funnel: { visited: number; viewed_listing: number; authenticated: number; started_booking: number };
    active_now: number;
    newsletter?: NewsletterAnalytics;
    crm_funnel?: CrmFunnelAnalytics;
    is_marketing?: boolean;
}

const emptyTotals = (): AnalyticsTotals => ({
    visitors: 0,
    sessions: 0,
    page_views: 0,
    clicks: 0,
    logins: 0,
    signups: 0,
    link_visits: 0,
    listing_views: 0,
    booking_starts: 0,
});

const emptyDay = (day: string): AnalyticsDay => ({
    day,
    visitors: 0,
    page_views: 0,
    clicks: 0,
    logins: 0,
    signups: 0,
    link_visits: 0,
    listing_views: 0,
    booking_starts: 0,
});

export const fillMissingDays = (daily: AnalyticsDay[], from: Date, days: number): AnalyticsDay[] => (
    fillMissingDaysGeneric(daily, from, days, emptyDay)
);

const fillNewsletterDays = (
    daily: NewsletterAnalytics['daily'],
    from: Date,
    days: number,
): NewsletterAnalytics['daily'] => (
    fillMissingDaysGeneric(daily, from, days, (day) => ({ day, subscribers: 0 }))
);

const buildHourly = (heatmap: AnalyticsSummary['heatmap']): AnalyticsHour[] => {
    // The "Today" window only holds today's events, so the day-of-week in each heatmap cell is always today.
    const byHour = new Map<number, number>();
    for (const cell of heatmap) byHour.set(cell.hour, (byHour.get(cell.hour) || 0) + cell.events);
    return Array.from({ length: 24 }, (_, hour) => ({ hour, page_views: byHour.get(hour) || 0 }));
};

const callAdminSummary = async (from: Date, to: Date): Promise<Partial<AnalyticsSummary>> => {
    const { data, error } = await supabase.rpc('admin_analytics_summary', {
        p_from: from.toISOString(),
        p_to: to.toISOString(),
        p_tz: getTimeZone(),
    });

    if (error) {
        if (isAnalyticsNotReadyError(error, 'admin_analytics_summary')) throw new AnalyticsNotReadyError();
        throw new Error(error.message || 'Could not load analytics.');
    }

    return (data || {}) as Partial<AnalyticsSummary>;
};

export const fetchAdminAnalyticsSummary = async (key: AnalyticsRangeKey): Promise<AnalyticsSummary> => {
    const { from, to, days } = getAnalyticsRangeDates(key);
    const comparison = getPreviousRangeDates(key);
    // The database compares with the equally long window right before this one. For "Today" that would be the last
    // few hours of yesterday, so ask for yesterday up to the same time of day and use its totals instead.
    const [raw, comparisonRaw] = await Promise.all([
        callAdminSummary(from, to),
        comparison ? callAdminSummary(comparison.from, comparison.to) : Promise.resolve(null),
    ]);

    return {
        range: raw.range || { from: from.toISOString(), to: to.toISOString(), tz: getTimeZone() },
        totals: { ...emptyTotals(), ...(raw.totals || {}) },
        previous: { ...emptyTotals(), ...((comparisonRaw ? comparisonRaw.totals : raw.previous) || {}) },
        daily: fillMissingDays(raw.daily || [], from, days),
        top_pages: raw.top_pages || [],
        exit_pages: raw.exit_pages || [],
        exit_sessions: raw.exit_sessions || 0,
        top_sources: raw.top_sources || [],
        top_clicks: raw.top_clicks || [],
        top_links: raw.top_links || [],
        devices: raw.devices || [],
        heatmap: raw.heatmap || [],
        hourly: key === 'today' ? buildHourly(raw.heatmap || []) : undefined,
        funnel: raw.funnel || { visited: 0, viewed_listing: 0, authenticated: 0, started_booking: 0 },
        active_now: raw.active_now || 0,
        newsletter: raw.newsletter
            ? { ...raw.newsletter, daily: fillNewsletterDays(raw.newsletter.daily || [], from, days) }
            : undefined,
        crm_funnel: raw.crm_funnel,
        is_marketing: raw.is_marketing,
    };
};

export const buildAnalyticsCsv = (daily: AnalyticsDay[]): string => {
    const header = ['date', 'visitors', 'page_views', 'link_visits', 'listing_views', 'clicks', 'logins', 'signups', 'booking_starts'];
    const rows = daily.map((row) => [
        row.day, row.visitors, row.page_views, row.link_visits, row.listing_views, row.clicks, row.logins, row.signups, row.booking_starts,
    ].join(','));
    return [header.join(','), ...rows].join('\n');
};

export const buildHourlyCsv = (hourly: AnalyticsHour[], date: Date = new Date()): string => {
    const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const rows = hourly.map((row) => `${day},${String(row.hour).padStart(2, '0')}:00,${row.page_views}`);
    return ['date,hour,page_views', ...rows].join('\n');
};
