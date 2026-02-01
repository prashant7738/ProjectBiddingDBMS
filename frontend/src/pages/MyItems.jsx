import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { myBids } from '../api/auth'
import { AuthContext } from '../context/AuthContext'
import AuctionCard from '../components/AuctionCard'

const MyItems = () => {
  const { user } = AuthContext()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMyBids = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await myBids(user.id)
        setItems(response.data || [])
      } catch (err) {
        console.error('Error fetching my bids:', err)
        setError('Failed to load your bidding items')
      } finally {
        setLoading(false)
      }
    }

    fetchMyBids()
  }, [user?.id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Loading your items...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Items</h2>
        <p className="text-gray-600">Items you're currently bidding on</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Active Bids</h3>
          <p className="text-gray-600 mb-6">
            You haven't placed any bids yet. Start exploring auctions!
          </p>
          <Link 
            to={'/upcoming'}
            className="gradient-bg text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Explore Auctions
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyItems
