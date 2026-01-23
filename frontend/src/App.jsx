import { useContext, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import NavigationTabs from './components/NavigationTabs';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import UpcomingAuctions from './pages/UpcomingAuctions';
import PriceResults from './pages/PriceResult';
import Register from './pages/Register';
import Login from './pages/Login';

import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './context/AuthContext';
import AuctionPage from './components/AuctionPage';
import WonItems from './pages/WonItems';
import MyItems from './pages/MyItems'


function App() {
  const {user,setUser,loading} = useContext(AuthContext)
  if (loading) {
    console.log('loading')
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      {user && <Header />}
      {user && <NavigationTabs />}

      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/upcoming" element={<UpcomingAuctions />} />
        <Route path="/price-results" element={<PriceResults />} />
        <Route path="/auctionPage/:id" element={<AuctionPage />} />
        <Route path="/wonitems" element={<WonItems />} />
        <Route path="/myitems" element={<MyItems />} />

        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>

      {user && <Footer />}
    </>
  );
}

export default App;
