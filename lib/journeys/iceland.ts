import type { Journey, JourneyPoint, JourneyCamera } from './types';
import { HOME_TO_LJUBLJANA_ROUTE } from './flights-departure-airports';
import { ICELAND_FAR_LAND, GREENLAND_FAR_LAND } from '@/components/journey/generated/iceland-far-land';
import { ICELAND_FULL_ISLAND_LAND } from '@/components/journey/generated/iceland-full-island-land';

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


// =======================================================================
// ARRIVAL & BLUE LAGOON -- Keflavik -> Reykjavik -> Blue Lagoon ->
// Reykjavik, our first day. Perlan is deliberately NOT on this route:
// the exact order/transport arrangements for that stop haven't been
// confirmed yet, per explicit direction, so it stays out of the map
// until they are. All three legs are real OSRM driving routes
// (steps=true, overview=simplified), re-verified end to end -- never
// estimated. Mode is 'transfer' on every leg: this day's transport was
// arranged by the travel agency (see "Getting There"/"Where We Stayed"
// above), not a self-driven rental car, so the map's vehicle icon uses
// the shared BUS_BODY_PATH solid bus silhouette in JourneyMapScene
// (see that file's own icon-path comments) rather than the plain car
// icon every self-driven leg on this site uses -- a clean, minimal,
// top-down bus silhouette, redesigned (per explicit feedback) to match
// the same solid-silhouette language as the car/train icons rather than
// an earlier thin stroked outline. 'transfer' is defined in the shared
// JourneyMode type and has been fully wired into JourneyMapScene's
// vehicle rendering since early in this project, but until the Iceland
// maps no journey on the site had actually used it -- so this redesign
// only changes what 'transfer' mode itself renders, with no visible
// effect on any other destination's maps, none of which use it.
// =======================================================================

// Reykjavík: the shared hub point for both this journey and the Golden
// Circle journey below -- one canonical coordinate, reused as departure
// and/or return point on several legs across both, per the project's
// "one real location, one coordinate" rule. 64.14583°N, 21.9425°W,
// cross-checked against Wikipedia's own infobox coordinate for the city.
const REYKJAVIK: JourneyPoint = {
  id: 'reykjavik',
  name: 'Reykjavík',
  coords: [-21.9425, 64.14583],
  showMapLabel: true,
  // Reykjavík is this shared point's nearest neighbour on every map it
  // appears on (Arrival & Blue Lagoon, Golden Circle, South Coast), but
  // in a different real-world direction each time -- Keflavík/Blue
  // Lagoon sit west of it, Þingvellir/Seljalandsfoss sit east. 'above'
  // is the one placement that clears all three without favouring (or
  // colliding with) any single neighbour's own direction.
  labelPlacement: 'above',
};

// Blue Lagoon geothermal spa. 63.8799°N, 22.4481°W, cross-checked against
// Wikipedia's own infobox coordinate.
const BLUE_LAGOON: JourneyPoint = {
  id: 'blue-lagoon',
  name: 'Blue Lagoon',
  coords: [-22.4481, 63.8799],
  showMapLabel: true,
  // ~18-44px from Keflavík Airport's dot (already 'above') at this
  // map's own SW-Iceland camera -- 'below' keeps this label clear of
  // that one without moving either point's coordinate.
  labelPlacement: 'below',
};

// Keflavík Airport -> Reykjavík: real OSRM driving route -- Reykjanesbraut
// (41) the length of the Reykjanes peninsula, then Hafnarfjarðarvegur ->
// Kringlumýrarbraut -> Miklabraut -> Hringbraut into central Reykjavík,
// ending on Tjarnargata near the city pond (Tjörnin). Endpoints forced to
// the canonical KEFLAVIK_AIRPORT/REYKJAVIK coordinates; every interior
// point is the real route geometry, unchanged.
const KEFLAVIK_TO_REYKJAVIK_ROUTE: [number, number][] = [
  KEFLAVIK_AIRPORT.coords,
  [-22.586265, 63.989137],
  [-22.578748, 63.982632],
  [-22.579652, 63.978197],
  [-22.564524, 63.978025],
  [-22.561811, 63.980098],
  [-22.541421, 63.971701],
  [-22.449183, 63.961507],
  [-22.403239, 63.963632],
  [-22.377504, 63.968006],
  [-22.271959, 63.995736],
  [-22.187532, 64.010892],
  [-22.172691, 64.016748],
  [-22.137223, 64.020501],
  [-22.069682, 64.036928],
  [-22.043399, 64.039744],
  [-22.009357, 64.048954],
  [-21.942668, 64.059334],
  [-21.937183, 64.067109],
  [-21.943345, 64.08394],
  [-21.904202, 64.103503],
  [-21.907734, 64.111136],
  [-21.898091, 64.116642],
  [-21.897854, 64.133157],
  [-21.934811, 64.136702],
  [-21.947732, 64.142665],
  REYKJAVIK.coords,
];

// Reykjavík -> Blue Lagoon: real OSRM driving route -- out of the city on
// Hringbraut/Bústaðavegur/Kringlumýrarbraut, Hafnarfjarðarvegur (40) and
// Reykjanesbraut (41) down the peninsula, exiting onto Grindavíkurvegur
// (43) toward Grindavík, then Bláalónsvegur (426) and Norðurljósavegur
// into the Blue Lagoon's own access road. Endpoints forced to the
// canonical REYKJAVIK/BLUE_LAGOON coordinates.
const REYKJAVIK_TO_BLUE_LAGOON_ROUTE: [number, number][] = [
  REYKJAVIK.coords,
  [-21.938892, 64.145702],
  [-21.940077, 64.138614],
  [-21.900753, 64.125577],
  [-21.898297, 64.117349],
  [-21.908029, 64.111272],
  [-21.905079, 64.103193],
  [-21.944054, 64.083856],
  [-21.937646, 64.06637],
  [-21.940482, 64.060213],
  [-22.007879, 64.049388],
  [-22.043984, 64.039878],
  [-22.070043, 64.037082],
  [-22.136923, 64.020753],
  [-22.17327, 64.016931],
  [-22.193492, 64.009814],
  [-22.273595, 63.995585],
  [-22.381502, 63.967352],
  [-22.420734, 63.963324],
  [-22.419603, 63.956904],
  [-22.42856, 63.946753],
  [-22.419887, 63.910446],
  [-22.425867, 63.889137],
  [-22.421557, 63.882347],
  [-22.434678, 63.883189],
  [-22.441448, 63.879946],
  BLUE_LAGOON.coords,
];

// Blue Lagoon -> Reykjavík: real OSRM driving route for the return leg --
// the same real corridor back (Norðurljósavegur -> Bláalónsvegur ->
// Grindavíkurvegur -> Reykjanesbraut -> Hafnarfjarðarvegur ->
// Kringlumýrarbraut -> Miklabraut -> Hringbraut -> Tjarnargata), fetched
// independently rather than assumed identical to the outbound leg, since
// Reykjavík's one-way city streets mean a return drive isn't always a
// perfect mirror -- verified true here too, with only minor fine-grained
// differences inside the city. Endpoints forced to the canonical
// BLUE_LAGOON/REYKJAVIK coordinates.
const BLUE_LAGOON_TO_REYKJAVIK_ROUTE: [number, number][] = [
  BLUE_LAGOON.coords,
  [-22.441448, 63.879946],
  [-22.434678, 63.883189],
  [-22.421557, 63.882347],
  [-22.425867, 63.889137],
  [-22.419735, 63.910488],
  [-22.42856, 63.946753],
  [-22.418875, 63.962186],
  [-22.379396, 63.967569],
  [-22.273372, 63.995412],
  [-22.219971, 64.003985],
  [-22.185712, 64.011339],
  [-22.172691, 64.016748],
  [-22.137223, 64.020501],
  [-22.069682, 64.036928],
  [-22.043399, 64.039744],
  [-22.009357, 64.048954],
  [-21.940316, 64.060109],
  [-21.937183, 64.067109],
  [-21.943345, 64.08394],
  [-21.904202, 64.103503],
  [-21.907734, 64.111136],
  [-21.898091, 64.116642],
  [-21.897854, 64.133157],
  [-21.934811, 64.136702],
  [-21.947732, 64.142665],
  REYKJAVIK.coords,
];

// Shared camera for every leg of this journey (the same deliberate
// "one steady frame" shape as ICELAND_LJUBLJANA_TO_KEFLAVIK_JOURNEY's own
// arrival hold): a full-island camera was tried first per an earlier
// request, but made this route's own stops too small and close together
// to read comfortably, per direct follow-up feedback -- this map now
// frames southwestern Iceland instead (Reykjanes peninsula, Faxaflói
// bay and a swath of the west coast beyond the route itself), roughly
// half the country's own geographical scale rather than the whole
// island, so the real route (Keflavík/Reykjavík/Blue Lagoon, a
// genuinely small ~0.7deg-wide triangle) reads as clearly prominent
// while the surrounding coastline still shows where it sits. Sized and
// centred numerically (checked against both the >=1.7 desktop branch
// and the <1.7 mobile branch of JourneyMapScene's own computeFrame) so
// every stop and its label stays legible and uncropped at every
// realistic container width -- this map's own framing, not shared with
// the other two (see GOLDEN_CIRCLE_CAMERA and SOUTH_COAST_CAMERA below,
// each tailored to its own route for the same reason), per explicit
// direction that the three maps don't need identical boundaries as long
// as they share the same visual system.
const ARRIVAL_BLUE_LAGOON_CAMERA: JourneyCamera = {
  center: [-22.3, 64.0],
  spanDeg: 4.5,
};

// Leg weights below were slowed down 2.5x from this journey's first
// draft (each leg's own relative share of the total is unchanged -- only
// the overall pace) per explicit feedback that the autoplay animation
// moved far too quickly to read comfortably, then a further, modest
// 1.25x on top of that (3.25 -> 4.06) per a later explicit request to
// slow the animation slightly so visitors can follow the now much wider
// full-island journey. Scoped entirely to this journey's own data; the
// shared animation engine (components/journey/JourneyMapScene.tsx) and
// every other destination's journeys are untouched.
export const ICELAND_ARRIVAL_BLUE_LAGOON_JOURNEY: Journey = {
  id: 'iceland-arrival-blue-lagoon',
  initialCamera: ARRIVAL_BLUE_LAGOON_CAMERA,
  legs: [
    {
      id: 'keflavik-to-reykjavik',
      mode: 'transfer',
      from: KEFLAVIK_AIRPORT,
      to: REYKJAVIK,
      camera: ARRIVAL_BLUE_LAGOON_CAMERA,
      route: KEFLAVIK_TO_REYKJAVIK_ROUTE,
      weight: 4.06,
      transition: 'ease',
    },
    {
      id: 'reykjavik-to-blue-lagoon',
      mode: 'transfer',
      from: REYKJAVIK,
      to: BLUE_LAGOON,
      camera: ARRIVAL_BLUE_LAGOON_CAMERA,
      route: REYKJAVIK_TO_BLUE_LAGOON_ROUTE,
      weight: 4.06,
      transition: 'ease',
    },
    {
      id: 'blue-lagoon-to-reykjavik',
      mode: 'transfer',
      from: BLUE_LAGOON,
      to: REYKJAVIK,
      camera: ARRIVAL_BLUE_LAGOON_CAMERA,
      route: BLUE_LAGOON_TO_REYKJAVIK_ROUTE,
      weight: 4.06,
      transition: 'ease',
    },
  ],
  // Full-island Iceland coastline (see that generated file's own
  // header) -- needed because the shared base coastline data
  // (components/journey/generated/geography.ts) has no Iceland coverage
  // at all (Iceland sits north of its WIDE_BBOX cap), and the much
  // coarser-tolerance iceland-far-land.ts patch (built for the very wide
  // Ljubljana->Keflavik flight map) is unsuitable at this much closer
  // zoom. Covering the whole island means this one patch works
  // regardless of which window each map's own camera frames -- reused,
  // unchanged, by all three Iceland road-trip maps below even though
  // each now has its own distinct camera. Plain fill only, default
  // opacity (0.85, same as every other journey's own close-zoom
  // coastline patch) -- no extraCoastlineStrokes, since there is no
  // existing shared coastline nearby for this patch to join (same
  // situation as iceland-far-land.ts itself).
  extraLandPatches: ICELAND_FULL_ISLAND_LAND,
};

// =======================================================================
// GOLDEN CIRCLE -- Reykjavik -> Thingvellir -> Geysir & Strokkur ->
// Gullfoss -> Reykjavik, the organised excursion. All four legs are real
// OSRM driving routes, re-verified end to end. The return leg
// deliberately does NOT retrace the outbound road: OSRM's own shortest/
// fastest route for Gullfoss->Reykjavik actually backtracks the exact
// same Þingvellir/Laugarvatn corridor used outbound (confirmed via
// alternatives=true), which would draw as an overlapping there-and-back
// line rather than a loop and doesn't match how the Golden Circle tour
// is actually run (or named) -- the real, independently verified
// alternative route via Selfoss (Route 35 south, then Route 1 west) is
// used instead, since that's the genuine loop shape or an organised
// excursion. Mode is 'transfer' on every leg, same reasoning as the
// Arrival & Blue Lagoon journey above (an organised excursion, not a
// self-driven rental car) -- see that journey's own top-of-file note on
// reusing the shared shuttle/van icon as-is.
// =======================================================================

// Þingvellir National Park. 64.253806°N, 21.03725°W, cross-checked
// against Wikipedia's own infobox coordinate.
const THINGVELLIR: JourneyPoint = {
  id: 'thingvellir',
  name: 'Þingvellir',
  sublabel: 'National Park',
  coords: [-21.03725, 64.253806],
  showMapLabel: true,
  // Sits close to both Reykjavík and Geysir, which both use 'above' on
  // this map's own framing -- 'below' keeps this label (and its long
  // "National Park" sublabel) clear of both without moving the point.
  labelPlacement: 'below',
};

// Geysir / Strokkur, in the Haukadalur geothermal area -- Strokkur's own
// coordinate (the active geyser itself). 64.31306°N, 20.30056°W,
// cross-checked against Wikipedia's own infobox coordinate. On the
// Golden Circle map Gullfoss sits only ~10km east and at almost the same
// latitude, so the two markers land close together on screen at this
// camera's zoom; the default rightward-growing label would run straight
// into Gullfoss's own marker/label. labelPlacement: 'above' (the same
// mechanism already used for Loro Parque in lib/journeys/tenerife.ts for
// an analogous close-marker case) stacks this label above its own dot
// instead, which keeps it centered on Geysir's own x-position rather
// than reaching rightward -- fixing the overlap without moving either
// marker or touching Gullfoss's own default (right) placement.
const GEYSIR: JourneyPoint = {
  id: 'geysir',
  name: 'Geysir',
  sublabel: 'Strokkur',
  coords: [-20.30056, 64.31306],
  showMapLabel: true,
  labelPlacement: 'above',
};

// Gullfoss waterfall. 64.32611°N, 20.12111°W, cross-checked against
// Wikipedia's own infobox coordinate.
const GULLFOSS: JourneyPoint = {
  id: 'gullfoss',
  name: 'Gullfoss',
  coords: [-20.12111, 64.32611],
  showMapLabel: true,
  // ~9-23px from Geysir's dot (already 'above') at this map's own
  // western-and-southern-Iceland camera -- 'below' keeps this label
  // clear of that one without moving either point's coordinate.
  labelPlacement: 'below',
};

// Reykjavík -> Þingvellir: real OSRM driving route -- Miklabraut ->
// Vesturlandsvegur (the Ring Road, 1) through Mosfellsbær, then
// Þingvallavegur (36) the rest of the way. Endpoints forced to the
// canonical REYKJAVIK/THINGVELLIR coordinates.
const REYKJAVIK_TO_THINGVELLIR_ROUTE: [number, number][] = [
  REYKJAVIK.coords,
  [-21.938892, 64.145702],
  [-21.940077, 64.138614],
  [-21.931766, 64.135912],
  [-21.9168, 64.135937],
  [-21.840162, 64.124034],
  [-21.786602, 64.124704],
  [-21.764495, 64.132048],
  [-21.753942, 64.143903],
  [-21.733405, 64.15544],
  [-21.712712, 64.164495],
  [-21.696552, 64.164597],
  [-21.683464, 64.167867],
  [-21.671571, 64.178573],
  [-21.586537, 64.180741],
  [-21.545711, 64.186535],
  [-21.511308, 64.19562],
  [-21.435891, 64.208969],
  [-21.421404, 64.209583],
  [-21.39717, 64.20581],
  [-21.34627, 64.214677],
  [-21.312462, 64.209648],
  [-21.260115, 64.211355],
  [-21.199521, 64.230079],
  [-21.183773, 64.242848],
  [-21.143677, 64.254826],
  [-21.125574, 64.267096],
  [-21.095021, 64.279071],
  [-21.075893, 64.277334],
  [-21.050597, 64.26116],
  [-21.030048, 64.257927],
  THINGVELLIR.coords,
];

// Þingvellir -> Geysir: real OSRM driving route, via Laugarvatn --
// Lyngdalsheiðarvegur (365) -> Laugarvatnsvegur (37) ->
// Biskupstungnabraut (35) -> Haukadalsvegur (333). Endpoints forced to
// the canonical THINGVELLIR/GEYSIR coordinates.
const THINGVELLIR_TO_GEYSIR_ROUTE: [number, number][] = [
  THINGVELLIR.coords,
  [-21.022625, 64.250933],
  [-21.029306, 64.234643],
  [-21.050958, 64.229658],
  [-21.054416, 64.221421],
  [-21.031088, 64.198779],
  [-21.016591, 64.194908],
  [-20.982663, 64.196248],
  [-20.922869, 64.191919],
  [-20.863585, 64.199928],
  [-20.802778, 64.202116],
  [-20.742826, 64.211676],
  [-20.713962, 64.231526],
  [-20.69254, 64.240079],
  [-20.668394, 64.240676],
  [-20.644156, 64.236227],
  [-20.635098, 64.232002],
  [-20.631976, 64.225743],
  [-20.616572, 64.223193],
  [-20.602368, 64.225744],
  [-20.575155, 64.225293],
  [-20.550333, 64.238964],
  [-20.516948, 64.24005],
  [-20.504821, 64.242593],
  [-20.464128, 64.266724],
  [-20.432741, 64.276495],
  [-20.41536, 64.276648],
  [-20.382536, 64.270916],
  [-20.355509, 64.273836],
  [-20.341413, 64.284484],
  [-20.329177, 64.302547],
  GEYSIR.coords,
];

// Geysir -> Gullfoss: real OSRM driving route -- Biskupstungnabraut (35),
// becoming Kjalvegur (35). Endpoints forced to the canonical
// GEYSIR/GULLFOSS coordinates.
const GEYSIR_TO_GULLFOSS_ROUTE: [number, number][] = [
  GEYSIR.coords,
  [-20.298314, 64.311551],
  [-20.294715, 64.312343],
  [-20.27943, 64.313889],
  [-20.274157, 64.31432],
  [-20.270312, 64.314277],
  [-20.261187, 64.31331],
  [-20.253614, 64.311601],
  [-20.248892, 64.310913],
  [-20.196578, 64.306954],
  [-20.182897, 64.305671],
  [-20.169624, 64.305709],
  [-20.164934, 64.306831],
  [-20.147628, 64.31595],
  [-20.140278, 64.317782],
  [-20.135282, 64.32017],
  [-20.134174, 64.32335],
  GULLFOSS.coords,
];

// Gullfoss -> Reykjavík: real OSRM driving route via Selfoss -- Kjalvegur/
// Biskupstungnabraut (35) south, Skeiða- og Hrunamannavegur (30),
// Einholtsvegur (358), back onto Biskupstungnabraut (35) into Selfoss,
// then Suðurlandsvegur (1) all the way to Reykjavík via
// Vesturlandsvegur/Miklabraut/Hringbraut -- the genuine Golden-Circle
// loop corridor, deliberately NOT the backtrack-via-Þingvellir route
// OSRM's own shortest-path default picks (see this journey's own
// top-of-file note). Re-verified via a single multi-waypoint OSRM query
// (Gullfoss -> Selfoss -> Reykjavik in one request) rather than this
// file's original two separately-fetched and hand-concatenated legs --
// both agree on the same real shape, but the single query is the more
// authoritative source and is what this array now reflects, with the
// Route 1/Route 35 junction loop around Selfoss itself kept at full,
// un-thinned resolution (see that stretch's own inline comment below for
// why). Endpoints forced to the canonical GULLFOSS/REYKJAVIK
// coordinates.
const GULLFOSS_TO_REYKJAVIK_ROUTE: [number, number][] = [
  GULLFOSS.coords,
  [-20.167957, 64.30592],
  [-20.232682, 64.309687],
  [-20.242949, 64.299484],
  [-20.225484, 64.286131],
  [-20.226827, 64.275502],
  [-20.255908, 64.272917],
  [-20.278632, 64.262918],
  [-20.285284, 64.254303],
  [-20.375768, 64.213616],
  [-20.408484, 64.190852],
  [-20.456443, 64.176838],
  [-20.50937, 64.171346],
  [-20.595809, 64.124684],
  [-20.70502, 64.105828],
  [-20.762717, 64.075011],
  [-20.872182, 64.047866],
  [-20.976416, 64.003844],
  [-20.978784, 64.002327],
  [-20.982629, 63.997713],
  [-20.982735, 63.996814],
  [-20.98217, 63.994787],
  [-20.982157, 63.993675],
  [-20.98333, 63.990361],
  [-20.983572, 63.988868],
  [-20.983092, 63.984392],
  [-20.984319, 63.981394],
  [-20.98456, 63.978733],
  [-20.985159, 63.976557],
  [-20.98556, 63.975485],
  [-20.986223, 63.974622],
  [-20.989765, 63.971774],
  [-20.99074, 63.968531],
  [-20.991615, 63.967248],
  [-20.992749, 63.96622],
  [-20.994296, 63.965271],
  [-21.000681, 63.962969],
  [-21.008743, 63.959356],
  [-21.012434, 63.957294],
  [-21.018108, 63.953397],
  [-21.02121, 63.952134],
  // Selfoss -- real interior waypoint, not a marked stop on this map.
  // This whole stretch (through the end of the Selfoss comment block
  // below) was re-derived from a full, unsimplified OSRM geometry fetch
  // of just this sub-section -- not the general-purpose `overview=
  // simplified` request used for the rest of the route -- because the
  // original simplified version under-sampled a real, verified loop in
  // the road here and let this map's loose (low-tension) route spline
  // overshoot it into a visibly exaggerated, "wrong-looking" bend (the
  // issue flagged after review). The real road genuinely does this: it
  // descends into Selfoss on Biskupstungnabraut (35), works through the
  // Route 1/Route 35 junction interchange, and comes back out heading
  // west -- confirmed two independent ways: a single multi-waypoint OSRM
  // query (Gullfoss -> Selfoss -> Reykjavik in one request, so OSRM
  // resolves the real connecting roads itself rather than this file
  // stitching two separate point-to-point legs by hand) and a full-detail
  // re-fetch of just this junction, both showing the same loop,
  // including the route legitimately passing within meters of one of its
  // own earlier points (a real interchange self-crossing, not a
  // duplicate-point bug). Keeping this many points here (vs. the sparser
  // 2-3 points the rest of this leg's long straight stretches use) is
  // intentional and required -- per the project's own route-geometry
  // rule, a real loop/backtrack must never be thinned down to the point
  // that a smoothing spline can no longer follow its actual shape.
  [-21.021035, 63.951832],
  [-21.021406, 63.951078],
  [-21.021105, 63.950493],
  [-21.020034, 63.949959],
  [-21.015868, 63.948917],
  [-21.014239, 63.948234],
  [-21.00826, 63.9434],
  [-21.005634, 63.941962],
  [-21.005014, 63.941054],
  [-21.005273, 63.939479],
  [-21.004073, 63.937889],
  [-21.004063, 63.937382],
  [-20.99879, 63.937217],
  [-20.99923, 63.932082],
  [-20.999429, 63.931876],
  [-21.006267, 63.932039],
  [-21.0113, 63.934242],
  [-21.006148, 63.936595],
  [-21.00341, 63.937409],
  [-21.004073, 63.937889],
  [-21.00525, 63.939421],
  [-21.005092, 63.941321],
  [-21.005891, 63.942165],
  [-21.008602, 63.943652],
  [-21.013161, 63.947555],
  [-21.013398, 63.947988],
  [-21.020644, 63.950329],
  [-21.021207, 63.951088],
  [-21.020791, 63.951808],
  [-21.020173, 63.952069],
  [-21.020409, 63.952305],
  [-21.022577, 63.952405],
  [-21.048959, 63.955848],
  [-21.064131, 63.957243],
  [-21.077476, 63.957922],
  [-21.106752, 63.958515],
  [-21.112535, 63.959404],
  [-21.116382, 63.960566],
  [-21.160832, 63.985992],
  [-21.192673, 63.995402],
  [-21.225091, 64.00117],
  [-21.217075, 64.007177],
  [-21.229009, 64.016199],
  [-21.242623, 64.010401],
  [-21.301238, 64.022069],
  [-21.346147, 64.018389],
  [-21.405835, 64.019234],
  [-21.424259, 64.02963],
  [-21.447799, 64.03508],
  [-21.463926, 64.043959],
  [-21.503721, 64.057939],
  [-21.548931, 64.060584],
  [-21.635862, 64.07322],
  [-21.705836, 64.091368],
  [-21.733241, 64.094282],
  [-21.773655, 64.104669],
  [-21.788204, 64.125756],
  [-21.846564, 64.12482],
  [-21.915927, 64.135938],
  [-21.933614, 64.136388],
  [-21.947732, 64.142665],
  REYKJAVIK.coords,
];

// Shared camera for every leg of this journey -- same reasoning as
// ARRIVAL_BLUE_LAGOON_CAMERA above (a full-island view made this route
// too small to follow), framed instead to show roughly the western and
// southern half of Iceland so the Golden Circle loop itself (Reykjavík
// -> Þingvellir -> Geysir -> Gullfoss) is clearly the subject, with
// enough surrounding coastline for geographical context. This map's own
// framing, distinct from ARRIVAL_BLUE_LAGOON_CAMERA and
// SOUTH_COAST_CAMERA, per the same explicit direction that the three
// maps don't need identical boundaries.
const GOLDEN_CIRCLE_CAMERA: JourneyCamera = {
  center: [-20.8, 64.3],
  spanDeg: 7.5,
};

// Same 2.5x slow-down as ICELAND_ARRIVAL_BLUE_LAGOON_JOURNEY above, plus
// the same further, modest 1.25x slow-down on top of that (see that
// journey's own comment) -- relative pacing between legs preserved,
// only the overall speed changed.
export const ICELAND_GOLDEN_CIRCLE_JOURNEY: Journey = {
  id: 'iceland-golden-circle',
  initialCamera: GOLDEN_CIRCLE_CAMERA,
  legs: [
    {
      id: 'reykjavik-to-thingvellir',
      mode: 'transfer',
      from: REYKJAVIK,
      to: THINGVELLIR,
      camera: GOLDEN_CIRCLE_CAMERA,
      route: REYKJAVIK_TO_THINGVELLIR_ROUTE,
      weight: 4.38,
      transition: 'ease',
    },
    {
      id: 'thingvellir-to-geysir',
      mode: 'transfer',
      from: THINGVELLIR,
      to: GEYSIR,
      camera: GOLDEN_CIRCLE_CAMERA,
      route: THINGVELLIR_TO_GEYSIR_ROUTE,
      weight: 4.06,
      transition: 'ease',
    },
    {
      id: 'geysir-to-gullfoss',
      mode: 'transfer',
      from: GEYSIR,
      to: GULLFOSS,
      camera: GOLDEN_CIRCLE_CAMERA,
      route: GEYSIR_TO_GULLFOSS_ROUTE,
      weight: 1.88,
      transition: 'ease',
    },
    {
      id: 'gullfoss-to-reykjavik',
      mode: 'transfer',
      from: GULLFOSS,
      to: REYKJAVIK,
      camera: GOLDEN_CIRCLE_CAMERA,
      route: GULLFOSS_TO_REYKJAVIK_ROUTE,
      weight: 8.13,
      transition: 'ease',
    },
  ],
  // Same full-island coastline patch as ICELAND_ARRIVAL_BLUE_LAGOON_JOURNEY
  // above -- one patch, reused by all three of this page's road-trip
  // maps even though each has its own distinct camera, since the patch
  // covers the whole island regardless of which window is framed. Plain
  // fill, default opacity, no extraCoastlineStrokes -- same reasoning as
  // that journey's own comment.
  extraLandPatches: ICELAND_FULL_ISLAND_LAND,
};

// =======================================================================
// SOUTH COAST -- REAL, FINISHED MAP. Reykjavik -> Seljalandsfoss ->
// Skogafoss -> Reynisfjara -> Vik -> Reykjavik, per explicit request,
// matching the Golden Circle map's own design (warm beige background,
// Iceland silhouette, pink route, same 'transfer' bus icon). Every leg
// below carries a real, OSRM-verified `route` -- fetched fresh for this
// pass, never estimated -- per this project's own route-geometry rule.
// =======================================================================

// Seljalandsfoss waterfall. 63.61583°N, 19.99278°W, cross-checked against
// Wikipedia's own infobox coordinate (shared with the earlier draft --
// already independently verified, unchanged here).
const SELJALANDSFOSS: JourneyPoint = {
  id: 'seljalandsfoss',
  name: 'Seljalandsfoss',
  coords: [-19.99278, 63.61583],
  showMapLabel: true,
  // The South Coast chain (this point, then Skógafoss, Reynisfjara, Vík)
  // sits close together at this map's own framing, so each point
  // alternates 'above'/'below' down the chain for maximum separation
  // between adjacent labels -- this one matches Reynisfjara's 'above'
  // two stops down, opposite Skógafoss's 'below' in between.
  labelPlacement: 'above',
};

// Skogafoss waterfall -- the actual attraction shown in this page's own
// "Skogafoss" subsection, not the Skogar village area the earlier draft
// used as a rough stand-in. 63.532111°N, 19.511139°W, cross-checked
// against Wikipedia's own infobox coordinate for Skogafoss itself.
const SKOGAFOSS: JourneyPoint = {
  id: 'skogafoss',
  name: 'Skógafoss',
  coords: [-19.511139, 63.532111],
  showMapLabel: true,
  // Sits close to both Seljalandsfoss (default 'right') and Reynisfjara
  // (already 'above') at the shared full-island camera used by this map
  // -- 'below' separates this label from both of its chain neighbours
  // without moving any point's coordinate.
  labelPlacement: 'below',
};

// Vik i Myrdal village centre. 63.41666°N, 19.000°W (63°25'N 19°00'W),
// cross-checked against Wikipedia's own infobox coordinate -- same point
// as the earlier draft, refined to Wikipedia's exact decimal value.
const VIK: JourneyPoint = {
  id: 'vik',
  name: 'Vík',
  sublabel: 'í Mýrdal',
  coords: [-19.0, 63.41666],
  showMapLabel: true,
  // Only ~2-5px from Reynisfjara's dot (already 'above') even at this
  // map's own closer southern-Iceland camera -- the tightest pair on
  // the whole page, since the two are genuinely only ~3km apart in
  // reality. 'below' gives maximum vertical separation without moving
  // either point's real coordinate.
  labelPlacement: 'below',
};

// Reynisfjara black-sand beach. The earlier draft's coordinate
// (-19.070465, 63.406452) described the beach/cliff area in general and
// was corroborated by an independent geocoder, but a real OSRM route
// fetched for THIS pass consistently refused to drive any closer to that
// point than Reynishverfisvegur's own junction with Route 1, well short
// of it -- the actual road (ref 215, confirmed via OSRM's own turn-by-
// turn steps) ends at the beach's own parking area instead, which the
// parking area's own published coordinate (63°24'15.7"N 19°02'43.4"W,
// from the beach's own parking-information page) places at
// -19.045389, 63.404361 -- a ~1.4km difference from the draft value, and
// exactly where the real driving route actually stops. Per this
// project's own rule on conflicting coordinates: flagged explicitly
// here, and the actual-drivable-destination coordinate is kept instead
// of the draft's unverified-by-routing one, since a journey's
// marker/route endpoint should be where a visitor's car (or bus) really
// arrives.
const REYNISFJARA: JourneyPoint = {
  id: 'reynisfjara',
  name: 'Reynisfjara',
  coords: [-19.045389, 63.404361],
  showMapLabel: true,
  // Vík sits only ~3km east of this point in reality -- even at this
  // map's own closer southern-Iceland camera the two dots land only
  // ~2-5px apart, by far the tightest pair on any of the three maps.
  // 'above' (paired with VIK's own 'below' below) gives the two labels
  // the maximum vertical separation available, rather than moving
  // either point's real coordinate.
  labelPlacement: 'above',
};

// Reykjavik -> Seljalandsfoss: real OSRM driving route -- Miklabraut ->
// Vesturlandsvegur/Suðurlandsvegur (Route 1) the entire way, through
// Hveragerði, Selfoss and Hella, then onto the short Seljalandsfoss
// access road. Endpoints forced to the canonical REYKJAVIK/
// SELJALANDSFOSS coordinates; every interior point real OSRM geometry.
//
// The Selfoss-area sub-segment (the same real Route 1 interchange
// identified and fixed on the Golden Circle map's GULLFOSS_TO_REYKJAVIK_
// ROUTE above) is reused here at the same density, independently
// re-fetched at full resolution and Ramer-Douglas-Peucker simplified
// (eps=0.00015) for this leg's own bounding points, rather than copied
// wholesale -- same real interchange, re-verified fresh rather than
// assumed identical, per this project's "always re-verify" rule.
const REYKJAVIK_TO_SELJALANDSFOSS_ROUTE: [number, number][] = [
  [-21.9425, 64.14583],
  [-21.932327, 64.135989],
  [-21.842018, 64.124178],
  [-21.786332, 64.124263],
  [-21.774659, 64.104647],
  [-21.637627, 64.073342],
  [-21.504462, 64.057985],
  [-21.405835, 64.019234],
  [-21.302201, 64.022049],
  [-21.243337, 64.010297],
  [-21.229126, 64.016109],
  [-21.217307, 64.007167],
  [-21.225325, 64.00109],
  [-21.161214, 63.985943],
  // -- Selfoss-area real interchange, full-resolution re-fetch + RDP
  // simplification (eps=0.00015), same real loop as the Golden Circle
  // fix above, independently re-verified for this leg --
  [-21.116108, 63.960285],
  [-21.111197, 63.958972],
  [-21.106246, 63.958335],
  [-21.07569, 63.957733],
  [-21.057287, 63.956569],
  [-21.047369, 63.955531],
  [-21.021292, 63.952161],
  [-21.021035, 63.951832],
  [-21.021406, 63.951078],
  [-21.021105, 63.950493],
  [-21.020034, 63.949959],
  [-21.015868, 63.948917],
  [-21.014239, 63.948234],
  [-21.00826, 63.9434],
  [-21.005634, 63.941962],
  [-21.005014, 63.941054],
  [-21.005273, 63.939479],
  [-21.004073, 63.937889],
  [-21.004101, 63.937422],
  [-21.003814, 63.937306],
  [-20.986709, 63.937114],
  [-20.977388, 63.9385],
  [-20.973251, 63.938888],
  [-20.972248, 63.938736],
  [-20.971075, 63.939046],
  [-20.965235, 63.939565],
  [-20.941941, 63.941374],
  [-20.92619, 63.941884],
  [-20.845903, 63.943664],
  [-20.836226, 63.943561],
  [-20.82195, 63.942656],
  [-20.782121, 63.943098],
  // -- end real interchange --
  [-20.691871, 63.952237],
  [-20.650766, 63.920316],
  [-20.600388, 63.910572],
  [-20.586644, 63.900148],
  [-20.444963, 63.865545],
  [-20.402601, 63.834329],
  [-20.360885, 63.823492],
  [-20.232886, 63.749546],
  [-20.233016, 63.720332],
  [-20.201021, 63.693504],
  [-20.05534, 63.643456],
  [-20.021606, 63.618584],
  [-20.005474, 63.613398],
  [-19.996157, 63.61917],
  [-19.99278, 63.61583],
];

// Seljalandsfoss -> Skogafoss: real OSRM driving route. Leaving
// Seljalandsfoss's access road requires a short real backtrack west
// back onto Route 1 before heading east -- a genuine manoeuvre, kept per
// this project's "never simplify away a real backtrack" rule -- then
// continues east on Suðurlandsvegur (Route 1) the whole way to
// Skogafoss's own access road. Endpoints forced to the canonical
// SELJALANDSFOSS/SKOGAFOSS coordinates; every interior point real OSRM
// geometry.
const SELJALANDSFOSS_TO_SKOGAFOSS_ROUTE: [number, number][] = [
  [-19.99278, 63.61583],
  [-19.992654, 63.618325],
  [-19.996157, 63.61917],
  [-20.005474, 63.613398],
  [-19.970788, 63.595005],
  [-19.931272, 63.583577],
  [-19.915834, 63.581306],
  [-19.846073, 63.565125],
  [-19.816596, 63.561994],
  [-19.776625, 63.55105],
  [-19.752465, 63.548935],
  [-19.721956, 63.544464],
  [-19.692616, 63.542695],
  [-19.671753, 63.543464],
  [-19.660378, 63.54257],
  [-19.637674, 63.535242],
  [-19.574105, 63.522269],
  [-19.544308, 63.523523],
  [-19.523718, 63.521469],
  [-19.511139, 63.532111],
];

// Skogafoss -> Reynisfjara: real OSRM driving route -- Suðurlandsvegur
// (Route 1) east past Vik's own turnoff, then south onto Reynishverfisvegur
// (ref 215, confirmed via OSRM's own turn-by-turn steps) to the beach's
// parking area. Endpoints forced to the canonical SKOGAFOSS/REYNISFJARA
// coordinates (see REYNISFJARA's own comment above on the corrected
// destination coordinate); every interior point real OSRM geometry.
const SKOGAFOSS_TO_REYNISFJARA_ROUTE: [number, number][] = [
  [-19.511139, 63.532111],
  [-19.523718, 63.521469],
  [-19.463828, 63.515335],
  [-19.409985, 63.500578],
  [-19.344803, 63.487531],
  [-19.328577, 63.482638],
  [-19.256149, 63.47225],
  [-19.22302, 63.459797],
  [-19.208104, 63.451766],
  [-19.191744, 63.434722],
  [-19.184439, 63.431818],
  [-19.177055, 63.431572],
  [-19.170046, 63.433257],
  [-19.145528, 63.441148],
  [-19.134941, 63.446968],
  [-19.115411, 63.447852],
  [-19.075372, 63.45529],
  [-19.064893, 63.454746],
  [-19.061758, 63.452769],
  [-19.048889, 63.454379],
  [-19.059202, 63.442768],
  [-19.059872, 63.437787],
  [-19.05134, 63.429132],
  [-19.047831, 63.419803],
  [-19.047835, 63.406306],
  [-19.045389, 63.404361],
];

// Reynisfjara -> Vik: real OSRM driving route -- back up Reynishverfisvegur
// to Route 1 (the same real local corridor as the leg above, reversed --
// kept visually consistent since both come from fresh real OSRM data for
// the same road), then east on Suðurlandsvegur into Vik's own village
// streets. Endpoints forced to the canonical REYNISFJARA/VIK coordinates;
// every interior point real OSRM geometry.
const REYNISFJARA_TO_VIK_ROUTE: [number, number][] = [
  [-19.045389, 63.404361],
  [-19.044361, 63.404283],
  [-19.046794, 63.404821],
  [-19.047835, 63.406306],
  [-19.048817, 63.418233],
  [-19.047831, 63.419803],
  [-19.051055, 63.425338],
  [-19.05134, 63.429132],
  [-19.059889, 63.43804],
  [-19.059202, 63.442768],
  [-19.04915, 63.452478],
  [-19.048808, 63.454554],
  [-19.042195, 63.45416],
  [-19.037347, 63.451802],
  [-19.035794, 63.443043],
  [-19.020428, 63.432459],
  [-19.020103, 63.427292],
  [-19.018005, 63.42447],
  [-19.012108, 63.42126],
  [-19.000803, 63.417863],
  [-19.0, 63.41666],
];

// Vik -> Reykjavik: real OSRM driving route -- the long return leg, the
// entire Route 1 corridor westward back through Hvolsvollur, Hella,
// Selfoss and Hveragerði into Reykjavik -- the same real road as
// REYKJAVIK_TO_SELJALANDSFOSS_ROUTE above, travelled in reverse.
// Endpoints forced to the canonical VIK/REYKJAVIK coordinates.
//
// The Selfoss-area real interchange is crossed again here (unavoidable --
// it's the only road), fetched at full resolution and RDP-simplified
// (eps=0.00015) for THIS leg's own bounding points -- independently
// re-verified rather than copied from the outbound leg or the Golden
// Circle fix, per this project's "always re-verify, never assume
// identical" rule, even though it is, correctly, the same real place.
const VIK_TO_REYKJAVIK_ROUTE: [number, number][] = [
  [-19.0, 63.41666],
  [-19.042725, 63.45428],
  [-19.134332, 63.447068],
  [-19.183983, 63.431744],
  [-19.256944, 63.472445],
  [-19.464987, 63.515541],
  [-19.776625, 63.55105],
  [-19.970788, 63.595005],
  [-20.05534, 63.643456],
  [-20.201021, 63.693504],
  [-20.233016, 63.720332],
  [-20.232886, 63.749546],
  [-20.444505, 63.865323],
  [-20.650766, 63.920316],
  // -- Selfoss-area real interchange, independently re-fetched at full
  // resolution + RDP simplification (eps=0.00015) for this leg --
  [-20.692568, 63.952422],
  [-20.697475, 63.95299],
  [-20.715437, 63.952652],
  [-20.719071, 63.952398],
  [-20.740502, 63.948586],
  [-20.752714, 63.947333],
  [-20.759679, 63.945722],
  [-20.767135, 63.944989],
  [-20.778445, 63.943372],
  [-20.782121, 63.943098],
  [-20.82195, 63.942656],
  [-20.836226, 63.943561],
  [-20.845903, 63.943664],
  [-20.92619, 63.941884],
  [-20.941941, 63.941374],
  [-20.971075, 63.939046],
  [-20.972304, 63.939117],
  [-20.977869, 63.938538],
  [-20.986727, 63.937176],
  [-21.000716, 63.93728],
  [-21.003206, 63.937456],
  [-21.003869, 63.937712],
  [-21.005273, 63.939479],
  [-21.005001, 63.940913],
  [-21.005366, 63.941712],
  [-21.008602, 63.943652],
  [-21.013161, 63.947555],
  [-21.013398, 63.947988],
  [-21.015868, 63.948917],
  [-21.019473, 63.949801],
  [-21.020961, 63.950562],
  [-21.021119, 63.951339],
  [-21.020791, 63.951808],
  [-21.020173, 63.952069],
  [-21.020533, 63.95233],
  [-21.022577, 63.952405],
  [-21.048959, 63.955848],
  [-21.06051, 63.956969],
  [-21.077476, 63.957922],
  [-21.105681, 63.95844],
  [-21.111011, 63.959089],
  [-21.115227, 63.960157],
  // -- end real interchange --
  [-21.160832, 63.985992],
  [-21.225091, 64.00117],
  [-21.229009, 64.016199],
  [-21.242623, 64.010401],
  [-21.301238, 64.022069],
  [-21.405835, 64.019234],
  [-21.503721, 64.057939],
  [-21.635862, 64.07322],
  [-21.773655, 64.104669],
  [-21.788204, 64.125756],
  [-21.846564, 64.12482],
  [-21.933614, 64.136388],
  [-21.9425, 64.14583],
];

// Centre/span chosen so the whole route (Reykjavik's -21.9425 to Vik's
// -19.0, Reynisfjara's 63.404 to Reykjavik's 64.146) stays comfortably
// framed -- same reasoning as ARRIVAL_BLUE_LAGOON_CAMERA above (a
// full-island view made this route too small to follow), framed instead
// to focus on the southern half of Iceland so the Reykjavík -> Vík
// drive itself is clearly the subject, with enough coastline on either
// side for context. This map's own framing, distinct from the other
// two, per the same explicit direction that the three maps don't need
// identical boundaries.
const SOUTH_COAST_CAMERA: JourneyCamera = {
  center: [-20.2, 63.9],
  spanDeg: 8.5,
};

// Same 2.5x slow-down as the other two live Iceland maps, plus the same
// further, modest 1.25x slow-down on top of that (see
// ICELAND_ARRIVAL_BLUE_LAGOON_JOURNEY's own comment) -- same relative-
// pacing-by-distance approach (weight roughly tracks each leg's real
// driving distance: ~128km out, ~29km, ~35km, ~11km, then the long
// ~188km return).
export const ICELAND_SOUTH_COAST_JOURNEY: Journey = {
  id: 'iceland-south-coast',
  initialCamera: SOUTH_COAST_CAMERA,
  legs: [
    {
      id: 'reykjavik-to-seljalandsfoss',
      mode: 'transfer',
      from: REYKJAVIK,
      to: SELJALANDSFOSS,
      camera: SOUTH_COAST_CAMERA,
      route: REYKJAVIK_TO_SELJALANDSFOSS_ROUTE,
      weight: 8.13,
      transition: 'ease',
    },
    {
      id: 'seljalandsfoss-to-skogafoss',
      mode: 'transfer',
      from: SELJALANDSFOSS,
      to: SKOGAFOSS,
      camera: SOUTH_COAST_CAMERA,
      route: SELJALANDSFOSS_TO_SKOGAFOSS_ROUTE,
      weight: 1.88,
      transition: 'ease',
    },
    {
      id: 'skogafoss-to-reynisfjara',
      mode: 'transfer',
      from: SKOGAFOSS,
      to: REYNISFJARA,
      camera: SOUTH_COAST_CAMERA,
      route: SKOGAFOSS_TO_REYNISFJARA_ROUTE,
      weight: 2.19,
      transition: 'ease',
    },
    {
      id: 'reynisfjara-to-vik',
      mode: 'transfer',
      from: REYNISFJARA,
      to: VIK,
      camera: SOUTH_COAST_CAMERA,
      route: REYNISFJARA_TO_VIK_ROUTE,
      weight: 0.94,
      transition: 'ease',
    },
    {
      id: 'vik-to-reykjavik',
      mode: 'transfer',
      from: VIK,
      to: REYKJAVIK,
      camera: SOUTH_COAST_CAMERA,
      route: VIK_TO_REYKJAVIK_ROUTE,
      weight: 11.88,
      transition: 'ease',
    },
  ],
  // Same full-island coastline patch as the other two Iceland road-trip
  // maps above -- one patch, reused by all three even though each has
  // its own distinct camera, since the patch covers the whole island
  // regardless of which window is framed. See
  // components/journey/generated/iceland-full-island-land.ts's own
  // header for the generation details.
  extraLandPatches: ICELAND_FULL_ISLAND_LAND,
};
