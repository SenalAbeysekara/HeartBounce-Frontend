export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export function circleRect(cx, cy, r, rx, ry, rw, rh) {
  const px = clamp(cx, rx, rx + rw);
  const py = clamp(cy, ry, ry + rh);
  const dx = cx - px;
  const dy = cy - py;
  return dx * dx + dy * dy <= r * r;
}