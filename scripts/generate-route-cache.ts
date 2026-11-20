// Run: npx tsx scripts/generate-route-cache.ts
// (also runs automatically before every `npm run build` via the
// "prebuild" script in package.json)
//
// Precomputes, for every leg of every Journey in every destination module
// listed in ./destinationModules, the exact same ROUTE_SAMPLES+1
// already-projected points JourneyMapScene's own buildLegCache() would
// compute live in a visitor's browser — using the literal same functions
// (routeCurvePoint / bezierPoint / project) and the same shared
// ROUTE_SAMPLES constant from components/journey/geo.ts, so the output is
// mathematically identical to what the component has always drawn. The
// only thing this changes is WHEN that computation happens: once here at
// build time, instead of once per visitor per leg in their own browser.
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
// Each destination module gets its own generated output file
// (components/journey/generated/route-cache-<slug>.ts) so Next.js's
// per-route code splitting keeps one destination's cache out of every
// OTHER destination's page bundle — a destination page passes its own
// file's export to JourneyMapScene as the `routeCache` prop. Adding a new
// destination: add it to DESTINATION_MODULES_WITH_SLUGS below (and to
// ./destinationModules if it should also be route-validated), then wire
// that destination's page.tsx to import and pass its generated cache —
// see any existing destination page for the pattern.

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bezierPoint, project, routeCurvePoint, ROUTE_SAMPLES } from '../components/journey/geo';
import type { Journey, JourneyLeg } from '../lib/journeys/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'components', 'journey', 'generated');

// { module path (relative to this script), output slug, generated const
// name }. Every destination that renders <JourneyMapScene> belongs here,
// whether or not it happens to use routeLand today — a future route edit
// on any of its legs should never have to remember to add it here first.
const DESTINATION_MODULES_WITH_SLUGS: { mod: string; slug: string; constName: string }[] = [
  { mod: '../lib/journeys/tenerife', slug: 'tenerife', constName: 'TENERIFE_ROUTE_CACHE' },
  { mod: '../lib/journeys/italy', slug: 'italy', constName: 'ITALY_ROUTE_CACHE' },
  { mod: '../lib/journeys/barcelona', slug: 'barcelona', constName: 'BARCELONA_ROUTE_CACHE' },
  { mod: '../lib/journeys/rome', slug: 'rome', constName: 'ROME_ROUTE_CACHE' },
  { mod: '../lib/journeys/iceland', slug: 'iceland', constName: 'ICELAND_ROUTE_CACHE' },
  { mod: '../lib/journeys/sardinia', slug: 'sardinia', constName: 'SARDINIA_ROUTE_CACHE' },
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
  for (const { mod, slug, constName } of DESTINATION_MODULES_WITH_SLUGS) {
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
        const points: [number, number][] = new Array(ROUTE_SAMPLES + 1);
        for (let s = 0; s <= ROUTE_SAMPLES; s++) {
          const p = project(legPoint(leg, s / ROUTE_SAMPLES));
          points[s] = [roundCoord(p[0]), roundCoord(p[1])];
        }
        cache[`${journey.id}::${leg.id}`] = points;
        legCount++;
      }
    }

    const entries = Object.entries(cache)
      .map(([key, points]) => `  ${JSON.stringify(key)}: ${JSON.stringify(points)},`)
      .join('\n');

    const file = `// GENERATED FILE — do not edit by hand.
// Produced by scripts/generate-route-cache.ts from ${mod}.ts — re-run
// \`npx tsx scripts/generate-route-cache.ts\` (or \`npm run build\`, which
// does this automatically) after changing any route/routeLand data in
// that file, so this stays in sync with it.
//
// Already-projected [x, y] points for every leg that draws a route,
// keyed by \`\${journey.id}::\${leg.id}\`, at the exact same ROUTE_SAMPLES
// resolution and sampling functions JourneyMapScene's own buildLegCache()
// uses live — see scripts/generate-route-cache.ts for why this exists.
export const ${constName}: Record<string, [number, number][]> = {
${entries}
};
`;

    const outPath = join(OUT_DIR, `route-cache-${slug}.ts`);
    writeFileSync(outPath, file);
    console.log('wrote', outPath, `(${legCount} legs)`, `${(file.length / 1024).toFixed(0)}KB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
