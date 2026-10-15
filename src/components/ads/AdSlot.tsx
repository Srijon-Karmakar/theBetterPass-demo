import React, { useEffect, useRef } from 'react';
import './ad-slot.css';

declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined)?.trim() ?? '';
const SCRIPT_ID = 'adsense-script';

const loadAdSenseScript = () => {
    if (typeof document === 'undefined' || document.getElementById(SCRIPT_ID) || document.querySelector('script[src*="adsbygoogle.js"]')) return;
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
    document.head.appendChild(script);
};

interface AdSlotProps {
    /** AdSense ad unit id (the data-ad-slot value from the AdSense dashboard). */
    slot: string | undefined;
    className?: string;
}

/**
 * Responsive display ad. Renders nothing until VITE_ADSENSE_CLIENT and the slot
 * id are configured, so it is safe to leave mounted in the UI. The AdSense
 * script is only loaded once an ad is actually shown, keeping the rest of the
 * site free of third-party scripts.
 */
export const AdSlot: React.FC<AdSlotProps> = ({ slot, className }) => {
    const insRef = useRef<HTMLModElement | null>(null);
    const enabled = Boolean(ADSENSE_CLIENT && slot);

    useEffect(() => {
        if (!enabled || !insRef.current) return;
        // StrictMode double-invokes effects; an <ins> that already has a status was filled.
        if (insRef.current.dataset.adsbygoogleStatus) return;
        loadAdSenseScript();
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // Blocked by an ad blocker or not yet approved; leave the slot empty.
        }
    }, [enabled]);

    if (!enabled) return null;

    return (
        <aside className={`ad-slot${className ? ` ${className}` : ''}`} aria-label="Advertisement">
            <span className="ad-slot-label">Advertisement</span>
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={slot}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </aside>
    );
};
