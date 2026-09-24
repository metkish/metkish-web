import type { Journey, JourneyPoint } from './types';

// Route data for the Italy road-trip page. Same pattern as
// lib/journeys/tenerife.ts and rendered by the exact same engine
// (components/journey/JourneyMapScene) — Italy is not a new map system,
// just another Journey in the same shared shape (real lng/lat waypoints,
// JourneyMapScene projects/animates/labels them identically to every
// other map on the site).
//
// HOME is the same real, canonical point already used for Tenerife's own
// departure map (see HOME in lib/journeys/tenerife.ts) — one real location
// keeps one coordinate across the whole site, never redefined per
// destination. Same privacy rule too: the map label says only "Home".
//
// The user's Google Maps screenshot (the highlighted "7h38min €151.45"
// option, via Ljubljana and Italy's A4) is the source of truth for this
// route's shape. ITALY_HOME_TO_MILANO_ROUTE below was derived directly
// from that screenshot's highlighted line, not invented or smoothed from
// memory: the highlighted route's distinct pixel colour was isolated from
// the two paler alternate routes also visible in the screenshot, the
// resulting pixels were ordered into one continuous path, and that path
// was simplified (removing only redundant same-curve points) — never
// dropping a real bend. The pixel path was then converted to real lng/lat
// using an affine fit against several known real places clearly
// identifiable in the same screenshot (Maribor, Ljubljana, Trieste,
// Brescia, plus Home/Milano themselves as anchors), so every waypoint
// below is a real geographic coordinate that also reproduces the
// screenshot's actual corridor and bends — including the Ljubljana ->
// Gorizia/border zigzag and the Venezia/Padova/Vicenza double-bend —
// rather than a simplified or artistic curve between Home and Milano.
//
// Caveat worth flagging honestly: this build's network policy currently
// blocks routing-API access (OSRM etc. — see metkish-route-geometry's
// normal verification step), so these waypoints could not be
// cross-checked against a fresh turn-by-turn fetch the way Tenerife's
// routes were. They're derived from the user's own supplied reference
// image (which is itself a real Google Maps driving route) rather than
// from OSRM — worth a live OSRM check once routing access (or a supplied
// GPX/waypoint list) is available, the same way every other route on this
// site was double-checked.
const HOME: JourneyPoint = {
  id: 'home',
  name: 'Home',
  coords: [16 + 5 / 60 + 54 / 3600, 46 + 47 / 60 + 51 / 3600],
  showMapLabel: true,
};

const MILANO: JourneyPoint = {
  id: 'milano',
  name: 'Milano',
  coords: [9.19, 45.4642],
  showMapLabel: true,
};

const ITALY_HOME_TO_MILANO_ROUTE: [number, number][] = [
  HOME.coords,
  [16.1463, 46.7784], // local road south from Home, matching the screenshot's opening hook
  [16.1008, 46.5945],
  [15.7082, 46.5642], // toward Maribor
  [15.6822, 46.4583], // Maribor
  [15.3954, 46.2484],
  [14.9866, 46.2461],
  [14.8761, 46.1688],
  [14.6278, 46.1317], // approaching Ljubljana
  [14.5503, 45.9872], // Ljubljana
  [14.3387, 45.9777],
  [14.3248, 45.7601], // Postojna (A1)
  [14.2290, 45.6939],
  [14.0550, 45.6897], // toward Kozina / the border
  [13.9135, 45.8192], // border area, bending back north
  [13.5926, 45.8888], // toward Gorizia / Villesse (A4 junction)
  [13.0074, 45.7539], // A4 west, staying south of Udine
  [12.7650, 45.7558], // Portogruaro area
  [12.2996, 45.4692], // Mestre / Venezia
  [11.9777, 45.3769], // Padova
  [11.4813, 45.4814], // Vicenza
  [11.2889, 45.3712],
  [10.9563, 45.3572], // Verona
  [10.8934, 45.4135],
  [10.5987, 45.3991],
  [10.1243, 45.5201], // Brescia
  MILANO.coords,
];

export const ITALY_HOME_TO_MILANO_JOURNEY: Journey = {
  id: 'italy-home-to-milano',
  initialCamera: { center: [12.64, 46.1], spanDeg: 9 },
  legs: [
    {
      id: 'home-to-milano',
      mode: 'car',
      from: HOME,
      to: MILANO,
      camera: { center: [12.64, 46.1], spanDeg: 9 },
      route: ITALY_HOME_TO_MILANO_ROUTE,
      // Single-leg journey, so this weight is simply the map's whole
      // autoplay duration in seconds (see JourneyMapScene's
      // totalDurationSeconds/legRanges) — a touch longer than Tenerife's
      // Home->Vienna leg (3.5s) since this route covers noticeably more
      // ground on screen.
      weight: 4.5,
      transition: 'ease',
    },
  ],
};

// ---------------------------------------------------------------------
// Milano -> La Spezia (second road-trip leg)
// ---------------------------------------------------------------------

const LA_SPEZIA: JourneyPoint = {
  id: 'la-spezia',
  name: 'La Spezia',
  coords: [9.817, 44.1],
  showMapLabel: true,
};

// Milano -> La Spezia: south past Pavia's western side, through Voghera,
// over the Apennine pass via the A7 "Autostrada dei Giovi" into Genova,
// then east along the Ligurian coast. Sourced the same way as
// ITALY_HOME_TO_MILANO_ROUTE above: this build's network policy still
// blocks live OSRM access (see that route's own comment), so this route
// was derived from the user's supplied Michelin/ViaMichelin route
// screenshot for this exact drive -- which explicitly shows the road
// heading south past Pavia, over the Apennines to Genova, then east along
// the coast through Rapallo/Portofino/Levanto -- cross-checked
// point-by-point against real, independently verified coordinates (live
// Wikipedia infobox lookups, fetched for this build) for every place
// actually labelled on that screenshot: Cava Manara, Voghera, Arquata
// Scrivia, Busalla, Genova, Santa Margherita Ligure, Rapallo, Sestri
// Levante, Levanto and La Spezia itself. Every waypoint below is therefore
// a real, verified geographic coordinate, not a pixel-traced or estimated
// one -- only the *shape* (which real corridor the drive follows) comes
// from the screenshot, same "never invent, always re-verify" standard as
// every other route on this site, just sourced from a user-supplied image
// rather than a fresh OSRM fetch because that API is unreachable from this
// build.
const ITALY_MILANO_TO_LASPEZIA_ROUTE: [number, number][] = [
  MILANO.coords,
  [9.1, 45.133], // Cava Manara -- the screenshot's via-point west of Pavia (SP193)
  [9.00917, 44.9925], // Voghera
  [8.883, 44.683], // Arquata Scrivia -- joining the A7 corridor
  [8.95, 44.567], // Busalla -- A7 "Autostrada dei Giovi"
  [8.93389, 44.40722], // Genova -- geographic context only, never an overnight stop
  [9.217, 44.333], // Santa Margherita Ligure -- coast road past the Portofino headland
  [9.233, 44.35], // Rapallo
  [9.4, 44.267], // Sestri Levante
  [9.617, 44.167], // Levanto
  LA_SPEZIA.coords,
];

// A fine-detail Ligurian coastline patch (Genova's bay, the Portofino
// promontory, the Cinque Terre coast, the Gulf of La Spezia), built the
// same way as this file's shared CANARY_PATHS precedent in
// components/journey/generated/geography.ts: real
// @geo-maps/earth-lands-1km OpenStreetMap land data, simplified and
// projected through the exact same equirectangular projection (REF_LAT=40)
// components/journey/geo.ts uses everywhere else, then rendered as the
// same soft hand-drawn-style closed path (smoothClosedPath). Needed
// because the shared NEIGHBOUR_PATHS Italy outline (tolerance 0.035 -- see
// scripts/build-geo.mjs) is far too coarse for this leg's real coastal
// bends: at that resolution the Portofino headland and the Gulf of La
// Spezia both flatten away.
//
// Bounding box, and why it's this large: a first version of this patch
// used a tight bbox ([8.75,43.95,10.05,44.55], pad 0.05) sized to just the
// coast itself. That was wrong -- visually inspecting the live rendered
// map (mandatory per this project's route-geometry rule) showed the
// patch's own straight bounding-box clip edges (north/east/west) sitting
// clearly *inside* the visible camera frame (spanDeg 4.2 shows roughly
// lng [7,12] x lat [43,46.5] at typical aspect, wider still on very wide
// viewports), reading as a disconnected floating blob rather than a
// seamless extension of the coarser shared coastline underneath it. Fixed
// by regenerating from a much larger box (lng [7.0,11.5], lat
// [43.3,46.3], pad 0.3, comfortably exceeding the realistic viewport
// range and staying just north of Corsica ~43.03N so it isn't pulled in)
// and keeping only the single largest resulting ring -- the real
// coastline -- discarding several small unrelated Alpine-terrain and
// island fragments the wider box also picked up, per "do not add
// unnecessary clutter."
//
// Verified numerically before use (this project's standing methodology
// for any coastal route, since a clean tsc/validate:routes run alone
// proves nothing about geometry): checking every real named waypoint on
// this leg against this ring found two -- Santa Margherita Ligure and La
// Spezia itself -- sitting a hair (~0.0002-0.0025 world units, i.e. within
// this land source's own resolution/simplification noise) *outside* this
// ring at their small harbour points. Sampling the full route curve at
// 1000 points against this ring ALONE (no fallback) confirmed that
// failure is real: worst margin after routeCurvePoint's safety correction
// stayed strongly negative (~-0.0115), because the curve is forced exactly
// through those two real waypoints regardless of tension -- no amount of
// stiffening can rescue a real endpoint the ring itself excludes. This is
// exactly why ITALY_MILANO_LASPEZIA_INLAND_LAND below still exists as a
// combined routeLand entry: adding it back in (best-margin-across-rings)
// gives every real waypoint a positive margin again (La Spezia: +0.023,
// Santa Margherita: +0.0095) and brings the worst point on the whole
// sampled curve to +0.00027 (exactly the safety threshold, at the
// Portofino headland, max positional nudge ~0.0042 degrees) -- matching
// this route's original verified numbers. This patch is scoped to this
// one journey only -- the shared geography.ts file, and every other map
// on the site (including the Home->Milano map above), is untouched.
const ITALY_LIGURIA_COAST_LAND =
  'M 7.086,-46.600 Q 9.039,-46.600 9.039,-44.800 Q 9.039,-43.000 8.547,-43.000 Q 8.055,-43.000 8.064,-43.047 Q 8.073,-43.094 8.068,-43.166 Q 8.064,-43.237 8.050,-43.272 Q 8.037,-43.306 8.024,-43.314 Q 8.011,-43.323 7.999,-43.361 Q 7.986,-43.400 7.978,-43.401 Q 7.970,-43.401 7.960,-43.425 Q 7.951,-43.449 7.932,-43.462 Q 7.913,-43.474 7.899,-43.507 Q 7.886,-43.541 7.896,-43.563 Q 7.906,-43.584 7.901,-43.578 Q 7.897,-43.571 7.900,-43.575 Q 7.903,-43.580 7.896,-43.581 Q 7.889,-43.581 7.877,-43.629 Q 7.866,-43.677 7.871,-43.677 Q 7.877,-43.676 7.872,-43.724 Q 7.867,-43.771 7.873,-43.771 Q 7.879,-43.771 7.873,-43.772 Q 7.867,-43.772 7.857,-43.819 Q 7.847,-43.866 7.815,-43.914 Q 7.783,-43.962 7.747,-43.995 Q 7.710,-44.028 7.686,-44.040 Q 7.661,-44.051 7.652,-44.043 Q 7.644,-44.035 7.638,-44.036 Q 7.633,-44.037 7.590,-44.073 Q 7.547,-44.110 7.539,-44.102 Q 7.531,-44.095 7.523,-44.099 Q 7.516,-44.102 7.525,-44.084 Q 7.535,-44.065 7.541,-44.066 Q 7.546,-44.067 7.539,-44.058 Q 7.532,-44.048 7.472,-44.094 Q 7.412,-44.139 7.402,-44.142 Q 7.392,-44.145 7.386,-44.139 Q 7.380,-44.134 7.369,-44.153 Q 7.359,-44.171 7.313,-44.205 Q 7.268,-44.239 7.251,-44.239 Q 7.235,-44.238 7.225,-44.249 Q 7.215,-44.260 7.209,-44.256 Q 7.203,-44.252 7.199,-44.266 Q 7.195,-44.279 7.174,-44.296 Q 7.153,-44.312 7.113,-44.330 Q 7.074,-44.348 7.066,-44.341 Q 7.058,-44.334 7.060,-44.317 Q 7.061,-44.299 7.033,-44.311 Q 7.005,-44.322 7.009,-44.334 Q 7.013,-44.345 7.008,-44.353 Q 7.002,-44.361 6.925,-44.377 Q 6.847,-44.392 6.842,-44.403 Q 6.836,-44.414 6.834,-44.406 Q 6.832,-44.398 6.795,-44.407 Q 6.758,-44.415 6.770,-44.417 Q 6.781,-44.419 6.775,-44.421 Q 6.769,-44.424 6.734,-44.425 Q 6.700,-44.427 6.607,-44.377 Q 6.514,-44.327 6.507,-44.317 Q 6.500,-44.308 6.508,-44.311 Q 6.515,-44.315 6.488,-44.296 Q 6.460,-44.277 6.469,-44.267 Q 6.478,-44.258 6.462,-44.239 Q 6.447,-44.221 6.450,-44.208 Q 6.454,-44.195 6.395,-44.168 Q 6.335,-44.140 6.320,-44.115 Q 6.305,-44.091 6.303,-44.067 Q 6.301,-44.044 6.277,-44.018 Q 6.253,-43.992 6.257,-43.974 Q 6.262,-43.955 6.249,-43.950 Q 6.236,-43.946 6.210,-43.918 Q 6.184,-43.891 6.123,-43.864 Q 6.061,-43.836 6.043,-43.837 Q 6.026,-43.838 6.013,-43.827 Q 6.000,-43.816 5.990,-43.820 Q 5.979,-43.823 5.954,-43.809 Q 5.928,-43.795 5.914,-43.797 Q 5.899,-43.799 5.889,-43.788 Q 5.878,-43.776 5.859,-43.785 Q 5.841,-43.793 5.799,-43.788 Q 5.757,-43.783 5.746,-43.766 Q 5.735,-43.749 5.723,-43.754 Q 5.710,-43.759 5.692,-43.739 Q 5.673,-43.719 5.647,-43.716 Q 5.621,-43.712 5.620,-43.701 Q 5.618,-43.690 5.624,-43.688 Q 5.630,-43.687 5.624,-43.681 Q 5.617,-43.675 5.610,-43.691 Q 5.604,-43.707 5.599,-43.696 Q 5.595,-43.685 5.588,-43.692 Q 5.580,-43.698 5.563,-43.692 Q 5.545,-43.687 5.535,-43.668 Q 5.525,-43.648 5.505,-43.651 Q 5.485,-43.655 5.470,-43.621 Q 5.456,-43.587 5.462,-43.567 Q 5.468,-43.546 5.461,-43.544 Q 5.453,-43.543 5.455,-43.552 Q 5.456,-43.560 5.446,-43.566 Q 5.437,-43.571 5.414,-43.553 Q 5.392,-43.535 5.383,-43.543 Q 5.375,-43.551 5.354,-43.546 Q 5.333,-43.541 5.324,-43.529 Q 5.314,-43.517 5.322,-43.507 Q 5.329,-43.497 5.319,-43.490 Q 5.309,-43.484 5.307,-43.468 Q 5.304,-43.451 5.287,-43.438 Q 5.270,-43.425 5.260,-43.429 Q 5.250,-43.434 5.251,-43.422 Q 5.252,-43.411 5.226,-43.410 Q 5.201,-43.408 5.184,-43.416 Q 5.168,-43.423 5.155,-43.406 Q 5.143,-43.389 5.150,-43.389 Q 5.156,-43.389 5.150,-43.368 Q 5.145,-43.347 5.139,-43.346 Q 5.132,-43.344 5.132,-44.972 Q 5.132,-46.600 7.086,-46.600 Z';

// A deliberately coarse land ring covering the *whole* Milano -> La Spezia
// corridor -- passed as an extra routeLand entry only, never rendered (not
// in extraLandPatches). Still required even now that
// ITALY_LIGURIA_COAST_LAND's own box has been enlarged well past the
// camera frame: that enlargement fixed the *visual* clipped-edge problem,
// but ITALY_LIGURIA_COAST_LAND is still a real, detailed coastline ring,
// and at that detail level a couple of real small-harbour waypoints
// (Santa Margherita, La Spezia) sit a hair outside it -- see the numeric
// verification note above. routeCurvePoint checks every curve sample
// against *every* supplied land ring and keeps the best (safest) margin,
// so pairing the fine ring with this much more rounded, generous one
// means every real waypoint -- inland and coastal alike -- always has at
// least one ring it's comfortably inside, while the fine ring's real
// detail still governs the one place that actually needs it (the
// Portofino headland, where the plain curve would otherwise cut the
// corner into open water).
const ITALY_MILANO_LASPEZIA_INLAND_LAND =
  'M 6.741,-46.000 Q 8.120,-46.000 8.120,-44.800 Q 8.120,-43.600 8.002,-43.600 Q 7.884,-43.600 7.866,-43.733 Q 7.847,-43.866 7.779,-43.947 Q 7.710,-44.028 7.629,-44.069 Q 7.547,-44.110 7.539,-44.079 Q 7.532,-44.048 7.303,-44.198 Q 7.074,-44.348 7.068,-44.323 Q 7.061,-44.299 6.881,-44.363 Q 6.700,-44.427 6.580,-44.352 Q 6.460,-44.277 6.457,-44.236 Q 6.454,-44.195 6.395,-44.168 Q 6.335,-44.140 6.260,-44.016 Q 6.184,-43.891 5.773,-43.745 Q 5.362,-43.600 5.362,-44.800 Q 5.362,-46.000 6.741,-46.000 Z';

export const ITALY_MILANO_TO_LASPEZIA_JOURNEY: Journey = {
  id: 'italy-milano-to-laspezia',
  initialCamera: { center: [9.35, 44.78], spanDeg: 4.2 },
  legs: [
    {
      id: 'milano-to-laspezia',
      mode: 'car',
      from: MILANO,
      to: LA_SPEZIA,
      camera: { center: [9.35, 44.78], spanDeg: 4.2 },
      route: ITALY_MILANO_TO_LASPEZIA_ROUTE,
      routeLand: [ITALY_MILANO_LASPEZIA_INLAND_LAND, ITALY_LIGURIA_COAST_LAND],
      // Shorter/simpler than the Home->Milano leg's 4.5s: meaningfully
      // less ground and one clear directional turn (south to Genova, then
      // east along the coast) rather than several country crossings.
      weight: 3.5,
      transition: 'ease',
    },
  ],
  // Fine coastal detail layered on top of the shared (coarser) coastline,
  // exactly like CANARY_PATHS layers over WIDE_EUROPE_PATHS for the same
  // Canary Islands region -- see the doc comment above
  // ITALY_LIGURIA_COAST_LAND for why the shared outline isn't enough here.
  extraLandPatches: [ITALY_LIGURIA_COAST_LAND],
  extraCoastlineStrokes: [ITALY_LIGURIA_COAST_LAND],
};
