import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react';
import { AuthContext } from '../context/AuthContext';
import { createAuction } from '../api/auth';
import { CATEGORIES, CATEGORY_OPTIONS } from '../lib/categories';
import { EASE } from '../lib/motion';
import { money, saleTime } from '../lib/format';
import { Container } from '../components/layout/Section';
import { Button, ActionLink } from '../components/ui/Button';
import { Field, ImageDrop, ImagePlaceholder, SelectField, TextArea } from '../components/ui/Form';
import { Notice } from '../components/ui/Feedback';
import { Countdown } from '../components/ui/Data';

const STEPS = [
  { id: 1, label: 'The item' },
  { id: 2, label: 'Photography' },
  { id: 3, label: 'Opening price' },
  { id: 4, label: 'Schedule' },
  { id: 5, label: 'Review' },
];

const EMPTY = {
  title: '',
  description: '',
  category_id: '',
  starting_price: '',
  start_time: '',
  end_time: '',
  image: null,
};

/** Consignment, staged like a real listing flow instead of one long form. */
const Sell = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(null);

  const stepBarRef = useRef(null);

  const preview = useMemo(() => (form.image ? URL.createObjectURL(form.image) : ''), [form.image]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  // Each step starts at the top of its own panel rather than wherever the
  // previous, longer step left the scroll position.
  useEffect(() => {
    const bar = stepBarRef.current;
    if (!bar) return;
    const top = bar.getBoundingClientRect().top + window.scrollY - 72;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  }, [step]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const problems = useMemo(() => {
    const list = {};
    if (step >= 1) {
      if (!form.title.trim()) list.title = 'Give the lot a title.';
      if (!form.description.trim()) list.description = 'Describe the item and its condition.';
      if (!form.category_id) list.category_id = 'Choose a department.';
    }
    if (step >= 3 && (!form.starting_price || Number(form.starting_price) <= 0)) {
      list.starting_price = 'Set an opening price above zero.';
    }
    if (step >= 4) {
      if (!form.end_time) list.end_time = 'Bidding needs a closing time.';
      else if (new Date(form.end_time).getTime() <= Date.now()) list.end_time = 'Closing time must be in the future.';
      else if (form.start_time && new Date(form.end_time) <= new Date(form.start_time)) {
        list.end_time = 'Bidding must close after it opens.';
      }
    }
    return list;
  }, [form, step]);

  const canAdvance = () => {
    if (step === 1) return !problems.title && !problems.description && !problems.category_id;
    if (step === 3) return !problems.starting_price;
    if (step === 4) return !problems.end_time;
    return true;
  };

  const next = () => { if (canAdvance()) setStep((s) => Math.min(5, s + 1)); };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const publish = async () => {
    setError('');
    if (!user?.id) {
      setError('Your session expired. Sign in again to publish.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('seller_id', String(user.id));
      payload.append('title', form.title.trim());
      payload.append('description', form.description.trim());
      payload.append('category_id', String(form.category_id));
      payload.append('starting_price', String(form.starting_price));
      if (form.start_time) payload.append('start_time', new Date(form.start_time).toISOString());
      if (form.end_time) payload.append('end_time', new Date(form.end_time).toISOString());
      if (form.image) payload.append('image', form.image);

      const res = await createAuction(payload);
      setPublished(res.data ?? {});
    } catch (err) {
      setError(err.response?.data?.error || 'The lot could not be published. Check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Published ──────────────────────────────────────────────────────── */

  if (published) {
    const newId = published.id ?? published.auction_id;
    return (
      <div className="pt-18">
        <Container className="flex min-h-[70dvh] flex-col items-center justify-center py-24 text-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex h-16 w-16 items-center justify-center border border-settled text-settled"
          >
            <Check className="h-7 w-7" aria-hidden="true" />
          </motion.span>

          <h1 className="display mt-10 text-[clamp(2.5rem,7vw,5rem)] leading-[0.92] text-bone">
            Your lot is in
            <br />
            the catalogue.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-bone-3">
            {form.title} is listed and will take bids from {form.start_time ? saleTime(form.start_time) : 'now'} until {saleTime(form.end_time)}.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {newId ? (
              <ActionLink to={`/auctionPage/${newId}`} variant="signal" size="lg">View the lot</ActionLink>
            ) : (
              <ActionLink to="/dashboard?tab=selling" variant="signal" size="lg">View in account</ActionLink>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => { setPublished(null); setForm(EMPTY); setStep(1); }}
            >
              List another
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  /* ── Wizard ─────────────────────────────────────────────────────────── */

  return (
    <div className="pt-18">
      <Container className="py-14 md:py-20">
        <p className="label mb-5">Consign a lot</p>
        <h1 className="display max-w-3xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9] text-bone">
          Put it in front of the room.
        </h1>
      </Container>

      {/* Step index doubles as progress and as navigation backwards. */}
      <div ref={stepBarRef} className="sticky top-18 z-30 border-y border-line bg-paper/90 backdrop-blur-xl">
        <Container>
          <ol className="no-scrollbar flex items-center gap-8 overflow-x-auto py-4">
            {STEPS.map((item) => {
              const state = item.id === step ? 'current' : item.id < step ? 'done' : 'todo';
              return (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => item.id < step && setStep(item.id)}
                    disabled={item.id > step}
                    className={`flex items-center gap-3 text-[13px] uppercase tracking-widest transition-colors ${
                      state === 'current' ? 'text-bone'
                        : state === 'done' ? 'text-bone-3 hover:text-bone'
                        : 'cursor-default text-bone-4/60'
                    }`}
                  >
                    <span className={`figure text-xs ${state === 'current' ? 'text-signal' : ''}`}>
                      0{item.id}
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </Container>
      </div>

      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
        <div className="max-w-2xl">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {step === 1 && (
              <div className="space-y-8">
                <Field
                  label="Lot title"
                  required
                  value={form.title}
                  onChange={set('title')}
                  placeholder="Leica M6 rangefinder, 1988"
                  error={form.title ? undefined : undefined}
                  hint="What a bidder would search for."
                />
                <TextArea
                  label="Catalogue note"
                  required
                  rows={7}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Condition, provenance, what's included, anything a serious bidder should know."
                />
                <SelectField
                  label="Department"
                  required
                  value={form.category_id}
                  onChange={set('category_id')}
                >
                  <option value="">Select a department</option>
                  {CATEGORY_OPTIONS.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </SelectField>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <ImageDrop
                  file={form.image}
                  preview={preview}
                  onSelect={(event) => setForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }))}
                  onClear={() => setForm((prev) => ({ ...prev, image: null }))}
                />
                <p className="text-sm leading-relaxed text-bone-3">
                  One strong photograph outperforms five weak ones. Fill the
                  frame, shoot in daylight, show the flaws — lots with honest
                  images attract higher bids and fewer disputes.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <Field
                  label="Opening price"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.starting_price}
                  onChange={set('starting_price')}
                  placeholder="1500"
                  hint="Where bidding starts. Low openings draw more bidders in early."
                  error={step >= 3 ? problems.starting_price : undefined}
                />
                <div className="border border-line p-6">
                  <p className="label mb-3">How bidding will step</p>
                  <p className="text-sm leading-relaxed text-bone-3">
                    Bidders are offered increments scaled to the standing price,
                    so a lot at {money(form.starting_price || 0)} moves in
                    sensible jumps rather than one-rupee nudges.
                  </p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <Field
                  label="Bidding opens"
                  type="datetime-local"
                  value={form.start_time}
                  onChange={set('start_time')}
                  hint="Leave empty to open the moment you publish."
                />
                <Field
                  label="Bidding closes"
                  required
                  type="datetime-local"
                  value={form.end_time}
                  onChange={set('end_time')}
                  error={problems.end_time}
                  hint="Most lots do best with 24 to 72 hours on the clock."
                />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8">
                <div>
                  <h2 className="display text-3xl text-bone">Check the catalogue entry</h2>
                  <p className="mt-3 text-sm text-bone-3">
                    Once published, bidders can register immediately. You can
                    still edit or withdraw the lot until bidding opens.
                  </p>
                </div>

                <dl className="border-t border-line">
                  {[
                    ['Title', form.title],
                    ['Department', CATEGORIES[Number(form.category_id)] || '—'],
                    ['Opening price', money(form.starting_price || 0)],
                    ['Opens', form.start_time ? saleTime(form.start_time) : 'On publish'],
                    ['Closes', form.end_time ? saleTime(form.end_time) : '—'],
                    ['Photograph', form.image ? form.image.name : 'None'],
                  ].map(([term, value]) => (
                    <div key={term} className="flex items-baseline justify-between gap-6 border-b border-line-soft py-3.5">
                      <dt className="label text-[10px]">{term}</dt>
                      <dd className="truncate text-right text-sm text-bone-2">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>

                <p className="whitespace-pre-line text-sm leading-relaxed text-bone-3">
                  {form.description}
                </p>

                {error && <Notice tone="error">{error}</Notice>}
              </div>
            )}
          </motion.div>

          <div className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-8">
            <Button variant="quiet" size="md" onClick={back} disabled={step === 1} className="px-0">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>

            {step < 5 ? (
              <Button variant="bone" size="md" onClick={next} disabled={!canAdvance()}>
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button variant="signal" size="lg" onClick={publish} disabled={submitting} magnetic>
                {submitting ? 'Publishing…' : 'Publish lot'}
              </Button>
            )}
          </div>
        </div>

        {/* Live catalogue preview — what the room will actually see. */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <p className="label mb-4">Preview</p>
          <div className="border border-line">
            <div className="aspect-4/5 bg-paper-3">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlaceholder className="h-full w-full" />
              )}
            </div>
            <div className="border-t border-line px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="label text-[10px]">
                  {CATEGORIES[Number(form.category_id)] || 'Department'}
                </span>
                <span className="figure text-[11px] text-bone-4">New</span>
              </div>
              <h3 className="display line-clamp-2 text-xl text-bone">
                {form.title || 'Untitled lot'}
              </h3>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="label mb-1 text-[10px]">Opening</p>
                  <p className="figure text-lg text-bone">{money(form.starting_price || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="label mb-1 text-[10px]">Closes in</p>
                  {form.end_time
                    ? <Countdown end={form.end_time} className="text-sm" />
                    : <span className="figure text-sm text-bone-4">—</span>}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-bone-4">
            Listing is free. You keep the hammer price; the balance settles to
            your account when the lot closes.{' '}
            <Link to="/dashboard?tab=selling" className="link-draw text-bone-3">Your lots</Link>
          </p>
        </aside>
      </Container>
    </div>
  );
};

export default Sell;
