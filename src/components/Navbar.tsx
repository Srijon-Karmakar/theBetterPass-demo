import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../lib/destinations';
import type { Profile } from '../lib/destinations';
import { useTheme } from '../hooks/useTheme';

type DashboardTab = 'home' | 'tours' | 'activities' | 'events';

export const Navbar: React.FC = () => {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (user) {
            getProfile(user.id).then(setProfile);
        }
    }, [user]);

    const isDark = theme === 'dark';
    const homePath = user ? '/dashboard' : '/';
    const logoSrc = isDark ? '/logo/logo-white.png' : '/logo/logo.png';
    const activeDashboardTab: DashboardTab = (() => {
        if (location.pathname !== '/dashboard') return 'home';
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab === 'tours' || tab === 'activities' || tab === 'events') return tab;
        return 'home';
    })();
    const dashboardLinks: Array<{ key: DashboardTab; label: string; to: string }> = [
        { key: 'home', label: 'Home', to: '/dashboard' },
        { key: 'tours', label: 'Tours', to: '/dashboard?tab=tours' },
        { key: 'activities', label: 'Activities', to: '/dashboard?tab=activities' },
        { key: 'events', label: 'Events', to: '/dashboard?tab=events' },
    ];

    return (
        <nav className="glass glass-nav animate-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 24px' }}>
            <div
                className="flex items-center px-4 nav-desktop"
                style={{ width: '100%', justifyContent: 'space-between', gap: '20px' }}
            >
                <Link
                    to={homePath}
                    aria-label="Vagabond home"
                    className="nav-logo-link"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        textDecoration: 'none'
                    }}
                >
                    <img src={logoSrc} alt="Vagabond" className="nav-logo-image" />
                </Link>

                <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
                    {user && (
                        <>
                            {dashboardLinks.map((item) => {
                                const isActive = location.pathname === '/dashboard' && activeDashboardTab === item.key;

                                return (
                                    <Link key={item.key} to={item.to} style={{
                                        padding: '8px 16px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        color: isActive ? 'var(--text-inverse)' : 'var(--text-main)',
                                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s'
                                    }}>{item.label}</Link>
                                );
                            })}
                        </>
                    )}

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-2 ml-4">
                            <Link to="/profile" style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '1px solid var(--border-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={profile?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                                    alt="U"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Link>
                            <button onClick={() => signOut()} style={{ padding: '8px', background: 'none', border: 'none', color: 'var(--danger-text)', cursor: 'pointer' }}>
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/auth" style={{
                            padding: '8px 20px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            textDecoration: 'none'
                        }}>Join</Link>
                    )}
                </div>
            </div>

            {/* Mobile Actions */}
            <div className="nav-mobile items-center gap-2" style={{ display: 'none', width: '100%', justifyContent: 'space-between' }}>
                <Link
                    to={homePath}
                    aria-label="Vagabond home"
                    className="nav-logo-link"
                    style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                >
                    <img src={logoSrc} alt="Vagabond" className="nav-logo-image nav-logo-image-mobile" />
                </Link>
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    {user && (
                        <Link to="/profile" style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                            <img
                                src={profile?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                                alt="U"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowMenu(!showMenu)}
                        className="nav-mobile-hamburger"
                        aria-label={showMenu ? 'Close menu' : 'Open menu'}
                    >
                        {showMenu ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
                    {showMenu && (
                <div className="glass nav-mobile-dropdown" style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    left: 0,
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: 'var(--shadow-card)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {user && (
                        <>
                            {dashboardLinks.map((item) => (
                                <Link key={item.key} to={item.to} className="nav-mobile-menu-link" onClick={() => setShowMenu(false)} style={{
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-md)',
                                    textDecoration: 'none',
                                    color: 'var(--text-main)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>{item.label}</Link>
                            ))}
                        </>
                    )}
                    {!user && (
                        <Link to="/auth" className="nav-mobile-menu-link nav-mobile-menu-link-accent" onClick={() => setShowMenu(false)} style={{
                            padding: '12px 16px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem'
                        }}>Join Membership</Link>
                    )}
                    {user && (
                        <button className="nav-mobile-menu-button" onClick={() => { signOut(); setShowMenu(false); }} style={{
                            padding: '12px 16px', borderRadius: 'var(--radius-md)', textAlign: 'left', border: 'none', background: 'none', color: 'var(--danger-text)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                        }}>Sign Out</button>
                    )}
                </div>
            )}

            <style>{`
                .nav-logo-image {
                    display: block;
                    width: auto;
                    height: 40px;
                    max-width: 188px;
                    object-fit: contain;
                }

                .nav-logo-image-mobile {
                    height: 34px;
                    max-width: 156px;
                }

                .nav-mobile-hamburger {
                    align-items: center;
                    background:
                        linear-gradient(135deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.08));
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    border-radius: 999px;
                    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14);
                    color: var(--primary);
                    cursor: pointer;
                    display: inline-flex;
                    height: 38px;
                    justify-content: center;
                    padding: 0;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
                    width: 38px;
                    backdrop-filter: blur(18px) saturate(170%);
                    -webkit-backdrop-filter: blur(18px) saturate(170%);
                }

                .nav-mobile-hamburger:hover {
                    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
                    transform: translateY(-1px);
                }

                .nav-mobile-dropdown {
                    background:
                        linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.12)),
                        var(--glass-bg) !important;
                    border: 1px solid rgba(255, 255, 255, 0.22) !important;
                    box-shadow:
                        0 18px 46px rgba(15, 23, 42, 0.18),
                        inset 0 1px 0 rgba(255, 255, 255, 0.28) !important;
                    backdrop-filter: blur(22px) saturate(190%) !important;
                    -webkit-backdrop-filter: blur(22px) saturate(190%) !important;
                    overflow: hidden;
                }

                .nav-mobile-dropdown::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.16), transparent 42%, rgba(255, 255, 255, 0.08));
                    pointer-events: none;
                }

                .nav-mobile-menu-link,
                .nav-mobile-menu-button {
                    position: relative;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid transparent;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
                }

                .nav-mobile-menu-link:hover,
                .nav-mobile-menu-button:hover {
                    background: rgba(255, 255, 255, 0.16);
                    border-color: rgba(255, 255, 255, 0.22);
                    transform: translateY(-1px);
                }

                .nav-mobile-menu-link-accent {
                    color: var(--accent) !important;
                }

                @media (max-width: 768px) {
                    .nav-desktop { display: none !important; }
                    .nav-mobile { display: flex !important; }
                    .glass-nav { 
                        min-width: 300px !important; 
                        padding: 8px 16px !important;
                    }

                    .nav-logo-link {
                        flex-shrink: 1;
                        min-width: 0;
                    }

                    .nav-mobile-dropdown {
                        left: 8px !important;
                        right: 8px !important;
                    }
                }
            `}</style>
        </nav>
    );
};
