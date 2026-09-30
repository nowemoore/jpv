import { useCallback, useEffect, useRef, useState } from 'react';
import { ConstellationGraph, type ConstellationHandle } from './constellation/ConstellationGraph';
import { OrgPanel } from './components/OrgPanel';
import { CLUSTERS, GRAPH, ORGS, ORGS_BY_ID } from './data/orgs';

export default function App() {
  const graphRef = useRef<ConstellationHandle>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? (ORGS_BY_ID.get(selectedId) ?? null) : null;

  const select = useCallback((id: string | null) => {
    setSelectedId(id && ORGS_BY_ID.get(id)?.info ? id : null);
  }, []);

  const recentre = () => {
    setSelectedId(null);
    graphRef.current?.recentre();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="stage" data-open={selected ? '' : undefined}>
      <div className="stage__canvas">
        <ConstellationGraph ref={graphRef} clusters={GRAPH} selectedId={selectedId} onSelect={select} />

        <header className="stage__title">
          <h1>Who Works on What in AI Safety</h1>
          <ul className="stage__legend" aria-label="Colour key">
            {CLUSTERS.map((c) => (
              <li key={c.id}>
                <span className="stage__swatch" style={{ background: `var(${c.colorVar})` }} />
                {c.label}
              </li>
            ))}
          </ul>
        </header>

        <div className="stage__controls">
          <button type="button" className="stage__button" onClick={recentre}>
            Recentre
          </button>
          <span className="stage__hint">Drag to orbit · scroll to zoom · click a node</span>
        </div>

        {/* Keyboard and screen-reader route to the same selections the canvas offers. */}
        <nav className="stage__index" aria-label="Organisations">
          {CLUSTERS.map((c) => {
            const orgs = ORGS.filter((o) => o.cluster === c.id && o.info);
            if (orgs.length === 0) return null;
            return (
              <div key={c.id}>
                <p>{c.label}</p>
                <ul>
                  {orgs.map((o) => (
                    <li key={o.id}>
                      <button type="button" aria-pressed={o.id === selectedId} onClick={() => select(o.id)}>
                        {o.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>

      <OrgPanel org={selected} onClose={() => setSelectedId(null)} onSelect={select} />
  </main>
  );
}
