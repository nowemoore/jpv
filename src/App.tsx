import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ConstellationGraph, type ConstellationHandle } from './constellation/ConstellationGraph';
import { LayerIcon } from './components/LayerIcon';
import { OrgPanel } from './components/OrgPanel';
import { CLUSTERS, GRAPH, LAYERS, ORGS, ORGS_BY_ID, type ClusterId, type LayerId, type Org } from './data/orgs';

export default function App() {
  const graphRef = useRef<ConstellationHandle>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hiddenGroups, setHiddenGroups] = useState<ClusterId[]>([]);
  const [hiddenLayers, setHiddenLayers] = useState<LayerId[]>([]);
  // Same rule as the map: type chip on, and (if tagged) at least one of its layers on.
  const isVisible = (o: Org, groups = hiddenGroups, layers = hiddenLayers) =>
    !groups.includes(o.cluster) && (!o.layers?.length || o.layers.some((l) => !layers.includes(l)));
  const selected = selectedId ? (ORGS_BY_ID.get(selectedId) ?? null) : null;
  const open = selected !== null;

  // The panel slides over the map rather than squeezing it, so tell the map
  // how much of it the panel covers: its width beside the map, or its height
  // as a bottom sheet on narrow screens (same breakpoint as app.css).
  const panelRef = useRef<HTMLElement>(null);
  const [insets, setInsets] = useState({ right: 0, bottom: 0 });
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const measure = () => {
      const sheet = window.matchMedia('(max-width: 720px)').matches;
      setInsets(
        !open ? { right: 0, bottom: 0 } : sheet ? { right: 0, bottom: el.offsetHeight } : { right: el.offsetWidth, bottom: 0 },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  // The title block sits over the top of the map; centre the graph in the space below it.
  const titleRef = useRef<HTMLElement>(null);
  const [titleInset, setTitleInset] = useState(0);
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const measure = () => setTitleInset(el.offsetTop + el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const select = useCallback((id: string | null) => {
    setSelectedId(id && ORGS_BY_ID.get(id)?.info ? id : null);
  }, []);

  const toggleGroup = (id: ClusterId) => {
    const next = hiddenGroups.includes(id) ? hiddenGroups.filter((g) => g !== id) : [...hiddenGroups, id];
    setHiddenGroups(next);
    // Close the panel if its org just disappeared.
    if (selected && !isVisible(selected, next)) setSelectedId(null);
  };

  const toggleLayer = (id: LayerId) => {
    const next = hiddenLayers.includes(id) ? hiddenLayers.filter((l) => l !== id) : [...hiddenLayers, id];
    setHiddenLayers(next);
    if (selected && !isVisible(selected, hiddenGroups, next)) setSelectedId(null);
  };

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
    <main className="stage" data-open={open ? '' : undefined}>
      <div className="stage__canvas">
        <ConstellationGraph
          ref={graphRef}
          clusters={GRAPH}
          selectedId={selectedId}
          onSelect={select}
          insetRight={insets.right}
          insetBottom={insets.bottom}
          insetTop={titleInset}
          hiddenGroups={hiddenGroups}
          hiddenLayers={hiddenLayers}
        />

        <header ref={titleRef} className="stage__title">
          <h1>Who Works on What</h1>
          <p>Browse orgs operating in AI Safety: in-depth info about their purpose, track record, and open priorities. Filter based on your interest. </p>
          <ul className="stage__filters" aria-label="Show groups">
            {CLUSTERS.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="stage__chip"
                  aria-pressed={!hiddenGroups.includes(c.id)}
                  onClick={() => toggleGroup(c.id)}
                  style={{ '--chip': `var(${c.colorVar})` } as CSSProperties}
                >
                  <span className="stage__swatch" />
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
          <ul className="stage__filters" aria-label="Show layers">
            {LAYERS.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className="stage__chip stage__chip--plain"
                  aria-pressed={!hiddenLayers.includes(l.id)}
                  onClick={() => toggleLayer(l.id)}
                  title={l.sublabel}
                >
                  <LayerIcon id={l.id} size={14} />
                  {l.label}
                </button>
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
            const orgs = ORGS.filter((o) => o.cluster === c.id && o.info && isVisible(o));
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

      <OrgPanel ref={panelRef} org={selected} onClose={() => setSelectedId(null)} />
  </main>
  );
}
