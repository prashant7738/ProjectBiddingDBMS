import { Routes, Route } from 'react-router-dom';

import NavigationTabs from './components/NavigationTabs';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import UpcomingAuctions from './pages/UpcomingAuctions';
import PriceResults from './pages/PriceResult';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreateAuction from './pages/CreateAuction';

import PrivateRoute from './components/PrivateRoute';
import AuctionPage from './components/AuctionPage';
import WonItems from './pages/WonItems';
import MyItems from './pages/MyItems'


function App() {
  return (
    <>
   <Header />
   <NavigationTabs/>

      <Routes>
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
          path="/create-auction"
          element={
            <PrivateRoute>
              <CreateAuction />
            </PrivateRoute>
          }
        />

        {/* Public Routes - Not wrapped with PrivateRoute */}
        <Route path="/upcoming" element={<UpcomingAuctions />} />
        <Route path="/price-results" element={<PriceResults />} />
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
    <Footer />
    </>
  );
}

export default App;
