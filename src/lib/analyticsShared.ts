export type AnalyticsRangeKey = '7d' | '30d' | '90d';

export const ANALYTICS_RANGES: Array<{ key: AnalyticsRangeKey; label: string; days: number }> = [
    { key: '7d', label: '7 days', days: 7 },
    { key: '30d', label: '30 days', days: 30 },
    { key: '90d', label: '90 days', days: 90 },
];

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
    const days = ANALYTICS_RANGES.find((range) => range.key === key)?.days ?? 7;
    const to = new Date();
    const from = new Date(to);
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - (days - 1));
    return { from, to, days };
};

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
export const formatFull = (value: number): string => fullFormatter.format(value);
export const formatRupees = (value: number): string => `Rs ${currencyFormatter.format(value)}`;
export const formatCompactRupees = (value: number): string => `Rs ${formatCompact(value)}`;
