import type { Journey, JourneyPoint } from './types';

// Route data for the Rome page. Same pattern/engine as every other
// destination (lib/journeys/tenerife.ts, lib/journeys/italy.ts,
// lib/journeys/barcelona.ts), rendered by the exact same
// components/journey/JourneyMapScene — Rome is just another Journey in
// the same shared shape, nothing map-specific invented for it.

// HOME is the same real, canonical point already used for every other
// destination's own departure map (see HOME in lib/journeys/tenerife.ts
// and lib/journeys/italy.ts) -- one real location keeps one coordinate
// across the whole site, never redefined per destination. Same privacy
// rule too: the map label says only "Home", never the actual municipality
// (Grad, Prekmurje) that coordinate corresponds to.
const HOME: JourneyPoint = {
  id: 'home',
  name: 'Home',
  coords: [16 + 5 / 60 + 54 / 3600, 46 + 47 / 60 + 51 / 3600],
  showMapLabel: true,
};

// Trieste Airport (Ronchi dei Legionari, IATA TRS), Friuli-Venezia Giulia,
// Italy -- not Trieste city centre. The published terminal coordinate
// (45.8275, 13.4722) is ~170m from this point; this is instead the real
// OSRM-snapped arrival point on Via dell'Industria, Ronchi dei Legionari,
// right at the airport's own access road (see HOME_TO_TRIESTE_ROUTE below
// for how this was verified) -- the same "use the real routable point, not
// the generic aerodrome centroid" approach already used for Tenerife South
// Airport in lib/journeys/tenerife.ts. At this map's zoom the ~170m
// difference from the published coordinate is not visible.
const TRIESTE_AIRPORT: JourneyPoint = {
  id: 'trieste-airport',
  name: 'Trieste Airport',
  sublabel: 'Ronchi dei Legionari',
  coords: [13.470918, 45.824605],
  showMapLabel: true,
};

// Home -> Trieste Airport, the real driving route by van -- researched from
// OSRM (Open Source Routing Machine, a public routing API built on
// OpenStreetMap's road network), cross-checked two ways: its own
// route-simplified overview geometry (distance ~322.5km / ~3h45m), and a
// turn-by-turn steps=true query (fetched in two parts -- the full route's
// steps response is too large for one fetch -- the first covering Home to
// the Sežana/border area, the second re-querying Sežana to Trieste Airport
// directly to confirm the final approach), whose road names/refs confirm
// the real corridor throughout:
//   local roads (ref 716/715) -> Murska Sobota bypass (ref 232) ->
//   on-ramp -> A5 (toward the Dragučova junction near Maribor) ->
//   A1 south (Celje / Ljubljana) -> Ljubljana's Severna obvoznica (H3) ->
//   Zahodna obvoznica (A2) -> back onto A1 south (Postojna / Razdrto) ->
//   A3 toward the Slovenia/Italy border (Sežana / Fernetti) ->
//   Strada Statale 58 della Carniola -> RA14 -> RA13 ->
//   Autostrada Serenissima (A4) -> Strada Statale 677 di Ronchi dei
//   Legionari -> Via Aquileia (SS14) -> Via Antonio Tambarin ->
//   Via Giuseppe Bugatto -> Via dell'Industria (arrival).
// This is the same real border-crossing corridor (via Postojna, Kozina,
// the border, onto the A4) already independently verified for the
// Home -> Milano route in lib/journeys/italy.ts, which passes through the
// same Slovenia/Italy border area before continuing on toward Gorizia and
// Milano; here the route instead leaves that corridor just after the
// border to reach Trieste Airport directly via the A4/SS14 rather than
// continuing west. The waypoints below are OSRM's own simplified-overview
// geometry (server-side thinned, not hand-simplified) -- every point is a
// real road-network coordinate from that verified route, not estimated or
// drawn by eye. Entirely inland for its whole length (it never actually
// touches the coast, despite passing close to the Gulf of Trieste near the
// airport), so this is drawn with routeCurvePoint() but no `routeLand`.
// Endpoints are the exact HOME/TRIESTE_AIRPORT coordinates above.
const HOME_TO_TRIESTE_ROUTE: [number, number][] = [
  HOME.coords,
  [16.095588, 46.751079],
  [16.081325, 46.724691],
  [16.10123, 46.709394],
  [16.155688, 46.699147],
  [16.176613, 46.667152],
  [16.164452, 46.639434],
  [16.136903, 46.624946],
  [16.118837, 46.597318],
  [16.08345, 46.579248],
  [16.055097, 46.575622],
  [16.024142, 46.588733],
  [15.99538, 46.580456],
  [15.948432, 46.580834],
  [15.905034, 46.554717],
  [15.838826, 46.560096],
  [15.804054, 46.577427],
  [15.763243, 46.571096],
  [15.696237, 46.592908],
  [15.685462, 46.565253],
  [15.699653, 46.530874],
  [15.670354, 46.511819],
  [15.655388, 46.458583],
  [15.625555, 46.418044],
  [15.587554, 46.389458],
  [15.493352, 46.352467],
  [15.438203, 46.291483],
  [15.402031, 46.267108],
  [15.345867, 46.254822],
  [15.261248, 46.253756],
  [15.200224, 46.26743],
  [15.130562, 46.271833],
  [15.097682, 46.259561],
  [14.981446, 46.255317],
  [14.949427, 46.237923],
  [14.943211, 46.220042],
  [14.908035, 46.212089],
  [14.895489, 46.189514],
  [14.751694, 46.163629],
  [14.703382, 46.17176],
  [14.644704, 46.151749],
  [14.605961, 46.128038],
  [14.575462, 46.068957],
  [14.503069, 46.08434],
  [14.465857, 46.074413],
  [14.444343, 46.029586],
  [14.334088, 45.995523],
  [14.307894, 45.975405],
  [14.30245, 45.951449],
  [14.272602, 45.935598],
  [14.255962, 45.895689],
  [14.294644, 45.832335],
  [14.282318, 45.808643],
  [14.227892, 45.790938],
  [14.213734, 45.764375],
  [14.057689, 45.758976],
  [14.021802, 45.734796],
  [13.998138, 45.703722],
  [13.97554, 45.694502],
  [13.915179, 45.711365],
  [13.867154, 45.715042],
  [13.829473, 45.694588],
  [13.810253, 45.69272],
  [13.795233, 45.702694],
  [13.749938, 45.703973],
  [13.67007, 45.759646],
  [13.639678, 45.773832],
  [13.601712, 45.778634],
  [13.578227, 45.805196],
  [13.530308, 45.821149],
  [13.506606, 45.841281],
  [13.48496, 45.843172],
  [13.491749, 45.821515],
  TRIESTE_AIRPORT.coords,
];

// Single-leg journey, same shape as TENERIFE_HOME_TO_VIENNA_JOURNEY. The
// camera is framed wider on longitude than Tenerife's own Home->Vienna map
// (this route runs mostly east-west, 16.18->13.47, rather than
// north-south), with enough padding on every side to show Slovenia's
// shape and a meaningful slice of northeastern Italy/the Adriatic as
// context, per the "surrounding geography where useful" brief -- not a
// tight crop around just the route line.
export const ROME_HOME_TO_TRIESTE_JOURNEY: Journey = {
  id: 'rome-home-to-trieste',
  initialCamera: { center: [14.7, 46.22], spanDeg: 6.5 },
  legs: [
    {
      id: 'home-to-trieste',
      mode: 'car',
      from: HOME,
      to: TRIESTE_AIRPORT,
      camera: { center: [14.7, 46.22], spanDeg: 6.5 },
      curve: 0.14,
      route: HOME_TO_TRIESTE_ROUTE,
      weight: 3.5,
      transition: 'ease',
    },
  ],
};

// ---------------------------------------------------------------------
// Trieste Airport -> Venezia Mestre -> Roma Termini, by train (the real
// 18 October 2026 outbound trip: a Regionale Veloce to Venezia Mestre,
// then a Frecciarossa onward to Roma Termini). Reuses the same
// TRIESTE_AIRPORT point defined above -- one canonical coordinate per
// location, per the project's route-geometry rule -- rather than
// redefining it.
//
// This is a RAIL route, not a driving route: mode 'train' throughout, and
// the polyline below follows the real Venezia-Trieste railway and the
// Milano-Napoli high-speed line's Padova/Bologna/Firenze/Roma branch,
// not a motorway and not a straight line between stations. There is no
// OSRM-equivalent public turn-by-turn routing API for rail, so this was
// built the way an editorial atlas builds a rail line: real, individually
// verified station coordinates for every major anchor city the train
// actually calls at or passes through, connected through the real
// intermediate towns the line is known to run via, rather than a
// generic curve from origin to destination.
//
// Anchor coordinates verified against each station's own Wikipedia
// infobox (decimal-converted from the DMS value given there):
//   Venezia Mestre   45°28'57"N 12°13'53"E -> 45.48250, 12.23139
//   Bologna Centrale 44°30'21"N 11°20'30"E -> 44.50583, 11.34167
//   Firenze S.M.N.   43°46'34"N 11°14'53"E -> 43.77611, 11.24806
//   Arezzo           43°27'40"N 11°52'32"E -> 43.46111, 11.87556
//   Orvieto          42°43'26"N 12°07'35"E -> 42.72392, 12.12651
//   Roma Termini     41°54'03"N 12°30'07"E -> 41.90083, 12.50194
// (Padova and the smaller Friuli/Veneto towns along the Trieste-Venezia
// leg are well-documented town centres, not individually re-verified to
// the same infobox precision -- appropriate for this map's minimalist,
// small-multiple scale, same spirit as the "simplify only insignificant
// detail" rule for driving routes.)
const VENEZIA_MESTRE: JourneyPoint = {
  id: 'venezia-mestre',
  name: 'Venezia Mestre',
  coords: [12.23139, 45.4825],
  showMapLabel: true,
};

const ROMA_TERMINI: JourneyPoint = {
  id: 'roma-termini',
  name: 'Roma Termini',
  coords: [12.50194, 41.90083],
  showMapLabel: true,
};

// Real anchor coordinates along the AV corridor between Mestre and Roma
// that are not their own labeled JourneyPoint on this map (only Trieste
// Airport, Venezia Mestre and Roma Termini are labeled, per the brief) --
// kept as named constants purely so the route array below reads by city
// name rather than bare coordinate pairs. Same Wikipedia-infobox source
// as the comment above this journey.
const BOLOGNA_CENTRALE: [number, number] = [11.34167, 44.50583];
const FIRENZE_SMN: [number, number] = [11.24806, 43.77611];
const AREZZO: [number, number] = [11.87556, 43.46111];
const ORVIETO: [number, number] = [12.12651, 42.72392];

// Trieste Airport -> Venezia Mestre: the real Venezia-Trieste main line
// west from the airport's own station, via Cervignano del Friuli, San
// Giorgio di Nogaro, Latisana, Portogruaro, San Donà di Piave and Quarto
// d'Altino -- the Friuli/Veneto plain the line actually crosses, never
// the coast itself (this leg stays well inland of the Gulf of Trieste
// and the Adriatic throughout, unlike the HOME_TO_TRIESTE driving leg's
// own southern dip near Sežana, which is a different corridor).
const TRIESTE_AIRPORT_TO_MESTRE_ROUTE: [number, number][] = [
  TRIESTE_AIRPORT.coords,
  [13.333, 45.867], // Cervignano del Friuli
  [13.192, 45.798], // San Giorgio di Nogaro
  [12.978, 45.772], // Latisana
  [12.838, 45.783], // Portogruaro
  [12.567, 45.633], // San Donà di Piave
  [12.372, 45.558], // Quarto d'Altino
  VENEZIA_MESTRE.coords,
];

// Venezia Mestre -> Roma Termini: the Milano-Napoli Alta Velocità line's
// Venezia branch, joining the main AV spine at Bologna and continuing via
// Firenze, Arezzo and Orvieto to Roma -- the same real corridor Frecciarossa
// 9437 runs on. Padova, then two bends roughly tracking the AV alignment's
// path south of the historic Ferrara line, carry the curve from Mestre
// down to Bologna; from Firenze, the route bows east through the real
// Arno/Chiana valley corridor the line follows via Arezzo and Orvieto
// before turning into Roma -- confirmed against a straight Firenze->Roma
// line, the real route sits roughly 30-40km further east at Arezzo's
// latitude, which is exactly the real valley the Direttissima follows,
// not a simplification artefact.
const MESTRE_TO_ROMA_ROUTE: [number, number][] = [
  VENEZIA_MESTRE.coords,
  [11.8807, 45.4149], // Padova
  [11.7, 45.15],
  [11.45, 44.75],
  BOLOGNA_CENTRALE,
  [11.25, 44.05], // Apennine crossing (AV tunnel corridor)
  FIRENZE_SMN,
  [11.55, 43.56], // Valdarno
  AREZZO,
  [12.02, 43.05], // toward Chiusi
  ORVIETO,
  [12.32, 42.25], // Paglia valley, approaching Roma
  ROMA_TERMINI.coords,
];

export const ROME_TRIESTE_TO_ROME_TRAIN_JOURNEY: Journey = {
  id: 'rome-trieste-to-rome-train',
  initialCamera: { center: [12.3, 43.85], spanDeg: 11 },
  legs: [
    {
      id: 'trieste-airport-to-mestre',
      mode: 'train',
      from: TRIESTE_AIRPORT,
      to: VENEZIA_MESTRE,
      camera: { center: [12.3, 43.85], spanDeg: 11 },
      curve: 0.08,
      route: TRIESTE_AIRPORT_TO_MESTRE_ROUTE,
      weight: 1.5,
      transition: 'ease',
    },
    {
      id: 'mestre-to-roma',
      mode: 'train',
      from: VENEZIA_MESTRE,
      to: ROMA_TERMINI,
      camera: { center: [12.3, 43.85], spanDeg: 11 },
      curve: 0.08,
      route: MESTRE_TO_ROMA_ROUTE,
      weight: 4.5,
      transition: 'ease',
    },
  ],
};
