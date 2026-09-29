import React, { useEffect, useState } from 'react';
import { Database, Download, Eye, Heart, RefreshCw, Ticket, Wallet } from 'lucide-react';
import {
    ANALYTICS_RANGES,
    AnalyticsNotReadyError,
    formatCompact,
    formatCompactRupees,
    formatFull,
    formatRupees,
    type AnalyticsRangeKey,
} from '../../lib/analyticsShared';
import { fetchProviderAnalyticsSummary, type ProviderAnalyticsDay, type ProviderAnalyticsSummary } from '../../lib/providerAnalytics';
import { BarList, Funnel, TrendChart } from '../admin/analytics/charts';
import '../admin/admin-analytics.css';
import './provider-analytics.css';

type MetricKey = Exclude<keyof ProviderAnalyticsDay, 'day'>;

const METRICS: Array<{ key: MetricKey; label: string; desc: string; color: string; money?: boolean }> = [
    { key: 'views', label: 'Listing views', desc: 'How many times your listings were opened', color: '#0ea5e9' },
    { key: 'favorites', label: 'Favorites', desc: 'Travelers who saved your listings', color: '#ec4899' },
    { key: 'booking_starts', label: 'Booking attempts', desc: 'Travelers who pressed Book', color: '#f97316' },
    { key: 'bookings', label: 'Bookings', desc: 'Bookings placed in this period', color: '#8b5cf6' },
    { key: 'revenue', label: 'Revenue', desc: 'Paid booking value in this period', color: '#10b981', money: true },
];

interface ProviderAnalyticsProps {
    fetchSummary?: (range: AnalyticsRangeKey) => Promise<ProviderAnalyticsSummary>;
}

export const ProviderAnalytics: React.FC<ProviderAnalyticsProps> = ({ fetchSummary = fetchProviderAnalyticsSummary }) => {
    const [range, setRange] = useState<AnalyticsRangeKey>('30d');
    const [metric, setMetric] = useState<MetricKey>('views');
    const [reloadKey, setReloadKey] = useState(0);
    const [data, setData] = useState<ProviderAnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notReady, setNotReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchSummary(range);
                if (!cancelled) { setData(result); setNotReady(false); }
            } catch (err) {
                if (cancelled) return;
                setNotReady(err instanceof AnalyticsNotReadyError);
                setError(err instanceof Error ? err.message : 'Could not load analytics.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => { cancelled = true; };
    }, [range, reloadKey, fetchSummary]);

    const rangeDays = ANALYTICS_RANGES.find((item) => item.key === range)?.days ?? 30;
    const activeMetric = METRICS.find((item) => item.key === metric) || METRICS[0];

    const exportCsv = () => {
        if (!data) return;
        const header = ['date', 'views', 'favorites', 'booking_starts', 'bookings', 'revenue'];
        const rows = data.daily.map((row) => [row.day, row.views, row.favorites, row.booking_starts, row.bookings, row.revenue].join(','));
        const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `listing-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const conversionRate = data && data.totals.views > 0 ? Math.round((data.totals.bookings / data.totals.views) * 100) : 0;

    return (
        <div className="an" aria-busy={loading}>
            <header className="an-header">
                <div className="an-title">
                    <h2>Listing analytics</h2>
                    <p>Views, favorites, bookings and revenue across all your listings.</p>
                </div>
                <div className="an-controls">
                    <div className="an-segmented" role="group" aria-label="Date range">
                        {ANALYTICS_RANGES.map((item) => (
                            <button key={item.key} type="button" className={item.key === range ? 'is-active' : ''} aria-pressed={item.key === range} onClick={() => setRange(item.key)}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <button type="button" className="an-icon-btn" onClick={() => setReloadKey((k) => k + 1)} aria-label="Refresh" title="Refresh">
                        <RefreshCw size={16} className={loading ? 'an-spin' : ''} />
                    </button>
                    <button type="button" className="an-icon-btn" onClick={exportCsv} disabled={!data} aria-label="Export CSV" title="Export CSV">
                        <Download size={16} />
                    </button>
                </div>
            </header>

            {notReady && (
                <section className="an-card an-state" role="alert">
                    <Database size={28} />
                    <h3>Analytics isn't set up yet</h3>
                    <p>Ask an admin to run the analytics migrations. Once applied, your listing stats will start collecting automatically.</p>
                </section>
            )}

            {error && !notReady && (
                <section className="an-card an-state an-state--error" role="alert">
                    <h3>Couldn't load your analytics</h3>
                    <p>{error}</p>
                    <button type="button" className="an-primary-btn" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
                </section>
            )}

            {!notReady && data && (
                <div className={`an-content${loading ? ' is-refreshing' : ''}`}>
                    {data.listing_count === 0 ? (
                        <section className="an-card an-state an-state--soft">
                            <h3>No listings yet</h3>
                            <p>Publish a tour, activity or guide listing from Studio to start seeing engagement and revenue here.</p>
                        </section>
                    ) : (
                        <>
                            <section className="an-kpis" aria-label="Key metrics">
                                {METRICS.map((item, index) => {
                                    const selected = item.key === metric;
                                    const current = data.totals[item.key === 'revenue' ? 'revenue' : item.key as keyof typeof data.totals] as number;
                                    return (
                                        <button
                                            type="button"
                                            key={item.key}
                                            className={`an-kpi${selected ? ' is-selected' : ''}`}
                                            style={{ ['--kpi' as string]: item.color, ['--i' as string]: index }}
                                            aria-pressed={selected}
                                            onClick={() => setMetric(item.key)}
                                        >
                                            <span className="an-kpi-label">{item.label}</span>
                                            <span className="an-kpi-main">
                                                <strong title={item.money ? formatRupees(current) : formatFull(current)}>
                                                    {item.money ? formatCompactRupees(current) : formatCompact(current)}
                                                </strong>
                                            </span>
                                            <span className="an-kpi-desc">{item.desc}</span>
                                        </button>
                                    );
                                })}
                            </section>

                            <section className="an-card an-trend">
                                <div className="an-card-head">
                                    <div>
                                        <h3>{activeMetric.label} over time</h3>
                                        <p>{rangeDays} day trend across all listings</p>
                                    </div>
                                    <div className="an-chips" role="group" aria-label="Chart metric">
                                        {METRICS.map((item) => (
                                            <button key={item.key} type="button" className={item.key === metric ? 'is-active' : ''} style={{ ['--kpi' as string]: item.color }} aria-pressed={item.key === metric} onClick={() => setMetric(item.key)}>
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <TrendChart
                                    days={data.daily}
                                    metric={metric}
                                    color={activeMetric.color}
                                    label={activeMetric.label}
                                    formatValue={activeMetric.money ? formatCompactRupees : formatCompact}
                                    tooltipMetrics={[
                                        { key: 'views', label: 'Views', color: '#0ea5e9' },
                                        { key: 'favorites', label: 'Favorites', color: '#ec4899' },
                                        { key: 'bookings', label: 'Bookings', color: '#8b5cf6' },
                                    ]}
                                />
                            </section>

                            <div className="an-grid an-grid--2">
                                <section className="an-card">
                                    <div className="an-card-head"><div><h3>Conversion</h3><p>Views to bookings, and booking outcomes</p></div></div>
                                    <Funnel
                                        steps={[
                                            { label: 'Listing views', value: data.totals.views, color: '#0ea5e9' },
                                            { label: 'Booking attempts', value: data.totals.booking_starts, color: '#f97316' },
                                            { label: 'Bookings placed', value: data.totals.bookings, color: '#8b5cf6' },
                                            { label: 'Confirmed', value: data.totals.confirmed_bookings, color: '#10b981' },
                                        ]}
                                    />
                                    <div className="an-split">
                                        <div><span>Conversion rate</span><b>{conversionRate}%</b></div>
                                        <div><span>Cancelled</span><b>{formatFull(data.totals.cancelled_bookings)}</b></div>
                                        <div><span>Unique viewers</span><b>{formatFull(data.totals.unique_viewers)}</b></div>
                                        <div><span>Your payout</span><b title={formatRupees(data.totals.payout_amount)}>{formatCompactRupees(data.totals.payout_amount)}</b></div>
                                    </div>
                                </section>

                                <section className="an-card">
                                    <div className="an-card-head"><div><h3>Top listings</h3><p>Ranked by views, then revenue</p></div></div>
                                    <BarList
                                        color="#0ea5e9"
                                        empty="No listing activity yet in this period."
                                        items={data.listings.slice(0, 8).map((listing) => ({
                                            label: listing.title || 'Untitled listing',
                                            value: listing.views,
                                            hint: `${formatFull(listing.bookings)} bookings, ${formatRupees(listing.revenue)}`,
                                        }))}
                                    />
                                </section>
                            </div>

                            <section className="an-card">
                                <div className="an-card-head"><div><h3>Per-listing breakdown</h3><p>Every listing with activity in this period</p></div></div>
                                {data.listings.length === 0 ? (
                                    <p className="an-empty">No listings with activity yet.</p>
                                ) : (
                                    <div className="pa-table-wrap">
                                        <table className="pa-table">
                                            <thead>
                                                <tr>
                                                    <th>Listing</th>
                                                    <th><Eye size={13} /> Views</th>
                                                    <th><Heart size={13} /> Favorites</th>
                                                    <th><Ticket size={13} /> Bookings</th>
                                                    <th><Wallet size={13} /> Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.listings.map((listing) => (
                                                    <tr key={listing.id}>
                                                        <td>
                                                            <span className="pa-listing-title">{listing.title || 'Untitled listing'}</span>
                                                            <span className={`pa-status-pill pa-status-pill--${listing.status || 'pending'}`}>{listing.status || 'pending'}</span>
                                                        </td>
                                                        <td>{formatFull(listing.views)}</td>
                                                        <td>{formatFull(listing.favorites)}</td>
                                                        <td>{formatFull(listing.bookings)}</td>
                                                        <td>{formatRupees(listing.revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    <p className="an-footnote">Only your own listings are counted here. Percent-change badges aren't shown for provider analytics yet.</p>
                </div>
            )}
        </div>
    );
};
