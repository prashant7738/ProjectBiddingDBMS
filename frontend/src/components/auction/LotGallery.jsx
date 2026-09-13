import { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'motion/react';
import { MagnifyingGlassPlus } from '@phosphor-icons/react';
import { lotNumber, saleDate } from '../../lib/format';
import { ImagePlaceholder } from '../ui/Form';
import { LotStatus } from '../ui/Data';

/**
 * The lot plate. Hovering magnifies around the cursor rather than opening a
 * lightbox — you inspect the goods in place, the way you would in a viewing room.
 */
export const LotGallery = ({ lot }) => {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [zoomed, setZoomed] = useState(false);

  const ox = useMotionValue(50);
  const oy = useMotionValue(50);
  const transformOrigin = useMotionTemplate`${ox}% ${oy}%`;

  const onMove = (event) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ox.set(((event.clientX - rect.left) / rect.width) * 100);
    oy.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <div>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => { setZoomed(false); ox.set(50); oy.set(50); }}
        className="relative aspect-[4/5] w-full overflow-hidden bg-paper-3 md:aspect-[4/4.6]"
      >
        {lot.image ? (
          <motion.img
            src={lot.image}
            alt={lot.name}
            style={{ transformOrigin }}
            animate={{ scale: zoomed && !reduce ? 1.9 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}

        {lot.image && !reduce && (
          <span
            className={`pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 border border-line bg-paper/70 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-bone-2 backdrop-blur-sm transition-opacity duration-300 ${
              zoomed ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <MagnifyingGlassPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Hover to inspect
          </span>
        )}
      </div>

      {/* Plate caption — the catalogue line under the image. */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-x border-b border-line px-4 py-3">
        <span className="figure text-[11px] text-bone-4">
          Lot {lotNumber(lot.id)} · {lot.category}
        </span>
        <span className="text-[11px] text-bone-4">
          Opened {saleDate(lot.startTime)}
        </span>
        <LotStatus lot={lot} />
      </div>
    </div>
  );
};
