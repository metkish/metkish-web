// Vehicle icon path data for the social/Reel map renderer
// (components/social/SocialMapScene.tsx).
//
// These are copied verbatim from components/journey/JourneyMapScene.tsx
// (the approved, live website map — PLANE_PATH / CAR_BODY_PATH /
// CAR_ROOF / CAR_WHEEL_HINTS / VEHICLE_STROKE / MUTED_BACKGROUND), NOT
// re-derived. They are duplicated into this isolated file rather than
// imported, because JourneyMapScene.tsx does not export them and this
// build must not modify that file — see the standing rule for all
// components/social/* files: reuse the production visual language
// exactly, but never touch the production map component itself.
export const MUTED_BACKGROUND = '#f6f1e6';
export const MUTED_LAND = '#efe8d8';
export const MUTED_LINE = '#ddd0b8';
export const ROUTE_PINK = '#e8639f';
export const VEHICLE_STROKE = '#7a3348';

export const PLANE_PATH =
  'M 20.7,11.3 Q 22,11.5 22,12 Q 22,12.5 20.7,12.7 L 18.5,12.9 L 12.5,12.8 L 8.8,16.9 Q 8.4,17.2 8,16.95 L 7.85,12.9 L 5.7,12.78 L 4.3,13.65 Q 3.9,13.8 3.65,13.45 L 4.35,12.58 L 2,12.38 L 2,11.62 L 4.35,11.42 L 3.65,10.55 Q 3.9,10.2 4.3,10.35 L 5.7,11.22 L 7.85,11.1 L 8,7.05 Q 8.4,6.8 8.8,7.1 L 12.5,11.2 L 18.5,11.1 Z';
export const CAR_BODY_PATH =
  'M 15.2,9 Q 17.8,9.2 17.8,12 Q 17.8,14.8 15.2,15 L 7.8,15 Q 6.2,14.9 6.2,13.8 L 6.2,10.2 Q 6.2,9.1 7.8,9 Z';
export const CAR_ROOF = { x: 9.4, y: 9.8, width: 5.6, height: 4.4, rx: 1.3 };
export const CAR_WHEEL_HINTS: [number, number][] = [
  [14.2, 9.1],
  [14.2, 14.9],
  [8.6, 9.1],
  [8.6, 14.9],
];
