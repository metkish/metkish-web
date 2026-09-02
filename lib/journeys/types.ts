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
  /** How much the route line bows away from a straight line, roughly -1..1. */
  curve?: number;
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
}
