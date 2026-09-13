import { useId } from 'react';
import { Image as ImageIcon, UploadSimple, X } from '@phosphor-icons/react';

// Label sits above the control, helper below it, error replaces helper. No
// placeholder-as-label anywhere in the system.

export const Field = ({ label, hint, error, required, className = '', ...rest }) => {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="label mb-2 block">
        {label}
        {required && <span className="ml-1 text-signal">*</span>}
      </label>
      <input
        id={id}
        className="control"
        aria-invalid={Boolean(error) || undefined}
        required={required}
        {...rest}
      />
      {error ? (
        <p className="mt-2 text-xs text-signal-2">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs text-bone-4">{hint}</p>
      ) : null}
    </div>
  );
};

export const TextArea = ({ label, hint, error, required, rows = 5, className = '', ...rest }) => {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="label mb-2 block">
        {label}
        {required && <span className="ml-1 text-signal">*</span>}
      </label>
      <textarea id={id} rows={rows} className="control resize-y" required={required} {...rest} />
      {error ? (
        <p className="mt-2 text-xs text-signal-2">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs text-bone-4">{hint}</p>
      ) : null}
    </div>
  );
};

export const SelectField = ({ label, hint, error, required, children, className = '', ...rest }) => {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="label mb-2 block">
        {label}
        {required && <span className="ml-1 text-signal">*</span>}
      </label>
      <select id={id} className="control" required={required} {...rest}>
        {children}
      </select>
      {error ? (
        <p className="mt-2 text-xs text-signal-2">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs text-bone-4">{hint}</p>
      ) : null}
    </div>
  );
};

/** Image drop zone with its own preview and a way back out. */
export const ImageDrop = ({ file, preview, onSelect, onClear, label = 'Lot photography' }) => {
  const id = useId();

  return (
    <div>
      <span className="label mb-2 block">{label}</span>
      {preview ? (
        <div className="relative border border-line">
          <img src={preview} alt="Selected lot" className="h-72 w-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove image"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-line bg-paper/80 text-bone-2 backdrop-blur-sm transition-colors hover:border-bone hover:text-bone"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <span className="truncate text-xs text-bone-3">{file?.name}</span>
            <label htmlFor={id} className="cursor-pointer text-[11px] uppercase tracking-[0.12em] text-bone-2 hover:text-bone">
              Replace
            </label>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-line px-6 py-16 text-center transition-colors hover:border-bone-4 hover:bg-bone/[0.02]"
        >
          <span className="flex h-12 w-12 items-center justify-center border border-line text-bone-3">
            <UploadSimple className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm text-bone-2">Drop an image, or browse</span>
          <span className="text-xs text-bone-4">A single hero shot. JPG or PNG.</span>
        </label>
      )}
      <input id={id} type="file" accept="image/*" className="hidden" onChange={onSelect} />
    </div>
  );
};

export const ImagePlaceholder = ({ className = '' }) => (
  <div className={`flex items-center justify-center bg-paper-3 ${className}`}>
    <ImageIcon className="h-8 w-8 text-paper-5" aria-hidden="true" />
  </div>
);
