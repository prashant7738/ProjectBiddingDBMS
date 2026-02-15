import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user, loading, refreshProfile } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);

  // Sync balance when user changes
  useEffect(() => {
    if (user?.balance !== undefined) {
      setBalance(user.balance);
    }
    console.log('User data updated:', user);  
  }, [user?.balance]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4 text-red-600">Not authenticated. Please log in.</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg">
        {user?.name && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
          </div>
        )}

        {user?.email && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-lg font-semibold text-gray-900">{user.email}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Balance</label>
          <p className="text-2xl font-bold text-green-600">₹{Number(balance).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Available for bidding</p>
        </div>

        <button
          onClick={() => refreshProfile()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Balance
        </button>
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}