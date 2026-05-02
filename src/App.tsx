import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home3 } from './pages/Home3';
import { DashboardHome } from './pages/DashboardHome';
import { RoleDashboard } from './pages/RoleDashboard';
import { Auth } from './pages/Auth';
import { DestinationDetail } from './pages/DestinationDetail';
import { Profile } from './pages/Profile';
import { AdminConsole } from './pages/AdminConsole';
import { ProviderStudio } from './pages/ProviderStudio';
import { ListingDetail } from './pages/ListingDetail';
import { UserProfile } from './pages/UserProfile';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { SupportChatbot } from './components/SupportChatbot';

const APP_HOME_PATH = '/';
const DASHBOARD_TOURS_PATH = '/?tab=tours';
const DASHBOARD_ACTIVITIES_PATH = '/?tab=activities';
const DASHBOARD_EVENTS_PATH = '/?tab=events';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const GuestOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={APP_HOME_PATH} replace />;
  }

  return <>{children}</>;
};

const HomeRoute: React.FC = () => {
  const { user, loading, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return null;
  }

  if (user) {
    return <DashboardHome />;
  }

  return <Home3 />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const ProviderRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isProvider } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || !isProvider) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const homePath = user ? APP_HOME_PATH : '/';
  const footerLogoSrc = theme === 'dark' ? '/logo/logo-white.png' : '/logo/logo.png';

  return (
    <Router>
      <div className="app">
        <AppNavbar />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/home2" element={<Navigate to="/" replace />} />
          <Route path="/home3" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<GuestOnlyRoute><Auth /></GuestOnlyRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/:role" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
          <Route path="/activities" element={<ProtectedRoute><Navigate to={DASHBOARD_ACTIVITIES_PATH} replace /></ProtectedRoute>} />
          <Route path="/tours" element={<ProtectedRoute><Navigate to={DASHBOARD_TOURS_PATH} replace /></ProtectedRoute>} />
          <Route path="/guides" element={<ProtectedRoute><Navigate to={DASHBOARD_EVENTS_PATH} replace /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Navigate to={DASHBOARD_EVENTS_PATH} replace /></ProtectedRoute>} />
          <Route path="/listings/:type/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
          <Route path="/destination/:id" element={<ProtectedRoute><DestinationDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminConsole /></AdminRoute>} />
          <Route path="/provider/studio" element={<ProviderRoute><ProviderStudio /></ProviderRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <AppFooter homePath={homePath} footerLogoSrc={footerLogoSrc} user={user} />
        <SupportChatbot />
      </div>
    </Router>
  );
}

const HIDE_ON_AUTH = ['/auth'];

const AppNavbar: React.FC = () => {
  const { pathname } = useLocation();
  if (HIDE_ON_AUTH.includes(pathname)) return null;
  return <Navbar />;
};

const AppFooter: React.FC<{ homePath: string; footerLogoSrc: string; user: unknown }> = ({ homePath, footerLogoSrc, user }) => {
  const { pathname } = useLocation();
  const isGuestLanding = !user && pathname === '/';
  if (!isGuestLanding) return null;

  return (
        <footer style={{ padding: '88px 0 40px', borderTop: '1px solid var(--border-light)', marginTop: '120px', background: 'var(--surface-main)' }}>
          <div className="container">
            <div
              className="app-footer-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))',
                gap: '40px',
                alignItems: 'start',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <Link to={homePath} aria-label="Vagabond home" style={{ display: 'inline-flex', width: 'fit-content' }}>
                  <img
                    src={footerLogoSrc}
                    alt="Vagabond"
                    style={{ height: '44px', width: 'auto', maxWidth: '220px', objectFit: 'contain' }}
                  />
                </Link>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '360px' }}>
                  Premium tours, activity bookings, and seamless travel planning for modern explorers who want clear systems and memorable journeys.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <span>15K+ Travelers</span>
                  <span>200+ Destinations</span>
                  <span>4.9 / 5 Rated</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-main)' }}>Explore</h4>
                <Link to={homePath} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
                <Link to={user ? DASHBOARD_TOURS_PATH : '/auth'} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Tours</Link>
                <Link to={user ? DASHBOARD_ACTIVITIES_PATH : '/auth'} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Activities</Link>
                <Link to={user ? DASHBOARD_EVENTS_PATH : '/auth'} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Events</Link>
                <Link to={user ? '/profile' : '/auth'} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Membership</Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-main)' }}>Company</h4>
                {user ? (
                  <>
                    <Link to="/dashboard" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
                    <Link to={DASHBOARD_TOURS_PATH} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Tour Collections</Link>
                    <Link to={DASHBOARD_ACTIVITIES_PATH} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Activity Catalog</Link>
                    <Link to={DASHBOARD_EVENTS_PATH} style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Events</Link>
                    <Link to="/profile" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Profile Center</Link>
                  </>
                ) : (
                  <>
                    <a href="#discover" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>About Us</a>
                    <a href="#services" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Services</a>
                    <a href="#testimonials" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Traveler Stories</a>
                    <a href="#cta" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Start Planning</a>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-main)' }}>Support</h4>
                <a href="mailto:support@vagabond.travel" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>support@vagabond.travel</a>
                <a href="tel:+911800000000" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>+91 1800 000 000</a>
                <a href="#" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</a>
                <a href="#" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</a>
              </div>
            </div>

            <div style={{ marginTop: '48px', paddingTop: '22px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', opacity: 0.72 }}>© 2026 Vagabond. Crafted for seamless journeys.</p>
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Instagram</a>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>X / Twitter</a>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>LinkedIn</a>
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 980px) {
              .app-footer-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 32px !important;
              }
            }

            @media (max-width: 640px) {
              .app-footer-grid {
                grid-template-columns: 1fr !important;
                gap: 28px !important;
              }
            }
          `}</style>
        </footer>
  );
};

export default App;
