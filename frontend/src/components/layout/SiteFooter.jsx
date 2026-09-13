import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FacebookLogo, LinkedinLogo, XLogo } from '@phosphor-icons/react';
import { AppContext } from '../../context/AppContext';
import { DEPARTMENTS } from '../../lib/categories';
import { Reveal } from '../ui/Motion';

const SOCIALS = [
  { href: 'https://www.facebook.com/roshan.poudel.301303', label: 'Facebook', Icon: FacebookLogo },
  { href: 'https://x.com/PrashantK7738', label: 'X', Icon: XLogo },
  { href: 'https://www.linkedin.com/in/prashantkafle33/', label: 'LinkedIn', Icon: LinkedinLogo },
];

const Column = ({ title, children }) => (
  <div>
    <p className="label mb-5">{title}</p>
    <ul className="space-y-3">{children}</ul>
  </div>
);

const FooterLink = ({ to, onClick, children }) => (
  <li>
    <Link
      to={to}
      onClick={onClick}
      className="text-sm text-bone-3 transition-colors hover:text-bone"
    >
      {children}
    </Link>
  </li>
);

export const SiteFooter = () => {
  const { setSelectedCategory } = useContext(AppContext);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid gap-14 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-20">
          <Reveal>
            <p className="display text-5xl leading-[0.9] text-bone md:text-6xl">
              LiveBid
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-bone-3">
              A real-time saleroom where every bid is public, every clock is
              honest, and the last one standing takes the lot.
            </p>
            <div className="mt-8 flex gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center border border-line text-bone-3 transition-colors hover:border-bone hover:text-bone"
                >
                  <Icon className="h-4 w-4" weight="fill" aria-hidden="true" />
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <Column title="Saleroom">
              <FooterLink to="/all-auctions">Discover</FooterLink>
              <FooterLink to="/all-auctions?status=live">Live now</FooterLink>
              <FooterLink to="/results">Results</FooterLink>
              <FooterLink to="/create-auction">Sell a lot</FooterLink>
            </Column>
          </Reveal>

          <Reveal delay={0.1}>
            <Column title="Departments">
              {DEPARTMENTS.map((dept) => (
                <FooterLink
                  key={dept.id}
                  to="/all-auctions"
                  onClick={() => setSelectedCategory(dept.id)}
                >
                  {dept.name}
                </FooterLink>
              ))}
            </Column>
          </Reveal>

          <Reveal delay={0.15}>
            <Column title="Account">
              <FooterLink to="/dashboard">Your account</FooterLink>
              <FooterLink to="/login">Sign in</FooterLink>
              <FooterLink to="/register">Join</FooterLink>
              <FooterLink to="/admin/login">Admin</FooterLink>
            </Column>
          </Reveal>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-8 text-xs text-bone-4 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} LiveBid. All rights reserved.</p>
          <p>Built by Prashant Kafle and Roshan Poudel.</p>
        </div>
      </div>
    </footer>
  );
};
