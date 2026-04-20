import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    getConversationMessages,
    getConversations,
    getOrCreateConversation,
    getUserProfileById,
    sendConversationMessage,
    type ConversationMessageRecord,
    type ConversationRecord,
    type Profile,
} from '../lib/destinations';

type ConversationListItem = {
    conversation: ConversationRecord;
    otherUserId: string;
    otherProfile: Profile | null;
};

const getDisplayName = (profile: Profile | null, fallbackId: string) => (
    profile?.full_name || profile?.email || `User ${fallbackId.slice(0, 8)}`
);

export const Messages: React.FC = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedConversationId = searchParams.get('conversation');
    const targetUserId = searchParams.get('user');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [text, setText] = useState('');
    const [conversations, setConversations] = useState<ConversationListItem[]>([]);
    const [messages, setMessages] = useState<ConversationMessageRecord[]>([]);

    const selected = useMemo(
        () => conversations.find((item) => item.conversation.id === selectedConversationId) || null,
        [conversations, selectedConversationId]
    );

    const loadConversations = async () => {
        if (!user) return;
        const rows = await getConversations(user.id);
        const items = await Promise.all(rows.map(async (conversation) => {
            const otherUserId = conversation.traveler_id === user.id
                ? (conversation.provider_id || '')
                : (conversation.traveler_id || '');
            const otherProfile = otherUserId ? await getUserProfileById(otherUserId) : null;
            return {
                conversation,
                otherUserId,
                otherProfile,
            };
        }));
        setConversations(items.filter((item) => item.otherUserId));
    };

    useEffect(() => {
        if (!user) return;
        const bootstrap = async () => {
            setLoading(true);
            try {
                if (targetUserId && targetUserId !== user.id) {
                    const conversation = await getOrCreateConversation(user.id, targetUserId);
                    setSearchParams({ conversation: conversation.id }, { replace: true });
                }
                await loadConversations();
            } finally {
                setLoading(false);
            }
        };
        void bootstrap();
    }, [setSearchParams, targetUserId, user]);

    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }

        let active = true;
        const load = async () => {
            const rows = await getConversationMessages(selectedConversationId);
            if (active) setMessages(rows);
        };
        void load();

        const interval = window.setInterval(() => {
            void load();
        }, 5000);

        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [selectedConversationId]);

    const handleSend = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user || !selectedConversationId || !text.trim()) return;
        setSending(true);
        try {
            await sendConversationMessage({
                conversation_id: selectedConversationId,
                sender_user_id: user.id,
                body: text.trim(),
            });
            setText('');
            setMessages(await getConversationMessages(selectedConversationId));
        } catch (error) {
            console.error(error);
            alert('Failed to send message. Apply the latest SQL policies and retry.');
        } finally {
            setSending(false);
        }
    };

    if (!user) return null;

    return (
        <main style={{ paddingTop: '126px', paddingBottom: '80px' }}>
            <div className="container" style={{ display: 'grid', gap: '16px' }}>
                <h1 style={{ margin: 0, fontSize: '2rem', fontFamily: 'Outfit, sans-serif' }}>Messages</h1>
                <div className="msg-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '14px' }}>
                    <section style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: '18px', overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ padding: '20px', display: 'grid', placeItems: 'center' }}>
                                <Loader2 className="animate-spin" size={24} />
                            </div>
                        ) : conversations.length === 0 ? (
                            <p style={{ margin: 0, padding: '20px', color: 'var(--text-muted)' }}>No conversations yet.</p>
                        ) : (
                            conversations.map((item) => (
                                <button
                                    key={item.conversation.id}
                                    type="button"
                                    onClick={() => setSearchParams({ conversation: item.conversation.id })}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        border: 'none',
                                        borderBottom: '1px solid var(--border-light)',
                                        background: item.conversation.id === selectedConversationId ? 'var(--surface-muted)' : 'transparent',
                                        cursor: 'pointer',
                                        padding: '12px 14px',
                                    }}
                                >
                                    <strong style={{ display: 'block' }}>{getDisplayName(item.otherProfile, item.otherUserId)}</strong>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{item.otherProfile?.role || 'member'}</span>
                                </button>
                            ))
                        )}
                    </section>

                    <section style={{ background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: '18px', display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: '520px' }}>
                        {selected ? (
                            <>
                                <header style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong>{getDisplayName(selected.otherProfile, selected.otherUserId)}</strong>
                                    <Link to={`/users/${selected.otherUserId}`} style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                                        View profile
                                    </Link>
                                </header>

                                <div style={{ padding: '14px', overflowY: 'auto', display: 'grid', gap: '8px' }}>
                                    {messages.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)' }}>No messages yet. Start the conversation.</p>
                                    ) : messages.map((msg) => {
                                        const mine = msg.sender_user_id === user.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                style={{
                                                    justifySelf: mine ? 'end' : 'start',
                                                    maxWidth: '75%',
                                                    background: mine ? 'var(--primary)' : 'var(--surface-muted)',
                                                    color: mine ? 'var(--text-inverse)' : 'var(--text-main)',
                                                    borderRadius: '14px',
                                                    padding: '10px 12px',
                                                }}
                                            >
                                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.body}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <form onSubmit={handleSend} style={{ borderTop: '1px solid var(--border-light)', padding: '10px', display: 'flex', gap: '8px' }}>
                                    <input
                                        value={text}
                                        onChange={(event) => setText(event.target.value)}
                                        placeholder="Write a message..."
                                        style={{ flex: 1, border: '1px solid var(--border-light)', borderRadius: '12px', background: 'transparent', padding: '10px 12px', fontFamily: 'inherit' }}
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()} style={{ borderRadius: '12px', minWidth: '44px', justifyContent: 'center' }}>
                                        {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div style={{ display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
                                Select a conversation to start chatting.
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <style>{`
              @media (max-width: 900px) {
                .msg-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
        </main>
    );
};
