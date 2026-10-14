import React, { useEffect, useState } from 'react';
import { Download, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { Map as LeafletMap } from 'leaflet';
import { downloadMapAsPdf, downloadMapAsPng } from '../../lib/mapExport';

interface MapDownloadButtonProps {
    getMap: () => LeafletMap | null;
    /** Hide the button while a bottom sheet covers the corner (same rule as the locate button). */
    covered?: boolean;
}

/** "Download map": saves what the map shows right now as a PNG or PDF, with a restaurant legend added to the file.
 *  The round button sits beside the locate button in the bottom-left corner. */
export const MapDownloadButton: React.FC<MapDownloadButtonProps> = ({ getMap, covered = false }) => {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState<'png' | 'pdf' | null>(null);
    const [message, setMessage] = useState('');

    // Anything can ask the map to open this chooser with the tbp:open-map-download event.
    useEffect(() => {
        const onOpen = () => { setMessage(''); setOpen(true); };
        window.addEventListener('tbp:open-map-download', onOpen);
        return () => window.removeEventListener('tbp:open-map-download', onOpen);
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        const close = (event: Event) => {
            if (event.target instanceof Element && event.target.closest('.map2-download, .map2-download-fab')) return;
            setOpen(false);
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', close);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', close);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const run = async (kind: 'png' | 'pdf') => {
        const map = getMap();
        if (!map) {
            setMessage('The map is not ready yet.');
            return;
        }
        setBusy(kind);
        setMessage('');
        try {
            if (kind === 'png') await downloadMapAsPng(map);
            else await downloadMapAsPdf(map);
            setOpen(false);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not create the download.');
        } finally {
            setBusy(null);
        }
    };

    return (
        <>
        <button
            type="button"
            className={`map2-download-fab${covered ? ' is-covered' : ''}`}
            onClick={() => { setMessage(''); setOpen((current) => !current); }}
            aria-label="Download map"
            aria-expanded={open}
            title="Download map"
        >
            <Download size={20} />
        </button>
        <div className="map2-download">
            {open ? (
                <div className="map2-download-menu" role="menu" aria-label="Download map">
                    <p>Saves this map view with a numbered restaurant legend.</p>
                    <button type="button" role="menuitem" onClick={() => void run('png')} disabled={busy !== null}>
                        {busy === 'png' ? <Loader2 size={17} className="animate-spin" /> : <ImageIcon size={17} />}
                        <span>PNG image<small>Best for sharing</small></span>
                    </button>
                    <button type="button" role="menuitem" onClick={() => void run('pdf')} disabled={busy !== null}>
                        {busy === 'pdf' ? <Loader2 size={17} className="animate-spin" /> : <FileText size={17} />}
                        <span>PDF<small>Best for printing</small></span>
                    </button>
                    {message ? <p className="map2-download-error" role="alert">{message}</p> : null}
                </div>
            ) : null}
        </div>
        </>
    );
};
