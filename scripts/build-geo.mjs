// Build-time script: extracts real coastline / country-outline geometry
// from @geo-maps datasets, simplifies it, projects it through the same
// equirectangular projection the journey map uses at runtime, and writes
// the result as plain TypeScript path-data files. Nothing here runs in
// the browser — this keeps the shipped site free of any map dataset or
// per-view computation cost while still giving the map real, recognizable
// geography instead of hand-guessed shapes.
//
// Run with: node scripts/build-geo.mjs
// Requires (dev-only, uninstalled again afterward):
//   npm install --no-save @geo-maps/earth-lands-1km @geo-maps/countries-land-1km

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'components', 'journey', 'generated');
mkdirSync(OUT_DIR, { recursive: true });

const REF_LAT = 40;
const LAT_COS = Math.cos((REF_LAT * Math.PI) / 180);
function project([lng, lat]) {
  return [lng * LAT_COS, -lat];
}

function ringArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

function ringBBox(ring) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

function bboxIntersects(a, b) {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

// Sutherland-Hodgman polygon clipping against an axis-aligned rectangle.
// Needed because "ring's bbox overlaps our region" is not the same as
// "ring is actually near our region" — a huge ring (e.g. the entire
// African coastline) can have a bbox that overlaps a small target window
// (e.g. the Canary Islands) despite passing nowhere near it. Clipping to
// the window is the correct fix: it keeps only the geometry that is
// actually inside, rather than an include/exclude decision on the whole
// (possibly enormous) ring.
function clipRingToBBox(ring, [minX, minY, maxX, maxY]) {
  let points = ring;
  const clipEdge = (pts, inside, intersect) => {
    if (pts.length === 0) return pts;
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i];
      const prev = pts[(i - 1 + pts.length) % pts.length];
      const curIn = inside(cur);
      const prevIn = inside(prev);
      if (curIn) {
        if (!prevIn) out.push(intersect(prev, cur));
        out.push(cur);
      } else if (prevIn) {
        out.push(intersect(prev, cur));
      }
    }
    return out;
  };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  points = clipEdge(
    points,
    (p) => p[0] >= minX,
    (a, b) => lerp(a, b, (minX - a[0]) / (b[0] - a[0]))
  );
  points = clipEdge(
    points,
    (p) => p[0] <= maxX,
    (a, b) => lerp(a, b, (maxX - a[0]) / (b[0] - a[0]))
  );
  points = clipEdge(
    points,
    (p) => p[1] >= minY,
    (a, b) => lerp(a, b, (minY - a[1]) / (b[1] - a[1]))
  );
  points = clipEdge(
    points,
    (p) => p[1] <= maxY,
    (a, b) => lerp(a, b, (maxY - a[1]) / (b[1] - a[1]))
  );
  return points;
}

// Douglas-Peucker polyline simplification.
function simplify(points, tolerance) {
  if (points.length <= 3) return points;
  const sqTol = tolerance * tolerance;

  function sqSegDist(p, p1, p2) {
    let [x, y] = p1;
    let dx = p2[0] - x;
    let dy = p2[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) { x = p2[0]; y = p2[1]; }
      else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  }

  function simplifyDP(pts, first, last, sqTolerance, out) {
    let maxDist = sqTolerance;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const dist = sqSegDist(pts[i], pts[first], pts[last]);
      if (dist > maxDist) { index = i; maxDist = dist; }
    }
    if (maxDist > sqTolerance) {
      if (index - first > 1) simplifyDP(pts, first, index, sqTolerance, out);
      out.push(pts[index]);
      if (last - index > 1) simplifyDP(pts, index, last, sqTolerance, out);
    }
  }

  const out = [points[0]];
  simplifyDP(points, 0, points.length - 1, sqTol, out);
  out.push(points[points.length - 1]);
  return out;
}

// Builds a soft, organic closed SVG path through a polygon's points by
// drawing quadratic curves through consecutive midpoints — mirrors
// components/journey/geo.ts's smoothClosedPath so real data renders with
// the same gently-drawn, editorial-illustration character as hand-authored
// shapes did before.
function smoothClosedPath(points) {
  if (points.length < 3) return '';
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
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

function geometryRings(geometry) {
  const rings = [];
  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) rings.push(ring);
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) for (const ring of poly) rings.push(ring);
  }
  return rings;
}

// Extracts the significant outer rings of a geometry: drops tiny slivers
// (processing artifacts, sub-1% of the largest ring's area) and holes
// (a "hole" ring is wound opposite to its parent and much smaller — we
// don't need lake-accurate holes for this illustration, only silhouettes).
function significantRings(geometry, { minAreaRatio = 0.01, maxRings = 40 } = {}) {
  const rings = geometryRings(geometry).map((r) => ({ ring: r, area: ringArea(r) }));
  rings.sort((a, b) => b.area - a.area);
  const largest = rings[0]?.area || 0;
  return rings
    .filter((r) => r.area >= largest * minAreaRatio)
    .slice(0, maxRings)
    .map((r) => r.ring);
}

let totalRawPts = 0;
let totalSimplifiedPts = 0;
function ringToPath(ring, tolerance) {
  const simplified = tolerance > 0 ? simplify(ring, tolerance) : ring;
  totalRawPts += ring.length;
  totalSimplifiedPts += simplified.length;
  const projected = simplified.map(project);
  return smoothClosedPath(projected);
}

function ringsInBBox(rings, bbox) {
  return rings.filter((ring) => bboxIntersects(ringBBox(ring), bbox));
}

function pathsForRings(rings, tolerance) {
  return rings.map((r) => ringToPath(r, tolerance)).filter(Boolean);
}

async function main() {
  const countriesGeo = (await import('@geo-maps/countries-land-1km/map.geo.json', { with: { type: 'json' } })).default;
  const earthGeo = (await import('@geo-maps/earth-lands-1km/map.geo.json', { with: { type: 'json' } })).default;

  const byCode = {};
  for (const f of countriesGeo.features) byCode[f.properties.A3] = f;

  // ---- Stage 1: Central Europe (Austria + Slovenia, precise; neighbors, plain) ----
  const FOCUS = ['AUT', 'SVN'];
  const NEIGHBOURS = ['DEU', 'ITA', 'HRV', 'HUN', 'CHE', 'CZE', 'SVK', 'BIH', 'LIE'];

  const focusPaths = [];
  for (const code of FOCUS) {
    const f = byCode[code];
    if (!f) { console.warn('missing', code); continue; }
    const rings = significantRings(f.geometry, { minAreaRatio: 0.02, maxRings: 3 });
    for (const ring of rings) focusPaths.push(ringToPath(ring, 0.012));
  }

  const neighbourPaths = [];
  for (const code of NEIGHBOURS) {
    const f = byCode[code];
    if (!f) continue;
    const rings = significantRings(f.geometry, { minAreaRatio: 0.05, maxRings: 2 });
    for (const ring of rings) neighbourPaths.push(ringToPath(ring, 0.035));
  }

  // earth-lands-1km is a top-level GeometryCollection wrapping one big
  // MultiPolygon of all land on earth.
  const earthRingsAll = earthGeo.geometries.flatMap((g) => geometryRings(g));

  // Clips each ring to a (padded) bbox before doing anything else, then
  // simplifies just the clipped result. This is what keeps a ring the
  // size of "the entire African coastline" from ever reaching the
  // simplifier or the output for a small target window like the Canary
  // Islands — only the portion actually inside the window survives.
  function clippedPaths(rings, bbox, { pad = 0, minArea = 0, tolerance, maxRings = 40 }) {
    const padded = [bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad];
    const candidates = ringsInBBox(rings, padded);
    const clipped = candidates
      .map((r) => clipRingToBBox(r, padded))
      .filter((r) => r.length >= 3)
      .map((ring) => ({ ring, area: ringArea(ring) }))
      .filter((r) => r.area > minArea)
      .sort((a, b) => b.area - a.area)
      .slice(0, maxRings)
      .map((r) => r.ring);
    return pathsForRings(clipped, tolerance);
  }

  // ---- Stage 2: wide Europe / Atlantic / North Africa (real coastline) ----
  const WIDE_BBOX = [-26, 14, 26, 56]; // [minLng, minLat, maxLng, maxLat]
  const widePaths = clippedPaths(earthRingsAll, WIDE_BBOX, {
    pad: 1,
    minArea: 0.08,
    tolerance: 0.12,
    maxRings: 30,
  });

  // ---- Stage 3: Canary Islands / Tenerife (fine detail) ----
  const CANARY_BBOX = [-18.3, 27.5, -13.3, 29.5];
  const canaryPaths = clippedPaths(earthRingsAll, CANARY_BBOX, {
    pad: 0.05,
    minArea: 0.0003,
    tolerance: 0.006,
    maxRings: 8,
  });

  const bytes = (s) => Buffer.byteLength(s, 'utf8');
  console.log('raw pts:', totalRawPts, 'simplified pts:', totalSimplifiedPts);
  console.log('focus (AUT/SVN) rings:', focusPaths.length);
  console.log('neighbour rings:', neighbourPaths.length);
  console.log('wide rings:', widePaths.length, 'bytes:', bytes(widePaths.join('')));
  console.log('canary rings:', canaryPaths.length, 'bytes:', bytes(canaryPaths.join('')));

  const file = `// GENERATED FILE — do not hand-edit.
// Produced by scripts/build-geo.mjs from @geo-maps (OpenStreetMap /
// Natural-Earth derived) land data: real coastlines and country outlines,
// simplified and projected through the same equirectangular projection
// components/journey/geo.ts uses at runtime, then baked into static SVG
// path strings so nothing map-related ships or runs at request time.
//
// FOCUS_PATHS: Austria + Slovenia, precise outline (stage 1 close view).
// NEIGHBOUR_PATHS: surrounding countries' land, plain fill, no stroke.
// WIDE_EUROPE_PATHS: Europe / Atlantic / North Africa coastline (stage 2).
// CANARY_PATHS: Canary Islands including Tenerife, fine detail (stage 3).

export const FOCUS_PATHS: string[] = ${JSON.stringify(focusPaths, null, 2)};

export const NEIGHBOUR_PATHS: string[] = ${JSON.stringify(neighbourPaths, null, 2)};

export const WIDE_EUROPE_PATHS: string[] = ${JSON.stringify(widePaths, null, 2)};

export const CANARY_PATHS: string[] = ${JSON.stringify(canaryPaths, null, 2)};
`;

  writeFileSync(join(OUT_DIR, 'geography.ts'), file);
  console.log('wrote', join(OUT_DIR, 'geography.ts'), bytes(file), 'bytes');
}

main().catch((e) => { console.error(e); process.exit(1); });
