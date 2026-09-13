// Formatting helpers shared by every surface that renders auction data, so
// currency, clocks and lot numbers read identically across the site.

const NPR = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const NPR_PRECISE = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const money = (value, { precise = false } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return precise ? 'Rs 0.00' : 'Rs 0';
  return `Rs ${(precise ? NPR_PRECISE : NPR).format(n)}`;
};

export const plainNumber = (value, { precise = false } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return precise ? '0.00' : '0';
  return (precise ? NPR_PRECISE : NPR).format(n);
};

// Lots are announced by number in a saleroom; ids get the same treatment.
export const lotNumber = (id) => String(id ?? 0).padStart(4, '0');

// The backend stores UTC; the saleroom runs on Kathmandu time.
export const saleTime = (value, { withYear = false } = {}) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Kathmandu',
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const saleDate = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kathmandu',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const relativeTime = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff)) return '';
  const seconds = Math.floor(diff / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return saleDate(date);
};

// Split a remaining duration into padded parts so a countdown can render each
// unit in its own cell without the width jumping every second.
export const remaining = (endValue) => {
  if (!endValue) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  const end = endValue instanceof Date ? endValue : new Date(endValue);
  const total = end.getTime() - Date.now();
  if (!Number.isFinite(total) || total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total % 86_400_000) / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1000),
    ended: false,
  };
};

export const pad2 = (n) => String(n).padStart(2, '0');

export const initialOf = (name) => (name || '?').trim().charAt(0).toUpperCase() || '?';

// Suggested next bid: 5% over the standing bid, rounded to something a person
// would actually type.
export const suggestedIncrement = (current) => {
  const n = Number(current) || 0;
  if (n < 1000) return 100;
  if (n < 10_000) return 500;
  if (n < 100_000) return 2_500;
  return 10_000;
};
