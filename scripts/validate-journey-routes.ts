// Run: npx tsx scripts/validate-journey-routes.ts
//
// Walks every exported Journey in the destination files listed below and
// runs the reusable checks from lib/journeys/routeValidation.ts against
// every leg that carries a real `route`. This is the mechanical half of
// the "visually validate" step in the metkish-route-geometry project
// rule — it catches endpoint drift, coastline violations, and
// suspiciously sparse segments, but it does NOT replace actually looking
// at the live rendered map (a route can pass every check here and still
// look wrong at a given zoom, and a route that trips the "large jump"
// warning can still be a real, correct long straight motorway stretch).
//
// Adding a new destination (Teide, Los Gigantes, Loro Parque, Las
// Teresitas, ...): add its module path to DESTINATION_MODULES below and
// re-run. Nothing else about this script needs to change.

import {
  validateEndpoints,
  checkRouteOnLand,
  detectLargeJumps,
  summarizeRoute,
} from '../lib/journeys/routeValidation';
import type { Journey } from '../lib/journeys/types';

const DESTINATION_MODULES = ['../lib/journeys/tenerife', '../lib/journeys/italy'];

async function main() {
  let sawFailure = false;

  for (const modPath of DESTINATION_MODULES) {
    const mod = await import(modPath);
    const journeys: Journey[] = Object.values(mod).filter(
      (v: unknown): v is Journey =>
        !!v && typeof v === 'object' && 'legs' in (v as Record<string, unknown>)
    );

    console.log(`\n=== ${modPath} (${journeys.length} journeys) ===`);

    for (const journey of journeys) {
      for (const leg of journey.legs) {
        if (!leg.route || leg.route.length === 0) continue;

        console.log(`\n-- ${journey.id} / ${leg.id} --`);
        const summary = summarizeRoute(leg.route);
        console.log(
          `  points=${summary.pointCount} ~${summary.approxRealDistanceKm.toFixed(1)}km ` +
            `bbox lng[${summary.boundingBoxDeg.minLng.toFixed(4)}, ${summary.boundingBoxDeg.maxLng.toFixed(4)}] ` +
            `lat[${summary.boundingBoxDeg.minLat.toFixed(4)}, ${summary.boundingBoxDeg.maxLat.toFixed(4)}]`
        );

        const endpoints = validateEndpoints(leg.route, leg.from.coords, leg.to.coords);
        if (!endpoints.ok) {
          sawFailure = true;
          console.log(
            `  FAIL endpoints: startMatches=${endpoints.startMatches} (Δ${endpoints.startDistanceDeg}) ` +
              `endMatches=${endpoints.endMatches} (Δ${endpoints.endDistanceDeg})`
          );
        } else {
          console.log('  OK endpoints match canonical from/to coords exactly');
        }

        if (leg.routeLand && leg.routeLand.length > 0) {
          const land = checkRouteOnLand(leg.route, leg.routeLand);
          if (!land.ok) {
            sawFailure = true;
            console.log(
              `  FAIL on-land: minMargin=${land.minMargin} < required ${land.safetyMargin} at t=${land.worstT.toFixed(3)}`
            );
          } else {
            console.log(`  OK on-land: minMargin=${land.minMargin.toFixed(6)} (>= ${land.safetyMargin})`);
          }
        }

        const jumps = detectLargeJumps(leg.route);
        if (jumps.length > 0) {
          console.log(`  INSPECT ${jumps.length} disproportionately large gap(s) — verify these on the live map, not automatically wrong:`);
          for (const j of jumps) {
            console.log(
              `    segment ${j.index}->${j.index + 1}: ${j.distanceDeg.toFixed(5)}deg (~${j.ratioToMedian.toFixed(1)}x this route's median gap)`
            );
          }
        }
      }
    }
  }

  console.log(sawFailure ? '\nRESULT: one or more hard failures above.' : '\nRESULT: no hard failures (endpoints + on-land checks passed everywhere).');
  process.exit(sawFailure ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
