// Route data for the Italy road-trip page, kept in its own file per the
// site's convention (see lib/journeys/tenerife.ts) even though this isn't
// a Journey/JourneyLeg from lib/journeys/types.ts — the Italy opening map
// doesn't use the JourneyMapScene engine (real lng/lat, projected
// coastline) at all. It renders a supplied reference screenshot directly
// (see components/journey/TracedRouteMap) and animates a line traced over
// that image's own pixels, per an explicit, deliberate instruction: the
// route shown in the screenshot is the source of truth for this leg, not
// a routing-API lookup, and the map itself may be swapped for a different
// supplied asset later. If a future step upgrades this leg to a real
// verified JourneyMapScene route, this file is where that Journey export
// would live instead.
//
// HOME_TO_MILANO_ROUTE_IMAGE is the reference map exactly as supplied,
// saved unmodified. HOME_TO_MILANO_TRACED_PATH is that image's own
// highlighted route line (the "7h38min" selected option, not either paler
// alternate), traced pixel-by-pixel: the highlighted line's distinct
// colour (~rgb(16,120,220), clearly darker/more saturated than the two
// alternates' pale blue) was isolated programmatically, then its pixels
// were ordered start-to-end with a minimum-spanning-tree walk (robust to
// the line's uneven pixel density) and lightly simplified — never
// hand-guessed from eyeballing the screenshot. Verified by re-plotting the
// traced points back over the source image and confirming the line lands
// exactly on the visible highlighted route the whole way, with no drift
// onto either alternate. Coordinates are in the image's own pixel space
// (top-left origin, matching HOME_TO_MILANO_ROUTE_IMAGE_WIDTH/HEIGHT) —
// not geographic coordinates.
export const HOME_TO_MILANO_ROUTE_IMAGE = '/2026-05%20-%20Italy%20roadtrip/home-to-milano-route-reference.jpg';
export const HOME_TO_MILANO_ROUTE_IMAGE_WIDTH = 1234;
export const HOME_TO_MILANO_ROUTE_IMAGE_HEIGHT = 520;

export const HOME_TO_MILANO_TRACED_PATH: { x: number; y: number }[] = [
  { x: 1043, y: 58 },
  { x: 1050, y: 52 },
  { x: 1055, y: 67 },
  { x: 1047, y: 101 },
  { x: 994, y: 104 },
  { x: 954, y: 162 },
  { x: 897, y: 163 },
  { x: 878, y: 181 },
  { x: 850, y: 183 },
  { x: 841, y: 209 },
  { x: 807, y: 214 },
  { x: 797, y: 237 },
  { x: 804, y: 249 },
  { x: 794, y: 260 },
  { x: 767, y: 256 },
  { x: 752, y: 240 },
  { x: 718, y: 228 },
  { x: 683, y: 241 },
  { x: 667, y: 233 },
  { x: 656, y: 243 },
  { x: 598, y: 256 },
  { x: 516, y: 319 },
  { x: 490, y: 327 },
  { x: 441, y: 305 },
  { x: 394, y: 328 },
  { x: 361, y: 331 },
  { x: 344, y: 321 },
  { x: 286, y: 319 },
  { x: 245, y: 303 },
  { x: 192, y: 313 },
  { x: 160, y: 307 },
  { x: 133, y: 319 },
  { x: 122, y: 310 },
];
