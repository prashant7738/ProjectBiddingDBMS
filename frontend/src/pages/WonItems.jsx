import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard'
import { winItems, getMediaUrl } from '../api/auth'
import { AuthContext } from '../context/AuthContext'
const WonItems = () => {
    const { user } = useContext(AuthContext)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const normalizeAuction = (raw) => {
        const startTime = raw?.start_time ? new Date(raw.start_time) : new Date()
        const endTime = raw?.end_time ? new Date(raw.end_time) : new Date(Date.now() + 3600000)
        const now = new Date()

        const isLive = (raw?.is_live ?? raw?.isLive) !== undefined
            ? (raw?.is_live ?? raw?.isLive)
            : (now >= startTime && now <= endTime && (raw?.is_active ?? true))

        return {
            id: raw?.id ?? raw?.auction_id,
            name: raw?.title ?? 'Untitled Auction',
            sellerName: raw?.seller_name ?? raw?.sellerName ?? raw?.seller?.name ?? '',
            categoryId: raw?.category_id ?? 0,
            image: getMediaUrl(raw?.image_url ?? raw?.image ?? ''),
            currentBid: raw?.current_highest_bid ?? raw?.current_bid ?? raw?.starting_price ?? 0,
            startingBid: raw?.starting_price ?? 0,
            isLive,
            startTime,
            endTime,
            country: raw?.country ?? 'Unknown',
            description: raw?.description ?? '',
            bidCount: raw?.bid_count ?? 0,
            registered: raw?.registered ?? false,
        }
    }

    useEffect(() => {
        const loadWonItems = async () => {
            if (!user?.id) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const response = await winItems(user.id)
                const list = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.results)
                        ? response.data.results
                        : []
                setItems(list.map(normalizeAuction))
            } catch (err) {
                console.error('Error fetching won items:', err)
                setError('Failed to load your won items')
            } finally {
                setLoading(false)
            }
        }

        loadWonItems()
    }, [user?.id])

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="text-xl text-gray-600">Loading your won items...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Won Items</h2>
                <p className="text-gray-600">Auctions you've won</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {items.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Won Items Yet</h3>
                    <p className="text-gray-600 mb-6">
                        Start bidding on auctions to see your won items here
                    </p>
                    <Link
                        to={'/upcoming'}
                        className="gradient-bg text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
                    >
                        Browse Auctions
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
    );
}

export default WonItems
