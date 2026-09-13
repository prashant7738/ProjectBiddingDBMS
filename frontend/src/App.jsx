import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

import { SiteHeader } from './components/layout/SiteHeader';
import { SiteFooter } from './components/layout/SiteFooter';
import { RequireAdmin, RequireAuth } from './components/route/Guards';
import { pageTransition } from './lib/motion';

import Home from './pages/Home';
import Discover from './pages/Discover';
import LotDetail from './pages/LotDetail';
import Sell from './pages/Sell';
import Account from './pages/Account';
import Results from './pages/Results';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminSignIn from './pages/AdminSignIn';
import AdminConsole from './pages/AdminConsole';
import NotFound from './pages/NotFound';

// Older links (and the notification payloads) still point at these paths.
const LEGACY_REDIRECTS = {
  '/profile': '/dashboard',
  '/myitems': '/dashboard?tab=bids',
  '/my-bids': '/dashboard?tab=bids',
  '/wonitems': '/dashboard?tab=won',
  '/my-auctions': '/dashboard?tab=selling',
  '/discover': '/all-auctions',
  '/sell': '/create-auction',
  '/account': '/dashboard',
};

// Auth and the admin console own the whole viewport — no site chrome.
const isBareRoute = (pathname) =>
  pathname.startsWith('/admin') || ['/login', '/register'].includes(pathname);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
};

function App() {
  const location = useLocation();
  const bare = isBareRoute(location.pathname);

  return (
    <>
      <ScrollToTop />
      {!bare && <SiteHeader />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.main key={location.pathname} {...pageTransition}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/all-auctions" element={<Discover />} />
            <Route path="/results" element={<Results />} />
            <Route path="/auctionPage/:id" element={<LotDetail />} />

            <Route
              path="/create-auction"
              element={<RequireAuth><Sell /></RequireAuth>}
            />
            <Route
              path="/dashboard"
              element={<RequireAuth><Account /></RequireAuth>}
            />

            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />

            <Route path="/admin/login" element={<AdminSignIn />} />
            <Route
              path="/admin/dashboard"
              element={<RequireAdmin><AdminConsole /></RequireAdmin>}
            />

            {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
              <Route key={from} path={from} element={<Navigate to={to} replace />} />
            ))}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      {!bare && <SiteFooter />}
    </>
  );
}

export default App;
