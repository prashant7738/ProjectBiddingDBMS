import React from 'react'
import { Link } from 'react-router-dom'

const MyItems = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Items</h2>
                        <p className="text-gray-600">Items you're currently bidding on</p>
                    </div>

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
                </div>
  )
}

export default MyItems
