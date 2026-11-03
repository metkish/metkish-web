import type { Journey, JourneyPoint } from './types';

// Route data for the Barcelona flight map (Vienna Airport -> Barcelona
// Airport). Same pattern and engine as lib/journeys/tenerife.ts and
// lib/journeys/italy.ts (see italy.ts's own header comment) -- Barcelona
// is not a new map system, just another Journey in the same shared shape,
// rendered by the exact same components/journey/JourneyMapScene.
//
// VIENNA is the same real, canonical airport point already used for
// Tenerife's own flight map (see VIENNA in lib/journeys/tenerife.ts --
// same coordinates, 16.5697, 48.1103) -- kept as its own local const here
// rather than imported, matching this codebase's established per-
// destination-file convention (see italy.ts's own HOME const and its
// comment on why: route data lives per destination file, completely
// separate from the map engine, so this file never needs tenerife.ts to
// exist or change).
//
// This is a flight leg (mode: 'plane'), so -- same as Tenerife's own
// Vienna -> Tenerife flight leg -- there is no `route` waypoint array to
// verify against OSRM; the metkish-route-geometry rule governs real
// driving routes specifically, and a flight's drawn line is the engine's
// own decorative curve (see `curve` below), not a road. What does need to
// be, and is, real and verified here is each airport's own coordinate:
// Vienna Airport reuses the site's existing verified point; Barcelona-El
// Prat Airport (BCN/LEBL) is 41°17'49"N, 2°04'42"E (41.2971, 2.0785),
// cross-checked against public aviation reference data.
const VIENNA: JourneyPoint = {
  id: 'vienna',
  name: 'Vienna Airport',
  coords: [16.5697, 48.1103],
  showMapLabel: true,
};

const BARCELONA_AIRPORT: JourneyPoint = {
  id: 'barcelona-airport',
  name: 'Barcelona Airport',
  coords: [2.0785, 41.2971],
  showMapLabel: true,
};

// Vienna Airport -> (flight) -> Barcelona Airport, ending with the same
// "cinematic hold on the arrival frame" shape as Tenerife's own flight map
// (TENERIFE_VIENNA_TO_TENERIFE_JOURNEY in lib/journeys/tenerife.ts): a
// 'fly' leg covering the flight itself, then a second from===to 'fly' leg
// at the same camera that holds the finished route on screen as the
// map's resting frame. Same two-leg shape, same weights (4.5 / 1.5), same
// transition style -- only the endpoints and camera framing differ, since
// Barcelona is a shorter, more southerly hop than Tenerife's Atlantic
// crossing.
export const BARCELONA_VIENNA_TO_BARCELONA_JOURNEY: Journey = {
  id: 'barcelona-vienna-to-barcelona',
  // Framed tight on Vienna itself, same opening-frame logic as Tenerife's
  // own flight map (starts "at Vienna Airport" before the first leg's
  // 'fly' transition pans out to the wide view below).
  initialCamera: { center: [16.5697, 48.1103], spanDeg: 9 },
  legs: [
    {
      id: 'vienna-to-barcelona',
      mode: 'plane',
      from: VIENNA,
      to: BARCELONA_AIRPORT,
      // Centred a little west of the two airports' own midpoint (lng
      // ~9.32, lat ~44.70), and spanDeg sized generously past this leg's
      // own real bounding box (~14.49deg of longitude, ~6.81deg of
      // latitude). Needed wider than a first pass based on that bounding
      // box alone: JourneyMapScene's camera frame is sized off spanDeg at
      // a *reference* aspect ratio, then only widens further on a wide
      // desktop container -- a narrow mobile container does not, so on
      // mobile this leg's own real width in degrees is what has to fit
      // the frame, not a desktop-only expanded view of it. Tuned live
      // (both breakpoints) until Barcelona Airport's marker and label sat
      // clear of the frame edge on mobile too, not just on desktop.
      camera: { center: [8.3, 44.5], spanDeg: 36 },
      // A gentle bow, same direction/magnitude family as Tenerife's own
      // flight leg (-0.045) -- this is the engine's decorative curve for
      // a flight (no real route data applies, see file header), chosen
      // for the same unhurried, editorial-map look as every other leg.
      curve: -0.06,
      // Same "approx. 4-5s" pacing as Tenerife's own flight leg.
      weight: 4.5,
      transition: 'fly',
    },
    {
      id: 'barcelona-arrival-zoom',
      mode: 'plane',
      from: BARCELONA_AIRPORT,
      to: BARCELONA_AIRPORT,
      // Deliberately the SAME camera as the leg above (not a tighter
      // zoom) -- the map's resting frame reads as a complete summary of
      // the whole flight (Vienna, the full pink route and Barcelona all
      // inside the frame at once), exactly like Tenerife's own arrival
      // hold.
      camera: { center: [8.3, 44.5], spanDeg: 36 },
      weight: 1.5,
      transition: 'fly',
    },
  ],
};
// Act two: the airport transfer, Barcelona-El Prat Airport Terminal 1 ->
// our hotel (ICON BCN, Roger de Lluria 21, 08009 Barcelona). A real,
// independently-verified driving route (OSRM, steps=true then the full
// geometry fetched and cross-checked leg by leg against each maneuver),
// not a straight line or an estimated curve -- per the
// metkish-route-geometry project rule.
//
// BCN_AIRPORT_T1: not the generic airport-wide coordinate (which OSRM
// snaps ~780m away, off any real road -- the same class of problem
// documented for TENERIFE_SOUTH in lib/journeys/tenerife.ts, a generic
// aerodrome centroid sitting inside a building rather than on a road).
// This point instead sits exactly on "Ronda de Josep Canudas i Busquets"
// (OSRM snap distance 0.14m), the real access/ring road serving Terminal
// 1 -- confirmed via public airport reference data placing T1 on the
// airport's west side with this road running along its terminal curb.
//
// ICON_BCN: the exact coordinate supplied for the hotel
// (41.3910205056696, 2.17146545648575); OSRM snaps it 3.92m to the
// nearest routable road, i.e. essentially exact.
//
// Route verified via OSRM (router.project-osrm.org/route/v1/driving,
// steps=true, overview=full): 13.9km, ~19.4min, summary "Autovia de
// Castelldefels, Gran Via de les Corts Catalanes". The real maneuvers,
// in order: depart Ronda de Josep Canudas i Busquets (T1's own airport
// ring road) -> join the C-32B -> off-ramp toward Barcelona -> merge onto
// Autovia de Castelldefels (C-31) for the long motorway leg into the
// city -> becomes Avinguda de la Granvia de l'Hospitalet, then Gran Via
// de les Corts Catalanes (C-31) -> a slight-right fork continuing on Gran
// Via de les Corts Catalanes -> final right turn to arrive at Roger de
// Lluria. All of these are preserved below (not simplified away); this
// is the full OSRM-returned geometry (419 points) for the whole leg,
// fetched and cross-checked in ten consecutive maneuver-to-maneuver
// segments (summed segment distance 13.901km against OSRM's own reported
// 13.916km route distance -- the ~0.1% gap is the expected straight-line-
// between-samples undercount, not a transcription error), kept at full
// density rather than thinned, matching this file's and tenerife.ts's
// own "no fixed point-count target, prioritise real geometry" convention
// for a route that mixes dense urban turns (near the airport, and the
// final approach into the Eixample grid) with a long, gently-curving
// motorway stretch in between.
const BCN_AIRPORT_T1: JourneyPoint = {
  id: 'bcn-airport-t1',
  name: 'Barcelona Airport',
  coords: [2.075929, 41.303028],
  showMapLabel: true,
};

const ICON_BCN: JourneyPoint = {
  id: 'icon-bcn',
  name: 'ICON BCN',
  coords: [2.17146545648575, 41.3910205056696],
  showMapLabel: true,
};

const BARCELONA_AIRPORT_TO_HOTEL_ROUTE: [number, number][] = [
  [2.075929, 41.303028], [2.075963, 41.30304], [2.076025, 41.30306], [2.07629, 41.303149], [2.076603, 41.30326], [2.076832, 41.303341],
  [2.077687, 41.303636], [2.078511, 41.303919], [2.078945, 41.304069], [2.079182, 41.304151], [2.079244, 41.304174], [2.079332, 41.304208],
  [2.079421, 41.304243], [2.079607, 41.304307], [2.080042, 41.304453], [2.081254, 41.30486], [2.081352, 41.304895], [2.081404, 41.304913],
  [2.081566, 41.304962], [2.081599, 41.304972], [2.081754, 41.305024], [2.081858, 41.305059], [2.081938, 41.305086], [2.082068, 41.305129],
  [2.082073, 41.305158], [2.082072, 41.305258], [2.082116, 41.305284], [2.082195, 41.305337], [2.08227, 41.305433], [2.082371, 41.305578],
  [2.082405, 41.305635], [2.082426, 41.30568], [2.082436, 41.305707], [2.08246, 41.305786], [2.082463, 41.30581], [2.082469, 41.305862],
  [2.082467, 41.305928], [2.08245, 41.306024], [2.082432, 41.306074], [2.082417, 41.306117], [2.082322, 41.306251], [2.082246, 41.306321],
  [2.082151, 41.306385], [2.082139, 41.30639], [2.081992, 41.30646], [2.081868, 41.306501], [2.081722, 41.306527], [2.081359, 41.306552],
  [2.08123, 41.30657], [2.0811, 41.306594], [2.080987, 41.306632], [2.080886, 41.306674], [2.080761, 41.306752], [2.080681, 41.306821],
  [2.080665, 41.306837], [2.08061, 41.306893], [2.080562, 41.30696], [2.080399, 41.307217], [2.080045, 41.307791], [2.079994, 41.307878],
  [2.079928, 41.307992], [2.079763, 41.308259], [2.079607, 41.30851], [2.079416, 41.308874], [2.078921, 41.309701], [2.078764, 41.309953],
  [2.078608, 41.310219], [2.078584, 41.310271], [2.078478, 41.310534], [2.078392, 41.310793], [2.078293, 41.311174], [2.078273, 41.311289],
  [2.078257, 41.311467], [2.078246, 41.311688], [2.078253, 41.311899], [2.078264, 41.312049], [2.078297, 41.312253], [2.078341, 41.312482],
  [2.078395, 41.3127], [2.078531, 41.313222], [2.07858, 41.313451], [2.078627, 41.313751], [2.078664, 41.314053], [2.078678, 41.314363],
  [2.078663, 41.314976], [2.078632, 41.315268], [2.078599, 41.3155], [2.07854, 41.315785], [2.078469, 41.31606], [2.078396, 41.31631],
  [2.078311, 41.316564], [2.078205, 41.316807], [2.078119, 41.316997], [2.077996, 41.317236], [2.077911, 41.317381], [2.077776, 41.317602],
  [2.077604, 41.317863], [2.077553, 41.317939], [2.077162, 41.318461], [2.077008, 41.318654], [2.076424, 41.319378], [2.076382, 41.319506],
  [2.076124, 41.319833], [2.075873, 41.320195], [2.075606, 41.320716], [2.075479, 41.321106], [2.075443, 41.321374], [2.075434, 41.321583],
  [2.075462, 41.321777], [2.075573, 41.322198], [2.075707, 41.322532], [2.075883, 41.322874], [2.075961, 41.323006], [2.076112, 41.323193],
  [2.076319, 41.323502], [2.076407, 41.323633], [2.076627, 41.323975], [2.076822, 41.324214], [2.076848, 41.324246], [2.076869, 41.324274],
  [2.078011, 41.325696], [2.078951, 41.326861], [2.079363, 41.327359], [2.079705, 41.327744], [2.079885, 41.327932], [2.080074, 41.328122],
  [2.080347, 41.328371], [2.080779, 41.328784], [2.081285, 41.329219], [2.081452, 41.329348], [2.081687, 41.329536], [2.082262, 41.329971],
  [2.082532, 41.330155], [2.083008, 41.330458], [2.083531, 41.33077], [2.084111, 41.331088], [2.084732, 41.331403], [2.085107, 41.331576],
  [2.085491, 41.331748], [2.086167, 41.332021], [2.086262, 41.332059], [2.087112, 41.332365], [2.087533, 41.332508], [2.087801, 41.332603],
  [2.088801, 41.3329], [2.095202, 41.335085], [2.095551, 41.335229], [2.095751, 41.335315], [2.095825, 41.335347], [2.095967, 41.335411],
  [2.096953, 41.335957], [2.097407, 41.336209], [2.097571, 41.336321], [2.097901, 41.336557], [2.098039, 41.336661], [2.098327, 41.336872],
  [2.098759, 41.337202], [2.099202, 41.337553], [2.100218, 41.33831], [2.100819, 41.338764], [2.102943, 41.340345], [2.105464, 41.342251],
  [2.105922, 41.342597], [2.106316, 41.342889], [2.106718, 41.343191], [2.106973, 41.343383], [2.108152, 41.344272], [2.109039, 41.34494],
  [2.110656, 41.346142], [2.111521, 41.346786], [2.111577, 41.346829], [2.111674, 41.3469], [2.112314, 41.347374], [2.112539, 41.347542],
  [2.112589, 41.347579], [2.113197, 41.348034], [2.113422, 41.348207], [2.114063, 41.348671], [2.114377, 41.348903], [2.114473, 41.348974],
  [2.115405, 41.349653], [2.115562, 41.349775], [2.115781, 41.349945], [2.11612, 41.350212], [2.116485, 41.350485], [2.116552, 41.350534],
  [2.116962, 41.350802], [2.117328, 41.35102], [2.117698, 41.351236], [2.118071, 41.351469], [2.118473, 41.351743], [2.11914, 41.352232],
  [2.119653, 41.352616], [2.120735, 41.353448], [2.121521, 41.354043], [2.122242, 41.354592], [2.122253, 41.3546], [2.122272, 41.354613],
  [2.123131, 41.355239], [2.123912, 41.355809], [2.125388, 41.356927], [2.126008, 41.357397], [2.127146, 41.358259], [2.127906, 41.35883],
  [2.128855, 41.35954], [2.12904, 41.359673], [2.12972, 41.360204], [2.130249, 41.360603], [2.130378, 41.360702], [2.130621, 41.360883],
  [2.130682, 41.360929], [2.130776, 41.360999], [2.130997, 41.361166], [2.131043, 41.361197], [2.131551, 41.361602], [2.132216, 41.362178],
  [2.132385, 41.362327], [2.133599, 41.363255], [2.133964, 41.363571], [2.134991, 41.364347], [2.135656, 41.364848], [2.135936, 41.365067],
  [2.138421, 41.366922], [2.138694, 41.367125], [2.138905, 41.367289], [2.139007, 41.367409], [2.1392, 41.367552], [2.139299, 41.367626],
  [2.139311, 41.367635], [2.139341, 41.367658], [2.13944, 41.367731], [2.139474, 41.367756], [2.139509, 41.367781], [2.139619, 41.367864],
  [2.139637, 41.367878], [2.139649, 41.367888], [2.139749, 41.367964], [2.140148, 41.368267], [2.140264, 41.36835], [2.14031, 41.368384],
  [2.140395, 41.368446], [2.140453, 41.368492], [2.140495, 41.368523], [2.140871, 41.368809], [2.140918, 41.368844], [2.141262, 41.369098],
  [2.1415, 41.369283], [2.141864, 41.36956], [2.141984, 41.369653], [2.14202, 41.369679], [2.14235, 41.369923], [2.142449, 41.369994],
  [2.14261, 41.370121], [2.142655, 41.370155], [2.142709, 41.370196], [2.142871, 41.37032], [2.142931, 41.370361], [2.14298, 41.370394],
  [2.143064, 41.370458], [2.1437, 41.370935], [2.143729, 41.370957], [2.143874, 41.371064], [2.144017, 41.371171], [2.144053, 41.371197],
  [2.144736, 41.371712], [2.144885, 41.371822], [2.144925, 41.371855], [2.145257, 41.372101], [2.145527, 41.372308], [2.145998, 41.372662],
  [2.146006, 41.372668], [2.146038, 41.372692], [2.146075, 41.372722], [2.146183, 41.372801], [2.146195, 41.37281], [2.146371, 41.372943],
  [2.146417, 41.372978], [2.146564, 41.37309], [2.1467, 41.373188], [2.146892, 41.373262], [2.147024, 41.373354], [2.14722, 41.373502],
  [2.147529, 41.373738], [2.148011, 41.374099], [2.148149, 41.374211], [2.148312, 41.374344], [2.148593, 41.374526], [2.148766, 41.374594],
  [2.14893, 41.374624], [2.149095, 41.374634], [2.149205, 41.374643], [2.14932, 41.374665], [2.149406, 41.374693], [2.149475, 41.374728],
  [2.149552, 41.374783], [2.149608, 41.374844], [2.149654, 41.374916], [2.149724, 41.375112], [2.149789, 41.375264], [2.149815, 41.375315],
  [2.149845, 41.37537], [2.149897, 41.375461], [2.149945, 41.375542], [2.150037, 41.375661], [2.150112, 41.375749], [2.150186, 41.375828],
  [2.150277, 41.375907], [2.150409, 41.376018], [2.150579, 41.37615], [2.15065, 41.376171], [2.150667, 41.376184], [2.151639, 41.376916],
  [2.151659, 41.376931], [2.151687, 41.376952], [2.151794, 41.377028], [2.151831, 41.377055], [2.151929, 41.377126], [2.152397, 41.37747],
  [2.152747, 41.377741], [2.152771, 41.37776], [2.152912, 41.377869], [2.153065, 41.377988], [2.153707, 41.378476], [2.153714, 41.378481],
  [2.153876, 41.378601], [2.153902, 41.37862], [2.154054, 41.378731], [2.154174, 41.378822], [2.155038, 41.379482], [2.155076, 41.379511],
  [2.155137, 41.379558], [2.155176, 41.379584], [2.155323, 41.379696], [2.155893, 41.380123], [2.15597, 41.380179], [2.156134, 41.380296],
  [2.156183, 41.380332], [2.156325, 41.380433], [2.156432, 41.380515], [2.157269, 41.381136], [2.157313, 41.381167], [2.157462, 41.381278],
  [2.157606, 41.381387], [2.158216, 41.381847], [2.158398, 41.381982], [2.158423, 41.382001], [2.158532, 41.382082], [2.158594, 41.382129],
  [2.158759, 41.382254], [2.159059, 41.382479], [2.159238, 41.382614], [2.159521, 41.382826], [2.159566, 41.382859], [2.159728, 41.382981],
  [2.159823, 41.383053], [2.159881, 41.383096], [2.160214, 41.383345], [2.160676, 41.38369], [2.160705, 41.383711], [2.160797, 41.383781],
  [2.160856, 41.383827], [2.161016, 41.383948], [2.161607, 41.384403], [2.161638, 41.384426], [2.161789, 41.384545], [2.161819, 41.384568],
  [2.161969, 41.384678], [2.162033, 41.384727], [2.162138, 41.384809], [2.162693, 41.385232], [2.16295, 41.385429], [2.162992, 41.38546],
  [2.163101, 41.38554], [2.163221, 41.385631], [2.163872, 41.386123], [2.163947, 41.386183], [2.163982, 41.386209], [2.164115, 41.38631],
  [2.164239, 41.386403], [2.165116, 41.387042], [2.165184, 41.387091], [2.16538, 41.387231], [2.165665, 41.387459], [2.166072, 41.387774],
  [2.16633, 41.387977], [2.166582, 41.38817], [2.166699, 41.388259], [2.166737, 41.388288], [2.167012, 41.388357], [2.167143, 41.388437],
  [2.167183, 41.388458], [2.167339, 41.38854], [2.167376, 41.388558], [2.167716, 41.388811], [2.168084, 41.389086], [2.168114, 41.389109],
  [2.168235, 41.389199], [2.168293, 41.389242], [2.168456, 41.389363], [2.168533, 41.389424], [2.168639, 41.389476], [2.168668, 41.389483],
  [2.16873, 41.38951], [2.168779, 41.389543], [2.16922, 41.389873], [2.169885, 41.390371], [2.169909, 41.39039], [2.170052, 41.390496],
  [2.170097, 41.390532], [2.1702, 41.390622], [2.170595, 41.390922], [2.170812, 41.391076], [2.170927, 41.391164], [2.170966, 41.391194],
  [2.17101, 41.391225], [2.171212, 41.391225], [2.171251, 41.391227], [2.171302, 41.391191], [2.171498, 41.391046],
  // OSRM snaps the supplied hotel coordinate to the nearest routable point
  // on the street (3.92m away -- essentially exact, same as every other
  // destination's real-world snap on this site). This final point closes
  // that last few metres so the drawn route's endpoint matches ICON_BCN's
  // own canonical coordinate exactly, same pattern used site-wide whenever
  // a real destination sits just off the road itself.
  [2.17146545648575, 41.3910205056696],
];

// Fine coastal detail layered on top of the shared (coarser) coastline,
// exactly like CANARY_PATHS layers over WIDE_EUROPE_PATHS for the Canary
// Islands, and like ITALY_LIGURIA_COAST_LAND for the Milano -> La Spezia
// map (see that constant's own comment in lib/journeys/italy.ts for the
// full methodology this mirrors).
//
// The shared coastline (components/journey/generated/geography.ts's
// WIDE_EUROPE_PATHS) is simplified at a ~0.12deg tolerance -- fine for a
// whole-Europe view, but the real Barcelona coastline near the airport
// and harbour has genuine detail (river-delta edge, harbour breakwaters)
// at a much smaller scale than that, well under the simplification
// tolerance itself. At this map's close zoom, that over-simplification
// visibly cut across the real coast and put BCN_AIRPORT_T1 on the sea
// side of the line -- a real bug, not a label/marker-placement issue
// (both real coordinates are correct; only the background coastline
// illustration was wrong).
//
// This patch is sourced the same way the base coastline was -- real
// OpenStreetMap land data (@geo-maps/earth-lands-1km, the same package
// scripts/build-geo.mjs uses), not hand-drawn: the same global land ring
// WIDE_EUROPE_PATHS was simplified from, clipped to a generous window
// around this journey's camera frame (lng 1.75-2.45, lat 41.05-41.6) with
// NO further simplification (clipping alone leaves only 18 points here,
// so there is nothing left to simplify away), then projected through the
// same equirectangular projection build-geo.mjs uses at runtime. Verified
// numerically before use: both BCN_AIRPORT_T1 and ICON_BCN test as inside
// this patch's land polygon (point-in-polygon on the pre-projection
// lng/lat ring), fixing exactly the sea/land placement this patch exists
// for.
const BARCELONA_COAST_LAND =
  'M 1.609,-41.600 Q 1.877,-41.600 1.877,-41.564 Q 1.877,-41.528 1.847,-41.508 Q 1.816,-41.489 1.776,-41.474 Q 1.735,-41.458 1.704,-41.408 Q 1.674,-41.358 1.674,-41.370 Q 1.674,-41.381 1.667,-41.364 Q 1.660,-41.347 1.654,-41.346 Q 1.648,-41.346 1.647,-41.338 Q 1.646,-41.330 1.653,-41.335 Q 1.659,-41.341 1.650,-41.320 Q 1.642,-41.299 1.651,-41.305 Q 1.661,-41.311 1.655,-41.303 Q 1.649,-41.296 1.641,-41.299 Q 1.632,-41.301 1.591,-41.284 Q 1.550,-41.266 1.511,-41.263 Q 1.472,-41.260 1.406,-41.236 Q 1.341,-41.212 1.341,-41.406 Q 1.341,-41.600 1.609,-41.600 Z';

export const BARCELONA_AIRPORT_TO_HOTEL_JOURNEY: Journey = {
  id: 'barcelona-airport-to-hotel',
  // This map's own opening frame -- a city-scale view centred between the
  // airport and the hotel, independent of the flight map's wide resting
  // camera above (that one stays wide deliberately; this one starts
  // already framed on the real transfer corridor), same approach as
  // TENERIFE_TRANSFER_JOURNEY's own initialCamera.
  initialCamera: { center: [2.123, 41.347], spanDeg: 0.5 },
  legs: [
    {
      id: 'bcn-airport-to-hotel',
      mode: 'car',
      from: BCN_AIRPORT_T1,
      to: ICON_BCN,
      // Centred on the route's own real midpoint-ish point along Gran
      // Via, spanDeg sized off this leg's real bounding box (~0.095deg
      // of longitude, ~0.088deg of latitude) plus generous padding so
      // both markers and their labels sit clear of the frame edge on a
      // narrow mobile container too -- the lesson from the Barcelona
      // flight map's own camera tuning (see lib/journeys/barcelona.ts's
      // BARCELONA_VIENNA_TO_BARCELONA_JOURNEY comment): a camera that
      // looks right on a wide desktop container can still clip a marker
      // on mobile, so this was checked live at both breakpoints, not
      // picked from the bounding box alone.
      camera: { center: [2.123, 41.347], spanDeg: 0.5 },
      curve: 0.08,
      route: BARCELONA_AIRPORT_TO_HOTEL_ROUTE,
      // Same single-leg "ease" pacing as Tenerife's own airport-transfer
      // leg (TENERIFE_TRANSFER_JOURNEY) -- a local transfer, not a
      // cinematic cross-country leg.
      weight: 3.5,
      transition: 'ease',
    },
  ],
  extraLandPatches: [BARCELONA_COAST_LAND],
  extraCoastlineStrokes: [BARCELONA_COAST_LAND],
};
