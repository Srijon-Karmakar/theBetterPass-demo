import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import './expandable-markdown.css';

/**
 * Small, safe markdown renderer for provider-written descriptions: headings, bold, italic, links and bullet or
 * numbered lists. It builds React elements directly, so nothing is injected as HTML.
 */

const INLINE_PATTERN = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|_[^_\s][^_]*_|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => (
    text.split(INLINE_PATTERN).filter(Boolean).map((part, index) => {
        const key = `${keyPrefix}-${index}`;
        if ((part.startsWith('**') && part.endsWith('**') && part.length > 4) || (part.startsWith('__') && part.endsWith('__') && part.length > 4)) {
            return <strong key={key}>{part.slice(2, -2)}</strong>;
        }
        if ((part.startsWith('*') && part.endsWith('*') && part.length > 2) || (part.startsWith('_') && part.endsWith('_') && part.length > 2)) {
            return <em key={key}>{part.slice(1, -1)}</em>;
        }
        const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part);
        if (link) {
            return <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a>;
        }
        return <React.Fragment key={key}>{part}</React.Fragment>;
    })
);

type Block =
    | { kind: 'heading'; text: string }
    | { kind: 'list'; ordered: boolean; items: string[] }
    | { kind: 'paragraph'; lines: string[] };

// A "heading" this long is almost certainly a paragraph that happens to start with "#".
const MAX_HEADING_LENGTH = 120;

const parseBlocks = (source: string): Block[] => {
    const blocks: Block[] = [];
    let paragraph: string[] = [];
    let list: { ordered: boolean; items: string[] } | null = null;

    const flushParagraph = () => {
        if (paragraph.length) blocks.push({ kind: 'paragraph', lines: paragraph });
        paragraph = [];
    };
    const flushList = () => {
        if (list) blocks.push({ kind: 'list', ...list });
        list = null;
    };

    source.replace(/\r\n?/g, '\n').split('\n').forEach((raw) => {
        const line = raw.trim();
        if (!line) {
            flushParagraph();
            flushList();
            return;
        }
        const heading = /^#{1,6}\s+(.*)$/.exec(line);
        if (heading && heading[1].length <= MAX_HEADING_LENGTH) {
            flushParagraph();
            flushList();
            blocks.push({ kind: 'heading', text: heading[1].replace(/\s*#+\s*$/, '') });
            return;
        }
        const bullet = /^[-*•]\s+(.*)$/.exec(line);
        const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
        if (bullet || numbered) {
            flushParagraph();
            const ordered = Boolean(numbered);
            if (list && list.ordered !== ordered) flushList();
            if (!list) list = { ordered, items: [] };
            list.items.push((bullet || numbered)![1]);
            return;
        }
        flushList();
        paragraph.push(line.replace(/^#{1,6}\s+/, ''));
    });
    flushParagraph();
    flushList();
    return blocks;
};

interface ExpandableMarkdownProps {
    text: string;
    className?: string;
    /** Collapsed height, in em of the text's own font size (about 1.6em per line). */
    collapsedEm?: number;
}

export const ExpandableMarkdown: React.FC<ExpandableMarkdownProps> = ({ text, className = '', collapsedEm = 6.6 }) => {
    const blocks = useMemo(() => parseBlocks(text || ''), [text]);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [overflowing, setOverflowing] = useState(false);

    // Measure while collapsed to decide whether "See more" is needed at all.
    useLayoutEffect(() => {
        const element = bodyRef.current;
        if (!element) return undefined;
        const measure = () => {
            if (expanded) return;
            setOverflowing(element.scrollHeight > element.clientHeight + 2);
        };
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [blocks, expanded]);

    if (!blocks.length) return null;

    return (
        <div className={`xmd${className ? ` ${className}` : ''}`}>
            <div
                ref={bodyRef}
                className={`xmd-body${expanded ? '' : ' is-clamped'}${!expanded && overflowing ? ' is-faded' : ''}`}
                style={expanded ? undefined : { maxHeight: `${collapsedEm}em` }}
            >
                {blocks.map((block, index) => {
                    const key = `b${index}`;
                    if (block.kind === 'heading') return <h3 key={key}>{renderInline(block.text, key)}</h3>;
                    if (block.kind === 'list') {
                        const Tag = block.ordered ? 'ol' : 'ul';
                        return (
                            <Tag key={key}>
                                {block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>)}
                            </Tag>
                        );
                    }
                    return (
                        <p key={key}>
                            {block.lines.map((line, lineIndex) => (
                                <React.Fragment key={`${key}-${lineIndex}`}>
                                    {lineIndex > 0 ? <br /> : null}
                                    {renderInline(line, `${key}-${lineIndex}`)}
                                </React.Fragment>
                            ))}
                        </p>
                    );
                })}
            </div>
            {(overflowing || expanded) && (
                <button type="button" className="xmd-toggle" aria-expanded={expanded} onClick={() => setExpanded((current) => !current)}>
                    {expanded ? 'See less' : 'See more'}
                </button>
            )}
        </div>
    );
};
