import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../lib/destinations';
import type { Profile } from '../lib/destinations';
import { useTheme } from '../hooks/useTheme';

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

    const isActive = (path: string) => location.pathname === path;
    const isDark = theme === 'dark';
    const homePath = user ? '/activities' : '/';
    const logoSrc = isDark ? '/logo/logo-white.png' : '/logo/logo.png';

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
                            <Link to="/tours" style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: isActive('/tours') ? 'var(--text-inverse)' : 'var(--text-main)',
                                backgroundColor: isActive('/tours') ? 'var(--primary)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}>Tours</Link>

                            <Link to="/activities" style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: isActive('/activities') ? 'var(--text-inverse)' : 'var(--text-main)',
                                backgroundColor: isActive('/activities') ? 'var(--primary)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}>Activities</Link>
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
                    <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: '4px' }}>
                        {showMenu ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {showMenu && (
                <div className="glass" style={{
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
                            <Link to="/tours" onClick={() => setShowMenu(false)} style={{
                                padding: '12px 16px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem'
                            }}>Explore Tours</Link>
                            <Link to="/activities" onClick={() => setShowMenu(false)} style={{
                                padding: '12px 16px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem'
                            }}>Explore Activities</Link>
                        </>
                    )}
                    {!user && (
                        <Link to="/auth" onClick={() => setShowMenu(false)} style={{
                            padding: '12px 16px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem'
                        }}>Join Membership</Link>
                    )}
                    {user && (
                        <button onClick={() => { signOut(); setShowMenu(false); }} style={{
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
                }
            `}</style>
        </nav>
    );
};
