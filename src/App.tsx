import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home3 } from './pages/Home3';
import { DashboardHome } from './pages/DashboardHome';
import { Auth } from './pages/Auth';
import { DestinationDetail } from './pages/DestinationDetail';
import { Profile } from './pages/Profile';
import { AdminConsole } from './pages/AdminConsole';
import { ProviderStudio } from './pages/ProviderStudio';
import { ListingDetail } from './pages/ListingDetail';
import { UserProfile } from './pages/UserProfile';
import { Messages } from './pages/Messages';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { getRoleLabel, getVerificationLabel, isProviderRole } from './lib/platform';

const APP_HOME_PATH = '/dashboard';
const DASHBOARD_TOURS_PATH = '/dashboard?tab=tours';
const DASHBOARD_ACTIVITIES_PATH = '/dashboard?tab=activities';
const DASHBOARD_EVENTS_PATH = '/dashboard?tab=events';

const ProviderPendingView: React.FC<{ roleLabel: string; verificationLabel: string; onSignOut: () => Promise<void> }> = ({ roleLabel, verificationLabel, onSignOut }) => (
  <main className="animate-fade" style={{ minHeight: '100vh', padding: '140px 16px 32px', background: 'var(--bg-main)' }}>
    <div style={{ maxWidth: 640, margin: '0 auto', background: 'var(--surface-main)', border: '1px solid var(--border-light)', borderRadius: 20, boxShadow: 'var(--shadow-card)', padding: '24px 20px' }}>
      <span style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(245, 158, 11, 0.12)', color: '#b45309', marginBottom: 12 }}>
        Account Review
      </span>
      <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', lineHeight: 1.15 }}>Provider account pending approval</h1>
      <p style={{ margin: '12px 0 0', color: 'var(--text-muted)', lineHeight: 1.7 }}>
        Your {roleLabel} account is currently under admin verification. Marketplace content and posting features unlock after approval.
      </p>
      <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
        <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: '10px 12px', background: 'var(--bg-main)' }}>
          <strong style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</strong>
          <span style={{ fontWeight: 700 }}>{verificationLabel}</span>
        </div>
      </div>
      <p style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        You can sign out and back in later. This screen will automatically unlock once approved.
      </p>
      <button
        type="button"
        onClick={() => { void onSignOut(); }}
        className="btn btn-soft"
        style={{ marginTop: 14, borderRadius: '999px', padding: '10px 16px' }}
      >
        Sign Out
      </button>
    </div>
  </main>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, profile, profileLoading, roleLabel, verificationLabel, signOut } = useAuth();

  if (loading || profileLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const authRole = typeof user?.user_metadata?.role === 'string' ? user.user_metadata.role : null;
  const isProviderIdentity = isProviderRole(profile?.role) || isProviderRole(authRole);

  if (isProviderIdentity && profile?.verification_status !== 'approved') {
    const pendingRoleLabel = profile?.role ? roleLabel : getRoleLabel(authRole);
    const pendingVerificationLabel = profile?.verification_status
      ? verificationLabel
      : getVerificationLabel('pending');
    return <ProviderPendingView roleLabel={pendingRoleLabel} verificationLabel={pendingVerificationLabel} onSignOut={signOut} />;
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
        <Navbar />
        <Routes>
          <Route path="/" element={<GuestOnlyRoute><Home3 /></GuestOnlyRoute>} />
          <Route path="/home2" element={<Navigate to="/" replace />} />
          <Route path="/home3" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<GuestOnlyRoute><Auth /></GuestOnlyRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/activities" element={<ProtectedRoute><Navigate to={DASHBOARD_ACTIVITIES_PATH} replace /></ProtectedRoute>} />
          <Route path="/tours" element={<ProtectedRoute><Navigate to={DASHBOARD_TOURS_PATH} replace /></ProtectedRoute>} />
          <Route path="/guides" element={<ProtectedRoute><Navigate to={DASHBOARD_EVENTS_PATH} replace /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Navigate to={DASHBOARD_EVENTS_PATH} replace /></ProtectedRoute>} />
          <Route path="/listings/:type/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
          <Route path="/destination/:id" element={<ProtectedRoute><DestinationDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminConsole /></AdminRoute>} />
          <Route path="/provider/studio" element={<ProviderRoute><ProviderStudio /></ProviderRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <AppFooter homePath={homePath} footerLogoSrc={footerLogoSrc} user={user} />
      </div>
    </Router>
  );
}

const HIDE_FOOTER_PATHS = ['/auth'];

const AppFooter: React.FC<{ homePath: string; footerLogoSrc: string; user: unknown }> = ({ homePath, footerLogoSrc, user }) => {
  const { pathname } = useLocation();
  if (HIDE_FOOTER_PATHS.includes(pathname)) return null;

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
