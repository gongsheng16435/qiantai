import type Phaser from "phaser";
import type { BossVisual, FighterVisual } from "./types";

type Graphics = Phaser.GameObjects.Graphics;
type Point = { x: number; y: number };
const INK = 0x131516;
const COAL = 0x262827;
const SHADE = 0x3d3f3d;
const SILVER = 0xcec7b8;
const IVORY = 0xeee7d7;
const COPPER = 0x9c6850;

// These are original, hand-drawn contours. Curves are sampled once and cached;
// the game only submits their light and shadow shapes on subsequent frames.
const contours = new Map<string, Point[]>();
function contour(d: string): Point[] {
  const cached = contours.get(d);
  if (cached) return cached;
  const tokens = d.match(/[MLCQZ]|-?\d*\.?\d+/g) || [];
  let i = 0;
  let x = 0;
  let y = 0;
  const out: Point[] = [];
  const number = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const op = tokens[i++];
    if (op === "M" || op === "L") {
      x = number();
      y = number();
      out.push({ x, y });
    } else if (op === "Q") {
      const x0 = x,
        y0 = y,
        cx = number(),
        cy = number(),
        ex = number(),
        ey = number();
      for (let n = 1; n <= 9; n++) {
        const t = n / 9,
          a = 1 - t;
        out.push({
          x: a * a * x0 + 2 * a * t * cx + t * t * ex,
          y: a * a * y0 + 2 * a * t * cy + t * t * ey,
        });
      }
      x = ex;
      y = ey;
    } else if (op === "C") {
      const x0 = x,
        y0 = y,
        x1 = number(),
        y1 = number(),
        x2 = number(),
        y2 = number(),
        ex = number(),
        ey = number();
      for (let n = 1; n <= 12; n++) {
        const t = n / 12,
          a = 1 - t;
        out.push({
          x:
            a * a * a * x0 +
            3 * a * a * t * x1 +
            3 * a * t * t * x2 +
            t * t * t * ex,
          y:
            a * a * a * y0 +
            3 * a * a * t * y1 +
            3 * a * t * t * y2 +
            t * t * t * ey,
        });
      }
      x = ex;
      y = ey;
    }
  }
  contours.set(d, out);
  return out;
}

function shape(
  g: Graphics,
  d: string,
  fill: number,
  edge = SILVER,
  edgeAlpha = 0.38,
  width = 0.85,
  x = 0,
  y = 0,
  alpha = 1,
) {
  const points = contour(d);
  const shifted =
    x || y ? points.map((p) => ({ x: p.x + x, y: p.y + y })) : points;
  g.fillStyle(fill, alpha).fillPoints(shifted, true);
  if (edgeAlpha)
    g.lineStyle(width, edge, edgeAlpha * alpha).strokePoints(shifted, true);
}

function stroke(
  g: Graphics,
  d: string,
  color = SILVER,
  alpha = 0.4,
  width = 0.7,
  x = 0,
  y = 0,
) {
  const points = contour(d);
  g.lineStyle(width, color, alpha).strokePoints(
    x || y ? points.map((p) => ({ x: p.x + x, y: p.y + y })) : points,
    false,
  );
}

function segment(
  g: Graphics,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  color = SILVER,
  alpha = 0.4,
  width = 0.7,
) {
  g.lineStyle(width, color, alpha).lineBetween(ax, ay, bx, by);
}

// Tapered, gently bowed bone. Broad irregular silhouettes and one-sided light
// make the limbs feel carved, rather than a bundle of uniform outline strokes.
function limb(
  g: Graphics,
  start: Point,
  control: Point,
  end: Point,
  width: number,
  light: number,
  dim = false,
) {
  const left: Point[] = [],
    right: Point[] = [],
    centers: Point[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12,
      a = 1 - t;
    const x = a * a * start.x + 2 * a * t * control.x + t * t * end.x;
    const y = a * a * start.y + 2 * a * t * control.y + t * t * end.y;
    const dx = 2 * a * (control.x - start.x) + 2 * t * (end.x - control.x);
    const dy = 2 * a * (control.y - start.y) + 2 * t * (end.y - control.y);
    const len = Math.hypot(dx, dy) || 1;
    const w =
      width *
      (0.35 + 0.16 * Math.cos(t * Math.PI * 2) + 0.025 * Math.sin(t * 15));
    left.push({ x: x - (dy / len) * w, y: y + (dx / len) * w });
    right.push({ x: x + (dy / len) * w, y: y - (dx / len) * w });
    centers.push({
      x: x - (dy / len) * w * 0.22,
      y: y + (dx / len) * w * 0.22,
    });
  }
  g.fillStyle(dim ? 0x4e4e48 : 0x727164).fillPoints(
    [...left, ...right.slice().reverse()],
    true,
  );
  g.lineStyle(0.85, light, dim ? 0.35 : 0.78).strokePoints(left, false);
  g.lineStyle(0.75, INK, 0.95).strokePoints(right, false);
  g.lineStyle(width * 0.18, INK, 0.25).strokePoints(centers, false);
  for (let i = 2; i < 11; i += 2) {
    const p = left[i],
      q = centers[Math.min(12, i + 1)];
    segment(g, p.x, p.y, q.x, q.y, light, dim ? 0.12 : 0.2, 0.6);
  }
}

function claw(
  g: Graphics,
  x: number,
  y: number,
  curl: number,
  light: number,
  dim = false,
) {
  shape(
    g,
    "M-8 -6 Q-2 -14 6 -8 L12 1 Q10 11 2 14 L-6 9 Q-10 2 -8 -6Z",
    dim ? SHADE : 0x747061,
    light,
    dim ? 0.3 : 0.6,
    0.8,
    x,
    y,
  );
  for (let i = 0; i < 4; i++) {
    const sx = x - 5 + i * 5,
      sy = y + 7 + i * 1.2;
    const ex = sx + 5 + i * 3 + curl,
      ey = sy + 27 - i * 2;
    limb(
      g,
      { x: sx, y: sy },
      { x: sx + 15 + curl, y: sy + 13 },
      { x: ex, y: ey },
      3.9 - i * 0.4,
      light,
      dim,
    );
    segment(g, ex, ey, ex - 3, ey + 5, light, dim ? 0.3 : 0.7, 0.7);
  }
  limb(
    g,
    { x: x - 7, y },
    { x: x - 21, y: y + 8 },
    { x: x - 13, y: y + 20 },
    4.7,
    light,
    dim,
  );
}

export function drawHunter(
  g: Graphics,
  p: FighterVisual,
  time: number,
  reduced: boolean,
) {
  const facing = Math.cos(p.facing) >= 0 ? 1 : -1;
  const moving = p.action === "move",
    dodging = p.action === "dodge",
    striking = p.action === "attack",
    parrying = p.action === "parry";
  const step = moving ? Math.sin(time * 12) : 0;
  const breath = reduced
    ? 0
    : moving
      ? Math.abs(step) * 1.4
      : Math.sin(time * 2.1) * 0.6;
  const cloth = reduced ? 0 : Math.sin(time * 3.3) * 1.4 + step * 2.1;
  const hit = striking
    ? Math.sin(Math.min(1, p.actionTime / 0.34) * Math.PI)
    : 0;
  const light = p.action === "hurt" ? 0xe8b8a2 : IVORY;
  g.clear()
    .setPosition(p.x, p.y + breath)
    .setScale(facing, 1)
    .setDepth(100 + p.y);
  g.setRotation(
    p.action === "dead" ? -1.32 : dodging ? 0.28 : striking ? -0.04 : 0,
  ).setAlpha(p.action === "dead" ? 0.62 : 1);

  if (dodging && !reduced) {
    for (let i = 3; i > 0; i--) {
      shape(
        g,
        "M-10 -61 Q2 -67 10 -53 L10 -31 Q8 -20 18 -10 L0 -17 L-15 -10 Q-10 -36 -14 -46Z",
        SILVER,
        SILVER,
        0,
        0,
        -i * 15,
        i * 2,
        0.035 + (3 - i) * 0.025,
      );
      segment(
        g,
        -i * 15 - 13,
        -46 + i * 2,
        -i * 15 - 31,
        -40 + i * 2,
        SILVER,
        0.13 / i,
      );
    }
  }

  // Heavy boots, curved knees and small bright buckles underneath the coat.
  shape(
    g,
    "M-11 -25 Q-5 -27 -2 -22 L-5 -12 L-7 -4 Q-3 -2 -3 1 L-15 1 Q-17 -2 -12 -7 L-13 -15Z",
    INK,
    light,
    0.39,
    0.75,
    -step * 5,
  );
  stroke(g, "M-10 -23 Q-6 -19 -9 -11 L-10 -5", light, 0.37, 0.8, -step * 5);
  shape(
    g,
    "M1 -27 Q8 -28 10 -23 L9 -11 L11 -4 Q19 -2 18 1 L5 1 Q2 -2 4 -7 L1 -16Z",
    0x2e302d,
    light,
    0.57,
    0.75,
    step * 5,
  );
  stroke(g, "M7 -21 Q5 -14 7 -7 M6 -8 L10 -8", light, 0.49, 0.75, step * 5);

  // An asymmetric travelling coat, rendered with shadow fields first.
  shape(
    g,
    "M-8 -61 Q-16 -59 -18 -49 Q-15 -37 -17 -27 Q-18 -19 -24 -12 L-17 -13 L-20 -6 Q-10 -8 -4 -15 L2 -22 Q6 -14 17 -8 L13 -19 Q20 -12 22 -14 Q15 -33 14 -44 Q12 -57 4 -62Z",
    COAL,
    light,
    0.44,
    0.85,
  );
  shape(
    g,
    "M-9 -58 Q-14 -51 -11 -41 L-11 -27 Q-14 -18 -18 -12 L-9 -18 Q-5 -27 -6 -36 L-3 -51Z",
    0x5b5c52,
    light,
    0.12,
    0.55,
  );
  shape(
    g,
    "M2 -54 Q11 -53 10 -41 Q6 -30 14 -15 L7 -21 L-1 -40Z",
    0x494a43,
    light,
    0.17,
    0.55,
  );
  shape(
    g,
    "M-11 -40 Q-4 -35 9 -37 L9 -33 Q-5 -31 -12 -36Z",
    INK,
    light,
    0.18,
    0.55,
  );
  shape(g, "M1 -37 L5 -37 L5 -33 L1 -33Z", 0x897e61, light, 0.47, 0.5);
  stroke(
    g,
    "M-9 -48 Q-5 -38 -8 -27 Q-9 -21 -13 -16 M4 -46 Q2 -32 9 -22",
    light,
    0.36,
    0.72,
  );
  stroke(
    g,
    "M-15 -30 Q-16 -19 -20 -13 M11 -29 Q11 -19 17 -14",
    light,
    0.19,
    0.55,
  );
  for (let i = 0; i < 7; i++)
    segment(
      g,
      -12 + i * 2.6,
      -28 + (i % 2) * 2,
      -14 + i * 2.6,
      -22 + (i % 2) * 2,
      light,
      0.12,
      0.52,
    );

  // Folded shoulder cape and pale wind-torn scarf remain legible at 80 pixels.
  shape(
    g,
    "M-8 -62 Q-19 -61 -23 -48 Q-11 -48 -6 -52 L0 -50 L14 -52 Q8 -63 2 -64Z",
    0x494a44,
    light,
    0.52,
    0.8,
  );
  stroke(
    g,
    "M-17 -55 Q-12 -53 -8 -56 M-18 -53 Q-14 -51 -12 -53 M5 -59 L9 -55",
    light,
    0.25,
    0.6,
  );
  shape(
    g,
    "M-6 -64 Q-10 -60 -19 -60 Q-25 -60 -29 -65 Q-25 -55 -18 -56 Q-24 -51 -32 -54 L-27 -49 Q-15 -48 -7 -57 L1 -61Z",
    0x898779,
    light,
    0.22,
    0.6,
    cloth,
  );
  stroke(g, "M-10 -60 Q-17 -57 -23 -59", light, 0.42, 0.65, cloth);

  // Face almost disappears under a deep, broad brim; the lower mask catches
  // the moon. The irregular crown avoids a generic triangle or wizard hat.
  shape(
    g,
    "M-6 -73 Q1 -77 7 -71 L8 -64 L5 -59 Q0 -58 -4 -64Z",
    INK,
    light,
    0.4,
    0.7,
  );
  shape(g, "M0 -66 L8 -67 L7 -63 L3 -60 L-1 -63Z", 0xa3a591, light, 0.25, 0.5);
  segment(g, 3, -69, 7, -69.5, light, 0.72, 0.65);
  shape(
    g,
    "M-12 -75 Q-9 -78 -7 -82 Q-1 -85 5 -80 L9 -73 Q17 -71 22 -68 Q8 -68 1 -70 Q-11 -68 -21 -72 Q-18 -74 -12 -75Z",
    0x2f312d,
    light,
    0.76,
    0.9,
  );
  shape(
    g,
    "M-9 -75 L-6 -79 Q-1 -82 4 -78 L7 -74 Q-2 -72 -9 -75Z",
    0x494b43,
    light,
    0.1,
    0.5,
  );
  stroke(
    g,
    "M-12 -74 Q-1 -71 10 -73 M-17 -72 Q-8 -70 -3 -71",
    light,
    0.57,
    0.65,
  );

  // Sleeves, wrapped wrist and a tapering blade with a single white edge.
  const hand: Point = parrying
    ? { x: 16, y: -62 }
    : striking
      ? { x: 22 + 16 * hit, y: -48 - 12 * hit }
      : { x: 16, y: -37 };
  shape(
    g,
    "M-16 -52 Q-21 -44 -18 -37 L-11 -32 L-9 -37 L-13 -41 L-11 -49Z",
    0x383a34,
    light,
    0.32,
    0.7,
  );
  shape(
    g,
    "M-11 -36 Q-6 -34 -8 -29 L-12 -29 L-14 -33Z",
    0x969180,
    light,
    0.27,
    0.55,
  );
  limb(g, { x: 6, y: -55 }, { x: 9, y: -43 }, hand, 8.5, light, true);
  g.fillStyle(0xaaa694).fillEllipse(hand.x, hand.y, 6, 5);
  segment(g, hand.x - 5, hand.y - 3, hand.x - 3, hand.y + 3, INK, 0.68, 1.2);
  const tip: Point = parrying
    ? { x: 30, y: -106 }
    : striking
      ? { x: 62 + 30 * hit, y: -69 + 76 * hit }
      : { x: 61, y: -54 };
  const dx = tip.x - hand.x,
    dy = tip.y - hand.y,
    len = Math.hypot(dx, dy),
    nx = -dy / len,
    ny = dx / len;
  g.fillStyle(0x8c9482).fillPoints(
    [
      { x: hand.x + nx * 1.4, y: hand.y + ny * 1.4 },
      tip,
      { x: hand.x - nx * 1.1, y: hand.y - ny * 1.1 },
    ],
    true,
  );
  segment(
    g,
    hand.x + nx * 1.4,
    hand.y + ny * 1.4,
    tip.x,
    tip.y,
    0xf5f0d9,
    0.94,
    0.88,
  );
  segment(
    g,
    hand.x - nx * 4,
    hand.y - ny * 4,
    hand.x + nx * 4,
    hand.y + ny * 4,
    COPPER,
    0.95,
    1.8,
  );
  segment(
    g,
    hand.x - (dx / len) * 7,
    hand.y - (dy / len) * 7,
    hand.x,
    hand.y,
    0xbeb8a0,
    0.83,
    2,
  );

  if (striking) {
    const t = Math.min(1, p.actionTime / 0.34),
      a = -1.3 + t * 2.7,
      alpha = Math.sin(t * Math.PI);
    g.lineStyle(1.9, IVORY, alpha * 0.77)
      .beginPath()
      .arc(12, -48, 76, a - 0.68, a + 0.18)
      .strokePath();
    g.lineStyle(0.65, SILVER, alpha * 0.35)
      .beginPath()
      .arc(12, -48, 83, a - 0.53, a + 0.17)
      .strokePath();
    segment(
      g,
      24,
      -43,
      24 + Math.cos(a) * 76,
      -43 + Math.sin(a) * 66,
      IVORY,
      alpha * 0.19,
      0.8,
    );
  }
  if (parrying) {
    const a = Math.max(0.12, 1 - p.actionTime / 0.32);
    g.lineStyle(0.9, 0xd4c392, a * 0.67)
      .beginPath()
      .arc(20, -65, 21 + a * 4, -1.3, 1.4)
      .strokePath();
    segment(g, 20, -88, 20, -43, IVORY, a * 0.9, 0.9);
    segment(g, 1, -65, 40, -65, IVORY, a * 0.75, 0.9);
    segment(g, 7, -78, 33, -52, IVORY, a * 0.4, 0.55);
  }
}

export function drawBoss(
  g: Graphics,
  b: BossVisual,
  time: number,
  reduced: boolean,
) {
  const facing = Math.cos(b.facing) >= 0 ? 1 : -1;
  const phase = b.phase === 2,
    striking = b.action === "attack",
    moving = b.action === "move";
  const breath = reduced ? 0 : Math.sin(time * (phase ? 2.5 : 1.5)) * 2;
  const step = moving ? Math.sin(time * 5.8) : 0;
  const swing = striking
    ? Math.sin(Math.min(1, b.actionTime / 0.3) * Math.PI)
    : 0;
  const windup = b.action === "parry" ? Math.min(1, b.actionTime / 0.65) : 0;
  const tatter = reduced ? 0 : Math.sin(time * 2.1) * 2.5;
  const light = b.action === "hurt" ? 0xf0ddbb : phase ? 0xd7c2a6 : IVORY;
  g.clear()
    .setPosition(b.x, b.y)
    .setScale(facing, b.action === "dead" ? 0.66 : 1)
    .setDepth(100 + b.y);
  g.setRotation(b.action === "hurt" ? -0.04 : 0).setAlpha(
    b.action === "dead" ? 0.57 : 1,
  );

  // The trailing arm recedes into charcoal. Its elbow is a broad knuckle,
  // while the narrow forearm twists into a low, almost ground-touching hand.
  const rearElbow = { x: -74 - step * 2, y: -94 + breath };
  const rearWrist = { x: -83 - step * 4, y: -39 + breath };
  limb(
    g,
    { x: -38, y: -158 + breath },
    { x: -75, y: -147 + breath },
    rearElbow,
    16,
    light,
    true,
  );
  limb(g, rearElbow, { x: -66, y: -67 }, rearWrist, 11, light, true);
  claw(g, rearWrist.x, rearWrist.y, -2, light, true);

  // Crooked load-bearing legs. The rear leg is darker; pale, split hooves
  // anchor the beast instead of ending in thin wire toes.
  const rearKnee = { x: -45 - step * 7, y: -44 - step * 2 };
  const rearAnkle = { x: -35 - step * 9, y: -10 };
  limb(g, { x: -24, y: -84 }, { x: -53, y: -68 }, rearKnee, 19, light, true);
  limb(g, rearKnee, { x: -30, y: -24 }, rearAnkle, 11, light, true);
  shape(
    g,
    "M-6 -9 Q1 -12 7 -7 L8 -2 L-11 2 L-24 1 Q-25 -3 -15 -5Z",
    0x5a5a4f,
    light,
    0.46,
    0.85,
    rearAnkle.x,
    0,
  );
  stroke(g, "M-15 -4 L-19 1 M-8 -5 L-10 1", INK, 0.8, 1, rearAnkle.x);
  const knee = { x: 39 + step * 7, y: -46 + step * 3 };
  const ankle = { x: 23 + step * 9, y: -10 };
  limb(g, { x: 23, y: -88 }, { x: 53, y: -69 }, knee, 21, light);
  limb(g, knee, { x: 43, y: -27 }, ankle, 13, light);
  shape(
    g,
    "M-6 -9 Q1 -13 8 -8 L12 -4 Q20 -3 24 1 L4 2 L-9 0Z",
    0x807d6c,
    light,
    0.65,
    0.95,
    ankle.x,
  );
  stroke(g, "M5 -6 L8 1 M13 -3 L15 1", INK, 0.8, 1, ankle.x);

  // Broad, time-worn vestments: several masses of fabric with eroded hems.
  shape(
    g,
    "M-15 -178 Q-43 -174 -57 -152 Q-65 -130 -52 -105 L-54 -72 Q-65 -48 -64 -23 L-54 -37 L-49 -24 L-43 -48 L-34 -37 L-32 -62 L-20 -48 L-20 -72 Q8 -55 29 -59 L32 -38 L39 -51 L49 -24 L47 -60 Q61 -82 56 -111 Q57 -143 34 -162 Q15 -179 -15 -178Z",
    0x1b1d1d,
    light,
    0.36,
    0.95,
    0,
    breath,
  );
  shape(
    g,
    "M-34 -165 Q-53 -154 -51 -131 Q-50 -115 -38 -99 L-43 -66 L-49 -43 Q-45 -65 -53 -80 L-46 -102 Q-58 -138 -34 -165Z",
    0x4e5049,
    light,
    0.13,
    0.6,
    0,
    breath,
  );
  shape(
    g,
    "M29 -159 Q49 -146 47 -121 L44 -90 L39 -64 L44 -40 L35 -57 L29 -95 Q38 -128 29 -159Z",
    0x42443d,
    light,
    0.1,
    0.6,
    0,
    breath,
  );
  shape(
    g,
    "M-27 -124 Q-36 -92 -33 -67 L-25 -50 L-24 -68 L-16 -47 L-16 -69 L-8 -63 L-9 -96Z",
    0x30332e,
    light,
    0.14,
    0.6,
    tatter,
    breath,
  );
  stroke(
    g,
    "M-44 -147 Q-48 -128 -39 -107 Q-40 -85 -46 -67 M-40 -143 Q-42 -126 -33 -113 M40 -134 Q43 -113 37 -91 L40 -69",
    light,
    0.26,
    0.65,
    0,
    breath,
  );
  for (let i = 0; i < 15; i++) {
    const x = -48 + i * 6.3,
      y = -78 + Math.sin(i * 1.8) * 10 + breath;
    segment(g, x, y, x - 2.5, y + 15 + (i % 3) * 4, light, 0.1, 0.55);
  }

  // The torso is an actual heavy bell: a rounded shoulder, flared skirt and
  // rolled lip. Asymmetric fractures expose the dark hollow beneath it.
  shape(
    g,
    "M-18 -155 Q-21 -168 0 -170 Q24 -170 29 -154 L32 -135 Q33 -109 46 -91 Q52 -86 51 -79 Q30 -66 -1 -72 Q-24 -74 -39 -82 Q-38 -90 -28 -98 Q-22 -119 -22 -140Z",
    0x5d5b4e,
    light,
    0.57,
    1.1,
    0,
    breath,
  );
  shape(
    g,
    "M-17 -150 Q-22 -122 -28 -100 L-35 -85 Q-28 -82 -20 -81 Q-13 -111 -11 -135 L-9 -156Z",
    0x999781,
    light,
    0.1,
    0.6,
    0,
    breath,
  );
  shape(
    g,
    "M14 -162 Q27 -158 28 -139 Q31 -110 41 -92 L44 -83 L28 -79 Q16 -100 18 -124Z",
    0x353831,
    light,
    0.14,
    0.6,
    0,
    breath,
  );
  shape(
    g,
    "M-39 -84 Q-17 -73 9 -74 Q36 -73 49 -82 L50 -76 Q22 -60 -17 -71 L-40 -78Z",
    0x85836c,
    light,
    0.55,
    0.8,
    0,
    breath,
  );
  stroke(
    g,
    "M-34 -78 Q6 -62 44 -76 M-20 -151 Q-1 -156 26 -150 M-19 -145 Q1 -150 28 -144",
    light,
    0.48,
    0.75,
    0,
    breath,
  );
  stroke(g, "M-16 -156 Q1 -160 24 -154", INK, 0.8, 2, 0, breath);
  shape(
    g,
    "M5 -161 L-1 -143 L8 -134 L2 -115 L13 -103 L5 -88 L11 -73 L18 -72 L13 -90 L22 -105 L11 -116 L17 -136 L7 -145 L12 -160Z",
    INK,
    light,
    0.12,
    0.6,
    0,
    breath,
  );
  stroke(
    g,
    "M4 -157 L1 -143 L10 -134 L5 -115 L15 -104 L9 -88 L14 -75",
    phase ? 0xcb8c59 : light,
    phase ? 0.9 : 0.45,
    phase ? 1.2 : 0.6,
    0,
    breath,
  );
  stroke(
    g,
    "M8 -134 L-3 -130 L-8 -120 M15 -104 L29 -101 L34 -92",
    phase ? 0xad704e : light,
    phase ? 0.75 : 0.28,
    0.6,
    0,
    breath,
  );
  for (let i = 0; i < 17; i++) {
    const x = -19 + i * 3.9,
      y = -137 + Math.sin(i * 0.5) * 3 + breath;
    if (i < 6 || i > 9)
      segment(
        g,
        x,
        y,
        x - 6 + i * 0.3,
        y + 31 + (i % 4) * 3,
        light,
        i < 6 ? 0.22 : 0.13,
        0.6,
      );
  }
  for (let i = 0; i < 10; i++)
    segment(
      g,
      -27 + i * 7.5,
      -88 + breath,
      -24 + i * 7.5,
      -84 + breath,
      INK,
      0.35,
      0.7,
    );

  // A few curved ribs bind the bell into the body without hiding its volume.
  for (let i = 0; i < 4; i++) {
    const y = -149 + i * 15 + breath;
    const left = contour("M-3 0 Q-22 0 -33 11 Q-33 16 -29 17").map((p) => ({
      x: p.x - i * 1.6,
      y: p.y + y,
    }));
    const right = contour("M11 1 Q29 3 40 15").map((p) => ({
      x: p.x + i * 1.3,
      y: p.y + y,
    }));
    g.lineStyle(4.4, INK, 0.86)
      .strokePoints(left, false)
      .strokePoints(right, false);
    g.lineStyle(2.1, light, 0.57)
      .strokePoints(left, false)
      .strokePoints(right, false);
  }
  stroke(g, "M-2 -72 Q0 -65 -2 -58", light, 0.69, 2, 0, breath);
  shape(
    g,
    "M-5 -58 Q-1 -62 3 -58 L5 -51 Q0 -46 -5 -50Z",
    0x8e8c71,
    light,
    0.5,
    0.7,
    0,
    breath,
  );

  // Forward arm: a torn sleeve sits over a bowed humerus, then a long, thin
  // forearm reaches out. Windup lifts the entire hand into a readable pose.
  const elbow = {
    x: 58 + swing * 16,
    y: -117 + breath + swing * 25 - windup * 45,
  };
  const wrist = {
    x: 80 + swing * 72,
    y: -51 + breath - swing * 12 - windup * 161,
  };
  limb(
    g,
    { x: 31, y: -161 + breath },
    { x: 60 + swing * 9, y: -146 + breath - windup * 15 },
    elbow,
    19,
    light,
  );
  shape(
    g,
    "M24 -169 Q38 -173 49 -157 L51 -143 L41 -145 L43 -134 Q27 -141 24 -157Z",
    0x424b3e,
    light,
    0.44,
    0.8,
    0,
    breath,
  );
  stroke(
    g,
    "M30 -162 Q33 -153 41 -150 M33 -165 Q36 -157 45 -153",
    light,
    0.25,
    0.55,
    0,
    breath,
  );
  limb(
    g,
    elbow,
    { x: 62 + swing * 35, y: -76 + breath - windup * 110 },
    wrist,
    13,
    light,
  );
  shape(
    g,
    "M-7 -5 Q-3 -10 4 -7 L8 -1 L4 6 Q-4 9 -8 2Z",
    0x7c7868,
    light,
    0.65,
    0.75,
    elbow.x,
    elbow.y,
  );
  stroke(g, "M-5 -2 L1 1 L5 -3", INK, 0.6, 0.7, elbow.x, elbow.y);
  claw(g, wrist.x, wrist.y, swing * 10, light);

  // A hunched neck and death-mask profile sit below a broken ceremonial crown.
  // Its bent plates and missing tines are deliberately unlike paired antlers.
  limb(
    g,
    { x: 0, y: -166 + breath },
    { x: 7, y: -188 + breath },
    { x: 24, y: -188 + breath },
    17,
    light,
    true,
  );
  const headY = breath - (phase ? 4 : 0);
  shape(
    g,
    "M8 -193 Q11 -210 27 -211 Q42 -210 47 -198 L52 -184 L48 -178 L40 -176 Q38 -166 27 -160 L18 -166 L17 -176 Q8 -178 8 -193Z",
    0x8d8879,
    light,
    0.7,
    1,
    0,
    headY,
  );
  shape(
    g,
    "M29 -207 Q42 -206 44 -196 L48 -185 L42 -181 L34 -183 L30 -174 L25 -170 L24 -185Z",
    0xb7b59b,
    light,
    0.16,
    0.55,
    0,
    headY,
  );
  shape(
    g,
    "M15 -198 Q21 -203 32 -201 L38 -194 Q31 -189 20 -190 L14 -193Z",
    INK,
    light,
    0.1,
    0.6,
    0,
    headY,
  );
  stroke(
    g,
    "M22 -195 Q27 -193 34 -195",
    phase ? 0xe5ad75 : 0xe2d7b0,
    0.97,
    phase ? 1.5 : 1,
    0,
    headY,
  );
  shape(
    g,
    "M38 -189 L40 -183 L36 -181 L33 -183Z",
    INK,
    light,
    0.12,
    0.5,
    0,
    headY,
  );
  stroke(
    g,
    "M13 -201 Q11 -191 17 -186 L18 -174 M22 -181 L20 -169 L27 -165 M28 -176 L29 -167 M32 -177 L33 -170 M37 -177 L37 -173",
    light,
    0.58,
    0.75,
    0,
    headY,
  );
  stroke(
    g,
    "M40 -199 L42 -194 M28 -207 L28 -204 M16 -187 L18 -184",
    INK,
    0.7,
    0.65,
    0,
    headY,
  );

  // Crown is a cracked, once-solid reliquary. One tall bent plate, one broken
  // ring and two short shards give it an unmistakably asymmetric silhouette.
  shape(
    g,
    "M8 -201 Q-3 -209 -6 -221 L-9 -240 L-5 -245 L1 -228 L5 -224 L7 -237 L11 -239 L13 -216 L19 -209Z",
    0x44463f,
    light,
    0.55,
    0.9,
    0,
    headY,
  );
  shape(
    g,
    "M20 -210 L20 -229 Q16 -239 19 -252 L24 -249 L25 -237 L32 -229 L33 -211Z",
    0x767762,
    light,
    0.65,
    0.9,
    0,
    headY,
  );
  shape(
    g,
    "M35 -209 Q48 -216 51 -229 L56 -236 L62 -236 L60 -230 L56 -227 Q52 -213 42 -207Z",
    0x616053,
    light,
    0.58,
    0.8,
    0,
    headY,
  );
  shape(
    g,
    "M43 -212 L44 -224 L48 -223 L48 -215Z",
    0x99957a,
    light,
    0.45,
    0.7,
    0,
    headY,
  );
  stroke(
    g,
    "M-5 -239 L0 -225 L7 -215 M22 -247 L22 -237 L28 -226 L27 -215 M39 -211 Q49 -216 53 -228",
    light,
    0.48,
    0.65,
    0,
    headY,
  );
  stroke(
    g,
    "M-2 -229 L2 -231 M21 -234 L25 -237 M24 -223 L28 -225 M48 -218 L51 -219",
    INK,
    0.7,
    0.65,
    0,
    headY,
  );
  shape(
    g,
    "M7 -210 Q24 -214 41 -210 L41 -204 Q25 -207 9 -203Z",
    0x6d6d55,
    light,
    0.47,
    0.75,
    0,
    headY,
  );
  stroke(g, "M11 -207 Q23 -210 36 -207", light, 0.53, 0.6, 0, headY);
  for (let i = 0; i < 5; i++)
    segment(
      g,
      11 + i * 6,
      -207 + headY,
      11 + i * 6,
      -204 + headY,
      INK,
      0.68,
      0.75,
    );

  if (phase) {
    stroke(
      g,
      "M-29 -121 Q-22 -114 -24 -105 M32 -91 L38 -81",
      COPPER,
      0.63,
      0.9,
      0,
      breath,
    );
    segment(g, 16, -178 + headY, 20, -174 + headY, 0xbc8967, 0.65, 0.7);
  }
  if (striking && swing > 0.18) {
    g.lineStyle(1.2, phase ? 0xe0b18a : IVORY, swing * 0.42)
      .beginPath()
      .arc(34, -77, 112, -0.93, 0.58)
      .strokePath();
    g.lineStyle(0.65, SILVER, swing * 0.19)
      .beginPath()
      .arc(32, -76, 120, -0.79, 0.62)
      .strokePath();
  }
}
