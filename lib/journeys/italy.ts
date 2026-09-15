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
