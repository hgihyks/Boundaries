import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Minimal, self-contained Past page with:
// - Pure SVG procedural tree
// - Probability -> opacity/thickness
// - Hover tooltips
// - Click to navigate to /thought
// - Toggleable inflection point markers with popups
// - Basic zoom/pan, state restored on back via sessionStorage

export default function Past() {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [hover, setHover] = useState(null); // {id, name, p}
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [showMarkers, setShowMarkers] = useState(() => loadState().showMarkers ?? false);
  const [zoom, setZoom] = useState(() => loadState().zoom ?? { k: 1, x: 0, y: 0 });
  const seed = useMemo(() => loadState().seed ?? String(Math.floor(Math.random() * 1e9)), []);
  const subjectName = 'Aakriti';

  // Resize handling
  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Persist basic state on unmount
  useEffect(() => {
    saveState({ seed, showMarkers, zoom });
  }, [seed, showMarkers, zoom]);

  // Procedurally generate branches
  const tree = useMemo(() => generateTree({ seed, width: viewport.width, height: viewport.height, subjectName }), [seed, viewport, subjectName]);

  // Mouse move for tooltip
  const onMouseMove = (e) => {
    setMouse({ x: e.clientX, y: e.clientY });
  };

  // Zoom/pan (wheel to zoom, drag to pan)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let isPanning = false;
    let last = { x: 0, y: 0 };

    const getPoint = (e) => ({ x: e.clientX, y: e.clientY });

    const onWheel = (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = -e.deltaY;
      const factor = Math.exp(delta * 0.001); // smooth zoom
      setZoom((z) => {
        const newK = clamp(z.k * factor, 0.5, 3);
        // zoom around mouse
        const x = mx - (mx - z.x) * (newK / z.k);
        const y = my - (my - z.y) * (newK / z.k);
        return { k: newK, x, y };
      });
    };

    const onDown = (e) => {
      isPanning = true;
      last = getPoint(e);
    };
    const onMove = (e) => {
      if (!isPanning) return;
      const p = getPoint(e);
      const dx = p.x - last.x;
      const dy = p.y - last.y;
      last = p;
      setZoom((z) => ({ ...z, x: z.x + dx, y: z.y + dy }));
    };
    const onUp = () => { isPanning = false; };

    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleBranchClick = (b) => {
    navigate(`/thought?branchId=${encodeURIComponent(b.id)}&p=${b.probability.toFixed(2)}&seed=${seed}`);
  };

  const [markerPopup, setMarkerPopup] = useState(null); // {left, top, text}

  const toggleMarkers = () => setShowMarkers((s) => !s);

  // Helper to transform SVG coordinates to screen for popup positioning
  const svgToScreen = (pt) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: zoom.x + pt.x * zoom.k + rect.left, y: zoom.y + pt.y * zoom.k + rect.top };
  };

  return (
    <div style={styles.container}>
      <svg ref={svgRef} width={viewport.width} height={viewport.height} onMouseMove={onMouseMove} style={styles.svg}>
        <defs>
          {/* Gradient for non-primary branches: deep indigo → fuchsia → rose */}
          <linearGradient id="branchGradient" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={viewport.width} y2={0}>
            <stop offset="0%" stopColor="#000814" />        {/* deep indigo */}
            <stop offset="20%" stopColor="#001D3D" />       {/* indigo */}
            <stop offset="40%" stopColor="#003566" />       {/* violet */}
            <stop offset="60%" stopColor="#0077B6" />       {/* fuchsia */}
            <stop offset="80%" stopColor="#90E0EF" />       {/* pink */}
            <stop offset="100%" stopColor="#CAF0F8" />      {/* rose */}
          </linearGradient>
          {/* Darker gradient for the primary branch */}
          <linearGradient id="primaryGradient" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={viewport.width} y2={0}>
            <stop offset="0%" stopColor="#001F3F" />        {/* near-black blue */}
            <stop offset="20%" stopColor="#003C7E" />       {/* dark indigo */}
            <stop offset="40%" stopColor="#0074D9" />       {/* deep violet */}
            <stop offset="60%" stopColor="#39CCCC" />       {/* violet */}
            <stop offset="80%" stopColor="#7FDBFF" />       {/* dark rose */}
            <stop offset="95%" stopColor="#B3FFFF" />      {/* rose */}
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={viewport.width} height={viewport.height} fill="#05092e" />
        <g transform={`translate(${zoom.x},${zoom.y}) scale(${zoom.k})`}>
          {tree.branches
            .slice()
            .sort((a, b) => a.probability - b.probability)
            .map((b) => {
              const isHovered = hover?.id === b.id;
              const strokeWidth = (b.isPrimary ? 5 : 1 + b.probability * 5) + (isHovered ? 1.5 : 0);
              const strokeOpacity = clamp(0.25 + b.probability * 0.75, 0.25, 1);
              const color = b.isPrimary ? 'url(#primaryGradient)' : 'url(#branchGradient)';
              return (
                <path
                  key={b.id}
                  d={pointsToPath(b.path)}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ cursor: 'pointer' }}
                  pointerEvents="stroke"
                  onMouseEnter={() => setHover({ id: b.id, name: b.isPrimary ? 'The Past' : (b.isSecondary ? 'Alternate Past #13' : `Alternate Past #${b.labelNumber}`), p: b.probability, isPrimary: b.isPrimary })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => handleBranchClick(b)}
                />
              );
            })}

          {showMarkers && tree.branches.map((b) => (
            <g key={`m-${b.id}`}>
              {b.inflectionPoints.map((m) => {
                const pt = pointOnPath(b.path, m.t);
                return (
                  <circle
                    key={m.id}
                    cx={pt.x}
                    cy={pt.y}
                    r={4}
                    fill="#eb400c"
                    stroke="#B08900"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const screen = svgToScreen(pt);
                      const MARGIN = 12;
                      const POPUP_W = 280; // matches styles.popup maxWidth
                      const POPUP_H = 180; // conservative estimate
                      let left = screen.x + MARGIN;
                      let top = screen.y + MARGIN;
                      // Flip horizontally if overflowing right edge
                      if (left + POPUP_W > window.innerWidth - MARGIN) {
                        left = Math.max(MARGIN, screen.x - POPUP_W - MARGIN);
                      }
                      // Clamp within vertical bounds
                      if (top + POPUP_H > window.innerHeight - MARGIN) {
                        top = Math.max(MARGIN, window.innerHeight - POPUP_H - MARGIN);
                      }
                      setMarkerPopup({ left, top, text: m.text });
                    }}
                  />
                );
              })}
            </g>
          ))}
        </g>
      </svg>

      {hover && (
        <div style={{ ...styles.tooltip, left: mouse.x + 12, top: mouse.y + 12 }}>
          <div style={styles.tooltipTitle}>{hover.name}</div>
          {!hover.isPrimary && (
            <div style={styles.tooltipSub}>Probability: {hover.p.toFixed(2)}</div>
          )}
        </div>
      )}

      {markerPopup && (
        <div style={{ ...styles.popup, left: markerPopup.left, top: markerPopup.top }}>
          <div style={styles.popupText}>{markerPopup.text}</div>
          <button style={styles.popupClose} onClick={() => setMarkerPopup(null)}>Close</button>
        </div>
      )}

      <button style={styles.fab} onClick={toggleMarkers}>{showMarkers ? 'Hide Inflection Points' : 'Show Inflection Points'}</button>
    </div>
  );
}

// ------------------------ Procedural generation ------------------------

function generateTree({ seed, width, height, subjectName }) {
  const rng = mulberry32(hashCode(seed));
  const centerY = height * 0.5;
  const left = 0;
  const right = width;
  const amplitude = height * 0.80;
  const branchCount = 50;

  // Layered layout: monotone rightward x positions
  const layers = Math.max(8, Math.floor(width / 140));
  const xs = Array.from({ length: layers }, (_, i) => lerp(left, right, i / (layers - 1)));

  // Primary backbone along center with subtle variation
  const primaryPoints = xs.map((x) => ({ x, y: centerY + (rng() * 2 - 1) * amplitude * 0.03 }));
  const primary = {
    id: 'primary',
    labelNumber: 0,
    isPrimary: true,
    probability: 1,
    path: makeSmoothPath(primaryPoints),
    inflectionPoints: [
      { id: 'p-m0', t: 0.20, text: 'Seekers of meaning may not find meaning but they do find each other.' },
      { id: 'p-m1', t: 0.45, text: 'Hindsight. Insight. Foresight.' },
      { id: 'p-m2', t: 0.50, text: `${subjectName} fractures her ankle during a badminton match. Time: 9 years ago` },
      { id: 'p-m3', t: 0.85, text: `${subjectName} joins IIAI as a research associate. Time: 1 year ago` },
      { id: 'p-m4', t: 0.999, text: `${subjectName} discovers the truth about free will. Time: 2 mintues ago` },
    ]
  };

  const branches = [primary];
  let labelCounter = 1;

  // Secondary branch: splits from primary at 50% and runs nearly parallel
  {
    const splitLayer = Math.max(1, Math.floor((layers - 1) * 0.5));
    const offset = 20; // px vertical offset from primary
    const secPoints = [];
    for (let l = splitLayer; l < layers; l++) {
      const x = xs[l];
      const t = l / (layers - 1);
      const base = pointOnPath(primary.path, t);
      const ease = l === splitLayer ? 0 : Math.min(1, (l - splitLayer) / 3);
      const y = base.y + offset * ease;
      const yReserved = y; // no lane reservation to keep close to primary
      secPoints.push({ x, y: yReserved });
    }
    if (secPoints.length >= 2) {
      branches.push({
        id: 'secondary',
        labelNumber: labelCounter++,
        isPrimary: false,
        isSecondary: true,
        probability: 0.75,
        path: makeSmoothPath(secPoints),
        inflectionPoints: [
          { id: 's-m0', t: 0.15, text: `${subjectName} loses the semi finals in Nationals and gets depressed. Time: 8 years ago` },
          { id: 's-m1', t: 0.46, text: `${subjectName} finds out that she is adopted. Time: 4 year ago` },
          { id: 's-m2', t: 0.56, text: `${subjectName} bullies her adoptive father. Time: 4 years ago` },
          { id: 's-m3', t: 0.75, text: `${subjectName} meets her half-sister. Time: 3 years ago` },
          { id: 's-m4', t: 0.99, text: `${subjectName} leaves for Punjab in search for her biological parents. Time: 4 hours ago` },
        ],
      });
    }
  }

  // Track gentle vertical lanes per layer to reduce crossings
  const layerBands = xs.map(() => []);
  const reserveLane = (layerIdx, y, minGap) => {
    const band = layerBands[layerIdx];
    for (let i = 0; i < band.length; i++) {
      if (Math.abs(band[i] - y) < minGap) {
        y = band[i] + Math.sign(y - band[i]) * minGap;
      }
    }
    band.push(y);
    return y;
  };

  const readPrimaryY = (t) => pointOnPath(primary.path, t).y;

  for (let i = 0; i < branchCount; i++) {
    const startLayer = 1 + Math.floor(rng() * Math.min(4, layers - 3));
    const driftSign = rng() < 0.5 ? -1 : 1;
    const baseT = startLayer / (layers - 1);
    const startOnPrimary = { x: xs[startLayer], y: readPrimaryY(baseT) };

    const targetY = clamp(centerY + driftSign * amplitude * (0.15 + rng() * 0.6), centerY - amplitude, centerY + amplitude);

    let points = [ startOnPrimary ];
    let currentY = startOnPrimary.y;
    for (let l = startLayer + 1; l < layers; l++) {
      const x = xs[l];
      const tProgress = (l - startLayer) / (layers - startLayer - 1);
      const smooth = tProgress * tProgress * (3 - 2 * tProgress);
      const bandNoise = (rng() * 2 - 1) * amplitude * 0.06 * (1 - tProgress);
      const desired = lerp(currentY, targetY, 0.15 + 0.5 * smooth) + bandNoise;
      currentY = clamp(desired, centerY - amplitude, centerY + amplitude);
      const y = reserveLane(l, currentY, 12);
      points.push({ x, y });
    }

    // End behavior: most branches terminate independently on the right.
    // Occasionally merge into a NON-primary branch if a close endpoint exists.
    const end = points[points.length - 1];
    const shouldMerge = rng() < 0.60; // ~22% may merge
    if (shouldMerge) {
      let mergeTarget = null;
      let bestDy = Infinity;
      for (let b = 0; b < branches.length; b++) {
        const br = branches[b];
        if (br.isPrimary) continue; // never merge into primary
        const tEnd = br.path[br.path.length - 1];
        const dy = Math.abs(tEnd.y - end.y);
        if (dy < bestDy && dy < 36) { mergeTarget = tEnd; bestDy = dy; }
      }
      if (mergeTarget) {
        points[points.length - 1] = { x: mergeTarget.x, y: mergeTarget.y };
      } else {
        // terminate independently with slight jitter to avoid stacking
        const lastIdx = points.length - 1;
        points[lastIdx] = { x: points[lastIdx].x, y: points[lastIdx].y + (rng() * 2 - 1) * 4 };
      }
    } else {
      const lastIdx = points.length - 1;
      points[lastIdx] = { x: points[lastIdx].x, y: points[lastIdx].y + (rng() * 2 - 1) * 4 };
    }

    const path = makeSmoothPath(points);
    const prob = clamp(Math.pow(rng(), 2) * 0.85 + 0.1, 0.03, 0.98);
    const b = { id: `b-${i}`, labelNumber: labelCounter++, isPrimary: false, probability: prob, path, inflectionPoints: [] };

    // 0-2 markers
    const markerCount = rng() < 0.5 ? 1 : 2;
    for (let m = 0; m < markerCount; m++) {
      const t = clamp(0.12 + rng() * 0.7, 0.1, 0.9);
      b.inflectionPoints.push({ id: `${b.id}-m${m}`, t, text: `Inflection on #${b.labelNumber} @ ${(t * 100).toFixed(0)}%` });
    }

    branches.push(b);
  }

  return { branches };
}

// ------------------------ Geometry helpers ------------------------

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function noise(rng) { return rng() * 2 - 1; }

// Convert a short polyline into a denser smooth polyline
function makeSmoothPath(points) {
  // Densify for smoother curves
  const dense = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    for (let t = 0; t < 1; t += 0.25) dense.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
  }
  dense.push(points[points.length - 1]);
  return dense;
}

// Build SVG path string via Catmull-Rom to cubic Bézier conversion
function pointsToPath(pts) {
  if (!pts.length) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Sample a point along a polyline by t in [0,1]
function pointOnPath(pts, t) {
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1) return pts[0];
  // compute segment lengths
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    const len = Math.hypot(dx, dy);
    segs.push(len);
    total += len;
  }
  let target = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) {
      const a = pts[i];
      const b = pts[i + 1];
      const r = target / segs[i];
      return { x: lerp(a.x, b.x, r), y: lerp(a.y, b.y, r) };
    }
    target -= segs[i];
  }
  return pts[pts.length - 1];
}

// Simple deterministic RNG from seed
function mulberry32(a) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashCode(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ------------------------ UI Styles & Persistence ------------------------

const styles = {
  container: { width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#0b0f2b' },
  svg: { display: 'block' },
  tooltip: { position: 'fixed', pointerEvents: 'none', background: 'rgba(255,255,255,0.95)', border: '1px solid #ddd', padding: '8px 10px', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Inter, system-ui, sans-serif' },
  tooltipTitle: { fontSize: 12, fontWeight: 600, color: '#111' },
  tooltipSub: { fontSize: 11, color: '#555' },
  fab: { position: 'fixed', left: 16, bottom: 16, backgroundColor: '#111827', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  popup: { position: 'fixed', background: 'rgba(255,255,255,0.97)', border: '1px solid #ddd', padding: 12, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', maxWidth: 280 },
  popupText: { fontSize: 12, color: '#111', marginBottom: 8 },
  popupClose: { background: '#374151', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

function loadState() {
  try {
    const raw = sessionStorage.getItem('pastState');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveState(obj) {
  try {
    sessionStorage.setItem('pastState', JSON.stringify(obj));
  } catch {}
}
