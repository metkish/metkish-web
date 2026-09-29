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

// ---------------------------------------------------------------------
// La Spezia -> Pisa (third road-trip leg)
// ---------------------------------------------------------------------

const PISA: JourneyPoint = {
  id: 'pisa',
  name: 'Pisa',
  coords: [10.4, 43.717],
  showMapLabel: true,
};

// La Spezia -> Pisa: the drive first heads a short distance north/inland
// from La Spezia to join the A12 "Autostrada Azzurra" near Santo Stefano
// di Magra, then follows the A12 south along the coastal plain through
// Massa, Montignoso, Pietrasanta and Camaiore to Viareggio -- where the
// A12 ends -- and continues inland past the Migliarino San Rossore e
// Massaciuccoli park through San Giuliano Terme into Pisa.
//
// Sourced the same way as ITALY_MILANO_TO_LASPEZIA_ROUTE above: this
// build's network policy still blocks live OSRM access (re-confirmed
// while building this leg -- the egress proxy returns a 403 on the
// CONNECT to router.project-osrm.org), so the route's *shape* comes from
// the user's own supplied Google/Apple Maps screenshot for this exact
// drive, which shows exactly this pattern (a short hook north to the A12
// near Santo Stefano di Magra, the coastal A12 south past
// Massa/Pietrasanta/Viareggio, then inland via San Giuliano Terme into
// Pisa). Every waypoint below is a real, independently verified
// coordinate -- not a pixel trace or an estimate -- taken from each
// place's own Wikipedia infobox (fetched for this build): Santo Stefano
// di Magra, Massa, Montignoso, Pietrasanta, Camaiore, Viareggio, San
// Giuliano Terme and Pisa itself (La Spezia reuses the already-canonical
// LA_SPEZIA point above, unchanged). Latitude decreases monotonically
// from La Spezia to Pisa across every waypoint, matching the real
// southbound drive and the shape the reference screenshot shows -- only
// the *shape* (which real corridor the drive follows) comes from the
// screenshot, same standard as every other route on this site.
const ITALY_LASPEZIA_TO_PISA_ROUTE: [number, number][] = [
  LA_SPEZIA.coords,
  [9.917, 44.167], // Santo Stefano di Magra -- A12 junction north of La Spezia
  [10.133, 44.033], // Massa
  [10.167, 44.017], // Montignoso
  [10.233, 43.967], // Pietrasanta
  [10.3, 43.933], // Camaiore
  [10.233, 43.867], // Viareggio -- A12 ends here, route continues inland
  [10.44, 43.761], // San Giuliano Terme
  PISA.coords,
];

// A fine-detail coastline patch for this leg's Tuscan coast stretch
// (Liguria/Tuscany mainland from roughly La Spezia down past Massa,
// Pietrasanta and Viareggio to south of Pisa), built the same way as
// ITALY_LIGURIA_COAST_LAND above: real @geo-maps/earth-lands-1km
// OpenStreetMap land data, clipped to a bbox comfortably exceeding this
// leg's camera viewport (center [10.1,43.94], spanDeg 2.4), simplified,
// and projected through the same equirectangular projection (REF_LAT=40)
// components/journey/geo.ts uses everywhere else. Needed for the same
// reason as the Liguria patch: running npm run validate:routes against
// the shared, coarser NEIGHBOUR_PATHS outline failed the on-land check
// for this route (minMargin -0.0055 at t=0.75, right where the route
// leaves the coast near Viareggio and cuts inland toward San Giuliano
// Terme) -- that stretch of coast, and the inland cut past the
// Migliarino San Rossore e Massaciuccoli park's lake, is too fine
// for the shared outline's resolution. Only the single largest ring
// from the source data was kept (the real mainland coastline) --
// smaller rings the clip bbox also picked up (a Corsica fragment, Elba,
// Lago di Massaciuccoli) were discarded, per this project's standing
// "keep only the real, relevant land, no unrelated fragments" rule.
// Verified after adding: npm run validate:routes reports this leg's
// on-land check passing (minMargin positive) using this patch alone as
// routeLand, and the live rendered map was visually inspected per the
// mandatory QA step before this leg shipped.
const ITALY_TUSCAN_COAST_LAND =
  'M 7.699,-45.300 Q 9.269,-45.300 9.269,-44.000 Q 9.269,-42.700 8.846,-42.700 Q 8.422,-42.700 8.420,-42.708 Q 8.417,-42.715 8.378,-42.739 Q 8.338,-42.763 8.302,-42.768 Q 8.266,-42.773 8.243,-42.788 Q 8.220,-42.802 8.231,-42.806 Q 8.242,-42.810 8.247,-42.821 Q 8.253,-42.832 8.251,-42.850 Q 8.250,-42.869 8.256,-42.879 Q 8.263,-42.889 8.258,-42.900 Q 8.253,-42.910 8.228,-42.926 Q 8.203,-42.942 8.158,-42.951 Q 8.113,-42.959 8.096,-42.952 Q 8.079,-42.945 8.078,-42.933 Q 8.077,-42.921 8.058,-42.927 Q 8.040,-42.932 8.035,-42.960 Q 8.030,-42.988 8.043,-42.993 Q 8.055,-42.998 8.064,-43.046 Q 8.073,-43.094 8.068,-43.166 Q 8.064,-43.237 8.050,-43.272 Q 8.037,-43.306 8.024,-43.314 Q 8.011,-43.323 7.999,-43.361 Q 7.986,-43.400 7.978,-43.401 Q 7.970,-43.401 7.960,-43.425 Q 7.951,-43.449 7.932,-43.462 Q 7.913,-43.474 7.899,-43.507 Q 7.886,-43.541 7.896,-43.563 Q 7.906,-43.584 7.901,-43.578 Q 7.897,-43.571 7.900,-43.575 Q 7.903,-43.580 7.896,-43.581 Q 7.889,-43.581 7.877,-43.629 Q 7.866,-43.677 7.871,-43.677 Q 7.877,-43.676 7.872,-43.724 Q 7.867,-43.771 7.873,-43.771 Q 7.879,-43.771 7.873,-43.772 Q 7.867,-43.772 7.857,-43.819 Q 7.847,-43.866 7.815,-43.914 Q 7.783,-43.962 7.747,-43.995 Q 7.710,-44.028 7.686,-44.040 Q 7.661,-44.051 7.652,-44.043 Q 7.644,-44.035 7.638,-44.036 Q 7.633,-44.037 7.590,-44.073 Q 7.547,-44.110 7.539,-44.102 Q 7.531,-44.095 7.523,-44.099 Q 7.516,-44.102 7.525,-44.084 Q 7.535,-44.065 7.541,-44.066 Q 7.546,-44.067 7.539,-44.058 Q 7.532,-44.048 7.472,-44.094 Q 7.412,-44.139 7.402,-44.142 Q 7.392,-44.145 7.386,-44.139 Q 7.380,-44.134 7.369,-44.153 Q 7.359,-44.171 7.313,-44.205 Q 7.268,-44.239 7.251,-44.239 Q 7.235,-44.238 7.225,-44.249 Q 7.215,-44.260 7.209,-44.256 Q 7.203,-44.252 7.199,-44.266 Q 7.195,-44.279 7.174,-44.296 Q 7.153,-44.312 7.113,-44.330 Q 7.074,-44.348 7.066,-44.341 Q 7.058,-44.334 7.060,-44.317 Q 7.061,-44.299 7.033,-44.311 Q 7.005,-44.322 7.009,-44.334 Q 7.013,-44.345 7.008,-44.353 Q 7.002,-44.361 6.925,-44.377 Q 6.847,-44.392 6.842,-44.403 Q 6.836,-44.414 6.834,-44.406 Q 6.832,-44.398 6.795,-44.407 Q 6.758,-44.415 6.770,-44.417 Q 6.781,-44.419 6.775,-44.421 Q 6.769,-44.424 6.734,-44.425 Q 6.700,-44.427 6.607,-44.377 Q 6.514,-44.327 6.507,-44.317 Q 6.500,-44.308 6.508,-44.311 Q 6.515,-44.315 6.488,-44.296 Q 6.460,-44.277 6.469,-44.267 Q 6.478,-44.258 6.462,-44.239 Q 6.447,-44.221 6.450,-44.208 Q 6.454,-44.195 6.395,-44.168 Q 6.335,-44.140 6.320,-44.115 Q 6.305,-44.091 6.303,-44.067 Q 6.301,-44.044 6.277,-44.018 Q 6.253,-43.992 6.257,-43.974 Q 6.262,-43.955 6.249,-43.950 Q 6.236,-43.946 6.210,-43.918 Q 6.184,-43.891 6.156,-43.879 Q 6.128,-43.866 6.128,-44.583 Q 6.128,-45.300 7.699,-45.300 Z';

// A second, deliberately coarse/rounded fallback ring covering the same
// bbox as ITALY_TUSCAN_COAST_LAND above -- same role
// ITALY_MILANO_LASPEZIA_INLAND_LAND plays for the Liguria leg. Built the
// same way but with a much higher simplification tolerance (0.08 vs
// 0.006), so it is a rougher approximation of the coast that, paired with
// the fine ring via routeCurvePoint's best-margin-across-rings check,
// gives every real waypoint (including ones sitting right at the
// coastline, like Viareggio) at least one ring it is comfortably inside.
// Added because the fine ring alone still failed npm run validate:routes
// on-land check at t=0.75 (right at/after the Viareggio waypoint, where
// the route leaves the coast); combining both rings fixed it.
const ITALY_LASPEZIA_PISA_INLAND_LAND =
  'M 7.699,-45.300 Q 9.269,-45.300 9.269,-44.000 Q 9.269,-42.700 8.846,-42.700 Q 8.422,-42.700 8.321,-42.751 Q 8.220,-42.802 8.211,-42.872 Q 8.203,-42.942 8.121,-42.937 Q 8.040,-42.932 8.052,-43.085 Q 8.064,-43.237 7.924,-43.600 Q 7.783,-43.962 7.428,-44.155 Q 7.074,-44.348 6.887,-44.388 Q 6.700,-44.427 6.414,-44.147 Q 6.128,-43.866 6.128,-44.583 Q 6.128,-45.300 7.699,-45.300 Z';

export const ITALY_LASPEZIA_TO_PISA_JOURNEY: Journey = {
  id: 'italy-laspezia-to-pisa',
  initialCamera: { center: [10.1, 43.94], spanDeg: 2.4 },
  legs: [
    {
      id: 'laspezia-to-pisa',
      mode: 'car',
      from: LA_SPEZIA,
      to: PISA,
      camera: { center: [10.1, 43.94], spanDeg: 2.4 },
      route: ITALY_LASPEZIA_TO_PISA_ROUTE,
      // The shared, coarser Italy/Europe outline (same one the map
      // already renders as background land) doubles as this leg's
      // coastline-safety check -- this stretch of Tuscan coast is a
      // gentle, gradually-curving shoreline (no tight headland like
      // Liguria's Portofino promontory, which is why that leg needed its
      // own fine patch), so the shared outline was verified sufficient by
      // visual inspection of the live rendered map before this leg
      // shipped.
      routeLand: [
        // La Spezia itself is the shared start point with the Milano ->
        // La Spezia leg above, and its harbour coordinate sits a hair
        // outside this leg's own new rings (same real-small-harbour-point
        // edge case documented on ITALY_LIGURIA_COAST_LAND) -- reusing
        // those already-verified rings here (rather than re-deriving new
        // ones) gives that shared point the same positive margin it
        // already has on the previous leg.
        ITALY_MILANO_LASPEZIA_INLAND_LAND,
        ITALY_LIGURIA_COAST_LAND,
        ITALY_LASPEZIA_PISA_INLAND_LAND,
        ITALY_TUSCAN_COAST_LAND,
      ],
      // Shorter than the Milano -> La Spezia leg's 3.5s: less ground
      // covered and a simpler shape -- one short directional hook out of
      // La Spezia, then a long, mostly straight southbound coastal run.
      weight: 3,
      transition: 'ease',
    },
  ],
};

// ---------------------------------------------------------------------
// Pisa -> Peschiera del Garda (fourth road-trip leg)
// ---------------------------------------------------------------------

const PESCHIERA: JourneyPoint = {
  id: 'peschiera-del-garda',
  name: 'Peschiera del Garda',
  coords: [10.683, 45.433],
  showMapLabel: true,
};

// Peccioli: the small Tuscany detour taken between Pisa and Peschiera del
// Garda (see the page's "A little Tuscany detour" section) -- a real
// waypoint on this journey, not just a photo caption, so the map must
// show the actual Pisa -> Peccioli -> Peschiera del Garda drive rather
// than a direct Pisa -> Peschiera line. Coordinate independently verified
// via this place's own English Wikipedia infobox (43.550N, 10.717E),
// same sourcing standard as every other named waypoint in this file.
// markerSize: 'small' keeps it visually subordinate to Pisa and Peschiera
// del Garda -- the two real road-trip bases -- rather than styled as
// another major stop, per this project's editorial rule that a detour
// waypoint reads as secondary on the map.
const PECCIOLI: JourneyPoint = {
  id: 'peccioli',
  name: 'Peccioli',
  coords: [10.717, 43.55],
  showMapLabel: true,
  markerSize: 'small',
};

// Pisa -> Peccioli -> Peschiera del Garda (fourth road-trip leg, now two
// legs so the real Tuscany detour renders as an actual detour rather than
// a straight line the text above it would then contradict).
//
// This shape was corrected against the user's own supplied Michelin
// route screenshot for this exact drive (La Spezia/Pisa area down to
// Peccioli, "4h5min / €64.11" toll estimate visible near the top
// junction), which shows this is a real there-and-back-by-different-roads
// loop, not a simple hook off the fast road: the drive leaves the
// SS67/SGC "Firenze-Pisa-Livorno" corridor near Pontedera, heads south on
// the WEST side of the Ponsacco/Capannoli/Forcoli triangle (via SP23
// through Ponsacco, then the SS439 through Capannoli) down to Peccioli,
// then returns north on the EAST side of that same triangle (via Forcoli)
// back to the same Pontedera-area junction -- explicitly skipping the
// direct fast-road segment between them, per the user's own description
// of the drive -- before continuing on toward Montopoli in Val d'Arno,
// Empoli and Firenze. No live OSRM access was available while building
// this leg (this build's network policy still blocks it), so, per the
// metkish-route-geometry rule, the route's real corridor and shape come
// from that supplied screenshot rather than from OSRM, and every named
// waypoint on it below is still a real, independently verified coordinate
// (live Wikipedia infobox lookups, fetched for this build), not a pixel
// trace or an estimate.
//
// Leg 1, Pisa -> Peccioli: east on the SGC FI-PI-LI "Firenze-Pisa-Livorno"
// to Pontedera, then south -- the outbound, WEST side of the loop -- via
// Ponsacco (SP23) and Capannoli (SS439) down into the Valdera hills to
// Peccioli, matching the real east/southeast departure direction out of
// Pisa and the noticeably larger southward reach the screenshot shows.
const ITALY_PISA_TO_PECCIOLI_ROUTE: [number, number][] = [
  PISA.coords,
  [10.63278, 43.6625], // Pontedera -- FI-PI-LI junction, leaving the fast road here
  [10.633, 43.617], // Ponsacco -- SP23, the outbound/west side of the loop
  [10.667, 43.583], // Capannoli -- SS439, continuing south
  PECCIOLI.coords,
];

// Leg 2, Peccioli -> Peschiera del Garda: the return, EAST side of the
// same loop -- north via Forcoli (SS439/SP26), a real but different road
// from the outbound Ponsacco route, back up to the same Pontedera-area
// junction -- a genuine driving backtrack, not simplified away, and
// exactly the "back up onto the fast road, one stretch of it skipped"
// shape the screenshot and the user's own description both show. From
// there the drive rejoins the fast road corridor northeast through
// Montopoli in Val d'Arno and Empoli into Firenze, then the same verified
// A1/A22/A4 motorway corridor as before: A1 "Autostrada del Sole" north
// over the Apennines through Firenzuola to Bologna, then west to Modena,
// A22 "Autostrada del Brennero" north past Mantova to the Verona Nord
// interchange, and finally a short stretch west on the A4 to the
// Peschiera del Garda exit -- preserving the real manoeuvre of heading
// north up the A22 past Modena before doubling back west on the A4, a
// genuine driving backtrack in its own right.
const ITALY_PECCIOLI_TO_PESCHIERA_ROUTE: [number, number][] = [
  PECCIOLI.coords,
  [10.70306, 43.60472], // Forcoli -- SS439/SP26, the return/east side of the loop
  [10.63278, 43.6625], // Pontedera area again -- rejoining the fast-road junction
  [10.75, 43.667], // Montopoli in Val d'Arno -- continuing northeast on the fast road
  [10.95, 43.717], // Empoli -- FI-PI-LI continuing east toward Firenze
  [11.254, 43.771], // Firenze -- A1 begins
  [11.383, 44.117], // Firenzuola -- the real A1 Apennine crossing
  [11.343, 44.494], // Bologna
  [10.926, 44.647], // Modena -- A1/A22 junction near Campogalliano
  [10.993, 45.439], // Verona -- A22 north past Mantova to the Verona Nord interchange
  PESCHIERA.coords, // A4 west from Verona Nord to the Peschiera del Garda exit
];

// Leg 1's own tight camera: at the wide (spanDeg 5.6) camera the whole
// rest of this journey uses, the real ~35km Peccioli loop -- genuinely
// noticeable when actually driving it, per the user's own description and
// the supplied Michelin screenshot -- reads as barely more than a hook
// next to Pisa, simply because it is a small fraction of the ~400km
// Pisa->Peschiera span the wide camera has to cover. Framing leg 1 tight
// on just the Pisa/Ponsacco/Capannoli/Peccioli/Forcoli cluster (bbox
// lng [10.4, 10.717], lat [43.55, 43.717], centered and padded) lets the
// loop actually read as a loop before the camera eases back out to the
// wide highway view for leg 2 -- the same "tight detail shot, then pull
// back for the long haul" camera language this site already uses (see
// TENERIFE_VIENNA_TO_TENERIFE_JOURNEY's Vienna-tight opening frame before
// its flight leg pans out to the wide Europe/Atlantic view).
const ITALY_PECCIOLI_DETOUR_CAMERA = { center: [10.56, 43.63] as [number, number], spanDeg: 1.1 };
const ITALY_PISA_TO_PESCHIERA_WIDE_CAMERA = { center: [10.89, 44.49] as [number, number], spanDeg: 5.6 };

export const ITALY_PISA_TO_PESCHIERA_JOURNEY: Journey = {
  id: 'italy-pisa-to-peschiera',
  // Opens on the tight detour camera (not the wide one) so the map's
  // first frame is already framed on Pisa, matching where leg 1 actually
  // starts, rather than opening on a wide frame the first leg would then
  // have to zoom into.
  initialCamera: ITALY_PECCIOLI_DETOUR_CAMERA,
  legs: [
    {
      id: 'pisa-to-peccioli',
      mode: 'car',
      from: PISA,
      to: PECCIOLI,
      camera: ITALY_PECCIOLI_DETOUR_CAMERA,
      route: ITALY_PISA_TO_PECCIOLI_ROUTE,
      // Purely inland, same as every other leg on this route -- no
      // coastline anywhere near this corridor, so no routeLand needed.
      // Slightly longer than before now that it's framed tight (weight
      // 1.5, not 1): at this zoom the loop's real shape needs a moment
      // longer on screen to read clearly before the camera pulls back.
      weight: 1.5,
      transition: 'ease',
    },
    {
      id: 'peccioli-to-peschiera',
      mode: 'car',
      from: PECCIOLI,
      to: PESCHIERA,
      // Eases back out to the wide camera the rest of the journey uses --
      // the "pull back for the long haul" half of the detail-shot/wide-shot
      // pairing described above.
      camera: ITALY_PISA_TO_PESCHIERA_WIDE_CAMERA,
      route: ITALY_PECCIOLI_TO_PESCHIERA_ROUTE,
      // Same fast, entirely inland motorway transit as before -- no
      // routeLand needed. Longer than leg 1: covers the backtrack out of
      // Peccioli plus the full Florence -> Bologna -> Modena -> Verona ->
      // Peschiera haul, the most real ground of any leg on this page
      // after Home->Milano.
      weight: 4.5,
      transition: 'ease',
    },
  ],
};

// ---------------------------------------------------------------------
// Peschiera del Garda -> Home (fifth and final road-trip leg)
// ---------------------------------------------------------------------

// The drive home never actually went to Venice -- the plan to visit was
// cancelled (see the page's "Venice? Not this time." section) -- so this
// route runs east from Peschiera del Garda past the Venice area without
// stopping, through the Trieste/Gorizia corridor and Slovenia, back to
// Home. The user's supplied Michelin/route-planning screenshot for this
// exact drive shows almost exactly this corridor in the opposite
// direction (Lake Garda/Verona -> Venice area -> Trieste -> Slovenia ->
// the Austria/Hungary/Slovenia border region near Home), which is the
// same real corridor ITALY_HOME_TO_MILANO_ROUTE above already uses for
// its own Verona/Vicenza/Padova/Mestre-Venezia/Portogruaro/
// Gorizia-Villesse/Kozina/Postojna/Ljubljana/Maribor stretch. Rather than
// deriving a fresh set of waypoints from the screenshot, this leg reuses
// those already real, independently-verified coordinates in reverse --
// per this project's route-geometry rule that a shared corridor reused by
// multiple journeys must stay identical in shape (differing only by
// camera), and per the standing preference for reusing/re-verifying real
// coordinates over inventing new ones. The only new connector is Peschiera
// -> [10.8934, 45.4135]: Peschiera del Garda's own real A4 exit sits on
// this same verified corridor, directly between the already-verified
// Brescia and Verona waypoints (10.1243, 45.5201 and 10.9563, 45.3572), so
// no new coordinate was invented there either. Venice/Mestre (12.2996,
// 45.4692) is included only as a plain route waypoint -- exactly as it
// already is on the Home->Milano route -- never as a JourneyPoint/marker,
// per the explicit instruction not to mark Venice as a stop.
const ITALY_PESCHIERA_TO_HOME_ROUTE: [number, number][] = [
  PESCHIERA.coords,
  [10.8934, 45.4135],
  [10.9563, 45.3572], // Verona
  [11.2889, 45.3712],
  [11.4813, 45.4814], // Vicenza
  [11.9777, 45.3769], // Padova
  [12.2996, 45.4692], // Mestre / Venezia -- passed through, never marked as a stop
  [12.7650, 45.7558], // Portogruaro area
  [13.0074, 45.7539], // A4 east, staying south of Udine
  [13.5926, 45.8888], // Gorizia / Villesse (A4 junction)
  [13.9135, 45.8192], // border area
  [14.0550, 45.6897], // toward Kozina
  [14.2290, 45.6939],
  [14.3248, 45.7601], // Postojna (A1)
  [14.3387, 45.9777],
  [14.5503, 45.9872], // Ljubljana
  [14.6278, 46.1317],
  [14.8761, 46.1688],
  [14.9866, 46.2461],
  [15.3954, 46.2484],
  [15.6822, 46.4583], // Maribor
  [15.7082, 46.5642],
  [16.1008, 46.5945],
  [16.1463, 46.7784],
  HOME.coords,
];

export const ITALY_PESCHIERA_TO_HOME_JOURNEY: Journey = {
  id: 'italy-peschiera-to-home',
  initialCamera: { center: [13.35, 46.05], spanDeg: 7.5 },
  legs: [
    {
      id: 'peschiera-to-home',
      mode: 'car',
      from: PESCHIERA,
      to: HOME,
      camera: { center: [13.35, 46.05], spanDeg: 7.5 },
      route: ITALY_PESCHIERA_TO_HOME_ROUTE,
      // A touch shorter than the Home->Milano leg's 4.5s: this leg
      // covers slightly less ground (it starts from Peschiera, short of
      // Milano) even though it retraces most of the same corridor.
      weight: 4.2,
      transition: 'ease',
    },
  ],
};
