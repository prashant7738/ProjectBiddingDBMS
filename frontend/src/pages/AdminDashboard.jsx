import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminAuctions, deleteAdminAuction, getAdminUsers, updateAdminUserBalance, getMediaUrl } from '../api/auth';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('auctions');
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditBalanceModal, setShowEditBalanceModal] = useState(false);
  const [newBalance, setNewBalance] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    live: 0,
    upcoming: 0,
    ended: 0
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    if (activeTab === 'auctions') {
      loadAuctions();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [navigate, activeTab]);

  const normalizeAuction = (raw) => {
    const startTime = raw?.start_time ? new Date(raw.start_time) : new Date();
    const endTime = raw?.end_time ? new Date(raw.end_time) : new Date(Date.now() + 3600000);
    const now = new Date();
    
    const isLive = (raw?.is_live ?? raw?.isLive) !== undefined 
      ? (raw?.is_live ?? raw?.isLive) 
      : (now >= startTime && now <= endTime && (raw?.is_active ?? true));
    
    const isUpcoming = startTime > now;
    const isEnded = endTime < now;
    
    return {
      id: raw?.id ?? raw?.auction_id,
      title: raw?.title ?? 'Untitled Auction',
      sellerName: raw?.seller_name ?? raw?.sellerName ?? raw?.seller?.name ?? 'Unknown',
      sellerId: raw?.seller_id ?? raw?.seller?.id ?? 'N/A',
      image: getMediaUrl(raw?.image_url ?? raw?.image ?? ''),
      sellerEmail: raw?.seller_email ?? raw?.sellerEmail ?? 'N/A',
      sellerBalance: raw?.seller_balance ?? raw?.sellerBalance ?? null,
      category: raw?.category_name ?? raw?.category ?? 'general',
      currentBid: Number(raw?.current_highest_bid ?? raw?.current_bid ?? raw?.starting_price ?? 0),
      startingPrice: Number(raw?.starting_price ?? 0),
      isLive,
      isUpcoming,
      isEnded,
      startTime,
      endTime,
      description: raw?.description ?? '',
      bidCount: raw?.bid_count ?? 0,
      winnerName: raw?.winner_name ?? raw?.winner?.name ?? 'N/A',
      winnerId: raw?.winner_id ?? raw?.winner?.id ?? null,
      winnerEmail: raw?.winner_email ?? raw?.winnerEmail ?? null,
      winnerBalance: raw?.winner_balance ?? raw?.winnerBalance ?? null
    };
  };

  const loadAuctions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminAuctions();
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
          ? res.data.results
          : [];
      
      const normalized = list.map(normalizeAuction);
      setAuctions(normalized);
      setFilteredAuctions(normalized);
      
      // Calculate stats
      setStats({
        total: normalized.length,
        live: normalized.filter(a => a.isLive).length,
        upcoming: normalized.filter(a => a.isUpcoming).length,
        ended: normalized.filter(a => a.isEnded).length
      });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }
      setError(err.response?.data?.error || 'Failed to load auctions.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminUsers();
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
          ? res.data.results
          : [];
      
      setUsers(list);
      setFilteredUsers(list);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }
      setError(err.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !newBalance) return;
    
    try {
      const res = await updateAdminUserBalance(selectedUser.id, parseFloat(newBalance));
      const updatedUser = res.data;
      
      // Update users list
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      setShowEditBalanceModal(false);
      setSelectedUser(null);
      setNewBalance('');
    } catch (err) {
      console.error('Error updating balance:', err);
      alert(err.response?.data?.error || 'Failed to update balance');
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      let filtered = users;
      if (searchQuery) {
        filtered = filtered.filter(u =>
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users, activeTab]);

  useEffect(() => {
    let filtered = auctions;

    // Filter by status
    if (filterStatus === 'live') {
      filtered = filtered.filter(a => a.isLive);
    } else if (filterStatus === 'upcoming') {
      filtered = filtered.filter(a => a.isUpcoming);
    } else if (filterStatus === 'ended') {
      filtered = filtered.filter(a => a.isEnded);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAuctions(filtered);
  }, [filterStatus, searchQuery, auctions]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleDeleteAuction = async (auctionId) => {
    try {
      await deleteAdminAuction(auctionId);
      const next = auctions.filter(a => a.id !== auctionId);
      setAuctions(next);
      setStats({
        total: next.length,
        live: next.filter(a => a.isLive).length,
        upcoming: next.filter(a => a.isUpcoming).length,
        ended: next.filter(a => a.isEnded).length
      });
      setShowDeleteModal(false);
      setSelectedAuction(null);
    } catch (err) {
      console.error('Error deleting auction:', err);
      alert('Failed to delete auction');
    }
  };

  const getStatusBadge = (auction) => {
    if (auction.isLive) {
      return (
        <span className="status-badge live px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span>LIVE</span>
        </span>
      );
    } else if (auction.isUpcoming) {
      return (
        <span className="status-badge upcoming px-3 py-1.5 rounded-full text-xs font-bold">
          UPCOMING
        </span>
      );
    } else {
      return (
        <span className="status-badge ended px-3 py-1.5 rounded-full text-xs font-bold">
          ENDED
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
          50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.5); }
        }
        .stat-card {
          animation: fadeIn 0.6s ease-out;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(168, 85, 247, 0.3);
        }
        .table-row {
          transition: all 0.3s ease;
        }
        .table-row:hover {
          background: rgba(168, 85, 247, 0.1);
          transform: scale(1.01);
        }
        .status-badge.live {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }
        .status-badge.upcoming {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .status-badge.ended {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
        }
        .action-btn {
          transition: all 0.3s ease;
        }
        .action-btn:hover {
          transform: scale(1.1);
        }
        .modal-overlay {
          animation: fadeIn 0.3s ease-out;
        }
        .modal-content {
          animation: fadeIn 0.4s ease-out;
        }
        .delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          transition: all 0.3s ease;
        }
        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.4);
        }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      <div className="grid-bg absolute inset-0 opacity-30"></div>

      {/* Header */}
      <header className="relative z-10 bg-slate-800/90 backdrop-blur-xl border-b border-purple-500/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
                <p className="text-sm text-purple-300 font-semibold">Auction Management System</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8 bg-slate-800/90 backdrop-blur-xl rounded-2xl p-2 border border-purple-500/30 shadow-xl inline-flex">
          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'auctions'
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg'
                : 'text-purple-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Auctions
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg'
                : 'text-purple-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </button>
        </div>

        {/* Auctions Section */}
        {activeTab === 'auctions' && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-bold uppercase tracking-wide">Total Auctions</p>
                <p className="text-4xl font-black text-white mt-2">{stats.total}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 shadow-xl" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-bold uppercase tracking-wide">Live Now</p>
                <p className="text-4xl font-black text-white mt-2">{stats.live}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 shadow-xl" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-bold uppercase tracking-wide">Upcoming</p>
                <p className="text-4xl font-black text-white mt-2">{stats.upcoming}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-500/30 shadow-xl" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-bold uppercase tracking-wide">Ended</p>
                <p className="text-4xl font-black text-white mt-2">{stats.ended}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-purple-500/30 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or seller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pl-12 bg-slate-700/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-5 py-3 bg-slate-700/50 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="all">All Auctions</option>
                <option value="live">Live Only</option>
                <option value="upcoming">Upcoming Only</option>
                <option value="ended">Ended Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Auctions Table */}
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-purple-500/30 bg-slate-700/50">
            <h2 className="text-xl font-black text-white">Auction Management</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-purple-300 font-semibold">Loading auctions…</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 font-semibold">{error}</p>
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-purple-300 font-semibold">No auctions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Auction</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Current Bid</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Bids</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/20">
                  {filteredAuctions.map((auction) => (
                    <tr key={auction.id} className="table-row">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={auction.image}
                            alt={auction.title}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-purple-500/30"
                          />
                          <div>
                            <p className="text-white font-bold">{auction.title}</p>
                            <p className="text-purple-300 text-sm">{auction.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">{auction.sellerName}</p>
                        <p className="text-purple-300 text-sm">ID: {auction.sellerId}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(auction)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-bold text-lg">${auction.currentBid.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">{auction.bidCount}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAuction(auction);
                              setShowDetailsModal(true);
                            }}
                            className="action-btn p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAuction(auction);
                              setShowDeleteModal(true);
                            }}
                            className="action-btn p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                            title="Delete Auction"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}

        {/* Users Section */}
        {activeTab === 'users' && (
          <>
            {/* Search Bar */}
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-purple-500/30 shadow-xl">
              <label className="block text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">Search Users</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pl-12 bg-slate-700/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/30 bg-slate-700/50">
                <h2 className="text-xl font-black text-white">User Management</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-purple-300 font-semibold">Loading users…</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 font-semibold">{error}</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-purple-300 font-semibold">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Balance</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-purple-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/20">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="table-row">
                          <td className="px-6 py-4">
                            <p className="text-white font-semibold">#{user.id}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white font-bold">{user.name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-purple-300">{user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-green-400 font-bold text-lg">₹{Number(user.balance || 0).toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setNewBalance(user.balance?.toString() || '0');
                                setShowEditBalanceModal(true);
                              }}
                              className="action-btn p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                              title="Edit Balance"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAuction && (
        <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-content bg-slate-800 rounded-2xl p-8 max-w-md w-full border-2 border-red-500/30 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Delete Auction</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "<span className="font-bold text-white">{selectedAuction.title}</span>"? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedAuction(null);
                  }}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAuction(selectedAuction.id)}
                  className="delete-btn flex-1 px-6 py-3 text-white font-bold rounded-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAuction && (
        <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-content bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-purple-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-black text-white">Auction Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAuction(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <img
                src={selectedAuction.image}
                alt={selectedAuction.title}
                className="w-full h-64 object-cover rounded-xl border-2 border-purple-500/30"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-bold mb-1">Title</p>
                  <p className="text-white font-semibold">{selectedAuction.title}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-bold mb-1">Category</p>
                  <p className="text-white font-semibold">{selectedAuction.category}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-bold mb-1">Seller</p>
                  <p className="text-white font-semibold">{selectedAuction.sellerName}</p>
                  <p className="text-purple-300 text-xs">ID: {selectedAuction.sellerId}</p>
                  <p className="text-purple-300 text-xs">Email: {selectedAuction.sellerEmail}</p>
                  {selectedAuction.sellerBalance !== null && (
                    <p className="text-purple-300 text-xs">Balance: ${Number(selectedAuction.sellerBalance).toLocaleString()}</p>
                  )}
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-bold mb-1">Current Bid</p>
                  <p className="text-white font-bold text-xl">${selectedAuction.currentBid.toLocaleString()}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-bold mb-1">Starting Price</p>
                  <p className="text-white font-semibold">${selectedAuction.startingPrice.toLocaleString()}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-bold mb-1">Total Bids</p>
                  <p className="text-white font-semibold">{selectedAuction.bidCount}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-bold mb-1">Start Time</p>
                  <p className="text-white font-semibold text-sm">{selectedAuction.startTime.toLocaleString()}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm font-bold mb-1">End Time</p>
                  <p className="text-white font-semibold text-sm">{selectedAuction.endTime.toLocaleString()}</p>
                </div>
              </div>

              {selectedAuction.isEnded && selectedAuction.winnerId && (
                <div className="bg-green-900/30 p-4 rounded-xl border-2 border-green-500/50">
                  <p className="text-green-300 text-sm font-bold mb-1">Winner</p>
                  <p className="text-white font-semibold">{selectedAuction.winnerName}</p>
                  <p className="text-green-300 text-xs">ID: {selectedAuction.winnerId}</p>
                  {selectedAuction.winnerEmail && (
                    <p className="text-green-300 text-xs">Email: {selectedAuction.winnerEmail}</p>
                  )}
                  {selectedAuction.winnerBalance !== null && (
                    <p className="text-green-300 text-xs">Balance: ${Number(selectedAuction.winnerBalance).toLocaleString()}</p>
                  )}
                </div>
              )}

              <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                <p className="text-purple-300 text-sm font-bold mb-2">Description</p>
                <p className="text-white">{selectedAuction.description || 'No description provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {showEditBalanceModal && selectedUser && (
        <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-content bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/30 shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-white">Edit User Balance</h3>
                <button
                  onClick={() => {
                    setShowEditBalanceModal(false);
                    setSelectedUser(null);
                    setNewBalance('');
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm mb-1">User</p>
                  <p className="text-white font-bold">{selectedUser.name}</p>
                  <p className="text-purple-300 text-sm">{selectedUser.email}</p>
                </div>

                <div className="bg-slate-700/50 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-300 text-sm mb-1">Current Balance</p>
                  <p className="text-green-400 font-bold text-2xl">₹{Number(selectedUser.balance || 0).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-2">New Balance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter new balance"
                  />
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setShowEditBalanceModal(false);
                      setSelectedUser(null);
                      setNewBalance('');
                    }}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateBalance}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold rounded-xl transition-all shadow-lg"
                  >
                    Update Balance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}