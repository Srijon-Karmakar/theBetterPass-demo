import React, { useEffect, useMemo, useState } from 'react';
import { Download, Trash2, X } from 'lucide-react';
import { type OfflineTrail } from '../../lib/offlineTrails';
import { saveBlob } from '../../lib/mapExport';
import { PUJA_TRAILS, resolveTrail } from '../../lib/pujaTrails';
import './offline-trail-viewer.css';

interface OfflineTrailViewerProps {
    item: OfflineTrail;
    onDelete: (item: OfflineTrail) => void;
    onClose: () => void;
}

/** Opens a saved trail map with its stop list. Everything here comes from the device, so it works with no internet. */
export const OfflineTrailViewer: React.FC<OfflineTrailViewerProps> = ({ item, onDelete, onClose }) => {
    const [zoomed, setZoomed] = useState(false);
    const [message, setMessage] = useState('');
    const imageUrl = useMemo(() => URL.createObjectURL(item.image), [item.image]);
    const trail = useMemo(() => {
        const source = PUJA_TRAILS.find((candidate) => candidate.id === item.trailId);
        return source ? resolveTrail(source) : null;
    }, [item.trailId]);

    useEffect(() => () => URL.revokeObjectURL(imageUrl), [imageUrl]);

    const saveImage = async () => {
        setMessage('');
        try {
            await saveBlob(item.image, `${item.trailId}-map.jpg`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not save the image.');
        }
    };

    return (
        <div className="offline-trail" role="dialog" aria-modal="true" aria-label={`${item.title} (saved)`}>
            <header className="offline-trail__bar">
                <strong>{item.title}</strong>
                <button type="button" onClick={onClose} aria-label="Close"><X size={18} aria-hidden="true" /></button>
            </header>

            <div className="offline-trail__scroll">
                <button
                    type="button"
                    className={`offline-trail__map${zoomed ? ' is-zoomed' : ''}`}
                    onClick={() => setZoomed((value) => !value)}
                    aria-label={zoomed ? 'Fit map to screen' : 'Zoom in on the map'}
                >
                    <img src={imageUrl} alt={`Saved map of ${item.title}`} />
                </button>

                {trail ? (
                    <ol className="offline-trail__stops">
                        {trail.pandals.map(({ pandal, tip }, index) => (
                            <li key={pandal.id}>
                                <b>{index + 1}</b>
                                <div>
                                    <strong>{pandal.name}</strong>
                                    <small>{pandal.area}</small>
                                    <span>{tip}</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                ) : null}
            </div>

            <footer className="offline-trail__actions">
                <button type="button" onClick={() => void saveImage()}><Download size={16} aria-hidden="true" />Save image</button>
                <button type="button" className="is-danger" onClick={() => onDelete(item)}><Trash2 size={16} aria-hidden="true" />Delete</button>
            </footer>
            {message ? <p className="offline-trail__message" role="alert">{message}</p> : null}
        </div>
    );
};

export default OfflineTrailViewer;
