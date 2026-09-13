import { getMediaUrl } from '../api/auth';
import { CATEGORIES } from './categories';

// Shared shape used by Home, AllAuctions, WonItems, MyItems and AuctionPage.
// AdminDashboard needs admin-only fields (seller/winner email + balance,
// isUpcoming/isEnded) and keeps its own specialized normalizer rather than
// overload this general-purpose one.
export const normalizeAuction = (raw) => {
  const startTime = raw?.start_time ? new Date(raw.start_time) : new Date();
  const endTime = raw?.end_time ? new Date(raw.end_time) : new Date(Date.now() + 3600000);
  const now = new Date();

  const isLive = (raw?.is_live ?? raw?.isLive) !== undefined
    ? (raw?.is_live ?? raw?.isLive)
    : (now >= startTime && now <= endTime && (raw?.is_active ?? true));

  const categoryId = raw?.category_id ?? 0;

  return {
    id: raw?.id ?? raw?.auction_id,
    name: raw?.title ?? 'Untitled Auction',
    sellerName: raw?.seller_name ?? raw?.sellerName ?? raw?.seller?.name ?? '',
    sellerId: raw?.seller_id ?? raw?.sellerId ?? raw?.seller?.id ?? null,
    categoryId,
    category: raw?.category_name ?? raw?.category ?? CATEGORIES[categoryId] ?? 'General',
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
    winnerName: raw?.winner_name ?? raw?.winnerName ?? raw?.winner?.name ?? '',
  };
};
