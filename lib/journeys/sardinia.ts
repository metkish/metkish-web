import type { Journey, JourneyPoint } from './types';

// Sardinia — the destination this generic journey-map data model always
// anticipated (see the module header comment in lib/journeys/tenerife.ts
// and the Iceland equivalent): a new file, no changes to the map engine
// itself. Only the first leg of the journey is added here, per explicit
// scope — Home -> Vienna Airport. The flight onward to Sardinia (exact
// arrival airport still unconfirmed) is a separate leg/journey to be added
// once that airport is known; nothing here invents or assumes it.

// Privacy: the map label for home must say only "Home" — never a place
// name (Grad, Vidonci, Goricko...) that would narrow it down. The
// underlying coordinate is still the real one (46°47'51"N 16°05'54"E,
// Grad, Prekmurje — the seat of the Municipality of Grad per GeoNames),
// because the route drawn from it must be geographically real; only the
// on-map label is ever deliberately generic. Byte-identical to the HOME
// point already used on every other destination's map (Tenerife,
// Barcelona, Rome, Iceland).
const HOME: JourneyPoint = {
  id: 'home',
  name: 'Home',
  coords: [16 + 5 / 60 + 54 / 3600, 46 + 47 / 60 + 51 / 3600],
  showMapLabel: true,
};

// Byte-identical to the VIENNA point already used on Tenerife's own
// Home -> Vienna leg.
const VIENNA: JourneyPoint = {
  id: 'vienna',
  name: 'Vienna Airport',
  coords: [16.5697, 48.1103],
  showMapLabel: true,
};

// Same real, already-verified road corridor as Tenerife's own
// HOME_TO_VIENNA_ROUTE (lib/journeys/tenerife.ts) — it's the literal same
// drive from the same home to the same airport, so per the
// metkish-route-geometry rule on shared corridors ("that shared area must
// look clean and IDENTICAL in shape across every map that uses it"), this
// reuses those exact OSRM-derived, RDP-thinned waypoints rather than
// re-fetching or re-deriving a second "equivalent" route. Entirely inland
// — no coastline risk — drawn as a smooth curve through the real points,
// no `routeLand` needed.
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

// Olbia Costa Smeralda Airport (OLB/LIEO) -- real published coordinates
// (40°54'01"N 9°31'02"E / 40.9003, 9.5172). The direct Ryanair/Lauda
// Europe flight from Vienna landed here.
const OLBIA_AIRPORT: JourneyPoint = {
  id: 'olbia-airport',
  name: 'Olbia Airport',
  coords: [9.5172, 40.9003],
  showMapLabel: true,
};

// Same shape/camera/weight/transition as TENERIFE_HOME_TO_VIENNA_JOURNEY —
// same geography, so the same framing. Only `id` changes.
export const SARDINIA_HOME_TO_VIENNA_JOURNEY: Journey = {
  id: 'sardinia-home-to-vienna',
  initialCamera: { center: [16.3, 47.4], spanDeg: 9 },
  legs: [
    {
      id: 'home-to-vienna',
      mode: 'car',
      from: HOME,
      to: VIENNA,
      camera: { center: [16.35, 47.45], spanDeg: 9 },
      curve: 0.14,
      route: HOME_TO_VIENNA_ROUTE,
      weight: 3.5,
      transition: 'ease',
    },
  ],
};

// Vienna Airport -> Olbia Airport, the flight itself. No real route data
// applies to a flight leg (see every other destination's own flight
// journey, e.g. TENERIFE_VIENNA_TO_TENERIFE_JOURNEY /
// BARCELONA_VIENNA_TO_BARCELONA_JOURNEY) -- `curve` is just the engine's
// decorative bow for this leg, in the same direction/family as those
// (a gentle northward bow, matching a real great-circle's own shape
// between two points at these latitudes).
// Camera framing follows the same method as Barcelona's own flight leg
// (center/spanDeg sized generously past the leg's real bounding box,
// lng [9.52, 16.57] / lat [40.90, 48.11]) -- NOTE: unlike Barcelona's,
// this value was not live-tuned against both the desktop and mobile
// breakpoints in this pass (no way to render/screenshot the live page in
// this working session). Please check Olbia Airport's marker and label
// sit clear of the frame edge on both breakpoints when you review this,
// and flag it if either clips -- that's a one-line spanDeg/center nudge.
export const SARDINIA_VIENNA_TO_OLBIA_JOURNEY: Journey = {
  id: 'sardinia-vienna-to-olbia',
  initialCamera: { center: [16.5697, 48.1103], spanDeg: 9 },
  legs: [
    {
      id: 'vienna-to-olbia',
      mode: 'plane',
      from: VIENNA,
      to: OLBIA_AIRPORT,
      camera: { center: [13.0, 44.5], spanDeg: 24 },
      curve: -0.05,
      weight: 4.5,
      transition: 'fly',
    },
    {
      id: 'olbia-arrival-zoom',
      mode: 'plane',
      from: OLBIA_AIRPORT,
      to: OLBIA_AIRPORT,
      camera: { center: [13.0, 44.5], spanDeg: 24 },
      weight: 1.5,
      transition: 'fly',
    },
  ],
};

// Casagliana Suite Resort -> Spiaggia del Principe, the real driving route
// for the first beach visit (1 July 2025). Researched from OSRM
// (steps=true confirmed the real corridor: Via Sole Ruiu -> SS125 Orientale
// Sarda -> Rotonda Piliezzu -> SP73 toward Porto Rotondo/Porto Cervo/Baia
// Sardinia -> SP94 -> SP160 -> Via Romazzino -> Via della Mimosa), using
// OSRM's own route-simplified geometry. This is a genuinely winding coastal
// road (SP73/SP94/SP160 through the Costa Smeralda headlands), so per the
// metkish-route-geometry rule's "no fixed point-count target" this keeps
// every bend OSRM returned rather than thinning further by eye -- removing
// any of them would flatten a real curve, not drop noise. The departure
// sequence (three short local turns before Via Sole Ruiu) is also kept: a
// real manoeuvre leaving the resort's own access road, the same kind of
// case the geometry rule calls out for Tenerife's Siam Park return.
//
// Endpoint note, same reasoning as PLAYA_DEL_DUQUE in lib/journeys/
// tenerife.ts: the destination coordinate is the real car-accessible
// parking area (confirmed by OSRM's own "arrive" maneuver on an unnamed
// road off Via della Mimosa), not an estimated beach-centre point a car
// can't actually reach -- consistent with the user's own account of a walk
// from the car park down to the beach.
//
// NOT live-visually verified on both breakpoints in this sandboxed
// environment (same standing limitation as SARDINIA_VIENNA_TO_OLBIA_JOURNEY
// above) -- please check both markers sit in the right place relative to
// the coastline and that neither label clips the frame.
const CASAGLIANA: JourneyPoint = {
  id: 'casagliana',
  name: 'Casagliana Suite Resort',
  coords: [9.457638, 40.994703],
  showMapLabel: true,
};

const SPIAGGIA_DEL_PRINCIPE: JourneyPoint = {
  id: 'spiaggia-del-principe',
  name: 'Spiaggia del Principe',
  coords: [9.559806, 41.086831],
  showMapLabel: true,
};

const CASAGLIANA_TO_PRINCIPE_ROUTE: [number, number][] = [
  CASAGLIANA.coords,
  [9.456138, 40.995065],
  [9.455598, 40.994054],
  [9.462195, 40.994223],
  [9.467439, 40.991908],
  [9.480331, 40.989732],
  [9.485792, 40.984753],
  [9.485972, 40.983781],
  [9.483654, 40.983538],
  [9.483191, 40.982518],
  [9.488697, 40.982432],
  [9.491594, 40.978844],
  [9.494788, 40.979164],
  [9.498633, 40.982038],
  [9.50017, 40.985204],
  [9.500376, 40.992924],
  [9.505264, 40.998746],
  [9.504485, 41.005501],
  [9.501199, 41.01058],
  [9.514464, 41.020632],
  [9.51969, 41.03048],
  [9.516444, 41.037484],
  [9.518744, 41.044983],
  [9.516036, 41.052434],
  [9.518651, 41.057095],
  [9.5134, 41.062088],
  [9.512771, 41.06535],
  [9.50799, 41.067258],
  [9.506914, 41.071155],
  [9.509465, 41.072887],
  [9.509911, 41.075816],
  [9.518164, 41.076241],
  [9.525915, 41.08598],
  [9.528899, 41.087243],
  [9.530842, 41.091083],
  [9.537369, 41.088383],
  [9.541754, 41.090968],
  [9.546126, 41.088333],
  [9.548531, 41.08496],
  [9.554805, 41.089272],
  [9.557794, 41.085853],
  SPIAGGIA_DEL_PRINCIPE.coords,
];

// Camera: bounding-box center of the real route (~9.51, 41.04), spanDeg
// opened out enough that both Casagliana and Spiaggia del Principe sit
// comfortably inside the frame with real margin on every side -- sized the
// same way as TENERIFE_ROCA_TO_LOS_GIGANTES_JOURNEY's own local coastal
// camera (lib/journeys/tenerife.ts), not guessed.
export const SARDINIA_CASAGLIANA_TO_PRINCIPE_JOURNEY: Journey = {
  id: 'sardinia-casagliana-to-principe',
  initialCamera: { center: [9.51, 41.04], spanDeg: 0.4 },
  legs: [
    {
      id: 'casagliana-to-principe',
      mode: 'car',
      from: CASAGLIANA,
      to: SPIAGGIA_DEL_PRINCIPE,
      camera: { center: [9.51, 41.04], spanDeg: 0.4 },
      curve: 0.12,
      route: CASAGLIANA_TO_PRINCIPE_ROUTE,
      weight: 4.5,
      transition: 'ease',
    },
  ],
};

// Palau harbour -- the La Maddalena Archipelago boat excursion's departure
// point (2 July 2025, the day after the Spiaggia del Principe visit).
// Real, confirmable coordinates:
//  - Parking: Largo Palau Vecchio, a named free-parking area right at the
//    harbour (41.18364N, 9.38241E -- geocoded from the street's own listed
//    coordinates), matching the "P" marker and the "Circonvallazione Palau
//    Vecchio" street visible in the user's own reference screenshot
//    (public/2025-07 - Sardinia/La Madallena map.jpg).
//  - Boarding: Piazza del Molo, the excursion-boat embarkation plaza
//    ("di fronte alla stazione marittima", confirmed via two independent
//    boat-tour operators' own embarkation-point pages), geocoded from a
//    business listing on that same square (41.18091N, 9.38567E) -- this
//    matches the blue marker's position in the same reference screenshot,
//    at the pier just east of the parking area.
// Both were cross-checked against a real OSRM route between them, whose
// own road names (Via Nazionale, Via La Maddalena, Circonvallazione Palau
// Vecchio) match the screenshot's street labels exactly.
const PALAU_PARKING: JourneyPoint = {
  id: 'palau-parking',
  name: 'Palau',
  sublabel: 'Harbour parking',
  coords: [9.38241, 41.18364],
  showMapLabel: true,
};

const PALAU_HARBOUR: JourneyPoint = {
  id: 'palau-harbour',
  name: 'Palau',
  sublabel: 'Boat excursion departure',
  coords: [9.38567, 41.18091],
  showMapLabel: true,
};

// Cala Santa Maria -- the excursion's real second beach stop (per the
// confirmed Delfino Tours itinerary, 2 July 2025). CORRECTED: this cove
// is on Isola Santa Maria, NOT Caprera (a different, separate island
// further south near La Maddalena town) -- the underlying coordinate
// below was already correct for Isola Santa Maria all along (cross-
// checked via an independent anchorage source that explicitly places
// "Cala Santa Maria" on "the island of the same name", and via Isola
// Santa Maria's own published location, just north of Spargi and south
// of Budelli/Razzoli); only the "Caprera" text label was wrong, and has
// been fixed here. Real, published anchorage coordinates
// (41 17' 36"N 9 22' 19"E -> 41.29333, 9.37194).
const CALA_SANTA_MARIA: JourneyPoint = {
  id: 'cala-santa-maria',
  name: 'Cala Santa Maria',
  sublabel: 'Santa Maria Island',
  coords: [9.37194, 41.29333],
  showMapLabel: true,
};

// Spiaggia Rosa, Budelli -- passed by boat only, never landed on (access
// is prohibited to protect the island). Real, published coordinates
// (41.279449, 9.356189).
const SPIAGGIA_ROSA: JourneyPoint = {
  id: 'spiaggia-rosa',
  name: 'Spiaggia Rosa',
  sublabel: 'Budelli — passed by boat',
  coords: [9.356189, 41.279449],
  showMapLabel: true,
};

// La Maddalena town, Piazza Giuseppe Garibaldi -- the harbourfront square
// where the excursion's free time/ice cream stop happened. Real, geocoded
// coordinates (41.21309, 9.40629).
const LA_MADDALENA_TOWN: JourneyPoint = {
  id: 'la-maddalena-town',
  name: 'La Maddalena',
  coords: [9.40629, 41.21309],
  showMapLabel: true,
};

// Casagliana -> Palau (Largo Palau Vecchio parking), the real driving
// route for the morning of the boat excursion. OSRM-verified
// (steps=true): Via Sole Ruiu -> SS125 Orientale Sarda -> Rotonda
// Piliezzu -> SS125/Viale Costa Smeralda -> Rotatoria di Arzachena ->
// SS125 -> Rotatoria SS125/SS133 -> SS133 di Palau (through two further
// roundabouts) -> Via Razzoli -> Via del Faro -> a roundabout onto
// Circonvallazione Palau Vecchio -> Largo Palau Vecchio. ~37km. Per the
// metkish-route-geometry rule's "no fixed point-count target", every
// real bend OSRM returned is kept (this is a long coastal-then-inland
// drive with several genuine direction changes, not noise to flatten).
// FIX (this review): removed an exact duplicate out-and-back pair that
// was here -- [9.488305, 40.982603] and [9.483191, 40.982518] each
// appeared twice, in reverse order, right after the Rotonda Piliezzu
// roundabout point. Two identical consecutive-but-mirrored coordinates
// are not real geometry (a one-way driving leg doesn't retrace the
// exact same lat/lng backwards); fed into the Catmull-Rom curve, they
// made the rendered line double back and redraw itself over the same
// stretch -- the "unnatural line" near Casagliana reported on review.
// Removing the two duplicates (not any unique coordinate) restores a
// single clean pass through the roundabout with no information lost.
const CASAGLIANA_TO_PALAU_ROUTE: [number, number][] = [
  CASAGLIANA.coords,
  [9.455598, 40.994054],
  [9.480331, 40.989732],
  [9.485792, 40.984753],
  [9.483191, 40.982518],
  [9.488305, 40.982603],
  [9.491918, 40.978912],
  [9.486058, 40.984014],
  [9.481823, 40.989015],
  [9.442096, 41.000733],
  [9.429728, 41.011646],
  [9.427797, 41.022609],
  [9.433612, 41.034276],
  [9.436275, 41.050049],
  [9.434432, 41.052806],
  [9.435989, 41.060349],
  [9.431233, 41.065712],
  [9.426519, 41.068879],
  [9.404343, 41.069218],
  [9.395038, 41.073572],
  [9.386006, 41.08215],
  [9.378806, 41.08132],
  [9.375386, 41.082877],
  [9.371573, 41.100592],
  [9.365353, 41.113297],
  [9.366134, 41.130243],
  [9.370532, 41.141047],
  [9.369385, 41.146959],
  [9.372584, 41.157361],
  [9.367546, 41.174894],
  [9.372863, 41.178667],
  [9.377014, 41.17873],
  PALAU_PARKING.coords,
];

// Camera: bounding-box center of the real route (~9.42, 41.09), spanDeg
// opened out to comfortably fit the whole ~37km drive -- sized the same
// way as this file's own Home->Vienna and Casagliana->Principe cameras,
// not guessed.
// NOTE: this journey originally continued one further leg past the
// parking area, a decorative (non-routed) hop on to PALAU_HARBOUR to
// represent the short walk to the boat's boarding point. Per explicit
// correction, that leg and its "Boat excursion departure" marker were
// removed from THIS map -- the pink route ends at the real, OSRM-
// verified parking location (Largo Palau Vecchio) and nothing else.
//
// A later instruction asked to add PALAU_HARBOUR back as a second,
// separately-labelled marker (via an extra showRoute:false leg) while
// keeping the driving route itself ending at parking. On review, that
// map looked cluttered/incorrect, so per explicit follow-up correction
// it has been removed again -- this map shows ONLY two locations
// (CASAGLIANA and PALAU_PARKING), a single leg, one real OSRM-verified
// route between them, nothing else. PALAU_HARBOUR stays defined above
// but is not referenced by this journey at all, same as
// SARDINIA_MADDALENA_EXCURSION_JOURNEY below (kept for reference, not
// currently rendered on the page).
export const SARDINIA_CASAGLIANA_TO_PALAU_JOURNEY: Journey = {
  id: 'sardinia-casagliana-to-palau',
  initialCamera: { center: [9.42, 41.09], spanDeg: 1.3 },
  legs: [
    {
      id: 'casagliana-to-palau',
      mode: 'car',
      from: CASAGLIANA,
      to: PALAU_PARKING,
      camera: { center: [9.42, 41.09], spanDeg: 1.3 },
      // curve is ignored once `route` is supplied (see JourneyLeg's own
      // doc comment in lib/journeys/types.ts) -- kept at 0 rather than
      // the earlier 0.1 so there's no dead/misleading prop suggesting
      // this leg still uses a decorative bow.
      curve: 0,
      route: CASAGLIANA_TO_PALAU_ROUTE,
      weight: 5,
      transition: 'ease',
    },
  ],
};

// La Maddalena Archipelago boat excursion -- originally Palau -> Cala
// Santa Maria -> (passing Spiaggia Rosa) -> La Maddalena town -> return
// to Palau.
//
// STATUS: per explicit instruction, the map rendering this journey has
// been REMOVED from app/sardinia/page.tsx entirely (not just its
// caption) -- this export is currently unused on the page. It is left
// here, unused, rather than deleted outright, since it still encodes
// real, independently-researched coordinates that may be useful again;
// if it's ever reinstated, note that the real confirmed itinerary order
// (per Delfino Tours, 2 July 2025) is actually Cala Corsara (Spargi) ->
// Spiaggia Rosa (Budelli, passed by) -> Cala Santa Maria -> Porto della
// Madonna (Budelli natural pools) -> La Maddalena town, which this
// journey's legs below do NOT yet reflect (they still skip Cala Corsara
// and Porto della Madonna, and Cala Santa Maria's sublabel was also
// corrected elsewhere in this file -- see that point's own comment).
//
// IMPORTANT DISCLOSURE, per explicit instruction not to invent an exact
// sailing track (kept for reference while this export is unused): this
// was a simplified, illustrative route, NOT a verified GPS track of the
// boat's real path. Three of the excursion's stops as originally
// plotted here -- Cala Santa Maria, Spiaggia Rosa (passed by, not landed
// on) and La Maddalena town -- have real, independently confirmed
// coordinates (see each point's own comment above). Two further stops
// described in the story at the time (a second, crowded beach, and a
// swimming bay) could not yet be reliably identified, so they were left
// off this map rather than guessed at -- both have since been
// identified (Cala Corsara and Porto della Madonna respectively) in the
// page's own text, though not yet added to this unused journey. There
// is no OSRM equivalent for open water, so every leg here uses the
// engine's decorative `curve` bow only, the same honest treatment
// already used for this file's own flight leg (no `route` array
// pretending to be real waypoints).
const PALAU_TO_CSM_CAMERA = { center: [9.42, 41.19] as [number, number], spanDeg: 1.0 };
const CSM_TO_MADDALENA_CAMERA = { center: [9.39, 41.26] as [number, number], spanDeg: 0.95 };
const MADDALENA_RETURN_CAMERA = { center: [9.39, 41.2] as [number, number], spanDeg: 1.0 };

export const SARDINIA_MADDALENA_EXCURSION_JOURNEY: Journey = {
  id: 'sardinia-maddalena-excursion',
  initialCamera: PALAU_TO_CSM_CAMERA,
  legs: [
    {
      id: 'palau-to-cala-santa-maria',
      mode: 'boat',
      from: PALAU_HARBOUR,
      to: CALA_SANTA_MARIA,
      camera: PALAU_TO_CSM_CAMERA,
      curve: -0.2,
      weight: 3,
      transition: 'ease',
    },
    {
      id: 'cala-santa-maria-to-spiaggia-rosa',
      mode: 'boat',
      from: CALA_SANTA_MARIA,
      to: SPIAGGIA_ROSA,
      camera: CSM_TO_MADDALENA_CAMERA,
      curve: 0.15,
      weight: 2,
      transition: 'ease',
    },
    // Illustrative only -- see the journey's own disclosure above: this
    // leg's curve stands in for the two unconfirmed stops in between,
    // not a real track through them.
    {
      id: 'spiaggia-rosa-to-maddalena-town',
      mode: 'boat',
      from: SPIAGGIA_ROSA,
      to: LA_MADDALENA_TOWN,
      camera: CSM_TO_MADDALENA_CAMERA,
      curve: -0.2,
      weight: 3,
      transition: 'ease',
    },
    {
      id: 'maddalena-town-to-palau',
      mode: 'boat',
      from: LA_MADDALENA_TOWN,
      to: PALAU_HARBOUR,
      camera: MADDALENA_RETURN_CAMERA,
      curve: 0.2,
      weight: 3,
      transition: 'ease',
    },
  ],
};

