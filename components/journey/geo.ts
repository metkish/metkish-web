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

// --- Verified real-route rendering --------------------------------------
// A `JourneyLeg.route` is a real, independently-verified sequence of
// waypoints (see the standing rule on that field in lib/journeys/types.ts)
// — the permanent replacement for a decorative bezierPoint() bow wherever
// a leg's actual geography has been researched online. These render a
// smooth curve through those real points and, when one or more real land
// shapes are supplied, guarantee the curve never leaves them.

/** Catmull-Rom interpolation through a real point sequence, generalized
 * with a tension parameter (0 = loose/smooth, 1 = tight/minimal
 * overshoot). Always passes exactly through every point regardless of
 * tension — tension only reshapes the curve *between* points. */
export function catmullRomPoint(
  points: [number, number][],
  t: number,
  tension = 0
): [number, number] {
  const n = points.length;
  const p = Math.max(0, Math.min(n - 2, Math.floor(t * (n - 1))));
  const localT = t * (n - 1) - p;
  const p0 = points[Math.max(0, p - 1)];
  const p1 = points[p];
  const p2 = points[Math.min(n - 1, p + 1)];
  const p3 = points[Math.min(n - 1, p + 2)];
  const s = 1 - tension;
  const t2 = localT * localT;
  const t3 = t2 * localT;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + localT;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  const m1x = (s * (p2[0] - p0[0])) / 2;
  const m1y = (s * (p2[1] - p0[1])) / 2;
  const m2x = (s * (p3[0] - p1[0])) / 2;
  const m2y = (s * (p3[1] - p1[1])) / 2;
  return [
    h00 * p1[0] + h10 * m1x + h01 * p2[0] + h11 * m2x,
    h00 * p1[1] + h10 * m1y + h01 * p2[1] + h11 * m2y,
  ];
}

/** Parses one of the generated/geography.ts SVG path strings (already in
 * this module's projected world-unit space) back into a plain ring of
 * points, for ray-casting. */
export function parseLandRing(pathStr: string): [number, number][] {
  const nums = (pathStr.match(/-?\d+\.?\d*/g) ?? []).map(Number);
  const ring: [number, number][] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) ring.push([nums[i], nums[i + 1]]);
  return ring;
}

export function pointInRing(pt: [number, number], ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function minDistToRing(pt: [number, number], ring: [number, number][]): number {
  let min = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[j];
    const [bx, by] = ring[i];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let s = len2 === 0 ? 0 : ((pt[0] - ax) * dx + (pt[1] - ay) * dy) / len2;
    s = Math.max(0, Math.min(1, s));
    const px = ax + s * dx;
    const py = ay + s * dy;
    const d = Math.hypot(pt[0] - px, pt[1] - py);
    if (d < min) min = d;
  }
  return min;
}

/** Signed distance of an already-projected point from the nearest of one
 * or more land rings: positive (and growing) the further inside any of
 * them the point is, negative once it has left all of them. Used to
 * verify a route never actually strays off the real landmass it's meant
 * to be crossing. */
export function marginAgainstLand(pt: [number, number], rings: [number, number][][]): number {
  let best = -Infinity;
  for (const ring of rings) {
    const d = minDistToRing(pt, ring);
    const m = pointInRing(pt, ring) ? d : -d;
    if (m > best) best = m;
  }
  return best;
}

export interface RouteSafetyOptions {
  lowTension?: number;
  highTension?: number;
  /** World-unit margin every sample must clear from the nearest land
   * ring's edge — the default is roughly 30m at this map's scale. */
  safetyMargin?: number;
}

export const ROUTE_SAFETY_DEFAULTS: Required<RouteSafetyOptions> = {
  lowTension: 0.15,
  highTension: 0.85,
  safetyMargin: 0.00027,
};

/** A smooth curve through a real leg route (see JourneyLeg.route).
 *
 * With no `land` rings supplied, this is just a gentle Catmull-Rom
 * through the real points — fine for an inland leg with no risk of
 * reading as "crossed the sea". With `land` supplied (SVG path strings,
 * see JourneyLeg.routeLand), every sample is tried first at a smooth low
 * tension; only where that would leave every supplied land shape
 * (checked in the exact projected space the map's own coastline is drawn
 * in) does it blend — via bisection, just enough to clear the safety
 * margin — toward a stiffer, verified-safe curve. This is what caught
 * and fixed a real bug during the Tenerife build: even waypoints that
 * are each individually on land can produce a spline that bulges into
 * the sea at a sharp turn between two of them. This adaptive-tension
 * technique is the standing method for any future route that runs near a
 * coastline — never solve that by nudging a waypoint by eye. */
export function routeCurvePoint(
  points: [number, number][],
  t: number,
  land?: string[],
  opts: RouteSafetyOptions = {}
): [number, number] {
  const { lowTension, highTension, safetyMargin } = { ...ROUTE_SAFETY_DEFAULTS, ...opts };
  const low = catmullRomPoint(points, t, lowTension);
  if (!land || land.length === 0) return low;
  const rings = land.map(parseLandRing);
  if (marginAgainstLand(project(low), rings) >= safetyMargin) return low;
  const high = catmullRomPoint(points, t, highTension);
  if (marginAgainstLand(project(high), rings) < safetyMargin) return high;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const bp: [number, number] = [
      low[0] + (high[0] - low[0]) * mid,
      low[1] + (high[1] - low[1]) * mid,
    ];
    if (marginAgainstLand(project(bp), rings) >= safetyMargin) hi = mid;
    else lo = mid;
  }
  return [low[0] + (high[0] - low[0]) * hi, low[1] + (high[1] - low[1]) * hi];
}

/** Angle (screen-space degrees) of a route curve's own tangent at `t` —
 * the route-aware counterpart to screenAngle(), used so the vehicle icon
 * always visually matches the drawn curve rather than a raw bearing. */
export function routeCurveAngleAt(
  points: [number, number][],
  t: number,
  land?: string[],
  eps = 0.015,
  opts?: RouteSafetyOptions
): number {
  const a = routeCurvePoint(points, Math.max(0, t - eps), land, opts);
  const b = routeCurvePoint(points, Math.min(1, t + eps), land, opts);
  return screenAngle(project(a), project(b));
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
