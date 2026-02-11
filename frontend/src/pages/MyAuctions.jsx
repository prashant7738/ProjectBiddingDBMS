import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { myAuctions, deleteMyAuction, updateMyAuction, getRegisteredUsers, getMediaUrl } from '../api/auth';
import { CATEGORIES } from './AllAuctions';

export default function MyAuctions() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category_id: '',
    starting_price: '',
    end_time: ''
  });

  useEffect(() => {
    const loadAuctions = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError('');
      try {
        const res = await myAuctions(user.id);
        const list = Array.isArray(res.data) ? res.data : [];
        setAuctions(list);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load auctions.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadAuctions();
    }
  }, [user]);

  const handleDelete = async () => {
    if (!selectedAuction) return;
    
    try {
      await deleteMyAuction(user.id, selectedAuction.id);
      setAuctions(auctions.filter(a => a.id !== selectedAuction.id));
      setShowDeleteModal(false);
      setSelectedAuction(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete auction');
    }
  };

  const handleEdit = (auction) => {
    setSelectedAuction(auction);
    setEditForm({
      title: auction.title || '',
      description: auction.description || '',
      category_id: auction.category_id || '',
      starting_price: auction.starting_price || '',
      end_time: auction.end_time ? new Date(auction.end_time).toISOString().slice(0, 16) : ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedAuction) return;
    
    try {
      const updateData = {};
      if (editForm.title !== selectedAuction.title) updateData.title = editForm.title;
      if (editForm.description !== selectedAuction.description) updateData.description = editForm.description;
      if (editForm.category_id !== selectedAuction.category_id) updateData.category_id = parseInt(editForm.category_id);
      if (editForm.starting_price !== selectedAuction.starting_price) updateData.starting_price = parseFloat(editForm.starting_price);
      if (editForm.end_time) {
        const newEndTime = new Date(editForm.end_time).toISOString();
        const oldEndTime = new Date(selectedAuction.end_time).toISOString();
        if (newEndTime !== oldEndTime) updateData.end_time = newEndTime;
      }
      
      const res = await updateMyAuction(user.id, selectedAuction.id, updateData);
      const updatedAuction = res.data;
      
      setAuctions(auctions.map(a => a.id === updatedAuction.id ? updatedAuction : a));
      setShowEditModal(false);
      setSelectedAuction(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update auction');
    }
  };

  const handleViewUsers = async (auction) => {
    setSelectedAuction(auction);
    try {
      const res = await getRegisteredUsers(auction.id);
      setRegisteredUsers(Array.isArray(res.data) ? res.data : []);
      setShowUsersModal(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load registered users');
    }
  };

  const getStatusBadge = (auction) => {
    const now = new Date();
    const startTime = new Date(auction.start_time);
    const endTime = new Date(auction.end_time);
    
    if (now < startTime) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">UPCOMING</span>;
    } else if (now >= startTime && now <= endTime && auction.is_active) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">LIVE</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">ENDED</span>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your auctions…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-red-700 text-center">
          <p className="text-xl font-bold">Please log in to view your auctions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            My Auctions
          </h1>
          <p className="text-gray-600 mt-2 font-semibold">Manage your auction listings</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 px-5 py-4">
            {error}
          </div>
        )}

        {auctions.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-xl text-gray-600 font-semibold">You haven't created any auctions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div key={auction.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-all">
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100">
                  {auction.image_url ? (
                    <img
                      src={getMediaUrl(auction.image_url)}
                      alt={auction.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-20 h-20 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(auction)}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{auction.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{auction.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-semibold text-gray-900">{CATEGORIES[auction.category_id] || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Starting Price</p>
                      <p className="font-bold text-purple-600">₹{Number(auction.starting_price || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Current Bid</p>
                      <p className="font-bold text-green-600">₹{Number(auction.current_highest_bid || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Bids</p>
                      <p className="font-semibold text-gray-900">{auction.bid_count || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewUsers(auction)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Users
                    </button>
                    <button
                      onClick={() => handleEdit(auction)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAuction(auction);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedAuction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Auction</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-bold">{selectedAuction.title}</span>"? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAuction(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAuction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl my-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Auction</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="1">Electronics</option>
                    <option value="2">Home & Garden</option>
                    <option value="3">Fashion</option>
                    <option value="4">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Starting Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.starting_price}
                    onChange={(e) => setEditForm({ ...editForm, starting_price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={editForm.end_time}
                  onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAuction(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all"
              >
                Update Auction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registered Users Modal */}
      {showUsersModal && selectedAuction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Registered Users</h3>
            <p className="text-gray-600 mb-6">
              Auction: <span className="font-bold">{selectedAuction.title}</span>
            </p>

            {registeredUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No users registered yet.</p>
            ) : (
              <div className="space-y-3">
                {registeredUsers.map((user, index) => (
                  <div key={user.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className="font-bold text-green-600">₹{Number(user.balance || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowUsersModal(false);
                  setSelectedAuction(null);
                  setRegisteredUsers([]);
                }}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
