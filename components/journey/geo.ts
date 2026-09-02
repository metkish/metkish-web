// Small geometry helpers for the journey map. Kept dependency-free (no
// turf, no map SDK) since a gentle, good-looking curve and a believable
// relative position are all this decorative scroll animation needs — not
// survey-grade geodesy or real cartography.

// A gentle arc between two points: linear interpolation plus a lateral
// offset that eases in and out with a sine hump (0 at both endpoints,
// peaking at the midpoint). Deliberately not a true quadratic bezier —
// a bezier's control-point offset scales with chord length, which for a
// very long leg (e.g. Vienna to Tenerife) produces a sharp "hook" near the
// start as the curve first heads toward the control point before bending
// back. The sine offset always passes exactly through both endpoints and
// bulges smoothly regardless of distance or curve magnitude.
export function bezierPoint(
  a: [number, number],
  b: [number, number],
  curve: number,
  t: number
): [number, number] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const lx = a[0] + dx * t;
  const ly = a[1] + dy * t;
  const offset = curve * len * Math.sin(Math.PI * t);
  return [lx + px * offset, ly + py * offset];
}

export function sampleCurve(
  a: [number, number],
  b: [number, number],
  curve: number,
  samples: number
): [number, number][] {
  const points: [number, number][] = [];
  for (let s = 0; s <= samples; s++) points.push(bezierPoint(a, b, curve, s / samples));
  return points;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge0 ? 1 : 0;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// --- Projection ---------------------------------------------------------
// A plain equirectangular projection with a standard parallel at REF_LAT.
// This is the same simplification any illustrative "editorial atlas" map
// uses — it keeps direction and relative distance believable across the
// small set of regions this map ever needs to show (central Europe to the
// Canary Islands), without pulling in a real map-projection library for a
// decorative scroll animation. Coordinates in are always [lng, lat];
// coordinates out are abstract "world units" used only by this component.

export const REF_LAT = 40;
const LAT_COS = Math.cos((REF_LAT * Math.PI) / 180);

export function project([lng, lat]: [number, number]): [number, number] {
  return [lng * LAT_COS, -lat];
}

/** Converts a width given in degrees of longitude (the intuitive unit to
 * author camera framing in) into the same world units project() uses. */
export function projectSpan(spanDeg: number): number {
  return spanDeg * LAT_COS;
}

/** Angle (degrees, 0 = pointing along +x) between two already-projected
 * screen-space points. Used to orient the vehicle icon along the path as
 * drawn, rather than a raw geographic bearing — so it always visually
 * matches the curve on screen. */
export function screenAngle(a: [number, number], b: [number, number]): number {
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
}

/** Builds a soft, organic closed path through a polygon's points by
 * drawing quadratic curves through consecutive midpoints, instead of
 * straight polygon edges — used for the map's illustrative land and
 * island shapes so they read as gently drawn, not surveyed. Expects
 * already-projected [x, y] points. */
export function smoothClosedPath(points: [number, number][]): string {
  if (points.length < 3) return '';
  const mid = (a: [number, number], b: [number, number]): [number, number] => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];
  const first = mid(points[points.length - 1], points[0]);
  let d = `M ${first[0].toFixed(3)},${first[1].toFixed(3)} `;
  for (let i = 0; i < points.length; i++) {
    const cur = points[i];
    const next = points[(i + 1) % points.length];
    const m = mid(cur, next);
    d += `Q ${cur[0].toFixed(3)},${cur[1].toFixed(3)} ${m[0].toFixed(3)},${m[1].toFixed(3)} `;
  }
  d += 'Z';
  return d;
}
