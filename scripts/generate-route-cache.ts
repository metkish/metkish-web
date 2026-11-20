// Run: npx tsx scripts/generate-route-cache.ts
// (also runs automatically before every `npm run build` via the
// "prebuild" script in package.json)
//
// Precomputes, for every leg of every Journey in every destination module
// listed below, the exact same ROUTE_SAMPLES+1 already-projected points
// JourneyMapScene's own buildLegCache() would compute live in a visitor's
// browser — using the literal same functions (routeCurvePoint /
// bezierPoint / project) and the same shared ROUTE_SAMPLES constant from
// components/journey/geo.ts, so the output is mathematically identical to
// what the component has always drawn. The only thing this changes is
// WHEN that computation happens: once here at build time, instead of
// once per visitor per leg in their own browser.
//
// This matters because a leg with `routeLand` (coastline-aware land-
// safety sampling — see the big comment on routeCurvePoint in geo.ts)
// measured at 450-700ms to build on a modest machine, PER LEG, in this
// project's own test environment — almost certainly worse on real mobile
// hardware. If that computation hasn't finished by the time a visitor
// scrolls a map into view (very plausible on a long, image-heavy page
// with many such maps competing for idle browser time), it ends up
// running synchronously inside the live animation's render() call,
// stalling the main thread for that entire half-second-plus — which is
// what was actually behind reports of the route animation stuttering and
// the vehicle icon briefly disappearing on legs that use a real,
// coastline-checked route (as opposed to legs with no `route`, or a
// `route` with no `routeLand`, which were never slow enough to trigger
// this and is why only SOME maps on a page showed the problem).
//
// WHY STATIC JSON UNDER public/ — NOT a TS module imported by page.tsx:
// an earlier version of this generator wrote one generated .ts module per
// destination and had each destination's page.tsx `import` its cache
// directly. That worked (every routeLand leg really did become a 0ms
// lookup) but silently created a much worse problem: every destination
// page.tsx here is a Client Component, so that import baked the entire
// precomputed array (120KB-636KB of source per destination) straight into
// that PAGE'S OWN JavaScript bundle. Next.js's <Link> prefetches a linked
// page's full bundle as soon as the link scrolls into view — so simply
// landing on the home page (whose travel gallery links to every
// destination) silently triggered multi-megabyte background downloads of
// route geometry nobody was about to look at yet, which is what actually
// made the home page (and navigation generally) slow to load on mobile.
// Writing this data as plain static JSON under public/route-cache/ instead,
// fetched on demand by JourneyMapScene itself (see its routeCacheUrl prop
// and the module-level fetch cache next to it), keeps it completely out
// of every page's JS bundle and out of Link's prefetch entirely: it's an
// ordinary cacheable network request that only happens on a destination's
// own page, only once per page load (shared across every JourneyMapScene
// on that page), and is fired as early as each one mounts rather than
// waiting for scroll.
//
// Each destination gets its own JSON file (public/route-cache/<slug>.json)
// for the same reason the old per-destination .ts files existed: so one
// destination's data is never fetched by a visitor who never opens that
// destination's page. Adding a new destination: add it to
// DESTINATION_MODULES_WITH_SLUGS below (and to ./destinationModules if it
// should also be route-validated), then set that destination's page.tsx's
// <JourneyMapScene routeCacheUrl="/route-cache/<slug>"> — see any existing
// destination page for the pattern.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bezierPoint, project, routeCurvePoint, resampleByArcLength, ROUTE_SAMPLES } from '../components/journey/geo';
import type { Journey, JourneyLeg } from '../lib/journeys/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'route-cache');

// { module path (relative to this script), output slug }. Every
// destination that renders <JourneyMapScene> belongs here, whether or not
// it happens to use routeLand today — a future route edit on any of its
// legs should never have to remember to add it here first.
const DESTINATION_MODULES_WITH_SLUGS: { mod: string; slug: string }[] = [
  { mod: '../lib/journeys/tenerife', slug: 'tenerife' },
  { mod: '../lib/journeys/italy', slug: 'italy' },
  { mod: '../lib/journeys/barcelona', slug: 'barcelona' },
  { mod: '../lib/journeys/rome', slug: 'rome' },
  { mod: '../lib/journeys/iceland', slug: 'iceland' },
  { mod: '../lib/journeys/sardinia', slug: 'sardinia' },
];

function legPoint(leg: JourneyLeg, t: number): [number, number] {
  return leg.route
    ? routeCurvePoint(leg.route, t, leg.routeLand)
    : bezierPoint(leg.from.coords, leg.to.coords, leg.curve ?? 0, t);
}

function roundCoord(n: number): number {
  // Matches the 5-decimal precision the component itself formats points
  // to (see the `.toFixed(5)` calls in JourneyMapScene's render()) — this
  // is not a precision loss, it's just not carrying along float noise
  // past the digit count that ever reaches the screen anyway.
  return Math.round(n * 1e5) / 1e5;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  for (const { mod, slug } of DESTINATION_MODULES_WITH_SLUGS) {
    const imported = await import(mod);
    const journeys: Journey[] = Object.values(imported).filter(
      (v: unknown): v is Journey =>
        !!v && typeof v === 'object' && 'legs' in (v as Record<string, unknown>)
    );

    const cache: Record<string, [number, number][]> = {};
    let legCount = 0;

    for (const journey of journeys) {
      for (const leg of journey.legs) {
        if (leg.showRoute === false) continue;
        const rawPoints: [number, number][] = new Array(ROUTE_SAMPLES + 1);
        for (let s = 0; s <= ROUTE_SAMPLES; s++) {
          rawPoints[s] = project(legPoint(leg, s / ROUTE_SAMPLES));
        }
        const evenPoints = resampleByArcLength(rawPoints);
        const points: [number, number][] = evenPoints.map(
          (p) => [roundCoord(p[0]), roundCoord(p[1])] as [number, number],
        );
        cache[`${journey.id}::${leg.id}`] = points;
        legCount++;
      }
    }

    const json = JSON.stringify(cache);
    const outPath = join(OUT_DIR, `${slug}.json`);
    writeFileSync(outPath, json);
    console.log('wrote', outPath, `(${legCount} legs)`, `${(json.length / 1024).toFixed(0)}KB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
