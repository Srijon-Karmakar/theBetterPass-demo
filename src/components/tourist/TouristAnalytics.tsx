import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, Flame, RefreshCw } from 'lucide-react';
import {
    ANALYTICS_RANGES,
    AnalyticsNotReadyError,
    formatCompact,
    formatCompactRupees,
    formatFull,
    formatRupees,
    type AnalyticsRangeKey,
} from '../../lib/analyticsShared';
import { fetchTouristAnalyticsSummary, type TouristAnalyticsDay, type TouristAnalyticsSummary } from '../../lib/touristAnalytics';
import { TrendChart } from '../admin/analytics/charts';
import '../admin/admin-analytics.css';
import './tourist-analytics.css';

type MetricKey = Exclude<keyof TouristAnalyticsDay, 'day'>;

const METRICS: Array<{ key: MetricKey; label: string; desc: string; color: string; money?: boolean }> = [
    { key: 'listings_viewed', label: 'Listings viewed', desc: 'Tours, activities and guides you opened', color: '#0ea5e9' },
    { key: 'logins', label: 'Logins', desc: 'Times you signed in', color: '#10b981' },
    { key: 'bookings', label: 'Bookings', desc: 'Bookings you placed', color: '#8b5cf6' },
    { key: 'spend', label: 'Spend', desc: 'Paid booking value', color: '#f97316', money: true },
];

const toListingHref = (type: string | null, id: string): string => `/listings/${type || 'activity'}/${id}`;

interface TouristAnalyticsProps {
    fetchSummary?: (range: AnalyticsRangeKey) => Promise<TouristAnalyticsSummary>;
}

export const TouristAnalytics: React.FC<TouristAnalyticsProps> = ({ fetchSummary = fetchTouristAnalyticsSummary }) => {
    const [range, setRange] = useState<AnalyticsRangeKey>('30d');
    const [metric, setMetric] = useState<MetricKey>('listings_viewed');
    const [reloadKey, setReloadKey] = useState(0);
    const [data, setData] = useState<TouristAnalyticsSummary | null>(null);
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
                setError(err instanceof Error ? err.message : 'Could not load your activity.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => { cancelled = true; };
    }, [range, reloadKey, fetchSummary]);

    const rangeDays = ANALYTICS_RANGES.find((item) => item.key === range)?.days ?? 30;
    const activeMetric = METRICS.find((item) => item.key === metric) || METRICS[0];

    return (
        <div className="an" aria-busy={loading}>
            <header className="an-header">
                <div className="an-title">
                    <h2>My activity</h2>
                    <p>Your own browsing and booking activity. Only you can see this.</p>
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
                </div>
            </header>

            {notReady && (
                <section className="an-card an-state" role="alert">
                    <Database size={28} />
                    <h3>Activity tracking isn't set up yet</h3>
                    <p>This will start working once the platform's analytics migrations are applied.</p>
                </section>
            )}

            {error && !notReady && (
                <section className="an-card an-state an-state--error" role="alert">
                    <h3>Couldn't load your activity</h3>
                    <p>{error}</p>
                    <button type="button" className="an-primary-btn" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
                </section>
            )}

            {!notReady && data && (
                <div className={`an-content${loading ? ' is-refreshing' : ''}`}>
                    <section className="an-kpis" aria-label="Key metrics">
                        {METRICS.map((item, index) => {
                            const selected = item.key === metric;
                            const current = data.totals[item.key === 'spend' ? 'spend' : item.key as keyof typeof data.totals] as number;
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
                                <p>{rangeDays} day trend</p>
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
                                { key: 'listings_viewed', label: 'Viewed', color: '#0ea5e9' },
                                { key: 'logins', label: 'Logins', color: '#10b981' },
                                { key: 'bookings', label: 'Bookings', color: '#8b5cf6' },
                            ]}
                        />
                    </section>

                    <section className="an-card">
                        <div className="an-card-head">
                            <div>
                                <h3><Flame size={16} className="ta-flame" /> Trending on The Better Pass</h3>
                                <p>Most-viewed listings across the platform in this period</p>
                            </div>
                        </div>
                        {data.trending.length === 0 ? (
                            <p className="an-empty">Nothing trending yet, check back soon.</p>
                        ) : (
                            <div className="ta-trending-grid">
                                {data.trending.map((item) => (
                                    <Link key={`${item.listing_type}-${item.listing_id}`} to={toListingHref(item.type, item.listing_id)} className="ta-trend-card">
                                        <div className="ta-trend-media" style={item.image_url ? { backgroundImage: `url(${item.image_url})` } : undefined} />
                                        <div className="ta-trend-body">
                                            <strong>{item.title || 'Listing'}</strong>
                                            <span>{formatFull(item.views)} views</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {data.recentListings.length > 0 && (
                        <section className="an-card">
                            <div className="an-card-head"><div><h3>Recently viewed</h3><p>Listings you opened in this period</p></div></div>
                            <ul className="ta-recent-list">
                                {data.recentListings.map((item) => (
                                    <li key={item.listing_id}>
                                        <Link to={toListingHref(item.type, item.listing_id)}>{item.title || 'Listing'}</Link>
                                        <span>{formatFull(item.views)} view{item.views === 1 ? '' : 's'}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <p className="an-footnote">This activity is private to your account.</p>
                </div>
            )}
        </div>
    );
};
