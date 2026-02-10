import { Routes, Route, useLocation } from 'react-router-dom';

import NavigationTabs from './components/NavigationTabs';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import AllAuctions from './pages/AllAuctions';
import UpcomingAuctions from './pages/UpcomingAuctions';
import EndedAuctions from './pages/EndedAuctions';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreateAuction from './pages/CreateAuction';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AuctionPage from './components/AuctionPage';
import WonItems from './pages/WonItems';
import MyItems from './pages/MyItems'
import Results from './pages/Results';
import PriceResults from './pages/PriceResults';

function App() {
  const location = useLocation();
  
  // Check if current route is admin or login route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register', '/admin/login'].includes(location.pathname);
  const showHeaderAndNav = !isAdminRoute && !isAuthRoute;

  return (
    <>
      {showHeaderAndNav && <Header />}
      {showHeaderAndNav && <NavigationTabs />}

      <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          
          {/* Protected Routes - Wrapped with PrivateRoute */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/"
            element={
                <Home />
            }
          />

          <Route
            path="/all-auctions"
            element={
                <AllAuctions />
            }
          />

          <Route
            path="/upcoming"
            element={
                <UpcomingAuctions />
            }
          />

          <Route
            path="/wonitems"
            element={
              <PrivateRoute>
                <WonItems />
              </PrivateRoute>
            }
          />

          <Route
            path="/myitems"
            element={
              <PrivateRoute>
                <MyItems />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-bids"
            element={
              <PrivateRoute>
                <MyItems />
              </PrivateRoute>
            }
          />

          <Route
            path="/create-auction"
            element={
              <PrivateRoute>
                <CreateAuction />
              </PrivateRoute>
            }
          />

          {/* Public Routes - Not wrapped with PrivateRoute */}
          <Route path='/results' element={<PriceResults/>}/>
          
          <Route path='/auctionPage/:id' element={<AuctionPage/>} />

          {/* Auth pages */}
          <Route
            path="/login"
            element={<Login/>}
          />
          <Route
            path="/register"
            element={<Register/>}
          />
      </Routes>

      {/* Footer only if logged in */}
      {showHeaderAndNav && <Footer />}
    </>
  );
}

export default App;
