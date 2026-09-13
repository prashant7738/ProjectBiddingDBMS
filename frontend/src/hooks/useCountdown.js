import { useEffect, useRef, useState } from 'react';
import { remaining } from '../lib/format';

// Ticking remaining-time for a lot. Stops its own interval the moment the lot
// closes so finished rows aren't each burning a timer for the rest of the session.
export const useCountdown = (endValue, onEnd) => {
  const endTs = endValue ? new Date(endValue).getTime() : 0;
  const [time, setTime] = useState(() => remaining(endValue));
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    const first = remaining(endTs || null);
    setTime(first);
    if (!endTs || first.ended) return;

    const id = setInterval(() => {
      const next = remaining(endTs);
      setTime(next);
      if (next.ended) {
        clearInterval(id);
        onEndRef.current?.();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [endTs]);

  return time;
};

// True once a lot is inside its final stretch — drives the urgent treatment on
// the countdown and bid console.
export const isClosingSoon = (time, thresholdMs = 60 * 60 * 1000) =>
  !time.ended && time.total > 0 && time.total <= thresholdMs;
