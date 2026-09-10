// Generic data model for the scroll-driven "journey" map experience used on
// destination pages (see components/journey/JourneyMapScene.tsx). Route
// data lives here, per destination, completely separate from the map
// rendering / GSAP animation logic — so a future destination (Iceland,
// Italy, Sardinia, Vietnam, Maldives, ...) only needs a new file like
// lib/journeys/tenerife.ts, never a change to the map engine itself.

export type JourneyMode = 'car' | 'plane' | 'boat' | 'ferry' | 'transfer' | 'train';

export interface JourneyPoint {
  /** Stable id, used as a React key and for marker bookkeeping. */
  id: string;
  name: string;
  /** Only shown on the map itself when `showMapLabel` is true — kept rare
   * on purpose, since the map should carry almost no text. Most place
   * names are told through the scroll narrative instead. */
  sublabel?: string;
  /** [longitude, latitude]. */
  coords: [number, number];
  showMapLabel?: boolean;
  /** Which side of the marker dot the text label grows from. Every point
   * on every existing map leaves this unset, which keeps the original,
   * only-ever behaviour: text sits to the right of the dot (flipping left
   * only when close to a narrow frame's right edge — see
   * JourneyMapScene's LABEL_FLIP_MARGIN_PX). Set to 'above' only for a
   * point whose incoming route approaches from the side at a shallow
   * angle, so the default rightward text would sit on top of the route
   * line at some viewport width — see the Loro Parque point in
   * lib/journeys/tenerife.ts for the worked case (its final approach runs
   * almost due east into the marker, so a right-side label overlapped the
   * line on every mobile width, 320-414px, while sitting clear on desktop's
   * wider frame). The dot's own position never changes either way. */
  labelPlacement?: 'right' | 'above';
}

export interface JourneyCamera {
  /** [longitude, latitude] the view is centered on. */
  center: [number, number];
  /** Width of the view, in degrees of longitude — smaller is more zoomed
   * in (a close regional view), larger is more zoomed out (a continental
   * pull-back). Height is derived from the map's on-screen aspect ratio at
   * render time, so the same camera reframes intelligently on a narrow
   * mobile screen rather than just shrinking. */
  spanDeg: number;
}

export interface JourneyLeg {
  id: string;
  mode: JourneyMode;
  from: JourneyPoint;
  to: JourneyPoint;
  /** Camera the map eases/flies to once this leg becomes active. */
  camera: JourneyCamera;
  /** How much the route line bows away from a straight line, roughly -1..1.
   * Ignored once `route` (below) is supplied — the real waypoints and
   * routeCurvePoint() take over entirely. */
  curve?: number;
  /** A real, independently-verified sequence of [lng, lat] waypoints for
   * this leg's route (e.g. researched from OpenStreetMap-based routing
   * data such as OSRM, then simplified) — never hand-drawn or estimated.
   * When present, this replaces the decorative `curve` bow with a smooth
   * curve through the real points (see routeCurvePoint in
   * components/journey/geo.ts), and the vehicle travels/rotates along
   * that same curve. Endpoints should match `from.coords`/`to.coords`
   * exactly; interior points are real road-network coordinates, thinned
   * to the minimum that still preserves the route's real shape.
   *
   * Standing rule for this system: a leg only gets a `route` once its
   * geography has actually been verified online — never estimated or
   * nudged by eye. See `routeLand` below for a route that also needs to
   * be kept off a coastline. */
  route?: [number, number][];
  /** One or more real land polygons — SVG path strings from
   * components/journey/generated/geography.ts, already in this map's
   * projected space — that `route`'s drawn curve must never leave. Set
   * this for any real route that runs close enough to a coastline that a
   * smooth curve through the waypoints could otherwise bulge into open
   * water at a sharp turn (this happened during the Tenerife build, at a
   * tight roundabout — see routeCurvePoint's doc comment). Omit for an
   * inland leg with no such risk. */
  routeLand?: string[];
  /** How much of the scene's total scroll distance this leg takes up,
   * relative to the other legs (weights are normalized automatically). */
  weight?: number;
  /** Camera movement style when this leg starts. 'fly' suits a big jump in
   * distance/zoom (e.g. a flight); 'ease' suits a short, local move. */
  transition?: 'ease' | 'fly';
  /** Set to false for a "hold" leg used purely to trigger a camera move
   * (e.g. zooming into an island on arrival) — no route line is drawn and
   * the vehicle marker doesn't move. */
  showRoute?: boolean;
}

export interface Journey {
  id: string;
  initialCamera: JourneyCamera;
  legs: JourneyLeg[];
  /** Optional extra land-fill shapes, layered on top of the base coastline
   * (components/journey/generated/geography.ts's CANARY_PATHS etc.) for
   * this journey's map only — already-projected SVG path strings, same
   * format as CANARY_PATHS. Every other journey leaves this unset and
   * renders exactly as before.
   *
   * Exists for one narrow case: the shared coastline data is a real but
   * simplified outline, and at certain small, real headlands/inlets its
   * few available points cut straight across a stretch where the actual
   * coast (and a real, verified route waypoint sitting on it) bulges out
   * further. Rather than editing the shared coastline — which every map on
   * the page renders from — a journey can patch in a small supplemental
   * shape covering just that gap, sourced the same way the base coastline
   * was (real geographic data, never hand-drawn), so only this map's
   * affected stretch changes. See TENERIFE_ROCA_TO_LOS_GIGANTES_JOURNEY in
   * lib/journeys/tenerife.ts for the worked example and full disclosure. */
  extraLandPatches?: string[];
  /** The new coastline edge each entry in extraLandPatches actually adds —
   * an open (unclosed), already-projected SVG path string tracing just the
   * new real points, stroked but unfilled. Kept separate from
   * extraLandPatches (which is fill-only) because a patch's own closing
   * edge deliberately retraces existing coastline vertices; stroking the
   * whole patch shape would double-draw that shared edge. */
  extraCoastlineStrokes?: string[];
}
