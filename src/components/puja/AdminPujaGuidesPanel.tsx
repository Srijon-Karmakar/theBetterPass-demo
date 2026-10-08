import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchAllPujaGuides, formatRupees, setPujaGuideStatus, type PujaGuide, type PujaGuideStatus } from '../../lib/pujaGuide';
import './puja-guide.css';

const FILTERS: Array<{ key: PujaGuideStatus | 'all'; label: string }> = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' },
];

/** Admin dashboard section: review providers who opted in as Durga Puja guides. */
export const AdminPujaGuidesPanel: React.FC = () => {
    const [guides, setGuides] = useState<PujaGuide[]>([]);
    const [filter, setFilter] = useState<PujaGuideStatus | 'all'>('pending');
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchAllPujaGuides()
            .then(setGuides)
            .catch((error: Error) => setStatus(error.message))
            .finally(() => setLoading(false));
    }, []);

    const review = async (guide: PujaGuide, next: PujaGuideStatus) => {
        try {
            await setPujaGuideStatus(guide.user_id, next);
            setGuides((current) => current.map((item) => (item.user_id === guide.user_id ? { ...item, status: next } : item)));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not update the guide.');
        }
    };

    if (loading) {
        return <div className="rdb-loading"><Loader2 size={28} className="animate-spin" /><p>Loading Puja guides…</p></div>;
    }

    const visible = filter === 'all' ? guides : guides.filter((item) => item.status === filter);

    return (
        <div className="pg">
            <section className="pg-card">
                <header className="pg-head">
                    <div>
                        <h3>Durga Puja guides</h3>
                        <p>Providers who want to be listed in the Puja guide on the map. Only approved, available guides are shown to tourists.</p>
                    </div>
                </header>

                <div className="pg-filters" role="group" aria-label="Filter guides">
                    {FILTERS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={filter === item.key ? 'is-active' : ''}
                            aria-pressed={filter === item.key}
                            onClick={() => setFilter(item.key)}
                        >
                            {item.label} ({item.key === 'all' ? guides.length : guides.filter((guide) => guide.status === item.key).length})
                        </button>
                    ))}
                </div>

                {status ? <p className="pg-note">{status}</p> : null}
                {!visible.length ? <p className="pg-note">Nothing here.</p> : null}

                <ul className="pg-requests">
                    {visible.map((guide) => (
                        <li key={guide.user_id}>
                            <div className="pg-request-main">
                                <strong>{guide.display_name}</strong>
                                <span>
                                    {guide.languages || 'No languages listed'} · {guide.price_per_day > 0 ? `${formatRupees(guide.price_per_day)}/day` : 'No price set'} · up to {guide.max_group_size}
                                    {guide.is_active ? '' : ' · hidden by guide'}
                                </span>
                                {guide.areas ? <span className="pg-pandals">{guide.areas}</span> : null}
                                {guide.bio ? <p>{guide.bio}</p> : null}
                            </div>
                            <div className="pg-request-side">
                                <span className={`pg-status is-${guide.status}`}>{guide.status}</span>
                                <div className="pg-request-actions">
                                    {guide.status !== 'approved' ? (
                                        <button type="button" className="pg-primary pg-small" onClick={() => void review(guide, 'approved')}>Approve</button>
                                    ) : null}
                                    {guide.status !== 'rejected' ? (
                                        <button type="button" className="pg-secondary pg-small" onClick={() => void review(guide, 'rejected')}>Reject</button>
                                    ) : null}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
};
