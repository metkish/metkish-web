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
// A later instruction asked to add a second, separately-labelled
// "Palau Harbour" marker (via an extra showRoute:false leg) while
// keeping the driving route itself ending at parking. On review, that
// map looked cluttered/incorrect, so per explicit follow-up correction
// it has been removed again -- this map shows ONLY two locations
// (CASAGLIANA and PALAU_PARKING), a single leg, one real OSRM-verified
// route between them, nothing else. The separate illustrative Maddalena
// excursion journey this comment used to reference has since been
// removed entirely (it was unused dead code), along with its own
// unused point constants.
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

// Spiaggia Liscia Ruja -- the first of four further Sardinia driving
// routes added per explicit instruction, based on the user's own
// GetYourGuide booking documents. Real, published beach location (Costa
// Smeralda, confirmed via costasmeralda.it's own "Spiaggia Liscia Ruja"
// place page and multiple independent beach-directory listings for
// "Spiaggia di Liscia Ruja" in the same stretch of coast north of
// Casagliana). The destination coordinate below is OSRM's own "arrive"
// point on the real road serving the beach, the same convention already
// used for SPIAGGIA_DEL_PRINCIPE above (a real car-accessible point, not
// an estimated beach-centre guess).
//
// Researched from OSRM (overview=simplified, geometries=geojson; a
// separate steps=true request confirmed the real corridor: Via Sole Ruiu
// -> Strada Statale 125 Orientale Sarda -> Strada Provinciale 73 ->
// Strada Provinciale 94, the same first stretch shared with
// CASAGLIANA_TO_PRINCIPE_ROUTE and CASAGLIANA_TO_PORTO_CERVO_ROUTE below,
// before this route branches off along its own local lane network up to
// the beach). Per the metkish-route-geometry rule's "no fixed point-count
// target", every bend OSRM returned is kept.
//
// NOT live-visually verified on either breakpoint in this sandboxed
// session (same standing limitation noted on every other journey in this
// file) -- please check both markers sit correctly relative to the
// coastline and that neither label clips the frame.
const LISCIA_RUJA: JourneyPoint = {
  id: 'liscia-ruja',
  name: 'Spiaggia Liscia Ruja',
  coords: [9.527903, 41.071754],
  showMapLabel: true,
};

const CASAGLIANA_TO_LISCIA_RUJA_ROUTE: [number, number][] = [
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
  [9.499288, 40.982722],
  [9.500376, 40.992924],
  [9.505264, 40.998746],
  [9.504485, 41.005501],
  [9.501199, 41.01058],
  [9.513447, 41.019688],
  [9.51803, 41.025795],
  [9.51806, 41.029085],
  [9.519679, 41.030702],
  [9.516444, 41.037484],
  [9.518744, 41.044983],
  [9.516036, 41.052434],
  [9.518463, 41.055444],
  [9.518264, 41.057636],
  [9.521851, 41.05562],
  [9.526412, 41.057954],
  [9.525335, 41.060841],
  [9.528148, 41.061761],
  [9.52958, 41.064839],
  [9.527303, 41.068769],
  LISCIA_RUJA.coords,
];

// Camera: bounding-box center of the real route (~9.49, 41.03), spanDeg
// sized the same way as SARDINIA_CASAGLIANA_TO_PRINCIPE_JOURNEY's own
// local camera above (a comparable-length local hop) -- checked against
// the current SARDINIA_BBOX (scripts/build-geo.mjs, lng [7.9,10.3] /
// lat [38.6,42.0]): this camera's own worst-case rendered frame (computed
// from JourneyMapScene's computeFrame(), across both the narrow-mobile
// and wide-desktop branches) stays comfortably inside that box on every
// side, so no coastline-clipping seam is expected and the box itself did
// not need widening for this journey.
export const SARDINIA_CASAGLIANA_TO_LISCIA_RUJA_JOURNEY: Journey = {
  id: 'sardinia-casagliana-to-liscia-ruja',
  initialCamera: { center: [9.4926, 41.0253], spanDeg: 0.4 },
  legs: [
    {
      id: 'casagliana-to-liscia-ruja',
      mode: 'car',
      from: CASAGLIANA,
      to: LISCIA_RUJA,
      camera: { center: [9.4926, 41.0253], spanDeg: 0.4 },
      curve: 0,
      route: CASAGLIANA_TO_LISCIA_RUJA_ROUTE,
      weight: 4,
      transition: 'ease',
    },
  ],
};

// MOYS -- Marina di Olbia Yachting Services, the Tavolara boat trip's
// real departure marina (Via Piovene 8, 07026 Olbia; mooring A44, per
// the user's own verified GetYourGuide booking documents). The marina
// itself is independently confirmed by multiple marina-directory listings
// (figaronautisme, portbooker, noonsite, marinas.com) under this exact
// name and in this part of Olbia's harbour. The destination coordinate is
// OSRM's own "arrive" point on the real road serving the marina.
//
// Researched from OSRM (overview=simplified, geometries=geojson; a
// separate steps=true request confirmed the real corridor: Via Sole Ruiu
// -> Strada Statale 125 Orientale Sarda -> Strada Statale 125 Olbia
// Centro -> Strada Maggiore Pietro Bonacossa -> Strada Statale 125 Olbia
// Sud -> Via Cesare Pavese -> Via Elio Vittorini -> Via Eugenio Montale,
// the normal route into Olbia town and the harbour district). Per the
// metkish-route-geometry rule's "no fixed point-count target", every bend
// OSRM returned is kept.
//
// NOT live-visually verified in this sandboxed session -- please check
// both markers and that neither label clips the frame.
const MOYS_OLBIA: JourneyPoint = {
  id: 'moys-olbia',
  name: 'MOYS — Marina di Olbia',
  sublabel: 'Tavolara boat trip, mooring A44',
  coords: [9.528393, 40.917169],
  showMapLabel: true,
};

const CASAGLIANA_TO_MOYS_ROUTE: [number, number][] = [
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
  [9.488305, 40.982603],
  [9.491453, 40.979272],
  [9.490381, 40.974445],
  [9.491223, 40.965084],
  [9.498218, 40.957271],
  [9.508278, 40.934864],
  [9.507021, 40.925063],
  [9.501468, 40.919714],
  [9.502724, 40.912073],
  [9.508619, 40.909254],
  [9.521855, 40.908138],
  [9.522016, 40.910927],
  [9.524136, 40.911642],
  [9.526096, 40.915186],
  [9.528148, 40.915308],
  MOYS_OLBIA.coords,
];

// Camera: bounding-box center of the real route (~9.49, 40.95), spanDeg
// sized the same way as the other local-hop cameras in this file. Checked
// against the current SARDINIA_BBOX the same way as LISCIA_RUJA's camera
// above -- comfortably inside it, no widening needed.
export const SARDINIA_CASAGLIANA_TO_MOYS_JOURNEY: Journey = {
  id: 'sardinia-casagliana-to-moys',
  initialCamera: { center: [9.492, 40.9516], spanDeg: 0.35 },
  legs: [
    {
      id: 'casagliana-to-moys',
      mode: 'car',
      from: CASAGLIANA,
      to: MOYS_OLBIA,
      camera: { center: [9.492, 40.9516], spanDeg: 0.35 },
      curve: 0,
      route: CASAGLIANA_TO_MOYS_ROUTE,
      weight: 4,
      transition: 'ease',
    },
  ],
};

// La Cinta Beach, San Teodoro -- real, well-known beach (confirmed via
// Sardegna Turismo's own "La Cinta" page and Wikipedia's San Teodoro
// article, among others). The destination coordinate is OSRM's own
// "arrive" point on the real beachfront road (Via Antonio Gramsci), the
// same car-accessible-point convention used throughout this file.
//
// Researched from OSRM (overview=simplified, geometries=geojson; a
// separate steps=true request confirmed the real corridor: Via Sole Ruiu
// -> SS125 Orientale Sarda -> SS125 Olbia Centro -> Strada Maggiore
// Pietro Bonacossa -> SS125 Olbia Sud -> Viale Multa Maria -> Viale Don
// Luigi Sturzo -> Via Nazionale -> Via Nazionale Monte Petrosu -> Via
// Antonio Gramsci, the normal SS125 corridor south-east from Olbia to San
// Teodoro). Per the metkish-route-geometry rule's "no fixed point-count
// target", every bend OSRM returned is kept.
//
// NOT live-visually verified in this sandboxed session -- please check
// both markers and that neither label clips the frame.
const LA_CINTA: JourneyPoint = {
  id: 'la-cinta',
  name: 'La Cinta Beach',
  sublabel: 'San Teodoro',
  coords: [9.670205, 40.785055],
  showMapLabel: true,
};

const CASAGLIANA_TO_LA_CINTA_ROUTE: [number, number][] = [
  CASAGLIANA.coords,
  [9.455598, 40.994054],
  [9.480331, 40.989732],
  [9.485792, 40.984753],
  [9.483191, 40.982518],
  [9.488305, 40.982603],
  [9.491453, 40.979272],
  [9.491223, 40.965084],
  [9.498218, 40.957271],
  [9.508278, 40.934864],
  [9.507021, 40.925063],
  [9.501468, 40.919714],
  [9.503814, 40.91113],
  [9.521686, 40.908131],
  [9.534961, 40.908892],
  [9.542447, 40.900509],
  [9.555433, 40.904284],
  [9.567356, 40.894471],
  [9.585694, 40.890408],
  [9.596228, 40.885056],
  [9.599439, 40.880702],
  [9.62749, 40.876859],
  [9.631701, 40.87255],
  [9.6395, 40.869965],
  [9.649256, 40.842189],
  [9.664388, 40.834179],
  [9.66025, 40.825162],
  [9.656427, 40.803837],
  [9.657434, 40.784594],
  LA_CINTA.coords,
];

// Camera: bounding-box center of the real route (~9.56, 40.89), spanDeg
// opened out further than the short local hops above since this is a
// longer (~38km) drive -- sized the same proportional way as this file's
// own Principe/Palau cameras (spanDeg opened out past the route's own
// bounding box, scaled to the route's real length). Checked against the
// current SARDINIA_BBOX the same way as LISCIA_RUJA's camera above --
// comfortably inside it, no widening needed.
export const SARDINIA_CASAGLIANA_TO_LA_CINTA_JOURNEY: Journey = {
  id: 'sardinia-casagliana-to-la-cinta',
  initialCamera: { center: [9.5629, 40.8896], spanDeg: 0.75 },
  legs: [
    {
      id: 'casagliana-to-la-cinta',
      mode: 'car',
      from: CASAGLIANA,
      to: LA_CINTA,
      camera: { center: [9.5629, 40.8896], spanDeg: 0.75 },
      curve: 0,
      route: CASAGLIANA_TO_LA_CINTA_ROUTE,
      weight: 4.5,
      transition: 'ease',
    },
  ],
};

// Piazza del Porto, Cala Gonone -- the Gulf of Orosei boat trip's real
// meeting point (Piazza del Porto 1, near Puddu Carburanti, per the
// user's own verified GetYourGuide booking documents). Independently
// confirmed as a real Cala Gonone boat-excursion departure point by
// several current tour listings for Gulf of Orosei trips departing from
// Cala Gonone. The destination coordinate is OSRM's own "arrive" point
// on the real harbourfront road.
//
// Researched from OSRM (overview=simplified, geometries=geojson; a
// separate steps=true request confirmed the real corridor as far as it
// could be read before the response was truncated by its own length --
// visible road names included SS125 Orientale Sarda, SS131 Diramazione
// Centrale Nuorese, SP73 Bitti-Sologo, SP38, Via Alfonso Lamarmora, Via
// Mare, Via Alcide De Gasperi, Via Giosuè Carducci and Viale Enrico
// Fermi -- the real SS125 corridor south through Siniscola/Orosei and
// inland over the Baronie hills to Dorgali/Cala Gonone, not an invented
// shortcut). This is by far the longest of this file's local drives
// (~118km real road distance for a ~80km straight-line hop -- the
// SS125 Orientale Sarda through this stretch is a genuinely winding
// mountain-and-coast road), so per the metkish-route-geometry rule's "no
// fixed point-count target" every real bend OSRM returned is kept rather
// than thinned toward a round number.
//
// NOT live-visually verified in this sandboxed session -- please check
// both markers and that neither label clips the frame.
const CALA_GONONE_PORTO: JourneyPoint = {
  id: 'cala-gonone-porto',
  name: 'Piazza del Porto',
  sublabel: 'Cala Gonone — Gulf of Orosei boat trip',
  coords: [9.638236, 40.283477],
  showMapLabel: true,
};

const CASAGLIANA_TO_CALA_GONONE_ROUTE: [number, number][] = [
  CASAGLIANA.coords,
  [9.489362, 40.981889],
  [9.508221, 40.935095],
  [9.506418, 40.908135],
  [9.485144, 40.893343],
  [9.503999, 40.872533],
  [9.577523, 40.826774],
  [9.592735, 40.798947],
  [9.642808, 40.764763],
  [9.638772, 40.744572],
  [9.651096, 40.72914],
  [9.692545, 40.709639],
  [9.717833, 40.685003],
  [9.71265, 40.667724],
  [9.7223, 40.65331],
  [9.705231, 40.640067],
  [9.707297, 40.618506],
  [9.67123, 40.548994],
  [9.639075, 40.529116],
  [9.579678, 40.465367],
  [9.487109, 40.401142],
  [9.515764, 40.373295],
  [9.508677, 40.346579],
  [9.530607, 40.334418],
  [9.542209, 40.302843],
  [9.572065, 40.303166],
  [9.603923, 40.270523],
  CALA_GONONE_PORTO.coords,
];

// Camera: bounding-box center of the real route (~9.59, 40.63).
//
// CORRECTION (explicit user report -- both endpoints were off-frame):
// the earlier spanDeg 1.05 and its comment above were wrong. This drive
// is dominated by LATITUDE, not longitude -- Casagliana at the north
// end (lat 40.9947) down to Cala Gonone at the south end (lat 40.2835),
// a real 0.72-degree span (0.7242 once the route's own southernmost
// point, lat 40.2705, is counted). JourneyMapScene.tsx's computeFrame()
// derives this journey's visible HEIGHT, at the wide-aspect branch, as
// a FIXED spanDeg*LAT_COS/1.7 independent of aspect -- at spanDeg 1.05
// that full height is only ~0.473 degrees, well under the 0.7242
// actually needed, so both endpoints (and their labels) fell outside
// the frame. Re-derived by hand against computeFrame()'s own formula,
// not guessed: spanDeg 1.95 gives a fixed height of ~0.879 degrees, a
// comfortable ~21% of padding over the real 0.7242 span. Checked across
// the realistic aspect range this map now renders at (nested inside its
// own section, roughly 0.9 on a narrow phone up to ~2.0 on the widest
// realistic container) and the old full-bleed range up to ~2.3, in both
// the wide and narrow/capped branches of computeFrame() -- both
// endpoints stay inside the frame with padding across that whole range.
//
// This larger spanDeg also pushes the frame's own east edge out past
// the old SARDINIA_BBOX (scripts/build-geo.mjs) at the widest aspects --
// that box's east edge was widened from 10.3 to 11.0 to cover it (see
// that file's own comment); east of ~9.7 here is open Tyrrhenian sea,
// not real coastline, so nothing new is being drawn, only clipped later.
//
// NOT live-visually verified in this sandboxed session -- please check
// both markers (and their labels) sit inside the frame with clear
// padding.
export const SARDINIA_CASAGLIANA_TO_CALA_GONONE_JOURNEY: Journey = {
  id: 'sardinia-casagliana-to-cala-gonone',
  initialCamera: { center: [9.59, 40.6326], spanDeg: 1.95 },
  legs: [
    {
      id: 'casagliana-to-cala-gonone',
      mode: 'car',
      from: CASAGLIANA,
      to: CALA_GONONE_PORTO,
      camera: { center: [9.59, 40.6326], spanDeg: 1.95 },
      curve: 0,
      route: CASAGLIANA_TO_CALA_GONONE_ROUTE,
      weight: 5.5,
      transition: 'ease',
    },
  ],
};

// Promenade du Port, Porto Cervo -- the Porto Cervo day-trip destination
// (Via Aga Khan 1, Porto Cervo; underground parking entrance at Via
// Porto Vecchio 1), per explicit instruction and confirmed as a real,
// well-known Costa Smeralda shopping promenade by costasmeralda.it's own
// article on it. The destination coordinate is OSRM's own "arrive" point
// on the real road serving the promenade.
//
// Researched from OSRM (overview=simplified, geometries=geojson; a
// separate steps=true request confirmed the real corridor: Via Sole Ruiu
// -> SS125 Orientale Sarda -> Strada Provinciale 73 -> Strada Provinciale
// 94 -> Località Abbiadori -> Strada Provinciale 59 -> Via Porto Cervo ->
// Via Sa Conca -> Via Cerbiatta -> Traversa Cerbiatta, the same first
// stretch shared with CASAGLIANA_TO_PRINCIPE_ROUTE and
// CASAGLIANA_TO_LISCIA_RUJA_ROUTE above before this route continues on
// into Porto Cervo itself). Per the metkish-route-geometry rule's "no
// fixed point-count target", every bend OSRM returned is kept.
//
// NOT live-visually verified in this sandboxed session -- please check
// both markers and that neither label clips the frame.
const PORTO_CERVO_PROMENADE: JourneyPoint = {
  id: 'porto-cervo-promenade',
  name: 'Promenade du Port',
  sublabel: 'Porto Cervo',
  coords: [9.535411, 41.13287],
  showMapLabel: true,
};

const CASAGLIANA_TO_PORTO_CERVO_ROUTE: [number, number][] = [
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
  [9.499288, 40.982722],
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
  [9.50677, 41.070809],
  [9.509619, 41.073128],
  [9.509782, 41.075755],
  [9.518164, 41.076241],
  [9.525915, 41.08598],
  [9.529512, 41.088045],
  [9.53096, 41.091287],
  [9.529032, 41.09311],
  [9.529858, 41.094276],
  [9.522362, 41.100154],
  [9.53038, 41.105782],
  [9.534243, 41.110115],
  [9.535631, 41.117077],
  [9.534615, 41.119126],
  [9.53669, 41.124443],
  [9.535467, 41.127422],
  [9.535965, 41.13095],
  [9.533606, 41.131972],
  PORTO_CERVO_PROMENADE.coords,
];

// Camera: bounding-box center of the real route (~9.50, 41.06), spanDeg
// opened out proportionally more than the short local hops since this
// drive runs the full length up into Porto Cervo (~26km). Checked against
// the current SARDINIA_BBOX the same way as every camera above --
// comfortably inside it, no widening needed.
export const SARDINIA_CASAGLIANA_TO_PORTO_CERVO_JOURNEY: Journey = {
  id: 'sardinia-casagliana-to-porto-cervo',
  initialCamera: { center: [9.4961, 41.0559], spanDeg: 0.55 },
  legs: [
    {
      id: 'casagliana-to-porto-cervo',
      mode: 'car',
      from: CASAGLIANA,
      to: PORTO_CERVO_PROMENADE,
      camera: { center: [9.4961, 41.0559], spanDeg: 0.55 },
      curve: 0,
      route: CASAGLIANA_TO_PORTO_CERVO_ROUTE,
      weight: 4.5,
      transition: 'ease',
    },
  ],
};

// Spiaggia di Porto Istana -- the sixth and final new Sardinia driving
// route, added per explicit instruction. Real, well-known beach near
// Olbia (confirmed via Sardegna Turismo's own "Porto Istana" page,
// spiagge.it's own listings for it, and multiple independent beach
// guides, all placing it at Localita Costa Corallina, 07026 Olbia).
// Two independent sources' own published coordinates for the beach
// (40.894262, 9.61439 and 40.8938063, 9.6148067) agree closely with each
// other and with OSRM's own "arrive" point below (on Viale Porto Istana,
// the beach's own access road) -- the same car-accessible-point
// convention used throughout this file.
//
// Researched from OSRM (overview=simplified, geometries=geojson; a
// separate steps=true request confirmed the real corridor: Via Sole Ruiu
// -> SS125 Orientale Sarda -> SS125 Olbia Centro -> Strada Maggiore
// Pietro Bonacossa -> SS125 Olbia Sud -> SS125 Orientale Sarda -> Viale
// Porto Istana, the normal SS125 corridor north-east out of Olbia town
// toward Costa Corallina). Per the metkish-route-geometry rule's "no
// fixed point-count target", every bend OSRM returned is kept.
//
// NOT live-visually verified in this sandboxed session -- please check
// both markers and that neither label clips the frame.
const PORTO_ISTANA: JourneyPoint = {
  id: 'porto-istana',
  name: 'Spiaggia di Porto Istana',
  sublabel: 'near Olbia',
  coords: [9.614471, 40.893629],
  showMapLabel: true,
};

const CASAGLIANA_TO_PORTO_ISTANA_ROUTE: [number, number][] = [
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
  [9.488305, 40.982603],
  [9.491453, 40.979272],
  [9.490381, 40.974445],
  [9.491223, 40.965084],
  [9.498218, 40.957271],
  [9.508278, 40.934864],
  [9.507021, 40.925063],
  [9.501468, 40.919714],
  [9.50176, 40.91387],
  [9.503814, 40.91113],
  [9.508619, 40.909254],
  [9.521686, 40.908131],
  [9.534961, 40.908892],
  [9.536345, 40.907744],
  [9.536433, 40.905034],
  [9.542447, 40.900509],
  [9.555433, 40.904284],
  [9.56743, 40.894456],
  [9.583023, 40.891408],
  [9.588721, 40.88863],
  [9.603381, 40.894153],
  [9.611421, 40.894598],
  PORTO_ISTANA.coords,
];

// Camera: bounding-box center of the real route (~9.54, 40.94), spanDeg
// sized the same proportional way as this file's other mid-length drives
// (~24km, comparable to Porto Cervo's own ~26km). Checked against the
// current SARDINIA_BBOX the same way as every camera above --
// comfortably inside it, no widening needed.
export const SARDINIA_CASAGLIANA_TO_PORTO_ISTANA_JOURNEY: Journey = {
  id: 'sardinia-casagliana-to-porto-istana',
  initialCamera: { center: [9.535, 40.9418], spanDeg: 0.5 },
  legs: [
    {
      id: 'casagliana-to-porto-istana',
      mode: 'car',
      from: CASAGLIANA,
      to: PORTO_ISTANA,
      camera: { center: [9.535, 40.9418], spanDeg: 0.5 },
      curve: 0,
      route: CASAGLIANA_TO_PORTO_ISTANA_ROUTE,
      weight: 4,
      transition: 'ease',
    },
  ],
};

