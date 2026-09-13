import { Container } from '../components/layout/Section';
import { ActionLink } from '../components/ui/Button';

const NotFound = () => (
  <div className="pt-[72px]">
    <Container className="flex min-h-[70dvh] flex-col justify-center py-24">
      <p className="label mb-6">404</p>
      <h1 className="display max-w-3xl text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] text-bone">
        That lot has left the room.
      </h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-bone-3">
        The page you asked for does not exist, or the lot it pointed to has been
        withdrawn.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <ActionLink to="/all-auctions" variant="signal" size="lg">Browse the catalogue</ActionLink>
        <ActionLink to="/" variant="ghost" size="lg">Back to the floor</ActionLink>
      </div>
    </Container>
  </div>
);

export default NotFound;
