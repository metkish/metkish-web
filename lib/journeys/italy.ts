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
// The user's Google Maps screenshot (the "7h38min" highlighted option,
// via Ljubljana and Italy's A4) was used as the *route reference* only —
// which real roads the drive actually uses — not as a pixel trace and not
// as a rendered background image. ITALY_HOME_TO_MILANO_ROUTE below is
// built from the real, named waypoints that corridor actually passes
// through (Maribor, Ljubljana, the Slovenia/Italy border near
// Sežana-Fernetti, the A4 at Villesse, Udine, Portogruaro, Mestre/Venezia,
// Padova, Vicenza, Verona, Brescia, Milano), each a well-known real place
// rather than an invented shortcut straight between Home and Milano.
//
// Caveat worth flagging honestly: this build's network policy currently
// blocks routing-API access (OSRM etc. — see metkish-route-geometry's
// normal verification step), so unlike Tenerife's routes these waypoints
// could not be cross-checked against a fresh turn-by-turn fetch. They're
// real place coordinates chosen to match the corridor visible in the
// reference screenshot, not OSRM-verified geometry — worth a live check
// once routing access (or a supplied GPX/waypoint list) is available, the
// same way every other route on this site was double-checked.
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
  [15.6459, 46.5547], // Maribor
  [14.5058, 46.0569], // Ljubljana
  [14.2136, 45.7739], // Postojna (A1)
  [13.8747, 45.7089], // Sežana / Fernetti border area
  [13.3106, 45.8843], // Villesse (A4 junction, Italy)
  [13.2346, 46.0693], // Udine
  [12.8386, 45.7773], // Portogruaro
  [12.2447, 45.4903], // Mestre / Venezia
  [11.8768, 45.4064], // Padova
  [11.5469, 45.5455], // Vicenza
  [10.9916, 45.4384], // Verona
  [10.2118, 45.5416], // Brescia
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
