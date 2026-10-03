import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FIRST_BOOKING_COUPON_PERCENT } from '../lib/coupons';
import { DiscountBadge } from './DiscountBadge';
import './guest-offer-popup.css';

const SHOW_DELAY_MS = 2200;

const HIDDEN_PATHS = new Set([
    '/login',
    '/signup',
    '/auth',
    '/auth/callback',
    '/dashboard',
    '/profile',
    '/messages',
    '/notifications',
    '/admin',
    '/provider/studio',
]);

export const GuestOfferPopup: React.FC = () => {
    const { user, loading, profileLoading } = useAuth();
    const location = useLocation();
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const shouldRun = useMemo(() => {
        if (loading || profileLoading || user || dismissed) return false;
        if (location.pathname.startsWith('/dashboard/') || location.pathname.startsWith('/admin/')) return false;
        return !HIDDEN_PATHS.has(location.pathname);
    }, [dismissed, loading, location.pathname, profileLoading, user]);

    useEffect(() => {
        setVisible(false);
        setDismissed(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!shouldRun) return undefined;

        let showTimer: number | undefined;
        let hasQueued = false;

        const queuePopup = () => {
            if (hasQueued) return;
            hasQueued = true;
            showTimer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
        };

        window.addEventListener('scroll', queuePopup, { passive: true, capture: true });
        window.addEventListener('wheel', queuePopup, { passive: true, capture: true });
        window.addEventListener('touchmove', queuePopup, { passive: true, capture: true });

        if (window.scrollY > 24 || document.documentElement.scrollTop > 24 || document.body.scrollTop > 24) {
            queuePopup();
        }

        return () => {
            if (showTimer) window.clearTimeout(showTimer);
            window.removeEventListener('scroll', queuePopup, { capture: true });
            window.removeEventListener('wheel', queuePopup, { capture: true });
            window.removeEventListener('touchmove', queuePopup, { capture: true });
        };
    }, [shouldRun, location.pathname]);

    const handleDismiss = useCallback(() => {
        setVisible(false);
        setDismissed(true);
    }, []);

    useEffect(() => {
        if (!visible) return undefined;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleDismiss();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleDismiss, visible]);

    if (!visible || !shouldRun) return null;

    return (
        <aside
            className="guest-offer-popup"
            role="dialog"
            aria-modal="false"
            aria-labelledby="guest-offer-popup-title"
        >
            <button
                type="button"
                className="guest-offer-popup__close"
                onClick={handleDismiss}
                aria-label="Dismiss BetterPass offer"
            >
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
            </button>

            <div className="guest-offer-popup__badge" aria-hidden="true">
                <span className="guest-offer-popup__pulse" />
                <DiscountBadge discountPercent={FIRST_BOOKING_COUPON_PERCENT} />
            </div>

            <div className="guest-offer-popup__content">
                <h2 id="guest-offer-popup-title">Congratulations</h2>
                <p>You have been awarded a BetterPass offer.</p>
                <p className="guest-offer-popup__redeem">Join now to redeem.</p>
            </div>

            <div className="guest-offer-popup__actions">
                <Link to="/signup" className="guest-offer-popup__cta" onClick={handleDismiss}>
                    Join now
                </Link>
            </div>
        </aside>
    );
};