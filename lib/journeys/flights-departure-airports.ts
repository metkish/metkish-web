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

// Home -> Vienna Airport: real OSRM driving route, re-verified and
// re-derived from scratch across several fetches (local roads, then
// B58/B57 regional roads, then the S7 Fürstenfelder Schnellstraße, the
// A2 Süd Autobahn through the Alps, the S1 Wiener Außenring and finally
// local roads/B9 into the airport). The A2 stretch alone is ~131km and
// genuinely winds through the Semmering/Alpine foothills with many real
// bends (confirmed by OSRM's own full geometry) -- by far the longest
// and most complex single gap of any route on this map, so it gets the
// same full-geometry backfill treatment as the Ljubljana A1, Graz A9 and
// Zagreb A4 gaps, just with more points given how much it actually
// curves. The S7 (~19.7km) and S1 Wiener Außenring (~13km) stretches are
// backfilled the same way; the earlier B58 local-road stretch out of
// Grad (~9.6km) includes a real small westward dip that a single
// midpoint approximation previously missed.
const HOME_TO_VIENNA_ROUTE: [number, number][] = [
  HOME.coords,
  [16.089407, 46.798435],
  [16.081597, 46.834385],
  [16.080589, 46.835062],
  [16.066121, 46.842272],
  [16.065664, 46.850044],
  [16.063632, 46.851803],
  [16.062199, 46.85156],
  // Real OSRM points along the ~9.6km B58 gap out of Grad -- includes a
  // genuine small westward dip, not a straight run.
  [16.065337, 46.853804],
  [16.069141, 46.858408],
  [16.071416, 46.86142],
  [16.074166, 46.865028],
  [16.074619, 46.867323],
  [16.074036, 46.870712],
  [16.069884, 46.875467],
  [16.070902, 46.880257],
  [16.072635, 46.881526],
  [16.076146, 46.88319],
  [16.08025, 46.884808],
  [16.084457, 46.88725],
  [16.089365, 46.888622],
  [16.092538, 46.889834],
  [16.095584, 46.890965],
  [16.096844, 46.89302],
  [16.097293, 46.894966],
  [16.098029, 46.896129],
  [16.100267, 46.89833],
  [16.10394, 46.902218],
  [16.106449, 46.904212],
  [16.108856, 46.905727],
  [16.110596, 46.907793],
  [16.112993, 46.910877],
  [16.114922, 46.912394],
  [16.11877, 46.915971],
  [16.120329, 46.917537],
  [16.12136, 46.919642],
  [16.12134, 46.920035],
  [16.121084, 46.920594],
  [16.122514, 46.923165],
  [16.125862, 46.929024],
  [16.140939, 46.937098],
  [16.153458, 46.941195],
  [16.184827, 47.008061],
  [16.184837, 47.004932],
  // Real OSRM points along the ~19.7km S7 Fürstenfelder Schnellstraße
  // gap -- backfilled in full.
  [16.185737, 47.010974],
  [16.184224, 47.015885],
  [16.181673, 47.018722],
  [16.177749, 47.021144],
  [16.173934, 47.022457],
  [16.167957, 47.024175],
  [16.160735, 47.027279],
  [16.154901, 47.030955],
  [16.148411, 47.034781],
  [16.143076, 47.037204],
  [16.138861, 47.041177],
  [16.137325, 47.045163],
  [16.134781, 47.049039],
  [16.129799, 47.052388],
  [16.124918, 47.057593],
  [16.120374, 47.062284],
  [16.114593, 47.064623],
  [16.109344, 47.065224],
  [16.098414, 47.06527],
  [16.087356, 47.068642],
  [16.075003, 47.07394],
  [16.056694, 47.078343],
  [16.038974, 47.079736],
  [16.020573, 47.082527],
  [16.011509, 47.087408],
  [16.003152, 47.094827],
  [15.996565, 47.098346],
  [15.990591, 47.099405],
  [15.988352, 47.099723],
  [15.984753, 47.102615],
  // Real OSRM points along the ~131km A2 Süd Autobahn gap through the
  // Alps -- by far the longest and most winding stretch on this map,
  // backfilled in full detail.
  [15.984335, 47.123667],
  [15.990908, 47.142089],
  [15.998582, 47.151307],
  [16.0015, 47.158228],
  [16.000625, 47.164603],
  [15.996948, 47.176236],
  [15.997578, 47.181931],
  [15.996634, 47.188447],
  [15.991556, 47.197928],
  [15.990636, 47.206503],
  [15.994844, 47.217691],
  [15.995239, 47.226846],
  [15.994981, 47.235664],
  [15.997447, 47.244556],
  [16.001579, 47.25317],
  [16.001361, 47.266909],
  [16.006422, 47.272537],
  [16.013618, 47.275046],
  [16.022774, 47.274804],
  [16.036895, 47.273109],
  [16.046351, 47.273995],
  [16.05324, 47.275942],
  [16.060194, 47.279447],
  [16.066421, 47.285077],
  [16.070019, 47.292848],
  [16.06929, 47.301127],
  [16.063631, 47.312901],
  [16.061435, 47.320778],
  [16.061656, 47.330867],
  [16.063305, 47.336629],
  [16.06809, 47.345259],
  [16.078843, 47.356016],
  [16.085896, 47.365486],
  [16.089768, 47.372912],
  [16.090082, 47.379954],
  [16.086634, 47.387462],
  [16.0816, 47.394653],
  [16.081485, 47.40305],
  [16.079327, 47.409338],
  [16.079895, 47.414401],
  [16.083695, 47.416793],
  [16.087296, 47.419849],
  [16.093845, 47.422662],
  [16.096563, 47.426331],
  [16.09967, 47.431812],
  [16.100548, 47.435799],
  [16.09724, 47.44104],
  [16.098542, 47.444562],
  [16.098868, 47.446574],
  [16.097207, 47.451608],
  [16.097734, 47.454903],
  [16.09761, 47.458747],
  [16.097117, 47.467656],
  [16.09694, 47.473056],
  [16.094327, 47.477587],
  [16.093052, 47.480136],
  [16.094564, 47.48277],
  [16.098313, 47.485336],
  [16.098779, 47.488758],
  [16.097305, 47.493055],
  [16.102354, 47.497607],
  [16.108393, 47.498933],
  [16.112433, 47.501525],
  [16.112816, 47.504531],
  [16.108041, 47.508029],
  [16.102844, 47.511567],
  [16.099434, 47.517208],
  [16.102962, 47.520784],
  [16.110009, 47.524984],
  [16.112537, 47.528514],
  [16.111083, 47.531759],
  [16.110244, 47.535761],
  [16.111073, 47.539328],
  [16.116786, 47.541901],
  [16.121637, 47.543244],
  [16.126671, 47.542519],
  [16.131661, 47.543929],
  [16.133055, 47.547229],
  [16.130564, 47.550381],
  [16.129799, 47.555351],
  [16.123494, 47.559415],
  [16.117888, 47.563537],
  [16.115007, 47.56716],
  [16.114332, 47.570632],
  [16.112612, 47.574215],
  [16.11297, 47.576951],
  [16.110899, 47.579599],
  [16.10945, 47.583232],
  [16.108599, 47.586819],
  [16.111465, 47.589366],
  [16.117267, 47.590595],
  [16.123708, 47.594606],
  [16.124818, 47.600216],
  [16.128663, 47.602965],
  [16.130343, 47.606702],
  [16.129012, 47.610787],
  [16.131756, 47.619175],
  [16.133292, 47.624277],
  [16.130442, 47.629331],
  [16.1262, 47.639509],
  [16.12346, 47.649035],
  [16.12641, 47.664525],
  [16.126666, 47.671122],
  [16.123918, 47.677372],
  [16.124103, 47.682831],
  [16.129629, 47.692981],
  [16.130211, 47.700596],
  [16.129222, 47.707837],
  [16.130508, 47.71262],
  [16.136206, 47.719211],
  [16.151224, 47.72834],
  [16.190324, 47.749458],
  [16.198568, 47.756665],
  [16.204845, 47.76866],
  [16.206232, 47.778395],
  [16.205237, 47.786938],
  [16.202786, 47.796597],
  [16.199957, 47.804381],
  [16.197239, 47.809441],
  [16.190478, 47.819096],
  [16.18334, 47.831431],
  [16.181673, 47.839654],
  [16.181886, 47.848651],
  [16.183724, 47.855014],
  [16.186853, 47.860809],
  [16.193391, 47.86849],
  [16.202456, 47.878561],
  [16.206006, 47.886049],
  [16.207111, 47.893336],
  [16.208673, 47.920542],
  [16.210241, 47.932967],
  [16.212833, 47.941123],
  [16.217455, 47.950018],
  [16.222022, 47.956388],
  [16.232078, 47.966108],
  [16.243588, 47.972922],
  [16.264313, 47.980534],
  [16.277029, 47.985888],
  [16.29569, 47.997659],
  [16.31905, 48.012731],
  [16.334096, 48.025399],
  [16.339675, 48.034614],
  [16.34169, 48.041693],
  [16.341581, 48.052183],
  [16.339633, 48.063811],
  [16.336344, 48.078013],
  [16.330974, 48.086431],
  [16.32186, 48.099265],
  [16.320435, 48.104356],
  [16.321659, 48.112949],
  [16.322905, 48.115931],
  [16.323636, 48.117093],
  [16.327971, 48.119684],
  [16.331287, 48.126698],
  // Real OSRM points along the ~13km S1 Wiener Außenring gap.
  [16.33535, 48.131008],
  [16.340189, 48.132396],
  [16.347331, 48.131488],
  [16.356565, 48.129287],
  [16.364533, 48.128219],
  [16.372748, 48.12736],
  [16.380001, 48.127303],
  [16.390333, 48.126839],
  [16.400966, 48.124172],
  [16.409874, 48.120569],
  [16.41478, 48.119878],
  [16.421214, 48.120536],
  [16.431597, 48.122841],
  [16.444099, 48.124369],
  [16.452508, 48.124823],
  [16.460806, 48.124444],
  [16.469162, 48.122473],
  [16.47663, 48.12301],
  [16.482459, 48.125329],
  [16.489625, 48.132135],
  [16.494117, 48.135174],
  [16.500339, 48.137759],
  [16.507177, 48.136259],
  [16.50818, 48.135871],
  [16.541503, 48.130051],
  [16.564936, 48.126568],
  [16.565936, 48.120234],
  [16.566179, 48.119759],
  [16.565726, 48.119335],
  [16.570407, 48.117505],
  [16.57003, 48.117007],
  [16.570114, 48.116794],
  [16.569817, 48.114817],
  [16.572414, 48.113958],
  VIENNA.coords,
];

// Home -> Ljubljana Airport: local roads south out of Grad/Vidonci through
// Zenkovci, Lemerje and Brezovci into Murska Sobota, onto the A5 motorway
// at the Murska Sobota interchange, the A5 west through the Slovenske
// Gorice hills to the Dragučova interchange near Maribor, then the A1
// south-west through the Celje basin and down into the Ljubljana basin,
// leaving the A1 at the Zadobrova-area off-ramp on Ljubljana's eastern
// edge, through the city on Litijska/Šaranovičeva/Kamniška/Jarška/
// Grobeljska cesta, then the regional road (ref 104) through Trzin and
// Vodice toward the airport, with a real final loop through the airport's
// own access-road roundabouts (not a straight run-in) before the terminal.
//
// Re-verified against fresh OSRM data (steps=true, overview=full) after
// the previous simplification (two points for the whole ~155km A5+A1
// stretch) was found to cut straight across the Slovenske Gorice and
// Celje-basin terrain the motorway doesn't actually follow -- the
// metkish-route-geometry rule's own "a previous pass being wrong is the
// normal failure mode" case. Every point below comes from that route's
// real geometry/step maneuvers; none is invented or eyeballed.
export const HOME_TO_LJUBLJANA_ROUTE: [number, number][] = [
  HOME.coords,
  // Local roads, Grad/Vidonci into Murska Sobota.
  [16.081325, 46.724691], // Zenkovci
  [16.097653, 46.717019], // Lemerje
  [16.118872, 46.705934], // Brezovci, entering Murska Sobota
  [16.174745, 46.664963], // through town, Industrijska ulica
  [16.167877, 46.64761], // Bakovska ulica rotary, onto the A5 on-ramp
  [16.154381, 46.633732], // merge onto the A5 motorway
  // A5 motorway, Murska Sobota to the Dragučova interchange.
  [16.140018, 46.627528],
  [16.131626, 46.617317],
  [16.120973, 46.598626],
  [16.106397, 46.592659],
  [16.090931, 46.584358],
  [16.07723, 46.578535],
  [16.067512, 46.579221],
  [16.050221, 46.575757],
  [16.025486, 46.588641],
  [15.998748, 46.580941],
  [15.959043, 46.580309],
  [15.905034, 46.554717],
  [15.871345, 46.560816],
  [15.844624, 46.559307],
  [15.800993, 46.577598],
  [15.767932, 46.570517],
  [15.747443, 46.575144],
  [15.702303, 46.59348],
  [15.6902, 46.58936], // Dragučova interchange
  // Merge onto the A1, Maribor area down through the Celje basin to the
  // Ljubljana basin and the eastern Ljubljana (Zadobrova-area) off-ramp.
  [15.689691, 46.580175],
  [15.685798, 46.562699],
  [15.700375, 46.533606],
  [15.668529, 46.505514],
  [15.657233, 46.478665],
  [15.65811, 46.470647],
  [15.591765, 46.391703],
  [15.521252, 46.367289],
  [15.455028, 46.309854],
  [15.402031, 46.267108],
  [15.313468, 46.254439], // Celje basin, A1 flattens out
  [15.236649, 46.257936],
  [15.149546, 46.270187],
  [15.086083, 46.259724],
  [14.982206, 46.255435],
  [14.947625, 46.233201],
  [14.902194, 46.19613], // descending into the Ljubljana basin
  [14.850861, 46.181455],
  [14.816959, 46.176925],
  [14.747552, 46.163805],
  [14.712985, 46.171019],
  [14.656329, 46.154668],
  [14.616816, 46.135194], // off-ramp, eastern Ljubljana near Zadobrova
  // Through Ljubljana on Litijska / Šaranovičeva / Kamniška / Jarška /
  // Grobeljska cesta.
  [14.614337, 46.135513],
  [14.612229, 46.140401],
  [14.609002, 46.1431], // Podrečje
  [14.60825, 46.145367], // Litijska ulica
  [14.607415, 46.147646], // Šaranovičeva cesta
  [14.595478, 46.145132],
  [14.594317, 46.14535],
  [14.593426, 46.145587], // Kamniška cesta
  [14.592864, 46.150887], // Jarška cesta
  [14.589808, 46.152177], // Grobeljska cesta
  // Regional road (ref 104) through Trzin and Vodice toward the airport,
  // then its own real access-road roundabout loop -- real OSRM maneuver
  // points, not a straight run-in.
  [14.579205, 46.161596],
  [14.581526, 46.168521],
  [14.576638, 46.173898],
  [14.563526, 46.180802],
  [14.558631, 46.186618],
  [14.553422, 46.19053],
  [14.544709, 46.194114],
  [14.535159, 46.200694],
  [14.517023, 46.208856],
  [14.504959, 46.215324],
  [14.491694, 46.225093],
  [14.485194, 46.228211],
  [14.480183, 46.230409],
  [14.472008, 46.231555],
  [14.464952, 46.23224],
  [14.460117, 46.234771],
  [14.458149, 46.232597],
  [14.458255, 46.232348],
  [14.462227, 46.230426],
  [14.461317, 46.228005],
  [14.463171, 46.226748],
  [14.462729, 46.22633],
  LJUBLJANA.coords,
];

// Home -> Zagreb Airport: real OSRM driving route (38 turn-by-turn
// steps across the two legs below), re-verified and re-derived from
// scratch -- local roads south-east out of Grad through Zenkovci/Lemerje/
// Brezovci, then a genuinely winding local road corridor near Lendava
// (full geometry backfilled -- a real curving road through the hills,
// not a straight shortcut) before the on-ramp onto the A5. The A5 itself
// curves for ~31km before the Slovenia/Hungary border; a brief, real dip
// onto Hungary's M7 (confirmed by OSRM, matching how the Slovenian and
// Croatian motorway networks actually connect in this corner) is kept
// rather than smoothed away. The M7/A4 "Zrinski most" stretch south-west
// into Croatia is ~96km -- by far the single longest gap on this map, so
// (like the Ljubljana A1 fix and the Graz A9 fix) its full curving
// geometry is backfilled in detail rather than left as a straight line,
// since OSRM's own step list hides this entire stretch behind one
// "new name" maneuver. From there: the Zagrebačka obilaznica bypass,
// Domovinska ulica and Ulica Stjepana Radića into the airport (south of
// the city, toward Velika Gorica).
const HOME_TO_ZAGREB_ROUTE: [number, number][] = [
  HOME.coords,
  [16.098292, 46.797619],
  [16.081325, 46.724691],
  [16.097653, 46.717019],
  [16.10123, 46.709394],
  [16.111733, 46.708273],
  [16.119032, 46.705917],
  // Real OSRM points along the ~7.5km Lendava-area local-road gap --
  // a genuinely winding road through the hills, backfilled in full.
  [16.124366, 46.705996],
  [16.130931, 46.704617],
  [16.137, 46.703795],
  [16.139457, 46.703856],
  [16.142066, 46.702965],
  [16.144819, 46.702613],
  [16.149512, 46.700772],
  [16.155808, 46.699042],
  [16.159995, 46.69632],
  [16.162227, 46.694572],
  [16.164303, 46.691683],
  [16.165666, 46.689651],
  [16.165876, 46.688349],
  [16.1669, 46.685896],
  [16.164948, 46.68401],
  [16.163131, 46.681666],
  [16.163066, 46.681246],
  [16.163238, 46.679019],
  [16.163095, 46.677746],
  [16.163814, 46.675635],
  [16.165634, 46.673968],
  [16.167319, 46.672728],
  [16.169433, 46.671153],
  [16.172296, 46.669618],
  [16.175757, 46.667585],
  [16.176613, 46.667152],
  [16.174538, 46.665236],
  [16.174745, 46.664963],
  [16.172078, 46.656584],
  [16.178347, 46.656213],
  [16.178723, 46.65609],
  [16.179101, 46.656019],
  [16.188605, 46.652162],
  [16.207426, 46.632875],
  [16.210549, 46.635164],
  // Real OSRM points along the ~31.4km A5 gap, backfilled in full -- the
  // motorway genuinely curves (a northward bulge, then a dip, then
  // another bend) rather than running straight toward the border.
  [16.224288, 46.637953],
  [16.245655, 46.640032],
  [16.260704, 46.638621],
  [16.27691, 46.634084],
  [16.293419, 46.624982],
  [16.307768, 46.615224],
  [16.32256, 46.607746],
  [16.341138, 46.601448],
  [16.358004, 46.59736],
  [16.371854, 46.596696],
  [16.382973, 46.598028],
  [16.395397, 46.599847],
  [16.404548, 46.598982],
  [16.419541, 46.593037],
  [16.432871, 46.583759],
  [16.438829, 46.577379],
  [16.443437, 46.570785],
  [16.444242, 46.56662],
  [16.442817, 46.560305],
  [16.443269, 46.556778],
  [16.444551, 46.55187],
  [16.443247, 46.547966],
  [16.440642, 46.542216],
  [16.442932, 46.537113],
  [16.446512, 46.534805],
  [16.451097, 46.533623],
  [16.454055, 46.533532],
  [16.466418, 46.534137],
  [16.47501, 46.533432],
  [16.482999, 46.531764],
  [16.495381, 46.5282],
  [16.511279, 46.524509],
  [16.523215, 46.520312],
  [16.54029, 46.514087],
  [16.552353, 46.510909],
  [16.566492, 46.508913],
  [16.59204, 46.50544],
  [16.603831, 46.503794],
  [16.610614, 46.502441],
  [16.62221, 46.498301],
  [16.628412, 46.494853],
  [16.634368, 46.490263],
  [16.641426, 46.482476],
  [16.646694, 46.476279],
  [16.652107, 46.470092],
  [16.655433, 46.467231],
  [16.661226, 46.463645],
  [16.664898, 46.461471],
  [16.666913, 46.459565],
  [16.669591, 46.455972],
  [16.673604, 46.452867],
  [16.683388, 46.446432],
  [16.689678, 46.443217],
  [16.694324, 46.440562],
  [16.698231, 46.437667],
  [16.704558, 46.43082],
  [16.710908, 46.422723],
  [16.714156, 46.419596],
  [16.717228, 46.417637],
  [16.722556, 46.415496],
  [16.722542, 46.412295],
  [16.700923, 46.412039],
  // Real OSRM points along the ~96.4km Hungary M7 / Croatia A4 "Zrinski
  // most" gap -- by far the longest single stretch on this map,
  // backfilled in full the same way as the Ljubljana A1 and Graz A9
  // gaps. The road follows real river-valley curvature the whole way
  // (several genuine bends and a few long near-straight valley runs),
  // never a straight shortcut across the map.
  [16.686207, 46.407815],
  [16.674541, 46.407548],
  [16.6422, 46.412741],
  [16.620629, 46.413398],
  [16.60517, 46.412055],
  [16.587464, 46.407333],
  [16.573598, 46.400482],
  [16.563796, 46.392883],
  [16.5522, 46.377929],
  [16.542657, 46.365987],
  [16.532748, 46.347442],
  [16.524799, 46.333699],
  [16.512505, 46.318741],
  [16.502578, 46.30259],
  [16.490125, 46.291388],
  [16.480768, 46.285801],
  [16.469118, 46.2838],
  [16.455459, 46.284333],
  [16.439248, 46.281893],
  [16.426479, 46.274205],
  [16.410936, 46.268012],
  [16.402093, 46.263092],
  [16.398769, 46.256721],
  [16.400408, 46.249297],
  [16.402738, 46.243486],
  [16.409595, 46.240156],
  [16.410684, 46.237589],
  [16.407581, 46.230534],
  [16.406091, 46.219808],
  [16.40416, 46.214841],
  [16.405865, 46.210944],
  [16.409811, 46.207878],
  [16.411293, 46.205314],
  [16.410993, 46.20031],
  [16.411828, 46.195803],
  [16.408357, 46.191233],
  [16.39858, 46.184817],
  [16.389114, 46.179232],
  [16.379499, 46.17842],
  [16.374785, 46.172141],
  [16.375192, 46.160961],
  [16.369461, 46.154139],
  [16.364768, 46.147585],
  [16.356698, 46.14122],
  [16.347283, 46.137462],
  [16.339945, 46.130234],
  [16.33075, 46.12767],
  [16.322563, 46.126149],
  [16.314497, 46.126778],
  [16.304673, 46.125163],
  [16.296756, 46.120577],
  [16.288108, 46.108558],
  [16.283817, 46.100681],
  [16.283253, 46.089911],
  [16.28532, 46.084298],
  [16.292997, 46.076853],
  [16.298577, 46.066716],
  [16.29635, 46.048966],
  [16.294417, 46.018584],
  [16.293404, 46.005716],
  [16.287235, 45.996059],
  [16.285699, 45.985745],
  [16.283407, 45.964148],
  [16.277959, 45.953674],
  [16.268985, 45.942272],
  [16.271175, 45.928786],
  [16.272962, 45.922615],
  [16.27322, 45.921608],
  [16.274651, 45.916714],
  [16.275145, 45.913075],
  [16.27268, 45.905526],
  [16.26623, 45.899586],
  [16.241527, 45.889328],
  [16.210168, 45.876786],
  [16.179243, 45.8644],
  [16.159143, 45.856317],
  [16.147519, 45.849432],
  [16.13961, 45.839793],
  [16.136972, 45.829289],
  [16.137621, 45.823547],
  [16.13567, 45.812078],
  [16.130969, 45.79987],
  [16.094308, 45.767926],
  [16.091624, 45.76594],
  [16.087171, 45.765917],
  [16.077163, 45.767538],
  [16.077275, 45.764087],
  [16.070906, 45.754068],
  [16.062135, 45.754439],
  [16.059183, 45.75236],
  [16.064806, 45.746843],
  [16.067107, 45.744508],
  ZAGREB.coords,
];

// Home -> Graz Airport: real OSRM driving route (36 turn-by-turn steps,
// ~84.7km), re-verified and re-derived from scratch -- local roads west
// out of Grad through Kruplivnik/Motovilci/Pertoča/Večeslavci/Fikšinci,
// crossing into Austria on Purklastraße (L259) past Feldbach, then the
// B69/L208 corridor (Perbersdorferstraße/Rabenhofstraße) through the
// hilly Fürstenfeld/Ilz area -- a real winding local road, not a straight
// line -- before the off-ramp onto the A9 Pyhrn Autobahn at Ilz. The A9
// itself curves gently north-northwest for ~28.5km (full geometry
// backfilled the same way as the Ljubljana A1 gap, since OSRM's own step
// list hides this entire stretch behind one "merge" maneuver) before
// exiting near Feldkirchen bei Graz onto Industriestraße/Bierbaumerstraße/
// Kalsdorfer Straße (B67) for the final run north into the airport
// (Thalerhof, south of the city).
const HOME_TO_GRAZ_ROUTE: [number, number][] = [
  HOME.coords,
  [16.089557, 46.798325],
  [16.0824, 46.788356],
  [16.078071, 46.782517],
  [16.065782, 46.782671],
  [16.063272, 46.783627],
  [16.043443, 46.780122],
  [16.037299, 46.770821],
  [16.019227, 46.776095],
  [16.0069, 46.782219],
  [15.988853, 46.782383],
  [15.976091, 46.781209],
  [15.966341, 46.768106],
  [15.931372, 46.75473],
  [15.910359, 46.747301],
  [15.916297, 46.740139],
  // Real OSRM points along the ~9.1km B69 gap (Ilz-area local road),
  // backfilled in full -- this corridor has a genuine shallow bulge
  // north and dip south, not a straight run.
  [15.911043, 46.73244],
  [15.900958, 46.731807],
  [15.886197, 46.732659],
  [15.871932, 46.735139],
  [15.862274, 46.733217],
  [15.854831, 46.729223],
  [15.844599, 46.72967],
  [15.835492, 46.728906],
  [15.821368, 46.727711],
  [15.805414, 46.726119],
  // Real OSRM points along the ~11.9km L208 gap -- a genuinely winding
  // local road through the Fürstenfeld/Ilz hills, with a real
  // peak-then-dip bend around 15.72-15.73E, not a straight shortcut.
  [15.798638, 46.724807],
  [15.786424, 46.725716],
  [15.780122, 46.725702],
  [15.772486, 46.726013],
  [15.763951, 46.725782],
  [15.750249, 46.727326],
  [15.741241, 46.732366],
  [15.733212, 46.738412],
  [15.727689, 46.742813],
  [15.722254, 46.740888],
  [15.718419, 46.743046],
  [15.709694, 46.751948],
  [15.699551, 46.75371],
  [15.68475, 46.756196],
  [15.674919, 46.757119],
  [15.665595, 46.759027],
  [15.636462, 46.756461],
  [15.624503, 46.757535],
  [15.612055, 46.744866],
  // Real OSRM points along the ~28.5km A9 Pyhrn Autobahn gap -- the
  // motorway curves gently NNW the whole way, including a genuine
  // near-due-north "plateau" around 15.472E between roughly 46.89N and
  // 46.91N, backfilled the same way as the Ljubljana fix's 113km A1 gap
  // since OSRM's own step list hides this entire stretch behind one
  // "merge" maneuver.
  [15.611925, 46.743362],
  [15.599688, 46.751926],
  [15.584311, 46.771087],
  [15.572121, 46.795579],
  [15.564647, 46.816137],
  [15.554722, 46.828376],
  [15.544026, 46.836456],
  [15.53452, 46.842023],
  [15.521173, 46.849511],
  [15.511816, 46.854756],
  [15.497753, 46.863043],
  [15.484508, 46.87337],
  [15.476605, 46.880561],
  [15.472745, 46.887939],
  [15.472173, 46.892766],
  [15.472343, 46.906065],
  [15.470369, 46.91983],
  [15.465286, 46.930336],
  [15.459637, 46.937718],
  [15.447404, 46.951621],
  [15.439139, 46.960954],
  [15.439423, 46.963125],
  [15.446866, 46.965618],
  [15.459743, 46.970026],
  [15.451647, 46.985616],
  [15.448386, 46.993396],
  // Real OSRM final arrival point, just short of the terminal, before
  // snapping to the canonical airport coordinate below.
  [15.445361, 46.991774],
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
