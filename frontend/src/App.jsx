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
import { useEffect } from 'react';
import { getToken } from './utils/auth';
import AuctionPage from './components/AuctionPage';
import WonItems from './pages/WonItems';
import MyItems from './pages/MyItems'


function App() {
  const {setTokenState,tokenState} = useContext(AuthContext)

  return (
    <>
   <Header />

      <Routes>
        {/* Protected Home */}
        <Route
          path="/"
          element={
            
              <Home />
            
          }
        />

        {/* Public pages */}
        <Route path="/upcoming" element={<UpcomingAuctions />} />
        <Route path="/price-results" element={<PriceResults />} />
        <Route path='/auctionPage/:id' element={<AuctionPage/>}></Route>
        <Route path='/wonitems' element={<WonItems/>}/>
        <Route path='/myitems' element={<MyItems/>}/>
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
