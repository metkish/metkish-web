import type { Journey, JourneyPoint } from './types';
import { HOME_TO_LJUBLJANA_ROUTE } from './flights-departure-airports';
import { ICELAND_FAR_LAND, GREENLAND_FAR_LAND } from '@/components/journey/generated/iceland-far-land';

// Route data for the Iceland page. Same pattern/engine as every other
// destination (lib/journeys/tenerife.ts, lib/journeys/italy.ts,
// lib/journeys/rome.ts, lib/journeys/barcelona.ts) -- Iceland is not a new
// map system, just another Journey in the same shared shape, rendered by
// the exact same components/journey/JourneyMapScene.

// HOME is the same real, canonical point already used for every other
// destination's own departure map (see HOME in lib/journeys/tenerife.ts,
// lib/journeys/italy.ts, lib/journeys/rome.ts and
// lib/journeys/flights-departure-airports.ts) -- one real location keeps
// one coordinate across the whole site, never redefined per destination.
// Same privacy rule too: the map label says only "Home", never the actual
// municipality (Grad, Prekmurje) that coordinate corresponds to.
const HOME: JourneyPoint = {
  id: 'home',
  name: 'Home',
  coords: [16 + 5 / 60 + 54 / 3600, 46 + 47 / 60 + 51 / 3600],
  showMapLabel: true,
};

// Ljubljana Jože Pučnik Airport (LJU/LJLJ) -- the same real, canonical
// airport point already used by lib/journeys/flights-departure-airports.ts
// (14.4576, 46.2237; cross-checked there against two independent aviation
// reference sources, PlaneMapper and Dauntless Aviation/pilotnav.com).
// Kept as its own local const here rather than imported, matching this
// codebase's established per-destination-file convention (see
// lib/journeys/italy.ts's own HOME const and its comment on why: route
// data lives per destination file, completely separate from the map
// engine).
const LJUBLJANA_AIRPORT: JourneyPoint = {
  id: 'ljubljana-airport',
  name: 'Ljubljana Airport',
  sublabel: 'Brnik',
  coords: [14.4576, 46.2237],
  showMapLabel: true,
};

// Home -> Ljubljana Airport: the real driving route, shared with the
// "How I Search for Flights" page's own departure-airports map so both
// pages always draw the identical, independently-verified geometry --
// see lib/journeys/flights-departure-airports.ts's own
// HOME_TO_LJUBLJANA_ROUTE for the full real-route derivation notes
// (OSRM, steps=true, overview=full, re-verified end to end: local roads
// through Murska Sobota, the A5 to the Dragučova interchange, the A1
// through the Celje and Ljubljana basins to the Zadobrova-area
// off-ramp, then Ljubljana's own streets and the regional road (ref
// 104) through Trzin to the airport's real access-road roundabouts).

// Single-leg journey, same shape as ROME_HOME_TO_TRIESTE_JOURNEY /
// TENERIFE_HOME_TO_VIENNA_JOURNEY. Camera framed with generous padding on
// every side (checked numerically against both endpoints at mobile,
// tablet and desktop container aspects, not picked from the bounding box
// alone -- same live-tuning discipline as every other leg's own camera
// comment), centred a little north-east of the route's own midpoint so
// Ljubljana's marker and label sit clear of the frame edge on a narrow
// mobile container too.
export const ICELAND_HOME_TO_LJUBLJANA_JOURNEY: Journey = {
  id: 'iceland-home-to-ljubljana',
  initialCamera: { center: [15.1, 46.55], spanDeg: 4.8 },
  legs: [
    {
      id: 'home-to-ljubljana',
      mode: 'car',
      from: HOME,
      to: LJUBLJANA_AIRPORT,
      camera: { center: [15.1, 46.55], spanDeg: 4.8 },
      curve: 0.1,
      route: HOME_TO_LJUBLJANA_ROUTE,
      weight: 3.5,
      transition: 'ease',
    },
  ],
};

// ---------------------------------------------------------------------
// Ljubljana Airport -> (flight) -> Keflavík International Airport, the
// real 17 October 2025 direct charter flight. Reuses the same
// LJUBLJANA_AIRPORT point defined above -- one canonical coordinate per
// location, per the project's route-geometry rule -- rather than
// redefining it.
//
// This is a flight leg (mode: 'plane'), so -- same as every other
// destination's own flight leg (Barcelona's Vienna -> Barcelona,
// Tenerife's Vienna -> Tenerife) -- there is no `route` waypoint array to
// verify against OSRM; the metkish-route-geometry rule governs real
// driving/train routes specifically, and a flight's drawn line is the
// engine's own decorative curve (see `curve` below), not a road or rail
// corridor. What does need to be, and is, real and verified here is each
// airport's own coordinate: Ljubljana Airport reuses the site's existing
// verified point; Keflavík International Airport (KEF/BIKF) is
// 63.985001°N, 22.6056°W, cross-checked against public aviation reference
// data (airport-data.com).
//
// The plane actually lands at Keflavík, roughly 50km from Reykjavík
// itself -- the map's destination marker is Keflavík International
// Airport, not Reykjavík, so the geography stays accurate even though the
// trip's overall destination (and the city named in this page's hero) is
// Reykjavík.
const KEFLAVIK_AIRPORT: JourneyPoint = {
  id: 'keflavik-airport',
  name: 'Keflavík Airport',
  sublabel: 'Reykjavík',
  coords: [-22.6056, 63.985001],
  showMapLabel: true,
  // The flight's final approach comes in from the south-east at a
  // shallow angle (see the route's own curve), so the default
  // right-growing label would sit on top of the pink line here -- same
  // case as Loro Parque in lib/journeys/tenerife.ts. 'above' moves the
  // text clear of the line without moving the marker itself.
  labelPlacement: 'above',
};

// Ljubljana Airport -> (flight) -> Keflavík Airport, ending with the same
// "cinematic hold on the arrival frame" shape as every other flight map on
// the site (Barcelona's BARCELONA_VIENNA_TO_BARCELONA_JOURNEY, Tenerife's
// own Vienna -> Tenerife journey): a 'fly' leg covering the flight itself,
// then a second from===to 'fly' leg at the same camera that holds the
// finished route on screen as the map's resting frame.
//
// Camera framing: this is a much longer, more northerly hop than any
// other flight on the site (Ljubljana to just south of the Arctic Circle,
// crossing most of Europe and the North Atlantic), so spanDeg is sized
// generously past this leg's own real bounding box (~37.1deg of
// longitude, ~17.8deg of latitude) -- checked numerically against both
// endpoints at mobile, tablet and desktop container aspects (not picked
// from the bounding box alone), leaving at least ~20% clear margin on
// every side at every checked breakpoint.
export const ICELAND_LJUBLJANA_TO_KEFLAVIK_JOURNEY: Journey = {
  id: 'iceland-ljubljana-to-keflavik',
  // Framed tight on Ljubljana Airport itself, same opening-frame logic as
  // every other flight map on the site (starts "at the departure airport"
  // before the first leg's 'fly' transition pans out to the wide view
  // below).
  initialCamera: { center: [14.4576, 46.2237], spanDeg: 9 },
  legs: [
    {
      id: 'ljubljana-to-keflavik',
      mode: 'plane',
      from: LJUBLJANA_AIRPORT,
      to: KEFLAVIK_AIRPORT,
      camera: { center: [-4.074, 55.1044], spanDeg: 66 },
      // A gentle northward bow, same decorative-curve family as every
      // other flight leg on the site (Barcelona -0.06, Tenerife -0.045) --
      // slightly more pronounced given this route's much greater length
      // and latitude change, roughly tracking a real great-circle's own
      // northward bow between these two points.
      curve: -0.09,
      // Same "approx. 4-5s" pacing as every other flight leg.
      weight: 4.5,
      transition: 'fly',
    },
    {
      id: 'keflavik-arrival-zoom',
      mode: 'plane',
      from: KEFLAVIK_AIRPORT,
      to: KEFLAVIK_AIRPORT,
      // Deliberately the SAME camera as the leg above (not a tighter
      // zoom) -- the map's resting frame reads as a complete summary of
      // the whole flight (Ljubljana, the full pink route and Keflavík all
      // inside the frame at once), exactly like every other flight map's
      // own arrival hold.
      camera: { center: [-4.074, 55.1044], spanDeg: 66 },
      weight: 1.5,
      transition: 'fly',
    },
  ],
  // Iceland and Greenland both sit well north of the shared
  // WIDE_EUROPE_PATHS baked coastline (components/journey/generated/
  // geography.ts caps out at 56 degN -- see scripts/build-geo.mjs's own
  // WIDE_BBOX), so without this they simply weren't drawn as land at all
  // on this one very wide (spanDeg 66) map -- not a subtle contrast
  // issue, an outright gap. ICELAND_FAR_LAND/GREENLAND_FAR_LAND (real
  // OpenStreetMap coastline, same projection/methodology as the shared
  // data -- see that generated file's own header) fill it in, opt-in for
  // this journey only via the same mechanism Barcelona/Italy/Tenerife's
  // own coastline patches use, so no other destination map is touched.
  //
  // extraLandFill/extraLandStroke are deliberately left unset: Iceland and
  // Greenland use the exact same shared MUTED_LAND tone as every other
  // journey's map, never a separate colour scheme for one destination.
  //
  // No extraCoastlineStrokes here (unlike Barcelona/Italy/Tenerife's own
  // small coastline patches): those exist to stroke the new edge a small
  // corrective patch adds where it meets the existing baked coastline, so
  // the join doesn't look like a seam. Iceland/Greenland aren't a small
  // correction to an adjoining shape -- there's no existing coastline
  // nearby for them to join -- so a stroke here would only have drawn a
  // visible outline/border around them, which read as far more detailed
  // and "drawn-in" than the rest of this map (and every other Metkish
  // flight map, e.g. the Vienna -> Tenerife flight in
  // lib/journeys/tenerife.ts, which has no border on its own distant
  // backdrop either). Plain fill only, same as everything else here.
  //
  // extraLandOpacity: 0.4 matches the exact opacity mainland Europe,
  // the British Isles and Scandinavia already render at on THIS map via
  // the shared WIDE_EUROPE_PATHS default (see JourneyMapScene.tsx) --
  // the same soft, understated "distant backdrop" look every other
  // Metkish flight map uses, Vienna -> Tenerife included. Iceland and
  // Greenland fade to that same subtle tone rather than standing out at
  // the fixed 0.85 opacity every OTHER journey's own small coastline
  // patch still uses (Barcelona/Italy/Tenerife unaffected).
  extraLandPatches: [...ICELAND_FAR_LAND, ...GREENLAND_FAR_LAND],
  extraLandOpacity: 0.4,
};
