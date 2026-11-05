import type { JourneyPoint } from './types';

// Route/point data for the standalone "departure airports" map: Home
// fanned out to the four airports considered when planning a trip
// (Ljubljana, Zagreb, Graz, Vienna), each connected by its own real,
// independently-verified driving route. Rendered by
// components/journey/DepartureAirportsMap.tsx -- a static sibling of
// JourneyMapScene (see that component's own header comment for why a new,
// simpler renderer was needed) rather than a Journey/JourneyLeg, since
// there is no single travelling vehicle or sequential camera here, just
// one still frame showing every route at once.
//
// Per this codebase's established per-destination-file convention (see
// barcelona.ts's own comment on this), HOME and VIENNA are kept as local
// consts here rather than imported from tenerife.ts, even though they are
// the exact same real, already-verified points.

// Privacy: the map label for home must say only "Home" -- never a place
// name (Grad, Vidonci, Goricko...) that would narrow it down. The
// underlying coordinate is still the real one (46°47'51"N 16°05'54"E,
// Grad, Prekmurje -- the seat of the Municipality of Grad per GeoNames),
// matching the exact canonical HOME point already used by
// lib/journeys/tenerife.ts, because the routes drawn from it must be
// geographically real; only the on-map label is ever deliberately
// generic.
const HOME: JourneyPoint = {
  id: 'home',
  name: 'Home',
  coords: [16 + 5 / 60 + 54 / 3600, 46 + 47 / 60 + 51 / 3600],
  showMapLabel: true,
};

// Vienna Airport (VIE/LOWW) -- the same real, canonical airport point
// already used by lib/journeys/tenerife.ts and lib/journeys/barcelona.ts
// (16.5697, 48.1103).
const VIENNA: JourneyPoint = {
  id: 'vienna',
  name: 'Vienna Airport',
  coords: [16.5697, 48.1103],
  showMapLabel: true,
};

// Ljubljana Jože Pučnik Airport (LJU/LJLJ): 46.2237°N, 14.4576°E.
// Cross-checked against two independent aviation reference sources
// (PlaneMapper and Dauntless Aviation/pilotnav.com), which agree exactly.
const LJUBLJANA: JourneyPoint = {
  id: 'ljubljana-airport',
  name: 'Ljubljana Airport',
  coords: [14.4576, 46.2237],
  showMapLabel: true,
};

// Zagreb Franjo Tuđman Airport (ZAG/LDZA): 45.7429°N, 16.0688°E.
// Cross-checked against GeoNames (45.74056, 16.06833) and PlaneMapper
// (45.7429, 16.0688) -- the same point to within rounding.
const ZAGREB: JourneyPoint = {
  id: 'zagreb-airport',
  name: 'Zagreb Airport',
  coords: [16.0688, 45.7429],
  showMapLabel: true,
};

// Graz Airport (GRZ/LOWG): 46.9911°N, 15.4396°E. Cross-checked against
// airport-data.com and PlaneMapper, which agree exactly.
const GRAZ: JourneyPoint = {
  id: 'graz-airport',
  name: 'Graz Airport',
  coords: [15.4396, 46.9911],
  showMapLabel: true,
};

// Every route below is real OSRM driving-route data (router.project-osrm.org,
// steps=true), per the metkish-route-geometry rule -- never a hand-drawn
// bow between two points. Each array is the real route's important
// manoeuvres only (motorway on/off-ramps, border crossings, major forks
// and direction changes), thinned from the full turn-by-turn response;
// insignificant detail (individual roundabout arcs, lane-level wiggles,
// small residential bends) is dropped because at this map's regional
// zoom it would be invisible, never because it changes the route's real
// shape or corridor. Endpoints match HOME.coords and each airport's own
// coords exactly.

// Home -> Vienna Airport: reused verbatim from the already-verified real
// route in lib/journeys/tenerife.ts's HOME_TO_VIENNA_ROUTE (same local
// roads out of Grad, then the A5/A1/A4 motorway corridor north through
// Austria into Vienna) -- the metkish-route-geometry rule's own
// "reuse an already-verified real trip rather than re-deriving it" case,
// since this is the identical real drive regardless of which article it
// appears on.
const HOME_TO_VIENNA_ROUTE: [number, number][] = [
  HOME.coords,
  [16.070902, 46.880257],
  [16.185449, 47.013157],
  [15.985246, 47.100898],
  [16.003403, 47.270125],
  [16.069524, 47.290882],
  [16.133119, 47.546408],
  [16.129481, 47.709646],
  [16.20443, 47.767322],
  [16.211888, 47.93864],
  [16.336473, 48.028625],
  [16.335773, 48.131236],
  VIENNA.coords,
];

// Home -> Ljubljana Airport: local roads south out of Grad, onto the A5
// motorway, then the A1 (Slovenia's main east-west/north-south motorway)
// almost all the way to Ljubljana's northern edge, exiting toward Domžale
// and approaching the airport from the south-east via Grobeljska cesta
// and the regional road (ref 104) through Trzin -- a real, meaningful
// final turn north toward the airport (which sits north of Ljubljana,
// near Kranj), not a straight run-in.
const HOME_TO_LJUBLJANA_ROUTE: [number, number][] = [
  HOME.coords,
  [16.154381, 46.633732],
  [15.689691, 46.580175],
  [14.616816, 46.135194],
  [14.589808, 46.152177],
  [14.563526, 46.180802],
  // Real OSRM maneuver points further along the same regional road and
  // its final roundabouts, just before the last short run into the
  // terminal -- keeps the curve's final approach tangent set by the
  // real last stretch of road rather than jumping straight from the
  // Trzin-area roundabouts to the airport coordinate.
  [14.484518, 46.228585],
  [14.462729, 46.22633],
  LJUBLJANA.coords,
];

// Home -> Zagreb Airport: a real, slightly surprising but verified
// corridor -- local roads south-east out of Grad onto the A5, which ends
// at the Slovenia/Hungary border, continuing briefly on Hungary's M70/M7
// motorways before crossing into Croatia near Goričan and joining the A4
// motorway ("Zrinski most") for a long, direct run south-west to Zagreb,
// then the Zagrebačka obilaznica bypass and Domovinska ulica into the
// airport (south of the city, toward Velika Gorica). The brief dip
// through Hungary is real (confirmed by OSRM, matching how the Slovenian
// and Croatian motorway networks actually connect in this corner) and is
// preserved rather than smoothed away.
const HOME_TO_ZAGREB_ROUTE: [number, number][] = [
  HOME.coords,
  [16.210549, 46.635164],
  [16.524576, 46.519806],
  [16.722556, 46.415496],
  [16.700923, 46.412039],
  [16.130969, 45.79987],
  [16.077163, 45.767538],
  ZAGREB.coords,
];

// Home -> Graz Airport: local roads west out of Grad, crossing into
// Austria near Mogersdorf/Jennersdorf, following the B69/B66 corridor
// west before joining the A9 Pyhrn Autobahn, then a clear turn north on
// the A9 up toward Graz, exiting toward Kalsdorf for the final short run
// into the airport (Thalerhof, south of the city).
const HOME_TO_GRAZ_ROUTE: [number, number][] = [
  HOME.coords,
  [15.976091, 46.781209],
  [15.911043, 46.73244],
  [15.611925, 46.743362],
  [15.439139, 46.960954],
  GRAZ.coords,
];

export interface DepartureAirportRoute {
  airport: JourneyPoint;
  route: [number, number][];
}

export const DEPARTURE_AIRPORTS_HOME = HOME;

export const DEPARTURE_AIRPORTS: DepartureAirportRoute[] = [
  { airport: LJUBLJANA, route: HOME_TO_LJUBLJANA_ROUTE },
  { airport: ZAGREB, route: HOME_TO_ZAGREB_ROUTE },
  { airport: GRAZ, route: HOME_TO_GRAZ_ROUTE },
  { airport: VIENNA, route: HOME_TO_VIENNA_ROUTE },
];
