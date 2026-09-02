// Small geometry helpers for the journey map. Kept dependency-free (no
// turf) since a gentle, good-looking curve and an approximate bearing are
// all this decorative scroll animation needs — not survey-grade geodesy.

export function bezierPoint(
  a: [number, number],
  b: [number, number],
  curve: number,
  t: number
): [number, number] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const cx = mx + px * len * curve;
  const cy = my + py * len * curve;
  const u = 1 - t;
  const x = u * u * a[0] + 2 * u * t * cx + t * t * b[0];
  const y = u * u * a[1] + 2 * u * t * cy + t * t * b[1];
  return [x, y];
}

export function bearing(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const phi1 = toRad(a[1]);
  const phi2 = toRad(b[1]);
  const deltaLambda = toRad(b[0] - a[0]);
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x >= edge0 ? 1 : 0;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
