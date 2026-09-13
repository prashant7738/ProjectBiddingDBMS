import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient, {
  getAuctionById,
  getAuctionBidHistory,
  getRegisteredUsers,
  getUserBidForAuction,
  placeBid as placeBidRequest,
  registerForAuction,
} from '../api/auth';
import { normalizeAuction } from '../lib/normalizeAuction';

// The live-bidding engine, with no opinion about how any of it looks.
//
// Three sources feed the same state, deliberately overlapping so a dropped
// socket never leaves the room silently stale:
//   1. a websocket (authoritative, instant)
//   2. a 5s REST poll of the lot (safety net while the socket is down)
//   3. one REST load of the ledger on mount
//
// The socket's payload shape varies by event type, so `readBid` accepts every
// shape the backend has been observed to send rather than assuming one.

const socketUrlFor = (auctionId) => {
  const httpBase = apiClient?.defaults?.baseURL || '';
  const apiRoot = httpBase.replace(/\/?api\/?$/, '');
  if (apiRoot) {
    const wsBase = apiRoot.replace(/^https?/, (m) => (m === 'https' ? 'wss' : 'ws'));
    return `${wsBase}/ws/auctions/${auctionId}/`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}/ws/auctions/${auctionId}/`;
};

const readBidAmount = (payload) => {
  const raw =
    payload?.current_highest_bid ??
    payload?.current_bid ??
    payload?.currentBid ??
    payload?.amount ??
    payload?.bid?.amount ??
    payload?.data?.amount ??
    payload?.data?.bid?.amount ??
    payload?.auction?.current_bid ??
    payload?.auction?.currentBid ??
    payload?.data?.current_bid ??
    payload?.data?.currentBid;
  const amount = Number.parseFloat(raw);
  return Number.isFinite(amount) ? amount : null;
};

const readBidder = (payload) => {
  const bidderId =
    payload?.bidder_id ?? payload?.bid?.bidder_id ?? payload?.data?.bid?.bidder_id ?? null;
  const bidder =
    payload?.username ||
    payload?.bidder_name ||
    (bidderId ? `Bidder #${bidderId}` : 'Bidder');
  const time =
    payload?.time ||
    payload?.created_at ||
    payload?.bid?.time ||
    payload?.bid?.created_at ||
    new Date().toISOString();
  return { bidderId, bidder, time };
};

export const useLiveAuction = (auctionId, user) => {
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [currentBid, setCurrentBid] = useState(0);
  const [bids, setBids] = useState([]);
  const [myBid, setMyBid] = useState(null);

  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [registering, setRegistering] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState('');
  const [liveEvent, setLiveEvent] = useState(null);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const eventTimerRef = useRef(null);
  const failedAttemptsRef = useRef(0);

  /* ── Lot ─────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!auctionId) return undefined;
    let alive = true;
    setLoading(true);
    setLoadError('');

    getAuctionById(auctionId)
      .then((res) => {
        if (!alive) return;
        const normalized = normalizeAuction(res.data);
        setLot(normalized);
        setCurrentBid(Number(normalized.currentBid ?? normalized.startingBid ?? 0));
        setIsRegistered((prev) => prev || Boolean(normalized.registered));
      })
      .catch((err) => {
        if (alive) setLoadError(err.response?.data?.error || 'This lot could not be found.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [auctionId]);

  /* ── Ledger ──────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!auctionId) return undefined;
    let alive = true;

    getAuctionBidHistory(auctionId)
      .then((res) => {
        if (!alive || !Array.isArray(res.data)) return;
        setBids(
          res.data.map((bid) => ({
            bidder: bid.bidder_name || `Bidder #${bid.bidder_id}`,
            bidderId: bid.bidder_id ?? null,
            amount: bid.amount ?? 0,
            time: bid.bid_time || new Date().toISOString(),
          })),
        );
      })
      .catch(() => {
        if (alive) setBids([]);
      });

    return () => { alive = false; };
  }, [auctionId]);

  /* ── This user's standing bid ────────────────────────────────────────── */

  useEffect(() => {
    if (!auctionId || !user?.id) {
      setMyBid(null);
      return undefined;
    }
    let alive = true;
    getUserBidForAuction(auctionId, user.id)
      .then((res) => { if (alive) setMyBid(res.data); })
      .catch(() => { if (alive) setMyBid(null); }); // 404 simply means "hasn't bid"
    return () => { alive = false; };
  }, [auctionId, user?.id]);

  /* ── Registration ────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!auctionId || !user?.id) {
      setCheckingRegistration(false);
      return undefined;
    }
    let alive = true;
    setCheckingRegistration(true);

    getRegisteredUsers(auctionId)
      .then((res) => {
        if (!alive) return;
        if (res.data?.registered === true || res.data?.is_registered === true) {
          setIsRegistered(true);
          return;
        }
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.results || res.data?.users || res.data?.registered_users || res.data?.user_ids || [];
        const found = (Array.isArray(list) ? list : []).some((entry) => {
          const id = typeof entry === 'object' ? (entry.id ?? entry.user_id) : entry;
          return String(id) === String(user.id);
        });
        if (found) setIsRegistered(true);
      })
      .catch(() => {}) // keep whatever state we already have
      .finally(() => { if (alive) setCheckingRegistration(false); });

    return () => { alive = false; };
  }, [auctionId, user?.id]);

  /* ── REST safety-net poll ────────────────────────────────────────────── */

  useEffect(() => {
    if (!auctionId) return undefined;
    let alive = true;

    const poll = async () => {
      try {
        const res = await getAuctionById(auctionId);
        if (!alive || !res?.data) return;
        const normalized = normalizeAuction(res.data);
        setLot((prev) => (prev ? { ...prev, ...normalized } : normalized));
        setCurrentBid(Number(normalized.currentBid ?? 0));
      } catch {
        // A failed poll is non-fatal; the socket or the next tick recovers it.
      }
    };

    const id = setInterval(poll, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [auctionId]);

  /* ── Socket ──────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!auctionId) return undefined;
    let unmounted = false;
    failedAttemptsRef.current = 0;

    const applyUpdate = (payload, { announce }) => {
      const amount = readBidAmount(payload);
      if (amount !== null) setCurrentBid(amount);

      // A full ledger snapshot replaces local history outright.
      if (Array.isArray(payload?.bids)) {
        setBids(
          payload.bids.map((bid) => ({
            bidder:
              bid.username || bid.bidder_name || bid.bidder ||
              (bid.bidder_id ? `Bidder #${bid.bidder_id}` : 'Bidder'),
            bidderId: bid.bidder_id ?? null,
            amount: bid.amount ?? 0,
            time: bid.time || bid.created_at || new Date().toISOString(),
          })),
        );
        return;
      }

      const single = payload?.amount ?? payload?.bid?.amount ?? payload?.data?.bid?.amount;
      if (single !== undefined && single !== null) {
        const { bidderId, bidder, time } = readBidder(payload);
        if (user?.id && String(bidderId) === String(user.id)) {
          setMyBid({ amount: single, time });
        }
        setBids((prev) => [{ bidder, bidderId, amount: single ?? 0, time }, ...prev]);
      }

      if (announce && amount !== null) {
        const { bidder } = readBidder(payload);
        setLiveEvent({ id: Date.now(), bidder, amount });
        clearTimeout(eventTimerRef.current);
        eventTimerRef.current = setTimeout(() => setLiveEvent(null), 4000);
      }
    };

    const connect = () => {
      const socket = new WebSocket(socketUrlFor(auctionId));
      socketRef.current = socket;

      socket.onopen = () => {
        failedAttemptsRef.current = 0;
        setConnected(true);
        setBidError('');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data?.type || data?.event || data?.action;

          if (type === 'auction_state' || type === 'state') {
            applyUpdate(data, { announce: false });
            return;
          }
          if (type === 'bid_update' || type === 'bid_placed' || type === 'BID_PLACED' || type === 'bid') {
            applyUpdate(data, { announce: true });
            return;
          }
          if (type === 'error' || data?.error) {
            setBidError(data?.message || data?.error || 'That bid was not accepted.');
            setSubmitting(false);
            return;
          }
          if (
            data?.current_bid || data?.currentBid || data?.amount ||
            data?.bid?.amount || data?.data?.bid?.amount
          ) {
            applyUpdate(data, { announce: true });
          }
        } catch {
          // Non-JSON frames are not ours.
        }
      };

      socket.onclose = (event) => {
        setConnected(false);
        if (event.code === 1006) {
          failedAttemptsRef.current += 1;
          // Only surface this after repeated failures for a signed-out visitor —
          // on first load auth is often still resolving and the socket is
          // expected to bounce once.
          if (failedAttemptsRef.current >= 2 && !user?.id) {
            setBidError('Sign in to bid on this lot.');
          }
        }
        if (!unmounted && event.code !== 1000) {
          reconnectRef.current = setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        // Recovery is handled by onclose's backoff.
      };
    };

    connect();

    return () => {
      unmounted = true;
      clearTimeout(reconnectRef.current);
      clearTimeout(eventTimerRef.current);
      reconnectRef.current = null;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [auctionId, user?.id, isRegistered]);

  /* ── Actions ─────────────────────────────────────────────────────────── */

  const register = useCallback(async () => {
    if (!auctionId) return false;
    setRegistering(true);
    setBidError('');
    try {
      await registerForAuction(auctionId);
      setIsRegistered(true);
      return true;
    } catch (err) {
      setBidError(err.response?.data?.error || 'Registration failed. Try again.');
      return false;
    } finally {
      setRegistering(false);
    }
  }, [auctionId]);

  const submitBid = useCallback(async (rawAmount) => {
    setBidError('');
    const amount = Number.parseFloat(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setBidError('Enter a bid amount.');
      return false;
    }
    if (amount <= Number(currentBid)) {
      setBidError('Your bid must be higher than the standing bid.');
      return false;
    }

    setSubmitting(true);
    const socket = socketRef.current;

    // Preferred path: hand it to the socket and let the server's broadcast be
    // the single source of truth for what the price becomes.
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'place_bid', amount }));
      setTimeout(() => setSubmitting(false), 600);
      return true;
    }

    try {
      const res = await placeBidRequest({ auction_id: auctionId, amount });
      const accepted = res.data?.amount ?? amount;
      setMyBid({ amount: accepted, time: new Date().toISOString() });
      setCurrentBid(accepted);
      setBids((prev) => [
        { bidder: user?.name || 'You', bidderId: user?.id ?? null, amount: accepted, time: new Date().toISOString() },
        ...prev,
      ]);
      return true;
    } catch (err) {
      setBidError(err.response?.data?.error || 'That bid was not accepted.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [auctionId, currentBid, user?.id, user?.name]);

  const bidderCount = new Set(
    bids.map((b) => (b.bidderId != null ? `id:${b.bidderId}` : `name:${b.bidder}`)),
  ).size;

  return {
    lot,
    loading,
    loadError,
    currentBid,
    bids,
    bidderCount,
    myBid,
    isRegistered,
    checkingRegistration,
    registering,
    register,
    submitBid,
    submitting,
    bidError,
    clearBidError: () => setBidError(''),
    liveEvent,
    connected,
  };
};
