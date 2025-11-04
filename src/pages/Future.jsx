import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Future() {
  const svgRef = useRef(null);
  const navigate = useNavigate();
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [hover, setHover] = useState(null); // {key, label}
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [showMarkers, setShowMarkers] = useState(false);
  const [markerPopup, setMarkerPopup] = useState(null); // { left, top, text }
  const [splitT] = useState(0.11); // where secondary splits into children (0..1)
  const [childCount] = useState(100); // density of children
  const [flipped, setFlipped] = useState(false); // flip primary/secondary probabilities
  const subjectName = 'Aakriti';

  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Probabilities and corresponding opacities (aligned with Past.jsx)
  const pMain = flipped ? 0.05 : 0.95;
  const pAlt = flipped ? 0.95 : 0.05;
  const opMain = clamp(0.25 + pMain * 0.75, 0.25, 1);
  const opAlt = clamp(0.25 + pAlt * 0.75, 0.25, 1);

  const model = useMemo(() => buildFutureModel(viewport.width, viewport.height, splitT, childCount, subjectName, pAlt), [viewport, splitT, childCount, subjectName, pAlt]);

  const onMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });

  return (
    <div style={styles.container}>
      <svg ref={svgRef} width={viewport.width} height={viewport.height} onMouseMove={onMouseMove} style={styles.svg}>
      <defs>
        <linearGradient id="branchGradient" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={viewport.width} y2={0}>
          <stop offset="0%" stopColor="#FFF7EB" />
          <stop offset="20%" stopColor="#FFE2C2" />
          <stop offset="40%" stopColor="#FFCA99" />
          <stop offset="60%" stopColor="#FF8849" />
          <stop offset="80%" stopColor="#6F1F10" />
          <stop offset="100%" stopColor="#350F07" />
        </linearGradient>

        <linearGradient id="primaryGradient" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={viewport.width} y2={0}>
          <stop offset="0%" stopColor="#FFE0C0" />
          <stop offset="20%" stopColor="#FFC381" />
          <stop offset="40%" stopColor="#FF8B26" />
          <stop offset="60%" stopColor="#C63333" />
          <stop offset="80%" stopColor="#802400" />
          <stop offset="95%" stopColor="#4C0000" />
        </linearGradient>
      </defs>

        <rect x={0} y={0} width={viewport.width} height={viewport.height} fill="#a30e03" />

        {/* Main short dark branch */}
        <g
          onMouseEnter={() => setHover({ key: 'main', label: `Future #1. Probability: ${pMain.toFixed(2)}` })}
          onMouseLeave={() => setHover(null)}
          tabIndex={0}
          aria-label={`Future #1. Probability: ${pMain.toFixed(2)}`}
          role="group"
        >
          <path
            d={pointsToPath(model.main.path)}
            fill="none"
            stroke="url(#primaryGradient)"
            strokeWidth={6}
            strokeOpacity={opMain}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="stroke"
            onClick={() => navigate('/thought2')}
          />
          {showMarkers && model.main.inflections.map((m, i) => (
            <circle
              key={`m-${i}`}
              cx={m.x}
              cy={m.y}
              r={5}
              fill="#FBBF24"
              stroke="#B08900"
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (document.activeElement && document.activeElement.blur) {
                  document.activeElement.blur();
                }
                const rect = svgRef.current?.getBoundingClientRect();
                const left = (rect?.left || 0) + m.x + 12;
                const top = (rect?.top || 0) + m.y + 12;
                setMarkerPopup({ left, top, text: m.text });
              }}
            />
          ))}
        </g>

        {/* Secondary branch that splits into multiple lighter branches */}
        <g tabIndex={0} role="group" aria-label="Future #2">
          <path
            d={pointsToPath(model.alt.path)}
            fill="none"
            stroke="url(#branchGradient)"
            strokeWidth={3.5}
            strokeOpacity={opAlt}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="stroke"
            onMouseEnter={() => setHover({ key: 'alt-main', label: `Future #2. Probability: ${pAlt.toFixed(2)}` })}
            onMouseLeave={() => setHover(null)}
            onClick={() => navigate('/thought2')}
          />
          {showMarkers && model.alt.inflections.map((m, i) => (
            <circle
              key={`a-${i}`}
              cx={m.x}
              cy={m.y}
              r={4.5}
              fill="#FBBF24"
              stroke="#B08900"
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (document.activeElement && document.activeElement.blur) {
                  document.activeElement.blur();
                }
                const rect = svgRef.current?.getBoundingClientRect();
                const left = (rect?.left || 0) + m.x + 12;
                const top = (rect?.top || 0) + m.y + 12;
                setMarkerPopup({ left, top, text: m.text });
              }}
            />
          ))}

          {model.alt.children.map((c, idx) => (
            <g key={`c-${idx}`}>
              <path
                d={pointsToPath(c.path)}
                fill="none"
                stroke="url(#branchGradient)"
                strokeWidth={1 + c.p * 5}
                strokeOpacity={clamp(0.25 + c.p * 0.75, 0.25, 1)}
                strokeLinecap="round"
                strokeLinejoin="round"
                pointerEvents="stroke"
                onMouseEnter={() => setHover({ key: `child-${idx}`, label: `Future #2.${idx + 1}. Probability: ${c.p.toFixed(2)}` })}
                onMouseLeave={() => setHover(null)}
                onClick={() => navigate('/thought2')}
              />
              {showMarkers && c.inflections?.map((m, j) => (
                <circle
                  key={`c-${idx}-m-${j}`}
                  cx={m.x}
                  cy={m.y}
                  r={4}
                  fill="#FBBF24"
                  stroke="#B08900"
                  style={{ cursor: 'pointer' }}
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (document.activeElement && document.activeElement.blur) {
                      document.activeElement.blur();
                    }
                    const rect = svgRef.current?.getBoundingClientRect();
                    const left = (rect?.left || 0) + m.x + 12;
                    const top = (rect?.top || 0) + m.y + 12;
                    setMarkerPopup({ left, top, text: m.text });
                  }}
                />
              ))}
            </g>
          ))}
        </g>
      </svg>

      {hover && (
        <div style={{ ...styles.tooltip, left: mouse.x + 12, top: mouse.y + 12 }}>{hover.label}</div>
      )}

      {markerPopup && (
        <div style={{ ...styles.popup, left: markerPopup.left, top: markerPopup.top }}>
          <div style={styles.popupText}>{markerPopup.text}</div>
          <button style={styles.popupClose} onClick={() => setMarkerPopup(null)}>Close</button>
        </div>
      )}

      <div style={styles.controls}>
        <button style={styles.buttonPrimary} onClick={() => setShowMarkers((s) => !s)}>
          <span style={styles.buttonText}>{showMarkers ? 'Hide inflection points' : 'Show inflection points'}</span>
        </button>
        <button style={styles.buttonSecondary} onClick={() => setFlipped((f) => !f)} aria-label="Flip probabilities">
          <span style={styles.buttonText}>Flip probabilities</span>
        </button>
      </div>
    </div>
  );
}

function buildFutureModel(width, height, splitT, childCount, subjectName, pAlt) {
  const left = 32;
  const right = width - 32;
  const midY = height * 0.45;

  // Main branch: short and dark
  const mainLen = Math.min(100, Math.min(200, width * 0.15));
  const mainPoints = [
    { x: left, y: midY },
    { x: left + mainLen * 0.35, y: midY + height * 0.02 },
    { x: left + mainLen * 0.7, y: midY + height * 0.01 },
    { x: left + mainLen, y: midY + height * 0.015 },
  ];
  const mainPath = densify(mainPoints);

  // Alt branch: starts near main origin, extends, then splits later
  const altStartOffset = height * 0.10; // increase divergence angle
  // Start EXACTLY at the same origin as main and gradually drift below before the split
  const altPoints = [
    { x: left, y: midY },
    { x: left + mainLen * 0.25, y: midY + altStartOffset * 0.65 },
    { x: left + mainLen * 0.55, y: midY + altStartOffset * 0.95 },
    { x: left + (right - left) * 0.50, y: midY + altStartOffset * 0.95 },
    { x: right - 40, y: midY + altStartOffset * 0.5 },
  ];
  const altPath = densify(altPoints);

  // Splits into N lighter branches starting exactly at a point on the alt branch
  const splitPt = pointOnPath(altPath, splitT);
  const spread = height * 0.65; // vertical spread for children
  const children = Array.from({ length: childCount }, (_, i) => {
    const r = childCount === 1 ? 0 : (i / (childCount - 1)) - 0.5; // [-0.5..0.5]
    const targetY = midY + r * 2 * spread;
    const targetX = right - 2; // extend to the end of the screen
    const path = buildChild(splitPt.x, splitPt.y, targetX, targetY).path;
    // Deterministic pseudo-random probability per child (0.04..0.98)
    const base = Math.sin((i + 1) * 12345.678 + splitT * 999);
    const frac = base - Math.floor(base);
    const pRandom = clamp(Math.pow(Math.abs(frac), 2) * 0.94 + 0.04, 0.04, 0.98);
    const p = clamp(pRandom * pAlt, 0.01, 0.98);
    return { path, p };
  });

  // Exactly 2 inflection points on the main branch
  const m1t = 0.35;
  const m2t = 1;
  const m1 = { ...pointOnPath(mainPath, m1t), text: `${subjectName} looks at the intruder. Time: 30 seconds from now.` };
  const m2 = { ...pointOnPath(mainPath, m2t), text: `${subjectName} gets murdered. Time: 2 minutes from now.` };

  // Inflections for alt and children (1-2 per path)
  const altInf = [
    // { ...pointOnPath(altPath, 0.05), text: 'Inflection on Future #2 @ 35%' },
    { ...pointOnPath(altPath, 0.1), text: `${subjectName} kills the intruder. Time: 3 minutes from now.` },
  ];
  // Randomize number and position of inflection points per child branch (deterministic per child)
  children.forEach((c, i) => {
    const rng = mulberry32(hashCode(`future-child|${i}|${width}|${height}|${splitT}`));
    // 0-3 points with a bias towards 1-2
    const roll = rng();
    const count = roll < 0.15 ? 0 : roll < 0.65 ? 1 : roll < 0.9 ? 2 : 3;
    const minT = 0.10;
    const maxT = 0.95;
    const minGap = 0.10; // ensure visible spacing
    const ts = sampleSeparatedTs(rng, count, minT, maxT, minGap);
    c.inflections = ts.map((t) => ({ ...pointOnPath(c.path, t), text: `Inflection on Future #2.${i + 1} @ ${(t * 100).toFixed(0)}%` }));
  });

  return {
    main: { path: mainPath, inflections: [m1, m2] },
    alt: { path: altPath, children, inflections: altInf },
  };
}

function buildChild(x0, y0, x1, y1) {
  const midX = (x0 + x1) / 2;
  const ctrlY = y0 + (y1 - y0) * 0.6;
  const pts = [ { x: x0, y: y0 }, { x: midX, y: ctrlY }, { x: x1, y: y1 } ];
  return { path: densify(pts) };
}

// ---- Geometry helpers (mirroring Past.jsx style) ----
function densify(points) {
  const dense = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    for (let t = 0; t < 1; t += 0.25) dense.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
  }
  dense.push(points[points.length - 1]);
  return dense;
}
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
function pointOnPath(pts, t) {
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1) return pts[0];
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
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// ---- Random helpers (deterministic per child) ----
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
function sampleSeparatedTs(rng, count, minT, maxT, minGap) {
  if (count <= 0) return [];
  const ts = [];
  let attempts = 0;
  const maxAttempts = 2000;
  while (ts.length < count && attempts < maxAttempts) {
    attempts++;
    const t = clamp(minT + rng() * (maxT - minT), minT, maxT);
    let ok = true;
    for (let i = 0; i < ts.length; i++) {
      if (Math.abs(ts[i] - t) < minGap) { ok = false; break; }
    }
    if (ok) ts.push(t);
  }
  ts.sort((a, b) => a - b);
  return ts;
}

const styles = {
  container: { width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#0b0f2b' },
  svg: { display: 'block' },
  tooltip: { position: 'fixed', pointerEvents: 'none', background: 'rgba(255,255,255,0.95)', border: '1px solid #ddd', padding: '8px 10px', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Inter, system-ui, sans-serif', color: '#111' },
  controls: { position: 'fixed', left: 16, bottom: 16, display: 'flex', gap: 8 },
  controlGroup: { background: 'rgba(255,255,255,0.9)', padding: '6px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 },
  controlLabel: { fontSize: 12, color: '#111' },
  buttonPrimary: { backgroundColor: '#111827', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' },
  buttonSecondary: { backgroundColor: '#374151', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' },
  buttonText: { color: 'white', fontWeight: 600 },
  popup: { position: 'fixed', background: 'rgba(255,255,255,0.97)', border: '1px solid #ddd', padding: 12, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', maxWidth: 280 },
  popupText: { fontSize: 12, color: '#111', marginBottom: 8 },
  popupClose: { background: '#374151', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
};

