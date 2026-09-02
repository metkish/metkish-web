// Static, hand-simplified land shapes for the journey map background.
// These are deliberately abstracted — soft, low-detail suggestions of
// landmass rather than an attempt at an accurate coastline — because a
// hand-authored "accurate" coastline risks looking subtly wrong, while an
// impressionistic shape reads as intentional editorial illustration. Real
// coordinates are used only as loose reference points so relative
// position/scale stays believable; no source data, no map tiles.
//
// Each entry is a closed ring of [lng, lat] points, rendered as one soft
// blob via geo.ts's smoothClosedPath(). Points are deliberately coarse.

export const CENTRAL_EUROPE_LAND: [number, number][] = [
  [8.7, 49.2],
  [11.5, 50.6],
  [15, 50.8],
  [18.8, 49.8],
  [19.6, 47.6],
  [17.6, 45.6],
  [15.2, 44.9],
  [12.9, 45.5],
  [10.4, 46.0],
  [8.6, 47.2],
];

export const WEST_EUROPE_LAND: [number, number][] = [
  [-9.6, 43.2],
  [-7.8, 46.1],
  [-4.5, 47.9],
  [-1, 49.2],
  [2.6, 50.4],
  [6.8, 49],
  [8.7, 46.3],
  [7.2, 43.9],
  [3, 42.9],
  [-1.5, 41.2],
  [-5.8, 36.2],
  [-8.9, 37],
  [-9.6, 39.5],
];

export const NW_AFRICA_LAND: [number, number][] = [
  [-9.4, 35.9],
  [-5.4, 35.8],
  [-1.2, 35.2],
  [2.8, 36.6],
  [3.2, 33.6],
  [-1, 31.2],
  [-5.2, 29.2],
  [-8.7, 27.8],
  [-10.1, 30.6],
  [-9.9, 33.6],
];

// A believable, gently irregular silhouette of Tenerife — Anaga's narrow
// arm to the northeast, Teno's point to the northwest, tapering to the
// touristic south coast (where the airport and Playa Paraiso sit). Not
// surveyed, but the right shape and orientation at a glance.
export const TENERIFE_ISLAND: [number, number][] = [
  [-16.15, 28.57],
  [-16.28, 28.58],
  [-16.42, 28.55],
  [-16.58, 28.51],
  [-16.72, 28.43],
  [-16.85, 28.38],
  [-16.93, 28.34],
  [-16.88, 28.27],
  [-16.82, 28.19],
  [-16.79, 28.11],
  [-16.74, 28.06],
  [-16.63, 28.02],
  [-16.5, 28.02],
  [-16.38, 28.05],
  [-16.27, 28.11],
  [-16.19, 28.2],
  [-16.14, 28.32],
  [-16.12, 28.45],
];

// The other Canary Islands, kept as faint, small, unlabeled context shapes
// so Tenerife doesn't read as an isolated dot once the camera is close.
export const CANARY_NEIGHBOURS: [number, number][][] = [
  // Gran Canaria (southeast of Tenerife)
  [
    [-15.42, 28.18],
    [-15.5, 28.1],
    [-15.62, 27.98],
    [-15.66, 27.84],
    [-15.58, 27.74],
    [-15.44, 27.73],
    [-15.35, 27.85],
    [-15.34, 28.02],
  ],
  // La Gomera (west of Tenerife)
  [
    [-17.18, 28.14],
    [-17.24, 28.1],
    [-17.29, 28.03],
    [-17.24, 27.98],
    [-17.15, 27.99],
    [-17.1, 28.08],
  ],
];
