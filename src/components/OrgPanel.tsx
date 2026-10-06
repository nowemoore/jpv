import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import { CLUSTERS_BY_ID, LAYERS, type Org } from '../data/orgs';
import { publicUrl } from '../publicUrl';
import { Accordion } from './Accordion';
import { LayerIcon } from './LayerIcon';

/** Render `[text](url)` in plain text as links; everything else stays text. */
function withLinks(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    out.push(text.slice(last, m.index));
    out.push(
      <a key={m.index} href={m[2]} target="_blank" rel="noreferrer">
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

interface Props {
  org: Org | null;
  onClose: () => void;
  ref?: Ref<HTMLElement>;
}

export function OrgPanel({ org: current, onClose, ref }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Keep showing the last org while the panel animates closed.
  const lastRef = useRef(current);
  if (current) lastRef.current = current;
  const org = current ?? lastRef.current;

  // Index of the one expanded question, if any.
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setOpenQuestion(null);
  }, [org?.id]);

  const info = org?.info;
  const cluster = org ? CLUSTERS_BY_ID.get(org.cluster) : undefined;
  // In stack order (top to bottom), whatever order the data lists them in.
  const layers = LAYERS.filter((l) => org?.layers?.includes(l.id));

  return (
    <aside ref={ref} className="panel" aria-label="Organisation details" aria-hidden={!current} inert={!current}>
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
              {org.logo && <img className="panel__logo" src={publicUrl(org.logo)} alt="" />}
              <h2 className="panel__title">{org.name}</h2>
            </div>

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
              {info.size && (
                <div>
                  <dt>Size</dt>
                  <dd>{info.size}</dd>
                </div>
              )}
              {info.url && (
                <div>
                  <dt>Website</dt>
                  <dd>
                    <a href={info.url} target="_blank" rel="noreferrer">
                      {new URL(info.url).hostname.replace(/^www\./, '')} ↗
                    </a>
                  </dd>
                </div>
              )}
              {layers.length > 0 && (
                <div>
                  <dt>Layers</dt>
                  <dd className="panel__layers">
                    {layers.map((l) => (
                      <span key={l.id} className="layer-tag">
                        <LayerIcon id={l.id} />
                        {l.label}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>

            <section
              className="panel__section panel__tldr"
              style={{ '--org-color': `var(${cluster.colorVar})` } as CSSProperties}
            >
              <h3>TL;DR</h3>
              <p>{withLinks(info.tldr)}</p>
            </section>

            {info.questions && info.questions.length > 0 && (
              <section className="panel__section panel__questions">
                {info.questions.map(({ q, a }, qi) => (
                  <Accordion
                    key={q}
                    title={q}
                    open={openQuestion === qi}
                    onToggle={() => setOpenQuestion(openQuestion === qi ? null : qi)}
                  >
                    {a.map((block, i) =>
                      typeof block === 'string' ? (
                        <p key={i}>{withLinks(block)}</p>
                      ) : (
                        <ul key={i}>
                          {block.map((item) => (
                            <li key={item}>{withLinks(item)}</li>
                          ))}
                        </ul>
                      ),
                    )}
                  </Accordion>
                ))}
              </section>
            )}

          </article>
        )}
      </div>
    </aside>
  );
}
