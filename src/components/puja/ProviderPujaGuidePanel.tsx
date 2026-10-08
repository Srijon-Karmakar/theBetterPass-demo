import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Loader2, MessageSquare, X } from 'lucide-react';
import {
    fetchMyPujaGuide,
    fetchPujaRequests,
    getPandal,
    PUJA_REQUEST_LABELS,
    saveMyPujaGuide,
    updatePujaRequestStatus,
    type PujaGuide,
    type PujaGuideInput,
    type PujaGuideRequest,
    type PujaRequestStatus,
} from '../../lib/pujaGuide';
import './puja-guide.css';

const STATUS_COPY: Record<PujaGuide['status'], string> = {
    pending: 'Under review. Tourists will see you on the map once an admin approves your profile.',
    approved: 'Approved. Tourists can find you in the Puja guide on the map.',
    rejected: 'Not approved. Update your profile and save to send it for review again.',
};

const emptyInput = (name: string): PujaGuideInput => ({
    display_name: name,
    bio: '',
    languages: '',
    areas: '',
    price_per_day: 0,
    max_group_size: 6,
    is_active: true,
});

const formatVisitDate = (value: string) => (
    new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
);

/** Provider dashboard section: opt in as a Durga Puja guide and answer tourist booking requests. */
export const ProviderPujaGuidePanel: React.FC<{ userId: string; defaultName: string }> = ({ userId, defaultName }) => {
    const [guide, setGuide] = useState<PujaGuide | null>(null);
    const [form, setForm] = useState<PujaGuideInput>(() => emptyInput(defaultName));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');
    const [requests, setRequests] = useState<PujaGuideRequest[]>([]);

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetchMyPujaGuide(userId), fetchPujaRequests(userId, 'guide').catch(() => [])])
            .then(([mine, rows]) => {
                if (cancelled) return;
                setGuide(mine);
                if (mine) {
                    const { display_name, bio, languages, areas, price_per_day, max_group_size, is_active } = mine;
                    setForm({ display_name, bio, languages, areas, price_per_day: Number(price_per_day) || 0, max_group_size, is_active });
                }
                setRequests(rows);
            })
            .catch((error: Error) => { if (!cancelled) setStatus(error.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [userId]);

    const update = <K extends keyof PujaGuideInput>(key: K, value: PujaGuideInput[K]) => setForm((current) => ({ ...current, [key]: value }));

    const handleSave = async () => {
        if (form.display_name.trim().length < 2) {
            setStatus('Add the name tourists should see.');
            return;
        }
        setSaving(true);
        setStatus('Saving...');
        try {
            const saved = await saveMyPujaGuide(userId, form);
            setGuide(saved);
            setStatus(guide ? 'Profile updated.' : 'Profile sent for review.');
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not save your profile.');
        } finally {
            setSaving(false);
        }
    };

    const respond = async (request: PujaGuideRequest, next: PujaRequestStatus) => {
        try {
            await updatePujaRequestStatus(request, next, userId);
            setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, status: next } : item)));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not update the request.');
        }
    };

    if (loading) {
        return <div className="rdb-loading"><Loader2 size={28} className="animate-spin" /><p>Loading Puja guide…</p></div>;
    }

    const openRequests = requests.filter((item) => item.status === 'pending' || item.status === 'accepted');
    const pastRequests = requests.filter((item) => item.status === 'declined' || item.status === 'cancelled');

    return (
        <div className="pg">
            <section className="pg-card">
                <header className="pg-head">
                    <div>
                        <h3>Durga Puja guide profile</h3>
                        <p>Offer pandal-hopping walks. Approved guides are listed in the Puja guide on the map, where tourists can chat with you and send booking requests.</p>
                    </div>
                    {guide ? <span className={`pg-status is-${guide.status}`}>{guide.status}</span> : null}
                </header>

                {guide ? <p className="pg-note">{STATUS_COPY[guide.status]}</p> : null}

                <form className="pg-form" onSubmit={(event) => { event.preventDefault(); void handleSave(); }}>
                    <label>
                        <span>Name shown to tourists</span>
                        <input value={form.display_name} maxLength={80} onChange={(event) => update('display_name', event.target.value)} required />
                    </label>
                    <label>
                        <span>Languages</span>
                        <input value={form.languages} maxLength={120} placeholder="Bengali, English, Hindi" onChange={(event) => update('languages', event.target.value)} />
                    </label>
                    <label className="pg-wide">
                        <span>Areas you cover</span>
                        <input value={form.areas} maxLength={160} placeholder="North Kolkata, Kumartuli, Bagbazar" onChange={(event) => update('areas', event.target.value)} />
                    </label>
                    <label className="pg-wide">
                        <span>About your Puja walks</span>
                        <textarea rows={4} value={form.bio} maxLength={800} onChange={(event) => update('bio', event.target.value)} />
                    </label>
                    <label>
                        <span>Price per day (Rs)</span>
                        <input
                            type="number"
                            min={0}
                            max={100000}
                            value={form.price_per_day}
                            onChange={(event) => update('price_per_day', Math.max(0, Number(event.target.value) || 0))}
                        />
                    </label>
                    <label>
                        <span>Max group size</span>
                        <input
                            type="number"
                            min={1}
                            max={50}
                            value={form.max_group_size}
                            onChange={(event) => update('max_group_size', Math.max(1, Math.min(50, Number(event.target.value) || 1)))}
                        />
                    </label>
                    <label className="pg-check pg-wide">
                        <input type="checkbox" checked={form.is_active} onChange={(event) => update('is_active', event.target.checked)} />
                        <span>Available for bookings (untick to hide yourself from the map)</span>
                    </label>
                    <div className="pg-wide pg-actions">
                        <button type="submit" className="pg-primary" disabled={saving}>{guide ? 'Save changes' : 'Become a Puja guide'}</button>
                        {status ? <small>{status}</small> : null}
                    </div>
                </form>
            </section>

            <section className="pg-card">
                <header className="pg-head">
                    <div>
                        <h3>Booking requests</h3>
                        <p>Accept to confirm the day. Agree pickup time and payment with the tourist in chat.</p>
                    </div>
                </header>

                {!requests.length ? <p className="pg-note">No requests yet.</p> : null}

                <ul className="pg-requests">
                    {[...openRequests, ...pastRequests].map((request) => (
                        <li key={request.id}>
                            <div className="pg-request-main">
                                <strong>{request.tourist_name}</strong>
                                <span>{formatVisitDate(request.visit_date)} · {request.group_size} people</span>
                                {request.pandal_ids.length ? (
                                    <span className="pg-pandals">
                                        {request.pandal_ids.map((id) => getPandal(id)?.name).filter(Boolean).join(' → ')}
                                    </span>
                                ) : null}
                                {request.note ? <p>{request.note}</p> : null}
                            </div>
                            <div className="pg-request-side">
                                <span className={`pg-status is-${request.status}`}>{PUJA_REQUEST_LABELS[request.status]}</span>
                                <div className="pg-request-actions">
                                    <Link to={`/messages?user=${request.tourist_id}`} className="pg-icon" aria-label={`Chat with ${request.tourist_name}`}>
                                        <MessageSquare size={16} />
                                    </Link>
                                    {request.status === 'pending' ? (
                                        <button type="button" className="pg-icon is-accept" onClick={() => void respond(request, 'accepted')} aria-label="Accept request">
                                            <Check size={16} />
                                        </button>
                                    ) : null}
                                    {request.status === 'pending' || request.status === 'accepted' ? (
                                        <button type="button" className="pg-icon" onClick={() => void respond(request, 'declined')} aria-label="Decline request">
                                            <X size={16} />
                                        </button>
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
