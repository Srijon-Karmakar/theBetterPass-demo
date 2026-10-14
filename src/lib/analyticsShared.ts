export type AnalyticsRangeKey = 'today' | '7d' | '30d' | '90d' | 'all';

export const ANALYTICS_RANGES: Array<{ key: AnalyticsRangeKey; label: string; days: number }> = [
    { key: 'today', label: 'Today', days: 1 },
    { key: '7d', label: '7 days', days: 7 },
    { key: '30d', label: '30 days', days: 30 },
    { key: '90d', label: '90 days', days: 90 },
];

/** The admin dashboard also offers "All time"; the provider and tourist dashboards keep the four shorter ranges. */
export const ADMIN_ANALYTICS_RANGES: Array<{ key: AnalyticsRangeKey; label: string; days: number }> = [
    ...ANALYTICS_RANGES,
    { key: 'all', label: 'All time', days: 0 },
];

/** "All time" asks the database for everything since this date, long before the site existed. */
const ALL_TIME_START = new Date(2020, 0, 1);

export class AnalyticsNotReadyError extends Error {
    constructor() {
        super('Analytics database functions are not installed yet.');
        this.name = 'AnalyticsNotReadyError';
    }
}

export const isAnalyticsNotReadyError = (error: { code?: string; message?: string }, fnName: string): boolean => {
    const message = `${error.code || ''} ${error.message || ''}`;
    return new RegExp(`PGRST202|42883|${fnName}`, 'i').test(message) && !/42501/.test(message);
};

export const getTimeZone = (): string => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
        return 'Asia/Kolkata';
    }
};

export const getAnalyticsRangeDates = (key: AnalyticsRangeKey): { from: Date; to: Date; days: number } => {
    if (key === 'all') {
        const to = new Date();
        const today = new Date(to);
        today.setHours(0, 0, 0, 0);
        const days = Math.round((today.getTime() - ALL_TIME_START.getTime()) / 86400000) + 1;
        return { from: new Date(ALL_TIME_START), to, days };
    }
    const days = ANALYTICS_RANGES.find((range) => range.key === key)?.days ?? 7;
    const to = new Date();
    const from = new Date(to);
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - (days - 1));
    return { from, to, days };
};

/**
 * What each range is compared with. "Today" is only part-way through the day, so it is measured against yesterday
 * up to the same time of day, not against a full day (which would always make today look like it is down).
 */
export const getPreviousRangeDates = (key: AnalyticsRangeKey): { from: Date; to: Date } | null => {
    if (key !== 'today') return null;
    const { from, to } = getAnalyticsRangeDates(key);
    const previousFrom = new Date(from);
    previousFrom.setDate(previousFrom.getDate() - 1);
    const previousTo = new Date(to);
    previousTo.setDate(previousTo.getDate() - 1);
    return { from: previousFrom, to: previousTo };
};

export const isTodayRange = (key: AnalyticsRangeKey): boolean => key === 'today';

const dayKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

/** Ensures every calendar day in the range exists, so charts never skip empty days. */
export const fillMissingDaysGeneric = <T extends { day: string }>(
    daily: T[],
    from: Date,
    days: number,
    empty: (day: string) => T,
): T[] => {
    const byDay = new Map(daily.map((row) => [row.day, row]));
    return Array.from({ length: days }, (_, index) => {
        const date = new Date(from);
        date.setDate(from.getDate() + index);
        const key = dayKey(date);
        return byDay.get(key) || empty(key);
    });
};

export const percentChange = (current: number, previous: number): number | null => {
    if (previous <= 0) return current > 0 ? null : 0;
    return ((current - previous) / previous) * 100;
};

const compactFormatter = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
const fullFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatCompact = (value: number): string => (value < 10000 ? fullFormatter.format(value) : compactFormatter.format(value));
export const formatHourLabel = (hour: number): string => `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`;
export const formatFull = (value: number): string => fullFormatter.format(value);
export const formatRupees = (value: number): string => `Rs ${currencyFormatter.format(value)}`;
export const formatCompactRupees = (value: number): string => `Rs ${formatCompact(value)}`;
