import { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, List, MagnifyingGlass, SignOut, User, X } from '@phosphor-icons/react';
import { AuthContext } from '../../context/AuthContext';
import { AppContext } from '../../context/AppContext';
import { EASE } from '../../lib/motion';
import { initialOf, relativeTime } from '../../lib/format';
import { useScrollLock, useScrollState } from '../../hooks/useInteractions';
import { ActionLink } from '../ui/Button';

const NAV = [
  { to: '/all-auctions', label: 'Discover' },
  { to: '/all-auctions?status=live', label: 'Live', match: '/all-auctions' },
  { to: '/results', label: 'Results' },
  { to: '/create-auction', label: 'Sell' },
];

const Wordmark = ({ onClick }) => (
  <Link to="/" onClick={onClick} className="group flex items-baseline gap-1.5" aria-label="LiveBid, home">
    <span className="display text-xl tracking-[-0.01em] text-bone">LiveBid</span>
    <span className="mb-1 h-1.5 w-1.5 rounded-full bg-signal transition-transform duration-300 group-hover:scale-150" />
  </Link>
);

export const SiteHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const {
    searchQuery, setSearchQuery,
    notifications, setNotifications,
    showNotifications, setShowNotifications,
    unreadCount,
  } = useContext(AppContext);

  const { scrolled, hidden } = useScrollState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const searchRef = useRef(null);

  useScrollLock(menuOpen);

  // Any navigation closes every transient surface in the bar.
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
    setShowNotifications(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearchOpen(false);
    navigate('/all-auctions');
  };

  const signOut = async () => {
    setAccountOpen(false);
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const isLiveView = location.pathname === '/all-auctions' && location.search.includes('status=live');

  return (
    <>
      <motion.header
        animate={{ y: hidden && !menuOpen ? '-100%' : '0%' }}
        transition={{ duration: 0.4, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled || menuOpen ? 'border-b border-line bg-paper/90 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-8 px-5 md:px-10">
          <Wordmark />

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => {
              const active = item.label === 'Live'
                ? isLiveView
                : location.pathname === (item.match ?? item.to) && !isLiveView;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`link-draw text-[13px] uppercase tracking-[0.1em] transition-colors ${
                    active ? 'text-bone' : 'text-bone-3 hover:text-bone'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:gap-2">
            {/* Search expands in place rather than opening a separate page. */}
            <AnimatePresence initial={false} mode="wait">
              {searchOpen ? (
                <motion.form
                  key="search-field"
                  onSubmit={submitSearch}
                  initial={{ width: 44, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 44, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="relative hidden md:block"
                >
                  <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-4" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                    placeholder="Search lots"
                    aria-label="Search lots"
                    className="control h-10 py-0 pl-9 pr-3 text-sm"
                  />
                </motion.form>
              ) : (
                <motion.button
                  key="search-button"
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search lots"
                  className="hidden h-10 w-10 items-center justify-center text-bone-3 transition-colors hover:text-bone md:flex"
                >
                  <MagnifyingGlass className="h-[18px] w-[18px]" aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>

            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                  className="relative flex h-10 w-10 items-center justify-center text-bone-3 transition-colors hover:text-bone"
                >
                  <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-signal" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="absolute right-0 top-12 w-[min(92vw,22rem)] border border-line bg-paper-2"
                    >
                      <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <span className="label">Activity</span>
                        <button
                          type="button"
                          onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                          className="text-[11px] uppercase tracking-[0.1em] text-bone-3 transition-colors hover:text-bone"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="thin-scroll max-h-80 overflow-y-auto">
                        {notifications.length === 0 && (
                          <p className="px-4 py-10 text-center text-sm text-bone-4">Nothing yet.</p>
                        )}
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            type="button"
                            onClick={() => {
                              if (notif.auctionId) {
                                setShowNotifications(false);
                                navigate(`/auctionPage/${notif.auctionId}`);
                              }
                              setNotifications(notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
                            }}
                            className={`block w-full border-b border-line-soft px-4 py-3 text-left transition-colors last:border-0 hover:bg-bone/[0.03] ${
                              notif.read ? '' : 'bg-signal/[0.05]'
                            }`}
                          >
                            <p className="text-sm leading-snug text-bone-2">{notif.message}</p>
                            <p className="mt-1.5 text-[11px] text-bone-4">{relativeTime(notif.time)}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2.5 pl-1 pr-1 md:pr-2"
                  aria-label="Account menu"
                >
                  <span className="flex h-9 w-9 items-center justify-center border border-line text-xs font-medium text-bone">
                    {initialOf(user.name)}
                  </span>
                  <span className="hidden max-w-[9rem] truncate text-[13px] text-bone-2 md:block">{user.name}</span>
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="absolute right-0 top-12 w-48 border border-line bg-paper-2 py-1"
                    >
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-bone-2 transition-colors hover:bg-bone/[0.03] hover:text-bone">
                        <User className="h-4 w-4" aria-hidden="true" />
                        Account
                      </Link>
                      <button
                        type="button"
                        onClick={signOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-bone-3 transition-colors hover:bg-signal/[0.06] hover:text-signal-2"
                      >
                        <SignOut className="h-4 w-4" aria-hidden="true" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/login" className="px-3 text-[13px] uppercase tracking-[0.1em] text-bone-3 transition-colors hover:text-bone">
                  Sign in
                </Link>
                <ActionLink to="/register" variant="bone" size="sm">Join</ActionLink>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center text-bone lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <List className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu: its own layout, set in display type, not a squeezed navbar. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col bg-paper pt-[72px] lg:hidden"
          >
            <form
              onSubmit={submitSearch}
              className="relative border-b border-line px-5 py-4"
            >
              <MagnifyingGlass className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-4" aria-hidden="true" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search lots"
                aria-label="Search lots"
                className="control h-12 py-0 pl-9"
              />
            </form>

            <nav className="flex-1 overflow-y-auto px-5 py-6">
              {NAV.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.05 + index * 0.05 }}
                >
                  <Link
                    to={item.to}
                    className="flex items-baseline justify-between border-b border-line-soft py-5"
                  >
                    <span className="display text-4xl text-bone">{item.label}</span>
                    <span className="label text-[10px]">0{index + 1}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {!user && (
              <div className="flex gap-3 border-t border-line px-5 py-5">
                <ActionLink to="/login" variant="ghost" size="md" className="flex-1">Sign in</ActionLink>
                <ActionLink to="/register" variant="bone" size="md" className="flex-1">Join</ActionLink>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
