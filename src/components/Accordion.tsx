import { useId, type ReactNode } from 'react';

interface Props {
  title: ReactNode;
  children: ReactNode;
  open: boolean;
  onToggle: () => void;
}

/** A collapsible section. Controlled, so a parent can keep only one open at a time. */
export function Accordion({ title, children, open, onToggle }: Props) {
  const id = useId();
  return (
    <div className="accordion" data-open={open || undefined}>
      <h4 className="accordion__heading">
        <button
          type="button"
          className="accordion__summary"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
        >
          <span className="accordion__title">{title}</span>
          <svg className="accordion__chevron" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h4>
      {/* Animates via grid rows 0fr → 1fr, so the height needn't be measured. */}
      <div className="accordion__panel" id={id} role="region" inert={!open}>
        <div className="accordion__clip">
          <div className="accordion__body">{children}</div>
        </div>
      </div>
    </div>
  );
}
