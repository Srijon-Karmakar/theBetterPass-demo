import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';

type ModerationMediaGalleryProps = {
    images: string[];
    title: string;
};

export const ModerationMediaGallery = ({ images, title }: ModerationMediaGalleryProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);
    const count = images.length;
    const safeIndex = count > 0 ? Math.min(activeIndex, count - 1) : 0;

    const step = useCallback((direction: number) => {
        setActiveIndex((current) => (Math.min(current, count - 1) + direction + count) % count);
    }, [count]);

    useEffect(() => {
        if (!viewerOpen) return undefined;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setViewerOpen(false);
            if (count > 1 && event.key === 'ArrowLeft') step(-1);
            if (count > 1 && event.key === 'ArrowRight') step(1);
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [viewerOpen, count, step]);

    if (count === 0) {
        return (
            <div className="rdb-moderation-media rdb-moderation-media--empty">
                <ImageOff size={20} aria-hidden="true" />
                <span>No images</span>
            </div>
        );
    }

    return (
        <>
            <button
                type="button"
                className="rdb-moderation-media rdb-moderation-media-btn"
                onClick={() => setViewerOpen(true)}
                aria-label={`View image ${safeIndex + 1} of ${count} full size`}
            >
                <img src={images[safeIndex]} alt={`${title} - image ${safeIndex + 1}`} loading="lazy" />
                {count > 1 && <span className="rdb-moderation-media-count">{safeIndex + 1}/{count}</span>}
            </button>

            {count > 1 && (
                <div className="rdb-moderation-thumbs" aria-label="Listing images">
                    {images.map((url, index) => (
                        <button
                            key={url}
                            type="button"
                            className={`rdb-moderation-thumb${index === safeIndex ? ' is-active' : ''}`}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Show image ${index + 1}`}
                            aria-current={index === safeIndex}
                        >
                            <img src={url} alt="" loading="lazy" />
                        </button>
                    ))}
                </div>
            )}

            {viewerOpen && createPortal(
                <div
                    className="rdb-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${title} images`}
                    onClick={() => setViewerOpen(false)}
                >
                    <button
                        type="button"
                        className="rdb-lightbox-btn rdb-lightbox-close"
                        onClick={() => setViewerOpen(false)}
                        aria-label="Close image viewer"
                        autoFocus
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                    {count > 1 && (
                        <button
                            type="button"
                            className="rdb-lightbox-btn rdb-lightbox-prev"
                            onClick={(event) => { event.stopPropagation(); step(-1); }}
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={22} aria-hidden="true" />
                        </button>
                    )}
                    <img
                        className="rdb-lightbox-image"
                        src={images[safeIndex]}
                        alt={`${title} - image ${safeIndex + 1}`}
                        onClick={(event) => event.stopPropagation()}
                    />
                    {count > 1 && (
                        <button
                            type="button"
                            className="rdb-lightbox-btn rdb-lightbox-next"
                            onClick={(event) => { event.stopPropagation(); step(1); }}
                            aria-label="Next image"
                        >
                            <ChevronRight size={22} aria-hidden="true" />
                        </button>
                    )}
                    {count > 1 && <span className="rdb-lightbox-count">{safeIndex + 1} / {count}</span>}
                </div>,
                document.body,
            )}
        </>
    );
};

type ExpandableTextProps = {
    text: string;
    className?: string;
};

export const ExpandableText = ({ text, className }: ExpandableTextProps) => {
    const [expanded, setExpanded] = useState(false);
    const [overflowing, setOverflowing] = useState(false);
    const textRef = useRef<HTMLParagraphElement | null>(null);

    useLayoutEffect(() => {
        const node = textRef.current;
        if (!node || expanded) return undefined;

        const measure = () => setOverflowing(node.scrollHeight > node.clientHeight + 1);
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, [text, expanded]);

    return (
        <div className="rdb-expandable-text">
            <p ref={textRef} className={`${className || ''}${expanded ? '' : ' is-clamped'}`}>{text}</p>
            {(overflowing || expanded) && (
                <button
                    type="button"
                    className="rdb-expandable-toggle"
                    onClick={() => setExpanded((current) => !current)}
                    aria-expanded={expanded}
                >
                    {expanded ? 'See less' : 'See more'}
                </button>
            )}
        </div>
    );
};
