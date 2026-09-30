import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { GraphCluster } from './types';

export interface ConstellationOptions {
  clusters: GraphCluster[];
  reducedMotion: boolean;
  onSelect: (id: string | null) => void;
}

export interface Constellation {
  /** Highlight an org. A non-null id also moves the camera to frame it. */
  setSelected(id: string | null): void;
  /** Restore the home camera and resume the idle drift. */
  recentre(): void;
  dispose(): void;
}

const HOME_POSITION = new THREE.Vector3(0, 3.2, 19);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);
const BASE_FOV = 42;
/** On portrait screens the vertical FOV widens up to this, so the graph isn't cropped at the sides. */
const MAX_FOV = 70;
const GOLDEN_ANGLE = 2.399963;
const NODE_RADIUS = 2.6;
/** Radius around the selected org that must stay in view: most of its group. */
const FOCUS_RADIUS = 3.6;
const SELECTED_SCALE = 1.15;
/** Opacity multiplier for every other label while one is selected. */
const UNSELECTED_DIM = 0.45;
const TWEEN_MS = 1100;
const CLICK_SLOP_PX = 4;

/** An org. Its label bubble is the node: there is no marker shape. */
interface NodeRecord {
  id: string;
  clickable: boolean;
  label: THREE.Sprite;
  baseScale: THREE.Vector3;
  baseOpacity: number;
  base: THREE.Vector3;
  phase: number;
  /** Half the bubble's width and height in world units at scale 1, excluding the shadow margin. */
  bubbleHalf: THREE.Vector2;
}

interface LinkLine {
  line: THREE.Line;
  positions: Float32Array;
}

/**
 * Camera move. Direction (target -> camera) is slerped and distance lerped
 * separately, so the camera arcs around the scene rather than cutting through it.
 */
interface Tween {
  start: number;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  fromDir: THREE.Vector3;
  toDir: THREE.Vector3;
  fromDist: number;
  /** Recomputed every frame so the framing tracks a canvas that is still resizing. */
  toDist: () => number;
  /** Whether the camera is back in the home framing when this ends. */
  home: boolean;
}

export function createConstellation(canvas: HTMLCanvasElement, opts: ConstellationOptions): Constellation {
  const { clusters, reducedMotion, onSelect } = opts;
  const host = canvas.parentElement!;

  // ---------------------------------------------------------------- colours
  const styles = getComputedStyle(canvas);
  const cssVar = (name: string) => styles.getPropertyValue(name).trim();
  const colors = {
    ground: cssVar('--color-ground'),
    ink: cssVar('--color-ink'),
    muted: cssVar('--color-muted'),
    surface: cssVar('--color-surface'),
    rule: cssVar('--color-rule'),
  };
  const fontFamily = cssVar('--font-utility') || 'sans-serif';

  // ---------------------------------------------------------------- disposal
  const disposables: { dispose(): void }[] = [];
  /** Set on teardown so late-arriving logo images don't touch disposed textures. */
  let disposed = false;
  const track = <T extends { dispose(): void }>(d: T): T => {
    disposables.push(d);
    return d;
  };

  // ---------------------------------------------------------------- renderer, scene, camera
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(new THREE.Color(colors.ground), 0.028);

  const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 200);
  camera.position.copy(HOME_POSITION);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 6;
  controls.maxDistance = 46;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.35;
  controls.target.copy(HOME_TARGET);

  let tween: Tween | null = null;
  let driftKilled = false;
  /** True until the camera leaves the home framing; while true, resizes re-fit it. */
  let atHome = true;
  const onControlsStart = () => {
    driftKilled = true;
    atHome = false;
    controls.autoRotate = false;
    tween = null;
  };
  controls.addEventListener('start', onControlsStart);

  // ---------------------------------------------------------------- labels
  const rgba = (css: string, a: number) => {
    const hex = new THREE.Color(css).getHex();
    return `rgba(${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255},${a})`;
  };

  /**
   * A pill-shaped label, optionally led by the org's logo. Two textures:
   * the resting pill (surface fill, thin border, text in the group colour) and
   * the selected pill (filled with the group colour, surface-coloured text).
   * The opaque fill hides links behind it.
   *
   * Text is measured in the same canvas it is drawn in, at the moment it is
   * drawn, so the pill always fits the font actually used. When a logo arrives
   * the whole label is redrawn and re-measured, and the sprite resized to match.
   */
  function makeLabel(
    text: string,
    o: { px: number; color: string; clickable: boolean; logo?: string },
  ): THREE.Sprite {
    const S = 3; // draw at 3x for sharpness
    const k = 1 / S / 66; // world scale = fontPx / 66: one canvas pixel (at 1x) is 1/66 of a world unit
    const font = `${o.clickable ? 600 : 400} ${o.px * S}px ${fontFamily}`;
    const padX = o.px * 0.8 * S;
    const padY = o.px * 0.42 * S;
    const bh = o.px * 1.2 * S + padY * 2;
    const logoSize = o.logo ? o.px * 1.25 * S : 0;
    const inset = o.px * 0.65 * S;
    const lead = o.logo ? inset + logoSize + o.px * 0.4 * S : padX;
    const margin = o.px * 0.5 * S; // room for the drop shadow
    const border = 1.2 * S;

    function draw(selected: boolean, img: HTMLImageElement | null) {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d')!;
      ctx.font = font;
      const textW = Math.ceil(ctx.measureText(text).width);
      const bw = lead + textW + padX;
      c.width = Math.ceil(bw + margin * 2);
      c.height = Math.ceil(bh + margin * 2);
      const x = (c.width - bw) / 2;
      const y = (c.height - bh) / 2;

      ctx.beginPath();
      ctx.roundRect(x + border / 2, y + border / 2, bw - border, bh - border, bh / 2);
      ctx.shadowColor = rgba(colors.ink, selected ? 0.22 : 0.1);
      ctx.shadowBlur = o.px * (selected ? 0.5 : 0.3) * S;
      ctx.shadowOffsetY = o.px * 0.08 * S;
      ctx.fillStyle = selected ? o.color : colors.surface;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = border;
      ctx.strokeStyle = selected ? o.color : o.clickable ? rgba(o.color, 0.45) : colors.rule;
      ctx.stroke();

      if (img) {
        // Contain the logo in a square slot, vertically centred on the text.
        const r = Math.min(logoSize / img.naturalWidth, logoSize / img.naturalHeight);
        const w = img.naturalWidth * r;
        const h = img.naturalHeight * r;
        ctx.drawImage(img, x + inset + (logoSize - w) / 2, y + (bh - h) / 2, w, h);
      }

      ctx.font = font; // resizing the canvas reset it
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = selected ? colors.surface : o.color;
      // maxWidth: never let the text run past its slot, whatever the font does.
      ctx.fillText(text, x + lead, y + bh / 2 + o.px * 0.04 * S, textW);

      const tex = track(new THREE.CanvasTexture(c));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      return { tex, width: c.width, height: c.height, bw };
    }

    const mat = track(new THREE.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false }));
    const sprite = new THREE.Sprite(mat);
    // Same renderOrder for every label, so three sorts them back to front and near labels draw on top.
    sprite.renderOrder = 10;
    // Owned here and updated in place on redraw; the node record holds the same objects.
    const baseScale = new THREE.Vector3();
    const bubbleHalf = new THREE.Vector2();
    sprite.userData.baseScale = baseScale;
    sprite.userData.bubbleHalf = bubbleHalf;

    function render(img: HTMLImageElement | null) {
      const old = sprite.userData.textures as { resting: THREE.Texture; selected: THREE.Texture } | undefined;
      const wasSelected = old ? mat.map === old.selected && old.selected !== old.resting : false;
      const ratio = old ? sprite.scale.y / baseScale.y : 1;

      const resting = draw(false, img);
      const selected = o.clickable ? draw(true, img) : resting;
      sprite.userData.textures = { resting: resting.tex, selected: selected.tex };
      mat.map = wasSelected ? selected.tex : resting.tex;
      mat.needsUpdate = true;
      baseScale.set(resting.width * k, resting.height * k, 1);
      sprite.scale.copy(baseScale).multiplyScalar(ratio);
      bubbleHalf.set((resting.bw * k) / 2, (bh * k) / 2);

      if (old) {
        old.resting.dispose();
        if (old.selected !== old.resting) old.selected.dispose();
      }
    }

    render(null);
    if (o.logo) {
      const img = new Image();
      img.onload = () => {
        if (!disposed) render(img);
      };
      img.src = o.logo;
    }
    return sprite;
  }

  function makeLine(color: THREE.Color): LinkLine {
    const positions = new Float32Array(6);
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = track(
      new THREE.LineDashedMaterial({ color, transparent: true, opacity: 0.55, dashSize: 0.05, gapSize: 0.04 }),
    );
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    return { line, positions };
  }

  function setLine(l: LinkLine, a: THREE.Vector3, b: THREE.Vector3) {
    l.positions.set([a.x, a.y, a.z, b.x, b.y, b.z]);
    const attr = l.line.geometry.getAttribute('position') as THREE.BufferAttribute;
    attr.needsUpdate = true;
    l.line.geometry.computeBoundingSphere();
    // Without line distances a dashed material renders solid.
    l.line.computeLineDistances();
  }

  // ---------------------------------------------------------------- build
  const nodes: NodeRecord[] = [];
  const nodeById = new Map<string, NodeRecord>();

  // Each group gathers around an invisible centre on a ring, nudged vertically
  // so the ring is not flat. Nothing is drawn at the centre.
  const ringRadius = 4.6 + clusters.length * 0.35;
  clusters.forEach((cluster, i) => {
    const colorCss = cssVar(cluster.colorVar) || colors.ink;
    const angle = (i / Math.max(clusters.length, 1)) * Math.PI * 2 - Math.PI / 4;
    const centre = new THREE.Vector3(
      Math.cos(angle) * ringRadius,
      Math.sin(i * 2.3 + 0.7) * 0.9,
      Math.sin(angle) * ringRadius,
    );

    // Orgs on a sphere around the centre, spread by the golden angle and
    // pushed slightly outward from the origin so groups don't crowd the middle.
    const outward = centre.clone().setY(0).normalize().multiplyScalar(0.45);
    const n = cluster.children.length;
    cluster.children.forEach((node, j) => {
      const y = 1 - ((j + 0.5) / n) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = j * GOLDEN_ANGLE + i;
      const base = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r)
        .multiplyScalar(NODE_RADIUS)
        .add(centre)
        .add(outward);

      // Colour marks the group; weight and border mark whether it opens a panel.
      const label = makeLabel(node.label, { px: 13, color: colorCss, clickable: node.clickable, logo: node.logo });
      label.position.copy(base);
      label.userData.id = node.id;
      scene.add(label);

      const rec: NodeRecord = {
        id: node.id,
        clickable: node.clickable,
        label,
        baseScale: label.userData.baseScale as THREE.Vector3,
        baseOpacity: node.clickable ? 1 : 0.75,
        bubbleHalf: label.userData.bubbleHalf as THREE.Vector2,
        base,
        phase: (i * 7 + j) * 1.618,
      };
      nodes.push(rec);
      nodeById.set(node.id, rec);
    });
  });

  // Dashed links between orgs, deduplicated and coloured by the org they start from.
  const links: { a: NodeRecord; b: NodeRecord; line: LinkLine }[] = [];
  const seen = new Set<string>();
  clusters.forEach((cluster) => {
    const color = new THREE.Color(cssVar(cluster.colorVar) || colors.ink);
    cluster.children.forEach((node) => {
      node.links?.forEach((to) => {
        const key = [node.id, to].sort().join('|');
        const a = nodeById.get(node.id);
        const b = nodeById.get(to);
        if (!a || !b || seen.has(key)) return;
        seen.add(key);
        const line = makeLine(color);
        links.push({ a, b, line });
      });
    });
  });

  const viewA = new THREE.Vector3();
  const viewB = new THREE.Vector3();
  const endA = new THREE.Vector3();
  const endB = new THREE.Vector3();

  /**
   * Distance (as a fraction of the segment, in screen space) from a label's
   * centre to the edge of its pill, along direction (dx, dy). The pill is a
   * stadium: a straight middle with semicircular ends. All values are at
   * depth 1, i.e. x/w and y/w in view space.
   */
  function exitFraction(n: NodeRecord, w: number, dx: number, dy: number): number {
    const len = Math.hypot(dx, dy);
    if (len === 0) return Infinity;
    const k = (n.label.scale.y / n.baseScale.y) / w;
    const r = n.bubbleHalf.y * k; // end-cap radius
    const a = Math.max(0, n.bubbleHalf.x * k - r); // half-length of the straight middle
    const ux = dx / len;
    const uy = dy / len;
    // Leaving through the flat top or bottom edge?
    if (uy !== 0) {
      const t = r / Math.abs(uy);
      if (Math.abs(t * ux) <= a) return t / len;
    }
    // Otherwise through the round end: the ray meets the cap circle centred at (±a, 0).
    const cx = Math.sign(ux) * a;
    const b = ux * cx;
    const t = b + Math.sqrt(b * b - cx * cx + r * r);
    return t / len;
  }

  /** Run the link from pill edge to pill edge rather than centre to centre, as seen from the camera. */
  function trimLink(l: { a: NodeRecord; b: NodeRecord; line: LinkLine }) {
    const A = l.a.label.position;
    const B = l.b.label.position;
    viewA.copy(A).applyMatrix4(camera.matrixWorldInverse);
    viewB.copy(B).applyMatrix4(camera.matrixWorldInverse);
    const wA = -viewA.z;
    const wB = -viewB.z;
    if (wA <= camera.near || wB <= camera.near) {
      l.line.line.visible = true;
      setLine(l.line, A, B);
      return;
    }
    const dx = viewB.x / wB - viewA.x / wA;
    const dy = viewB.y / wB - viewA.y / wA;
    const sA = exitFraction(l.a, wA, dx, dy);
    const sB = 1 - exitFraction(l.b, wB, dx, dy);
    // The labels overlap on screen: there is no visible stretch of line to draw.
    l.line.line.visible = sA < sB;
    if (!l.line.line.visible) return;
    // Screen-space fractions to 3D ones: 1/w, not w, interpolates linearly on screen.
    const toWorld = (sc: number) => (sc * wA) / ((1 - sc) * wB + sc * wA);
    endA.lerpVectors(A, B, toWorld(sA));
    endB.lerpVectors(A, B, toWorld(sB));
    setLine(l.line, endA, endB);
  }

  const clickableLabels = nodes.filter((n) => n.clickable).map((n) => n.label);

  // ---------------------------------------------------------------- selection
  let selectedId: string | null = null;

  function applySelectionVisuals() {
    for (const n of nodes) {
      const on = n.id === selectedId;
      n.label.scale.copy(n.baseScale).multiplyScalar(on ? SELECTED_SCALE : 1);
      const { resting, selected } = n.label.userData.textures as Record<string, THREE.Texture>;
      (n.label.material as THREE.SpriteMaterial).map = on ? selected : resting;
    }
  }

  /** Distance at which a sphere of `radius` fits the current viewport on both axes. */
  function fitDistance(radius: number): number {
    const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
    const d = radius / Math.sin(Math.min(vHalf, hHalf));
    return THREE.MathUtils.clamp(d, controls.minDistance, controls.maxDistance);
  }

  function startTween(toTarget: THREE.Vector3, toDir: THREE.Vector3, toDist: () => number, home = false) {
    const offset = camera.position.clone().sub(controls.target);
    atHome = false;
    tween = {
      home,
      start: performance.now(),
      fromTarget: controls.target.clone(),
      toTarget: toTarget.clone(),
      fromDir: offset.clone().normalize(),
      toDir: toDir.clone().normalize(),
      fromDist: offset.length(),
      toDist,
    };
    if (reducedMotion) stepTween(1);
  }

  const tweenRotation = new THREE.Quaternion();
  const tweenStep = new THREE.Quaternion();
  const tweenDir = new THREE.Vector3();

  /** Place the camera at progress k (0..1, already eased). Ends the tween at k = 1. */
  function stepTween(k: number) {
    if (!tween) return;
    tweenRotation.setFromUnitVectors(tween.fromDir, tween.toDir);
    tweenStep.identity().slerp(tweenRotation, k);
    tweenDir.copy(tween.fromDir).applyQuaternion(tweenStep);
    const dist = THREE.MathUtils.lerp(tween.fromDist, tween.toDist(), k);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, k);
    camera.position.copy(controls.target).addScaledVector(tweenDir, dist);
    if (k >= 1) {
      atHome = tween.home;
      tween = null;
    }
  }

  // Radius of the whole graph on the ground plane: ring, group spread, outward push, label room.
  const graphRadius = ringRadius + NODE_RADIUS + 0.45 + 0.4;

  /** Home distance: the default view, or further back if the ring wouldn't fit the canvas width. */
  function homeDistance(): number {
    const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
    const fitWidth = graphRadius / Math.sin(hHalf);
    return THREE.MathUtils.clamp(
      Math.max(HOME_POSITION.distanceTo(HOME_TARGET), fitWidth),
      controls.minDistance,
      controls.maxDistance,
    );
  }

  function focusOn(rec: NodeRecord) {
    // View the org from outside the ring, slightly above, so its own group
    // sits around it and the rest of the graph falls away behind into the fog.
    const outward = rec.base.clone().setY(0);
    if (outward.lengthSq() < 1e-6) outward.set(0, 0, 1);
    const dir = outward.normalize().add(new THREE.Vector3(0, 0.3, 0));
    startTween(rec.base, dir, () => fitDistance(FOCUS_RADIUS));
  }

  // ---------------------------------------------------------------- pointer
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down: { x: number; y: number } | null = null;

  function pick(e: PointerEvent): NodeRecord | null {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    // Sprites are hit across their whole quad, so the full label is the click target.
    const hit = raycaster.intersectObjects(clickableLabels, false)[0];
    return hit ? (nodeById.get(hit.object.userData.id as string) ?? null) : null;
  }

  const onPointerDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > CLICK_SLOP_PX;
    down = null;
    if (moved) return; // an orbit drag never selects
    const rec = pick(e);
    onSelect(rec ? rec.id : null);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (e.buttons !== 0) return;
    canvas.style.cursor = pick(e) ? 'pointer' : '';
  };
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointermove', onPointerMove);

  // ---------------------------------------------------------------- resize
  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the horizontal view at least as wide as a square canvas's would be.
    const baseTan = Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2));
    const vTan = Math.max(baseTan, baseTan / camera.aspect);
    camera.fov = Math.min(MAX_FOV, THREE.MathUtils.radToDeg(2 * Math.atan(vTan)));
    camera.updateProjectionMatrix();
    if (atHome) {
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(dir, homeDistance());
    }
    renderFrame(performance.now());
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  // ---------------------------------------------------------------- loop
  const easeInOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  function renderFrame(now: number) {
    const t = now / 1000;

    if (!reducedMotion) {
      for (const n of nodes) {
        n.label.position.set(
          n.base.x + Math.sin(t * 0.35 + n.phase) * 0.09,
          n.base.y + Math.cos(t * 0.29 + n.phase) * 0.09,
          n.base.z + Math.sin(t * 0.23 + n.phase) * 0.09,
        );
      }
    }

    if (tween) {
      stepTween(easeInOutCubic(Math.min(1, (now - tween.start) / TWEEN_MS)));
      controls.autoRotate = !tween && !driftKilled && !reducedMotion;
    }
    controls.update();
    camera.updateMatrixWorld();
    for (const l of links) trimLink(l);

    for (const n of nodes) {
      const d = n.label.position.distanceTo(camera.position);
      const fade = n.id === selectedId ? 1 : THREE.MathUtils.clamp(1.8 - d / 22, 0.15, 1) * n.baseOpacity;
      const dim = selectedId && n.id !== selectedId ? UNSELECTED_DIM : 1;
      (n.label.material as THREE.SpriteMaterial).opacity = fade * dim;
    }

    renderer.render(scene, camera);
  }

  // Only run while the canvas is on screen and the tab is visible.
  let raf = 0;
  let inView = true;
  const tick = (now: number) => {
    renderFrame(now);
    raf = requestAnimationFrame(tick);
  };
  function syncLoop() {
    const shouldRun = inView && !document.hidden;
    if (shouldRun && !raf) raf = requestAnimationFrame(tick);
    if (!shouldRun && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }
  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncLoop();
  });
  intersection.observe(host);
  document.addEventListener('visibilitychange', syncLoop);

  resize();
  syncLoop();

  // ---------------------------------------------------------------- api
  return {
    setSelected(id) {
      selectedId = id && nodeById.get(id)?.clickable ? id : null;
      applySelectionVisuals();
      const rec = selectedId ? nodeById.get(selectedId) : undefined;
      if (rec) focusOn(rec);
    },

    recentre() {
      driftKilled = false;
      startTween(HOME_TARGET, HOME_POSITION.clone().sub(HOME_TARGET), homeDistance, true);
    },

    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', syncLoop);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      controls.removeEventListener('start', onControlsStart);
      controls.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
    },
  };
}
