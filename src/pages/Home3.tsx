import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    ChevronDown,
    Compass,
    Globe,
    MapPin,
    Mountain,
    Shield,
    Sparkles,
    Star,
    Users,
} from 'lucide-react';
import './home3.css';

/* ─── Scroll Reveal ────────────────────────────────────────────────── */
type RevealProps = { children: React.ReactNode; className?: string; delay?: number };

const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(node); } },
            { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
        );
        obs.observe(node);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`h3-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
            style={{ '--delay': `${delay}ms` } as React.CSSProperties}
        >
            {children}
        </div>
    );
};

/* ─── Data ─────────────────────────────────────────────────────────── */
const services = [
    {
        icon: Compass,
        title: 'Guided Expeditions',
        description: 'Expert-led journeys through mountains, valleys, and hidden landscapes. Every trail hand-picked for wonder and discovery.',
        tag: 'Most Popular',
    },
    {
        icon: Mountain,
        title: 'Adventure Sports',
        description: 'White-water rafting, paragliding, rock climbing — adrenaline-fueled experiences for the bold and endlessly curious.',
        tag: null,
    },
    {
        icon: Sparkles,
        title: 'Cultural Immersion',
        description: 'Stay with locals, taste authentic cuisine, and witness traditions that no textbook can ever fully capture.',
        tag: null,
    },
    {
        icon: Star,
        title: 'Luxury Retreats',
        description: 'World-class resorts, private villas, and perfectly curated experiences for those who travel beautifully in style.',
        tag: 'Premium',
    },
];

const destinations = [
    {
        name: 'Delhi Heritage',
        country: 'India',
        description: 'The paradise on earth — emerald lakes, saffron fields, and snow-tipped Himalayan peaks at every horizon.',
        image: '/images/delhi1.jpg',
        tag: 'Trending',
        price: 'From ₹24,999',
        imgPos: 'center 42%',
    },
    {
        name: 'Kerala Backwaters',
        country: 'India',
        description: 'Coffee estates, mist-covered hills, and ancient temples — the Scotland of India, reimagined for explorers.',
        image: '/images/kerala1.jpg',
        tag: 'Nature',
        price: 'From ₹12,499',
        imgPos: 'center 52%',
    },
    {
        name: 'Sikkim Peaks',
        country: 'India',
        description: 'A cold desert valley sitting in the arms of the mighty Himalayas — raw, remote, and utterly breathtaking.',
        image: '/images/sikkim2.jpg',
        tag: 'Adventure',
        price: 'From ₹18,999',
        imgPos: 'center 46%',
    },
];

const testimonials = [
    {
        name: 'Priya Sharma',
        location: 'Mumbai, India',
        text: "The Kashmir trip exceeded every expectation. The guides knew every hidden gem, every secret viewpoint. I've already booked my next journey with Vagabond.",
        rating: 5,
        avatar: 'PS',
    },
    {
        name: 'Arjun Mehta',
        location: 'Bangalore, India',
        text: "Adventure sports in Coorg was a life-changing experience. The team handled absolutely everything so seamlessly — I just had to show up and enjoy.",
        rating: 5,
        avatar: 'AM',
    },
    {
        name: 'Neha Kapoor',
        location: 'Delhi, India',
        text: "Spiti Valley in winter — words genuinely can't describe it. Vagabond made what seemed like an impossible journey possible. Worth every single rupee.",
        rating: 5,
        avatar: 'NK',
    },
];

const stats = [
    { value: '200+', label: 'Destinations' },
    { value: '15K+', label: 'Happy Travelers' },
    { value: '8+', label: 'Years of Excellence' },
    { value: '98%', label: 'Satisfaction Rate' },
];

const horizontalCategories = [
    {
        title: 'Desert Aura',
        label: 'Desert',
        video: '/video/horizontal-sect/desert.mp4',
        kicker: 'Golden silence',
        description: 'Discover vast dunes, slow-burning sunsets, and long cinematic horizons where every trail feels mythic.',
    },
    {
        title: 'Ocean Drift',
        label: 'Ocean',
        video: '/video/horizontal-sect/ocean.mp4',
        kicker: 'Salt and motion',
        description: 'Follow deep blue coastlines, shifting light, and open water experiences designed for calm and immersion.',
    },
    {
        title: 'Mountain Pulse',
        label: 'Mountains',
        video: '/video/horizontal-sect/mountain.mp4',
        kicker: 'Thin air, high drama',
        description: 'Move through elevated landscapes, crisp ridgelines, and alpine routes that feel expansive at every step.',
    },
    {
        title: 'Cityscapes',
        label: 'Cityscapes',
        video: '/video/horizontal-sect/cityscape.mp4',
        kicker: 'Electric nights',
        description: 'Step into layered skylines, fast streets, and urban energy curated for travelers who like rhythm and contrast.',
    },
    {
        title: 'Forest Hush',
        label: 'Forest',
        video: '/video/horizontal-sect/forrest.mp4',
        kicker: 'Canopy and stillness',
        description: 'Drift through layered greens, filtered sunlight, and deep woodland trails designed for slower, quieter immersion.',
    },
];

/* ─── Component ─────────────────────────────────────────────────────── */
export const Home3: React.FC = () => {
    const heroSceneRef = useRef<HTMLElement>(null);
    const horizontalSceneRef = useRef<HTMLElement>(null);
    const horizontalViewportRef = useRef<HTMLDivElement>(null);
    const heroBgRef = useRef<HTMLDivElement>(null);
    const heroContentRef = useRef<HTMLDivElement>(null);
    const cloud1Ref = useRef<HTMLImageElement>(null);
    const cloud2Ref = useRef<HTMLImageElement>(null);
    const cloud3Ref = useRef<HTMLImageElement>(null);
    const cloud4Ref = useRef<HTMLImageElement>(null);
    const cloud5Ref = useRef<HTMLImageElement>(null);
    const cloud6Ref = useRef<HTMLImageElement>(null);
    const cloud7Ref = useRef<HTMLImageElement>(null);
    const cloud8Ref = useRef<HTMLImageElement>(null);
    const cloud9Ref = useRef<HTMLImageElement>(null);
    const cloud10Ref = useRef<HTMLImageElement>(null);
    const stripBgRef = useRef<HTMLDivElement>(null);
    const ctaBgRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const mouse = useRef({ x: 0, y: 0, lx: 0, ly: 0 });
    const [activeHorizontalIndex, setActiveHorizontalIndex] = useState(0);
    const horizontalTargetProgressRef = useRef(0);
    const horizontalVisualProgressRef = useRef(0);
    const horizontalLockedRef = useRef(false);
    const horizontalTouchYRef = useRef<number | null>(null);
    const horizontalWarmupRef = useRef(0);
    const horizontalVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const horizontalPanelRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        const scene = heroSceneRef.current;
        const bg = heroBgRef.current;
        const content = heroContentRef.current;
        const c1 = cloud1Ref.current;
        const c2 = cloud2Ref.current;
        const c3 = cloud3Ref.current;
        const c4 = cloud4Ref.current;
        const c5 = cloud5Ref.current;
        const c6 = cloud6Ref.current;
        const c7 = cloud7Ref.current;
        const c8 = cloud8Ref.current;
        const c9 = cloud9Ref.current;
        const c10 = cloud10Ref.current;
        const horizontalScene = horizontalSceneRef.current;
        const horizontalViewport = horizontalViewportRef.current;
        const stripBg = stripBgRef.current;
        const ctaBg = ctaBgRef.current;

        if (!scene || !bg) return;

        // Only track mouse on non-touch devices
        const hasHover = window.matchMedia('(hover: hover)').matches;

        const onMouse = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const tick = () => {
            const m = mouse.current;
            // Lerp mouse for buttery smoothness
            m.lx += (m.x - m.lx) * 0.055;
            m.ly += (m.y - m.ly) * 0.055;

            // Hero scroll progress (0 → 1 over sticky range)
            const travel = Math.max(scene.offsetHeight - window.innerHeight, 1);
            const progress = Math.min(Math.max(window.scrollY / travel, 0), 1);
            const ph = progress * window.innerHeight;

            // Background — mouse parallax only on hover-capable devices
            const mx = hasHover ? m.lx * -22 : 0;
            const my = hasHover ? m.ly * -14 - progress * 90 : -progress * 90;
            bg.style.transform = `translate3d(${mx}px, ${my}px, 0) scale(1.2)`;

            // Content — rises and fades
            if (content) {
                content.style.transform = `translate3d(0, ${progress * -80}px, 0)`;
                content.style.opacity = String(Math.max(1 - progress * 2.8, 0));
            }

            // Clouds — three depth layers, slowest (back) → fastest (front)
            // Reduce travel on mobile for comfort
            const cloudScale = window.innerWidth < 768 ? 0.42 : 0.74;
            if (c1) c1.style.transform = `translate3d(0, ${-ph * 0.12 * cloudScale}px, 0)`;
            if (c2) c2.style.transform = `translate3d(0, ${-ph * 0.24 * cloudScale}px, 0)`;
            if (c3) c3.style.transform = `translate3d(0, ${-ph * 0.3 * cloudScale}px, 0)`;
            if (c4) c4.style.transform = `translate3d(0, ${-ph * 0.16 * cloudScale}px, 0)`;
            if (c5) c5.style.transform = `translate3d(0, ${-ph * 0.22 * cloudScale}px, 0)`;
            if (c6) c6.style.transform = `translate3d(0, ${-ph * 0.14 * cloudScale}px, 0)`;
            if (c7) c7.style.transform = `translate3d(0, ${-ph * 0.18 * cloudScale}px, 0)`;
            if (c8) c8.style.transform = `translate3d(0, ${-ph * 0.2 * cloudScale}px, 0)`;
            if (c9) c9.style.transform = `translate3d(0, ${-ph * 0.22 * cloudScale}px, 0)`;
            if (c10) c10.style.transform = `translate3d(0, ${-ph * 0.18 * cloudScale}px, 0)`;

            if (horizontalScene && horizontalViewport) {
                const target = horizontalTargetProgressRef.current;
                let visual = horizontalVisualProgressRef.current;
                // slightly stronger lerp for snappier, yet smooth visual follow
                visual += (target - visual) * 0.16;
                if (Math.abs(target - visual) < 0.0004) visual = target;
                horizontalVisualProgressRef.current = visual;

                const horizontalShift = visual * (horizontalCategories.length - 1) * -100;
                const horizontalRect = horizontalScene.getBoundingClientRect();
                const entryFade = Math.min(Math.max((window.innerHeight - horizontalRect.top) / (window.innerHeight * 0.24), 0), 1);
                const exitFade = Math.min(Math.max(horizontalRect.bottom / (window.innerHeight * 0.34), 0), 1);
                const sectionPresence = Math.min(entryFade, exitFade);
                const sectionLift = (1 - sectionPresence) * 36;

                horizontalViewport.style.setProperty('--h3-horizontal-progress', visual.toFixed(4));
                horizontalViewport.style.setProperty('--h3-horizontal-shift', `${horizontalShift.toFixed(4)}vw`);
                horizontalViewport.style.setProperty('--h3-horizontal-presence', sectionPresence.toFixed(4));
                horizontalViewport.style.setProperty('--h3-horizontal-lift', `${sectionLift.toFixed(2)}px`);
                horizontalViewport.classList.toggle('is-scroll-locked', horizontalLockedRef.current);

                const slideProgress = visual * (horizontalCategories.length - 1);
                horizontalPanelRefs.current.forEach((panel, index) => {
                    if (!panel) return;

                    const distance = Math.abs(slideProgress - index);
                    const boundedDistance = Math.min(distance, 1.25);
                    const panelOpacity = Math.max(1 - boundedDistance * 0.82, 0.12);
                    const mediaScale = 1 + Math.max(0.06 - boundedDistance * 0.035, 0);
                    const mediaBrightness = 0.58 + Math.max(0.34 - boundedDistance * 0.16, 0);
                    const contentOpacity = Math.max(1 - boundedDistance * 1.18, 0);
                    const contentShift = Math.min(boundedDistance * 92, 92);
                    const blur = Math.min(boundedDistance * 3.5, 3.5);

                    panel.style.setProperty('--h3-panel-opacity', panelOpacity.toFixed(4));
                    panel.style.setProperty('--h3-panel-scale', mediaScale.toFixed(4));
                    panel.style.setProperty('--h3-panel-brightness', mediaBrightness.toFixed(4));
                    panel.style.setProperty('--h3-content-opacity', contentOpacity.toFixed(4));
                    panel.style.setProperty('--h3-content-shift', `${contentShift.toFixed(2)}px`);
                    panel.style.setProperty('--h3-panel-blur', `${blur.toFixed(2)}px`);
                });

                const nextIndex = Math.min(
                    horizontalCategories.length - 1,
                    Math.round(visual * (horizontalCategories.length - 1)),
                );
                setActiveHorizontalIndex((prev) => (prev === nextIndex ? prev : nextIndex));
            }

            // Strip parallax
            if (stripBg) {
                const r = stripBg.parentElement?.getBoundingClientRect();
                if (r) stripBg.style.transform = `translate3d(0, ${-r.top * 0.28}px, 0) scale(1.15)`;
            }

            // CTA parallax
            if (ctaBg) {
                const r = ctaBg.parentElement?.getBoundingClientRect();
                if (r) ctaBg.style.transform = `translate3d(0, ${-r.top * 0.22}px, 0) scale(1.12)`;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        if (hasHover) window.addEventListener('mousemove', onMouse, { passive: true });

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (hasHover) window.removeEventListener('mousemove', onMouse);
        };
    }, []);

    useEffect(() => {
        const horizontalScene = horizontalSceneRef.current;
        const horizontalViewport = horizontalViewportRef.current;
        if (!horizontalScene || !horizontalViewport) return;

        const wheelFactor = window.innerWidth < 768 ? 0.00052 : 0.00042;
        const keyStep = 0.12;
        const targetBoundaryTolerance = 0.002;
        const visualBoundaryTolerance = 0.02;
        const horizontalWarmupThreshold = window.innerWidth < 768 ? 0.11 : 0.08;
        const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
        const previousBodyOverscroll = document.body.style.overscrollBehavior;

        const setLockedState = (locked: boolean) => {
            horizontalLockedRef.current = locked;
            horizontalViewport.classList.toggle('is-scroll-locked', locked);
            document.documentElement.style.overscrollBehavior = locked ? 'none' : previousHtmlOverscroll;
            document.body.style.overscrollBehavior = locked ? 'none' : previousBodyOverscroll;
        };

        const getSceneTop = () => window.scrollY + horizontalScene.getBoundingClientRect().top;

        const alignSceneToViewport = () => {
            const absoluteTop = getSceneTop();
            if (Math.abs(horizontalScene.getBoundingClientRect().top) > 18) {
                window.scrollTo({ top: absoluteTop, behavior: 'auto' });
            }
        };

        const isCaptureZone = (direction: number) => {
            if (horizontalLockedRef.current) return true;

            const rect = horizontalScene.getBoundingClientRect();
            const enterLine = window.innerHeight * (window.innerWidth < 768 ? 0.72 : 0.64);
            const reverseLine = window.innerHeight * (window.innerWidth < 768 ? 0.28 : 0.36);

            if (direction > 0) {
                return rect.top <= enterLine && rect.bottom > enterLine;
            }

            return rect.top < reverseLine && rect.bottom >= reverseLine;
        };

        const releaseScene = (direction: number) => {
            const absoluteTop = getSceneTop();
            const releaseTarget = direction > 0
                ? absoluteTop + horizontalScene.offsetHeight + window.innerHeight * 0.03
                : Math.max(absoluteTop - window.innerHeight * 0.32, 0);
            window.scrollTo({ top: releaseTarget, behavior: 'auto' });
        };

        const applyProgressDelta = (deltaProgress: number) => {
            const nextProgress = Math.min(
                Math.max(horizontalTargetProgressRef.current + deltaProgress, 0),
                1,
            );
            horizontalTargetProgressRef.current = nextProgress;
            return nextProgress;
        };

        const shouldRelease = (direction: number) => {
            const target = horizontalTargetProgressRef.current;
            // Use the target progress as the authoritative release condition.
            // Visual is smoothed and can lag — relying on it can prevent timely release.
            const atStart = target <= targetBoundaryTolerance;
            const atEnd = target >= 1 - targetBoundaryTolerance;
            return (direction < 0 && atStart) || (direction > 0 && atEnd);
        };

        const handleDirectionalInput = (deltaProgress: number) => {
            const direction = Math.sign(deltaProgress);
            if (direction === 0) return false;

            if (!isCaptureZone(direction)) {
                horizontalWarmupRef.current = 0;
                setLockedState(false);
                return false;
            }

            // Only snap the scene into view on first capture, not on every event
            if (!horizontalLockedRef.current) {
                alignSceneToViewport();
            }

            if (shouldRelease(direction)) {
                horizontalWarmupRef.current = 0;
                setLockedState(false);
                releaseScene(direction);
                return true;
            }

            setLockedState(true);

            const atHorizontalStart =
                horizontalTargetProgressRef.current <= targetBoundaryTolerance &&
                horizontalVisualProgressRef.current <= visualBoundaryTolerance;

            if (direction > 0 && atHorizontalStart) {
                const nextWarmup = horizontalWarmupRef.current + Math.abs(deltaProgress);
                if (nextWarmup < horizontalWarmupThreshold) {
                    horizontalWarmupRef.current = nextWarmup;
                    return true;
                }

                const overflow = nextWarmup - horizontalWarmupThreshold;
                horizontalWarmupRef.current = horizontalWarmupThreshold;
                if (overflow > 0) {
                    applyProgressDelta(overflow);
                }
                return true;
            }

            if (direction < 0) {
                horizontalWarmupRef.current = 0;
            }

            applyProgressDelta(deltaProgress);
            return true;
        };

        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
            if (!handleDirectionalInput(e.deltaY * wheelFactor)) return;
            e.preventDefault();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            const keyMap: Record<string, number> = {
                ArrowDown: keyStep,
                PageDown: keyStep * 1.75,
                ' ': e.shiftKey ? -keyStep * 1.75 : keyStep * 1.75,
                ArrowUp: -keyStep,
                PageUp: -keyStep * 1.75,
            };

            if (!(e.key in keyMap)) return;
            if (!handleDirectionalInput(keyMap[e.key])) return;
            e.preventDefault();
        };

        const onTouchStart = (e: TouchEvent) => {
            horizontalTouchYRef.current = e.touches[0]?.clientY ?? null;
        };

        const onTouchMove = (e: TouchEvent) => {
            const currentY = e.touches[0]?.clientY;
            if (currentY == null || horizontalTouchYRef.current == null) return;

            const deltaY = horizontalTouchYRef.current - currentY;
            if (Math.abs(deltaY) < 3) return;
            if (!handleDirectionalInput(deltaY * wheelFactor * 1.6)) return;

            horizontalTouchYRef.current = currentY;
            e.preventDefault();
        };

        const onTouchEnd = () => {
            horizontalTouchYRef.current = null;
        };

        horizontalTargetProgressRef.current = 0;
        horizontalVisualProgressRef.current = 0;
        horizontalWarmupRef.current = 0;
        setLockedState(false);
        horizontalViewport.style.setProperty('--h3-horizontal-progress', '0');
        horizontalViewport.style.setProperty('--h3-horizontal-shift', '0vw');

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('touchcancel', onTouchEnd);

        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
            setLockedState(false);
        };
    }, []);

    useEffect(() => {
        horizontalVideoRefs.current.forEach((video, index) => {
            if (!video) return;
            if (index === activeHorizontalIndex) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, [activeHorizontalIndex]);

    return (
        <main className="h3-page">

            {/* ── HERO ──────────────────────────────────────────────── */}
            <section ref={heroSceneRef} className="h3-hero-scene">
                <div className="h3-hero-sticky">

                    {/* Background clipped independently so clouds can bleed below */}
                    <div className="h3-hero-bg-clip">
                        <div ref={heroBgRef} className="h3-hero-bg" />
                    </div>
                    <div className="h3-hero-vignette" />
                    <div className="h3-hero-grad-bottom" />

                    <div ref={heroContentRef} className="h3-hero-content">
                        <div className="container h3-hero-copy-shell">
                            <span className="h3-eyebrow-hero">Discover the World</span>
                            <h1 className="h3-hero-title">
                                <span className="h3-word-shell" style={{ '--wi': 0 } as React.CSSProperties}>
                                    <span className="h3-word">Step</span>
                                </span>
                                <span className="h3-word-shell h3-word-shell-gap" style={{ '--wi': 1 } as React.CSSProperties}>
                                    <span className="h3-word">outside</span>
                                </span>
                            </h1>
                            <p className="h3-hero-sub">
                                <span className="h3-sub-line" style={{ '--li': 0 } as React.CSSProperties}>
                                    Your greatest adventure is just one step away.
                                </span>
                                <span className="h3-sub-line" style={{ '--li': 1 } as React.CSSProperties}>
                                    We craft journeys that move you — body, mind, and soul.
                                </span>
                            </p>
                            <div className="h3-hero-actions">
                                <Link to="/auth" className="h3-btn-hero-primary">
                                    Explore Journeys <ArrowRight size={18} />
                                </Link>
                                <a href="#discover" className="h3-btn-hero-glass">
                                    Our Story
                                </a>
                            </div>
                        </div>
                    </div>

                    {/*
                      Cloud layers — two concerns kept separate:
                        • Wrapper div  → CSS entry animation (slide from left/right)
                        • img element  → JS scroll parallax (translateY at different speeds)
                    */}
                    <div className="h3-cloud-layer" aria-hidden="true">
                        {/* Back-centre — fades up first */}
                        <div className="h3-cloud-wrap h3-cloud-wrap-3">
                            <div className="h3-cloud-float h3-cloud-float-slow">
                                <img ref={cloud3Ref} src="/images/cloud-3.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                        {/* Left side */}
                        <div className="h3-cloud-wrap h3-cloud-wrap-1">
                            <div className="h3-cloud-float h3-cloud-float-mid">
                                <img ref={cloud1Ref} src="/images/cloud-1.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                        {/* Right side */}
                        <div className="h3-cloud-wrap h3-cloud-wrap-2">
                            <div className="h3-cloud-float h3-cloud-float-fast">
                                <img ref={cloud2Ref} src="/images/cloud-2.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                        {/* Extra lower-middle density */}
                        <div className="h3-cloud-wrap h3-cloud-wrap-4">
                            <div className="h3-cloud-float h3-cloud-float-mid">
                                <img ref={cloud4Ref} src="/images/cloud-1.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                        <div className="h3-cloud-wrap h3-cloud-wrap-5">
                            <div className="h3-cloud-float h3-cloud-float-slow">
                                <img ref={cloud5Ref} src="/images/cloud-2.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                        <div className="h3-cloud-wrap h3-cloud-wrap-6">
                            <div className="h3-cloud-float h3-cloud-float-fast">
                                <img ref={cloud6Ref} src="/images/cloud-3.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                        <div className="h3-cloud-wrap h3-cloud-wrap-7">
                            <div className="h3-cloud-float h3-cloud-float-mid">
                                <img ref={cloud7Ref} src="/images/cloud-1.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                        <div className="h3-cloud-wrap h3-cloud-wrap-8">
                            <div className="h3-cloud-float h3-cloud-float-slow">
                                <img ref={cloud8Ref} src="/images/cloud-3.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                        <div className="h3-cloud-wrap h3-cloud-wrap-9">
                            <div className="h3-cloud-float h3-cloud-float-mid">
                                <img ref={cloud9Ref} src="/images/cloud-2.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                        <div className="h3-cloud-wrap h3-cloud-wrap-10">
                            <div className="h3-cloud-float h3-cloud-float-fast">
                                <img ref={cloud10Ref} src="/images/cloud-3.png" alt="" className="h3-cloud" />
                            </div>
                        </div>
                    </div>

                    <div className="h3-scroll-hint">
                        <ChevronDown size={18} />
                        <span>Scroll to explore</span>
                    </div>
                </div>
            </section>

            {/* ── STATS + ABOUT ─────────────────────────────────────── */}
            <section id="discover" className="h3-section h3-discover-section">
                <div className="container">

                    <div className="h3-stats-row">
                        {stats.map((s, i) => (
                            <Reveal key={s.label} delay={i * 70} className="h3-stat-item">
                                <span className="h3-stat-value">{s.value}</span>
                                <span className="h3-stat-label">{s.label}</span>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal className="h3-about-grid" delay={60}>
                        <div className="h3-about-text">
                            <span className="h3-section-eyebrow">Our Story</span>
                            <h2>Born from a love<br />of wandering.</h2>
                            <p>
                                We started as a group of five friends who couldn't find a travel company that matched
                                our thirst for authentic, transformative experiences. So we built one.
                            </p>
                            <p>
                                Today, Vagabond is India's most trusted adventure travel platform — connecting
                                wanderers to the world's most extraordinary places. Every journey we craft is a
                                story waiting to be lived.
                            </p>
                            <Link to="/auth" className="h3-text-link">
                                Join our community <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="h3-about-visual">
                            <img src="/images/nature1.jpg" alt="North" />
                            <div className="h3-about-badge">
                                <Globe size={20} />
                                <span>200+ Destinations<br />across 6 continents</span>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── SERVICES ──────────────────────────────────────────── */}
            <section id="services" className="h3-section h3-services-section">
                <div className="container">
                    <Reveal className="h3-section-head">
                        <span className="h3-section-eyebrow">What We Offer</span>
                        <h2>Adventures crafted<br />for every soul.</h2>
                    </Reveal>

                    <div className="h3-services-grid">
                        {services.map((svc, i) => {
                            const Icon = svc.icon;
                            return (
                                <Reveal key={svc.title} delay={i * 85}>
                                    <article className="h3-service-card">
                                        {svc.tag && <span className="h3-service-badge">{svc.tag}</span>}
                                        <div className="h3-service-icon"><Icon size={20} /></div>
                                        <h3>{svc.title}</h3>
                                        <p>{svc.description}</p>
                                        <Link to="/auth" className="h3-text-link h3-text-link-sm">
                                            Learn more <ArrowRight size={14} />
                                        </Link>
                                    </article>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── DESTINATIONS ──────────────────────────────────────── */}
            <section ref={horizontalSceneRef} className="h3-horizontal-scene">
                <div
                    ref={horizontalViewportRef}
                    className="h3-horizontal-sticky"
                    style={{ '--h3-horizontal-slides': horizontalCategories.length } as React.CSSProperties}
                >
                    <div className="h3-horizontal-track">
                        {horizontalCategories.map((item, index) => (
                            <article
                                key={item.label}
                                ref={(el) => { horizontalPanelRefs.current[index] = el; }}
                                className={`h3-horizontal-panel ${index === activeHorizontalIndex ? 'is-active' : ''}`}
                                aria-hidden={index === activeHorizontalIndex ? undefined : true}
                            >
                                <video
                                    ref={(el) => { horizontalVideoRefs.current[index] = el; }}
                                    className="h3-horizontal-video"
                                    src={item.video}
                                    loop
                                    muted
                                    playsInline
                                    preload="auto"
                                />
                                <div className="h3-horizontal-overlay" />
                                <div className="h3-horizontal-panel-content">
                                    <div className="h3-horizontal-identity">
                                        <span className="h3-horizontal-kicker">{item.kicker}</span>
                                        <h2 className="h3-horizontal-title">{item.title}</h2>
                                        <p className="h3-horizontal-desc">{item.description}</p>
                                        <Link to="/auth" className="h3-btn-hero-primary h3-horizontal-cta">
                                            Explore {item.label} <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="h3-horizontal-content">
                        <div className="h3-horizontal-top-bar">
                            <div className="h3-horizontal-intro">
                                <span className="h3-section-eyebrow h3-horizontal-eyebrow">Curated Moods</span>
                                <p>Vertical scroll locks here. Keep scrolling to travel sideways through five cinematic worlds.</p>
                                <span className="h3-horizontal-hint">A short hold eases the section into motion.</span>
                            </div>
                            <div className="h3-horizontal-count">
                                <span>{String(activeHorizontalIndex + 1).padStart(2, '0')}</span>
                                <small>/{String(horizontalCategories.length).padStart(2, '0')}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="h3-section h3-dest-section">
                <div className="container">
                    <Reveal className="h3-section-head h3-section-head-row">
                        <div>
                            <span className="h3-section-eyebrow">Featured Destinations</span>
                            <h2>Popular right now.</h2>
                        </div>
                        <Link to="/auth" className="h3-text-link">
                            View all <ArrowRight size={16} />
                        </Link>
                    </Reveal>

                    <div className="h3-dest-grid">
                        {destinations.map((d, i) => (
                            <Reveal key={d.name} delay={i * 100} className="h3-dest-wrap">
                                <article className="h3-dest-card">
                                    <div className="h3-dest-img-wrap">
                                        <img src={d.image} alt={d.name} style={{ objectPosition: d.imgPos }} />
                                        <div className="h3-dest-img-overlay" />
                                        <span className="h3-dest-tag">{d.tag}</span>
                                    </div>
                                    <div className="h3-dest-body">
                                        <div className="h3-dest-loc">
                                            <MapPin size={13} /> {d.country}
                                        </div>
                                        <h3>{d.name}</h3>
                                        <p>{d.description}</p>
                                        <div className="h3-dest-footer">
                                            <span className="h3-dest-price">{d.price}</span>
                                            <Link to="/auth" className="h3-btn-pill">
                                                Book now <ArrowRight size={13} />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PARALLAX QUOTE STRIP ──────────────────────────────── */}
            <section className="h3-strip">
                <div ref={stripBgRef} className="h3-strip-bg" />
                <div className="h3-strip-overlay" />
                <Reveal className="h3-strip-content container">
                    <blockquote>
                        "The world is a book, and those who do not travel read only one page."
                    </blockquote>
                    <cite>— Saint Augustine</cite>
                    <Link to="/auth" className="h3-btn-ghost-white">
                        Start Your Chapter <ArrowRight size={16} />
                    </Link>
                </Reveal>
            </section>

            {/* ── TESTIMONIALS ──────────────────────────────────────── */}
            <section id="testimonials" className="h3-section h3-testimonials-section">
                <div className="container">
                    <Reveal className="h3-section-head">
                        <span className="h3-section-eyebrow">Traveler Stories</span>
                        <h2>What our wanderers say.</h2>
                    </Reveal>

                    <div className="h3-testimonials-grid">
                        {testimonials.map((t, i) => (
                            <Reveal key={t.name} delay={i * 100}>
                                <article className="h3-testimonial-card">
                                    <div className="h3-stars">
                                        {Array.from({ length: t.rating }).map((_, si) => (
                                            <Star key={si} size={13} fill="currentColor" />
                                        ))}
                                    </div>
                                    <p className="h3-testimonial-quote">"{t.text}"</p>
                                    <div className="h3-testimonial-author">
                                        <div className="h3-avatar">{t.avatar}</div>
                                        <div>
                                            <strong>{t.name}</strong>
                                            <span>{t.location}</span>
                                        </div>
                                    </div>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────── */}
            <section id="cta" className="h3-cta-section">
                <div ref={ctaBgRef} className="h3-cta-bg" />
                <div className="h3-cta-overlay" />
                <Reveal className="h3-cta-content container">
                    <span className="h3-section-eyebrow h3-eyebrow-muted">Begin Your Adventure</span>
                    <h2>Ready to step outside?</h2>
                    <p>
                        Join 15,000+ travelers who've discovered the world with Vagabond.
                        Your next extraordinary journey is waiting.
                    </p>
                    <div className="h3-cta-actions">
                        <Link to="/auth" className="h3-btn-cta-white">
                            Book Your Journey <ArrowRight size={18} />
                        </Link>
                        <Link to="/auth" className="h3-btn-hero-glass">
                            Join Membership
                        </Link>
                    </div>
                    <div className="h3-trust-row">
                        <div className="h3-trust-item"><Shield size={13} /><span>Secure Booking</span></div>
                        <div className="h3-trust-item"><Users size={13} /><span>15K+ Happy Travelers</span></div>
                        <div className="h3-trust-item"><Star size={13} fill="currentColor" /><span>4.9 / 5 Rating</span></div>
                    </div>
                </Reveal>
            </section>

        </main>
    );
};
