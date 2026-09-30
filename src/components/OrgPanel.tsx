import { useEffect, useRef } from 'react';
import { CLUSTERS_BY_ID, ORGS_BY_ID, type Org } from '../data/orgs';

interface Props {
  org: Org | null;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function OrgPanel({ org: current, onClose, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Keep showing the last org while the panel animates closed.
  const lastRef = useRef(current);
  if (current) lastRef.current = current;
  const org = current ?? lastRef.current;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [org?.id]);

  const info = org?.info;
  const cluster = org ? CLUSTERS_BY_ID.get(org.cluster) : undefined;

  return (
    <aside className="panel" aria-label="Organisation details" aria-hidden={!current} inert={!current}>
      <div className="panel__inner" ref={scrollRef}>
        {org && info && cluster && (
          <article>
            <header className="panel__header">
              <p className="panel__kicker" style={{ color: `var(${cluster.colorVar})` }}>
                {cluster.label}
              </p>
              <button type="button" className="panel__close" onClick={onClose} aria-label="Close panel">
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className="panel__identity">
              {org.logo && <img className="panel__logo" src={org.logo} alt="" />}
              <h2 className="panel__title">{org.name}</h2>
            </div>
            <p className="panel__tagline">{info.tagline}</p>

            {(info.founded || info.base) && (
              <dl className="panel__facts">
                {info.founded && (
                  <div>
                    <dt>Founded</dt>
                    <dd>{info.founded}</dd>
                  </div>
                )}
                {info.base && (
                  <div>
                    <dt>Based</dt>
                    <dd>{info.base}</dd>
                  </div>
                )}
              </dl>
            )}

            {info.sections.map((s) => (
              <section key={s.heading} className="panel__section">
                <h3>{s.heading}</h3>
                <p>{s.body}</p>
              </section>
            ))}

            {org.links && org.links.length > 0 && (
              <section className="panel__section">
                <h3>Connections</h3>
                <ul className="panel__links">
                  {org.links.map((l) => {
                    const other = ORGS_BY_ID.get(l.to);
                    if (!other) return null;
                    return (
                      <li key={l.to}>
                        {other.info ? (
                          <button type="button" onClick={() => onSelect(other.id)}>
                            {other.name}
                          </button>
                        ) : (
                          <strong>{other.name}</strong>
                        )}
                        <span>{l.note}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {info.url && (
              <a className="panel__visit" href={info.url} target="_blank" rel="noreferrer">
                Visit {new URL(info.url).hostname.replace(/^www\./, '')} ↗
              </a>
            )}
          </article>
        )}
      </div>
    </aside>
  );
}
