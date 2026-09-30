import { forwardRef, useEffect, useImperativeHandle, useRef, useSyncExternalStore } from 'react';
import { createConstellation, type Constellation } from './scene';
import type { GraphCluster } from './types';

export interface ConstellationHandle {
  recentre(): void;
}

interface Props {
  clusters: GraphCluster[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Pixels of the canvas covered by an overlay on the right / bottom (the panel). */
  insetRight?: number;
  insetBottom?: number;
  /** Ids of groups whose orgs are hidden. */
  hiddenGroups?: string[];
  className?: string;
}

const NONE: string[] = [];

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const subscribeReducedMotion = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

/**
 * 3D constellation of clusters. Must sit inside a sized parent: the canvas
 * fills it and tracks its size.
 */
export const ConstellationGraph = forwardRef<ConstellationHandle, Props>(function ConstellationGraph(
  { clusters, selectedId, onSelect, insetRight = 0, insetBottom = 0, hiddenGroups = NONE, className },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Constellation | null>(null);
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  const insetsRef = useRef({ right: insetRight, bottom: insetBottom });
  const hiddenRef = useRef(hiddenGroups);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // The whole scene is built here and rebuilt only when the data (or motion preference) changes.
  useEffect(() => {
    const scene = createConstellation(canvasRef.current!, {
      clusters,
      reducedMotion,
      onSelect: (id) => onSelectRef.current(id),
    });
    sceneRef.current = scene;
    scene.setInsets(insetsRef.current.right, insetsRef.current.bottom);
    scene.setHiddenGroups(hiddenRef.current, true);
    scene.setSelected(selectedRef.current);
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [clusters, reducedMotion]);

  useEffect(() => {
    selectedRef.current = selectedId;
    sceneRef.current?.setSelected(selectedId);
  }, [selectedId]);

  useEffect(() => {
    insetsRef.current = { right: insetRight, bottom: insetBottom };
    sceneRef.current?.setInsets(insetRight, insetBottom);
  }, [insetRight, insetBottom]);

  useEffect(() => {
    hiddenRef.current = hiddenGroups;
    sceneRef.current?.setHiddenGroups(hiddenGroups);
  }, [hiddenGroups]);

  useImperativeHandle(ref, () => ({ recentre: () => sceneRef.current?.recentre() }), []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
});
